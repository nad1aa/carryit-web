<template>
  <div class="lp-stamp">
    <div class="lp-stamp-inner">
      <!-- Art panel -->
      <div :class="['lp-stamp-art', `lp-stamp-var-${variant}`]">
        <div class="lp-stamp-denom">{{ denom }}</div>
        <div class="lp-stamp-sun"></div>
        <div class="lp-stamp-horizon"></div>
        <div class="lp-stamp-vehicle">{{ vehicle }}</div>
      </div>

      <!-- Route -->
      <div class="lp-stamp-route">
        <span>{{ route[0] }}</span>
        <span class="lp-stamp-arrow">→</span>
        <span>{{ route[1] }}</span>
      </div>

      <!-- Meta grid -->
      <div class="lp-stamp-meta">
        <span>{{ date }}</span>
        <span class="ta-r">{{ mode }}</span>
        <span>{{ kg }} kg avail</span>
        <span class="ta-r">est. 1–2d</span>
      </div>

      <!-- Traveler row -->
      <div class="lp-stamp-row">
        <div class="lp-stamp-traveler">
          <div class="lp-stamp-av">{{ initials }}</div>
          <div class="lp-stamp-info">
            <span class="lp-stamp-name">{{ traveler }}</span>
            <span class="lp-stamp-score">trust {{ score }} · ★★★★★</span>
          </div>
        </div>
        <div :class="['lp-stamp-price', `lp-price-${fairness || 'premium'}`]">{{ price }} DT/kg</div>
      </div>
    </div>

    <!-- Cancel stamp overlay -->
    <div class="lp-stamp-cancel">{{ cancelText }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  denom:      String,
  route:      Array,
  traveler:   String,
  score:      String,
  date:       String,
  mode:       String,
  kg:         String,
  price:      String,
  fairness:   String,
  variant:    String,
  vehicle:    String,
  cancelText: String,
})

const initials = computed(() =>
  props.traveler.split(' ').map(n => n[0]).join('').slice(0,2)
)
</script>

<style scoped>
/* Perforated stamp wrapper */
.lp-stamp {
  position: relative;
  padding: 10px;
  background: var(--lp-cream);           /* stamp material = cream */
  filter: drop-shadow(0 5px 12px rgba(23,26,58,.16));
}

/* ::before overlays paper-2 circles on the cream border area = "hole" effect */
.lp-stamp::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle 6px at 7px 7px,
    var(--lp-paper-2) 99%,
    transparent 100%
  );
  background-size: 14px 14px;
  background-repeat: repeat;
  pointer-events: none;
  z-index: 0;
}

/* Inner content sits above the circles so interior looks clean */
.lp-stamp-inner {
  position: relative;
  z-index: 1;
  background: var(--lp-cream);
  border: 1.5px dashed var(--lp-ink);
  overflow: hidden;
}

/* Art panel */
.lp-stamp-art {
  aspect-ratio: 4/3;
  position: relative;
  border-bottom: 2px solid var(--lp-ink);
  overflow: hidden;
}
.lp-stamp-var-1 { background: #c9a24a; }
.lp-stamp-var-2 { background: #3a5080; }
.lp-stamp-var-3 { background: #7c3a2c; }

.lp-stamp-denom {
  position: absolute;
  top: 10px; left: 10px;
  background: var(--lp-paper);
  border: 1.5px solid var(--lp-ink);
  border-radius: 18px;
  padding: 2px 8px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  font-size: 18px;
  color: var(--lp-ink);
  z-index: 2;
}

.lp-stamp-sun {
  position: absolute;
  top: 10px; right: 14px;
  width: 36px; height: 36px;
  border-radius: 50%;
  background: rgba(241,231,208,.8);
}

.lp-stamp-horizon {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 34%;
  background: #171a3a;
  clip-path: polygon(0 60%, 8% 30%, 16% 55%, 25% 20%, 34% 50%, 44% 15%, 53% 45%, 62% 25%, 72% 50%, 80% 30%, 90% 48%, 100% 20%, 100% 100%, 0 100%);
}

.lp-stamp-vehicle {
  position: absolute;
  bottom: 36%; left: 18px;
  font-size: 48px;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,.4));
}

/* Route */
.lp-stamp-route {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px 6px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 22px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--lp-ink);
}
.lp-stamp-arrow { color: var(--lp-stamp-red); }

/* Meta */
.lp-stamp-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 8px;
  padding: 8px 12px;
  border-top: 1.5px dashed rgba(23,26,58,.3);
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lp-ink-soft);
}
.ta-r { text-align: right; }

/* Traveler row */
.lp-stamp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 12px;
  border-top: 1.5px dashed rgba(23,26,58,.3);
  gap: 8px;
}

.lp-stamp-traveler {
  display: flex;
  align-items: center;
  gap: 8px;
}
.lp-stamp-av {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--lp-ink);
  color: var(--lp-paper);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}
.lp-stamp-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lp-stamp-name {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 13px;
  color: var(--lp-ink);
}
.lp-stamp-score {
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--lp-ink-soft);
}

/* Price tag */
.lp-stamp-price {
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 15px;
  transform: rotate(2deg);
  padding: 4px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}
.lp-price-below   { color: var(--lp-pistachio); }
.lp-price-fair    { color: var(--lp-gold); }
.lp-price-premium { color: var(--lp-stamp-red); }

/* Cancellation stamp */
.lp-stamp-cancel {
  position: absolute;
  top: 20px; right: 14px;
  z-index: 2;
  transform: rotate(-18deg);
  border: 2px solid rgba(207,58,44,.55);
  background: rgba(241,231,208,.9);
  color: rgba(207,58,44,.75);
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.2em;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>
