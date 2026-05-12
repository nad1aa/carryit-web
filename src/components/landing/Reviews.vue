<template>
  <section class="lp-section lp-reviews" id="reviews">
    <Sticker src="/assets/pills.webp" :size="100" top="6%" right="5%" :rotation="-18" :duration="8" :parallax=".18" :z="3" />

    <Reveal class="lp-eyebrow"><span class="lp-star">✦</span> what carriers + senders say</Reveal>
    <Reveal :delay="1" class="lp-section-title">people <span class="lp-ital">trust</span> people.</Reveal>
    <Reveal :delay="2" class="lp-section-sub">three honest words from the diaspora corridor — collected after delivery, never edited.</Reveal>

    <div class="lp-reviews-grid">
      <Reveal
        v-for="(r, i) in reviews"
        :key="i"
        :delay="i+1"
        class="lp-polaroid-wrap"
      >
        <Polaroid
          :who="r.who"
          :av="r.av"
          :ctx="r.ctx"
          :stars="r.stars"
          :q="r.q"
          :stamp="r.stamp"
          :rotation="rotations[i]"
          :avatarBg="avatarBgs[i]"
          :avatarColor="avatarColors[i]"
        />
      </Reveal>
    </div>
  </section>
</template>

<script setup>
import Sticker  from './Sticker.vue'
import Reveal   from './Reveal.vue'
import Polaroid from './Polaroid.vue'

const reviews = [
  { who:'Lina Ben Salah',    av:'LB', ctx:'Tunis → Paris · sender',       stars:5, q:"shipped my mum's medicine in 18 hours. cost 32DT instead of 110DT at DHL. carrier sent a photo of the pharmacy delivery.", stamp:'POSTED 04 MAY 26' },
  { who:'Mohamed Trabelsi',  av:'MT', ctx:'Marseille → Sfax · traveler',   stars:5, q:"I fly home twice a month anyway. now my plane ticket pays for itself before I even land.",                                  stamp:'POSTED 22 APR 26' },
  { who:'Sara Diop',         av:'SD', ctx:'Dakar → Tunis · sender',        stars:5, q:"the OTP thing genuinely felt safer than fedex. my brother received the package, typed the code, payment released, done.",   stamp:'POSTED 17 APR 26' },
]

const rotations    = [-1.5, 0.8, -0.6]
const avatarBgs    = ['var(--lp-teal)', 'var(--lp-stamp-red)', 'var(--lp-gold)']
const avatarColors = ['var(--lp-paper)', 'var(--lp-paper)', 'var(--lp-ink)']
</script>

<style scoped>
.lp-reviews {
  position: relative;
}
.lp-reviews-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-top: 48px;
  padding-top: 16px;
}
.lp-polaroid-wrap {
  padding-top: 16px;
}

@media (max-width: 880px) {
  .lp-reviews-grid { grid-template-columns: 1fr; max-width: 480px; margin-inline: auto; }
}
</style>
