<template>
  <div class="kyc">
    <!-- Header -->
    <header class="kyc-header">
      <button class="kyc-back" @click="$router.back()" aria-label="Back">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="kyc-header-center">
        <span class="kyc-header-title">ID Verification</span>
        <div class="kyc-progress-bar"><div class="kyc-progress-fill" style="width:90%"/></div>
      </div>
      <div style="width:36px"/>
    </header>

    <main class="kyc-body">
      <p class="kyc-eyebrow">Step 4 of 4</p>
      <h1 class="kyc-heading">verify your<br>identity.</h1>
      <p class="kyc-sub">Upload a government-issued ID and a quick selfie to build trust on the platform.</p>

      <!-- Status badge -->
      <div class="kyc-status-wrap">
        <div class="kyc-status-badge" :class="statusClass">
          <span class="kyc-status-dot"/>
          {{ statusLabel }}
        </div>
      </div>

      <!-- ID Front + Back grid -->
      <div class="kyc-upload-grid">
        <div class="kyc-upload-zone"
          :class="{ 'has-file': idFront }"
          @click="triggerUpload('front')"
          @dragover.prevent
          @drop.prevent="e => onDrop(e, 'front')"
        >
          <img v-if="idFront" :src="idFront" alt="ID Front" class="kyc-preview-img"/>
          <template v-else>
            <div class="kyc-zone-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <span class="kyc-zone-title">ID Front</span>
            <span class="kyc-zone-hint">Tap or drag to upload</span>
          </template>
          <div v-if="idFront" class="kyc-zone-replace">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
          </div>
        </div>

        <div class="kyc-upload-zone"
          :class="{ 'has-file': idBack }"
          @click="triggerUpload('back')"
          @dragover.prevent
          @drop.prevent="e => onDrop(e, 'back')"
        >
          <img v-if="idBack" :src="idBack" alt="ID Back" class="kyc-preview-img"/>
          <template v-else>
            <div class="kyc-zone-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="6" y1="10" x2="10" y2="10"/><line x1="6" y1="13" x2="14" y2="13"/>
              </svg>
            </div>
            <span class="kyc-zone-title">ID Back</span>
            <span class="kyc-zone-hint">Tap or drag to upload</span>
          </template>
          <div v-if="idBack" class="kyc-zone-replace">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
          </div>
        </div>
      </div>

      <input ref="frontInput" type="file" accept="image/*" style="display:none" @change="e => onFileChange(e, 'front')"/>
      <input ref="backInput" type="file" accept="image/*" style="display:none" @change="e => onFileChange(e, 'back')"/>
      <input ref="selfieInput" type="file" accept="image/*" style="display:none" @change="e => onFileChange(e, 'selfie')"/>

      <!-- Selfie section -->
      <div class="kyc-selfie-section">
        <div class="kyc-selfie-label-row">
          <span class="kyc-section-title">Selfie with ID</span>
          <span class="kyc-section-sub">Hold your ID next to your face</span>
        </div>
        <div class="kyc-selfie-frame"
          :class="{ 'has-file': selfieUrl }"
          @click="triggerUpload('selfie')"
        >
          <img v-if="selfieUrl" :src="selfieUrl" alt="Selfie" class="kyc-selfie-img"/>
          <template v-else>
            <!-- Liveness guide frame -->
            <div class="kyc-liveness-corners">
              <div class="kyc-corner kyc-corner--tl"/>
              <div class="kyc-corner kyc-corner--tr"/>
              <div class="kyc-corner kyc-corner--bl"/>
              <div class="kyc-corner kyc-corner--br"/>
            </div>
            <div class="kyc-liveness-inner">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:rgba(255,255,255,0.7)">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span class="kyc-liveness-text">Tap to take / upload selfie</span>
            </div>
          </template>
          <div v-if="selfieUrl" class="kyc-zone-replace">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Info card -->
      <div class="kyc-info-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p class="kyc-info-text">Your documents are reviewed within 24 hours. We accept national ID, passport, or driver's license.</p>
      </div>

      <button class="kyc-btn-primary" @click="submit" :disabled="!idFront || !idBack || loading">
        <span v-if="!loading">Submit for verification</span>
        <span v-else class="kyc-spinner"/>
      </button>

      <button class="kyc-btn-later" @click="$router.push('/sender/search')">
        Do this later
      </button>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading    = ref(false)
const idFront    = ref(null)
const idBack     = ref(null)
const selfieUrl  = ref(null)
const verificationStatus = ref('idle') // idle | pending | approved | rejected

const frontInput  = ref(null)
const backInput   = ref(null)
const selfieInput = ref(null)

const statusLabel = computed(() => ({
  idle:     'Not submitted',
  pending:  'Under review',
  approved: 'Verified',
  rejected: 'Rejected',
}[verificationStatus.value]))

const statusClass = computed(() => ({
  idle:     'kyc-status-idle',
  pending:  'kyc-status-pending',
  approved: 'kyc-status-approved',
  rejected: 'kyc-status-rejected',
}[verificationStatus.value]))

function triggerUpload(which) {
  if (which === 'front')  frontInput.value?.click()
  if (which === 'back')   backInput.value?.click()
  if (which === 'selfie') selfieInput.value?.click()
}

function readFile(file, target) {
  const reader = new FileReader()
  reader.onload = ev => { target.value = ev.target.result }
  reader.readAsDataURL(file)
}

function onFileChange(e, which) {
  const file = e.target.files[0]
  if (!file) return
  if (which === 'front')  readFile(file, idFront)
  if (which === 'back')   readFile(file, idBack)
  if (which === 'selfie') readFile(file, selfieUrl)
}

function onDrop(e, which) {
  const file = e.dataTransfer.files[0]
  if (!file) return
  if (which === 'front') readFile(file, idFront)
  if (which === 'back')  readFile(file, idBack)
}

async function submit() {
  loading.value = true
  await new Promise(r => setTimeout(r, 1200))
  loading.value = false
  verificationStatus.value = 'pending'
  setTimeout(() => router.push('/sender/search'), 1500)
}
</script>

<style scoped>
.kyc {
  min-height: 100vh;
  display: flex; flex-direction: column;
  font-family: 'Montserrat', sans-serif;
  background: #f0f0ee;
}

/* Header */
.kyc-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; height: 58px;
  background: #111; color: #fff; flex-shrink: 0;
}
.kyc-back {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.08); border: none; border-radius: 50%;
  color: #fff; cursor: pointer; transition: background 0.15s;
}
.kyc-back:hover { background: rgba(255,255,255,0.16); }
.kyc-header-center { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.kyc-header-title { font-weight: 800; font-size: 15px; letter-spacing: -0.01em; }
.kyc-progress-bar { height: 3px; background: rgba(255,255,255,0.15); border-radius: 99px; overflow: hidden; }
.kyc-progress-fill { height: 100%; background: #e8dfa0; border-radius: 99px; }

/* Body */
.kyc-body {
  flex: 1; padding: 28px 24px 48px;
  display: flex; flex-direction: column; gap: 20px;
}

.kyc-eyebrow {
  font-size: 10px; font-weight: 800; letter-spacing: 0.14em;
  text-transform: uppercase; color: rgba(17,17,17,0.38); margin: 0;
}
.kyc-heading {
  font-size: clamp(26px, 8vw, 36px); font-weight: 900;
  line-height: 1.1; letter-spacing: -0.04em; color: #111; margin: 0;
}
.kyc-sub {
  font-size: 14px; font-weight: 500; color: #555;
  line-height: 1.6; margin: 0;
}

/* Status badge */
.kyc-status-wrap { display: flex; }
.kyc-status-badge {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 6px 14px; border-radius: 99px;
  font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
}
.kyc-status-dot {
  width: 7px; height: 7px; border-radius: 50; display: block;
}
.kyc-status-idle    { background: rgba(17,17,17,0.08); color: #555; }
.kyc-status-idle .kyc-status-dot { background: #999; border-radius: 50%; }
.kyc-status-pending { background: #fef3c7; color: #854f0b; }
.kyc-status-pending .kyc-status-dot { background: #f59e0b; border-radius: 50%; animation: pulse 1.2s ease-in-out infinite; }
.kyc-status-approved { background: #d1f4d1; color: #2d5a2d; }
.kyc-status-approved .kyc-status-dot { background: #3b6d11; border-radius: 50%; }
.kyc-status-rejected { background: #fde8e8; color: #b0392e; }
.kyc-status-rejected .kyc-status-dot { background: #b0392e; border-radius: 50%; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

/* Upload grid */
.kyc-upload-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}
.kyc-upload-zone {
  background: #fff; border: 2px dashed rgba(17,17,17,0.2);
  border-radius: 12px; min-height: 130px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; cursor: pointer; position: relative;
  transition: border-color 0.15s, background 0.15s; overflow: hidden;
  padding: 16px;
}
.kyc-upload-zone:hover { border-color: #2230a0; background: #f0f2fe; }
.kyc-upload-zone.has-file { border-style: solid; border-color: rgba(17,17,17,0.12); padding: 0; }
.kyc-zone-icon { color: rgba(17,17,17,0.35); }
.kyc-zone-title { font-size: 13px; font-weight: 800; color: #111; }
.kyc-zone-hint { font-size: 11px; font-weight: 500; color: rgba(17,17,17,0.4); text-align: center; }
.kyc-preview-img { width: 100%; height: 100%; object-fit: cover; }
.kyc-zone-replace {
  position: absolute; top: 8px; right: 8px;
  background: rgba(17,17,17,0.55); color: #fff;
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

/* Selfie section */
.kyc-selfie-section { display: flex; flex-direction: column; gap: 10px; }
.kyc-selfie-label-row { display: flex; flex-direction: column; gap: 2px; }
.kyc-section-title { font-size: 14px; font-weight: 800; color: #111; }
.kyc-section-sub { font-size: 12px; font-weight: 500; color: #666; }
.kyc-selfie-frame {
  background: #1a1a2e; border-radius: 14px;
  height: 180px; position: relative;
  cursor: pointer; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.15s;
}
.kyc-selfie-frame:hover { opacity: 0.9; }
.kyc-selfie-frame.has-file { background: #000; }
.kyc-selfie-img { width: 100%; height: 100%; object-fit: cover; border-radius: 14px; }

/* Liveness corners */
.kyc-liveness-corners { position: absolute; inset: 16px; }
.kyc-corner {
  position: absolute; width: 20px; height: 20px;
  border-color: rgba(255,255,255,0.7); border-style: solid;
}
.kyc-corner--tl { top: 0; left: 0; border-width: 2px 0 0 2px; border-radius: 2px 0 0 0; }
.kyc-corner--tr { top: 0; right: 0; border-width: 2px 2px 0 0; border-radius: 0 2px 0 0; }
.kyc-corner--bl { bottom: 0; left: 0; border-width: 0 0 2px 2px; border-radius: 0 0 0 2px; }
.kyc-corner--br { bottom: 0; right: 0; border-width: 0 2px 2px 0; border-radius: 0 0 2px 0; }
.kyc-liveness-inner {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  position: relative; z-index: 1;
}
.kyc-liveness-text { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); text-align: center; }

/* Scan line animation */
.kyc-selfie-frame:not(.has-file)::after {
  content: '';
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(34,48,160,0.7), transparent);
  animation: scan 2.5s ease-in-out infinite;
}
@keyframes scan {
  0%   { top: 16px; opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: calc(100% - 16px); opacity: 0; }
}

/* Info card */
.kyc-info-card {
  display: flex; align-items: flex-start; gap: 10px;
  background: #eef0fc; border: 1.5px solid #c0c8f0;
  border-radius: 10px; padding: 14px;
}
.kyc-info-text { font-size: 13px; font-weight: 500; color: #333; line-height: 1.5; margin: 0; }

/* Buttons */
.kyc-btn-primary {
  background: #111; color: #e8dfa0; border: none;
  border-radius: 10px; padding: 15px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800;
  cursor: pointer; min-height: 50px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, opacity 0.15s;
}
.kyc-btn-primary:hover:not(:disabled) { background: #2230a0; }
.kyc-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.kyc-spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(232,223,160,0.3);
  border-top-color: #e8dfa0; border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.kyc-btn-later {
  background: none; border: none;
  font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700;
  color: rgba(17,17,17,0.45); cursor: pointer; padding: 10px;
  text-align: center; transition: color 0.15s;
}
.kyc-btn-later:hover { color: #111; }

/* Responsive */
@media (min-width: 600px) {
  .kyc { align-items: center; }
  .kyc-header { width: 100%; }
  .kyc-body { width: 100%; max-width: 480px; padding: 36px 0 60px; }
}
</style>
