(function () {
  function createLane(worldY, type, difficulty, theme) {
    if (type === 'GRASS') return createGrass(worldY, theme);
    if (type === 'ROAD') return createRoad(worldY, difficulty);
    if (type === 'RIVER') return createRiver(worldY, difficulty);
    if (type === 'RAIL') return createRail(worldY);
    return createGrass(worldY, theme);
  }

  function createGrass(worldY, theme) {
    const dense = Math.random() < 0.3;
    return {
      worldY,
      type: 'GRASS',
      blocks: Obstacles.createStaticObstacles(dense ? 0.6 : 0.2),
      coins: Math.random() < 0.2 ? Obstacles.createCoins('line') : Obstacles.createCoins(),
      props: pickProps(theme.props?.grass || [])
    };
  }

  function createRoad(worldY, difficulty) {
    const direction = Math.random() < 0.5 ? 1 : -1;
    const data = Obstacles.createVehicles(direction, difficulty);
    return {
      worldY,
      type: 'ROAD',
      direction,
      vehicles: data.objects,
      speed: data.speed,
      coins: Math.random() < 0.2 ? Obstacles.createCoins() : [],
      props: pickProps(['sign', 'cone', 'streetlight'])
    };
  }

  function createRiver(worldY, difficulty) {
    const direction = Math.random() < 0.5 ? 1 : -1;
    const data = Obstacles.createLogs(direction, difficulty);
    return {
      worldY,
      type: 'RIVER',
      logs: data.objects,
      speed: data.speed,
      coins: Math.random() < 0.15 ? Obstacles.createCoins() : [],
      props: pickProps(['lily', 'stone'])
    };
  }

  function createRail(worldY) {
    return {
      worldY,
      type: 'RAIL',
      data: Obstacles.initRailData(),
      coins: Math.random() < 0.1 ? Obstacles.createCoins() : [],
      props: pickProps(['gate', 'signal'])
    };
  }

  function pickProps(list) {
    if (!list || list.length === 0) return [];
    return list.filter(() => Math.random() < 0.3);
  }

  function updateLane(lane, dt) {
    if (lane.type === 'ROAD') {
      Obstacles.updateLinear(lane.vehicles, lane.speed, dt);
    } else if (lane.type === 'RIVER') {
      Obstacles.updateLinear(lane.logs, lane.speed, dt);
    } else if (lane.type === 'RAIL') {
      Obstacles.updateRail(lane.data, dt);
    }
  }

  window.Lanes = {
    createLane,
    updateLane
  };
})();
