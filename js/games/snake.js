/* =========================================================
   SNAKE RUSH GAME CONTROLLER — GameZone v2 (Highest Priority)
   Non-grid cartoon spline snake, pupil tracking, tongue flick,
   squash/stretch wave body, glowing fruits & death sequence.
   ========================================================= */

"use strict";

const SnakeGame = {
  container: null,
  canvas: null,
  ctx: null,
  rafId: null,
  lastTime: 0,
  score: 0,
  combo: null,
  isRunning: false,
  isGameOver: false,

  // Snake state
  head: { x: 150, y: 150, angle: 0, targetAngle: 0, speed: 2.8, radius: 14 },
  dir: { x: 1, y: 0 },
  nextDir: { x: 1, y: 0 },
  history: [],
  targetLength: 45, // length in path points
  bodySegments: 12,

  // Animations & Expressions
  blinkTimer: 0,
  isBlinking: false,
  tongueTimer: 0,
  tongueOut: 0, // 0 to 1
  eatPulse: 0,
  deathTimer: 0,
  shakeAmount: 0,

  // Food state
  food: { x: 300, y: 200, radius: 12, type: "apple", floatOffset: 0, rot: 0 },
  particles: [],

  // Touch controls
  touchStartX: 0,
  touchStartY: 0,

  init(container, diff = "medium") {
    this.container = container;
    this.difficulty = diff || "medium";
    this.combo = new ComboTracker();
    this.renderLayout();
  },

  renderLayout() {
    if (!this.container) return;

    const lastDiff = GameState.getLastDifficulty("snake");

    this.container.innerHTML = `
      <div class="snake-game-shell">
        <div class="snake-hud">
          <div class="hud-box"><span class="hud-label">SCORE</span><b id="snakeScore">0</b></div>
          <div class="hud-box"><span class="hud-label">LENGTH</span><b id="snakeLength">12</b></div>
          <div class="hud-box"><span class="hud-label">SPEED</span><b id="snakeSpeed">1.0x</b></div>
          <div class="hud-box"><span class="hud-label">COMBO</span><b id="snakeCombo">x1</b></div>
        </div>
        <div id="snakePlayfield" class="snake-playfield">
          <!-- DIFFICULTY SELECT PROMPT -->
          <div id="diffSelectPrompt" class="diff-select-shell">
            <div class="prompt-icon">🐍</div>
            <h3>Snake Rush</h3>
            <p>Select your challenge level to begin</p>
            <div class="diff-options-grid">
              <button class="diff-card easy ${lastDiff === 'easy' ? 'selected' : ''}" data-diff="easy">
                <span class="diff-icon">🌱</span>
                <div class="diff-info">
                  <h4>EASY</h4>
                  <p>Slower snake & gentle speed ramp</p>
                </div>
              </button>
              <button class="diff-card medium ${lastDiff === 'medium' ? 'selected' : ''}" data-diff="medium">
                <span class="diff-icon">⚡</span>
                <div class="diff-info">
                  <h4>MEDIUM</h4>
                  <p>Standard speed & normal growth</p>
                </div>
              </button>
              <button class="diff-card hard ${lastDiff === 'hard' ? 'selected' : ''}" data-diff="hard">
                <span class="diff-icon">🔥</span>
                <div class="diff-info">
                  <h4>HARD</h4>
                  <p>Fast snake & aggressive speed ramp</p>
                </div>
              </button>
            </div>
          </div>

          <canvas id="snakeCanvas"></canvas>
          
          <div class="snake-dpad">
            <button class="dpad-btn up" id="snakeUp">▲</button>
            <div class="dpad-mid">
              <button class="dpad-btn left" id="snakeLeft">◀</button>
              <button class="dpad-btn right" id="snakeRight">▶</button>
            </div>
            <button class="dpad-btn down" id="snakeDown">▼</button>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector("#snakeCanvas");
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
    // Keyboard controls
    this.keydownHandler = (e) => {
      if (!this.isRunning || this.isGameOver) return;
      const k = e.key.toLowerCase();
      if ((k === "arrowup" || k === "w") && this.dir.y !== 1) this.setDirection(0, -1);
      else if ((k === "arrowdown" || k === "s") && this.dir.y !== -1) this.setDirection(0, 1);
      else if ((k === "arrowleft" || k === "a") && this.dir.x !== 1) this.setDirection(-1, 0);
      else if ((k === "arrowright" || k === "d") && this.dir.x !== -1) this.setDirection(1, 0);
    };
    window.addEventListener("keydown", this.keydownHandler);

    // On-screen D-Pad for Mobile
    document.getElementById("snakeUp")?.addEventListener("click", () => this.setDirection(0, -1));
    document.getElementById("snakeDown")?.addEventListener("click", () => this.setDirection(0, 1));
    document.getElementById("snakeLeft")?.addEventListener("click", () => this.setDirection(-1, 0));
    document.getElementById("snakeRight")?.addEventListener("click", () => this.setDirection(1, 0));

    // Touch Swipe Gestures on Canvas
    const playfield = document.getElementById("snakePlayfield");
    if (playfield) {
      playfield.addEventListener("touchstart", (e) => {
        if (!this.isRunning) return;
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }, { passive: true });

      playfield.addEventListener("touchend", (e) => {
        if (!this.isRunning || this.isGameOver) return;
        const diffX = e.changedTouches[0].clientX - this.touchStartX;
        const diffY = e.changedTouches[0].clientY - this.touchStartY;

        if (Math.abs(diffX) > 25 || Math.abs(diffY) > 25) {
          if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (diffX > 0 && this.dir.x !== -1) this.setDirection(1, 0);
            else if (diffX < 0 && this.dir.x !== 1) this.setDirection(-1, 0);
          } else {
            // Vertical swipe
            if (diffY > 0 && this.dir.y !== -1) this.setDirection(0, 1);
            else if (diffY < 0 && this.dir.y !== 1) this.setDirection(0, -1);
          }
        }
      }, { passive: true });
    }
  },

  setDirection(dx, dy) {
    if ((dx === -this.dir.x && dx !== 0) || (dy === -this.dir.y && dy !== 0)) return;
    this.nextDir = { x: dx, y: dy };
  },

  handleResize() {
    if (!this.canvas || !this.container) return;
    const playfield = this.container.querySelector("#snakePlayfield");
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

    // Dynamic mobile-responsive scale factor
    const scaleFactor = Math.max(0.65, Math.min(1.2, rect.width / 400));
    if (this.head) this.head.radius = Math.max(9, Math.floor(13 * scaleFactor));
    if (this.food) this.food.radius = Math.max(9, Math.floor(12 * scaleFactor));
  },


  start(diff = "medium") {
    this.difficulty = diff;
    this.handleResize();
    const prompt = this.container.querySelector("#diffSelectPrompt");
    if (prompt) prompt.style.display = "none";

    const playfieldRect = this.container.querySelector("#snakePlayfield").getBoundingClientRect();

    let startSpeed = 2.8;
    if (diff === "easy") startSpeed = 2.2;
    else if (diff === "hard") startSpeed = 3.6;

    this.head = {
      x: playfieldRect.width / 2,
      y: playfieldRect.height / 2,
      angle: 0,
      targetAngle: 0,
      speed: startSpeed,
      radius: 14
    };


    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.history = [];
    this.targetLength = 60;
    this.bodySegments = 12;
    this.score = 0;
    this.combo.reset();
    this.isRunning = true;
    this.isGameOver = false;
    this.particles = [];
    this.shakeAmount = 0;

    // Seed path history
    for (let i = 0; i < this.targetLength; i++) {
      this.history.push({ x: this.head.x - i * 2, y: this.head.y });
    }

    this.spawnFood();
    this.updateHUD();

    this.lastTime = performance.now();
    cancelAnimationFrame(this.rafId);
    this.gameLoop(this.lastTime);
  },

  spawnFood() {
    const playfield = document.getElementById("snakePlayfield");
    if (!playfield) return;
    const rect = playfield.getBoundingClientRect();

    const padding = 30;
    this.food = {
      x: padding + Math.random() * (rect.width - padding * 2),
      y: padding + Math.random() * (rect.height - padding * 2),
      radius: 13,
      floatOffset: Math.random() * Math.PI * 2,
      rot: 0
    };
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

    this.dir = { ...this.nextDir };
    this.head.targetAngle = Math.atan2(this.dir.y, this.dir.x);

    // Smooth angle turn (LERP)
    let diff = this.head.targetAngle - this.head.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.head.angle += diff * 0.25;

    // Move head smoothly
    this.head.x += this.dir.x * this.head.speed;
    this.head.y += this.dir.y * this.head.speed;

    // Push position history
    this.history.unshift({ x: this.head.x, y: this.head.y });
    if (this.history.length > this.targetLength) {
      this.history.pop();
    }

    // Boundary check
    const playfield = document.getElementById("snakePlayfield");
    if (playfield) {
      const rect = playfield.getBoundingClientRect();
      if (
        this.head.x - this.head.radius < 0 ||
        this.head.x + this.head.radius > rect.width ||
        this.head.y - this.head.radius < 0 ||
        this.head.y + this.head.radius > rect.height
      ) {
        this.triggerDeath();
        return;
      }
    }

    // Self-collision check (skip initial head points)
    for (let i = 25; i < this.history.length; i += 3) {
      const p = this.history[i];
      const dist = Math.hypot(this.head.x - p.x, this.head.y - p.y);
      if (dist < this.head.radius) {
        this.triggerDeath();
        return;
      }
    }

    // Food eating check
    const distToFood = Math.hypot(this.head.x - this.food.x, this.head.y - this.food.y);
    if (distToFood < this.head.radius + this.food.radius) {
      this.handleEat();
    }

    // Timers & Animations
    this.blinkTimer += dt;
    if (this.blinkTimer > 3000) {
      this.isBlinking = true;
      if (this.blinkTimer > 3150) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }

    this.tongueTimer += dt;
    if (this.tongueTimer > 2500) {
      this.tongueOut = Math.sin((this.tongueTimer - 2500) / 200 * Math.PI);
      if (this.tongueTimer > 2700) {
        this.tongueOut = 0;
        this.tongueTimer = 0;
      }
    }

    if (this.eatPulse > 0) this.eatPulse -= dt * 0.005;

    // Idle food floating
    this.food.floatOffset += 0.05;
    this.food.rot += 0.02;

    // Update active particles
    ParticleEngine.updateAndDrawCanvasParticles(this.ctx, this.particles);
  },

  handleEat() {
    SoundManager.playCoin();
    SoundManager.vibrate(40);

    const comboVal = this.combo.hit();
    const pts = Math.floor(10 * this.combo.getMultiplier());
    this.score += pts;

    this.targetLength += 8;
    this.bodySegments = Math.floor(this.targetLength / 5);
    this.eatPulse = 1.0;

    // Speed scaling
    if (this.score % 50 === 0) {
      this.head.speed = Math.min(5.5, this.head.speed + 0.25);
    }

    // Canvas particle burst
    const pBurst = ParticleEngine.createCanvasBurst(this.ctx, this.food.x, this.food.y, "#22c55e", 14);
    this.particles.push(...pBurst);

    // Floating XP text
    const rect = this.canvas.getBoundingClientRect();
    Animations.floatXP(rect.left + this.food.x, rect.top + this.food.y, pts);

    if (comboVal > 1) {
      Animations.showComboPop(document.getElementById("snakePlayfield"), comboVal);
    }

    this.updateHUD();
    this.spawnFood();
  },

  triggerDeath() {
    this.isGameOver = true;
    this.shakeAmount = 12;
    SoundManager.playGameOver();

    // Death particle burst at head
    const deathBurst = ParticleEngine.createCanvasBurst(this.ctx, this.head.x, this.head.y, "#ef4444", 24);
    this.particles.push(...deathBurst);

    setTimeout(() => {
      this.endGame();
    }, 900);
  },

  render() {
    if (!this.ctx || !this.canvas) return;

    const playfield = document.getElementById("snakePlayfield");
    if (!playfield) return;
    const rect = playfield.getBoundingClientRect();

    this.ctx.clearRect(0, 0, rect.width, rect.height);

    // Camera shake effect on death
    this.ctx.save();
    if (this.shakeAmount > 0) {
      const sx = (Math.random() - 0.5) * this.shakeAmount;
      const sy = (Math.random() - 0.5) * this.shakeAmount;
      this.ctx.translate(sx, sy);
      this.shakeAmount *= 0.85;
    }

    // 1. Draw Food (Glowing Cartoon Fruit)
    this.drawFood();

    // 2. Draw Snake Body (Squash / Stretch Wave Interpolation)
    this.drawSnakeBody();

    // 3. Draw Cartoon Head (Eyes, Pupils, Tongue, Expression)
    this.drawSnakeHead();

    this.ctx.restore();
  },

  drawFood() {
    const floatY = this.food.y + Math.sin(this.food.floatOffset) * 4;

    this.ctx.save();
    this.ctx.translate(this.food.x, floatY);

    // Glowing aura
    const grad = this.ctx.createRadialGradient(0, 0, 2, 0, 0, 18);
    grad.addColorStop(0, "rgba(34, 197, 94, 0.8)");
    grad.addColorStop(1, "rgba(34, 197, 94, 0)");
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
    this.ctx.fill();

    // Fruit body (Glossy Red Apple / Green Berry)
    this.ctx.fillStyle = "#ef4444";
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.food.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.stroke();

    // Leaf
    this.ctx.fillStyle = "#22c55e";
    this.ctx.beginPath();
    this.ctx.ellipse(3, -this.food.radius + 1, 4, 2, Math.PI / 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  },

  drawSnakeBody() {
    if (this.history.length === 0) return;

    const totalSegs = this.bodySegments;
    const step = Math.floor(this.history.length / totalSegs);

    for (let i = totalSegs - 1; i >= 1; i--) {
      const idx = Math.min(this.history.length - 1, i * step);
      const pos = this.history[idx];
      if (!pos) continue;

      // Wave oscillation + tapering radius
      const wave = Math.sin(i * 0.5 + performance.now() * 0.008) * 2;
      const progress = i / totalSegs;
      const segRadius = Math.max(6, (1 - progress * 0.5) * (this.head.radius - 1) + (this.eatPulse * 3));

      this.ctx.save();
      this.ctx.translate(pos.x, pos.y + wave);

      // Gradient color along body
      const hue = 140 + progress * 40;
      this.ctx.fillStyle = `hsl(${hue}, 80%, 45%)`;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, segRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      this.ctx.stroke();

      this.ctx.restore();
    }
  },

  drawSnakeHead() {
    this.ctx.save();
    this.ctx.translate(this.head.x, this.head.y);
    this.ctx.rotate(this.head.angle);

    const scalePulse = 1 + (this.eatPulse * 0.25);
    this.ctx.scale(scalePulse, scalePulse);

    // 1. Procedural Forked Tongue
    if (this.tongueOut > 0 && !this.isGameOver) {
      const tongueLen = 14 * this.tongueOut;
      this.ctx.strokeStyle = "#ef4444";
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.moveTo(12, 0);
      this.ctx.lineTo(12 + tongueLen, 0);
      this.ctx.lineTo(12 + tongueLen + 4, -4);
      this.ctx.moveTo(12 + tongueLen, 0);
      this.ctx.lineTo(12 + tongueLen + 4, 4);
      this.ctx.stroke();
    }

    // 2. Head Shape (Glossy Green Rounded Oval)
    this.ctx.fillStyle = "#22c55e";
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.head.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.stroke();

    // 3. Eyes & Pupils
    if (this.isGameOver) {
      // Dead 'X' Eyes
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 2.5;

      // Left X
      this.ctx.beginPath();
      this.ctx.moveTo(4, -7); this.ctx.lineTo(10, -3);
      this.ctx.moveTo(10, -7); this.ctx.lineTo(4, -3);
      this.ctx.stroke();

      // Right X
      this.ctx.beginPath();
      this.ctx.moveTo(4, 3); this.ctx.lineTo(10, 7);
      this.ctx.moveTo(10, 3); this.ctx.lineTo(4, 7);
      this.ctx.stroke();
    } else {
      // Big Cute Cartoon Eyes
      this.ctx.fillStyle = "#ffffff";
      this.ctx.beginPath();
      this.ctx.arc(5, -6, 5, 0, Math.PI * 2); // Left eye
      this.ctx.arc(5, 6, 5, 0, Math.PI * 2);  // Right eye
      this.ctx.fill();

      if (!this.isBlinking) {
        // Pupils tracking forward direction
        this.ctx.fillStyle = "#090d16";
        this.ctx.beginPath();
        this.ctx.arc(6.5, -6, 2.5, 0, Math.PI * 2);
        this.ctx.arc(6.5, 6, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Blinking line
        this.ctx.strokeStyle = "#090d16";
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(2, -6); this.ctx.lineTo(8, -6);
        this.ctx.moveTo(2, 6); this.ctx.lineTo(8, 6);
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  },

  updateHUD() {
    const scoreEl = document.getElementById("snakeScore");
    const lenEl = document.getElementById("snakeLength");
    const speedEl = document.getElementById("snakeSpeed");
    const comboEl = document.getElementById("snakeCombo");

    if (scoreEl) scoreEl.textContent = this.score;
    if (lenEl) lenEl.textContent = this.bodySegments;
    if (speedEl) speedEl.textContent = `${(this.head.speed / 2.8).toFixed(1)}x`;
    if (comboEl) comboEl.textContent = `x${this.combo.count || 1}`;
  },

  endGame() {
    this.isRunning = false;
    cancelAnimationFrame(this.rafId);

    const xpEarned = Math.floor(this.score * 2.0);
    const coinsEarned = Math.floor(this.score * 1.2);

    const result = GameState.recordGameResult("snake", this.score, xpEarned, coinsEarned);

    if (this.score >= 15) {
      GameState.unlockAchievement("snake", "Snake Wrangler", "Score 15+ in Snake Rush");
    }

    UI.showResultModal({
      gameId: "snake",
      score: this.score,
      isNewBest: result.isNewBest,
      xpEarned: result.gainedXp,
      coinsEarned: result.gainedCoins,
      maxCombo: this.combo.maxCombo,
      onPlayAgain: () => this.start(),
      onHome: () => App.navigateTo(Screens.HOME)
    });
  },

  destroy() {
    this.isRunning = false;
    cancelAnimationFrame(this.rafId);
    if (this.keydownHandler) {
      window.removeEventListener("keydown", this.keydownHandler);
    }
    if (this.container) {
      this.container.innerHTML = "";
    }
  }
};

// Register game with App core
if (typeof App !== "undefined" && typeof App.registerGame === "function") {
  App.registerGame("snake", SnakeGame);
} else {
  window.addEventListener("DOMContentLoaded", () => {
    if (typeof App !== "undefined") {
      App.registerGame("snake", SnakeGame);
    }
  });
}
