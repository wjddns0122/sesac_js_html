(function () {
  function init(state) {
    state.lanes = [];
    state.laneLookup = {};
    state.nextLaneY = Config.startingLaneY;
    state.generatedLaneCount = 0;
    state.lastSafeColumn = Math.floor(Config.virtualWidth / 2);
    for (let i = 0; i < Config.virtualRows; i += 1) {
      addLane(state);
    }
  }

  function ensure(state) {
    const needed = Config.virtualRows + Config.laneBuffer;
    while (state.lanes.length < needed) {
      addLane(state);
    }
  }

  function addLane(state) {
    const world = Worlds.getWorldById(state.currentWorldId);
    const diff = Difficulty.getDifficultyParams(state.maxDistance || 0);
    const isSafeZone = state.generatedLaneCount < Config.SAFE_ZONE_GRASS_ROWS;
    const type = isSafeZone ? 'GRASS' : chooseLaneType(diff, world.laneThemeWeights);
    const laneOptions = buildLaneOptions(type, state, diff);
    const lane = Lanes.createLane(state.nextLaneY, type, laneOptions, world);
    if (state.highScoreMarkerRow !== null && lane.worldY === state.highScoreMarkerRow) {
      lane.hasBestMarker = true;
    }
    state.lanes.push(lane);
    state.laneLookup[state.nextLaneY] = lane;
    state.nextLaneY += 1;
    state.generatedLaneCount += 1;
  }

  function buildLaneOptions(type, state, diff) {
    if (type === 'GRASS') {
      const safeZone = state.generatedLaneCount < Config.SAFE_ZONE_GRASS_ROWS;
      const corridor = chooseCorridor(state.lastSafeColumn || Math.floor(Config.virtualWidth / 2));
      state.lastSafeColumn = corridor;
      return {
        safe: safeZone,
        corridorX: corridor,
        density: safeZone ? Config.SAFE_ZONE_OBSTACLE_DENSITY : diff.grassDensity,
        minEmpty: safeZone ? Config.SAFE_ZONE_MIN_EMPTY_TILES : Config.MIN_EMPTY_TILES_PER_GRASS_ROW
      };
    }
    if (type === 'ROAD') {
      return {
        pattern: Obstacles.generateRoadPattern(diff.roadSettings),
        direction: Math.random() < 0.5 ? 1 : -1,
        speedMultiplier: diff.carSpeedMultiplier
      };
    }
    if (type === 'RIVER') {
      return {
        pattern: Obstacles.generateRiverPattern(diff.riverSettings),
        direction: Math.random() < 0.5 ? 1 : -1,
        speedMultiplier: diff.logSpeedMultiplier
      };
    }
    return {};
  }

  function chooseCorridor(previous) {
    const candidates = [];
    for (let delta = -1; delta <= 1; delta += 1) {
      const value = clamp(previous + delta, 0, Config.virtualWidth - 1);
      if (!candidates.includes(value)) candidates.push(value);
    }
    return candidates[Math.floor(Math.random() * candidates.length)];
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

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  window.WorldGenerator = {
    init,
    ensure,
    cull
  };
})();
