<template>
  <teleport to="body">
    <div class="ps" role="dialog" aria-modal="true" @keydown.esc="handleClose">
      <div class="ps-shell">
        <header class="ps-header">
          <button class="ps-close" type="button" @click="handleClose" aria-label="Close">x</button>

          <div class="ps-title-wrap">
            <span class="ps-kicker">{{ phaseLabel }}</span>
            <strong>{{ TITLES[phase] }}</strong>
          </div>

          <div class="ps-step" aria-hidden="true">
            <span v-for="i in 4" :key="i" :class="{ on: stepIndex >= i, done: stepIndex > i }" />
          </div>
        </header>

        <main class="ps-view" ref="viewportRef">
          <template v-if="phase === 'loading'">
            <div class="ps-state">
              <div class="ps-orbit"><i /></div>
              <strong>{{ loadMsg }}</strong>
              <span>Keep the card, item, and surface well lit.</span>
            </div>
          </template>

          <template v-else-if="phase === 'error'">
            <div class="ps-state">
              <div class="ps-error">!</div>
              <strong>{{ errTitle }}</strong>
              <span>{{ errSub }}</span>
              <button class="ps-soft-btn" type="button" @click="init">Try again</button>
            </div>
          </template>

          <template v-else-if="isCameraPhase">
            <video ref="videoRef" class="ps-video" autoplay playsinline muted :class="{ frozen }" />
            <canvas ref="workRef" class="ps-hidden" />

            <div class="ps-vignette" />

            <div class="ps-guide" :class="{ ready: readyToCapture }">
              <div v-if="phase === 'calibrate'" class="ps-card-ghost" :class="{ ready: isCardLike }">
                <span>{{ isCardLike ? 'Card detected' : 'Credit card' }}</span>
              </div>

              <svg class="ps-corners" viewBox="0 0 200 200" fill="none">
                <path d="M10 48 L10 10 L48 10" />
                <path d="M152 10 L190 10 L190 48" />
                <path d="M10 152 L10 190 L48 190" />
                <path d="M152 190 L190 190 L190 152" />
              </svg>

              <div v-if="!bboxStyle" class="ps-scanline" />
            </div>

            <div v-if="bboxStyle && !frozen" class="ps-box" :class="{ ready: readyToCapture }" :style="bboxStyle">
              <svg class="ps-progress" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" />
                <circle cx="22" cy="22" r="18" :style="progressRingStyle" />
              </svg>
            </div>

            <div class="ps-live-pill" :class="{ good: readyToCapture }" aria-live="polite">
              <span>{{ scanMessage }}</span>
              <strong>{{ confidence }}%</strong>
            </div>

            <div v-if="flash" class="ps-flash" />
          </template>

          <template v-else-if="phase === 'result'">
            <img v-if="sidePreview" class="ps-result-img" :src="sidePreview" alt="" />
            <div class="ps-result-shade" />
            <div class="ps-result-mark">Scan complete</div>
          </template>
        </main>

        <section class="ps-panel">
          <p class="ps-hint">{{ HINTS[phase] }}</p>

          <template v-if="isCameraPhase">
            <div v-if="pxPerCm" class="ps-calibration">
              <span>Scale locked</span>
              <strong>{{ pxPerCm.toFixed(1) }} px/cm</strong>
            </div>

            <div class="ps-meter">
              <div :style="{ width: confidence + '%' }" :class="{ good: readyToCapture }" />
            </div>

            <button class="ps-main-btn" type="button" :disabled="busy" @click="captureCurrent">
              <span v-if="busy" class="ps-spinner" />
              <span v-else>{{ captureLabel }}</span>
            </button>
          </template>

          <template v-if="phase === 'result'">
            <div class="ps-previews">
              <div>
                <img v-if="topPreview" :src="topPreview" alt="" />
                <span>Top</span>
              </div>
              <div>
                <img v-if="sidePreview" :src="sidePreview" alt="" />
                <span>Side</span>
              </div>
            </div>

            <div class="ps-dims">
              <label v-for="f in FIELDS" :key="f.key">
                <span>{{ f.lbl }}</span>
                <div>
                  <input v-model.number="res[f.key]" type="number" :min="f.min" :max="f.max" :step="f.step" />
                  <em>{{ f.unit }}</em>
                </div>
              </label>
            </div>

            <div class="ps-shapes">
              <button
                v-for="s in SHAPES"
                :key="s.id"
                type="button"
                :class="{ on: res.shape === s.id }"
                @click="res.shape = s.id"
              >
                {{ s.label }}
              </button>
            </div>

            <div class="ps-actions">
              <button class="ps-soft-btn" type="button" @click="retakeItem">Retake item</button>
              <button class="ps-main-btn" type="button" @click="confirm">Use this scan</button>
            </div>
          </template>
        </section>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

const emit = defineEmits(['close', 'confirm'])

const CONFIG = {
  cardWidthCm: 8.56,
  cardHeightCm: 5.398,
  cardAspect: 1.586,
  guideRatio: 0.76,

  detectMs: 80,
  stableFrames: 6,
  calibrationStableFrames: 5,

  stableIou: 0.62,
  autoMs: 720,
  calibrationAutoMs: 520,

  minContrast: 18,
  minEdge: 32,
  minHits: 160,

  smoothing: 0.24,
  confidenceSmoothing: 0.28,

  calibrationMinConfidence: 45,
  captureMinConfidence: 52,

  cardAspectMin: 1.42,
  cardAspectMax: 1.78,
  maxScaleJitter: 0.08,
}

const TITLES = {
  loading: 'Starting camera',
  error: 'Camera issue',
  calibrate: 'Calibrate with a card',
  top: 'Scan top view',
  side: 'Scan side view',
  result: 'Review dimensions',
}

const HINTS = {
  loading: 'Allow camera access when prompted.',
  error: 'Camera could not start.',
  calibrate: 'Place a credit card flat inside the frame. Use a plain surface and avoid glare.',
  top: 'Remove the card. Place the item flat and keep the same camera distance.',
  side: 'Turn the item sideways. Keep the same camera distance used for the top scan.',
  result: 'These are estimates from your card scale. Adjust anything before confirming.',
}

const FIELDS = [
  { key: 'length', lbl: 'Length', unit: 'cm', min: 1, max: 300, step: 1 },
  { key: 'width', lbl: 'Width', unit: 'cm', min: 1, max: 300, step: 1 },
  { key: 'height', lbl: 'Height', unit: 'cm', min: 1, max: 300, step: 1 },
  { key: 'weight', lbl: 'Weight', unit: 'kg', min: 0.1, max: 100, step: 0.1 },
]

const SHAPES = [
  { id: 'box', label: 'Box' },
  { id: 'cylinder', label: 'Cylinder' },
  { id: 'bag', label: 'Bag / soft' },
  { id: 'envelope', label: 'Envelope' },
  { id: 'irregular', label: 'Irregular' },
]

const phase = ref('loading')
const busy = ref(false)
const frozen = ref(false)
const flash = ref(false)
const loadMsg = ref('Requesting camera...')
const errTitle = ref('')
const errSub = ref('')

const viewportRef = ref(null)
const videoRef = ref(null)
const workRef = ref(null)

const bboxStyle = ref(null)
const confidence = ref(0)
const stablePct = ref(0)
const scanMessage = ref('Looking for object...')
const pxPerCm = ref(null)
const cardRatio = ref(0)
const scaleJitter = ref(1)

const topDims = ref(null)
const topPreview = ref('')
const sidePreview = ref('')
const res = ref({ length: 0, width: 0, height: 0, weight: 0.1, shape: 'box' })

let mediaStream = null
let detectTimer = null
let autoTimer = null
let autoFired = false
let stableHistory = []
let scaleHistory = []
let lastGood = null
let lastBox = null
let lastFrame = ''

const isCameraPhase = computed(() => ['calibrate', 'top', 'side'].includes(phase.value))
const stepIndex = computed(() => ({ calibrate: 1, top: 2, side: 3, result: 4 }[phase.value] || 0))

const phaseLabel = computed(() => {
  if (phase.value === 'calibrate') return 'Step 1 of 4'
  if (phase.value === 'top') return 'Step 2 of 4'
  if (phase.value === 'side') return 'Step 3 of 4'
  if (phase.value === 'result') return 'Step 4 of 4'
  return 'Scanner'
})

const captureLabel = computed(() => {
  if (phase.value === 'calibrate') return 'Lock credit card scale'
  if (phase.value === 'top') return 'Capture top view'
  return 'Capture side view'
})

const isCardLike = computed(() => {
  if (phase.value !== 'calibrate') return true
  return cardRatio.value >= CONFIG.cardAspectMin && cardRatio.value <= CONFIG.cardAspectMax
})

const readyToCapture = computed(() => {
  const minConfidence = phase.value === 'calibrate'
    ? CONFIG.calibrationMinConfidence
    : CONFIG.captureMinConfidence

  const scaleIsStable = phase.value !== 'calibrate'
    || (scaleHistory.length >= CONFIG.calibrationStableFrames && scaleJitter.value <= CONFIG.maxScaleJitter)

  return stablePct.value >= 100 && confidence.value >= minConfidence && isCardLike.value && scaleIsStable
})

const progressRingStyle = computed(() => {
  const c = 2 * Math.PI * 18
  return { strokeDasharray: c, strokeDashoffset: c - (stablePct.value / 100) * c }
})

onMounted(init)

onUnmounted(() => {
  stopLoop()
  stopStream()
})

async function init() {
  stopLoop()
  stopStream()
  resetScan()

  phase.value = 'loading'
  loadMsg.value = 'Requesting camera...'

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera is not available in this browser.')
    }

    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })

    phase.value = 'calibrate'
    await nextTick()

    const video = videoRef.value
    if (!video) throw new Error('Video element was not created.')

    video.srcObject = mediaStream
    video.setAttribute('playsinline', 'true')

    loadMsg.value = 'Starting preview...'
    await video.play()
    await waitForVideo(video)

    startLoop()
  } catch (e) {
    console.error(e)
    stopStream()
    errTitle.value = cameraTitle(e)
    errSub.value = cameraSub(e)
    phase.value = 'error'
  }
}

function waitForVideo(video) {
  return new Promise((resolve, reject) => {
    const started = Date.now()

    const tick = () => {
      if (video.videoWidth && video.videoHeight) return resolve()
      if (Date.now() - started > 6000) return reject(new Error('No camera frames received.'))
      requestAnimationFrame(tick)
    }

    tick()
  })
}

function startLoop() {
  stopLoop()
  detectTimer = window.setInterval(detect, CONFIG.detectMs)
  detect()
}

function stopLoop() {
  if (detectTimer) window.clearInterval(detectTimer)
  if (autoTimer) window.clearTimeout(autoTimer)
  detectTimer = null
  autoTimer = null
}

function detect() {
  const video = videoRef.value
  const canvas = workRef.value
  if (!video || !canvas || frozen.value || video.readyState < 2) return

  const found = phase.value === 'calibrate'
    ? analyzeCardFrame(video, canvas)
    : analyzeFrame(video, canvas)

  if (!found) {
    bboxStyle.value = lastBox ? normToStyle(lastBox.norm) : null
    confidence.value = Math.max(0, confidence.value - 8)
    stablePct.value = 0
    stableHistory = []
    scaleHistory = []
    cardRatio.value = 0
    scaleJitter.value = 1
    scanMessage.value = phase.value === 'calibrate' ? 'Place card on a plain surface' : 'Find the item edges'
    return
  }

  cardRatio.value = found.ratio || 0
  lastGood = found
  lastBox = smoothResult(lastBox, found)
  bboxStyle.value = normToStyle(lastBox.norm)
  confidence.value = Math.round(confidence.value * (1 - CONFIG.confidenceSmoothing) + found.confidence * CONFIG.confidenceSmoothing)
  scanMessage.value = found.message
  trackStability(found.rawBbox)
}

function analyzeCardFrame(video, canvas) {
  const vW = video.videoWidth
  const vH = video.videoHeight
  if (!vW || !vH) return null

  canvas.width = vW
  canvas.height = vH

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(video, 0, 0)
  lastFrame = canvas.toDataURL('image/jpeg', 0.86)

  const size = Math.round(Math.min(vW, vH) * CONFIG.guideRatio)
  const ox = Math.round((vW - size) / 2)
  const oy = Math.round((vH - size) / 2)
  const image = ctx.getImageData(ox, oy, size, size)
  const data = image.data
  const total = size * size
  const gray = new Uint8Array(total)

  let brightness = 0
  for (let i = 0; i < data.length; i += 4) {
    const g = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    gray[i / 4] = g
    brightness += g
  }

  brightness /= total
  if (brightness < 34 || brightness > 240) return null

  const bg = estimateBackground(gray, size)
  const xs = []
  const ys = []

  for (let y = 4; y < size - 4; y += 2) {
    for (let x = 4; x < size - 4; x += 2) {
      const idx = y * size + x
      const contrast = Math.abs(gray[idx] - bg)
      const gx = Math.abs(gray[idx - 1] - gray[idx + 1])
      const gy = Math.abs(gray[idx - size] - gray[idx + size])
      const edge = gx + gy

      if (contrast > CONFIG.minContrast || edge > CONFIG.minEdge) {
        xs.push(x)
        ys.push(y)
      }
    }
  }

  if (xs.length < CONFIG.minHits) return null

  xs.sort((a, b) => a - b)
  ys.sort((a, b) => a - b)

  const trim = 0.08
  const minX = xs[Math.floor(xs.length * trim)]
  const maxX = xs[Math.floor(xs.length * (1 - trim))]
  const minY = ys[Math.floor(ys.length * trim)]
  const maxY = ys[Math.floor(ys.length * (1 - trim))]

  const boxW = maxX - minX
  const boxH = maxY - minY
  if (boxW < size * 0.22 || boxH < size * 0.13) return null

  const areaRatio = (boxW * boxH) / total
  if (areaRatio < 0.035 || areaRatio > 0.7) return null

  const ratio = Math.max(boxW, boxH) / Math.max(1, Math.min(boxW, boxH))
  const ratioScore = 1 - Math.min(1, Math.abs(ratio - CONFIG.cardAspect) / 0.34)
  const areaScore = clamp(areaRatio / 0.28, 0, 1)
  const centeredScore = 1 - clamp(distanceFromCenter(minX, minY, boxW, boxH, size) / 0.38, 0, 1)
  const confidenceValue = Math.round((ratioScore * 0.48 + areaScore * 0.24 + centeredScore * 0.28) * 100)

  if (confidenceValue < 28) return null

  const longPx = Math.max(boxW, boxH)
  const shortPx = Math.min(boxW, boxH)
  const scale = ((longPx / CONFIG.cardWidthCm) + (shortPx / CONFIG.cardHeightCm)) / 2

  scaleHistory.push(scale)
  if (scaleHistory.length > 8) scaleHistory.shift()
  scaleJitter.value = getRelativeJitter(scaleHistory)

  return {
    dimA: 0,
    dimB: 0,
    confidence: confidenceValue,
    solidity: 0.4,
    ratio,
    scale,
    message: cardScanStatus(confidenceValue, ratio),
    rawBbox: [ox + minX, oy + minY, boxW, boxH],
    localBbox: [minX, minY, boxW, boxH],
    norm: { x: minX / size, y: minY / size, w: boxW / size, h: boxH / size },
  }
}

function analyzeFrame(video, canvas) {
  const vW = video.videoWidth
  const vH = video.videoHeight
  if (!vW || !vH) return null

  canvas.width = vW
  canvas.height = vH

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(video, 0, 0)
  lastFrame = canvas.toDataURL('image/jpeg', 0.86)

  const size = Math.round(Math.min(vW, vH) * CONFIG.guideRatio)
  const ox = Math.round((vW - size) / 2)
  const oy = Math.round((vH - size) / 2)
  const image = ctx.getImageData(ox, oy, size, size)
  const data = image.data
  const total = size * size
  const gray = new Uint8Array(total)

  let brightness = 0
  for (let i = 0; i < data.length; i += 4) {
    const g = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    gray[i / 4] = g
    brightness += g
  }

  brightness /= total
  if (brightness < 28 || brightness > 246) return null

  const bg = estimateBackground(gray, size)
  let minX = size
  let minY = size
  let maxX = 0
  let maxY = 0
  let hits = 0
  let edgeEnergy = 0

  for (let y = 2; y < size - 2; y++) {
    for (let x = 2; x < size - 2; x++) {
      const idx = y * size + x
      const contrast = Math.abs(gray[idx] - bg)

      const gx =
        -gray[idx - size - 1] + gray[idx - size + 1] -
        2 * gray[idx - 1] + 2 * gray[idx + 1] -
        gray[idx + size - 1] + gray[idx + size + 1]

      const gy =
        -gray[idx - size - 1] - 2 * gray[idx - size] - gray[idx - size + 1] +
        gray[idx + size - 1] + 2 * gray[idx + size] + gray[idx + size + 1]

      const edge = Math.sqrt(gx * gx + gy * gy)
      edgeEnergy += edge

      if (contrast > CONFIG.minContrast || edge > CONFIG.minEdge) {
        hits++
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (hits < CONFIG.minHits) return null

  const boxW = maxX - minX
  const boxH = maxY - minY
  if (boxW < 24 || boxH < 24) return null

  const areaRatio = (boxW * boxH) / total
  if (areaRatio < 0.01 || areaRatio > 0.9) return null

  const ratio = Math.max(boxW, boxH) / Math.max(1, Math.min(boxW, boxH))
  const fill = hits / Math.max(1, boxW * boxH)
  const sharp = edgeEnergy / total

  const sizeScore = clamp(areaRatio / 0.32, 0, 1)
  const fillScore = clamp(fill / 0.3, 0, 1)
  const sharpScore = clamp(sharp / 27, 0, 1)
  const confidenceValue = Math.round((sizeScore * 0.34 + fillScore * 0.26 + sharpScore * 0.4) * 100)

  const scale = pxPerCm.value
  const dimA = scale ? Math.max(1, Math.round(boxW / scale)) : 0
  const dimB = scale ? Math.max(1, Math.round(boxH / scale)) : 0

  return {
    dimA,
    dimB,
    confidence: confidenceValue,
    solidity: fill,
    ratio,
    message: scanStatus(confidenceValue),
    rawBbox: [ox + minX, oy + minY, boxW, boxH],
    localBbox: [minX, minY, boxW, boxH],
    norm: { x: minX / size, y: minY / size, w: boxW / size, h: boxH / size },
  }
}

function scanStatus(conf) {
  if (conf > 70) return 'Ready. Hold still.'
  return 'Center and hold steady'
}

function cardScanStatus(conf, ratio) {
  if (ratio < CONFIG.cardAspectMin) return 'Tilt card slightly or flatten it'
  if (ratio > CONFIG.cardAspectMax) return 'Keep only the card in frame'
  if (conf < CONFIG.calibrationMinConfidence) return 'Move card onto a plainer surface'
  if (scaleHistory.length < CONFIG.calibrationStableFrames) return 'Card found. Hold steady.'
  if (scaleJitter.value > CONFIG.maxScaleJitter) return 'Hold the camera still'
  return 'Locking scale...'
}

async function captureCurrent() {
  if (busy.value) return
  if (phase.value === 'calibrate') return captureCalibration()
  if (phase.value === 'top') return captureTop()
  if (phase.value === 'side') return captureSide()
}

async function captureCalibration() {
  if (busy.value) return

  busy.value = true
  frozen.value = true
  stopLoop()
  doFlash()

  const found = lastGood || analyzeCardFrame(videoRef.value, workRef.value)
  if (!found) return resumeWithMessage('Could not detect the card. Try more contrast.')

  const longPx = Math.max(found.localBbox[2], found.localBbox[3])
  const shortPx = Math.min(found.localBbox[2], found.localBbox[3])
  const ratio = longPx / Math.max(1, shortPx)

  if (ratio < CONFIG.cardAspectMin || ratio > CONFIG.cardAspectMax) {
    return resumeWithMessage('Card shape unclear. Place only the card inside the frame.')
  }

  const scaleLong = longPx / CONFIG.cardWidthCm
  const scaleShort = shortPx / CONFIG.cardHeightCm
  const currentScale = found.scale || ((scaleLong + scaleShort) / 2)
  pxPerCm.value = median(scaleHistory.length ? scaleHistory : [currentScale]) || currentScale

  resetScan(false)
  phase.value = 'top'
  frozen.value = false
  busy.value = false
  await nextTick()
  startLoop()
}

async function captureTop() {
  if (busy.value) return

  busy.value = true
  frozen.value = true
  stopLoop()
  doFlash()
  await sleep(100)

  const found = lastGood || analyzeFrame(videoRef.value, workRef.value)
  if (!found || !found.dimA || !found.dimB) {
    return resumeWithMessage('Could not measure item. Try again.')
  }

  topDims.value = medianDims(found)
  topDims.value.shape = guessShape(topDims.value)
  topPreview.value = lastFrame

  resetScan(false)
  phase.value = 'side'
  frozen.value = false
  busy.value = false
  await nextTick()
  startLoop()
}

async function captureSide() {
  if (busy.value) return

  busy.value = true
  frozen.value = true
  stopLoop()
  doFlash()
  await sleep(100)

  const found = lastGood || analyzeFrame(videoRef.value, workRef.value)
  if (!topDims.value) return retakeItem()
  if (!found || !found.dimA || !found.dimB) {
    return resumeWithMessage('Could not measure height. Try again.')
  }

  const side = medianDims(found)
  const length = Math.max(topDims.value.dimA, topDims.value.dimB)
  const width = Math.min(topDims.value.dimA, topDims.value.dimB)
  const height = Math.max(1, Math.min(side.dimA, side.dimB))
  const shape = topDims.value.shape

  res.value = {
    length,
    width,
    height,
    weight: estimateWeight(length, width, height, shape),
    shape,
  }

  sidePreview.value = lastFrame
  phase.value = 'result'
  frozen.value = false
  busy.value = false
}

function medianDims(fallback) {
  const list = stableHistory.map(x => x.result).filter(Boolean)
  if (!list.length) return { dimA: fallback.dimA, dimB: fallback.dimB, solidity: fallback.solidity }

  const a = list.map(x => x.dimA).sort((x, y) => x - y)
  const b = list.map(x => x.dimB).sort((x, y) => x - y)
  const mid = Math.floor(list.length / 2)
  const solidity = list.reduce((sum, x) => sum + x.solidity, 0) / list.length

  return { dimA: a[mid], dimB: b[mid], solidity }
}

function median(values) {
  const sorted = [...values].filter(Boolean).sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)] || null
}

function getRelativeJitter(values) {
  const sorted = [...values].filter(Boolean).sort((a, b) => a - b)
  if (sorted.length < 3) return 1

  const mid = sorted[Math.floor(sorted.length / 2)]
  const min = sorted[0]
  const max = sorted[sorted.length - 1]

  return mid ? (max - min) / mid : 1
}

function trackStability(bbox) {
  stableHistory.push({ bbox, t: Date.now(), result: lastGood })

  const neededFrames = phase.value === 'calibrate'
    ? CONFIG.calibrationStableFrames
    : CONFIG.stableFrames

  if (stableHistory.length > neededFrames) stableHistory.shift()

  if (stableHistory.length < neededFrames) {
    stablePct.value = Math.round((stableHistory.length / neededFrames) * 70)
    return
  }

  const first = stableHistory[0]
  const last = stableHistory[stableHistory.length - 1]

  if (bboxIoU(first.bbox, last.bbox) < CONFIG.stableIou) {
    stablePct.value = 0
    stableHistory = []
    autoFired = false
    return
  }

  const autoMs = phase.value === 'calibrate'
    ? CONFIG.calibrationAutoMs
    : CONFIG.autoMs

  stablePct.value = Math.min(100, Math.round(((Date.now() - first.t) / autoMs) * 100))

  if (readyToCapture.value && !autoFired) {
    autoFired = true
    autoTimer = window.setTimeout(captureCurrent, phase.value === 'calibrate' ? 80 : 140)
  }
}

function resumeWithMessage(message) {
  scanMessage.value = message
  confidence.value = 20
  stablePct.value = 0
  stableHistory = []
  scaleHistory = []
  scaleJitter.value = 1
  autoFired = false
  frozen.value = false
  busy.value = false
  startLoop()
}

function retakeItem() {
  resetScan(false)
  topDims.value = null
  topPreview.value = ''
  sidePreview.value = ''
  res.value = { length: 0, width: 0, height: 0, weight: 0.1, shape: 'box' }
  phase.value = pxPerCm.value ? 'top' : 'calibrate'
  nextTick(startLoop)
}

function resetScan(clearScale = true) {
  bboxStyle.value = null
  confidence.value = 0
  stablePct.value = 0
  scanMessage.value = 'Looking for object...'
  cardRatio.value = 0
  scaleJitter.value = 1
  stableHistory = []
  scaleHistory = []
  lastGood = null
  lastBox = null
  autoFired = false

  if (clearScale) pxPerCm.value = null
  if (autoTimer) window.clearTimeout(autoTimer)
  autoTimer = null
}

function confirm() {
  emit('confirm', { ...res.value, calibratedPxPerCm: pxPerCm.value })
  handleClose()
}

function handleClose() {
  stopLoop()
  stopStream()
  emit('close')
}

function stopStream() {
  mediaStream?.getTracks().forEach(track => track.stop())
  mediaStream = null
}

function estimateBackground(gray, size) {
  const samples = []
  const edge = Math.max(8, Math.round(size * 0.065))

  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      if (x < edge || y < edge || x > size - edge || y > size - edge) {
        samples.push(gray[y * size + x])
      }
    }
  }

  samples.sort((a, b) => a - b)
  return samples[Math.floor(samples.length / 2)] || 220
}

function smoothResult(prev, next) {
  if (!prev) return next

  const a = CONFIG.smoothing
  return {
    ...next,
    norm: {
      x: prev.norm.x + (next.norm.x - prev.norm.x) * a,
      y: prev.norm.y + (next.norm.y - prev.norm.y) * a,
      w: prev.norm.w + (next.norm.w - prev.norm.w) * a,
      h: prev.norm.h + (next.norm.h - prev.norm.h) * a,
    },
  }
}

function normToStyle(norm) {
  const vp = viewportRef.value
  if (!vp) return null

  const cW = vp.clientWidth
  const cH = vp.clientHeight
  const size = Math.min(cW, cH) * CONFIG.guideRatio
  const ox = (cW - size) / 2
  const oy = (cH - size) / 2

  return {
    left: `${ox + norm.x * size}px`,
    top: `${oy + norm.y * size}px`,
    width: `${norm.w * size}px`,
    height: `${norm.h * size}px`,
  }
}

function distanceFromCenter(x, y, w, h, size) {
  const cx = x + w / 2
  const cy = y + h / 2
  const dx = Math.abs(cx - size / 2) / size
  const dy = Math.abs(cy - size / 2) / size
  return Math.sqrt(dx * dx + dy * dy)
}

function bboxIoU(a, b) {
  const ax2 = a[0] + a[2]
  const ay2 = a[1] + a[3]
  const bx2 = b[0] + b[2]
  const by2 = b[1] + b[3]
  const ix1 = Math.max(a[0], b[0])
  const iy1 = Math.max(a[1], b[1])
  const ix2 = Math.min(ax2, bx2)
  const iy2 = Math.min(ay2, by2)

  if (ix2 <= ix1 || iy2 <= iy1) return 0

  const inter = (ix2 - ix1) * (iy2 - iy1)
  return inter / (a[2] * a[3] + b[2] * b[3] - inter)
}

function guessShape({ dimA, dimB, solidity = 0.3 }) {
  const ratio = Math.max(dimA, dimB) / Math.max(1, Math.min(dimA, dimB))
  if (Math.min(dimA, dimB) <= 3) return 'envelope'
  if (solidity < 0.2) return 'bag'
  if (ratio < 1.22 && solidity > 0.32) return 'cylinder'
  return 'box'
}

function estimateWeight(l, w, h, shape) {
  const volume = l * w * h
  const density = {
    box: 0.00026,
    cylinder: 0.00032,
    bag: 0.00018,
    envelope: 0.00006,
    irregular: 0.00022,
  }[shape] || 0.00022

  return Math.max(0.1, Math.round(volume * density * 10) / 10)
}

function cameraTitle(e) {
  if (e?.name === 'NotAllowedError') return 'Camera access denied'
  if (e?.name === 'NotFoundError') return 'No camera found'
  if (e?.name === 'NotReadableError') return 'Camera already in use'
  return 'Could not start camera'
}

function cameraSub(e) {
  if (e?.name === 'NotAllowedError') return 'Allow camera access in browser settings, then try again.'
  if (e?.name === 'NotFoundError') return 'No accessible camera was found on this device.'
  if (e?.name === 'NotReadableError') return 'Close other apps using the camera and try again.'
  return e?.message || 'Please reload and allow camera access.'
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function sleep(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

function doFlash() {
  flash.value = true
  window.setTimeout(() => {
    flash.value = false
  }, 220)
}
</script>

<style scoped>
.ps {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.92);
  font-family: Montserrat, Inter, system-ui, sans-serif;
}

.ps-shell {
  width: 100%;
  max-width: 560px;
  max-height: 97dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #0b0d10;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -24px 80px rgba(0, 0, 0, 0.45);
}

.ps-header {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 14px 16px 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.015));
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.ps-close {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.09);
  color: rgba(255, 255, 255, 0.82);
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
}

.ps-title-wrap {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ps-title-wrap strong {
  color: #fff;
  font-size: 15px;
  font-weight: 900;
}

.ps-kicker {
  color: rgba(232, 223, 160, 0.8);
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.ps-step {
  display: flex;
  gap: 5px;
}

.ps-step span {
  width: 7px;
  height: 7px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.16);
}

.ps-step .on {
  background: #e8dfa0;
}

.ps-step .done {
  background: #22c55e;
}

.ps-view {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #020304;
}

.ps-video,
.ps-result-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.ps-video.frozen {
  filter: brightness(0.78) saturate(0.9);
}

.ps-hidden {
  display: none;
}

.ps-vignette,
.ps-result-shade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.28), transparent 28%, transparent 70%, rgba(0, 0, 0, 0.45)),
    radial-gradient(circle at center, transparent 48%, rgba(0, 0, 0, 0.42));
}

.ps-guide {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.ps-corners {
  width: 76%;
  aspect-ratio: 1 / 1;
  color: rgba(232, 223, 160, 0.92);
  filter: drop-shadow(0 0 12px rgba(232, 223, 160, 0.35));
}

.ps-corners path {
  stroke: currentColor;
  stroke-width: 6;
  stroke-linecap: round;
}

.ps-guide.ready .ps-corners {
  color: #22c55e;
  filter: drop-shadow(0 0 16px rgba(34, 197, 94, 0.48));
}

.ps-card-ghost {
  position: absolute;
  width: 58%;
  aspect-ratio: 1.586 / 1;
  border: 1.5px dashed rgba(255, 255, 255, 0.36);
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.64);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.13em;
  background: rgba(255, 255, 255, 0.035);
}

.ps-card-ghost.ready {
  border-color: rgba(34, 197, 94, 0.85);
  color: #22c55e;
  background: rgba(34, 197, 94, 0.08);
}

.ps-scanline {
  position: absolute;
  left: 12%;
  right: 12%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #e8dfa0 25%, #fff6b8 50%, #e8dfa0 75%, transparent);
  animation: ps-scan 1.55s ease-in-out infinite;
}

.ps-box {
  position: absolute;
  border: 2px solid rgba(232, 223, 160, 0.94);
  border-radius: 8px;
  box-shadow: 0 0 0 1px rgba(232, 223, 160, 0.22), 0 0 22px rgba(232, 223, 160, 0.18);
  pointer-events: none;
  transition: left 0.1s ease, top 0.1s ease, width 0.1s ease, height 0.1s ease;
}

.ps-box.ready {
  border-color: #22c55e;
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.28), 0 0 24px rgba(34, 197, 94, 0.22);
}

.ps-progress {
  position: absolute;
  right: -24px;
  bottom: -24px;
  width: 44px;
  height: 44px;
  transform: rotate(-90deg);
}

.ps-progress circle {
  fill: none;
  stroke-width: 3;
}

.ps-progress circle:first-child {
  stroke: rgba(255, 255, 255, 0.16);
}

.ps-progress circle:last-child {
  stroke: #22c55e;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.14s ease;
}

.ps-live-pill,
.ps-result-mark {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(5, 7, 10, 0.78);
  backdrop-filter: blur(14px);
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.28);
}

.ps-live-pill {
  bottom: 12px;
  min-width: min(86%, 390px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  font-weight: 800;
}

.ps-live-pill strong {
  color: #e8dfa0;
}

.ps-live-pill.good strong {
  color: #22c55e;
}

.ps-result-mark {
  bottom: 14px;
  padding: 8px 16px;
  color: #22c55e;
  font-size: 12px;
  font-weight: 900;
}

.ps-flash {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.72);
  animation: ps-flash 0.22s ease-out forwards;
  pointer-events: none;
}

.ps-state {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 12px;
  padding: 30px;
  text-align: center;
  color: #fff;
}

.ps-state strong {
  font-size: 16px;
  font-weight: 900;
}

.ps-state span {
  max-width: 320px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 12px;
  line-height: 1.5;
}

.ps-orbit {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 1px solid rgba(232, 223, 160, 0.22);
  display: grid;
  place-items: center;
}

.ps-orbit i,
.ps-spinner {
  display: block;
  border-radius: 50%;
  animation: ps-spin 0.8s linear infinite;
}

.ps-orbit i {
  width: 34px;
  height: 34px;
  border: 3px solid rgba(255, 255, 255, 0.12);
  border-top-color: #e8dfa0;
}

.ps-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(17, 17, 17, 0.2);
  border-top-color: #111;
}

.ps-error {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 2px solid #ef4444;
  border-radius: 50%;
  color: #ef4444;
  font-weight: 900;
}

.ps-panel {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 14px 16px max(18px, env(safe-area-inset-bottom, 18px));
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent), #0b0d10;
}

.ps-hint {
  margin: 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  font-weight: 650;
  line-height: 1.45;
  text-align: center;
}

.ps-calibration {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.09);
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  font-weight: 800;
}

.ps-calibration strong {
  color: #22c55e;
}

.ps-meter {
  height: 5px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.1);
}

.ps-meter div {
  height: 100%;
  border-radius: inherit;
  background: #e8dfa0;
  transition: width 0.16s ease, background 0.16s ease;
}

.ps-meter .good {
  background: #22c55e;
}

.ps-main-btn,
.ps-soft-btn {
  min-height: 46px;
  border: 0;
  border-radius: 14px;
  font: inherit;
  font-weight: 950;
  cursor: pointer;
}

.ps-main-btn {
  display: grid;
  place-items: center;
  flex: 1;
  background: linear-gradient(180deg, #fff3b8, #e8dfa0);
  color: #101114;
  box-shadow: 0 12px 28px rgba(232, 223, 160, 0.16);
}

.ps-main-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.ps-soft-btn {
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.075);
  color: rgba(255, 255, 255, 0.78);
}

.ps-previews {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.ps-previews div {
  position: relative;
  aspect-ratio: 1.7 / 1;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.07);
}

.ps-previews img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ps-previews span {
  position: absolute;
  left: 8px;
  bottom: 7px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.62);
  color: #fff;
  font-size: 10px;
  font-weight: 900;
}

.ps-dims {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.ps-dims label {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ps-dims label > span {
  color: rgba(255, 255, 255, 0.38);
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.ps-dims label > div {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 11px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.065);
}

.ps-dims input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #e8dfa0;
  font: inherit;
  font-size: 19px;
  font-weight: 950;
}

.ps-dims em {
  color: rgba(255, 255, 255, 0.35);
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
}

.ps-shapes {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.ps-shapes button {
  padding: 7px 11px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.58);
  font: inherit;
  font-size: 11px;
  font-weight: 850;
  cursor: pointer;
}

.ps-shapes .on {
  border-color: rgba(232, 223, 160, 0.9);
  background: rgba(232, 223, 160, 0.14);
  color: #e8dfa0;
}

.ps-actions {
  display: flex;
  gap: 10px;
}

@keyframes ps-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ps-scan {
  0%, 100% {
    top: 12%;
    opacity: 0.25;
  }

  50% {
    top: 84%;
    opacity: 1;
  }
}

@keyframes ps-flash {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@media (min-width: 560px) {
  .ps {
    align-items: center;
  }

  .ps-shell {
    border-radius: 24px;
    max-height: 94dvh;
  }
}
</style>