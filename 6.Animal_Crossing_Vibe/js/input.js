// js/input.js
function createInputManager() {
  const queue = [];

  function onKeyDown(e) {
    let dir = null;
    if (e.key === 'ArrowUp' || e.key === 'w') dir = 'up';
    else if (e.key === 'ArrowDown' || e.key === 's') dir = 'down';
    else if (e.key === 'ArrowLeft' || e.key === 'a') dir = 'left';
    else if (e.key === 'ArrowRight' || e.key === 'd') dir = 'right';

    if (dir) {
      queue.push(dir);
      e.preventDefault();
    }
  }

  window.addEventListener('keydown', onKeyDown);

  return {
    getNextMove() {
      return queue.shift() || null;
    }
  };
}
