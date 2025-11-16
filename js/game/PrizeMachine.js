(function () {
  const COST = 100;
  const DUPLICATE_REFUND = 20;

  function canRoll() {
    return StorageApi.getCoins() >= COST;
  }

  function roll() {
    if (!canRoll()) return { success: false, message: 'Not enough coins.' };
    StorageApi.setCoins(StorageApi.getCoins() - COST);
    const owned = StorageApi.getOwnedCharacters();
    const result = Characters.getRandomCharacterForPrizeMachine(owned, ['Standard', 'Premium']);
    if (!result) {
      StorageApi.addCoins(COST);
      return { success: false, message: 'Nothing available.' };
    }
    const isNew = StorageApi.addOwnedCharacter(result.id);
    if (!isNew) {
      StorageApi.addCoins(DUPLICATE_REFUND);
      return { success: true, duplicate: true, character: result, reward: DUPLICATE_REFUND };
    }
    return { success: true, character: result, duplicate: false };
  }

  window.PrizeMachine = {
    canRoll,
    roll,
    cost: COST
  };
})();
