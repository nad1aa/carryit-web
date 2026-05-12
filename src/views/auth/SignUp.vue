<template>
  <div class="su">
    <!-- Header -->
    <header class="su-header">
      <button class="su-back" @click="step > 1 ? step-- : $router.back()" aria-label="Back">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="su-progress">
        <div class="su-progress-bar">
          <div class="su-progress-fill" :style="{ width: (step / totalSteps * 100) + '%' }"/>
        </div>
        <span class="su-progress-label">Step {{ step }} of {{ totalSteps }}</span>
      </div>
      <div style="width:36px"/>
    </header>

    <!-- Step 1: Role + Basic info -->
    <main class="su-body" v-if="step === 1">
      <p class="su-eyebrow">Create account</p>
      <h1 class="su-heading">who are<br>you?</h1>

      <!-- Role selector -->
      <div class="su-roles">
        <button
          v-for="role in roles"
          :key="role.id"
          class="su-role-card"
          :class="{ active: selectedRole === role.id }"
          @click="selectedRole = role.id"
        >
          <div class="su-role-icon">
            <component :is="role.icon" />
          </div>
          <div class="su-role-info">
            <span class="su-role-name">{{ role.label }}</span>
            <span class="su-role-desc">{{ role.desc }}</span>
          </div>
          <div class="su-role-check">
            <svg v-if="selectedRole === role.id" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="8" fill="#2230a0"/>
              <path d="M5 8l2 2 4-4" stroke="#e8dfa0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div v-else class="su-role-check-empty"/>
          </div>
        </button>
      </div>

      <div class="su-form">
        <div class="su-fields-2col">
          <div class="su-field">
            <label class="su-label">First name</label>
            <input v-model="form.firstName" type="text" class="su-input" placeholder="Amina"/>
          </div>
          <div class="su-field">
            <label class="su-label">Last name</label>
            <input v-model="form.lastName" type="text" class="su-input" placeholder="Ben Ali"/>
          </div>
        </div>
        <div class="su-field">
          <label class="su-label">Email</label>
          <input v-model="form.email" type="email" class="su-input" placeholder="you@example.com"/>
        </div>
        <div class="su-field">
          <label class="su-label">Phone</label>
          <input v-model="form.phone" type="tel" class="su-input" placeholder="+216 xx xxx xxx"/>
        </div>
      </div>

      <button class="su-btn-primary" @click="step++" :disabled="!selectedRole || !form.firstName || !form.email">
        Continue
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8H13M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </main>

    <!-- Step 2: Phone OTP verification -->
    <main class="su-body" v-if="step === 2">
      <p class="su-eyebrow">Verify your number</p>
      <h1 class="su-heading">enter the<br>sms code.</h1>
      <p class="su-sub">We sent a 6-digit code to <strong>{{ form.phone || '+216 xx xxx xxx' }}</strong></p>

      <div class="su-otp-boxes">
        <input
          v-for="(_, i) in 6"
          :key="i"
          :ref="el => { if(el) otpInputs[i] = el }"
          v-model="otpDigits[i]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="su-otp-box"
          :class="{ filled: otpDigits[i], error: otpError }"
          @input="onOtpInput(i, $event)"
          @keydown.backspace="onOtpBackspace(i)"
        />
      </div>
      <p v-if="otpError" class="su-otp-error">Incorrect code. Try again.</p>

      <div class="su-resend-row">
        <span class="su-resend-hint">Didn't receive it?</span>
        <button class="su-resend-btn" :disabled="otpCooldown > 0" @click="resendOtp">
          {{ otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend SMS' }}
        </button>
      </div>

      <button class="su-btn-demo" @click="fillDemoOtp">Use demo code: 419263</button>

      <button class="su-btn-primary" @click="verifyOtp" :disabled="otpDigits.join('').length < 6 || otpLoading">
        <span v-if="!otpLoading">Verify number</span>
        <span v-else class="su-spinner"/>
      </button>
    </main>

    <!-- Step 3: Password -->
    <main class="su-body" v-if="step === 3">
      <p class="su-eyebrow">Security</p>
      <h1 class="su-heading">set your<br>password.</h1>
      <p class="su-sub">Choose something strong and memorable.</p>

      <div class="su-form">
        <div class="su-field">
          <label class="su-label">Password</label>
          <div class="su-pw-wrap">
            <input v-model="form.password" :type="showPw ? 'text' : 'password'" class="su-input" placeholder="Min. 8 characters"/>
            <button type="button" class="su-pw-toggle" @click="showPw = !showPw">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <!-- Strength bar -->
          <div class="su-strength-row">
            <div class="su-strength-bar">
              <div class="su-strength-fill" :style="{ width: strengthPct + '%', background: strengthColor }"/>
            </div>
            <span class="su-strength-label" :style="{ color: strengthColor }">{{ strengthLabel }}</span>
          </div>
        </div>
        <div class="su-field">
          <label class="su-label">Confirm password</label>
          <input v-model="form.confirm" :type="showPw ? 'text' : 'password'" class="su-input" placeholder="Repeat password"
            :class="{ 'su-input-error': form.confirm && form.confirm !== form.password }"/>
          <span v-if="form.confirm && form.confirm !== form.password" class="su-field-error">Passwords don't match</span>
        </div>
      </div>

      <button class="su-btn-primary" @click="step++" :disabled="!form.password || form.password !== form.confirm || form.password.length < 8">
        Continue
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8H13M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </main>

    <!-- Step 4: Terms -->
    <main class="su-body" v-if="step === 4">
      <p class="su-eyebrow">Almost done</p>
      <h1 class="su-heading">agree &<br>join us.</h1>

      <div class="su-terms-card">
        <div class="su-terms-list">
          <div class="su-terms-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Your data is encrypted and never sold</span>
          </div>
          <div class="su-terms-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <span>Verified traveler & sender community</span>
          </div>
          <div class="su-terms-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <span>Secure payments, escrow protected</span>
          </div>
        </div>
      </div>

      <div class="su-check-row">
        <label class="su-check-label">
          <input type="checkbox" v-model="agreedTerms" class="su-check-input"/>
          <span class="su-checkmark">
            <svg v-if="agreedTerms" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          I agree to the <router-link to="/about" class="su-check-label-link">Terms of Service</router-link> and <router-link to="/about" class="su-check-label-link">Privacy Policy</router-link>
        </label>
      </div>

      <button class="su-btn-primary" @click="submit" :disabled="!agreedTerms || loading">
        <span v-if="!loading">Create my account</span>
        <span v-else class="su-spinner"/>
      </button>

      <div class="su-divider"><span>or sign up with</span></div>
      <div class="su-sso-row">
        <button type="button" class="su-sso-btn" @click="handleSSO('google')" :disabled="!!ssoLoading">
          <span v-if="ssoLoading === 'google'" class="su-sso-spinner"/>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button type="button" class="su-sso-btn" @click="handleSSO('apple')" :disabled="!!ssoLoading">
          <span v-if="ssoLoading === 'apple'" class="su-sso-spinner"/>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Apple
        </button>
      </div>

      <p class="su-signin-link">
        Already have an account?
        <router-link to="/auth/signin">Sign in</router-link>
      </p>
      <p class="su-signin-link">
        <router-link to="/">← Back to homepage</router-link>
      </p>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, defineComponent, h, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router     = useRouter()
const step       = ref(1)
const totalSteps = 4
const selectedRole = ref(null)
const showPw     = ref(false)
const agreedTerms = ref(false)
const loading    = ref(false)
const ssoLoading = ref('')

const form = ref({
  firstName: '', lastName: '', email: '', phone: '',
  password: '', confirm: '',
})

// OTP state
const otpDigits  = reactive(Array(6).fill(''))
const otpInputs  = reactive({})
const otpError   = ref(false)
const otpLoading = ref(false)
const otpCooldown = ref(0)
let otpTimer = null
const DEMO_OTP = '419263'

function onOtpInput(i, e) {
  const val = e.target.value.replace(/\D/g, '')
  otpDigits[i] = val.slice(-1)
  otpError.value = false
  if (val && i < 5) otpInputs[i + 1]?.focus()
}
function onOtpBackspace(i) {
  if (!otpDigits[i] && i > 0) {
    otpDigits[i - 1] = ''
    otpInputs[i - 1]?.focus()
  }
}
function fillDemoOtp() {
  DEMO_OTP.split('').forEach((ch, i) => { otpDigits[i] = ch })
}
function resendOtp() {
  if (otpCooldown.value > 0) return
  otpCooldown.value = 30
  otpTimer = setInterval(() => {
    otpCooldown.value--
    if (otpCooldown.value <= 0) clearInterval(otpTimer)
  }, 1000)
}
async function verifyOtp() {
  otpLoading.value = true
  await new Promise(r => setTimeout(r, 800))
  otpLoading.value = false
  if (otpDigits.join('') === DEMO_OTP) {
    step.value++
  } else {
    otpError.value = true
    otpDigits.forEach((_, i) => { otpDigits[i] = '' })
    otpInputs[0]?.focus()
  }
}

// Icon components
const IconSend = defineComponent({ render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', width: 24, height: 24 }, [
  h('line', { x1: '22', y1: '2', x2: '11', y2: '13' }),
  h('polygon', { points: '22 2 15 22 11 13 2 9 22 2' }),
]) })
const IconPlane = defineComponent({ render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', width: 24, height: 24 }, [
  h('path', { d: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' }),
]) })
const IconBoth = defineComponent({ render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', width: 24, height: 24 }, [
  h('polyline', { points: '17 1 21 5 17 9' }),
  h('path', { d: 'M3 11V9a4 4 0 014-4h14' }),
  h('polyline', { points: '7 23 3 19 7 15' }),
  h('path', { d: 'M21 13v2a4 4 0 01-4 4H3' }),
]) })

const roles = [
  { id: 'sender',   label: 'Sender',   desc: 'I want to send packages',        icon: IconSend  },
  { id: 'traveler', label: 'Traveler', desc: 'I carry packages on my trips',   icon: IconPlane },
  { id: 'both',     label: 'Both',     desc: 'I do both — flexible!',           icon: IconBoth  },
]

// Password strength
const strengthPct = computed(() => {
  const p = form.value.password
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s += 25
  if (p.length >= 12) s += 15
  if (/[A-Z]/.test(p)) s += 20
  if (/[0-9]/.test(p)) s += 20
  if (/[^A-Za-z0-9]/.test(p)) s += 20
  return Math.min(s, 100)
})
const strengthColor = computed(() => {
  const v = strengthPct.value
  if (v < 40) return '#b0392e'
  if (v < 70) return '#854f0b'
  return '#3b6d11'
})
const strengthLabel = computed(() => {
  const v = strengthPct.value
  if (!v) return ''
  if (v < 40) return 'Weak'
  if (v < 70) return 'Fair'
  if (v < 90) return 'Good'
  return 'Strong'
})

async function submit() {
  loading.value = true
  await new Promise(r => setTimeout(r, 900))
  loading.value = false
  router.push('/auth/profile-setup')
}

async function handleSSO(provider) {
  ssoLoading.value = provider
  await new Promise(r => setTimeout(r, 1100))
  ssoLoading.value = ''
  router.push('/auth/profile-setup')
}

onUnmounted(() => clearInterval(otpTimer))
</script>

<style scoped>
.su {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Montserrat', sans-serif;
  background: #f0f0ee;
}

/* Header */
.su-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 0 20px;
  height: 58px;
  background: #111;
  color: #fff;
  flex-shrink: 0;
}
.su-back {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.08);
  border: none; border-radius: 50%;
  color: #fff; cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.su-back:hover { background: rgba(255,255,255,0.16); }

.su-progress {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.su-progress-bar {
  height: 4px;
  background: rgba(255,255,255,0.14);
  border-radius: 99px;
  overflow: hidden;
}
.su-progress-fill {
  height: 100%;
  background: #e8dfa0;
  border-radius: 99px;
  transition: width 0.4s cubic-bezier(.4,0,.2,1);
}
.su-progress-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
}

/* Body */
.su-body {
  flex: 1;
  padding: 32px 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.su-eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(17,17,17,0.38);
  margin: 0;
}
.su-heading {
  font-size: clamp(28px, 9vw, 40px);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.04em;
  color: #111;
  margin: 0;
}
.su-sub {
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin: 0;
}

/* OTP boxes */
.su-otp-boxes { display: flex; gap: 10px; justify-content: center; }
.su-otp-box {
  width: 44px; height: 56px;
  background: #fff; border: 2px solid rgba(17,17,17,0.14);
  border-radius: 12px; font-family: 'Montserrat', sans-serif;
  font-size: 22px; font-weight: 900; color: #111;
  text-align: center; outline: none; transition: border-color 0.15s;
  caret-color: #2230a0;
}
.su-otp-box:focus { border-color: #2230a0; }
.su-otp-box.filled { border-color: #2230a0; background: #eef0fc; }
.su-otp-box.error { border-color: #b0392e; background: #fde8e8; animation: shake 0.3s ease; }
@keyframes shake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-4px); } 75% { transform:translateX(4px); } }
.su-otp-error { font-size: 12px; font-weight: 700; color: #b0392e; text-align: center; margin: -8px 0 0; }
.su-resend-row { display: flex; align-items: center; justify-content: center; gap: 6px; }
.su-resend-hint { font-size: 12px; font-weight: 500; color: rgba(17,17,17,0.45); }
.su-resend-btn { background: none; border: none; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 800; color: #2230a0; cursor: pointer; padding: 2px; }
.su-resend-btn:disabled { color: rgba(17,17,17,0.35); cursor: default; }
.su-btn-demo { background: none; border: none; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700; color: rgba(17,17,17,0.35); cursor: pointer; text-align: center; padding: 4px; margin-top: -8px; }
.su-btn-demo:hover { color: #2230a0; }

/* Role cards */
.su-roles { display: flex; flex-direction: column; gap: 10px; }
.su-role-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 2px solid rgba(17,17,17,0.12);
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.su-role-card.active { border-color: #2230a0; background: #eef0fc; }
.su-role-card:hover:not(.active) { border-color: rgba(17,17,17,0.28); }
.su-role-icon {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: #f0f0ee;
  border-radius: 10px;
  color: #2230a0;
  flex-shrink: 0;
}
.su-role-card.active .su-role-icon { background: #d4d8f8; }
.su-role-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.su-role-name { font-size: 14px; font-weight: 800; color: #111; }
.su-role-desc { font-size: 12px; font-weight: 500; color: #666; }
.su-role-check { flex-shrink: 0; }
.su-role-check-empty {
  width: 20px; height: 20px;
  border: 2px solid rgba(17,17,17,0.2);
  border-radius: 50%;
}

/* Form */
.su-form { display: flex; flex-direction: column; gap: 14px; }
.su-fields-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.su-field { display: flex; flex-direction: column; gap: 6px; }
.su-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(17,17,17,0.5);
}
.su-input {
  background: #fff;
  border: 1.5px solid rgba(17,17,17,0.16);
  border-radius: 10px;
  padding: 12px 14px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #111;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
  width: 100%;
}
.su-input:focus { border-color: #2230a0; }
.su-input::placeholder { color: rgba(17,17,17,0.28); }
.su-input-error { border-color: #b0392e !important; }

.su-field-error {
  font-size: 11px;
  font-weight: 600;
  color: #b0392e;
}

/* Password */
.su-pw-wrap { position: relative; }
.su-pw-toggle {
  position: absolute; right: 12px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: rgba(17,17,17,0.38); padding: 4px;
  display: flex; align-items: center;
}
.su-pw-toggle:hover { color: #111; }

/* Strength */
.su-strength-row {
  display: flex; align-items: center; gap: 10px; margin-top: 6px;
}
.su-strength-bar {
  flex: 1; height: 4px;
  background: rgba(17,17,17,0.1);
  border-radius: 99px; overflow: hidden;
}
.su-strength-fill { height: 100%; border-radius: 99px; transition: width 0.3s, background 0.3s; }
.su-strength-label { font-size: 10px; font-weight: 800; letter-spacing: 0.06em; min-width: 44px; }

/* Terms card */
.su-terms-card {
  background: #fff;
  border: 1.5px solid rgba(17,17,17,0.1);
  border-radius: 14px;
  padding: 20px;
}
.su-terms-list { display: flex; flex-direction: column; gap: 14px; }
.su-terms-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
}
.su-terms-item svg { flex-shrink: 0; margin-top: 1px; }

/* Checkbox */
.su-check-row { }
.su-check-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  line-height: 1.5;
  cursor: pointer;
}
.su-check-label a, .su-check-label-link { color: #2230a0; font-weight: 700; text-decoration: none; }
.su-check-label-link:hover { text-decoration: underline; }
.su-check-input { display: none; }
.su-checkmark {
  width: 20px; height: 20px;
  border: 2px solid rgba(17,17,17,0.2);
  border-radius: 5px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: #fff;
  transition: all 0.15s;
  margin-top: 1px;
}
.su-check-input:checked ~ .su-checkmark {
  background: #2230a0;
  border-color: #2230a0;
}

/* Buttons */
.su-btn-primary {
  background: #111;
  color: #e8dfa0;
  border: none;
  border-radius: 10px;
  padding: 15px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 50px;
  transition: background 0.15s, opacity 0.15s;
  margin-top: auto;
}
.su-btn-primary:hover:not(:disabled) { background: #2230a0; }
.su-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.su-spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(232,223,160,0.3);
  border-top-color: #e8dfa0;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Divider */
.su-divider {
  display: flex; align-items: center; gap: 12px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(17,17,17,0.35);
}
.su-divider::before, .su-divider::after {
  content: ''; flex: 1;
  border-top: 1.5px dashed rgba(17,17,17,0.18);
}

/* SSO */
.su-sso-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(17,17,17,0.18);
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
.su-sso-row { display: flex; gap: 12px; }
.su-sso-btn {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: #fff;
  border: 1.5px solid rgba(17,17,17,0.18);
  border-radius: 10px;
  padding: 12px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px; font-weight: 700;
  color: #111; cursor: pointer;
  transition: border-color 0.15s;
}
.su-sso-btn:hover { border-color: rgba(17,17,17,0.38); }

/* Sign-in link */
.su-signin-link {
  font-size: 13px; font-weight: 500;
  color: rgba(17,17,17,0.5); text-align: center;
}
.su-signin-link a { font-weight: 800; color: #2230a0; text-decoration: none; }
.su-signin-link a:hover { text-decoration: underline; }

/* Responsive */
@media (max-width: 400px) {
  .su-fields-2col { grid-template-columns: 1fr; }
}
@media (min-width: 600px) {
  .su { align-items: center; }
  .su-header { width: 100%; }
  .su-body { width: 100%; max-width: 460px; padding: 40px 0 60px; }
}
</style>
