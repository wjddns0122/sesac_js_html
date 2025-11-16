(function () {
  function createLane(worldY, type, options, theme) {
    if (type === 'GRASS') return createGrassLane(worldY, options, theme);
    if (type === 'ROAD') return createRoadLane(worldY, options);
    if (type === 'RIVER') return createRiverLane(worldY, options);
    if (type === 'RAIL') return createRailLane(worldY);
    return createGrassLane(worldY, options, theme);
  }

  function createGrassLane(worldY, options, theme) {
    const blocks = Obstacles.createGrassBlocks({
      density: options?.density ?? Config.NORMAL_GRASS_OBSTACLE_DENSITY,
      corridorX: options?.corridorX ?? Math.floor(Config.virtualWidth / 2),
      minEmpty: options?.minEmpty ?? Config.MIN_EMPTY_TILES_PER_GRASS_ROW
    });
    return {
      worldY,
      type: 'GRASS',
      blocks,
      coins: Math.random() < 0.2 ? Obstacles.createCoins('line') : Obstacles.createCoins(),
      props: pickProps(theme?.props?.grass || [])
    };
  }

  function createRoadLane(worldY, options) {
    const data = Obstacles.createRoadPattern(options.pattern, options.direction, options.speedMultiplier);
    return {
      worldY,
      type: 'ROAD',
      speed: data.speed,
      vehicles: data.vehicles,
      wrapStart: data.wrapStart,
      wrapEnd: data.wrapEnd,
      wrapSpan: data.wrapSpan,
      coins: Math.random() < 0.15 ? Obstacles.createCoins() : [],
      props: pickProps(['sign', 'cone', 'streetlight'])
    };
  }

  function createRiverLane(worldY, options) {
    const data = Obstacles.createRiverPattern(options.pattern, options.direction, options.speedMultiplier);
    return {
      worldY,
      type: 'RIVER',
      speed: data.speed,
      logs: data.logs,
      wrapStart: data.wrapStart,
      wrapEnd: data.wrapEnd,
      wrapSpan: data.wrapSpan,
      coins: Math.random() < 0.12 ? Obstacles.createCoins() : [],
      props: pickProps(['lily', 'stone'])
    };
  }

  function createRailLane(worldY) {
    return {
      worldY,
      type: 'RAIL',
      data: Obstacles.initRailData(),
      coins: Math.random() < 0.08 ? Obstacles.createCoins() : [],
      props: pickProps(['gate', 'signal'])
    };
  }

  function pickProps(list) {
    if (!list || list.length === 0) return [];
    return list.filter(() => Math.random() < 0.3);
  }

  function updateLane(lane, dt) {
    if (lane.type === 'ROAD') {
      Obstacles.updateRoadLane(lane, dt);
    } else if (lane.type === 'RIVER') {
      Obstacles.updateRiverLane(lane, dt);
    } else if (lane.type === 'RAIL') {
      Obstacles.updateRail(lane.data, dt);
    }
  }

  window.Lanes = {
    createLane,
    updateLane
  };
})();
