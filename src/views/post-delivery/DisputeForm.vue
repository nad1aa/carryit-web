<template>
  <div class="df">
    <header class="df-header">
      <button class="df-back" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="df-header-title">Open a dispute</span>
      <div style="width:36px"/>
    </header>

    <main class="df-body">

      <!-- ── Expired state ── -->
      <div v-if="isExpired" class="df-expired-card">
        <div class="df-expired-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b41e1e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
        <h2 class="df-expired-title">Dispute window closed</h2>
        <p class="df-expired-sub">You had 48 hours after delivery to open a dispute. That window has passed.</p>
        <div class="df-expired-dates">
          <div class="df-expired-date-row">
            <span class="df-expired-date-label">Delivered</span>
            <span class="df-expired-date-val">{{ booking.date }}</span>
          </div>
          <div class="df-expired-date-row">
            <span class="df-expired-date-label">Deadline</span>
            <span class="df-expired-date-val">{{ deadlineDate }}</span>
          </div>
        </div>
        <router-link to="/sender/bookings" class="df-cta-btn-ghost">Back to bookings</router-link>
      </div>

      <!-- ── Success state ── -->
      <div v-else-if="submitted" class="df-success-card">
        <div class="df-success-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b6d11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2 class="df-success-title">Dispute submitted</h2>
        <div class="df-success-case">Case ID: <strong>{{ caseId }}</strong></div>
        <p class="df-success-sub">Our team will review within 24–48 business hours. You'll receive a notification with our decision.</p>
        <router-link to="/sender/bookings" class="df-cta-btn">Back to bookings</router-link>
      </div>

      <!-- ── Main form ── -->
      <template v-else>

        <!-- 48h warning banner -->
        <div class="df-warning-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>
            Dispute window closes in
            <strong>{{ timeRemaining.hours }}h {{ timeRemaining.minutes }}m</strong>
            — submit before it expires
          </span>
        </div>

        <!-- Booking summary -->
        <div class="df-booking-card">
          <div class="df-booking-route">
            <span class="df-booking-city">{{ booking.origin }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(17,17,17,0.4)" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            <span class="df-booking-city">{{ booking.destination }}</span>
          </div>
          <div class="df-booking-meta">
            <div class="df-booking-meta-item">
              <span class="df-booking-meta-label">Traveler</span>
              <span class="df-booking-meta-val">{{ booking.travelerName }}</span>
            </div>
            <div class="df-booking-meta-item">
              <span class="df-booking-meta-label">Date</span>
              <span class="df-booking-meta-val">{{ booking.date }}</span>
            </div>
            <div class="df-booking-meta-item">
              <span class="df-booking-meta-label">Amount paid</span>
              <span class="df-booking-meta-val">{{ booking.amount }} DT</span>
            </div>
          </div>
        </div>

        <!-- 1. Category cards (4 options) -->
        <div class="df-section">
          <div class="df-section-title">What's the issue?</div>
          <div class="df-categories">
            <button
              v-for="cat in disputeCategories"
              :key="cat.id"
              class="df-cat-card"
              :class="{ selected: category === cat.id }"
              @click="category = cat.id"
              type="button"
            >
              <div class="df-cat-svg" v-html="cat.svg"/>
              <span class="df-cat-label">{{ cat.label }}</span>
              <span class="df-cat-sub">{{ cat.sub }}</span>
            </button>
          </div>
          <div v-if="errors.category" class="df-field-error">{{ errors.category }}</div>
        </div>

        <!-- 2. Description -->
        <div class="df-section">
          <div class="df-section-title">Describe what happened <span class="df-section-hint">(min 50 chars)</span></div>
          <textarea
            v-model="description"
            class="df-textarea"
            rows="5"
            maxlength="1000"
            placeholder="Be as specific as possible — include dates, conditions, and any relevant details to help our team investigate…"
          />
          <div class="df-char-count">{{ description.length }}/1000</div>
          <div v-if="errors.description" class="df-field-error">{{ errors.description }}</div>
        </div>

        <!-- 3. Photo evidence -->
        <div class="df-section">
          <div class="df-section-title">
            Photo evidence
            <span class="df-section-hint">(up to 3 photos)</span>
          </div>
          <div
            class="df-upload-zone"
            :class="{ disabled: photos.length >= 3 }"
            @click="photos.length < 3 && fileInputEl?.click()"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(34,48,160,0.4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <span class="df-upload-label">{{ photos.length >= 3 ? 'Maximum photos added' : 'Tap to add photos' }}</span>
            <span class="df-upload-hint">JPG or PNG · max 5 MB each · {{ photos.length }}/3 added</span>
          </div>
          <input ref="fileInputEl" type="file" accept="image/jpeg,image/png" style="display:none" @change="handlePhoto"/>
          <div v-if="photos.length" class="df-photo-row">
            <div v-for="(p, i) in photos" :key="i" class="df-photo-thumb">
              <img :src="p.preview" :alt="p.name"/>
              <button class="df-photo-remove" @click="removePhoto(i)" type="button">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          <div v-if="photoError" class="df-field-error">{{ photoError }}</div>
        </div>

        <!-- 4. Resolution -->
        <div class="df-section">
          <div class="df-section-title">Requested resolution</div>
          <div class="df-select-wrap">
            <select v-model="resolution" class="df-select">
              <option value="">Select resolution…</option>
              <option v-for="opt in resolutionOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <svg class="df-select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div v-if="errors.resolution" class="df-field-error">{{ errors.resolution }}</div>
        </div>

        <!-- 5. Estimated loss (optional) -->
        <div class="df-section">
          <div class="df-section-title">Estimated loss <span class="df-section-hint">(optional)</span></div>
          <div class="df-amount-wrap">
            <input v-model="estimatedLoss" type="number" class="df-input" placeholder="0.00" min="0" step="0.01"/>
            <span class="df-amount-suffix">DT</span>
          </div>
        </div>

        <!-- Terms -->
        <label class="df-terms-row">
          <input type="checkbox" v-model="termsAgreed" class="df-checkbox"/>
          <span class="df-terms-text">I confirm this dispute is accurate and submitted in good faith</span>
        </label>

        <!-- Global error -->
        <div v-if="submitError" class="df-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ submitError }}
        </div>

        <button class="df-submit-btn" @click="submit" :disabled="!termsAgreed || loading">
          <svg v-if="loading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="df-spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
          <template v-else>Submit dispute</template>
        </button>

      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const booking = {
  id: route.params.id || '1',
  origin: 'Tunis', destination: 'Paris',
  date: 'Jun 14, 2026', travelerName: 'Yasmine Belhaj',
  amount: '38.50',
  deliveredAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10h ago (demo)
}

const isExpired = ref(false) // demo: always accessible

const deadlineDate = computed(() => {
  const d = new Date(booking.deliveredAt)
  d.setHours(d.getHours() + 48)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
})

const timeRemaining = computed(() => {
  const elapsed = Date.now() - booking.deliveredAt.getTime()
  const left = Math.max(0, 48 * 3600000 - elapsed)
  return { hours: Math.floor(left / 3600000), minutes: Math.floor((left % 3600000) / 60000) }
})

// Form
const category     = ref('')
const description  = ref('')
const photos       = ref([])
const resolution   = ref('')
const estimatedLoss = ref('')
const termsAgreed  = ref(false)
const submitted    = ref(false)
const loading      = ref(false)
const caseId       = ref('')
const submitError  = ref('')
const photoError   = ref('')
const errors       = ref({})
const fileInputEl  = ref(null)

const disputeCategories = [
  {
    id: 'damaged',
    label: 'Package damaged',
    sub: 'Item arrived broken or dented',
    svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><line x1="8" y1="5" x2="16" y2="19"/></svg>'
  },
  {
    id: 'wrong',
    label: 'Wrong item',
    sub: 'Different item than expected',
    svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>'
  },
  {
    id: 'missing',
    label: 'Missing items',
    sub: 'Contents incomplete or absent',
    svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>'
  },
  {
    id: 'not_delivered',
    label: 'Not delivered',
    sub: 'Package never arrived',
    svg: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><line x1="18" y1="6" x2="6" y2="18"/></svg>'
  },
]

const resolutionOptions = ['Full refund', 'Partial refund', 'Replacement shipment', 'Formal apology', 'Other']

function handlePhoto(e) {
  const file = e.target.files[0]
  if (!file) return
  photoError.value = ''
  if (photos.value.length >= 3) { photoError.value = 'Maximum 3 photos.'; return }
  if (file.size > 5 * 1024 * 1024) { photoError.value = 'File must be under 5 MB.'; return }
  photos.value.push({ name: file.name, preview: URL.createObjectURL(file) })
  e.target.value = ''
}

function removePhoto(i) {
  URL.revokeObjectURL(photos.value[i].preview)
  photos.value.splice(i, 1)
}

function submit() {
  submitError.value = ''
  errors.value = {}
  let valid = true

  if (!category.value) { errors.value.category = 'Please select an issue category.'; valid = false }
  if (description.value.trim().length < 50) { errors.value.description = 'Description must be at least 50 characters.'; valid = false }
  if (!resolution.value) { errors.value.resolution = 'Please select a resolution.'; valid = false }
  if (!valid) { submitError.value = 'Please fix the errors above.'; return }

  loading.value = true
  setTimeout(() => {
    loading.value = false
    caseId.value = `D-${Math.floor(100000 + Math.random() * 900000)}`
    submitted.value = true
  }, 1200)
}
</script>

<style scoped>
.df { min-height: 100vh; background: #f0f0ee; font-family: 'Montserrat', sans-serif; padding-bottom: 32px; }

.df-header { position: sticky; top: 0; z-index: 50; background: #111; color: #fff; display: flex; align-items: center; gap: 12px; padding: 0 16px; height: 58px; }
.df-back { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); border: none; border-radius: 50%; color: #fff; cursor: pointer; }
.df-back:hover { background: rgba(255,255,255,0.16); }
.df-header-title { flex: 1; font-weight: 800; font-size: 16px; }

.df-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

/* Warning banner */
.df-warning-banner { display: flex; align-items: flex-start; gap: 10px; background: #fff3cd; border: 1.5px solid rgba(17,17,17,0.15); border-radius: 10px; padding: 12px 14px; font-size: 12px; font-weight: 600; color: #333; line-height: 1.5; }
.df-warning-banner strong { font-weight: 900; color: #111; }

/* Booking card */
.df-booking-card { background: #fff; border-radius: 14px; border: 1.5px solid rgba(17,17,17,0.1); padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }
.df-booking-route { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 900; color: #111; letter-spacing: 0.02em; }
.df-booking-city { }
.df-booking-meta { display: flex; flex-direction: column; gap: 6px; }
.df-booking-meta-item { display: flex; gap: 12px; }
.df-booking-meta-label { font-size: 11px; font-weight: 700; color: rgba(17,17,17,0.4); min-width: 80px; }
.df-booking-meta-val { font-size: 12px; font-weight: 700; color: #111; }

/* Sections */
.df-section { background: #fff; border-radius: 14px; border: 1.5px solid rgba(17,17,17,0.1); padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
.df-section-title { font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(17,17,17,0.45); }
.df-section-hint { font-weight: 500; letter-spacing: 0; text-transform: none; font-size: 10px; color: rgba(17,17,17,0.35); }

/* 4-category grid */
.df-categories { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.df-cat-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: #f5f5f3; border: 2px solid rgba(17,17,17,0.1); border-radius: 12px;
  padding: 16px 10px; cursor: pointer; text-align: center; transition: all 0.12s;
  font-family: 'Montserrat', sans-serif;
}
.df-cat-card:hover { border-color: rgba(34,48,160,0.4); background: #f0f1fd; }
.df-cat-card.selected { border-color: #2230a0; background: #eef0fc; }
.df-cat-svg { color: #2230a0; display: flex; }
.df-cat-label { font-size: 12px; font-weight: 800; color: #111; line-height: 1.3; }
.df-cat-sub { font-size: 10px; font-weight: 500; color: rgba(17,17,17,0.45); line-height: 1.35; }

/* Textarea */
.df-textarea {
  width: 100%; background: #f5f5f3; border: 1.5px solid rgba(17,17,17,0.1); border-radius: 10px;
  padding: 12px 14px; resize: vertical; font-family: 'Montserrat', sans-serif;
  font-size: 13px; font-weight: 500; color: #111; outline: none; transition: border-color 0.15s; box-sizing: border-box;
}
.df-textarea:focus { border-color: #2230a0; background: #fff; }
.df-textarea::placeholder { color: rgba(17,17,17,0.28); }
.df-char-count { text-align: right; font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.35); }

/* Photo upload */
.df-upload-zone {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: #f5f5f3; border: 2px dashed rgba(34,48,160,0.25); border-radius: 12px;
  padding: 22px; cursor: pointer; transition: all 0.12s;
}
.df-upload-zone:hover:not(.disabled) { border-color: #2230a0; background: #eef0fc; }
.df-upload-zone.disabled { opacity: 0.5; cursor: default; }
.df-upload-label { font-size: 13px; font-weight: 700; color: #2230a0; }
.df-upload-hint { font-size: 11px; font-weight: 500; color: rgba(17,17,17,0.4); }
.df-photo-row { display: flex; gap: 10px; flex-wrap: wrap; }
.df-photo-thumb { position: relative; width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 1.5px solid rgba(17,17,17,0.12); }
.df-photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
.df-photo-remove { position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%; background: rgba(17,17,17,0.65); border: none; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }

/* Select */
.df-select-wrap { position: relative; }
.df-select { width: 100%; appearance: none; background: #f5f5f3; border: 1.5px solid rgba(17,17,17,0.1); border-radius: 10px; padding: 12px 36px 12px 14px; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 600; color: #111; outline: none; transition: border-color 0.15s; cursor: pointer; box-sizing: border-box; }
.df-select:focus { border-color: #2230a0; background: #fff; }
.df-select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: rgba(17,17,17,0.4); }

/* Amount */
.df-amount-wrap { display: flex; align-items: center; gap: 8px; }
.df-input { flex: 1; background: #f5f5f3; border: 1.5px solid rgba(17,17,17,0.1); border-radius: 10px; padding: 12px 14px; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 600; color: #111; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
.df-input:focus { border-color: #2230a0; background: #fff; }
.df-amount-suffix { font-size: 13px; font-weight: 700; color: rgba(17,17,17,0.5); flex-shrink: 0; }

/* Terms */
.df-terms-row { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
.df-checkbox { width: 18px; height: 18px; accent-color: #2230a0; flex-shrink: 0; margin-top: 2px; cursor: pointer; }
.df-terms-text { font-size: 12px; font-weight: 600; color: #444; line-height: 1.5; }

/* Errors */
.df-field-error { font-size: 11px; font-weight: 700; color: #b41e1e; }
.df-error { display: flex; align-items: center; gap: 8px; background: #fde8e8; border: 1.5px solid rgba(180,30,30,0.2); border-radius: 10px; padding: 11px 14px; font-size: 12px; font-weight: 600; color: #b41e1e; }

/* Submit */
.df-submit-btn { display: flex; align-items: center; justify-content: center; gap: 8px; background: #b41e1e; color: #fff; border: none; border-radius: 12px; padding: 15px; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; cursor: pointer; transition: background 0.15s, opacity 0.15s; }
.df-submit-btn:hover:not(:disabled) { background: #111; }
.df-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.df-spin { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Success card */
.df-success-card { background: #fff; border-radius: 20px; border: 1.5px solid rgba(17,17,17,0.1); padding: 28px 24px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; }
.df-success-icon { width: 64px; height: 64px; border-radius: 50%; background: #d1f4d1; display: flex; align-items: center; justify-content: center; }
.df-success-title { font-size: 22px; font-weight: 900; color: #111; margin: 0; }
.df-success-case { font-size: 12px; font-weight: 700; color: rgba(17,17,17,0.5); }
.df-success-case strong { color: #2230a0; font-size: 16px; }
.df-success-sub { font-size: 13px; font-weight: 500; color: #555; line-height: 1.55; margin: 0; }
.df-cta-btn { display: flex; align-items: center; justify-content: center; width: 100%; background: #2230a0; color: #e8dfa0; border-radius: 12px; padding: 14px; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; text-decoration: none; transition: background 0.15s; }
.df-cta-btn:hover { background: #111; }

/* Expired card */
.df-expired-card { background: #fff; border-radius: 20px; border: 1.5px solid rgba(17,17,17,0.1); padding: 28px 24px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; }
.df-expired-icon { width: 64px; height: 64px; border-radius: 50%; background: #fde8e8; display: flex; align-items: center; justify-content: center; }
.df-expired-title { font-size: 20px; font-weight: 900; color: #111; margin: 0; }
.df-expired-sub { font-size: 13px; font-weight: 500; color: #555; margin: 0; line-height: 1.5; }
.df-expired-dates { width: 100%; background: #f5f5f3; border-radius: 10px; padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
.df-expired-date-row { display: flex; justify-content: space-between; }
.df-expired-date-label { font-size: 11px; font-weight: 700; color: rgba(17,17,17,0.45); text-transform: uppercase; letter-spacing: 0.06em; }
.df-expired-date-val { font-size: 12px; font-weight: 700; color: #111; }
.df-cta-btn-ghost { display: flex; align-items: center; justify-content: center; width: 100%; background: none; border: 1.5px solid rgba(17,17,17,0.18); border-radius: 12px; padding: 13px; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700; color: rgba(17,17,17,0.55); text-decoration: none; transition: border-color 0.15s; }
.df-cta-btn-ghost:hover { border-color: #2230a0; color: #2230a0; }

@media (min-width: 768px) { .df-body { max-width: 560px; margin: 0 auto; } }
</style>
