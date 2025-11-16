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
    }
  };

  window.Config = Config;
})();
