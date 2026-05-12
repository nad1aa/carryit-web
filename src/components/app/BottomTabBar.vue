<template>
  <nav class="btb" role="navigation" aria-label="Main navigation">
    <router-link
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="btb-tab"
      :class="{ active: isActive(tab) }"
    >
      <component :is="tab.icon" class="btb-icon" />
      <span>{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { defineComponent, h } from 'vue'

const route = useRoute()

// SVG icon components
const IconSearch = defineComponent({ render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('circle', { cx: '11', cy: '11', r: '7' }),
  h('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' }),
]) })

const IconPackage = defineComponent({ render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M21 10V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10' }),
  h('path', { d: 'M1 5h22v5H1z' }),
  h('line', { x1: '10', y1: '15', x2: '14', y2: '15' }),
]) })

const IconPlane = defineComponent({ render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' }),
]) })

const IconTrucks = defineComponent({ render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('rect', { x: '1', y: '3', width: '15', height: '13' }),
  h('path', { d: 'M16 8h4l3 4v4h-7V8z' }),
  h('circle', { cx: '5.5', cy: '18.5', r: '2.5' }),
  h('circle', { cx: '18.5', cy: '18.5', r: '2.5' }),
]) })

const IconUser = defineComponent({ render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2' }),
  h('circle', { cx: '12', cy: '7', r: '4' }),
]) })

const props = defineProps({
  role: { type: String, default: 'sender' }, // sender | traveler
})

const senderTabs = [
  { to: '/sender/search',   label: 'Search',    icon: IconSearch  },
  { to: '/sender/bookings', label: 'Bookings',  icon: IconPackage },
  { to: '/chat',            label: 'Chat',      icon: IconPlane   },
  { to: '/profile',         label: 'Profile',   icon: IconUser    },
]
const travelerTabs = [
  { to: '/traveler/trips',    label: 'My Trips',  icon: IconPlane   },
  { to: '/traveler/requests', label: 'Requests',  icon: IconPackage },
  { to: '/traveler/earnings', label: 'Earnings',  icon: IconTrucks  },
  { to: '/chat',              label: 'Chat',      icon: IconSearch  },
  { to: '/profile',           label: 'Profile',   icon: IconUser    },
]

const tabs = props.role === 'traveler' ? travelerTabs : senderTabs

function isActive(tab) {
  return route.path.startsWith(tab.to.split('?')[0])
}
</script>

<style scoped>
.btb {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 200;
  background: #111;
  display: flex;
  align-items: stretch;
  height: 64px;
  border-top: 2px solid rgba(255,255,255,0.06);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.btb-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: rgba(255,255,255,0.38);
  font-family: 'Montserrat', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  transition: color 0.15s;
  padding: 0 4px;
}
.btb-tab.active, .btb-tab:hover { color: #fff; }
.btb-icon { width: 22px; height: 22px; flex-shrink: 0; }

/* Only show on mobile */
@media (min-width: 768px) {
  .btb { display: none; }
}
</style>
