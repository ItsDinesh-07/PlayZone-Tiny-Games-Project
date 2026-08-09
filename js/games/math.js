/* =========================================================
   MATH BLITZ GAME CONTROLLER — GameZone v2
   Rapid scaling arithmetic equations, 4 choice buttons,
   combos, timer penalty, difficulty selection (Easy / Medium / Hard)
   ========================================================= */

"use strict";

const MathGame = {
  container: null,
  timerId: null,
  timeLeft: 30,
  score: 0,
  totalSolved: 0,
  totalAttempts: 0,
  combo: null,
  currentProblem: null,
  isRunning: false,
  difficulty: "medium",

  init(container, diff = "medium") {
    this.container = container;
    this.difficulty = diff || "medium";
    this.combo = new ComboTracker();
    this.resetStats();
    this.renderLayout();
  },

  resetStats() {
    this.timeLeft = this.difficulty === "easy" ? 35 : this.difficulty === "hard" ? 25 : 30;
    this.score = 0;
    this.totalSolved = 0;
    this.totalAttempts = 0;
    this.combo.reset();
    this.currentProblem = null;
    this.isRunning = false;
    clearInterval(this.timerId);
  },

  renderLayout() {
    if (!this.container) return;

    const lastDiff = GameState.getLastDifficulty("math");

    this.container.innerHTML = `
      <div class="math-game-shell">
        <div class="math-hud">
          <div class="hud-box"><span class="hud-label">TIME</span><b id="mathTimer">30s</b></div>
          <div class="hud-box"><span class="hud-label">SCORE</span><b id="mathScore">0</b></div>
          <div class="hud-box"><span class="hud-label">SOLVED</span><b id="mathSolved">0</b></div>
          <div class="hud-box"><span class="hud-label">COMBO</span><b id="mathCombo">x1</b></div>
        </div>
        <div id="mathPlayfield" class="math-playfield">
          <!-- DIFFICULTY SELECT PROMPT -->
          <div id="diffSelectPrompt" class="diff-select-shell">
            <div class="prompt-icon">🧮</div>
            <h3>Math Blitz</h3>
            <p>Select your challenge level to begin</p>
            <div class="diff-options-grid">
              <button class="diff-card easy ${lastDiff === 'easy' ? 'selected' : ''}" data-diff="easy">
                <span class="diff-icon">🌱</span>
                <div class="diff-info">
                  <h4>EASY</h4>
                  <p>Basic math, 35s timer (-2s penalty)</p>
                </div>
              </button>
              <button class="diff-card medium ${lastDiff === 'medium' ? 'selected' : ''}" data-diff="medium">
                <span class="diff-icon">⚡</span>
                <div class="diff-info">
                  <h4>MEDIUM</h4>
                  <p>Mixed ops, 30s timer (-3s penalty)</p>
                </div>
              </button>
              <button class="diff-card hard ${lastDiff === 'hard' ? 'selected' : ''}" data-diff="hard">
                <span class="diff-icon">🔥</span>
                <div class="diff-info">
                  <h4>HARD</h4>
                  <p>Advanced ops, 25s timer (-4s penalty)</p>
                </div>
              </button>
            </div>
          </div>
          
          <div id="mathQuizArea" class="math-quiz-area" style="display: none;">
            <div id="mathEquation" class="math-equation">12 + 15 = ?</div>
            <div id="mathOptions" class="math-options-grid"></div>
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
  },

  start(diff = "medium") {
    this.difficulty = diff;
    this.resetStats();
    this.isRunning = true;

    const prompt = this.container.querySelector("#diffSelectPrompt");
    if (prompt) prompt.style.display = "none";

    const quizArea = this.container.querySelector("#mathQuizArea");
    if (quizArea) quizArea.style.display = "flex";

    this.updateHUD();
    this.generateNextProblem();

    this.timerId = setInterval(() => {
      this.timeLeft--;
      const timerEl = document.getElementById("mathTimer");
      if (timerEl) timerEl.textContent = `${this.timeLeft}s`;

      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  },

  getDifficultyTier() {
    const baseOffset = this.difficulty === "hard" ? 2 : this.difficulty === "easy" ? 0 : 1;
    if (this.score < 5) return Math.min(4, baseOffset);
    if (this.score < 12) return Math.min(4, baseOffset + 1);
    return 4;
  },

  generateNextProblem() {
    const tier = this.getDifficultyTier();
    let num1, num2, op, answer, text;

    if (tier <= 1) {
      op = Math.random() > 0.5 ? "+" : "-";
      if (op === "+") {
        num1 = Math.floor(Math.random() * 12) + 2;
        num2 = Math.floor(Math.random() * 12) + 2;
        answer = num1 + num2;
      } else {
        num1 = Math.floor(Math.random() * 15) + 5;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
      }
      text = `${num1} ${op} ${num2} = ?`;
    } else if (tier === 2) {
      const ops = ["+", "-", "×"];
      op = ops[Math.floor(Math.random() * ops.length)];
      if (op === "+") {
        num1 = Math.floor(Math.random() * 30) + 10;
        num2 = Math.floor(Math.random() * 30) + 10;
        answer = num1 + num2;
      } else if (op === "-") {
        num1 = Math.floor(Math.random() * 40) + 15;
        num2 = Math.floor(Math.random() * (num1 - 5)) + 5;
        answer = num1 - num2;
      } else {
        num1 = Math.floor(Math.random() * 8) + 2;
        num2 = Math.floor(Math.random() * 8) + 2;
        answer = num1 * num2;
      }
      text = `${num1} ${op} ${num2} = ?`;
    } else if (tier === 3) {
      const ops = ["×", "÷"];
      op = ops[Math.floor(Math.random() * ops.length)];
      if (op === "×") {
        num1 = Math.floor(Math.random() * 12) + 3;
        num2 = Math.floor(Math.random() * 12) + 3;
        answer = num1 * num2;
      } else {
        num2 = Math.floor(Math.random() * 9) + 2;
        answer = Math.floor(Math.random() * 10) + 2;
        num1 = num2 * answer;
      }
      text = `${num1} ${op} ${num2} = ?`;
    } else {
      num1 = Math.floor(Math.random() * 8) + 2;
      num2 = Math.floor(Math.random() * 6) + 2;
      const num3 = Math.floor(Math.random() * 15) + 5;
      answer = (num1 * num2) + num3;
      text = `(${num1} × ${num2}) + ${num3} = ?`;
    }

    const choices = new Set([answer]);
    while (choices.size < 4) {
      const offset = (Math.floor(Math.random() * 8) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const wrong = answer + offset;
      if (wrong >= 0) choices.add(wrong);
    }

    const shuffledChoices = Array.from(choices).sort(() => Math.random() - 0.5);

    this.currentProblem = { text, answer, choices: shuffledChoices };
    this.renderProblem();
  },

  renderProblem() {
    const eqEl = this.container.querySelector("#mathEquation");
    const optGrid = this.container.querySelector("#mathOptions");
    if (!eqEl || !optGrid || !this.currentProblem) return;

    eqEl.textContent = this.currentProblem.text;
    optGrid.innerHTML = "";

    this.currentProblem.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.className = "math-option-btn";
      btn.textContent = choice;

      btn.addEventListener("click", (e) => {
        this.handleChoice(choice, btn, e.clientX, e.clientY);
      });

      optGrid.appendChild(btn);
    });
  },

  handleChoice(choice, btnEl, clientX, clientY) {
    if (!this.isRunning) return;

    this.totalAttempts++;

    if (choice === this.currentProblem.answer) {
      SoundManager.playSuccess();
      SoundManager.vibrate(40);

      btnEl.classList.add("correct");
      this.totalSolved++;

      const comboVal = this.combo.hit();
      const pts = Math.floor(1 * this.combo.getMultiplier());
      this.score += pts;

      ParticleEngine.burstDOM(btnEl, 12);
      Animations.floatXP(clientX, clientY, 10);

      const quizArea = this.container.querySelector("#mathQuizArea");
      if (comboVal > 1 && quizArea) {
        Animations.showComboPop(quizArea, comboVal);
      }

      this.updateHUD();
      setTimeout(() => this.generateNextProblem(), 200);
    } else {
      SoundManager.playClick();
      SoundManager.vibrate([80, 40, 80]);

      btnEl.classList.add("wrong");
      this.combo.reset();

      const penalty = this.difficulty === "hard" ? 4 : this.difficulty === "easy" ? 2 : 3;
      this.timeLeft = Math.max(0, this.timeLeft - penalty);
      const timerEl = document.getElementById("mathTimer");
      if (timerEl) timerEl.textContent = `${this.timeLeft}s`;

      this.updateHUD();
      setTimeout(() => btnEl.classList.remove("wrong"), 400);
    }
  },

  updateHUD() {
    const scoreEl = document.getElementById("mathScore");
    const solvedEl = document.getElementById("mathSolved");
    const comboEl = document.getElementById("mathCombo");

    if (scoreEl) scoreEl.textContent = this.score;
    if (solvedEl) solvedEl.textContent = this.totalSolved;
    if (comboEl) comboEl.textContent = `x${this.combo.count || 1}`;
  },

  endGame() {
    this.isRunning = false;
    clearInterval(this.timerId);

    const accuracy = this.totalAttempts > 0 ? Math.round((this.totalSolved / this.totalAttempts) * 100) : 0;
    const diffMult = this.difficulty === "hard" ? 1.5 : this.difficulty === "easy" ? 0.8 : 1.0;
    const finalScore = Math.floor(this.score * diffMult);

    const xpEarned = Math.floor(finalScore * 3.0 + (accuracy > 80 ? 25 : 0));
    const coinsEarned = Math.floor(finalScore * 2.0);

    const result = GameState.recordGameResult("math", finalScore, xpEarned, coinsEarned);

    if (finalScore >= 15) {
      GameState.unlockAchievement("math", "Math Prodigy", "Score 15+ in Math Blitz");
    }

    UI.showResultModal({
      gameId: "math",
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
    clearInterval(this.timerId);
    if (this.container) {
      this.container.innerHTML = "";
    }
  }
};

if (typeof App !== "undefined" && typeof App.registerGame === "function") {
  App.registerGame("math", MathGame);
} else {
  window.addEventListener("DOMContentLoaded", () => {
    if (typeof App !== "undefined") {
      App.registerGame("math", MathGame);
    }
  });
}
