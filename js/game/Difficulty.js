(function () {
  function getDifficultyParams(distance) {
    const level = Math.floor(distance / 20);
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    const roadChance = clamp(0.25 + level * 0.03, 0.2, 0.6);
    const riverChance = clamp(0.18 + level * 0.025, 0.15, 0.5);
    const railChance = clamp(0.08 + level * 0.01, 0.08, 0.25);
    const grassChance = clamp(1 - (roadChance + riverChance + railChance), 0.1, 0.5);
    const speedMultiplier = 1 + level * 0.08;
    const gapModifier = Math.min(0.7, level * 0.05);
    return { level, roadChance, riverChance, railChance, grassChance, speedMultiplier, gapModifier };
  }

  window.Difficulty = { getDifficultyParams };
})();
