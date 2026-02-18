<template>
  <div class="wrapper">
    <div class="bg-orb orb1" />
    <div class="bg-orb orb2" />

    <div class="card">
      <div class="brand">◆</div>

      <transition name="slide" mode="out-in">
        <div v-if="step === 1" key="step1">
          <p class="eyebrow">Welcome</p>
          <h1 class="title">Let's Get to<br />Know You</h1>

          <div class="fields">
            <div class="row">
              <div class="field">
                <input v-model="form.firstName" type="text" placeholder="First Name" class="input" />
                <span class="underline" />
              </div>
              <div class="field">
                <input v-model="form.lastName" type="text" placeholder="Last Name" class="input" />
                <span class="underline" />
              </div>
            </div>

            <div class="field">
              <div class="phone-row">
                <span class="flag">🇺🇸</span>
                <input v-model="form.phone" type="tel" placeholder="Phone Number" class="input" />
              </div>
              <span class="underline" />
              <p class="hint">We'll send a verification code to secure your account</p>
            </div>
          </div>

          <button class="btn" @click="goToStep2">
            Continue
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div v-else key="step2">
          <p class="eyebrow">Verification</p>
          <h1 class="title">Verify Code</h1>
          <p class="subtitle">
            Enter the code sent to<br />
            <strong>+{{ form.phone || '1 234 567 8900' }}</strong>
          </p>

          <div class="otp-row">
            <input
              v-for="(_, i) in code"
              :key="i"
              :ref="el => { otpRefs[i] = el }"
              v-model="code[i]"
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="otp-box"
              @input="onInput(i, $event)"
              @keydown="onKeydown(i, $event)"
              @paste="onPaste($event)"
            />
          </div>

          <p class="wrong-number">
            <a href="#" @click.prevent="goBack">Entered the wrong number?</a>
          </p>

          <p class="resend">
            <span v-if="timer > 0">Didn't receive the code? Resend in <strong>{{ formatted }}</strong></span>
            <span v-else>Didn't receive the code? <a href="#" @click.prevent="resend" class="resend-link">Resend now</a></span>
          </p>

          <button class="btn" @click="verify" :disabled="!codeComplete">
            Verify
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button class="btn-ghost" @click="goBack">← Back</button>
        </div>
      </transition>
    </div>

    <div class="dots">
      <span class="dot" :class="{ active: step === 1 }" />
      <span class="dot" :class="{ active: step === 2 }" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onBeforeUnmount } from 'vue'

const step = ref(1)
const form = reactive({ firstName: '', lastName: '', phone: '' })
const code = reactive(['', '', '', '', '', ''])
const otpRefs = ref([])
const timer = ref(59)
let interval = null

const formatted = computed(() => {
  const m = String(Math.floor(timer.value / 60)).padStart(2, '0')
  const s = String(timer.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

const codeComplete = computed(() => code.every(d => d !== ''))

function startTimer() {
  clearInterval(interval)
  timer.value = 59
  interval = setInterval(() => {
    if (timer.value > 0) timer.value--
    else clearInterval(interval)
  }, 1000)
}

function goToStep2() {
  if (!form.firstName || !form.lastName || !form.phone) {
    alert('Please fill in all fields.')
    return
  }
  step.value = 2
  startTimer()
  nextTick(() => otpRefs.value[0]?.focus())
}

function goBack() {
  step.value = 1
  clearInterval(interval)
  timer.value = 59
  code.fill('')
}

function resend() {
  console.log('Resending to', form.phone)
  startTimer()
  code.fill('')
}

function onInput(i, e) {
  const val = e.target.value.replace(/\D/g, '').slice(-1)
  code[i] = val
  if (val && i < 5) nextTick(() => otpRefs.value[i + 1]?.focus())
}

function onKeydown(i, e) {
  if (e.key === 'Backspace' && !code[i] && i > 0) {
    nextTick(() => otpRefs.value[i - 1]?.focus())
  }
}

function onPaste(e) {
  e.preventDefault()
  const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6)
  paste.split('').forEach((char, i) => { code[i] = char })
  nextTick(() => otpRefs.value[Math.min(paste.length, 5)]?.focus())
}

function verify() {
  if (!codeComplete.value) return
  const entered = code.join('')
  console.log('Code:', entered)
  alert(`Code "${entered}" verified! Welcome, ${form.firstName}.`)
}

onBeforeUnmount(() => clearInterval(interval))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

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
.brand { text-align: center; color: #c8a96e; font-size: 18px; margin-bottom: 32px; }
.eyebrow { font-size: 11px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: #c8a96e; margin: 0 0 10px; }
.title { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 300; color: #1a1714; line-height: 1.15; margin: 0 0 8px; }
.subtitle { font-size: 14px; color: #9a9087; margin: 12px 0 0; line-height: 1.6; }
.subtitle strong { color: #1a1714; font-weight: 500; }

.fields { display: flex; flex-direction: column; gap: 28px; margin: 36px 0; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.field { position: relative; }
.phone-row { display: flex; align-items: center; gap: 10px; }
.flag { font-size: 18px; flex-shrink: 0; }

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
.underline::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 1px; background: #c8a96e; transition: width 0.35s ease; }
.field:focus-within .underline::after { width: 100%; }
.hint { font-size: 11.5px; color: #9a9087; margin: 10px 0 0; line-height: 1.55; }

.otp-row { display: flex; justify-content: center; gap: 10px; margin: 32px 0 24px; }
.otp-box {
  width: 46px; height: 56px;
  border: 1.5px solid #e8e2da;
  border-radius: 12px;
  background: #fdfcfb;
  text-align: center;
  font-family: 'Cormorant Garamond', serif;
  font-size: 26px;
  color: #1a1714;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  caret-color: transparent;
}
.otp-box:focus { border-color: #c8a96e; box-shadow: 0 0 0 3px rgba(200,169,110,0.15); transform: translateY(-2px); background: #fff; }

.wrong-number { text-align: center; font-size: 13px; margin: 0 0 12px; }
.wrong-number a { color: #9a9087; text-decoration: underline; text-underline-offset: 3px; }
.wrong-number a:hover { color: #1a1714; }
.resend { text-align: center; font-size: 13px; color: #9a9087; margin: 0 0 28px; }
.resend strong { color: #1a1714; font-weight: 500; font-variant-numeric: tabular-nums; }
.resend-link { color: #c8a96e; font-weight: 500; text-decoration: none; }

.btn {
  width: 100%; background: #1a1714; color: #fff; border: none; border-radius: 14px;
  padding: 17px 28px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  margin-bottom: 12px; transition: transform 0.2s, box-shadow 0.2s;
}
.btn svg { width: 16px; height: 16px; }
.btn:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(26,23,20,0.2); }
.btn:active { transform: translateY(0); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

.btn-ghost { width: 100%; background: transparent; border: none; color: #9a9087; font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; padding: 10px; transition: color 0.2s; }
.btn-ghost:hover { color: #1a1714; }

.dots { display: flex; gap: 6px; margin-top: 24px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: #e8e2da; transition: background 0.3s, transform 0.3s; }
.dot.active { background: #c8a96e; transform: scale(1.3); }

.slide-enter-active, .slide-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.slide-enter-from { opacity: 0; transform: translateX(20px); }
.slide-leave-to { opacity: 0; transform: translateX(-20px); }
</style>