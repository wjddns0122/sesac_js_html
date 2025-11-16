(function () {
  const VEHICLE_SPECS = {
    CAR: { length: 1.1, color: '#ff6f61', weight: 0.6 },
    TRUCK: { length: 1.8, color: '#fdd835', weight: 0.25 },
    BUS: { length: 2.6, color: '#8d6e63', weight: 0.15 }
  };

  const LOG_SPECS = {
    LOG_SHORT: { length: 1.5 },
    LOG_MED: { length: 2.3 },
    LOG_LONG: { length: 3.1 }
  };

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
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

  function createGrassTiles({ density, corridorX, minEmpty }) {
    const solid = new Array(Config.virtualWidth).fill(false);
    for (let x = 0; x < Config.virtualWidth; x += 1) {
      if (Math.abs(x - corridorX) <= 1) continue;
      if (Math.random() < density) solid[x] = true;
    }
    let emptyTiles = solid.reduce((count, isBlocked) => count + (isBlocked ? 0 : 1), 0);
    if (emptyTiles < minEmpty) {
      for (let x = 0; x < solid.length && emptyTiles < minEmpty; x += 1) {
        if (!solid[x]) continue;
        solid[x] = false;
        emptyTiles += 1;
      }
    }
    const indexes = solid.reduce((list, isBlocked, idx) => {
      if (isBlocked) list.push(idx);
      return list;
    }, []);
    return { solid, indexes };
  }

  function generateRoadPattern(settings) {
    const slots = new Array(settings.patternLength).fill('GAP');
    const maxCars = Math.max(1, Math.floor(settings.patternLength / (settings.minGapVehicleLengths + 1)));
    const carCount = clamp(Math.round(settings.patternLength * settings.targetDensity), 1, maxCars);
    const spacing = Math.max(1, Math.floor(settings.patternLength / carCount));
    const jitter = 1;
    for (let i = 0; i < carCount; i += 1) {
      let position = Math.floor(i * spacing + randomInt(-jitter, jitter));
      position = (position + settings.patternLength) % settings.patternLength;
      let safety = 0;
      while (slots[position] !== 'GAP' && safety < settings.patternLength) {
        position = (position + 1) % settings.patternLength;
        safety += 1;
      }
      slots[position] = pickVehicleToken();
    }
    ensureGapRun(slots, 3);
    return {
      slots,
      baseSpeed: settings.baseSpeed
    };
  }

  function pickVehicleToken() {
    const roll = Math.random();
    if (roll < 0.5) return 'CAR';
    if (roll < 0.85) return 'TRUCK';
    return 'BUS';
  }

  function generateRiverPattern(settings) {
    const slots = new Array(settings.patternLength).fill('GAP');
    const maxLogs = Math.max(2, Math.floor(settings.patternLength / (settings.minGapTiles + 1)));
    const logCount = clamp(Math.round(settings.patternLength * settings.targetDensity), 2, maxLogs);
    let cursor = randomInt(0, settings.maxGapTiles);
    for (let i = 0; i < logCount; i += 1) {
      const index = Math.floor(cursor) % settings.patternLength;
      if (slots[index] === 'GAP') {
        slots[index] = pickLogToken();
      }
      cursor += settings.minGapTiles + 1 + randomInt(0, Math.max(0, settings.maxGapTiles - settings.minGapTiles));
    }
    ensureGapRun(slots, settings.minGapTiles + 1);
    return {
      slots,
      baseSpeed: settings.baseSpeed
    };
  }

  function pickLogToken() {
    const roll = Math.random();
    if (roll < 0.4) return 'LOG_LONG';
    if (roll < 0.75) return 'LOG_MED';
    return 'LOG_SHORT';
  }

  function createRoadPattern(pattern, direction) {
    const slotSpacing = Config.ROAD_SLOT_SPACING;
    const wrapLength = pattern.slots.length * slotSpacing + Config.virtualWidth + 6;
    const startX = direction > 0 ? -wrapLength / 2 : Config.virtualWidth + wrapLength / 2;
    const vehicles = [];
    pattern.slots.forEach((slot, index) => {
      if (slot === 'GAP') return;
      const spec = VEHICLE_SPECS[slot] || VEHICLE_SPECS.CAR;
      const offset = index * slotSpacing;
      const x = direction > 0 ? startX + offset : startX - offset;
      vehicles.push({ x, length: spec.length, color: spec.color });
    });
    return {
      vehicles,
      wrapStart: -wrapLength,
      wrapEnd: Config.virtualWidth + wrapLength,
      wrapSpan: wrapLength
    };
  }

  function updateRoadLane(lane, dt, speed) {
    lane.vehicles.forEach((vehicle) => {
      vehicle.x += speed * dt;
      if (speed > 0 && vehicle.x > lane.wrapEnd) {
        vehicle.x -= lane.wrapSpan;
      } else if (speed < 0 && vehicle.x < lane.wrapStart - vehicle.length) {
        vehicle.x += lane.wrapSpan;
      }
    });
  }

  function createRiverPattern(pattern, direction) {
    const slotSpacing = Config.RIVER_SLOT_SPACING;
    const wrapLength = pattern.slots.length * slotSpacing + Config.virtualWidth + 6;
    const startX = direction > 0 ? -wrapLength / 2 : Config.virtualWidth + wrapLength / 2;
    const logs = [];
    pattern.slots.forEach((slot, index) => {
      if (slot === 'GAP') return;
      const spec = LOG_SPECS[slot] || LOG_SPECS.LOG_MED;
      const offset = index * slotSpacing;
      const x = direction > 0 ? startX + offset : startX - offset;
      logs.push({ x, length: spec.length, color: Config.palette.logBody });
    });
    return {
      logs,
      wrapStart: -wrapLength,
      wrapEnd: Config.virtualWidth + wrapLength,
      wrapSpan: wrapLength
    };
  }

  function updateRiverLane(lane, dt, speed) {
    lane.logs.forEach((log) => {
      log.x += speed * dt;
      if (speed > 0 && log.x > lane.wrapEnd) {
        log.x -= lane.wrapSpan;
      } else if (speed < 0 && log.x < lane.wrapStart - log.length) {
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

  function ensureGapRun(slots, minRun) {
    let run = 0;
    let maxRun = 0;
    for (let i = 0; i < slots.length; i += 1) {
      if (slots[i] === 'GAP') {
        run += 1;
        maxRun = Math.max(maxRun, run);
      } else {
        run = 0;
      }
    }
    if (maxRun >= minRun) return;
    const start = randomInt(0, slots.length - 1);
    for (let i = 0; i < minRun; i += 1) {
      slots[(start + i) % slots.length] = 'GAP';
    }
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
    createGrassTiles,
    generateRoadPattern,
    createRoadPattern,
    updateRoadLane,
    generateRiverPattern,
    createRiverPattern,
    updateRiverLane,
    initRailData,
    updateRail,
    removeCoin
  };
})();
