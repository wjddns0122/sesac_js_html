(function () {
  const worlds = [
    {
      id: 'classic',
      displayName: 'Classic Fields',
      description: 'Green pastures, calm rivers, basic roads.',
      laneThemeWeights: { GRASS: 0.4, ROAD: 0.3, RIVER: 0.2, RAIL: 0.1 },
      colors: {},
      props: {
        grass: ['tree', 'bush', 'rock'],
        river: ['lily'],
        road: ['sign', 'cone'],
        rail: ['gate']
      }
    },
    {
      id: 'farm',
      displayName: 'Pastel Farm',
      description: 'Soft colors, mellow traffic.',
      laneThemeWeights: { GRASS: 0.45, ROAD: 0.3, RIVER: 0.15, RAIL: 0.1 },
      colors: { grassBase: '#8bc34a' },
      props: {
        grass: ['hay', 'bush'],
        river: ['lily'],
        road: ['tractor'],
        rail: ['gate']
      }
    },
    {
      id: 'spooky',
      displayName: 'Moonlit Marsh',
      description: 'Foggy lights and spooky props.',
      laneThemeWeights: { GRASS: 0.35, ROAD: 0.25, RIVER: 0.3, RAIL: 0.1 },
      colors: { grassBase: '#3e3a54', riverWater: '#243447' },
      props: {
        grass: ['gravestone', 'pumpkin'],
        river: ['lily'],
        road: ['lamp'],
        rail: ['gate']
      }
    },
    {
      id: 'city_night',
      displayName: 'Neon City',
      description: 'Busy roads and glowing rails.',
      laneThemeWeights: { GRASS: 0.2, ROAD: 0.5, RIVER: 0.15, RAIL: 0.15 },
      colors: { roadBase: '#101018', grassBase: '#1b2a3d', riverWater: '#092d57' },
      props: {
        grass: ['planter'],
        river: ['neon_buoy'],
        road: ['streetlight', 'sign'],
        rail: ['signal']
      }
    },
    {
      id: 'desert',
      displayName: 'Dusty Desert',
      description: 'Sand dunes and tough roads.',
      laneThemeWeights: { GRASS: 0.25, ROAD: 0.35, RIVER: 0.2, RAIL: 0.2 },
      colors: { grassBase: '#d2a36b', riverWater: '#c97c27' },
      props: {
        grass: ['cactus', 'rock'],
        river: ['stone'],
        road: ['sign'],
        rail: ['gate']
      }
    },
    {
      id: 'ocean',
      displayName: 'Coral Coast',
      description: 'Lots of watery lanes and boats.',
      laneThemeWeights: { GRASS: 0.25, ROAD: 0.25, RIVER: 0.35, RAIL: 0.15 },
      colors: { riverWater: '#49a1e5', logBody: '#6d4c41' },
      props: {
        grass: ['coral'],
        river: ['reef', 'lily'],
        road: ['buoy'],
        rail: ['gate']
      }
    },
    {
      id: 'space',
      displayName: 'Cosmic Orbit',
      description: 'Low gravity hops and star roads.',
      laneThemeWeights: { GRASS: 0.2, ROAD: 0.35, RIVER: 0.15, RAIL: 0.3 },
      colors: { grassBase: '#2c2b45', roadBase: '#121231', riverWater: '#1d2759' },
      props: {
        grass: ['antenna'],
        river: ['panel'],
        road: ['satellite'],
        rail: ['beam']
      }
    }
  ];

  function getWorldById(id) {
    return worlds.find((w) => w.id === id) || worlds[0];
  }

  window.Worlds = {
    list: worlds,
    getWorldById
  };
})();
