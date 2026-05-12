<template>
  <div class="pp-page">

    <!-- Hero band -->
    <div class="pp-hero">
      <div class="pp-hero-bg" />
      <button class="pp-back-btn" @click="$router.back()" aria-label="Back">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button v-if="isOwnProfile" class="pp-edit-hero-btn" @click="editMode = !editMode">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit
      </button>
      <div class="pp-hero-content">
        <div class="pp-avatar">{{ initials }}</div>
        <div class="pp-name">{{ profile.name }}</div>
        <div class="pp-meta">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {{ profile.city }}
          <span class="pp-meta-sep">·</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Since {{ joinDate }}
        </div>
        <div class="pp-kyc" :class="profile.kyc ? 'pp-kyc--ok' : 'pp-kyc--pending'">
          <svg v-if="profile.kyc" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          {{ profile.kyc ? 'ID Verified' : 'Verification Pending' }}
        </div>
      </div>
    </div>

    <div class="pp-body">

      <!-- Edit profile card -->
      <div v-if="editMode" class="pp-card pp-edit-card">
        <div class="pp-card-title">Edit profile</div>
        <div class="pp-field-group">
          <label class="pp-label">Full name</label>
          <input v-model="editForm.name" class="pp-input" />
        </div>
        <div class="pp-field-group">
          <label class="pp-label">City</label>
          <input v-model="editForm.city" class="pp-input" placeholder="e.g. Tunis" />
        </div>
        <div class="pp-field-group">
          <label class="pp-label">About me</label>
          <textarea v-model="editForm.bio" class="pp-textarea" rows="3" maxlength="300" />
          <span class="pp-char-count">{{ editForm.bio.length }}/300</span>
        </div>
        <div class="pp-edit-actions">
          <button class="pp-btn-primary" @click="saveEdit">Save changes</button>
          <button class="pp-btn-ghost" @click="editMode = false">Cancel</button>
        </div>
      </div>

      <!-- Trust score -->
      <div class="pp-card">
        <div class="pp-trust-row">
          <div class="pp-trust-left">
            <div class="pp-trust-score">{{ profile.trustScore }}</div>
            <div class="pp-trust-max">/5</div>
          </div>
          <div class="pp-trust-right">
            <div class="pp-trust-stars">
              <svg v-for="n in 5" :key="n" width="14" height="14" viewBox="0 0 24 24"
                :fill="n <= Math.round(profile.trustScore) ? '#2230a0' : 'none'"
                :stroke="n <= Math.round(profile.trustScore) ? '#2230a0' : 'rgba(17,17,17,0.2)'"
                stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div class="pp-trust-reviews">Based on {{ profile.reviewCount }} reviews</div>
            <div class="pp-star-bars">
              <div v-for="(pct, idx) in starBreakdown" :key="idx" class="pp-star-row">
                <span class="pp-star-lbl">{{ 5 - idx }}★</span>
                <div class="pp-star-bg"><div class="pp-star-fill" :style="{ width: pct + '%' }" /></div>
                <span class="pp-star-pct">{{ pct }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="pp-stats-row">
        <div class="pp-stat" v-for="s in currentStats" :key="s.label">
          <span class="pp-stat-val">{{ s.value }}</span>
          <span class="pp-stat-lbl">{{ s.label }}</span>
        </div>
      </div>

      <!-- Trust chips -->
      <div class="pp-card">
        <div class="pp-card-title">Known for</div>
        <div class="pp-chips-row">
          <span v-for="chip in trustChips" :key="chip.label" class="pp-chip">
            <span class="pp-chip-count">{{ chip.count }}</span>
            {{ chip.label }}
          </span>
        </div>
      </div>

      <!-- Traveler passport stamps -->
      <div v-if="profile.role === 'traveler'" class="pp-card">
        <div class="pp-card-title">Trip passport</div>
        <div class="pp-stamps-row">
          <div v-for="stamp in tripStamps" :key="stamp.code" class="pp-stamp">
            <div class="pp-stamp-circle">{{ stamp.code }}</div>
            <span class="pp-stamp-city">{{ stamp.city }}</span>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="pp-card">
        <div class="pp-card-title">About</div>
        <p class="pp-bio">{{ profile.bio || 'No bio yet.' }}</p>
      </div>

      <!-- Quick links -->
      <template v-if="profile.role === 'traveler'">
        <router-link to="/traveler/trips" class="pp-quick-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
          <div>
            <div class="pp-ql-title">My Trips</div>
            <div class="pp-ql-sub">View all your posted trips</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </router-link>

        <!-- Earnings sparkline -->
        <div class="pp-card">
          <div class="pp-card-title">Earnings trend</div>
          <div class="pp-sparkline-wrap">
            <svg class="pp-sparkline" viewBox="0 0 200 50" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2230a0" stop-opacity="0.2"/>
                  <stop offset="100%" stop-color="#2230a0" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,40 L33,30 L66,35 L100,20 L133,15 L166,10 L200,5 L200,50 L0,50 Z" fill="url(#sparkGrad)"/>
              <polyline points="0,40 33,30 66,35 100,20 133,15 166,10 200,5" fill="none" stroke="#2230a0" stroke-width="2"/>
              <circle cx="200" cy="5" r="3" fill="#2230a0"/>
            </svg>
            <div class="pp-sparkline-labels">
              <span v-for="m in ['Jan','Feb','Mar','Apr','May','Jun']" :key="m">{{ m }}</span>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <router-link to="/sender/bookings" class="pp-quick-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          <div>
            <div class="pp-ql-title">My Bookings</div>
            <div class="pp-ql-sub">Track all your shipments</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2230a0" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </router-link>

        <div class="pp-card">
          <div class="pp-card-title">Favourite routes</div>
          <div class="pp-routes-list">
            <div v-for="r in favoriteRoutes" :key="r.id" class="pp-route-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ r.from }} to {{ r.to }}
              <span class="pp-route-count">x{{ r.count }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Reviews -->
      <div class="pp-card pp-reviews-card">
        <div class="pp-card-hdr">
          <span class="pp-card-title">Recent reviews</span>
          <button class="pp-see-all">See all</button>
        </div>
        <div v-for="(rv, i) in recentReviews" :key="rv.id" class="pp-review" :class="{ 'pp-review--last': i === recentReviews.length - 1 }">
          <div class="pp-review-hdr">
            <div class="pp-review-avatar" :style="{ background: rv.color }">{{ rv.initials }}</div>
            <div class="pp-review-meta">
              <div class="pp-review-name">{{ rv.name }}</div>
              <div class="pp-review-stars">
                <svg v-for="n in 5" :key="n" width="12" height="12" viewBox="0 0 24 24"
                  :fill="n <= rv.rating ? '#2230a0' : 'none'"
                  :stroke="n <= rv.rating ? '#2230a0' : 'rgba(17,17,17,0.2)'"
                  stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
            </div>
            <span class="pp-review-date">{{ rv.date }}</span>
          </div>
          <p class="pp-review-comment">{{ rv.comment }}</p>
        </div>
      </div>

      <!-- Settings -->
      <div class="pp-card pp-settings-card">
        <button class="pp-settings-toggle" @click="settingsOpen = !settingsOpen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Settings
          <svg class="pp-caret" :class="{ open: settingsOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        <div v-if="settingsOpen" class="pp-settings-body">
          <div class="pp-settings-section">
            <div class="pp-settings-label">Notifications</div>
            <div v-for="n in notifPrefs" :key="n.key" class="pp-settings-row">
              <span>{{ n.label }}</span>
              <label class="pp-toggle-wrap">
                <input type="checkbox" v-model="n.enabled" class="pp-toggle-input" />
                <span class="pp-toggle" />
              </label>
            </div>
          </div>

          <div class="pp-settings-divider" />

          <div class="pp-settings-section">
            <div class="pp-settings-label">Language</div>
            <div class="pp-lang-row">
              <button v-for="lang in languages" :key="lang" class="pp-lang-btn" :class="{ active: selectedLanguage === lang }" @click="selectedLanguage = lang">
                {{ lang }}
              </button>
            </div>
          </div>

          <div class="pp-settings-divider" />

          <button class="pp-logout-btn" @click="handleLogout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log out
          </button>
          <button class="pp-delete-btn" @click="deleteConfirm = true">Delete account</button>
        </div>
      </div>

    </div>

    <!-- Delete confirm overlay -->
    <div v-if="deleteConfirm" class="pp-overlay">
      <div class="pp-dialog">
        <div class="pp-dialog-title">Delete account?</div>
        <p class="pp-dialog-msg">This action is permanent. All your data will be deleted and cannot be recovered.</p>
        <div class="pp-dialog-actions">
          <button class="pp-btn-danger" @click="deleteConfirm = false">Yes, delete</button>
          <button class="pp-btn-ghost" @click="deleteConfirm = false">Cancel</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Auth store dependency removed — using self-contained mock data
const authUser = null

const props = defineProps({ userId: { type: String, default: null } })
const isOwnProfile = computed(() => !props.userId)

const profile = reactive({
  id: '1',
  name: authUser?.name || 'Yasmine Benali',
  city: 'Tunis',
  joinDate: '2023-03-15',
  kyc: true,
  trustScore: 4.7,
  reviewCount: 42,
  bio: 'Frequent traveler between Tunis and Paris. I take great care of packages and always communicate proactively. Available most weekends.',
  role: authUser?.role || 'traveler',
})

const editMode = ref(false)
const settingsOpen = ref(false)
const deleteConfirm = ref(false)
const selectedLanguage = ref('English')
const languages = ['English', 'Français', 'Arabic']

const editForm = reactive({ name: profile.name, city: profile.city, bio: profile.bio })

const initials = computed(() => profile.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2))
const joinDate = computed(() => new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))

const starBreakdown = [60, 25, 10, 4, 1]

const travelerStats = [
  { label: 'Trips',   value: '18' },
  { label: 'Earned',  value: '1,240 DT' },
  { label: 'Reviews', value: '42' },
]
const senderStats = [
  { label: 'Shipments', value: '11' },
  { label: 'Saved',     value: '38%' },
  { label: 'Avg rating', value: '4.5' },
]
const currentStats = computed(() => profile.role === 'traveler' ? travelerStats : senderStats)

const trustChips = [
  { label: 'Punctual',      count: 38 },
  { label: 'Careful',       count: 34 },
  { label: 'Communicative', count: 29 },
  { label: 'Friendly',      count: 27 },
  { label: 'Trustworthy',   count: 24 },
]

const tripStamps = [
  { code: 'CDG', city: 'Paris'  },
  { code: 'LHR', city: 'London' },
  { code: 'DXB', city: 'Dubai'  },
  { code: 'MRS', city: 'Marseille' },
  { code: 'BCN', city: 'Barcelona' },
  { code: 'FCO', city: 'Rome'   },
]

const favoriteRoutes = [
  { id: 1, from: 'Tunis', to: 'Paris',     count: 6 },
  { id: 2, from: 'Tunis', to: 'London',    count: 3 },
  { id: 3, from: 'Sfax',  to: 'Marseille', count: 2 },
]

const recentReviews = [
  { id: 1, name: 'Marie D.',  initials: 'MD', color: '#8485d0', rating: 5, comment: 'Super reliable, package arrived in perfect condition. Highly recommended!', date: 'Apr 10' },
  { id: 2, name: 'Karim B.',  initials: 'KB', color: '#2230a0', rating: 4, comment: 'Good communication, slight delay but handled professionally.', date: 'Mar 28' },
  { id: 3, name: 'Sophie L.', initials: 'SL', color: '#111',    rating: 5, comment: 'Perfect delivery, very careful with my fragile items.', date: 'Mar 14' },
]

const notifPrefs = reactive([
  { key: 'booking_updates', label: 'Booking updates', enabled: true  },
  { key: 'new_messages',    label: 'New messages',    enabled: true  },
  { key: 'trip_reminders',  label: 'Trip reminders',  enabled: true  },
  { key: 'promotions',      label: 'Promotions',      enabled: false },
])

function saveEdit() {
  profile.name = editForm.name
  profile.city = editForm.city
  profile.bio  = editForm.bio
  editMode.value = false
}

function handleLogout() {
  router.push('/')
}
</script>

<style scoped>
.pp-page { min-height: 100vh; background: #f0f0ee; font-family: 'Montserrat', sans-serif; padding-bottom: 32px; }

/* Hero */
.pp-hero { position: relative; height: 160px; background: #111; margin-bottom: 64px; overflow: visible; }
.pp-hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, #2230a0 0%, #111 70%); }
.pp-back-btn { position: absolute; top: 14px; left: 14px; z-index: 10; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.12); border: none; border-radius: 50%; color: #fff; cursor: pointer; transition: background 0.15s; }
.pp-back-btn:hover { background: rgba(255,255,255,0.22); }
.pp-edit-hero-btn { position: absolute; top: 14px; right: 14px; z-index: 10; display: flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.12); border: none; border-radius: 99px; padding: 7px 12px; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700; color: #fff; cursor: pointer; transition: background 0.15s; }
.pp-edit-hero-btn:hover { background: rgba(255,255,255,0.22); }
.pp-hero-content { position: absolute; bottom: -52px; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; z-index: 5; gap: 6px; }
.pp-avatar { width: 84px; height: 84px; border-radius: 50%; background: #2230a0; border: 4px solid #f0f0ee; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 900; color: #e8dfa0; box-shadow: 0 4px 16px rgba(0,0,0,0.18); }
.pp-name { font-size: 20px; font-weight: 900; color: #111; line-height: 1.1; }
.pp-meta { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: rgba(17,17,17,0.5); }
.pp-meta-sep { opacity: 0.4; }
.pp-kyc { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 800; letter-spacing: 0.06em; padding: 4px 10px; border-radius: 99px; }
.pp-kyc--ok { background: #d4d8f8; color: #2230a0; }
.pp-kyc--pending { background: rgba(17,17,17,0.1); color: rgba(17,17,17,0.55); }

.pp-body { padding: 16px; max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }

/* Card */
.pp-card { background: #fff; border-radius: 16px; border: 1.5px solid rgba(17,17,17,0.07); padding: 16px; }
.pp-card-title { font-size: 13px; font-weight: 800; color: #111; margin-bottom: 12px; }
.pp-card-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.pp-see-all { background: none; border: none; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: #2230a0; cursor: pointer; }

/* Edit card */
.pp-field-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; position: relative; }
.pp-label { font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(17,17,17,0.4); }
.pp-input { font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 600; color: #111; background: rgba(17,17,17,0.04); border: 1.5px solid transparent; border-radius: 8px; padding: 9px 10px; width: 100%; box-sizing: border-box; outline: none; transition: border-color 0.15s; }
.pp-input:focus { border-color: #2230a0; background: #fff; }
.pp-textarea { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 600; color: #111; background: rgba(17,17,17,0.04); border: 1.5px solid transparent; border-radius: 8px; padding: 10px; width: 100%; box-sizing: border-box; outline: none; resize: vertical; line-height: 1.5; transition: border-color 0.15s; }
.pp-textarea:focus { border-color: #2230a0; background: #fff; }
.pp-char-count { font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.35); align-self: flex-end; }
.pp-edit-actions { display: flex; gap: 10px; }
.pp-btn-primary { background: #2230a0; color: #e8dfa0; border: none; border-radius: 99px; padding: 10px 20px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 800; cursor: pointer; transition: background 0.15s; }
.pp-btn-primary:hover { background: #111; }
.pp-btn-ghost { background: transparent; border: 1.5px solid rgba(17,17,17,0.2); border-radius: 99px; padding: 10px 20px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: #111; cursor: pointer; }

/* Trust */
.pp-trust-row { display: flex; gap: 16px; align-items: flex-start; }
.pp-trust-left { display: flex; align-items: baseline; gap: 2px; }
.pp-trust-score { font-size: 48px; font-weight: 900; color: #111; letter-spacing: -0.04em; line-height: 1; }
.pp-trust-max { font-size: 20px; font-weight: 600; color: rgba(17,17,17,0.35); }
.pp-trust-right { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.pp-trust-stars { display: flex; gap: 3px; }
.pp-trust-reviews { font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.45); }
.pp-star-bars { display: flex; flex-direction: column; gap: 3px; }
.pp-star-row { display: flex; align-items: center; gap: 5px; }
.pp-star-lbl { font-size: 10px; font-weight: 700; color: rgba(17,17,17,0.5); width: 18px; }
.pp-star-bg { flex: 1; height: 6px; background: rgba(17,17,17,0.08); border-radius: 99px; overflow: hidden; }
.pp-star-fill { height: 100%; background: #2230a0; border-radius: 99px; }
.pp-star-pct { font-size: 10px; font-weight: 700; color: rgba(17,17,17,0.4); width: 26px; text-align: right; }

/* Stats */
.pp-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.pp-stat { background: #fff; border-radius: 14px; border: 1.5px solid rgba(17,17,17,0.07); padding: 14px 8px; text-align: center; display: flex; flex-direction: column; gap: 3px; }
.pp-stat-val { font-size: 18px; font-weight: 900; color: #2230a0; letter-spacing: -0.02em; }
.pp-stat-lbl { font-size: 9px; font-weight: 700; color: rgba(17,17,17,0.45); text-transform: uppercase; letter-spacing: 0.06em; }

/* Trust chips */
.pp-chips-row { display: flex; flex-wrap: wrap; gap: 8px; }
.pp-chip { display: flex; align-items: center; gap: 6px; background: rgba(34,48,160,0.07); border-radius: 99px; padding: 6px 12px; font-size: 11px; font-weight: 700; color: #2230a0; }
.pp-chip-count { background: #2230a0; color: #e8dfa0; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 99px; }

/* Passport stamps */
.pp-stamps-row { display: flex; gap: 10px; flex-wrap: wrap; }
.pp-stamp { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.pp-stamp-circle { width: 48px; height: 48px; border-radius: 50%; border: 2px dashed rgba(34,48,160,0.4); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; color: #2230a0; background: rgba(34,48,160,0.05); }
.pp-stamp-city { font-size: 9px; font-weight: 700; color: rgba(17,17,17,0.45); }

/* Bio */
.pp-bio { font-size: 13px; font-weight: 600; color: rgba(17,17,17,0.6); line-height: 1.65; margin: 0; }

/* Quick link */
.pp-quick-link { background: #fff; border-radius: 16px; border: 1.5px solid rgba(17,17,17,0.07); padding: 14px 16px; display: flex; align-items: center; gap: 12px; text-decoration: none; transition: border-color 0.15s; }
.pp-quick-link:hover { border-color: #2230a0; }
.pp-ql-title { font-size: 13px; font-weight: 800; color: #111; }
.pp-ql-sub { font-size: 11px; font-weight: 600; color: rgba(17,17,17,0.45); }
.pp-quick-link > :last-child { margin-left: auto; flex-shrink: 0; }

/* Sparkline */
.pp-sparkline-wrap { padding: 4px 0; }
.pp-sparkline { width: 100%; height: 56px; display: block; }
.pp-sparkline-labels { display: flex; justify-content: space-between; font-size: 9px; font-weight: 700; color: rgba(17,17,17,0.35); margin-top: 4px; }

/* Routes */
.pp-routes-list { display: flex; flex-wrap: wrap; gap: 8px; }
.pp-route-chip { display: flex; align-items: center; gap: 5px; background: rgba(17,17,17,0.05); border-radius: 99px; padding: 6px 12px; font-size: 11px; font-weight: 700; color: #111; }
.pp-route-count { font-size: 10px; color: rgba(17,17,17,0.45); font-weight: 600; }

/* Reviews */
.pp-reviews-card { padding: 16px 0; }
.pp-reviews-card .pp-card-hdr { padding: 0 16px; }
.pp-review { padding: 12px 16px; border-bottom: 1px solid rgba(17,17,17,0.06); }
.pp-review--last { border-bottom: none; }
.pp-review-hdr { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.pp-review-avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #fff; flex-shrink: 0; }
.pp-review-meta { flex: 1; }
.pp-review-name { font-size: 12px; font-weight: 800; color: #111; }
.pp-review-stars { display: flex; gap: 2px; margin-top: 2px; }
.pp-review-date { font-size: 10px; font-weight: 600; color: rgba(17,17,17,0.4); }
.pp-review-comment { font-size: 12px; font-weight: 600; color: rgba(17,17,17,0.6); line-height: 1.5; margin: 0; }

/* Settings */
.pp-settings-card { padding: 0; overflow: hidden; }
.pp-settings-toggle { display: flex; align-items: center; gap: 8px; width: 100%; padding: 16px; background: none; border: none; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; color: #111; cursor: pointer; text-align: left; transition: background 0.15s; }
.pp-settings-toggle:hover { background: rgba(17,17,17,0.03); }
.pp-caret { margin-left: auto; transition: transform 0.2s; }
.pp-caret.open { transform: rotate(180deg); }
.pp-settings-body { border-top: 1px solid rgba(17,17,17,0.07); padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.pp-settings-section { display: flex; flex-direction: column; gap: 8px; }
.pp-settings-label { font-size: 9px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(17,17,17,0.38); }
.pp-settings-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; font-weight: 600; color: #111; }
.pp-settings-divider { height: 1px; background: rgba(17,17,17,0.07); }
.pp-toggle-wrap { cursor: pointer; }
.pp-toggle-input { display: none; }
.pp-toggle { display: block; width: 36px; height: 20px; background: rgba(17,17,17,0.15); border-radius: 99px; position: relative; transition: background 0.15s; }
.pp-toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; background: #fff; border-radius: 50%; transition: transform 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,0.25); }
.pp-toggle-input:checked + .pp-toggle { background: #2230a0; }
.pp-toggle-input:checked + .pp-toggle::after { transform: translateX(16px); }
.pp-lang-row { display: flex; gap: 8px; }
.pp-lang-btn { background: rgba(17,17,17,0.05); border: 1.5px solid transparent; border-radius: 99px; padding: 7px 14px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: rgba(17,17,17,0.55); cursor: pointer; transition: all 0.15s; }
.pp-lang-btn.active { background: #2230a0; border-color: #2230a0; color: #e8dfa0; }
.pp-logout-btn { display: flex; align-items: center; gap: 8px; background: transparent; border: 1.5px solid rgba(17,17,17,0.2); border-radius: 10px; padding: 11px 16px; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700; color: #111; cursor: pointer; transition: all 0.15s; }
.pp-logout-btn:hover { border-color: #111; background: rgba(17,17,17,0.04); }
.pp-delete-btn { background: none; border: none; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: rgba(180,30,30,0.7); cursor: pointer; align-self: center; }
.pp-delete-btn:hover { color: #b41e1e; }

/* Overlay / dialog */
.pp-overlay { position: fixed; inset: 0; background: rgba(17,17,17,0.55); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 24px; }
.pp-dialog { background: #fff; border-radius: 20px; padding: 24px; max-width: 340px; width: 100%; }
.pp-dialog-title { font-size: 18px; font-weight: 900; color: #111; margin-bottom: 10px; }
.pp-dialog-msg { font-size: 13px; font-weight: 600; color: rgba(17,17,17,0.6); line-height: 1.6; margin: 0 0 20px; }
.pp-dialog-actions { display: flex; gap: 10px; }
.pp-btn-danger { background: #b41e1e; color: #fff; border: none; border-radius: 99px; padding: 10px 20px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 800; cursor: pointer; }

@media (min-width: 768px) {
  .pp-body { padding: 16px 24px; }
}
</style>
