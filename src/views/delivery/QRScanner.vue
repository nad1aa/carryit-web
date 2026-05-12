<template>
  <div class="qs">
    <header class="qs-header">
      <button class="qs-back" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="qs-header-title">Scan QR Code</span>
      <div style="width:36px"/>
    </header>

    <!-- Dark viewfinder area -->
    <div class="qs-viewfinder" @click="simulateScan">
      <div class="qs-vf-inner">
        <!-- Corner brackets -->
        <div class="qs-corners">
          <div class="qs-corner qs-corner--tl"/>
          <div class="qs-corner qs-corner--tr"/>
          <div class="qs-corner qs-corner--bl"/>
          <div class="qs-corner qs-corner--br"/>
        </div>

        <!-- Scan line -->
        <div v-if="!scanned" class="qs-scan-line"/>

        <!-- Success overlay -->
        <transition name="qs-success">
          <div v-if="scanned" class="qs-success-overlay">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span class="qs-success-text">Match found!</span>
          </div>
        </transition>
      </div>

      <p class="qs-vf-hint">{{ scanned ? 'QR code verified' : 'Point camera at sender\'s QR code' }}</p>
    </div>

    <main class="qs-body">
      <!-- Match found card -->
      <transition name="qs-slide-up">
        <div v-if="scanned" class="qs-match-card">
          <div class="qs-match-header">
            <div class="qs-match-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b6d11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <span class="qs-match-title">Booking verified</span>
            <span class="qs-match-id">#CIT-170726</span>
          </div>

          <div class="qs-match-details">
            <div class="qs-match-item">
              <span class="qs-match-label">Sender</span>
              <div class="qs-match-sender">
                <div class="qs-sender-avatar" style="background:#2230a0">K</div>
                <span class="qs-match-val">Khalil Mansour</span>
              </div>
            </div>
            <div class="qs-match-item">
              <span class="qs-match-label">Package</span>
              <span class="qs-match-val">Smartphone · 1.5kg</span>
            </div>
            <div class="qs-match-item">
              <span class="qs-match-label">Route</span>
              <span class="qs-match-val">TUN → CDG</span>
            </div>
          </div>

          <!-- Photo upload step -->
          <div class="qs-photo-section">
            <div class="qs-photo-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Photograph the item before taking it
            </div>
            <label class="qs-photo-upload" :class="{ 'has-photo': photoTaken }">
              <input type="file" accept="image/*" capture="environment" @change="onPhoto" style="display:none"/>
              <template v-if="!photoTaken">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(34,48,160,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <span>Tap to take photo</span>
              </template>
              <template v-else>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b6d11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>Photo captured</span>
              </template>
            </label>
            <div class="qs-gps-note">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 010 16c-4.42 0-8-3.58-8-8s3.58-8 8-8z"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
              Your GPS location will be logged at pickup
            </div>
          </div>

          <router-link to="/delivery/otp/b1" class="qs-confirm-btn">
            Proceed to OTP confirmation
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </router-link>
        </div>
      </transition>

      <!-- Instructions when not scanned -->
      <div v-if="!scanned" class="qs-instructions">
        <h3 class="qs-inst-title">How it works</h3>
        <div class="qs-inst-list">
          <div class="qs-inst-item">
            <div class="qs-inst-num">1</div>
            <span>Ask the sender to open their QR code in the app</span>
          </div>
          <div class="qs-inst-item">
            <div class="qs-inst-num">2</div>
            <span>Scan the code to verify the booking</span>
          </div>
          <div class="qs-inst-item">
            <div class="qs-inst-num">3</div>
            <span>Complete with a 6-digit OTP for final confirmation</span>
          </div>
        </div>
        <button class="qs-demo-btn" @click="simulateScan">Simulate scan (demo)</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const scanned   = ref(false)
const photoTaken = ref(false)

function simulateScan() {
  if (!scanned.value) scanned.value = true
}

function onPhoto(e) {
  if (e.target.files?.length) photoTaken.value = true
}
</script>

<style scoped>
.qs { min-height:100vh; background:#1a1a2e; font-family:'Montserrat',sans-serif; display:flex; flex-direction:column; }
.qs-header { position:sticky; top:0; z-index:50; background:#111; color:#fff; display:flex; align-items:center; gap:12px; padding:0 16px; height:58px; }
.qs-back { width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.08); border:none; border-radius:50%; color:#fff; cursor:pointer; }
.qs-back:hover { background:rgba(255,255,255,0.16); }
.qs-header-title { flex:1; font-weight:800; font-size:16px; }

/* Viewfinder */
.qs-viewfinder { background:#0d0d1a; padding:32px 24px 20px; display:flex; flex-direction:column; align-items:center; gap:20px; cursor:pointer; }
.qs-vf-inner { width:240px; height:240px; position:relative; }
.qs-corners { position:absolute; inset:0; }
.qs-corner { position:absolute; width:28px; height:28px; border-color:rgba(232,223,160,0.8); border-style:solid; }
.qs-corner--tl { top:0; left:0; border-width:3px 0 0 3px; border-radius:3px 0 0 0; }
.qs-corner--tr { top:0; right:0; border-width:3px 3px 0 0; border-radius:0 3px 0 0; }
.qs-corner--bl { bottom:0; left:0; border-width:0 0 3px 3px; border-radius:0 0 0 3px; }
.qs-corner--br { bottom:0; right:0; border-width:0 3px 3px 0; border-radius:0 0 3px 0; }
.qs-scan-line { position:absolute; left:12px; right:12px; height:2.5px; background:linear-gradient(90deg, transparent, #e8dfa0, transparent); border-radius:2px; animation:scanLine 2s ease-in-out infinite; }
@keyframes scanLine { 0%,100% { top:12px; opacity:0.4; } 50% { top:228px; opacity:1; } }
.qs-success-overlay { position:absolute; inset:0; background:rgba(59,109,17,0.85); border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; animation:successPop 0.3s cubic-bezier(.4,0,.2,1); }
@keyframes successPop { from { transform:scale(0.9); opacity:0; } to { transform:scale(1); opacity:1; } }
.qs-success-text { color:#fff; font-size:15px; font-weight:900; }
.qs-vf-hint { color:rgba(255,255,255,0.5); font-size:12px; font-weight:600; text-align:center; max-width:220px; }

/* Slide-up transition for match card */
.qs-slide-up-enter-active { transition:transform 0.35s cubic-bezier(.4,0,.2,1), opacity 0.35s; }
.qs-slide-up-enter-from { transform:translateY(40px); opacity:0; }

/* Success fade */
.qs-success-enter-active { transition:opacity 0.25s, transform 0.25s; }
.qs-success-enter-from { opacity:0; transform:scale(0.9); }

/* Body */
.qs-body { flex:1; background:#f0f0ee; border-radius:24px 24px 0 0; margin-top:-12px; padding:20px 16px 40px; }

/* Match card */
.qs-match-card { background:#fff; border-radius:16px; border:1.5px solid rgba(17,17,17,0.1); padding:18px; display:flex; flex-direction:column; gap:16px; }
.qs-match-header { display:flex; align-items:center; gap:10px; }
.qs-match-icon { width:36px; height:36px; background:#d1f4d1; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.qs-match-title { flex:1; font-size:14px; font-weight:900; color:#111; }
.qs-match-id { font-size:12px; font-weight:800; color:#2230a0; }
.qs-match-details { display:flex; flex-direction:column; gap:10px; }
.qs-match-item { display:flex; flex-direction:column; gap:3px; }
.qs-match-label { font-size:9px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; color:rgba(17,17,17,0.38); }
.qs-match-sender { display:flex; align-items:center; gap:8px; }
.qs-sender-avatar { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:900; color:#fff; }
.qs-match-val { font-size:13px; font-weight:700; color:#111; }
/* Photo section */
.qs-photo-section { display:flex; flex-direction:column; gap:8px; }
.qs-photo-label { display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#2230a0; }
.qs-photo-upload {
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px;
  background:#f5f5f3; border:2px dashed rgba(34,48,160,0.25); border-radius:12px;
  padding:18px; cursor:pointer; transition:all 0.15s;
  font-size:12px; font-weight:600; color:rgba(17,17,17,0.45);
}
.qs-photo-upload:hover { border-color:#2230a0; background:#eef0fc; }
.qs-photo-upload.has-photo { border-style:solid; border-color:#3b6d11; background:#f0f8ec; color:#3b6d11; }
.qs-gps-note { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:500; color:rgba(17,17,17,0.4); }

.qs-confirm-btn { display:flex; align-items:center; justify-content:center; gap:8px; background:#2230a0; color:#e8dfa0; border-radius:12px; padding:14px; font-family:'Montserrat',sans-serif; font-size:14px; font-weight:800; text-decoration:none; transition:background 0.15s; }
.qs-confirm-btn:hover { background:#111; }

/* Instructions */
.qs-instructions { padding:8px 0; }
.qs-inst-title { font-size:14px; font-weight:900; color:#111; margin:0 0 14px; }
.qs-inst-list { display:flex; flex-direction:column; gap:12px; margin-bottom:24px; }
.qs-inst-item { display:flex; align-items:flex-start; gap:12px; font-size:13px; font-weight:600; color:#555; line-height:1.4; }
.qs-inst-num { width:24px; height:24px; background:#2230a0; color:#e8dfa0; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:900; flex-shrink:0; }
.qs-demo-btn { background:#f0f0ee; border:1.5px dashed rgba(17,17,17,0.2); border-radius:10px; padding:12px; font-family:'Montserrat',sans-serif; font-size:13px; font-weight:700; color:rgba(17,17,17,0.45); cursor:pointer; width:100%; transition:border-color 0.15s; }
.qs-demo-btn:hover { border-color:#2230a0; color:#2230a0; }

@media (min-width:768px) { .qs-body { max-width:480px; margin-left:auto; margin-right:auto; } }
</style>
