<template>
  <teleport to="body">
    <div class="ps" role="dialog" aria-modal="true">
      <div class="ps-sheet">

        <!-- ── Header ── -->
        <header class="ps-hdr">
          <button class="ps-hdr-close" @click="handleClose" aria-label="Close scanner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="ps-hdr-center">
            <span class="ps-hdr-title">{{ STEP_LABELS[phase] }}</span>
            <div class="ps-step-dots">
              <span v-for="i in 3" :key="i"
                class="ps-dot"
                :class="{ active: phaseIndex >= i, done: phaseIndex > i }"/>
            </div>
          </div>
          <div style="width:32px"/>
        </header>

        <!-- ── Viewport ── -->
        <div class="ps-viewport" ref="viewportRef">

          <!-- Loading model -->
          <div v-if="phase === 'loading'" class="ps-state-overlay">
            <div class="ps-loading-ring"/>
            <p class="ps-state-title">Loading scanner</p>
            <p class="ps-state-sub">{{ loadNote }}</p>
            <div class="ps-load-bar"><div class="ps-load-fill" :style="{ width: loadPct + '%' }"/></div>
          </div>

          <!-- Error -->
          <div v-else-if="phase === 'error'" class="ps-state-overlay">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#cf3a2c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <circle cx="12" cy="16.5" r="0.5" fill="#cf3a2c"/>
            </svg>
            <p class="ps-state-title">{{ errorMsg }}</p>
            <p class="ps-state-sub">{{ errorSub }}</p>
            <button class="ps-btn-retry-sm" @click="initScanner">Try again</button>
          </div>

          <!-- Camera view (phases: top, side) -->
          <template v-if="phase === 'top' || phase === 'side'">
            <video
              ref="videoRef"
              class="ps-video"
              autoplay
              playsinline
              muted
              :class="{ 'ps-video--frozen': isFrozen }"
            />

            <!-- Off-screen canvases -->
            <canvas ref="processRef" class="ps-hidden-canvas"/>

            <!-- Guide frame overlay -->
            <div class="ps-guide" :class="{ 'ps-guide--hit': stabilityPct >= 100 }">
              <!-- Corner brackets via SVG so they scale cleanly -->
              <svg class="ps-guide-corners" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 45 L10 10 L45 10" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
                <path d="M155 10 L190 10 L190 45" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
                <path d="M10 155 L10 190 L45 190" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
                <path d="M155 190 L190 190 L190 155" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
              </svg>

              <!-- Scan line (idle state) -->
              <div v-if="!tfDetecting && !isFrozen" class="ps-scanline"/>

              <!-- Phase badge -->
              <div class="ps-phase-badge">
                {{ phase === 'top' ? '⬆ TOP VIEW' : '➡ SIDE VIEW' }}
              </div>
            </div>

            <!-- TF.js / canvas bounding box -->
            <div
              v-if="bboxStyle && !isFrozen"
              class="ps-bbox"
              :class="{ 'ps-bbox--stable': stabilityPct >= 100 }"
              :style="bboxStyle"
            >
              <span v-if="detectedLabel" class="ps-bbox-label">{{ detectedLabel }}</span>

              <!-- Stability progress ring -->
              <svg
                v-if="stabilityPct < 100"
                class="ps-stab-ring"
                viewBox="0 0 40 40"
                fill="none"
              >
                <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.18)" stroke-width="3"/>
                <circle
                  cx="20" cy="20" r="16"
                  stroke="#e8dfa0"
                  stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="RING_CIRC"
                  :stroke-dashoffset="RING_CIRC - (stabilityPct / 100) * RING_CIRC"
                  transform="rotate(-90 20 20)"
                />
              </svg>
            </div>

            <!-- Auto-capture prompt -->
            <div v-if="stabilityPct >= 100 && !isFrozen" class="ps-autocapture-toast">
              📷 Hold still…
            </div>

            <!-- Flash effect -->
            <div v-if="showFlash" class="ps-flash"/>
          </template>

          <!-- Result: show captured frame with bbox -->
          <template v-if="phase === 'result'">
            <canvas ref="resultCanvasRef" class="ps-result-canvas"/>
            <div class="ps-result-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Scan complete
            </div>
          </template>
        </div>

        <!-- ── Bottom panel ── -->
        <div class="ps-panel">

          <!-- Hint -->
          <p v-if="HINTS[phase]" class="ps-hint">{{ HINTS[phase] }}</p>

          <!-- Detection info strip -->
          <div v-if="(phase === 'top' || phase === 'side') && detectedLabel" class="ps-det-strip">
            <span class="ps-det-label">{{ detectedLabel }}</span>
            <span class="ps-det-conf">{{ detectedConf }}% match</span>
            <span class="ps-det-dot" :class="{ active: stabilityPct >= 50 }"/>
          </div>

          <!-- Top / Side capture button -->
          <button
            v-if="phase === 'top' || phase === 'side'"
            class="ps-btn-capture"
            @click="phase === 'top' ? captureTop() : captureSide()"
            :disabled="isBusy"
          >
            <span v-if="isBusy" class="ps-spinner"/>
            <template v-else>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              </svg>
              {{ phase === 'top' ? 'Capture top view' : 'Capture side view' }}
            </template>
          </button>

          <!-- Result: editable dimensions + confirm -->
          <template v-if="phase === 'result'">
            <div class="ps-dims-grid">
              <div v-for="f in DIM_FIELDS" :key="f.key" class="ps-dim-cell">
                <label class="ps-dim-lbl">{{ f.label }}</label>
                <div class="ps-dim-row">
                  <input
                    v-model.number="result[f.key]"
                    type="number"
                    :min="f.min" :max="f.max" :step="f.step"
                    class="ps-dim-input"
                  />
                  <span class="ps-dim-unit">{{ f.unit }}</span>
                </div>
              </div>
            </div>

            <div class="ps-shape-row">
              <span class="ps-shape-lbl">Shape</span>
              <div class="ps-shape-chips">
                <button
                  v-for="s in SHAPES"
                  :key="s.id"
                  class="ps-shape-chip"
                  :class="{ on: result.shape === s.id }"
                  @click="result.shape = s.id"
                >
                  {{ s.emoji }}&nbsp;{{ s.label }}
                </button>
              </div>
            </div>

            <div class="ps-result-actions">
              <button class="ps-btn-retake" @click="restart">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                </svg>
                Retake
              </button>
              <button class="ps-btn-confirm" @click="confirm">
                Use this scan ✓
              </button>
            </div>
          </template>

        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, shallowRef, onMounted, onUnmounted, nextTick } from 'vue'

// ─── emits ───────────────────────────────────────────────────────────────────
const emit = defineEmits(['close', 'confirm'])

// ─── constants ───────────────────────────────────────────────────────────────
const GUIDE_FRAC    = 0.76   // guide frame = 76% of viewport shorter side
const GUIDE_CM      = 26     // real-world size of guide at arm's length (~30 cm)
const RING_CIRC     = 2 * Math.PI * 16   // circumference for r=16 ring
const STAB_FRAMES   = 8      // frames needed to consider detection stable
const DETECT_MS     = 280    // interval between TF detections (ms)
const AUTO_CAPTURE_MS = 1400 // ms of stability before auto-capture

const STEP_LABELS = {
  loading: 'Starting scanner…',
  error:   'Camera error',
  top:     'Top-down scan',
  side:    'Side scan',
  result:  'Confirm dimensions',
}

const HINTS = {
  top:    'Place item on a white/light surface. Hold phone flat ~30 cm above. Fill the guide.',
  side:   'Flip item to show its side. Hold phone ~30 cm away, level with the item.',
  result: 'Adjust any value if needed, then tap confirm.',
}

const SHAPES = [
  { id: 'box',      emoji: '📦', label: 'Box'       },
  { id: 'cylinder', emoji: '🥫', label: 'Cylinder'  },
  { id: 'bag',      emoji: '👜', label: 'Bag / Soft' },
  { id: 'envelope', emoji: '✉️',  label: 'Envelope'  },
  { id: 'irregular',emoji: '🪨', label: 'Irregular'  },
]

const DIM_FIELDS = [
  { key: 'length', label: 'Length', unit: 'cm', min: 1, max: 300, step: 1 },
  { key: 'width',  label: 'Width',  unit: 'cm', min: 1, max: 300, step: 1 },
  { key: 'height', label: 'Height', unit: 'cm', min: 1, max: 300, step: 1 },
  { key: 'weight', label: 'Est. weight', unit: 'kg', min: 0.1, max: 100, step: 0.1 },
]

// COCO-SSD class → shape mapping
const COCO_SHAPES = {
  suitcase: 'bag', backpack: 'bag', handbag: 'bag',
  bottle: 'cylinder', cup: 'cylinder', vase: 'cylinder',
  book: 'envelope', laptop: 'envelope', 'cell phone': 'envelope', keyboard: 'envelope',
  tv: 'box', 'remote': 'box', mouse: 'box',
}

// ─── reactive state ───────────────────────────────────────────────────────────
const phase      = ref('loading')   // loading | error | top | side | result
const isBusy     = ref(false)
const isFrozen   = ref(false)
const showFlash  = ref(false)

// Error state
const errorMsg   = ref('Camera access denied')
const errorSub   = ref('Allow camera in browser settings, then try again.')

// Model loading
const loadPct    = ref(0)
const loadNote   = ref('Preparing camera…')

// TF.js state
const tfModel    = shallowRef(null)
const tfDetecting = ref(false)
const detectedLabel = ref('')
const detectedConf  = ref(0)

// Bounding box (screen-space pixels)
const bboxStyle  = ref(null)

// Stability tracking
const stabilityHistory = ref([])  // last N bboxes
const stabilityPct     = ref(0)
let   stableTimer      = null
let   detectInterval   = null
let   autoCaptureFired = false

// Media stream
let stream = null

// DOM refs
const viewportRef    = ref(null)
const videoRef       = ref(null)
const processRef     = ref(null)
const resultCanvasRef = ref(null)

// Scan results
const topDims  = ref(null)
const result   = ref({ length: 0, width: 0, height: 0, weight: 0, shape: 'box' })

// ─── computed ─────────────────────────────────────────────────────────────────
const phaseIndex = computed(() => ({ top: 1, side: 2, result: 3 }[phase.value] ?? 0))

// ─── init ─────────────────────────────────────────────────────────────────────
async function initScanner() {
  phase.value   = 'loading'
  loadPct.value = 0
  loadNote.value = 'Requesting camera…'

  // 1. Start camera
  try {
    stream = await startCamera()
  } catch (e) {
    phase.value  = 'error'
    errorMsg.value = cameraErrorMsg(e)
    errorSub.value = cameraErrorSub(e)
    return
  }

  loadPct.value  = 30
  loadNote.value = 'Camera ready. Loading AI model…'

  // 2. Attach stream to video
  await nextTick()
  videoRef.value.srcObject = stream
  await new Promise(r => videoRef.value.addEventListener('loadeddata', r, { once: true }))

  loadPct.value  = 50
  loadNote.value = 'Loading object detection model…'

  // 3. Load TF.js COCO-SSD (dynamic — doesn't bloat initial bundle)
  try {
    const [tf, cocoSsd] = await Promise.all([
      import('@tensorflow/tfjs'),
      import('@tensorflow-models/coco-ssd'),
    ])
    loadPct.value  = 75
    loadNote.value = 'Initialising model…'
    await tf.ready()
    tfModel.value  = await cocoSsd.load({ base: 'lite_mobilenet_v2' })
    loadPct.value  = 100
  } catch {
    // TF.js failed — that's OK, we fall back to canvas analysis
    tfModel.value  = null
    loadPct.value  = 100
  }

  // Small delay so user sees 100%
  await new Promise(r => setTimeout(r, 300))
  phase.value = 'top'
  startDetectionLoop()
}

async function startCamera() {
  // Try environment (rear) camera first; fall back to any video
  const constraints = [
    { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
    { video: { facingMode: 'environment' }, audio: false },
    { video: true, audio: false },
  ]
  let lastErr
  for (const c of constraints) {
    try {
      return await navigator.mediaDevices.getUserMedia(c)
    } catch (e) {
      lastErr = e
      if (e.name === 'NotAllowedError') throw e   // user denied — don't retry
    }
  }
  throw lastErr
}

function cameraErrorMsg(e) {
  if (e?.name === 'NotAllowedError')    return 'Camera permission denied'
  if (e?.name === 'NotFoundError')      return 'No camera found'
  if (e?.name === 'NotReadableError')   return 'Camera already in use'
  if (e?.name === 'OverconstrainedError') return 'Camera constraints not met'
  return 'Could not start camera'
}
function cameraErrorSub(e) {
  if (e?.name === 'NotAllowedError')
    return 'Open browser settings → Site settings → Camera → Allow, then try again.'
  if (e?.name === 'NotFoundError')
    return 'This device has no accessible camera.'
  return 'Try closing other apps using the camera, then reload.'
}

// ─── detection loop ───────────────────────────────────────────────────────────
function startDetectionLoop() {
  stopDetectionLoop()
  autoCaptureFired = false

  if (tfModel.value) {
    detectInterval = setInterval(runTFDetection, DETECT_MS)
  } else {
    detectInterval = setInterval(runCanvasDetection, DETECT_MS)
  }
}

function stopDetectionLoop() {
  if (detectInterval) { clearInterval(detectInterval); detectInterval = null }
  if (stableTimer)    { clearTimeout(stableTimer);     stableTimer = null    }
  stabilityPct.value     = 0
  stabilityHistory.value = []
}

async function runTFDetection() {
  const video = videoRef.value
  if (!video || video.readyState < 2 || isFrozen.value) return
  tfDetecting.value = true

  try {
    const preds = await tfModel.value.detect(video)

    // Pick the largest detected object
    const best = preds
      .filter(p => p.score > 0.4)
      .sort((a, b) => (b.bbox[2] * b.bbox[3]) - (a.bbox[2] * a.bbox[3]))[0]

    if (best) {
      detectedLabel.value = best['class']
      detectedConf.value  = Math.round(best.score * 100)
      bboxStyle.value     = tfBboxToStyle(best.bbox, video)
      updateStability(best.bbox, best['class'])
    } else {
      // TF found nothing — try canvas fallback for bbox
      runCanvasDetection()
    }
  } catch {
    // silently ignore detection errors
  } finally {
    tfDetecting.value = false
  }
}

function runCanvasDetection() {
  const video = videoRef.value
  const canvas = processRef.value
  if (!video || video.readyState < 2 || isFrozen.value || !canvas) return

  const res = analyzeFrame(video, canvas)
  if (res) {
    bboxStyle.value = canvasBboxToStyle(res.bboxNorm)
    if (!tfModel.value) {
      detectedLabel.value = 'object'
      detectedConf.value  = 0
    }
    updateStability(res.rawBbox, detectedLabel.value)
  } else {
    bboxStyle.value = null
    resetStability()
  }
}

// ─── stability ────────────────────────────────────────────────────────────────
function updateStability(bbox, label) {
  const h = stabilityHistory.value
  h.push({ bbox, label, t: Date.now() })
  if (h.length > STAB_FRAMES) h.shift()

  if (h.length < STAB_FRAMES) {
    stabilityPct.value = (h.length / STAB_FRAMES) * 60
    return
  }

  // Check bbox overlap between first and last
  const first = h[0].bbox
  const last  = h[h.length - 1].bbox
  const iou   = bboxIoU(first, last)
  const sameClass = h.every(p => p.label === h[0].label)

  if (iou > 0.75 && sameClass) {
    const elapsed = Date.now() - h[0].t
    stabilityPct.value = Math.min(100, (elapsed / AUTO_CAPTURE_MS) * 100)

    // Auto-capture when stable long enough
    if (stabilityPct.value >= 100 && !autoCaptureFired && !isFrozen.value) {
      autoCaptureFired = true
      stableTimer = setTimeout(() => {
        if (phase.value === 'top') captureTop()
        else if (phase.value === 'side') captureSide()
      }, 200)
    }
  } else {
    resetStability()
  }
}

function resetStability() {
  stabilityPct.value     = 0
  stabilityHistory.value = []
  autoCaptureFired       = false
  if (stableTimer) { clearTimeout(stableTimer); stableTimer = null }
}

// ─── capture ──────────────────────────────────────────────────────────────────
async function captureTop() {
  if (isBusy.value) return
  isBusy.value   = true
  isFrozen.value = true
  stopDetectionLoop()
  triggerFlash()

  await new Promise(r => setTimeout(r, 150))

  const video  = videoRef.value
  const canvas = processRef.value
  const res    = analyzeFrame(video, canvas)

  if (!res) {
    // Nothing detected — use the entire guide as fallback
    const s = guidePixelSide(video)
    topDims.value = { dimA: GUIDE_CM, dimB: GUIDE_CM, shape: 'box' }
  } else {
    const cocoShape = COCO_SHAPES[detectedLabel.value?.toLowerCase()] ?? null
    topDims.value = {
      dimA:  res.dimA,
      dimB:  res.dimB,
      shape: cocoShape ?? guessShapeFromDims(res.dimA, res.dimB, res.solidity),
    }
  }

  bboxStyle.value = null
  isFrozen.value  = false
  isBusy.value    = false
  autoCaptureFired = false
  phase.value     = 'side'
  startDetectionLoop()
}

async function captureSide() {
  if (isBusy.value) return
  isBusy.value   = true
  isFrozen.value = true
  stopDetectionLoop()
  triggerFlash()

  await new Promise(r => setTimeout(r, 150))

  const video  = videoRef.value
  const canvas = processRef.value
  const res    = analyzeFrame(video, canvas)

  const height = res
    ? Math.min(res.dimA, res.dimB)
    : Math.max(1, Math.round(Math.min(topDims.value.dimA, topDims.value.dimB) / 3))

  // Build final result
  const l = topDims.value.dimA
  const w = topDims.value.dimB
  const h = height

  result.value = {
    length: l,
    width:  w,
    height: h,
    weight: estimateWeight(l, w, h),
    shape:  topDims.value.shape,
  }

  // Draw result frame to result canvas
  await nextTick()
  drawResultCanvas(video, canvas, res)

  isFrozen.value = false
  isBusy.value   = false
  phase.value    = 'result'
}

function drawResultCanvas(video, workCanvas, res) {
  const rc = resultCanvasRef.value
  if (!rc) return
  rc.width  = workCanvas.width  || video.videoWidth
  rc.height = workCanvas.height || video.videoHeight
  const ctx = rc.getContext('2d')
  ctx.drawImage(workCanvas, 0, 0)

  if (res) {
    // Draw bbox on result canvas
    const gx = (rc.width  - guidePixelSide(video)) / 2
    const gy = (rc.height - guidePixelSide(video)) / 2
    const gs = guidePixelSide(video)
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth   = 3
    ctx.strokeRect(
      gx + res.bboxNorm.x * gs,
      gy + res.bboxNorm.y * gs,
      res.bboxNorm.w * gs,
      res.bboxNorm.h * gs,
    )
  }
}

// ─── image analysis (canvas-based, no ML required) ────────────────────────────
function analyzeFrame(video, canvas) {
  const vW = video.videoWidth
  const vH = video.videoHeight
  if (!vW || !vH) return null

  canvas.width  = vW
  canvas.height = vH
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(video, 0, 0)

  const gs = guidePixelSide(video)
  const gx = Math.round((vW - gs) / 2)
  const gy = Math.round((vH - gs) / 2)

  const { data } = ctx.getImageData(gx, gy, gs, gs)

  let minX = gs, maxX = 0, minY = gs, maxY = 0
  let itemPx = 0
  const THRESH = 178  // pixels brighter than this = background

  for (let i = 0; i < data.length; i += 4) {
    const luma = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    if (luma < THRESH) {
      const px = (i >> 2) % gs
      const py = (i >> 2) / gs | 0
      if (px < minX) minX = px
      if (px > maxX) maxX = px
      if (py < minY) minY = py
      if (py > maxY) maxY = py
      itemPx++
    }
  }

  if (itemPx < 600 || maxX <= minX || maxY <= minY) return null

  const pad = 8
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad)
  maxX = Math.min(gs, maxX + pad); maxY = Math.min(gs, maxY + pad)

  const scale    = GUIDE_CM / gs
  const dimA     = Math.max(1, Math.round((maxX - minX) * scale))
  const dimB     = Math.max(1, Math.round((maxY - minY) * scale))
  const solidity = itemPx / ((maxX - minX) * (maxY - minY))

  return {
    dimA, dimB, solidity,
    rawBbox:  [gx + minX, gy + minY, maxX - minX, maxY - minY],
    bboxNorm: { x: minX / gs, y: minY / gs, w: (maxX - minX) / gs, h: (maxY - minY) / gs },
  }
}

function guidePixelSide(video) {
  return Math.round(Math.min(video.videoWidth, video.videoHeight) * GUIDE_FRAC)
}

// ─── coordinate conversion helpers ───────────────────────────────────────────
function tfBboxToStyle(bbox, video) {
  // bbox = [x, y, w, h] in video pixel coords
  const vp = viewportRef.value
  if (!vp) return null
  const vW = video.videoWidth, vH = video.videoHeight
  const cW = vp.clientWidth,   cH = vp.clientHeight

  // object-fit: cover mapping
  const scale = Math.max(cW / vW, cH / vH)
  const rW    = vW * scale
  const rH    = vH * scale
  const oX    = (rW - cW) / 2
  const oY    = (rH - cH) / 2

  return {
    left:   (bbox[0] * scale - oX) + 'px',
    top:    (bbox[1] * scale - oY) + 'px',
    width:  (bbox[2] * scale) + 'px',
    height: (bbox[3] * scale) + 'px',
  }
}

function canvasBboxToStyle(norm) {
  // norm = { x, y, w, h } relative to guide (0..1)
  const vp = viewportRef.value
  if (!vp) return null
  const cW = vp.clientWidth
  const cH = vp.clientHeight
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

// ─── math helpers ─────────────────────────────────────────────────────────────
function bboxIoU(a, b) {
  const ax2 = a[0] + a[2], ay2 = a[1] + a[3]
  const bx2 = b[0] + b[2], by2 = b[1] + b[3]
  const ix1 = Math.max(a[0], b[0]), iy1 = Math.max(a[1], b[1])
  const ix2 = Math.min(ax2, bx2),   iy2 = Math.min(ay2, by2)
  if (ix2 <= ix1 || iy2 <= iy1) return 0
  const inter = (ix2 - ix1) * (iy2 - iy1)
  const union  = a[2] * a[3] + b[2] * b[3] - inter
  return inter / union
}

function guessShapeFromDims(a, b, solidity) {
  if (a < 3 || b < 3) return 'envelope'
  if (solidity < 0.60) return 'bag'
  const ratio = Math.max(a, b) / Math.min(a, b)
  if (ratio < 1.3 && solidity > 0.78) return 'cylinder' // roughly square + high fill
  return 'box'
}

function estimateWeight(l, w, h) {
  // Volume × 0.30 g/cm³ (medium-density goods) → kg
  return Math.max(0.1, Math.round((l * w * h * 0.00030) * 10) / 10)
}

// ─── UX helpers ───────────────────────────────────────────────────────────────
function triggerFlash() {
  showFlash.value = true
  setTimeout(() => { showFlash.value = false }, 220)
}

function restart() {
  stopDetectionLoop()
  bboxStyle.value    = null
  detectedLabel.value = ''
  topDims.value      = null
  result.value       = { length: 0, width: 0, height: 0, weight: 0, shape: 'box' }
  phase.value        = 'top'
  autoCaptureFired   = false
  startDetectionLoop()
}

function confirm() {
  stopCamera()
  emit('confirm', { ...result.value })
}

function handleClose() {
  stopCamera()
  emit('close')
}

function stopCamera() {
  stopDetectionLoop()
  stream?.getTracks().forEach(t => t.stop())
  stream = null
}

// ─── lifecycle ────────────────────────────────────────────────────────────────
onMounted(initScanner)
onUnmounted(stopCamera)
</script>

<style scoped>
/* ── Shell ── */
.ps {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0, 0, 0, 0.9);
  display: flex; align-items: flex-end; justify-content: center;
  font-family: 'Montserrat', sans-serif;
}
.ps-sheet {
  width: 100%; max-width: 540px;
  background: #0d0d0d;
  border-radius: 24px 24px 0 0;
  display: flex; flex-direction: column;
  max-height: 97dvh; overflow: hidden;
}

/* ── Header ── */
.ps-hdr {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.ps-hdr-close {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.07); border: none; border-radius: 50%;
  color: rgba(255,255,255,0.7); cursor: pointer; flex-shrink: 0;
  transition: background 0.15s;
}
.ps-hdr-close:hover { background: rgba(255,255,255,0.14); }
.ps-hdr-center {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.ps-hdr-title {
  font-size: 13px; font-weight: 800; color: #fff; letter-spacing: 0.01em;
}
.ps-step-dots { display: flex; gap: 6px; }
.ps-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,0.18); transition: background 0.25s;
}
.ps-dot.active { background: #e8dfa0; }
.ps-dot.done   { background: #22c55e; }

/* ── Viewport ── */
.ps-viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #000;
  overflow: hidden;
  flex-shrink: 0;
}

/* ── States ── */
.ps-state-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 10px; padding: 24px;
}
.ps-state-title {
  font-size: 14px; font-weight: 800; color: #fff; text-align: center; margin: 0;
}
.ps-state-sub {
  font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.45);
  text-align: center; line-height: 1.5; margin: 0;
}
.ps-loading-ring {
  width: 44px; height: 44px;
  border: 3.5px solid rgba(255,255,255,0.12);
  border-top-color: #e8dfa0;
  border-radius: 50%;
  animation: ps-spin 0.8s linear infinite;
}
.ps-load-bar {
  width: 160px; height: 3px;
  background: rgba(255,255,255,0.1);
  border-radius: 99px; overflow: hidden; margin-top: 8px;
}
.ps-load-fill {
  height: 100%; background: #e8dfa0; border-radius: 99px;
  transition: width 0.4s ease;
}
.ps-btn-retry-sm {
  margin-top: 8px;
  background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.2);
  border-radius: 8px; padding: 8px 18px;
  font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700;
  color: #fff; cursor: pointer; transition: background 0.15s;
}
.ps-btn-retry-sm:hover { background: rgba(255,255,255,0.18); }

/* ── Camera video ── */
.ps-video {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.ps-video--frozen { filter: brightness(0.85); }
.ps-hidden-canvas { display: none; }

/* ── Guide overlay ── */
.ps-guide {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
}
.ps-guide-corners {
  width: 76%; aspect-ratio: 1/1;
  color: rgba(232,223,160,0.85);
  transition: color 0.25s;
  filter: drop-shadow(0 0 6px rgba(232,223,160,0.35));
}
.ps-guide--hit .ps-guide-corners { color: #22c55e; }

.ps-scanline {
  position: absolute;
  left: 12%; right: 12%;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #e8dfa0 30%, #e8dfa0 70%, transparent 100%);
  animation: ps-scan 2.4s ease-in-out infinite;
  pointer-events: none;
}
@keyframes ps-scan {
  0%,100% { top: 12%; opacity: 0.3; }
  50%      { top: 84%; opacity: 1;   }
}

.ps-phase-badge {
  position: absolute; bottom: 10px;
  background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.15);
  border-radius: 99px; padding: 4px 12px;
  font-size: 9px; font-weight: 900; letter-spacing: 0.16em; color: #e8dfa0;
}

/* ── Bounding box overlay ── */
.ps-bbox {
  position: absolute;
  border: 2px solid rgba(232,223,160,0.8);
  border-radius: 6px;
  box-shadow: 0 0 0 1px rgba(232,223,160,0.2), inset 0 0 12px rgba(232,223,160,0.05);
  pointer-events: none;
  transition: left 0.12s, top 0.12s, width 0.12s, height 0.12s;
}
.ps-bbox--stable {
  border-color: #22c55e;
  box-shadow: 0 0 0 1px rgba(34,197,94,0.25), inset 0 0 12px rgba(34,197,94,0.08);
}
.ps-bbox-label {
  position: absolute; top: -22px; left: 0;
  background: rgba(0,0,0,0.7); border-radius: 4px; padding: 2px 8px;
  font-size: 10px; font-weight: 800; color: #e8dfa0; letter-spacing: 0.06em;
  text-transform: capitalize; white-space: nowrap;
}
.ps-stab-ring {
  position: absolute; bottom: -20px; right: -20px;
  width: 40px; height: 40px;
}

.ps-autocapture-toast {
  position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.75); border: 1.5px solid #22c55e;
  border-radius: 99px; padding: 6px 14px;
  font-size: 12px; font-weight: 800; color: #22c55e;
  white-space: nowrap; letter-spacing: 0.02em;
  animation: ps-fade-in 0.2s ease;
}

/* ── Flash ── */
.ps-flash {
  position: absolute; inset: 0;
  background: rgba(255,255,255,0.65);
  animation: ps-flash 0.22s ease-out forwards;
  pointer-events: none;
}
@keyframes ps-flash {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}

/* ── Result canvas ── */
.ps-result-canvas {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.ps-result-badge {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 8px;
  background: rgba(0,0,0,0.78); border: 1.5px solid #22c55e;
  border-radius: 99px; padding: 7px 16px;
  font-size: 12px; font-weight: 800; color: #22c55e; white-space: nowrap;
}

/* ── Bottom panel ── */
.ps-panel {
  padding: 14px 16px max(20px, env(safe-area-inset-bottom, 20px));
  background: #0d0d0d;
  display: flex; flex-direction: column; gap: 10px;
  flex-shrink: 0;
}
.ps-hint {
  font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.45);
  line-height: 1.5; text-align: center; margin: 0;
}

/* Detection strip */
.ps-det-strip {
  display: flex; align-items: center; gap: 8px; justify-content: center;
}
.ps-det-label {
  font-size: 11px; font-weight: 800; color: #e8dfa0; text-transform: capitalize;
}
.ps-det-conf { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.38); }
.ps-det-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,0.2); transition: background 0.3s;
  margin-left: 2px;
}
.ps-det-dot.active { background: #22c55e; }

/* Capture button */
.ps-btn-capture {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  background: #e8dfa0; color: #111;
  border: none; border-radius: 14px; padding: 16px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 900;
  cursor: pointer; letter-spacing: 0.02em;
  transition: background 0.15s, opacity 0.15s;
}
.ps-btn-capture:hover:not(:disabled) { background: #fff; }
.ps-btn-capture:disabled { opacity: 0.45; cursor: not-allowed; }
.ps-spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(17,17,17,0.25);
  border-top-color: #111;
  border-radius: 50%;
  animation: ps-spin 0.7s linear infinite;
}

/* Dims grid */
.ps-dims-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}
.ps-dim-cell { display: flex; flex-direction: column; gap: 4px; }
.ps-dim-lbl {
  font-size: 9px; font-weight: 800; letter-spacing: 0.12em;
  text-transform: uppercase; color: rgba(255,255,255,0.35);
}
.ps-dim-row {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 9px 12px;
}
.ps-dim-input {
  flex: 1; min-width: 0; background: none; border: none; outline: none;
  font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 900;
  color: #e8dfa0;
}
.ps-dim-input::-webkit-outer-spin-button,
.ps-dim-input::-webkit-inner-spin-button { -webkit-appearance: none; }
.ps-dim-unit {
  font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.35);
}

/* Shape chips */
.ps-shape-row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.ps-shape-lbl {
  font-size: 9px; font-weight: 800; letter-spacing: 0.12em;
  text-transform: uppercase; color: rgba(255,255,255,0.35);
  white-space: nowrap; flex-shrink: 0;
}
.ps-shape-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.ps-shape-chip {
  background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 99px; padding: 5px 12px;
  font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,0.5); cursor: pointer;
  transition: all 0.15s; white-space: nowrap;
}
.ps-shape-chip.on {
  background: rgba(232,223,160,0.12); border-color: #e8dfa0; color: #e8dfa0;
}

/* Result actions */
.ps-result-actions { display: flex; gap: 10px; }
.ps-btn-retake {
  display: flex; align-items: center; gap: 6px; white-space: nowrap;
  background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 12px; padding: 13px 16px;
  font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700;
  color: rgba(255,255,255,0.55); cursor: pointer; transition: background 0.15s;
}
.ps-btn-retake:hover { background: rgba(255,255,255,0.1); }
.ps-btn-confirm {
  flex: 1; background: #2230a0; color: #e8dfa0;
  border: none; border-radius: 12px; padding: 14px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 900;
  cursor: pointer; transition: background 0.15s;
}
.ps-btn-confirm:hover { background: #1a258a; }

/* ── Animations ── */
@keyframes ps-spin    { to { transform: rotate(360deg); } }
@keyframes ps-fade-in { from { opacity: 0; transform: translateX(-50%) translateY(-4px); } }

/* ── Responsive ── */
@media (min-width: 540px) {
  .ps { align-items: center; }
  .ps-sheet { border-radius: 24px; max-height: 92dvh; }
}
</style>
