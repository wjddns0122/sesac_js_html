// js/game.js
function createGameState(width, height, inputManager) {
  const COLS = 12;
  const ROWS = 16;
  const CELL = Math.floor(width / COLS);

  const meta = loadMeta();

  const state = {
    cols: COLS,
    rowsCount: ROWS,
    cellSize: CELL,
    rows: [],
    player: null,
    score: 0,
    highScore: meta.highScore,
    runCoins: 0,
    totalCoins: meta.totalCoins,
    isGameOver: false,
    input: inputManager,
    cameraOffsetY: 0
  };

  function initRows() {
    state.rows = [];
    for (let i = 0; i < ROWS; i++) {
      state.rows.push(generateRow(i));
    }
  }

  function generateRow(index) {
    // V0: 전부 도로
    const terrain = 'road';
    const obstacles = [];

    // 간단 랜덤 차량
    if (Math.random() < 0.6) {
      const count = 1 + Math.floor(Math.random() * 3);
      const dir = Math.random() < 0.5 ? 1 : -1;
      for (let i = 0; i < count; i++) {
        obstacles.push({
          x: Math.random() * COLS,
          laneY: 0,
          speed: 2 + Math.random() * 2,
          dir,
          type: 'car',
          width: 1
        });
      }
    }

    return {
      index,
      terrain,
      obstacles,
      coin: null // V1에서 사용
    };
  }

  function initPlayer() {
    state.player = {
      x: Math.floor(COLS / 2),
      y: ROWS - 3,
      worldY: 0,
      alive: true,
      dir: 'up',
      isMoving: false
    };
    state.score = 0;
    state.runCoins = 0;
    state.isGameOver = false;
  }

  function reset() {
    initRows();
    initPlayer();
  }

  reset();

  function update(dt) {
    if (state.isGameOver) return;

    // 1. 입력 처리
    const move = state.input.getNextMove();
    if (move) handleMove(move);

    // 2. 장애물 이동
    for (const row of state.rows) {
      for (const obs of row.obstacles) {
        obs.x += obs.speed * dt * obs.dir;
        if (obs.x < -2) obs.x = COLS + 2;
        if (obs.x > COLS + 2) obs.x = -2;
      }
    }

    // 3. 충돌 체크
    checkCollision();

    // 4. 점수 갱신
    state.score = Math.max(state.score, state.player.worldY);
  }

  function handleMove(move) {
    const p = state.player;
    if (!p.alive) return;

    let nx = p.x;
    let ny = p.y;

    if (move === 'up') {
      ny -= 1;
      p.worldY += 1;
      // 맨 위에 가까워지면 새 row 생성
      maybeScrollMap();
    } else if (move === 'down') {
      ny += 1;
    } else if (move === 'left') {
      nx -= 1;
    } else if (move === 'right') {
      nx += 1;
    }

    // 경계 체크
    if (nx < 0 || nx >= state.cols) return;
    if (ny < 0 || ny >= state.rowsCount) return;

    p.x = nx;
    p.y = ny;
    p.dir = move;
  }

  function maybeScrollMap() {
    // 플레이어 worldY가 현재 rows 중 최대 index 근처면 새 줄 추가
    const maxIndex = state.rows[state.rows.length - 1].index;
    const playerWorldRow = state.rows[0].index + (state.player.y);
    if (playerWorldRow > maxIndex - 4) {
      // 아래 하나 제거, 위에 하나 추가
      state.rows.shift();
      const newIndex = maxIndex + 1;
      state.rows.push(generateRow(newIndex));
    }
  }

  function checkCollision() {
    const p = state.player;
    const row = state.rows[p.y];
    if (!row) return;

    // player.x와 장애물 범위 비교
    for (const obs of row.obstacles) {
      const ox = obs.x;
      const ox2 = obs.x + obs.width;
      if (p.x + 0.5 >= ox && p.x + 0.5 <= ox2) {
        // 충돌
        p.alive = false;
        state.isGameOver = true;
        onGameOver();
        return;
      }
    }
  }

  function onGameOver() {
    // highScore/totalCoins 갱신 후 저장
    if (state.score > state.highScore) {
      state.highScore = state.score;
    }
    const meta = {
      highScore: state.highScore,
      totalCoins: state.totalCoins,
      settings: { sound: true } // TODO: 실제 설정 반영
    };
    saveMeta(meta);
  }

  function render(ctx) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // 맵 타일 렌더
    for (let i = 0; i < state.rows.length; i++) {
      const row = state.rows[i];
      const y = i * state.cellSize;
      // terrain 색
      if (row.terrain === 'road') {
        ctx.fillStyle = '#333';
      } else {
        ctx.fillStyle = '#2e8b57';
      }
      ctx.fillRect(0, y, w, state.cellSize);

      // 장애물
      ctx.fillStyle = '#ffcc00';
      for (const obs of row.obstacles) {
        const xPix = obs.x * state.cellSize;
        ctx.fillRect(
          xPix,
          y + state.cellSize * 0.1,
          obs.width * state.cellSize,
          state.cellSize * 0.8
        );
      }
    }

    // 플레이어
    const p = state.player;
    ctx.fillStyle = p.alive ? '#00ffff' : '#ff0000';
    ctx.fillRect(
      p.x * state.cellSize,
      p.y * state.cellSize,
      state.cellSize,
      state.cellSize
    );

    // 게임오버 텍스트
    if (state.isGameOver) {
      ctx.fillStyle = 'white';
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', w / 2, h / 2);
    }
  }

  return {
    update,
    render,
    reset,
    get score() {
      return state.score;
    },
    get highScore() {
      return state.highScore;
    },
    get totalCoins() {
      return state.totalCoins;
    },
    get isGameOver() {
      return state.isGameOver;
    }
  };
}
