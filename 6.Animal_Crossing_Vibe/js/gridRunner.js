(function () {
    'use strict';

    // Grid configuration
    var TILE_SIZE = 32; // pixels
    var GRID_COLS = 15;
    var GRID_ROWS = 20;

    // Canvas references
    var canvas;
    var ctx;

    // Timing
    var lastTime = 0;

    // Map + player state containers
    var mapRows = [];
    var player = {
        row: GRID_ROWS - 1,
        col: Math.floor(GRID_COLS / 2)
    };

    // Input buffer so we only move one tile per key press
    var inputQueue = null;

    window.addEventListener('DOMContentLoaded', init);

    function init() {
        setupCanvas();
        buildInitialMap();
        bindInput();
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    /**
     * Prepare the canvas dimensions and context.
     */
    function setupCanvas() {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('gameCanvas element is missing');
        }
        canvas.width = GRID_COLS * TILE_SIZE;
        canvas.height = GRID_ROWS * TILE_SIZE;
        ctx = canvas.getContext('2d');
    }

    /**
     * RequestAnimationFrame loop: collect input -> update -> render.
     */
    function gameLoop(timestamp) {
        var delta = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        handleInput();
        update(delta);
        render();

        requestAnimationFrame(gameLoop);
    }

    /**
     * Build a placeholder map structure using row metadata.
     * Each row stores terrain, future obstacle slots, etc.
     */
    function buildInitialMap() {
        mapRows = [];
        for (var r = 0; r < GRID_ROWS; r++) {
            mapRows.push({
                index: r,
                terrain: r % 2 === 0 ? 'meadow' : 'road',
                obstacles: [] // reserved for future expansion
            });
        }
    }

    /**
     * Setup keyboard listeners and queue presses for the loop.
     */
    function bindInput() {
        window.addEventListener('keydown', function (event) {
            var dir = null;
            switch (event.key) {
                case 'ArrowUp':
                    dir = { dRow: -1, dCol: 0 };
                    break;
                case 'ArrowDown':
                    dir = { dRow: 1, dCol: 0 };
                    break;
                case 'ArrowLeft':
                    dir = { dRow: 0, dCol: -1 };
                    break;
                case 'ArrowRight':
                    dir = { dRow: 0, dCol: 1 };
                    break;
                default:
                    break;
            }
            if (dir) {
                event.preventDefault();
                inputQueue = dir;
            }
        });
    }

    /**
     * Consume queued input so we move at most once per frame.
     */
    function handleInput() {
        if (!inputQueue) return;
        var nextRow = player.row + inputQueue.dRow;
        var nextCol = player.col + inputQueue.dCol;

        // Keep player inside the grid bounds.
        if (nextRow >= 0 && nextRow < GRID_ROWS && nextCol >= 0 && nextCol < GRID_COLS) {
            player.row = nextRow;
            player.col = nextCol;
        }

        inputQueue = null;
    }

    /**
     * Update world state. For now it is only a placeholder but delta time
     * is already available so scrolling or animations can be slotted in later.
     */
    function update(delta) {
        // Future obstacle movement or map scrolling logic goes here.
        // delta parameter keeps the function signature ready for animations.
    }

    /**
     * Render the tile map and player sprite.
     */
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawTiles();
        drawGridLines();
        drawPlayer();
    }

    /**
     * Draw background tiles using map metadata.
     */
    function drawTiles() {
        for (var r = 0; r < GRID_ROWS; r++) {
            for (var c = 0; c < GRID_COLS; c++) {
                var rowInfo = mapRows[r];
                ctx.fillStyle = rowInfo.terrain === 'meadow' ? '#1f8a4c' : '#2b2d42';
                var coords = gridToCanvas(r, c);
                ctx.fillRect(coords.x, coords.y, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    function drawGridLines() {
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        for (var c = 1; c < GRID_COLS; c++) {
            var x = c * TILE_SIZE;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (var r = 1; r < GRID_ROWS; r++) {
            var y = r * TILE_SIZE;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    /**
     * Draw the player as a simple rounded rectangle centered on its tile.
     */
    function drawPlayer() {
        var coords = gridToCanvas(player.row, player.col);
        var padding = 6;
        ctx.fillStyle = '#6cf1c5';
        ctx.strokeStyle = '#0a1b24';
        ctx.lineWidth = 2;
        var x = coords.x + padding;
        var y = coords.y + padding;
        var size = TILE_SIZE - padding * 2;
        ctx.beginPath();
        ctx.rect(x, y, size, size);
        ctx.fill();
        ctx.stroke();
    }

    /**
     * Convert grid coordinates (row, col) to canvas pixel origin.
     */
    function gridToCanvas(row, col) {
        return {
            x: col * TILE_SIZE,
            y: row * TILE_SIZE
        };
    }
})();
