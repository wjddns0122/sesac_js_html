(function () {
  const bus = EventBus.createBus();
  const state = {
    phase: 'MENU',
    player: null,
    lanes: [],
    laneLookup: {},
    nextLaneY: 0,
    cameraY: 0,
    score: 0,
    maxDistance: 0,
    runCoins: 0,
    totalCoins: 0,
    highScore: 0,
    previousHighScore: 0,
    startRow: 0,
    longestRiverChain: 0,
    currentRiverChain: 0,
    lastDeathReason: null,
    dangerLineY: -10,
    currentWorldId: 'classic',
    highScoreMarkerRow: null,
    hasBeatenHighScore: false,
    pauseStartTime: null
  };

  function init() {
    StorageApi.init();
    state.totalCoins = StorageApi.getCoins();
    state.highScore = StorageApi.getHighScore();
    preparePlayer();
    state.currentWorldId = Characters.getCharacterById(StorageApi.getSelectedCharacter()).worldId || 'classic';
    WorldGenerator.init(state);
    worldEnsure();
    state.cameraY = Config.startingLaneY;
    state.dangerLineY = state.player.targetY - Config.maxRowsBehind;
    emitMeta();
  }

  function preparePlayer() {
    state.player = Player.createPlayer();
    const character = Characters.getCharacterById(StorageApi.getSelectedCharacter());
    Player.setCharacterColors(state.player, character);
    state.currentWorldId = character.worldId || 'classic';
    state.startRow = Math.round(state.player.targetY);
    state.maxDistance = state.startRow;
    state.score = 0;
    state.runCoins = 0;
    state.longestRiverChain = 0;
    state.currentRiverChain = 0;
    state.previousHighScore = StorageApi.getHighScore();
    state.highScore = state.previousHighScore;
    state.highScoreMarkerRow = state.previousHighScore > 0 ? state.startRow + state.previousHighScore : null;
    state.hasBeatenHighScore = false;
    state.pauseStartTime = null;
    state.player.lastMoveAt = performance.now();
    state.dangerLineY = state.player.targetY - Config.maxRowsBehind;
  }

  function startRun() {
    preparePlayer();
    WorldGenerator.init(state);
    worldEnsure();
    state.cameraY = Config.startingLaneY;
    state.phase = 'PLAYING';
    StorageApi.bumpGamesPlayed();
    bus.emit('phase', 'PLAYING');
    emitMeta();
  }

  function worldEnsure() {
    WorldGenerator.ensure(state);
  }

  function update(dt) {
    if (state.phase !== 'PLAYING') return;
    worldEnsure();
    state.lanes.forEach((lane) => Lanes.updateLane(lane, dt));
    Player.applyPlatformMotion(state.player, dt);
    Player.update(state.player, dt);
    const hazard = Collision.check(state);
    if (hazard) {
      if (hazard.type === 'LOG') {
        Player.attachToPlatform(state.player, state.laneLookup[Math.round(state.player.targetY)].speed);
        state.currentRiverChain += 1;
        state.longestRiverChain = Math.max(state.longestRiverChain, state.currentRiverChain);
      } else if (hazard.type === 'DROWN') {
        endRun('DROWN');
        return;
      } else if (hazard.type === 'VEHICLE' || hazard.type === 'TRAIN' || hazard.type === 'OUT') {
        endRun(hazard.type);
        return;
      }
    } else {
      Player.detachFromPlatform(state.player);
      const lane = state.laneLookup[Math.round(state.player.targetY)];
      if (!lane || lane.type !== 'RIVER') state.currentRiverChain = 0;
    }

    const danger = Collision.checkDanger(state);
    if (danger) {
      endRun(danger.type);
      return;
    }

    collectCoins();
    updateCamera();
    moveDangerLine(dt);
    WorldGenerator.cull(state);
  }

  function moveDangerLine(dt) {
    state.dangerLineY += Config.dangerLineSpeed * dt;
  }

  function collectCoins() {
    const lane = state.laneLookup[Math.round(state.player.targetY)];
    if (lane && Obstacles.removeCoin(lane, state.player.targetX)) {
      state.runCoins += Config.coinValue;
      state.totalCoins = StorageApi.addCoins(Config.coinValue);
      bus.emit('coins', { totalCoins: state.totalCoins });
    }
  }

  function tryMove(command) {
    if (state.phase !== 'PLAYING') return;
    if (!Player.canAcceptInput(state.player)) return;
    const deltas = {
      forward: { dx: 0, dy: 1 },
      back: { dx: 0, dy: -1 },
      left: { dx: -1, dy: 0 },
      right: { dx: 1, dy: 0 }
    };
    const delta = deltas[command];
    if (!delta) return;
    const nextX = state.player.targetX + delta.dx;
    const nextY = state.player.targetY + delta.dy;
    if (nextX < 0 || nextX > Config.virtualWidth - 1) return;
    const lane = state.laneLookup[Math.round(nextY)];
    if (!lane) return;
    if (lane.type === 'GRASS' && lane.blocks && lane.blocks.includes(Math.round(nextX))) return;
    Player.commandMove(state.player, delta.dx, delta.dy);
    postMove(delta);
  }

  function postMove(delta) {
    if (delta.dy > 0 && state.player.targetY > state.maxDistance) {
      state.maxDistance = Math.round(state.player.targetY);
      state.score = state.maxDistance - state.startRow;
      const beatPrevious = state.score > state.previousHighScore;
      if (state.score > state.highScore) {
        state.highScore = state.score;
        StorageApi.setHighScore(state.highScore);
      }
      if (beatPrevious && !state.hasBeatenHighScore) {
        state.hasBeatenHighScore = true;
        bus.emit('new-best', { newRecord: true, score: state.score });
      }
      bus.emit('score', { score: state.score, highScore: state.highScore, newRecord: beatPrevious });
    }
    if (delta.dy > 0) state.dangerLineY += 0.4;
  }

  function endRun(reason) {
    state.phase = 'GAMEOVER';
    state.lastDeathReason = reason;
    state.player.isDead = true;
    state.pauseStartTime = null;
    StorageApi.updateStats({ lastReason: reason });
    Unlocks.checkUnlocks(state);
    bus.emit('gameover', {
      score: state.score,
      highScore: state.highScore,
      coins: state.runCoins,
      reason,
      newHigh: state.score > state.previousHighScore
    });
    emitMeta();
  }

  function pause() {
    if (state.phase !== 'PLAYING') return false;
    state.phase = 'PAUSED';
    state.pauseStartTime = performance.now();
    bus.emit('phase', 'PAUSED');
    return true;
  }

  function resume() {
    if (state.phase !== 'PAUSED') return false;
    const now = performance.now();
    const pausedDuration = state.pauseStartTime ? now - state.pauseStartTime : 0;
    state.phase = 'PLAYING';
    state.pauseStartTime = null;
    state.player.lastMoveAt += pausedDuration;
    bus.emit('phase', 'PLAYING');
    return true;
  }

  function updateCamera() {
    const desired = state.player.targetY - Config.cameraRowsFromBottom;
    if (desired > state.cameraY) state.cameraY = desired;
  }

  function emitMeta() {
    bus.emit('score', { score: state.score, highScore: state.highScore });
    bus.emit('coins', { totalCoins: state.totalCoins, runCoins: state.runCoins });
  }

  function getState() {
    return state;
  }

  window.GameState = {
    init,
    startRun,
    update,
    tryMove,
    pause,
    resume,
    bus,
    getState
  };
})();
