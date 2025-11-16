(function () {
  "use strict";

  var TILE_SIZE = 32;
  var GRID_COLS = 15;
  var GRID_ROWS = 20;
  var BG_COLOR = "#b9fbc0";
  var CAR_BASE_SPEED = 4; // base tiles per second
  var CAR_LENGTH_TILES = 1.5;
  var SPAWN_INTERVAL_MIN = 1.2;
  var SPAWN_INTERVAL_MAX = 2.6;

  var canvas = null;
  var ctx = null;
  var player = null;
  var mapRows = [];
  var lastTimestamp = 0;

  document.addEventListener("DOMContentLoaded", function () {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    setupCanvas();
    player = createPlayer();
    initGame();
    bindInputs();
    window.requestAnimationFrame(gameLoop);
  });

  function setupCanvas() {
    // Canvas dimensions are derived from the grid and tile size
    canvas.width = GRID_COLS * TILE_SIZE;
    canvas.height = GRID_ROWS * TILE_SIZE;
  }

  function gameLoop(timestamp) {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }

    var deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    updateCars(deltaTime);
    render();
    window.requestAnimationFrame(gameLoop);
  }

  function render() {
    // Wipe the previous frame and paint a fresh background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    renderRows(ctx);
    renderGrid(ctx);
    renderCars(ctx);
    renderPlayer(ctx, player);
  }

  function createPlayer() {
    // Player starts centered on the last row of the grid
    return {
      row: GRID_ROWS - 1,
      col: Math.floor(GRID_COLS / 2),
    };
  }

  function initGame() {
    mapRows = [];
    for (var rowIndex = 0; rowIndex < GRID_ROWS; rowIndex += 1) {
      var type = "grass";
      var laneConfig = null;

      // Make a small band of middle rows into roads for future vehicle spawning
      if (rowIndex >= 6 && rowIndex <= 11) {
        type = "road";
        laneConfig = {
          direction: rowIndex % 2 === 0 ? 1 : -1,
          baseSpeed: CAR_BASE_SPEED + (rowIndex % 3) * 0.8,
          spawnIntervalMin: SPAWN_INTERVAL_MIN,
          spawnIntervalMax: SPAWN_INTERVAL_MAX,
        };
      }

      mapRows.push(createRow(rowIndex, type, laneConfig));
    }
  }

  function createRow(rowIndex, type, config) {
    // index: vertical position; rowType: visuals/behavior; cars: vehicles in this lane
    // laneConfig: preferred direction/speed/spawn rates; spawnTimer: countdown for next car
    return {
      index: rowIndex,
      rowType: type,
      cars: [],
      laneConfig: config,
      spawnTimer: config ? randomBetween(config.spawnIntervalMin, config.spawnIntervalMax) : 0,
    };
  }

  function renderRows(context) {
    if (!mapRows.length) {
      return;
    }

    mapRows.forEach(function (row) {
      var color = row.rowType === "road" ? "#6c6f7d" : "#d9f8c4";
      var y = row.index * TILE_SIZE;
      context.fillStyle = color;
      context.fillRect(0, y, canvas.width, TILE_SIZE);
    });
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

  function renderCars(context) {
    mapRows.forEach(function (row) {
      if (row.rowType !== "road") {
        return;
      }

      row.cars.forEach(function (car) {
        // Translate tile-space x/y into pixel positions
        var pixelX = car.x * TILE_SIZE;
        var pixelY = car.row * TILE_SIZE + 6;
        var width = car.lengthTiles * TILE_SIZE;
        var height = TILE_SIZE - 12;
        context.fillStyle = "#ffb347";
        context.fillRect(pixelX, pixelY, width, height);
        context.strokeStyle = "rgba(0,0,0,0.3)";
        context.strokeRect(pixelX, pixelY, width, height);
      });
    });
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

  function updateCars(deltaTime) {
    if (!mapRows.length) {
      return;
    }

    mapRows.forEach(function (row) {
      if (row.rowType !== "road" || !row.laneConfig) {
        return;
      }

      // Countdown until a new vehicle should spawn
      row.spawnTimer -= deltaTime;
      if (row.spawnTimer <= 0) {
        spawnCar(row.index);
        row.spawnTimer = randomBetween(row.laneConfig.spawnIntervalMin, row.laneConfig.spawnIntervalMax);
      }

      // Move each car and filter out the ones that left the screen
      row.cars = row.cars.filter(function (car) {
        car.x += car.speed * car.direction * deltaTime;

        // Remove once the entire car is beyond the opposing edge
        if (car.direction > 0 && car.x - car.lengthTiles > GRID_COLS) {
          return false;
        }
        if (car.direction < 0 && car.x + car.lengthTiles < 0) {
          return false;
        }
        return true;
      });
    });
  }

  function spawnCar(rowIndex) {
    var row = mapRows[rowIndex];
    if (!row || row.rowType !== "road" || !row.laneConfig) {
      return;
    }

    var direction = row.laneConfig.direction;
    // start just off-screen to create smooth entry
    var startX = direction > 0 ? -CAR_LENGTH_TILES : GRID_COLS + CAR_LENGTH_TILES;

    row.cars.push({
      row: rowIndex,
      x: startX,
      speed: row.laneConfig.baseSpeed,
      direction: direction,
      lengthTiles: CAR_LENGTH_TILES,
    });
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }
})();
