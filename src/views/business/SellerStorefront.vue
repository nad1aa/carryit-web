<template>
  <div class="ss-page">
    <!-- Header -->
    <header class="ss-header">
      <button class="ss-back" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="ss-header-title">My storefront</span>
      <button class="ss-preview-btn" @click="previewMode = !previewMode">
        {{ previewMode ? 'Edit' : 'Preview' }}
      </button>
    </header>

    <!-- Edit mode -->
    <template v-if="!previewMode">
      <main class="ss-main">

        <!-- Store profile card -->
        <div class="ss-card">
          <div class="ss-card-title">Store profile</div>

          <div class="ss-store-banner" :style="{ background: store.bannerColor }">
            <button class="ss-banner-edit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit banner
            </button>
          </div>

          <div class="ss-store-identity">
            <div class="ss-store-avatar" :style="{ background: store.avatarColor }">
              {{ store.name[0] }}
            </div>
            <div class="ss-store-info">
              <input v-model="store.name" class="ss-store-name-input" placeholder="Store name" />
              <input v-model="store.tagline" class="ss-store-tagline-input" placeholder="Short tagline…" />
            </div>
          </div>

          <div class="ss-field-group">
            <label class="ss-label">Description</label>
            <textarea v-model="store.description" class="ss-textarea" rows="3" placeholder="Tell buyers about your store…" />
          </div>

          <div class="ss-field-row">
            <div class="ss-field-group">
              <label class="ss-label">Country</label>
              <input v-model="store.country" class="ss-input" placeholder="Tunisia" />
            </div>
            <div class="ss-field-group">
              <label class="ss-label">WhatsApp</label>
              <input v-model="store.whatsapp" class="ss-input" placeholder="+216..." />
            </div>
          </div>

          <div class="ss-badges-row">
            <div class="ss-badge-toggle" v-for="b in badgeOptions" :key="b.id" @click="toggleBadge(b.id)" :class="{ active: store.badges.includes(b.id) }">
              <span class="ss-badge-icon" v-html="b.icon" />
              {{ b.label }}
            </div>
          </div>
        </div>

        <!-- Products section -->
        <div class="ss-card">
          <div class="ss-card-hdr">
            <span class="ss-card-title">Products</span>
            <button class="ss-add-product-btn" @click="addProduct">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add product
            </button>
          </div>

          <div v-for="(p, idx) in products" :key="p.id" class="ss-product-row">
            <div class="ss-product-thumb" :style="{ background: p.color }">
              {{ p.name[0] }}
            </div>
            <div class="ss-product-info">
              <input v-model="p.name" class="ss-product-name" placeholder="Product name" />
              <input v-model="p.price" class="ss-product-price" placeholder="Price (DT)" type="number" />
            </div>
            <div class="ss-product-toggles">
              <label class="ss-toggle-wrap" :for="'intl-' + p.id">
                <input :id="'intl-' + p.id" type="checkbox" v-model="p.shipsIntl" class="ss-toggle-input" />
                <span class="ss-toggle" />
                <span class="ss-toggle-label">Ships intl.</span>
              </label>
            </div>
            <button class="ss-product-del" @click="removeProduct(idx)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div v-if="products.length === 0" class="ss-products-empty">
            No products yet — click "Add product" to start
          </div>
        </div>

        <!-- Save button -->
        <button class="ss-save-btn" @click="saveStore">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save storefront
        </button>

        <!-- Storefront link -->
        <div class="ss-link-card">
          <div class="ss-link-label">Your public storefront link</div>
          <div class="ss-link-row">
            <span class="ss-link-url">carryit.app/store/{{ slugify(store.name) }}</span>
            <button class="ss-link-copy" @click="copyLink">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>
      </main>
    </template>

    <!-- Preview mode -->
    <template v-else>
      <div class="ss-preview">
        <div class="ss-preview-banner" :style="{ background: store.bannerColor }" />
        <div class="ss-preview-identity">
          <div class="ss-preview-avatar" :style="{ background: store.avatarColor }">{{ store.name[0] }}</div>
          <div>
            <div class="ss-preview-name">{{ store.name }}</div>
            <div class="ss-preview-tagline">{{ store.tagline }}</div>
          </div>
        </div>
        <div class="ss-preview-badges">
          <span v-for="bid in store.badges" :key="bid" class="ss-preview-badge">
            <span v-html="badgeOptions.find(b => b.id === bid)?.icon" />
            {{ badgeOptions.find(b => b.id === bid)?.label }}
          </span>
        </div>
        <p class="ss-preview-desc">{{ store.description }}</p>
        <div class="ss-preview-section-title">Ships internationally</div>
        <div class="ss-preview-products">
          <div v-for="p in products.filter(p => p.shipsIntl)" :key="p.id" class="ss-preview-product">
            <div class="ss-preview-product-thumb" :style="{ background: p.color }">{{ p.name[0] }}</div>
            <div class="ss-preview-product-name">{{ p.name }}</div>
            <div class="ss-preview-product-price">{{ p.price }} DT</div>
            <button class="ss-preview-cta">Request delivery</button>
          </div>
          <div v-if="products.filter(p => p.shipsIntl).length === 0" class="ss-preview-empty">
            No products marked for international shipping yet
          </div>
        </div>
      </div>
    </template>

    <!-- Bottom tab bar -->
    <nav class="ss-tab-bar">
      <router-link to="/business/dashboard" class="ss-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/business/bulk" class="ss-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        <span>Bulk</span>
      </router-link>
      <router-link to="/business/storefront" class="ss-tab active">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Store</span>
      </router-link>
      <router-link to="/business/integrations" class="ss-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        <span>API</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const previewMode = ref(false)
const copied = ref(false)

const store = ref({
  name: 'TechShop Sousse',
  tagline: 'Quality electronics, delivered worldwide',
  description: 'We specialize in consumer electronics and accessories. All products are authentic with manufacturer warranty. We partner with CarryIt travelers to ship worldwide.',
  country: 'Tunisia',
  whatsapp: '+216 55 123 456',
  bannerColor: '#2230a0',
  avatarColor: '#111',
  badges: ['verified', 'fast'],
})

const badgeOptions = [
  { id: 'verified',  label: 'Verified seller', icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' },
  { id: 'fast',      label: 'Fast shipper',    icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
  { id: 'authentic', label: 'Authentic goods',  icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
]

let productId = 10
const products = ref([
  { id: 1, name: 'Wireless Earbuds Pro',    price: 180, shipsIntl: true,  color: '#2230a0' },
  { id: 2, name: 'Smart Watch Series 5',    price: 320, shipsIntl: true,  color: '#8485d0' },
  { id: 3, name: 'USB-C Hub 7-in-1',        price: 65,  shipsIntl: true,  color: '#3b6d11' },
  { id: 4, name: 'Laptop Stand Aluminium',  price: 90,  shipsIntl: false, color: '#854f0b' },
])

function addProduct() {
  products.value.push({ id: productId++, name: 'New product', price: 0, shipsIntl: false, color: '#2230a0' })
}

function removeProduct(idx) {
  products.value.splice(idx, 1)
}

function toggleBadge(id) {
  const arr = store.value.badges
  const i = arr.indexOf(id)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(id)
}

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function copyLink() {
  navigator.clipboard?.writeText(`carryit.app/store/${slugify(store.value.name)}`)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

function saveStore() {
  previewMode.value = true
}
</script>

<style scoped>
.ss-page { min-height: 100vh; background: #f0f0ee; font-family: 'Montserrat', sans-serif; padding-bottom: 70px; }

/* Header */
.ss-header { background: #111; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; height: 58px; position: sticky; top: 0; z-index: 50; gap: 12px; }
.ss-back { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); border: none; border-radius: 50%; color: #fff; cursor: pointer; flex-shrink: 0; }
.ss-back:hover { background: rgba(255,255,255,0.16); }
.ss-header-title { flex: 1; font-size: 16px; font-weight: 800; color: #fff; }
.ss-preview-btn { background: rgba(255,255,255,0.1); border: none; border-radius: 99px; padding: 7px 14px; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 800; color: #e8dfa0; cursor: pointer; transition: background 0.15s; }
.ss-preview-btn:hover { background: rgba(255,255,255,0.18); }

.ss-main { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

/* Card */
.ss-card { background: #fff; border-radius: 16px; border: 1.5px solid rgba(17,17,17,0.07); padding: 18px; display: flex; flex-direction: column; gap: 14px; }
.ss-card-title { font-size: 13px; font-weight: 800; color: #111; }
.ss-card-hdr { display: flex; align-items: center; justify-content: space-between; }
.ss-add-product-btn { display: flex; align-items: center; gap: 5px; background: #2230a0; color: #e8dfa0; border: none; border-radius: 99px; padding: 6px 12px; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 800; cursor: pointer; }

/* Store profile */
.ss-store-banner { height: 80px; border-radius: 10px; position: relative; display: flex; align-items: flex-end; justify-content: flex-end; padding: 8px; }
.ss-banner-edit { display: flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.4); border: none; border-radius: 99px; padding: 5px 10px; font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 700; color: #fff; cursor: pointer; }
.ss-store-identity { display: flex; align-items: center; gap: 12px; }
.ss-store-avatar { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; color: #fff; flex-shrink: 0; border: 3px solid #fff; margin-top: -28px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.ss-store-name-input { font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 800; color: #111; border: none; border-bottom: 1.5px solid rgba(17,17,17,0.12); padding: 2px 0; width: 100%; outline: none; background: transparent; }
.ss-store-name-input:focus { border-bottom-color: #2230a0; }
.ss-store-tagline-input { font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 600; color: rgba(17,17,17,0.5); border: none; border-bottom: 1px dashed rgba(17,17,17,0.1); padding: 2px 0; width: 100%; outline: none; background: transparent; }

/* Fields */
.ss-field-group { display: flex; flex-direction: column; gap: 5px; }
.ss-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ss-label { font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(17,17,17,0.4); }
.ss-input { font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 600; color: #111; background: rgba(17,17,17,0.04); border: 1.5px solid transparent; border-radius: 8px; padding: 9px 10px; width: 100%; box-sizing: border-box; outline: none; transition: border-color 0.15s; }
.ss-input:focus { border-color: #2230a0; background: #fff; }
.ss-textarea { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 600; color: #111; background: rgba(17,17,17,0.04); border: 1.5px solid transparent; border-radius: 8px; padding: 10px; width: 100%; box-sizing: border-box; outline: none; resize: vertical; line-height: 1.5; transition: border-color 0.15s; }
.ss-textarea:focus { border-color: #2230a0; background: #fff; }

/* Badges */
.ss-badges-row { display: flex; gap: 8px; flex-wrap: wrap; }
.ss-badge-toggle { display: flex; align-items: center; gap: 6px; border: 1.5px solid rgba(17,17,17,0.15); border-radius: 99px; padding: 6px 12px; font-size: 11px; font-weight: 700; color: rgba(17,17,17,0.55); cursor: pointer; transition: all 0.15s; }
.ss-badge-toggle.active { border-color: #2230a0; background: rgba(34,48,160,0.07); color: #2230a0; }
.ss-badge-icon { display: flex; }

/* Products */
.ss-product-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(17,17,17,0.06); }
.ss-product-row:last-of-type { border-bottom: none; }
.ss-product-thumb { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; color: #fff; flex-shrink: 0; }
.ss-product-info { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.ss-product-name { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: #111; border: none; border-bottom: 1px dashed rgba(17,17,17,0.1); padding: 2px 0; outline: none; background: transparent; width: 100%; }
.ss-product-price { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 800; color: #2230a0; border: none; border-bottom: 1px dashed rgba(17,17,17,0.1); padding: 2px 0; outline: none; background: transparent; width: 70px; }
.ss-product-toggles { flex-shrink: 0; }
.ss-toggle-wrap { display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; }
.ss-toggle-input { display: none; }
.ss-toggle { display: block; width: 32px; height: 18px; background: rgba(17,17,17,0.15); border-radius: 99px; position: relative; transition: background 0.15s; }
.ss-toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 12px; height: 12px; background: #fff; border-radius: 50%; transition: transform 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,0.25); }
.ss-toggle-input:checked + .ss-toggle { background: #2230a0; }
.ss-toggle-input:checked + .ss-toggle::after { transform: translateX(14px); }
.ss-toggle-label { font-size: 9px; font-weight: 700; color: rgba(17,17,17,0.45); white-space: nowrap; }
.ss-product-del { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: none; border: none; color: rgba(17,17,17,0.3); cursor: pointer; border-radius: 6px; transition: all 0.15s; flex-shrink: 0; }
.ss-product-del:hover { background: rgba(180,30,30,0.08); color: #b41e1e; }
.ss-products-empty { font-size: 12px; font-weight: 600; color: rgba(17,17,17,0.4); text-align: center; padding: 16px 0; }

/* Save btn */
.ss-save-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: #111; color: #e8dfa0; border: none; border-radius: 14px; padding: 15px; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; cursor: pointer; transition: background 0.15s; }
.ss-save-btn:hover { background: #2230a0; }

/* Link card */
.ss-link-card { background: rgba(34,48,160,0.06); border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
.ss-link-label { font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(17,17,17,0.4); }
.ss-link-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.ss-link-url { font-size: 12px; font-weight: 700; color: #2230a0; word-break: break-all; flex: 1; }
.ss-link-copy { background: #2230a0; color: #e8dfa0; border: none; border-radius: 99px; padding: 6px 12px; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 800; cursor: pointer; white-space: nowrap; transition: background 0.15s; }
.ss-link-copy:hover { background: #111; }

/* Preview mode */
.ss-preview { padding-bottom: 70px; }
.ss-preview-banner { height: 120px; }
.ss-preview-identity { display: flex; align-items: center; gap: 14px; padding: 0 20px; margin-top: -24px; }
.ss-preview-avatar { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; color: #fff; border: 3px solid #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.12); }
.ss-preview-name { font-size: 18px; font-weight: 900; color: #111; margin-top: 20px; }
.ss-preview-tagline { font-size: 12px; font-weight: 600; color: rgba(17,17,17,0.5); }
.ss-preview-badges { display: flex; gap: 8px; padding: 14px 20px 0; flex-wrap: wrap; }
.ss-preview-badge { display: flex; align-items: center; gap: 5px; background: #d4d8f8; color: #2230a0; font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 99px; }
.ss-preview-desc { font-size: 13px; font-weight: 600; color: rgba(17,17,17,0.6); line-height: 1.6; padding: 14px 20px 0; margin: 0; }
.ss-preview-section-title { font-size: 13px; font-weight: 800; color: #111; padding: 18px 20px 10px; }
.ss-preview-products { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 0 16px; }
.ss-preview-product { background: #fff; border-radius: 14px; border: 1.5px solid rgba(17,17,17,0.07); padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.ss-preview-product-thumb { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; color: #fff; }
.ss-preview-product-name { font-size: 12px; font-weight: 800; color: #111; line-height: 1.3; }
.ss-preview-product-price { font-size: 16px; font-weight: 900; color: #2230a0; }
.ss-preview-cta { background: #2230a0; color: #e8dfa0; border: none; border-radius: 99px; padding: 7px 10px; font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 800; cursor: pointer; transition: background 0.15s; margin-top: auto; }
.ss-preview-cta:hover { background: #111; }
.ss-preview-empty { grid-column: 1 / -1; font-size: 12px; font-weight: 600; color: rgba(17,17,17,0.4); text-align: center; padding: 24px 0; }

/* Tab bar */
.ss-tab-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 200; background: #111; display: flex; align-items: stretch; height: 64px; border-top: 2px solid rgba(255,255,255,0.06); padding-bottom: env(safe-area-inset-bottom, 0px); }
.ss-tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; color: rgba(255,255,255,0.38); font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.15s; padding: 0 4px; }
.ss-tab.active, .ss-tab:hover { color: #fff; }

@media (min-width: 768px) {
  .ss-tab-bar { display: none; }
  .ss-page { padding-bottom: 0; }
  .ss-main { max-width: 680px; margin: 0 auto; }
  .ss-preview { max-width: 680px; margin: 0 auto; }
}
</style>
