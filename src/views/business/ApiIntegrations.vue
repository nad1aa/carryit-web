<template>
  <div class="ai-page">
    <!-- Header -->
    <header class="ai-header">
      <button class="ai-back" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="ai-header-title">API &amp; integrations</span>
      <a href="#docs" class="ai-docs-btn">Docs</a>
    </header>

    <main class="ai-main">

      <!-- API keys section -->
      <div class="ai-section-title">API keys</div>
      <div class="ai-card">
        <div v-for="key in apiKeys" :key="key.id" class="ai-key-row">
          <div class="ai-key-info">
            <div class="ai-key-name">{{ key.name }}</div>
            <div class="ai-key-meta">
              <span class="ai-key-env" :class="`ai-env--${key.env}`">{{ key.env }}</span>
              <span class="ai-key-created">Created {{ key.created }}</span>
            </div>
          </div>
          <div class="ai-key-value-wrap">
            <code class="ai-key-value">{{ key.visible ? key.value : maskKey(key.value) }}</code>
            <button class="ai-icon-btn" @click="key.visible = !key.visible" :title="key.visible ? 'Hide' : 'Show'">
              <svg v-if="!key.visible" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
            <button class="ai-icon-btn" @click="copyKey(key)" :title="'Copy'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            </button>
          </div>
          <div v-if="key.copyMsg" class="ai-copy-msg">Copied!</div>
        </div>

        <button class="ai-new-key-btn" @click="generateKey">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Generate new key
        </button>
      </div>

      <!-- Webhooks -->
      <div class="ai-section-title">Webhooks</div>
      <div class="ai-card">
        <div class="ai-card-desc">Receive real-time POST notifications when shipment status changes.</div>

        <div v-for="(wh, idx) in webhooks" :key="wh.id" class="ai-webhook-row">
          <div class="ai-webhook-status" :class="wh.active ? 'ai-wh--active' : 'ai-wh--inactive'" />
          <div class="ai-webhook-info">
            <div class="ai-webhook-url">{{ wh.url }}</div>
            <div class="ai-webhook-events">
              <span v-for="ev in wh.events" :key="ev" class="ai-wh-event">{{ ev }}</span>
            </div>
          </div>
          <label class="ai-toggle-wrap">
            <input type="checkbox" v-model="wh.active" class="ai-toggle-input" />
            <span class="ai-toggle" />
          </label>
          <button class="ai-icon-btn" @click="removeWebhook(idx)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Add webhook form -->
        <div v-if="showWebhookForm" class="ai-wh-form">
          <input v-model="newWebhook.url" class="ai-input" placeholder="https://your-server.com/webhook" />
          <div class="ai-wh-events-pick">
            <label v-for="ev in allEvents" :key="ev" class="ai-ev-label">
              <input type="checkbox" :value="ev" v-model="newWebhook.events" />
              <span>{{ ev }}</span>
            </label>
          </div>
          <div class="ai-wh-form-actions">
            <button class="ai-btn-ghost" @click="showWebhookForm = false">Cancel</button>
            <button class="ai-btn-primary" @click="addWebhook">Add webhook</button>
          </div>
        </div>

        <button class="ai-new-key-btn" @click="showWebhookForm = true" v-else>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add webhook endpoint
        </button>
      </div>

      <!-- Platform integrations -->
      <div class="ai-section-title">Platform integrations</div>
      <div class="ai-integrations-grid">
        <div v-for="p in platforms" :key="p.id" class="ai-platform-card" :class="{ 'ai-platform--connected': p.connected }">
          <div class="ai-platform-logo" :style="{ background: p.color }">
            <span class="ai-platform-letter">{{ p.name[0] }}</span>
          </div>
          <div class="ai-platform-info">
            <div class="ai-platform-name">{{ p.name }}</div>
            <div class="ai-platform-status">{{ p.connected ? 'Connected' : 'Not connected' }}</div>
          </div>
          <button class="ai-platform-btn" :class="p.connected ? 'ai-plat-btn--disconnect' : 'ai-plat-btn--connect'" @click="togglePlatform(p)">
            {{ p.connected ? 'Disconnect' : 'Connect' }}
          </button>
        </div>
      </div>

      <!-- Rate limits info -->
      <div class="ai-card ai-limits-card">
        <div class="ai-limits-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Rate limits
        </div>
        <div class="ai-limits-rows">
          <div class="ai-limit-row" v-for="l in rateLimits" :key="l.label">
            <span class="ai-limit-label">{{ l.label }}</span>
            <div class="ai-limit-bar-wrap">
              <div class="ai-limit-bar" :style="{ width: (l.used / l.max * 100) + '%' }" />
            </div>
            <span class="ai-limit-count">{{ l.used }} / {{ l.max }}</span>
          </div>
        </div>
        <div class="ai-limits-reset">Resets in 18h 42m</div>
      </div>

      <!-- Docs callout -->
      <div class="ai-docs-callout">
        <div class="ai-docs-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8dfa0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          <div>
            <div class="ai-docs-title">Developer docs</div>
            <div class="ai-docs-sub">REST API · Webhooks · SDKs</div>
          </div>
        </div>
        <a href="https://docs.carryit.tn" target="_blank" rel="noopener" class="ai-docs-link">View docs</a>
      </div>
    </main>

    <!-- Bottom tab bar -->
    <nav class="ai-tab-bar">
      <router-link to="/business/dashboard" class="ai-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/business/bulk" class="ai-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        <span>Bulk</span>
      </router-link>
      <router-link to="/business/storefront" class="ai-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Store</span>
      </router-link>
      <router-link to="/business/integrations" class="ai-tab active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        <span>API</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showWebhookForm = ref(false)

const apiKeys = ref([
  { id: 'k1', name: 'Production key', env: 'live', value: 'ck_live_8f2a9d1e4b7c3f6a', created: 'May 2, 2026', visible: false, copyMsg: false },
  { id: 'k2', name: 'Test key',       env: 'test', value: 'ck_test_2e5b8d1f9a4c7e3b', created: 'May 2, 2026', visible: false, copyMsg: false },
])

function maskKey(val) {
  return val.slice(0, 8) + '••••••••••••••••' + val.slice(-4)
}

function copyKey(key) {
  navigator.clipboard?.writeText(key.value)
  key.copyMsg = true
  setTimeout(() => key.copyMsg = false, 1800)
}

let keyCounter = 100
function generateKey() {
  const rand = Math.random().toString(36).slice(2, 18)
  apiKeys.value.push({
    id: 'k' + keyCounter++,
    name: 'New key',
    env: 'test',
    value: 'ck_test_' + rand,
    created: 'Jun 10, 2026',
    visible: false,
    copyMsg: false,
  })
}

const allEvents = ['booking.created', 'booking.confirmed', 'delivery.started', 'delivery.completed', 'dispute.opened']

const webhooks = ref([
  { id: 'w1', url: 'https://techshop.tn/hooks/carryit', events: ['booking.created', 'delivery.completed'], active: true },
])

const newWebhook = ref({ url: '', events: [] })

let whCounter = 10
function addWebhook() {
  if (!newWebhook.value.url) return
  webhooks.value.push({ id: 'w' + whCounter++, ...newWebhook.value, active: true })
  newWebhook.value = { url: '', events: [] }
  showWebhookForm.value = false
}

function removeWebhook(idx) {
  webhooks.value.splice(idx, 1)
}

const platforms = ref([
  { id: 'shopify',    name: 'Shopify',     color: '#96bf48', connected: true  },
  { id: 'woo',        name: 'WooCommerce', color: '#7f54b3', connected: false },
  { id: 'magento',    name: 'Magento',     color: '#ee672d', connected: false },
  { id: 'prestashop', name: 'PrestaShop',  color: '#df0067', connected: false },
])

function togglePlatform(p) {
  p.connected = !p.connected
}

const rateLimits = [
  { label: 'API requests / day',  used: 1240, max: 5000 },
  { label: 'Webhooks / hour',     used: 38,   max: 200  },
  { label: 'Bulk bookings / day', used: 4,    max: 20   },
]
</script>

<style scoped>
.ai-page { min-height: 100vh; background: #f0f0ee; font-family: 'Montserrat', sans-serif; padding-bottom: 70px; }

/* Header */
.ai-header { background: #111; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; height: 58px; position: sticky; top: 0; z-index: 50; gap: 12px; }
.ai-back { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); border: none; border-radius: 50%; color: #fff; cursor: pointer; flex-shrink: 0; }
.ai-back:hover { background: rgba(255,255,255,0.16); }
.ai-header-title { flex: 1; font-size: 16px; font-weight: 800; color: #fff; }
.ai-docs-btn { background: rgba(255,255,255,0.1); border: none; border-radius: 99px; padding: 7px 14px; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 800; color: #e8dfa0; cursor: pointer; text-decoration: none; transition: background 0.15s; }
.ai-docs-btn:hover { background: rgba(255,255,255,0.18); }

.ai-main { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.ai-section-title { font-size: 13px; font-weight: 800; color: #111; margin-top: 6px; }

/* Card */
.ai-card { background: #fff; border-radius: 16px; border: 1.5px solid rgba(17,17,17,0.07); overflow: hidden; }
.ai-card-desc { font-size: 12px; font-weight: 600; color: rgba(17,17,17,0.5); line-height: 1.5; padding: 14px 16px 0; }

/* API keys */
.ai-key-row { padding: 14px 16px; border-bottom: 1px solid rgba(17,17,17,0.06); position: relative; }
.ai-key-row:last-of-type { border-bottom: none; }
.ai-key-name { font-size: 13px; font-weight: 800; color: #111; }
.ai-key-meta { display: flex; align-items: center; gap: 8px; margin-top: 3px; }
.ai-key-env { font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding: 2px 7px; border-radius: 99px; }
.ai-env--live { background: #d4d8f8; color: #2230a0; }
.ai-env--test { background: rgba(17,17,17,0.08); color: rgba(17,17,17,0.55); }
.ai-key-created { font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.4); }
.ai-key-value-wrap { display: flex; align-items: center; gap: 6px; margin-top: 8px; background: rgba(17,17,17,0.04); border-radius: 8px; padding: 8px 10px; }
.ai-key-value { font-family: 'Courier New', monospace; font-size: 11px; color: #111; flex: 1; word-break: break-all; }
.ai-icon-btn { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: none; border: none; color: rgba(17,17,17,0.45); cursor: pointer; border-radius: 6px; flex-shrink: 0; transition: all 0.15s; }
.ai-icon-btn:hover { background: rgba(17,17,17,0.07); color: #111; }
.ai-copy-msg { position: absolute; right: 16px; bottom: 8px; font-size: 10px; font-weight: 700; color: #2230a0; }

.ai-new-key-btn { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 12px; background: none; border: none; border-top: 1.5px dashed rgba(17,17,17,0.1); font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: #2230a0; cursor: pointer; transition: background 0.15s; }
.ai-new-key-btn:hover { background: rgba(34,48,160,0.04); }

/* Webhooks */
.ai-webhook-row { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid rgba(17,17,17,0.06); }
.ai-webhook-status { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ai-wh--active { background: #2230a0; }
.ai-wh--inactive { background: rgba(17,17,17,0.2); }
.ai-webhook-info { flex: 1; min-width: 0; }
.ai-webhook-url { font-size: 12px; font-weight: 700; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ai-webhook-events { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
.ai-wh-event { font-size: 9px; font-weight: 700; color: rgba(17,17,17,0.45); background: rgba(17,17,17,0.06); border-radius: 4px; padding: 2px 5px; }

/* Toggle */
.ai-toggle-wrap { cursor: pointer; flex-shrink: 0; }
.ai-toggle-input { display: none; }
.ai-toggle { display: block; width: 32px; height: 18px; background: rgba(17,17,17,0.15); border-radius: 99px; position: relative; transition: background 0.15s; }
.ai-toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 12px; height: 12px; background: #fff; border-radius: 50%; transition: transform 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.ai-toggle-input:checked + .ai-toggle { background: #2230a0; }
.ai-toggle-input:checked + .ai-toggle::after { transform: translateX(14px); }

/* Webhook form */
.ai-wh-form { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; border-top: 1px solid rgba(17,17,17,0.06); }
.ai-input { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 600; color: #111; background: rgba(17,17,17,0.04); border: 1.5px solid transparent; border-radius: 8px; padding: 9px 10px; width: 100%; box-sizing: border-box; outline: none; transition: border-color 0.15s; }
.ai-input:focus { border-color: #2230a0; background: #fff; }
.ai-wh-events-pick { display: flex; flex-wrap: wrap; gap: 8px; }
.ai-ev-label { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: #111; cursor: pointer; }
.ai-wh-form-actions { display: flex; gap: 10px; justify-content: flex-end; }
.ai-btn-ghost { background: transparent; border: 1.5px solid rgba(17,17,17,0.2); border-radius: 99px; padding: 8px 16px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: #111; cursor: pointer; transition: all 0.15s; }
.ai-btn-ghost:hover { border-color: #111; }
.ai-btn-primary { background: #2230a0; border: none; border-radius: 99px; padding: 8px 16px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 800; color: #e8dfa0; cursor: pointer; transition: background 0.15s; }
.ai-btn-primary:hover { background: #111; }

/* Platform integrations */
.ai-integrations-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ai-platform-card { background: #fff; border-radius: 14px; border: 1.5px solid rgba(17,17,17,0.07); padding: 14px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; transition: border-color 0.15s; }
.ai-platform--connected { border-color: #2230a0; }
.ai-platform-logo { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.ai-platform-letter { font-size: 18px; font-weight: 900; color: #fff; }
.ai-platform-name { font-size: 12px; font-weight: 800; color: #111; }
.ai-platform-status { font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.45); }
.ai-platform-btn { border-radius: 99px; padding: 7px 14px; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 800; cursor: pointer; transition: all 0.15s; border: none; width: 100%; }
.ai-plat-btn--connect { background: #2230a0; color: #e8dfa0; }
.ai-plat-btn--connect:hover { background: #111; }
.ai-plat-btn--disconnect { background: rgba(17,17,17,0.08); color: rgba(17,17,17,0.55); }
.ai-plat-btn--disconnect:hover { background: rgba(17,17,17,0.14); color: #111; }

/* Rate limits */
.ai-limits-card { padding: 16px; }
.ai-limits-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; color: #111; margin-bottom: 14px; }
.ai-limits-rows { display: flex; flex-direction: column; gap: 10px; }
.ai-limit-row { display: flex; align-items: center; gap: 10px; }
.ai-limit-label { font-size: 11px; font-weight: 600; color: rgba(17,17,17,0.55); width: 140px; flex-shrink: 0; }
.ai-limit-bar-wrap { flex: 1; height: 6px; background: rgba(17,17,17,0.08); border-radius: 99px; overflow: hidden; }
.ai-limit-bar { height: 100%; background: #2230a0; border-radius: 99px; transition: width 0.4s; }
.ai-limit-count { font-size: 11px; font-weight: 700; color: #111; white-space: nowrap; width: 60px; text-align: right; }
.ai-limits-reset { font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.38); margin-top: 10px; text-align: right; }

/* Docs callout */
.ai-docs-callout { background: #111; border-radius: 16px; padding: 18px; display: flex; align-items: center; justify-content: space-between; }
.ai-docs-left { display: flex; align-items: center; gap: 12px; }
.ai-docs-title { font-size: 14px; font-weight: 800; color: #e8dfa0; }
.ai-docs-sub { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.4); margin-top: 2px; }
.ai-docs-link { background: #e8dfa0; color: #111; border: none; border-radius: 99px; padding: 9px 16px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 800; cursor: pointer; text-decoration: none; transition: opacity 0.15s; white-space: nowrap; }
.ai-docs-link:hover { opacity: 0.85; }

/* Tab bar */
.ai-tab-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 200; background: #111; display: flex; align-items: stretch; height: 64px; border-top: 2px solid rgba(255,255,255,0.06); padding-bottom: env(safe-area-inset-bottom, 0px); }
.ai-tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; color: rgba(255,255,255,0.38); font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.15s; padding: 0 4px; }
.ai-tab.active, .ai-tab:hover { color: #fff; }

@media (min-width: 768px) {
  .ai-tab-bar { display: none; }
  .ai-page { padding-bottom: 0; }
  .ai-main { max-width: 680px; margin: 0 auto; }
}
</style>
