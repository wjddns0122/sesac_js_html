(function () {
  function init(state) {
    state.lanes = [];
    state.laneLookup = {};
    state.nextLaneY = Config.startingLaneY;
    for (let i = 0; i < Config.virtualRows; i += 1) {
      addLane(state, 'GRASS');
    }
  }

  function ensure(state) {
    const needed = Config.virtualRows + Config.laneBuffer;
    while (state.lanes.length < needed) {
      addLane(state);
    }
  }

  function addLane(state, forcedType) {
    const world = Worlds.getWorldById(state.currentWorldId);
    const diff = Difficulty.getDifficultyParams(state.maxDistance || 0);
    const type = forcedType || chooseLaneType(diff, world.laneThemeWeights);
    const lane = Lanes.createLane(state.nextLaneY, type, diff, world);
    state.lanes.push(lane);
    state.laneLookup[state.nextLaneY] = lane;
    state.nextLaneY += 1;
  }

  function chooseLaneType(diff, weights) {
    const roll = Math.random();
    const combos = [
      { type: 'GRASS', weight: weights.GRASS ?? diff.grassChance },
      { type: 'ROAD', weight: weights.ROAD ?? diff.roadChance },
      { type: 'RIVER', weight: weights.RIVER ?? diff.riverChance },
      { type: 'RAIL', weight: weights.RAIL ?? diff.railChance }
    ];
    let cursor = 0;
    for (const entry of combos) {
      cursor += entry.weight;
      if (roll <= cursor) return entry.type;
    }
    return 'GRASS';
  }

  function cull(state) {
    const minY = state.cameraY - Config.laneBuffer;
    while (state.lanes.length && state.lanes[0].worldY < minY) {
      const removed = state.lanes.shift();
      delete state.laneLookup[removed.worldY];
    }
  }

  window.WorldGenerator = {
    init,
    ensure,
    cull
  };
})();
