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
    return {
      worldY,
      type: 'GRASS',
      blocks: grass.indexes,
      solidTiles: grass.solid,
      coins: Math.random() < 0.2 ? Obstacles.createCoins('line') : Obstacles.createCoins(),
      props: pickProps(theme?.props?.grass || [])
    };
  }

  function createRoadLane(worldY, options) {
    const pattern = options.pattern;
    const data = Obstacles.createRoadPattern(pattern, options.direction);
    return {
      worldY,
      type: 'ROAD',
      direction: options.direction,
      baseSpeed: pattern.baseSpeed,
      vehicles: data.vehicles,
      wrapStart: data.wrapStart,
      wrapEnd: data.wrapEnd,
      wrapSpan: data.wrapSpan,
      solidTiles: new Array(Config.virtualWidth).fill(false),
      coins: Math.random() < 0.15 ? Obstacles.createCoins() : [],
      props: pickProps(['sign', 'cone', 'streetlight'])
    };
  }

  function createRiverLane(worldY, options) {
    const pattern = options.pattern;
    const data = Obstacles.createRiverPattern(pattern, options.direction);
    return {
      worldY,
      type: 'RIVER',
      direction: options.direction,
      baseSpeed: pattern.baseSpeed,
      logs: data.logs,
      wrapStart: data.wrapStart,
      wrapEnd: data.wrapEnd,
      wrapSpan: data.wrapSpan,
      solidTiles: new Array(Config.virtualWidth).fill(false),
      coins: Math.random() < 0.12 ? Obstacles.createCoins() : [],
      props: pickProps(['lily', 'stone'])
    };
  }

  function createRailLane(worldY) {
    return {
      worldY,
      type: 'RAIL',
      data: Obstacles.initRailData(),
      solidTiles: new Array(Config.virtualWidth).fill(false),
      coins: Math.random() < 0.08 ? Obstacles.createCoins() : [],
      props: pickProps(['gate', 'signal'])
    };
  }

  function pickProps(list) {
    if (!list || list.length === 0) return [];
    return list.filter(() => Math.random() < 0.3);
  }

  function updateLane(lane, dt, speedMultiplier) {
    if (lane.type === 'ROAD') {
      const speed = lane.direction * lane.baseSpeed * speedMultiplier;
      lane.currentSpeed = speed;
      Obstacles.updateRoadLane(lane, dt, speed);
    } else if (lane.type === 'RIVER') {
      const speed = lane.direction * lane.baseSpeed * speedMultiplier;
      lane.currentSpeed = speed;
      Obstacles.updateRiverLane(lane, dt, speed);
    } else if (lane.type === 'RAIL') {
      Obstacles.updateRail(lane.data, dt);
    }
  }

  window.Lanes = {
    createLane,
    updateLane
  };
})();
