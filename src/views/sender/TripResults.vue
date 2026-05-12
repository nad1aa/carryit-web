<template>
  <div class="tr">
    <!-- Header -->
    <header class="tr-header">
      <button class="tr-back" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="tr-route-summary">
        <span class="tr-route-city">{{ from || 'Tunis' }}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        <span class="tr-route-city">{{ to || 'Paris' }}</span>
        <span class="tr-route-date">{{ date || 'Any date' }}</span>
      </div>
      <button class="tr-filter-btn" @click="showFilters = !showFilters">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
        </svg>
      </button>
    </header>

    <!-- Filter pills -->
    <div class="tr-filters">
      <button
        v-for="f in filters"
        :key="f.id"
        class="tr-filter-pill"
        :class="{ active: activeFilter === f.id }"
        @click="activeFilter = f.id"
      >{{ f.label }}</button>
    </div>

    <!-- Results count + Find a match -->
    <div class="tr-toolbar">
      <div class="tr-count">
        <span class="tr-count-num">{{ sortedTrips.length }}</span> travelers found
      </div>
      <button class="tr-match-btn" @click="openSwipe">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
        Find a match
      </button>
    </div>

    <!-- Trip cards -->
    <main class="tr-list">
      <!-- Empty state -->
      <div v-if="sortedTrips.length === 0" class="tr-empty">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(17,17,17,0.18)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="8" y1="11" x2="14" y2="11"/></svg>
        <span class="tr-empty-title">No travelers found</span>
        <span class="tr-empty-sub">Try a different sort order or adjust your search</span>
        <div class="tr-empty-actions">
          <button class="tr-empty-btn tr-empty-btn--primary" @click="activeFilter = 'best'">Reset filters</button>
          <button class="tr-empty-btn tr-empty-btn--ghost" @click="$router.back()">Change route</button>
        </div>
      </div>

      <router-link
        v-for="(trip, i) in sortedTrips"
        :key="trip.id"
        :to="`/sender/trip/${trip.id}`"
        class="tr-card"
        :class="{ 'tr-card--best': i === 0 && activeFilter === 'best' }"
      >
        <div v-if="i === 0 && activeFilter === 'best'" class="tr-badge-best">BEST MATCH</div>

        <div class="tr-card-top">
          <div class="tr-traveler">
            <div class="tr-traveler-avatar" :style="{ background: trip.avatarColor }">
              {{ trip.name[0] }}
            </div>
            <div class="tr-traveler-info">
              <span class="tr-traveler-name">{{ trip.name }}</span>
              <div class="tr-traveler-stars">
                <svg v-for="n in 5" :key="n" width="11" height="11" viewBox="0 0 24 24" :fill="n <= trip.rating ? '#e8dfa0' : 'none'" stroke="#e8dfa0" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span class="tr-traveler-reviews">({{ trip.reviews }})</span>
              </div>
            </div>
          </div>
          <div class="tr-price">
            <span class="tr-price-val">{{ trip.price }}</span>
            <span class="tr-price-unit"> DT/kg</span>
          </div>
        </div>

        <div class="tr-card-route">
          <div class="tr-leg">
            <span class="tr-leg-time">{{ trip.departTime }}</span>
            <span class="tr-leg-city">{{ trip.from }}</span>
          </div>
          <div class="tr-leg-line">
            <div class="tr-leg-dot"/>
            <div class="tr-leg-bar"/>
            <div class="tr-leg-plane">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#2230a0">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
            </div>
            <div class="tr-leg-bar"/>
            <div class="tr-leg-dot"/>
          </div>
          <div class="tr-leg tr-leg--right">
            <span class="tr-leg-time">{{ trip.arriveTime }}</span>
            <span class="tr-leg-city">{{ trip.to }}</span>
          </div>
        </div>

        <div class="tr-card-footer">
          <div class="tr-capacity">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
            {{ trip.availableKg }}kg available
          </div>
          <div class="tr-tags">
            <span v-if="trip.verified" class="tr-tag tr-tag--verified">Verified</span>
            <span v-if="trip.fast" class="tr-tag tr-tag--fast">Fast responder</span>
          </div>
        </div>
      </router-link>
    </main>

    <!-- ═══ SWIPE OVERLAY ═══ -->
    <Teleport to="body">
      <div v-if="swipeMode" class="tr-swipe-overlay">
        <!-- Overlay header -->
        <div class="tr-swipe-hdr">
          <button class="tr-swipe-close" @click="swipeMode = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <span class="tr-swipe-hdr-title">Find a match</span>
          <span class="tr-swipe-hdr-count" v-if="currentSwipeTrip">{{ swipeIndex + 1 }} / {{ trips.length }}</span>
          <span class="tr-swipe-hdr-count" v-else>Done</span>
        </div>

        <!-- Card arena -->
        <div class="tr-swipe-arena">
          <!-- Done state -->
          <div v-if="!currentSwipeTrip" class="tr-swipe-done">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(17,17,17,0.25)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
            <p>You've reviewed all travelers</p>
            <button class="tr-swipe-restart" @click="swipeIndex = 0">Start over</button>
          </div>

          <template v-else>
            <!-- Background ghost cards (stack depth illusion) -->
            <div
              v-for="depth in [2, 1]"
              :key="'bg' + depth"
              class="tr-swipe-card tr-swipe-card--bg"
              :style="bgCardStyle(depth)"
            >
              <div v-if="trips[swipeIndex + depth]" class="tr-swipe-card-inner">
                <div class="tr-swipe-avatar" :style="{ background: trips[swipeIndex + depth].avatarColor }">
                  {{ trips[swipeIndex + depth].name[0] }}
                </div>
              </div>
            </div>

            <!-- Active draggable card -->
            <div
              class="tr-swipe-card tr-swipe-card--active"
              :style="activeCardStyle"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointercancel="onPointerUp"
            >
              <!-- Swipe labels -->
              <div class="tr-swipe-label tr-swipe-label--yes" :style="{ opacity: Math.min(1, Math.max(0, dragX / 100)) }">
                REQUEST
              </div>
              <div class="tr-swipe-label tr-swipe-label--no" :style="{ opacity: Math.min(1, Math.max(0, -dragX / 100)) }">
                SKIP
              </div>

              <!-- Card content -->
              <div class="tr-swipe-card-body">
                <div class="tr-swipe-top">
                  <div class="tr-swipe-avatar" :style="{ background: currentSwipeTrip.avatarColor }">
                    {{ currentSwipeTrip.name[0] }}
                  </div>
                  <div class="tr-swipe-info">
                    <span class="tr-swipe-name">{{ currentSwipeTrip.name }}</span>
                    <div class="tr-swipe-stars">
                      <svg v-for="n in 5" :key="n" width="13" height="13" viewBox="0 0 24 24"
                        :fill="n <= currentSwipeTrip.rating ? '#2230a0' : 'none'"
                        stroke="#2230a0" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      <span class="tr-swipe-reviews">({{ currentSwipeTrip.reviews }})</span>
                    </div>
                  </div>
                  <div class="tr-swipe-price">
                    <span class="tr-swipe-price-val">{{ currentSwipeTrip.price }}</span>
                    <span class="tr-swipe-price-unit">DT/kg</span>
                  </div>
                </div>

                <div class="tr-swipe-route">
                  <div class="tr-swipe-leg">
                    <span class="tr-swipe-time">{{ currentSwipeTrip.departTime }}</span>
                    <span class="tr-swipe-city">{{ currentSwipeTrip.from }}</span>
                  </div>
                  <div class="tr-swipe-line">
                    <div class="tr-swipe-dot"/><div class="tr-swipe-bar"/>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#2230a0">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                    </svg>
                    <div class="tr-swipe-bar"/><div class="tr-swipe-dot"/>
                  </div>
                  <div class="tr-swipe-leg tr-swipe-leg--right">
                    <span class="tr-swipe-time">{{ currentSwipeTrip.arriveTime }}</span>
                    <span class="tr-swipe-city">{{ currentSwipeTrip.to }}</span>
                  </div>
                </div>

                <div class="tr-swipe-meta-row">
                  <div class="tr-swipe-meta-item">
                    <span class="tr-swipe-meta-label">Available</span>
                    <span class="tr-swipe-meta-val">{{ currentSwipeTrip.availableKg }} kg</span>
                  </div>
                  <div class="tr-swipe-meta-item">
                    <span class="tr-swipe-meta-label">Reviews</span>
                    <span class="tr-swipe-meta-val">{{ currentSwipeTrip.reviews }}</span>
                  </div>
                  <div class="tr-swipe-meta-item">
                    <span class="tr-swipe-meta-label">Response</span>
                    <span class="tr-swipe-meta-val">{{ currentSwipeTrip.fast ? 'Fast' : 'Normal' }}</span>
                  </div>
                </div>

                <div class="tr-swipe-tags">
                  <span v-if="currentSwipeTrip.verified" class="tr-tag tr-tag--verified">Verified</span>
                  <span v-if="currentSwipeTrip.fast" class="tr-tag tr-tag--fast">Fast responder</span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Action buttons -->
        <div v-if="currentSwipeTrip" class="tr-swipe-actions">
          <button class="tr-swipe-action tr-swipe-action--skip" @click="skipTrip" title="Skip">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <button class="tr-swipe-action tr-swipe-action--request" @click="requestTrip" title="Request">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>
        </div>

        <!-- Hint -->
        <p class="tr-swipe-hint">Drag right to request · left to skip</p>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route        = useRoute()
const router       = useRouter()
const from         = route.query.from
const to           = route.query.to
const date         = route.query.date
const activeFilter = ref('best')
const showFilters  = ref(false)

const filters = [
  { id: 'best',    label: 'Best match' },
  { id: 'price',   label: 'Cheapest'   },
  { id: 'soonest', label: 'Soonest'    },
  { id: 'rating',  label: 'Top rated'  },
]

const trips = [
  { id: 't1', name: 'Yasmine B.',  rating: 5, reviews: 42, price: 25, departTime: '08:30', arriveTime: '12:15', from: from || 'TUN', to: to || 'CDG', availableKg: 12, verified: true,  fast: true,  avatarColor: '#2230a0' },
  { id: 't2', name: 'Mehdi K.',    rating: 4, reviews: 28, price: 20, departTime: '11:00', arriveTime: '14:45', from: from || 'TUN', to: to || 'CDG', availableKg: 8,  verified: true,  fast: false, avatarColor: '#8485d0' },
  { id: 't3', name: 'Amira S.',    rating: 5, reviews: 67, price: 30, departTime: '15:20', arriveTime: '19:05', from: from || 'TUN', to: to || 'CDG', availableKg: 15, verified: true,  fast: true,  avatarColor: '#3b6d11' },
  { id: 't4', name: 'Omar L.',     rating: 3, reviews: 11, price: 18, departTime: '18:45', arriveTime: '22:30', from: from || 'TUN', to: to || 'CDG', availableKg: 5,  verified: false, fast: false, avatarColor: '#854f0b' },
]

const sortedTrips = computed(() => {
  const copy = [...trips]
  if (activeFilter.value === 'price')   return copy.sort((a,b) => a.price - b.price)
  if (activeFilter.value === 'soonest') return copy.sort((a,b) => a.departTime.localeCompare(b.departTime))
  if (activeFilter.value === 'rating')  return copy.sort((a,b) => b.rating - a.rating || b.reviews - a.reviews)
  return copy
})

// ── Swipe mode ──────────────────────────────────────────────────────────────
const swipeMode  = ref(false)
const swipeIndex = ref(0)
const dragX      = ref(0)
const dragging   = ref(false)
let startX = 0
let capturedPointerId = -1

const currentSwipeTrip = computed(() =>
  swipeIndex.value < trips.length ? trips[swipeIndex.value] : null
)

function openSwipe() {
  swipeIndex.value = 0
  dragX.value = 0
  swipeMode.value = true
}

function skipTrip() {
  dragX.value = 0
  swipeIndex.value++
}

function requestTrip() {
  if (!currentSwipeTrip.value) return
  swipeMode.value = false
  router.push(`/sender/trip/${currentSwipeTrip.value.id}`)
}

function onPointerDown(e) {
  dragging.value = true
  startX = e.clientX
  dragX.value = 0
  capturedPointerId = e.pointerId
  e.currentTarget.setPointerCapture(e.pointerId)
}

function onPointerMove(e) {
  if (!dragging.value) return
  dragX.value = e.clientX - startX
}

function onPointerUp(e) {
  if (!dragging.value) return
  dragging.value = false
  const dx = dragX.value
  dragX.value = 0
  if (dx > 80) {
    requestTrip()
  } else if (dx < -80) {
    skipTrip()
  }
}

// Active card style (draggable)
const activeCardStyle = computed(() => ({
  transform: `translateX(${dragX.value}px) rotate(${dragX.value * 0.05}deg)`,
  transition: dragging.value ? 'none' : 'transform 0.35s cubic-bezier(.4,0,.2,1)',
  cursor: dragging.value ? 'grabbing' : 'grab',
}))

// Background card styles (stack illusion)
function bgCardStyle(depth) {
  const scale  = 1 - depth * 0.045
  const offset = depth * 14
  return {
    transform: `translateY(${offset}px) scale(${scale})`,
    zIndex: 10 - depth,
    opacity: 1 - depth * 0.18,
  }
}
</script>

<style scoped>
.tr { min-height: 100vh; background: #f0f0ee; font-family: 'Montserrat', sans-serif; }

/* Header */
.tr-header { position: sticky; top: 0; z-index: 50; background: #111; color: #fff; display: flex; align-items: center; gap: 12px; padding: 0 16px; height: 58px; }
.tr-back { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); border: none; border-radius: 50%; color: #fff; cursor: pointer; transition: background 0.15s; flex-shrink: 0; }
.tr-back:hover { background: rgba(255,255,255,0.16); }
.tr-route-summary { flex: 1; display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; }
.tr-route-city { color: #fff; }
.tr-route-date { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.45); margin-left: 4px; }
.tr-filter-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); border: none; border-radius: 50%; color: #fff; cursor: pointer; }

/* Filter pills */
.tr-filters { display: flex; gap: 8px; padding: 14px 16px; overflow-x: auto; scrollbar-width: none; }
.tr-filters::-webkit-scrollbar { display: none; }
.tr-filter-pill { white-space: nowrap; background: #fff; border: 1.5px solid rgba(17,17,17,0.14); border-radius: 99px; padding: 7px 14px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: #111; cursor: pointer; transition: all 0.15s; }
.tr-filter-pill.active { background: #2230a0; border-color: #2230a0; color: #e8dfa0; }

/* Toolbar (count + match btn) */
.tr-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 0 16px 12px; }
.tr-count { font-size: 12px; font-weight: 600; color: rgba(17,17,17,0.45); }
.tr-count-num { font-weight: 800; color: #111; font-size: 14px; }
.tr-match-btn {
  display: flex; align-items: center; gap: 7px;
  background: #2230a0; color: #e8dfa0; border: none; border-radius: 99px;
  padding: 8px 16px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 800;
  cursor: pointer; transition: background 0.15s;
}
.tr-match-btn:hover { background: #111; }

/* Trip cards */
.tr-list { padding: 0 16px 24px; display: flex; flex-direction: column; gap: 12px; }
.tr-card { background: #fff; border: 1.5px solid rgba(17,17,17,0.1); border-radius: 16px; padding: 16px; text-decoration: none; display: block; position: relative; transition: border-color 0.15s, box-shadow 0.15s; overflow: hidden; }
.tr-card:hover { border-color: #2230a0; box-shadow: 0 4px 20px rgba(34,48,160,0.1); }
.tr-card--best { border-color: #2230a0; }
.tr-badge-best { position: absolute; top: 0; right: 0; background: #2230a0; color: #e8dfa0; font-size: 9px; font-weight: 800; letter-spacing: 0.1em; padding: 5px 12px; border-bottom-left-radius: 10px; }
.tr-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
.tr-traveler { display: flex; align-items: center; gap: 10px; }
.tr-traveler-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; color: #fff; flex-shrink: 0; }
.tr-traveler-info { display: flex; flex-direction: column; gap: 3px; }
.tr-traveler-name { font-size: 14px; font-weight: 800; color: #111; }
.tr-traveler-stars { display: flex; align-items: center; gap: 2px; }
.tr-traveler-reviews { font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.4); margin-left: 3px; }
.tr-price { text-align: right; }
.tr-price-val { font-size: 22px; font-weight: 900; color: #2230a0; letter-spacing: -0.03em; }
.tr-price-unit { font-size: 11px; font-weight: 600; color: rgba(17,17,17,0.45); }
.tr-card-route { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; padding: 12px; background: #f5f5f3; border-radius: 10px; }
.tr-leg { display: flex; flex-direction: column; gap: 2px; }
.tr-leg--right { text-align: right; }
.tr-leg-time { font-size: 15px; font-weight: 900; color: #111; }
.tr-leg-city { font-size: 11px; font-weight: 700; color: rgba(17,17,17,0.5); }
.tr-leg-line { flex: 1; display: flex; align-items: center; }
.tr-leg-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(17,17,17,0.25); flex-shrink: 0; }
.tr-leg-bar { flex: 1; height: 1.5px; background: rgba(17,17,17,0.18); }
.tr-leg-plane { flex-shrink: 0; }
.tr-card-footer { display: flex; align-items: center; justify-content: space-between; }
.tr-capacity { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: rgba(17,17,17,0.5); }
.tr-tags { display: flex; gap: 6px; }
.tr-tag { font-size: 9px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; padding: 3px 8px; border-radius: 99px; }
.tr-tag--verified { background: #d1f4d1; color: #2d5a2d; }
.tr-tag--fast     { background: #d4d8f8; color: #2230a0; }

/* Empty state */
.tr-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 56px 24px; text-align: center; }
.tr-empty-title { font-size: 16px; font-weight: 800; color: #111; }
.tr-empty-sub { font-size: 12px; font-weight: 600; color: rgba(17,17,17,0.45); max-width: 220px; line-height: 1.5; }
.tr-empty-actions { display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap; justify-content: center; }
.tr-empty-btn { border-radius: 99px; padding: 9px 20px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 800; cursor: pointer; transition: all 0.15s; border: none; }
.tr-empty-btn--primary { background: #2230a0; color: #e8dfa0; }
.tr-empty-btn--primary:hover { background: #111; }
.tr-empty-btn--ghost { background: transparent; border: 1.5px solid rgba(17,17,17,0.2); color: #111; }
.tr-empty-btn--ghost:hover { border-color: #111; }

/* ─── Swipe overlay ─────────────────────────────────────────────────────── */
.tr-swipe-overlay {
  position: fixed; inset: 0; z-index: 999;
  background: #1a1a2e;
  display: flex; flex-direction: column; align-items: center;
  font-family: 'Montserrat', sans-serif;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.tr-swipe-hdr {
  width: 100%; display: flex; align-items: center; gap: 12px;
  padding: 0 16px; height: 58px; flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.tr-swipe-close {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.08); border: none; border-radius: 50%; color: #fff; cursor: pointer;
}
.tr-swipe-close:hover { background: rgba(255,255,255,0.15); }
.tr-swipe-hdr-title { flex: 1; font-size: 16px; font-weight: 800; color: #fff; }
.tr-swipe-hdr-count { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.45); }

.tr-swipe-arena {
  flex: 1; width: 100%; display: flex; align-items: center; justify-content: center;
  position: relative; padding: 24px 20px 8px;
}

/* Swipe cards */
.tr-swipe-card {
  position: absolute; width: min(340px, calc(100vw - 40px));
  background: #fff; border-radius: 20px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.35);
  overflow: hidden; user-select: none; touch-action: none;
}
.tr-swipe-card--active { z-index: 20; }
.tr-swipe-card--bg { z-index: 10; pointer-events: none; }

/* Swipe labels */
.tr-swipe-label {
  position: absolute; top: 20px; padding: 8px 16px; border-radius: 8px;
  font-size: 18px; font-weight: 900; letter-spacing: 0.1em; z-index: 30;
  pointer-events: none; transition: opacity 0.05s;
}
.tr-swipe-label--yes { left: 20px; background: rgba(59,109,17,0.9); color: #fff; transform: rotate(-8deg); }
.tr-swipe-label--no  { right: 20px; background: rgba(180,30,30,0.85); color: #fff; transform: rotate(8deg); }

/* Card body */
.tr-swipe-card-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.tr-swipe-top { display: flex; align-items: center; gap: 12px; }
.tr-swipe-avatar { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; color: #fff; flex-shrink: 0; }
.tr-swipe-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.tr-swipe-name { font-size: 17px; font-weight: 900; color: #111; }
.tr-swipe-stars { display: flex; align-items: center; gap: 2px; }
.tr-swipe-reviews { font-size: 11px; font-weight: 600; color: rgba(17,17,17,0.4); margin-left: 4px; }
.tr-swipe-price { text-align: right; }
.tr-swipe-price-val { display: block; font-size: 26px; font-weight: 900; color: #2230a0; letter-spacing: -0.04em; line-height: 1; }
.tr-swipe-price-unit { font-size: 11px; font-weight: 600; color: rgba(17,17,17,0.4); }

.tr-swipe-route { display: flex; align-items: center; gap: 8px; background: #f5f5f3; border-radius: 10px; padding: 12px; }
.tr-swipe-leg { display: flex; flex-direction: column; gap: 2px; }
.tr-swipe-leg--right { text-align: right; }
.tr-swipe-time { font-size: 16px; font-weight: 900; color: #111; }
.tr-swipe-city { font-size: 11px; font-weight: 700; color: rgba(17,17,17,0.5); }
.tr-swipe-line { flex: 1; display: flex; align-items: center; }
.tr-swipe-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(17,17,17,0.25); flex-shrink: 0; }
.tr-swipe-bar { flex: 1; height: 1.5px; background: rgba(17,17,17,0.18); }

.tr-swipe-meta-row { display: flex; gap: 0; border: 1.5px solid rgba(17,17,17,0.08); border-radius: 10px; overflow: hidden; }
.tr-swipe-meta-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 10px 6px; border-right: 1.5px solid rgba(17,17,17,0.08); }
.tr-swipe-meta-item:last-child { border-right: none; }
.tr-swipe-meta-label { font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(17,17,17,0.38); }
.tr-swipe-meta-val { font-size: 13px; font-weight: 800; color: #111; }

.tr-swipe-tags { display: flex; gap: 6px; }

/* Action buttons */
.tr-swipe-actions { display: flex; gap: 28px; align-items: center; padding: 8px 0 16px; flex-shrink: 0; }
.tr-swipe-action {
  width: 64px; height: 64px; border-radius: 50%; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 24px rgba(0,0,0,0.3); transition: transform 0.15s, box-shadow 0.15s;
}
.tr-swipe-action:hover { transform: scale(1.08); box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
.tr-swipe-action--skip    { background: #fff; color: #b41e1e; }
.tr-swipe-action--request { background: #2230a0; color: #e8dfa0; }

.tr-swipe-hint { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.3); margin: 0 0 20px; flex-shrink: 0; }

/* Done state */
.tr-swipe-done { display: flex; flex-direction: column; align-items: center; gap: 16px; color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 600; text-align: center; }
.tr-swipe-done p { margin: 0; }
.tr-swipe-restart { background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.2); border-radius: 10px; padding: 10px 24px; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700; color: #fff; cursor: pointer; transition: background 0.15s; }
.tr-swipe-restart:hover { background: rgba(255,255,255,0.18); }

/* BG card inner (for the depth illusion to have some content) */
.tr-swipe-card-inner { height: 80px; display: flex; align-items: center; justify-content: center; opacity: 0; }

/* Responsive */
@media (min-width: 768px) {
  .tr-list { max-width: 680px; margin: 0 auto; padding: 0 24px 40px; }
  .tr-filters { max-width: 680px; margin: 0 auto; }
  .tr-toolbar { max-width: 680px; margin: 0 auto; }
  .tr-swipe-overlay { align-items: center; }
  .tr-swipe-card { width: 380px; }
}
</style>
