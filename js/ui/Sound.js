(function () {
  const Sound = {
    play(name) {
      const settings = StorageApi.getSettings();
      if (!settings.sound) return;
      console.debug('[sound]', name);
    }
  };
  window.Sound = Sound;
})();
