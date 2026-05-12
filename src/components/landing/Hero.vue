<template>
  <section class="lp-hero" id="about">
    <!-- Floating stickers -->
    <Sticker src="/assets/lego-bunny.webp"   :size="130" top="10%"  left="6%"  :rotation="-8"  :duration="7"   :parallax=".18" :z="6" />
    <Sticker src="/assets/plane-pin.webp"    :size="150" top="58%"  left="2%"  :rotation="18"  :duration="5"   :parallax=".32" :z="4" />
    <Sticker src="/assets/pills.webp"        :size="84"  top="76%"  left="44%" :rotation="-12" :duration="8"   :parallax=".10" :z="3" />
    <Sticker src="/assets/figure-thing.webp" :size="120" top="14%"  right="-3%":rotation="12"  :duration="6.5" :parallax=".22" :z="6" />
    <Sticker src="/assets/item-08.webp"      :size="80"  top="80%"  right="3%" :rotation="-6"  :duration="9"   :parallax=".14" :z="4" />
    <Sticker src="/assets/item-06.webp"      :size="68"  top="6%"   left="46%" :rotation="20"  :duration="7.5" :parallax=".20" :z="3" />

    <!-- Left column -->
    <Reveal variant="from-left" class="lp-hero-left">
      <div class="lp-eyebrow"><span class="lp-star">✦</span> peer-to-peer parcels · since 2026</div>
      <h1 class="lp-h1">
        <span>send your </span><span class="lp-underline">stuff</span><br />
        <span class="lp-ital">with someone</span><br />
        <span>already </span><span class="lp-teal">going</span><span> there.</span>
      </h1>
      <p class="lp-lede">
        no warehouses. no vans. no paying 90 DT to a faceless megabrand.
        just a real person, already on the same flight, bus or train, with room in their luggage.
      </p>
      <div class="lp-ctas">
        <router-link class="lp-btn lp-btn-primary" to="/auth/onboarding"><span>Get Started</span> <span class="lp-arrow">→</span></router-link>
        <a class="lp-btn lp-btn-ghost" href="#how" @click.prevent="scrollTo('how')">How it works</a>
      </div>
      <div class="lp-meta-strip">
        <span class="lp-pulse-dot"></span>
        <span>421 carriers en route right now</span>
        <span class="lp-sep">//</span>
        <span>tunis · paris · london · sfax · marseille</span>
      </div>
    </Reveal>

    <!-- Right column -->
    <Reveal variant="from-right" :delay="2" class="lp-hero-right">
      <ArcMap />
    </Reveal>
  </section>
</template>

<script setup>
import Sticker from './Sticker.vue'
import Reveal  from './Reveal.vue'
import ArcMap  from './ArcMap.vue'

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.lp-hero {
  position: relative;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 48px;
  padding: 60px 64px 80px;
  overflow: hidden;
  min-height: 720px;
}

.lp-hero-left,
.lp-hero-right {
  position: relative;
  z-index: 8;
}

/* Eyebrow pill */
.lp-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--lp-cream);
  border: 2px solid var(--lp-ink);
  border-radius: 30px;
  padding: 6px 14px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.1em;
  color: var(--lp-ink);
  margin-bottom: 20px;
}
.lp-star { color: var(--lp-stamp-red); }

/* H1 */
.lp-h1 {
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  font-size: clamp(54px, 8vw, 124px);
  letter-spacing: -0.02em;
  line-height: 0.92;
  color: var(--lp-ink);
  margin-bottom: 24px;
}

/* "stuff" underline highlight */
.lp-underline {
  position: relative;
  display: inline-block;
}
.lp-underline::before {
  content: '';
  position: absolute;
  left: -4px; right: -4px;
  bottom: 4px; top: 4px;
  background: var(--lp-gold);
  border-radius: 6px;
  transform: rotate(-1deg);
  z-index: -1;
  opacity: .65;
}

/* italic "with someone" */
.lp-ital {
  font-family: 'Montserrat', sans-serif;
  font-style: italic;
  font-weight: 800;
  color: var(--lp-stamp-red);
}

.lp-teal { color: var(--lp-teal); }

/* Lede */
.lp-lede {
  font-family: 'Montserrat', sans-serif;
  font-style: italic;
  font-size: 22px;
  line-height: 1.45;
  color: var(--lp-ink-soft);
  max-width: 520px;
  margin-bottom: 32px;
}

/* CTA buttons */
.lp-ctas {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.lp-btn {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 15px;
  padding: 16px 26px;
  border-radius: 50px;
  border: 2px solid var(--lp-ink);
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 4px 4px 0 var(--lp-ink);
  transition: transform .15s, box-shadow .15s;
}
.lp-btn:hover {
  transform: translate(-2px,-2px);
  box-shadow: 6px 6px 0 var(--lp-ink);
}
.lp-btn-primary {
  background: var(--lp-ink);
  color: #fff;
}
.lp-btn-ghost {
  background: var(--lp-paper);
  color: var(--lp-ink);
}
.lp-arrow { font-size: 18px; }

/* Meta strip */
.lp-meta-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--lp-ink);
}
.lp-pulse-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--lp-pistachio);
  flex-shrink: 0;
  animation: lpPulseDot 2s ease-in-out infinite;
}
.lp-sep { opacity: .4; }

@keyframes lpPulseDot {
  0%,100% { opacity: 1;  transform: scale(1);   }
  50%      { opacity: .5; transform: scale(1.3); }
}

@media (max-width: 880px) {
  .lp-hero {
    grid-template-columns: 1fr;
    padding: 40px 20px;
    gap: 40px;
  }
}
</style>
