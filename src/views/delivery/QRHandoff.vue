<template>
  <div class="qh">
    <header class="qh-header">
      <button class="qh-back" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="qh-header-title">Boarding Pass</span>
      <div style="width:36px"/>
    </header>

    <main class="qh-body">
      <p class="qh-eyebrow">Show this to the traveler</p>
      <h1 class="qh-heading">scan &<br>collect.</h1>

      <!-- Boarding pass ticket -->
      <div class="qh-ticket">
        <!-- Top section -->
        <div class="qh-ticket-top">
          <div class="qh-ticket-logo">CarryIt</div>
          <div class="qh-ticket-route">
            <div class="qh-ticket-city">
              <span class="qh-ticket-airport">TUN</span>
              <span class="qh-ticket-city-name">Tunis</span>
            </div>
            <div class="qh-ticket-arrow">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#2230a0">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
            </div>
            <div class="qh-ticket-city qh-ticket-city--right">
              <span class="qh-ticket-airport">CDG</span>
              <span class="qh-ticket-city-name">Paris</span>
            </div>
          </div>
        </div>

        <!-- Meta row -->
        <div class="qh-ticket-meta">
          <div class="qh-ticket-meta-item">
            <span class="qh-meta-label">Traveler</span>
            <span class="qh-meta-val">Yasmine B.</span>
          </div>
          <div class="qh-ticket-meta-item">
            <span class="qh-meta-label">Date</span>
            <span class="qh-meta-val">Jun 14</span>
          </div>
          <div class="qh-ticket-meta-item">
            <span class="qh-meta-label">Departs</span>
            <span class="qh-meta-val">08:30</span>
          </div>
          <div class="qh-ticket-meta-item">
            <span class="qh-meta-label">Weight</span>
            <span class="qh-meta-val">1.5 kg</span>
          </div>
        </div>

        <!-- Perforated separator -->
        <div class="qh-perf">
          <div class="qh-perf-hole qh-perf-hole--left"/>
          <div class="qh-perf-line"/>
          <div class="qh-perf-hole qh-perf-hole--right"/>
        </div>

        <!-- QR code section -->
        <div class="qh-qr-section">
          <!-- QR SVG (mock) -->
          <div class="qh-qr-wrap" :class="{ shimmer: shimmerActive }">
            <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" class="qh-qr-svg">
              <!-- Corner squares -->
              <rect x="10" y="10" width="40" height="40" rx="4" fill="none" stroke="#111" stroke-width="5"/>
              <rect x="18" y="18" width="24" height="24" rx="2" fill="#111"/>
              <rect x="110" y="10" width="40" height="40" rx="4" fill="none" stroke="#111" stroke-width="5"/>
              <rect x="118" y="18" width="24" height="24" rx="2" fill="#111"/>
              <rect x="10" y="110" width="40" height="40" rx="4" fill="none" stroke="#111" stroke-width="5"/>
              <rect x="18" y="118" width="24" height="24" rx="2" fill="#111"/>
              <!-- Data modules (simplified pattern) -->
              <g fill="#111">
                <rect x="58" y="10" width="8" height="8"/><rect x="70" y="10" width="8" height="8"/>
                <rect x="82" y="10" width="8" height="8"/><rect x="94" y="10" width="8" height="8"/>
                <rect x="58" y="22" width="8" height="8"/><rect x="82" y="22" width="8" height="8"/>
                <rect x="58" y="34" width="8" height="8"/><rect x="70" y="34" width="8" height="8"/>
                <rect x="94" y="34" width="8" height="8"/>
                <rect x="10" y="58" width="8" height="8"/><rect x="22" y="58" width="8" height="8"/>
                <rect x="34" y="58" width="8" height="8"/><rect x="58" y="58" width="8" height="8"/>
                <rect x="70" y="58" width="8" height="8"/><rect x="94" y="58" width="8" height="8"/>
                <rect x="106" y="58" width="8" height="8"/><rect x="130" y="58" width="8" height="8"/>
                <rect x="142" y="58" width="8" height="8"/>
                <rect x="10" y="70" width="8" height="8"/><rect x="34" y="70" width="8" height="8"/>
                <rect x="58" y="70" width="8" height="8"/><rect x="82" y="70" width="8" height="8"/>
                <rect x="118" y="70" width="8" height="8"/><rect x="142" y="70" width="8" height="8"/>
                <rect x="10" y="82" width="8" height="8"/><rect x="22" y="82" width="8" height="8"/>
                <rect x="46" y="82" width="8" height="8"/><rect x="70" y="82" width="8" height="8"/>
                <rect x="94" y="82" width="8" height="8"/><rect x="106" y="82" width="8" height="8"/>
                <rect x="130" y="82" width="8" height="8"/>
                <rect x="10" y="94" width="8" height="8"/><rect x="34" y="94" width="8" height="8"/>
                <rect x="58" y="94" width="8" height="8"/><rect x="82" y="94" width="8" height="8"/>
                <rect x="118" y="94" width="8" height="8"/>
                <rect x="58" y="106" width="8" height="8"/><rect x="82" y="106" width="8" height="8"/>
                <rect x="106" y="106" width="8" height="8"/><rect x="130" y="106" width="8" height="8"/>
                <rect x="142" y="106" width="8" height="8"/>
                <rect x="58" y="118" width="8" height="8"/><rect x="70" y="118" width="8" height="8"/>
                <rect x="94" y="118" width="8" height="8"/><rect x="118" y="118" width="8" height="8"/>
                <rect x="130" y="118" width="8" height="8"/>
                <rect x="58" y="130" width="8" height="8"/><rect x="82" y="130" width="8" height="8"/>
                <rect x="106" y="130" width="8" height="8"/><rect x="130" y="130" width="8" height="8"/>
                <rect x="58" y="142" width="8" height="8"/><rect x="70" y="142" width="8" height="8"/>
                <rect x="94" y="142" width="8" height="8"/><rect x="118" y="142" width="8" height="8"/>
                <rect x="142" y="142" width="8" height="8"/>
              </g>
            </svg>
          </div>
          <div class="qh-booking-id">#CIT-170726</div>
          <p class="qh-qr-hint">Present this QR to Yasmine at the meetup point</p>
        </div>
      </div>

      <!-- Photo notice -->
      <div class="qh-photo-notice">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>The traveler will photograph your item at pickup for proof of condition.</span>
      </div>

      <!-- Meetup info -->
      <div class="qh-meetup-card">
        <div class="qh-meetup-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 010 16c-4.42 0-8-3.58-8-8s3.58-8 8-8z"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
        </div>
        <div class="qh-meetup-text">
          <span class="qh-meetup-title">Meetup point</span>
          <span class="qh-meetup-sub">Arrivals hall, CDG Terminal 2E · Jun 14, ~14:30</span>
        </div>
      </div>

      <!-- OTP button -->
      <router-link :to="`/delivery/otp/${bookingId}`" class="qh-otp-btn">
        Confirm with OTP instead
      </router-link>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route     = useRoute()
const bookingId = route.params.id || 'b1'
const shimmerActive = ref(false)

let shimmerInterval
onMounted(() => {
  shimmerInterval = setInterval(() => {
    shimmerActive.value = true
    setTimeout(() => { shimmerActive.value = false }, 600)
  }, 3000)
})
onUnmounted(() => clearInterval(shimmerInterval))
</script>

<style scoped>
.qh { min-height:100vh; background:#f0f0ee; font-family:'Montserrat',sans-serif; }
.qh-header { position:sticky; top:0; z-index:50; background:#111; color:#fff; display:flex; align-items:center; gap:12px; padding:0 16px; height:58px; }
.qh-back { width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.08); border:none; border-radius:50%; color:#fff; cursor:pointer; }
.qh-back:hover { background:rgba(255,255,255,0.16); }
.qh-header-title { flex:1; font-weight:800; font-size:16px; }

.qh-body { padding:24px 16px 40px; display:flex; flex-direction:column; gap:16px; }
.qh-eyebrow { font-size:10px; font-weight:800; letter-spacing:0.14em; text-transform:uppercase; color:rgba(17,17,17,0.38); margin:0; }
.qh-heading { font-size:clamp(28px,8vw,38px); font-weight:900; line-height:1.1; letter-spacing:-0.04em; color:#111; margin:0; }

/* Ticket */
.qh-ticket { background:#fff; border-radius:20px; border:1.5px solid rgba(17,17,17,0.12); overflow:hidden; box-shadow:0 8px 32px rgba(17,17,17,0.1); }
.qh-ticket-top { background:#e8dfa0; padding:20px 20px 16px; }
.qh-ticket-logo { font-size:16px; font-weight:900; color:#111; letter-spacing:-0.02em; margin-bottom:16px; }
.qh-ticket-route { display:flex; align-items:center; justify-content:space-between; }
.qh-ticket-city { display:flex; flex-direction:column; gap:2px; }
.qh-ticket-city--right { text-align:right; }
.qh-ticket-airport { font-size:28px; font-weight:900; color:#111; letter-spacing:-0.02em; line-height:1; }
.qh-ticket-city-name { font-size:11px; font-weight:600; color:rgba(17,17,17,0.5); }

.qh-ticket-meta { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; padding:14px 20px; border-bottom:1px dashed rgba(17,17,17,0.12); }
.qh-ticket-meta-item { display:flex; flex-direction:column; gap:2px; }
.qh-meta-label { font-size:9px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; color:rgba(17,17,17,0.38); }
.qh-meta-val { font-size:12px; font-weight:800; color:#111; }

/* Perforated edge */
.qh-perf { display:flex; align-items:center; padding:0; margin:0; background:#f0f0ee; }
.qh-perf-hole { width:22px; height:22px; border-radius:50%; background:#f0f0ee; flex-shrink:0; }
.qh-perf-hole--left { margin-left:-11px; }
.qh-perf-hole--right { margin-right:-11px; }
.qh-perf-line { flex:1; border-top:1.5px dashed rgba(17,17,17,0.18); }

/* QR section */
.qh-qr-section { padding:20px; display:flex; flex-direction:column; align-items:center; gap:12px; }
.qh-qr-wrap { width:160px; height:160px; border-radius:8px; overflow:hidden; position:relative; }
.qh-qr-svg { width:160px; height:160px; }
.qh-qr-wrap.shimmer::after { content:''; position:absolute; inset:0; background:linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%); animation:shimmer 0.6s ease-out; }
@keyframes shimmer { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
.qh-booking-id { font-size:14px; font-weight:900; color:#2230a0; letter-spacing:0.04em; }
.qh-qr-hint { font-size:12px; font-weight:500; color:rgba(17,17,17,0.45); text-align:center; margin:0; }

/* Meetup card */
.qh-meetup-card { display:flex; align-items:center; gap:12px; background:#eef0fc; border:1.5px solid #c0c8f0; border-radius:12px; padding:14px 16px; }
.qh-meetup-icon { width:38px; height:38px; background:#d4d8f8; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.qh-meetup-text { display:flex; flex-direction:column; gap:2px; }
.qh-meetup-title { font-size:13px; font-weight:800; color:#111; }
.qh-meetup-sub { font-size:11px; font-weight:500; color:#555; }

/* Photo notice */
.qh-photo-notice { display:flex; align-items:flex-start; gap:10px; background:#f5f5f3; border:1.5px solid rgba(17,17,17,0.1); border-radius:12px; padding:12px 14px; font-size:12px; font-weight:500; color:#555; line-height:1.5; }

/* OTP button */
.qh-otp-btn { display:flex; align-items:center; justify-content:center; background:none; border:1.5px solid rgba(17,17,17,0.18); border-radius:12px; padding:14px; font-family:'Montserrat',sans-serif; font-size:13px; font-weight:700; color:rgba(17,17,17,0.55); text-decoration:none; transition:border-color 0.15s; }
.qh-otp-btn:hover { border-color:#2230a0; color:#2230a0; }

@media (min-width:768px) { .qh-body { max-width:480px; margin:0 auto; } }
</style>
