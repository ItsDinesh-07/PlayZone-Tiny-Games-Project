/* =========================================================
   APP CORE & SCREEN STATE MACHINE — GameZone v2
   Single-screen controller, full-screen game mode, difficulty selector
   ========================================================= */

"use strict";

const Screens = {
  HOME: "home",
  GAME_ACTIVE: "game",
  PROFILE: "profile",
  ACHIEVEMENTS: "achievements",
  SETTINGS: "settings"
};

const App = {
  currentScreen: Screens.HOME,
  currentGameId: null,
  activeDifficulty: "medium",
  activeGameController: null,
  gameRegistry: {},

  registerGame(gameId, controller) {
    this.gameRegistry[gameId] = controller;
  },

  init() {
    GameState.init();
    this.bindDOMEvents();
    this.updateHeaderUI();
    this.updateNavUI();

    GameState.subscribe("stateChanged", () => {
      this.updateHeaderUI();
    });

    this.navigateTo(Screens.HOME);
  },

  bindDOMEvents() {
    // Game card taps
    document.querySelectorAll(".game-card").forEach(card => {
      card.addEventListener("click", () => {
        const gameId = card.getAttribute("data-game");
        if (gameId) {
          this.launchGame(gameId);
        }
      });
    });

    // Bottom Navigation taps
    document.querySelectorAll(".nav-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const navTarget = btn.getAttribute("data-nav");
        if (navTarget === "home" || navTarget === "games") this.navigateTo(Screens.HOME);
        else if (navTarget === "profile") this.navigateTo(Screens.PROFILE);
        else if (navTarget === "achievements") this.navigateTo(Screens.ACHIEVEMENTS);
        else if (navTarget === "settings") this.navigateTo(Screens.SETTINGS);
      });
    });

    // Back button in Game Screen
    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.exitCurrentGame();
        this.navigateTo(Screens.HOME);
      });
    }

    // Restart button in Game Screen
    const restartBtn = document.getElementById("restartBtn");
    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        if (this.currentGameId && this.activeGameController) {
          if (typeof this.activeGameController.destroy === "function") {
            this.activeGameController.destroy();
          }
          this.launchGame(this.currentGameId, true);
        }
      });
    }

    // Close buttons on Modals / Screens
    document.querySelectorAll(".close-screen-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.navigateTo(Screens.HOME);
      });
    });

    // Handle window resize for active canvas games
    window.addEventListener("resize", () => {
      if (this.activeGameController && typeof this.activeGameController.handleResize === "function") {
        this.activeGameController.handleResize();
      }
    });
  },

  updateHeaderUI() {
    const p = GameState.player;
    if (!p) return;

    const coinsEl = document.getElementById("coins");
    const xpEl = document.getElementById("xp");
    const levelEl = document.getElementById("level");
    const streakEl = document.getElementById("streakCount");

    if (coinsEl) coinsEl.textContent = p.coins;
    if (xpEl) xpEl.textContent = p.xp;
    if (levelEl) levelEl.textContent = p.level;
    if (streakEl) streakEl.textContent = p.dailyStreak || 0;

    const gamesPlayed = document.getElementById("gamesPlayed");
    const progressXp = document.getElementById("progressXp");
    const achievementCount = document.getElementById("achievementCount");
    const xpBar = document.getElementById("xpBar");
    const nextLevelText = document.getElementById("nextLevelText");

    if (gamesPlayed) gamesPlayed.textContent = p.totalGames || 0;
    if (progressXp) progressXp.textContent = p.xp;
    if (achievementCount) {
      const total = 6;
      const count = GameState.achievements?.unlocked?.length || 0;
      achievementCount.textContent = `${count}/${total}`;
    }

    const currentXPInLevel = p.xp % 100;
    if (xpBar) xpBar.style.width = `${currentXPInLevel}%`;
    if (nextLevelText) nextLevelText.textContent = `${100 - currentXPInLevel} XP`;

    Object.keys(p.bestScores).forEach(gameId => {
      const scoreEl = document.getElementById(`best-${gameId}`);
      if (scoreEl) scoreEl.textContent = p.bestScores[gameId];
    });
  },

  updateNavUI() {
    document.querySelectorAll(".nav-item").forEach(item => {
      const target = item.getAttribute("data-nav");
      const isActive = (
        (target === "home" && this.currentScreen === Screens.HOME) ||
        (target === "profile" && this.currentScreen === Screens.PROFILE) ||
        (target === "achievements" && this.currentScreen === Screens.ACHIEVEMENTS) ||
        (target === "settings" && this.currentScreen === Screens.SETTINGS)
      );

      if (isActive) item.classList.add("active");
      else item.classList.remove("active");

      const iconBox = item.querySelector(".nav-icon-box");
      const keyMap = { home: "home", games: "home", profile: "profile", achievements: "badges", settings: "settings" };
      const iconKey = keyMap[target];
      if (iconBox && GameIcons.nav[iconKey]) {
        iconBox.innerHTML = isActive ? GameIcons.nav[iconKey].active : GameIcons.nav[iconKey].inactive;
      }
    });
  },


  navigateTo(screenName) {
    if (this.currentScreen === Screens.GAME_ACTIVE && screenName !== Screens.GAME_ACTIVE) {
      this.exitCurrentGame();
    }

    this.currentScreen = screenName;

    // Toggle full-screen game mode (hides main topbar & bottom nav)
    if (screenName === Screens.GAME_ACTIVE) {
      document.body.classList.add("game-mode-active");
    } else {
      document.body.classList.remove("game-mode-active");
    }

    // Hide all screens
    document.querySelectorAll(".screen").forEach(s => {
      s.classList.remove("active");
    });

    let targetEl = null;
    if (screenName === Screens.HOME) targetEl = document.getElementById("homeScreen");
    else if (screenName === Screens.GAME_ACTIVE) targetEl = document.getElementById("gameScreen");
    else if (screenName === Screens.PROFILE) targetEl = document.getElementById("profileScreen");
    else if (screenName === Screens.ACHIEVEMENTS) targetEl = document.getElementById("achievementsScreen");
    else if (screenName === Screens.SETTINGS) targetEl = document.getElementById("settingsScreen");

    if (targetEl) {
      targetEl.classList.add("active");
    }

    this.updateNavUI();
    this.updateHeaderUI();

    if (typeof UI !== "undefined" && typeof UI.renderScreen === "function") {
      UI.renderScreen(screenName);
    }
  },

  launchGame(gameId, isRestart = false) {
    const controller = this.gameRegistry[gameId];

    if (this.activeGameController && typeof this.activeGameController.destroy === "function") {
      this.activeGameController.destroy();
      this.activeGameController = null;
    }

    this.currentGameId = gameId;
    this.activeDifficulty = GameState.getLastDifficulty(gameId);

    // Activate game views
    document.querySelectorAll(".game-view").forEach(v => v.classList.remove("active"));
    const viewId = `game${gameId.charAt(0).toUpperCase() + gameId.slice(1)}`;
    const gameViewEl = document.getElementById(viewId);
    if (gameViewEl) {
      gameViewEl.innerHTML = "";
      gameViewEl.classList.add("active");
    }

    const titles = {
      reflex: "Reflex Rush",
      memory: "Memory Flip",
      snake: "Snake Rush",
      brick: "Brick Breaker",
      traffic: "Traffic Dodge",
      math: "Math Blitz"
    };

    const titleEl = document.getElementById("gameTitle");
    if (titleEl) titleEl.textContent = titles[gameId] || "Mini Game";

    this.updateDifficultyBadge(this.activeDifficulty);
    this.navigateTo(Screens.GAME_ACTIVE);

    if (controller) {
      this.activeGameController = controller;
      if (typeof controller.init === "function") {
        controller.init(gameViewEl, this.activeDifficulty);
      }
    } else {
      if (gameViewEl) {
        gameViewEl.innerHTML = `<div class="placeholder-msg">🎮 Game module [${gameId}] ready.</div>`;
      }
    }
  },

  updateDifficultyBadge(diff) {
    const badge = document.getElementById("gameDiffBadge");
    if (!badge) return;
    badge.textContent = diff.toUpperCase();
    badge.className = `diff-badge ${diff}`;
  },

  setDifficultyAndStart(diff) {
    this.activeDifficulty = diff;
    if (this.currentGameId) {
      GameState.setLastDifficulty(this.currentGameId, diff);
    }
    this.updateDifficultyBadge(diff);

    if (this.activeGameController && typeof this.activeGameController.start === "function") {
      this.activeGameController.start(diff);
    }
  },

  exitCurrentGame() {
    if (this.activeGameController) {
      if (typeof this.activeGameController.destroy === "function") {
        this.activeGameController.destroy();
      }
      this.activeGameController = null;
    }
    this.currentGameId = null;
    document.body.classList.remove("game-mode-active");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
