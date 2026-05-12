<template>
  <div class="br-page">
    <header class="br-header">
      <button class="br-back" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="br-header-title">Booking Requests</span>
      <div class="br-header-badge">{{ pendingRequests.length }}</div>
      <button v-if="pendingRequests.length > 0" class="br-match-btn" @click="openSwipe">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
        Match
      </button>
    </header>

    <main class="br-list">
      <div v-for="req in requests" :key="req.id" class="br-card">
        <!-- Sender info -->
        <div class="br-sender-row">
          <div class="br-sender-avatar" :style="{ background: req.avatarColor }">{{ req.name[0] }}</div>
          <div class="br-sender-info">
            <span class="br-sender-name">{{ req.name }}</span>
            <div class="br-sender-meta">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {{ req.rating }}
              <span class="br-sender-meta-dot">·</span>
              {{ req.sends }} sends
            </div>
          </div>
          <!-- Countdown timer -->
          <div class="br-timer" :class="{ urgent: req.timeLeft < 60 }">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {{ formatTime(req.timeLeft) }}
          </div>
        </div>

        <!-- Package preview SVG -->
        <div class="br-pkg-preview">
          <svg viewBox="0 0 220 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 3D box -->
            <path d="M60 25 L110 5 L160 25 L160 75 L110 95 L60 75 Z" fill="rgba(34,48,160,0.06)" stroke="#2230a0" stroke-width="1.5"/>
            <path d="M60 25 L110 45 L160 25" stroke="#2230a0" stroke-width="1.5"/>
            <path d="M110 45 L110 95" stroke="#2230a0" stroke-width="1.5" stroke-dasharray="4 3"/>
            <!-- Labels -->
            <text x="110" y="55" text-anchor="middle" font-family="Montserrat,sans-serif" font-size="9" font-weight="700" fill="#2230a0">{{ req.weight }}kg</text>
            <text x="110" y="68" text-anchor="middle" font-family="Montserrat,sans-serif" font-size="8" fill="rgba(17,17,17,0.45)">{{ req.dimensions }}</text>
            <!-- Fragile tag -->
            <rect v-if="req.fragile" x="155" y="4" width="46" height="16" rx="8" fill="#fef3c7"/>
            <text v-if="req.fragile" x="178" y="15" text-anchor="middle" font-family="Montserrat,sans-serif" font-size="8" font-weight="800" fill="#854f0b">FRAGILE</text>
          </svg>
        </div>

        <!-- Item details -->
        <div class="br-item-details">
          <div class="br-item-row">
            <span class="br-item-label">Item</span>
            <span class="br-item-val">{{ req.item }}</span>
          </div>
          <div class="br-item-row">
            <span class="br-item-label">Weight</span>
            <span class="br-item-val">{{ req.weight }} kg</span>
          </div>
          <div class="br-item-row">
            <span class="br-item-label">Declared value</span>
            <span class="br-item-val">{{ req.value }} DT</span>
          </div>
          <div class="br-item-row br-item-row--earn">
            <span class="br-item-label">You earn</span>
            <span class="br-earn-val">{{ (req.weight * req.pricePerKg * 0.9).toFixed(2) }} DT</span>
          </div>
        </div>

        <!-- Note from sender -->
        <div v-if="req.note" class="br-note">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          "{{ req.note }}"
        </div>

        <div v-if="req.status === 'accepted'" class="br-accepted-note">
          <span>Accepted</span>
          <strong>Conversation is ready with {{ req.name }}.</strong>
        </div>

        <!-- Actions -->
        <div class="br-actions">
          <button v-if="req.status !== 'accepted'" class="br-btn-decline" @click="handleDecline(req.id)">Decline</button>
          <button class="br-btn-chat" :class="{ ready: req.status === 'accepted' }" :disabled="req.status !== 'accepted'" @click="openConversation(req)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            Message
          </button>
          <button v-if="req.status !== 'accepted'" class="br-btn-accept" @click="handleAccept(req.id)">Accept</button>
        </div>
      </div>

      <div v-if="requests.length === 0" class="br-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(17,17,17,0.2)" stroke-width="1.5"><path d="M21 10V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10"/><path d="M1 5h22v5H1z"/></svg>
        <span>No pending requests</span>
      </div>
    </main>

    <!-- Bottom tab bar -->
    <nav class="br-tab-bar">
      <router-link to="/traveler/trips" class="br-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        <span>My Trips</span>
      </router-link>
      <router-link to="/traveler/requests" class="br-tab active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10"/><path d="M1 5h22v5H1z"/></svg>
        <span>Requests</span>
      </router-link>
      <router-link to="/traveler/earnings" class="br-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        <span>Earnings</span>
      </router-link>
      <router-link to="/profile" class="br-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Profile</span>
      </router-link>
    </nav>

    <!-- ═══ SWIPE MATCH OVERLAY ═══ -->
    <Teleport to="body">
      <div v-if="swipeMode" class="br-swipe-overlay">
        <div class="br-swipe-hdr">
          <button class="br-swipe-close" @click="swipeMode = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <span class="br-swipe-hdr-title">Match requests</span>
          <span class="br-swipe-hdr-count" v-if="currentReq">{{ swipeIndex + 1 }} / {{ allRequests.length }}</span>
          <span class="br-swipe-hdr-count" v-else>Done</span>
        </div>

        <div class="br-swipe-arena">
          <div v-if="!currentReq" class="br-swipe-done">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(17,17,17,0.25)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
            <p>All requests reviewed</p>
            <button class="br-swipe-restart" @click="swipeIndex = 0">Start over</button>
          </div>

          <template v-else>
            <div v-for="depth in [2, 1]" :key="'bg' + depth"
              class="br-swipe-card br-swipe-card--bg"
              :style="bgCardStyle(depth)">
              <div v-if="allRequests[swipeIndex + depth]" class="br-swipe-card-inner">
                <div class="br-swipe-avatar" :style="{ background: allRequests[swipeIndex + depth].avatarColor }">
                  {{ allRequests[swipeIndex + depth].name[0] }}
                </div>
              </div>
            </div>

            <div class="br-swipe-card br-swipe-card--active"
              :style="activeCardStyle"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointercancel="onPointerUp">
              <div class="br-swipe-label br-swipe-label--yes" :style="{ opacity: Math.min(1, Math.max(0, dragX / 100)) }">ACCEPT</div>
              <div class="br-swipe-label br-swipe-label--no"  :style="{ opacity: Math.min(1, Math.max(0, -dragX / 100)) }">DECLINE</div>

              <div class="br-swipe-card-body">
                <div class="br-swipe-top">
                  <div class="br-swipe-avatar" :style="{ background: currentReq.avatarColor }">{{ currentReq.name[0] }}</div>
                  <div class="br-swipe-info">
                    <span class="br-swipe-name">{{ currentReq.name }}</span>
                    <div class="br-swipe-meta">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {{ currentReq.rating }} · {{ currentReq.sends }} sends
                    </div>
                  </div>
                  <div class="br-swipe-earn">
                    <span class="br-swipe-earn-val">{{ (currentReq.weight * currentReq.pricePerKg * 0.9).toFixed(0) }} DT</span>
                    <span class="br-swipe-earn-lbl">you earn</span>
                  </div>
                </div>

                <div class="br-swipe-pkg">
                  <div class="br-swipe-pkg-row">
                    <span class="br-swipe-pkg-lbl">Item</span>
                    <span class="br-swipe-pkg-val">{{ currentReq.item }}</span>
                  </div>
                  <div class="br-swipe-pkg-row">
                    <span class="br-swipe-pkg-lbl">Weight</span>
                    <span class="br-swipe-pkg-val">{{ currentReq.weight }} kg</span>
                  </div>
                  <div class="br-swipe-pkg-row">
                    <span class="br-swipe-pkg-lbl">Dimensions</span>
                    <span class="br-swipe-pkg-val">{{ currentReq.dimensions }}</span>
                  </div>
                  <div v-if="currentReq.fragile" class="br-swipe-fragile">FRAGILE</div>
                </div>

                <div v-if="currentReq.note" class="br-swipe-note">"{{ currentReq.note }}"</div>
              </div>
            </div>
          </template>
        </div>

        <div v-if="currentReq" class="br-swipe-actions">
          <button class="br-swipe-action br-swipe-action--decline" @click="declineReq" title="Decline">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button class="br-swipe-action br-swipe-action--accept" @click="acceptReq" title="Accept">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>

        <p class="br-swipe-hint">Drag right to accept · left to decline</p>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useMessagesStore } from '@/stores/messages.js'

const router = useRouter()
const authStore = useAuthStore()
const messagesStore = useMessagesStore()

const requests = ref([
  { id:'r1', bookingId:'br-r1', senderId:'req-khalil', status:'pending', name:'Khalil Mansour', rating:4.8, sends:12, avatarColor:'#2230a0', item:'Smartphone + accessories', weight:1.5, dimensions:'20x12x8 cm', value:1400, pricePerKg:25, fragile:false, timeLeft:3540, note:'Please handle carefully, it is a gift!' },
  { id:'r2', bookingId:'br-r2', senderId:'req-sara', status:'pending', name:'Sara Belhaj', rating:5.0, sends:34, avatarColor:'#8485d0', item:'Cosmetics & skincare', weight:2.2, dimensions:'25x18x12 cm', value:380, pricePerKg:25, fragile:false, timeLeft:7200, note:'' },
])

// Keep a full snapshot for swipe mode (so declining in swipe doesn't remove from list yet)
const pendingRequests = computed(() => requests.value.filter(req => req.status === 'pending'))
const allRequests = computed(() => pendingRequests.value)

// ── Swipe match ──────────────────────────────────────────────────────────────
const swipeMode  = ref(false)
const swipeIndex = ref(0)
const dragX      = ref(0)
const dragging   = ref(false)
let startX = 0

const currentReq = computed(() =>
  swipeIndex.value < allRequests.value.length ? allRequests.value[swipeIndex.value] : null
)

function openSwipe() {
  swipeIndex.value = 0
  dragX.value = 0
  swipeMode.value = true
}

function declineReq() {
  dragX.value = 0
  swipeIndex.value++
}

function acceptReq() {
  if (!currentReq.value) return
  swipeMode.value = false
  handleAccept(currentReq.value.id)
}

function onPointerDown(e) {
  dragging.value = true
  startX = e.clientX
  dragX.value = 0
  e.currentTarget.setPointerCapture(e.pointerId)
}
function onPointerMove(e) {
  if (!dragging.value) return
  dragX.value = e.clientX - startX
}
function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  const dx = dragX.value
  dragX.value = 0
  if (dx > 80)       acceptReq()
  else if (dx < -80) declineReq()
}

const activeCardStyle = computed(() => ({
  transform: `translateX(${dragX.value}px) rotate(${dragX.value * 0.05}deg)`,
  transition: dragging.value ? 'none' : 'transform 0.35s cubic-bezier(.4,0,.2,1)',
  cursor: dragging.value ? 'grabbing' : 'grab',
}))

function bgCardStyle(depth) {
  return {
    transform: `translateY(${depth * 14}px) scale(${1 - depth * 0.045})`,
    zIndex: 10 - depth,
    opacity: 1 - depth * 0.18,
  }
}

function formatTime(secs) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function handleAccept(id) {
  const req = requests.value.find(r => r.id === id)
  if (!req) return
  req.status = 'accepted'
  ensureConversation(req)
}
function handleDecline(id) {
  const i = requests.value.findIndex(r => r.id === id)
  if (i !== -1) requests.value.splice(i, 1)
}

function ensureConversation(req) {
  return messagesStore.ensureConversation({
    currentUserId: authStore.user?.id,
    otherUserId: req.senderId,
    otherUser: { id: req.senderId, name: req.name },
    bookingId: req.bookingId,
    seedText: `Accepted your request for ${req.item}. Message me here so we can coordinate pickup.`,
  })
}

function openConversation(req) {
  const conversationId = ensureConversation(req)
  if (conversationId) router.push(`/chat/${conversationId}`)
}
</script>

<style scoped>
.br-page { min-height:100vh; background:#f0f0ee; font-family:'Montserrat',sans-serif; }
.br-header { position:sticky; top:0; z-index:50; background:#111; color:#fff; display:flex; align-items:center; gap:12px; padding:0 16px; height:58px; }
.br-back { width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.08); border:none; border-radius:50%; color:#fff; cursor:pointer; }
.br-back:hover { background:rgba(255,255,255,0.16); }
.br-header-title { flex:1; font-weight:800; font-size:16px; }
.br-header-badge { background:#e8dfa0; color:#111; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:900; }

.br-list { padding:14px 16px 90px; display:flex; flex-direction:column; gap:14px; }

.br-card { background:#fff; border-radius:16px; border:1.5px solid rgba(17,17,17,0.1); padding:18px; display:flex; flex-direction:column; gap:14px; }

/* Sender row */
.br-sender-row { display:flex; align-items:center; gap:10px; }
.br-sender-avatar { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:900; color:#fff; flex-shrink:0; }
.br-sender-info { flex:1; display:flex; flex-direction:column; gap:3px; }
.br-sender-name { font-size:14px; font-weight:800; color:#111; }
.br-sender-meta { display:flex; align-items:center; gap:4px; font-size:11px; font-weight:600; color:rgba(17,17,17,0.45); }
.br-sender-meta-dot { color:rgba(17,17,17,0.25); }
.br-timer { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:800; color:#854f0b; background:#fef3c7; padding:5px 10px; border-radius:99px; flex-shrink:0; }
.br-timer.urgent { color:#b0392e; background:#fde8e8; animation:urgentPulse 1s ease-in-out infinite; }
@keyframes urgentPulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }

/* Package preview */
.br-pkg-preview { background:#f5f5f3; border-radius:12px; padding:8px; }
.br-pkg-preview svg { width:100%; height:auto; max-height:100px; }

/* Item details */
.br-item-details { display:flex; flex-direction:column; gap:8px; }
.br-item-row { display:flex; align-items:center; justify-content:space-between; font-size:13px; }
.br-item-label { font-weight:600; color:rgba(17,17,17,0.45); }
.br-item-val { font-weight:700; color:#111; }
.br-item-row--earn { margin-top:4px; padding-top:10px; border-top:1.5px dashed rgba(17,17,17,0.12); }
.br-earn-val { font-size:18px; font-weight:900; color:#3b6d11; }

/* Note */
.br-note { display:flex; align-items:flex-start; gap:8px; background:#eef0fc; border-radius:10px; padding:12px; font-size:12px; font-weight:500; color:#333; font-style:italic; line-height:1.5; }
.br-accepted-note { display:flex; align-items:center; justify-content:space-between; gap:10px; background:#f7f0dc; border:1.5px dashed #2230a0; border-radius:12px; padding:11px 12px; }
.br-accepted-note span { color:#2230a0; font-size:10px; font-weight:900; letter-spacing:0.1em; text-transform:uppercase; }
.br-accepted-note strong { color:#111; font-size:12px; font-weight:800; text-align:right; }

/* Actions */
.br-actions { display:flex; gap:8px; }
.br-btn-decline { flex:1; background:none; border:1.5px solid rgba(17,17,17,0.18); border-radius:10px; padding:12px; font-family:'Montserrat',sans-serif; font-size:13px; font-weight:700; color:rgba(17,17,17,0.5); cursor:pointer; transition:all 0.15s; }
.br-btn-decline:hover { border-color:#b0392e; color:#b0392e; }
.br-btn-chat { display:flex; align-items:center; justify-content:center; gap:6px; background:#f0f0ee; border:none; border-radius:10px; padding:12px 14px; font-family:'Montserrat',sans-serif; font-size:13px; font-weight:800; color:rgba(17,17,17,0.45); text-decoration:none; transition:all 0.15s; flex-shrink:0; cursor:not-allowed; }
.br-btn-chat.ready { background:#111; color:#e8dfa0; cursor:pointer; box-shadow:0 8px 20px rgba(17,17,17,0.15); }
.br-btn-chat.ready:hover { background:#2230a0; transform:translateY(-1px); }
.br-btn-accept { flex:1.5; background:#2230a0; color:#e8dfa0; border:none; border-radius:10px; padding:12px; font-family:'Montserrat',sans-serif; font-size:13px; font-weight:800; cursor:pointer; transition:background 0.15s; }
.br-btn-accept:hover { background:#111; }

.br-empty { display:flex; flex-direction:column; align-items:center; gap:12px; padding:48px 0; color:rgba(17,17,17,0.35); font-size:13px; font-weight:600; }
@media (min-width:768px) { .br-list { max-width:600px; margin:0 auto; } }

/* Match button in header */
.br-match-btn { display:flex; align-items:center; gap:5px; background:#e8dfa0; color:#111; border:none; border-radius:99px; padding:7px 12px; font-family:'Montserrat',sans-serif; font-size:11px; font-weight:800; cursor:pointer; flex-shrink:0; transition:background 0.15s; }
.br-match-btn:hover { background:#fff; }

/* Tab bar */
.br-tab-bar { position:fixed; bottom:0; left:0; right:0; z-index:200; background:#111; display:flex; align-items:stretch; height:64px; border-top:2px solid rgba(255,255,255,0.06); padding-bottom:env(safe-area-inset-bottom,0px); }
.br-tab { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; border:none; background:transparent; cursor:pointer; color:rgba(255,255,255,0.42); font-family:'Montserrat',sans-serif; font-size:9px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; text-decoration:none; transition:color 0.15s; padding:0 4px; }
.br-tab.active, .br-tab:hover { color:#fff; }
.br-tab svg { width:22px; height:22px; flex-shrink:0; }

/* Swipe overlay */
.br-swipe-overlay { position:fixed; inset:0; z-index:9000; background:#f0f0ee; display:flex; flex-direction:column; font-family:'Montserrat',sans-serif; }
.br-swipe-hdr { display:flex; align-items:center; gap:12px; padding:0 16px; height:58px; background:#111; color:#fff; flex-shrink:0; }
.br-swipe-close { width:34px; height:34px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.1); border:none; border-radius:50%; color:#fff; cursor:pointer; }
.br-swipe-hdr-title { flex:1; font-weight:800; font-size:16px; }
.br-swipe-hdr-count { font-size:12px; font-weight:600; color:rgba(255,255,255,0.5); }
.br-swipe-arena { flex:1; display:flex; align-items:center; justify-content:center; position:relative; padding:20px; overflow:hidden; }
.br-swipe-done { display:flex; flex-direction:column; align-items:center; gap:14px; color:rgba(17,17,17,0.4); font-size:14px; font-weight:600; }
.br-swipe-restart { background:#111; color:#e8dfa0; border:none; border-radius:99px; padding:10px 24px; font-family:'Montserrat',sans-serif; font-size:13px; font-weight:800; cursor:pointer; margin-top:8px; }

/* Swipe cards */
.br-swipe-card { position:absolute; width:calc(100% - 40px); max-width:400px; background:#fff; border-radius:20px; border:1.5px solid rgba(17,17,17,0.1); box-shadow:0 8px 32px rgba(17,17,17,0.12); user-select:none; touch-action:none; }
.br-swipe-card--active { z-index:20; }
.br-swipe-card--bg { z-index:10; pointer-events:none; }
.br-swipe-card-inner { display:flex; align-items:center; justify-content:center; padding:28px; }
.br-swipe-card-body { padding:20px; display:flex; flex-direction:column; gap:14px; }

/* Labels */
.br-swipe-label { position:absolute; top:20px; padding:6px 16px; border-radius:99px; font-size:13px; font-weight:900; letter-spacing:0.08em; pointer-events:none; }
.br-swipe-label--yes { left:16px; background:#d1f4d1; color:#2d5a2d; border:2px solid #3b6d11; }
.br-swipe-label--no  { right:16px; background:#fde8e8; color:#b0392e; border:2px solid #b0392e; }

/* Card content */
.br-swipe-top { display:flex; align-items:center; gap:12px; }
.br-swipe-avatar { width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; color:#fff; flex-shrink:0; }
.br-swipe-info { flex:1; }
.br-swipe-name { font-size:16px; font-weight:800; color:#111; display:block; }
.br-swipe-meta { font-size:11px; font-weight:600; color:rgba(17,17,17,0.45); display:flex; align-items:center; gap:4px; margin-top:3px; }
.br-swipe-earn { text-align:right; }
.br-swipe-earn-val { display:block; font-size:20px; font-weight:900; color:#3b6d11; line-height:1.1; }
.br-swipe-earn-lbl { font-size:9px; font-weight:700; color:rgba(17,17,17,0.4); text-transform:uppercase; letter-spacing:0.06em; }
.br-swipe-pkg { background:#f5f5f3; border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px; }
.br-swipe-pkg-row { display:flex; justify-content:space-between; font-size:12px; }
.br-swipe-pkg-lbl { font-weight:600; color:rgba(17,17,17,0.45); }
.br-swipe-pkg-val { font-weight:700; color:#111; }
.br-swipe-fragile { align-self:flex-start; background:#fef3c7; color:#854f0b; font-size:9px; font-weight:800; padding:3px 10px; border-radius:99px; letter-spacing:0.08em; }
.br-swipe-note { font-size:12px; font-weight:500; color:#555; font-style:italic; line-height:1.5; background:#eef0fc; border-radius:10px; padding:10px 12px; }

/* Action buttons */
.br-swipe-actions { display:flex; justify-content:center; gap:32px; padding:16px; flex-shrink:0; }
.br-swipe-action { width:64px; height:64px; border-radius:50%; border:2px solid; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.15s; background:#fff; }
.br-swipe-action--decline { border-color:#b0392e; color:#b0392e; }
.br-swipe-action--decline:hover { background:#fde8e8; }
.br-swipe-action--accept { border-color:#3b6d11; color:#3b6d11; }
.br-swipe-action--accept:hover { background:#d1f4d1; }
.br-swipe-hint { text-align:center; font-size:11px; font-weight:600; color:rgba(17,17,17,0.35); padding:0 0 20px; flex-shrink:0; }
</style>
