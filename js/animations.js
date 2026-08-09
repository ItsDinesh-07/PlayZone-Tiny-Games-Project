/* =========================================================
   ANIMATION SYSTEM & REWARDS VISUALS — GameZone v2
   XP float, FLIP coin fly animation, Combo popups, Level-up overlay
   ========================================================= */

"use strict";

const Animations = {
  floatXP(x, y, amount) {
    if (!ParticleEngine.isAnimationsEnabled()) return;

    const floatEl = document.createElement("div");
    floatEl.className = "float-xp-text";
    floatEl.textContent = `+${amount} XP ↑`;
    floatEl.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -50%) scale(0.8);
      color: #06b6d4;
      font-size: 16px;
      font-weight: 900;
      text-shadow: 0 0 10px rgba(6, 182, 212, 0.6);
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
      transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.6s ease;
    `;

    document.body.appendChild(floatEl);

    requestAnimationFrame(() => {
      floatEl.style.opacity = "1";
      floatEl.style.transform = `translate(-50%, calc(-50% - 40px)) scale(1.2)`;
    });

    setTimeout(() => {
      floatEl.style.opacity = "0";
      setTimeout(() => floatEl.remove(), 200);
    }, 600);
  },

  flyCoin(startX, startY) {
    if (!ParticleEngine.isAnimationsEnabled()) return;

    const targetPill = document.getElementById("coinCounterPill");
    if (!targetPill) return;

    const targetRect = targetPill.getBoundingClientRect();
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    const coin = document.createElement("div");
    coin.textContent = "🪙";
    coin.style.cssText = `
      position: fixed;
      left: ${startX}px;
      top: ${startY}px;
      font-size: 20px;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%) scale(1);
      transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1), top 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s ease;
    `;

    document.body.appendChild(coin);

    requestAnimationFrame(() => {
      coin.style.left = `${endX}px`;
      coin.style.top = `${endY}px`;
      coin.style.transform = `translate(-50%, -50%) scale(0.6)`;
    });

    setTimeout(() => {
      coin.remove();
      SoundManager.playCoin();

      // Bounce pill
      targetPill.style.transform = "scale(1.2)";
      setTimeout(() => targetPill.style.transform = "scale(1)", 150);
    }, 600);
  },

  showComboPop(container, comboCount) {
    if (!container || comboCount <= 1) return;

    let popEl = container.querySelector(".combo-pop-indicator");
    if (!popEl) {
      popEl = document.createElement("div");
      popEl.className = "combo-pop-indicator";
      container.appendChild(popEl);
    }

    popEl.textContent = `COMBO x${comboCount}! 🔥`;
    popEl.style.cssText = `
      position: absolute;
      top: 15%;
      left: 50%;
      transform: translate(-50%, -50%) scale(1.3);
      color: #f97316;
      font-size: 22px;
      font-weight: 900;
      text-shadow: 0 0 16px rgba(249, 115, 22, 0.8);
      pointer-events: none;
      z-index: 100;
      opacity: 1;
      transition: transform 0.15s ease-out, opacity 0.4s ease-in 0.2s;
    `;

    requestAnimationFrame(() => {
      popEl.style.transform = `translate(-50%, -50%) scale(1)`;
    });

    SoundManager.playCombo(comboCount);

    setTimeout(() => {
      popEl.style.opacity = "0";
    }, 400);
  },

  triggerLevelUp(newLevel) {
    SoundManager.playLevelUp();

    const overlay = document.getElementById("modalOverlay");
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="modal-card level-up-card">
        <div class="level-up-badge">LEVEL UP!</div>
        <div class="level-up-icon">⭐</div>
        <h2>LEVEL ${newLevel} REACHED!</h2>
        <p>Congratulations! You've unlocked bonus prestige & arcade rewards.</p>
        <div class="level-rewards-pill">
          <span>+50 🪙 COINS</span>
          <span>+100 ⭐ XP</span>
        </div>
        <button id="levelUpDismissBtn" class="btn primary-btn" style="width: 100%; margin-top: 16px;">CONTINUE 🎮</button>
      </div>
    `;

    overlay.classList.add("show");

    // Spawn DOM confetti
    ParticleEngine.burstDOM(document.querySelector(".level-up-card"), 24);

    document.getElementById("levelUpDismissBtn")?.addEventListener("click", () => {
      overlay.classList.remove("show");
    });
  }
};

// Auto-subscribe to GameState levelUp event!
GameState.subscribe("levelUp", (data) => {
  Animations.triggerLevelUp(data.newLevel);
});
