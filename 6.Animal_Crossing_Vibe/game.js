(function () {
  "use strict";

  // -----------------------------
  // Grid + Canvas configuration
  // -----------------------------
  var TILE_SIZE = 32;
  var GRID_COLS = 15;
  var GRID_ROWS = 20;
  var BG_COLOR = "#b9fbc0";

  // -----------------------------
  // Lane + car configuration
  // -----------------------------
  var ROAD_START_ROW = 6;
  var ROAD_END_ROW = 11;
  var CAR_BASE_SPEED = 4; // tiles / second
  var CAR_SPEED_VARIATION = 0.8;
  var CAR_LENGTH_TILES = 1.5;
  var SPAWN_INTERVAL_MIN = 1.2;
  var SPAWN_INTERVAL_MAX = 2.6;

  // -----------------------------
  // Game state references
  // -----------------------------
  var canvas = null;
  var ctx = null;
  var player = null;
  var mapRows = [];
  var lastTimestamp = 0;
  var score = 0;
  var highScore = 0;
  var furthestRow = GRID_ROWS - 1;
  var isGameOver = false;
  var scoreElement = null;

  // -----------------------------
  // Bootstrapping
  // -----------------------------
  document.addEventListener("DOMContentLoaded", function () {
    cacheDom();
    setupCanvas();
    resetGame();
    bindInputs();
    bindRetryButton();
    window.requestAnimationFrame(gameLoop);
  });

  function cacheDom() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    scoreElement = document.getElementById("scoreValue");
  }

  function setupCanvas() {
    canvas.width = GRID_COLS * TILE_SIZE;
    canvas.height = GRID_ROWS * TILE_SIZE;
  }

  // -----------------------------
  // Main loop
  // -----------------------------
  function gameLoop(timestamp) {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }

    var deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (!isGameOver) {
      update(deltaTime);
    }
    render();
    window.requestAnimationFrame(gameLoop);
  }

  function update(deltaTime) {
    updateCars(deltaTime);
    checkCollision();
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    renderRows();
    renderGrid();
    renderCars();
    renderPlayer();

    if (isGameOver) {
      renderGameOverOverlay();
    }
  }

  // -----------------------------
  // Initialization helpers
  // -----------------------------
  function resetGame() {
    player = createPlayer();
    initGameRows();
    furthestRow = player.row;
    score = 0;
    isGameOver = false;
    lastTimestamp = 0;
    updateScoreDisplay();
  }

  function createPlayer() {
    return {
      row: GRID_ROWS - 1,
      col: Math.floor(GRID_COLS / 2),
    };
  }

  function initGameRows() {
    mapRows = [];

    for (var rowIndex = 0; rowIndex < GRID_ROWS; rowIndex += 1) {
      var isRoad = rowIndex >= ROAD_START_ROW && rowIndex <= ROAD_END_ROW;
      var laneConfig = null;

      if (isRoad) {
        laneConfig = {
          direction: rowIndex % 2 === 0 ? 1 : -1,
          baseSpeed: CAR_BASE_SPEED + (rowIndex % 3) * CAR_SPEED_VARIATION,
          spawnIntervalMin: SPAWN_INTERVAL_MIN,
          spawnIntervalMax: SPAWN_INTERVAL_MAX,
        };
      }

      mapRows.push(createRow(rowIndex, isRoad ? "road" : "grass", laneConfig));
    }
  }

  function createRow(rowIndex, type, config) {
    // Each row keeps track of its lane type and upcoming car spawn window.
    return {
      index: rowIndex,
      rowType: type,
      cars: [],
      laneConfig: config,
      spawnTimer: config ? randomBetween(config.spawnIntervalMin, config.spawnIntervalMax) : 0,
    };
  }

  // -----------------------------
  // Input handling
  // -----------------------------
  function bindInputs() {
    document.addEventListener("keydown", function (event) {
      var handled = handleMovementInput(event.key);
      if (handled) {
        event.preventDefault();
      }
    });
  }

  function bindRetryButton() {
    var retryButton = document.querySelector(".button-bar button");
    if (!retryButton) {
      return;
    }
    retryButton.addEventListener("click", resetGame);
  }

  function handleMovementInput(key) {
    if (!player) {
      return false;
    }

    if (isGameOver && (key === "r" || key === "R")) {
      resetGame();
      return true;
    }

    if (isGameOver) {
      return false;
    }

    var deltaRow = 0;
    var deltaCol = 0;

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

    player.row = Math.max(0, Math.min(GRID_ROWS - 1, nextRow));
    player.col = Math.max(0, Math.min(GRID_COLS - 1, nextCol));

    trackProgress();
    return true;
  }

  // -----------------------------
  // Game updates
  // -----------------------------
  function updateCars(deltaTime) {
    if (!mapRows.length) {
      return;
    }

    mapRows.forEach(function (row) {
      if (row.rowType !== "road" || !row.laneConfig) {
        return;
      }

      row.spawnTimer -= deltaTime;
      if (row.spawnTimer <= 0) {
        spawnCar(row.index);
        row.spawnTimer = randomBetween(row.laneConfig.spawnIntervalMin, row.laneConfig.spawnIntervalMax);
      }

      row.cars = row.cars.filter(function (car) {
        car.x += car.speed * car.direction * deltaTime;

        var leftBound = car.x + car.lengthTiles < 0 && car.direction < 0;
        var rightBound = car.x - car.lengthTiles > GRID_COLS && car.direction > 0;
        return !(leftBound || rightBound);
      });
    });
  }

  function spawnCar(rowIndex) {
    var row = mapRows[rowIndex];
    if (!row || row.rowType !== "road" || !row.laneConfig) {
      return;
    }

    var direction = row.laneConfig.direction;
    var startX = direction > 0 ? -CAR_LENGTH_TILES : GRID_COLS + CAR_LENGTH_TILES;

    row.cars.push({
      row: rowIndex,
      x: startX,
      speed: row.laneConfig.baseSpeed,
      direction: direction,
      lengthTiles: CAR_LENGTH_TILES,
    });
  }

  function checkCollision() {
    var row = mapRows[player.row];
    if (!row || row.rowType !== "road") {
      return;
    }

    var playerLeft = player.col;
    var playerRight = player.col + 1;

    var hit = row.cars.some(function (car) {
      var carLeft = car.x;
      var carRight = car.x + car.lengthTiles;
      return carRight > playerLeft && carLeft < playerRight;
    });

    if (hit) {
      triggerGameOver();
    }
  }

  function triggerGameOver() {
    isGameOver = true;
    highScore = Math.max(highScore, score);
  }

  // -----------------------------
  // Progress + scoring
  // -----------------------------
  function trackProgress() {
    if (player.row < furthestRow) {
      furthestRow = player.row;
      score = (GRID_ROWS - 1) - furthestRow;
      highScore = Math.max(highScore, score);
      updateScoreDisplay();
    }
  }

  function updateScoreDisplay() {
    if (!scoreElement) {
      return;
    }
    scoreElement.textContent = score.toString().padStart(4, "0");
  }

  // -----------------------------
  // Rendering helpers
  // -----------------------------
  function renderRows() {
    mapRows.forEach(function (row) {
      var color = row.rowType === "road" ? "#6c6f7d" : "#d9f8c4";
      var y = row.index * TILE_SIZE;
      ctx.fillStyle = color;
      ctx.fillRect(0, y, canvas.width, TILE_SIZE);
    });
  }

  function renderGrid() {
    ctx.strokeStyle = "rgba(18, 52, 59, 0.25)";
    ctx.lineWidth = 1;

    for (var row = 0; row <= GRID_ROWS; row += 1) {
      var y = row * TILE_SIZE;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    for (var col = 0; col <= GRID_COLS; col += 1) {
      var x = col * TILE_SIZE;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }

  function renderPlayer() {
    if (!player) {
      return;
    }
    var pixelX = player.col * TILE_SIZE;
    var pixelY = player.row * TILE_SIZE;
    ctx.fillStyle = "#ff6f91";
    ctx.fillRect(pixelX + 6, pixelY + 6, TILE_SIZE - 12, TILE_SIZE - 12);
  }

  function renderCars() {
    mapRows.forEach(function (row) {
      if (row.rowType !== "road") {
        return;
      }

      row.cars.forEach(function (car) {
        var pixelX = car.x * TILE_SIZE;
        var pixelY = car.row * TILE_SIZE + 6;
        var width = car.lengthTiles * TILE_SIZE;
        var height = TILE_SIZE - 12;
        ctx.fillStyle = "#ffb347";
        ctx.fillRect(pixelX, pixelY, width, height);
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.strokeRect(pixelX, pixelY, width, height);
      });
    });
  }

  function renderGameOverOverlay() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "600 20px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "16px 'Segoe UI', sans-serif";
    ctx.fillText("Press R or Retry to restart", canvas.width / 2, canvas.height / 2 + 16);
  }

  // -----------------------------
  // Utilities
  // -----------------------------
  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }
})();
