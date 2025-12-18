
// Palette matching TerrainSystem, but adapting Col 3 for MTTEST based on feedback
const PALETTE = [
    '#000000', '#0000AA', '#00AA00', '#808000', // 3 changed from Cyan to Olive
    '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
    '#555555', '#5555FF', '#55FF55', '#55FFFF',
    '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'
];

interface FeedbackItem {
    file: string;
    offsetSetting: number;
    colStart: number;
    colEnd: number;
    rawBytesSample: string;
    description: string;
}

class MtnViewer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private status: HTMLElement;
    private fileList: HTMLElement;

    // UI Elements
    private offsetInput: HTMLInputElement;
    private modeSelect: HTMLSelectElement;
    private termInput: HTMLInputElement;
    private btnReload: HTMLButtonElement;
    private inspectorInfo: HTMLElement;
    private byteDisplay: HTMLElement;

    // Zoom UI
    private btnZoomIn: HTMLButtonElement;
    private btnZoomOut: HTMLButtonElement;
    private zoomLabel: HTMLElement;

    // Feedback UI
    private selectionInfo: HTMLElement;
    private feedbackDesc: HTMLTextAreaElement;
    private btnAddFeedback: HTMLButtonElement;
    private btnMarkGood: HTMLButtonElement;
    private btnCopyFeedback: HTMLButtonElement;

    private width: number = 800;
    private height: number = 600;

    // Data State
    private currentFile: string = "";
    private rawData: Uint8Array | null = null;
    private colDataOffsets: number[] = [];
    private colPixelCounts: number[] = [];
    private baseImageData: ImageData | null = null;
    private renderedOffsetX: number = 0;

    // View State
    private zoom: number = 1.0;
    private feedbackLog: FeedbackItem[] = [];

    // Selection State
    private isSelecting: boolean = false;
    private selStartCol: number = -1;
    private selEndCol: number = -1;

    constructor() {
        this.canvas = document.getElementById('mtn-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
        this.status = document.getElementById('status')!;
        this.fileList = document.getElementById('file-list')!;

        this.offsetInput = document.getElementById('offset-input') as HTMLInputElement;
        this.modeSelect = document.getElementById('parse-mode-select') as HTMLSelectElement;
        this.termInput = document.getElementById('terminator-input') as HTMLInputElement;
        this.btnReload = document.getElementById('btn-reload') as HTMLButtonElement;
        this.inspectorInfo = document.getElementById('hover-info')!;
        this.byteDisplay = document.getElementById('byte-display')!;

        this.btnZoomIn = document.getElementById('btn-zoom-in') as HTMLButtonElement;
        this.btnZoomOut = document.getElementById('btn-zoom-out') as HTMLButtonElement;
        this.zoomLabel = document.getElementById('zoom-level')!;

        this.selectionInfo = document.getElementById('selection-info')!;
        this.feedbackDesc = document.getElementById('feedback-desc') as HTMLTextAreaElement;
        this.btnAddFeedback = document.getElementById('btn-add-feedback') as HTMLButtonElement;
        this.btnMarkGood = document.getElementById('btn-mark-good') as HTMLButtonElement;
        this.btnCopyFeedback = document.getElementById('btn-copy-feedback') as HTMLButtonElement;

        // Init Canvas
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.bindEvents();
    }

    private bindEvents() {
        // Reload
        this.btnReload.onclick = () => {
            if (this.currentFile && this.rawData) {
                const manualOffset = parseInt(this.offsetInput.value);
                const mode = this.modeSelect.value;
                let term = parseInt(this.termInput.value, 16);
                if (isNaN(term)) term = 0x00;

                this.drawMtn(this.currentFile, this.rawData, manualOffset, mode, term);
            }
        };

        // Zoom
        this.btnZoomIn.onclick = () => this.setZoom(this.zoom + 0.5);
        this.btnZoomOut.onclick = () => this.setZoom(this.zoom - 0.5);

        // Mouse Interactions
        this.canvas.onmousedown = (e) => this.handleMouseDown(e);
        this.canvas.onmousemove = (e) => this.handleMouseMove(e);
        this.canvas.onmouseup = () => this.handleMouseUp();
        this.canvas.onmouseleave = () => {
            this.handleMouseUp(); // End selection if left
        };

        // Feedback
        this.btnAddFeedback.onclick = () => this.addFeedback(false);
        this.btnMarkGood.onclick = () => this.addFeedback(true);
        this.btnCopyFeedback.onclick = () => {
            const report = JSON.stringify(this.feedbackLog, null, 2);
            navigator.clipboard.writeText(report).then(() => {
                const prevText = this.btnCopyFeedback.innerText;
                this.btnCopyFeedback.innerText = "Copied!";
                setTimeout(() => this.btnCopyFeedback.innerText = prevText, 2000);
            });
        };
    }

    private setZoom(z: number) {
        if (z < 0.5) z = 0.5;
        if (z > 5.0) z = 5.0;
        this.zoom = z;
        this.zoomLabel.innerText = `${Math.round(z * 100)}%`;

        this.canvas.style.width = `${this.width * z}px`;
        this.canvas.style.height = `${this.height * z}px`;
    }

    public async init() {
        try {
            const baseUrl = import.meta.env.BASE_URL;
            const manifestUrl = `${baseUrl}mountains/manifest.json`.replace('//', '/');

            const res = await fetch(manifestUrl);
            if (res.ok) {
                const json = await res.json();
                if (Array.isArray(json)) {
                    const maps = json.filter(s => typeof s === 'string' && s.toLowerCase().endsWith('.mtn'));
                    this.renderList(maps);
                    if (maps.length > 0) {
                        this.loadMtn(maps[0]);
                    }
                }
            } else {
                this.fileList.innerHTML = '<li style="padding:10px; color:red;">Failed to load manifest</li>';
            }
        } catch (e) {
            console.error(e);
            this.fileList.innerHTML = '<li style="padding:10px; color:red;">Error loading manifest</li>';
        }
    }

    private renderList(maps: string[]) {
        this.fileList.innerHTML = '';
        maps.forEach((map, idx) => {
            const li = document.createElement('li');
            li.className = 'file-item';
            li.innerText = map;
            li.onclick = () => {
                document.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected'));
                li.classList.add('selected');
                this.loadMtn(map);
            };
            if (idx === 0) li.classList.add('selected');
            this.fileList.appendChild(li);
        });
    }

    private async loadMtn(filename: string) {
        this.currentFile = filename;
        this.status.innerText = `Loading ${filename}...`;

        // Reset offset input to auto
        this.offsetInput.value = "";
        this.modeSelect.value = "term";
        this.termInput.value = "00";

        try {
            const baseUrl = import.meta.env.BASE_URL;
            const fileUrl = `${baseUrl}mountains/${filename}`.replace('//', '/');

            const res = await fetch(fileUrl);
            if (!res.ok) throw new Error("Fetch failed");

            const buffer = await res.arrayBuffer();
            this.rawData = new Uint8Array(buffer);

            // Draw (Auto Offset)
            this.drawMtn(filename, this.rawData, -1, "term", 0x00);

        } catch (e) {
            console.error(e);
            this.status.innerText = `Error: ${e}`;
        }
    }

    private drawMtn(name: string, data: Uint8Array, manualOffset: number, mode: string, terminator: number) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.colDataOffsets = [];
        this.colPixelCounts = [];

        if (data.length < 18) {
            this.status.innerText = "Invalid File (Too small)";
            return;
        }

        const fileWidth = data[6] | (data[7] << 8);
        const HEADER_SIZE = 18;
        const body = data.subarray(HEADER_SIZE);

        let pixelDataOffset = HEADER_SIZE + 56;
        let palette: string[] | null = null;

        if (manualOffset >= 0) {
            pixelDataOffset = manualOffset;
            this.offsetInput.value = manualOffset.toString();
        } else {
            // Auto-detect logic
            let markerIdx = -1;
            for (let i = 0; i < Math.min(body.length - 3, 200); i++) {
                if (body[i] === 0xFF && body[i + 1] === 0xFF && body[i + 2] === 0xFF) {
                    markerIdx = i;
                    break;
                }
            }
            if (markerIdx >= 0) {
                const afterMarkerIdx = markerIdx + 3;
                if (afterMarkerIdx + 4 <= body.length &&
                    body[afterMarkerIdx] === 0xFF &&
                    body[afterMarkerIdx + 1] === 0xFF &&
                    body[afterMarkerIdx + 2] === 0xBF &&
                    body[afterMarkerIdx + 3] === 0x00) {
                    pixelDataOffset = HEADER_SIZE + afterMarkerIdx + 4;
                } else {
                    if (afterMarkerIdx + 48 <= body.length) {
                        palette = [];
                        for (let i = 0; i < 16; i++) {
                            const r = body[afterMarkerIdx + i * 3];
                            const g = body[afterMarkerIdx + i * 3 + 1];
                            const b = body[afterMarkerIdx + i * 3 + 2];
                            palette.push(`rgb(${r}, ${g}, ${b})`);
                        }
                        pixelDataOffset = HEADER_SIZE + afterMarkerIdx + 48;
                    }
                }
            }
            this.offsetInput.value = pixelDataOffset.toString();
        }

        const activePalette = palette || PALETTE;
        const termHex = terminator.toString(16).toUpperCase().padStart(2, '0');
        this.status.innerText = `${name} | ${fileWidth}xH | Off:${pixelDataOffset} | Mode:${mode} | T:${termHex}`;

        const pixels = data.subarray(pixelDataOffset);
        const offsetX = Math.floor((this.width - fileWidth) / 2);
        this.renderedOffsetX = offsetX;

        let ptr = 0;
        let totalPixels = 0;

        // Effective Mode
        let useMode = mode;
        if (useMode === "term") {
            for (let x = 0; x < fileWidth; x++) {
                if (ptr >= pixels.length) break;

                this.colDataOffsets.push(pixelDataOffset + ptr);

                const colBytes: number[] = [];
                // Terminated by 'terminator'
                while (ptr < pixels.length && pixels[ptr] !== terminator) {
                    colBytes.push(pixels[ptr]);
                    ptr++;
                }
                if (ptr < pixels.length) ptr++;

                const colPixels: number[] = [];
                for (const b of colBytes) {
                    if (b >= 0x80) {
                        // Control code (e.g., column height) - skip it
                        continue;
                    } else if (b < 0x10) {
                        // Single pixel (0x00-0x0F)
                        colPixels.push(b);
                    } else {
                        // Two pixels packed in nibbles (0x10-0x7F)
                        colPixels.push((b >> 4) & 0x0F);
                        colPixels.push(b & 0x0F);
                    }
                }

                this.colPixelCounts.push(colPixels.length);
                this.drawColumn(x, colPixels, activePalette);
                totalPixels += colPixels.length;
            }
        } else if (useMode === "height1") {
            // 1-Byte Height
            for (let x = 0; x < fileWidth; x++) {
                if (ptr >= pixels.length) break;

                this.colDataOffsets.push(pixelDataOffset + ptr);

                const height = pixels[ptr++];
                const bytesNeeded = Math.ceil(height / 2);

                if (ptr + bytesNeeded > pixels.length) break;

                const colBytes = pixels.subarray(ptr, ptr + bytesNeeded);
                ptr += bytesNeeded;

                const colPixels: number[] = [];
                for (let i = 0; i < bytesNeeded; i++) {
                    const b = colBytes[i];
                    colPixels.push((b >> 4) & 0x0F);
                    if (colPixels.length < height) {
                        colPixels.push(b & 0x0F);
                    }
                }

                this.colPixelCounts.push(colPixels.length);
                this.drawColumn(x, colPixels, activePalette);
                totalPixels += colPixels.length;
            }
        } else if (useMode === "height2") {
            // 2-Byte Height
            for (let x = 0; x < fileWidth; x++) {
                if (ptr + 1 >= pixels.length) break;

                this.colDataOffsets.push(pixelDataOffset + ptr);

                const hLow = pixels[ptr++];
                const hHigh = pixels[ptr++];
                const height = hLow | (hHigh << 8);

                const bytesNeeded = Math.ceil(height / 2);
                if (ptr + bytesNeeded > pixels.length) break;

                const colBytes = pixels.subarray(ptr, ptr + bytesNeeded);
                ptr += bytesNeeded;

                const colPixels: number[] = [];
                for (let i = 0; i < bytesNeeded; i++) {
                    const b = colBytes[i];
                    colPixels.push((b >> 4) & 0x0F);
                    if (colPixels.length < height) {
                        colPixels.push(b & 0x0F);
                    }
                }

                this.colPixelCounts.push(colPixels.length);
                this.drawColumn(x, colPixels, activePalette);
                totalPixels += colPixels.length;
            }
        }

        this.baseImageData = this.ctx.getImageData(0, 0, this.width, this.height);
        this.status.innerText += ` | Pixels: ${totalPixels}`;
    }

    // ... Copy remaining methods from previous step ...

    private drawColumn(x: number, colPixels: number[], activePalette: string[]) {
        const startY = this.height - 1;
        const offsetX = this.renderedOffsetX;

        for (let i = 0; i < colPixels.length; i++) {
            const colorIdx = colPixels[i];
            if (colorIdx > 0 && colorIdx < activePalette.length) {
                const canvasX = offsetX + x;
                const canvasY = startY - i;
                if (canvasX >= 0 && canvasX < this.width && canvasY >= 0) {
                    this.ctx.fillStyle = activePalette[colorIdx];
                    this.ctx.fillRect(canvasX, canvasY, 1, 1);
                }
            }
        }
    }

    private getMouseCol(e: MouseEvent): number {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const colIdx = Math.floor(mouseX) - this.renderedOffsetX;
        return colIdx;
    }

    private handleMouseDown(e: MouseEvent) {
        this.isSelecting = true;
        const col = this.getMouseCol(e);
        this.selStartCol = col;
        this.selEndCol = col;
        this.updateSelectionUI();
    }

    private handleMouseUp() {
        if (this.isSelecting) {
            this.isSelecting = false;
        }
    }

    private handleMouseMove(e: MouseEvent) {
        if (!this.baseImageData || !this.rawData) return;

        const colIdx = this.getMouseCol(e);

        if (this.isSelecting) {
            this.selEndCol = colIdx;
        }

        this.ctx.putImageData(this.baseImageData, 0, 0);

        if (this.selStartCol >= 0 && this.selEndCol >= 0) {
            const start = Math.min(this.selStartCol, this.selEndCol);
            const end = Math.max(this.selStartCol, this.selEndCol);
            const x = this.renderedOffsetX + start;
            const w = (end - start) + 1;

            this.ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
            this.ctx.fillRect(x, 0, w, this.height);
        }

        if (colIdx >= 0 && colIdx < this.colDataOffsets.length) {
            const offset = this.colDataOffsets[colIdx];
            const height = this.colPixelCounts[colIdx];
            const renderX = this.renderedOffsetX + colIdx;

            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.4)';
            this.ctx.fillRect(renderX, 0, 1, this.height);

            this.inspectorInfo.innerHTML = `
                <span style="color:#fff;">Col:</span> ${colIdx} <br>
                <span style="color:#fff;">Pixels:</span> ${height} <br>
                <span style="color:#fff;">Offset:</span> ${offset}
            `;

            let ptr = offset;
            const bytes: string[] = [];
            let count = 0;
            // Use current user-selected mode and terminator for highlight logic is tricky because we don't know the exact break condition for arbitrary inspection.
            // But we know the offset and length from drawMtn pass!
            // So we can just display the RAW BYTES at that offset.
            // How many? 'height' / 2 approximately.
            // Just show first 20.
            while (ptr < this.rawData.length && count < 20) {
                const b = this.rawData[ptr];
                bytes.push(b.toString(16).padStart(2, '0').toUpperCase());
                ptr++;
                count++;
            }
            this.byteDisplay.innerText = bytes.join(' ');
        } else {
            this.inspectorInfo.innerText = "Hover over terrain...";
            this.byteDisplay.innerText = "";
        }

        this.updateSelectionUI();
    }

    private updateSelectionUI() {
        if (this.selStartCol >= 0) {
            const start = Math.min(this.selStartCol, this.selEndCol);
            const end = Math.max(this.selStartCol, this.selEndCol);
            this.selectionInfo.innerText = `Selection: Cols ${start} - ${end}`;
        } else {
            this.selectionInfo.innerText = "Select an area...";
        }
    }

    private addFeedback(isGood: boolean = false) {
        if (isGood) {
            this.feedbackLog.push({
                file: this.currentFile,
                offsetSetting: parseInt(this.offsetInput.value),
                colStart: 0,
                colEnd: 0,
                rawBytesSample: "FILE OK",
                description: "Marked as Good"
            });
            this.btnCopyFeedback.innerText = `Copy Report (${this.feedbackLog.length})`;
            return;
        }

        if (this.selStartCol < 0 || !this.rawData) {
            alert("Please select an area on the terrain first.");
            return;
        }

        const start = Math.min(this.selStartCol, this.selEndCol);
        const end = Math.max(this.selStartCol, this.selEndCol);

        let rawBytesSample = "";
        if (start >= 0 && start < this.colDataOffsets.length) {
            const off = this.colDataOffsets[start];
            const chunk = this.rawData.slice(off, off + 20);
            rawBytesSample = Array.from(chunk).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
        }

        const item: FeedbackItem = {
            file: this.currentFile,
            offsetSetting: parseInt(this.offsetInput.value),
            colStart: start,
            colEnd: end,
            rawBytesSample: rawBytesSample,
            description: this.feedbackDesc.value
        };

        this.feedbackLog.push(item);

        this.feedbackDesc.value = "";
        this.btnCopyFeedback.innerText = `Copy Report (${this.feedbackLog.length} items)`;
    }
}

const viewer = new MtnViewer();
viewer.init();
