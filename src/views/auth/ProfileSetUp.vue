<template>
  <div class="ps">
    <!-- Header -->
    <header class="ps-header">
      <button class="ps-back" @click="$router.back()" aria-label="Back">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="ps-header-center">
        <span class="ps-header-title">Profile Setup</span>
        <div class="ps-progress-bar"><div class="ps-progress-fill" style="width:60%"/></div>
      </div>
      <button class="ps-skip-btn" @click="$router.push('/auth/verify')">Skip</button>
    </header>

    <main class="ps-body">
      <p class="ps-eyebrow">Step 3 of 4</p>
      <h1 class="ps-heading">tell us<br>about you.</h1>

      <!-- Photo + city grid -->
      <div class="ps-top-grid">
        <!-- Avatar upload -->
        <div class="ps-avatar-wrap">
          <div class="ps-avatar" @click="triggerFileInput">
            <img v-if="avatarUrl" :src="avatarUrl" alt="Profile photo" class="ps-avatar-img"/>
            <div v-else class="ps-avatar-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="ps-avatar-overlay">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </div>
          <span class="ps-avatar-hint">Tap to add photo</span>
          <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="onFileChange"/>
        </div>

        <!-- City field -->
        <div class="ps-city-col">
          <div class="ps-field">
            <label class="ps-label">Home city</label>
            <input v-model="form.city" type="text" class="ps-input" placeholder="e.g. Tunis"/>
          </div>
          <div class="ps-field">
            <label class="ps-label">Country</label>
            <input v-model="form.country" type="text" class="ps-input" placeholder="e.g. Tunisia"/>
          </div>
        </div>
      </div>

      <!-- Bio -->
      <div class="ps-field">
        <label class="ps-label">Short bio</label>
        <textarea v-model="form.bio" class="ps-textarea" placeholder="Tell travelers & senders a bit about yourself..." rows="3" maxlength="180"/>
        <span class="ps-char-count">{{ form.bio.length }}/180</span>
      </div>

      <!-- Language + WhatsApp -->
      <div class="ps-fields-2col">
        <div class="ps-field">
          <label class="ps-label">Languages</label>
          <input v-model="form.languages" type="text" class="ps-input" placeholder="Arabic, French..."/>
        </div>
        <div class="ps-field">
          <label class="ps-label">WhatsApp</label>
          <input v-model="form.whatsapp" type="tel" class="ps-input" placeholder="+216..."/>
        </div>
      </div>

      <!-- Transport mode (traveler) -->
      <div class="ps-field">
        <label class="ps-label">How do you travel?</label>
        <div class="ps-transport-chips">
          <button
            v-for="mode in transportModes"
            :key="mode.id"
            class="ps-chip"
            :class="{ active: form.transports.includes(mode.id) }"
            @click="toggleTransport(mode.id)"
          >
            <component :is="mode.icon" />
            {{ mode.label }}
          </button>
        </div>
      </div>

      <!-- ID Verification nudge -->
      <div class="ps-verify-card">
        <div class="ps-verify-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div class="ps-verify-text">
          <span class="ps-verify-title">Verify your identity</span>
          <span class="ps-verify-sub">Verified users get 3× more bookings</span>
        </div>
        <router-link to="/auth/verify" class="ps-verify-btn">Verify →</router-link>
      </div>

      <button class="ps-btn-primary" @click="submit" :disabled="loading">
        <span v-if="!loading">Save & continue</span>
        <span v-else class="ps-spinner"/>
      </button>
    </main>
  </div>
</template>

<script setup>
import { ref, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const avatarUrl = ref(null)
const fileInputRef = ref(null)

const form = ref({
  city: '', country: '',
  bio: '', languages: '', whatsapp: '',
  transports: [],
})

// Transport mode icons
const Plane = defineComponent({ render: () => h('svg', { viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round', width:16, height:16 }, [
  h('path', { d:'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' })
]) })
const Car = defineComponent({ render: () => h('svg', { viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round', width:16, height:16 }, [
  h('path', { d:'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-3' }),
  h('circle', { cx:'7', cy:'17', r:'2' }),
  h('circle', { cx:'17', cy:'17', r:'2' }),
]) })
const Train = defineComponent({ render: () => h('svg', { viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round', width:16, height:16 }, [
  h('rect', { x:'4', y:'3', width:'16', height:'14', rx:'2' }),
  h('path', { d:'M4 11h16' }),
  h('path', { d:'M12 3v8' }),
  h('circle', { cx:'8', cy:'20', r:'1' }),
  h('circle', { cx:'16', cy:'20', r:'1' }),
  h('path', { d:'M7.5 17l-1.5 3M16.5 17l1.5 3' }),
]) })
const Ship = defineComponent({ render: () => h('svg', { viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round', width:16, height:16 }, [
  h('path', { d:'M2 20a4 4 0 008 0M14 20a4 4 0 008 0' }),
  h('path', { d:'M12 3v14' }),
  h('path', { d:'M5 10l7-7 7 7' }),
]) })

const transportModes = [
  { id: 'plane', label: 'Plane', icon: Plane },
  { id: 'car',   label: 'Car',   icon: Car   },
  { id: 'train', label: 'Train', icon: Train },
  { id: 'boat',  label: 'Boat',  icon: Ship  },
]

function toggleTransport(id) {
  const i = form.value.transports.indexOf(id)
  if (i === -1) form.value.transports.push(id)
  else form.value.transports.splice(i, 1)
}

function triggerFileInput() { fileInputRef.value?.click() }
function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => { avatarUrl.value = ev.target.result }
  reader.readAsDataURL(file)
}

async function submit() {
  loading.value = true
  await new Promise(r => setTimeout(r, 900))
  loading.value = false
  router.push('/auth/verify')
}
</script>

<style scoped>
.ps {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Montserrat', sans-serif;
  background: #f0f0ee;
}

/* Header */
.ps-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; height: 58px;
  background: #111; color: #fff;
  flex-shrink: 0;
}
.ps-back {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.08); border: none; border-radius: 50%;
  color: #fff; cursor: pointer; transition: background 0.15s;
}
.ps-back:hover { background: rgba(255,255,255,0.16); }
.ps-header-center { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.ps-header-title { font-weight: 800; font-size: 15px; letter-spacing: -0.01em; }
.ps-progress-bar { height: 3px; background: rgba(255,255,255,0.15); border-radius: 99px; overflow: hidden; }
.ps-progress-fill { height: 100%; background: #e8dfa0; border-radius: 99px; }
.ps-skip-btn {
  background: none; border: none; color: rgba(255,255,255,0.5);
  font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
  padding: 6px 10px; border-radius: 99px; transition: color 0.15s;
}
.ps-skip-btn:hover { color: #fff; }

/* Body */
.ps-body {
  flex: 1; padding: 28px 24px 40px;
  display: flex; flex-direction: column; gap: 18px;
}

.ps-eyebrow {
  font-size: 10px; font-weight: 800; letter-spacing: 0.14em;
  text-transform: uppercase; color: rgba(17,17,17,0.38); margin: 0;
}
.ps-heading {
  font-size: clamp(26px, 8vw, 36px); font-weight: 900;
  line-height: 1.1; letter-spacing: -0.04em; color: #111; margin: 0;
}

/* Top grid: avatar + city */
.ps-top-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: start;
}
.ps-avatar-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.ps-avatar {
  width: 88px; height: 88px;
  border-radius: 50%;
  background: #e8dfa0;
  border: 2.5px solid rgba(17,17,17,0.16);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.15s;
}
.ps-avatar:hover { border-color: #2230a0; }
.ps-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.ps-avatar-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  color: rgba(17,17,17,0.35);
}
.ps-avatar-overlay {
  position: absolute; inset: 0;
  background: rgba(17,17,17,0.45);
  display: flex; align-items: center; justify-content: center;
  color: #fff; opacity: 0; transition: opacity 0.2s;
}
.ps-avatar:hover .ps-avatar-overlay { opacity: 1; }
.ps-avatar-hint { font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.45); text-align: center; }

.ps-city-col { display: flex; flex-direction: column; gap: 10px; }

/* Fields */
.ps-fields-2col {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}
.ps-field { display: flex; flex-direction: column; gap: 6px; position: relative; }
.ps-label {
  font-size: 10px; font-weight: 800; letter-spacing: 0.12em;
  text-transform: uppercase; color: rgba(17,17,17,0.45);
}
.ps-input {
  background: #fff; border: 1.5px solid rgba(17,17,17,0.16);
  border-radius: 10px; padding: 12px 14px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 500;
  color: #111; outline: none; transition: border-color 0.15s;
  box-sizing: border-box; width: 100%;
}
.ps-input:focus { border-color: #2230a0; }
.ps-input::placeholder { color: rgba(17,17,17,0.28); }
.ps-textarea {
  background: #fff; border: 1.5px solid rgba(17,17,17,0.16);
  border-radius: 10px; padding: 12px 14px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 500;
  color: #111; outline: none; resize: none; transition: border-color 0.15s;
  box-sizing: border-box; width: 100%;
}
.ps-textarea:focus { border-color: #2230a0; }
.ps-textarea::placeholder { color: rgba(17,17,17,0.28); }
.ps-char-count {
  position: absolute; bottom: 10px; right: 12px;
  font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.3);
}

/* Transport chips */
.ps-transport-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.ps-chip {
  display: flex; align-items: center; gap: 6px;
  background: #fff; border: 1.5px solid rgba(17,17,17,0.16);
  border-radius: 99px; padding: 7px 14px;
  font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 600;
  color: #111; cursor: pointer; transition: all 0.15s;
}
.ps-chip.active { background: #2230a0; border-color: #2230a0; color: #e8dfa0; }
.ps-chip:hover:not(.active) { border-color: rgba(17,17,17,0.35); }

/* Verify nudge */
.ps-verify-card {
  display: flex; align-items: center; gap: 12px;
  background: #eef0fc; border: 1.5px solid #c0c8f0;
  border-radius: 12px; padding: 14px 16px;
}
.ps-verify-icon {
  width: 40px; height: 40px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: #d4d8f8; border-radius: 10px;
}
.ps-verify-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ps-verify-title { font-size: 13px; font-weight: 800; color: #111; }
.ps-verify-sub { font-size: 11px; font-weight: 500; color: #555; }
.ps-verify-btn {
  font-size: 12px; font-weight: 800; color: #2230a0;
  text-decoration: none; white-space: nowrap;
  padding: 6px 12px; background: #fff;
  border: 1.5px solid #2230a0; border-radius: 99px;
  transition: background 0.15s;
}
.ps-verify-btn:hover { background: #2230a0; color: #e8dfa0; }

/* Primary button */
.ps-btn-primary {
  background: #111; color: #e8dfa0; border: none;
  border-radius: 10px; padding: 15px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800;
  cursor: pointer; min-height: 50px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, opacity 0.15s;
}
.ps-btn-primary:hover:not(:disabled) { background: #2230a0; }
.ps-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.ps-spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(232,223,160,0.3);
  border-top-color: #e8dfa0; border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Responsive */
@media (max-width: 400px) {
  .ps-fields-2col { grid-template-columns: 1fr; }
}
@media (min-width: 600px) {
  .ps { align-items: center; }
  .ps-header { width: 100%; }
  .ps-body { width: 100%; max-width: 480px; padding: 36px 0 60px; }
}
</style>
