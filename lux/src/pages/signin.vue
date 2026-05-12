<template>
  <div class="wrapper">
    <div class="bg-orb orb1" />
    <div class="bg-orb orb2" />

    <div class="card">
      <div class="brand">◆</div>

      <p class="eyebrow">Welcome Back</p>
      <h1 class="title">Sign In to<br />Carryit</h1>

      <!-- SSO buttons -->
      <div class="sso-group">
        <button class="sso-btn sso-google" @click="handleSSO('google')" :disabled="loading !== null">
          <span class="sso-spinner" v-if="loading === 'google'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin-icon">
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
          </span>
          <svg v-else viewBox="0 0 24 24" class="sso-logo" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <button class="sso-btn sso-apple" @click="handleSSO('apple')" :disabled="loading !== null">
          <span class="sso-spinner sso-spinner-light" v-if="loading === 'apple'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin-icon">
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
          </span>
          <svg v-else viewBox="0 0 24 24" class="sso-logo" fill="currentColor" aria-hidden="true">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.32 2.99-2.53 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          <span>Continue with Apple</span>
        </button>
      </div>

      <!-- Divider -->
      <div class="divider">
        <span class="divider-line" />
        <span class="divider-text">or</span>
        <span class="divider-line" />
      </div>

      <!-- Email form -->
      <div class="fields">
        <div class="field">
          <input v-model="email" type="email" placeholder="Email Address" class="input" @keydown.enter="handleEmail" />
          <span class="underline" />
        </div>
      </div>

      <button class="btn" @click="handleEmail" :disabled="!email.trim()">
        Continue with Email
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>

      <p class="footer-link">
        New to Carryit? <a href="/signup">Create an account</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const loading = ref(null)

function handleSSO(provider) {
  loading.value = provider
  // Demo: simulate async auth
  setTimeout(() => {
    loading.value = null
    alert(`Demo: ${provider === 'google' ? 'Google' : 'Apple'} sign-in flow would start here.`)
  }, 1400)
}

function handleEmail() {
  if (!email.value.trim()) return
  alert(`Demo: continuing with ${email.value}`)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

/* ── Layout ─────────────────────────────────── */
.wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9f6f1;
  font-family: 'DM Sans', sans-serif;
  position: relative;
  overflow: hidden;
  padding: 24px 16px;
  box-sizing: border-box;
}
.bg-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; pointer-events: none; }
.orb1 { width: 380px; height: 380px; background: radial-gradient(circle, #e8d5b0, transparent 70%); top: -100px; right: -80px; }
.orb2 { width: 280px; height: 280px; background: radial-gradient(circle, #d4c5a9, transparent 70%); bottom: -60px; left: -60px; }

/* ── Card ────────────────────────────────────── */
.card {
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 32px 80px rgba(26,23,20,0.12), 0 8px 24px rgba(26,23,20,0.06);
  border: 1px solid rgba(200,169,110,0.12);
  padding: 48px 36px 44px;
  width: 100%;
  max-width: 390px;
  box-sizing: border-box;
}

/* ── Brand / type ────────────────────────────── */
.brand   { text-align: center; color: #c8a96e; font-size: 18px; margin-bottom: 32px; }
.eyebrow { font-size: 11px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: #c8a96e; margin: 0 0 10px; }
.title   { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 300; color: #1a1714; line-height: 1.15; margin: 0 0 36px; }

/* ── SSO buttons ─────────────────────────────── */
.sso-group { display: flex; flex-direction: column; gap: 12px; }

.sso-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 15px 20px;
  border-radius: 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  border: none;
  position: relative;
}
.sso-btn:hover:not(:disabled) { transform: translateY(-1px); }
.sso-btn:active:not(:disabled) { transform: translateY(0); }
.sso-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.sso-google {
  background: #fff;
  color: #1a1714;
  border: 1.5px solid #e8e2da;
  box-shadow: 0 2px 8px rgba(26,23,20,0.06);
}
.sso-google:hover:not(:disabled) {
  box-shadow: 0 8px 24px rgba(26,23,20,0.1);
  border-color: #d0c9c0;
}

.sso-apple {
  background: #1a1714;
  color: #fff;
  box-shadow: 0 4px 16px rgba(26,23,20,0.22);
}
.sso-apple:hover:not(:disabled) {
  box-shadow: 0 10px 28px rgba(26,23,20,0.32);
}

.sso-logo { width: 20px; height: 20px; flex-shrink: 0; }

/* Spinner */
.sso-spinner { display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex-shrink: 0; }
.sso-spinner-light .spin-icon { stroke: #fff; }
.spin-icon { width: 18px; height: 18px; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Divider ─────────────────────────────────── */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 28px 0;
}
.divider-line { flex: 1; height: 1px; background: #e8e2da; }
.divider-text { font-size: 12px; color: #c2bbb3; font-weight: 400; letter-spacing: 0.05em; flex-shrink: 0; }

/* ── Fields ─────────────────────────────────── */
.fields { display: flex; flex-direction: column; gap: 0; margin-bottom: 24px; }
.field  { position: relative; }

.input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  color: #1a1714;
  padding: 8px 0 10px;
  box-sizing: border-box;
  caret-color: #c8a96e;
}
.input::placeholder { color: #c2bbb3; font-weight: 300; }

.underline { display: block; height: 1px; background: #e8e2da; position: relative; }
.underline::after {
  content: '';
  position: absolute; bottom: 0; left: 0;
  width: 0; height: 1px;
  background: #c8a96e;
  transition: width 0.35s ease;
}
.field:focus-within .underline::after { width: 100%; }

/* ── Primary button ──────────────────────────── */
.btn {
  width: 100%; background: #1a1714; color: #fff; border: none; border-radius: 14px;
  padding: 17px 28px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn svg { width: 16px; height: 16px; }
.btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(26,23,20,0.2); }
.btn:active:not(:disabled) { transform: translateY(0); }
.btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── Footer ──────────────────────────────────── */
.footer-link {
  text-align: center;
  font-size: 13px;
  color: #9a9087;
  margin: 20px 0 0;
}
.footer-link a {
  color: #c8a96e;
  font-weight: 500;
  text-decoration: none;
}
.footer-link a:hover { text-decoration: underline; text-underline-offset: 3px; }
</style>
