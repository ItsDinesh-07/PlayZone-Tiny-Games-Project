/* =========================================================
   OBJECT-POOLED PARTICLE ENGINE — GameZone v2
   Adaptive performance particle system for Canvas & DOM
   ========================================================= */

"use strict";

const ParticleEngine = {
  pool: [],
  activeParticles: [],
  maxPoolSize: 100,

  isLowEndDevice() {
    return (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  },

  isAnimationsEnabled() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return false;
    }
    return GameState.settings ? GameState.settings.animations !== false : true;
  },

  getParticle() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return { x: 0, y: 0, vx: 0, vy: 0, size: 0, color: "#fff", alpha: 1, life: 0, maxLife: 1 };
  },

  recycleParticle(p) {
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(p);
    }
  },

  // Canvas particle burst helper
  createCanvasBurst(ctx, x, y, color = "#6366f1", count = 16) {
    if (!this.isAnimationsEnabled()) return [];

    const finalCount = this.isLowEndDevice() ? Math.floor(count / 2) : count;
    const burst = [];

    for (let i = 0; i < finalCount; i++) {
      const p = this.getParticle();
      const angle = (Math.PI * 2 * i) / finalCount + (Math.random() - 0.5);
      const speed = 2 + Math.random() * 4;

      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = 3 + Math.random() * 5;
      p.color = color;
      p.alpha = 1;
      p.life = 0;
      p.maxLife = 20 + Math.random() * 20;

      burst.push(p);
    }

    return burst;
  },

  updateAndDrawCanvasParticles(ctx, particles) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.life++;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        this.recycleParticle(p);
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },

  // DOM node particle burst for non-canvas UI taps
  burstDOM(targetEl, count = 12) {
    if (!this.isAnimationsEnabled() || !targetEl) return;

    const rect = targetEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const finalCount = this.isLowEndDevice() ? 6 : count;
    const colors = ["#6366f1", "#06b6d4", "#a855f7", "#22c55e", "#f97316"];

    for (let i = 0; i < finalCount; i++) {
      const dot = document.createElement("div");
      dot.className = "dom-particle";
      const color = colors[i % colors.length];

      const angle = (Math.PI * 2 * i) / finalCount;
      const distance = 30 + Math.random() * 40;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      dot.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        width: 8px;
        height: 8px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%) scale(1);
        transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease;
      `;

      document.body.appendChild(dot);

      requestAnimationFrame(() => {
        dot.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`;
        dot.style.opacity = "0";
      });

      setTimeout(() => dot.remove(), 400);
    }
  }
};
