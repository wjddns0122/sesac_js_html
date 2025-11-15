const STORAGE_KEY = "crossingFriendsSaveV1";
const GRID_WIDTH = 11;
const TILE_SIZE = 64;
const INITIAL_ROWS = 28;
const CAMERA_DRIFT = 12;
const MOVE_SPEED = 6.2;
const IDLE_LIMIT = 10000;
const IDLE_WARNING = 6000;

const TYPE_WEIGHTS = [
    { type: "forest", weight: 0.34 },
    { type: "road", weight: 0.26 },
    { type: "pond", weight: 0.22 },
    { type: "rail", weight: 0.18 }
];

const MOVEMENT_SPEEDS = {
    car: randomRange(3.6, 4.2),
    truck: randomRange(4.5, 5.1),
    log: randomRange(1.2, 1.5),
    train: randomRange(8, 10.5)
};

const I18N = {
    en: {
        title: "Crossing Friends",
        tagline: "Lead your voxel animal crew through endless forests, roads, ponds, and rails.",
        voxelBadge: "Voxel Animal Quest",
        characterSelect: "Character Select",
        settings: "Settings",
        tapToStart: "Tap anywhere to start",
        gameOver: "Game Over",
        playAgain: "Play Again",
        score: "Score",
        best: "Best",
        coins: "Coins",
        character: "Character",
        helper: "Move with WASD or arrows, grab forest coins, and keep friends alive.",
        language: "Language",
        audio: "Audio",
        shadows: "Shadow Effects",
        idleWarning: "Keep moving! An eagle is scouting...",
        characterGallery: "Character Gallery",
        settingsPanel: "Settings",
        owned: "Owned",
        equip: "Equip",
        equipped: "Equipped",
        buyFor: "Buy for {cost}",
        notEnoughCoins: "Not enough coins for this buddy.",
        purchaseComplete: "New friend unlocked!",
        newBest: "New personal best! {score} points!",
        pbOnPath: "PB {score}",
        treeBlock: "Trees block this tile.",
        coinGain: "+{amount} coin",
        death_road: "A rogue car clipped you.",
        death_truck: "A freight truck ran you over.",
        death_train: "The bullet train caught you.",
        death_water: "You slipped off the log.",
        death_idle: "An eagle carried you away!",
        death_edge: "You fell off the path.",
        death_unknown: "Adventure paused.",
        characterBadge: "Animal crew",
        shadowsOff: "Shadow effects disabled.",
        eagleReady: "The eagle is swooping in!",
        buy: "Buy",
        characterActive: "Current",
        tap: "Tap",
        pressKey: "Press any key to start",
        pause: "Pause",
        resume: "Resume",
        paused: "Game paused",
        newBestRun: "New run record! {score}"
    },
    ko: {
        title: "Crossing Friends",
        tagline: "보xel 동물 친구들과 숲·도로·연못·철길을 끝없이 돌파하세요.",
        voxelBadge: "복셀 어드벤처",
        characterSelect: "캐릭터 선택",
        settings: "설정",
        tapToStart: "화면을 터치하면 곧바로 시작",
        gameOver: "게임 종료",
        playAgain: "다시 도전",
        score: "점수",
        best: "최고",
        coins: "코인",
        character: "캐릭터",
        helper: "방향키로 이동하고 숲 속 코인을 모아 친구를 해금하세요.",
        language: "언어",
        audio: "오디오",
        shadows: "그림자 효과",
        idleWarning: "멈추지 마세요! 독수리가 노립니다...",
        characterGallery: "캐릭터 갤러리",
        settingsPanel: "설정",
        owned: "보유 중",
        equip: "선택",
        equipped: "사용 중",
        buyFor: "{cost}코인 구매",
        notEnoughCoins: "코인이 부족합니다.",
        purchaseComplete: "새 친구를 영입했어요!",
        newBest: "신기록 달성! {score}점!",
        pbOnPath: "개인 최고 {score}",
        treeBlock: "여기는 나무가 가로막고 있어요.",
        coinGain: "코인 +{amount}",
        death_road: "차량에 부딪혔어요.",
        death_truck: "트럭에 치였습니다.",
        death_train: "열차가 통과하면서 맞았어요.",
        death_water: "통나무에서 떨어졌어요.",
        death_idle: "독수리가 당신을 낚아갔어요!",
        death_edge: "길 밖으로 떨어졌어요.",
        death_unknown: "모험이 잠시 멈췄습니다.",
        characterBadge: "동물 친구들",
        shadowsOff: "그림자 효과를 끄는 중입니다.",
        eagleReady: "독수리가 가까워졌어요!",
        buy: "구매",
        characterActive: "현재",
        tap: "탭",
        pressKey: "아무 키나 눌러 시작",
        pause: "일시정지",
        resume: "계속하기",
        paused: "게임이 일시정지되었습니다.",
        newBestRun: "새 기록! {score}점"
    }
};

const CHARACTERS = [
    {
        id: "fox",
        price: 0,
        names: { en: "Fox Scout", ko: "여우 정찰병" },
        colors: { primary: "#f39c12", secondary: "#f7c26a", accent: "#9e3d00" }
    },
    {
        id: "panda",
        price: 50,
        names: { en: "Pond Panda", ko: "연못 팬더" },
        colors: { primary: "#fdfdfd", secondary: "#2f2f2f", accent: "#8c8c8c" }
    },
    {
        id: "koala",
        price: 80,
        names: { en: "Koala Rider", ko: "코알라 라이더" },
        colors: { primary: "#b2bec3", secondary: "#636e72", accent: "#2d3436" }
    },
    {
        id: "penguin",
        price: 120,
        names: { en: "Arctic Penguin", ko: "펭귄 탐험가" },
        colors: { primary: "#1e3799", secondary: "#4a69bd", accent: "#f7f1e3" }
    }
];

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const dom = {
    scoreValue: document.getElementById("scoreValue"),
    bestValue: document.getElementById("bestValue"),
    coinValue: document.getElementById("coinValue"),
    selectedCharacter: document.getElementById("selectedCharacter"),
    startScreen: document.getElementById("startScreen"),
    deathScreen: document.getElementById("deathScreen"),
    deathReason: document.getElementById("deathReason"),
    finalScore: document.getElementById("finalScore"),
    restartButton: document.getElementById("restartButton"),
    startBest: document.getElementById("startBest"),
    startCoins: document.getElementById("startCoins"),
    idleWarning: document.getElementById("idleWarning"),
    fireworks: document.getElementById("fireworksLayer"),
    helper: document.querySelector(".helper-text"),
    characterModal: document.getElementById("characterModal"),
    settingsModal: document.getElementById("settingsModal"),
    characterList: document.getElementById("characterList"),
    languageSelect: document.getElementById("languageSelect"),
    audioToggle: document.getElementById("audioToggle"),
    shadowToggle: document.getElementById("shadowToggle"),
    pauseButton: document.getElementById("pauseButton")
};

const state = {
    save: null,
    language: "ko",
    audio: true,
    shadows: true,
    coins: 0,
    bestScore: 0,
    bestRow: 0,
    score: 0,
    selectedCharacter: "fox"
};

let rows = [];
let rowMap = new Map();
let highestRow = 0;
let player;
let friendClones = [];
let pathHistory = [];
let floatingTexts = [];
let helperTimer = null;
let cameraY = 0;
let lastTimestamp = 0;
let gameRunning = false;
let eagleSounded = false;
let paused = false;
let runFireworksShown = false;
let pendingBestScore = null;
let pendingBestRow = null;

let sound;

function init() {
    loadSave();
    setupUI();
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    resetWorld();
    updateHUD();
    updateStartStats();
    updateI18n();
    announce(t("helper"));
    requestAnimationFrame(gameLoop);
}

function loadSave() {
    const defaultSave = {
        coins: 0,
        bestScore: 0,
        bestRow: 0,
        selectedCharacter: "fox",
        characters: CHARACTERS.reduce((acc, char, index) => {
            acc[char.id] = { owned: index === 0 };
            return acc;
        }, {}),
        settings: {
            language: "ko",
            audio: true,
            shadows: true
        }
    };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            defaultSave.coins = parsed.coins ?? defaultSave.coins;
            defaultSave.bestScore = parsed.bestScore ?? defaultSave.bestScore;
            defaultSave.bestRow = parsed.bestRow ?? defaultSave.bestRow;
            defaultSave.selectedCharacter = parsed.selectedCharacter ?? defaultSave.selectedCharacter;
            defaultSave.settings = { ...defaultSave.settings, ...parsed.settings };
            defaultSave.characters = { ...defaultSave.characters, ...parsed.characters };
        }
    } catch {
        // ignore invalid data
    }
    state.save = defaultSave;
    state.coins = defaultSave.coins;
    state.bestScore = defaultSave.bestScore;
    state.bestRow = defaultSave.bestRow || 0;
    state.selectedCharacter = defaultSave.selectedCharacter;
    state.language = defaultSave.settings.language || "ko";
    state.audio = Boolean(defaultSave.settings.audio);
    state.shadows = Boolean(defaultSave.settings.shadows);
    document.body.classList.toggle("shadows-on", state.shadows);
    sound.setEnabled(state.audio);
}

function persistSave() {
    const payload = {
        coins: state.coins,
        bestScore: state.bestScore,
        bestRow: state.bestRow,
        selectedCharacter: state.selectedCharacter,
        settings: {
            language: state.language,
            audio: state.audio,
            shadows: state.shadows
        },
        characters: state.save.characters
    };
    state.save = payload;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function setupUI() {
    document.getElementById("openCharacters").addEventListener("click", evt => {
        evt.stopPropagation();
        openCharacterModal();
    });
    document.getElementById("openSettings").addEventListener("click", evt => {
        evt.stopPropagation();
        openSettingsModal();
    });
    document.getElementById("openCharactersFooter").addEventListener("click", openCharacterModal);
    document.getElementById("openSettingsFooter").addEventListener("click", openSettingsModal);

    dom.startScreen.addEventListener("click", startGame);
    dom.restartButton.addEventListener("click", () => {
        dom.deathScreen.classList.add("hidden");
        startGame();
    });

    dom.languageSelect.value = state.language;
    dom.audioToggle.checked = state.audio;
    dom.shadowToggle.checked = state.shadows;

    dom.languageSelect.addEventListener("change", () => {
        state.language = dom.languageSelect.value;
        document.documentElement.lang = state.language;
        updateI18n();
        updateCharacterList();
        updateSelectedCharacterDisplay();
        persistSave();
    });

    dom.audioToggle.addEventListener("change", () => {
        state.audio = dom.audioToggle.checked;
        sound.setEnabled(state.audio);
        persistSave();
    });

    dom.shadowToggle.addEventListener("change", () => {
        state.shadows = dom.shadowToggle.checked;
        document.body.classList.toggle("shadows-on", state.shadows);
        if (!state.shadows) {
            announce(t("shadowsOff"));
        }
        persistSave();
    });

    dom.pauseButton.addEventListener("click", () => togglePause());

    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", evt => {
            if (evt.target === modal) {
                closeModal(modal);
            }
        });
        modal.querySelectorAll("[data-close]").forEach(btn => {
            btn.addEventListener("click", () => closeModal(modal));
        });
    });

    window.addEventListener("keydown", evt => {
        if (evt.key === "Escape") {
            closeModal(dom.characterModal);
            closeModal(dom.settingsModal);
            return;
        }
        const canStart = dom.startScreen.classList.contains("visible") &&
            dom.characterModal.classList.contains("hidden") &&
            dom.settingsModal.classList.contains("hidden") &&
            !gameRunning;
        if (canStart) {
            evt.preventDefault();
            startGame();
            return;
        }
        if (evt.code === "Space" && gameRunning) {
            evt.preventDefault();
            togglePause();
            return;
        }
        handleKey(evt);
    });

    document.querySelectorAll("#touchPad button").forEach(btn => {
        btn.addEventListener("pointerdown", () => {
            handleDirection(btn.dataset.direction);
        });
    });

    updateCharacterList();
    updateSelectedCharacterDisplay();
    dom.pauseButton.disabled = true;
}

function startGame() {
    closeModal(dom.characterModal);
    closeModal(dom.settingsModal);
    dom.startScreen.classList.add("hidden");
    dom.startScreen.classList.remove("visible");
    dom.deathScreen.classList.add("hidden");
    paused = false;
    pendingBestScore = null;
    pendingBestRow = null;
    runFireworksShown = false;
    dom.pauseButton.disabled = false;
    dom.pauseButton.textContent = t("pause");
    dom.idleWarning.classList.add("hidden");
    resetWorld();
    gameRunning = true;
    eagleSounded = false;
    player.lastMoveTime = performance.now();
}

function resetWorld() {
    pendingBestScore = null;
    pendingBestRow = null;
    runFireworksShown = false;
    paused = false;
    dom.idleWarning.classList.add("hidden");
    rows = [];
    rowMap.clear();
    highestRow = -1;
    for (let i = 0; i < INITIAL_ROWS; i++) {
        addRow(createRow(i));
    }
    highestRow = INITIAL_ROWS - 1;
    state.score = 0;
    floatingTexts = [];
    player = createPlayer();
    friendClones = createClones();
    pathHistory = [{ x: player.gridX, y: player.gridY }];
    cameraY = player.gridY * TILE_SIZE - canvas.height * 0.35;
    updateScoreDisplays();
}

function createPlayer() {
    const startRow = 3;
    const character = getCharacterById(state.selectedCharacter);
    const startX = Math.floor(GRID_WIDTH / 2);
    return {
        gridX: startX,
        gridY: startRow,
        startX,
        startY: startRow,
        targetX: startX,
        targetY: startRow,
        visualX: startX,
        visualY: startRow,
        moveProgress: 0,
        moving: false,
        onLog: null,
        lastMoveTime: performance.now(),
        eagleTimer: 0,
        eagleTriggered: false,
        appearance: character.colors,
        alive: true,
        deathAnimation: null
    };
}

function createClones() {
    const offsets = [2, 4];
    return offsets.map((lag, index) => ({
        id: `clone-${index}`,
        lag,
        visualX: player.gridX,
        visualY: Math.max(0, player.gridY - (index + 1)),
        target: null,
        startX: player.gridX,
        startY: player.gridY,
        progress: 0,
        color: index === 0 ? "#ffd166" : "#9bf6ff"
    }));
}

function createRow(index) {
    let type = "forest";
    if (index < 4) {
        type = "start";
    } else {
        const pick = Math.random() * TYPE_WEIGHTS.reduce((sum, entry) => sum + entry.weight, 0);
        let cumulative = 0;
        for (const entry of TYPE_WEIGHTS) {
            cumulative += entry.weight;
            if (pick <= cumulative) {
                type = entry.type;
                break;
            }
        }
    }
    const row = { index, type };
    if (type === "forest" || type === "start") {
        const density = type === "forest" ? randomRange(0.2, 0.45) : 0.1;
        const trees = new Set();
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (Math.random() < density) {
                trees.add(x);
            }
        }
        while (trees.size > GRID_WIDTH - 2) {
            trees.delete(randomChoice([...trees]));
        }
        row.trees = trees;
        row.coins = [];
        if (type === "forest") {
            const open = [];
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (!trees.has(x)) open.push(x);
            }
            const coinCount = Math.min(open.length, Math.max(1, Math.round(Math.random() * 2)));
            shuffle(open);
            for (let i = 0; i < coinCount; i++) {
                row.coins.push({ x: open[i], collected: false });
            }
        }
    } else if (type === "road") {
        row.direction = Math.random() > 0.5 ? 1 : -1;
        row.spawnTimer = randomRange(0.8, 1.5);
        row.vehicles = [];
    } else if (type === "pond") {
        row.direction = Math.random() > 0.5 ? 1 : -1;
        row.logs = [];
        row.wave = Math.random() * Math.PI * 2;
        row.currentSpeed = randomRange(0.8, 1.3);
        const logCount = Math.floor(randomRange(2, 4));
        for (let i = 0; i < logCount; i++) {
            const length = randomRange(1.8, 3);
            const x = randomRange(-i, GRID_WIDTH);
            row.logs.push({ x, length, speed: MOVEMENT_SPEEDS.log * row.direction * row.currentSpeed });
        }
    } else if (type === "rail") {
        row.direction = Math.random() > 0.5 ? 1 : -1;
        row.warningState = "idle";
        row.warningTimer = randomRange(2.5, 4.8);
        row.train = null;
        row.flash = 0;
    }
    return row;
}

function addRow(row) {
    rows.push(row);
    rowMap.set(row.index, row);
}

function ensureFutureRows(limitIndex) {
    while (highestRow < limitIndex) {
        highestRow += 1;
        addRow(createRow(highestRow));
    }
}

function trimRows(minIndex) {
    while (rows.length && rows[0].index < minIndex) {
        rowMap.delete(rows[0].index);
        rows.shift();
    }
}

function getRow(index) {
    return rowMap.get(index);
}

function handleKey(evt) {
    const map = {
        ArrowUp: "up",
        KeyW: "up",
        ArrowDown: "down",
        KeyS: "down",
        ArrowLeft: "left",
        KeyA: "left",
        ArrowRight: "right",
        KeyD: "right"
    };
    const dir = map[evt.code];
    if (dir) {
        evt.preventDefault();
        handleDirection(dir);
    }
}

function handleDirection(direction) {
    const delta = {
        up: { x: 0, y: 1 },
        down: { x: 0, y: -1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 }
    }[direction];
    if (!delta) return;
    attemptMove(delta.x, delta.y);
}

function togglePause() {
    if (!gameRunning || !player || !player.alive) return;
    paused = !paused;
    dom.pauseButton.textContent = paused ? t("resume") : t("pause");
    if (paused) {
        announce(t("paused"));
    } else {
        player.lastMoveTime = performance.now();
        dom.idleWarning.classList.add("hidden");
        announce(t("helper"));
    }
}

function attemptMove(dx, dy) {
    if (!gameRunning || paused || player.moving || !player.alive) return;
    const targetX = clamp(player.gridX + dx, 0, GRID_WIDTH - 1);
    const targetY = Math.max(0, player.gridY + dy);
    if (targetX === player.gridX && targetY === player.gridY) return;
    const destRow = getRow(targetY);
    if (!destRow) return;
    if ((destRow.type === "forest" || destRow.type === "start") && destRow.trees?.has(targetX)) {
        announce(t("treeBlock"));
        return;
    }
    const forwardMove = dy > 0;

    player.startX = player.gridX;
    player.startY = player.gridY;
    player.targetX = targetX;
    player.targetY = targetY;
    player.moveProgress = 0;
    player.moving = true;
    player.onLog = null;
    player.eagleTriggered = false;
    player.eagleTimer = 0;
    eagleSounded = false;
    player.lastMoveTime = performance.now();
    dom.idleWarning.classList.add("hidden");

    if (forwardMove) {
        handleForwardAdvance(targetY);
    }
    pathHistory.push({ x: targetX, y: targetY });
    if (pathHistory.length > 300) pathHistory.shift();
    sound.play(300, 0.04);
}

function updateScoreDisplays() {
    dom.scoreValue.textContent = state.score;
    dom.bestValue.textContent = state.bestScore;
    dom.coinValue.textContent = state.coins;
    updateStartStats();
}

function updateStartStats() {
    dom.startBest.textContent = state.bestScore;
    dom.startCoins.textContent = state.coins;
}

function updateSelectedCharacterDisplay() {
    const char = getCharacterById(state.selectedCharacter);
    dom.selectedCharacter.textContent = char.names[state.language];
}

function handleForwardAdvance(rowIndex) {
    state.score += 1;
    updateScoreDisplays();
    if (state.score > state.bestScore) {
        if (!runFireworksShown) {
            addFloatingText(t("pbOnPath", { score: state.score }), player.targetX, rowIndex + 0.3);
            spawnFireworks();
            announce(t("newBestRun", { score: state.score }));
            sound.play(620, 0.18);
            runFireworksShown = true;
        }
        pendingBestScore = state.score;
        pendingBestRow = rowIndex;
    }
}

function finalizeRunBest() {
    if (pendingBestScore && pendingBestScore > state.bestScore) {
        state.bestScore = pendingBestScore;
        state.bestRow = pendingBestRow ?? state.bestRow;
    }
    pendingBestScore = null;
    pendingBestRow = null;
    runFireworksShown = false;
}

function updateHUD() {
    updateScoreDisplays();
    dom.coinValue.textContent = state.coins;
    updateSelectedCharacterDisplay();
}

function openCharacterModal() {
    updateCharacterList();
    dom.characterModal.classList.remove("hidden");
}

function openSettingsModal() {
    dom.settingsModal.classList.remove("hidden");
}

function closeModal(modal) {
    modal.classList.add("hidden");
}

function updateCharacterList() {
    dom.characterList.innerHTML = "";
    CHARACTERS.forEach(char => {
        const owned = state.save.characters[char.id]?.owned;
        const card = document.createElement("article");
        card.className = "character-card";
        if (owned) card.classList.add("owned");

        const preview = document.createElement("div");
        preview.className = "voxel-preview";
        preview.style.background = `linear-gradient(135deg, ${char.colors.primary}, ${char.colors.secondary})`;

        const name = document.createElement("div");
        name.className = "name";
        name.textContent = char.names[state.language];

        const price = document.createElement("div");
        price.className = "price";
        price.textContent = owned ? t("owned") : t("buyFor", { cost: char.price });

        const button = document.createElement("button");
        if (!owned) {
            button.textContent = t("buy");
        } else if (state.selectedCharacter === char.id) {
            button.textContent = t("equipped");
            button.disabled = true;
        } else {
            button.textContent = t("equip");
        }

        button.addEventListener("click", () => handleCharacterAction(char));

        card.appendChild(preview);
        card.appendChild(name);
        card.appendChild(price);
        card.appendChild(button);
        dom.characterList.appendChild(card);
    });
}

function handleCharacterAction(char) {
    const owned = state.save.characters[char.id]?.owned;
    if (!owned) {
        if (state.coins < char.price) {
            announce(t("notEnoughCoins"));
            sound.play(140, 0.1);
            return;
        }
        state.coins -= char.price;
        state.save.characters[char.id] = { owned: true };
        announce(t("purchaseComplete"));
        sound.play(480, 0.12);
    }
    state.selectedCharacter = char.id;
    state.save.selectedCharacter = char.id;
    if (player) {
        player.appearance = char.colors;
    }
    updateCharacterList();
    updateSelectedCharacterDisplay();
    updateScoreDisplays();
    persistSave();
}

function collectCoin(row, x) {
    const coin = row.coins.find(c => !c.collected && c.x === x);
    if (!coin) return;
    coin.collected = true;
    state.coins += 1;
    updateScoreDisplays();
    addFloatingText(t("coinGain", { amount: 1 }), player.gridX, player.gridY + 0.4);
    sound.play(520, 0.08);
    persistSave();
}

function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.12);
    lastTimestamp = timestamp;

    const active = gameRunning && player.alive && !paused;
    if (active) {
        ensureFutureRows(player.gridY + 30);
        trimRows(player.gridY - 20);
        updateWorld(delta);
        updatePlayer(delta);
        updateClones(delta);
        updateFloatingTexts(delta);
        handleIdleState(timestamp, delta);
        updateCamera(delta);
    } else if (!paused) {
        updateFloatingTexts(delta);
    }

    if (!paused) {
        updateDeathAnimation(delta);
    }

    render();
    requestAnimationFrame(gameLoop);
}

function updateWorld(dt) {
    for (const row of rows) {
        if (row.type === "road") {
            row.spawnTimer -= dt;
            row.vehicles.forEach(vehicle => {
                vehicle.x += vehicle.speed * dt;
            });
            row.vehicles = row.vehicles.filter(vehicle => vehicle.x < GRID_WIDTH + 5 && vehicle.x + vehicle.length > -5);
            if (row.spawnTimer <= 0) {
                spawnVehicle(row);
                row.spawnTimer = randomRange(1, 1.8);
            }
        } else if (row.type === "pond") {
            row.wave += dt * 0.6;
            row.logs.forEach(log => {
                log.x += log.speed * dt;
                if (row.direction === 1 && log.x > GRID_WIDTH + 3) {
                    log.x = -log.length - randomRange(0, 2);
                } else if (row.direction === -1 && log.x + log.length < -3) {
                    log.x = GRID_WIDTH + randomRange(0, 2);
                }
            });
        } else if (row.type === "rail") {
            row.flash += dt;
            if (row.warningState === "idle") {
                row.warningTimer -= dt;
                if (row.warningTimer <= 0) {
                    row.warningState = "warning1";
                    row.warningTimer = randomRange(0.8, 1.3);
                }
            } else if (row.warningState === "warning1") {
                row.warningTimer -= dt;
                if (row.warningTimer <= 0) {
                    row.warningState = "warning2";
                    row.warningTimer = 0.5;
                }
            } else if (row.warningState === "warning2") {
                row.warningTimer -= dt;
                if (row.warningTimer <= 0) {
                    row.warningState = "train";
                    row.train = createTrain(row);
                }
            } else if (row.warningState === "train") {
                if (row.train) {
                    row.train.x += row.train.speed * dt;
                    if (row.direction === 1 && row.train.x > GRID_WIDTH + 8) {
                        finishTrain(row);
                    } else if (row.direction === -1 && row.train.x + row.train.length < -8) {
                        finishTrain(row);
                    }
                }
            }
        }
    }
}

function spawnVehicle(row) {
    const type = Math.random() < 0.6 ? "car" : "truck";
    const length = type === "car" ? 1.2 : 2;
    const startX = row.direction === 1 ? -length - randomRange(0, 2) : GRID_WIDTH + randomRange(0, 2);
    row.vehicles.push({
        type,
        x: startX,
        length,
        speed: MOVEMENT_SPEEDS[type] * row.direction
    });
}

function createTrain(row) {
    return {
        x: row.direction === 1 ? -8 : GRID_WIDTH + 8,
        length: 6,
        speed: MOVEMENT_SPEEDS.train * row.direction
    };
}

function finishTrain(row) {
    row.train = null;
    row.warningState = "idle";
    row.warningTimer = randomRange(2.5, 4.5);
}

function updatePlayer(dt) {
    if (player.moving) {
        player.moveProgress += dt * MOVE_SPEED;
        const eased = ease(player.moveProgress);
        player.visualX = lerp(player.startX, player.targetX, eased);
        player.visualY = lerp(player.startY, player.targetY, eased);
        if (player.moveProgress >= 1) {
            player.gridX = player.targetX;
            player.gridY = player.targetY;
            player.visualX = player.gridX;
            player.visualY = player.gridY;
            player.moving = false;
            player.moveProgress = 0;
            const row = getRow(player.gridY);
            if (row?.coins?.length) {
                collectCoin(row, player.gridX);
            }
        }
    } else {
        player.visualX = player.gridX;
        player.visualY = player.gridY;
    }
    applyLogMovement(dt);
    checkHazards();
}

function applyLogMovement(dt) {
    const row = getRow(Math.round(player.visualY));
    if (!row || row.type !== "pond") {
        player.onLog = null;
        return;
    }
    const log = row.logs.find(logEntry => player.visualX > logEntry.x - 0.3 && player.visualX < logEntry.x + logEntry.length + 0.3);
    if (log) {
        player.visualX += log.speed * dt;
        player.gridX = Math.round(player.visualX);
        player.onLog = log;
        if (player.visualX < -1 || player.visualX > GRID_WIDTH) {
            killPlayer("edge");
        }
    } else if (!player.moving) {
        killPlayer("water");
    }
}

function updateClones(dt) {
    friendClones.forEach(clone => {
        const index = pathHistory.length - clone.lag - 1;
        if (index >= 0) {
            const cell = pathHistory[index];
            if (!clone.target || clone.target.x !== cell.x || clone.target.y !== cell.y) {
                clone.target = { x: cell.x, y: cell.y };
                clone.startX = clone.visualX;
                clone.startY = clone.visualY;
                clone.progress = 0;
            }
        }
        if (clone.target) {
            clone.progress += dt * MOVE_SPEED * 0.7;
            const eased = ease(clone.progress);
            clone.visualX = lerp(clone.startX, clone.target.x, eased);
            clone.visualY = lerp(clone.startY, clone.target.y, eased);
            if (clone.progress >= 1) {
                clone.visualX = clone.target.x;
                clone.visualY = clone.target.y;
                clone.target = null;
            }
        }
    });
}

function updateFloatingTexts(dt) {
    floatingTexts.forEach(text => {
        text.life -= dt * 1000;
        text.y += dt * 0.3;
    });
    floatingTexts = floatingTexts.filter(text => text.life > 0);
}

function updateDeathAnimation(dt) {
    if (!player || !player.deathAnimation) return;
    player.deathAnimation.progress = Math.min(1, player.deathAnimation.progress + dt / player.deathAnimation.duration);
}

function createDeathAnimation(reason) {
    return {
        type: reason,
        progress: 0,
        duration: reason === "water" ? 0.9 : 0.7,
        x: player.visualX,
        y: player.visualY
    };
}

function handleIdleState(timestamp, dt) {
    const idleDuration = timestamp - player.lastMoveTime;
    if (idleDuration > IDLE_WARNING && idleDuration < IDLE_LIMIT) {
        dom.idleWarning.classList.remove("hidden");
        if (!eagleSounded) {
            announce(t("idleWarning"));
            eagleSounded = true;
        }
    } else {
        dom.idleWarning.classList.add("hidden");
    }
    if (!player.eagleTriggered && idleDuration > IDLE_LIMIT) {
        player.eagleTriggered = true;
        player.eagleTimer = 0;
        addFloatingText(t("eagleReady"), player.gridX, player.gridY + 1);
        announce(t("eagleReady"));
        sound.play(200, 0.4);
    }
    if (player.eagleTriggered) {
        player.eagleTimer += dt;
        if (player.eagleTimer >= 1.5) {
            killPlayer("idle");
        }
    }
}

function updateCamera(dt) {
    const worldY = player.visualY * TILE_SIZE;
    const target = worldY - canvas.height * 0.35;
    cameraY += (target - cameraY) * 0.08;
    cameraY += CAMERA_DRIFT * dt;
}

function checkHazards() {
    const rowIndex = Math.round(player.visualY);
    const row = getRow(rowIndex);
    if (!row) return;

    if (row.type === "road") {
        for (const vehicle of row.vehicles) {
            if (overlap(player.visualX - 0.3, player.visualX + 0.3, vehicle.x, vehicle.x + vehicle.length)) {
                killPlayer(vehicle.type === "truck" ? "truck" : "road");
                return;
            }
        }
    } else if (row.type === "rail" && row.train) {
        if (overlap(player.visualX - 0.4, player.visualX + 0.4, row.train.x, row.train.x + row.train.length)) {
            killPlayer("train");
            return;
        }
    } else if (row.type === "pond" && !player.onLog && !player.moving) {
        killPlayer("water");
    }
}

function killPlayer(reason) {
    if (!player.alive) return;
    player.alive = false;
    gameRunning = false;
    paused = false;
    player.deathAnimation = createDeathAnimation(reason);
    finalizeRunBest();
    dom.pauseButton.disabled = true;
    dom.pauseButton.textContent = t("pause");
    dom.idleWarning.classList.add("hidden");
    dom.deathScreen.classList.remove("hidden");
    dom.deathReason.textContent = t(`death_${reason}`) || t("death_unknown");
    dom.finalScore.textContent = state.score;
    updateScoreDisplays();
    persistSave();
}

function render() {
    const worldWidth = GRID_WIDTH * TILE_SIZE;
    const offsetX = (canvas.width - worldWidth) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const row of rows) {
        const screenY = worldToScreenY(row.index * TILE_SIZE);
        if (screenY < -TILE_SIZE || screenY > canvas.height) continue;
        drawRow(row, offsetX, screenY, worldWidth);
    }
    drawBestMarker(offsetX);
    drawClones(offsetX);
    drawPlayer(offsetX);
    drawFloatingTexts(offsetX);
}

function drawRow(row, offsetX, screenY, worldWidth) {
    if (row.type === "forest" || row.type === "start") {
        ctx.fillStyle = row.type === "forest" ? "#123425" : "#1b4a34";
        ctx.fillRect(offsetX, screenY, worldWidth, TILE_SIZE);
        ctx.fillStyle = "rgba(255,255,255,0.02)";
        for (let x = 0; x < GRID_WIDTH; x++) {
            ctx.fillRect(offsetX + x * TILE_SIZE, screenY, TILE_SIZE - 1, TILE_SIZE);
        }
        if (row.trees) {
            row.trees.forEach(x => drawTree(offsetX + x * TILE_SIZE, screenY));
        }
        row.coins?.forEach(coin => {
            if (!coin.collected) drawCoin(offsetX + coin.x * TILE_SIZE + TILE_SIZE / 2, screenY + TILE_SIZE / 2);
        });
    } else if (row.type === "road") {
        ctx.fillStyle = "#2e2e2e";
        ctx.fillRect(offsetX, screenY, worldWidth, TILE_SIZE);
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 4;
        ctx.setLineDash([24, 16]);
        ctx.beginPath();
        ctx.moveTo(offsetX, screenY + TILE_SIZE / 2);
        ctx.lineTo(offsetX + worldWidth, screenY + TILE_SIZE / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        row.vehicles.forEach(vehicle => drawVehicle(vehicle, offsetX, screenY));
    } else if (row.type === "pond") {
        const gradient = ctx.createLinearGradient(0, screenY, 0, screenY + TILE_SIZE);
        gradient.addColorStop(0, "#0e3052");
        gradient.addColorStop(1, "#12739a");
        ctx.fillStyle = gradient;
        ctx.fillRect(offsetX, screenY, worldWidth, TILE_SIZE);
        row.logs.forEach(log => drawLog(log, offsetX, screenY));
    } else if (row.type === "rail") {
        ctx.fillStyle = "#3a2b1b";
        ctx.fillRect(offsetX, screenY, worldWidth, TILE_SIZE);
        ctx.fillStyle = "#141414";
        ctx.fillRect(offsetX, screenY + TILE_SIZE * 0.25, worldWidth, TILE_SIZE * 0.5);
        ctx.strokeStyle = "#c5c2c2";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(offsetX, screenY + TILE_SIZE * 0.35);
        ctx.lineTo(offsetX + worldWidth, screenY + TILE_SIZE * 0.35);
        ctx.moveTo(offsetX, screenY + TILE_SIZE * 0.65);
        ctx.lineTo(offsetX + worldWidth, screenY + TILE_SIZE * 0.65);
        ctx.stroke();
        drawWarningLights(row, offsetX, screenY);
        if (row.train) drawTrain(row.train, offsetX, screenY);
    }
}

function drawTree(x, y) {
    ctx.fillStyle = "#1f4d31";
    ctx.fillRect(x + TILE_SIZE * 0.2, y + TILE_SIZE * 0.1, TILE_SIZE * 0.6, TILE_SIZE * 0.65);
    ctx.fillStyle = "#9c5a2c";
    ctx.fillRect(x + TILE_SIZE * 0.35, y + TILE_SIZE * 0.6, TILE_SIZE * 0.3, TILE_SIZE * 0.4);
}

function drawCoin(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(0, 0, TILE_SIZE * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillRect(-2, -10, 4, 6);
    ctx.restore();
}

function drawVehicle(vehicle, offsetX, screenY) {
    const x = offsetX + vehicle.x * TILE_SIZE;
    const width = vehicle.length * TILE_SIZE;
    ctx.fillStyle = vehicle.type === "truck" ? "#f14668" : "#1dd1a1";
    ctx.fillRect(x, screenY + 8, width, TILE_SIZE - 16);
    ctx.fillStyle = "#111";
    ctx.fillRect(x + 6, screenY + TILE_SIZE - 10, width - 12, 6);
}

function drawLog(log, offsetX, screenY) {
    const x = offsetX + log.x * TILE_SIZE;
    const width = log.length * TILE_SIZE;
    ctx.fillStyle = "#8d5524";
    ctx.fillRect(x, screenY + TILE_SIZE * 0.2, width, TILE_SIZE * 0.6);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(x, screenY + TILE_SIZE * 0.2, width, TILE_SIZE * 0.15);
}

function drawTrain(train, offsetX, screenY) {
    const x = offsetX + train.x * TILE_SIZE;
    const width = train.length * TILE_SIZE;
    ctx.fillStyle = "#ecf0f1";
    ctx.fillRect(x, screenY + TILE_SIZE * 0.15, width, TILE_SIZE * 0.7);
    ctx.fillStyle = "#2d3436";
    ctx.fillRect(x + 8, screenY + TILE_SIZE * 0.75, width - 16, 8);
}

function drawWarningLights(row, offsetX, screenY) {
    const flashing = Math.sin(row.flash * (row.warningState === "warning2" ? 18 : 8)) > 0;
    const baseColor = row.warningState === "train" ? "#ff4757" : "#ffa502";
    const color = flashing ? baseColor : "rgba(255,255,255,0.2)";
    ctx.fillStyle = color;
    const radius = TILE_SIZE * 0.12;
    ctx.beginPath();
    ctx.arc(offsetX + radius * 2, screenY + TILE_SIZE * 0.5, radius, 0, Math.PI * 2);
    ctx.arc(offsetX + GRID_WIDTH * TILE_SIZE - radius * 2, screenY + TILE_SIZE * 0.5, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlayer(offsetX) {
    if (!player) return;
    if (!player.alive && player.deathAnimation) {
        drawDeathAnimation(offsetX);
        return;
    }
    const { visualX, visualY, appearance } = player;
    const x = offsetX + visualX * TILE_SIZE;
    const y = worldToScreenY(visualY * TILE_SIZE);
    drawVoxelCharacter(x, y, appearance);
    if (player.eagleTriggered) {
        ctx.fillStyle = "#f7d794";
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE * 0.5, y - TILE_SIZE * 0.2, TILE_SIZE * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawDeathAnimation(offsetX) {
    if (!player.deathAnimation) return;
    const anim = player.deathAnimation;
    const baseX = offsetX + anim.x * TILE_SIZE;
    const baseY = worldToScreenY(anim.y * TILE_SIZE);
    const centerX = baseX + TILE_SIZE / 2;
    const centerY = baseY + TILE_SIZE / 2;
    const progress = anim.progress;
    if (anim.type === "water") {
        const radius = TILE_SIZE * (0.35 + progress * 0.8);
        ctx.strokeStyle = `rgba(126, 243, 255, ${Math.max(0, 1 - progress)})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(126, 243, 255, ${0.5 - progress * 0.4})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, TILE_SIZE * 0.2 * (1 - progress * 0.4), 0, Math.PI * 2);
        ctx.fill();
        return;
    }
    if (anim.type === "idle" || anim.type === "edge") {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, 1 - progress)})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY - TILE_SIZE * progress, TILE_SIZE * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 - progress * 0.3})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY - TILE_SIZE * progress * 1.2, TILE_SIZE * 0.45, 0, Math.PI * 2);
        ctx.stroke();
        return;
    }
    ctx.save();
    ctx.translate(centerX, baseY + TILE_SIZE * 0.65);
    const squash = Math.max(0.2, 1 - progress);
    ctx.scale(1, squash);
    ctx.fillStyle = anim.type === "train" ? "#ff8b5f" : "#fddc5c";
    ctx.fillRect(-TILE_SIZE * 0.35, -TILE_SIZE * 0.2, TILE_SIZE * 0.7, TILE_SIZE * 0.4);
    ctx.restore();
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(centerX - TILE_SIZE * 0.45, baseY + TILE_SIZE * 0.3, TILE_SIZE * 0.9, 4);
    if (anim.type === "train") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.moveTo(centerX - TILE_SIZE * 0.2, baseY + TILE_SIZE * 0.1);
        ctx.lineTo(centerX - TILE_SIZE * 0.35, baseY - TILE_SIZE * 0.05);
        ctx.lineTo(centerX - TILE_SIZE * 0.1, baseY);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(centerX + TILE_SIZE * 0.2, baseY + TILE_SIZE * 0.05);
        ctx.lineTo(centerX + TILE_SIZE * 0.38, baseY - TILE_SIZE * 0.1);
        ctx.lineTo(centerX + TILE_SIZE * 0.12, baseY - TILE_SIZE * 0.04);
        ctx.fill();
    }
}

function drawClones(offsetX) {
    friendClones.forEach(clone => {
        const x = offsetX + clone.visualX * TILE_SIZE;
        const y = worldToScreenY(clone.visualY * TILE_SIZE);
        drawVoxelCharacter(x, y + TILE_SIZE * 0.1, { primary: clone.color, secondary: clone.color, accent: "#222" }, 0.6);
    });
}

function drawVoxelCharacter(x, y, colors, scale = 1) {
    const size = TILE_SIZE * 0.6 * scale;
    const offset = (TILE_SIZE - size) / 2;
    ctx.fillStyle = colors.primary;
    ctx.fillRect(x + offset, y + offset, size, size);
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(x + offset + size * 0.2, y + offset - size * 0.3, size * 0.6, size * 0.4);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(x + offset + size * 0.15, y + offset + size * 0.6, size * 0.7, size * 0.3);
}

function drawFloatingTexts(offsetX) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `${Math.round(TILE_SIZE * 0.32)}px "CrossyRoad", "EightBitWonder", sans-serif`;
    floatingTexts.forEach(text => {
        const alpha = clamp(text.life / 2000, 0, 1);
        ctx.globalAlpha = alpha;
        const x = offsetX + text.x * TILE_SIZE + TILE_SIZE / 2;
        const y = worldToScreenY(text.y * TILE_SIZE) + TILE_SIZE * 0.3;
        ctx.fillStyle = "#fff";
        ctx.fillText(text.text, x, y);
    });
    ctx.restore();
}

function drawBestMarker(offsetX) {
    if (!state.bestRow || state.bestRow < 1) return;
    const row = getRow(state.bestRow);
    if (!row) return;
    const screenY = worldToScreenY(row.index * TILE_SIZE);
    if (screenY < -TILE_SIZE || screenY > canvas.height) return;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(offsetX, screenY, GRID_WIDTH * TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = "#fff";
    ctx.font = `${Math.round(TILE_SIZE * 0.32)}px "EightBitWonder", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(t("pbOnPath", { score: state.bestScore }), offsetX + (GRID_WIDTH * TILE_SIZE) / 2, screenY + TILE_SIZE * 0.7);
    ctx.restore();
}

function worldToScreenY(worldY) {
    return canvas.height - (worldY - cameraY) - TILE_SIZE;
}

function addFloatingText(text, x, y) {
    floatingTexts.push({
        text,
        x,
        y,
        life: 2000
    });
}

function updateI18n() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-label]").forEach(el => {
        const key = el.dataset.i18nLabel;
        const label = el.querySelector(".label");
        if (label) label.textContent = t(key);
    });
    dom.pauseButton.textContent = paused ? t("resume") : t("pause");
    document.documentElement.lang = state.language;
    announce(t("helper"));
    updateSelectedCharacterDisplay();
}

function announce(message) {
    dom.helper.textContent = message;
    if (helperTimer) {
        clearTimeout(helperTimer);
    }
    helperTimer = setTimeout(() => {
        dom.helper.textContent = t("helper");
    }, 3500);
}

function spawnFireworks() {
    const colors = ["#ff6b6b", "#feca57", "#1dd1a1", "#54a0ff"];
    for (let i = 0; i < 20; i++) {
        const flare = document.createElement("span");
        flare.style.left = `${Math.random() * 100}%`;
        flare.style.bottom = `${20 + Math.random() * 60}%`;
        flare.style.background = `linear-gradient(180deg, ${randomChoice(colors)}, transparent)`;
        flare.style.animationDelay = `${Math.random() * 0.4}s`;
        dom.fireworks.appendChild(flare);
        setTimeout(() => flare.remove(), 1200);
    }
}

function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const displayWidth = Math.floor(canvas.clientWidth * ratio);
    const displayHeight = Math.floor(canvas.clientHeight * ratio);
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

function t(key, params = {}) {
    const lang = I18N[state.language] ? state.language : "en";
    let text = I18N[lang][key] ?? I18N.en[key] ?? key;
    Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, value);
    });
    return text;
}

function getCharacterById(id) {
    return CHARACTERS.find(char => char.id === id) || CHARACTERS[0];
}

function SoundEngine() {
    this.enabled = true;
    this.ctx = null;
}

SoundEngine.prototype.setEnabled = function (enabled) {
    this.enabled = enabled;
};

SoundEngine.prototype.play = function (freq, duration = 0.1) {
    if (!this.enabled) return;
    try {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        const oscillator = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.value = freq;
        gain.gain.value = 0.15;
        oscillator.connect(gain);
        gain.connect(this.ctx.destination);
        oscillator.start();
        oscillator.stop(this.ctx.currentTime + duration);
    } catch {
        this.enabled = false;
    }
};

sound = new SoundEngine();
init();

function overlap(a1, a2, b1, b2) {
    return Math.max(a1, b1) <= Math.min(a2, b2);
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function ease(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
