<template>
  <div class="td">
    <!-- Header -->
    <header class="td-header">
      <button class="td-back" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="td-header-title">Trip Detail</span>
      <button class="td-share-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>
    </header>

    <main class="td-body">
      <!-- Traveler hero card -->
      <div class="td-traveler-card">
        <div class="td-traveler-top">
          <div class="td-avatar" style="background:#2230a0">Y</div>
          <div class="td-traveler-info">
            <h2 class="td-traveler-name">Yasmine Belhaj</h2>
            <div class="td-stars">
              <svg v-for="n in 5" :key="n" width="13" height="13" viewBox="0 0 24 24" fill="#e8dfa0" stroke="#e8dfa0" stroke-width="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span class="td-stars-label">5.0 · 42 trips</span>
            </div>
          </div>
          <div class="td-badges">
            <span class="td-badge td-badge--verified">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Verified
            </span>
          </div>
        </div>

        <!-- Route display -->
        <div class="td-route">
          <div class="td-route-node">
            <span class="td-airport">TUN</span>
            <span class="td-city">Tunis</span>
            <span class="td-time">08:30</span>
          </div>
          <div class="td-route-line">
            <div class="td-route-dot"/>
            <div class="td-route-dash"/>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#2230a0">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
            <div class="td-route-dash"/>
            <div class="td-route-dot"/>
            <span class="td-duration">3h 45m</span>
          </div>
          <div class="td-route-node td-route-node--right">
            <span class="td-airport">CDG</span>
            <span class="td-city">Paris</span>
            <span class="td-time">12:15</span>
          </div>
        </div>

        <!-- Capacity bar -->
        <div class="td-capacity-row">
          <span class="td-capacity-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
            12 kg remaining
          </span>
          <span class="td-capacity-of">of 20 kg total</span>
        </div>
        <div class="td-cap-bar">
          <div class="td-cap-fill" style="width: 40%"/>
        </div>
      </div>

      <!-- Price calculator -->
      <div class="td-calc-card">
        <h3 class="td-section-title">Price calculator</h3>
        <div class="td-calc-row">
          <span class="td-calc-label">Weight (kg)</span>
          <div class="td-weight-controls">
            <button class="td-wt-btn" @click="weight = Math.max(0.5, weight - 0.5)">−</button>
            <span class="td-wt-val">{{ weight.toFixed(1) }}</span>
            <button class="td-wt-btn" @click="weight = Math.min(12, weight + 0.5)">+</button>
          </div>
        </div>
        <input
          type="range"
          class="td-slider"
          v-model.number="weight"
          min="0.5" max="12" step="0.5"
        />
        <div class="td-slider-marks">
          <span>0.5kg</span><span>6kg</span><span>12kg</span>
        </div>

        <div class="td-price-breakdown">
          <div class="td-price-line">
            <span>Base ({{ weight.toFixed(1) }}kg × {{ pricePerKg }} DT)</span>
            <span>{{ (weight * pricePerKg).toFixed(2) }} DT</span>
          </div>
          <div class="td-price-line">
            <span>Platform fee (5%)</span>
            <span>{{ platformFee.toFixed(2) }} DT</span>
          </div>
          <div class="td-price-divider"/>
          <div class="td-price-line td-price-total">
            <span>Total</span>
            <span class="td-total-val">{{ total.toFixed(2) }} DT</span>
          </div>
        </div>
      </div>

      <!-- Trip info -->
      <div class="td-info-card">
        <h3 class="td-section-title">What she can carry</h3>
        <div class="td-info-grid">
          <div class="td-info-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Personal shopping</span>
          </div>
          <div class="td-info-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>Documents</span>
          </div>
          <div class="td-info-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <span>Small packages</span>
          </div>
          <div class="td-info-item td-info-item--no">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b0392e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span style="color:#b0392e">Liquids, fragile items</span>
          </div>
        </div>
      </div>

      <!-- Reviews -->
      <div class="td-reviews">
        <h3 class="td-section-title">Reviews</h3>
        <div class="td-review-card" v-for="r in reviews" :key="r.id">
          <div class="td-review-top">
            <span class="td-review-author">{{ r.author }}</span>
            <div class="td-review-stars">
              <svg v-for="n in r.rating" :key="n" width="11" height="11" viewBox="0 0 24 24" fill="#e8dfa0" stroke="#e8dfa0" stroke-width="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
          </div>
          <p class="td-review-text">{{ r.text }}</p>
        </div>
      </div>
    </main>

    <!-- CTA -->
    <div class="td-cta">
      <div class="td-cta-price">{{ total.toFixed(2) }} DT total</div>
      <router-link :to="`/sender/book/${tripId}`" class="td-cta-btn">Book this traveler</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route   = useRoute()
const tripId  = route.params.id

const weight     = ref(2)
const pricePerKg = 25

const platformFee = computed(() => weight.value * pricePerKg * 0.05)
const total       = computed(() => weight.value * pricePerKg + platformFee.value)

const reviews = [
  { id: 1, author: 'Khalil M.', rating: 5, text: 'Yasmine was super reliable. Delivered my package safely within 2 hours of landing.' },
  { id: 2, author: 'Sara B.',   rating: 5, text: 'Great communication throughout. Would book again without hesitation!' },
]
</script>

<style scoped>
.td {
  min-height: 100vh;
  background: #f0f0ee;
  font-family: 'Montserrat', sans-serif;
  padding-bottom: 88px;
}

/* Header */
.td-header {
  position: sticky; top: 0; z-index: 50;
  background: #111; color: #fff;
  display: flex; align-items: center; gap: 12px;
  padding: 0 16px; height: 58px;
}
.td-back, .td-share-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.08); border: none; border-radius: 50%;
  color: #fff; cursor: pointer; transition: background 0.15s;
}
.td-back:hover, .td-share-btn:hover { background: rgba(255,255,255,0.16); }
.td-header-title { flex: 1; font-weight: 800; font-size: 16px; }

/* Body */
.td-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

/* Traveler card */
.td-traveler-card {
  background: #fff; border-radius: 16px;
  border: 1.5px solid rgba(17,17,17,0.1);
  padding: 18px;
}
.td-traveler-top {
  display: flex; align-items: flex-start; gap: 12px; margin-bottom: 18px;
}
.td-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 900; color: #fff; flex-shrink: 0;
}
.td-traveler-info { flex: 1; }
.td-traveler-name { font-size: 16px; font-weight: 900; color: #111; margin: 0 0 4px; }
.td-stars { display: flex; align-items: center; gap: 3px; }
.td-stars-label { font-size: 11px; font-weight: 600; color: rgba(17,17,17,0.5); margin-left: 5px; }
.td-badges { display: flex; flex-direction: column; gap: 5px; }
.td-badge {
  display: flex; align-items: center; gap: 4px;
  font-size: 9px; font-weight: 800; letter-spacing: 0.08em;
  text-transform: uppercase; padding: 4px 8px; border-radius: 99px;
}
.td-badge--verified { background: #d1f4d1; color: #2d5a2d; }

/* Route */
.td-route {
  display: flex; align-items: center; gap: 8px;
  padding: 14px; background: #f5f5f3; border-radius: 12px;
  margin-bottom: 14px;
}
.td-route-node { display: flex; flex-direction: column; gap: 2px; }
.td-route-node--right { text-align: right; }
.td-airport { font-size: 18px; font-weight: 900; color: #111; }
.td-city { font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.45); }
.td-time { font-size: 12px; font-weight: 700; color: #2230a0; }
.td-route-line {
  flex: 1; display: flex; align-items: center; gap: 4px;
  position: relative;
}
.td-route-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(17,17,17,0.3); flex-shrink: 0; }
.td-route-dash { flex: 1; height: 1.5px; background: rgba(17,17,17,0.2); }
.td-duration {
  position: absolute; top: -18px; left: 50%;
  transform: translateX(-50%);
  font-size: 9px; font-weight: 700; color: rgba(17,17,17,0.4);
  white-space: nowrap;
}

/* Capacity */
.td-capacity-row {
  display: flex; justify-content: space-between;
  align-items: center;
  font-size: 12px; font-weight: 600; color: rgba(17,17,17,0.55);
  margin-bottom: 6px;
}
.td-capacity-label { display: flex; align-items: center; gap: 5px; }
.td-capacity-of { font-size: 11px; }
.td-cap-bar {
  height: 5px; background: rgba(17,17,17,0.1);
  border-radius: 99px; overflow: hidden;
}
.td-cap-fill { height: 100%; background: #2230a0; border-radius: 99px; }

/* Calculator card */
.td-calc-card {
  background: #fff; border-radius: 16px;
  border: 1.5px solid rgba(17,17,17,0.1);
  padding: 18px;
}
.td-section-title { font-size: 14px; font-weight: 900; color: #111; margin: 0 0 14px; }
.td-calc-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.td-calc-label { font-size: 13px; font-weight: 600; color: #555; }
.td-weight-controls { display: flex; align-items: center; gap: 12px; }
.td-wt-btn {
  width: 32px; height: 32px;
  background: #f0f0ee; border: 1.5px solid rgba(17,17,17,0.14);
  border-radius: 50%; font-size: 18px; font-weight: 700;
  color: #111; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.td-wt-btn:hover { background: #2230a0; color: #e8dfa0; border-color: #2230a0; }
.td-wt-val { font-size: 18px; font-weight: 900; color: #2230a0; min-width: 36px; text-align: center; }

.td-slider {
  width: 100%;
  -webkit-appearance: none;
  height: 5px;
  background: linear-gradient(to right, #2230a0 calc((var(--v,2) - 0.5) / 11.5 * 100%), rgba(17,17,17,0.15) 0%);
  border-radius: 99px; outline: none; cursor: pointer;
  margin-bottom: 6px;
}
.td-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px; height: 20px;
  background: #2230a0; border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(34,48,160,0.3);
}
.td-slider-marks {
  display: flex; justify-content: space-between;
  font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.35);
  margin-bottom: 16px;
}

.td-price-breakdown { display: flex; flex-direction: column; gap: 8px; }
.td-price-line {
  display: flex; justify-content: space-between;
  font-size: 13px; font-weight: 600; color: #555;
}
.td-price-divider { border-top: 1.5px dashed rgba(17,17,17,0.15); margin: 4px 0; }
.td-price-total { font-size: 14px; font-weight: 800; color: #111; }
.td-total-val { color: #2230a0; font-size: 16px; }

/* Info card */
.td-info-card {
  background: #fff; border-radius: 16px;
  border: 1.5px solid rgba(17,17,17,0.1);
  padding: 18px;
}
.td-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.td-info-item {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 600; color: #333;
}

/* Reviews */
.td-reviews { display: flex; flex-direction: column; gap: 10px; }
.td-review-card {
  background: #fff; border-radius: 12px;
  border: 1.5px solid rgba(17,17,17,0.08);
  padding: 14px;
}
.td-review-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
}
.td-review-author { font-size: 13px; font-weight: 800; color: #111; }
.td-review-stars { display: flex; gap: 2px; }
.td-review-text { font-size: 13px; font-weight: 500; color: #555; line-height: 1.5; margin: 0; }

/* CTA */
.td-cta {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: #fff; border-top: 1.5px solid rgba(17,17,17,0.1);
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  display: flex; align-items: center; gap: 14px;
}
.td-cta-price { font-size: 18px; font-weight: 900; color: #111; }
.td-cta-btn {
  flex: 1; background: #2230a0; color: #e8dfa0;
  border: none; border-radius: 12px; padding: 14px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px; font-weight: 800;
  text-align: center; text-decoration: none;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.td-cta-btn:hover { background: #111; }

/* Responsive */
@media (min-width: 768px) {
  .td-body { max-width: 680px; margin: 0 auto; padding: 24px 24px 40px; }
}
</style>
