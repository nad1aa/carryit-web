<template>
  <div class="mb">
    <!-- Header -->
    <header class="mb-header">
      <h1 class="mb-header-title">My Deliveries</h1>
      <router-link to="/sender/search" class="mb-new-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New
      </router-link>
    </header>

    <!-- Filter tabs -->
    <div class="mb-filters">
      <button
        v-for="f in filters"
        :key="f.id"
        class="mb-filter"
        :class="{ active: activeFilter === f.id }"
        @click="activeFilter = f.id"
      >
        {{ f.label }}
        <span v-if="f.count" class="mb-filter-count">{{ f.count }}</span>
      </button>
    </div>

    <!-- Booking cards -->
    <main class="mb-list">
      <template v-for="booking in filteredBookings" :key="booking.id">
        <router-link :to="`/sender/tracking/${booking.id}`" class="mb-card">
          <!-- Status stamp -->
          <div class="mb-stamp" :class="`mb-stamp--${booking.status}`">{{ booking.statusLabel }}</div>

          <!-- Route -->
          <div class="mb-card-route">
            <div class="mb-route-leg">
              <span class="mb-airport">{{ booking.fromCode }}</span>
              <span class="mb-city">{{ booking.from }}</span>
            </div>
            <div class="mb-route-line">
              <div class="mb-route-dot"/>
              <div class="mb-route-dash"/>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#2230a0">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
              <div class="mb-route-dash"/>
              <div class="mb-route-dot"/>
            </div>
            <div class="mb-route-leg mb-route-leg--right">
              <span class="mb-airport">{{ booking.toCode }}</span>
              <span class="mb-city">{{ booking.to }}</span>
            </div>
          </div>

          <!-- Meta row -->
          <div class="mb-card-meta">
            <div class="mb-card-traveler">
              <div class="mb-card-avatar" :style="{ background: booking.avatarColor }">{{ booking.travelerName[0] }}</div>
              <span class="mb-card-traveler-name">{{ booking.travelerName }}</span>
            </div>
            <div class="mb-card-right">
              <span class="mb-card-date">{{ booking.date }}</span>
              <span class="mb-card-price">{{ booking.price }} DT</span>
            </div>
          </div>

          <!-- Progress bar (for in-transit) -->
          <div v-if="booking.status === 'transit'" class="mb-progress-wrap">
            <div class="mb-progress-bar">
              <div class="mb-progress-fill" :style="{ width: booking.progress + '%' }"/>
            </div>
            <span class="mb-progress-label">{{ booking.progress }}% delivered</span>
          </div>
        </router-link>
      </template>

      <div v-if="filteredBookings.length === 0" class="mb-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(17,17,17,0.2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        </svg>
        <span>No {{ activeFilter }} deliveries</span>
        <router-link to="/sender/search" class="mb-empty-cta">Send your first package →</router-link>
      </div>
    </main>

    <!-- Bottom tab bar -->
    <nav class="mb-tab-bar">
      <router-link to="/sender/search" class="mb-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span>Search</span>
      </router-link>
      <router-link to="/sender/bookings" class="mb-tab active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10"/><path d="M1 5h22v5H1z"/><line x1="10" y1="15" x2="14" y2="15"/></svg>
        <span>Bookings</span>
      </router-link>
      <router-link to="/chat" class="mb-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        <span>Chat</span>
      </router-link>
      <router-link to="/profile" class="mb-tab">
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
  { id: 'all',       label: 'All',        count: 4  },
  { id: 'transit',   label: 'In Transit', count: 1  },
  { id: 'pending',   label: 'Pending',    count: 1  },
  { id: 'delivered', label: 'Delivered',  count: 2  },
]

const bookings = [
  { id: 'b1', from: 'Tunis', fromCode: 'TUN', to: 'Paris', toCode: 'CDG', date: 'Jun 14', status: 'transit',   statusLabel: 'IN TRANSIT',   travelerName: 'Yasmine B.', avatarColor: '#2230a0', price: 65.60, progress: 60 },
  { id: 'b2', from: 'Tunis', fromCode: 'TUN', to: 'London',toCode: 'LHR', date: 'Jun 18', status: 'pending',   statusLabel: 'PENDING',       travelerName: 'Mehdi K.',  avatarColor: '#8485d0', price: 52.50, progress: 0  },
  { id: 'b3', from: 'Sousse',fromCode: 'SFA', to: 'Dubai', toCode: 'DXB', date: 'May 30', status: 'delivered', statusLabel: 'DELIVERED',     travelerName: 'Amira S.', avatarColor: '#3b6d11', price: 107.60, progress: 100 },
  { id: 'b4', from: 'Tunis', fromCode: 'TUN', to: 'Paris', toCode: 'CDG', date: 'May 20', status: 'delivered', statusLabel: 'DELIVERED',     travelerName: 'Omar L.',  avatarColor: '#854f0b', price: 39.40, progress: 100 },
]

const filteredBookings = computed(() =>
  activeFilter.value === 'all' ? bookings : bookings.filter(b => b.status === activeFilter.value)
)
</script>

<style scoped>
.mb {
  min-height: 100vh; background: #f0f0ee;
  font-family: 'Montserrat', sans-serif; padding-bottom: 70px;
}

/* Header */
.mb-header {
  background: #111; color: #fff;
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 20px 20px;
  position: sticky; top: 0; z-index: 50;
}
.mb-header-title { font-size: 20px; font-weight: 900; letter-spacing: -0.02em; margin: 0; }
.mb-new-btn {
  display: flex; align-items: center; gap: 6px;
  background: #e8dfa0; color: #111;
  border: none; border-radius: 99px; padding: 8px 14px;
  font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 800;
  cursor: pointer; text-decoration: none; transition: opacity 0.15s;
}
.mb-new-btn:hover { opacity: 0.88; }

/* Filters */
.mb-filters {
  display: flex; gap: 6px; padding: 14px 16px;
  overflow-x: auto; scrollbar-width: none;
  background: #111;
  border-bottom: 2px solid rgba(255,255,255,0.06);
}
.mb-filters::-webkit-scrollbar { display: none; }
.mb-filter {
  white-space: nowrap;
  background: rgba(255,255,255,0.08);
  border: none; border-radius: 99px;
  padding: 7px 14px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.55);
  cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; gap: 6px;
}
.mb-filter.active { background: #e8dfa0; color: #111; }
.mb-filter-count {
  background: rgba(255,255,255,0.15); color: inherit;
  font-size: 10px; font-weight: 800;
  padding: 1px 6px; border-radius: 99px;
}
.mb-filter.active .mb-filter-count { background: rgba(17,17,17,0.15); }

/* List */
.mb-list { padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }

/* Booking card */
.mb-card {
  background: #fff; border-radius: 16px;
  border: 1.5px solid rgba(17,17,17,0.08);
  padding: 16px;
  display: block; text-decoration: none;
  position: relative; overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.mb-card:hover { border-color: #2230a0; box-shadow: 0 4px 16px rgba(34,48,160,0.08); }

/* Stamp */
.mb-stamp {
  position: absolute; top: 0; right: 0;
  font-size: 8px; font-weight: 900; letter-spacing: 0.14em;
  padding: 5px 12px;
  border-bottom-left-radius: 10px;
}
.mb-stamp--transit   { background: #fef3c7; color: #854f0b; }
.mb-stamp--pending   { background: #d4d8f8; color: #2230a0; }
.mb-stamp--delivered { background: #d1f4d1; color: #2d5a2d; }

/* Route visual */
.mb-card-route {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 14px;
}
.mb-route-leg { display: flex; flex-direction: column; gap: 1px; }
.mb-route-leg--right { text-align: right; }
.mb-airport { font-size: 20px; font-weight: 900; color: #111; line-height: 1; }
.mb-city { font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.45); }
.mb-route-line { flex: 1; display: flex; align-items: center; gap: 3px; }
.mb-route-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(17,17,17,0.25); flex-shrink: 0; }
.mb-route-dash { flex: 1; height: 1.5px; background: rgba(17,17,17,0.18); }

/* Card meta */
.mb-card-meta { display: flex; align-items: center; justify-content: space-between; }
.mb-card-traveler { display: flex; align-items: center; gap: 8px; }
.mb-card-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 900; color: #fff;
}
.mb-card-traveler-name { font-size: 12px; font-weight: 700; color: #555; }
.mb-card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.mb-card-date { font-size: 11px; font-weight: 600; color: rgba(17,17,17,0.4); }
.mb-card-price { font-size: 14px; font-weight: 900; color: #111; }

/* Progress bar */
.mb-progress-wrap { margin-top: 12px; }
.mb-progress-bar {
  height: 4px; background: rgba(17,17,17,0.1);
  border-radius: 99px; overflow: hidden; margin-bottom: 5px;
}
.mb-progress-fill { height: 100%; background: #2230a0; border-radius: 99px; }
.mb-progress-label { font-size: 10px; font-weight: 700; color: #2230a0; }

/* Empty state */
.mb-empty {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 48px 0; color: rgba(17,17,17,0.35);
  font-size: 13px; font-weight: 600;
}
.mb-empty-cta { font-size: 13px; font-weight: 800; color: #2230a0; text-decoration: none; }

/* Tab bar */
.mb-tab-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
  background: #111; display: flex; align-items: stretch; height: 64px;
  border-top: 2px solid rgba(255,255,255,0.06);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.mb-tab {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px;
  text-decoration: none; color: rgba(255,255,255,0.38);
  font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  transition: color 0.15s; padding: 0 4px;
}
.mb-tab.active, .mb-tab:hover { color: #fff; }

/* Responsive */
@media (min-width: 768px) {
  .mb-tab-bar { display: none; }
  .mb { padding-bottom: 0; }
  .mb-list { max-width: 680px; margin: 0 auto; padding: 20px 24px 40px; }
}
</style>
