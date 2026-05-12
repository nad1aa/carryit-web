<template>
  <div class="bb-page">
    <!-- Header -->
    <header class="bb-header">
      <button class="bb-back" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="bb-header-center">
        <span class="bb-header-title">Bulk booking</span>
        <span class="bb-header-sub">{{ rows.length }} item{{ rows.length !== 1 ? 's' : '' }} · {{ totalKg }} kg total</span>
      </div>
      <button class="bb-submit-btn" :disabled="rows.length === 0" @click="submitAll">Submit all</button>
    </header>

    <main class="bb-main">

      <!-- Upload zone -->
      <div class="bb-upload-card" @click="triggerFileUpload" @dragover.prevent @drop.prevent="handleDrop">
        <input ref="fileInputEl" type="file" accept=".csv" style="display:none" @change="handleFileChange" />
        <div class="bb-upload-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <span class="bb-upload-label">Upload CSV</span>
        <span class="bb-upload-sub">or add items manually below</span>
        <span class="bb-upload-hint">Format: from, to, kg, category, value</span>
      </div>

      <!-- CSV template download -->
      <button class="bb-template-btn" @click.stop>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download CSV template
      </button>

      <!-- Items table -->
      <div class="bb-table-wrap">
        <div class="bb-table-hdr">
          <span>From</span>
          <span>To</span>
          <span>Weight</span>
          <span>Category</span>
          <span>Value (DT)</span>
          <span></span>
        </div>

        <div v-for="(row, idx) in rows" :key="row.id" class="bb-row">
          <input v-model="row.from"     class="bb-cell" placeholder="TUN" maxlength="5" />
          <input v-model="row.to"       class="bb-cell" placeholder="CDG" maxlength="5" />
          <input v-model="row.kg"       class="bb-cell bb-cell--num" placeholder="0" type="number" min="0.1" step="0.1" />
          <select v-model="row.category" class="bb-cell bb-cell--select">
            <option value="">Cat.</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.label }}</option>
          </select>
          <input v-model="row.value"    class="bb-cell bb-cell--num" placeholder="0" type="number" min="0" />
          <button class="bb-row-del" @click="removeRow(idx)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Empty rows placeholder -->
        <div v-if="rows.length === 0" class="bb-table-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(17,17,17,0.2)" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
          <span>No items yet — upload a CSV or add manually</span>
        </div>

        <!-- Add row button -->
        <button class="bb-add-row" @click="addRow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add item
        </button>
      </div>

      <!-- Summary card -->
      <div v-if="rows.length > 0" class="bb-summary-card">
        <div class="bb-summary-title">Order summary</div>
        <div class="bb-summary-rows">
          <div class="bb-summary-row">
            <span>Items</span>
            <span>{{ rows.length }}</span>
          </div>
          <div class="bb-summary-row">
            <span>Total weight</span>
            <span>{{ totalKg }} kg</span>
          </div>
          <div class="bb-summary-row">
            <span>Declared value</span>
            <span>{{ totalValue }} DT</span>
          </div>
          <div class="bb-summary-row bb-summary-row--est">
            <span>Estimated cost</span>
            <span class="bb-summary-cost">~{{ estimatedCost }} DT</span>
          </div>
        </div>
        <button class="bb-book-btn" @click="submitAll">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
          Book {{ rows.length }} shipment{{ rows.length !== 1 ? 's' : '' }}
        </button>
      </div>

      <!-- Tips -->
      <div class="bb-tips-card">
        <div class="bb-tips-title">Bulk booking tips</div>
        <ul class="bb-tips-list">
          <li>Split heavy orders into multiple rows to find more traveler options</li>
          <li>Declare accurate values — customs issues are your responsibility</li>
          <li>Use IATA airport codes (TUN, CDG, LHR, DXB...)</li>
        </ul>
      </div>
    </main>

    <!-- Bottom tab bar -->
    <nav class="bb-tab-bar">
      <router-link to="/business/dashboard" class="bb-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/business/bulk" class="bb-tab active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        <span>Bulk</span>
      </router-link>
      <router-link to="/business/storefront" class="bb-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Store</span>
      </router-link>
      <router-link to="/business/integrations" class="bb-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        <span>API</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const fileInputEl = ref(null)

let nextId = 1

const categories = [
  { id: 'electronics', label: 'Electronics' },
  { id: 'clothing',    label: 'Clothing'    },
  { id: 'cosmetics',   label: 'Cosmetics'   },
  { id: 'documents',   label: 'Documents'   },
  { id: 'food',        label: 'Food'        },
  { id: 'gifts',       label: 'Gifts'       },
  { id: 'other',       label: 'Other'       },
]

const rows = ref([
  { id: nextId++, from: 'TUN', to: 'CDG', kg: 3, category: 'electronics', value: 250 },
  { id: nextId++, from: 'TUN', to: 'CDG', kg: 1.5, category: 'cosmetics', value: 80 },
])

const totalKg = computed(() => rows.value.reduce((s, r) => s + (parseFloat(r.kg) || 0), 0).toFixed(1))
const totalValue = computed(() => rows.value.reduce((s, r) => s + (parseFloat(r.value) || 0), 0).toFixed(0))
const estimatedCost = computed(() => (parseFloat(totalKg.value) * 22).toFixed(0))

function addRow() {
  rows.value.push({ id: nextId++, from: 'TUN', to: 'CDG', kg: 1, category: '', value: 0 })
}

function removeRow(idx) {
  rows.value.splice(idx, 1)
}

function triggerFileUpload() {
  fileInputEl.value?.click()
}

function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  parseCSV(file)
}

function handleDrop(e) {
  const file = e.dataTransfer.files?.[0]
  if (!file) return
  parseCSV(file)
}

function parseCSV(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const lines = e.target.result.split('\n').slice(1) // skip header
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim())
      if (parts.length >= 3 && parts[0]) {
        rows.value.push({
          id: nextId++,
          from:     parts[0] || 'TUN',
          to:       parts[1] || 'CDG',
          kg:       parseFloat(parts[2]) || 1,
          category: parts[3] || '',
          value:    parseFloat(parts[4]) || 0,
        })
      }
    }
  }
  reader.readAsText(file)
}

function submitAll() {
  if (rows.value.length === 0) return
  router.push('/sender/search')
}
</script>

<style scoped>
.bb-page { min-height: 100vh; background: #f0f0ee; font-family: 'Montserrat', sans-serif; padding-bottom: 70px; }

/* Header */
.bb-header { background: #111; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; height: 58px; position: sticky; top: 0; z-index: 50; gap: 12px; }
.bb-back { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); border: none; border-radius: 50%; color: #fff; cursor: pointer; flex-shrink: 0; }
.bb-back:hover { background: rgba(255,255,255,0.16); }
.bb-header-center { flex: 1; display: flex; flex-direction: column; align-items: center; }
.bb-header-title { font-size: 15px; font-weight: 800; color: #fff; line-height: 1.2; }
.bb-header-sub { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.45); }
.bb-submit-btn { background: #e8dfa0; color: #111; border: none; border-radius: 99px; padding: 8px 14px; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 800; cursor: pointer; transition: opacity 0.15s; white-space: nowrap; flex-shrink: 0; }
.bb-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.bb-submit-btn:not(:disabled):hover { opacity: 0.85; }

.bb-main { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

/* Upload */
.bb-upload-card { background: #fff; border: 2px dashed rgba(34,48,160,0.25); border-radius: 16px; padding: 28px 20px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; transition: border-color 0.15s; }
.bb-upload-card:hover { border-color: #2230a0; }
.bb-upload-icon { width: 52px; height: 52px; background: rgba(34,48,160,0.07); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 6px; }
.bb-upload-label { font-size: 14px; font-weight: 800; color: #111; }
.bb-upload-sub { font-size: 12px; font-weight: 600; color: rgba(17,17,17,0.45); }
.bb-upload-hint { font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.3); font-style: italic; }

.bb-template-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700; color: #2230a0; cursor: pointer; padding: 0 2px; align-self: flex-start; }
.bb-template-btn:hover { text-decoration: underline; }

/* Table */
.bb-table-wrap { background: #fff; border-radius: 16px; border: 1.5px solid rgba(17,17,17,0.07); overflow: hidden; }
.bb-table-hdr { display: grid; grid-template-columns: 1fr 1fr 0.8fr 1.2fr 1fr 28px; gap: 4px; padding: 10px 12px 8px; background: rgba(17,17,17,0.03); border-bottom: 1px solid rgba(17,17,17,0.08); font-size: 9px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(17,17,17,0.4); }
.bb-row { display: grid; grid-template-columns: 1fr 1fr 0.8fr 1.2fr 1fr 28px; gap: 4px; padding: 8px 12px; border-bottom: 1px solid rgba(17,17,17,0.06); align-items: center; }
.bb-row:last-of-type { border-bottom: none; }
.bb-cell { background: rgba(17,17,17,0.04); border: 1.5px solid transparent; border-radius: 6px; padding: 6px 6px; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700; color: #111; width: 100%; box-sizing: border-box; transition: border-color 0.15s; outline: none; }
.bb-cell:focus { border-color: #2230a0; background: #fff; }
.bb-cell--num { text-align: right; }
.bb-cell--select { cursor: pointer; appearance: none; -webkit-appearance: none; }
.bb-row-del { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: none; border: none; color: rgba(17,17,17,0.3); cursor: pointer; border-radius: 6px; transition: all 0.15s; flex-shrink: 0; }
.bb-row-del:hover { background: rgba(180,30,30,0.08); color: #b41e1e; }
.bb-table-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 20px; color: rgba(17,17,17,0.35); font-size: 12px; font-weight: 600; text-align: center; }
.bb-add-row { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 12px; background: none; border: none; border-top: 1.5px dashed rgba(17,17,17,0.1); font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: #2230a0; cursor: pointer; transition: background 0.15s; }
.bb-add-row:hover { background: rgba(34,48,160,0.04); }

/* Summary */
.bb-summary-card { background: #2230a0; border-radius: 16px; padding: 18px; }
.bb-summary-title { font-size: 13px; font-weight: 800; color: rgba(232,223,160,0.7); margin-bottom: 14px; }
.bb-summary-rows { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
.bb-summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.7); }
.bb-summary-row--est { padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.12); font-size: 14px; font-weight: 800; color: #fff; }
.bb-summary-cost { color: #e8dfa0; font-size: 18px; font-weight: 900; }
.bb-book-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: #e8dfa0; color: #111; border: none; border-radius: 99px; padding: 14px; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; cursor: pointer; transition: opacity 0.15s; }
.bb-book-btn:hover { opacity: 0.88; }

/* Tips */
.bb-tips-card { background: rgba(34,48,160,0.06); border-radius: 14px; padding: 16px; }
.bb-tips-title { font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(17,17,17,0.45); margin-bottom: 10px; }
.bb-tips-list { margin: 0; padding: 0 0 0 16px; display: flex; flex-direction: column; gap: 6px; }
.bb-tips-list li { font-size: 12px; font-weight: 600; color: rgba(17,17,17,0.55); line-height: 1.5; }

/* Tab bar */
.bb-tab-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 200; background: #111; display: flex; align-items: stretch; height: 64px; border-top: 2px solid rgba(255,255,255,0.06); padding-bottom: env(safe-area-inset-bottom, 0px); }
.bb-tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; color: rgba(255,255,255,0.38); font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.15s; padding: 0 4px; }
.bb-tab.active, .bb-tab:hover { color: #fff; }

@media (min-width: 768px) {
  .bb-tab-bar { display: none; }
  .bb-page { padding-bottom: 0; }
  .bb-main { max-width: 720px; margin: 0 auto; }
}
</style>
