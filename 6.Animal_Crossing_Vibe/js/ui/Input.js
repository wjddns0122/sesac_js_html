(function () {
  const listeners = new Set();

  function init() {
    window.addEventListener('keydown', handleKey);
  }

  function handleKey(event) {
    const command = mapKey(event.code);
    if (!command) return;
    event.preventDefault();
    listeners.forEach((fn) => fn(command));
  }

  function mapKey(code) {
    switch (code) {
      case 'ArrowUp':
      case 'KeyW':
        return 'forward';
      case 'ArrowDown':
      case 'KeyS':
        return 'back';
      case 'ArrowLeft':
      case 'KeyA':
        return 'left';
      case 'ArrowRight':
      case 'KeyD':
        return 'right';
      case 'Escape':
        return 'pause';
      case 'Space':
      case 'Enter':
        return 'start';
      default:
        return null;
    }
  }

  function onCommand(fn) {
    listeners.add(fn);
  }

  window.Input = { init, onCommand };
})();
