<template>
  <section class="lp-section lp-live-trips" id="trips">
    <Sticker src="/assets/stamp-bus.png" :size="170" top="-2%"  right="6%"  :rotation="-12" :duration="6.5" :parallax=".12" :z="3" />
    <Sticker src="/assets/item-09.webp"  :size="85"  top="78%"  left="48%"  :rotation="22"  :duration="8"   :parallax=".18" :z="3" />

    <Reveal class="lp-eyebrow"><span class="lp-star">✦</span> live carriers · this week</Reveal>
    <Reveal :delay="1" class="lp-section-title">three real <span class="lp-ital">people</span>, going your way.</Reveal>
    <Reveal :delay="2" class="lp-section-sub">these are not stock photos. these are travelers with bookings already in their pocket and 4–12 spare kilos in the bag.</Reveal>

    <div class="lp-trips-grid">
      <Reveal
        v-for="(t, i) in trips"
        :key="i"
        variant="rotate"
        :delay="i+1"
      >
        <StampCard v-bind="t" />
      </Reveal>
    </div>

    <router-link class="lp-view-all" to="/auth/signup">view all 421 live trips →</router-link>
  </section>
</template>

<script setup>
import Sticker   from './Sticker.vue'
import Reveal    from './Reveal.vue'
import StampCard from './StampCard.vue'

const trips = [
  { denom:'25¢', route:['TUNIS','PARIS'],     traveler:'Amira K.',   score:'9.2', date:'May 12 · 2026', mode:'✈ flight', kg:'8.5', price:'25', fairness:'below',   variant:'1', vehicle:'✈', cancelText:'· VERIFIED ·' },
  { denom:'30¢', route:['SFAX','MARSEILLE'],  traveler:'Karim B.',   score:'8.7', date:'May 14 · 2026', mode:'⛴ ferry', kg:'12',  price:'30', fairness:'fair',    variant:'2', vehicle:'⛴', cancelText:'· FAIR ·'     },
  { denom:'45¢', route:['TUNIS','LONDON'],    traveler:'Yasmine T.', score:'9.6', date:'May 16 · 2026', mode:'✈ flight', kg:'6',   price:'45', fairness:'premium', variant:'3', vehicle:'✈', cancelText:'· PREMIUM ·'  },
]
</script>

<style scoped>
.lp-live-trips {
  background: var(--lp-paper-2);
  border-top: 2px dashed rgba(23,26,58,.25);
  border-bottom: 2px dashed rgba(23,26,58,.25);
  position: relative;
}

.lp-trips-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  margin-top: 40px;
}

.lp-view-all {
  display: inline-block;
  margin-top: 32px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: var(--lp-ink);
  text-decoration: none;
  border-bottom: 2px solid var(--lp-ink);
  padding-bottom: 2px;
  transition: color .15s, border-color .15s;
}
.lp-view-all:hover {
  color: var(--lp-stamp-red);
  border-color: var(--lp-stamp-red);
}

@media (max-width: 880px) { .lp-trips-grid { grid-template-columns: 1fr; } }
</style>
