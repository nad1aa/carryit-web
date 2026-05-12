<template>
  <div class="bd-page">
    <!-- Header -->
    <header class="bd-header">
      <div class="bd-header-left">
        <div class="bd-logo-mark">B</div>
        <div>
          <div class="bd-company">TechShop Sousse</div>
          <div class="bd-plan">Business Plan</div>
        </div>
      </div>
      <div class="bd-header-right">
        <router-link to="/notifications" class="bd-icon-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          <span v-if="unread > 0" class="bd-notif-dot">{{ unread }}</span>
        </router-link>
        <router-link to="/profile" class="bd-icon-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </router-link>
      </div>
    </header>

    <main class="bd-main">
      <!-- KPI cards -->
      <div class="bd-kpi-row">
        <div class="bd-kpi" v-for="k in kpis" :key="k.label">
          <span class="bd-kpi-val">{{ k.value }}</span>
          <span class="bd-kpi-label">{{ k.label }}</span>
          <span class="bd-kpi-delta" :class="k.up ? 'up' : 'down'">{{ k.delta }}</span>
        </div>
      </div>

      <!-- Monthly spend chart -->
      <div class="bd-card bd-chart-card">
        <div class="bd-card-hdr">
          <span class="bd-card-title">Monthly spend</span>
          <span class="bd-chart-total">{{ currentMonthSpend }} DT</span>
        </div>
        <div class="bd-bars">
          <div v-for="m in monthlySpend" :key="m.month" class="bd-bar-col">
            <div
              class="bd-bar"
              :class="{ 'bd-bar--current': m.current }"
              :style="{ height: (m.amount / maxSpend * 60) + 'px' }"
            />
            <span class="bd-bar-label">{{ m.month }}</span>
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="bd-section-title">Quick actions</div>
      <div class="bd-actions-grid">
        <router-link to="/business/bulk" class="bd-action-card">
          <div class="bd-action-icon bd-action-icon--navy">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <span class="bd-action-label">Bulk booking</span>
          <svg class="bd-action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </router-link>
        <router-link to="/business/storefront" class="bd-action-card">
          <div class="bd-action-icon bd-action-icon--cream">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span class="bd-action-label">My storefront</span>
          <svg class="bd-action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </router-link>
        <router-link to="/business/integrations" class="bd-action-card">
          <div class="bd-action-icon bd-action-icon--outline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </div>
          <span class="bd-action-label">API &amp; integrations</span>
          <svg class="bd-action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </router-link>
        <router-link to="/sender/search" class="bd-action-card">
          <div class="bd-action-icon bd-action-icon--outline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <span class="bd-action-label">Find a traveler</span>
          <svg class="bd-action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </router-link>
      </div>

      <!-- Recent shipments -->
      <div class="bd-section-title bd-section-title--row">
        <span>Recent shipments</span>
        <router-link to="/sender/bookings" class="bd-see-all">See all</router-link>
      </div>
      <div class="bd-card bd-shipments-card">
        <div v-for="(s, i) in recentShipments" :key="s.id" class="bd-shipment-row" :class="{ 'bd-shipment-row--last': i === recentShipments.length - 1 }">
          <div class="bd-shipment-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
          </div>
          <div class="bd-shipment-info">
            <span class="bd-shipment-title">{{ s.title }}</span>
            <span class="bd-shipment-route">{{ s.from }} → {{ s.to }} · {{ s.date }}</span>
          </div>
          <div class="bd-shipment-right">
            <span class="bd-shipment-amount">{{ s.amount }} DT</span>
            <span class="bd-shipment-status" :class="`bd-status--${s.status}`">{{ s.statusLabel }}</span>
          </div>
        </div>
      </div>

      <!-- Savings callout -->
      <div class="bd-savings-banner">
        <div class="bd-savings-left">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8dfa0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          <div>
            <div class="bd-savings-title">Saved vs. courier</div>
            <div class="bd-savings-sub">vs. DHL / FedEx rates</div>
          </div>
        </div>
        <div class="bd-savings-amount">1,240 DT</div>
      </div>
    </main>

    <!-- Bottom tab bar -->
    <nav class="bd-tab-bar">
      <router-link to="/business/dashboard" class="bd-tab active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/business/bulk" class="bd-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        <span>Bulk</span>
      </router-link>
      <router-link to="/business/storefront" class="bd-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Store</span>
      </router-link>
      <router-link to="/business/integrations" class="bd-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        <span>API</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const unread = ref(3)

const kpis = [
  { label: 'Shipments',  value: '48',      delta: '+12 this month', up: true  },
  { label: 'Spent (DT)', value: '3,820',   delta: '-8% vs last',   up: false },
  { label: 'Active',     value: '5',        delta: 'in progress',    up: true  },
  { label: 'Saved (DT)', value: '1,240',   delta: 'vs courier',     up: true  },
]

const monthlySpend = [
  { month: 'Jan', amount: 280 },
  { month: 'Feb', amount: 410 },
  { month: 'Mar', amount: 360 },
  { month: 'Apr', amount: 520 },
  { month: 'May', amount: 680 },
  { month: 'Jun', amount: 450, current: true },
]
const maxSpend = 680
const currentMonthSpend = '450'

const recentShipments = [
  { id: 's1', title: 'Electronics x3',   from: 'TUN', to: 'CDG', date: 'Jun 8',  amount: '210', status: 'transit',   statusLabel: 'In transit'  },
  { id: 's2', title: 'Cosmetics kit',    from: 'TUN', to: 'LHR', date: 'Jun 5',  amount: '85',  status: 'delivered', statusLabel: 'Delivered'   },
  { id: 's3', title: 'Spare parts x2',   from: 'TUN', to: 'DXB', date: 'May 29', amount: '160', status: 'delivered', statusLabel: 'Delivered'   },
  { id: 's4', title: 'Fashion bundle',   from: 'TUN', to: 'MRS', date: 'May 22', amount: '120', status: 'delivered', statusLabel: 'Delivered'   },
]
</script>

<style scoped>
.bd-page { min-height: 100vh; background: #f0f0ee; font-family: 'Montserrat', sans-serif; padding-bottom: 70px; }

/* Header */
.bd-header { background: #111; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; position: sticky; top: 0; z-index: 50; }
.bd-header-left { display: flex; align-items: center; gap: 12px; }
.bd-logo-mark { width: 36px; height: 36px; background: #2230a0; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; color: #e8dfa0; flex-shrink: 0; }
.bd-company { font-size: 15px; font-weight: 800; color: #fff; line-height: 1.2; }
.bd-plan { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #e8dfa0; }
.bd-header-right { display: flex; align-items: center; gap: 8px; }
.bd-icon-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); border-radius: 50%; color: #fff; text-decoration: none; position: relative; transition: background 0.15s; }
.bd-icon-btn:hover { background: rgba(255,255,255,0.16); }
.bd-notif-dot { position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; background: #e8dfa0; border-radius: 50%; font-size: 9px; font-weight: 800; color: #111; display: flex; align-items: center; justify-content: center; }

.bd-main { padding: 16px; display: flex; flex-direction: column; gap: 16px; }

/* KPI row */
.bd-kpi-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bd-kpi { background: #fff; border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; border: 1.5px solid rgba(17,17,17,0.07); }
.bd-kpi-val { font-size: 22px; font-weight: 900; color: #111; letter-spacing: -0.03em; line-height: 1.1; }
.bd-kpi-label { font-size: 11px; font-weight: 700; color: rgba(17,17,17,0.45); }
.bd-kpi-delta { font-size: 10px; font-weight: 700; margin-top: 4px; }
.bd-kpi-delta.up { color: #2230a0; }
.bd-kpi-delta.down { color: rgba(17,17,17,0.45); }

/* Chart */
.bd-card { background: #fff; border-radius: 16px; border: 1.5px solid rgba(17,17,17,0.07); padding: 16px; }
.bd-card-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.bd-card-title { font-size: 13px; font-weight: 800; color: #111; }
.bd-chart-total { font-size: 18px; font-weight: 900; color: #2230a0; letter-spacing: -0.03em; }
.bd-bars { display: flex; gap: 6px; align-items: flex-end; height: 80px; }
.bd-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; justify-content: flex-end; }
.bd-bar { width: 100%; background: rgba(34,48,160,0.12); border-radius: 4px 4px 0 0; min-height: 4px; transition: height 0.3s; }
.bd-bar--current { background: #2230a0; }
.bd-bar-label { font-size: 9px; font-weight: 700; color: rgba(17,17,17,0.4); }

/* Section titles */
.bd-section-title { font-size: 13px; font-weight: 800; color: #111; letter-spacing: -0.01em; }
.bd-section-title--row { display: flex; align-items: center; justify-content: space-between; }
.bd-see-all { font-size: 12px; font-weight: 700; color: #2230a0; text-decoration: none; }

/* Quick actions */
.bd-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bd-action-card { background: #fff; border-radius: 14px; border: 1.5px solid rgba(17,17,17,0.07); padding: 14px; display: flex; flex-direction: column; gap: 10px; text-decoration: none; transition: border-color 0.15s; }
.bd-action-card:hover { border-color: #2230a0; }
.bd-action-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.bd-action-icon--navy { background: #2230a0; color: #e8dfa0; }
.bd-action-icon--cream { background: #e8dfa0; color: #111; }
.bd-action-icon--outline { background: rgba(17,17,17,0.06); color: #111; }
.bd-action-label { font-size: 12px; font-weight: 800; color: #111; flex: 1; line-height: 1.3; }
.bd-action-arrow { color: rgba(17,17,17,0.3); margin-top: auto; }

/* Shipments */
.bd-shipments-card { padding: 0; overflow: hidden; }
.bd-shipment-row { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-bottom: 1px solid rgba(17,17,17,0.06); }
.bd-shipment-row--last { border-bottom: none; }
.bd-shipment-icon { width: 32px; height: 32px; background: rgba(34,48,160,0.08); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #2230a0; flex-shrink: 0; }
.bd-shipment-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.bd-shipment-title { font-size: 13px; font-weight: 700; color: #111; }
.bd-shipment-route { font-size: 11px; font-weight: 600; color: rgba(17,17,17,0.45); }
.bd-shipment-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.bd-shipment-amount { font-size: 13px; font-weight: 800; color: #111; }
.bd-shipment-status { font-size: 9px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; border-radius: 99px; }
.bd-status--transit { background: #d4d8f8; color: #2230a0; }
.bd-status--delivered { background: rgba(17,17,17,0.08); color: rgba(17,17,17,0.55); }
.bd-status--pending { background: #f5f0c8; color: #7a6600; }

/* Savings banner */
.bd-savings-banner { background: #2230a0; border-radius: 16px; padding: 18px; display: flex; align-items: center; justify-content: space-between; }
.bd-savings-left { display: flex; align-items: center; gap: 12px; }
.bd-savings-title { font-size: 14px; font-weight: 800; color: #e8dfa0; }
.bd-savings-sub { font-size: 11px; font-weight: 600; color: rgba(232,223,160,0.6); }
.bd-savings-amount { font-size: 24px; font-weight: 900; color: #e8dfa0; letter-spacing: -0.04em; }

/* Tab bar */
.bd-tab-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 200; background: #111; display: flex; align-items: stretch; height: 64px; border-top: 2px solid rgba(255,255,255,0.06); padding-bottom: env(safe-area-inset-bottom, 0px); }
.bd-tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; color: rgba(255,255,255,0.38); font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.15s; padding: 0 4px; }
.bd-tab.active, .bd-tab:hover { color: #fff; }

@media (min-width: 768px) {
  .bd-tab-bar { display: none; }
  .bd-page { padding-bottom: 0; }
  .bd-main { max-width: 680px; margin: 0 auto; }
}
</style>
