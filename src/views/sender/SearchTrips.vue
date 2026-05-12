<template>
  <div class="st">
    <!-- Header -->
    <header class="st-header">
      <div class="st-header-top">
        <div class="st-logo">CarryIt</div>
        <router-link to="/profile" class="st-avatar" aria-label="Profile">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </router-link>
      </div>
      <h1 class="st-title">Send a package<br><em>anywhere.</em></h1>
    </header>

    <main class="st-body">
      <!-- Search card -->
      <div class="st-search-card">
        <!-- Route row -->
        <div class="st-route-row">
          <div class="st-route-field">
            <span class="st-route-dot st-route-dot--from"/>
            <div class="st-route-input-wrap">
              <label class="st-label">From</label>
              <input v-model="form.from" type="text" class="st-route-input" placeholder="City or airport"/>
            </div>
          </div>
          <button class="st-swap-btn" @click="swapCities" aria-label="Swap cities">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
          </button>
          <div class="st-route-field">
            <span class="st-route-dot st-route-dot--to"/>
            <div class="st-route-input-wrap">
              <label class="st-label">To</label>
              <input v-model="form.to" type="text" class="st-route-input" placeholder="City or airport"/>
            </div>
          </div>
        </div>

        <!-- Date range row -->
        <div class="st-date-row">
          <div class="st-date-field">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <div class="st-date-input-wrap">
              <label class="st-label">Depart after</label>
              <input v-model="form.dateFrom" type="date" class="st-meta-input"/>
            </div>
          </div>
          <div class="st-date-sep">—</div>
          <div class="st-date-field">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <div class="st-date-input-wrap">
              <label class="st-label">Depart before</label>
              <input v-model="form.dateTo" type="date" class="st-meta-input"/>
            </div>
          </div>
        </div>

        <!-- Weight + min kg row -->
        <div class="st-meta-row">
          <div class="st-meta-field">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
            <div class="st-date-input-wrap">
              <label class="st-label">Package weight</label>
              <input v-model="form.weight" type="number" class="st-meta-input" placeholder="e.g. 3.5 kg" min="0.1" step="0.1"/>
            </div>
          </div>
          <div class="st-meta-field">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            <div class="st-date-input-wrap">
              <label class="st-label">Min carrier space</label>
              <input v-model="form.minKg" type="number" class="st-meta-input" placeholder="e.g. 5 kg" min="0" step="1"/>
            </div>
          </div>
        </div>

        <button class="st-search-btn" @click="search" :disabled="!form.from || !form.to">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Find travelers
        </button>
      </div>

      <!-- Quick match shortcut -->
      <button class="st-scanner-card st-match-card" @click="router.push('/sender/results')">
        <div class="st-scanner-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </div>
        <div class="st-scanner-text">
          <span class="st-scanner-title">Find a match</span>
          <span class="st-scanner-sub">Swipe through travelers and pick the best fit for your package</span>
        </div>
        <svg class="st-scanner-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(34,48,160,0.45)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>

      <!-- 3D Scanner shortcut -->
      <button class="st-scanner-card" @click="scannerOpen = true">
        <div class="st-scanner-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
            <line x1="8" y1="5" x2="8" y2="9"/><line x1="16" y1="5" x2="16" y2="9"/>
          </svg>
        </div>
        <div class="st-scanner-text">
          <span class="st-scanner-title">3D scan your package</span>
          <span class="st-scanner-sub">Auto-measure weight &amp; dimensions with your camera</span>
        </div>
        <svg class="st-scanner-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(34,48,160,0.45)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>

      <!-- Saved routes -->
      <div class="st-section">
        <div class="st-section-header">
          <span class="st-section-title">Saved routes</span>
          <button class="st-section-link">See all</button>
        </div>
        <div class="st-saved-routes">
          <button
            v-for="route in savedRoutes"
            :key="route.id"
            class="st-saved-route"
            @click="fillRoute(route)"
          >
            <span class="st-saved-route-from">{{ route.from }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
            <span class="st-saved-route-to">{{ route.to }}</span>
          </button>
        </div>
      </div>

      <!-- Package types -->
      <div class="st-section">
        <div class="st-section-header">
          <span class="st-section-title">Package type</span>
        </div>
        <div class="st-pkg-grid">
          <button
            v-for="pkg in packageTypes"
            :key="pkg.id"
            class="st-pkg-card"
            :class="{ active: form.packageType === pkg.id }"
            @click="form.packageType = pkg.id"
          >
            <component :is="pkg.icon" class="st-pkg-icon"/>
            <span class="st-pkg-label">{{ pkg.label }}</span>
            <span class="st-pkg-limit">{{ pkg.limit }}</span>
          </button>
        </div>
      </div>

      <!-- Recent trips -->
      <div class="st-section">
        <div class="st-section-header">
          <span class="st-section-title">My recent sends</span>
          <router-link to="/sender/bookings" class="st-section-link">View all</router-link>
        </div>
        <div class="st-recent-list">
          <router-link
            v-for="booking in recentBookings"
            :key="booking.id"
            :to="`/sender/tracking/${booking.id}`"
            class="st-recent-item"
          >
            <div class="st-recent-route">
              <span>{{ booking.from }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
              <span>{{ booking.to }}</span>
            </div>
            <div class="st-recent-status" :class="`status-${booking.status}`">{{ booking.statusLabel }}</div>
          </router-link>
        </div>
      </div>
    </main>

    <!-- Scan result toast -->
    <transition name="st-toast">
      <div v-if="scanResult" class="st-scan-toast">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span>{{ scanResult.length }}×{{ scanResult.width }}×{{ scanResult.height }} cm · {{ scanResult.weight }} kg · {{ scanResult.shape }}</span>
        <button @click="scanResult = null" class="st-toast-x">✕</button>
      </div>
    </transition>

    <!-- Package scanner modal -->
    <PackageScanner
      v-if="scannerOpen"
      @close="scannerOpen = false"
      @confirm="onScanConfirm"
    />

    <!-- Bottom tab bar -->
    <nav class="st-tab-bar">
      <router-link to="/sender/search" class="st-tab active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span>Search</span>
      </router-link>
      <router-link to="/sender/bookings" class="st-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10"/><path d="M1 5h22v5H1z"/><line x1="10" y1="15" x2="14" y2="15"/></svg>
        <span>Bookings</span>
      </router-link>
      <router-link to="/chat" class="st-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        <span>Chat</span>
      </router-link>
      <router-link to="/profile" class="st-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Profile</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'
import PackageScanner from '@/components/PackageScanner.vue'

const router = useRouter()

const scannerOpen = ref(false)
const scanResult  = ref(null)

function onScanConfirm(dims) {
  scanResult.value  = dims
  form.value.weight = String(dims.weight)
  // Map shape → packageType
  const shapeToType = { envelope: 'envelope', bag: 'large', cylinder: 'small', box: 'small', irregular: 'large' }
  form.value.packageType = shapeToType[dims.shape] ?? 'small'
  setTimeout(() => { scanResult.value = null }, 6000)
}

const form = ref({
  from: '', to: '',
  dateFrom: '', dateTo: '',
  weight: '', minKg: '',
  packageType: 'small',
})

function swapCities() {
  const tmp = form.value.from
  form.value.from = form.value.to
  form.value.to = tmp
}

function fillRoute(route) {
  form.value.from = route.from
  form.value.to   = route.to
}

function search() {
  router.push({
    path: '/sender/results',
    query: {
      from: form.value.from,
      to: form.value.to,
      dateFrom: form.value.dateFrom,
      dateTo: form.value.dateTo,
      minKg: form.value.minKg,
    }
  })
}

const savedRoutes = [
  { id: 1, from: 'Tunis',  to: 'Paris'  },
  { id: 2, from: 'Tunis',  to: 'London' },
  { id: 3, from: 'Sousse', to: 'Dubai'  },
]

const recentBookings = [
  { id: 'b1', from: 'Tunis', to: 'Paris',  status: 'transit',   statusLabel: 'In Transit'  },
  { id: 'b2', from: 'Tunis', to: 'London', status: 'delivered', statusLabel: 'Delivered'   },
]

// Package type icons
const BoxIcon = defineComponent({ render: () => h('svg', { viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round' }, [
  h('path', { d:'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' }),
  h('polyline', { points:'3.27 6.96 12 12.01 20.73 6.96' }),
  h('line', { x1:'12', y1:'22.08', x2:'12', y2:'12' }),
]) })
const EnvIcon = defineComponent({ render: () => h('svg', { viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round' }, [
  h('path', { d:'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
  h('polyline', { points:'22,6 12,13 2,6' }),
]) })
const BagIcon = defineComponent({ render: () => h('svg', { viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round' }, [
  h('path', { d:'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z' }),
  h('line', { x1:'3', y1:'6', x2:'21', y2:'6' }),
  h('path', { d:'M16 10a4 4 0 01-8 0' }),
]) })

const packageTypes = [
  { id: 'envelope', label: 'Envelope',   limit: 'up to 0.5 kg', icon: EnvIcon },
  { id: 'small',    label: 'Small box',  limit: 'up to 5 kg',   icon: BoxIcon },
  { id: 'large',    label: 'Large bag',  limit: 'up to 20 kg',  icon: BagIcon },
]
</script>

<style scoped>
.st {
  min-height: 100vh;
  background: #f0f0ee;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
}

/* Header */
.st-header { background: #111; padding: 20px 24px 28px; color: #fff; }
.st-header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.st-logo { font-weight: 900; font-size: 20px; letter-spacing: -0.02em; color: #e8dfa0; }
.st-avatar {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.1); border-radius: 50%;
  color: #fff; text-decoration: none; transition: background 0.15s;
}
.st-avatar:hover { background: rgba(255,255,255,0.18); }
.st-title { font-size: clamp(24px, 7vw, 32px); font-weight: 900; line-height: 1.12; letter-spacing: -0.03em; color: #fff; margin: 0; }
.st-title em { font-style: italic; color: #e8dfa0; }

/* Body */
.st-body { flex: 1; padding: 0 16px 24px; }

/* Search card */
.st-search-card {
  background: #fff; border-radius: 18px; padding: 20px;
  margin-top: -18px; box-shadow: 0 4px 24px rgba(17,17,17,0.12);
  display: flex; flex-direction: column; gap: 14px;
}

.st-route-row { display: flex; align-items: center; gap: 8px; }
.st-route-field {
  flex: 1; display: flex; align-items: flex-start; gap: 10px;
  background: #f5f5f3; border-radius: 10px; padding: 12px 14px;
}
.st-route-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 16px; }
.st-route-dot--from { background: #2230a0; }
.st-route-dot--to   { background: #8485d0; }
.st-route-input-wrap { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.st-label { font-size: 9px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(17,17,17,0.4); }
.st-route-input { background: none; border: none; outline: none; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 700; color: #111; padding: 0; width: 100%; }
.st-route-input::placeholder { color: rgba(17,17,17,0.3); font-weight: 500; }

.st-swap-btn {
  width: 36px; height: 36px; background: #f0f0ee; border: 1.5px solid rgba(17,17,17,0.12);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; color: #2230a0; transition: all 0.15s;
}
.st-swap-btn:hover { background: #2230a0; color: #e8dfa0; border-color: #2230a0; }

/* Date range */
.st-date-row { display: flex; align-items: center; gap: 8px; }
.st-date-field {
  flex: 1; display: flex; align-items: flex-start; gap: 8px;
  background: #f5f5f3; border-radius: 10px; padding: 11px 12px;
  color: rgba(17,17,17,0.45); min-width: 0;
}
.st-date-field svg { flex-shrink: 0; margin-top: 14px; }
.st-date-input-wrap { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.st-date-sep { font-size: 14px; font-weight: 700; color: rgba(17,17,17,0.3); flex-shrink: 0; }

/* Meta row (weight + min kg) */
.st-meta-row { display: flex; gap: 10px; }
.st-meta-field {
  flex: 1; display: flex; align-items: flex-start; gap: 8px;
  background: #f5f5f3; border-radius: 10px; padding: 11px 12px;
  color: rgba(17,17,17,0.45); min-width: 0;
}
.st-meta-field svg { flex-shrink: 0; margin-top: 14px; }
.st-meta-input { background: none; border: none; outline: none; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 600; color: #111; flex: 1; min-width: 0; width: 100%; }
.st-meta-input::placeholder { color: rgba(17,17,17,0.35); }

.st-search-btn {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  background: #2230a0; color: #e8dfa0; border: none; border-radius: 12px; padding: 14px;
  font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}
.st-search-btn:hover:not(:disabled) { background: #111; }
.st-search-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* 3D Scanner card */
.st-scanner-card {
  display: flex; align-items: center; gap: 14px;
  background: #fff; border: 2px dashed rgba(34,48,160,0.28); border-radius: 14px;
  padding: 16px 18px; margin-top: 16px; width: 100%; text-align: left;
  cursor: pointer; transition: border-color 0.15s, background 0.15s;
}
.st-scanner-card:hover { border-color: #2230a0; background: #f4f5fd; }
.st-scanner-icon {
  width: 48px; height: 48px; border-radius: 12px; background: #eef0fc;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.st-scanner-text { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.st-scanner-title { font-size: 13px; font-weight: 800; color: #2230a0; }
.st-scanner-sub { font-size: 11px; font-weight: 500; color: rgba(17,17,17,0.5); line-height: 1.4; }
.st-scanner-arrow { flex-shrink: 0; }

/* Sections */
.st-section { margin-top: 28px; }
.st-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.st-section-title { font-size: 13px; font-weight: 800; color: #111; letter-spacing: -0.01em; }
.st-section-link { font-size: 11px; font-weight: 700; color: #2230a0; text-decoration: none; background: none; border: none; cursor: pointer; letter-spacing: 0.04em; }

/* Saved routes */
.st-saved-routes { display: flex; flex-wrap: wrap; gap: 8px; }
.st-saved-route {
  display: flex; align-items: center; gap: 6px; background: #fff;
  border: 1.5px solid rgba(17,17,17,0.12); border-radius: 99px; padding: 8px 14px;
  font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 600; color: #111;
  cursor: pointer; transition: all 0.15s;
}
.st-saved-route:hover { border-color: #2230a0; color: #2230a0; }
.st-saved-route-from { font-weight: 800; }
.st-saved-route svg { color: rgba(17,17,17,0.35); }

/* Package grid */
.st-pkg-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.st-pkg-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: #fff; border: 2px solid rgba(17,17,17,0.1); border-radius: 12px; padding: 14px 8px;
  cursor: pointer; transition: all 0.15s;
}
.st-pkg-card.active { border-color: #2230a0; background: #eef0fc; }
.st-pkg-card:hover:not(.active) { border-color: rgba(17,17,17,0.28); }
.st-pkg-icon { width: 28px; height: 28px; color: #2230a0; }
.st-pkg-label { font-size: 11px; font-weight: 800; color: #111; text-align: center; }
.st-pkg-limit { font-size: 9px; font-weight: 600; color: #888; text-align: center; }

/* Recent bookings */
.st-recent-list { display: flex; flex-direction: column; gap: 8px; }
.st-recent-item {
  display: flex; align-items: center; justify-content: space-between;
  background: #fff; border: 1.5px solid rgba(17,17,17,0.08); border-radius: 10px;
  padding: 12px 14px; text-decoration: none; transition: border-color 0.15s;
}
.st-recent-item:hover { border-color: rgba(17,17,17,0.22); }
.st-recent-route { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #111; }
.st-recent-route svg { color: rgba(17,17,17,0.35); }
.st-recent-status { font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 10px; border-radius: 99px; }
.status-transit   { background: #fef3c7; color: #854f0b; }
.status-delivered { background: #d1f4d1; color: #2d5a2d; }
.status-pending   { background: #d4d8f8; color: #2230a0; }

/* Scan result toast */
.st-scan-toast {
  position: fixed; bottom: 80px; left: 16px; right: 16px; z-index: 400;
  background: #111; border: 1.5px solid #22c55e; border-radius: 12px;
  padding: 12px 14px; display: flex; align-items: center; gap: 10px;
  font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700;
  color: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.35);
  max-width: 508px; margin: 0 auto;
}
.st-scan-toast span { flex: 1; text-transform: capitalize; }
.st-toast-x {
  background: none; border: none; color: rgba(255,255,255,0.4);
  font-size: 14px; cursor: pointer; padding: 2px; flex-shrink: 0;
}
.st-toast-x:hover { color: #fff; }
.st-toast-enter-active, .st-toast-leave-active { transition: opacity 0.25s, transform 0.25s; }
.st-toast-enter-from, .st-toast-leave-to { opacity: 0; transform: translateY(10px); }

/* Bottom tab bar */
.st-tab-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
  background: #111; display: flex; align-items: stretch; height: 64px;
  border-top: 2px solid rgba(255,255,255,0.06);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.st-tab {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; text-decoration: none; color: rgba(255,255,255,0.38);
  font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  transition: color 0.15s; padding: 0 4px;
}
.st-tab.active, .st-tab:hover { color: #fff; }

/* Responsive */
@media (min-width: 768px) {
  .st-tab-bar { display: none; }
  .st { padding-bottom: 0; }
  .st-body { max-width: 680px; margin: 0 auto; padding: 0 24px 40px; }
  .st-header { padding: 28px 48px 36px; }
}
</style>
