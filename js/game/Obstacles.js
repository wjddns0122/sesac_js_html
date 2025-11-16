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

  function pickWeighted(specs) {
    const entries = Object.values(specs);
    const total = entries.reduce((sum, spec) => sum + (spec.weight || 1), 0);
    let roll = Math.random() * total;
    for (const spec of entries) {
      roll -= spec.weight || 1;
      if (roll <= 0) return spec;
    }
    return entries[0];
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

  function generateRoadPattern(settings) {
    const slotsNeeded = settings.patternLength + settings.gapVariance;
    const raw = [];
    const minGapSlots = Math.max(2, Math.ceil(settings.minGapVehicleLengths * 3));
    const maxGapSlots = Math.max(minGapSlots, minGapSlots + settings.gapVariance);
    const targetVehicles = Math.max(1, Math.floor(settings.patternLength * settings.targetDensity));
    let vehiclesPlaced = 0;
    while (raw.length < slotsNeeded && vehiclesPlaced < targetVehicles) {
      raw.push(randomVehicleToken());
      vehiclesPlaced += 1;
      const gap = randomInt(minGapSlots, maxGapSlots);
      for (let i = 0; i < gap; i += 1) raw.push('GAP');
    }
    while (raw.length < slotsNeeded) raw.push('GAP');
    const slots = [];
    const offset = randomInt(0, Math.max(0, raw.length - settings.patternLength));
    for (let i = 0; i < settings.patternLength; i += 1) {
      slots.push(raw[(offset + i) % raw.length]);
    }
    ensureGapRun(slots, 3);
    return {
      slots,
      baseSpeed: settings.baseSpeed
    };
  }

  function randomVehicleToken() {
    const roll = Math.random();
    if (roll < 0.5) return 'CAR';
    if (roll < 0.8) return 'TRUCK';
    return 'BUS';
  }

  function generateRiverPattern(settings) {
    const slotsNeeded = settings.patternLength + settings.maxGapTiles;
    const raw = [];
    const targetLogs = Math.max(1, Math.floor(settings.patternLength * settings.targetDensity));
    let logsPlaced = 0;
    while (raw.length < slotsNeeded && logsPlaced < targetLogs) {
      raw.push(randomLogToken());
      logsPlaced += 1;
      const gap = randomInt(settings.minGapTiles, settings.maxGapTiles);
      for (let i = 0; i < gap; i += 1) raw.push('GAP');
    }
    while (raw.length < slotsNeeded) raw.push('GAP');
    const slots = [];
    const offset = randomInt(0, Math.max(0, raw.length - settings.patternLength));
    for (let i = 0; i < settings.patternLength; i += 1) {
      slots.push(raw[(offset + i) % raw.length]);
    }
    return {
      slots,
      baseSpeed: settings.baseSpeed
    };
  }

  function randomLogToken() {
    const roll = Math.random();
    if (roll < 0.4) return 'LOG_LONG';
    if (roll < 0.75) return 'LOG_MED';
    return 'LOG_SHORT';
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
    createGrassBlocks,
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
