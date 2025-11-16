(function () {
  const Config = {
    tileSize: 60,
    virtualWidth: 9,
    virtualRows: 18,
    laneBuffer: 16,
    startingLaneY: 0,
    cameraRowsFromBottom: 6,
    maxRowsBehind: 14,
    idleEagleSeconds: 6,
    dangerLineSpeed: 0.2,
    playerHopDuration: 0.16,
    coinValue: 1,
    SAFE_ZONE_GRASS_ROWS: 6,
    SAFE_ZONE_OBSTACLE_DENSITY: 0.15,
    NORMAL_GRASS_OBSTACLE_DENSITY: 0.25,
    SAFE_ZONE_MIN_EMPTY_TILES: 5,
    MIN_EMPTY_TILES_PER_GRASS_ROW: 3,
    ROAD_SLOT_SPACING: 1.35,
    RIVER_SLOT_SPACING: 1.5,
    palette: {
      backgroundSky: '#5ec6ff',
      backgroundFog: '#0f1530',
      grassBase: '#4caf50',
      grassAccent: '#3b853d',
      roadBase: '#2c2c2c',
      roadLine: '#ffd54f',
      carBody: '#ff6f61',
      carWindow: '#b0d9ff',
      riverWater: '#1b5d9c',
      logBody: '#8b5a2b',
      railBase: '#3a3a3a',
      railTrack: '#c0c0c0',
      uiPanel: '#1f2648cc'
    },
    roadPatterns: {
      easy: [
        { slots: ['CAR', 'GAP', 'GAP', 'CAR', 'GAP', 'GAP', 'GAP', 'CAR', 'GAP', 'GAP', 'GAP', 'GAP'], baseSpeed: 2.2 },
        { slots: ['CAR', 'CAR', 'GAP', 'GAP', 'CAR', 'GAP', 'GAP', 'GAP', 'GAP', 'GAP', 'CAR', 'GAP'], baseSpeed: 2.4 }
      ],
      medium: [
        { slots: ['CAR', 'GAP', 'TRUCK', 'GAP', 'CAR', 'GAP', 'CAR', 'GAP', 'GAP', 'CAR', 'GAP', 'GAP'], baseSpeed: 2.8 },
        { slots: ['CAR', 'GAP', 'CAR', 'GAP', 'TRUCK', 'GAP', 'CAR', 'GAP', 'CAR', 'GAP', 'GAP', 'GAP'], baseSpeed: 3 },
        { slots: ['TRUCK', 'GAP', 'CAR', 'GAP', 'CAR', 'GAP', 'TRUCK', 'GAP', 'CAR', 'GAP', 'GAP', 'CAR'], baseSpeed: 3.2 }
      ],
      hard: [
        { slots: ['CAR', 'TRUCK', 'GAP', 'CAR', 'CAR', 'GAP', 'BUS', 'GAP', 'CAR', 'GAP', 'CAR', 'GAP'], baseSpeed: 3.6 },
        { slots: ['CAR', 'CAR', 'GAP', 'CAR', 'TRUCK', 'GAP', 'CAR', 'GAP', 'CAR', 'GAP', 'TRUCK', 'GAP'], baseSpeed: 3.8 },
        { slots: ['CAR', 'TRUCK', 'CAR', 'GAP', 'CAR', 'GAP', 'CAR', 'GAP', 'BUS', 'GAP', 'CAR', 'GAP'], baseSpeed: 4 }
      ]
    },
    riverPatterns: {
      easy: [
        { slots: ['LOG_LONG', 'GAP', 'LOG_MED', 'GAP', 'LOG_LONG', 'GAP', 'GAP', 'LOG_LONG'], baseSpeed: 1.2 },
        { slots: ['LOG_MED', 'GAP', 'LOG_SHORT', 'GAP', 'LOG_MED', 'GAP', 'LOG_LONG', 'GAP'], baseSpeed: 1.3 }
      ],
      medium: [
        { slots: ['LOG_LONG', 'GAP', 'LOG_MED', 'GAP', 'LOG_SHORT', 'GAP', 'LOG_MED', 'GAP', 'LOG_LONG'], baseSpeed: 1.6 },
        { slots: ['LOG_MED', 'GAP', 'LOG_MED', 'GAP', 'LOG_SHORT', 'GAP', 'LOG_SHORT', 'GAP', 'LOG_LONG'], baseSpeed: 1.7 }
      ],
      hard: [
        { slots: ['LOG_MED', 'GAP', 'LOG_SHORT', 'GAP', 'LOG_MED', 'GAP', 'LOG_MED', 'GAP', 'LOG_SHORT'], baseSpeed: 2 },
        { slots: ['LOG_SHORT', 'GAP', 'LOG_MED', 'GAP', 'LOG_SHORT', 'GAP', 'LOG_MED', 'GAP', 'LOG_SHORT'], baseSpeed: 2.2 }
      ]
    }
  };

  window.Config = Config;
})();
