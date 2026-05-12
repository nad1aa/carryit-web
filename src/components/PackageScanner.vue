<template>
  <teleport to="body">
    <div class="ps">
      <div class="ps-modal">

        <!-- Header -->
        <header class="ps-hdr">
          <button class="ps-hdr-close" @click="$emit('close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <span class="ps-hdr-title">{{ TITLES[phase] }}</span>
          <div class="ps-hdr-dots">
            <span v-for="i in 3" :key="i" class="ps-dot" :class="{ on: phase >= i }"/>
          </div>
        </header>

        <!-- Viewport -->
        <div class="ps-viewport" ref="viewportEl">
          <!-- Loading state -->
          <div v-if="phase === 0" class="ps-loading">
            <div class="ps-spinner-big"/>
            <p>Starting camera…</p>
          </div>

          <!-- Camera error -->
          <div v-if="phase === -1" class="ps-error">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cf3a2c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="#cf3a2c"/>
            </svg>
            <p>Camera access denied.</p>
            <p class="ps-error-sub">Allow camera in browser settings and reload.</p>
          </div>

          <video ref="videoEl" class="ps-video" :class="{ hidden: phase < 1 }" autoplay playsinline muted/>
          <canvas ref="workCanvas" class="ps-work-canvas"/>

          <!-- Guide overlay (phases 1 and 2) -->
          <template v-if="phase === 1 || phase === 2">
            <div class="ps-guide">
              <div class="ps-guide-frame" :class="{ frozen }">
                <span class="ps-corner ps-tl"/><span class="ps-corner ps-tr"/>
                <span class="ps-corner ps-bl"/><span class="ps-corner ps-br"/>
                <div v-if="!frozen" class="ps-scanline"/>
              </div>

              <!-- Phase label inside frame -->
              <div class="ps-phase-tag">
                {{ phase === 1 ? '⬆ TOP VIEW' : '➡ SIDE VIEW' }}
              </div>
            </div>

            <!-- Detected bounding box overlay -->
            <div v-if="detectedBox" class="ps-detected-box" :style="detectedBoxStyle"/>
          </template>

          <!-- Result preview (phase 3) -->
          <div v-if="phase === 3" class="ps-result-preview">
            <canvas ref="previewCanvas" class="ps-preview-canvas"/>
            <div class="ps-result-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b6d11" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Scan complete
            </div>
          </div>
        </div>

        <!-- Bottom panel -->
        <div class="ps-panel">
          <p class="ps-hint" v-if="phase >= 1">{{ HINTS[phase] }}</p>

          <!-- Phase 1: top capture -->
          <button v-if="phase === 1" class="ps-btn-capture" @click="captureTop" :disabled="busy">
            <span v-if="busy" class="ps-spinner"/>
            <template v-else>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              </svg>
              Capture top view
            </template>
          </button>

          <!-- Phase 2: side capture -->
          <button v-if="phase === 2" class="ps-btn-capture" @click="captureSide" :disabled="busy">
            <span v-if="busy" class="ps-spinner"/>
            <template v-else>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              </svg>
              Capture side view
            </template>
          </button>

          <!-- Phase 3: edit + confirm -->
          <div v-if="phase === 3" class="ps-dims-form">
            <div class="ps-dims-grid">
              <div class="ps-dim-cell">
                <label>Length</label>
                <div class="ps-dim-input-wrap">
                  <input v-model.number="dims.length" type="number" min="1" max="300" class="ps-dim-input"/>
                  <span>cm</span>
                </div>
              </div>
              <div class="ps-dim-cell">
                <label>Width</label>
                <div class="ps-dim-input-wrap">
                  <input v-model.number="dims.width" type="number" min="1" max="300" class="ps-dim-input"/>
                  <span>cm</span>
                </div>
              </div>
              <div class="ps-dim-cell">
                <label>Height</label>
                <div class="ps-dim-input-wrap">
                  <input v-model.number="dims.height" type="number" min="1" max="300" class="ps-dim-input"/>
                  <span>cm</span>
                </div>
              </div>
              <div class="ps-dim-cell">
                <label>Est. weight</label>
                <div class="ps-dim-input-wrap">
                  <input v-model.number="dims.weight" type="number" min="0.1" max="50" step="0.1" class="ps-dim-input"/>
                  <span>kg</span>
                </div>
              </div>
            </div>

            <div class="ps-shape-row">
              <span class="ps-shape-label">Shape</span>
              <div class="ps-shape-btns">
                <button v-for="s in SHAPES" :key="s.id"
                  class="ps-shape-btn" :class="{ on: dims.shape === s.id }"
                  @click="dims.shape = s.id">
                  {{ s.emoji }} {{ s.label }}
                </button>
              </div>
            </div>

            <div class="ps-confirm-row">
              <button class="ps-btn-retry" @click="restart">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                </svg>
                Retake
              </button>
              <button class="ps-btn-confirm" @click="confirm">
                Use this scan ✓
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['close', 'confirm'])

// ─── state ───────────────────────────────────────────────────────────────────
const phase      = ref(0)   // 0=loading, -1=error, 1=top, 2=side, 3=results
const busy       = ref(false)
const frozen     = ref(false)
const detectedBox = ref(null) // { x, y, w, h } normalised 0..1 within guide

const videoEl     = ref(null)
const workCanvas  = ref(null)
const previewCanvas = ref(null)
const viewportEl  = ref(null)

let stream = null

const dims = ref({ length: 0, width: 0, height: 0, weight: 0, shape: 'box' })

// ─── constants ───────────────────────────────────────────────────────────────
const TITLES = { 0: 'Starting camera…', '-1': 'Camera error', 1: 'Top-down scan', 2: 'Side scan', 3: 'Confirm dimensions' }
const HINTS  = {
  1: 'Place item on a light/white surface. Hold phone FLAT, ~30 cm above. Item should fill the guide.',
  2: 'Turn item on its side. Hold phone ~30 cm away. Show the full height in the guide.',
  3: 'Adjust dimensions if needed, then tap confirm.',
}

// The guide frame covers this fraction of the shorter video side
const GUIDE_FRAC = 0.76
// At ~30 cm distance the guide frame represents ~26 cm in the real world
const GUIDE_REAL_CM = 26

const SHAPES = [
  { id: 'box',      emoji: '📦', label: 'Box'      },
  { id: 'cylinder', emoji: '🥫', label: 'Cylinder' },
  { id: 'bag',      emoji: '👜', label: 'Bag/Soft'  },
  { id: 'envelope', emoji: '✉️',  label: 'Envelope'  },
]

// ─── computed ─────────────────────────────────────────────────────────────────
const detectedBoxStyle = computed(() => {
  if (!detectedBox.value || !viewportEl.value) return {}
  const vw  = viewportEl.value.clientWidth
  const vh  = viewportEl.value.clientHeight
  const side = Math.min(vw, vh) * GUIDE_FRAC
  const gx  = (vw - side) / 2
  const gy  = (vh - side) / 2
  const b   = detectedBox.value
  return {
    left:   (gx + b.x * side) + 'px',
    top:    (gy + b.y * side) + 'px',
    width:  (b.w * side) + 'px',
    height: (b.h * side) + 'px',
  }
})

// ─── camera ──────────────────────────────────────────────────────────────────
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false,
    })
    videoEl.value.srcObject = stream
    await new Promise(r => videoEl.value.addEventListener('loadeddata', r, { once: true }))
    phase.value = 1
  } catch {
    phase.value = -1
  }
}

function stopCamera() {
  stream?.getTracks().forEach(t => t.stop())
  stream = null
}

// ─── image analysis ──────────────────────────────────────────────────────────
function analyzeFrame() {
  const video  = videoEl.value
  const canvas = workCanvas.value
  const vw = video.videoWidth
  const vh = video.videoHeight
  canvas.width  = vw
  canvas.height = vh
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(video, 0, 0)

  // Guide region in video pixel space (square crop)
  const side = Math.round(Math.min(vw, vh) * GUIDE_FRAC)
  const gx   = Math.round((vw - side) / 2)
  const gy   = Math.round((vh - side) / 2)

  const { data } = ctx.getImageData(gx, gy, side, side)

  let minX = side, maxX = 0, minY = side, maxY = 0
  let itemPx = 0
  const BRIGHT_THRESH = 185  // pixels brighter than this are treated as background

  for (let i = 0; i < data.length; i += 4) {
    const luma = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114
    if (luma < BRIGHT_THRESH) {
      const px = (i >> 2) % side
      const py = (i >> 2) / side | 0
      if (px < minX) minX = px
      if (px > maxX) maxX = px
      if (py < minY) minY = py
      if (py > maxY) maxY = py
      itemPx++
    }
  }

  if (itemPx < 800 || maxX <= minX || maxY <= minY) return null

  const pad = 6
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(side, maxX + pad)
  maxY = Math.min(side, maxY + pad)

  const scale = GUIDE_REAL_CM / side
  const dimA  = Math.max(1, Math.round((maxX - minX) * scale))
  const dimB  = Math.max(1, Math.round((maxY - minY) * scale))

  // Shape guess from solidity
  const solidity = itemPx / ((maxX - minX) * (maxY - minY))
  let shape = 'box'
  if (solidity < 0.60) shape = 'bag'
  else if (dimA < 4 || dimB < 4) shape = 'envelope'

  // Draw bounding box onto work canvas for preview
  ctx.strokeStyle = '#22c55e'
  ctx.lineWidth   = Math.max(2, side / 120)
  ctx.strokeRect(gx + minX, gy + minY, maxX - minX, maxY - minY)

  return {
    dimA, dimB, shape,
    bboxNorm: { x: minX / side, y: minY / side, w: (maxX - minX) / side, h: (maxY - minY) / side },
  }
}

function estimateWeight(l, w, h) {
  // Very rough volume-based estimate (assumes medium-density goods ~0.3 g/cm³)
  const vol = l * w * h
  return Math.max(0.1, Math.round((vol * 0.0003) * 10) / 10)
}

// ─── capture handlers ─────────────────────────────────────────────────────────
async function captureTop() {
  busy.value   = true
  frozen.value = true
  await new Promise(r => setTimeout(r, 120)) // let render freeze

  const result = analyzeFrame()
  if (!result) {
    frozen.value = false
    busy.value   = false
    alert('No item detected. Make sure the item is on a plain light surface and fills the guide frame.')
    return
  }

  dims.value.length = result.dimA
  dims.value.width  = result.dimB
  dims.value.shape  = result.shape
  detectedBox.value = result.bboxNorm
  frozen.value = false
  busy.value   = false
  phase.value  = 2
}

async function captureSide() {
  busy.value   = true
  frozen.value = true
  await new Promise(r => setTimeout(r, 120))

  const result = analyzeFrame()

  // Draw final preview
  const pCanvas  = previewCanvas.value
  const wCanvas  = workCanvas.value
  if (pCanvas) {
    pCanvas.width  = wCanvas.width
    pCanvas.height = wCanvas.height
    pCanvas.getContext('2d').drawImage(wCanvas, 0, 0)
  }

  if (!result) {
    dims.value.height = Math.max(1, Math.round(Math.min(dims.value.length, dims.value.width) / 3))
  } else {
    dims.value.height = Math.min(result.dimA, result.dimB)
  }

  dims.value.weight = estimateWeight(dims.value.length, dims.value.width, dims.value.height)
  detectedBox.value = null
  frozen.value = false
  busy.value   = false
  phase.value  = 3
}

function confirm() {
  emit('confirm', { ...dims.value })
  stopCamera()
  emit('close')
}

function restart() {
  detectedBox.value = null
  frozen.value      = false
  dims.value        = { length: 0, width: 0, height: 0, weight: 0, shape: 'box' }
  phase.value       = 1
}

onMounted(startCamera)
onUnmounted(stopCamera)
</script>

<style scoped>
.ps {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.88);
  display: flex; align-items: flex-end; justify-content: center;
}

.ps-modal {
  width: 100%; max-width: 520px;
  background: #111;
  border-radius: 20px 20px 0 0;
  display: flex; flex-direction: column;
  max-height: 96dvh; overflow: hidden;
}

/* Header */
.ps-hdr {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}
.ps-hdr-close {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.08); border: none; border-radius: 50%;
  color: #fff; cursor: pointer; flex-shrink: 0;
}
.ps-hdr-close:hover { background: rgba(255,255,255,0.16); }
.ps-hdr-title { flex: 1; font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 14px; color: #fff; }
.ps-hdr-dots { display: flex; gap: 6px; }
.ps-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.2); transition: background 0.2s; }
.ps-dot.on { background: #e8dfa0; }

/* Viewport */
.ps-viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #000;
  overflow: hidden;
  flex-shrink: 0;
}

.ps-video {
  width: 100%; height: 100%; object-fit: cover;
}
.ps-video.hidden { opacity: 0; }
.ps-work-canvas { display: none; }

/* Loading / error states */
.ps-loading, .ps-error {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; color: rgba(255,255,255,0.7);
  font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 600; text-align: center; padding: 20px;
}
.ps-error { color: #cf3a2c; }
.ps-error-sub { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.45); margin-top: -6px; }
.ps-spinner-big {
  width: 36px; height: 36px;
  border: 3px solid rgba(255,255,255,0.15);
  border-top-color: #e8dfa0;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}

/* Guide overlay */
.ps-guide {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
}
.ps-guide-frame {
  width: 76%; aspect-ratio: 1 / 1;
  position: relative;
  border: 2px solid rgba(232,223,160,0.35);
  border-radius: 4px;
  overflow: hidden;
}
.ps-guide-frame.frozen { border-color: #22c55e; }

.ps-corner {
  position: absolute; width: 18px; height: 18px;
  border-color: #e8dfa0; border-style: solid;
}
.ps-tl { top: -1px; left: -1px; border-width: 3px 0 0 3px; border-radius: 4px 0 0 0; }
.ps-tr { top: -1px; right: -1px; border-width: 3px 3px 0 0; border-radius: 0 4px 0 0; }
.ps-bl { bottom: -1px; left: -1px; border-width: 0 0 3px 3px; border-radius: 0 0 0 4px; }
.ps-br { bottom: -1px; right: -1px; border-width: 0 3px 3px 0; border-radius: 0 0 4px 0; }

.ps-scanline {
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #e8dfa0, transparent);
  animation: scanY 2.2s ease-in-out infinite;
}
@keyframes scanY {
  0%,100% { top: 10%; opacity: 0.4; }
  50%      { top: 85%; opacity: 1;   }
}

.ps-phase-tag {
  position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
  font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 900;
  letter-spacing: 0.14em; color: #e8dfa0; background: rgba(0,0,0,0.55);
  padding: 3px 10px; border-radius: 99px; white-space: nowrap;
}

/* Detected bounding box highlight */
.ps-detected-box {
  position: absolute;
  border: 2px solid #22c55e;
  border-radius: 3px;
  box-shadow: 0 0 0 1px rgba(34,197,94,0.3);
  pointer-events: none;
  transition: all 0.15s;
}

/* Result preview */
.ps-result-preview {
  position: absolute; inset: 0;
}
.ps-preview-canvas { width: 100%; height: 100%; object-fit: cover; }
.ps-result-badge {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px;
  background: rgba(0,0,0,0.75); border: 1.5px solid #22c55e;
  border-radius: 99px; padding: 6px 14px;
  font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 800; color: #22c55e;
  white-space: nowrap;
}

/* Bottom panel */
.ps-panel {
  padding: 14px 16px 20px;
  display: flex; flex-direction: column; gap: 12px;
  background: #111;
  flex-shrink: 0;
}
.ps-hint {
  font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,0.55); line-height: 1.5; text-align: center; margin: 0;
}

/* Capture button */
.ps-btn-capture {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: #e8dfa0; color: #111;
  border: none; border-radius: 12px; padding: 15px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 900;
  cursor: pointer; transition: background 0.15s; letter-spacing: 0.02em;
}
.ps-btn-capture:hover:not(:disabled) { background: #fff; }
.ps-btn-capture:disabled { opacity: 0.5; cursor: not-allowed; }
.ps-spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(17,17,17,0.2);
  border-top-color: #111; border-radius: 50%;
  animation: spin 0.7s linear infinite; display: inline-block;
}

/* Dims form (phase 3) */
.ps-dims-form { display: flex; flex-direction: column; gap: 10px; }
.ps-dims-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ps-dim-cell { display: flex; flex-direction: column; gap: 4px; }
.ps-dim-cell label {
  font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 800;
  letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.4);
}
.ps-dim-input-wrap {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 8px; padding: 8px 10px;
  font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.45);
}
.ps-dim-input {
  flex: 1; background: none; border: none; outline: none;
  font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 900; color: #e8dfa0;
  width: 0; min-width: 0;
}
.ps-dim-input::-webkit-inner-spin-button,
.ps-dim-input::-webkit-outer-spin-button { -webkit-appearance: none; }

.ps-shape-row { display: flex; align-items: center; gap: 8px; }
.ps-shape-label {
  font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 800;
  letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.4);
  white-space: nowrap;
}
.ps-shape-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.ps-shape-btn {
  background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 8px; padding: 5px 10px;
  font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.55);
  cursor: pointer; transition: all 0.15s;
}
.ps-shape-btn.on { background: rgba(232,223,160,0.15); border-color: #e8dfa0; color: #e8dfa0; }

.ps-confirm-row { display: flex; gap: 10px; }
.ps-btn-retry {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 12px; padding: 13px 16px;
  font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.6);
  cursor: pointer; transition: background 0.15s; white-space: nowrap;
}
.ps-btn-retry:hover { background: rgba(255,255,255,0.1); }
.ps-btn-confirm {
  flex: 1; background: #2230a0; color: #e8dfa0; border: none;
  border-radius: 12px; padding: 14px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 900;
  cursor: pointer; transition: background 0.15s;
}
.ps-btn-confirm:hover { background: #1a258a; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
