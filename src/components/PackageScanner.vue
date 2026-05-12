<template>
  <teleport to="body">
    <div class="ps" role="dialog" aria-modal="true">
      <div class="ps-shell">
        <header class="ps-topbar">
          <button class="ps-icon-btn" type="button" aria-label="Close" @click="handleClose">
            <span aria-hidden="true">x</span>
          </button>

          <div class="ps-title">
            <span>{{ phaseEyebrow }}</span>
            <strong>{{ phaseTitle }}</strong>
          </div>

          <div class="ps-steps" aria-hidden="true">
            <i v-for="i in 3" :key="i" :class="{ on: step >= i, done: step > i }" />
          </div>
        </header>

        <main ref="viewportRef" class="ps-view">
          <div v-if="phase === 'loading'" class="ps-state">
            <div class="ps-loader"><i /></div>
            <strong>Starting camera</strong>
            <span>Preparing real-time scan tracking.</span>
          </div>

          <div v-else-if="phase === 'error'" class="ps-state">
            <div class="ps-error">!</div>
            <strong>{{ errTitle }}</strong>
            <span>{{ errSub }}</span>
            <button class="ps-soft" type="button" @click="init">Try again</button>
          </div>

          <template v-else-if="isLive">
            <video ref="videoRef" class="ps-video" autoplay playsinline muted :class="{ frozen }" />
            <canvas ref="workRef" class="ps-hidden" />

            <div class="ps-depth-grid" aria-hidden="true" />
            <div class="ps-vignette" aria-hidden="true" />

            <div class="ps-guide" :class="{ locked: lockState === 'locked' }" aria-hidden="true">
              <svg viewBox="0 0 240 240">
                <path d="M18 64V18h46" />
                <path d="M176 18h46v46" />
                <path d="M18 176v46h46" />
                <path d="M176 222h46v-46" />
              </svg>
              <div v-if="!boxStyle" class="ps-scanline" />
              <div class="ps-pulse" />
            </div>

            <div
              v-if="boxStyle"
              class="ps-box"
              :class="{ locked: lockState === 'locked' }"
              :style="boxStyle"
              aria-hidden="true"
            >
              <span class="ps-box-corner tl" />
              <span class="ps-box-corner tr" />
              <span class="ps-box-corner bl" />
              <span class="ps-box-corner br" />
              <svg class="ps-ring" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="19" />
                <circle cx="24" cy="24" r="19" :style="ringStyle" />
              </svg>
            </div>

            <div class="ps-hud" :class="{ locked: lockState === 'locked' }">
              <div>
                <span>{{ liveStatus }}</span>
                <strong>{{ confidence }}%</strong>
              </div>
              <b>{{ liveMetric }}</b>
            </div>

            <div v-if="flash" class="ps-flash" />
          </template>

          <template v-else-if="phase === 'result'">
            <img v-if="sidePreview || topPreview" class="ps-result-img" :src="sidePreview || topPreview" alt="" />
            <div class="ps-vignette" />
            <div class="ps-result-chip">Scan complete</div>
          </template>
        </main>

        <section class="ps-panel">
          <p class="ps-hint">{{ phaseHint }}</p>

          <template v-if="isLive">
            <div class="ps-confidence">
              <span :style="{ width: confidence + '%' }" :class="{ locked: lockState === 'locked' }" />
            </div>

            <div class="ps-readout">
              <div>
                <span>Tracking</span>
                <strong>{{ lockState === 'locked' ? 'Locked' : 'Live' }}</strong>
              </div>
              <div>
                <span>Scale</span>
                <strong>{{ scaleLabel }}</strong>
              </div>
              <div>
                <span>Mode</span>
                <strong>{{ phase === 'top' ? 'Top' : 'Side' }}</strong>
              </div>
            </div>

            <button class="ps-primary" type="button" :disabled="busy" @click="captureCurrent">
              <span v-if="busy" class="ps-spinner" />
              <span v-else>{{ phase === 'top' ? 'Capture top scan' : 'Capture side scan' }}</span>
            </button>
          </template>

          <template v-if="phase === 'result'">
            <div class="ps-previews">
              <figure>
                <img v-if="topPreview" :src="topPreview" alt="" />
                <figcaption>Top</figcaption>
              </figure>
              <figure>
                <img v-if="sidePreview" :src="sidePreview" alt="" />
                <figcaption>Side</figcaption>
              </figure>
            </div>

            <div class="ps-dims">
              <label v-for="field in FIELDS" :key="field.key">
                <span>{{ field.label }}</span>
                <div>
                  <input
                    v-model.number="res[field.key]"
                    type="number"
                    :min="field.min"
                    :max="field.max"
                    :step="field.step"
                    inputmode="decimal"
                  />
                  <em>{{ field.unit }}</em>
                </div>
              </label>
            </div>

            <div class="ps-chips">
              <button
                v-for="shape in SHAPES"
                :key="shape.id"
                type="button"
                :class="{ on: res.shape === shape.id }"
                @click="res.shape = shape.id"
              >
                {{ shape.label }}
              </button>
            </div>

            <div class="ps-actions">
              <button class="ps-soft" type="button" @click="retake">Retake</button>
              <button class="ps-primary" type="button" @click="confirm">Use scan</button>
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

const PROFILE = {
  guideRatio: 0.76,
  processSize: 300,
  targetFps: 24,
  lockMs: 260,
  autoMs: 620,
  unlockJitter: 0.14,
  minArea: 0.006,
  maxArea: 0.9,
  creditCardRatio: 1.586,
  creditCardWidthCm: 8.56,
  creditCardHeightCm: 5.398,
  topGuideCm: 34,
  sideGuideCm: 24,
}

const FIELDS = [
  { key: 'length', label: 'Length', unit: 'cm', min: 1, max: 300, step: 1 },
  { key: 'width', label: 'Width', unit: 'cm', min: 1, max: 300, step: 1 },
  { key: 'height', label: 'Height', unit: 'cm', min: 1, max: 300, step: 1 },
  { key: 'weight', label: 'Weight', unit: 'kg', min: 0.1, max: 100, step: 0.1 },
]

const SHAPES = [
  { id: 'box', label: 'Box' },
  { id: 'cylinder', label: 'Cylinder' },
  { id: 'bag', label: 'Bag' },
  { id: 'envelope', label: 'Flat' },
  { id: 'irregular', label: 'Irregular' },
]

const phase = ref('loading')
const busy = ref(false)
const frozen = ref(false)
const flash = ref(false)
const errTitle = ref('')
const errSub = ref('')

const viewportRef = ref(null)
const videoRef = ref(null)
const workRef = ref(null)

const confidence = ref(0)
const stablePct = ref(0)
const lockState = ref('searching')
const liveStatus = ref('Finding object')
const liveMetric = ref('Real-time')
const scaleLabel = ref('Auto')
const boxStyle = ref(null)

const topScan = ref(null)
const topPreview = ref('')
const sidePreview = ref('')
const res = ref({ length: 0, width: 0, height: 0, weight: 0.1, shape: 'box' })

let stream = null
let rafId = 0
let lastDetectAt = 0
let lockStartedAt = 0
let autoTimer = null
let smoothed = null
let locked = null
let velocity = { x: 0, y: 0, w: 0, h: 0 }
let samples = []
let lastFrame = ''

const isLive = computed(() => phase.value === 'top' || phase.value === 'side')
const step = computed(() => ({ top: 1, side: 2, result: 3 }[phase.value] || 0))
const phaseEyebrow = computed(() => (phase.value === 'result' ? 'Step 3 of 3' : phase.value === 'side' ? 'Step 2 of 3' : 'Step 1 of 3'))
const phaseTitle = computed(() => ({ loading: 'Starting camera', error: 'Camera issue', top: 'Instant top scan', side: 'Instant side scan', result: 'Review dimensions' }[phase.value] || 'Scanner'))
const phaseHint = computed(() => {
  if (phase.value === 'top') return 'Place the item in frame. Detection locks automatically in under a second.'
  if (phase.value === 'side') return 'Turn the item sideways and keep roughly the same distance.'
  if (phase.value === 'result') return 'Demo estimates are editable before confirmation.'
  return 'Allow camera access to begin.'
})
const ringStyle = computed(() => {
  const c = 2 * Math.PI * 19
  return { strokeDasharray: c, strokeDashoffset: c - (stablePct.value / 100) * c }
})

onMounted(init)
onUnmounted(() => {
  stopLoop()
  stopStream()
})

async function init() {
  try {
    phase.value = 'loading'
    resetLive()
    stopStream()

    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })

    phase.value = 'top'
    await nextTick()

    const video = videoRef.value
    if (!video) throw new Error('Video element not available')

    video.srcObject = stream
    video.setAttribute('playsinline', 'true')
    await video.play()
    await waitForVideo(video)

    startLoop()
  } catch (error) {
    console.error(error)
    stopStream()
    errTitle.value = cameraTitle(error)
    errSub.value = cameraSub(error)
    phase.value = 'error'
  }
}

function waitForVideo(video) {
  return new Promise((resolve, reject) => {
    const start = performance.now()
    const tick = () => {
      if (video.videoWidth && video.videoHeight) return resolve()
      if (performance.now() - start > 6000) return reject(new Error('No camera frames received'))
      requestAnimationFrame(tick)
    }
    tick()
  })
}

function startLoop() {
  stopLoop()
  const loop = time => {
    rafId = requestAnimationFrame(loop)
    if (time - lastDetectAt < 1000 / PROFILE.targetFps) return
    lastDetectAt = time
    detect()
  }
  rafId = requestAnimationFrame(loop)
}

function stopLoop() {
  if (rafId) cancelAnimationFrame(rafId)
  if (autoTimer) clearTimeout(autoTimer)
  rafId = 0
  autoTimer = null
}

function detect() {
  const video = videoRef.value
  const canvas = workRef.value
  if (!video || !canvas || frozen.value || video.readyState < 2) return

  const hit = analyze(video, canvas)
  if (!hit) {
    confidence.value = Math.max(0, confidence.value - 8)
    stablePct.value = Math.max(0, stablePct.value - 18)
    liveStatus.value = 'Searching edges'
    lockState.value = 'searching'
    if (!locked) boxStyle.value = smoothed ? toStyle(smoothed.norm) : null
    return
  }

  smoothed = smooth(smoothed, hit)
  samples.push(hit)
  if (samples.length > 10) samples.shift()

  const jitter = smoothed.prev ? boxDelta(smoothed.prev.norm, smoothed.norm) : 1
  const isStable = jitter < PROFILE.unlockJitter || hit.confidence > 74

  if (isStable) {
    if (!lockStartedAt) lockStartedAt = performance.now()
    stablePct.value = Math.min(100, ((performance.now() - lockStartedAt) / PROFILE.lockMs) * 100)
  } else {
    lockStartedAt = 0
    stablePct.value = Math.max(0, stablePct.value - 22)
    locked = null
  }

  if (stablePct.value >= 100) {
    locked = locked ? smooth(locked, smoothed, 0.18) : smoothed
    lockState.value = 'locked'
  } else {
    lockState.value = 'tracking'
  }

  const display = locked || smoothed
  boxStyle.value = toStyle(display.norm)
  confidence.value = hit.confidence
  liveStatus.value = locked ? 'Object locked' : hit.message
  liveMetric.value = hit.kind === 'card' ? 'Card-aware' : 'Auto depth'
  scaleLabel.value = hit.kind === 'card' ? 'Card' : 'Heuristic'

  if (locked && !autoTimer) {
    autoTimer = setTimeout(() => {
      autoTimer = null
      captureCurrent()
    }, PROFILE.autoMs)
  }
}

function analyze(video, canvas) {
  const size = PROFILE.processSize
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const src = cropSquare(video.videoWidth, video.videoHeight)
  ctx.drawImage(video, src.x, src.y, src.s, src.s, 0, 0, size, size)
  lastFrame = canvas.toDataURL('image/jpeg', 0.86)

  const g = ctx.getImageData(0, 0, size, size)
  const gray = new Uint8Array(size * size)
  let mean = 0

  for (let i = 0; i < g.data.length; i += 4) {
    const value = g.data[i] * 0.299 + g.data[i + 1] * 0.587 + g.data[i + 2] * 0.114
    gray[i / 4] = value
    mean += value
  }

  mean /= gray.length
  const bg = borderMedian(gray, size)
  const threshold = clamp(Math.abs(bg - mean) * 0.55 + 18, 22, 52)

  let minX = size
  let minY = size
  let maxX = 0
  let maxY = 0
  let hits = 0
  let edge = 0

  const guidePad = Math.round(size * (1 - PROFILE.guideRatio) / 2)
  for (let y = guidePad + 2; y < size - guidePad - 2; y++) {
    for (let x = guidePad + 2; x < size - guidePad - 2; x++) {
      const i = y * size + x
      const contrast = Math.abs(gray[i] - bg)
      const gx = -gray[i - size - 1] + gray[i - size + 1] - 2 * gray[i - 1] + 2 * gray[i + 1] - gray[i + size - 1] + gray[i + size + 1]
      const gy = -gray[i - size - 1] - 2 * gray[i - size] - gray[i - size + 1] + gray[i + size - 1] + 2 * gray[i + size] + gray[i + size + 1]
      const mag = Math.sqrt(gx * gx + gy * gy)
      edge += mag

      if (contrast > threshold || mag > 46) {
        hits++
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (hits < 150) return null

  const w = maxX - minX
  const h = maxY - minY
  const area = (w * h) / (size * size)
  if (w < 14 || h < 14 || area < PROFILE.minArea || area > PROFILE.maxArea) return null

  const ratio = Math.max(w, h) / Math.max(1, Math.min(w, h))
  const fill = clamp(hits / Math.max(1, w * h), 0, 1)
  const sharp = clamp(edge / (size * size) / 32, 0, 1)
  const fit = clamp(area / 0.22, 0, 1)
  const cardLike = Math.abs(ratio - PROFILE.creditCardRatio) < 0.18 && phase.value === 'top'
  const confidenceValue = Math.round((fit * 0.34 + fill * 0.24 + sharp * 0.28 + (cardLike ? 0.14 : 0.06)) * 100)

  const dims = estimateDims(w, h, ratio, cardLike)
  return {
    ...dims,
    kind: cardLike ? 'card' : 'object',
    confidence: clamp(confidenceValue, 1, 99),
    message: confidenceValue > 68 ? 'Locking target' : 'Tracking shape',
    solidity: fill,
    raw: { x: minX, y: minY, w, h },
    norm: { x: minX / size, y: minY / size, w: w / size, h: h / size },
  }
}

function estimateDims(pxW, pxH, ratio, cardLike) {
  if (cardLike) {
    const longIsW = pxW >= pxH
    return {
      dimA: longIsW ? PROFILE.creditCardWidthCm : PROFILE.creditCardHeightCm,
      dimB: longIsW ? PROFILE.creditCardHeightCm : PROFILE.creditCardWidthCm,
    }
  }

  const guideCm = phase.value === 'side' ? PROFILE.sideGuideCm : PROFILE.topGuideCm
  const size = PROFILE.processSize * PROFILE.guideRatio
  const pxPerCm = size / guideCm
  const perspectiveBoost = clamp(1 + (0.22 - Math.min(pxW, pxH) / PROFILE.processSize) * 0.28, 0.94, 1.08)
  const a = Math.max(1, Math.round((pxW / pxPerCm) * perspectiveBoost))
  const b = Math.max(1, Math.round((pxH / pxPerCm) * perspectiveBoost))

  if (ratio > 3.2 && Math.min(a, b) <= 4) {
    return { dimA: Math.max(a, b), dimB: Math.min(a, b) }
  }

  return { dimA: a, dimB: b }
}

function smooth(prev, next, forcedAlpha) {
  if (!prev) return { ...next, prev: null }

  const alpha = forcedAlpha ?? (next.confidence > 70 ? 0.42 : 0.28)
  const predicted = {
    x: prev.norm.x + velocity.x * 0.45,
    y: prev.norm.y + velocity.y * 0.45,
    w: prev.norm.w + velocity.w * 0.25,
    h: prev.norm.h + velocity.h * 0.25,
  }
  const norm = {
    x: lerp(predicted.x, next.norm.x, alpha),
    y: lerp(predicted.y, next.norm.y, alpha),
    w: lerp(predicted.w, next.norm.w, alpha),
    h: lerp(predicted.h, next.norm.h, alpha),
  }

  velocity = {
    x: norm.x - prev.norm.x,
    y: norm.y - prev.norm.y,
    w: norm.w - prev.norm.w,
    h: norm.h - prev.norm.h,
  }

  return { ...next, norm, prev }
}

async function captureCurrent() {
  if (busy.value || !isLive.value) return
  busy.value = true
  frozen.value = true
  stopLoop()
  doFlash()
  await sleep(100)

  const sample = medianSample()
  if (!sample) {
    busy.value = false
    frozen.value = false
    startLoop()
    return
  }

  if (phase.value === 'top') {
    const a = Math.max(sample.dimA, sample.dimB)
    const b = Math.min(sample.dimA, sample.dimB)
    topScan.value = { length: a, width: b, shape: guessShape(sample) }
    topPreview.value = lastFrame
    resetLive()
    phase.value = 'side'
    busy.value = false
    frozen.value = false
    await nextTick()
    startLoop()
    return
  }

  const top = topScan.value
  if (!top) {
    phase.value = 'top'
    busy.value = false
    frozen.value = false
    startLoop()
    return
  }

  const height = Math.max(1, Math.min(sample.dimA, sample.dimB))
  const shape = top.shape
  res.value = {
    length: top.length,
    width: top.width,
    height,
    weight: estimateWeight(top.length, top.width, height, shape),
    shape,
  }
  sidePreview.value = lastFrame
  phase.value = 'result'
  busy.value = false
  frozen.value = false
}

function medianSample() {
  const list = samples.length ? samples : smoothed ? [smoothed] : []
  if (!list.length) return null
  const a = list.map(item => item.dimA).sort((x, y) => x - y)
  const b = list.map(item => item.dimB).sort((x, y) => x - y)
  const mid = Math.floor(list.length / 2)
  const base = list[list.length - 1]
  return { ...base, dimA: a[mid], dimB: b[mid] }
}

function retake() {
  resetLive()
  topScan.value = null
  topPreview.value = ''
  sidePreview.value = ''
  res.value = { length: 0, width: 0, height: 0, weight: 0.1, shape: 'box' }
  phase.value = 'top'
  nextTick(startLoop)
}

function confirm() {
  emit('confirm', { ...res.value, source: 'demo-smart-scan' })
  handleClose()
}

function handleClose() {
  stopLoop()
  stopStream()
  emit('close')
}

function resetLive() {
  confidence.value = 0
  stablePct.value = 0
  lockState.value = 'searching'
  liveStatus.value = 'Finding object'
  liveMetric.value = 'Real-time'
  scaleLabel.value = 'Auto'
  boxStyle.value = null
  smoothed = null
  locked = null
  velocity = { x: 0, y: 0, w: 0, h: 0 }
  samples = []
  lockStartedAt = 0
  if (autoTimer) clearTimeout(autoTimer)
  autoTimer = null
}

function stopStream() {
  stream?.getTracks().forEach(track => track.stop())
  stream = null
}

function cropSquare(w, h) {
  const s = Math.min(w, h)
  return { x: Math.round((w - s) / 2), y: Math.round((h - s) / 2), s }
}

function borderMedian(gray, size) {
  const pad = Math.round(size * 0.08)
  const values = []
  for (let y = 0; y < size; y += 3) {
    for (let x = 0; x < size; x += 3) {
      if (x < pad || y < pad || x > size - pad || y > size - pad) values.push(gray[y * size + x])
    }
  }
  values.sort((a, b) => a - b)
  return values[Math.floor(values.length / 2)] || 220
}

function toStyle(norm) {
  const vp = viewportRef.value
  if (!vp) return null
  const side = Math.min(vp.clientWidth, vp.clientHeight)
  const left = (vp.clientWidth - side) / 2
  const top = (vp.clientHeight - side) / 2
  return {
    left: `${left + norm.x * side}px`,
    top: `${top + norm.y * side}px`,
    width: `${norm.w * side}px`,
    height: `${norm.h * side}px`,
  }
}

function boxDelta(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.w - b.w) * 0.7 + Math.abs(a.h - b.h) * 0.7
}

function guessShape(sample) {
  const ratio = Math.max(sample.dimA, sample.dimB) / Math.max(1, Math.min(sample.dimA, sample.dimB))
  if (sample.kind === 'card' || Math.min(sample.dimA, sample.dimB) <= 3) return 'envelope'
  if (sample.solidity < 0.18) return 'bag'
  if (ratio < 1.18 && sample.solidity > 0.28) return 'cylinder'
  return 'box'
}

function estimateWeight(l, w, h, shape) {
  const density = { box: 0.00024, cylinder: 0.0003, bag: 0.00016, envelope: 0.00005, irregular: 0.00022 }[shape] || 0.00022
  return Math.max(0.1, Math.round(l * w * h * density * 10) / 10)
}

function doFlash() {
  flash.value = true
  setTimeout(() => {
    flash.value = false
  }, 210)
}

function cameraTitle(error) {
  if (error?.name === 'NotAllowedError') return 'Camera access denied'
  if (error?.name === 'NotFoundError') return 'No camera found'
  if (error?.name === 'NotReadableError') return 'Camera already in use'
  return 'Could not start camera'
}

function cameraSub(error) {
  if (error?.name === 'NotAllowedError') return 'Allow camera access in browser settings, then try again.'
  if (error?.name === 'NotFoundError') return 'No accessible camera was found on this device.'
  if (error?.name === 'NotReadableError') return 'Close other apps using the camera and try again.'
  return error?.message || 'Reload and allow camera access.'
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
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
  background: radial-gradient(circle at 50% -12%, rgba(42, 166, 255, 0.22), transparent 36%), rgba(2, 5, 9, 0.9);
  font-family: Montserrat, Inter, system-ui, sans-serif;
}

.ps-shell {
  width: 100%;
  max-width: 560px;
  max-height: 97dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 26px 26px 0 0;
  background: #070a0f;
  box-shadow: 0 -30px 90px rgba(0, 0, 0, 0.5);
}

.ps-topbar {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 14px 16px 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.015));
}

.ps-icon-btn {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.09);
  color: rgba(255, 255, 255, 0.78);
  font-size: 20px;
  font-weight: 900;
  cursor: pointer;
}

.ps-title {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ps-title span,
.ps-readout span {
  color: rgba(127, 219, 255, 0.82);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.ps-title strong {
  color: #fff;
  font-size: 15px;
  font-weight: 950;
}

.ps-steps {
  display: flex;
  gap: 5px;
}

.ps-steps i {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
}

.ps-steps .on {
  background: #7fdbff;
}

.ps-steps .done {
  background: #33f0a1;
}

.ps-view {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #020509;
}

.ps-video,
.ps-result-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.ps-video.frozen {
  filter: brightness(0.78) saturate(0.92);
}

.ps-hidden {
  display: none;
}

.ps-depth-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.24;
  background-image:
    linear-gradient(rgba(127, 219, 255, 0.13) 1px, transparent 1px),
    linear-gradient(90deg, rgba(127, 219, 255, 0.13) 1px, transparent 1px);
  background-size: 32px 32px;
  transform: perspective(420px) rotateX(56deg) scale(1.4);
  transform-origin: center bottom;
}

.ps-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.44)), linear-gradient(180deg, rgba(0, 0, 0, 0.34), transparent 32%, rgba(0, 0, 0, 0.5));
}

.ps-guide {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.ps-guide svg {
  width: 76%;
  aspect-ratio: 1 / 1;
  color: rgba(127, 219, 255, 0.95);
  filter: drop-shadow(0 0 14px rgba(127, 219, 255, 0.36));
}

.ps-guide path {
  stroke: currentColor;
  stroke-width: 7;
  stroke-linecap: round;
}

.ps-guide.locked svg {
  color: #33f0a1;
  filter: drop-shadow(0 0 18px rgba(51, 240, 161, 0.45));
}

.ps-pulse {
  position: absolute;
  width: 76%;
  aspect-ratio: 1 / 1;
  border: 1px solid rgba(127, 219, 255, 0.16);
  animation: ps-pulse 1.7s ease-out infinite;
}

.ps-scanline {
  position: absolute;
  left: 12%;
  right: 12%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #7fdbff 24%, #fff 50%, #7fdbff 76%, transparent);
  animation: ps-scan 1.35s ease-in-out infinite;
}

.ps-box {
  position: absolute;
  border: 1px solid rgba(127, 219, 255, 0.85);
  border-radius: 8px;
  box-shadow: 0 0 0 1px rgba(127, 219, 255, 0.2), 0 0 28px rgba(127, 219, 255, 0.22);
  pointer-events: none;
  transition: left 80ms ease-out, top 80ms ease-out, width 100ms ease-out, height 100ms ease-out, border-color 120ms ease;
}

.ps-box.locked {
  border-color: #33f0a1;
  box-shadow: 0 0 0 1px rgba(51, 240, 161, 0.24), 0 0 34px rgba(51, 240, 161, 0.24);
}

.ps-box-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: currentColor;
  color: inherit;
}

.ps-box-corner.tl { left: -2px; top: -2px; border-left: 3px solid; border-top: 3px solid; }
.ps-box-corner.tr { right: -2px; top: -2px; border-right: 3px solid; border-top: 3px solid; }
.ps-box-corner.bl { left: -2px; bottom: -2px; border-left: 3px solid; border-bottom: 3px solid; }
.ps-box-corner.br { right: -2px; bottom: -2px; border-right: 3px solid; border-bottom: 3px solid; }

.ps-ring {
  position: absolute;
  right: -25px;
  bottom: -25px;
  width: 48px;
  height: 48px;
  transform: rotate(-90deg);
}

.ps-ring circle {
  fill: rgba(0, 0, 0, 0.35);
  stroke-width: 3;
}

.ps-ring circle:first-child {
  stroke: rgba(255, 255, 255, 0.18);
}

.ps-ring circle:last-child {
  fill: none;
  stroke: #33f0a1;
  stroke-linecap: round;
  transition: stroke-dashoffset 100ms linear;
}

.ps-hud,
.ps-result-chip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(4, 10, 16, 0.76);
  backdrop-filter: blur(14px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
}

.ps-hud {
  bottom: 12px;
  width: min(88%, 410px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 12px;
}

.ps-hud div {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ps-hud span,
.ps-hud b {
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
  font-weight: 850;
}

.ps-hud strong {
  color: #7fdbff;
  font-size: 12px;
  font-weight: 950;
}

.ps-hud.locked strong {
  color: #33f0a1;
}

.ps-result-chip {
  bottom: 14px;
  padding: 8px 16px;
  color: #33f0a1;
  font-size: 12px;
  font-weight: 950;
}

.ps-flash {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.72);
  animation: ps-flash 210ms ease-out forwards;
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
  font-weight: 950;
}

.ps-state span {
  max-width: 310px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  line-height: 1.45;
}

.ps-loader {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid rgba(127, 219, 255, 0.22);
}

.ps-loader i,
.ps-spinner {
  display: block;
  border-radius: 50%;
  animation: ps-spin 760ms linear infinite;
}

.ps-loader i {
  width: 34px;
  height: 34px;
  border: 3px solid rgba(255, 255, 255, 0.12);
  border-top-color: #7fdbff;
}

.ps-error {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 2px solid #ff5c7a;
  border-radius: 50%;
  color: #ff5c7a;
  font-weight: 950;
}

.ps-panel {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 14px 16px max(18px, env(safe-area-inset-bottom, 18px));
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent), #070a0f;
}

.ps-hint {
  margin: 0;
  color: rgba(255, 255, 255, 0.54);
  font-size: 11px;
  font-weight: 650;
  line-height: 1.45;
  text-align: center;
}

.ps-confidence {
  height: 5px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

.ps-confidence span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #7fdbff, #d6f6ff);
  transition: width 90ms linear;
}

.ps-confidence .locked {
  background: linear-gradient(90deg, #33f0a1, #d8ffe9);
}

.ps-readout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.ps-readout div {
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.055);
}

.ps-readout strong {
  display: block;
  overflow: hidden;
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.86);
  font-size: 12px;
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ps-primary,
.ps-soft {
  min-height: 46px;
  border: 0;
  border-radius: 14px;
  font: inherit;
  font-weight: 950;
  cursor: pointer;
}

.ps-primary {
  flex: 1;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #dff8ff, #7fdbff);
  color: #071018;
  box-shadow: 0 14px 34px rgba(127, 219, 255, 0.18);
}

.ps-primary:disabled {
  opacity: 0.58;
  cursor: not-allowed;
}

.ps-soft {
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.075);
  color: rgba(255, 255, 255, 0.78);
}

.ps-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(7, 16, 24, 0.2);
  border-top-color: #071018;
}

.ps-previews {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.ps-previews figure {
  position: relative;
  aspect-ratio: 1.72 / 1;
  overflow: hidden;
  margin: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.07);
}

.ps-previews img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ps-previews figcaption {
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
  grid-template-columns: repeat(2, 1fr);
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
  letter-spacing: 0.12em;
  text-transform: uppercase;
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
  color: #7fdbff;
  font: inherit;
  font-size: 19px;
  font-weight: 950;
}

.ps-dims em {
  color: rgba(255, 255, 255, 0.36);
  font-size: 11px;
  font-style: normal;
  font-weight: 850;
}

.ps-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.ps-chips button {
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

.ps-chips .on {
  border-color: rgba(127, 219, 255, 0.9);
  background: rgba(127, 219, 255, 0.14);
  color: #7fdbff;
}

.ps-actions {
  display: flex;
  gap: 10px;
}

@keyframes ps-spin {
  to { transform: rotate(360deg); }
}

@keyframes ps-scan {
  0%, 100% { top: 12%; opacity: 0.25; }
  50% { top: 84%; opacity: 1; }
}

@keyframes ps-pulse {
  from { opacity: 0.36; transform: scale(0.96); }
  to { opacity: 0; transform: scale(1.08); }
}

@keyframes ps-flash {
  from { opacity: 1; }
  to { opacity: 0; }
}

@media (min-width: 560px) {
  .ps {
    align-items: center;
  }

  .ps-shell {
    max-height: 94dvh;
    border-radius: 26px;
  }
}
</style>
