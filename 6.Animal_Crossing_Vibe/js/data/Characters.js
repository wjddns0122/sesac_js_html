(function () {
  const characters = [
    { id: 'classic_chicken', displayName: 'Classic Chicken', category: 'Classic', rarity: 'Standard', worldId: 'classic', colors: { body: '#fff5d6', accent: '#f44336', feet: '#ff9800' }, unlockType: 'default', unlockCost: 0 },
    { id: 'classic_duck', displayName: 'Sunny Duck', category: 'Classic', rarity: 'Standard', worldId: 'classic', colors: { body: '#ffeb3b', accent: '#4caf50', feet: '#ff9800' }, unlockType: 'prize_machine', unlockCost: 0 },
    { id: 'classic_bunny', displayName: 'Mint Bunny', category: 'Classic', rarity: 'Standard', worldId: 'classic', colors: { body: '#e1f5fe', accent: '#03a9f4', feet: '#f06292' }, unlockType: 'prize_machine', unlockCost: 0 },
    { id: 'farm_pig', displayName: 'Farm Pig', category: 'Farm', rarity: 'Standard', worldId: 'farm', colors: { body: '#fec6d2', accent: '#f06292', feet: '#d81b60' }, unlockType: 'prize_machine', unlockCost: 0 },
    { id: 'farm_cow', displayName: 'Patch Cow', category: 'Farm', rarity: 'Standard', worldId: 'farm', colors: { body: '#f5f5f5', accent: '#212121', feet: '#795548' }, unlockType: 'prize_machine', unlockCost: 0 },
    { id: 'farm_goat', displayName: 'Grassy Goat', category: 'Farm', rarity: 'Standard', worldId: 'farm', colors: { body: '#cfd8dc', accent: '#4e342e', feet: '#a1887f' }, unlockType: 'coin_purchase', unlockCost: 600 },
    { id: 'spooky_ghost', displayName: 'Shy Ghost', category: 'Spooky', rarity: 'Standard', worldId: 'spooky', colors: { body: '#e0f7fa', accent: '#8e24aa', feet: '#ce93d8' }, unlockType: 'prize_machine', unlockCost: 0 },
    { id: 'spooky_pumpkin', displayName: 'Lantern Pumpkin', category: 'Spooky', rarity: 'Standard', worldId: 'spooky', colors: { body: '#ff7043', accent: '#ffab40', feet: '#5d4037' }, unlockType: 'coin_purchase', unlockCost: 900 },
    { id: 'spooky_mummy', displayName: 'Wrapped Mummy', category: 'Spooky', rarity: 'Premium', worldId: 'spooky', colors: { body: '#e0e0e0', accent: '#b0bec5', feet: '#757575' }, unlockType: 'prize_machine', unlockCost: 0 },
    { id: 'city_pigeon', displayName: 'City Pigeon', category: 'City', rarity: 'Standard', worldId: 'city_night', colors: { body: '#c5cae9', accent: '#283593', feet: '#ff7043' }, unlockType: 'default', unlockCost: 0 },
    { id: 'city_robot', displayName: 'Neon Bot', category: 'City', rarity: 'Premium', worldId: 'city_night', colors: { body: '#90a4ae', accent: '#00e5ff', feet: '#546e7a' }, unlockType: 'prize_machine', unlockCost: 0 },
    { id: 'city_courier', displayName: 'Courier Kid', category: 'City', rarity: 'Standard', worldId: 'city_night', colors: { body: '#ffcc80', accent: '#f4511e', feet: '#3e2723' }, unlockType: 'coin_purchase', unlockCost: 750 },
    { id: 'ocean_crab', displayName: 'Coral Crab', category: 'Ocean', rarity: 'Standard', worldId: 'ocean', colors: { body: '#ff8a80', accent: '#ff1744', feet: '#c62828' }, unlockType: 'prize_machine', unlockCost: 0 },
    { id: 'ocean_dolphin', displayName: 'Splash Dolphin', category: 'Ocean', rarity: 'Premium', worldId: 'ocean', colors: { body: '#b3e5fc', accent: '#4fc3f7', feet: '#0288d1' }, unlockType: 'prize_machine', unlockCost: 0 },
    { id: 'ocean_turtle', displayName: 'Lazy Turtle', category: 'Ocean', rarity: 'Standard', worldId: 'ocean', colors: { body: '#aed581', accent: '#33691e', feet: '#8d6e63' }, unlockType: 'coin_purchase', unlockCost: 800 },
    { id: 'space_astronaut', displayName: 'Orbit Traveler', category: 'Space', rarity: 'Premium', worldId: 'space', colors: { body: '#eceff1', accent: '#2196f3', feet: '#37474f' }, unlockType: 'prize_machine', unlockCost: 0 },
    { id: 'space_alien', displayName: 'Mint Alien', category: 'Space', rarity: 'Premium', worldId: 'space', colors: { body: '#c5e1a5', accent: '#558b2f', feet: '#7cb342' }, unlockType: 'prize_machine', unlockCost: 0 },
    { id: 'space_bot', displayName: 'Retro Droid', category: 'Space', rarity: 'Standard', worldId: 'space', colors: { body: '#b0bec5', accent: '#ff4081', feet: '#607d8b' }, unlockType: 'coin_purchase', unlockCost: 950 },
    { id: 'secret_eagle_survivor', displayName: 'Sky Survivor', category: 'Secret', rarity: 'Secret', worldId: 'classic', colors: { body: '#ffeb3b', accent: '#37474f', feet: '#dd2c00' }, unlockType: 'secret', unlockCost: 0, secretHint: 'Reach 100 forward hops without traffic accidents.' },
    { id: 'secret_coin_hoarder', displayName: 'Coin Hoarder', category: 'Secret', rarity: 'Secret', worldId: 'classic', colors: { body: '#ffd54f', accent: '#ff6f00', feet: '#f9a825' }, unlockType: 'secret', unlockCost: 0, secretHint: 'Collect 1000 coins total.' },
    { id: 'secret_river_master', displayName: 'River Master', category: 'Secret', rarity: 'Secret', worldId: 'ocean', colors: { body: '#b2dfdb', accent: '#00695c', feet: '#004d40' }, unlockType: 'secret', unlockCost: 0, secretHint: 'Cross ten rivers in a row.' }
  ];

  function getCharacterById(id) {
    return characters.find((c) => c.id === id) || characters[0];
  }

  function getCharactersByCategory(category) {
    return characters.filter((c) => c.category === category);
  }

  function getRandomCharacterForPrizeMachine(excludeIds, rarities) {
    const pool = characters.filter(
      (c) => c.unlockType === 'prize_machine' && (!rarities || rarities.includes(c.rarity)) && !excludeIds.includes(c.id)
    );
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  window.Characters = {
    list: characters,
    getCharacterById,
    getCharactersByCategory,
    getRandomCharacterForPrizeMachine
  };
})();
