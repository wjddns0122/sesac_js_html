// js/storage.js
const STORAGE_KEY_META = 'cr_runner_meta';

function loadMeta() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_META);
    if (!raw) {
      return {
        highScore: 0,
        totalCoins: 0,
        settings: { sound: true }
      };
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse meta, resetting.', e);
    return {
      highScore: 0,
      totalCoins: 0,
      settings: { sound: true }
    };
  }
}

function saveMeta(meta) {
  localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta));
}
