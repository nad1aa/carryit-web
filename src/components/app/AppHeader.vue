<template>
  <header class="app-header">
    <button v-if="back" class="app-header-back" @click="handleBack" aria-label="Go back">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <span class="app-header-title">{{ title }}</span>
    <div class="app-header-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title:  { type: String, default: '' },
  back:   { type: [Boolean, String], default: false },
})

const router = useRouter()
function handleBack() {
  if (typeof props.back === 'string') router.push(props.back)
  else router.back()
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #111;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  height: 58px;
  border-bottom: 2px solid rgba(255,255,255,0.06);
  font-family: 'Montserrat', sans-serif;
}
.app-header-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px; height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: none;
  cursor: pointer;
  color: #fff;
  flex-shrink: 0;
  transition: background 0.15s;
}
.app-header-back:hover { background: rgba(255,255,255,0.16); }
.app-header-title {
  flex: 1;
  font-weight: 800;
  font-size: 17px;
  letter-spacing: -0.01em;
}
.app-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
}
</style>
