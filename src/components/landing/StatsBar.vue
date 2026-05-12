<template>
  <section class="lp-stats">
    <div
      v-for="(s, i) in stats"
      :key="i"
      :class="['lp-stat', `reveal`, `delay-${i+1}`]"
    >
      <div class="lp-stat-num">
        <span v-if="s.small" class="lp-stat-small">{{ s.small }}</span>{{ s.num }}
      </div>
      <div class="lp-stat-label">{{ s.label }}</div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'

const stats = [
  { num: '12,847', label: 'trips completed' },
  { num: '1.4M',   label: 'saved vs DHL', small: 'DT' },
  { num: '63',     label: 'cities connected' },
  { num: '4.91',   label: 'average rating' },
]

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') }),
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )
  document.querySelectorAll('.lp-stats .reveal').forEach(el => observer.observe(el))
})
</script>

<style scoped>
.lp-stats {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: var(--lp-cream);
  border-top: 3px solid var(--lp-ink);
  border-bottom: 3px solid var(--lp-ink);
}

/* perforation strips */
.lp-stats::before,
.lp-stats::after {
  content: '';
  position: absolute;
  left: 0; right: 0;
  height: 8px;
  background: repeating-linear-gradient(
    90deg,
    var(--lp-paper) 0,
    var(--lp-paper) 8px,
    transparent 8px,
    transparent 14px
  );
  pointer-events: none;
  z-index: 1;
}
.lp-stats::before { top: -5px; }
.lp-stats::after  { bottom: -5px; }

.lp-stat {
  padding: 40px 24px;
  border-right: 2px dashed rgba(23,26,58,.25);
  text-align: center;
}
.lp-stat:last-child { border-right: none; }

.lp-stat-num {
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  font-size: 56px;
  line-height: 1;
  color: var(--lp-ink);
}
.lp-stat-small {
  font-size: 24px;
  color: var(--lp-stamp-red);
  vertical-align: baseline;
  margin-right: 2px;
}
.lp-stat-label {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--lp-ink-soft);
  margin-top: 8px;
}

@media (max-width: 880px) {
  .lp-stats { grid-template-columns: repeat(2, 1fr); }
  .lp-stat:nth-child(2) { border-right: none; }
  .lp-stat:nth-child(1),
  .lp-stat:nth-child(2) { border-bottom: 2px dashed rgba(23,26,58,.25); }
}
</style>
