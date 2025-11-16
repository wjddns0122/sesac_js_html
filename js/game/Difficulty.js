(function () {
  const STAGES = {
    easy: {
      roadMinGap: Config.ROAD_MIN_GAP_VEHICLE_LENGTHS_EASY,
      roadGapVariance: Config.ROAD_GAP_VARIANCE_EASY,
      roadDensity: Config.ROAD_BASE_DENSITY_EASY,
      riverDensity: Config.RIVER_BASE_LOG_DENSITY_EASY,
      riverMaxGap: Config.RIVER_MAX_GAP_TILES_EASY
    },
    medium: {
      roadMinGap: Config.ROAD_MIN_GAP_VEHICLE_LENGTHS_MED,
      roadGapVariance: Config.ROAD_GAP_VARIANCE_MED,
      roadDensity: Config.ROAD_BASE_DENSITY_MED,
      riverDensity: Config.RIVER_BASE_LOG_DENSITY_MED,
      riverMaxGap: (Config.RIVER_MAX_GAP_TILES_EASY + Config.RIVER_MAX_GAP_TILES_HARD) / 2
    },
    hard: {
      roadMinGap: Config.ROAD_MIN_GAP_VEHICLE_LENGTHS_HARD,
      roadGapVariance: Config.ROAD_GAP_VARIANCE_HARD,
      roadDensity: Config.ROAD_BASE_DENSITY_HARD,
      riverDensity: Config.RIVER_BASE_LOG_DENSITY_HARD,
      riverMaxGap: Config.RIVER_MAX_GAP_TILES_HARD
    }
  };

  function getStage(level) {
    if (level < 3) return 'easy';
    if (level < 7) return 'medium';
    return 'hard';
  }

  function getDifficultyParams(distance) {
    const level = Math.floor(distance / 20);
    const stage = getStage(level);
    const settings = STAGES[stage];
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    const roadChance = clamp(0.25 + level * 0.02, 0.2, 0.55);
    const riverChance = clamp(0.18 + level * 0.02, 0.15, 0.4);
    const railChance = clamp(0.08 + level * 0.01, 0.08, 0.2);
    const grassChance = clamp(1 - (roadChance + riverChance + railChance), 0.1, 0.45);
    const carSpeedMultiplier = 1 + level * 0.05;
    const logSpeedMultiplier = 1 + level * 0.04;
    const grassDensity = clamp(Config.NORMAL_GRASS_OBSTACLE_DENSITY + level * 0.01, Config.NORMAL_GRASS_OBSTACLE_DENSITY, 0.38);
    const roadSettings = {
      patternLength: Config.ROAD_PATTERN_LENGTH,
      minGapVehicleLengths: settings.roadMinGap,
      gapVariance: settings.roadGapVariance,
      targetDensity: clamp(settings.roadDensity + level * 0.015, settings.roadDensity, 0.7),
      baseSpeed: Config.ROAD_BASE_SPEED + level * Config.ROAD_SPEED_PER_LEVEL
    };
    const riverSettings = {
      patternLength: Config.RIVER_PATTERN_LENGTH,
      minGapTiles: Config.RIVER_MIN_GAP_TILES,
      maxGapTiles: settings.riverMaxGap,
      targetDensity: clamp(settings.riverDensity + level * 0.01, 0.35, 0.65),
      baseSpeed: Config.RIVER_BASE_SPEED + level * Config.RIVER_SPEED_PER_LEVEL
    };
    return {
      level,
      stage,
      roadChance,
      riverChance,
      railChance,
      grassChance,
      carSpeedMultiplier,
      logSpeedMultiplier,
      grassDensity,
      roadSettings,
      riverSettings
    };
  }

  window.Difficulty = { getDifficultyParams };
})();
