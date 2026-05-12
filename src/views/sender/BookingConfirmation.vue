<template>
  <div class="bc">
    <!-- Blue header -->
    <header class="bc-header">
      <div class="bc-header-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e8dfa0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <h1 class="bc-header-title">Booking confirmed!</h1>
      <p class="bc-header-sub">Your package is on its way</p>
    </header>

    <!-- Confetti particles -->
    <div class="bc-confetti" aria-hidden="true">
      <div v-for="p in confettiPieces" :key="p.id" class="bc-piece"
        :style="{ left: p.x + '%', animationDelay: p.delay + 's', background: p.color, transform: `rotate(${p.rot}deg)` }"/>
    </div>

    <main class="bc-body">
      <!-- Booking ID card -->
      <div class="bc-id-card">
        <span class="bc-id-label">Booking ID</span>
        <span class="bc-id-val">#CIT-{{ bookingId }}</span>
        <button class="bc-copy-btn" @click="copyId">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>

      <!-- Timeline -->
      <div class="bc-timeline-card">
        <h3 class="bc-section-title">What happens next</h3>
        <div class="bc-timeline">
          <div
            v-for="(step, i) in timeline"
            :key="i"
            class="bc-step"
            :class="{ done: step.done, active: step.active }"
          >
            <div class="bc-step-line-wrap">
              <div class="bc-step-dot">
                <svg v-if="step.done" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div v-if="i < timeline.length - 1" class="bc-step-connector"/>
            </div>
            <div class="bc-step-content">
              <span class="bc-step-title">{{ step.title }}</span>
              <span class="bc-step-sub">{{ step.sub }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Traveler card -->
      <div class="bc-traveler-card">
        <div class="bc-traveler-avatar" style="background:#2230a0">Y</div>
        <div class="bc-traveler-info">
          <span class="bc-traveler-name">Yasmine Belhaj</span>
          <span class="bc-traveler-route">TUN → CDG · Jun 14, 08:30</span>
        </div>
        <router-link to="/chat" class="bc-chat-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          Chat
        </router-link>
      </div>

      <!-- Actions -->
      <div class="bc-actions">
        <router-link to="/sender/bookings" class="bc-btn-primary">View my bookings</router-link>
        <router-link to="/sender/search" class="bc-btn-secondary">Send another package</router-link>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route     = useRoute()
const bookingId = Math.floor(100000 + Math.random() * 900000)
const copied    = ref(false)

function copyId() {
  navigator.clipboard?.writeText(`#CIT-${bookingId}`)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// Confetti
const colors = ['#e8dfa0', '#2230a0', '#8485d0', '#3b6d11', '#fff']
const confettiPieces = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 2,
  color: colors[i % colors.length],
  rot: Math.random() * 180,
}))

const timeline = [
  { title: 'Booking confirmed', sub: 'Payment held in escrow',         done: true,  active: false },
  { title: 'Traveler notified', sub: 'Yasmine has accepted your item', done: true,  active: false },
  { title: 'Pickup arranged',   sub: 'Meet Yasmine before departure',  done: false, active: true  },
  { title: 'In transit',        sub: 'Item is on the flight',          done: false, active: false },
  { title: 'Delivered',         sub: 'OTP confirms safe handoff',      done: false, active: false },
]
</script>

<style scoped>
.bc {
  min-height: 100vh; background: #f0f0ee;
  font-family: 'Montserrat', sans-serif;
  position: relative; overflow: hidden;
}

/* Header */
.bc-header {
  background: #2230a0;
  padding: 36px 24px 40px;
  text-align: center;
  position: relative;
}
.bc-header-icon {
  width: 64px; height: 64px;
  background: rgba(232,223,160,0.15);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
  border: 2px solid rgba(232,223,160,0.3);
}
.bc-header-title {
  font-size: 26px; font-weight: 900; color: #fff;
  letter-spacing: -0.03em; margin: 0 0 8px;
}
.bc-header-sub { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.65); margin: 0; }

/* Confetti */
.bc-confetti { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.bc-piece {
  position: absolute; top: -20px;
  width: 8px; height: 12px;
  border-radius: 2px;
  animation: fall 3s ease-in both;
  opacity: 0.85;
}
@keyframes fall {
  0%   { top: -20px; opacity: 1; }
  100% { top: 50vh; opacity: 0; transform: rotate(540deg) translateX(30px); }
}

/* Body */
.bc-body {
  padding: 20px 16px 40px;
  display: flex; flex-direction: column; gap: 14px;
  position: relative; z-index: 2;
}

/* Booking ID */
.bc-id-card {
  background: #fff; border-radius: 14px;
  border: 1.5px solid rgba(17,17,17,0.1);
  padding: 14px 16px;
  display: flex; align-items: center; gap: 12px;
}
.bc-id-label { font-size: 11px; font-weight: 700; color: rgba(17,17,17,0.4); text-transform: uppercase; letter-spacing: 0.1em; }
.bc-id-val { flex: 1; font-size: 16px; font-weight: 900; color: #2230a0; letter-spacing: 0.04em; }
.bc-copy-btn {
  display: flex; align-items: center; gap: 5px;
  background: #f0f0ee; border: 1.5px solid rgba(17,17,17,0.1);
  border-radius: 99px; padding: 5px 12px;
  font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700;
  color: #111; cursor: pointer; transition: all 0.15s;
}
.bc-copy-btn:hover { background: #2230a0; color: #e8dfa0; border-color: #2230a0; }

/* Timeline */
.bc-timeline-card {
  background: #fff; border-radius: 16px;
  border: 1.5px solid rgba(17,17,17,0.1);
  padding: 18px;
}
.bc-section-title { font-size: 14px; font-weight: 900; color: #111; margin: 0 0 16px; }
.bc-timeline { display: flex; flex-direction: column; }
.bc-step {
  display: flex; gap: 14px; padding-bottom: 16px;
}
.bc-step:last-child { padding-bottom: 0; }
.bc-step-line-wrap {
  display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
}
.bc-step-dot {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid rgba(17,17,17,0.18);
  background: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; z-index: 1;
}
.bc-step.done .bc-step-dot { background: #3b6d11; border-color: #3b6d11; }
.bc-step.active .bc-step-dot { background: #2230a0; border-color: #2230a0; animation: pulse-dot 1.5s ease-in-out infinite; }
@keyframes pulse-dot { 0%,100% { box-shadow: 0 0 0 0 rgba(34,48,160,0.4); } 50% { box-shadow: 0 0 0 6px rgba(34,48,160,0); } }
.bc-step-connector {
  flex: 1; width: 2px; background: rgba(17,17,17,0.1);
  margin: 4px 0; min-height: 16px;
}
.bc-step.done .bc-step-connector { background: #3b6d11; }
.bc-step-content { flex: 1; padding-top: 1px; }
.bc-step-title { display: block; font-size: 13px; font-weight: 800; color: #111; margin-bottom: 2px; }
.bc-step-sub { font-size: 12px; font-weight: 500; color: rgba(17,17,17,0.45); }
.bc-step:not(.done):not(.active) .bc-step-title { color: rgba(17,17,17,0.4); }

/* Traveler */
.bc-traveler-card {
  background: #fff; border-radius: 14px;
  border: 1.5px solid rgba(17,17,17,0.1);
  padding: 14px 16px;
  display: flex; align-items: center; gap: 12px;
}
.bc-traveler-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 900; color: #fff; flex-shrink: 0;
}
.bc-traveler-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.bc-traveler-name { font-size: 13px; font-weight: 800; color: #111; }
.bc-traveler-route { font-size: 11px; font-weight: 500; color: rgba(17,17,17,0.45); }
.bc-chat-btn {
  display: flex; align-items: center; gap: 6px;
  background: #111; color: #fff;
  border: none; border-radius: 99px; padding: 8px 14px;
  font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700;
  text-decoration: none; cursor: pointer;
  transition: background 0.15s;
}
.bc-chat-btn:hover { background: #2230a0; }

/* Actions */
.bc-actions { display: flex; flex-direction: column; gap: 10px; }
.bc-btn-primary {
  display: flex; align-items: center; justify-content: center;
  background: #111; color: #e8dfa0;
  border-radius: 12px; padding: 15px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800;
  text-decoration: none; transition: background 0.15s;
}
.bc-btn-primary:hover { background: #2230a0; }
.bc-btn-secondary {
  display: flex; align-items: center; justify-content: center;
  background: transparent; color: rgba(17,17,17,0.55);
  border: 1.5px solid rgba(17,17,17,0.18);
  border-radius: 12px; padding: 13px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 700;
  text-decoration: none; transition: border-color 0.15s;
}
.bc-btn-secondary:hover { border-color: #111; color: #111; }

@media (min-width: 768px) {
  .bc-body { max-width: 600px; margin: 0 auto; padding: 28px 24px 60px; }
}
</style>
