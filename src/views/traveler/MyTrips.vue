<template>
  <div class="mt-page">
    <header class="mt-header">
      <h1 class="mt-header-title">My Trips</h1>
      <router-link to="/traveler/post-trip" class="mt-post-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Post trip
      </router-link>
    </header>

    <!-- Filter pills -->
    <div class="mt-filters">
      <button v-for="f in filters" :key="f.id" class="mt-filter" :class="{ active: activeFilter === f.id }" @click="activeFilter = f.id">
        {{ f.label }}
        <span v-if="f.count" class="mt-filter-count">{{ f.count }}</span>
      </button>
    </div>

    <main class="mt-list">
      <router-link v-for="trip in filteredTrips" :key="trip.id" :to="`/traveler/requests`" class="mt-card">
        <!-- Status stamp -->
        <div class="mt-stamp" :class="`mt-stamp--${trip.status}`">{{ trip.statusLabel }}</div>

        <!-- Route -->
        <div class="mt-card-route">
          <div class="mt-leg">
            <span class="mt-airport">{{ trip.fromCode }}</span>
            <span class="mt-city">{{ trip.from }}</span>
          </div>
          <div class="mt-route-line">
            <div class="mt-dot"/><div class="mt-dash"/>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#2230a0"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
            <div class="mt-dash"/><div class="mt-dot"/>
          </div>
          <div class="mt-leg mt-leg--right">
            <span class="mt-airport">{{ trip.toCode }}</span>
            <span class="mt-city">{{ trip.to }}</span>
          </div>
        </div>

        <!-- Meta -->
        <div class="mt-card-meta">
          <div class="mt-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {{ trip.date }}
          </div>
          <div class="mt-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
            {{ trip.capacity }}kg available
          </div>
          <div class="mt-price">{{ trip.price }} DT/kg</div>
        </div>

        <!-- Requests indicator -->
        <div v-if="trip.requests > 0" class="mt-requests-bar">
          <span class="mt-requests-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            {{ trip.requests }} booking request{{ trip.requests > 1 ? 's' : '' }}
          </span>
          <span class="mt-requests-arrow">→</span>
        </div>
      </router-link>

      <div v-if="filteredTrips.length === 0" class="mt-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(17,17,17,0.2)" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        <span>No {{ activeFilter }} trips</span>
        <router-link to="/traveler/post-trip" class="mt-empty-cta">Post your first trip →</router-link>
      </div>
    </main>

    <!-- Bottom tab bar -->
    <nav class="mt-tab-bar">
      <router-link to="/traveler/trips" class="mt-tab active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        <span>My Trips</span>
      </router-link>
      <router-link to="/traveler/requests" class="mt-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10"/><path d="M1 5h22v5H1z"/></svg>
        <span>Requests</span>
      </router-link>
      <router-link to="/traveler/earnings" class="mt-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        <span>Earnings</span>
      </router-link>
      <router-link to="/profile" class="mt-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Profile</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeFilter = ref('all')
const filters = [
  { id:'all', label:'All', count:3 }, { id:'open', label:'Open', count:2 },
  { id:'full', label:'Full', count:0 }, { id:'delivered', label:'Delivered', count:1 },
]
const trips = [
  { id:'t1', from:'Tunis', fromCode:'TUN', to:'Paris',  toCode:'CDG', date:'Jun 14', capacity:12, price:8,  status:'open',      statusLabel:'OPEN',      requests:2 },
  { id:'t2', from:'Tunis', fromCode:'TUN', to:'London', toCode:'LHR', date:'Jun 28', capacity:8,  price:7,  status:'open',      statusLabel:'OPEN',      requests:0 },
  { id:'t3', from:'Tunis', fromCode:'TUN', to:'Dubai',  toCode:'DXB', date:'May 12', capacity:0,  price:10, status:'delivered', statusLabel:'DELIVERED', requests:0 },
]
const filteredTrips = computed(() => activeFilter.value === 'all' ? trips : trips.filter(t => t.status === activeFilter.value))
</script>

<style scoped>
.mt-page { min-height:100vh; background:#f0f0ee; font-family:'Montserrat',sans-serif; padding-bottom:70px; }
.mt-header { background:#111; color:#fff; display:flex; align-items:center; justify-content:space-between; padding:20px; position:sticky; top:0; z-index:50; }
.mt-header-title { font-size:20px; font-weight:900; letter-spacing:-0.02em; margin:0; }
.mt-post-btn { display:flex; align-items:center; gap:6px; background:#e8dfa0; color:#111; border:none; border-radius:99px; padding:8px 14px; font-family:'Montserrat',sans-serif; font-size:12px; font-weight:800; cursor:pointer; text-decoration:none; transition:opacity 0.15s; }
.mt-post-btn:hover { opacity:0.88; }
.mt-filters { display:flex; gap:6px; padding:12px 16px; overflow-x:auto; scrollbar-width:none; background:#111; border-bottom:2px solid rgba(255,255,255,0.06); }
.mt-filters::-webkit-scrollbar { display:none; }
.mt-filter { white-space:nowrap; background:rgba(255,255,255,0.08); border:none; border-radius:99px; padding:7px 14px; font-family:'Montserrat',sans-serif; font-size:12px; font-weight:700; color:rgba(255,255,255,0.55); cursor:pointer; transition:all 0.15s; display:flex; align-items:center; gap:6px; }
.mt-filter.active { background:#e8dfa0; color:#111; }
.mt-filter-count { background:rgba(255,255,255,0.15); color:inherit; font-size:10px; font-weight:800; padding:1px 6px; border-radius:99px; }
.mt-filter.active .mt-filter-count { background:rgba(17,17,17,0.15); }
.mt-list { padding:14px 16px; display:flex; flex-direction:column; gap:12px; }
.mt-card { background:#fff; border-radius:16px; border:1.5px solid rgba(17,17,17,0.08); padding:16px; display:block; text-decoration:none; position:relative; overflow:hidden; transition:border-color 0.15s; }
.mt-card:hover { border-color:#2230a0; }
.mt-stamp { position:absolute; top:0; right:0; font-size:8px; font-weight:900; letter-spacing:0.14em; padding:5px 12px; border-bottom-left-radius:10px; }
.mt-stamp--open { background:#d4d8f8; color:#2230a0; }
.mt-stamp--full { background:#fef3c7; color:#854f0b; }
.mt-stamp--delivered { background:#d1f4d1; color:#2d5a2d; }
.mt-card-route { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
.mt-leg { display:flex; flex-direction:column; gap:1px; }
.mt-leg--right { text-align:right; }
.mt-airport { font-size:20px; font-weight:900; color:#111; line-height:1; }
.mt-city { font-size:10px; font-weight:600; color:rgba(17,17,17,0.45); }
.mt-route-line { flex:1; display:flex; align-items:center; gap:3px; }
.mt-dot { width:5px; height:5px; border-radius:50%; background:rgba(17,17,17,0.25); flex-shrink:0; }
.mt-dash { flex:1; height:1.5px; background:rgba(17,17,17,0.18); }
.mt-card-meta { display:flex; align-items:center; gap:14px; }
.mt-meta-item { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:rgba(17,17,17,0.5); }
.mt-price { margin-left:auto; font-size:14px; font-weight:900; color:#2230a0; }
.mt-requests-bar { margin-top:12px; padding-top:12px; border-top:1.5px dashed rgba(17,17,17,0.1); display:flex; align-items:center; justify-content:space-between; }
.mt-requests-label { display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#111; }
.mt-requests-arrow { font-size:14px; color:#2230a0; font-weight:900; }
.mt-empty { display:flex; flex-direction:column; align-items:center; gap:12px; padding:48px 0; color:rgba(17,17,17,0.35); font-size:13px; font-weight:600; }
.mt-empty-cta { font-size:13px; font-weight:800; color:#2230a0; text-decoration:none; }
.mt-tab-bar { position:fixed; bottom:0; left:0; right:0; z-index:200; background:#111; display:flex; align-items:stretch; height:64px; border-top:2px solid rgba(255,255,255,0.06); padding-bottom:env(safe-area-inset-bottom,0px); }
.mt-tab { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; text-decoration:none; color:rgba(255,255,255,0.38); font-size:9px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; transition:color 0.15s; padding:0 4px; }
.mt-tab.active, .mt-tab:hover { color:#fff; }
@media (min-width:768px) { .mt-tab-bar { display:none; } .mt-page { padding-bottom:0; } .mt-list { max-width:680px; margin:0 auto; } }
</style>
