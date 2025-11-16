(function () {
  const tweens = [];

  function tween(target, props) {
    const now = performance.now();
    const entry = {
      target,
      from: props.from || 0,
      to: props.to || 1,
      duration: props.duration || 300,
      easing: props.easing || easeOut,
      onUpdate: props.onUpdate,
      onComplete: props.onComplete,
      start: now
    };
    tweens.push(entry);
    return entry;
  }

  function update() {
    const now = performance.now();
    for (let i = tweens.length - 1; i >= 0; i -= 1) {
      const t = tweens[i];
      const progress = Math.min(1, (now - t.start) / t.duration);
      const eased = t.easing(progress);
      if (t.onUpdate) t.onUpdate(eased);
      if (progress >= 1) {
        if (t.onComplete) t.onComplete();
        tweens.splice(i, 1);
      }
    }
    requestAnimationFrame(update);
  }

  function easeOut(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  requestAnimationFrame(update);

  window.Animation = {
    tween
  };
})();
