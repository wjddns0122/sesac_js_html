(function () {
  const secretConfig = {
    secret_eagle_survivor: {
      condition: (state) => state.score >= 100 && state.lastDeathReason !== 'VEHICLE'
    },
    secret_coin_hoarder: {
      condition: () => StorageApi.getStats().coinsCollected >= 1000
    },
    secret_river_master: {
      condition: (state) => state.longestRiverChain >= 10
    }
  };

  function checkUnlocks(state) {
    Object.keys(secretConfig).forEach((id) => {
      if (StorageApi.getOwnedCharacters().includes(id)) return;
      const entry = secretConfig[id];
      if (entry.condition(state)) {
        const added = StorageApi.addOwnedCharacter(id);
        if (added && window.Screens) {
          Screens.showUnlockPopup(Characters.getCharacterById(id));
        }
      }
    });
  }

  window.Unlocks = { checkUnlocks };
})();
