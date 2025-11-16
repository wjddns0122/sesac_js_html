import { loadStats, saveStats } from './storage.js';

const TILE_SIZE = 48;
const GRID_COLS = 9;
const ROW_COUNT = 16;
const SCROLL_TRIGGER = ROW_COUNT - 5;
const DIRS = {
    up: { dx: 0, dy: 1 },
    down: { dx: 0, dy: -1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 }
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function beginRoundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(x, y, width, height, r);
        return;
    }
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
}

export class Game {
    constructor({ canvas, hud, input, onGameOver }) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hud = hud;
        this.input = input;
        this.onGameOver = onGameOver;

        this.persisted = loadStats();
        this.awaitingStart = true;
        this.running = false;

        this.resetState();
        this.updateHud();
    }

    resetState() {
        this.mapRows = [];
        this.worldOffset = 0;
        this.farthestRow = 0;
        this.runScore = 0;
        this.runCoins = 0;
        this.nextRowId = 0;

        this.player = {
            col: Math.floor(GRID_COLS / 2),
            row: 2,
            prevCol: Math.floor(GRID_COLS / 2),
            prevRow: 2,
            moving: false,
            animTime: 0,
            animDuration: 0.14
        };

        for (let i = 0; i < ROW_COUNT; i++) {
            const type = i < 4 ? 'meadow' : this.pickTerrain();
            this.mapRows.push(this.generateRow(type));
        }
    }

    init() {
        this.updateHud();
    }

    startRun() {
        this.resetState();
        this.awaitingStart = false;
        this.running = true;
        this.input.setEnabled(true);
        this.updateHud();
    }

    isRunning() {
        return this.running;
    }

    getPersistentStats() {
        return {
            best: this.persisted.highScore,
            totalCoins: this.persisted.totalCoins
        };
    }

    pickTerrain() {
        const difficulty = Math.min(1, this.farthestRow / 80);
        const roadWeight = 0.35 + difficulty * 0.4;
        return Math.random() < roadWeight ? 'road' : 'meadow';
    }

    generateRow(forceType) {
        const type = forceType || this.pickTerrain();
        const row = {
            id: this.nextRowId++,
            type,
            direction: Math.random() > 0.5 ? 1 : -1,
            speed: 0,
            obstacles: [],
            coins: []
        };

        if (type === 'road') {
            const difficulty = Math.min(1.5, 0.01 * (this.farthestRow + 10));
            row.speed = 2 + difficulty * 4;
            const cars = 2 + Math.floor(Math.random() * 2 + difficulty * 2);
            const spacing = GRID_COLS / cars;
            for (let i = 0; i < cars; i++) {
                const length = Math.random() < 0.35 ? 2 : 1;
                const offset = (i * spacing) + Math.random() * spacing;
                row.obstacles.push({ x: offset, length });
            }
        } else {
            const coinChance = 0.55;
            if (Math.random() < coinChance) {
                const count = Math.random() < 0.3 ? 2 : 1;
                const used = new Set();
                while (row.coins.length < count) {
                    const col = Math.floor(Math.random() * GRID_COLS);
                    if (used.has(col)) continue;
                    used.add(col);
                    row.coins.push({ col });
                }
            }
        }

        return row;
    }

    handleInput() {
        if (!this.running) return;
        if (this.player.moving) return;
        const dir = this.input.consume();
        if (!dir) return;
        const move = DIRS[dir];
        if (!move) return;

        const nextCol = clamp(this.player.col + move.dx, 0, GRID_COLS - 1);
        const nextRow = this.player.row + move.dy;
        if (nextRow < 0) {
            this.endRun('뒤로 너무 멀리 떨어졌어요!');
            return;
        }
        if (nextRow >= this.mapRows.length) {
            return;
        }
        if (nextCol === this.player.col && nextRow === this.player.row) {
            return;
        }

        this.player.prevCol = this.player.col;
        this.player.prevRow = this.player.row;
        this.player.col = nextCol;
        this.player.row = nextRow;
        this.player.moving = true;
        this.player.animTime = 0;
    }

    update(dt) {
        if (!this.running) {
            this.updateHud();
            return;
        }

        this.updatePlayerAnimation(dt);
        this.updateRows(dt);
        this.scrollRowsIfNeeded();
        this.checkCollisions();
        this.updateHud();
    }

    updatePlayerAnimation(dt) {
        if (!this.player.moving) return;
        this.player.animTime += dt;
        if (this.player.animTime >= this.player.animDuration) {
            this.player.moving = false;
            this.player.prevCol = this.player.col;
            this.player.prevRow = this.player.row;
            this.postMoveUpdates();
        }
    }

    postMoveUpdates() {
        const absoluteRow = this.worldOffset + this.player.row;
        if (absoluteRow > this.farthestRow) {
            this.farthestRow = absoluteRow;
            this.runScore = this.farthestRow;
        }
        this.collectCoins();
    }

    collectCoins() {
        const row = this.mapRows[this.player.row];
        if (!row || row.coins.length === 0) return;
        const index = row.coins.findIndex((coin) => coin.col === this.player.col);
        if (index !== -1) {
            row.coins.splice(index, 1);
            this.runCoins += 1;
        }
    }

    updateRows(dt) {
        for (const row of this.mapRows) {
            if (row.type !== 'road') continue;
            for (const obs of row.obstacles) {
                obs.x += row.direction * row.speed * dt;
                if (row.direction === 1 && obs.x > GRID_COLS + obs.length) {
                    obs.x -= GRID_COLS + obs.length + Math.random();
                } else if (row.direction === -1 && obs.x < -obs.length) {
                    obs.x += GRID_COLS + obs.length + Math.random();
                }
            }
        }
    }

    scrollRowsIfNeeded() {
        while (this.player.row >= SCROLL_TRIGGER) {
            this.mapRows.push(this.generateRow());
            this.mapRows.shift();
            this.player.row -= 1;
            this.player.prevRow -= 1;
            this.worldOffset += 1;
        }
    }

    checkCollisions() {
        const row = this.mapRows[this.player.row];
        if (!row) return;
        if (row.type === 'road') {
            const min = this.player.col + 0.15;
            const max = this.player.col + 0.85;
            for (const obs of row.obstacles) {
                const wrapped = [obs.x, obs.x - GRID_COLS, obs.x + GRID_COLS];
                for (const base of wrapped) {
                    const left = base;
                    const right = base + obs.length;
                    if (right <= min || left >= max) continue;
                    this.endRun('차에 치였어요!');
                    return;
                }
            }
        }
    }

    updateHud() {
        const best = Math.max(this.persisted.highScore, this.runScore);
        const coins = this.persisted.totalCoins + this.runCoins;
        this.hud.scoreEl.textContent = this.runScore.toString();
        this.hud.bestEl.textContent = best.toString();
        this.hud.coinEl.textContent = coins.toString();
    }

    endRun(reason) {
        if (!this.running) return;
        this.running = false;
        const isRecord = this.runScore > this.persisted.highScore;
        if (isRecord) {
            this.persisted.highScore = this.runScore;
        }
        this.persisted.totalCoins += this.runCoins;
        saveStats({
            highScore: this.persisted.highScore,
            totalCoins: this.persisted.totalCoins
        });
        this.onGameOver?.({
            score: this.runScore,
            coins: this.runCoins,
            best: this.persisted.highScore,
            totalCoins: this.persisted.totalCoins,
            reason,
            isRecord
        });
        this.awaitingStart = true;
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();
        this.drawRows();
        this.drawGrid();
        this.drawPlayer();
        ctx.restore();
    }

    drawRows() {
        const ctx = this.ctx;
        for (let i = 0; i < this.mapRows.length; i++) {
            const row = this.mapRows[i];
            const y = this.canvas.height - (i + 1) * TILE_SIZE;
            if (row.type === 'road') {
                ctx.fillStyle = '#1f2438';
            } else {
                ctx.fillStyle = '#205d3a';
            }
            ctx.fillRect(0, y, this.canvas.width, TILE_SIZE);

            if (row.type === 'road') {
                ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                ctx.setLineDash([8, 10]);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, y + TILE_SIZE / 2);
                ctx.lineTo(this.canvas.width, y + TILE_SIZE / 2);
                ctx.stroke();
                ctx.setLineDash([]);
                this.drawObstacles(row, y);
            } else {
                this.drawGrassDecor(y);
                this.drawCoins(row, y);
            }
        }
    }

    drawObstacles(row, y) {
        const ctx = this.ctx;
        for (const obs of row.obstacles) {
            const width = obs.length * TILE_SIZE - 6;
            const height = TILE_SIZE - 12;
            const bases = [obs.x, obs.x - GRID_COLS, obs.x + GRID_COLS];
            for (const base of bases) {
                const drawX = base * TILE_SIZE + 3;
                if (drawX + width < -20 || drawX > this.canvas.width + 20) continue;
                const top = y + 6;
                ctx.fillStyle = row.direction === 1 ? '#ff6b6b' : '#ffd166';
                ctx.strokeStyle = 'rgba(0,0,0,0.4)';
                ctx.lineWidth = 3;
                beginRoundedRect(ctx, drawX, top, width, height, 10);
                ctx.fill();
                ctx.stroke();
            }
        }
    }

    drawCoins(row, y) {
        if (!row.coins.length) return;
        const ctx = this.ctx;
        ctx.fillStyle = '#ffef60';
        ctx.strokeStyle = '#b4922f';
        ctx.lineWidth = 2;
        for (const coin of row.coins) {
            const cx = coin.col * TILE_SIZE + TILE_SIZE / 2;
            const cy = y + TILE_SIZE / 2;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 10, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }

    drawGrassDecor(y) {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        for (let col = 0; col < GRID_COLS; col++) {
            const size = 4;
            const x = col * TILE_SIZE + TILE_SIZE / 2 - size / 2;
            ctx.fillRect(x, y + TILE_SIZE / 2, size, size);
        }
    }

    drawGrid() {
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        for (let c = 1; c < GRID_COLS; c++) {
            const x = c * TILE_SIZE;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
    }

    drawPlayer() {
        const ctx = this.ctx;
        const progress = this.player.moving
            ? clamp(this.player.animTime / this.player.animDuration, 0, 1)
            : 1;
        const renderCol = this.player.moving
            ? lerp(this.player.prevCol, this.player.col, progress)
            : this.player.col;
        const renderRow = this.player.moving
            ? lerp(this.player.prevRow, this.player.row, progress)
            : this.player.row;
        const centerX = renderCol * TILE_SIZE + TILE_SIZE / 2;
        const centerY = this.canvas.height - (renderRow + 0.5) * TILE_SIZE;
        const bodyWidth = 28;
        const bodyHeight = 32;

        ctx.fillStyle = '#6cf1c5';
        ctx.strokeStyle = '#0a1b24';
        ctx.lineWidth = 3;
        beginRoundedRect(ctx, centerX - bodyWidth / 2, centerY - bodyHeight / 2, bodyWidth, bodyHeight, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0a1b24';
        ctx.beginPath();
        ctx.arc(centerX - 7, centerY - 4, 3.5, 0, Math.PI * 2);
        ctx.arc(centerX + 7, centerY - 4, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#0a1b24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY + 6, 6, 0, Math.PI);
        ctx.stroke();
    }
}
