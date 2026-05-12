<template>
  <div class="si">
    <!-- Header -->
    <header class="si-header">
      <button class="si-back" @click="$router.back()" aria-label="Back">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <router-link to="/" class="si-header-logo">CarryIt</router-link>
      <div style="width:36px"/>
    </header>

    <!-- Body (gold bg) -->
    <main class="si-body">
      <div class="si-eyebrow">Sign in</div>
      <h1 class="si-heading">welcome<br>back.</h1>
      <p class="si-sub">Good to see you again.</p>

      <form class="si-form" @submit.prevent="submit">
        <div class="si-field">
          <label class="si-label" for="si-email">Email</label>
          <input id="si-email" v-model="email" type="email" class="si-input" placeholder="you@example.com" autocomplete="email" required/>
        </div>
        <div class="si-field">
          <label class="si-label" for="si-password">Password</label>
          <div class="si-pw-wrap">
            <input id="si-password" v-model="password" :type="showPw ? 'text' : 'password'" class="si-input" placeholder="••••••••" autocomplete="current-password" required/>
            <button type="button" class="si-pw-toggle" @click="showPw = !showPw" :aria-label="showPw ? 'Hide password' : 'Show password'">
              <svg v-if="!showPw" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Role selector -->
        <div class="si-field">
          <label class="si-label">I am a</label>
          <div class="si-role-row">
            <button
              v-for="r in roles" :key="r.value" type="button"
              class="si-role-btn" :class="{ active: role === r.value }"
              @click="role = r.value"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="r.icon" />
              {{ r.label }}
            </button>
          </div>
        </div>

        <!-- Stay signed in toggle -->
        <div class="si-stay-row">
          <label class="si-toggle-label">
            <input type="checkbox" v-model="staySignedIn" class="si-toggle-input"/>
            <span class="si-toggle-track"><span class="si-toggle-thumb"/></span>
            Stay signed in
          </label>
          <button type="button" class="si-forgot" @click="forgotMsg = true">Forgot password?</button>
        </div>

        <button type="submit" class="si-btn-primary" :disabled="loading">
          <span v-if="!loading">Sign in</span>
          <span v-else class="si-spinner"/>
        </button>

        <div class="si-divider"><span>or continue with</span></div>

        <div class="si-sso-row">
          <button type="button" class="si-sso-btn" @click="handleSSO('google')" :disabled="!!ssoLoading">
            <span v-if="ssoLoading === 'google'" class="si-sso-spinner"/>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button type="button" class="si-sso-btn" @click="handleSSO('apple')" :disabled="!!ssoLoading">
            <span v-if="ssoLoading === 'apple'" class="si-sso-spinner"/>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>
      </form>

      <p class="si-signup-link">
        Don't have an account?
        <router-link to="/auth/signup">Sign up</router-link>
      </p>
      <p class="si-signup-link">
        <router-link to="/">← Back to homepage</router-link>
      </p>
    </main>

    <transition name="si-toast">
      <div v-if="forgotMsg" class="si-toast">
        Password reset coming soon — contact hi@carryit.tn
        <button @click="forgotMsg = false" class="si-toast-close">✕</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router      = useRouter()
const email       = ref('')
const password    = ref('')
const showPw      = ref(false)
const staySignedIn = ref(false)
const loading     = ref(false)
const forgotMsg   = ref(false)
const role        = ref('sender')
const ssoLoading  = ref('')

const roles = [
  {
    value: 'sender',
    label: 'Sender',
    icon: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  },
  {
    value: 'traveler',
    label: 'Traveler',
    icon: '<path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  },
  {
    value: 'both',
    label: 'Both',
    icon: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
  },
]

const ROLE_ROUTES = {
  sender:   '/sender/search',
  traveler: '/traveler/trips',
  both:     '/sender/search',
}

async function submit() {
  loading.value = true
  await new Promise(r => setTimeout(r, 900))
  loading.value = false
  router.push(ROLE_ROUTES[role.value])
}

async function handleSSO(provider) {
  ssoLoading.value = provider
  await new Promise(r => setTimeout(r, 1100))
  ssoLoading.value = ''
  router.push(ROLE_ROUTES[role.value])
}
</script>

<style scoped>
.si {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Montserrat', sans-serif;
  background: #e8dfa0;
}

/* Header */
.si-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 58px;
  background: #111;
  color: #fff;
  flex-shrink: 0;
}
.si-back {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.08);
  border: none; border-radius: 50%;
  color: #fff; cursor: pointer;
  transition: background 0.15s;
}
.si-back:hover { background: rgba(255,255,255,0.16); }
.si-header-logo {
  font-weight: 900;
  font-size: 18px;
  letter-spacing: -0.02em;
  color: #e8dfa0;
  text-decoration: none;
}
.si-sso-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(17,17,17,0.18);
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

/* Body */
.si-body {
  flex: 1;
  padding: 36px 28px 40px;
  display: flex;
  flex-direction: column;
}

.si-eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(17,17,17,0.45);
  margin-bottom: 10px;
}
.si-heading {
  font-size: clamp(32px, 10vw, 44px);
  font-weight: 900;
  line-height: 1.06;
  letter-spacing: -0.04em;
  color: #111;
  margin: 0 0 8px;
}
.si-sub {
  font-size: 14px;
  font-weight: 500;
  color: rgba(17,17,17,0.55);
  margin: 0 0 32px;
}

/* Form */
.si-form { display: flex; flex-direction: column; gap: 18px; }
.si-field { display: flex; flex-direction: column; gap: 6px; }
.si-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(17,17,17,0.55);
}
.si-input {
  background: rgba(255,255,255,0.75);
  border: 1.5px solid rgba(17,17,17,0.18);
  border-radius: 10px;
  padding: 13px 16px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #111;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}
.si-input:focus { border-color: #2230a0; background: #fff; }
.si-input::placeholder { color: rgba(17,17,17,0.3); }

/* Password wrapper */
.si-pw-wrap { position: relative; }
.si-pw-wrap .si-input { padding-right: 48px; width: 100%; box-sizing: border-box; }
.si-pw-toggle {
  position: absolute; right: 14px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: rgba(17,17,17,0.45); padding: 4px;
  display: flex; align-items: center;
  transition: color 0.15s;
}
.si-pw-toggle:hover { color: #111; }

/* Stay signed in toggle */
.si-stay-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.si-toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #111;
  cursor: pointer;
  user-select: none;
}
.si-toggle-input { display: none; }
.si-toggle-track {
  width: 40px; height: 22px;
  background: rgba(17,17,17,0.18);
  border-radius: 99px;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.si-toggle-input:checked ~ .si-toggle-track { background: #2230a0; }
.si-toggle-thumb {
  position: absolute;
  top: 3px; left: 3px;
  width: 16px; height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: left 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.18);
}
.si-toggle-input:checked ~ .si-toggle-track .si-toggle-thumb { left: 21px; }
.si-forgot {
  font-size: 12px;
  font-weight: 700;
  color: #2230a0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: 'Montserrat', sans-serif;
}
.si-forgot:hover { text-decoration: underline; }

/* Toast */
.si-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #111;
  color: #e8dfa0;
  padding: 14px 20px;
  border-radius: 10px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
  z-index: 500;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
}
.si-toast-close {
  background: none;
  border: none;
  color: rgba(232,223,160,0.6);
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}
.si-toast-close:hover { color: #e8dfa0; }
.si-toast-enter-active, .si-toast-leave-active { transition: opacity 0.25s, transform 0.25s; }
.si-toast-enter-from, .si-toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }

/* Primary button */
.si-btn-primary {
  background: #111;
  color: #e8dfa0;
  border: none;
  border-radius: 10px;
  padding: 15px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
}
.si-btn-primary:hover:not(:disabled) { background: #2230a0; }
.si-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
.si-spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(232,223,160,0.3);
  border-top-color: #e8dfa0;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Divider */
.si-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(17,17,17,0.35);
}
.si-divider::before, .si-divider::after {
  content: '';
  flex: 1;
  border-top: 1.5px dashed rgba(17,17,17,0.2);
}

/* SSO */
.si-sso-row { display: flex; gap: 12px; }
.si-sso-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(255,255,255,0.7);
  border: 1.5px solid rgba(17,17,17,0.18);
  border-radius: 10px;
  padding: 12px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #111;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.si-sso-btn:hover { background: #fff; border-color: rgba(17,17,17,0.35); }

/* Sign up link */
.si-signup-link {
  margin-top: 28px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(17,17,17,0.55);
  text-align: center;
}
.si-signup-link a {
  font-weight: 800;
  color: #2230a0;
  text-decoration: none;
}
.si-signup-link a:hover { text-decoration: underline; }

/* Role selector */
.si-role-row {
  display: flex;
  gap: 8px;
}
.si-role-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255,255,255,0.55);
  border: 1.5px solid rgba(17,17,17,0.18);
  border-radius: 10px;
  padding: 11px 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: rgba(17,17,17,0.55);
  cursor: pointer;
  transition: all 0.15s;
}
.si-role-btn:hover { background: rgba(255,255,255,0.8); border-color: rgba(17,17,17,0.35); color: #111; }
.si-role-btn.active { background: #111; color: #e8dfa0; border-color: #111; }

/* Responsive */
@media (min-width: 600px) {
  .si { align-items: center; }
  .si-header { width: 100%; }
  .si-body {
    width: 100%;
    max-width: 440px;
    padding: 48px 0 60px;
  }
}
</style>
