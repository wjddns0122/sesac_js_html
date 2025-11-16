(function () {
  function createGameLoop(update) {
    let lastTime = 0;
    let running = false;
    let rafId = null;

    function frame(timestamp) {
      if (!running) return;
      if (!lastTime) lastTime = timestamp;
      const dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      update(Math.min(dt, 0.05));
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      lastTime = 0;
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    return { start, stop };
  }

  window.GameLoop = { createGameLoop };
})();
