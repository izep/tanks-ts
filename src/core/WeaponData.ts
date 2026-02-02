export interface WeaponStats {
    name: string;
    cost: number;
    radius: number;
    damage: number; // Max damage
    color: string;
    description: string;
    // Special properties
    type?: 'missile' | 'mirv' | 'nuke' | 'dirt' | 'roller' | 'digger' | 'napalm' | 'item' | 'bouncer' | 'riot_charge' | 'sandhog' | 'dirt_destroyer' | 'liquid_dirt' | 'dirt_charge' | 'earth_disrupter' | 'plasma' | 'laser';
    effectValue?: number; // e.g., fuel amount, shield count
}

export const WEAPON_ORDER = [
    'baby_missile',
    'missile',
    'baby_nuke',
    'nuke',
    'mirv',
    'death_head',
    'funky_bomb',
    'leapfrog',
    // Earth Destroying
    'riot_charge',
    'riot_blast',
    'riot_bomb',
    'heavy_riot_bomb',
    'baby_digger',
    'digger',
    'heavy_digger',
    'baby_sandhog',
    'sandhog',
    'heavy_sandhog',
    // Earth Producing
    'dirt_clod',
    'dirt_ball',
    'ton_of_dirt',
    'liquid_dirt',
    'dirt_charge',
    'earth_disrupter',
    // Energy Weapons
    'plasma_blast',
    'laser',
    // Other
    'napalm',
    'hot_napalm',
    'segway', // Roller placeholder
    'heavy_roller',
    // Items
    'fuel_can',
    'shield',
    'parachute',
    'battery',
];

export const WEAPONS: Record<string, WeaponStats> = {
    'baby_missile': {
        name: 'Baby Missile',
        cost: 500,
        radius: 20,
        damage: 50,
        color: '#FFFFFF',
        description: 'Standard issue. Weak but infinite.'
    },
    'missile': {
        name: 'Missile',
        cost: 1875,
        radius: 40,
        damage: 100,
        color: '#FFCC00',
        description: 'Standard explosive.'
    },
    'nuke': {
        name: 'Nuke',
        cost: 5000,
        radius: 120,
        damage: 500,
        color: '#FF4400',
        description: 'Huge explosion. Dangerous.'
    },
    'mirv': {
        name: 'MIRV',
        cost: 7500,
        radius: 30,
        damage: 80,
        color: '#FF00FF',
        description: 'Splits into multiple warheads.',
        type: 'mirv'
    },
    'dirt_clod': {
        name: 'Dirt Clod',
        cost: 5000,
        radius: 20,
        damage: 0,
        color: '#A0522D',
        description: 'Explodes into a sphere of dirt.',
        type: 'dirt'
    },
    'dirt_ball': {
        name: 'Dirt Ball',
        cost: 5000,
        radius: 35,
        damage: 0,
        color: '#8B4513',
        description: 'A larger form of Dirt Clod.',
        type: 'dirt'
    },
    'ton_of_dirt': {
        name: 'Ton of Dirt',
        cost: 6750,
        radius: 70,
        damage: 0,
        color: '#5C4033',
        description: 'A very large Dirt Ball.',
        type: 'dirt'
    },
    'liquid_dirt': {
        name: 'Liquid Dirt',
        cost: 5000,
        radius: 0,
        damage: 0,
        color: '#E6D2B5',
        description: 'Oozes out where it lands, filling holes.',
        type: 'liquid_dirt'
    },
    'dirt_charge': {
        name: 'Dirt Charge',
        cost: 5000,
        radius: 0,
        damage: 0,
        color: '#9B7653',
        description: 'Expels a cloud of dirt in a wedge shape.',
        type: 'dirt_charge'
    },
    'earth_disrupter': {
        name: 'Earth Disrupter',
        cost: 5000,
        radius: 0,
        damage: 0,
        color: '#000000',
        description: 'Forces all suspended dirt to settle.',
        type: 'earth_disrupter'
    },
    'plasma_blast': {
        name: 'Plasma Blast',
        cost: 9000,
        radius: 75,
        damage: 200,
        color: '#00FFFF',
        description: 'Expels radioactive energy from your tank.',
        type: 'plasma'
    },
    'laser': {
        name: 'Laser',
        cost: 5000,
        radius: 0,
        damage: 150,
        color: '#FF0000',
        description: 'Shoots a high-intensity beam of light.',
        type: 'laser'
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
        cost: 10000,
        radius: 80,
        damage: 200,
        color: '#FF6600',
        description: 'Smaller nuke.',
    },
    'death_head': {
        name: 'Death Head',
        cost: 20000,
        radius: 150, // Massive
        damage: 1000,
        color: '#440000',
        description: 'The ultimate weapon.',
        type: 'mirv' // Technically behaves like huge MIRV in some versions, but standard is just massive explosion
    },
    'digger': {
        name: 'Digger',
        cost: 2500,
        radius: 0,
        damage: 0,
        color: '#888888',
        description: 'Digs a tunnel through terrain.',
        type: 'digger'
    },
    'napalm': {
        name: 'Napalm',
        cost: 10000,
        radius: 60,
        damage: 40, // Low direct damage, burns terrain
        color: '#FF2200',
        description: 'Burns terrain and tanks.',
        type: 'napalm'
    },
    'hot_napalm': {
        name: 'Hot Napalm',
        cost: 20000,
        radius: 90,
        damage: 80,
        color: '#FF8800',
        description: 'More intense burn.',
        type: 'napalm'
    },
    'riot_charge': {
        name: 'Riot Charge',
        cost: 2000,
        radius: 36,
        damage: 0,
        color: '#D3D3D3',
        description: 'Destroys a wedge-shaped section of dirt from your turret.',
        type: 'riot_charge'
    },
    'riot_blast': {
        name: 'Riot Blast',
        cost: 5000,
        radius: 60,
        damage: 0,
        color: '#A9A9A9',
        description: 'A larger version of the Riot Charge.',
        type: 'riot_charge'
    },
    'heavy_riot_bomb': {
        name: 'Heavy Riot Bomb',
        cost: 4750,
        radius: 45,
        damage: 0,
        color: '#E0E0E0',
        description: 'A scaled up version of Riot Bomb.',
        type: 'dirt_destroyer'
    },
    'baby_digger': {
        name: 'Baby Digger',
        cost: 3000,
        radius: 0,
        damage: 0,
        color: '#C0C0C0',
        description: 'Tunnels through terrain when it hits.',
        type: 'digger'
    },
    'heavy_digger': {
        name: 'Heavy Digger',
        cost: 6750,
        radius: 0,
        damage: 0,
        color: '#696969',
        description: 'The largest Digger-weapon available.',
        type: 'digger'
    },
    'baby_sandhog': {
        name: 'Baby Sandhog',
        cost: 10000,
        radius: 0,
        damage: 50,
        color: '#DAA520',
        description: 'Tunnels and contains a small explosive charge.',
        type: 'sandhog'
    },
    'sandhog': {
        name: 'Sandhog',
        cost: 16750,
        radius: 0,
        damage: 80,
        color: '#B8860B',
        description: 'Contains more warheads than the Baby Sandhog.',
        type: 'sandhog'
    },
    'heavy_sandhog': {
        name: 'Heavy Sandhog',
        cost: 25000,
        radius: 0,
        damage: 150,
        color: '#808000',
        description: 'Can potentially destroy the world.',
        type: 'sandhog'
    },
    'riot_bomb': {
        name: 'Riot Bomb',
        cost: 5000,
        radius: 30,
        damage: 0, // No damage
        color: '#FFFFFF',
        description: 'Destroys a spherical section of dirt.',
        type: 'dirt_destroyer'
    },
    'heavy_roller': {
        name: 'Heavy Roller',
        cost: 6750,
        radius: 50,
        damage: 200,
        color: '#008888',
        description: 'A bigger, heavier roller.',
        type: 'roller'
    },
    'leapfrog': {
        name: 'LeapFrog',
        cost: 10000,
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
    }
};
