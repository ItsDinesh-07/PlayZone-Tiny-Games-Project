/* =========================================================
   MEMORY FLIP GAME CONTROLLER — GameZone v2
   3D perspective flip cards, distinct SVG icon set,
   difficulty selection (Easy: 4 pairs, Medium: 6 pairs, Hard: 8 pairs)
   ========================================================= */

"use strict";

const MemoryGame = {
  container: null,
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  totalPairs: 6,
  moves: 0,
  score: 0,
  timerSeconds: 0,
  timerInterval: null,
  combo: null,
  isLocked: false,
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
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;
    this.score = 0;
    this.timerSeconds = 0;
    this.combo.reset();
    this.isLocked = false;
    this.isRunning = false;
    clearInterval(this.timerInterval);
  },

  renderLayout() {
    if (!this.container) return;

    const lastDiff = GameState.getLastDifficulty("memory");

    this.container.innerHTML = `
      <div class="memory-game-shell">
        <div class="memory-hud">
          <div class="hud-box"><span class="hud-label">TIME</span><b id="memoryTimer">0s</b></div>
          <div class="hud-box"><span class="hud-label">MOVES</span><b id="memoryMoves">0</b></div>
          <div class="hud-box"><span class="hud-label">MATCHES</span><b id="memoryMatches">0/${this.totalPairs}</b></div>
          <div class="hud-box"><span class="hud-label">SCORE</span><b id="memoryScore">0</b></div>
        </div>
        <div id="memoryPlayfield" class="memory-playfield">
          <!-- DIFFICULTY SELECT PROMPT -->
          <div id="diffSelectPrompt" class="diff-select-shell">
            <div class="prompt-icon">🧠</div>
            <h3>Memory Flip</h3>
            <p>Select your challenge level to begin</p>
            <div class="diff-options-grid">
              <button class="diff-card easy ${lastDiff === 'easy' ? 'selected' : ''}" data-diff="easy">
                <span class="diff-icon">🌱</span>
                <div class="diff-info">
                  <h4>EASY</h4>
                  <p>4 Pairs (8 Cards)</p>
                </div>
              </button>
              <button class="diff-card medium ${lastDiff === 'medium' ? 'selected' : ''}" data-diff="medium">
                <span class="diff-icon">⚡</span>
                <div class="diff-info">
                  <h4>MEDIUM</h4>
                  <p>6 Pairs (12 Cards)</p>
                </div>
              </button>
              <button class="diff-card hard ${lastDiff === 'hard' ? 'selected' : ''}" data-diff="hard">
                <span class="diff-icon">🔥</span>
                <div class="diff-info">
                  <h4>HARD</h4>
                  <p>8 Pairs (16 Cards)</p>
                </div>
              </button>
            </div>
          </div>

          <div id="memoryGrid" class="memory-grid" style="display: none;"></div>
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

    if (diff === "easy") this.totalPairs = 4;
    else if (diff === "hard") this.totalPairs = 8;
    else this.totalPairs = 6;

    const prompt = this.container.querySelector("#diffSelectPrompt");
    if (prompt) prompt.style.display = "none";

    const grid = this.container.querySelector("#memoryGrid");
    if (grid) {
      grid.style.display = "grid";
      if (this.totalPairs === 4) grid.className = "memory-grid grid-4-pairs";
      else if (this.totalPairs === 8) grid.className = "memory-grid grid-8-pairs";
      else grid.className = "memory-grid grid-6-pairs";
    }

    this.setupCards();
    this.updateHUD();

    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      const timerEl = document.getElementById("memoryTimer");
      if (timerEl) timerEl.textContent = `${this.timerSeconds}s`;
    }, 1000);
  },

  setupCards() {
    const grid = this.container.querySelector("#memoryGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const pairSet = GameIcons.memoryPairs.slice(0, this.totalPairs);
    const deck = [...pairSet, ...pairSet];

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    deck.forEach((cardItem, index) => {
      const cardEl = document.createElement("div");
      cardEl.className = "memory-card";
      cardEl.setAttribute("data-index", index);
      cardEl.setAttribute("data-id", cardItem.id);

      cardEl.innerHTML = `
        <div class="card-inner">
          <div class="card-front">${GameIcons.cardBack}</div>
          <div class="card-back">${cardItem.svg}</div>
        </div>
      `;

      cardEl.addEventListener("click", () => this.handleCardClick(cardEl, cardItem.id));
      grid.appendChild(cardEl);
      this.cards.push(cardEl);
    });
  },

  handleCardClick(cardEl, cardId) {
    if (!this.isRunning || this.isLocked) return;
    if (cardEl.classList.contains("flipped") || cardEl.classList.contains("matched")) return;

    SoundManager.playClick();
    cardEl.classList.add("flipped");
    this.flippedCards.push({ el: cardEl, id: cardId });

    if (this.flippedCards.length === 2) {
      this.moves++;
      this.updateHUD();
      this.checkMatch();
    }
  },

  checkMatch() {
    this.isLocked = true;
    const [card1, card2] = this.flippedCards;

    if (card1.id === card2.id) {
      SoundManager.playSuccess();
      SoundManager.vibrate(50);

      card1.el.classList.add("matched");
      card2.el.classList.add("matched");

      const comboVal = this.combo.hit();
      const matchPts = Math.floor(50 * this.combo.getMultiplier());
      this.score += matchPts;

      ParticleEngine.burstDOM(card1.el, 10);
      ParticleEngine.burstDOM(card2.el, 10);

      const gridEl = this.container.querySelector("#memoryGrid");
      if (comboVal > 1 && gridEl) {
        Animations.showComboPop(gridEl, comboVal);
      }

      this.matchedPairs++;
      this.flippedCards = [];
      this.isLocked = false;
      this.updateHUD();

      if (this.matchedPairs >= this.totalPairs) {
        setTimeout(() => this.endGame(), 400);
      }
    } else {
      this.combo.reset();
      card1.el.classList.add("mismatch");
      card2.el.classList.add("mismatch");

      setTimeout(() => {
        card1.el.classList.remove("flipped", "mismatch");
        card2.el.classList.remove("flipped", "mismatch");
        this.flippedCards = [];
        this.isLocked = false;
      }, 700);
    }
  },

  updateHUD() {
    const movesEl = document.getElementById("memoryMoves");
    const matchesEl = document.getElementById("memoryMatches");
    const scoreEl = document.getElementById("memoryScore");

    if (movesEl) movesEl.textContent = this.moves;
    if (matchesEl) matchesEl.textContent = `${this.matchedPairs}/${this.totalPairs}`;
    if (scoreEl) scoreEl.textContent = this.score;
  },

  endGame() {
    this.isRunning = false;
    clearInterval(this.timerInterval);

    const timeBonus = Math.max(0, 300 - this.timerSeconds * 10);
    const moveBonus = Math.max(0, 400 - (this.moves - this.totalPairs) * 30);
    const diffMult = this.difficulty === "hard" ? 1.5 : this.difficulty === "easy" ? 0.8 : 1.0;
    const finalScore = Math.floor((this.score + timeBonus + moveBonus) * diffMult);

    const xpEarned = Math.floor(finalScore * 0.4);
    const coinsEarned = Math.floor(finalScore * 0.25);

    const result = GameState.recordGameResult("memory", finalScore, xpEarned, coinsEarned);

    if (finalScore >= 100) {
      GameState.unlockAchievement("memory", "Memory Genius", "Score 100+ in Memory Flip");
    }

    UI.showResultModal({
      gameId: "memory",
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
    clearInterval(this.timerInterval);
    if (this.container) {
      this.container.innerHTML = "";
    }
  }
};

if (typeof App !== "undefined" && typeof App.registerGame === "function") {
  App.registerGame("memory", MemoryGame);
} else {
  window.addEventListener("DOMContentLoaded", () => {
    if (typeof App !== "undefined") {
      App.registerGame("memory", MemoryGame);
    }
  });
}
