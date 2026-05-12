<template>
  <div class="lp-polaroid" :style="{ '--lp-pol-rot': rotation + 'deg' }">
    <div class="lp-pol-tape"></div>
    <div class="lp-pol-head">
      <div class="lp-pol-av" :style="{ background: avatarBg, color: avatarColor }">{{ av }}</div>
      <div>
        <h4 class="lp-pol-name">{{ who }}</h4>
        <div class="lp-pol-ctx">{{ ctx }}</div>
      </div>
    </div>
    <div class="lp-pol-stars">{{ '★'.repeat(stars) }}</div>
    <blockquote class="lp-pol-quote">"{{ q }}"</blockquote>
    <div class="lp-pol-stamp">{{ stamp }}</div>
  </div>
</template>

<script setup>
defineProps({
  who:        String,
  av:         String,
  ctx:        String,
  stars:      Number,
  q:          String,
  stamp:      String,
  rotation:   { type: Number, default: 0 },
  avatarBg:   String,
  avatarColor:String,
})
</script>

<style scoped>
.lp-polaroid {
  background: var(--lp-paper);
  border: 1px solid rgba(23,26,58,.2);
  padding: 18px 18px 32px;
  box-shadow: 6px 8px 0 rgba(23,26,58,.15);
  transform: rotate(var(--lp-pol-rot, 0deg));
  transition: transform .25s var(--lp-ease-out), box-shadow .25s;
  position: relative;
  cursor: default;
}
.lp-polaroid:hover {
  transform: rotate(0deg) translateY(-4px);
  box-shadow: 8px 12px 0 rgba(23,26,58,.18);
}

/* Scotch tape */
.lp-pol-tape {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%) rotate(-3deg);
  width: 80px; height: 22px;
  background: rgba(212,164,24,.55);
  border: 1px dashed rgba(23,26,58,.2);
  border-radius: 2px;
}

.lp-pol-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.lp-pol-av {
  width: 40px; height: 40px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.lp-pol-name {
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: var(--lp-ink);
}
.lp-pol-ctx {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lp-ink-soft);
  margin-top: 2px;
}

.lp-pol-stars {
  font-size: 20px;
  color: var(--lp-gold);
  letter-spacing: 2px;
  -webkit-text-stroke: 1px var(--lp-ink);
  margin-bottom: 10px;
}

.lp-pol-quote {
  font-family: 'Montserrat', sans-serif;
  font-style: italic;
  font-size: 17px;
  line-height: 1.4;
  color: var(--lp-ink);
  border: none;
  padding: 0;
}

.lp-pol-stamp {
  position: absolute;
  bottom: 12px; right: 14px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 9px;
  letter-spacing: 0.14em;
  color: rgba(23,26,58,.4);
  text-transform: uppercase;
}
</style>
