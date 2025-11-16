(function () {
  "use strict";

  var TILE_SIZE = 32;
  var GRID_COLS = 15;
  var GRID_ROWS = 20;
  var BG_COLOR = "#b9fbc0";

  var canvas = null;
  var ctx = null;
  var player = null;

  document.addEventListener("DOMContentLoaded", function () {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    setupCanvas();
    player = createPlayer();
    bindInputs();
    window.requestAnimationFrame(gameLoop);
  });

  function setupCanvas() {
    // Canvas dimensions are derived from the grid and tile size
    canvas.width = GRID_COLS * TILE_SIZE;
    canvas.height = GRID_ROWS * TILE_SIZE;
  }

  function gameLoop() {
    render();
    window.requestAnimationFrame(gameLoop);
  }

  function render() {
    // Wipe the previous frame and paint a fresh background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    renderGrid(ctx);
    renderPlayer(ctx, player);
  }

  function createPlayer() {
    // Player starts centered on the last row of the grid
    return {
      row: GRID_ROWS - 1,
      col: Math.floor(GRID_COLS / 2),
    };
  }

  function renderGrid(context) {
    context.strokeStyle = "rgba(18, 52, 59, 0.25)";
    context.lineWidth = 1;

    for (var row = 0; row <= GRID_ROWS; row += 1) {
      var y = row * TILE_SIZE; // Row -> pixel Y by multiplying with TILE_SIZE
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }

    for (var col = 0; col <= GRID_COLS; col += 1) {
      var x = col * TILE_SIZE; // Column -> pixel X by TILE_SIZE multiplication
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }
  }

  function renderPlayer(context, playerState) {
    if (!playerState) {
      return;
    }
    // Convert tile(col,row) to the top-left pixel of that tile
    var pixelX = playerState.col * TILE_SIZE;
    var pixelY = playerState.row * TILE_SIZE;
    context.fillStyle = "#ff6f91";
    context.fillRect(pixelX + 6, pixelY + 6, TILE_SIZE - 12, TILE_SIZE - 12);
  }

  function bindInputs() {
    document.addEventListener("keydown", function (event) {
      var handled = handleMovementInput(event.key);
      if (handled) {
        event.preventDefault();
      }
    });
  }

  function handleMovementInput(key) {
    if (!player) {
      return false;
    }

    var deltaRow = 0;
    var deltaCol = 0;

    // Each arrow key adjusts the grid coordinate by exactly one tile
    if (key === "ArrowUp") {
      deltaRow = -1;
    } else if (key === "ArrowDown") {
      deltaRow = 1;
    } else if (key === "ArrowLeft") {
      deltaCol = -1;
    } else if (key === "ArrowRight") {
      deltaCol = 1;
    } else {
      return false;
    }

    var nextRow = player.row + deltaRow;
    var nextCol = player.col + deltaCol;

    // Clamp values so the player cannot leave the grid
    player.row = Math.max(0, Math.min(GRID_ROWS - 1, nextRow));
    player.col = Math.max(0, Math.min(GRID_COLS - 1, nextCol));
    return true;
  }
})();
