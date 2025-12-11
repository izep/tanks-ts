import './style.css'
import { GameEngine } from './core/GameEngine';
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { faGear, faBolt, faBomb, faHeart, faShieldAlt, faCoins, faWind } from "@fortawesome/free-solid-svg-icons";

// Add icons to the library
library.add(faGear, faBolt, faBomb, faHeart, faShieldAlt, faCoins, faWind);

// Automatically replace <i> tags with <svg>
dom.watch();

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="game-container">
    <canvas id="game-canvas"></canvas>
    <div id="ui-layer"></div>
  </div>
`

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const engine = new GameEngine(canvas);
engine.start();

import { TouchControls } from './ui/TouchControls';
new TouchControls(engine.inputManager);

console.log("Game Started");
