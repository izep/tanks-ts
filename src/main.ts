import './style.css'
import { GameEngine } from './core/GameEngine';
import { TouchControls } from './ui/TouchControls';
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { faGear, faBolt, faBomb, faHeart, faShieldAlt, faCoins, faWind } from "@fortawesome/free-solid-svg-icons";

// Add icons to the library
library.add(faGear, faBolt, faBomb, faHeart, faShieldAlt, faCoins, faWind);

// Automatically replace <i> tags with <svg>
dom.watch();

const init = () => {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) {
    console.error("Critical Error: 'app' element not found in DOM");
    return;
  }

  app.innerHTML = `
    <div id="game-container">
      <canvas id="game-canvas"></canvas>
      <div id="ui-layer"></div>
    </div>
  `;

  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const engine = new GameEngine(canvas);
  engine.start();

  new TouchControls(engine.inputManager);

  console.log("Game Started");
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
