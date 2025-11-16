(function () {
  function createPlayer() {
    const startY = Config.startingLaneY + 1;
    return {
      x: 4,
      y: startY,
      targetX: 4,
      targetY: startY,
      startX: 4,
      startY,
      moveTimer: 0,
      hopDuration: Config.playerHopDuration,
      attachedPlatform: null,
      isDead: false,
      lastMoveAt: performance.now(),
      colorPrimary: '#fff',
      colorAccent: '#222',
      bobPhase: 0,
      hopHeight: 0,
      squash: 0
    };
  }

  function setCharacterColors(player, character) {
    player.colorPrimary = character.colors.body;
    player.colorAccent = character.colors.accent;
  }

  function canAcceptInput(player) {
    return player.moveTimer <= 0 && !player.isDead;
  }

  function commandMove(player, dx, dy) {
    player.startX = player.x;
    player.startY = player.y;
    player.targetX += dx;
    player.targetY += dy;
    player.moveTimer = player.hopDuration;
    player.lastMoveAt = performance.now();
    player.squash = 0.5;
  }

  function update(player, dt) {
    player.bobPhase += dt;
    if (player.moveTimer > 0) {
      player.moveTimer = Math.max(0, player.moveTimer - dt);
      const t = 1 - player.moveTimer / player.hopDuration;
      player.x = player.startX + (player.targetX - player.startX) * t;
      player.y = player.startY + (player.targetY - player.startY) * t;
      player.hopHeight = Math.sin(t * Math.PI) * 0.4;
    } else {
      player.x += (player.targetX - player.x) * 0.25;
      player.y += (player.targetY - player.y) * 0.25;
      player.hopHeight = Math.sin(player.bobPhase * 3) * 0.05;
    }
    player.squash = Math.max(0, player.squash - dt * 2);
  }

  function attachToPlatform(player, velocity) {
    player.attachedPlatform = velocity;
  }

  function detachFromPlatform(player) {
    player.attachedPlatform = null;
  }

  function applyPlatformMotion(player, dt) {
    if (!player.attachedPlatform) return;
    const delta = player.attachedPlatform * dt;
    player.x += delta;
    player.targetX += delta;
    player.startX += delta;
  }

  window.Player = {
    createPlayer,
    setCharacterColors,
    canAcceptInput,
    commandMove,
    update,
    attachToPlatform,
    detachFromPlatform,
    applyPlatformMotion
  };
})();
