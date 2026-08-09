/* =========================================================
   REFLEX RUSH GAME CONTROLLER — GameZone v2
   30s reaction timer, shrinking targets, ms accuracy, combos,
   difficulty selection (Easy / Medium / Hard)
   ========================================================= */

"use strict";

const ReflexGame = {
  container: null,
  timerId: null,
  spawnTimerId: null,
  timeLeft: 30,
  score: 0,
  totalTaps: 0,
  successfulHits: 0,
  reactionTimes: [],
  targetSpawnTime: 0,
  combo: null,
  isRunning: false,
  activeTargetEl: null,
  difficulty: "medium",

  init(container, diff = "medium") {
    this.container = container;
    this.difficulty = diff || "medium";
    this.combo = new ComboTracker();
    this.resetStats();
    this.renderLayout();
  },

  resetStats() {
    this.timeLeft = 30;
    this.score = 0;
    this.totalTaps = 0;
    this.successfulHits = 0;
    this.reactionTimes = [];
    this.combo.reset();
    this.isRunning = false;
  },

  renderLayout() {
    if (!this.container) return;

    const lastDiff = GameState.getLastDifficulty("reflex");

    this.container.innerHTML = `
      <div class="reflex-game-shell">
        <div class="reflex-hud">
          <div class="hud-box"><span class="hud-label">TIME</span><b id="reflexTimer">30s</b></div>
          <div class="hud-box"><span class="hud-label">SCORE</span><b id="reflexScore">0</b></div>
          <div class="hud-box"><span class="hud-label">AVG RXN</span><b id="reflexRxn">0ms</b></div>
          <div class="hud-box"><span class="hud-label">ACCURACY</span><b id="reflexAcc">100%</b></div>
        </div>
        <div id="reflexPlayfield" class="reflex-playfield">
          <!-- DIFFICULTY SELECT PROMPT -->
          <div id="diffSelectPrompt" class="diff-select-shell">
            <div class="prompt-icon">🎯</div>
            <h3>Reflex Rush</h3>
            <p>Select your challenge level to begin</p>
            <div class="diff-options-grid">
              <button class="diff-card easy ${lastDiff === 'easy' ? 'selected' : ''}" data-diff="easy">
                <span class="diff-icon">🌱</span>
                <div class="diff-info">
                  <h4>EASY</h4>
                  <p>Larger targets & relaxed speed</p>
                </div>
              </button>
              <button class="diff-card medium ${lastDiff === 'medium' ? 'selected' : ''}" data-diff="medium">
                <span class="diff-icon">⚡</span>
                <div class="diff-info">
                  <h4>MEDIUM</h4>
                  <p>Standard target size & speed</p>
                </div>
              </button>
              <button class="diff-card hard ${lastDiff === 'hard' ? 'selected' : ''}" data-diff="hard">
                <span class="diff-icon">🔥</span>
                <div class="diff-info">
                  <h4>HARD</h4>
                  <p>Tiny targets & rapid spawn rate</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.querySelectorAll(".diff-card").forEach(btn => {
      btn.addEventListener("click", () => {
        const diff = btn.getAttribute("data-diff");
        App.setDifficultyAndStart(diff);
      });
    });

    const playfield = this.container.querySelector("#reflexPlayfield");
    if (playfield) {
      playfield.addEventListener("click", (e) => {
        if (!this.isRunning) return;
        if (e.target === playfield || e.target.classList.contains("reflex-playfield")) {
          this.handleMiss(e.clientX, e.clientY);
        }
      });
    }
  },

  start(diff = "medium") {
    this.difficulty = diff;
    this.resetStats();
    this.isRunning = true;

    const prompt = this.container.querySelector("#diffSelectPrompt");
    if (prompt) prompt.style.display = "none";

    this.updateHUD();

    this.timerId = setInterval(() => {
      this.timeLeft--;
      const timerEl = document.getElementById("reflexTimer");
      if (timerEl) timerEl.textContent = `${this.timeLeft}s`;

      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);

    this.spawnTarget();
  },

  spawnTarget() {
    if (!this.isRunning) return;

    const playfield = this.container.querySelector("#reflexPlayfield");
    if (!playfield) return;

    if (this.activeTargetEl) {
      this.activeTargetEl.remove();
      this.activeTargetEl = null;
    }

    const rect = playfield.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const progress = 1 - this.timeLeft / 30;

    let baseSize = 60, minSize = 38, timeoutBase = 1100;
    if (this.difficulty === "easy") { baseSize = 72; minSize = 48; timeoutBase = 1400; }
    else if (this.difficulty === "hard") { baseSize = 48; minSize = 26; timeoutBase = 800; }

    const targetSize = Math.max(minSize, Math.floor(baseSize - progress * 24));
    const maxX = rect.width - targetSize - 20;
    const maxY = rect.height - targetSize - 20;

    const posX = Math.max(10, Math.floor(Math.random() * maxX));
    const posY = Math.max(10, Math.floor(Math.random() * maxY));

    const target = document.createElement("button");
    target.className = "reflex-target";
    target.style.cssText = `
      position: absolute;
      left: ${posX}px;
      top: ${posY}px;
      width: ${targetSize}px;
      height: ${targetSize}px;
      border-radius: 50%;
      background: radial-gradient(circle, #06b6d4 0%, #6366f1 100%);
      border: 3px solid #ffffff;
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.8);
      cursor: pointer;
      z-index: 10;
      animation: targetPulse 0.35s ease-out;
    `;

    this.targetSpawnTime = performance.now();

    target.addEventListener("click", (e) => {
      e.stopPropagation();
      this.handleHit(target, e.clientX, e.clientY);
    });

    playfield.appendChild(target);
    this.activeTargetEl = target;

    const timeoutMs = Math.max(500, Math.floor(timeoutBase - progress * 400));
    clearTimeout(this.spawnTimerId);
    this.spawnTimerId = setTimeout(() => {
      if (this.isRunning && this.activeTargetEl === target) {
        this.combo.reset();
        this.spawnTarget();
      }
    }, timeoutMs);
  },

  handleHit(targetEl, clientX, clientY) {
    if (!this.isRunning) return;

    clearTimeout(this.spawnTimerId);

    const rxnTime = Math.round(performance.now() - this.targetSpawnTime);
    this.reactionTimes.push(rxnTime);

    this.successfulHits++;
    this.totalTaps++;

    const comboVal = this.combo.hit();
    const isPerfect = rxnTime < (this.difficulty === "hard" ? 200 : 250);
    const basePts = isPerfect ? 3 : 1;
    const pts = Math.floor(basePts * this.combo.getMultiplier());

    this.score += pts;

    SoundManager.playClick();
    SoundManager.vibrate(30);

    ParticleEngine.burstDOM(targetEl, isPerfect ? 16 : 8);
    Animations.floatXP(clientX, clientY, isPerfect ? 15 : 5);

    if (comboVal > 2) {
      Animations.showComboPop(this.container.querySelector("#reflexPlayfield"), comboVal);
    }

    if (isPerfect) {
      this.showPerfectPopup(clientX, clientY);
    }

    targetEl.remove();
    this.activeTargetEl = null;

    this.updateHUD();
    this.spawnTarget();
  },

  handleMiss(clientX, clientY) {
    this.totalTaps++;
    this.combo.reset();
    this.updateHUD();
  },

  showPerfectPopup(x, y) {
    const pop = document.createElement("div");
    pop.textContent = "⚡ PERFECT!";
    pop.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -100%);
      color: #eab308;
      font-weight: 900;
      font-size: 14px;
      pointer-events: none;
      z-index: 1000;
      animation: floatUp 0.5s ease-out forwards;
    `;
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 500);
  },

  updateHUD() {
    const scoreEl = document.getElementById("reflexScore");
    const rxnEl = document.getElementById("reflexRxn");
    const accEl = document.getElementById("reflexAcc");

    if (scoreEl) scoreEl.textContent = this.score;

    if (rxnEl && this.reactionTimes.length > 0) {
      const avg = Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length);
      rxnEl.textContent = `${avg}ms`;
    }

    if (accEl) {
      const acc = this.totalTaps > 0 ? Math.round((this.successfulHits / this.totalTaps) * 100) : 100;
      accEl.textContent = `${acc}%`;
    }
  },

  endGame() {
    this.isRunning = false;
    clearInterval(this.timerId);
    clearTimeout(this.spawnTimerId);

    if (this.activeTargetEl) {
      this.activeTargetEl.remove();
      this.activeTargetEl = null;
    }

    const accuracy = this.totalTaps > 0 ? Math.round((this.successfulHits / this.totalTaps) * 100) : 0;
    const diffMult = this.difficulty === "hard" ? 1.5 : this.difficulty === "easy" ? 0.8 : 1.0;
    const finalScore = Math.floor(this.score * diffMult);

    const xpEarned = Math.floor(finalScore * 2.5 + (accuracy > 80 ? 20 : 0));
    const coinsEarned = Math.floor(finalScore * 1.5);

    const recordResult = GameState.recordGameResult("reflex", finalScore, xpEarned, coinsEarned);

    if (finalScore >= 20) {
      GameState.unlockAchievement("reflex", "Reflex Master", "Score 20+ in Reflex Rush");
    }

    UI.showResultModal({
      gameId: "reflex",
      score: finalScore,
      isNewBest: recordResult.isNewBest,
      xpEarned: recordResult.gainedXp,
      coinsEarned: recordResult.gainedCoins,
      maxCombo: this.combo.maxCombo,
      onPlayAgain: () => this.start(this.difficulty),
      onHome: () => App.navigateTo(Screens.HOME)
    });
  },

  destroy() {
    this.isRunning = false;
    clearInterval(this.timerId);
    clearTimeout(this.spawnTimerId);
    if (this.activeTargetEl) {
      this.activeTargetEl.remove();
      this.activeTargetEl = null;
    }
    if (this.container) {
      this.container.innerHTML = "";
    }
  }
};

if (typeof App !== "undefined" && typeof App.registerGame === "function") {
  App.registerGame("reflex", ReflexGame);
} else {
  window.addEventListener("DOMContentLoaded", () => {
    if (typeof App !== "undefined") {
      App.registerGame("reflex", ReflexGame);
    }
  });
}
