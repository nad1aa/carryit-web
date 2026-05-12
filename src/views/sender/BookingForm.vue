<template>
  <div class="bf">
    <header class="bf-header">
      <button class="bf-back" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="bf-header-center">
        <span class="bf-header-title">Describe your item</span>
        <div class="bf-header-step">Step 2 of 3</div>
        <div class="bf-progress-bar"><div class="bf-progress-fill" style="width:66%"/></div>
      </div>
      <div style="width:36px"/>
    </header>

    <main class="bf-body">
      <!-- Traveler summary -->
      <div class="bf-traveler-strip">
        <div class="bf-traveler-avatar" style="background:#2230a0">Y</div>
        <div class="bf-traveler-text">
          <span class="bf-traveler-name">Yasmine Belhaj</span>
          <span class="bf-traveler-route">TUN → CDG · Jun 14</span>
        </div>
        <div class="bf-traveler-price">25 DT/kg</div>
      </div>

      <!-- 3D scan panel -->
      <div class="bf-scan-card">
        <div class="bf-scan-header">
          <span class="bf-scan-title">Package scan</span>
          <span class="bf-scan-status" :class="{ active: scanned }">
            {{ scanned ? 'Scanned' : 'Not scanned' }}
          </span>
        </div>
        <div class="bf-scan-visual" @click="doScan">
          <svg v-if="!scanned" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" class="bf-scan-svg">
            <!-- Box wireframe -->
            <path d="M60 40 L100 20 L140 40 L140 100 L100 120 L60 100 Z" stroke="#2230a0" stroke-width="2" stroke-dasharray="6 3" fill="rgba(34,48,160,0.04)"/>
            <line x1="60" y1="40" x2="100" y2="60" stroke="#2230a0" stroke-width="1.5" stroke-dasharray="4 3"/>
            <line x1="140" y1="40" x2="100" y2="60" stroke="#2230a0" stroke-width="1.5" stroke-dasharray="4 3"/>
            <line x1="100" y1="60" x2="100" y2="120" stroke="#2230a0" stroke-width="1.5" stroke-dasharray="4 3"/>
            <!-- Scan line -->
            <line x1="50" y1="70" x2="150" y2="70" stroke="#e8dfa0" stroke-width="2.5" stroke-linecap="round" class="bf-scan-line"/>
            <!-- Corners -->
            <path d="M50 30 L50 50" stroke="#2230a0" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M50 30 L70 30" stroke="#2230a0" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M150 30 L130 30" stroke="#2230a0" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M150 30 L150 50" stroke="#2230a0" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M50 110 L50 90" stroke="#2230a0" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M50 110 L70 110" stroke="#2230a0" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M150 110 L130 110" stroke="#2230a0" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M150 110 L150 90" stroke="#2230a0" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <div v-if="scanned" class="bf-scan-result">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b6d11" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span class="bf-scan-result-text">Scan complete</span>
            <span class="bf-scan-dims" v-if="scanDims">
              {{ scanDims.length }} × {{ scanDims.width }} × {{ scanDims.height }} cm · {{ scanDims.weight }} kg · {{ scanDims.shape }}
            </span>
            <button class="bf-rescan-btn" @click="doScan">Rescan</button>
          </div>
        </div>
        <button v-if="!scanned" class="bf-scan-btn" @click="doScan">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 6 23 1 18 1"/><line x1="23" y1="1" x2="16" y2="8"/>
            <polyline points="1 18 1 23 6 23"/><line x1="1" y1="23" x2="8" y2="16"/>
          </svg>
          Scan package
        </button>
      </div>

      <!-- Item description -->
      <div class="bf-form-card">
        <!-- Category -->
        <div class="bf-field">
          <label class="bf-label">Category</label>
          <div class="bf-select-wrap">
            <select v-model="form.category" class="bf-select">
              <option value="">Select category…</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.label }}</option>
            </select>
            <svg class="bf-select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div class="bf-field">
          <label class="bf-label">Item name</label>
          <input v-model="form.name" type="text" class="bf-input" placeholder="e.g. Smartphone, Documents..."/>
        </div>
        <div class="bf-field">
          <label class="bf-label">Description</label>
          <textarea v-model="form.description" class="bf-textarea" rows="3" placeholder="Brief description of the item and any special handling instructions..."/>
        </div>
        <div class="bf-fields-2col">
          <div class="bf-field">
            <label class="bf-label">Weight (kg)</label>
            <input v-model="form.weight" type="number" class="bf-input" placeholder="1.5" min="0.1" step="0.1"/>
          </div>
          <div class="bf-field">
            <label class="bf-label">Value (DT)</label>
            <input v-model="form.value" type="number" class="bf-input" placeholder="150"/>
          </div>
        </div>

        <!-- Fragile toggle -->
        <div class="bf-fragile-row">
          <div class="bf-fragile-text">
            <span class="bf-fragile-title">Fragile item</span>
            <span class="bf-fragile-sub">Traveler will handle with extra care</span>
          </div>
          <label class="bf-toggle-label">
            <input type="checkbox" v-model="form.fragile" class="bf-toggle-input"/>
            <span class="bf-toggle-track"><span class="bf-toggle-thumb"/></span>
          </label>
        </div>

        <!-- Note to traveler -->
        <div class="bf-field">
          <label class="bf-label">Note to traveler</label>
          <textarea v-model="form.note" class="bf-textarea" rows="2" placeholder="Any instructions or special requests..."/>
        </div>
      </div>

      <!-- Customs declaration (international routes) -->
      <div class="bf-customs-card">
        <button class="bf-customs-header" @click="customsOpen = !customsOpen">
          <div class="bf-customs-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="bf-customs-title-wrap">
            <span class="bf-customs-title">Customs declaration · TUN → CDG</span>
            <span class="bf-customs-sub">International shipment — review guidelines</span>
          </div>
          <svg class="bf-customs-chevron" :class="{ open: customsOpen }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        <div v-if="customsOpen" class="bf-customs-body">
          <div class="bf-customs-rules">
            <div v-for="rule in customsRules" :key="rule.id" class="bf-customs-rule">
              <div class="bf-customs-rule-icon" :class="`rule-${rule.type}`">
                <svg v-if="rule.type === 'ok'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else-if="rule.type === 'warn'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <span class="bf-customs-rule-text">{{ rule.text }}</span>
            </div>
          </div>

          <!-- Declared value note -->
          <div class="bf-customs-value-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            Items valued above <strong>430 DT</strong> may be subject to import duties at destination. Your declared value: <strong>{{ form.value ? form.value + ' DT' : 'not set' }}</strong>.
          </div>
        </div>
      </div>

      <!-- Price summary -->
      <div class="bf-price-card">
        <div class="bf-price-row">
          <span>{{ form.weight || 1 }}kg × 25 DT/kg</span>
          <span>{{ ((form.weight || 1) * 25).toFixed(2) }} DT</span>
        </div>
        <div class="bf-price-row">
          <span>Platform fee (5%)</span>
          <span>{{ ((form.weight || 1) * 25 * 0.05).toFixed(2) }} DT</span>
        </div>
        <div class="bf-price-divider"/>
        <div class="bf-price-row bf-price-total">
          <span>Total</span>
          <span>{{ ((form.weight || 1) * 25 * 1.05).toFixed(2) }} DT</span>
        </div>
      </div>
    </main>

    <div class="bf-cta">
      <router-link :to="`/sender/booking/${tripId}/confirmation`" class="bf-cta-btn">
        Confirm booking
      </router-link>
    </div>

    <PackageScanner
      v-if="scannerOpen"
      @close="scannerOpen = false"
      @confirm="onScanConfirm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import PackageScanner from '@/components/PackageScanner.vue'

const route  = useRoute()
const tripId = route.params.tripId
const scanned     = ref(false)
const scannerOpen = ref(false)
const customsOpen = ref(false)
const scanDims    = ref(null)

const form = ref({
  name: '', description: '', weight: '', value: '',
  fragile: false, note: '', category: '',
})

const categories = [
  { id: 'electronics', label: 'Electronics & Gadgets' },
  { id: 'documents',   label: 'Documents & Papers'    },
  { id: 'clothing',    label: 'Clothing & Accessories' },
  { id: 'food',        label: 'Food & Gifts'           },
  { id: 'cosmetics',   label: 'Cosmetics & Skincare'   },
  { id: 'medicine',    label: 'Medicine & Supplements'  },
  { id: 'other',       label: 'Other'                  },
]

const customsRules = [
  { id: 1, type: 'ok',   text: 'Personal items & gifts allowed up to 430 DT value' },
  { id: 2, type: 'ok',   text: 'Electronics allowed — keep original packaging if possible' },
  { id: 3, type: 'warn', text: 'Cosmetics & perfumes: max 2L liquid per traveler' },
  { id: 4, type: 'warn', text: 'Medicine: carry prescription or doctor\'s note' },
  { id: 5, type: 'no',   text: 'No food items of animal origin (meat, dairy, eggs)' },
  { id: 6, type: 'no',   text: 'No counterfeit goods, weapons, or controlled substances' },
]

function doScan() {
  scannerOpen.value = true
}

function onScanConfirm(result) {
  scanDims.value         = result
  form.value.weight      = String(result.weight)
  scanned.value          = true
  scannerOpen.value      = false
}
</script>

<style scoped>
.bf {
  min-height: 100vh; background: #f0f0ee;
  font-family: 'Montserrat', sans-serif; padding-bottom: 88px;
}
.bf-header {
  position: sticky; top: 0; z-index: 50;
  background: #111; color: #fff;
  display: flex; align-items: center; gap: 12px;
  padding: 0 16px; height: 58px;
}
.bf-back {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.08); border: none; border-radius: 50%;
  color: #fff; cursor: pointer; transition: background 0.15s;
}
.bf-back:hover { background: rgba(255,255,255,0.16); }
.bf-header-center { flex: 1; display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
.bf-header-title { font-weight: 800; font-size: 15px; line-height: 1; }
.bf-header-step { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.4); }
.bf-progress-bar { width: 100%; height: 3px; background: rgba(255,255,255,0.15); border-radius: 99px; overflow: hidden; }
.bf-progress-fill { height: 100%; background: #e8dfa0; border-radius: 99px; }

.bf-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

/* Traveler strip */
.bf-traveler-strip {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border-radius: 12px;
  border: 1.5px solid rgba(17,17,17,0.1);
  padding: 12px 16px;
}
.bf-traveler-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 900; color: #fff; flex-shrink: 0;
}
.bf-traveler-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.bf-traveler-name { font-size: 13px; font-weight: 800; color: #111; }
.bf-traveler-route { font-size: 11px; font-weight: 600; color: rgba(17,17,17,0.45); }
.bf-traveler-price { font-size: 14px; font-weight: 900; color: #2230a0; }

/* Scan card */
.bf-scan-card {
  background: #fff; border-radius: 16px;
  border: 1.5px solid rgba(17,17,17,0.1); padding: 16px;
}
.bf-scan-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
}
.bf-scan-title { font-size: 13px; font-weight: 800; color: #111; }
.bf-scan-status {
  font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 3px 10px; border-radius: 99px;
  background: rgba(17,17,17,0.08); color: rgba(17,17,17,0.45);
}
.bf-scan-status.active { background: #d1f4d1; color: #2d5a2d; }

.bf-scan-visual {
  background: #f0f2fe; border-radius: 12px; height: 140px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; margin-bottom: 12px; overflow: hidden;
  position: relative;
}
.bf-scan-svg { width: 200px; height: 140px; }
.bf-scan-line { animation: scanMove 2s ease-in-out infinite; }
@keyframes scanMove { 0%,100% { transform: translateY(-40px); opacity: 0.3; } 50% { transform: translateY(40px); opacity: 1; } }

.bf-scan-result {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.bf-scan-result-text { font-size: 14px; font-weight: 800; color: #3b6d11; }
.bf-scan-dims { font-size: 11px; font-weight: 600; color: rgba(17,17,17,0.5); text-transform: capitalize; }
.bf-rescan-btn {
  background: none; border: 1.5px solid rgba(17,17,17,0.2); border-radius: 8px;
  padding: 6px 14px; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700;
  color: rgba(17,17,17,0.55); cursor: pointer; margin-top: 4px;
  transition: border-color 0.15s, color 0.15s;
}
.bf-rescan-btn:hover { border-color: #2230a0; color: #2230a0; }

.bf-scan-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; background: #2230a0; color: #e8dfa0;
  border: none; border-radius: 10px; padding: 12px;
  font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800;
  cursor: pointer; transition: background 0.15s;
}
.bf-scan-btn:hover { background: #111; }

/* Form */
.bf-form-card {
  background: #fff; border-radius: 16px;
  border: 1.5px solid rgba(17,17,17,0.1);
  padding: 18px; display: flex; flex-direction: column; gap: 14px;
}
.bf-fields-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.bf-field { display: flex; flex-direction: column; gap: 6px; }
.bf-label {
  font-size: 10px; font-weight: 800; letter-spacing: 0.12em;
  text-transform: uppercase; color: rgba(17,17,17,0.45);
}
.bf-input {
  background: #f5f5f3; border: 1.5px solid rgba(17,17,17,0.1);
  border-radius: 10px; padding: 11px 14px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 500;
  color: #111; outline: none; transition: border-color 0.15s; width: 100%; box-sizing: border-box;
}
.bf-input:focus { border-color: #2230a0; background: #fff; }
.bf-textarea {
  background: #f5f5f3; border: 1.5px solid rgba(17,17,17,0.1);
  border-radius: 10px; padding: 11px 14px; resize: none;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 500;
  color: #111; outline: none; transition: border-color 0.15s; width: 100%; box-sizing: border-box;
}
.bf-textarea:focus { border-color: #2230a0; background: #fff; }
.bf-input::placeholder, .bf-textarea::placeholder { color: rgba(17,17,17,0.28); }

/* Fragile toggle */
.bf-fragile-row { display: flex; align-items: center; justify-content: space-between; }
.bf-fragile-text { display: flex; flex-direction: column; gap: 2px; }
.bf-fragile-title { font-size: 13px; font-weight: 700; color: #111; }
.bf-fragile-sub { font-size: 11px; font-weight: 500; color: rgba(17,17,17,0.45); }
.bf-toggle-label { cursor: pointer; }
.bf-toggle-input { display: none; }
.bf-toggle-track {
  width: 42px; height: 24px;
  background: rgba(17,17,17,0.14); border-radius: 99px;
  position: relative; transition: background 0.2s; display: block;
}
.bf-toggle-input:checked ~ .bf-toggle-track { background: #2230a0; }
.bf-toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; background: #fff;
  border-radius: 50%; transition: left 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.18);
}
.bf-toggle-input:checked ~ .bf-toggle-track .bf-toggle-thumb { left: 21px; }

/* Category select */
.bf-select-wrap { position: relative; }
.bf-select {
  width: 100%; appearance: none; background: #f5f5f3;
  border: 1.5px solid rgba(17,17,17,0.1); border-radius: 10px;
  padding: 11px 36px 11px 14px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 500; color: #111;
  outline: none; transition: border-color 0.15s; cursor: pointer; box-sizing: border-box;
}
.bf-select:focus { border-color: #2230a0; background: #fff; }
.bf-select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: rgba(17,17,17,0.4); }

/* Customs declaration */
.bf-customs-card { background: #fff; border-radius: 16px; border: 1.5px solid rgba(17,17,17,0.1); overflow: hidden; }
.bf-customs-header {
  width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 16px;
  background: none; border: none; cursor: pointer; text-align: left; transition: background 0.15s;
}
.bf-customs-header:hover { background: #f8f8f6; }
.bf-customs-icon { width: 32px; height: 32px; background: #eef0fc; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.bf-customs-title-wrap { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.bf-customs-title { font-size: 12px; font-weight: 800; color: #111; }
.bf-customs-sub { font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.45); }
.bf-customs-chevron { flex-shrink: 0; color: rgba(17,17,17,0.4); transition: transform 0.2s; }
.bf-customs-chevron.open { transform: rotate(180deg); }

.bf-customs-body { padding: 0 16px 16px; border-top: 1px solid rgba(17,17,17,0.07); }
.bf-customs-rules { display: flex; flex-direction: column; gap: 8px; padding: 14px 0 12px; }
.bf-customs-rule { display: flex; align-items: flex-start; gap: 10px; }
.bf-customs-rule-icon { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
.rule-ok   { background: #d1f4d1; color: #2d5a2d; }
.rule-warn { background: #fef3c7; color: #854f0b; }
.rule-no   { background: #fde8e8; color: #b41e1e; }
.bf-customs-rule-text { font-size: 12px; font-weight: 500; color: #444; line-height: 1.45; }
.bf-customs-value-note {
  display: flex; align-items: flex-start; gap: 8px;
  background: #f5f5f3; border-radius: 10px; padding: 12px;
  font-size: 11px; font-weight: 500; color: #555; line-height: 1.5;
}
.bf-customs-value-note svg { flex-shrink: 0; margin-top: 2px; color: rgba(17,17,17,0.45); }
.bf-customs-value-note strong { font-weight: 800; color: #111; }

/* Price card */
.bf-price-card {
  background: #eef0fc;
  border: 1.5px solid #c0c8f0;
  border-radius: 14px; padding: 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.bf-price-row {
  display: flex; justify-content: space-between;
  font-size: 13px; font-weight: 600; color: #555;
}
.bf-price-divider { border-top: 1.5px dashed rgba(17,17,17,0.18); }
.bf-price-total { font-size: 15px; font-weight: 900; color: #111; }

/* CTA */
.bf-cta {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: #fff; border-top: 1.5px solid rgba(17,17,17,0.1);
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
}
.bf-cta-btn {
  display: flex; align-items: center; justify-content: center;
  background: #2230a0; color: #e8dfa0;
  border-radius: 12px; padding: 15px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800;
  text-decoration: none; transition: background 0.15s;
}
.bf-cta-btn:hover { background: #111; }

@media (min-width: 768px) {
  .bf-body { max-width: 680px; margin: 0 auto; padding: 24px 24px 40px; }
}
</style>
