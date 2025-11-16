(function () {
  let canvas;
  let ctx;
  let scale = 1;

  function init(el) {
    canvas = el;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    const { innerWidth, innerHeight } = window;
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    scale = Math.min(innerWidth / (Config.virtualWidth * Config.tileSize), innerHeight / (Config.virtualRows * Config.tileSize));
  }

  function render(state) {
    if (!ctx || !state.player) return;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.translate((canvas.width / scale - Config.virtualWidth * Config.tileSize) / 2, (canvas.height / scale - Config.virtualRows * Config.tileSize) / 2);
    drawBackground();
    drawLanes(state);
    drawPlayer(state);
    ctx.restore();
  }

  function drawBackground() {
    const { tileSize } = Config;
    const width = Config.virtualWidth * tileSize;
    const height = Config.virtualRows * tileSize;
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, Config.palette.backgroundSky);
    sky.addColorStop(1, Config.palette.backgroundFog);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);
  }

  function drawLanes(state) {
    state.lanes.forEach((lane) => {
      const y = rowToPixel(lane.worldY, state.cameraY);
      if (y < -Config.tileSize || y > Config.virtualRows * Config.tileSize) return;
      drawLaneBase(lane, y);
      drawProps(lane, y);
      drawCoins(lane, y);
      if (lane.type === 'ROAD') drawVehicles(lane, y);
      if (lane.type === 'RIVER') drawLogs(lane, y, state);
      if (lane.type === 'RAIL') drawRail(lane, y);
    });
  }

  function drawLaneBase(lane, y) {
    const tile = Config.tileSize;
    ctx.fillStyle = lane.type === 'GRASS' ? Config.palette.grassBase : lane.type === 'ROAD' ? Config.palette.roadBase : lane.type === 'RIVER' ? Config.palette.riverWater : Config.palette.railBase;
    ctx.fillRect(0, y, Config.virtualWidth * tile, tile);
  }

  function drawProps(lane, y) {
    if (!lane.blocks) return;
    const tile = Config.tileSize;
    lane.blocks.forEach((block) => {
      ctx.fillStyle = Config.palette.grassAccent;
      ctx.fillRect(block * tile + tile * 0.2, y + tile * 0.1, tile * 0.6, tile * 0.8);
    });
  }

  function drawCoins(lane, y) {
    if (!lane.coins) return;
    const tile = Config.tileSize;
    lane.coins.forEach((coin) => {
      if (coin.collected) return;
      ctx.fillStyle = Config.palette.roadLine;
      const cx = coin.x * tile + tile * 0.5;
      ctx.beginPath();
      ctx.arc(cx, y + tile * 0.5, tile * 0.15, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawVehicles(lane, y) {
    const tile = Config.tileSize;
    lane.vehicles.forEach((vehicle) => {
      const px = vehicle.x * tile;
      ctx.fillStyle = vehicle.color;
      ctx.fillRect(px, y + tile * 0.1, vehicle.length * tile, tile * 0.8);
      ctx.fillStyle = Config.palette.carWindow;
      ctx.fillRect(px + tile * 0.1, y + tile * 0.25, vehicle.length * tile - tile * 0.2, tile * 0.2);
    });
  }

  function drawLogs(lane, y) {
    const tile = Config.tileSize;
    lane.logs.forEach((log) => {
      ctx.fillStyle = Config.palette.logBody;
      ctx.fillRect(log.x * tile, y + tile * 0.2, log.length * tile, tile * 0.6);
    });
  }

  function drawRail(lane, y) {
    const tile = Config.tileSize;
    ctx.fillStyle = Config.palette.railTrack;
    ctx.fillRect(0, y + tile * 0.2, Config.virtualWidth * tile, tile * 0.2);
    ctx.fillRect(0, y + tile * 0.6, Config.virtualWidth * tile, tile * 0.2);
    if (lane.data.warning > 0) {
      ctx.fillStyle = 'rgba(255,50,50,0.2)';
      ctx.fillRect(0, y, Config.virtualWidth * tile, tile);
    }
    if (lane.data.train) {
      ctx.fillStyle = '#fdd835';
      ctx.fillRect(lane.data.train.x * tile, y + tile * 0.05, lane.data.train.length * tile, tile * 0.9);
    }
  }

  function drawPlayer(state) {
    const tile = Config.tileSize;
    const px = state.player.x * tile + tile * 0.5;
    const py = rowToPixel(state.player.y, state.cameraY) + tile * 0.5 - state.player.hopHeight * tile;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px, py + tile * 0.35, tile * 0.25, tile * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = state.player.colorAccent;
    ctx.fillRect(px - tile * 0.18, py - tile * 0.2 + state.player.squash * 5, tile * 0.36, tile * 0.35);
    ctx.fillStyle = state.player.colorPrimary;
    ctx.fillRect(px - tile * 0.25, py - tile * 0.55, tile * 0.5, tile * 0.4);
  }

  function rowToPixel(worldY, cameraY) {
    const tile = Config.tileSize;
    return (Config.virtualRows - (worldY - cameraY) - 1) * tile;
  }

  window.Renderer = { init, render };
})();
