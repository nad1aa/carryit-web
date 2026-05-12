<template>
  <div class="otp">
    <header class="otp-header">
      <button class="otp-back" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="otp-header-title">OTP Confirmation</span>
      <div style="width:36px"/>
    </header>

    <main class="otp-body">
      <!-- State: waiting or confirmed -->
      <template v-if="!confirmed">
        <p class="otp-eyebrow">Final step</p>
        <h1 class="otp-heading">enter the<br>6-digit code.</h1>
        <p class="otp-sub">Ask the sender to share their one-time code to confirm delivery.</p>

        <!-- 6-digit input boxes -->
        <div class="otp-boxes">
          <input
            v-for="(_, i) in 6"
            :key="i"
            :ref="el => { if(el) inputs[i] = el }"
            v-model="digits[i]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="otp-box"
            :class="{ filled: digits[i], error: hasError }"
            @input="onInput(i, $event)"
            @keydown.backspace="onBackspace(i)"
            @paste="onPaste($event)"
          />
        </div>

        <p v-if="hasError" class="otp-error">Incorrect code. Please try again.</p>
        <div class="otp-resend-row">
          <span class="otp-resend-hint">Didn't receive the code?</span>
          <button class="otp-resend-btn" :disabled="resendCooldown > 0" @click="resend">
            {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code' }}
          </button>
        </div>

        <!-- Info card -->
        <div class="otp-info-card">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div class="otp-info-text">
            <span class="otp-info-title">When you confirm:</span>
            <ul class="otp-info-list">
              <li>Payment is released from escrow to the traveler</li>
              <li>Both parties receive a delivery receipt</li>
              <li>You can leave a review</li>
            </ul>
          </div>
        </div>

        <button class="otp-submit-btn" @click="submit" :disabled="digits.join('').length < 6 || loading">
          <span v-if="!loading">Confirm delivery</span>
          <span v-else class="otp-spinner"/>
        </button>

        <!-- Demo hint -->
        <button class="otp-demo-btn" @click="fillDemo">Use demo code: 419263</button>
      </template>

      <!-- Confirmed state -->
      <template v-else>
        <div class="otp-confirmed">
          <div class="otp-confirmed-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h1 class="otp-confirmed-title">Delivered!</h1>
          <p class="otp-confirmed-sub">Payment released. Great job, Yasmine!</p>

          <div class="otp-confirmed-summary">
            <div class="otp-conf-row">
              <span>Package</span><span>Smartphone · 1.5kg</span>
            </div>
            <div class="otp-conf-row">
              <span>You earned</span><span class="otp-conf-earn">38.50 DT</span>
            </div>
            <div class="otp-conf-row">
              <span>Booking</span><span>#CIT-170726</span>
            </div>
          </div>

          <router-link to="/review/b1" class="otp-review-btn">Leave a review →</router-link>
          <router-link to="/traveler/trips" class="otp-home-btn">Back to my trips</router-link>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route      = useRoute()
const bookingId  = route.params.id || 'b1'
const digits     = reactive(Array(6).fill(''))
const inputs     = reactive({})
const loading    = ref(false)
const hasError   = ref(false)
const confirmed  = ref(false)
const resendCooldown = ref(0)
let cooldownTimer = null

function resend() {
  if (resendCooldown.value > 0) return
  resendCooldown.value = 30
  cooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}
onUnmounted(() => clearInterval(cooldownTimer))

const DEMO_CODE = '419263'

function onInput(i, e) {
  const val = e.target.value.replace(/\D/g, '')
  digits[i] = val.slice(-1)
  hasError.value = false
  if (val && i < 5) inputs[i + 1]?.focus()
}

function onBackspace(i) {
  if (!digits[i] && i > 0) {
    digits[i - 1] = ''
    inputs[i - 1]?.focus()
  }
}

function onPaste(e) {
  const text = e.clipboardData.getData('text').replace(/\D/g,'').slice(0, 6)
  text.split('').forEach((ch, i) => { digits[i] = ch })
  inputs[Math.min(text.length, 5)]?.focus()
  e.preventDefault()
}

function fillDemo() {
  DEMO_CODE.split('').forEach((ch, i) => { digits[i] = ch })
}

async function submit() {
  const entered = digits.join('')
  loading.value = true
  await new Promise(r => setTimeout(r, 1000))
  loading.value = false
  if (entered === DEMO_CODE) {
    confirmed.value = true
  } else {
    hasError.value = true
    digits.forEach((_, i) => { digits[i] = '' })
    inputs[0]?.focus()
  }
}
</script>

<style scoped>
.otp { min-height:100vh; background:#f0f0ee; font-family:'Montserrat',sans-serif; }
.otp-header { position:sticky; top:0; z-index:50; background:#111; color:#fff; display:flex; align-items:center; gap:12px; padding:0 16px; height:58px; }
.otp-back { width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.08); border:none; border-radius:50%; color:#fff; cursor:pointer; }
.otp-back:hover { background:rgba(255,255,255,0.16); }
.otp-header-title { flex:1; font-weight:800; font-size:16px; }

.otp-body { padding:28px 24px 48px; display:flex; flex-direction:column; gap:20px; }
.otp-eyebrow { font-size:10px; font-weight:800; letter-spacing:0.14em; text-transform:uppercase; color:rgba(17,17,17,0.38); margin:0; }
.otp-heading { font-size:clamp(28px,8vw,38px); font-weight:900; line-height:1.1; letter-spacing:-0.04em; color:#111; margin:0; }
.otp-sub { font-size:14px; font-weight:500; color:#555; line-height:1.5; margin:0; }

/* OTP boxes */
.otp-boxes { display:flex; gap:10px; justify-content:center; }
.otp-box {
  width:46px; height:58px;
  background:#fff; border:2px solid rgba(17,17,17,0.14);
  border-radius:12px; font-family:'Montserrat',sans-serif;
  font-size:24px; font-weight:900; color:#111;
  text-align:center; outline:none; transition:border-color 0.15s;
  caret-color:#2230a0;
}
.otp-box:focus { border-color:#2230a0; }
.otp-box.filled { border-color:#2230a0; background:#eef0fc; }
.otp-box.error { border-color:#b0392e; background:#fde8e8; animation:shake 0.3s ease; }
@keyframes shake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-4px); } 75% { transform:translateX(4px); } }

.otp-error { font-size:12px; font-weight:700; color:#b0392e; text-align:center; margin:-8px 0 0; }
.otp-resend-row { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:-4px; }
.otp-resend-hint { font-size:11px; font-weight:500; color:rgba(17,17,17,0.45); }
.otp-resend-btn { background:none; border:none; font-family:'Montserrat',sans-serif; font-size:11px; font-weight:800; color:#2230a0; cursor:pointer; padding:2px; transition:color 0.15s; }
.otp-resend-btn:disabled { color:rgba(17,17,17,0.35); cursor:default; }
.otp-resend-btn:not(:disabled):hover { color:#111; }

/* Info card */
.otp-info-card { display:flex; align-items:flex-start; gap:10px; background:#eef0fc; border:1.5px solid #c0c8f0; border-radius:12px; padding:14px; }
.otp-info-text { display:flex; flex-direction:column; gap:8px; }
.otp-info-title { font-size:12px; font-weight:800; color:#2230a0; }
.otp-info-list { margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px; }
.otp-info-list li { font-size:12px; font-weight:500; color:#333; line-height:1.4; }

/* Submit */
.otp-submit-btn { background:#2230a0; color:#e8dfa0; border:none; border-radius:12px; padding:15px; font-family:'Montserrat',sans-serif; font-size:14px; font-weight:800; cursor:pointer; min-height:50px; display:flex; align-items:center; justify-content:center; transition:background 0.15s, opacity 0.15s; }
.otp-submit-btn:hover:not(:disabled) { background:#111; }
.otp-submit-btn:disabled { opacity:0.4; cursor:not-allowed; }
.otp-spinner { width:18px; height:18px; border:2.5px solid rgba(232,223,160,0.3); border-top-color:#e8dfa0; border-radius:50%; animation:spin 0.7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }

.otp-demo-btn { background:none; border:none; font-family:'Montserrat',sans-serif; font-size:12px; font-weight:700; color:rgba(17,17,17,0.4); cursor:pointer; text-align:center; padding:4px; }
.otp-demo-btn:hover { color:#2230a0; }

/* Confirmed state */
.otp-confirmed { display:flex; flex-direction:column; align-items:center; gap:16px; text-align:center; padding-top:24px; }
.otp-confirmed-icon { width:80px; height:80px; background:#3b6d11; border-radius:50%; display:flex; align-items:center; justify-content:center; animation:popIn 0.4s cubic-bezier(.4,0,.2,1); }
@keyframes popIn { from { transform:scale(0.6); opacity:0; } to { transform:scale(1); opacity:1; } }
.otp-confirmed-title { font-size:36px; font-weight:900; color:#111; letter-spacing:-0.04em; margin:0; }
.otp-confirmed-sub { font-size:14px; font-weight:500; color:#555; margin:0; }
.otp-confirmed-summary { background:#fff; border-radius:14px; border:1.5px solid rgba(17,17,17,0.1); padding:16px; width:100%; display:flex; flex-direction:column; gap:10px; text-align:left; }
.otp-conf-row { display:flex; justify-content:space-between; align-items:center; font-size:13px; font-weight:600; color:#555; }
.otp-conf-earn { font-size:18px; font-weight:900; color:#3b6d11; }
.otp-review-btn { background:#2230a0; color:#e8dfa0; border-radius:12px; padding:14px 32px; font-family:'Montserrat',sans-serif; font-size:14px; font-weight:800; text-decoration:none; transition:background 0.15s; }
.otp-review-btn:hover { background:#111; }
.otp-home-btn { font-size:13px; font-weight:700; color:rgba(17,17,17,0.45); text-decoration:none; }
.otp-home-btn:hover { color:#111; }

@media (min-width:768px) { .otp-body { max-width:480px; margin:0 auto; } }
</style>
