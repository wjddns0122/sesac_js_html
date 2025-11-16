(function () {
  "use strict";

  var TILE_SIZE = 32;
  var GRID_COLS = 15;
  var GRID_ROWS = 20;
  var BG_COLOR = "#b9fbc0";

  var canvas = null;
  var ctx = null;

  document.addEventListener("DOMContentLoaded", function () {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    setupCanvas();
    window.requestAnimationFrame(gameLoop);
  });

  function setupCanvas() {
    // Canvas dimensions are derived from the grid and tile size
    canvas.width = GRID_COLS * TILE_SIZE;
    canvas.height = GRID_ROWS * TILE_SIZE;
  }

  function gameLoop() {
    drawScene();
    window.requestAnimationFrame(gameLoop);
  }

  function drawScene() {
    // Wipe the previous frame and paint a fresh background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
})();
