<template>
  <div class="ea">
    <header class="ea-header">
      <h1 class="ea-header-title">Earnings</h1>
      <button class="ea-withdraw-btn" @click="showWithdraw = true">Withdraw</button>
    </header>

    <main class="ea-body">
      <!-- Big number block -->
      <div class="ea-hero">
        <span class="ea-hero-label">Total earned</span>
        <div class="ea-hero-amount">
          <span class="ea-hero-val">{{ totalEarned.toFixed(2) }}</span>
          <span class="ea-hero-currency"> DT</span>
        </div>
        <!-- Sparkline SVG -->
        <div class="ea-sparkline">
          <svg viewBox="0 0 300 60" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#e8dfa0" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="#e8dfa0" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path :d="sparklinePath" fill="url(#sparkGrad)"/>
            <path :d="sparklineStroke" stroke="#e8dfa0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
        <div class="ea-hero-period">Last 6 months</div>
      </div>

      <!-- Split: available / escrow -->
      <div class="ea-split-row">
        <div class="ea-split-card ea-split-card--available">
          <span class="ea-split-label">Available</span>
          <span class="ea-split-val">{{ available.toFixed(2) }} DT</span>
          <span class="ea-split-sub">Ready to withdraw</span>
        </div>
        <div class="ea-split-card ea-split-card--escrow">
          <span class="ea-split-label">In escrow</span>
          <span class="ea-split-val">{{ escrow.toFixed(2) }} DT</span>
          <span class="ea-split-sub">Releasing after delivery</span>
        </div>
      </div>

      <!-- Monthly breakdown -->
      <div class="ea-section">
        <h3 class="ea-section-title">Monthly breakdown</h3>
        <div class="ea-months">
          <div v-for="m in monthlyData" :key="m.month" class="ea-month-row">
            <span class="ea-month-name">{{ m.month }}</span>
            <div class="ea-month-bar-wrap">
              <div class="ea-month-bar" :style="{ width: (m.amount / maxMonthly * 100) + '%' }"/>
            </div>
            <span class="ea-month-amt">{{ m.amount }} DT</span>
          </div>
        </div>
      </div>

      <!-- Recent payouts -->
      <div class="ea-section">
        <div class="ea-section-header">
          <h3 class="ea-section-title">Recent payouts</h3>
        </div>
        <div class="ea-payouts">
          <div v-for="p in payouts" :key="p.id" class="ea-payout-row">
            <div class="ea-payout-icon" :class="`ea-payout-icon--${p.type}`">
              <svg v-if="p.type === 'delivery'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <div class="ea-payout-info">
              <span class="ea-payout-title">{{ p.title }}</span>
              <span class="ea-payout-date">{{ p.date }}</span>
            </div>
            <span class="ea-payout-amt" :class="p.amount > 0 ? 'pos' : 'neg'">
              {{ p.amount > 0 ? '+' : '' }}{{ Math.abs(p.amount).toFixed(2) }} DT
            </span>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom tab bar -->
    <nav class="ea-tab-bar">
      <router-link to="/traveler/trips" class="ea-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        <span>My Trips</span>
      </router-link>
      <router-link to="/traveler/requests" class="ea-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10"/><path d="M1 5h22v5H1z"/></svg>
        <span>Requests</span>
      </router-link>
      <router-link to="/traveler/earnings" class="ea-tab active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        <span>Earnings</span>
      </router-link>
      <router-link to="/profile" class="ea-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Profile</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showWithdraw = ref(false)
const totalEarned  = ref(3890.00)
const available    = ref(975.00)
const escrow       = ref(290.00)

const monthlyData = [
  { month: 'Jan', amount: 450 }, { month: 'Feb', amount: 660 },
  { month: 'Mar', amount: 540 }, { month: 'Apr', amount: 810 },
  { month: 'May', amount: 700 }, { month: 'Jun', amount: 730 },
]
const maxMonthly = computed(() => Math.max(...monthlyData.map(m => m.amount)))

// Sparkline path from monthly data
const sparklinePoints = monthlyData.map((m, i) => ({
  x: (i / (monthlyData.length - 1)) * 300,
  y: 55 - (m.amount / maxMonthly.value) * 50,
}))
const sparklineStroke = computed(() => sparklinePoints.map((p,i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' '))
const sparklinePath   = computed(() => sparklineStroke.value + ` L300,60 L0,60 Z`)

const payouts = [
  { id:'p1', type:'delivery', title:'TUN → CDG · Khalil M.',   date:'Jun 14', amount:38.50 },
  { id:'p2', type:'delivery', title:'TUN → LHR · Sara B.',     date:'Jun 10', amount:55.00 },
  { id:'p3', type:'withdraw', title:'Withdrawal to Flouci',    date:'Jun 1',  amount:-600.00 },
  { id:'p4', type:'delivery', title:'TUN → DXB · Amina C.',   date:'May 28', amount:67.20 },
]
</script>

<style scoped>
.ea { min-height:100vh; background:#111; font-family:'Montserrat',sans-serif; padding-bottom:70px; }

/* Header */
.ea-header { display:flex; align-items:center; justify-content:space-between; padding:20px 20px; position:sticky; top:0; z-index:50; background:#111; }
.ea-header-title { font-size:20px; font-weight:900; color:#fff; letter-spacing:-0.02em; margin:0; }
.ea-withdraw-btn { background:#e8dfa0; color:#111; border:none; border-radius:99px; padding:8px 16px; font-family:'Montserrat',sans-serif; font-size:12px; font-weight:800; cursor:pointer; transition:opacity 0.15s; }
.ea-withdraw-btn:hover { opacity:0.88; }

/* Hero */
.ea-hero { padding:8px 20px 24px; }
.ea-hero-label { font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.45); display:block; margin-bottom:8px; }
.ea-hero-amount { display:flex; align-items:flex-start; gap:4px; margin-bottom:20px; }
.ea-hero-val { font-size:clamp(48px,13vw,68px); font-weight:900; color:#fff; letter-spacing:-0.04em; line-height:1; }
.ea-hero-currency { font-size:22px; font-weight:800; color:rgba(255,255,255,0.55); align-self:flex-end; margin-bottom:8px; }
.ea-sparkline { margin: 0 -4px; height:60px; }
.ea-sparkline svg { width:100%; height:60px; }
.ea-hero-period { font-size:10px; font-weight:700; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:0.1em; margin-top:8px; }

/* Body (white card area) */
.ea-body { background:#f0f0ee; border-radius:24px 24px 0 0; margin-top:-12px; min-height:60vh; }

/* Split cards */
.ea-split-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:20px 16px 0; }
.ea-split-card { border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:4px; }
.ea-split-card--available { background:#2230a0; }
.ea-split-card--escrow { background:#fff; border:1.5px solid rgba(17,17,17,0.1); }
.ea-split-label { font-size:10px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.55); }
.ea-split-card--escrow .ea-split-label { color:rgba(17,17,17,0.45); }
.ea-split-val { font-size:22px; font-weight:900; color:#fff; letter-spacing:-0.03em; }
.ea-split-card--escrow .ea-split-val { color:#111; }
.ea-split-sub { font-size:10px; font-weight:600; color:rgba(255,255,255,0.45); }
.ea-split-card--escrow .ea-split-sub { color:rgba(17,17,17,0.4); }

/* Sections */
.ea-section { padding:20px 16px 0; }
.ea-section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.ea-section-title { font-size:14px; font-weight:900; color:#111; margin:0 0 12px; }

/* Monthly bars */
.ea-months { display:flex; flex-direction:column; gap:10px; }
.ea-month-row { display:flex; align-items:center; gap:10px; }
.ea-month-name { font-size:11px; font-weight:700; color:rgba(17,17,17,0.45); width:28px; flex-shrink:0; }
.ea-month-bar-wrap { flex:1; height:8px; background:rgba(17,17,17,0.08); border-radius:99px; overflow:hidden; }
.ea-month-bar { height:100%; background:#2230a0; border-radius:99px; transition:width 0.5s cubic-bezier(.4,0,.2,1); }
.ea-month-amt { font-size:11px; font-weight:800; color:#111; width:36px; text-align:right; flex-shrink:0; }

/* Payouts */
.ea-payouts { display:flex; flex-direction:column; gap:2px; padding-bottom:20px; }
.ea-payout-row { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1.5px solid rgba(17,17,17,0.06); }
.ea-payout-row:last-child { border-bottom:none; }
.ea-payout-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ea-payout-icon--delivery { background:#d4d8f8; color:#2230a0; }
.ea-payout-icon--withdraw { background:#fef3c7; color:#854f0b; }
.ea-payout-info { flex:1; display:flex; flex-direction:column; gap:2px; }
.ea-payout-title { font-size:13px; font-weight:700; color:#111; }
.ea-payout-date { font-size:11px; font-weight:600; color:rgba(17,17,17,0.4); }
.ea-payout-amt { font-size:14px; font-weight:900; flex-shrink:0; }
.ea-payout-amt.pos { color:#3b6d11; }
.ea-payout-amt.neg { color:#b0392e; }

/* Tab bar */
.ea-tab-bar { position:fixed; bottom:0; left:0; right:0; z-index:200; background:#111; display:flex; align-items:stretch; height:64px; border-top:2px solid rgba(255,255,255,0.06); padding-bottom:env(safe-area-inset-bottom,0px); }
.ea-tab { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; text-decoration:none; color:rgba(255,255,255,0.38); font-size:9px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; transition:color 0.15s; padding:0 4px; }
.ea-tab.active, .ea-tab:hover { color:#fff; }
@media (min-width:768px) { .ea-tab-bar { display:none; } .ea { padding-bottom:0; } }
</style>
