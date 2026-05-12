<template>
  <div class="arc-device">
    <div class="lcd-bar">
      <span>◉ LIVE TRIP MAP / med · v1</span>
      <span class="live-rec">REC</span>
    </div>
    <canvas ref="canvasEl" class="arc-canvas"></canvas>
    <div class="device-feet">
      <div class="foot"></div>
      <div class="foot"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvasEl = ref(null)
let raf = null
let resizeFn = null

const cities = [
  { name: 'TUNIS',     lat: 36.8,  lng: 10.2  },
  { name: 'SFAX',      lat: 34.7,  lng: 10.7  },
  { name: 'PARIS',     lat: 48.85, lng: 2.35  },
  { name: 'LONDON',    lat: 51.5,  lng: -0.1  },
  { name: 'MARSEILLE', lat: 43.3,  lng: 5.4   },
  { name: 'ROME',      lat: 41.9,  lng: 12.5  },
  { name: 'ALGIERS',   lat: 36.7,  lng: 3.05  },
  { name: 'CASABLANCA',lat: 33.6,  lng: -7.6  },
  { name: 'ISTANBUL',  lat: 41.0,  lng: 28.97 },
  { name: 'CAIRO',     lat: 30.04, lng: 31.24 },
  { name: 'BERLIN',    lat: 52.5,  lng: 13.4  },
  { name: 'MADRID',    lat: 40.4,  lng: -3.7  },
  { name: 'DUBAI',     lat: 25.2,  lng: 55.27 },
  { name: 'DAKAR',     lat: 14.7,  lng: -17.4 },
]

const arcs = [
  [0,2],[0,3],[1,4],[6,5],[7,2],[0,8],[9,10],[13,11],[0,12],
]

function project(lat, lng, w, h) {
  const minLng=-22, maxLng=60, minLat=8, maxLat=60
  const x = (lng - minLng) / (maxLng - minLng) * w
  const y = (maxLat - lat) / (maxLat - minLat) * h
  return [x, y]
}

onMounted(() => {
  const canvas = canvasEl.value
  const ctx    = canvas.getContext('2d')
  const dpr    = Math.min(2, window.devicePixelRatio || 1)

  resizeFn = () => {
    const r       = canvas.getBoundingClientRect()
    canvas.width  = r.width  * dpr
    canvas.height = r.height * dpr
  }
  resizeFn()
  window.addEventListener('resize', resizeFn)

  const t0 = performance.now()

  function draw(now) {
    const w  = canvas.width, h = canvas.height
    const ww = w / dpr,      hh = h / dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, ww, hh)

    // dot grid
    ctx.fillStyle = 'rgba(155,184,122,.10)'
    const gap = 9
    for (let x = 4; x < ww; x += gap)
      for (let y = 4; y < hh; y += gap) {
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI*2); ctx.fill()
      }

    // land masses
    ctx.fillStyle = 'rgba(155,184,122,.22)'
    const land = (path) => {
      ctx.beginPath()
      path.forEach(([la,ln], i) => {
        const [x,y] = project(la, ln, ww, hh)
        i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y)
      })
      ctx.closePath(); ctx.fill()
    }
    land([[33,-10],[36,-2],[37,11],[35,22],[31,32],[22,36],[14,42],[6,48],[-3,42],[-2,18],[6,8],[14,-15],[20,-18],[27,-15]])
    land([[36,-10],[44,-9],[51,-5],[58,0],[60,15],[58,28],[55,40],[48,38],[44,28],[40,18],[36,8]])
    land([[37,28],[40,38],[36,48],[28,52],[22,56],[18,50],[24,40],[30,33]])

    const T = (now - t0) / 1000

    // city dots
    cities.forEach(c => {
      const [x,y] = project(c.lat, c.lng, ww, hh)
      ctx.fillStyle = '#9bb87a'
      ctx.beginPath(); ctx.arc(x,y, 2.4, 0, Math.PI*2); ctx.fill()
    })

    // arcs + pulses
    arcs.forEach(([a,b], i) => {
      const A = cities[a], B = cities[b]
      const [ax,ay] = project(A.lat, A.lng, ww, hh)
      const [bx,by] = project(B.lat, B.lng, ww, hh)
      const mx = (ax+bx)/2
      const my = (ay+by)/2 - 60 - Math.abs(bx-ax)*0.18

      // solid goldenrod arc
      ctx.setLineDash([])
      ctx.strokeStyle = 'rgba(212,164,24,.55)'
      ctx.lineWidth = 1.4
      ctx.beginPath(); ctx.moveTo(ax,ay); ctx.quadraticCurveTo(mx,my,bx,by); ctx.stroke()

      // dotted stamp-red overlay
      ctx.setLineDash([2,4])
      ctx.strokeStyle = 'rgba(207,58,44,.4)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(ax,ay); ctx.quadraticCurveTo(mx,my,bx,by); ctx.stroke()
      ctx.setLineDash([])

      // traveling pulse
      const phase = (T * 0.18 + i * 0.13) % 1
      const px = (1-phase)*(1-phase)*ax + 2*(1-phase)*phase*mx + phase*phase*bx
      const py = (1-phase)*(1-phase)*ay + 2*(1-phase)*phase*my + phase*phase*by
      const ring = (Math.sin(T*4+i)+1)/2

      ctx.strokeStyle = `rgba(232,90,139,${0.6 - ring*0.4})`
      ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.arc(px,py, 4+ring*8, 0, Math.PI*2); ctx.stroke()

      ctx.fillStyle = '#e85a8b'
      ctx.beginPath(); ctx.arc(px,py, 3.6, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = '#fff8e2'
      ctx.beginPath(); ctx.arc(px,py, 1.6, 0, Math.PI*2); ctx.fill()
    })

    // city labels (Tunis/Sfax/Paris/London/Casablanca)
    ctx.font = "600 11px 'Montserrat', sans-serif"
    ;[0,1,2,3,7].forEach(idx => {
      const c = cities[idx]
      const [x,y] = project(c.lat, c.lng, ww, hh)
      ctx.fillStyle = '#cf3a2c'
      ctx.beginPath(); ctx.arc(x,y, 4.6, 0, Math.PI*2); ctx.fill()
      ctx.strokeStyle = '#0d1230'; ctx.lineWidth = 1.4; ctx.stroke()
      ctx.fillStyle = '#f4ecd8'
      ctx.fillText(c.name, x+8, y-6)
    })

    // scanline
    const sy = (Math.sin(T*0.6)*0.5+0.5)*hh
    ctx.fillStyle = 'rgba(155,184,122,.06)'
    ctx.fillRect(0, sy-1, ww, 2)

    raf = requestAnimationFrame(draw)
  }
  raf = requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  if (resizeFn) window.removeEventListener('resize', resizeFn)
})
</script>

<style scoped>
.arc-device {
  background: #0d1230;
  border: 3px solid #171a3a;
  border-radius: 32px;
  box-shadow: 8px 8px 0 #171a3a;
  padding: 14px 14px 0;
  outline: 2px dashed rgba(155,184,122,.25);
  outline-offset: -8px;
  display: flex;
  flex-direction: column;
}

.lcd-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px 10px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 10px;
  letter-spacing: 0.04em;
  color: #9bb87a;
}

.live-rec {
  color: #cf3a2c;
  display: flex;
  align-items: center;
  gap: 5px;
  animation: lpLcdPulse 1.2s ease-in-out infinite;
}
.live-rec::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #cf3a2c;
  animation: lpLcdPulse 1.2s ease-in-out infinite;
}

.arc-canvas {
  width: 100%;
  height: 380px;
  display: block;
  border-radius: 18px;
}

.device-feet {
  display: flex;
  justify-content: center;
  gap: 60px;
  padding: 6px 0 10px;
}
.foot {
  width: 28px; height: 8px;
  background: #0d1230;
  border: 2px solid #171a3a;
  border-radius: 0 0 6px 6px;
  border-top: none;
}

@keyframes lpLcdPulse {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.35; }
}
</style>
