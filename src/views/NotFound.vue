<template>
  <div class="nf">
    <!-- Stars background -->
    <div class="nf-stars" aria-hidden="true">
      <span v-for="i in 30" :key="i" class="nf-star" :style="starStyle(i)"/>
    </div>

    <div class="nf-content">
      <!-- Error code -->
      <div class="nf-code-wrap">
        <span class="nf-code">404</span>
        <span class="nf-cursor"/>
      </div>

      <!-- Package SVG illustration -->
      <div class="nf-illustration">
        <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
          <!-- Ground shadow -->
          <ellipse cx="60" cy="82" rx="32" ry="6" fill="rgba(232,223,160,0.08)"/>
          <!-- Tilted box -->
          <g transform="translate(60,44) rotate(-15) translate(-24,-22)">
            <path d="M0 22 L24 8 L48 22 L48 52 L24 66 L0 52 Z" fill="rgba(34,48,160,0.3)" stroke="#e8dfa0" stroke-width="1.5"/>
            <path d="M0 22 L24 36 L48 22" stroke="#e8dfa0" stroke-width="1.5" stroke-dasharray="4 3"/>
            <path d="M24 36 L24 66" stroke="#e8dfa0" stroke-width="1.5" stroke-dasharray="4 3"/>
            <!-- X mark -->
            <line x1="14" y1="30" x2="22" y2="38" stroke="rgba(232,223,160,0.5)" stroke-width="2" stroke-linecap="round"/>
            <line x1="22" y1="30" x2="14" y2="38" stroke="rgba(232,223,160,0.5)" stroke-width="2" stroke-linecap="round"/>
          </g>
          <!-- Question mark -->
          <text x="86" y="28" font-family="Montserrat, sans-serif" font-size="22" font-weight="900" fill="rgba(232,223,160,0.6)">?</text>
        </svg>
      </div>

      <div class="nf-label">PAGE_NOT_FOUND</div>
      <p class="nf-message">The page you're looking for has been lost in transit.</p>

      <!-- Actions -->
      <div class="nf-actions">
        <button class="nf-btn-primary" @click="$router.push('/')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Go home
        </button>
        <button class="nf-btn-ghost" @click="$router.push('/sender/search')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Search trips
        </button>
      </div>

      <div class="nf-footer">ERR: 0x00000404 · CarryIt v1.0</div>
    </div>
  </div>
</template>

<script setup>
function starStyle(i) {
  const seed = i * 137.508
  const x = ((seed * 0.618) % 1) * 100
  const y = ((seed * 0.382) % 1) * 100
  const size = 1 + (i % 3) * 0.5
  const opacity = 0.2 + (i % 5) * 0.1
  const delay = (i % 7) * 0.4
  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}px`,
    height: `${size}px`,
    opacity,
    animationDelay: `${delay}s`,
  }
}
</script>

<style scoped>
.nf {
  min-height: 100vh;
  background: #0d0d1a;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Montserrat', sans-serif;
  position: relative; overflow: hidden;
}

/* Stars */
.nf-star {
  position: absolute; border-radius: 50%; background: #e8dfa0;
  animation: twinkle 3s ease-in-out infinite;
}
@keyframes twinkle { 0%,100% { opacity: var(--op, 0.3); } 50% { opacity: calc(var(--op, 0.3) * 2.5); } }

/* Content */
.nf-content {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 40px 24px; max-width: 400px; width: 100%; gap: 20px;
}

/* Error code */
.nf-code-wrap { display: flex; align-items: baseline; gap: 4px; }
.nf-code {
  font-size: clamp(80px, 20vw, 120px);
  font-weight: 900; letter-spacing: -0.05em;
  color: #2230a0;
  text-shadow: 0 0 40px rgba(34,48,160,0.6), 0 0 80px rgba(34,48,160,0.25);
  line-height: 1;
}
.nf-cursor {
  width: 3px; height: clamp(48px, 12vw, 72px);
  background: #e8dfa0;
  border-radius: 2px;
  animation: blink 1s step-end infinite;
}
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

/* Illustration */
.nf-illustration { opacity: 0.85; }

/* Label */
.nf-label {
  font-size: 12px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(232,223,160,0.55);
}

/* Message */
.nf-message {
  font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.5);
  line-height: 1.6; max-width: 280px; margin: 0;
}

/* Actions */
.nf-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
.nf-btn-primary {
  display: flex; align-items: center; gap: 8px;
  background: #2230a0; color: #e8dfa0; border: none; border-radius: 10px;
  padding: 12px 22px; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800;
  cursor: pointer; transition: background 0.15s;
}
.nf-btn-primary:hover { background: #e8dfa0; color: #111; }

.nf-btn-ghost {
  display: flex; align-items: center; gap: 8px;
  background: none; border: 1.5px solid rgba(232,223,160,0.25); border-radius: 10px;
  padding: 12px 22px; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700;
  color: rgba(232,223,160,0.65); cursor: pointer; transition: all 0.15s;
}
.nf-btn-ghost:hover { border-color: #e8dfa0; color: #e8dfa0; }

/* Footer */
.nf-footer { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: rgba(255,255,255,0.18); }
</style>
