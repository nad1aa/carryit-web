<template>
  <div class="rr">
    <header class="rr-header">
      <button class="rr-back" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="rr-header-title">Rate your experience</span>
      <div style="width:36px"/>
    </header>

    <!-- ── Revealed state (both submitted) ── -->
    <div v-if="phase === 'revealed'" class="rr-body">
      <div class="rr-revealed-card">
        <div class="rr-revealed-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b6d11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2 class="rr-revealed-title">Reviews revealed!</h2>
        <p class="rr-revealed-sub">Both parties have submitted — here's what they said about you.</p>

        <div class="rr-peer-review">
          <div class="rr-peer-header">
            <div class="rr-peer-avatar" style="background:#2230a0">{{ otherUserInitial }}</div>
            <div>
              <div class="rr-peer-name">{{ otherUserName }}</div>
              <div class="rr-peer-stars">
                <svg v-for="n in 5" :key="n" width="16" height="16" viewBox="0 0 24 24"
                  :fill="n <= peerRating ? '#2230a0' : 'none'"
                  stroke="#2230a0" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="rr-peer-tags" v-if="peerTags.length">
            <span v-for="t in peerTags" :key="t" class="rr-tag rr-tag--peer">{{ t }}</span>
          </div>
          <p class="rr-peer-text">"{{ peerReviewText }}"</p>
        </div>

        <router-link to="/sender/bookings" class="rr-cta-btn">Back to bookings</router-link>
      </div>
    </div>

    <!-- ── Waiting state (submitted, peer hasn't yet) ── -->
    <div v-else-if="phase === 'waiting'" class="rr-body">
      <div class="rr-waiting-card">
        <div class="rr-waiting-anim">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(34,48,160,0.3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="rr-waiting-ring">
            <circle cx="12" cy="12" r="10"/>
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rr-waiting-check">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 class="rr-waiting-title">Review submitted!</h2>
        <p class="rr-waiting-sub">Waiting for <strong>{{ otherUserName }}</strong> to submit their review. Both will be revealed simultaneously.</p>
        <div class="rr-waiting-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Checking for peer review…
        </div>
      </div>
    </div>

    <!-- ── Main form ── -->
    <main v-else class="rr-body">
      <!-- Booking context -->
      <div class="rr-context-card">
        <div class="rr-context-route">
          <span class="rr-context-city">{{ booking.origin }}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(17,17,17,0.4)" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          <span class="rr-context-city">{{ booking.destination }}</span>
        </div>
        <div class="rr-context-bottom">
          <div class="rr-context-user">
            <div class="rr-context-avatar" style="background:#2230a0">{{ otherUserInitial }}</div>
            <div>
              <div class="rr-context-label">You're rating</div>
              <div class="rr-context-name">{{ otherUserName }}</div>
            </div>
          </div>
          <span class="rr-delivered-badge">Delivered</span>
        </div>
      </div>

      <!-- Blind reveal notice -->
      <div class="rr-blind-notice">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        <span>Reviews are <strong>hidden until both parties submit</strong> — be honest!</span>
      </div>

      <!-- ── Star rating ── -->
      <div class="rr-section">
        <div class="rr-section-title">Overall rating</div>
        <div class="rr-stars">
          <button
            v-for="n in 5"
            :key="n"
            class="rr-star-btn"
            :class="{ active: n <= (hoverRating || rating), lit: n <= rating }"
            @mouseenter="hoverRating = n"
            @mouseleave="hoverRating = 0"
            @click="rating = n"
            type="button"
          >
            <svg width="44" height="44" viewBox="0 0 24 24"
              :fill="n <= (hoverRating || rating) ? '#2230a0' : 'none'"
              :stroke="n <= (hoverRating || rating) ? '#2230a0' : 'rgba(17,17,17,0.2)'"
              stroke-width="1.8">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
        </div>
        <div class="rr-star-label" :class="{ active: rating > 0 }">
          {{ starLabels[rating] }}
        </div>
      </div>

      <!-- ── Tag chips ── -->
      <div class="rr-section">
        <div class="rr-section-title">What stood out? <span class="rr-section-hint">(pick any)</span></div>
        <div class="rr-tags-wrap">
          <button
            v-for="tag in allTags"
            :key="tag"
            class="rr-tag-chip"
            :class="{ selected: selectedTags.includes(tag) }"
            @click="toggleTag(tag)"
            type="button"
          >
            <svg v-if="selectedTags.includes(tag)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- ── Written review ── -->
      <div class="rr-section">
        <div class="rr-section-title">Written review <span class="rr-section-hint">(min 20 chars)</span></div>
        <textarea
          v-model="reviewText"
          class="rr-textarea"
          rows="4"
          maxlength="500"
          :placeholder="reviewPlaceholder"
        />
        <div class="rr-char-count" :class="{ warn: reviewText.length < 20 && reviewText.length > 0 }">
          {{ reviewText.length }}/500
        </div>
      </div>

      <!-- ── Error ── -->
      <div v-if="submitError" class="rr-error">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ submitError }}
      </div>

      <button class="rr-submit-btn" @click="submit" :disabled="loading">
        <svg v-if="loading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rr-spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
        <template v-else>Submit review</template>
      </button>

      <button class="rr-skip-btn" @click="$router.back()">Skip for now</button>
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
}
const userRole       = 'sender'
const otherUserName  = userRole === 'sender' ? booking.travelerName : 'Ahmed K.'
const otherUserInitial = otherUserName.charAt(0).toUpperCase()

// Form state
const rating      = ref(0)
const hoverRating = ref(0)
const selectedTags = ref([])
const reviewText  = ref('')
const submitError = ref('')
const loading     = ref(false)

// Blind reveal state machine
const phase = ref('form') // 'form' | 'waiting' | 'revealed'

// Simulated peer review data
const peerRating     = 4
const peerTags       = ['Punctual', 'Communicative']
const peerReviewText = 'Great sender — package was well-packed and they were very clear about the contents. Easy pickup experience overall.'

const allTags = ['Punctual', 'Careful', 'Communicative', 'Friendly', 'Trustworthy']

const starLabels = ['', 'Poor', 'Fair', 'Good', 'Great!', 'Excellent!']

const reviewPlaceholder = computed(() =>
  userRole === 'sender'
    ? 'Describe your experience with this carrier — were they reliable and professional?'
    : 'How was the sender to work with?'
)

function toggleTag(tag) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(idx, 1)
}

function submit() {
  submitError.value = ''
  if (rating.value < 1) {
    submitError.value = 'Please select a star rating.'
    return
  }
  if (reviewText.value.trim().length < 20) {
    submitError.value = 'Your review must be at least 20 characters.'
    return
  }

  loading.value = true
  setTimeout(() => {
    loading.value = false
    phase.value = 'waiting'
    // Simulate peer submitting 2.5 seconds later (demo)
    setTimeout(() => { phase.value = 'revealed' }, 2500)
  }, 900)
}
</script>

<style scoped>
.rr { min-height: 100vh; background: #f0f0ee; font-family: 'Montserrat', sans-serif; padding-bottom: 32px; }

.rr-header { position: sticky; top: 0; z-index: 50; background: #111; color: #fff; display: flex; align-items: center; gap: 12px; padding: 0 16px; height: 58px; }
.rr-back { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); border: none; border-radius: 50%; color: #fff; cursor: pointer; }
.rr-back:hover { background: rgba(255,255,255,0.16); }
.rr-header-title { flex: 1; font-weight: 800; font-size: 16px; }

.rr-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

/* Context card */
.rr-context-card { background: #fff; border-radius: 14px; border: 1.5px solid rgba(17,17,17,0.1); padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }
.rr-context-route { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 800; color: #111; }
.rr-context-city { letter-spacing: 0.04em; }
.rr-context-bottom { display: flex; align-items: center; justify-content: space-between; }
.rr-context-user { display: flex; align-items: center; gap: 10px; }
.rr-context-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 900; color: #fff; }
.rr-context-label { font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(17,17,17,0.38); }
.rr-context-name { font-size: 14px; font-weight: 800; color: #111; }
.rr-delivered-badge { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; background: #d1f4d1; color: #2d5a2d; padding: 4px 10px; border-radius: 99px; }

/* Blind notice */
.rr-blind-notice { display: flex; align-items: flex-start; gap: 10px; background: #eef0fc; border: 1.5px solid #c0c8f0; border-radius: 10px; padding: 11px 14px; font-size: 12px; font-weight: 500; color: #333; line-height: 1.5; }
.rr-blind-notice strong { font-weight: 800; color: #2230a0; }

/* Sections */
.rr-section { background: #fff; border-radius: 14px; border: 1.5px solid rgba(17,17,17,0.1); padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
.rr-section-title { font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(17,17,17,0.45); }
.rr-section-hint { font-weight: 500; letter-spacing: 0; text-transform: none; font-size: 10px; color: rgba(17,17,17,0.35); }

/* Stars */
.rr-stars { display: flex; justify-content: center; gap: 4px; }
.rr-star-btn { background: none; border: none; cursor: pointer; padding: 4px; transition: transform 0.12s; }
.rr-star-btn:hover, .rr-star-btn.active { transform: scale(1.18); }
.rr-star-btn.lit { transform: scale(1.12); }
.rr-star-label { text-align: center; font-size: 14px; font-weight: 700; color: rgba(17,17,17,0.3); transition: color 0.15s; }
.rr-star-label.active { color: #2230a0; }

/* Tag chips */
.rr-tags-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
.rr-tag-chip {
  display: flex; align-items: center; gap: 5px;
  background: #f5f5f3; border: 1.5px solid rgba(17,17,17,0.15); border-radius: 99px;
  padding: 7px 14px; font-family: 'Montserrat', sans-serif;
  font-size: 12px; font-weight: 700; color: #111; cursor: pointer; transition: all 0.12s;
}
.rr-tag-chip:hover { border-color: #2230a0; color: #2230a0; }
.rr-tag-chip.selected { background: #2230a0; border-color: #2230a0; color: #e8dfa0; }

/* Textarea */
.rr-textarea {
  width: 100%; background: #f5f5f3; border: 1.5px solid rgba(17,17,17,0.1); border-radius: 10px;
  padding: 12px 14px; resize: none; font-family: 'Montserrat', sans-serif;
  font-size: 13px; font-weight: 500; color: #111; outline: none; transition: border-color 0.15s; box-sizing: border-box;
}
.rr-textarea:focus { border-color: #2230a0; background: #fff; }
.rr-textarea::placeholder { color: rgba(17,17,17,0.28); }
.rr-char-count { text-align: right; font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.35); }
.rr-char-count.warn { color: #b41e1e; }

/* Error */
.rr-error { display: flex; align-items: center; gap: 8px; background: #fde8e8; border: 1.5px solid rgba(180,30,30,0.25); border-radius: 10px; padding: 11px 14px; font-size: 12px; font-weight: 600; color: #b41e1e; }

/* Buttons */
.rr-submit-btn { display: flex; align-items: center; justify-content: center; gap: 8px; background: #2230a0; color: #e8dfa0; border: none; border-radius: 12px; padding: 15px; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; cursor: pointer; transition: background 0.15s, opacity 0.15s; }
.rr-submit-btn:hover:not(:disabled) { background: #111; }
.rr-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.rr-spin { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.rr-skip-btn { background: none; border: 1.5px solid rgba(17,17,17,0.18); border-radius: 12px; padding: 13px; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 600; color: rgba(17,17,17,0.45); cursor: pointer; transition: border-color 0.15s; }
.rr-skip-btn:hover { border-color: rgba(17,17,17,0.35); color: #111; }

/* ── Waiting state ── */
.rr-waiting-card { background: #fff; border-radius: 20px; border: 1.5px solid rgba(17,17,17,0.1); padding: 32px 24px; display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
.rr-waiting-anim { position: relative; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; }
.rr-waiting-ring { position: absolute; animation: pulse-ring 1.4s ease-in-out infinite; }
@keyframes pulse-ring { 0%, 100% { opacity: 0.3; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }
.rr-waiting-check { position: relative; z-index: 2; }
.rr-waiting-title { font-size: 20px; font-weight: 900; color: #111; margin: 0; }
.rr-waiting-sub { font-size: 13px; font-weight: 500; color: #555; line-height: 1.55; margin: 0; }
.rr-waiting-sub strong { font-weight: 800; color: #111; }
.rr-waiting-badge { display: flex; align-items: center; gap: 7px; background: #f5f5f3; border-radius: 99px; padding: 8px 16px; font-size: 11px; font-weight: 700; color: rgba(17,17,17,0.5); }

/* ── Revealed state ── */
.rr-revealed-card { background: #fff; border-radius: 20px; border: 1.5px solid rgba(17,17,17,0.1); padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.rr-revealed-icon { width: 56px; height: 56px; border-radius: 50%; background: #d1f4d1; display: flex; align-items: center; justify-content: center; }
.rr-revealed-title { font-size: 22px; font-weight: 900; color: #111; margin: 0; }
.rr-revealed-sub { font-size: 13px; font-weight: 500; color: #555; margin: 0; line-height: 1.5; }
.rr-peer-review { background: #f5f5f3; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.rr-peer-header { display: flex; align-items: center; gap: 10px; }
.rr-peer-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 900; color: #fff; }
.rr-peer-name { font-size: 13px; font-weight: 800; color: #111; }
.rr-peer-stars { display: flex; gap: 2px; margin-top: 2px; }
.rr-peer-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.rr-tag--peer { display: inline-flex; background: #eef0fc; border: 1px solid #c0c8f0; border-radius: 99px; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #2230a0; }
.rr-peer-text { font-size: 12px; font-weight: 500; color: #444; line-height: 1.55; font-style: italic; margin: 0; }
.rr-cta-btn { display: flex; align-items: center; justify-content: center; background: #2230a0; color: #e8dfa0; border-radius: 12px; padding: 14px; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; text-decoration: none; transition: background 0.15s; }
.rr-cta-btn:hover { background: #111; }

@media (min-width: 768px) { .rr-body { max-width: 520px; margin: 0 auto; } }
</style>
