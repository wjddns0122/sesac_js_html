// js/main.js
let canvas, ctx;
let lastTime = 0;
let inputManager;
let game;

function init() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');

  inputManager = createInputManager();
  game = createGameState(canvas.width, canvas.height, inputManager);

  const restartBtn = document.getElementById('restart-btn');
  restartBtn.addEventListener('click', () => {
    game.reset();
    restartBtn.style.display = 'none';
  });

  requestAnimationFrame(loop);
}

function loop(timestamp) {
  const dt = (timestamp - lastTime) / 1000; // seconds
  lastTime = timestamp;

  game.update(dt);
  game.render(ctx);

  // HUD 업데이트
  document.getElementById('score-text').textContent = game.score;
  document.getElementById('highscore-text').textContent = game.highScore;
  document.getElementById('coins-text').textContent = game.totalCoins;

  if (game.isGameOver) {
    document.getElementById('restart-btn').style.display = 'block';
  }

  requestAnimationFrame(loop);
}

window.addEventListener('load', init);
