/* =========================================================
   TRAFFIC DODGE GAME CONTROLLER — GameZone v2
   Perspective road, cartoon car tilt + wheel rotation,
   near-miss combo detector, impact flash/shake,
   difficulty selection (Easy / Medium / Hard)
   ========================================================= */

"use strict";

const TrafficGame = {
  container: null,
  canvas: null,
  ctx: null,
  rafId: null,
  lastTime: 0,
  score: 0,
  combo: null,
  isRunning: false,
  isGameOver: false,
  difficulty: "medium",

  player: { lane: 1, currentX: 0, targetX: 0, y: 0, width: 44, height: 75, tilt: 0, wheelAngle: 0 },
  lanes: [0, 0, 0],
  laneCount: 3,

  obstacles: [],
  spawnTimer: 0,
  spawnInterval: 1200,
  roadSpeed: 6,

  roadOffset: 0,
  shakeAmount: 0,
  flashAlpha: 0,
  particles: [],
  touchStartX: 0,

  init(container, diff = "medium") {
    this.container = container;
    this.difficulty = diff || "medium";
    this.combo = new ComboTracker();
    this.renderLayout();
  },

  renderLayout() {
    if (!this.container) return;

    const lastDiff = GameState.getLastDifficulty("traffic");

    this.container.innerHTML = `
      <div class="traffic-game-shell">
        <div class="traffic-hud">
          <div class="hud-box"><span class="hud-label">SCORE</span><b id="trafficScore">0</b></div>
          <div class="hud-box"><span class="hud-label">SPEED</span><b id="trafficSpeed">60 MPH</b></div>
          <div class="hud-box"><span class="hud-label">NEAR MISS</span><b id="trafficNearMiss">0</b></div>
          <div class="hud-box"><span class="hud-label">COMBO</span><b id="trafficCombo">x1</b></div>
        </div>
        <div id="trafficPlayfield" class="traffic-playfield">
          <!-- DIFFICULTY SELECT PROMPT -->
          <div id="diffSelectPrompt" class="diff-select-shell">
            <div class="prompt-icon">🚗</div>
            <h3>Traffic Dodge</h3>
            <p>Select your challenge level to begin</p>
            <div class="diff-options-grid">
              <button class="diff-card easy ${lastDiff === 'easy' ? 'selected' : ''}" data-diff="easy">
                <span class="diff-icon">🌱</span>
                <div class="diff-info">
                  <h4>EASY</h4>
                  <p>Slower traffic & relaxed spawn rate</p>
                </div>
              </button>
              <button class="diff-card medium ${lastDiff === 'medium' ? 'selected' : ''}" data-diff="medium">
                <span class="diff-icon">⚡</span>
                <div class="diff-info">
                  <h4>MEDIUM</h4>
                  <p>Standard traffic speed & density</p>
                </div>
              </button>
              <button class="diff-card hard ${lastDiff === 'hard' ? 'selected' : ''}" data-diff="hard">
                <span class="diff-icon">🔥</span>
                <div class="diff-info">
                  <h4>HARD</h4>
                  <p>High speed rush & dense traffic</p>
                </div>
              </button>
            </div>
          </div>

          <canvas id="trafficCanvas"></canvas>
          
          <div class="traffic-controls">
            <button class="lane-btn" id="trafficLeftBtn">◀ LANE</button>
            <button class="lane-btn" id="trafficRightBtn">LANE ▶</button>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector("#trafficCanvas");
    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
    }

    this.container.querySelectorAll(".diff-card").forEach(btn => {
      btn.addEventListener("click", () => {
        const diff = btn.getAttribute("data-diff");
        App.setDifficultyAndStart(diff);
      });
    });

    this.bindControls();
  },

  bindControls() {
    this.keydownHandler = (e) => {
      if (!this.isRunning || this.isGameOver) return;
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") this.moveLane(-1);
      else if (k === "arrowright" || k === "d") this.moveLane(1);
    };
    window.addEventListener("keydown", this.keydownHandler);

    this.container.querySelector("#trafficLeftBtn")?.addEventListener("click", () => this.moveLane(-1));
    this.container.querySelector("#trafficRightBtn")?.addEventListener("click", () => this.moveLane(1));

    const playfield = this.container.querySelector("#trafficPlayfield");
    if (playfield) {
      playfield.addEventListener("touchstart", (e) => {
        if (!this.isRunning) return;
        this.touchStartX = e.touches[0].clientX;
      }, { passive: true });

      playfield.addEventListener("touchend", (e) => {
        if (!this.isRunning || this.isGameOver) return;
        const diffX = e.changedTouches[0].clientX - this.touchStartX;
        if (diffX < -30) this.moveLane(-1);
        else if (diffX > 30) this.moveLane(1);
      }, { passive: true });
    }
  },

  moveLane(dir) {
    const newLane = Math.max(0, Math.min(this.laneCount - 1, this.player.lane + dir));
    if (newLane !== this.player.lane) {
      this.player.lane = newLane;
      this.player.targetX = this.lanes[newLane];
      this.player.tilt = dir * 0.22;
      SoundManager.playClick();
    }
  },

  handleResize() {
    if (!this.canvas || !this.container) return;
    const playfield = this.container.querySelector("#trafficPlayfield");
    if (!playfield) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = playfield.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    if (this.ctx) {
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);
    }

    const roadWidth = Math.min(320, rect.width * 0.85);
    const laneW = roadWidth / 3;
    const roadLeft = (rect.width - roadWidth) / 2;

    this.lanes = [
      roadLeft + laneW * 0.5,
      roadLeft + laneW * 1.5,
      roadLeft + laneW * 2.5
    ];

    this.player.y = rect.height - 110;
    this.player.targetX = this.lanes[this.player.lane];
    if (this.player.currentX === 0) this.player.currentX = this.player.targetX;
  },

  start(diff = "medium") {
    this.difficulty = diff;
    this.handleResize();
    const prompt = this.container.querySelector("#diffSelectPrompt");
    if (prompt) prompt.style.display = "none";

    this.player.lane = 1;
    this.player.currentX = this.lanes[1];
    this.player.targetX = this.lanes[1];
    this.player.tilt = 0;

    if (diff === "easy") {
      this.roadSpeed = 5;
      this.spawnInterval = 1500;
    } else if (diff === "hard") {
      this.roadSpeed = 9.5;
      this.spawnInterval = 800;
    } else {
      this.roadSpeed = 6;
      this.spawnInterval = 1200;
    }

    this.score = 0;
    this.spawnTimer = 0;
    this.obstacles = [];
    this.combo.reset();
    this.isRunning = true;
    this.isGameOver = false;
    this.shakeAmount = 0;
    this.flashAlpha = 0;
    this.particles = [];

    this.updateHUD();

    this.lastTime = performance.now();
    cancelAnimationFrame(this.rafId);
    this.gameLoop(this.lastTime);
  },

  gameLoop(now) {
    if (!this.isRunning) return;

    const dt = Math.min(32, now - this.lastTime);
    this.lastTime = now;

    this.update(dt);
    this.render();

    this.rafId = requestAnimationFrame((t) => this.gameLoop(t));
  },

  update(dt) {
    if (this.isGameOver) return;

    const playfield = this.container.querySelector("#trafficPlayfield");
    if (!playfield) return;
    const rect = playfield.getBoundingClientRect();

    this.roadOffset = (this.roadOffset + this.roadSpeed) % 40;
    this.player.wheelAngle += 0.2;

    this.player.currentX += (this.player.targetX - this.player.currentX) * 0.2;
    this.player.tilt *= 0.85;

    this.score += Math.floor(dt * 0.05);

    const maxSpeed = this.difficulty === "hard" ? 15 : this.difficulty === "easy" ? 9 : 12;
    this.roadSpeed = Math.min(maxSpeed, this.roadSpeed + 0.001 * dt);

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnObstacle();
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.y += obs.speed;

      const dx = Math.abs(this.player.currentX - obs.x);
      const dy = Math.abs(this.player.y - obs.y);

      if (dx < (this.player.width / 2 + obs.width / 2 - 6) && dy < (this.player.height / 2 + obs.height / 2 - 8)) {
        this.triggerCrash();
        return;
      }

      if (!obs.nearMissed && dy < 35 && dx > (this.player.width / 2 + obs.width / 2 - 6) && dx < 65) {
        obs.nearMissed = true;
        this.handleNearMiss(obs);
      }

      if (obs.y > rect.height + 100) {
        this.obstacles.splice(i, 1);
      }
    }

    this.updateHUD();
    ParticleEngine.updateAndDrawCanvasParticles(this.ctx, this.particles);
  },

  spawnObstacle() {
    const laneIndex = Math.floor(Math.random() * this.laneCount);
    const types = [
      { color: "#ef4444", width: 44, height: 75, speed: this.roadSpeed * 0.4 },
      { color: "#eab308", width: 44, height: 75, speed: this.roadSpeed * 0.35 },
      { color: "#3b82f6", width: 50, height: 95, speed: this.roadSpeed * 0.25 }
    ];

    const chosen = types[Math.floor(Math.random() * types.length)];
    this.obstacles.push({
      lane: laneIndex,
      x: this.lanes[laneIndex],
      y: -100,
      width: chosen.width,
      height: chosen.height,
      color: chosen.color,
      speed: chosen.speed + Math.random() * 1.5,
      nearMissed: false
    });
  },

  handleNearMiss(obs) {
    SoundManager.playCoin();
    SoundManager.vibrate(30);

    const comboVal = this.combo.hit();
    const pts = Math.floor(10 * this.combo.getMultiplier());
    this.score += pts;

    const pBurst = ParticleEngine.createCanvasBurst(this.ctx, obs.x, obs.y, "#06b6d4", 10);
    this.particles.push(...pBurst);

    const canvasRect = this.canvas.getBoundingClientRect();
    Animations.floatXP(canvasRect.left + obs.x, canvasRect.top + obs.y, pts);

    this.showNearMissPopup(canvasRect.left + obs.x, canvasRect.top + obs.y);

    if (comboVal > 1) {
      Animations.showComboPop(this.container.querySelector("#trafficPlayfield"), comboVal);
    }
  },

  showNearMissPopup(x, y) {
    const pop = document.createElement("div");
    pop.textContent = "⚡ NEAR MISS! +10";
    pop.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -100%);
      color: #06b6d4;
      font-weight: 900;
      font-size: 14px;
      pointer-events: none;
      z-index: 1000;
      animation: floatUp 0.5s ease-out forwards;
    `;
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 500);
  },

  triggerCrash() {
    this.isGameOver = true;
    this.shakeAmount = 16;
    this.flashAlpha = 0.8;
    SoundManager.playGameOver();

    const crashBurst = ParticleEngine.createCanvasBurst(this.ctx, this.player.currentX, this.player.y, "#ef4444", 24);
    this.particles.push(...crashBurst);

    setTimeout(() => {
      this.endGame();
    }, 900);
  },

  render() {
    if (!this.ctx || !this.canvas) return;

    const playfield = this.container.querySelector("#trafficPlayfield");
    if (!playfield) return;
    const rect = playfield.getBoundingClientRect();

    this.ctx.clearRect(0, 0, rect.width, rect.height);

    this.ctx.save();
    if (this.shakeAmount > 0) {
      const sx = (Math.random() - 0.5) * this.shakeAmount;
      const sy = (Math.random() - 0.5) * this.shakeAmount;
      this.ctx.translate(sx, sy);
      this.shakeAmount *= 0.85;
    }

    const roadWidth = Math.min(320, rect.width * 0.85);
    const roadLeft = (rect.width - roadWidth) / 2;

    this.ctx.fillStyle = "#1e293b";
    this.ctx.fillRect(roadLeft, 0, roadWidth, rect.height);

    this.ctx.fillStyle = "#e2e8f0";
    this.ctx.fillRect(roadLeft - 4, 0, 4, rect.height);
    this.ctx.fillRect(roadLeft + roadWidth, 0, 4, rect.height);

    const laneW = roadWidth / 3;
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([20, 20]);
    this.ctx.lineDashOffset = -this.roadOffset;

    [1, 2].forEach(i => {
      this.ctx.beginPath();
      this.ctx.moveTo(roadLeft + laneW * i, 0);
      this.ctx.lineTo(roadLeft + laneW * i, rect.height);
      this.ctx.stroke();
    });

    this.ctx.setLineDash([]);

    this.obstacles.forEach(obs => {
      this.drawCar(obs.x, obs.y, obs.width, obs.height, obs.color, Math.PI, false);
    });

    this.drawCar(this.player.currentX, this.player.y, this.player.width, this.player.height, "#ec4899", this.player.tilt, true);

    if (this.flashAlpha > 0) {
      this.ctx.fillStyle = `rgba(239, 68, 68, ${this.flashAlpha})`;
      this.ctx.fillRect(0, 0, rect.width, rect.height);
      this.flashAlpha *= 0.85;
    }

    this.ctx.restore();
  },

  drawCar(x, y, w, h, color, tiltAngle, isPlayer = false) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(tiltAngle);

    this.ctx.fillStyle = "#090d16";
    this.ctx.fillRect(-w / 2 - 3, -h / 2 + 8, 4, 16);
    this.ctx.fillRect(w / 2 - 1, -h / 2 + 8, 4, 16);
    this.ctx.fillRect(-w / 2 - 3, h / 2 - 24, 4, 16);
    this.ctx.fillRect(w / 2 - 1, h / 2 - 24, 4, 16);

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.roundRect(-w / 2, -h / 2, w, h, 10);
    this.ctx.fill();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.stroke();

    this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    this.ctx.beginPath();
    this.ctx.roundRect(-w / 2 + 6, isPlayer ? -h / 2 + 14 : h / 2 - 28, w - 12, 16, 4);
    this.ctx.fill();

    this.ctx.fillStyle = isPlayer ? "#06b6d4" : "#ef4444";
    this.ctx.fillRect(-w / 2 + 6, isPlayer ? -h / 2 + 3 : h / 2 - 6, 8, 4);
    this.ctx.fillRect(w / 2 - 14, isPlayer ? -h / 2 + 3 : h / 2 - 6, 8, 4);

    this.ctx.restore();
  },

  updateHUD() {
    const scoreEl = document.getElementById("trafficScore");
    const speedEl = document.getElementById("trafficSpeed");
    const nearMissEl = document.getElementById("trafficNearMiss");
    const comboEl = document.getElementById("trafficCombo");

    if (scoreEl) scoreEl.textContent = this.score;
    if (speedEl) speedEl.textContent = `${Math.round(this.roadSpeed * 10)} MPH`;
    if (nearMissEl) nearMissEl.textContent = this.combo.maxCombo;
    if (comboEl) comboEl.textContent = `x${this.combo.count || 1}`;
  },

  endGame() {
    this.isRunning = false;
    cancelAnimationFrame(this.rafId);

    const diffMult = this.difficulty === "hard" ? 1.5 : this.difficulty === "easy" ? 0.8 : 1.0;
    const finalScore = Math.floor(this.score * diffMult);

    const xpEarned = Math.floor(finalScore * 0.4);
    const coinsEarned = Math.floor(finalScore * 0.25);

    const result = GameState.recordGameResult("traffic", finalScore, xpEarned, coinsEarned);

    if (finalScore >= 20) {
      GameState.unlockAchievement("traffic", "Road Warrior", "Score 20+ in Traffic Dodge");
    }

    UI.showResultModal({
      gameId: "traffic",
      score: finalScore,
      isNewBest: result.isNewBest,
      xpEarned: result.gainedXp,
      coinsEarned: result.gainedCoins,
      maxCombo: this.combo.maxCombo,
      onPlayAgain: () => this.start(this.difficulty),
      onHome: () => App.navigateTo(Screens.HOME)
    });
  },

  destroy() {
    this.isRunning = false;
    cancelAnimationFrame(this.rafId);
    if (this.keydownHandler) window.removeEventListener("keydown", this.keydownHandler);
    if (this.container) this.container.innerHTML = "";
  }
};

if (typeof App !== "undefined" && typeof App.registerGame === "function") {
  App.registerGame("traffic", TrafficGame);
} else {
  window.addEventListener("DOMContentLoaded", () => {
    if (typeof App !== "undefined") {
      App.registerGame("traffic", TrafficGame);
    }
  });
}
