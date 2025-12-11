export interface WeaponStats {
    name: string;
    cost: number;
    radius: number;
    damage: number; // Max damage
    color: string;
    description: string;
    // Special properties
    type?: 'missile' | 'mirv' | 'nuke' | 'dirt' | 'roller' | 'digger' | 'napalm' | 'item' | 'bouncer';
    effectValue?: number; // e.g., fuel amount, shield count
}

export const WEAPON_ORDER = [
    'baby_missile',
    'missile',
    'baby_nuke',
    'nuke',
    'mirv',
    'death_head',
    'dirt_bomb',
    'digger', // or Tunnel
    'napalm',
    'hot_napalm',
    'funky_bomb',
    'riot_bomb',
    'segway', // Roller placeholder
    'heavy_roller',
    'leapfrog', // New
    'fuel_can', // Item
    'shield',   // Item
    'parachute', // Item
    'battery',  // Item
    'tracer'    // New visual
];

export const WEAPONS: Record<string, WeaponStats> = {
    'baby_missile': {
        name: 'Baby Missile',
        cost: 0, // Infinite
        radius: 20,
        damage: 50,
        color: '#FFFFFF',
        description: 'Standard issue. Weak but infinite.'
    },
    'missile': {
        name: 'Missile',
        cost: 2000,
        radius: 40,
        damage: 100,
        color: '#FFCC00',
        description: 'Standard explosive.'
    },
    'nuke': {
        name: 'Nuke',
        cost: 20000,
        radius: 120,
        damage: 500,
        color: '#FF4400',
        description: 'Huge explosion. Dangerous.'
    },
    'mirv': {
        name: 'MIRV',
        cost: 10000,
        radius: 30,
        damage: 80,
        color: '#FF00FF',
        description: 'Splits into multiple warheads.',
        type: 'mirv'
    },
    'dirt_bomb': {
        name: 'Dirt Bomb',
        cost: 5000,
        radius: 50,
        damage: 10,
        color: '#8B4513',
        description: 'Creates terrain instead of destroying it.',
        type: 'dirt'
    },
    'funky_bomb': {
        name: 'Funky Bomb',
        cost: 15000,
        radius: 40,
        damage: 150,
        color: '#00FF00',
        description: 'Moves erratically.'
    },
    'segway': {
        name: 'Roller',
        cost: 5000,
        radius: 30,
        damage: 100,
        color: '#00FFFF',
        description: 'Rolls along the ground.',
        type: 'roller'
    },
    'baby_nuke': {
        name: 'Baby Nuke',
        cost: 5000,
        radius: 80,
        damage: 200,
        color: '#FF6600',
        description: 'Smaller nuke.',
    },
    'death_head': {
        name: 'Death Head',
        cost: 25000,
        radius: 150, // Massive
        damage: 1000,
        color: '#440000',
        description: 'The ultimate weapon.',
        type: 'mirv' // Technically behaves like huge MIRV in some versions, but standard is just massive explosion
    },
    'digger': {
        name: 'Digger',
        cost: 1000,
        radius: 5, // Small explosion
        damage: 20,
        color: '#888888',
        description: 'Digs a tunnel through terrain.',
        type: 'digger'
    },
    'napalm': {
        name: 'Napalm',
        cost: 5000,
        radius: 60,
        damage: 40, // Low direct damage, burns terrain
        color: '#FF2200',
        description: 'Burns terrain and tanks.',
        type: 'napalm'
    },
    'hot_napalm': {
        name: 'Hot Napalm',
        cost: 10000,
        radius: 90,
        damage: 80,
        color: '#FF8800',
        description: 'More intense burn.',
        type: 'napalm'
    },
    'riot_bomb': {
        name: 'Riot Bomb',
        cost: 5000,
        radius: 60,
        damage: 0, // No damage
        color: '#FFFFFF',
        description: 'Creates dirt spheres (Inverse explosion).',
        type: 'dirt'
    },
    'heavy_roller': {
        name: 'Heavy Roller',
        cost: 10000,
        radius: 50,
        damage: 200,
        color: '#008888',
        description: 'A bigger, heavier roller.',
        type: 'roller'
    },
    'leapfrog': {
        name: 'LeapFrog',
        cost: 15000,
        radius: 30,
        damage: 80,
        color: '#00AA00',
        description: 'Bounces 3 times before exploding.',
        type: 'bouncer'
    },
    'fuel_can': {
        name: 'Fuel (250)',
        cost: 2000,
        radius: 0,
        damage: 0,
        color: '#884400',
        description: 'Restores fuel.',
        type: 'item',
        effectValue: 250
    },
    'shield': {
        name: 'Shield',
        cost: 5000,
        radius: 0,
        damage: 0,
        color: '#00FFFF',
        description: 'Protects from damage.',
        type: 'item',
        effectValue: 1
    },
    'parachute': {
        name: 'Parachute',
        cost: 1000,
        radius: 0,
        damage: 0,
        color: '#FFFFFF',
        description: 'Saves you from falls.',
        type: 'item',
        effectValue: 1
    },
    'battery': {
        name: 'Battery',
        cost: 1500,
        radius: 0,
        damage: 0,
        color: '#FFFF00',
        description: 'Restores 10 health points.',
        type: 'item',
        effectValue: 10
    },
    'tracer': {
        name: 'Tracer (5)',
        cost: 500,
        radius: 10,
        damage: 20,
        color: '#FF0000',
        description: 'Cheap, leaves a clear trail.',
        type: 'missile' // Normal physics
    }
};
