<template>
  <teleport to="body">
    <div class="ps" role="dialog" aria-modal="true">
      <div class="ps-sheet">
        <header class="ps-hdr">
          <button class="ps-icon-btn" @click="handleClose" aria-label="Close">x</button>

          <div class="ps-hdr-center">
            <span class="ps-hdr-title">{{ title }}</span>
            <div class="ps-dots">
              <span
                v-for="i in 3"
                :key="i"
                class="ps-dot"
                :class="{ on: phaseIdx >= i, done: phaseIdx > i }"
              />
            </div>
          </div>

          <div class="ps-hdr-spacer" />
        </header>

        <div class="ps-viewport" ref="viewportRef">
          <div v-if="phase === 'loading'" class="ps-state">
            <div class="ps-ring" />
            <p>{{ loadMsg }}</p>
          </div>

          <div v-else-if="phase === 'error'" class="ps-state">
            <div class="ps-error-mark">!</div>
            <p>{{ errTitle }}</p>
            <span>{{ errSub }}</span>
            <button class="ps-small-btn" @click="init">Try again</button>
          </div>

          <template v-else-if="isCameraPhase">
            <video
              ref="videoRef"
              class="ps-video"
              autoplay
              playsinline
              muted
              :class="{ frozen }"
            />
            <canvas ref="workRef" class="ps-hidden" />

            <div class="ps-guide" :class="{ good: readyToCapture }">
              <svg class="ps-corners" viewBox="0 0 200 200" fill="none">
                <path d="M8 44 L8 8 L44 8" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
                <path d="M156 8 L192 8 L192 44" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
                <path d="M8 156 L8 192 L44 192" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
                <path d="M156 192 L192 192 L192 156" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
              </svg>

              <div v-if="!bboxStyle" class="ps-scanline" />
              <div class="ps-phase-tag">{{ phase === 'top' ? 'TOP VIEW' : 'SIDE VIEW' }}</div>
            </div>

            <div
              v-if="bboxStyle && !frozen"
              class="ps-bbox"
              :class="{ stable: readyToCapture }"
              :style="bboxStyle"
            />

            <div v-if="readyToCapture && !frozen" class="ps-auto-badge">
              Hold still...
            </div>

            <div v-if="flash" class="ps-flash" />
          </template>

          <template v-else-if="phase === 'result'">
            <canvas ref="resultRef" class="ps-result-canvas" />
            <div class="ps-result-badge">Scan complete</div>
          </template>
        </div>

        <div class="ps-panel">
          <p class="ps-hint">{{ hint }}</p>

          <template v-if="isCameraPhase">
            <div class="ps-quality">
              <span>{{ scanMessage }}</span>
              <strong>{{ confidence }}%</strong>
            </div>

            <div class="ps-meter">
              <div
                class="ps-meter-fill"
                :style="{ width: confidence + '%', background: readyToCapture ? '#22c55e' : '#e8dfa0' }"
              />
            </div>

            <button class="ps-capture" :disabled="busy" @click="captureCurrent">
              <span v-if="busy" class="ps-spinner" />
              <span v-else>{{ phase === 'top' ? 'Capture top view' : 'Capture side view' }}</span>
            </button>
          </template>

          <template v-if="phase === 'result'">
            <div class="ps-dims">
              <div v-for="f in FIELDS" :key="f.key" class="ps-dim-cell">
                <label>{{ f.lbl }}</label>
                <div class="ps-dim-row">
                  <input
                    v-model.number="res[f.key]"
                    type="number"
                    :min="f.min"
                    :max="f.max"
                    :step="f.step"
                    inputmode="decimal"
                  />
                  <span>{{ f.unit }}</span>
                </div>
              </div>
            </div>

            <div class="ps-shape-row">
              <span>Shape</span>
              <button
                v-for="s in SHAPES"
                :key="s.id"
                class="ps-chip"
                :class="{ on: res.shape === s.id }"
                @click="res.shape = s.id"
              >
                {{ s.label }}
              </button>
            </div>

            <div class="ps-actions">
              <button class="ps-secondary" @click="restart">Retake</button>
              <button class="ps-primary" @click="confirm">Use this scan</button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

const emit = defineEmits(['close', 'confirm'])

const CONFIG = {
  guideRatio: 0.76,
  referenceCm: 26,
  detectEveryMs: 160,
  stableFrames: 8,
  stableIou: 0.74,
  autoCaptureMs: 1100,
  minObjectRatio: 0.012,
  maxObjectRatio: 0.86,
  minContrast: 24,
  minEdge: 42,
  minSharpness: 8,
  smoothing: 0.35,
}

const TITLES = {
  loading: 'Starting camera...',
  error: 'Camera error',
  top: 'Top-down scan',
  side: 'Side scan',
  result: 'Confirm dimensions',
}

const HINTS = {
  loading: 'Allow camera access when prompted.',
  error: 'Camera could not start.',
  top: 'Place the item on a plain light surface and fill the guide.',
  side: 'Show the side of the item at the same distance.',
  result: 'Adjust any value if needed, then confirm.',
}

const SHAPES = [
  { id: 'box', label: 'Box' },
  { id: 'cylinder', label: 'Cylinder' },
  { id: 'bag', label: 'Bag / Soft' },
  { id: 'envelope', label: 'Envelope' },
  { id: 'irregular', label: 'Irregular' },
]

const FIELDS = [
  { key: 'length', lbl: 'Length', unit: 'cm', min: 1, max: 300, step: 1 },
  { key: 'width', lbl: 'Width', unit: 'cm', min: 1, max: 300, step: 1 },
  { key: 'height', lbl: 'Height', unit: 'cm', min: 1, max: 300, step: 1 },
  { key: 'weight', lbl: 'Weight', unit: 'kg', min: 0.1, max: 100, step: 0.1 },
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
const resultRef = ref(null)

const bboxStyle = ref(null)
const confidence = ref(0)
const scanMessage = ref('Looking for object...')
const stablePct = ref(0)

const topDims = ref(null)
const res = ref({ length: 0, width: 0, height: 0, weight: 0, shape: 'box' })

let mediaStream = null
let detectTimer = null
let autoTimer = null
let autoFired = false
let stableHistory = []
let lastBox = null
let lastGoodResult = null
let lastFrameCanvas = null

const isCameraPhase = computed(() => phase.value === 'top' || phase.value === 'side')
const title = computed(() => TITLES[phase.value] || '')
const hint = computed(() => HINTS[phase.value] || '')
const phaseIdx = computed(() => ({ top: 1, side: 2, result: 3 }[phase.value] || 0))
const readyToCapture = computed(() => stablePct.value >= 100 && confidence.value >= 65)

onMounted(init)
onUnmounted(() => {
  stopLoop()
  stopStream()
})

async function init() {
  stopLoop()
  stopStream()
  resetScanState()

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

    phase.value = 'top'
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
    errTitle.value = permissionErrorTitle(e)
    errSub.value = permissionErrorSub(e)
    phase.value = 'error'
  }
}

function waitForVideo(video) {
  return new Promise((resolve, reject) => {
    const start = Date.now()

    const tick = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) return resolve()
      if (Date.now() - start > 6000) return reject(new Error('No camera frames received.'))
      requestAnimationFrame(tick)
    }

    tick()
  })
}

function startLoop() {
  stopLoop()
  autoFired = false
  detectTimer = window.setInterval(detect, CONFIG.detectEveryMs)
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

  const result = analyzeFrame(video, canvas)

  if (!result) {
    bboxStyle.value = lastBox ? normToStyle(lastBox.norm) : null
    confidence.value = Math.max(0, confidence.value - 12)
    stablePct.value = 0
    stableHistory = []
    scanMessage.value = 'Move item onto a plain light surface'
    return
  }

  lastGoodResult = result
  lastBox = smoothBox(lastBox, result)
  bboxStyle.value = normToStyle(lastBox.norm)

  confidence.value = result.confidence
  scanMessage.value = result.message

  trackStability(result.rawBbox)
}

function analyzeFrame(video, canvas) {
  const vW = video.videoWidth
  const vH = video.videoHeight
  if (!vW || !vH) return null

  canvas.width = vW
  canvas.height = vH

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(video, 0, 0)

  rememberFrame(canvas)

  const size = Math.round(Math.min(vW, vH) * CONFIG.guideRatio)
  const ox = Math.round((vW - size) / 2)
  const oy = Math.round((vH - size) / 2)
  const img = ctx.getImageData(ox, oy, size, size)
  const data = img.data
  const total = size * size
  const gray = new Uint8Array(total)

  let brightness = 0

  for (let i = 0; i < data.length; i += 4) {
    const g = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    gray[i / 4] = g
    brightness += g
  }

  brightness /= total

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

  const sharpness = edgeEnergy / total

  if (brightness < 35) return qualityFail('Too dark', 15)
  if (brightness > 235) return qualityFail('Too bright', 20)
  if (sharpness < CONFIG.minSharpness) return qualityFail('Hold steady', 25)
  if (hits < 260) return null

  const boxW = maxX - minX
  const boxH = maxY - minY
  const areaRatio = (boxW * boxH) / total

  if (boxW < 24 || boxH < 24) return null
  if (areaRatio < CONFIG.minObjectRatio) return qualityFail('Move closer', 35)
  if (areaRatio > CONFIG.maxObjectRatio) return qualityFail('Move farther', 38)

  const pxPerCm = size / CONFIG.referenceCm
  const dimA = roundCm(boxW / pxPerCm)
  const dimB = roundCm(boxH / pxPerCm)

  const fill = Math.min(1, hits / Math.max(1, boxW * boxH))
  const sizeScore = clamp(areaRatio / 0.28, 0, 1)
  const sharpScore = clamp(sharpness / 28, 0, 1)
  const fillScore = clamp(fill / 0.32, 0, 1)
  const conf = Math.round((sizeScore * 0.35 + sharpScore * 0.35 + fillScore * 0.30) * 100)

  return {
    dimA,
    dimB,
    confidence: conf,
    message: conf > 70 ? 'Good scan' : 'Center item and hold steady',
    solidity: fill,
    rawBbox: [ox + minX, oy + minY, boxW, boxH],
    norm: {
      x: minX / size,
      y: minY / size,
      w: boxW / size,
      h: boxH / size,
    },
  }
}

function qualityFail(message, confidenceValue) {
  scanMessage.value = message
  confidence.value = confidenceValue
  stablePct.value = 0
  stableHistory = []
  return null
}

function estimateBackground(gray, size) {
  const samples = []
  const edge = Math.max(6, Math.round(size * 0.06))

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

function smoothBox(prev, next) {
  if (!prev) return next

  const a = CONFIG.smoothing
  const norm = {
    x: prev.norm.x + (next.norm.x - prev.norm.x) * a,
    y: prev.norm.y + (next.norm.y - prev.norm.y) * a,
    w: prev.norm.w + (next.norm.w - prev.norm.w) * a,
    h: prev.norm.h + (next.norm.h - prev.norm.h) * a,
  }

  return { ...next, norm }
}

function trackStability(bbox) {
  stableHistory.push({ bbox, t: Date.now(), result: lastGoodResult })
  if (stableHistory.length > CONFIG.stableFrames) stableHistory.shift()

  if (stableHistory.length < CONFIG.stableFrames) {
    stablePct.value = Math.round((stableHistory.length / CONFIG.stableFrames) * 55)
    return
  }

  const first = stableHistory[0]
  const last = stableHistory[stableHistory.length - 1]
  const iou = bboxIoU(first.bbox, last.bbox)

  if (iou < CONFIG.stableIou) {
    stablePct.value = 0
    stableHistory = []
    autoFired = false
    return
  }

  const elapsed = Date.now() - first.t
  stablePct.value = Math.min(100, Math.round((elapsed / CONFIG.autoCaptureMs) * 100))

  if (readyToCapture.value && !autoFired) {
    autoFired = true
    autoTimer = window.setTimeout(captureCurrent, 120)
  }
}

async function captureCurrent() {
  if (phase.value === 'top') await captureTop()
  else if (phase.value === 'side') await captureSide()
}

async function captureTop() {
  if (busy.value) return

  busy.value = true
  frozen.value = true
  stopLoop()
  doFlash()

  await sleep(140)

  const found = lastGoodResult || analyzeFrame(videoRef.value, workRef.value)

  topDims.value = found
    ? medianDims(stableHistory, found)
    : { dimA: 20, dimB: 15, shape: 'box' }

  topDims.value.shape = guessShape(topDims.value)

  resetScanState()
  frozen.value = false
  busy.value = false
  phase.value = 'side'

  await nextTick()
  startLoop()
}

async function captureSide() {
  if (busy.value) return

  busy.value = true
  frozen.value = true
  stopLoop()
  doFlash()

  await sleep(140)

  const found = lastGoodResult || analyzeFrame(videoRef.value, workRef.value)
  const side = found ? medianDims(stableHistory, found) : null
  const top = topDims.value || { dimA: 20, dimB: 15, shape: 'box' }

  const length = Math.max(top.dimA, top.dimB)
  const width = Math.min(top.dimA, top.dimB)
  const height = side ? Math.min(side.dimA, side.dimB) : Math.max(3, Math.round(width / 3))

  res.value = {
    length,
    width,
    height,
    weight: estimateWeight(length, width, height, top.shape),
    shape: top.shape,
  }

  frozen.value = false
  busy.value = false
  phase.value = 'result'

  await nextTick()
  drawResultPreview()
}

function medianDims(history, fallback) {
  const items = history.map(x => x.result).filter(Boolean)
  if (!items.length) return { dimA: fallback.dimA, dimB: fallback.dimB, solidity: fallback.solidity }

  const a = items.map(x => x.dimA).sort((x, y) => x - y)
  const b = items.map(x => x.dimB).sort((x, y) => x - y)
  const mid = Math.floor(items.length / 2)
  const solid = items.reduce((sum, x) => sum + x.solidity, 0) / items.length

  return {
    dimA: a[mid],
    dimB: b[mid],
    solidity: solid,
  }
}

function drawResultPreview() {
  const canvas = resultRef.value
  if (!canvas || !lastFrameCanvas) return

  canvas.width = lastFrameCanvas.width
  canvas.height = lastFrameCanvas.height
  canvas.getContext('2d').drawImage(lastFrameCanvas, 0, 0)
}

function rememberFrame(source) {
  if (!lastFrameCanvas) lastFrameCanvas = document.createElement('canvas')
  lastFrameCanvas.width = source.width
  lastFrameCanvas.height = source.height
  lastFrameCanvas.getContext('2d').drawImage(source, 0, 0)
}

function restart() {
  resetScanState()
  topDims.value = null
  res.value = { length: 0, width: 0, height: 0, weight: 0, shape: 'box' }
  phase.value = 'top'
  nextTick(startLoop)
}

function resetScanState() {
  bboxStyle.value = null
  confidence.value = 0
  stablePct.value = 0
  scanMessage.value = 'Looking for object...'
  stableHistory = []
  lastBox = null
  lastGoodResult = null
  autoFired = false
  if (autoTimer) window.clearTimeout(autoTimer)
  autoTimer = null
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
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
}

function permissionErrorTitle(e) {
  if (e?.name === 'NotAllowedError') return 'Camera access denied'
  if (e?.name === 'NotFoundError') return 'No camera found'
  if (e?.name === 'NotReadableError') return 'Camera already in use'
  return 'Could not start camera'
}

function permissionErrorSub(e) {
  if (e?.name === 'NotAllowedError') return 'Allow camera access in browser settings, then try again.'
  if (e?.name === 'NotFoundError') return 'No accessible camera was found on this device.'
  if (e?.name === 'NotReadableError') return 'Close other apps using the camera and try again.'
  return e?.message || 'Please reload and allow camera access when prompted.'
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

function guessShape({ dimA, dimB, solidity = 0.7 }) {
  const ratio = Math.max(dimA, dimB) / Math.max(1, Math.min(dimA, dimB))
  if (Math.min(dimA, dimB) <= 3) return 'envelope'
  if (solidity < 0.22) return 'bag'
  if (ratio < 1.22 && solidity > 0.34) return 'cylinder'
  return 'box'
}

function estimateWeight(l, w, h, shape) {
  const volume = l * w * h
  const density = {
    box: 0.00028,
    cylinder: 0.00035,
    bag: 0.00022,
    envelope: 0.00008,
    irregular: 0.00025,
  }[shape] || 0.00025

  return Math.max(0.1, Math.round(volume * density * 10) / 10)
}

function roundCm(value) {
  return Math.max(1, Math.round(value))
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
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
  background: rgba(0, 0, 0, 0.88);
  font-family: Montserrat, system-ui, sans-serif;
}

.ps-sheet {
  width: 100%;
  max-width: 540px;
  max-height: 97dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #0e0e0e;
  border-radius: 22px 22px 0 0;
}

.ps-hdr {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.ps-icon-btn,
.ps-hdr-spacer {
  width: 32px;
  height: 32px;
}

.ps-icon-btn {
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.75);
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
}

.ps-hdr-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.ps-hdr-title {
  color: #fff;
  font-size: 13px;
  font-weight: 800;
}

.ps-dots {
  display: flex;
  gap: 6px;
}

.ps-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
}

.ps-dot.on {
  background: #e8dfa0;
}

.ps-dot.done {
  background: #22c55e;
}

.ps-viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #000;
}

.ps-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 28px;
  text-align: center;
  color: #fff;
}

.ps-state p {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
}

.ps-state span {
  max-width: 300px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 12px;
  line-height: 1.45;
}

.ps-ring,
.ps-spinner {
  border-radius: 50%;
  animation: ps-spin 0.8s linear infinite;
}

.ps-ring {
  width: 42px;
  height: 42px;
  border: 3px solid rgba(255, 255, 255, 0.12);
  border-top-color: #e8dfa0;
}

.ps-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(17, 17, 17, 0.2);
  border-top-color: #111;
}

.ps-error-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 2px solid #ef4444;
  border-radius: 50%;
  color: #ef4444;
  font-weight: 900;
}

.ps-video,
.ps-result-canvas {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.ps-video.frozen {
  filter: brightness(0.8);
}

.ps-hidden {
  display: none;
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
  filter: drop-shadow(0 0 8px rgba(232, 223, 160, 0.35));
}

.ps-guide.good .ps-corners {
  color: #22c55e;
  filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.45));
}

.ps-scanline {
  position: absolute;
  left: 12%;
  right: 12%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #e8dfa0, transparent);
  animation: ps-scan 2.1s ease-in-out infinite;
}

.ps-phase-tag {
  position: absolute;
  bottom: 10px;
  padding: 5px 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.65);
  color: #e8dfa0;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.ps-bbox {
  position: absolute;
  border: 2px solid rgba(232, 223, 160, 0.9);
  border-radius: 6px;
  box-shadow: 0 0 0 1px rgba(232, 223, 160, 0.22);
  pointer-events: none;
  transition: left 0.12s, top 0.12s, width 0.12s, height 0.12s;
}

.ps-bbox.stable {
  border-color: #22c55e;
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.28);
}

.ps-auto-badge,
.ps-result-badge {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.76);
  color: #22c55e;
  border: 1.5px solid #22c55e;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.ps-auto-badge {
  top: 10px;
  padding: 6px 14px;
}

.ps-result-badge {
  bottom: 12px;
  padding: 7px 16px;
}

.ps-flash {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  animation: ps-flash 0.22s ease-out forwards;
  pointer-events: none;
}

.ps-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px max(18px, env(safe-area-inset-bottom, 18px));
}

.ps-hint {
  margin: 0;
  color: rgba(255, 255, 255, 0.46);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
}

.ps-quality {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 11px;
  font-weight: 700;
}

.ps-quality strong {
  color: #e8dfa0;
}

.ps-meter {
  height: 4px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

.ps-meter-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.2s, background 0.2s;
}

.ps-capture,
.ps-primary,
.ps-secondary,
.ps-small-btn {
  min-height: 44px;
  border: 0;
  border-radius: 12px;
  font-family: inherit;
  font-weight: 900;
  cursor: pointer;
}

.ps-capture {
  display: grid;
  place-items: center;
  background: #e8dfa0;
  color: #111;
  font-size: 14px;
}

.ps-capture:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ps-small-btn {
  min-height: 36px;
  padding: 0 18px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.ps-dims {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.ps-dim-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ps-dim-cell label,
.ps-shape-row > span {
  color: rgba(255, 255, 255, 0.34);
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.ps-dim-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 11px;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.07);
}

.ps-dim-row input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #e8dfa0;
  font: inherit;
  font-size: 18px;
  font-weight: 900;
}

.ps-dim-row span {
  color: rgba(255, 255, 255, 0.34);
  font-size: 11px;
  font-weight: 700;
}

.ps-shape-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ps-chip {
  padding: 6px 11px;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.54);
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.ps-chip.on {
  border-color: #e8dfa0;
  background: rgba(232, 223, 160, 0.14);
  color: #e8dfa0;
}

.ps-actions {
  display: flex;
  gap: 10px;
}

.ps-secondary {
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.68);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
}

.ps-primary {
  flex: 1;
  background: #2230a0;
  color: #e8dfa0;
}

@keyframes ps-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ps-scan {
  0%,
  100% {
    top: 12%;
    opacity: 0.3;
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

@media (min-width: 540px) {
  .ps {
    align-items: center;
  }

  .ps-sheet {
    border-radius: 22px;
    max-height: 92dvh;
  }
}
</style>