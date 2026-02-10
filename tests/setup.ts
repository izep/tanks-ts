// Global mock for ImageData
if (typeof ImageData === 'undefined') {
    (global as any).ImageData = class {
        data: Uint8ClampedArray;
        width: number;
        height: number;
        constructor(widthOrData: number | Uint8ClampedArray, width: number, height?: number) {
            if (typeof widthOrData === 'number') {
                this.width = widthOrData;
                this.height = width;
                this.data = new Uint8ClampedArray(this.width * this.height * 4);
            } else {
                this.data = widthOrData;
                this.width = width;
                this.height = height!;
            }
        }
    };
}
