<template>
  <div class="pt">
    <header class="pt-header">
      <button class="pt-back" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="pt-header-title">Post a Trip</span>
      <div style="width:36px"/>
    </header>

    <main class="pt-body">
      <p class="pt-eyebrow">New trip</p>
      <h1 class="pt-heading">where are<br>you going?</h1>

      <!-- Route visual -->
      <div class="pt-route-card">
        <div class="pt-route-field">
          <label class="pt-label">From</label>
          <input v-model="form.from" class="pt-input" type="text" placeholder="Departure city"/>
        </div>
        <div class="pt-route-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
        <div class="pt-route-field">
          <label class="pt-label">To</label>
          <input v-model="form.to" class="pt-input" type="text" placeholder="Destination city"/>
        </div>
      </div>

      <!-- Date + capacity -->
      <div class="pt-fields-2col">
        <div class="pt-field">
          <label class="pt-label">Departure date</label>
          <input v-model="form.date" class="pt-input" type="date"/>
        </div>
        <div class="pt-field">
          <label class="pt-label">Arrival date</label>
          <input v-model="form.arrDate" class="pt-input" type="date"/>
        </div>
      </div>

      <!-- Capacity slider -->
      <div class="pt-field">
        <div class="pt-label-row">
          <label class="pt-label">Available capacity</label>
          <span class="pt-capacity-val">{{ form.capacity }} kg</span>
        </div>
        <input type="range" class="pt-slider" v-model.number="form.capacity" min="1" max="30" step="0.5"/>
        <div class="pt-slider-marks"><span>1kg</span><span>15kg</span><span>30kg</span></div>
      </div>

      <!-- Transport mode -->
      <div class="pt-field">
        <label class="pt-label">How are you travelling?</label>
        <div class="pt-transport-chips">
          <button
            v-for="m in transportModes"
            :key="m.id"
            class="pt-chip"
            :class="{ active: form.transport === m.id }"
            @click="form.transport = m.id"
          >
            <component :is="m.icon" />
            {{ m.label }}
          </button>
        </div>
      </div>

      <!-- Price -->
      <div class="pt-field">
        <label class="pt-label">Your price per kg (DT)</label>
        <div class="pt-price-input-wrap">
          <input v-model.number="form.price" class="pt-input pt-price-input" type="number" placeholder="25" min="1" step="0.5"/>
          <span class="pt-price-suffix">DT/kg</span>
        </div>
        <div class="pt-price-rec">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b6d11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Recommended: 20–35 DT/kg for this route
        </div>
      </div>

      <!-- Notes -->
      <div class="pt-field">
        <label class="pt-label">What can you carry?</label>
        <textarea v-model="form.notes" class="pt-textarea" rows="3" placeholder="Documents, electronics, fashion items, no liquids..."/>
      </div>

      <!-- Earnings preview -->
      <div class="pt-earnings-card">
        <div class="pt-earnings-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </svg>
        </div>
        <div class="pt-earnings-text">
          <span class="pt-earnings-title">Estimated earnings</span>
          <span class="pt-earnings-val">{{ (form.capacity * (form.price || 25) * 0.9).toFixed(0) }} DT if fully booked</span>
        </div>
      </div>
    </main>

    <div class="pt-cta">
      <button class="pt-cta-btn" @click="submit" :disabled="!form.from || !form.to || !form.date || loading">
        <span v-if="!loading">Post trip</span>
        <span v-else class="pt-spinner"/>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'

const router  = useRouter()
const loading = ref(false)
const form    = ref({ from: '', to: '', date: '', arrDate: '', capacity: 10, transport: 'plane', price: 8, notes: '' })

const Plane = defineComponent({ render: () => h('svg', { viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round', width:16, height:16 }, [h('path',{d:'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z'})]) })
const Car   = defineComponent({ render: () => h('svg', { viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round', width:16, height:16 }, [h('path',{d:'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-3'}),h('circle',{cx:'7',cy:'17',r:'2'}),h('circle',{cx:'17',cy:'17',r:'2'})]) })
const Train = defineComponent({ render: () => h('svg', { viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round', width:16, height:16 }, [h('rect',{x:'4',y:'3',width:'16',height:'14',rx:'2'}),h('path',{d:'M4 11h16'}),h('path',{d:'M12 3v8'}),h('circle',{cx:'8',cy:'20',r:'1'}),h('circle',{cx:'16',cy:'20',r:'1'})]) })
const Ship  = defineComponent({ render: () => h('svg', { viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round', width:16, height:16 }, [h('path',{d:'M2 20a4 4 0 008 0M14 20a4 4 0 008 0'}),h('path',{d:'M12 3v14'}),h('path',{d:'M5 10l7-7 7 7'})]) })
const Ferry = defineComponent({ render: () => h('svg', { viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round', width:16, height:16 }, [h('path',{d:'M18 9H6l-4 7h20l-4-7z'}),h('path',{d:'M12 9V4'}),h('path',{d:'M2 19c0 1.5 3 2 3 2s3-.5 3-2 3-2 3-2 3 .5 3 2 3 2 3 2'}),h('line',{x1:'2',y1:'16',x2:'22',y2:'16'})]) })

const transportModes = [
  { id:'plane', label:'Plane', icon:Plane },
  { id:'car',   label:'Car',   icon:Car   },
  { id:'train', label:'Train', icon:Train },
  { id:'boat',  label:'Boat',  icon:Ship  },
  { id:'ferry', label:'Ferry', icon:Ferry },
]

async function submit() {
  loading.value = true
  await new Promise(r => setTimeout(r, 900))
  loading.value = false
  router.push('/traveler/trips')
}
</script>

<style scoped>
.pt { min-height:100vh; background:#f0f0ee; font-family:'Montserrat',sans-serif; padding-bottom:88px; }
.pt-header {
  position:sticky; top:0; z-index:50;
  background:#111; color:#fff;
  display:flex; align-items:center; gap:12px;
  padding:0 16px; height:58px;
}
.pt-back { width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.08); border:none; border-radius:50%; color:#fff; cursor:pointer; transition:background 0.15s; }
.pt-back:hover { background:rgba(255,255,255,0.16); }
.pt-header-title { flex:1; font-weight:800; font-size:16px; }
.pt-body { padding:24px 16px; display:flex; flex-direction:column; gap:18px; }
.pt-eyebrow { font-size:10px; font-weight:800; letter-spacing:0.14em; text-transform:uppercase; color:rgba(17,17,17,0.38); margin:0; }
.pt-heading { font-size:clamp(26px,8vw,36px); font-weight:900; line-height:1.1; letter-spacing:-0.04em; color:#111; margin:0; }

/* Route card */
.pt-route-card {
  background:#fff; border-radius:14px; border:1.5px solid rgba(17,17,17,0.1);
  padding:16px; display:flex; align-items:center; gap:12px;
}
.pt-route-field { flex:1; display:flex; flex-direction:column; gap:5px; }
.pt-route-arrow { flex-shrink:0; }

/* Fields */
.pt-fields-2col { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.pt-field { display:flex; flex-direction:column; gap:6px; }
.pt-label { font-size:10px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:rgba(17,17,17,0.45); }
.pt-label-row { display:flex; align-items:center; justify-content:space-between; }
.pt-capacity-val { font-size:14px; font-weight:900; color:#2230a0; }
.pt-input {
  background:#fff; border:1.5px solid rgba(17,17,17,0.14); border-radius:10px;
  padding:11px 14px; font-family:'Montserrat',sans-serif; font-size:14px; font-weight:600;
  color:#111; outline:none; transition:border-color 0.15s; width:100%; box-sizing:border-box;
}
.pt-input:focus { border-color:#2230a0; }
.pt-input::placeholder { color:rgba(17,17,17,0.28); font-weight:500; }
.pt-textarea {
  background:#fff; border:1.5px solid rgba(17,17,17,0.14); border-radius:10px;
  padding:11px 14px; font-family:'Montserrat',sans-serif; font-size:14px; font-weight:500;
  color:#111; outline:none; resize:none; transition:border-color 0.15s; width:100%; box-sizing:border-box;
}
.pt-textarea:focus { border-color:#2230a0; }
.pt-textarea::placeholder { color:rgba(17,17,17,0.28); }

/* Slider */
.pt-slider { width:100%; -webkit-appearance:none; height:5px; background:linear-gradient(to right, #2230a0 calc((var(--v,10) - 1) / 29 * 100%), rgba(17,17,17,0.14) 0%); border-radius:99px; outline:none; cursor:pointer; }
.pt-slider::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; background:#2230a0; border-radius:50%; border:3px solid #fff; box-shadow:0 2px 8px rgba(34,48,160,0.3); }
.pt-slider-marks { display:flex; justify-content:space-between; font-size:10px; font-weight:600; color:rgba(17,17,17,0.35); }

/* Transport chips */
.pt-transport-chips { display:flex; flex-wrap:wrap; gap:8px; }
.pt-chip { display:flex; align-items:center; gap:6px; background:#fff; border:1.5px solid rgba(17,17,17,0.14); border-radius:99px; padding:7px 14px; font-family:'Montserrat',sans-serif; font-size:12px; font-weight:600; color:#111; cursor:pointer; transition:all 0.15s; }
.pt-chip.active { background:#2230a0; border-color:#2230a0; color:#e8dfa0; }
.pt-chip:hover:not(.active) { border-color:rgba(17,17,17,0.35); }

/* Price */
.pt-price-input-wrap { display:flex; align-items:center; gap:8px; }
.pt-price-input-wrap .pt-input { flex:1; }
.pt-price-suffix { font-size:13px; font-weight:700; color:rgba(17,17,17,0.45); white-space:nowrap; flex-shrink:0; }
.pt-price-input { padding-left:28px !important; }
.pt-price-rec { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:600; color:#3b6d11; }

/* Earnings */
.pt-earnings-card { display:flex; align-items:center; gap:12px; background:#eef0fc; border:1.5px solid #c0c8f0; border-radius:12px; padding:14px 16px; }
.pt-earnings-icon { width:38px; height:38px; background:#d4d8f8; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.pt-earnings-text { display:flex; flex-direction:column; gap:2px; }
.pt-earnings-title { font-size:11px; font-weight:700; color:rgba(17,17,17,0.5); }
.pt-earnings-val { font-size:16px; font-weight:900; color:#2230a0; }

/* CTA */
.pt-cta { position:fixed; bottom:0; left:0; right:0; background:#fff; border-top:1.5px solid rgba(17,17,17,0.1); padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px)); }
.pt-cta-btn { width:100%; background:#2230a0; color:#e8dfa0; border:none; border-radius:12px; padding:15px; font-family:'Montserrat',sans-serif; font-size:14px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; min-height:50px; transition:background 0.15s,opacity 0.15s; }
.pt-cta-btn:hover:not(:disabled) { background:#111; }
.pt-cta-btn:disabled { opacity:0.4; cursor:not-allowed; }
.pt-spinner { width:18px; height:18px; border:2.5px solid rgba(232,223,160,0.3); border-top-color:#e8dfa0; border-radius:50%; animation:spin 0.7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
@media (min-width:768px) { .pt-body { max-width:600px; margin:0 auto; padding:28px 24px 40px; } }
</style>
