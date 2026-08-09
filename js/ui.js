/* =========================================================
   UI MANAGER & SHARED COMPONENTS — GameZone v2
   Shared Result Modal, SVG Navigation Tabs, Theme Switcher,
   Profile, Achievements & Settings Screens
   ========================================================= */

"use strict";

class ComboTracker {
  constructor() {
    this.count = 0;
    this.maxCombo = 0;
  }

  hit() {
    this.count++;
    if (this.count > this.maxCombo) {
      this.maxCombo = this.count;
    }
    return this.count;
  }

  reset() {
    this.count = 0;
  }

  getMultiplier() {
    if (this.count < 3) return 1.0;
    if (this.count < 6) return 1.25;
    if (this.count < 10) return 1.5;
    return 2.0;
  }
}

const UI = {
  toastTimer: null,

  init() {
    this.applyTheme(GameState.settings?.theme || "dark");
  },

  applyTheme(theme) {
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  },

  toast(message) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      el.classList.remove("show");
    }, 2200);
  },

  showResultModal({ gameId, score, isNewBest, xpEarned, coinsEarned, maxCombo = 0, onPlayAgain, onHome }) {
    const overlay = document.getElementById("modalOverlay");
    if (!overlay) return;

    SoundManager.playGameOver();

    const titles = {
      reflex: "Reflex Rush",
      memory: "Memory Flip",
      snake: "Snake Rush",
      brick: "Brick Breaker",
      traffic: "Traffic Dodge",
      math: "Math Blitz"
    };

    const gameTitle = titles[gameId] || "Game";

    overlay.innerHTML = `
      <div class="modal-card result-card">
        <div class="result-header">
          <span class="eyebrow">${gameTitle.toUpperCase()}</span>
          <h2>GAME OVER</h2>
        </div>

        <div class="result-score-block">
          <div class="result-score-val" id="resultAnimScore">0</div>
          ${isNewBest ? '<div class="new-best-badge">🏆 NEW BEST!</div>' : ''}
        </div>

        <div class="result-rewards-row">
          <div class="reward-pill">+<span id="resultAnimXp">0</span> XP</div>
          <div class="reward-pill">+<span id="resultAnimCoins">0</span> 🪙</div>
          ${maxCombo > 1 ? `<div class="reward-pill combo-pill">COMBO x${maxCombo}</div>` : ''}
        </div>

        <div class="modal-actions" style="margin-top: 18px; gap: 10px;">
          <button id="resultHomeBtn" class="btn ghost-btn compact-result-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-micro"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>HOME</span>
          </button>
          <button id="resultPlayAgainBtn" class="btn primary-btn compact-result-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-micro"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            <span>PLAY AGAIN</span>
          </button>
        </div>
      </div>
    `;


    overlay.classList.add("show");

    if (isNewBest) {
      ParticleEngine.burstDOM(document.querySelector(".result-card"), 20);
    }

    this.animateCountUp("resultAnimScore", score, 800);
    this.animateCountUp("resultAnimXp", xpEarned, 600);
    this.animateCountUp("resultAnimCoins", coinsEarned, 600);

    // Debounced click handlers
    const homeBtn = document.getElementById("resultHomeBtn");
    const playBtn = document.getElementById("resultPlayAgainBtn");

    if (homeBtn) {
      homeBtn.onclick = () => {
        overlay.classList.remove("show");
        if (typeof onHome === "function") onHome();
        else App.navigateTo(Screens.HOME);
      };
    }

    if (playBtn) {
      playBtn.onclick = () => {
        overlay.classList.remove("show");
        if (typeof onPlayAgain === "function") onPlayAgain();
        else App.launchGame(gameId, true);
      };
    }
  },

  animateCountUp(elementId, targetValue, durationMs = 600) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const startVal = 0;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const current = Math.floor(startVal + (targetValue - startVal) * progress);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = targetValue;
      }
    };

    requestAnimationFrame(update);
  },

  renderScreen(screenName) {
    if (screenName === Screens.PROFILE) this.renderProfile();
    else if (screenName === Screens.ACHIEVEMENTS) this.renderAchievements();
    else if (screenName === Screens.SETTINGS) this.renderSettings();
    else if (screenName === Screens.HOME) this.renderHome();
  },

  renderHome() {
    const daily = GameState.daily;
    if (!daily) return;
    
    const title = document.getElementById("dailyTitle");
    const desc = document.getElementById("dailyDesc");
    const bar = document.getElementById("dailyProgressBar");
    const btn = document.getElementById("dailyClaimBtn");

    const gameNames = {
      reflex: "Reflex Rush",
      memory: "Memory Flip",
      snake: "Snake Rush",
      brick: "Brick Breaker",
      traffic: "Traffic Dodge",
      math: "Math Blitz"
    };

    if (title) title.textContent = `${gameNames[daily.game] || "Daily"} Master`;
    if (desc) desc.textContent = `Score at least ${daily.targetScore} in ${gameNames[daily.game]} today (+50 XP, +100 Coins)`;
    
    const pct = Math.min(100, Math.floor((daily.progress / daily.targetScore) * 100));
    if (bar) bar.style.width = `${pct}%`;

    if (btn) {
      if (daily.claimed) {
        btn.textContent = "Claimed ✓";
        btn.disabled = true;
        btn.onclick = null;
      } else if (daily.completed) {
        btn.textContent = "Claim Reward!";
        btn.disabled = false;
        btn.onclick = () => {
          if (GameState.claimDailyReward()) {
            this.toast("🎁 Daily reward claimed: +50 XP, +100 Coins!");
            this.renderHome();
          }
        };
      } else {
        btn.textContent = "Play Quest";
        btn.disabled = false;
        btn.onclick = () => {
          App.launchGame(daily.game);
        };
      }
    }
  },

  renderProfile() {
    const container = document.getElementById("profileContent");
    if (!container) return;
    const p = GameState.player;

    const gameDetails = {
      reflex: { name: "Reflex Rush", svg: GameIcons.games.reflex },
      memory: { name: "Memory Flip", svg: GameIcons.games.memory },
      snake: { name: "Snake Rush", svg: GameIcons.games.snake },
      brick: { name: "Brick Breaker", svg: GameIcons.games.brick },
      traffic: { name: "Traffic Dodge", svg: GameIcons.games.traffic },
      math: { name: "Math Blitz", svg: GameIcons.games.math }
    };

    let favoriteGame = "None yet";
    let maxPlayed = 0;
    if (p.gamesCompleted) {
      Object.entries(p.gamesCompleted).forEach(([gid, count]) => {
        if (count > maxPlayed) {
          maxPlayed = count;
          favoriteGame = gameDetails[gid]?.name || gid;
        }
      });
    }

    let bestScoresHtml = "";
    Object.keys(p.bestScores).forEach(g => {
      const detail = gameDetails[g] || { name: g, svg: GameIcons.games.reflex };
      bestScoresHtml += `
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-icon-wrap">${detail.svg}</span>
            <span class="stat-label">${detail.name}</span>
          </div>
          <b class="stat-value">${p.bestScores[g]}</b>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="profile-summary">
        <div class="avatar-large">${GameIcons.controller}</div>
        <h3>Arcade Master</h3>
        <div class="pill-row">
          <span class="pill level-pill">Level ${p.level}</span>
          <span class="pill streak-pill">${GameIcons.fire} ${p.dailyStreak || 0} Day Streak</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card primary">
          <span class="stat-label">Total Coins</span>
          <b class="stat-value">${GameIcons.coin} ${p.coins}</b>
        </div>
        <div class="stat-card primary">
          <span class="stat-label">Total XP</span>
          <b class="stat-value">${GameIcons.star} ${p.xp}</b>
        </div>
        <div class="stat-card primary">
          <span class="stat-label">Games Played</span>
          <b class="stat-value">${GameIcons.controller} ${p.totalGames || 0}</b>
        </div>
      </div>

      <div class="favorite-game-box">
        <span class="stat-label">FAVORITE GAME</span>
        <b class="stat-value">${GameIcons.heart} ${favoriteGame} ${maxPlayed > 0 ? `(${maxPlayed} plays)` : ''}</b>
      </div>

      <div class="section-title">Personal High Scores</div>
      <div class="stats-grid">
        ${bestScoresHtml}
      </div>
    `;
  },

  renderAchievements() {
    const container = document.getElementById("achievementsContent");
    if (!container) return;

    const achievementsList = [
      { id: "reflex", title: "Reflex Master", desc: "Score 20+ in Reflex Rush", svg: GameIcons.games.reflex, reward: "+50 XP, +50 Coins" },
      { id: "memory", title: "Memory Genius", desc: "Score 100+ in Memory Flip", svg: GameIcons.games.memory, reward: "+50 XP, +50 Coins" },
      { id: "snake", title: "Snake Wrangler", desc: "Score 15+ in Snake Rush", svg: GameIcons.games.snake, reward: "+50 XP, +50 Coins" },
      { id: "brick", title: "Brick Destroyer", desc: "Score 300+ in Brick Breaker", svg: GameIcons.games.brick, reward: "+50 XP, +50 Coins" },
      { id: "traffic", title: "Road Warrior", desc: "Score 20+ in Traffic Dodge", svg: GameIcons.games.traffic, reward: "+50 XP, +50 Coins" },
      { id: "math", title: "Math Prodigy", desc: "Score 15+ in Math Blitz", svg: GameIcons.games.math, reward: "+50 XP, +50 Coins" }
    ];

    const unlocked = GameState.achievements?.unlocked || [];

    let html = `<div class="achievements-list">`;
    achievementsList.forEach(item => {
      const isUnlocked = unlocked.includes(item.id);
      html += `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}" id="ach-${item.id}">
          <div class="achievement-icon">${item.svg}</div>
          <div class="achievement-info">
            <h4>${item.title}</h4>
            <p>${item.desc}</p>
            <span class="achievement-reward">${item.reward}</span>
          </div>
          <div class="achievement-status">${isUnlocked ? 'UNLOCKED ✓' : 'LOCKED 🔒'}</div>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;

    achievementsList.forEach(item => {
      if (unlocked.includes(item.id)) {
        document.getElementById(`ach-${item.id}`)?.addEventListener("click", (e) => {
          SoundManager.playCoin();
          ParticleEngine.burstDOM(e.currentTarget, 12);
        });
      }
    });
  },

  renderSettings() {
    const container = document.getElementById("settingsContent");
    if (!container) return;
    const s = GameState.settings;

    const currentTheme = s.theme || "dark";

    container.innerHTML = `
      <div class="settings-list">
        <!-- THEME TOGGLE ROW (FIX 6) -->
        <div class="setting-item">
          <div>
            <h4>Theme Mode</h4>
            <p>Switch between dark arcade and clean light mode</p>
          </div>
          <div class="segmented-theme-picker">
            <button class="theme-btn ${currentTheme === 'dark' ? 'active' : ''}" id="themeDarkBtn">Dark</button>
            <button class="theme-btn ${currentTheme === 'light' ? 'active' : ''}" id="themeLightBtn">Light</button>
          </div>
        </div>

        <div class="setting-item">
          <div>
            <h4>Sound Effects</h4>
            <p>Play retro game audio synthesized via Web Audio</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="settingSound" ${s.sound !== false ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div>
            <h4>Haptic Vibration</h4>
            <p>Vibrate device on hits, combos & level-ups</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="settingVibration" ${s.vibration !== false ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div>
            <h4>UI Animations</h4>
            <p>Enable particle effects and smooth floating text</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="settingAnimations" ${s.animations !== false ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="danger-zone" style="margin-top: 20px;">
          <button id="resetProgressBtn" class="btn danger-btn">Reset All Progress</button>
        </div>
      </div>
    `;

    // Bind Theme Buttons
    document.getElementById("themeDarkBtn")?.addEventListener("click", () => {
      GameState.updateSettings({ theme: "dark" });
      this.applyTheme("dark");
      this.renderSettings();
    });

    document.getElementById("themeLightBtn")?.addEventListener("click", () => {
      GameState.updateSettings({ theme: "light" });
      this.applyTheme("light");
      this.renderSettings();
    });

    document.getElementById("settingSound")?.addEventListener("change", (e) => {
      GameState.updateSettings({ sound: e.target.checked });
      SoundManager.playClick();
    });
    document.getElementById("settingVibration")?.addEventListener("change", (e) => {
      GameState.updateSettings({ vibration: e.target.checked });
      SoundManager.vibrate(50);
    });
    document.getElementById("settingAnimations")?.addEventListener("change", (e) => {
      GameState.updateSettings({ animations: e.target.checked });
    });

    document.getElementById("resetProgressBtn")?.addEventListener("click", () => {
      this.showResetConfirmation();
    });
  },

  showResetConfirmation() {
    const modalOverlay = document.getElementById("modalOverlay");
    if (!modalOverlay) return;

    modalOverlay.innerHTML = `
      <div class="modal-card">
        <h3>Reset All Progress?</h3>
        <p>This will erase your level, XP, coins, high scores and achievements. This cannot be undone.</p>
        <div class="modal-actions">
          <button id="cancelResetBtn" class="btn ghost-btn" style="flex: 1;">Cancel</button>
          <button id="confirmResetBtn" class="btn danger-btn" style="flex: 1;">Yes, Reset</button>
        </div>
      </div>
    `;
    modalOverlay.classList.add("show");

    document.getElementById("cancelResetBtn")?.addEventListener("click", () => {
      modalOverlay.classList.remove("show");
    });
    document.getElementById("confirmResetBtn")?.addEventListener("click", () => {
      modalOverlay.classList.remove("show");
      GameState.resetAllProgress();
      this.toast("Progress reset cleanly.");
      App.navigateTo(Screens.HOME);
    });
  }
};

// Initialize UI theme on boot
document.addEventListener("DOMContentLoaded", () => {
  UI.init();
});

GameState.subscribe("achievementUnlocked", (data) => {
  SoundManager.playSuccess();
  UI.toast(`🏅 Achievement Unlocked: ${data.title}! (+${data.xpReward} XP, +${data.coinsReward} Coins)`);
});
