(function () {
  function createBus() {
    const listeners = {};

    function on(event, handler) {
      if (!listeners[event]) listeners[event] = new Set();
      listeners[event].add(handler);
      return () => off(event, handler);
    }

    function off(event, handler) {
      if (!listeners[event]) return;
      listeners[event].delete(handler);
    }

    function emit(event, payload) {
      if (!listeners[event]) return;
      listeners[event].forEach((handler) => handler(payload));
    }

    return { on, off, emit };
  }

  window.EventBus = { createBus };
})();
