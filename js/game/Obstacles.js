(function () {
  const VEHICLE_SPECS = {
    CAR: { length: 1.1, color: '#ff6f61' },
    TRUCK: { length: 1.8, color: '#fdd835' },
    BUS: { length: 2.6, color: '#8d6e63' }
  };

  const LOG_SPECS = {
    LOG_SHORT: { length: 1.6 },
    LOG_MED: { length: 2.4 },
    LOG_LONG: { length: 3.2 }
  };

  function random(min, max) {
    return Math.random() * (max - min) + min;
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

  function createGrassBlocks({ density, corridorX, minEmpty }) {
    const blocked = new Array(Config.virtualWidth).fill(false);
    for (let x = 0; x < Config.virtualWidth; x += 1) {
      if (Math.abs(x - corridorX) <= 1) continue;
      if (Math.random() < density) blocked[x] = true;
    }
    let emptyCount = blocked.reduce((count, isBlocked) => count + (isBlocked ? 0 : 1), 0);
    if (emptyCount < minEmpty) {
      for (let x = 0; x < blocked.length && emptyCount < minEmpty; x += 1) {
        if (blocked[x]) {
          blocked[x] = false;
          emptyCount += 1;
        }
      }
    }
    return blocked.reduce((arr, isBlocked, index) => {
      if (isBlocked) arr.push(index);
      return arr;
    }, []);
  }

  function createRoadPattern(pattern, direction, speedMultiplier) {
    const slotSpacing = Config.ROAD_SLOT_SPACING;
    const wrapLength = pattern.slots.length * slotSpacing + Config.virtualWidth + 6;
    const startX = direction > 0 ? -wrapLength / 2 : Config.virtualWidth + wrapLength / 2;
    const vehicles = [];
    pattern.slots.forEach((slot, index) => {
      if (slot === 'GAP') return;
      const spec = VEHICLE_SPECS[slot] || VEHICLE_SPECS.CAR;
      const offset = index * slotSpacing;
      const x = direction > 0 ? startX + offset : startX - offset;
      vehicles.push({
        x,
        length: spec.length,
        color: spec.color
      });
    });
    const baseSpeed = pattern.baseSpeed * speedMultiplier;
    const wrapStart = -wrapLength;
    const wrapEnd = Config.virtualWidth + wrapLength;
    return {
      vehicles,
      speed: baseSpeed * direction,
      wrapStart,
      wrapEnd,
      wrapSpan: wrapEnd - wrapStart
    };
  }

  function updateRoadLane(lane, dt) {
    lane.vehicles.forEach((vehicle) => {
      vehicle.x += lane.speed * dt;
      if (lane.speed > 0 && vehicle.x > lane.wrapEnd) {
        vehicle.x -= lane.wrapSpan;
      } else if (lane.speed < 0 && vehicle.x < lane.wrapStart - vehicle.length) {
        vehicle.x += lane.wrapSpan;
      }
    });
  }

  function createRiverPattern(pattern, direction, speedMultiplier) {
    const slotSpacing = Config.RIVER_SLOT_SPACING;
    const wrapLength = pattern.slots.length * slotSpacing + Config.virtualWidth + 6;
    const startX = direction > 0 ? -wrapLength / 2 : Config.virtualWidth + wrapLength / 2;
    const logs = [];
    pattern.slots.forEach((slot, index) => {
      if (slot === 'GAP') return;
      const spec = LOG_SPECS[slot] || LOG_SPECS.LOG_MED;
      const offset = index * slotSpacing;
      const x = direction > 0 ? startX + offset : startX - offset;
      logs.push({
        x,
        length: spec.length,
        color: Config.palette.logBody
      });
    });
    const baseSpeed = pattern.baseSpeed * speedMultiplier;
    const wrapStart = -wrapLength;
    const wrapEnd = Config.virtualWidth + wrapLength;
    return {
      logs,
      speed: baseSpeed * direction,
      wrapStart,
      wrapEnd,
      wrapSpan: wrapEnd - wrapStart
    };
  }

  function updateRiverLane(lane, dt) {
    lane.logs.forEach((log) => {
      log.x += lane.speed * dt;
      if (lane.speed > 0 && log.x > lane.wrapEnd) {
        log.x -= lane.wrapSpan;
      } else if (lane.speed < 0 && log.x < lane.wrapStart - log.length) {
        log.x += lane.wrapSpan;
      }
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
    createCoins,
    createGrassBlocks,
    createRoadPattern,
    updateRoadLane,
    createRiverPattern,
    updateRiverLane,
    initRailData,
    updateRail,
    removeCoin
  };
})();
