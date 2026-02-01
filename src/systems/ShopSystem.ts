import { type GameState } from '../core/GameState';
import { SoundManager } from '../core/SoundManager';
import { WEAPONS } from '../core/WeaponData';

export class ShopSystem {
    private soundManager: SoundManager;

    constructor(soundManager: SoundManager) {
        this.soundManager = soundManager;
    }

    public initShopTurn(state: GameState): boolean {
        // Find first human player
        const firstHumanIndex = state.tanks.findIndex(t => !t.isAi);
        if (firstHumanIndex !== -1) {
            state.currentPlayerIndex = firstHumanIndex;
            return true;
        }
        return false; // No humans
    }

    public tryNextShopTurn(state: GameState): boolean {
        // Find next human player after current index
        const nextHumanIndex = state.tanks.findIndex((t, i) => i > state.currentPlayerIndex && !t.isAi);
        if (nextHumanIndex !== -1) {
            state.currentPlayerIndex = nextHumanIndex;
            return true;
        }
        return false;
    }

    public handleBuyWeapon(state: GameState, weaponId: string) {
        const tank = state.tanks[state.currentPlayerIndex];
        const weapon = WEAPONS[weaponId];

        if (tank.credits >= weapon.cost) {
            // Check for Items
            if (weapon.type === 'item') {
                tank.credits -= weapon.cost;
                this.soundManager.playUI(); // Success sound

                if (weaponId === 'fuel_can') {
                    tank.fuel += weapon.effectValue || 250;
                    console.log(`Bought Fuel. Current: ${tank.fuel}`);
                } else if (weaponId === 'shield') {
                    tank.accessories['shield'] = (tank.accessories['shield'] || 0) + (weapon.effectValue || 1);
                    console.log(`Bought Shield. Count: ${tank.accessories['shield']}`);
                } else if (weaponId === 'parachute') {
                    tank.accessories['parachute'] = (tank.accessories['parachute'] || 0) + (weapon.effectValue || 1);
                    console.log(`Bought Parachute. Count: ${tank.accessories['parachute']}`);
                } else if (weaponId === 'battery') {
                    tank.accessories['battery'] = (tank.accessories['battery'] || 0) + 1;
                    console.log(`Bought Battery. Count: ${tank.accessories['battery']}`);
                }
                return;
            }

            // Infinite check for weapons
            if (tank.inventory[weaponId] === -1) {
                this.soundManager.playUI(); // Already have it
                return;
            }

            tank.credits -= weapon.cost;
            tank.inventory[weaponId] = (tank.inventory[weaponId] || 0) + 1;
            this.soundManager.playUI(); // Success sound
        } else {
            // Fail sound
        }
    }

    public handleSetWeapon(state: GameState, id: string) {
        const tank = state.tanks[state.currentPlayerIndex];
        if (!tank) return;
        // Verify
        if (tank.inventory[id] !== undefined && tank.inventory[id] !== 0) {
            tank.currentWeapon = id;
            this.soundManager.playUI();
        }
    }

    public handleSetShield(state: GameState, id: string) {
        const tank = state.tanks[state.currentPlayerIndex];
        if (!tank) return;
        // Verify
        if ((tank.accessories[id] || 0) > 0) {
            if (!tank.activeShield) {
                tank.activeShield = id;
                tank.shieldHealth = id === 'super_shield' ? 400 : 200;
            } else if (tank.activeShield !== id) {
                // Switch shield type?
                tank.activeShield = id;
                // Don't reset HP fully maybe? Or yes?
                tank.shieldHealth = id === 'super_shield' ? 400 : 200;
            }
            this.soundManager.playUI();
        }
    }
}
