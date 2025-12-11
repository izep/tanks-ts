import { InputManager, GameAction } from '../core/InputManager';

export class TouchControls {
    private inputManager: InputManager;
    private container: HTMLElement | null;

    constructor(inputManager: InputManager) {
        this.inputManager = inputManager;
        this.container = document.getElementById('touch-controls');

        if (this.container) {
            // Check for touch support or just leave hidden until needed?
            // For now, let's NOT force it open, to avoid blocking UI if that's the issue.
            // Functionality exists, verify via explicit touch simulation or enable if touch detected.
            this.attachListeners();
            if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                this.container.style.display = 'block';
            }
        }
    }

    private attachListeners() {
        this.bindButton('btn-up', GameAction.POWER_UP);
        this.bindButton('btn-down', GameAction.POWER_DOWN);
        this.bindButton('btn-left', GameAction.AIM_UP); // ArrowLeft maps to AIM_UP in InputManager default
        this.bindButton('btn-right', GameAction.AIM_DOWN); // ArrowRight maps to AIM_DOWN
        this.bindButton('btn-fire', GameAction.FIRE);
        this.bindButton('btn-shield', GameAction.TOGGLE_SHIELD);
        this.bindButton('btn-weapon', GameAction.NEXT_WEAPON);
    }

    private bindButton(id: string, action: GameAction) {
        const btn = document.getElementById(id);
        if (!btn) return;

        const start = (e: Event) => {
            e.preventDefault();
            this.inputManager.setInternalState(action, true);
            btn.style.opacity = '1.0';
            btn.style.transform = 'scale(0.95)';
        };

        const end = (e: Event) => {
            e.preventDefault();
            this.inputManager.setInternalState(action, false);
            btn.style.opacity = '0.7'; // Reset opacity
            btn.style.transform = 'scale(1.0)';
        };

        btn.addEventListener('mousedown', start);
        btn.addEventListener('touchstart', start, { passive: false });

        btn.addEventListener('mouseup', end);
        btn.addEventListener('mouseleave', end);
        btn.addEventListener('touchend', end);
        btn.addEventListener('touchcancel', end);
    }
}
