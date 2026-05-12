<template>
  <div class="ad">
    <header class="ad-header">
      <button class="ad-back" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="ad-header-title">Live Tracker</span>
      <button class="ad-chat-btn" @click="openChat">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
      </button>
    </header>

    <main class="ad-body">
      <!-- Arc map -->
      <div class="ad-map-card">
        <svg ref="mapSvg" viewBox="0 0 360 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="ad-map-svg">
          <!-- Background grid -->
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(34,48,160,0.08)" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="360" height="200" fill="url(#grid)"/>
          <!-- Simplified continent outlines -->
          <path d="M30 120 Q50 100 70 115 Q90 130 110 118 Q130 105 150 112" stroke="rgba(34,48,160,0.2)" stroke-width="2" fill="rgba(34,48,160,0.06)" stroke-linecap="round"/>
          <path d="M180 90 Q210 80 230 95 Q250 110 280 100 Q300 90 330 105" stroke="rgba(34,48,160,0.2)" stroke-width="2" fill="rgba(34,48,160,0.06)" stroke-linecap="round"/>
          <!-- Flight arc -->
          <path id="flightArc" d="M 60 140 Q 180 30 300 120" stroke="#2230a0" stroke-width="2.5" stroke-dasharray="8 5" stroke-linecap="round" fill="none"/>
          <!-- Progress arc (animated) -->
          <path d="M 60 140 Q 180 30 300 120" stroke="#e8dfa0" stroke-width="3" stroke-linecap="round" fill="none" :stroke-dasharray="`${progress * 2.8} 280`"/>
          <!-- Origin dot -->
          <circle cx="60" cy="140" r="7" fill="#2230a0"/>
          <text x="60" y="158" text-anchor="middle" font-family="Montserrat,sans-serif" font-size="10" font-weight="700" fill="#2230a0">TUN</text>
          <!-- Destination dot -->
          <circle cx="300" cy="120" r="7" fill="#8485d0"/>
          <text x="300" y="138" text-anchor="middle" font-family="Montserrat,sans-serif" font-size="10" font-weight="700" fill="#8485d0">CDG</text>
          <!-- Plane icon at current position -->
          <g :transform="`translate(${planeX - 10}, ${planeY - 10}) rotate(${planeAngle}, 10, 10)`">
            <circle cx="10" cy="10" r="12" fill="white" fill-opacity="0.9"/>
            <path d="M10 4 L14 12 L10 10 L6 12 Z" fill="#2230a0"/>
          </g>
        </svg>
        <!-- ETA chip -->
        <div class="ad-eta-chip">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ETA {{ eta }}
        </div>
      </div>

      <!-- Traveler chip -->
      <div class="ad-traveler-chip">
        <div class="ad-traveler-avatar" style="background:#2230a0">Y</div>
        <div class="ad-traveler-info">
          <span class="ad-traveler-name">Yasmine Belhaj</span>
          <div class="ad-live-dot"><span class="ad-live-pulse"/><span class="ad-live-text">In flight</span></div>
        </div>
        <div class="ad-traveler-flight">TK1234</div>
      </div>

      <!-- Progress timeline -->
      <div class="ad-timeline-card">
        <h3 class="ad-section-title">Delivery progress</h3>
        <div class="ad-timeline">
          <div v-for="(step, i) in timeline" :key="i" class="ad-step" :class="{ done: step.done, active: step.active }">
            <div class="ad-step-col">
              <div class="ad-step-dot">
                <svg v-if="step.done" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div v-if="i < timeline.length - 1" class="ad-step-line" :class="{ done: step.done }"/>
            </div>
            <div class="ad-step-body">
              <div class="ad-step-row">
                <span class="ad-step-title">{{ step.title }}</span>
                <span class="ad-step-time">{{ step.time }}</span>
              </div>
              <span class="ad-step-sub">{{ step.sub }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Package info -->
      <div class="ad-pkg-card">
        <div class="ad-pkg-info">
          <span class="ad-pkg-label">Package</span>
          <span class="ad-pkg-val">Smartphone + accessories</span>
        </div>
        <div class="ad-pkg-info">
          <span class="ad-pkg-label">Weight</span>
          <span class="ad-pkg-val">1.5 kg</span>
        </div>
        <div class="ad-pkg-info">
          <span class="ad-pkg-label">Booking</span>
          <span class="ad-pkg-val">#CIT-170726</span>
        </div>
      </div>

      <!-- Handoff photos -->
      <button class="ad-photos-btn" @click="showPhotos = !showPhotos">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        View handoff photos
        <span class="ad-photos-count">2</span>
      </button>
      <div v-if="showPhotos" class="ad-photos-grid">
        <div class="ad-photo-thumb" v-for="n in 2" :key="n">
          <div class="ad-photo-placeholder">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(17,17,17,0.25)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Photo {{ n }}</span>
          </div>
        </div>
      </div>

      <!-- CTA: show QR for handoff -->
      <router-link :to="`/delivery/handoff/${bookingId}`" class="ad-handoff-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          <path d="M3 17h4v4"/><path d="M3 14h1"/><path d="M7 14h1"/>
        </svg>
        Show QR code for handoff
      </router-link>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useMessagesStore } from '@/stores/messages.js'

const route      = useRoute()
const router     = useRouter()
const authStore  = useAuthStore()
const messagesStore = useMessagesStore()
const bookingId  = route.params.id || 'b1'
const progress   = ref(62) // percent along route
const showPhotos = ref(false)

const eta = '14:30'

// Plane position along quadratic bezier
function bezierPoint(t) {
  const x = (1-t)**2 * 60  + 2*(1-t)*t * 180 + t**2 * 300
  const y = (1-t)**2 * 140 + 2*(1-t)*t * 30  + t**2 * 120
  return { x, y }
}
function bezierTangent(t) {
  const dx = 2*(1-t)*(180-60) + 2*t*(300-180)
  const dy = 2*(1-t)*(30-140) + 2*t*(120-30)
  return Math.atan2(dy, dx) * 180 / Math.PI
}
const t = computed(() => progress.value / 100)
const planeX = computed(() => bezierPoint(t.value).x)
const planeY = computed(() => bezierPoint(t.value).y)
const planeAngle = computed(() => bezierTangent(t.value) - 90)

// Animate progress
let raf
onMounted(() => {
  let tick = 0
  function animate() {
    tick++
    if (tick % 120 === 0 && progress.value < 98) progress.value += 0.5
    raf = requestAnimationFrame(animate)
  }
  raf = requestAnimationFrame(animate)
})
onUnmounted(() => cancelAnimationFrame(raf))

function openChat() {
  const conversationId = messagesStore.ensureConversation({
    currentUserId: authStore.user?.id,
    otherUserId: 'u2',
    otherUser: { id: 'u2', name: 'Marie Laurent' },
    bookingId,
    seedText: 'Live delivery chat is open for this booking.',
  })
  if (conversationId) router.push(`/chat/${conversationId}`)
}

const timeline = [
  { title: 'Booking confirmed',  time: '08:00', sub: 'Payment held in escrow · #CIT-170726', done: true,  active: false },
  { title: 'Item collected',     time: '09:15', sub: 'Yasmine picked up package at TUN',      done: true,  active: false },
  { title: 'In transit',         time: '',      sub: 'Flight TK1234 · currently in the air',  done: false, active: true  },
  { title: 'OTP handoff',        time: '~14:30',sub: 'Confirm delivery with 6-digit code',    done: false, active: false },
]
</script>

<style scoped>
.ad { min-height:100vh; background:#f0f0ee; font-family:'Montserrat',sans-serif; }
.ad-header { position:sticky; top:0; z-index:50; background:#111; color:#fff; display:flex; align-items:center; gap:12px; padding:0 16px; height:58px; }
.ad-back { width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.08); border:none; border-radius:50%; color:#fff; cursor:pointer; }
.ad-back:hover { background:rgba(255,255,255,0.16); }
.ad-header-title { flex:1; font-weight:800; font-size:16px; }
.ad-chat-btn { width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.08); border-radius:50%; color:#fff; text-decoration:none; transition:background 0.15s; }
.ad-chat-btn:hover { background:rgba(255,255,255,0.16); }

.ad-body { padding:14px 16px; display:flex; flex-direction:column; gap:14px; }

/* Map */
.ad-map-card { background:#fff; border-radius:16px; border:1.5px solid rgba(17,17,17,0.1); overflow:hidden; position:relative; }
.ad-map-svg { width:100%; height:auto; display:block; }
.ad-eta-chip { position:absolute; top:12px; right:12px; background:#111; color:#e8dfa0; display:flex; align-items:center; gap:5px; padding:5px 12px; border-radius:99px; font-size:11px; font-weight:800; }

/* Traveler chip */
.ad-traveler-chip { background:#fff; border-radius:12px; border:1.5px solid rgba(17,17,17,0.1); padding:12px 14px; display:flex; align-items:center; gap:12px; }
.ad-traveler-avatar { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:900; color:#fff; flex-shrink:0; }
.ad-traveler-info { flex:1; display:flex; flex-direction:column; gap:3px; }
.ad-traveler-name { font-size:13px; font-weight:800; color:#111; }
.ad-live-dot { display:flex; align-items:center; gap:6px; }
.ad-live-pulse { width:7px; height:7px; border-radius:50%; background:#3b6d11; animation:pulse 1.4s ease-in-out infinite; display:block; }
@keyframes pulse { 0%,100% { box-shadow:0 0 0 0 rgba(59,109,17,0.4); } 50% { box-shadow:0 0 0 5px rgba(59,109,17,0); } }
.ad-live-text { font-size:11px; font-weight:700; color:#3b6d11; }
.ad-traveler-flight { font-size:13px; font-weight:800; color:#2230a0; background:#d4d8f8; padding:5px 10px; border-radius:99px; }

/* Timeline */
.ad-timeline-card { background:#fff; border-radius:16px; border:1.5px solid rgba(17,17,17,0.1); padding:18px; }
.ad-section-title { font-size:14px; font-weight:900; color:#111; margin:0 0 16px; }
.ad-timeline { display:flex; flex-direction:column; }
.ad-step { display:flex; gap:12px; padding-bottom:14px; }
.ad-step:last-child { padding-bottom:0; }
.ad-step-col { display:flex; flex-direction:column; align-items:center; flex-shrink:0; }
.ad-step-dot { width:20px; height:20px; border-radius:50%; border:2px solid rgba(17,17,17,0.18); background:#fff; display:flex; align-items:center; justify-content:center; z-index:1; }
.ad-step.done .ad-step-dot { background:#3b6d11; border-color:#3b6d11; }
.ad-step.active .ad-step-dot { background:#2230a0; border-color:#2230a0; animation:dotPulse 1.5s ease-in-out infinite; }
@keyframes dotPulse { 0%,100% { box-shadow:0 0 0 0 rgba(34,48,160,0.4); } 50% { box-shadow:0 0 0 5px rgba(34,48,160,0); } }
.ad-step-line { flex:1; width:2px; background:rgba(17,17,17,0.1); margin:3px 0; min-height:12px; }
.ad-step-line.done { background:#3b6d11; }
.ad-step-body { flex:1; padding-top:1px; }
.ad-step-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:2px; }
.ad-step-title { font-size:13px; font-weight:800; color:#111; }
.ad-step:not(.done):not(.active) .ad-step-title { color:rgba(17,17,17,0.4); }
.ad-step-time { font-size:11px; font-weight:700; color:rgba(17,17,17,0.4); }
.ad-step.active .ad-step-time { color:#2230a0; }
.ad-step-sub { font-size:11px; font-weight:500; color:rgba(17,17,17,0.4); }

/* Package card */
.ad-pkg-card { background:#fff; border-radius:14px; border:1.5px solid rgba(17,17,17,0.1); padding:14px; display:flex; gap:0; flex-wrap:wrap; }
.ad-pkg-info { flex:1; min-width:0; padding:6px 8px; }
.ad-pkg-label { display:block; font-size:9px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; color:rgba(17,17,17,0.4); margin-bottom:3px; }
.ad-pkg-val { display:block; font-size:13px; font-weight:700; color:#111; }

/* Photos button */
.ad-photos-btn { display:flex; align-items:center; gap:10px; background:#fff; border:1.5px solid rgba(17,17,17,0.12); border-radius:12px; padding:13px 16px; font-family:'Montserrat',sans-serif; font-size:13px; font-weight:700; color:#111; cursor:pointer; transition:border-color 0.15s; width:100%; }
.ad-photos-btn:hover { border-color:#2230a0; color:#2230a0; }
.ad-photos-count { margin-left:auto; background:#2230a0; color:#e8dfa0; font-size:10px; font-weight:800; padding:2px 8px; border-radius:99px; }
.ad-photos-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.ad-photo-thumb { border-radius:10px; overflow:hidden; aspect-ratio:4/3; }
.ad-photo-placeholder { width:100%; height:100%; background:#f0f0ee; border:1.5px dashed rgba(17,17,17,0.15); border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; font-size:11px; font-weight:600; color:rgba(17,17,17,0.35); }

/* Handoff button */
.ad-handoff-btn { display:flex; align-items:center; justify-content:center; gap:10px; background:#111; color:#e8dfa0; border-radius:14px; padding:16px; font-family:'Montserrat',sans-serif; font-size:14px; font-weight:800; text-decoration:none; transition:background 0.15s; }
.ad-handoff-btn:hover { background:#2230a0; }

@media (min-width:768px) { .ad-body { max-width:680px; margin:0 auto; padding:20px 24px 40px; } }
</style>
