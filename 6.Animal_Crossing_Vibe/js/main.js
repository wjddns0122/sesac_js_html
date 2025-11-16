import { Game } from './game.js';
import { InputController } from './input.js';

const canvas = document.getElementById('gameCanvas');
const hud = {
    scoreEl: document.getElementById('scoreValue'),
    bestEl: document.getElementById('bestValue'),
    coinEl: document.getElementById('coinValue')
};
const touchPad = document.getElementById('touchPad');
const overlay = document.getElementById('overlay');
const overlayBest = document.getElementById('overlayBest');
const overlayCoins = document.getElementById('overlayCoins');
const overlayResult = document.getElementById('overlayResult');
const startButton = document.getElementById('startButton');

const input = new InputController(touchPad);
input.setEnabled(false);

const game = new Game({
    canvas,
    hud,
    input,
    onGameOver: handleGameOver
});

game.init();
updateOverlayStats();

startButton.addEventListener('click', startRun);

document.addEventListener('keydown', (event) => {
    if (!overlay.classList.contains('hidden') && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        startRun();
    }
});

function startRun() {
    overlay.classList.add('hidden');
    overlayResult.textContent = '';
    startButton.textContent = '다시 달리기';
    game.startRun();
}

function handleGameOver({ score, coins, best, totalCoins, reason, isRecord }) {
    input.setEnabled(false);
    overlay.classList.remove('hidden');
    overlayBest.textContent = best;
    overlayCoins.textContent = totalCoins;
    const baseText = `${reason}\n점수 ${score} / 코인 ${coins}`;
    overlayResult.textContent = isRecord ? `${baseText}\n신기록 달성!` : baseText;
}

function updateOverlayStats() {
    const stats = game.getPersistentStats();
    overlayBest.textContent = stats.best;
    overlayCoins.textContent = stats.totalCoins;
}

let lastTime = performance.now();
function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    game.handleInput();
    game.update(dt);
    game.render();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
