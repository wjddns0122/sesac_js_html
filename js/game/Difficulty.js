(function () {
  function getStage(level) {
    if (level < 3) return 'easy';
    if (level < 7) return 'medium';
    return 'hard';
  }

  function getDifficultyParams(distance) {
    const level = Math.floor(distance / 20);
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    const roadChance = clamp(0.25 + level * 0.025, 0.2, 0.55);
    const riverChance = clamp(0.18 + level * 0.02, 0.15, 0.4);
    const railChance = clamp(0.08 + level * 0.015, 0.08, 0.2);
    const grassChance = clamp(1 - (roadChance + riverChance + railChance), 0.1, 0.45);
    const carSpeedMultiplier = 1 + level * 0.05;
    const logSpeedMultiplier = 1 + level * 0.04;
    const grassDensity = clamp(Config.NORMAL_GRASS_OBSTACLE_DENSITY + level * 0.01, Config.NORMAL_GRASS_OBSTACLE_DENSITY, 0.4);
    const stage = getStage(level);
    return {
      level,
      roadChance,
      riverChance,
      railChance,
      grassChance,
      carSpeedMultiplier,
      logSpeedMultiplier,
      grassDensity,
      roadPatterns: Config.roadPatterns[stage] || Config.roadPatterns.hard,
      riverPatterns: Config.riverPatterns[stage] || Config.riverPatterns.hard
    };
  }

  window.Difficulty = { getDifficultyParams };
})();
