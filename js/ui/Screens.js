(function () {
  let canvas;
  let hudScore;
  let hudCoins;
  let newBestBadge;
  let pauseBtn;
  let screens;
  let currentScreen = null;
  let isPaused = false;
  let loop;

  function init() {
    cacheDom();
    bindUI();
    Input.init();
    StorageApi.init();
    GameState.init();
    Renderer.init(canvas);
    loop = GameLoop.createGameLoop((dt) => {
      if (!isPaused) GameState.update(dt);
      Renderer.render(GameState.getState());
    });
    loop.start();
    Input.onCommand(handleCommand);
    GameState.bus.on('score', updateScore);
    GameState.bus.on('coins', updateCoins);
    GameState.bus.on('gameover', showGameOver);
    GameState.bus.on('new-best', handleNewBest);
    showScreen('menuScreen');
    refreshMenu();
    setInterval(updateGiftPanel, 60000);
  }

  function cacheDom() {
    canvas = document.getElementById('gameCanvas');
    hudScore = document.getElementById('scoreValue');
    hudCoins = document.getElementById('coinValue');
    newBestBadge = document.getElementById('newBestBadge');
    pauseBtn = document.getElementById('pauseBtn');
    screens = {
      menuScreen: document.getElementById('menuScreen'),
      gameOverScreen: document.getElementById('gameOverScreen'),
      prizeScreen: document.getElementById('prizeScreen'),
      collectionScreen: document.getElementById('collectionScreen'),
      settingsScreen: document.getElementById('settingsScreen'),
      unlockPopup: document.getElementById('unlockPopup'),
      pauseScreen: document.getElementById('pauseScreen')
    };
  }

  function bindUI() {
    document.getElementById('overlayRoot').addEventListener('click', (event) => {
      const action = event.target.getAttribute('data-action');
      if (!action) return;
      switch (action) {
        case 'play':
          hideScreen();
          isPaused = false;
          GameState.startRun();
          newBestBadge.style.display = 'none';
          newBestBadge.textContent = 'NEW RECORD!';
          break;
        case 'collection':
          showScreen('collectionScreen');
          renderCollection();
          break;
        case 'prize':
          showScreen('prizeScreen');
          updatePrizeUI();
          break;
        case 'settings':
          showScreen('settingsScreen');
          renderSettings();
          break;
        case 'menu':
        case 'collection-back':
        case 'prize-back':
        case 'settings-back':
          showScreen('menuScreen');
          refreshMenu();
          break;
        case 'retry':
          hideScreen();
          isPaused = false;
          GameState.startRun();
          newBestBadge.style.display = 'none';
          newBestBadge.textContent = 'NEW RECORD!';
          break;
        case 'gameover-prize':
          showScreen('prizeScreen');
          updatePrizeUI();
          break;
        case 'roll':
          rollPrizeMachine();
          break;
        case 'resume':
          togglePause(false);
          break;
        case 'pause-menu':
          togglePause(false);
          showScreen('menuScreen');
          refreshMenu();
          break;
        case 'unlock-close':
          hideUnlock();
          break;
        case 'gift':
          claimGift();
          break;
        default:
          break;
      }
    });
    pauseBtn.addEventListener('click', () => togglePause(!isPaused));
    document.getElementById('tabs').addEventListener('click', (event) => {
      if (event.target.tagName !== 'BUTTON') return;
      const tab = event.target.getAttribute('data-tab');
      document.querySelectorAll('#tabs button').forEach((btn) => btn.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('characterGrid').classList.toggle('hidden', tab !== 'collection');
      document.getElementById('shopGrid').classList.toggle('hidden', tab !== 'shop');
    });
  }

  function handleCommand(command) {
    if (command === 'pause') {
      togglePause(!isPaused);
      return;
    }
    if (isPaused) return;
    GameState.tryMove(command);
  }

  function handleNewBest(payload) {
    if (payload && payload.newRecord) {
      newBestBadge.style.display = 'block';
      newBestBadge.textContent = 'NEW RECORD!';
      Renderer.triggerFireworks(GameState.getState());
    }
  }

  function updateScore({ score, highScore }) {
    hudScore.textContent = score;
    document.getElementById('menuHighScore').textContent = highScore;
    document.getElementById('gameOverBest').textContent = highScore;
  }

  function updateCoins({ totalCoins }) {
    hudCoins.textContent = totalCoins;
    document.getElementById('menuCoins').textContent = totalCoins;
  }

  function showGameOver(payload) {
    document.getElementById('gameOverScore').textContent = payload.score;
    document.getElementById('gameOverCoins').textContent = payload.coins;
    document.getElementById('newHighBadge').style.display = payload.newHigh ? 'block' : 'none';
    document.getElementById('gameOverPrizeBtn').disabled = StorageApi.getCoins() < 100;
    showScreen('gameOverScreen');
    isPaused = false;
    refreshMenu();
  }

  function showScreen(id) {
    hideScreen();
    const screen = screens[id];
    if (screen) {
      screen.classList.add('active');
      currentScreen = screen;
    }
  }

  function hideScreen() {
    if (currentScreen) currentScreen.classList.remove('active');
    currentScreen = null;
  }

  function togglePause(force) {
    const desired = typeof force === 'boolean' ? force : !isPaused;
    if (desired === isPaused) return;
    if (desired) {
      if (GameState.pause()) {
        isPaused = true;
        showScreen('pauseScreen');
      }
    } else if (GameState.resume()) {
      isPaused = false;
      if (currentScreen === screens.pauseScreen) hideScreen();
    }
  }

  function renderCollection() {
    const grid = document.getElementById('characterGrid');
    const shop = document.getElementById('shopGrid');
    grid.innerHTML = '';
    shop.innerHTML = '';
    const owned = new Set(StorageApi.getOwnedCharacters());
    const selected = StorageApi.getSelectedCharacter();
    Characters.list.forEach((character) => {
      const card = document.createElement('div');
      card.className = 'character-card';
      const preview = document.createElement('div');
      preview.className = 'preview';
      preview.style.background = character.colors.body;
      card.appendChild(preview);
      const name = document.createElement('strong');
      name.textContent = owned.has(character.id) ? character.displayName : '???';
      card.appendChild(name);
      const meta = document.createElement('small');
      meta.textContent = character.category;
      card.appendChild(meta);
      if (!owned.has(character.id)) {
        card.classList.add('locked');
        if (character.unlockType === 'secret') {
          const hint = document.createElement('small');
          hint.textContent = character.secretHint || 'Secret unlock';
          card.appendChild(hint);
        }
      } else {
        card.addEventListener('click', () => {
          StorageApi.setSelectedCharacter(character.id);
          GameState.getState().player && Player.setCharacterColors(GameState.getState().player, character);
          renderCollection();
        });
      }
      if (selected === character.id) card.classList.add('selected');
      if (character.unlockType === 'coin_purchase') shop.appendChild(createShopCard(character, owned));
      else grid.appendChild(card);
    });
  }

  function createShopCard(character, owned) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.innerHTML = `<div class="preview" style="background:${character.colors.body}"></div><strong>${character.displayName}</strong><small>${character.unlockCost} 🪙</small>`;
    const btn = document.createElement('button');
    btn.textContent = owned.has(character.id) ? 'Owned' : 'Buy';
    btn.disabled = owned.has(character.id) || StorageApi.getCoins() < character.unlockCost;
    btn.addEventListener('click', () => {
      if (StorageApi.getCoins() < character.unlockCost) return;
      StorageApi.setCoins(StorageApi.getCoins() - character.unlockCost);
      StorageApi.addOwnedCharacter(character.id);
      Screens.showUnlockPopup(character);
      renderCollection();
      updateCoins({ totalCoins: StorageApi.getCoins() });
    });
    card.appendChild(btn);
    return card;
  }

  function updatePrizeUI() {
    document.getElementById('rollButton').disabled = !PrizeMachine.canRoll();
  }

  function rollPrizeMachine() {
    const result = PrizeMachine.roll();
    const output = document.getElementById('prizeResult');
    if (!result.success) {
      output.textContent = result.message;
      return;
    }
    if (result.duplicate) {
      output.textContent = `Duplicate ${result.character.displayName}! Refund ${result.reward} coins.`;
    } else {
      output.textContent = `Unlocked ${result.character.displayName}!`;
      showUnlockPopup(result.character);
    }
    updatePrizeUI();
    updateCoins({ totalCoins: StorageApi.getCoins() });
  }

  function renderSettings() {
    const settings = StorageApi.getSettings();
    document.getElementById('soundToggle').checked = settings.sound;
    document.getElementById('graphicsSelect').value = settings.graphics;
    document.getElementById('soundToggle').onchange = (event) => {
      settings.sound = event.target.checked;
      StorageApi.setSettings(settings);
    };
    document.getElementById('graphicsSelect').onchange = (event) => {
      settings.graphics = event.target.value;
      StorageApi.setSettings(settings);
    };
    const stats = StorageApi.getStats();
    document.getElementById('statsPanel').innerHTML = `Games: ${stats.games}<br>Coins Collected: ${stats.coinsCollected}<br>Best Distance: ${stats.bestDistance}<br>Characters: ${stats.unlocked}/${Characters.list.length}`;
  }

  function refreshMenu() {
    const selected = Characters.getCharacterById(StorageApi.getSelectedCharacter());
    const preview = document.getElementById('menuCharacterPreview');
    preview.style.width = '80px';
    preview.style.height = '80px';
    preview.style.margin = '0 auto 12px';
    preview.style.background = selected.colors.body;
    document.getElementById('menuHighScore').textContent = StorageApi.getHighScore();
    document.getElementById('menuCoins').textContent = StorageApi.getCoins();
    updateGiftPanel();
  }

  function updateGiftPanel() {
    const countdown = document.getElementById('giftCountdown');
    const button = document.getElementById('giftButton');
    const remain = DailyRewards.getRemaining();
    if (remain === 0) {
      button.classList.add('available');
      countdown.textContent = 'Ready!';
    } else {
      button.classList.remove('available');
      const minutes = Math.ceil(remain / 60000);
      countdown.textContent = `${minutes} min`;
    }
  }

  function claimGift() {
    const result = DailyRewards.claim();
    if (result.success) {
      updateCoins({ totalCoins: StorageApi.getCoins() });
      document.getElementById('prizeResult').textContent = `Gifted ${result.amount} coins!`;
    }
    updateGiftPanel();
  }

  function showUnlockPopup(character) {
    const panel = screens.unlockPopup;
    panel.querySelector('#unlockName').textContent = character.displayName;
    const preview = document.getElementById('unlockPreview');
    preview.style.width = '60px';
    preview.style.height = '60px';
    preview.style.margin = '0 auto 12px';
    preview.style.background = character.colors.body;
    panel.classList.add('active');
  }

  function hideUnlock() {
    screens.unlockPopup.classList.remove('active');
  }

  window.Screens = {
    init,
    showUnlockPopup
  };
})();
