(function () {
  function createLane(worldY, type, options, theme) {
    if (type === 'GRASS') return createGrassLane(worldY, options, theme);
    if (type === 'ROAD') return createRoadLane(worldY, options);
    if (type === 'RIVER') return createRiverLane(worldY, options);
    if (type === 'RAIL') return createRailLane(worldY);
    return createGrassLane(worldY, options, theme);
  }

  function createGrassLane(worldY, options, theme) {
    const grass = Obstacles.createGrassTiles({
      density: options?.density ?? Config.NORMAL_GRASS_OBSTACLE_DENSITY,
      corridorX: options?.corridorX ?? Math.floor(Config.virtualWidth / 2),
      minEmpty: options?.minEmpty ?? Config.MIN_EMPTY_TILES_PER_GRASS_ROW
    });
    const lane = {
      worldY,
      type: 'GRASS',
      blocks: grass.indexes,
      solidTiles: grass.solid,
      coins: [],
      props: pickProps(theme?.props?.grass || [])
    };
    lane.coins = spawnCoinsForLane(lane);
    return lane;
  }

  function createRoadLane(worldY, options) {
    const pattern = options.pattern;
    const data = Obstacles.createRoadPattern(pattern, options.direction);
    const lane = {
      worldY,
      type: 'ROAD',
      direction: options.direction,
      baseSpeed: pattern.baseSpeed,
      vehicles: data.vehicles,
      loopLength: data.loopLength,
      extraSpace: data.extraSpace,
      solidTiles: new Array(Config.virtualWidth).fill(false),
      coins: [],
      props: pickProps(['sign', 'cone', 'streetlight'])
    };
    const roadLoop = lane.loopLength || Config.virtualWidth + 20;
    lane.patternPhase = Math.random() * roadLoop;
    Obstacles.positionRoadVehicles(lane);
    lane.coins = spawnCoinsForLane(lane);
    return lane;
  }

  function createRiverLane(worldY, options) {
    const pattern = options.pattern;
    const data = Obstacles.createRiverPattern(pattern, options.direction);
    const lane = {
      worldY,
      type: 'RIVER',
      direction: options.direction,
      baseSpeed: pattern.baseSpeed,
      logs: data.logs,
      loopLength: data.loopLength,
      extraSpace: data.extraSpace,
      solidTiles: new Array(Config.virtualWidth).fill(false),
      coins: [],
      props: pickProps(['lily', 'stone'])
    };
    const riverLoop = lane.loopLength || Config.virtualWidth + 20;
    lane.patternPhase = Math.random() * riverLoop;
    Obstacles.positionRiverLogs(lane);
    Obstacles.ensureRiverVisibility(lane);
    lane.coins = spawnCoinsForLane(lane);
    return lane;
  }

  function createRailLane(worldY) {
    const lane = {
      worldY,
      type: 'RAIL',
      data: Obstacles.initRailData(),
      solidTiles: new Array(Config.virtualWidth).fill(false),
      coins: [],
      props: pickProps(['gate', 'signal'])
    };
    lane.coins = spawnCoinsForLane(lane);
    return lane;
  }

  function pickProps(list) {
    if (!list || list.length === 0) return [];
    return list.filter(() => Math.random() < 0.3);
  }

  function updateLane(lane, dt, speedMultiplier) {
    if (lane.type === 'ROAD') {
      const speed = lane.direction * lane.baseSpeed * speedMultiplier;
      lane.currentSpeed = speed;
      Obstacles.updateRoadLane(lane, dt, Math.abs(speed));
    } else if (lane.type === 'RIVER') {
      const speed = lane.direction * lane.baseSpeed * speedMultiplier;
      lane.currentSpeed = speed;
      Obstacles.updateRiverLane(lane, dt, Math.abs(speed));
    } else if (lane.type === 'RAIL') {
      Obstacles.updateRail(lane.data, dt);
    }
  }

  function spawnCoinsForLane(lane) {
    const probability = lane.type === 'GRASS' ? 0.22 : lane.type === 'RAIL' ? 0.1 : 0;
    if (probability <= 0 || Math.random() > probability) return [];
    const raw = Obstacles.createCoins(lane.type === 'GRASS' ? 'line' : undefined);
    const filtered = raw.filter((coin) => isWalkableTile(lane, coin.x));
    if (lane.type === 'ROAD' && filtered.length) {
      return filtered.filter((coin) => !isCoinInsideVehicle(lane, coin.x));
    }
    return filtered;
  }

  function isWalkableTile(lane, x) {
    const tileX = Math.round(x);
    if (tileX < 0 || tileX >= Config.virtualWidth) return false;
    if (lane.type === 'RIVER') return false;
    if (lane.type === 'GRASS') {
      return !(lane.solidTiles && lane.solidTiles[tileX]);
    }
    return true;
  }

  function isCoinInsideVehicle(lane, x) {
    if (!lane.vehicles) return false;
    return lane.vehicles.some((vehicle) => x >= vehicle.x - 0.2 && x <= vehicle.x + vehicle.length - 0.2);
  }

  window.Lanes = {
    createLane,
    updateLane
  };
})();
