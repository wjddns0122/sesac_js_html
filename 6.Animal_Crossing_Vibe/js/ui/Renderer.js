(function () {
  let canvas;
  let ctx;
  let scale = 1;
  let lastTimestamp = 0;
  let menuScroll = 0;
  let menuCarPhase = 0;
  const fireworks = [];

  function init(canvasEl) {
    canvas = canvasEl;
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
    if (!ctx) return;
    const now = performance.now();
    const dt = lastTimestamp ? (now - lastTimestamp) / 1000 : 0;
    lastTimestamp = now;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.translate((canvas.width / scale - Config.virtualWidth * Config.tileSize) / 2, (canvas.height / scale - Config.virtualRows * Config.tileSize) / 2);

    if (!state || state.phase === 'MENU') {
      drawMenuScene(dt);
    } else {
      drawGameplayScene(state, dt);
    }

    ctx.restore();
  }

  function drawMenuScene(dt) {
    const tile = Config.tileSize;
    const width = Config.virtualWidth * tile;
    const height = Config.virtualRows * tile;
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#8ce6ff');
    sky.addColorStop(1, '#3a56a3');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    menuScroll = (menuScroll + dt * 0.7) % 1;
    for (let i = -1; i < Config.virtualRows + 2; i += 1) {
      const y = (i + menuScroll) * tile - tile;
      const laneType = i % 3;
      let color = Config.palette.grassBase;
      if (laneType === 1) color = Config.palette.roadBase;
      if (laneType === 2) color = Config.palette.riverWater;
      ctx.fillStyle = color;
      ctx.fillRect(0, y, width, tile * 0.9);
    }

    menuCarPhase = (menuCarPhase + dt * 1.2) % (Config.virtualWidth + 4);
    for (let i = 0; i < 4; i += 1) {
      const offset = (menuCarPhase + i * 2) % (Config.virtualWidth + 4) - 2;
      ctx.fillStyle = i % 2 === 0 ? '#ff8a80' : '#ffd54f';
      ctx.fillRect(offset * tile, height * 0.25 + i * tile * 0.6, tile * 1.4, tile * 0.35);
    }
  }

  function drawGameplayScene(state, dt) {
    drawBackground();
    drawLanes(state);
    drawPlayer(state);
    drawEagle(state);
    updateFireworks(dt);
    drawFireworks(state);
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
      if (lane.hasBestMarker) drawBestMarker(y);
      drawProps(lane, y);
      drawCoins(lane, y);
      if (lane.type === 'ROAD') drawVehicles(lane, y);
      if (lane.type === 'RIVER') drawLogs(lane, y);
      if (lane.type === 'RAIL') drawRail(lane, y);
    });
  }

  function drawLaneBase(lane, y) {
    const tile = Config.tileSize;
    const color = lane.type === 'GRASS' ? Config.palette.grassBase : lane.type === 'ROAD' ? Config.palette.roadBase : lane.type === 'RIVER' ? Config.palette.riverWater : Config.palette.railBase;
    ctx.fillStyle = color;
    ctx.fillRect(0, y, Config.virtualWidth * tile, tile);
  }

  function drawBestMarker(y) {
    const tile = Config.tileSize;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(0, y + tile * 0.25, Config.virtualWidth * tile, tile * 0.5);
    ctx.fillStyle = '#ffd54f';
    ctx.font = `${tile * 0.35}px bold sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BEST', (Config.virtualWidth * tile) / 2, y + tile * 0.5);
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
      ctx.fillRect(px + tile * 0.1, y + tile * 0.25, Math.max(tile * 0.2, vehicle.length * tile - tile * 0.2), tile * 0.2);
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

  function drawEagle(state) {
    if (!state.eagle || state.eagle.state === 'inactive') return;
    const tile = Config.tileSize;
    const row = state.eagle.currentRow || state.player.targetY + 4;
    const y = rowToPixel(row, state.cameraY);
    const x = (Config.virtualWidth * tile) / 2;
    ctx.fillStyle = '#fdd835';
    ctx.beginPath();
    ctx.moveTo(x, y - tile * 0.3);
    ctx.lineTo(x - tile * 0.8, y - tile * 1.1);
    ctx.lineTo(x + tile * 0.8, y - tile * 1.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(x - tile * 0.12, y - tile * 1.1, tile * 0.24, tile * 0.7);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + tile * 0.2, y - tile * 1.25, tile * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  function updateFireworks(dt) {
    for (let i = fireworks.length - 1; i >= 0; i -= 1) {
      const burst = fireworks[i];
      burst.particles.forEach((particle) => {
        particle.age += dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy -= 1.5 * dt;
      });
      burst.particles = burst.particles.filter((p) => p.age < p.life);
      if (burst.particles.length === 0) fireworks.splice(i, 1);
    }
  }

  function drawFireworks(state) {
    if (!fireworks.length) return;
    const tile = Config.tileSize;
    fireworks.forEach((burst) => {
      burst.particles.forEach((particle) => {
        const px = (burst.x + particle.x) * tile + tile * 0.5;
        const py = rowToPixel(burst.y + particle.y, state.cameraY) + tile * 0.5;
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = 1 - particle.age / particle.life;
        ctx.beginPath();
        ctx.arc(px, py, tile * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    });
  }

  function triggerFireworks(state) {
    if (!state || !state.player) return;
    for (let i = 0; i < 3; i += 1) {
      fireworks.push(createFirework(state.player.x + (Math.random() - 0.5) * 0.5, state.player.y + Math.random() * 0.5));
    }
  }

  function createFirework(baseX, baseY) {
    const particles = [];
    const colors = ['#ffeb3b', '#ff80ab', '#4fc3f7'];
    for (let i = 0; i < 18; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = random(1.5, 3.5);
      particles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: random(0.5, 1.2),
        age: 0,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    return { x: baseX, y: baseY, particles };
  }

  function rowToPixel(worldY, cameraY) {
    const tile = Config.tileSize;
    return (Config.virtualRows - (worldY - cameraY) - 1) * tile;
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  window.Renderer = {
    init,
    render,
    triggerFireworks
  };
})();
