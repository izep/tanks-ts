import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UIManager } from '../src/ui/UIManager';
import { GameState } from '../src/core/GameState';
import { WEAPONS } from '../src/core/WeaponData';

// Mock the DOM
const mockElements: Record<string, any> = {};

function createMockElement(id: string) {
    const el = {
        id,
        _innerText: '',
        set innerText(val: string) {
            this._innerText = val;
            // Record call
            if (!this.innerTextSetCount) this.innerTextSetCount = 0;
            this.innerTextSetCount++;
        },
        get innerText() {
            return this._innerText;
        },
        innerTextSetCount: 0,
        style: { display: '', opacity: '', filter: '', cursor: '' },
        innerHTML: '',
        classList: { add: () => { }, remove: () => { } },
        appendChild: () => { },
        addEventListener: () => { },
        querySelector: () => ({ addEventListener: () => { }, style: {}, value: '' }),
        querySelectorAll: () => [],
        parentElement: { style: { display: '' } }
    };
    mockElements[id] = el;
    return el;
}

// Global mocks
global.document = {
    createElement: (tag: string) => {
        if (tag === 'div') return {
            id: '',
            style: {},
            classList: { add: () => { }, remove: () => { } },
            appendChild: () => { },
            innerHTML: '',
            querySelector: () => ({ addEventListener: () => { }, style: {}, value: '' }),
            querySelectorAll: () => [],
            addEventListener: () => { },
        };
        return { style: {} };
    },
    getElementById: (id: string) => {
        if (!mockElements[id]) {
            createMockElement(id);
        }
        return mockElements[id];
    },
    addEventListener: () => { },
    removeEventListener: () => { },
    body: { appendChild: () => { }, removeChild: () => { } }
} as any;

global.window = {
    addEventListener: () => { },
    dispatchEvent: () => { },
    innerHeight: 600,
    innerWidth: 800
} as any;

describe('UIManager Performance', () => {
    let ui: UIManager;
    let state: GameState;

    beforeEach(() => {
        // Reset mocks
        Object.keys(mockElements).forEach(key => delete mockElements[key]);

        // Setup initial state
        state = {
            tanks: [{
                id: 'p1',
                name: 'Player 1',
                x: 100,
                y: 100,
                angle: 45,
                power: 50,
                health: 100,
                color: 'red',
                inventory: {},
                accessories: { shield: 0 },
                credits: 1000,
                isDead: false,
                isAi: false,
                variant: 0
            }],
            currentPlayerIndex: 0,
            phase: 'AIMING',
            wind: 0,
            projectiles: [],
            explosions: [],
            terrain: { width: 800, height: 600, data: new Uint8Array(0) },
            round: 1,
            particles: [],
            mines: [],
            liquidDirt: [],
            activeWeapon: 'missile'
        } as unknown as GameState;

        ui = new UIManager();
    });

    it('should update DOM elements only once when state is stable', () => {
        // First update
        ui.update(state);

        const nameEl = document.getElementById('p-name');
        const angleEl = document.getElementById('p-angle');

        expect(nameEl.innerTextSetCount).toBe(1);
        expect(angleEl.innerTextSetCount).toBe(1);

        // Subsequent updates with same state
        for (let i = 0; i < 9; i++) {
            ui.update(state);
        }

        // Should still be 1
        expect(nameEl.innerTextSetCount).toBe(1);
        expect(angleEl.innerTextSetCount).toBe(1);
        expect(document.getElementById('p-power').innerTextSetCount).toBe(1);
        expect(document.getElementById('p-health').innerTextSetCount).toBe(1);
        expect(document.getElementById('p-credits').innerTextSetCount).toBe(1);

        // Wind uses arrow logic, verify it too
        expect(document.getElementById('p-wind').innerTextSetCount).toBe(1);
    });

    it('should update DOM elements when state changes', () => {
        ui.update(state);

        // Change state
        state.tanks[0].angle = 60;
        state.tanks[0].power = 75;
        state.wind = 2.5;

        ui.update(state);

        expect(document.getElementById('p-angle').innerTextSetCount).toBe(2);
        expect(document.getElementById('p-power').innerTextSetCount).toBe(2);
        expect(document.getElementById('p-wind').innerTextSetCount).toBe(2);

        // Name didn't change, should stay 1
        expect(document.getElementById('p-name').innerTextSetCount).toBe(1);
    });

    it('should update DOM elements when wind direction changes but magnitude is small', () => {
        state.wind = 0.04;
        ui.update(state);
        const windEl = document.getElementById('p-wind');
        expect(windEl.innerTextSetCount).toBe(1);

        // Change direction but magnitude (0.0) stays same
        state.wind = -0.04;
        ui.update(state);

        // Should update because direction arrow changed
        expect(windEl.innerTextSetCount).toBe(2);
    });

    it('should reset cache on phase change', () => {
        ui.update(state);
        expect(document.getElementById('p-name').innerTextSetCount).toBe(1);

        // Change phase
        state.phase = 'SHOP';
        ui.update(state);

        // Change back to AIMING (should trigger cache clear and re-render)
        state.phase = 'AIMING';
        ui.update(state);

        // Because cache was cleared, it should update again even if values are same as before
        // Note: My implementation clears cache ON phase change detection.
        // 1. AIMING (init) -> renders. cache={'p-name': 'Player 1'}
        // 2. SHOP -> clears cache = {}. Shop UI logic runs (which is different).
        // 3. AIMING -> clears cache = {}. Tank logic runs. 'p-name' not in cache. Renders.

        // Wait, strictly speaking, SHOP phase might not even run the tank HUD logic.
        // Let's check the code:
        // if (state.phase === 'SHOP') { updateShopUI } else { ... tank hud logic ... } is NOT how it works.
        // The code does:
        // handlePhaseChange(state) -> toggles visibility
        // Then checks `if (tank) { ... updates HUD ... }` UNCONDITIONALLY of phase?
        // Ah, `update` method:
        //   handlePhaseChange()
        //   const tank = ...
        //   if (tank) { ... HUD updates ... }
        // So HUD updates happen even in SHOP phase unless `tank` is null. `tank` is not null in SHOP.
        // BUT, the HUD container might be hidden. The DOM updates still happen.
        // My optimization prevents DOM updates if values are same.

        // If I clear cache on phase change:
        // 1. Start AIMING. Cache filled.
        // 2. Switch to SHOP. lastPhase changed. Cache cleared. Tank HUD logic runs. Cache re-filled.
        // 3. Switch to AIMING. lastPhase changed. Cache cleared. Tank HUD logic runs. Cache re-filled.

        // So yes, changing phase should cause a re-render of HUD elements.
        // This confirms that if I change phase and change back, I get +1 update.
        // Actually +2 because the intermediate SHOP phase also triggered an update (since cache was cleared).

        // Let's trace:
        // 1. update(AIMING) -> count = 1. lastPhase=AIMING. Cache={name: P1}
        // 2. update(SHOP) -> lastPhase!=SHOP. Cache cleared. Tank HUD logic runs. count = 2. Cache={name: P1}
        // 3. update(AIMING) -> lastPhase!=AIMING. Cache cleared. Tank HUD logic runs. count = 3. Cache={name: P1}

        expect(document.getElementById('p-name').innerTextSetCount).toBeGreaterThanOrEqual(3);
    });
});
