<template>
  <div class="nc">
    <!-- Header -->
    <header class="nc-header">
      <button class="nc-back" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="nc-header-center">
        <span class="nc-header-title">Notifications</span>
        <span v-if="unreadCount > 0" class="nc-unread-badge">{{ unreadCount }}</span>
      </div>
      <button
        class="nc-mark-all"
        :disabled="unreadCount === 0"
        @click="markAllRead"
      >Mark all read</button>
    </header>

    <!-- Filter tabs -->
    <div class="nc-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="nc-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span v-if="tab.badge" class="nc-tab-badge">{{ tab.badge }}</span>
      </button>
    </div>

    <!-- List -->
    <main class="nc-body">
      <!-- Empty state -->
      <div v-if="filteredGrouped.length === 0" class="nc-empty">
        <div class="nc-empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(17,17,17,0.2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
        </div>
        <p class="nc-empty-title">{{ activeTab === 'unread' ? 'All caught up!' : 'No notifications' }}</p>
        <p class="nc-empty-sub">{{ activeTab === 'unread' ? 'You have no unread notifications.' : 'Nothing here yet.' }}</p>
      </div>

      <template v-else>
        <div v-for="group in filteredGrouped" :key="group.label">
          <div class="nc-group-label">{{ group.label }}</div>
          <div
            v-for="n in group.items"
            :key="n.id"
            class="nc-item"
            :class="{ unread: !n.read }"
            @click="handleClick(n)"
          >
            <!-- Type dot -->
            <div class="nc-dot-wrap">
              <div class="nc-type-icon" :style="{ background: typeColor(n.type) }">
                <component :is="typeIcon(n.type)" />
              </div>
            </div>

            <!-- Content -->
            <div class="nc-content">
              <div class="nc-item-title">{{ n.title }}</div>
              <div class="nc-item-msg">{{ n.message }}</div>
              <div class="nc-item-time">{{ n.timeFormatted }}</div>
            </div>

            <!-- Unread indicator -->
            <div v-if="!n.read" class="nc-unread-dot" :style="{ background: typeColor(n.type) }"/>
            <!-- Read chevron -->
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(17,17,17,0.2)" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, reactive, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ── Inline icons (SVG via render functions) ───────────────────────────────
const BookingIcon = defineComponent({ render: () => h('svg', { width:16, height:16, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round' }, [
  h('path', { d:'M21 10V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10' }),
  h('path', { d:'M1 5h22v5H1z' }),
  h('line', { x1:'10', y1:'15', x2:'14', y2:'15' }),
]) })

const MessageIcon = defineComponent({ render: () => h('svg', { width:16, height:16, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round' }, [
  h('path', { d:'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' }),
]) })

const TripIcon = defineComponent({ render: () => h('svg', { width:16, height:16, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round' }, [
  h('path', { d:'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' }),
]) })

const PaymentIcon = defineComponent({ render: () => h('svg', { width:16, height:16, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round' }, [
  h('rect', { x:'1', y:'4', width:'22', height:'16', rx:'2', ry:'2' }),
  h('line', { x1:'1', y1:'10', x2:'23', y2:'10' }),
]) })

const SystemIcon = defineComponent({ render: () => h('svg', { width:16, height:16, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', 'stroke-width':'2', 'stroke-linecap':'round', 'stroke-linejoin':'round' }, [
  h('circle', { cx:'12', cy:'12', r:'10' }),
  h('line', { x1:'12', y1:'8', x2:'12', y2:'12' }),
  h('line', { x1:'12', y1:'16', x2:'12.01', y2:'16' }),
]) })

// ── Color-coded type config ───────────────────────────────────────────────
const TYPE_CONFIG = {
  booking: { color: '#2230a0', icon: BookingIcon, route: '/sender/bookings' },
  message: { color: '#8485d0', icon: MessageIcon, route: '/chat' },
  trip:    { color: '#111',    icon: TripIcon,    route: '/traveler/trips'  },
  payment: { color: '#e8dfa0', icon: PaymentIcon, route: '/traveler/earnings'},
  system:  { color: 'rgba(17,17,17,0.28)', icon: SystemIcon, route: null   },
}

function typeColor(type) { return TYPE_CONFIG[type]?.color || 'rgba(17,17,17,0.28)' }
function typeIcon(type)  { return TYPE_CONFIG[type]?.icon  || SystemIcon }

// ── Mock data ─────────────────────────────────────────────────────────────
const now = Date.now()
const rawNotifications = [
  { id:'1',  type:'booking', category:'bookings', title:'Booking confirmed',       message:'Yasmine B. accepted your request for TUN-CDG on Jun 14.',              time: now - 18 * 60000 },
  { id:'2',  type:'message', category:'bookings', title:'New message from Yasmine', message:'See you at arrivals around 08:00 - see you there!',                    time: now - 45 * 60000 },
  { id:'3',  type:'payment', category:'payments', title:'Payment received',         message:'38.50 DT has been released to your earnings wallet.',                  time: now - 2 * 3600000 },
  { id:'4',  type:'trip',    category:'trips',    title:'Trip reminder',            message:'Your trip to Paris departs tomorrow at 08:30. Do not forget the QR!', time: now - 5 * 3600000 },
  { id:'5',  type:'booking', category:'bookings', title:'Package collected',        message:'Omar L. scanned your QR code and collected the item at pickup.',        time: now - 26 * 3600000 },
  { id:'6',  type:'system',  category:'system',   title:'Identity verified',        message:'Your KYC documents have been approved. You can now receive bookings.', time: now - 50 * 3600000 },
  { id:'7',  type:'system',  category:'system',   title:'Welcome to CarryIt!',     message:'Start by searching for travelers on your route.',                       time: now - 72 * 3600000 },
]

const notifications = reactive(rawNotifications.map(n => ({ ...n, read: false })))

// ── Tabs ──────────────────────────────────────────────────────────────────
const activeTab  = ref('all')
const unreadCount = computed(() => notifications.filter(n => !n.read).length)

const tabs = computed(() => [
  { id: 'all',      label: 'All',      badge: 0 },
  { id: 'unread',   label: 'Unread',   badge: unreadCount.value },
  { id: 'bookings', label: 'Bookings', badge: notifications.filter(n => !n.read && n.category === 'bookings').length },
  { id: 'trips',    label: 'Trips',    badge: notifications.filter(n => !n.read && n.category === 'trips').length },
  { id: 'system',   label: 'System',   badge: 0 },
].map(t => ({ ...t, badge: t.badge || 0 })))

const filtered = computed(() => {
  if (activeTab.value === 'all')    return notifications
  if (activeTab.value === 'unread') return notifications.filter(n => !n.read)
  return notifications.filter(n => n.category === activeTab.value)
})

const filteredGrouped = computed(() => {
  const todayStart = new Date(); todayStart.setHours(0,0,0,0)
  const yestStart  = new Date(todayStart); yestStart.setDate(yestStart.getDate()-1)

  const groups = [
    { label: 'Today',     items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Earlier',   items: [] },
  ]

  filtered.value.forEach(n => {
    const t = new Date(n.time)
    const entry = { ...n, timeFormatted: formatTime(n.time) }
    if (t >= todayStart)  groups[0].items.push(entry)
    else if (t >= yestStart) groups[1].items.push(entry)
    else groups[2].items.push(entry)
  })

  return groups.filter(g => g.items.length > 0)
})

function formatTime(ts) {
  const diff = Date.now() - ts
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString('en-GB', { day:'numeric', month:'short' })
}

// ── Actions ───────────────────────────────────────────────────────────────
function handleClick(notif) {
  const n = notifications.find(x => x.id === notif.id)
  if (n) n.read = true
  const route = TYPE_CONFIG[notif.type]?.route
  if (route) router.push(route)
}

function markAllRead() {
  notifications.forEach(n => { n.read = true })
}
</script>

<style scoped>
.nc { min-height: 100vh; background: #f0f0ee; font-family: 'Montserrat', sans-serif; }

/* Header */
.nc-header { position: sticky; top: 0; z-index: 50; background: #111; color: #fff; display: flex; align-items: center; gap: 12px; padding: 0 16px; height: 58px; }
.nc-back { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); border: none; border-radius: 50%; color: #fff; cursor: pointer; }
.nc-back:hover { background: rgba(255,255,255,0.16); }
.nc-header-center { flex: 1; display: flex; align-items: center; gap: 8px; }
.nc-header-title { font-weight: 800; font-size: 16px; }
.nc-unread-badge { background: #2230a0; color: #e8dfa0; font-size: 10px; font-weight: 900; padding: 2px 7px; border-radius: 99px; }
.nc-mark-all { background: none; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 5px 10px; font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.65); cursor: pointer; white-space: nowrap; transition: all 0.15s; }
.nc-mark-all:hover:not(:disabled) { border-color: #e8dfa0; color: #e8dfa0; }
.nc-mark-all:disabled { opacity: 0.35; cursor: default; }

/* Tabs */
.nc-tabs { display: flex; gap: 0; background: #fff; border-bottom: 1.5px solid rgba(17,17,17,0.1); padding: 0 16px; overflow-x: auto; scrollbar-width: none; }
.nc-tabs::-webkit-scrollbar { display: none; }
.nc-tab { display: flex; align-items: center; gap: 5px; padding: 13px 12px 12px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: rgba(17,17,17,0.4); background: none; border: none; border-bottom: 2.5px solid transparent; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
.nc-tab.active { color: #2230a0; border-bottom-color: #2230a0; }
.nc-tab-badge { background: #2230a0; color: #e8dfa0; font-size: 9px; font-weight: 900; padding: 1px 5px; border-radius: 99px; min-width: 16px; text-align: center; }

/* Body */
.nc-body { padding-bottom: 32px; }

/* Group label */
.nc-group-label { padding: 16px 16px 6px; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(17,17,17,0.38); }

/* Item */
.nc-item { display: flex; align-items: flex-start; gap: 12px; padding: 13px 16px; background: #fff; border-bottom: 1px solid rgba(17,17,17,0.06); cursor: pointer; transition: background 0.12s; position: relative; }
.nc-item:hover { background: #f8f8f6; }
.nc-item.unread { background: #fcfcff; }

/* Type icon with color-coded background */
.nc-dot-wrap { flex-shrink: 0; }
.nc-type-icon {
  width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: #fff; opacity: 0.9;
}

/* Content */
.nc-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.nc-item-title { font-size: 13px; font-weight: 800; color: #111; }
.nc-item-msg { font-size: 12px; font-weight: 500; color: #555; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.nc-item-time { font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.35); }

/* Unread dot (color-coded) */
.nc-unread-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }

/* Empty state */
.nc-empty { display: flex; flex-direction: column; align-items: center; padding: 80px 24px; text-align: center; gap: 10px; }
.nc-empty-icon { width: 72px; height: 72px; border-radius: 50%; background: rgba(17,17,17,0.06); display: flex; align-items: center; justify-content: center; }
.nc-empty-title { font-size: 16px; font-weight: 800; color: #111; margin: 0; }
.nc-empty-sub { font-size: 13px; font-weight: 500; color: rgba(17,17,17,0.45); margin: 0; }

@media (min-width: 768px) { .nc-body { max-width: 640px; margin: 0 auto; } .nc-tabs { max-width: 640px; margin: 0 auto; } }
</style>
