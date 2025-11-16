(function () {
  const INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

  function getRemaining() {
    const last = StorageApi.getLastGiftTime();
    const now = Date.now();
    const diff = now - last;
    return Math.max(0, INTERVAL - diff);
  }

  function isAvailable() {
    return getRemaining() === 0;
  }

  function claim() {
    if (!isAvailable()) return { success: false };
    const reward = 80 + Math.floor(Math.random() * 121);
    StorageApi.addCoins(reward);
    StorageApi.setLastGiftTime(Date.now());
    return { success: true, amount: reward };
  }

  window.DailyRewards = {
    isAvailable,
    claim,
    getRemaining
  };
})();
