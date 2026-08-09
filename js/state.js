/* =========================================================
   GAME STATE STORE — GameZone v2
   Central reactive state, level calculation, streak manager, pub/sub
   ========================================================= */

"use strict";

const GameState = {
  player: null,
  settings: null,
  daily: null,
  achievements: null,
  listeners: {},

  init() {
    StorageManager.init();
    this.player = StorageManager.loadPlayer();
    this.settings = StorageManager.loadSettings();
    this.daily = StorageManager.loadDaily();
    this.achievements = StorageManager.loadAchievements();

    this.checkStreak();
    this.checkDailyChallengeReset();
  },

  subscribe(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  },

  emit(event, payload) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`[GameState] Subscriber error on ${event}:`, e);
        }
      });
    }
  },

  calculateLevel(xp) {
    return Math.floor(Math.max(0, xp) / 100) + 1;
  },

  addRewards(xpAmount, coinsAmount) {
    const oldXp = this.player.xp;
    const oldLevel = this.calculateLevel(oldXp);

    const gainedXp = Math.max(0, Math.floor(xpAmount));
    const gainedCoins = Math.max(0, Math.floor(coinsAmount));

    this.player.xp += gainedXp;
    this.player.coins += gainedCoins;

    const newLevel = this.calculateLevel(this.player.xp);
    this.player.level = newLevel;

    StorageManager.savePlayer(this.player);
    this.emit("stateChanged", { player: this.player });

    if (newLevel > oldLevel) {
      this.emit("levelUp", { oldLevel, newLevel, xp: this.player.xp, coins: this.player.coins });
    }

    return { gainedXp, gainedCoins, levelUp: newLevel > oldLevel, newLevel };
  },

  getLastDifficulty(gameId) {
    if (!this.player.lastDifficulty) {
      this.player.lastDifficulty = { reflex: "medium", memory: "medium", snake: "medium", brick: "medium", traffic: "medium", math: "medium" };
    }
    return this.player.lastDifficulty[gameId] || "medium";
  },

  setLastDifficulty(gameId, diff) {
    if (!this.player.lastDifficulty) {
      this.player.lastDifficulty = { reflex: "medium", memory: "medium", snake: "medium", brick: "medium", traffic: "medium", math: "medium" };
    }
    this.player.lastDifficulty[gameId] = diff;
    StorageManager.savePlayer(this.player);
  },

  recordGameResult(gameId, score, xpEarned, coinsEarned) {

    this.player.totalGames = (this.player.totalGames || 0) + 1;
    if (!this.player.gamesCompleted[gameId]) this.player.gamesCompleted[gameId] = 0;
    this.player.gamesCompleted[gameId]++;

    const oldBest = this.player.bestScores[gameId] || 0;
    let isNewBest = false;

    if (score > oldBest) {
      this.player.bestScores[gameId] = score;
      isNewBest = true;
    }

    this.updateStreakOnGamePlayed();
    const rewards = this.addRewards(xpEarned, coinsEarned);
    this.updateDailyProgress(gameId, score);

    return {
      score,
      isNewBest,
      oldBest,
      gainedXp: rewards.gainedXp,
      gainedCoins: rewards.gainedCoins,
      levelUp: rewards.levelUp,
      newLevel: rewards.newLevel
    };
  },

  getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  },

  checkStreak() {
    const today = this.getTodayString();
    const lastPlayed = this.player.lastPlayedDate;

    if (!lastPlayed) return;

    const todayDate = new Date(today);
    const lastDate = new Date(lastPlayed);
    const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      // Skipped a day or more
      this.player.dailyStreak = 0;
      StorageManager.savePlayer(this.player);
      this.emit("stateChanged", { player: this.player });
    }
  },

  updateStreakOnGamePlayed() {
    const today = this.getTodayString();
    const lastPlayed = this.player.lastPlayedDate;

    if (!lastPlayed) {
      this.player.dailyStreak = 1;
    } else if (lastPlayed !== today) {
      const todayDate = new Date(today);
      const lastDate = new Date(lastPlayed);
      const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        this.player.dailyStreak = (this.player.dailyStreak || 0) + 1;
      } else {
        this.player.dailyStreak = 1;
      }
    }

    this.player.lastPlayedDate = today;
    StorageManager.savePlayer(this.player);
    this.emit("stateChanged", { player: this.player });
  },

  checkDailyChallengeReset() {
    const today = this.getTodayString();
    if (this.daily.date !== today) {
      // Date-seeded challenge choice
      const games = ["reflex", "memory", "snake", "brick", "traffic", "math"];
      const dayHash = today.split("-").reduce((acc, part) => acc + parseInt(part), 0);
      const chosenGame = games[dayHash % games.length];

      const targetScores = {
        reflex: 20,
        memory: 80,
        snake: 15,
        brick: 250,
        traffic: 20,
        math: 15
      };

      this.daily = {
        version: 1,
        date: today,
        challengeId: `daily_${today}`,
        game: chosenGame,
        targetScore: targetScores[chosenGame],
        progress: 0,
        completed: false,
        claimed: false
      };
      StorageManager.saveDaily(this.daily);
    }
  },

  updateDailyProgress(gameId, score) {
    if (this.daily.game === gameId && !this.daily.completed) {
      if (score >= this.daily.targetScore) {
        this.daily.progress = this.daily.targetScore;
        this.daily.completed = true;
        StorageManager.saveDaily(this.daily);
        this.emit("dailyCompleted", this.daily);
      } else if (score > this.daily.progress) {
        this.daily.progress = score;
        StorageManager.saveDaily(this.daily);
      }
    }
  },

  claimDailyReward() {
    if (this.daily.completed && !this.daily.claimed) {
      this.daily.claimed = true;
      StorageManager.saveDaily(this.daily);
      this.addRewards(50, 100);
      this.emit("dailyClaimed");
      return true;
    }
    return false;
  },

  unlockAchievement(id, title, desc, xpReward = 50, coinsReward = 50) {
    if (!this.achievements.unlocked.includes(id)) {
      this.achievements.unlocked.push(id);
      StorageManager.saveAchievements(this.achievements);
      this.addRewards(xpReward, coinsReward);
      this.emit("achievementUnlocked", { id, title, desc, xpReward, coinsReward });
      return true;
    }
    return false;
  },

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    StorageManager.saveSettings(this.settings);
    this.emit("settingsChanged", this.settings);
  },

  resetAllProgress() {
    StorageManager.clearAllData();
    this.init();
    this.emit("stateReset");
    this.emit("stateChanged", { player: this.player });
  }
};
