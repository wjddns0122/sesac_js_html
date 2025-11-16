(function () {
  function getLane(state, worldY) {
    return state.laneLookup[Math.round(worldY)];
  }

  function check(state) {
    const player = state.player;
    const lane = getLane(state, player.targetY);
    if (!lane) return null;
    if (player.targetX < -0.4 || player.targetX > Config.virtualWidth - 0.6) return { type: 'OUT' };
    if (lane.type === 'ROAD') {
      if (lane.vehicles.some((car) => player.targetX >= car.x - 0.3 && player.targetX <= car.x + car.length - 0.3)) return { type: 'VEHICLE' };
    }
    if (lane.type === 'RIVER') {
      const log = lane.logs.find((log) => player.targetX >= log.x - 0.3 && player.targetX <= log.x + log.length - 0.7);
      if (!log) return { type: 'DROWN' };
      return { type: 'LOG', payload: log };
    }
    if (lane.type === 'RAIL') {
      if (lane.data.train && player.targetX >= lane.data.train.x - 0.3 && player.targetX <= lane.data.train.x + lane.data.train.length - 0.3) {
        return { type: 'TRAIN' };
      }
    }
    return null;
  }

  function checkDanger(state) {
    const idle = (performance.now() - state.player.lastMoveAt) / 1000;
    if (idle > Config.idleEagleSeconds) return { type: 'EAGLE' };
    if (state.player.targetY < state.dangerLineY) return { type: 'DANGER_LINE' };
    return null;
  }

  window.Collision = { check, checkDanger };
})();
