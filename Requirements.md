# Tanks-a-lot: A Scorched Earth Modern Clone: Full Technical Specification

---

## Introduction

This document provides a comprehensive technical specification for developing a modern clone of Scorched Earth. The goal is to faithfully recreate the original’s mechanics, weapon systems, and configuration options, while adapting the experience for contemporary platforms (Windows, macOS, Linux, and mobile). The specification covers core gameplay, weapon and accessory systems, AI behaviors, multiplayer support, user interface, visual and audio design, platform adaptation. It is intended as a blueprint for developers to rebuild the game from scratch, ensuring both authenticity and modern usability.

When anything is unspecified or unclear here, refer to the original Scorched Earth (version 1.5) behavior as the default implementation. See screenshots/scorch.txt for details.

---

## 1. Core Game Mechanics

### 1.1 Turn-Based Artillery Gameplay

- **Sequential Turns:** Players (human or AI) take turns controlling tanks placed on a 2D destructible landscape. Each turn consists of aiming, selecting a weapon, adjusting firing parameters, and firing.
- **Objective:** Eliminate all opposing tanks to be the last one standing. Rounds are played in succession, with money earned and spent between rounds.
- **Team Play:** Optionally, players can form teams, sharing victory conditions and sometimes resources.

**Analysis:**  
The turn-based structure is central to Scorched Earth’s strategic depth. Each player’s move can dramatically alter the landscape and tactical situation, especially with powerful or terrain-altering weapons. The sequential nature encourages careful planning and anticipation of opponents’ actions.

### 1.2 Terrain Generation and Destruction

- **Procedural Terrain:** The landscape is generated at the start of each round using a 1D heightmap, typically via a midpoint displacement algorithm or by summing sine waves for natural-looking hills and valleys.
- **Bitmap Representation:** Terrain is stored as a bitmap or pixel grid, where each pixel represents solid ground or empty space.
- **Destruction:** Explosions and certain weapons modify the terrain bitmap, removing (or sometimes adding) pixels in circular or custom patterns. Gravity causes unsupported terrain pixels to fall straight down, simulating landslides and collapses.
- **Terrain Types:** Configurable options for terrain roughness, height, and type (e.g., mountains, valleys, flat).

**Analysis:**  
Destructible terrain is a hallmark of the genre, enabling emergent strategies such as burying opponents, creating cover, or exposing tanks. The bitmap approach is efficient and allows for real-time updates and complex interactions between explosions and the landscape.

### 1.3 Wind, Gravity, and Environmental Effects

- **Gravity:** Affects all projectiles, pulling them downward. Gravity strength is adjustable in game options.
- **Wind:** Affects projectile trajectories horizontally. Wind speed and direction can be constant, randomized each round, or change dynamically during a round.
- **Other Effects:** Optional environmental hazards (e.g., meteor showers, lightning) can be enabled for additional challenge.

**Analysis:**  
Wind and gravity introduce variability and skill to aiming. Players must account for these forces when calculating shots, and advanced AI uses these parameters for precise targeting. Environmental hazards add unpredictability and replay value.

### 1.4 Tank Movement and Fuel Mechanics

- **Movement:** Tanks can move left or right across the terrain, consuming fuel for each pixel moved. Movement is limited by terrain steepness; tanks cannot climb slopes beyond a certain angle.
- **Fuel:** Purchased as an accessory. When depleted, tanks become immobile for the rest of the round.
- **Fixed Emplacements:** Selecting a non-wheeled/treaded tank icon creates a fixed emplacement that cannot buy or use fuel and remains immobile during rounds (except for falling when terrain collapses).
- **Slipping:** Tanks may slide down steep slopes or fall if the supporting terrain is destroyed, potentially taking damage or dying if they fall from great heights.

**Analysis:**  
Movement is a tactical resource, allowing repositioning for better shots or to escape danger. However, movement is risky due to fuel limits and the possibility of falling or becoming exposed.

### 1.5 Projectile Physics

- **Ballistic Trajectories:** Projectiles follow parabolic arcs determined by initial velocity (power), angle, gravity, and wind.
- **Wind Implementation:** Wind is typically modeled as a constant horizontal acceleration or as a per-frame velocity added to the projectile.
- **Collision Detection:** Projectiles check for intersection with terrain pixels or tanks at each simulation step.
- **Special Projectiles:** Some weapons (e.g., MIRVs, Funky Bombs) split into multiple sub-munitions or have non-standard trajectories.
- **Max Power Cap:** Maximum firing power is capped (1000 at full tank strength). Battery mechanics can restore power up to this cap.

**Analysis:**  
Accurate projectile physics are essential for gameplay. The system must balance realism with playability, ensuring shots are predictable but challenging. Special weapons require custom logic for splitting, bouncing, or guided movement.

---

## 2. Weapon Systems

### 2.1 Weapon List, Effects, and Costs

The original Scorched Earth features a diverse arsenal, each with unique effects, blast radii, and strategic uses. Below is a summary table of core weapons, their costs, and properties (based on version 1.5):

| Name            | Cost    | Bundle Size | Blast Radius | Effect Type        | Strategic Use                      |
| --------------- | ------- | ----------- | ------------ | ------------------ | ---------------------------------- |
| Baby Missile    | $400    | 10          | 10           | Standard           | Basic attack, low cost             |
| Missile         | $1,875  | 5           | 20           | Standard           | Stronger basic attack              |
| Baby Nuke       | $10,000 | 3           | 40           | Nuclear            | Large area, high damage            |
| Nuke            | $12,000 | 1           | 75           | Nuclear            | Massive area, expensive            |
| Leap Frog       | $10,000 | 2           | 20-30        | Bouncing           | Bounces, hard to predict           |
| Funky Bomb      | $7,000  | 2           | 80           | Random explosions  | Unpredictable, wide coverage       |
| MIRV            | $10,000 | 3           | 20           | Multi-warhead      | Splits into sub-munitions          |
| Death's Head    | $20,000 | 1           | 35           | Multi-warhead      | Devastating, late-game             |
| Napalm          | $10,000 | 10          | N/A          | Spreading fire     | Flows downhill, area denial        |
| Hot Napalm      | $20,000 | 2           | N/A          | Stronger fire      | More damage, larger spread         |
| Tracer          | $10     | 20          | 0            | Utility            | Shows trajectory, no damage        |
| Smoke Tracer    | $500    | 10          | 0            | Utility            | Trajectory, obscures vision        |
| Baby Roller     | $5,000  | 10          | 10           | Rolling            | Rolls downhill, detonates on slope |
| Roller          | $6,000  | 5           | 20           | Rolling            | As above, larger blast             |
| Heavy Roller    | $6,750  | 2           | 45           | Rolling            | As above, largest blast            |
| Riot Charge     | $2,000  | 10          | 36           | Dirt removal       | Clears dirt, unburies tanks        |
| Riot Blast      | $5,000  | 5           | 60           | Dirt removal       | Larger area, more effective        |
| Riot Bomb       | $5,000  | 5           | 30           | Dirt removal       | Similar to Riot Charge             |
| Heavy Riot Bomb | $4,750  | 2           | 45           | Dirt removal       | Largest dirt clearing              |
| Baby Digger     | $3,000  | 10          | N/A          | Tunneling          | Digs through terrain               |
| Digger          | $2,500  | 5           | N/A          | Tunneling          | As above, larger tunnel            |
| Heavy Digger    | $6,750  | 2           | N/A          | Tunneling          | Largest tunnel                     |
| Baby Sandhog    | $10,000 | 10          | N/A          | Tunneling          | Digs horizontally                  |
| Sandhog         | $16,750 | 5           | N/A          | Tunneling          | As above, larger                   |
| Heavy Sandhog   | $25,000 | 2           | N/A          | Tunneling          | Largest sandhog                    |
| Dirt Clod       | $5,000  | 10          | 20           | Dirt creation      | Covers tanks, creates obstacles    |
| Dirt Ball       | $5,000  | 5           | 35           | Dirt creation      | As above, larger                   |
| Ton of Dirt     | $6,750  | 2           | 70           | Dirt creation      | Largest dirt bomb                  |
| Liquid Dirt     | $5,000  | 10          | N/A          | Dirt creation      | Flows like napalm                  |
| Dirt Charge     | $5,000  | 5           | N/A          | Dirt creation      | Similar to Riot Charge, but adds   |
| Earth Disrupter | $5,000  | 10          | N/A          | Terrain alteration | Alters terrain, unpredictable      |
| Plasma Blast    | $9,000  | 5           | 10-75        | Energy weapon      | Variable blast, late-game          |
| Laser           | $5,000  | 5           | N/A          | Energy weapon      | Pierces terrain, instant hit       |

The standard weapons are straightforward destructive devices.  You launch them and they cause damage.  How much simpler can it get?

| Item          | Description                                                                                                                                                                                                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baby Missile  | The Baby Missile is the earliest developed weapon, and performs as such.  Every player has an UNLIMITED supply of them.                                                                                                                                                                              |
| Missile       | The Missile is an enhancement of the baby missile, increasing both the blast radius and the damage delivered.                                                                                                                                                                                        |
| Baby Nuke     | The Baby Nuke is a nuclear explosive capable of destroying a large region.                                                                                                                                                                                                                           |
| Nuke          | The Nuke is a large-scale nuclear weapons capable of mass destruction.                                                                                                                                                                                                                               |
| Leapfrog      | The Leapfrog has three warheads which launch one after another.  This is often very effective for penetrating shields.                                                                                                                                                                               |
| Funky Bomb    | The Funky Bomb explodes in a multi-colored toxic chain reaction.  Sometimes they don't explode exactly where you want them to, but they are generally confined to the area where they hit.                                                                                                           |
| MIRV          | The MIRV contains five Missile warheads, which split apart when the original missile reaches apogee.  If the warhead hits something before reaching apogee, it will not explode.                                                                                                                     |
| Death's Head  | The Death's Head is the most destructive weapon created to date.  Functionally equivalent to MIRVs, it contains nine large scale explosive warheads.                                                                                                                                                 |
| Napalm        | Napalm splashes around wherever it hits and then bursts into hot flame.  It creates more heat (and is thus more destructive!) if it forms deep pools. If Napalm tunnels into the dirt, it may not get a chance to spread out.  Try contact triggers if you are having problems with fizzling Napalm. |
| Hot Napalm    | Hot Napalm is a deadly form of Napalm... much hotter and more powerful.  Otherwise, it functions pretty much like Napalm.                                                                                                                                                                            |
| Tracers       | Tracers have no destructive capability, but are useful for targeting someone without causing unwanted damage.                                                                                                                                                                                        |
| Smoke Tracers | Smoke Tracers function as Tracers, except they leave a brilliantly colored smoke trail behind them.  This makes targeting even easier.  The trails created may be erased using the System Menu.                                                                                                      |
| Baby Rollers  | Baby Rollers are the smallest of the roller family.  When they hit ground, they roll downhill until reaching a valley or a tank.  They then explode with the force of a baby missile.  If a roller hits a shield, it will just roll off!                                                             |
| Rollers       | Rollers are functionally the same as baby rollers, but contain a warhead equivalent to a standard missile.                                                                                                                                                                                           |
| Heavy Rollers | Heavy Rollers are non-nuclear, but deliver a payload more explosive than a baby nuke.                                                                                                                                                                                                                |

Earth Destroying Weapons

Earth destroying weapons are weapons which cause large (or small) amounts of dirt to be destroyed.  Most of these weapons cannot directly harm a tank, though they can cause them to fall and take damage that way.  Earth destroying weapons are also good for removing mountains that are in your way, or even removing dirt beneath yourself so that your tank is repositioned (perhaps away from an enemy tank!)

| Item             | Description                                                                                                                                                                                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Riot Charges     | Riot Charges destroy a wedge-shaped section of dirt from around your turret.  This weapon's primary use is to unbury yourself when you get covered with dirt.                                                                                                                                                            |
| Riot Blasts      | Riot Blasts are a larger version of the Riot Charge.  The destroy a wider angle of dirt, and the thickness of the wedge destroyed is also greater.                                                                                                                                                                       |
| Riot Bombs       | Riot Bombs destroy a spherical section of dirt wherever the detonate.  They do no damage to tanks.  Unlike Riot Charges and Riot Blasts, the Riot Bomb is a projectile weapon.                                                                                                                                           |
| Heavy Riot Bombs | Heavy Riot Bombs are scaled up versions of Riot Bombs.                                                                                                                                                                                                                                                                   |
| Baby Diggers     | Baby Diggers are useful for removing small amounts of dirt.  They tunnel when they hit ground.  If they hit a tank, they fizzle.                                                                                                                                                                                         |
| Diggers          | Diggers are more powerful versions of Baby Diggers.                                                                                                                                                                                                                                                                      |
| Heavy Diggers    | Heavy Diggers are the largest Digger-weapon available, but often fail to reach their full potential.                                                                                                                                                                                                                     |
| Baby Sandhogs    | Baby Sandhogs employ an alternate technology to achieve an effect similar to the Diggers.  In addition, each tunneling warhead contains a small but powerful charge, which can destroy an enemy tank from beneath.  Sandhogs are often useful for burrowing beneath enemy shields, and attacking an enemy tank directly. |
| Sandhogs         | Sandhogs contain more warheads than the Baby Sandhogs.                                                                                                                                                                                                                                                                   |
| Heavy Sandhogs   | Heavy Sandhogs can potentially destroy the world, and should be used with caution...                                                                                                                                                                                                                                     |

Earth Producing Weapons

The category of Earth Producing Weapons includes weapons which take some form of compacted earth that explodes into a much larger amount of dirt. These weapons can be used to build fortifications, or bury enemy tanks. There are other clever uses which can also be discovered... be creative!

The Earth Disrupter is not technically an Earth Producing weapon, but is grouped with this category because it often has a similar tactical effect.

| Item             | Description                                                                                                                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dirt Clods       | Dirt Clods are small warheads which explode into a sphere of dirt when hitting something.                                                                                                                        |
| Dirt Balls       | Dirt Balls are a larger form of Dirt Clods.                                                                                                                                                                      |
| Ton              | A Ton of Dirt is a very large Dirt Ball, easily capable of burying someone alive.                                                                                                                                |
| Liquid Dirt      | Liquid Dirt oozes out wherever it lands, filling holes and smoothing the terrain.  It is often useful to clear the way  for a Roller.                                                                            |
| Dirt Charge      | A Dirt Charge expels a cloud of dirt into the air in a wedge shape.                                                                                                                                              |
| Earth Disrupters | Earth Disrupters force all dirt to settle to the ground if dirt is being suspended in the air. This weapon is only useful if you are playing with the Suspend Dirt probability set to something greater that 0%. |

Energy Weapons

Energy weapons launch attacks using power stored in batteries... without batteries, they are not very effective.  With many batteries, they can be very effective indeed.  After you fire such a weapon, you will be asked how many batteries you want to use in the attack.  Naturally, you cannot use more batteries than you have.  Select the number of batteries you want to use by clicking on the appropriate box (the number of highlighted boxes indicates how many batteries will be expended).  You can do this with  the keyboard by pressing a number from 0 thru 9.  Engage your batteries, and watch the energy go!

| Item             | Description                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The Plasma Blast | The Plasma Blast allows you to expel radioactive energy from your tank to kill neighboring enemies. Your turret direction has no effect on the Plasma Blast. |
| The Laser        | The Laser shoots a high-intensity beam of light in a straight line, cutting through mountains, shields, and anything else in its way.                        |

**Detailed Analysis:**  
Weapons are divided into categories: standard explosives, nuclear, rolling, tunneling, dirt-producing, energy, and utility. Each has a distinct tactical role. For example, nukes are area-denial tools, rollers are effective on slopes, and diggers can unearth or trap tanks. The shop system and limited inventory force players to make strategic purchasing decisions between rounds.

Additionally, the original includes a computer-only "Triple-turreted tank" variant that can fire three shots simultaneously when using `Missile` or `Baby Missile`. Treat this as an AI-exclusive option unless explicitly enabled for players, and account for balance impacts.

### 2.2 Accessories, Guidance, and Defense Items

- **Accessories:** Fuel (for movement), Batteries (restore tank power), Parachutes (prevent death from falling), Tracers (visualize shots).
- **Guidance Systems:** Homing devices, mag shields (affect projectile paths), and other targeting aids.
- **Defense Systems:** Shields (absorb damage), auto-defense (pre-activate shields or parachutes), and triggers (detonate projectiles on contact).

**Analysis:**  
Accessories and defenses add layers of strategy, allowing players to survive longer, reposition, or counter specific threats. Guidance systems are rare and expensive, providing a significant advantage if used wisely.

### 2.3 Weapon and Item Configuration

- **Bundle Sizes:** Weapons are sold in bundles (e.g., 10 missiles per purchase), with a maximum inventory cap (typically 99 per item).
- **Dynamic Pricing:** Prices fluctuate based on supply and demand, simulating a simple in-game economy.
- **Arms Level:** Some weapons are restricted based on the configured "arms level," allowing for custom game balance.
- **Persistent Market Pricing:** Market price history persists across sessions (e.g., via a market database file), enabling volatility trends to continue unless reset.

**Analysis:**  
The economic system encourages players to manage resources and adapt to changing prices. Arms level settings allow hosts to restrict overpowered weapons for more balanced or beginner-friendly games.

---

## 3. Game Options and Adjustable Settings

### 3.1 Physics and Environmental Settings

- **Gravity:** Adjustable from low (moon-like) to high (earth-like or higher).
- **Wind:** Options for no wind, constant wind, or changing wind (per round or dynamically).
- **Explosion Size:** Can be scaled globally to make all weapons more or less destructive.
- **Projectile Speed:** Affects how quickly shots travel and how long explosions take to render.

**Analysis:**  
Customizable physics allow for a wide range of gameplay experiences, from slow, tactical duels to chaotic, fast-paced matches.

### 3.2 Economic and Game Progression Settings

- **Starting Money:** Set initial funds for each player.
- **Interest Rate:** Money not spent between rounds accrues interest, rewarding frugal play.
- **Market Volatility:** Controls how quickly weapon prices change in response to purchases.

**Analysis:**  
Economic settings can be tuned for short, action-packed games or longer, resource-management-focused campaigns.

### 3.3 AI and Difficulty Settings

- **AI Difficulty:** Selectable per computer player (Moron, Shooter, Tosser, Cyborg, Poolshark, Chooser, Spoiler, Unknown).
- **AI Buying Behavior:** Option to allow/disallow AI to purchase items automatically.

**Analysis:**  
Granular AI settings let players tailor the challenge to their skill level or experiment with different AI personalities.

### 3.4 Gameplay and Visual Options

- **Number of Rounds:** Set total rounds per game (1–1000).
- **Player Count:** Up to 10 tanks per game (mix of human and AI).
- **Turn Order:** Sequential (left-to-right), random, or team-based.
- **Simultaneous/Synchronous Modes:** Option for all players to fire at once or in strict sequence.
- **Trace Option:** Enable/disable shot tracers for easier aiming.
- **Talking Tanks:** Enable/disable humorous tank comments.
- **Status Bar:** Optional second-line HUD showing additional details (e.g., maximum power and current limits).
- **Wind Indicator:** HUD displays wind direction and magnitude (arrow with numeric value) or `No Wind` when disabled.

**Analysis:**  
These options enhance replayability and accessibility, allowing for both casual and competitive play.

---

## 4. AI Behavior and Opponent Types

### 4.1 AI Types and Tactics

| AI Type       | Description                                                                                                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Moron**     | Well, you can't get much stupider than this. Morons just pick an angle and power, and shoot. Definitely for beginners only.                                                                                                 |
| **Shooter**   | Shooters can be significantly deadlier than Morons, but only if they have a straight line of fire.                                                                                                                          |
| **Tosser**    | Tossers start out like Morons, but they'll refine their aim to get closer and closer, until they hit. If their initial shot isn't too close, you have some time to kill them.                                               |
| **Poolshark** | Poolsharks act like Shooters unless you are using rebounding walls. Then they try to rebound shots off of the walls and ceilings to shoot you.                                                                              |
| **Chooser**   | Choosers have all the above methods available to them, and decide which one will be most effective.                                                                                                                         |
| **Spoiler**   | Spoilers are decidedly dangerous. Taking into account the wind factor and gravity, they will get a perfect shot almost every time, assuming nothing is in the way. Luckily, they aren't able to compensate for viscous air. |
| **Cyborg**    | Cyborgs use methods similar to the Spoilers, but are much nastier about choosing targets. They will tend to attack tanks who are weakened, winning, or have attacked them in the past.                                      |
| **Unknown**   | If you choose this option, one of the above will be chosen randomly to control the tank, but you will not be notified of what the selection was!                                                                            |

**Analysis:**  
AI diversity ensures varied challenges. Advanced AIs (Cyborg, Spoiler) provide formidable opponents, while simpler types are suitable for beginners. AI can be further enhanced with modern techniques, but should retain the original’s flavor and quirks.

### 4.2 AI Purchasing and Inventory Management

- **Buying Logic:** AI can be configured to buy weapons and accessories automatically, prioritizing certain items based on difficulty and strategy.
- **Inventory Use:** AI selects weapons based on tactical situation (e.g., using nukes for clustered enemies, rollers on slopes).

**Analysis:**  
AI purchasing and usage patterns can be tuned for realism or challenge. The original AI sometimes made suboptimal choices, which can be optionally preserved for authenticity.

---

## 5. Multiplayer Support

### 5.1 Hotseat and Local Multiplayer

- **Hotseat Mode:** Multiple human players take turns on the same device, each with their own controls and settings.
- **Player Limit:** Up to 10 players per game, any mix of human and AI.
- **Turn Order:** Configurable (sequential, random, or team-based).

**Analysis:**  
Hotseat play is a core feature, enabling social, party-style gaming. The interface must support quick switching between players and clear indication of whose turn it is.

### 5.2 Online and Networked Multiplayer (Modern Adaptation)

- **Synchronous Play:** All players connect over a network, taking turns in real time. State synchronization is managed by a central server or peer-to-peer protocol.
- **Simultaneous Mode:** Optionally, all players can input their shots simultaneously, with results resolved together.
- **Lobby System:** Players can create or join games, configure settings, and chat before starting.
- **Spectator Mode:** Allow non-players to watch ongoing games.

**Analysis:**  
While not present in the original, online multiplayer is essential for modern platforms. Architecture should use a client-server model for reliability, with robust state management and anti-cheat measures.

### 5.3 Team Play

- **Teams:** Players can form teams, sharing victory conditions and optionally pooling resources.
- **Friendly Fire:** Configurable option for whether teammates can damage each other.

**Analysis:**  
Team play adds strategic depth and encourages cooperation. The UI should clearly indicate team affiliations and shared objectives.

---

## 6. Visual and Audio Elements

### 6.1 Retro-Style Graphics

- **VGA Palette:** Use a 256-color VGA palette for authenticity, with options for modern enhancements (e.g., higher resolutions, shaders).
- **Sprites:** Tanks, projectiles, explosions, and terrain are rendered as pixel art sprites.
- **Particle Effects:** Explosions, smoke, and debris use simple particle systems for visual feedback.
- **Backgrounds:** Randomly generated or pre-drawn mountain ranges and skies.

**Analysis:**  
The visual style should evoke the original’s charm while supporting modern resolutions and aspect ratios.

### 6.2 Sound Effects and Music

- **Sound Effects:** Retro-style explosion, firing, impact, and tank movement sounds. Optionally, support for modern audio formats and surround sound.
- **Talking Tanks:** Tanks display humorous text comments before firing or dying. Optionally, add synthesized or recorded voice lines.
- **Music:** Simple background music, either original PC speaker tunes or modern chiptune remixes.

**Analysis:**  
Audio is integral to the game’s atmosphere. Sound effects should be punchy and satisfying, with volume controls and mute options. Talking tanks add personality and humor.

---

## 7. User Interface (UI) and Controls

### 7.1 Menus and Navigation

- **Main Menu:** Options for starting a new game, loading/saving, configuring settings, and viewing help/about.
- **Player Setup:** Enter player names, select tank icons/colors, assign control schemes, and configure AI opponents.
- **Game Options:** Access to all adjustable settings (physics, economics, AI, visuals, sound).

**Analysis:**  
Menus should be intuitive, navigable via mouse, keyboard, or touch. Accessibility features (e.g., high-contrast mode, large fonts) are recommended.

### 7.2 In-Game HUD and Control Panel

- **Status Bar:** Displays current player, weapon, angle, power, wind, and inventory.
- **Tank Control Panel:** Allows adjustment of firing parameters, weapon selection, shield activation, and accessory use.
- **Inventory Panel:** Shows all owned weapons and items, with quick access for selection or activation.
- **Movement Panel:** For moving the tank, showing remaining fuel and movement controls.
- **Icon Selection Rules:** Some icons represent fixed emplacements (no wheels/treads) which disable fuel usage; an AI-only icon represents a triple-turreted tank variant.

**Analysis:**  
The HUD must present all relevant information clearly, with minimal clutter. Controls should be responsive and support both keyboard and mouse (or touch on mobile).

### 7.3 Purchasing and Shop System

- **Shop Menu:** After each round, players can buy or sell weapons and accessories using earned money.
- **Inventory Limits:** Enforce maximum item counts and dynamic pricing.
- **Sellback:** Players can sell unused items for a fraction of the purchase price.

**Analysis:**  
The shop is a critical strategic phase. The UI should make it easy to compare items, view stats, and manage inventory efficiently.

### 7.4 Targeting and Firing Controls

- **Angle and Power:** Adjustable via arrow keys, sliders, or direct input. Fine and coarse adjustment options.
- **Weapon Selection:** Cycle through owned weapons with keyboard shortcuts or mouse clicks.
- **Firing:** Single button or key to fire the selected weapon.

**Analysis:**  
Controls must be precise and responsive, with visual feedback for adjustments. Support for remapping keys and alternative input methods is essential for accessibility.

---

## 8. Platform Considerations

### 8.1 Windows, macOS, and Linux

- **Native Builds:** Provide native executables for each platform, using cross-platform frameworks (e.g., SDL, Unity, Godot).
- **Input Support:** Keyboard, mouse, and gamepad support. Full remapping and sensitivity adjustment.
- **Windowed and Fullscreen Modes:** Support for multiple resolutions and aspect ratios.

**Analysis:**  
Cross-platform compatibility ensures broad reach. Input and display options should be consistent across systems.

### 8.2 Mobile (iOS, Android)

- **Touch Controls:** On-screen buttons and sliders for aiming, power, and firing. Customizable layouts.
- **Portrait/Landscape Modes:** Support both orientations, with responsive UI scaling.
- **Performance Optimization:** Efficient rendering and physics for lower-powered devices.

**Analysis:**  
Mobile adaptation requires careful UI redesign and performance tuning. Touch controls must be intuitive and responsive, with options for simplified input schemes.

### 8.4 Save/Load and Configuration

- **Save/Load:** Allow saving and loading of games, including all player states and terrain.
- **Configuration Files:** Store settings, custom weapons, and landscapes in editable files (e.g., JSON, XML).

**Analysis:**  
Data-driven design enables easy customization and community-driven expansion. Robust save/load ensures long campaigns and experimentation.

---
