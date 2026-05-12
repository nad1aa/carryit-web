<template>
  <div
    ref="el"
    class="sticker"
    :style="stickerStyle"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <img :src="src" :alt="alt" draggable="false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  src:      { type: String,  required: true },
  top:      { type: String,  default: undefined },
  left:     { type: String,  default: undefined },
  right:    { type: String,  default: undefined },
  size:     { type: Number,  default: 120 },
  rotation: { type: Number,  default: 0 },
  parallax: { type: Number,  default: 0.15 },
  duration: { type: Number,  default: 6 },
  z:        { type: Number,  default: 5 },
  alt:      { type: String,  default: '' },
})

const el   = ref(null)
const drag = ref(null)          // { startX, startY, baseX, baseY }
const pos  = ref({ dx: 0, dy: 0 })

const stickerStyle = computed(() => ({
  position:       'absolute',
  top:            props.top,
  left:           props.left,
  right:          props.right,
  width:          props.size + 'px',
  zIndex:         props.z,
  transform:      `translate3d(calc(${pos.value.dx}px + var(--tx,0px)), calc(${pos.value.dy}px + var(--scrollY,0px) + var(--ty,0px)), 0) rotate(${props.rotation}deg) rotateX(var(--tiltY,0deg)) rotateY(var(--tiltX,0deg))`,
  animation:      drag.value ? 'none' : `floaty ${props.duration}s ease-in-out infinite`,
  animationDelay: `${Math.abs(props.rotation * 0.05) % 3}s`,
  cursor:         drag.value ? 'grabbing' : 'grab',
}))

function onScroll() {
  if (!el.value) return
  el.value.style.setProperty('--scrollY', `${-(window.scrollY * props.parallax)}px`)
}

function onMouseMove(e) {
  if (!el.value) return
  const r  = el.value.getBoundingClientRect()
  const cx = r.left + r.width  / 2
  const cy = r.top  + r.height / 2
  const tx = Math.max(-1, Math.min(1, (e.clientX - cx) / 600))
  const ty = Math.max(-1, Math.min(1, (e.clientY - cy) / 600))
  el.value.style.setProperty('--tiltX', `${tx * 8}deg`)
  el.value.style.setProperty('--tiltY', `${-ty * 8}deg`)
}

function onPointerDown(e) {
  e.preventDefault()
  el.value.setPointerCapture(e.pointerId)
  drag.value = { startX: e.clientX, startY: e.clientY, baseX: pos.value.dx, baseY: pos.value.dy }
}

function onPointerMove(e) {
  if (!drag.value) return
  pos.value = {
    dx: drag.value.baseX + (e.clientX - drag.value.startX),
    dy: drag.value.baseY + (e.clientY - drag.value.startY),
  }
}

function onPointerUp(e) {
  if (el.value) el.value.releasePointerCapture(e.pointerId)
  drag.value = null
}

onMounted(() => {
  window.addEventListener('scroll',    onScroll,    { passive: true })
  window.addEventListener('mousemove', onMouseMove)
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll',    onScroll)
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<style scoped>
.sticker {
  filter: drop-shadow(2px 5px 0 rgba(23,26,58,.18)) drop-shadow(0 12px 18px rgba(23,26,58,.18));
  will-change: transform;
  transform-style: preserve-3d;
  user-select: none;
  touch-action: none;
}
.sticker:hover {
  transform: scale(1.06);
}
.sticker img {
  width: 100%;
  height: auto;
  display: block;
  pointer-events: none;
}
</style>
