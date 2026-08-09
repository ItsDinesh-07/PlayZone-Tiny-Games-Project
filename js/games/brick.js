/* =========================================================
   BRICK BREAKER GAME CONTROLLER — GameZone v2
   Glowing ball motion trail, glossy brick types, paddle glow,
   particle bursts, lives, combos, difficulty selection (Easy / Medium / Hard)
   ========================================================= */

"use strict";

const BrickGame = {
  container: null,
  canvas: null,
  ctx: null,
  rafId: null,
  lastTime: 0,
  score: 0,
  lives: 3,
  combo: null,
  isRunning: false,
  isGameOver: false,
  difficulty: "medium",

  paddle: { x: 0, y: 0, width: 90, height: 14, radius: 7, speed: 8 },
  paddleDir: 0,
  ball: { x: 0, y: 0, vx: 0, vy: 0, radius: 8, trail: [], baseSpeed: 5.5 },

  bricks: [],
  brickRows: 4,
  brickCols: 7,
  brickHeight: 22,
  brickPadding: 8,
  brickOffsetTop: 50,
  brickOffsetLeft: 15,

  particles: [],

  init(container, diff = "medium") {
    this.container = container;
    this.difficulty = diff || "medium";
    this.combo = new ComboTracker();
    this.renderLayout();
  },

  renderLayout() {
    if (!this.container) return;

    const lastDiff = GameState.getLastDifficulty("brick");

    this.container.innerHTML = `
      <div class="brick-game-shell">
        <div class="brick-hud">
          <div class="hud-box"><span class="hud-label">LIVES</span><b id="brickLives">❤️❤️❤️</b></div>
          <div class="hud-box"><span class="hud-label">SCORE</span><b id="brickScore">0</b></div>
          <div class="hud-box"><span class="hud-label">BRICKS</span><b id="brickRemaining">0</b></div>
          <div class="hud-box"><span class="hud-label">COMBO</span><b id="brickCombo">x1</b></div>
        </div>
        <div id="brickPlayfield" class="brick-playfield">
          <!-- DIFFICULTY SELECT PROMPT -->
          <div id="diffSelectPrompt" class="diff-select-shell">
            <div class="prompt-icon">🧱</div>
            <h3>Brick Breaker</h3>
            <p>Select your challenge level to begin</p>
            <div class="diff-options-grid">
              <button class="diff-card easy ${lastDiff === 'easy' ? 'selected' : ''}" data-diff="easy">
                <span class="diff-icon">🌱</span>
                <div class="diff-info">
                  <h4>EASY</h4>
                  <p>Wide paddle, slower ball & 3 brick rows</p>
                </div>
              </button>
              <button class="diff-card medium ${lastDiff === 'medium' ? 'selected' : ''}" data-diff="medium">
                <span class="diff-icon">⚡</span>
                <div class="diff-info">
                  <h4>MEDIUM</h4>
                  <p>Standard paddle, normal speed & 4 rows</p>
                </div>
              </button>
              <button class="diff-card hard ${lastDiff === 'hard' ? 'selected' : ''}" data-diff="hard">
                <span class="diff-icon">🔥</span>
                <div class="diff-info">
                  <h4>HARD</h4>
                  <p>Narrow paddle, fast ball & 5 dense rows</p>
                </div>
              </button>
            </div>
          </div>

          <canvas id="brickCanvas"></canvas>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector("#brickCanvas");
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
      if (k === "arrowleft" || k === "a") this.paddleDir = -1;
      else if (k === "arrowright" || k === "d") this.paddleDir = 1;
    };

    this.keyupHandler = (e) => {
      const k = e.key.toLowerCase();
      if ((k === "arrowleft" || k === "a") && this.paddleDir === -1) this.paddleDir = 0;
      else if ((k === "arrowright" || k === "d") && this.paddleDir === 1) this.paddleDir = 0;
    };

    window.addEventListener("keydown", this.keydownHandler);
    window.addEventListener("keyup", this.keyupHandler);

    const playfield = this.container.querySelector("#brickPlayfield");
    if (playfield) {
      const movePaddleToX = (clientX) => {
        if (!this.isRunning || this.isGameOver) return;
        const rect = playfield.getBoundingClientRect();
        const relativeX = clientX - rect.left;
        this.paddle.x = Math.max(0, Math.min(rect.width - this.paddle.width, relativeX - this.paddle.width / 2));
      };

      playfield.addEventListener("mousemove", (e) => movePaddleToX(e.clientX));
      playfield.addEventListener("touchmove", (e) => {
        if (e.touches[0]) movePaddleToX(e.touches[0].clientX);
      }, { passive: true });
    }
  },

  handleResize() {
    if (!this.canvas || !this.container) return;
    const playfield = this.container.querySelector("#brickPlayfield");
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
  },

  start(diff = "medium") {
    this.difficulty = diff;
    this.handleResize();
    const prompt = this.container.querySelector("#diffSelectPrompt");
    if (prompt) prompt.style.display = "none";

    const playfield = this.container.querySelector("#brickPlayfield");
    const rect = playfield.getBoundingClientRect();

    if (diff === "easy") {
      this.paddle.width = 110;
      this.ball.baseSpeed = 4.5;
      this.brickRows = 3;
    } else if (diff === "hard") {
      this.paddle.width = 70;
      this.ball.baseSpeed = 6.8;
      this.brickRows = 5;
    } else {
      this.paddle.width = 90;
      this.ball.baseSpeed = 5.5;
      this.brickRows = 4;
    }

    this.score = 0;
    this.lives = 3;
    this.combo.reset();
    this.isRunning = true;
    this.isGameOver = false;
    this.particles = [];

    this.paddle.x = (rect.width - this.paddle.width) / 2;
    this.paddle.y = rect.height - 30;

    this.resetBall();
    this.createBricks(rect.width);
    this.updateHUD();

    this.lastTime = performance.now();
    cancelAnimationFrame(this.rafId);
    this.gameLoop(this.lastTime);
  },

  resetBall() {
    const playfield = this.container.querySelector("#brickPlayfield");
    const rect = playfield.getBoundingClientRect();

    this.ball.x = this.paddle.x + this.paddle.width / 2;
    this.ball.y = this.paddle.y - 15;
    const angle = (Math.random() * 0.6 - 0.3) - Math.PI / 2;
    const speed = this.ball.baseSpeed;
    this.ball.vx = Math.cos(angle) * speed;
    this.ball.vy = Math.sin(angle) * speed;
    this.ball.trail = [];
  },

  createBricks(canvasWidth) {
    this.bricks = [];
    const availableWidth = canvasWidth - (this.brickOffsetLeft * 2);
    const brickWidth = (availableWidth - (this.brickCols - 1) * this.brickPadding) / this.brickCols;

    const colors = [
      { color: "#f97316", hp: 1, type: "normal" },
      { color: "#ec4899", hp: 1, type: "normal" },
      { color: "#a855f7", hp: 2, type: "strong" },
      { color: "#06b6d4", hp: 1, type: "normal" },
      { color: "#eab308", hp: 1, type: "bonus" }
    ];

    for (let r = 0; r < this.brickRows; r++) {
      this.bricks[r] = [];
      const rowType = colors[r % colors.length];

      for (let c = 0; c < this.brickCols; c++) {
        const x = this.brickOffsetLeft + c * (brickWidth + this.brickPadding);
        const y = this.brickOffsetTop + r * (this.brickHeight + this.brickPadding);

        this.bricks[r][c] = {
          x,
          y,
          width: brickWidth,
          height: this.brickHeight,
          color: rowType.color,
          hp: rowType.hp,
          maxHp: rowType.hp,
          type: rowType.type,
          active: true
        };
      }
    }
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

    const playfield = this.container.querySelector("#brickPlayfield");
    if (!playfield) return;
    const rect = playfield.getBoundingClientRect();

    if (this.paddleDir !== 0) {
      this.paddle.x += this.paddleDir * this.paddle.speed;
      this.paddle.x = Math.max(0, Math.min(rect.width - this.paddle.width, this.paddle.x));
    }

    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
    if (this.ball.trail.length > 8) this.ball.trail.shift();

    if (this.ball.x - this.ball.radius < 0) {
      this.ball.x = this.ball.radius;
      this.ball.vx *= -1;
      SoundManager.playClick();
    } else if (this.ball.x + this.ball.radius > rect.width) {
      this.ball.x = rect.width - this.ball.radius;
      this.ball.vx *= -1;
      SoundManager.playClick();
    }

    if (this.ball.y - this.ball.radius < 0) {
      this.ball.y = this.ball.radius;
      this.ball.vy *= -1;
      SoundManager.playClick();
    }

    if (this.ball.y + this.ball.radius > rect.height) {
      this.lives--;
      this.combo.reset();
      SoundManager.playGameOver();
      SoundManager.vibrate(100);

      if (this.lives <= 0) {
        this.endGame();
        return;
      } else {
        this.resetBall();
        this.updateHUD();
      }
    }

    if (
      this.ball.vy > 0 &&
      this.ball.y + this.ball.radius >= this.paddle.y &&
      this.ball.y - this.ball.radius <= this.paddle.y + this.paddle.height &&
      this.ball.x >= this.paddle.x &&
      this.ball.x <= this.paddle.x + this.paddle.width
    ) {
      SoundManager.playClick();
      SoundManager.vibrate(30);

      const hitPoint = (this.ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
      const angle = hitPoint * (Math.PI / 3);
      const speed = Math.hypot(this.ball.vx, this.ball.vy);

      this.ball.vx = Math.sin(angle) * speed;
      this.ball.vy = -Math.cos(angle) * speed;
      this.ball.y = this.paddle.y - this.ball.radius;
    }

    let remaining = 0;
    for (let r = 0; r < this.brickRows; r++) {
      for (let c = 0; c < this.brickCols; c++) {
        const b = this.bricks[r][c];
        if (!b || !b.active) continue;

        remaining++;

        if (
          this.ball.x + this.ball.radius > b.x &&
          this.ball.x - this.ball.radius < b.x + b.width &&
          this.ball.y + this.ball.radius > b.y &&
          this.ball.y - this.ball.radius < b.y + b.height
        ) {
          b.hp--;
          this.ball.vy *= -1;

          if (b.hp <= 0) {
            b.active = false;
            remaining--;

            SoundManager.playCoin();
            const comboVal = this.combo.hit();
            const pts = Math.floor((b.type === "bonus" ? 25 : 10) * this.combo.getMultiplier());
            this.score += pts;

            const pBurst = ParticleEngine.createCanvasBurst(this.ctx, b.x + b.width / 2, b.y + b.height / 2, b.color, 12);
            this.particles.push(...pBurst);

            const canvasRect = this.canvas.getBoundingClientRect();
            Animations.floatXP(canvasRect.left + b.x + b.width / 2, canvasRect.top + b.y, pts);

            if (comboVal > 1) {
              Animations.showComboPop(this.container.querySelector("#brickPlayfield"), comboVal);
            }
          } else {
            SoundManager.playClick();
          }

          this.updateHUD();
          break;
        }
      }
    }

    if (remaining === 0) {
      this.endGame();
    }

    ParticleEngine.updateAndDrawCanvasParticles(this.ctx, this.particles);
  },

  render() {
    if (!this.ctx || !this.canvas) return;

    const playfield = this.container.querySelector("#brickPlayfield");
    if (!playfield) return;
    const rect = playfield.getBoundingClientRect();

    this.ctx.clearRect(0, 0, rect.width, rect.height);

    for (let r = 0; r < this.brickRows; r++) {
      for (let c = 0; c < this.brickCols; c++) {
        const b = this.bricks[r][c];
        if (!b || !b.active) continue;

        this.ctx.save();
        this.ctx.fillStyle = b.color;
        this.ctx.beginPath();
        this.ctx.roundRect(b.x, b.y, b.width, b.height, 6);
        this.ctx.fill();

        this.ctx.lineWidth = 1.5;
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        this.ctx.stroke();

        if (b.hp < b.maxHp) {
          this.ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
          this.ctx.beginPath();
          this.ctx.moveTo(b.x + 4, b.y + 4);
          this.ctx.lineTo(b.x + b.width - 4, b.y + b.height - 4);
          this.ctx.stroke();
        }

        this.ctx.restore();
      }
    }

    this.ball.trail.forEach((p, idx) => {
      const alpha = (idx + 1) / this.ball.trail.length;
      this.ctx.save();
      this.ctx.globalAlpha = alpha * 0.4;
      this.ctx.fillStyle = "#6366f1";
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, this.ball.radius * alpha, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    this.ctx.save();
    this.ctx.fillStyle = "#ffffff";
    this.ctx.shadowColor = "#6366f1";
    this.ctx.shadowBlur = 12;
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    this.ctx.save();
    const padGrad = this.ctx.createLinearGradient(this.paddle.x, 0, this.paddle.x + this.paddle.width, 0);
    padGrad.addColorStop(0, "#6366f1");
    padGrad.addColorStop(1, "#a855f7");

    this.ctx.fillStyle = padGrad;
    this.ctx.shadowColor = "rgba(99, 102, 241, 0.6)";
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height, this.paddle.radius);
    this.ctx.fill();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.stroke();
    this.ctx.restore();
  },

  updateHUD() {
    const livesEl = document.getElementById("brickLives");
    const scoreEl = document.getElementById("brickScore");
    const remEl = document.getElementById("brickRemaining");
    const comboEl = document.getElementById("brickCombo");

    if (livesEl) livesEl.textContent = "❤️".repeat(Math.max(0, this.lives));
    if (scoreEl) scoreEl.textContent = this.score;

    let count = 0;
    this.bricks.forEach(row => row && row.forEach(b => { if (b && b.active) count++; }));
    if (remEl) remEl.textContent = count;
    if (comboEl) comboEl.textContent = `x${this.combo.count || 1}`;
  },

  endGame() {
    this.isRunning = false;
    cancelAnimationFrame(this.rafId);

    const diffMult = this.difficulty === "hard" ? 1.5 : this.difficulty === "easy" ? 0.8 : 1.0;
    const finalScore = Math.floor(this.score * diffMult);

    const xpEarned = Math.floor(finalScore * 0.5);
    const coinsEarned = Math.floor(finalScore * 0.3);

    const result = GameState.recordGameResult("brick", finalScore, xpEarned, coinsEarned);

    if (finalScore >= 300) {
      GameState.unlockAchievement("brick", "Brick Destroyer", "Score 300+ in Brick Breaker");
    }

    UI.showResultModal({
      gameId: "brick",
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
    if (this.keyupHandler) window.removeEventListener("keyup", this.keyupHandler);
    if (this.container) this.container.innerHTML = "";
  }
};

if (typeof App !== "undefined" && typeof App.registerGame === "function") {
  App.registerGame("brick", BrickGame);
} else {
  window.addEventListener("DOMContentLoaded", () => {
    if (typeof App !== "undefined") {
      App.registerGame("brick", BrickGame);
    }
  });
}
