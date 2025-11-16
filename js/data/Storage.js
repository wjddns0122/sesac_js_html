(function () {
  const KEYS = {
    coins: 'bh_coins',
    highScore: 'bh_highScore',
    ownedCharacters: 'bh_ownedCharacters',
    selectedCharacter: 'bh_selectedCharacter',
    stats: 'bh_stats',
    settings: 'bh_settings',
    lastGift: 'bh_lastGift'
  };

  function init() {
    if (!localStorage.getItem(KEYS.coins)) localStorage.setItem(KEYS.coins, '0');
    if (!localStorage.getItem(KEYS.highScore)) localStorage.setItem(KEYS.highScore, '0');
    if (!localStorage.getItem(KEYS.ownedCharacters)) write(KEYS.ownedCharacters, ['classic_chicken', 'city_pigeon']);
    if (!localStorage.getItem(KEYS.selectedCharacter)) localStorage.setItem(KEYS.selectedCharacter, 'classic_chicken');
    if (!localStorage.getItem(KEYS.stats)) write(KEYS.stats, { games: 0, coinsCollected: 0, bestDistance: 0, unlocked: 2 });
    if (!localStorage.getItem(KEYS.settings)) write(KEYS.settings, { sound: true, graphics: 'high' });
    if (!localStorage.getItem(KEYS.lastGift)) localStorage.setItem(KEYS.lastGift, '0');
  }

  function readNumber(key, fallback = 0) {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) ? value : fallback;
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  const StorageApi = {
    init,
    getCoins: () => readNumber(KEYS.coins, 0),
    setCoins: (val) => localStorage.setItem(KEYS.coins, String(Math.max(0, Math.floor(val)))),
    addCoins(amount) {
      const next = this.getCoins() + amount;
      this.setCoins(next);
      const stats = this.getStats();
      stats.coinsCollected += Math.max(0, amount);
      write(KEYS.stats, stats);
      return next;
    },
    getHighScore: () => readNumber(KEYS.highScore, 0),
    setHighScore(score) {
      localStorage.setItem(KEYS.highScore, String(Math.max(score, 0)));
      const stats = this.getStats();
      stats.bestDistance = Math.max(stats.bestDistance, score);
      write(KEYS.stats, stats);
    },
    getOwnedCharacters: () => read(KEYS.ownedCharacters, ['classic_chicken']),
    setOwnedCharacters(list) {
      write(KEYS.ownedCharacters, Array.from(new Set(list)));
      const stats = this.getStats();
      stats.unlocked = list.length;
      write(KEYS.stats, stats);
    },
    addOwnedCharacter(id) {
      const owned = new Set(this.getOwnedCharacters());
      if (!owned.has(id)) {
        owned.add(id);
        this.setOwnedCharacters(Array.from(owned));
        return true;
      }
      return false;
    },
    getSelectedCharacter: () => localStorage.getItem(KEYS.selectedCharacter) || 'classic_chicken',
    setSelectedCharacter(id) {
      localStorage.setItem(KEYS.selectedCharacter, id);
    },
    getStats: () => read(KEYS.stats, { games: 0, coinsCollected: 0, bestDistance: 0, unlocked: 0 }),
    updateStats(changes) {
      const stats = this.getStats();
      Object.assign(stats, changes);
      write(KEYS.stats, stats);
    },
    bumpGamesPlayed() {
      const stats = this.getStats();
      stats.games += 1;
      write(KEYS.stats, stats);
    },
    getSettings: () => read(KEYS.settings, { sound: true, graphics: 'high' }),
    setSettings(settings) {
      write(KEYS.settings, settings);
    },
    getLastGiftTime: () => readNumber(KEYS.lastGift, 0),
    setLastGiftTime(ts) {
      localStorage.setItem(KEYS.lastGift, String(ts));
    }
  };

  window.StorageApi = StorageApi;
})();
