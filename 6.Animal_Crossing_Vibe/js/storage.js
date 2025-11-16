const STORAGE_KEY = 'acv_run_stats';

export function loadStats() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return { highScore: 0, totalCoins: 0 };
        }
        const parsed = JSON.parse(raw);
        return {
            highScore: Number(parsed.highScore) || 0,
            totalCoins: Number(parsed.totalCoins) || 0
        };
    } catch (error) {
        console.warn('Failed to parse save data', error);
        return { highScore: 0, totalCoins: 0 };
    }
}

export function saveStats(partial) {
    const current = loadStats();
    const merged = { ...current, ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
}
