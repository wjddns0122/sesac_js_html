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

  const ROAD_PADDING = 6;
  const RIVER_PADDING = 8;

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
    const minCars = 2;
    const maxCars = Math.max(minCars, Math.floor(settings.patternLength / (settings.minGapVehicleLengths + 1)));
    const carCount = clamp(Math.round(settings.patternLength * settings.targetDensity), minCars, maxCars);
    const spacing = settings.patternLength / carCount;
    const jitter = 1;
    for (let i = 0; i < carCount; i += 1) {
      let position = Math.round(i * spacing + randomInt(-jitter, jitter));
      position = (position + settings.patternLength) % settings.patternLength;
      let safety = 0;
      while (slots[position] !== 'GAP' && safety < settings.patternLength) {
        position = (position + 1) % settings.patternLength;
        safety += 1;
      }
      slots[position] = pickVehicleToken();
    }
    ensureGapRun(slots, Math.max(3, Math.floor(spacing / 2)));
    const loopLength = Config.virtualWidth + settings.patternLength * Config.ROAD_SLOT_SPACING + ROAD_PADDING * 2;
    const vehicles = [];
    slots.forEach((slot, index) => {
      if (slot === 'GAP') return;
      const spec = VEHICLE_SPECS[slot] || VEHICLE_SPECS.CAR;
      vehicles.push({
        offset: index * Config.ROAD_SLOT_SPACING,
        length: spec.length,
        color: spec.color,
        x: 0
      });
    });
    return {
      slots,
      baseSpeed: settings.baseSpeed,
      loopLength,
      extraSpace: ROAD_PADDING,
      vehicles
    };
  }

  function pickVehicleToken() {
    const roll = Math.random();
    if (roll < 0.5) return 'CAR';
    if (roll < 0.85) return 'TRUCK';
    return 'BUS';
  }

  function generateRiverPattern(settings) {
    const loopLength = Config.virtualWidth + settings.patternLength * Config.RIVER_SLOT_SPACING + RIVER_PADDING * 2;
    const minLogs = 3;
    const baseCount = Math.max(minLogs, Math.round(settings.patternLength * settings.targetDensity));
    const desiredTravel = Math.max(settings.baseSpeed * (settings.maxWaitSeconds || 1) * 4, Config.virtualWidth * 0.75);
    const maxGapDistance = Math.min(loopLength, desiredTravel);
    const minForWait = Math.max(minLogs, Math.ceil(loopLength / maxGapDistance));
    const logCount = Math.max(baseCount, minForWait);
    const spacing = loopLength / logCount;
    const logs = [];
    for (let i = 0; i < logCount; i += 1) {
      const offset = (i * spacing + random(-spacing * 0.25, spacing * 0.25) + loopLength) % loopLength;
      const token = pickLogToken();
      const spec = LOG_SPECS[token] || LOG_SPECS.LOG_MED;
      logs.push({
        offset,
        length: spec.length,
        color: Config.palette.logBody,
        x: 0
      });
    }
    enforceLogContinuity(logs, loopLength, maxGapDistance);
    return {
      baseSpeed: settings.baseSpeed,
      loopLength,
      extraSpace: RIVER_PADDING,
      logs
    };
  }

  function pickLogToken() {
    const roll = Math.random();
    if (roll < 0.4) return 'LOG_LONG';
    if (roll < 0.75) return 'LOG_MED';
    return 'LOG_SHORT';
  }

  function createRoadPattern(pattern) {
    return {
      vehicles: pattern.vehicles,
      loopLength: pattern.loopLength,
      extraSpace: pattern.extraSpace
    };
  }

  function updateRoadLane(lane, dt, speed) {
    if (!lane.vehicles || !lane.vehicles.length) return;
    lane.patternPhase = lane.patternPhase ?? 0;
    const length = lane.loopLength || Config.virtualWidth + 20;
    const delta = Math.max(0, speed) * dt;
    lane.patternPhase = (lane.patternPhase + delta) % length;
    positionRoadVehicles(lane, length);
  }

  function positionRoadVehicles(lane, forcedLength) {
    if (!lane.vehicles || !lane.vehicles.length) return;
    const length = forcedLength || lane.loopLength || Config.virtualWidth + 20;
    const extra = lane.extraSpace ?? ROAD_PADDING;
    lane.vehicles.forEach((vehicle) => {
      const trackPos = (vehicle.offset + lane.patternPhase) % length;
      if (lane.direction > 0) {
        vehicle.x = trackPos - extra;
      } else {
        vehicle.x = Config.virtualWidth + extra - trackPos;
      }
    });
  }

  function createRiverPattern(pattern) {
    return {
      logs: pattern.logs,
      loopLength: pattern.loopLength,
      extraSpace: pattern.extraSpace
    };
  }

  function updateRiverLane(lane, dt, speed) {
    if (!lane.logs || !lane.logs.length) return;
    lane.patternPhase = lane.patternPhase ?? 0;
    const length = lane.loopLength || Config.virtualWidth + 20;
    const delta = Math.max(0, speed) * dt;
    lane.patternPhase = (lane.patternPhase + delta) % length;
    positionRiverLogs(lane, length);
  }

  function positionRiverLogs(lane, forcedLength) {
    if (!lane.logs || !lane.logs.length) return;
    const length = forcedLength || lane.loopLength || Config.virtualWidth + 20;
    const extra = lane.extraSpace ?? RIVER_PADDING;
    lane.logs.forEach((log) => {
      const trackPos = (log.offset + lane.patternPhase) % length;
      if (lane.direction > 0) {
        log.x = trackPos - extra;
      } else {
        log.x = Config.virtualWidth + extra - trackPos;
      }
    });
  }

  function ensureRiverVisibility(lane) {
    if (!lane.logs || !lane.logs.length) return;
    const maxIterations = lane.logs.length * 2;
    for (let i = 0; i < maxIterations; i += 1) {
      const visible = lane.logs.some((log) => log.x + log.length > -1 && log.x < Config.virtualWidth + 1);
      if (visible) return;
      lane.patternPhase = (lane.patternPhase + (lane.loopLength || Config.virtualWidth + 20) / lane.logs.length) % (lane.loopLength || Config.virtualWidth + 20);
      positionRiverLogs(lane);
    }
  }

  function enforceLogContinuity(logs, loopLength, maxGapDistance) {
    if (!logs.length) return;
    logs.sort((a, b) => a.offset - b.offset);
    let i = 0;
    let added = 0;
    const maxAdditional = logs.length;
    while (i < logs.length && added <= maxAdditional) {
      const current = logs[i];
      const next = logs[(i + 1) % logs.length];
      const gap = ((next.offset - current.offset) + loopLength) % loopLength;
      if (gap <= maxGapDistance) {
        i += 1;
        continue;
      }
      const insertOffset = (current.offset + Math.min(gap / 2, maxGapDistance * 0.9)) % loopLength;
      logs.splice(i + 1, 0, {
        offset: insertOffset,
        length: LOG_SPECS.LOG_MED.length,
        color: Config.palette.logBody,
        x: 0
      });
      added += 1;
    }
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
    positionRoadVehicles,
    positionRiverLogs,
    ensureRiverVisibility,
    initRailData,
    updateRail,
    removeCoin
  };
})();
