<template>
  <div class="lp">
    <Navbar />
    <Hero />
    <StatsBar />
    <HowItWorks />
    <LiveTrips />
    <Reviews />
    <Contact />
    <LandingFooter />
  </div>
</template>

<script setup>
import Navbar        from '@/components/landing/Navbar.vue'
import Hero          from '@/components/landing/Hero.vue'
import StatsBar      from '@/components/landing/StatsBar.vue'
import HowItWorks    from '@/components/landing/HowItWorks.vue'
import LiveTrips     from '@/components/landing/LiveTrips.vue'
import Reviews       from '@/components/landing/Reviews.vue'
import Contact       from '@/components/landing/Contact.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
</script>

<!-- ── Landing design tokens + body overrides (non-scoped = global for landing) ── -->
<style>
/* Design tokens scoped to the landing root */
.lp {
  --lp-paper:     #f1e7d0;
  --lp-paper-2:   #e8dcbe;
  --lp-cream:     #f7f0dc;
  --lp-ink:       #171a3a;
  --lp-ink-soft:  #2a3160;
  --lp-stamp-red: #cf3a2c;
  --lp-gold:      #d4a418;
  --lp-pistachio: #9bb87a;
  --lp-pink:      #e85a8b;
  --lp-teal:      #2c6e7f;
  --lp-ease-out:  cubic-bezier(.2,.8,.2,1);

  /* Paper texture background */
  background:
    radial-gradient(ellipse at 20% 10%, rgba(212,164,24,.08)  0%, transparent 55%),
    radial-gradient(ellipse at 80% 85%, rgba(207,58,44,.06)   0%, transparent 50%),
    repeating-linear-gradient(0deg,   transparent 0, transparent 3px, rgba(23,26,58,.028) 3px, rgba(23,26,58,.028) 4px),
    repeating-linear-gradient(90deg,  transparent 0, transparent 3px, rgba(23,26,58,.028) 3px, rgba(23,26,58,.028) 4px),
    #f1e7d0;

  /* Custom cursor: tiny navy arrow */
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath d='M2 2l10 4-5 1-1 5z' fill='%23171a3a'/%3E%3C/svg%3E") 2 2, auto;

  color: #171a3a;
  font-family: 'Montserrat', sans-serif;
  overflow-x: hidden;
  min-height: 100vh;
}

/* ── Shared section wrapper ── */
.lp .lp-section {
  padding: 90px 64px;
}
@media (max-width: 880px) {
  .lp .lp-section { padding: 60px 20px; }
}

/* ── Shared typographic tokens used across components ── */
.lp .lp-eyebrow {
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
  margin-bottom: 16px;
}
.lp .lp-star { color: var(--lp-stamp-red); }

.lp .lp-section-title {
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  font-size: clamp(32px, 5vw, 56px);
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: var(--lp-ink);
  margin-bottom: 12px;
}
.lp .lp-section-sub {
  font-family: 'Montserrat', sans-serif;
  font-style: italic;
  font-size: 17px;
  color: var(--lp-ink-soft);
  max-width: 640px;
  line-height: 1.5;
  margin-bottom: 4px;
}
.lp .lp-ital {
  font-family: 'Montserrat', sans-serif;
  font-style: italic;
  font-weight: 800;
  color: var(--lp-stamp-red);
}

/* ── Scroll-reveal system ── */
.lp .reveal {
  opacity: 0;
  transform: translateY(40px) scale(.98);
  transition: opacity .9s var(--lp-ease-out), transform .9s var(--lp-ease-out);
}
.lp .reveal.from-left  { transform: translateX(-60px) scale(.98); }
.lp .reveal.from-right { transform: translateX(60px)  scale(.98); }
.lp .reveal.rotate     { transform: translateY(40px) rotate(-3deg) scale(.95); }

.lp .reveal.in {
  opacity: 1;
  transform: none;
}
.lp .reveal.delay-1 { transition-delay:  80ms; }
.lp .reveal.delay-2 { transition-delay: 160ms; }
.lp .reveal.delay-3 { transition-delay: 240ms; }
.lp .reveal.delay-4 { transition-delay: 320ms; }
.lp .reveal.delay-5 { transition-delay: 400ms; }

@media (prefers-reduced-motion: reduce) {
  .lp .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
}

/* ── Floating sticker keyframe ── */
@keyframes floaty {
  0%,100% { transform: translateY(0px)   rotate(0deg); }
  33%      { transform: translateY(-14px) rotate(2deg); }
  66%      { transform: translateY(-7px)  rotate(-1deg); }
}
</style>
