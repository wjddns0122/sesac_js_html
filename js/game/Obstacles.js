(function () {
  const VEHICLES = [
    { length: 1.5, color: '#ff6f61' },
    { length: 2.2, color: '#fdd835' },
    { length: 3.2, color: '#8d6e63' }
  ];

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createStaticObstacles(density) {
    const tiles = [];
    for (let x = 0; x < Config.virtualWidth; x += 1) {
      if (Math.random() < density) tiles.push(x);
    }
    return tiles;
  }

  function createCoins(pattern) {
    const coins = [];
    if (pattern === 'line') {
      const start = Math.floor(Math.random() * (Config.virtualWidth - 3));
      for (let i = 0; i < 4; i += 1) coins.push({ x: start + i, collected: false });
      return coins;
    }
    for (let i = 0; i < Config.virtualWidth; i += 1) {
      if (Math.random() < 0.15) coins.push({ x: i, collected: false });
    }
    return coins;
  }

  function createVehicles(direction, difficulty) {
    const entries = [];
    let cursor = -5 + Math.random() * 2;
    while (cursor < Config.virtualWidth + 6) {
      const type = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];
      entries.push({ x: cursor, length: type.length, color: type.color });
      cursor += type.length + random(1.2 - difficulty.gapModifier, 3.5 - difficulty.gapModifier * 0.5);
    }
    const speed = random(3, 6) * difficulty.speedMultiplier * direction;
    return { objects: entries, speed };
  }

  function createLogs(direction, difficulty) {
    const logs = [];
    let cursor = -6;
    while (cursor < Config.virtualWidth + 6) {
      const length = random(1.5, 3.8);
      logs.push({ x: cursor, length, color: '#8d6e63' });
      cursor += length + random(1.5 - difficulty.gapModifier, 3 - difficulty.gapModifier * 0.5);
    }
    const speed = random(1.4, 3.2) * difficulty.speedMultiplier * direction;
    return { objects: logs, speed };
  }

  function updateLinear(list, speed, dt) {
    list.forEach((obj) => {
      obj.x += speed * dt;
      if (speed > 0 && obj.x > Config.virtualWidth + 3) obj.x = -obj.length - 2;
      if (speed < 0 && obj.x < -obj.length - 3) obj.x = Config.virtualWidth + 2;
    });
  }

  function initRailData() {
    return {
      train: null,
      cooldown: random(4, 8),
      warning: 0
    };
  }

  function updateRail(data, dt) {
    if (data.train) {
      data.train.x += data.train.speed * dt;
      if ((data.train.speed > 0 && data.train.x > Config.virtualWidth + 12) || (data.train.speed < 0 && data.train.x < -12)) {
        data.train = null;
        data.cooldown = random(4, 8);
      }
      return;
    }
    if (data.warning > 0) {
      data.warning = Math.max(0, data.warning - dt);
      if (data.warning === 0) spawnTrain(data);
    } else {
      data.cooldown -= dt;
      if (data.cooldown <= 0) data.warning = 1.2;
    }
  }

  function spawnTrain(data) {
    const direction = Math.random() < 0.5 ? 1 : -1;
    const start = direction > 0 ? -15 : Config.virtualWidth + 15;
    data.train = { x: start, length: Config.virtualWidth + 6, speed: 12 * direction };
  }

  function removeCoin(lane, x) {
    if (!lane.coins) return false;
    const coin = lane.coins.find((c) => !c.collected && Math.round(c.x) === Math.round(x));
    if (coin) {
      coin.collected = true;
      return true;
    }
    return false;
  }

  window.Obstacles = {
    createStaticObstacles,
    createCoins,
    createVehicles,
    createLogs,
    updateLinear,
    initRailData,
    updateRail,
    removeCoin
  };
})();
