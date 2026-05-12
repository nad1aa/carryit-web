<template>
  <section class="lp-section lp-how" id="how">
    <Sticker src="/assets/item-07.webp" :size="110" top="6%"  right="4%" :rotation="-14" :duration="7" :parallax=".12" :z="3" />
    <Sticker src="/assets/item-10.webp" :size="90"  top="68%" left="-2%" :rotation="16"  :duration="9" :parallax=".18" :z="3" />

    <Reveal class="lp-eyebrow"><span class="lp-star">✦</span> how this works</Reveal>
    <Reveal :delay="1" class="lp-section-title">five steps. <span class="lp-ital">no surprises.</span></Reveal>
    <Reveal :delay="2" class="lp-section-sub">every box that crosses a border on CarryIt goes through the same trust chain. nothing skipped, nothing optional.</Reveal>

    <div class="lp-steps">
      <Reveal
        v-for="(s, i) in steps"
        :key="i"
        :delay="i+1"
        class="lp-step"
      >
        <div class="lp-step-badge" :style="{ color: badgeColors[i] }">{{ i+1 }}</div>
        <div class="lp-step-icon">{{ s.ic }}</div>
        <h3>{{ s.t }}</h3>
        <p>{{ s.d }}</p>
        <div class="lp-step-trail"></div>
      </Reveal>
    </div>
  </section>
</template>

<script setup>
import Sticker from './Sticker.vue'
import Reveal  from './Reveal.vue'

const steps = [
  { ic: '✎', t: 'post or search',  d: 'travelers post the trip. senders search the route.' },
  { ic: '⚐', t: 'match',           d: 'swipe or browse. accept within 24h or it expires.' },
  { ic: '⚏', t: 'pay into escrow', d: 'money holds. nobody loses till everybody is happy.' },
  { ic: '⚒', t: 'qr handoff',      d: 'meet, scan, photo, gps logged. digital chain of custody.' },
  { ic: '★', t: 'otp delivery',    d: 'receiver enters 6-digit code. payment releases. review prompts.' },
]
const badgeColors = ['var(--lp-stamp-red)', 'var(--lp-gold)', 'var(--lp-pistachio)', 'var(--lp-pink)', 'var(--lp-teal)']
</script>

<style scoped>
.lp-how {
  position: relative;
}

.lp-steps {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;
  margin-top: 40px;
}

.lp-step {
  position: relative;
  background: var(--lp-cream);
  border: 2.5px solid var(--lp-ink);
  border-radius: 18px;
  padding: 22px 22px 22px;
  box-shadow: 5px 5px 0 var(--lp-ink);
  transition: transform .15s, box-shadow .15s;
}
.lp-step:hover {
  transform: translate(-3px,-3px);
  box-shadow: 8px 8px 0 var(--lp-ink);
}

.lp-step-badge {
  position: absolute;
  top: -22px; left: 18px;
  width: 44px; height: 44px;
  border-radius: 50%;
  background: var(--lp-cream);
  border: 2.5px solid var(--lp-ink);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  font-size: 18px;
}

.lp-step-icon {
  font-size: 36px;
  margin-top: 10px;
  margin-bottom: 10px;
  color: var(--lp-ink);
}

.lp-step h3 {
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: var(--lp-ink);
  margin-bottom: 8px;
  text-transform: capitalize;
}

.lp-step p {
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: var(--lp-ink-soft);
  line-height: 1.5;
}

/* connecting trail to next card */
.lp-step-trail {
  position: absolute;
  right: -14px; top: 50%;
  width: 10px; height: 2px;
  border-top: 2px dashed rgba(23,26,58,.3);
}
.lp-step:last-child .lp-step-trail { display: none; }

@media (max-width: 1100px) { .lp-steps { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 880px)  { .lp-steps { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px)  { .lp-steps { grid-template-columns: 1fr; } }
</style>
