<template>
  <Teleport to="body">
    <div v-if="!removed" :class="['lp-splash', { gone }]">
      <img src="/assets/logo.png" alt="CarryIt" class="lp-splash-logo" />
      <div class="lp-splash-tag">
        B O O T I N G &nbsp; C A R R Y I T<span class="lp-splash-cursor">_</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const gone    = ref(false)
const removed = ref(false)

onMounted(() => {
  setTimeout(() => { gone.value = true },    1700)
  setTimeout(() => { removed.value = true }, 2500)
})
</script>

<style>
.lp-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #f1e7d0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  transition: opacity 0.8s ease;
}
.lp-splash.gone {
  opacity: 0;
  pointer-events: none;
}

.lp-splash-logo {
  width: 240px;
  animation: lpBobLogo 1.2s cubic-bezier(.2,.8,.2,1.4) forwards;
}

.lp-splash-tag {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.24em;
  color: #171a3a;
  text-transform: uppercase;
}

.lp-splash-cursor {
  animation: lpBlink 0.8s steps(1) infinite;
  margin-left: 2px;
}

@keyframes lpBobLogo {
  0%   { opacity: 0; transform: translateY(60px) scale(.6)  rotate(-15deg); }
  70%  {             transform: translateY(-4px) scale(1.05) rotate(3deg);  }
  100% { opacity: 1; transform: translateY(0)   scale(1)    rotate(0deg);  }
}

@keyframes lpBlink {
  0%, 49%  { opacity: 1; }
  50%, 100%{ opacity: 0; }
}
</style>
