<template>
  <teleport to="body">
    <div class="ps" role="dialog" aria-modal="true">
      <div class="ps-sheet">

        <!-- Header -->
        <header class="ps-hdr">
          <button class="ps-hdr-close" @click="handleClose" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="ps-hdr-center">
            <span class="ps-hdr-title">{{ TITLES[phase] }}</span>
            <div class="ps-dots">
              <span v-for="i in 3" :key="i" class="ps-dot"
                :class="{ on: phaseIdx >= i, done: phaseIdx > i }"/>
            </div>
          </div>
          <div style="width:32px"/>
        </header>

        <!-- Viewport -->
        <div class="ps-viewport" ref="viewportRef">

          <!-- Loading -->
          <div v-if="phase === 'loading'" class="ps-overlay-state">
            <div class="ps-ring"/>
            <p class="ps-state-title">{{ loadMsg }}</p>
            <div class="ps-loadbar"><div class="ps-loadbar-fill" :style="{ width: loadPct + '%' }"/></div>
          </div>

          <!-- Error -->
          <div v-else-if="phase === 'error'" class="ps-overlay-state ps-overlay-err">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="13"/>
              <circle cx="12" cy="17" r="0.5" fill="#ef4444" stroke-width="1"/>
            </svg>
            <p class="ps-state-title">{{ errTitle }}</p>
            <p class="ps-state-sub">{{ errSub }}</p>
            <button class="ps-btn-sm" @click="init">Try again</button>
          </div>

          <!-- Live camera (top + side phases) -->
          <template v-if="phase === 'top' || phase === 'side'">
            <video
              ref="videoRef"
              class="ps-video"
              autoplay playsinline muted
              :class="{ 'ps-frozen': frozen }"
            />
            <canvas ref="workRef" class="ps-hidden"/>

            <!-- Guide corners -->
            <div class="ps-guide" :class="{ 'ps-guide-hit': stabPct >= 100 }">
              <svg class="ps-corners" viewBox="0 0 200 200" fill="none">
                <path d="M8 44 L8 8 L44 8"   stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
                <path d="M156 8 L192 8 L192 44" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
                <path d="M8 156 L8 192 L44 192" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
                <path d="M156 192 L192 192 L192 156" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
              </svg>
              <div v-if="!frozen && !bboxStyle" class="ps-scanline"/>
              <div class="ps-phase-tag">{{ phase === 'top' ? '⬆ TOP VIEW' : '➡ SIDE VIEW' }}</div>
            </div>

            <!-- Detected bounding box -->
            <div v-if="bboxStyle && !frozen"
              class="ps-bbox"
              :class="{ 'ps-bbox-stable': stabPct >= 100 }"
              :style="bboxStyle">
              <!-- Stability arc -->
              <svg v-if="stabPct > 0 && stabPct < 100" class="ps-arc" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.15)" stroke-width="3" fill="none"/>
                <circle cx="22" cy="22" r="18"
                  stroke="#e8dfa0" stroke-width="3" fill="none"
                  stroke-linecap="round"
                  :stroke-dasharray="CIRC"
                  :stroke-dashoffset="CIRC - (stabPct / 100) * CIRC"
                  transform="rotate(-90 22 22)"
                />
              </svg>
            </div>

            <!-- Auto-capture prompt -->
            <div v-if="stabPct >= 100 && !frozen" class="ps-auto-badge">
              📷 Hold still…
            </div>

            <!-- Flash -->
            <div v-if="flash" class="ps-flash"/>
          </template>

          <!-- Result: last captured frame -->
          <template v-if="phase === 'result'">
            <canvas ref="resultRef" class="ps-result-canvas"/>
            <div class="ps-result-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Scan complete
            </div>
          </template>
        </div>

        <!-- Bottom panel -->
        <div class="ps-panel">
          <p v-if="HINTS[phase]" class="ps-hint">{{ HINTS[phase] }}</p>

          <!-- Detection confidence bar -->
          <div v-if="(phase === 'top' || phase === 'side') && detConf > 0" class="ps-conf-row">
            <span class="ps-conf-label">Object detected</span>
            <div class="ps-conf-bar">
              <div class="ps-conf-fill" :style="{ width: detConf + '%', background: detConf > 60 ? '#22c55e' : '#e8dfa0' }"/>
            </div>
            <span class="ps-conf-pct">{{ detConf }}%</span>
          </div>
          <p v-else-if="phase === 'top' || phase === 'side'" class="ps-no-det">
            No object detected — make sure item is on a light surface
          </p>

          <!-- Capture buttons -->
          <button v-if="phase === 'top' || phase === 'side'"
            class="ps-btn-capture"
            @click="phase === 'top' ? captureTop() : captureSide()"
            :disabled="busy">
            <span v-if="busy" class="ps-spinner"/>
            <template v-else>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              </svg>
              {{ phase === 'top' ? 'Capture top view' : 'Capture side view' }}
            </template>
          </button>

          <!-- Results form -->
          <template v-if="phase === 'result'">
            <div class="ps-dims">
              <div v-for="f in FIELDS" :key="f.key" class="ps-dim-cell">
                <label>{{ f.lbl }}</label>
                <div class="ps-dim-row">
                  <input v-model.number="res[f.key]" type="number"
                    :min="f.min" :max="f.max" :step="f.step"
                    class="ps-dim-in" inputmode="decimal"/>
                  <span class="ps-dim-unit">{{ f.unit }}</span>
                </div>
              </div>
            </div>

            <div class="ps-shape-row">
              <span class="ps-shape-lbl">Shape</span>
              <div class="ps-chips">
                <button v-for="s in SHAPES" :key="s.id"
                  class="ps-chip" :class="{ on: res.shape === s.id }"
                  @click="res.shape = s.id">
                  {{ s.e }}&nbsp;{{ s.l }}
                </button>
              </div>
            </div>

            <div class="ps-actions">
              <button class="ps-btn-retake" @click="restart">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                </svg>
                Retake
              </button>
              <button class="ps-btn-confirm" @click="confirm">Use this scan ✓</button>
            </div>
          </template>
        </div>

      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const emit = defineEmits(['close', 'confirm'])

// ─── constants ────────────────────────────────────────────────────────────────
const GUIDE_FRAC   = 0.76   // guide frame = 76% of viewport shorter side
const GUIDE_CM     = 26     // real-world size of guide at ~30 cm distance
const CIRC         = 2 * Math.PI * 18  // ring circumference (r=18)
const DETECT_MS    = 250    // detection interval
const STAB_FRAMES  = 7      // frames before stable
const AUTO_MS      = 1600   // ms of stability → auto-capture

const TITLES = {
  loading: 'Starting camera…',
  error:   'Camera error',
  top:     'Top-down scan',
  side:    'Side scan',
  result:  'Confirm dimensions',
}
const HINTS = {
  top:    'Place item on a plain light surface. Hold phone FLAT ~30 cm above. Item should fill the guide.',
  side:   'Now show the SIDE of your item at the same distance. Fill the guide.',
  result: 'Adjust any value if needed, then confirm.',
}
const SHAPES = [
  { id: 'box',       e: '📦', l: 'Box'       },
  { id: 'cylinder',  e: '🥫', l: 'Cylinder'  },
  { id: 'bag',       e: '👜', l: 'Bag / Soft' },
  { id: 'envelope',  e: '✉️',  l: 'Envelope'  },
  { id: 'irregular', e: '🪨', l: 'Irregular'  },
]
const FIELDS = [
  { key: 'length', lbl: 'Length', unit: 'cm',  min: 1,   max: 300, step: 1   },
  { key: 'width',  lbl: 'Width',  unit: 'cm',  min: 1,   max: 300, step: 1   },
  { key: 'height', lbl: 'Height', unit: 'cm',  min: 1,   max: 300, step: 1   },
  { key: 'weight', lbl: 'Weight', unit: 'kg',  min: 0.1, max: 100, step: 0.1 },
]

// ─── state ────────────────────────────────────────────────────────────────────
const phase   = ref('loading')
const busy    = ref(false)
const frozen  = ref(false)
const flash   = ref(false)

const loadMsg  = ref('Requesting camera…')
const loadPct  = ref(0)
const errTitle = ref('')
const errSub   = ref('')

// Detection
const bboxStyle = ref(null)
const detConf   = ref(0)
const stabPct   = ref(0)
const stabHistory = ref([])  // array of {bbox, t}
let   autoTimer   = null
let   autoFired   = false
let   detectTimer = null

// DOM refs
const viewportRef = ref(null)
const videoRef    = ref(null)
const workRef     = ref(null)
const resultRef   = ref(null)

// Results
const topDims = ref(null)
const res = ref({ length: 0, width: 0, height: 0, weight: 0, shape: 'box' })

let mediaStream = null

// ─── computed ─────────────────────────────────────────────────────────────────
const phaseIdx = computed(() => ({ top: 1, side: 2, result: 3 }[phase.value] ?? 0))

// ─── camera init ──────────────────────────────────────────────────────────────
async function init() {
  phase.value  = 'loading'
  loadPct.value = 0
  loadMsg.value = 'Requesting camera permission…'

  // Stop any existing stream
  stopStream()

  // Request camera — try rear first, fall back to any camera
  try {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
    } catch {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    }
  } catch (e) {
    phase.value  = 'error'
    errTitle.value = permissionErrorTitle(e)
    errSub.value   = permissionErrorSub(e)
    return
  }

  loadPct.value = 70
  loadMsg.value = 'Camera ready, starting preview…'

  await nextTick()

  const video = videoRef.value
  if (!video) return

  video.srcObject = mediaStream

  // Wait for video to be playable (with timeout fallback for Safari)
  await Promise.race([
    new Promise(r => video.addEventListener('canplay', r, { once: true })),
    new Promise(r => setTimeout(r, 3000)),
  ])

  // Ensure video is playing (required on some iOS versions)
  try { await video.play() } catch { /* already autoplaying */ }

  loadPct.value = 100
  await new Promise(r => setTimeout(r, 180))

  phase.value = 'top'
  startLoop()
}

function permissionErrorTitle(e) {
  if (e?.name === 'NotAllowedError')     return 'Camera access denied'
  if (e?.name === 'NotFoundError')       return 'No camera found'
  if (e?.name === 'NotReadableError')    return 'Camera already in use'
  return 'Could not start camera'
}
function permissionErrorSub(e) {
  if (e?.name === 'NotAllowedError')
    return 'Go to Settings → Safari → Camera → Allow, then tap Try again.'
  if (e?.name === 'NotFoundError')
    return 'No camera is accessible on this device.'
  if (e?.name === 'NotReadableError')
    return 'Close other apps using the camera and try again.'
  return 'Please reload and allow camera access when prompted.'
}

// ─── detection loop ───────────────────────────────────────────────────────────
function startLoop() {
  stopLoop()
  autoFired = false
  detectTimer = setInterval(detect, DETECT_MS)
}

function stopLoop() {
  if (detectTimer) { clearInterval(detectTimer); detectTimer = null }
  if (autoTimer)   { clearTimeout(autoTimer);    autoTimer   = null }
  stabPct.value     = 0
  stabHistory.value = []
}

function detect() {
  const video  = videoRef.value
  const canvas = workRef.value
  if (!video || !canvas || frozen.value || video.readyState < 2) return

  const result = analyzeFrame(video, canvas)

  if (!result) {
    bboxStyle.value = null
    detConf.value   = 0
    resetStability()
    return
  }

  bboxStyle.value = normToStyle(result.norm)
  detConf.value   = Math.round(result.solidity * 100)
  trackStability(result.rawBbox)
}

// ─── canvas-based object detection ───────────────────────────────────────────
function analyzeFrame(video, canvas) {
  const vW = video.videoWidth
  const vH = video.videoHeight
  if (!vW || !vH) return null

  canvas.width  = vW
  canvas.height = vH

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(video, 0, 0)

  // Extract only the guide-frame region
  const gs = Math.round(Math.min(vW, vH) * GUIDE_FRAC)
  const gx = Math.round((vW - gs) / 2)
  const gy = Math.round((vH - gs) / 2)

  const { data } = ctx.getImageData(gx, gy, gs, gs)

  let minX = gs, maxX = 0, minY = gs, maxY = 0
  let itemPx = 0

  // Adaptive threshold: scan a few border pixels to estimate background brightness
  let bgSample = 0, bgCount = 0
  const sample = (i) => { bgSample += data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114; bgCount++ }
  for (let x = 0; x < gs; x += 4) {
    sample(x * 4)                        // top row
    sample(((gs - 1) * gs + x) * 4)      // bottom row
  }
  for (let y = 0; y < gs; y += 4) {
    sample(y * gs * 4)                   // left col
    sample((y * gs + gs - 1) * 4)        // right col
  }
  const bgBrightness = bgCount > 0 ? bgSample / bgCount : 200
  // Use 75% of background brightness as threshold — works for both dark and light backgrounds
  const threshold = Math.max(60, Math.min(220, bgBrightness * 0.75))

  for (let i = 0; i < data.length; i += 4) {
    const luma = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114
    if (luma < threshold) {
      const px = (i >> 2) % gs
      const py = (i >> 2) / gs | 0
      if (px < minX) minX = px
      if (px > maxX) maxX = px
      if (py < minY) minY = py
      if (py > maxY) maxY = py
      itemPx++
    }
  }

  // Reject noise / too small detection
  const minArea = gs * gs * 0.02   // at least 2% of guide area
  if (itemPx < minArea || maxX <= minX || maxY <= minY) return null

  // Reject detection that touches all 4 borders (= no item, just noise)
  const touchBorder = minX < 4 && minY < 4 && maxX > gs - 4 && maxY > gs - 4
  if (touchBorder) return null

  // Pad slightly
  const pad = Math.round(gs * 0.015)
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad)
  maxX = Math.min(gs, maxX + pad); maxY = Math.min(gs, maxY + pad)

  const bboxW   = maxX - minX
  const bboxH   = maxY - minY
  const solidity = itemPx / (bboxW * bboxH)
  const scale    = GUIDE_CM / gs

  return {
    dimA:     Math.max(1, Math.round(bboxW * scale)),
    dimB:     Math.max(1, Math.round(bboxH * scale)),
    solidity,
    rawBbox:  [gx + minX, gy + minY, bboxW, bboxH],   // video px coords
    norm:     { x: minX / gs, y: minY / gs, w: bboxW / gs, h: bboxH / gs },
  }
}

// ─── stability tracking ───────────────────────────────────────────────────────
function trackStability(bbox) {
  const h = stabHistory.value
  h.push({ bbox, t: Date.now() })
  if (h.length > STAB_FRAMES) h.shift()

  if (h.length < STAB_FRAMES) {
    stabPct.value = (h.length / STAB_FRAMES) * 40
    return
  }

  const iou = bboxIoU(h[0].bbox, h[h.length - 1].bbox)
  if (iou > 0.72) {
    const elapsed = Date.now() - h[0].t
    stabPct.value = Math.min(100, (elapsed / AUTO_MS) * 100)

    if (stabPct.value >= 100 && !autoFired && !frozen.value) {
      autoFired = true
      autoTimer = setTimeout(() => {
        if (phase.value === 'top') captureTop()
        else if (phase.value === 'side') captureSide()
      }, 100)
    }
  } else {
    resetStability()
  }
}

function resetStability() {
  stabPct.value = 0
  stabHistory.value = []
  autoFired = false
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null }
}

// ─── captures ─────────────────────────────────────────────────────────────────
async function captureTop() {
  if (busy.value) return
  busy.value  = true
  frozen.value = true
  stopLoop()
  doFlash()

  await new Promise(r => setTimeout(r, 120))

  const video  = videoRef.value
  const canvas = workRef.value
  const found  = analyzeFrame(video, canvas)

  topDims.value = found
    ? { dimA: found.dimA, dimB: found.dimB, shape: guessShape(found) }
    : { dimA: 20, dimB: 15, shape: 'box' }    // safe fallback

  bboxStyle.value = null
  frozen.value    = false
  busy.value      = false
  autoFired       = false
  phase.value     = 'side'
  startLoop()
}

async function captureSide() {
  if (busy.value) return
  busy.value   = true
  frozen.value = true
  stopLoop()
  doFlash()

  await new Promise(r => setTimeout(r, 120))

  const video  = videoRef.value
  const canvas = workRef.value
  const found  = analyzeFrame(video, canvas)

  // Snapshot frame for result preview
  await nextTick()
  if (resultRef.value && canvas.width) {
    resultRef.value.width  = canvas.width
    resultRef.value.height = canvas.height
    resultRef.value.getContext('2d').drawImage(canvas, 0, 0)
  }

  const top = topDims.value
  const h   = found ? Math.min(found.dimA, found.dimB) : Math.max(3, Math.round(Math.min(top.dimA, top.dimB) / 3))

  const l = top.dimA, w = top.dimB
  res.value = {
    length: l,
    width:  w,
    height: h,
    weight: Math.max(0.1, Math.round(l * w * h * 0.00030 * 10) / 10),
    shape:  top.shape,
  }

  frozen.value = false
  busy.value   = false
  phase.value  = 'result'
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function guessShape({ dimA, dimB, solidity }) {
  if (dimA < 3 || dimB < 3) return 'envelope'
  if (solidity < 0.58) return 'bag'
  const r = Math.max(dimA, dimB) / Math.min(dimA, dimB)
  if (r < 1.25 && solidity > 0.78) return 'cylinder'
  return 'box'
}

function normToStyle(norm) {
  const vp = viewportRef.value
  if (!vp) return null
  const cW = vp.clientWidth, cH = vp.clientHeight
  const gs = Math.min(cW, cH) * GUIDE_FRAC
  const gx = (cW - gs) / 2
  const gy = (cH - gs) / 2
  return {
    left:   (gx + norm.x * gs) + 'px',
    top:    (gy + norm.y * gs) + 'px',
    width:  (norm.w * gs) + 'px',
    height: (norm.h * gs) + 'px',
  }
}

function bboxIoU(a, b) {
  const ax2 = a[0]+a[2], ay2 = a[1]+a[3]
  const bx2 = b[0]+b[2], by2 = b[1]+b[3]
  const ix1 = Math.max(a[0],b[0]), iy1 = Math.max(a[1],b[1])
  const ix2 = Math.min(ax2,bx2),   iy2 = Math.min(ay2,by2)
  if (ix2 <= ix1 || iy2 <= iy1) return 0
  const inter = (ix2-ix1)*(iy2-iy1)
  return inter / (a[2]*a[3] + b[2]*b[3] - inter)
}

function doFlash() {
  flash.value = true
  setTimeout(() => { flash.value = false }, 230)
}

function restart() {
  stopLoop()
  bboxStyle.value = null
  detConf.value   = 0
  topDims.value   = null
  autoFired       = false
  res.value       = { length: 0, width: 0, height: 0, weight: 0, shape: 'box' }
  phase.value     = 'top'
  startLoop()
}

function confirm() {
  emit('confirm', { ...res.value })
  handleClose()
}

function handleClose() {
  stopLoop()
  stopStream()
  emit('close')
}

function stopStream() {
  mediaStream?.getTracks().forEach(t => t.stop())
  mediaStream = null
}

onMounted(init)
onUnmounted(() => { stopLoop(); stopStream() })
</script>

<style scoped>
.ps {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.88);
  display: flex; align-items: flex-end; justify-content: center;
  font-family: 'Montserrat', sans-serif;
}
.ps-sheet {
  width: 100%; max-width: 540px;
  background: #0e0e0e;
  border-radius: 22px 22px 0 0;
  display: flex; flex-direction: column;
  max-height: 97dvh; overflow: hidden;
}

/* Header */
.ps-hdr {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
}
.ps-hdr-close {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.08); border: none; border-radius: 50%;
  color: rgba(255,255,255,0.7); cursor: pointer; flex-shrink: 0;
}
.ps-hdr-close:hover { background: rgba(255,255,255,0.15); }
.ps-hdr-center { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.ps-hdr-title  { font-size: 13px; font-weight: 800; color: #fff; }
.ps-dots { display: flex; gap: 6px; }
.ps-dot  { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.18); transition: background 0.2s; }
.ps-dot.on   { background: #e8dfa0; }
.ps-dot.done { background: #22c55e; }

/* Viewport */
.ps-viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #000;
  overflow: hidden;
  flex-shrink: 0;
}

/* Loading / error overlay */
.ps-overlay-state {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px; padding: 28px;
}
.ps-state-title {
  font-size: 14px; font-weight: 800; color: #fff; text-align: center; margin: 0;
}
.ps-state-sub {
  font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.4);
  text-align: center; line-height: 1.55; margin: 0; max-width: 280px;
}
.ps-ring {
  width: 42px; height: 42px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #e8dfa0;
  border-radius: 50%;
  animation: ps-spin 0.85s linear infinite;
}
.ps-loadbar {
  width: 180px; height: 3px;
  background: rgba(255,255,255,0.1); border-radius: 99px; overflow: hidden;
}
.ps-loadbar-fill {
  height: 100%; background: #e8dfa0; border-radius: 99px;
  transition: width 0.35s ease;
}
.ps-overlay-err { }
.ps-btn-sm {
  background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.2);
  border-radius: 8px; padding: 9px 20px; margin-top: 4px;
  font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700;
  color: #fff; cursor: pointer;
}
.ps-btn-sm:hover { background: rgba(255,255,255,0.18); }

/* Camera */
.ps-video {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.ps-frozen { filter: brightness(0.82); }
.ps-hidden { display: none; }

/* Guide overlay */
.ps-guide {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
}
.ps-corners {
  width: 76%; aspect-ratio: 1/1;
  color: rgba(232,223,160,0.9);
  filter: drop-shadow(0 0 8px rgba(232,223,160,0.4));
  transition: color 0.2s, filter 0.2s;
}
.ps-guide-hit .ps-corners {
  color: #22c55e;
  filter: drop-shadow(0 0 10px rgba(34,197,94,0.5));
}
.ps-scanline {
  position: absolute; left: 12%; right: 12%; height: 2px;
  background: linear-gradient(90deg, transparent, #e8dfa0 35%, #e8dfa0 65%, transparent);
  animation: ps-scan 2.2s ease-in-out infinite;
}
@keyframes ps-scan {
  0%,100% { top: 12%; opacity: 0.3; }
  50%      { top: 84%; opacity: 1;   }
}
.ps-phase-tag {
  position: absolute; bottom: 10px;
  background: rgba(0,0,0,0.65); border: 1px solid rgba(255,255,255,0.14);
  border-radius: 99px; padding: 4px 12px;
  font-size: 9px; font-weight: 900; letter-spacing: 0.16em; color: #e8dfa0;
}

/* Bounding box */
.ps-bbox {
  position: absolute;
  border: 2px solid rgba(232,223,160,0.85);
  border-radius: 5px;
  box-shadow: 0 0 0 1px rgba(232,223,160,0.2);
  pointer-events: none;
  transition: left 0.1s, top 0.1s, width 0.1s, height 0.1s;
}
.ps-bbox-stable {
  border-color: #22c55e;
  box-shadow: 0 0 0 1px rgba(34,197,94,0.25);
}
.ps-arc {
  position: absolute; bottom: -26px; right: -26px;
  width: 44px; height: 44px; pointer-events: none;
}
.ps-auto-badge {
  position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.75); border: 1.5px solid #22c55e; border-radius: 99px;
  padding: 5px 14px; font-size: 12px; font-weight: 800; color: #22c55e;
  white-space: nowrap; animation: ps-fadein 0.2s ease;
}

/* Flash */
.ps-flash {
  position: absolute; inset: 0; background: rgba(255,255,255,0.7);
  animation: ps-flash 0.22s ease-out forwards; pointer-events: none;
}
@keyframes ps-flash { 0% { opacity: 1; } 100% { opacity: 0; } }

/* Result canvas */
.ps-result-canvas { width: 100%; height: 100%; object-fit: cover; display: block; }
.ps-result-badge {
  position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px;
  background: rgba(0,0,0,0.78); border: 1.5px solid #22c55e; border-radius: 99px;
  padding: 6px 16px; font-size: 12px; font-weight: 800; color: #22c55e; white-space: nowrap;
}

/* Panel */
.ps-panel {
  padding: 12px 16px max(18px, env(safe-area-inset-bottom, 18px));
  background: #0e0e0e;
  display: flex; flex-direction: column; gap: 10px;
  flex-shrink: 0;
}
.ps-hint {
  font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.42);
  line-height: 1.5; text-align: center; margin: 0;
}

/* Detection bar */
.ps-conf-row {
  display: flex; align-items: center; gap: 8px;
}
.ps-conf-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.45); white-space: nowrap; }
.ps-conf-bar   { flex: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 99px; overflow: hidden; }
.ps-conf-fill  { height: 100%; border-radius: 99px; transition: width 0.2s, background 0.2s; }
.ps-conf-pct   { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.5); min-width: 28px; text-align: right; }
.ps-no-det     { font-size: 10px; font-weight: 600; color: rgba(255,165,0,0.7); text-align: center; margin: 0; }

/* Capture button */
.ps-btn-capture {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: #e8dfa0; color: #111; border: none; border-radius: 14px; padding: 15px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 900;
  cursor: pointer; transition: background 0.15s, opacity 0.15s;
}
.ps-btn-capture:hover:not(:disabled) { background: #fff; }
.ps-btn-capture:disabled { opacity: 0.45; cursor: not-allowed; }
.ps-spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(17,17,17,0.2); border-top-color: #111;
  border-radius: 50%; animation: ps-spin 0.7s linear infinite;
}

/* Dims grid */
.ps-dims { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ps-dim-cell { display: flex; flex-direction: column; gap: 4px; }
.ps-dim-cell label {
  font-size: 9px; font-weight: 800; letter-spacing: 0.12em;
  text-transform: uppercase; color: rgba(255,255,255,0.32);
}
.ps-dim-row {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 9px 11px;
}
.ps-dim-in {
  flex: 1; min-width: 0; background: none; border: none; outline: none;
  font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 900; color: #e8dfa0;
}
.ps-dim-in::-webkit-outer-spin-button,
.ps-dim-in::-webkit-inner-spin-button { -webkit-appearance: none; }
.ps-dim-unit { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.3); }

/* Shape chips */
.ps-shape-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ps-shape-lbl {
  font-size: 9px; font-weight: 800; letter-spacing: 0.12em;
  text-transform: uppercase; color: rgba(255,255,255,0.32); white-space: nowrap;
}
.ps-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.ps-chip {
  background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 99px; padding: 5px 11px;
  font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,0.48); cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.ps-chip.on { background: rgba(232,223,160,0.14); border-color: #e8dfa0; color: #e8dfa0; }

/* Actions */
.ps-actions { display: flex; gap: 10px; }
.ps-btn-retake {
  display: flex; align-items: center; gap: 6px; white-space: nowrap;
  background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 12px; padding: 13px 15px;
  font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700;
  color: rgba(255,255,255,0.55); cursor: pointer; transition: background 0.15s;
}
.ps-btn-retake:hover { background: rgba(255,255,255,0.1); }
.ps-btn-confirm {
  flex: 1; background: #2230a0; color: #e8dfa0; border: none;
  border-radius: 12px; padding: 14px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 900;
  cursor: pointer; transition: background 0.15s;
}
.ps-btn-confirm:hover { background: #1a258a; }

@keyframes ps-spin    { to { transform: rotate(360deg); } }
@keyframes ps-fadein  { from { opacity: 0; transform: translateX(-50%) translateY(-4px); } }

@media (min-width: 540px) {
  .ps { align-items: center; }
  .ps-sheet { border-radius: 22px; max-height: 92dvh; }
}
</style>
