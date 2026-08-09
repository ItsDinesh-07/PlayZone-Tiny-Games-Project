/* =========================================================
   STORAGE MANAGER — GameZone v2
   Versioned LocalStorage, corruption recovery, legacy migration
   ========================================================= */

"use strict";

const STORAGE_KEYS = {
  PLAYER: "gameZonePlayer",
  SETTINGS: "gameZoneSettings",
  DAILY: "gameZoneDaily",
  ACHIEVEMENTS: "gameZoneAchievements",
  LEGACY: "gameZoneState_v1"
};

const DEFAULT_PLAYER_STATE = {
  version: 1,
  level: 1,
  xp: 0,
  coins: 0,
  totalGames: 0,
  dailyStreak: 0,
  lastPlayedDate: null,
  bestScores: {
    reflex: 0,
    memory: 0,
    snake: 0,
    brick: 0,
    traffic: 0,
    math: 0
  },
  lastDifficulty: {
    reflex: "medium",
    memory: "medium",
    snake: "medium",
    brick: "medium",
    traffic: "medium",
    math: "medium"
  },
  gamesCompleted: {

    reflex: 0,
    memory: 0,
    snake: 0,
    brick: 0,
    traffic: 0,
    math: 0
  }
};

const DEFAULT_SETTINGS_STATE = {
  version: 1,
  sound: true,
  music: true,
  vibration: true,
  animations: true
};

const DEFAULT_DAILY_STATE = {
  version: 1,
  date: null,
  challengeId: null,
  targetScore: 0,
  game: null,
  progress: 0,
  completed: false,
  claimed: false
};

const DEFAULT_ACHIEVEMENTS_STATE = {
  version: 1,
  unlocked: []
};

const StorageManager = {
  init() {
    this.migrateLegacyIfNeeded();
  },

  getStorage(key, fallback) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return structuredClone(fallback);
      const parsed = JSON.parse(item);
      if (typeof parsed !== "object" || parsed === null) return structuredClone(fallback);
      return { ...structuredClone(fallback), ...parsed };
    } catch (e) {
      console.warn(`[StorageManager] Failed to read ${key}, using fallback:`, e);
      return structuredClone(fallback);
    }
  },

  setStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`[StorageManager] Failed to write ${key}:`, e);
    }
  },

  loadPlayer() {
    const data = this.getStorage(STORAGE_KEYS.PLAYER, DEFAULT_PLAYER_STATE);
    data.bestScores = { ...DEFAULT_PLAYER_STATE.bestScores, ...(data.bestScores || {}) };
    data.gamesCompleted = { ...DEFAULT_PLAYER_STATE.gamesCompleted, ...(data.gamesCompleted || {}) };
    return data;
  },

  savePlayer(playerData) {
    this.setStorage(STORAGE_KEYS.PLAYER, playerData);
  },

  loadSettings() {
    return this.getStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS_STATE);
  },

  saveSettings(settingsData) {
    this.setStorage(STORAGE_KEYS.SETTINGS, settingsData);
  },

  loadDaily() {
    return this.getStorage(STORAGE_KEYS.DAILY, DEFAULT_DAILY_STATE);
  },

  saveDaily(dailyData) {
    this.setStorage(STORAGE_KEYS.DAILY, dailyData);
  },

  loadAchievements() {
    const data = this.getStorage(STORAGE_KEYS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS_STATE);
    if (!Array.isArray(data.unlocked)) data.unlocked = [];
    return data;
  },

  saveAchievements(achievementsData) {
    this.setStorage(STORAGE_KEYS.ACHIEVEMENTS, achievementsData);
  },

  migrateLegacyIfNeeded() {
    try {
      const hasNewPlayer = localStorage.getItem(STORAGE_KEYS.PLAYER) !== null;
      const legacyRaw = localStorage.getItem(STORAGE_KEYS.LEGACY);

      if (!hasNewPlayer && legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        if (legacy && typeof legacy === "object") {
          console.log("[StorageManager] Migrating legacy gameZoneState_v1 data...");

          const newPlayer = structuredClone(DEFAULT_PLAYER_STATE);
          newPlayer.coins = Number(legacy.coins) || 0;
          newPlayer.xp = Number(legacy.xp) || 0;
          newPlayer.level = Math.floor(newPlayer.xp / 100) + 1;
          newPlayer.totalGames = Number(legacy.gamesPlayed) || 0;

          if (legacy.best && typeof legacy.best === "object") {
            newPlayer.bestScores = {
              reflex: Number(legacy.best.reflex) || 0,
              memory: Number(legacy.best.memory) || 0,
              snake: Number(legacy.best.snake) || 0,
              brick: Number(legacy.best.brick) || 0,
              traffic: Number(legacy.best.traffic) || 0,
              math: Number(legacy.best.math) || 0
            };
          }

          this.savePlayer(newPlayer);

          if (Array.isArray(legacy.achievements)) {
            this.saveAchievements({
              version: 1,
              unlocked: legacy.achievements
            });
          }

          this.saveSettings(DEFAULT_SETTINGS_STATE);
          this.saveDaily(DEFAULT_DAILY_STATE);
          console.log("[StorageManager] Legacy migration complete. Legacy key left intact.");
        }
      }
    } catch (e) {
      console.warn("[StorageManager] Legacy migration encountered an issue (non-fatal):", e);
    }
  },

  clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.PLAYER);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.DAILY);
      localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
      console.log("[StorageManager] All player data reset.");
    } catch (e) {
      console.error("[StorageManager] Failed to clear data:", e);
    }
  }
};
