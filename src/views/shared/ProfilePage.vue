<template>
  <div class="profile-page">
    <header class="profile-topbar">
      <button class="icon-btn" @click="router.back()" aria-label="Back">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <router-link to="/" class="wordmark">CarryIt</router-link>
      <button v-if="isLoggedIn" class="topbar-action" @click="editMode = !editMode">
        {{ editMode ? 'Close' : 'Edit' }}
      </button>
    </header>

    <main v-if="!isLoggedIn" class="guest-safe">
      <div class="guest-ticket">
        <span class="guest-stamp">Private</span>
        <h1>Sign in to view your profile.</h1>
        <p>Reviews, ratings, earnings, and achievement stamps are only visible to authenticated CarryIt members.</p>
        <router-link to="/auth/signin" class="primary-cta">Sign in</router-link>
      </div>
    </main>

    <main v-else class="profile-shell">
      <section class="passport-hero">
        <div class="hero-copy">
          <span class="eyebrow">Member passport</span>
          <h1>{{ profile.name }}</h1>
          <div class="hero-meta">
            <span>{{ roleLabel }}</span>
            <span>{{ profile.city || 'Home city pending' }}</span>
            <span>Since {{ joinDate }}</span>
          </div>
        </div>

        <div class="passport-card">
          <div class="passport-ridge"></div>
          <div class="passport-avatar" :style="{ background: avatarGradient }">
            {{ initials }}
          </div>
          <div class="passport-identity">
            <span class="passport-label">CarryIt ID</span>
            <strong>{{ profile.name }}</strong>
            <span>{{ profile.email }}</span>
          </div>
          <div class="passport-rating">
            <div class="stars" aria-label="User rating">
              <svg v-for="n in 5" :key="n" width="15" height="15" viewBox="0 0 24 24" :fill="n <= roundedRating ? '#d4a418' : 'none'" stroke="#d4a418" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <strong>{{ ratingLabel }}</strong>
            <span>{{ reviewCount }} verified reviews</span>
          </div>
          <div class="verified-stamp" :class="{ pending: profile.kycStatus !== 'approved' }">
            {{ profile.kycStatus === 'approved' ? 'ID verified' : 'Pending review' }}
          </div>
        </div>
      </section>

      <transition name="slide-up">
        <section v-if="editMode" class="edit-panel">
          <div class="section-heading">
            <span>Edit profile</span>
            <small>Demo changes are saved locally</small>
          </div>
          <div class="edit-grid">
            <label>
              Full name
              <input v-model="editForm.name" class="text-input" />
            </label>
            <label>
              City
              <input v-model="editForm.city" class="text-input" />
            </label>
            <label class="wide">
              About
              <textarea v-model="editForm.bio" class="text-input text-area" maxlength="300"></textarea>
            </label>
          </div>
          <div class="edit-actions">
            <button class="primary-cta" @click="saveEdit">Save changes</button>
            <button class="ghost-cta" @click="editMode = false">Cancel</button>
          </div>
        </section>
      </transition>

      <section class="metrics-grid">
        <article v-for="metric in metrics" :key="metric.label" class="metric-card">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.caption }}</small>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel rating-panel">
          <div class="section-heading">
            <span>User rating</span>
            <small>Community trust signal</small>
          </div>
          <div class="rating-main">
            <strong>{{ ratingLabel }}</strong>
            <div>
              <div class="stars">
                <svg v-for="n in 5" :key="n" width="18" height="18" viewBox="0 0 24 24" :fill="n <= roundedRating ? '#cf3a2c' : 'none'" stroke="#cf3a2c" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <p>{{ reviewCount }} reviews from completed deliveries</p>
            </div>
          </div>
          <div class="rating-bars">
            <div v-for="row in ratingBreakdown" :key="row.stars" class="rating-row">
              <span>{{ row.stars }} star</span>
              <div><i :style="{ width: row.percent + '%' }"></i></div>
              <b>{{ row.percent }}%</b>
            </div>
          </div>
        </article>

        <article class="panel earnings-panel">
          <div class="section-heading">
            <span>{{ profile.role === 'traveler' ? 'Earnings' : 'Shipping value' }}</span>
            <small>{{ profile.role === 'traveler' ? 'Private wallet summary' : 'Private booking summary' }}</small>
          </div>
          <div class="lcd-total">
            <span>{{ profile.role === 'traveler' ? 'Total earned' : 'Total shipped' }}</span>
            <strong>{{ money(totalValue) }}</strong>
          </div>
          <div class="spark-bars">
            <span v-for="bar in earningsBars" :key="bar.month" :style="{ height: bar.height + '%' }">
              <i>{{ bar.month }}</i>
            </span>
          </div>
        </article>

        <article class="panel about-panel">
          <div class="section-heading">
            <span>About</span>
            <small>Profile notes</small>
          </div>
          <p>{{ profile.bio || 'No bio yet.' }}</p>
          <div class="chip-cloud">
            <span v-for="chip in trustChips" :key="chip">{{ chip }}</span>
          </div>
        </article>
      </section>

      <section class="passport-section">
        <div class="section-heading">
          <span>Passport stamps</span>
          <small>Journey log, unlocked routes, and travel keepsakes</small>
        </div>
        <div
          class="passport-stage"
          :style="passportTilt"
          @pointermove="handlePassportMove"
          @pointerleave="resetPassportTilt"
        >
          <div class="passport-glow" />
          <img class="passport-base" src="/assets/passport-spread.png" alt="Open passport pages" />
          <div class="passport-shadow-page passport-shadow-page--left" />
          <div class="passport-shadow-page passport-shadow-page--right" />
          <div class="passport-fold" />

          <button class="stamp-replay" type="button" @click="replayStampUnlock">
            Replay stamp
          </button>

          <article
            v-for="(stamp, index) in passportStamps"
            :key="stamp.code"
            class="passport-stamp"
            :class="[
              { 'passport-stamp--image': stamp.image, 'is-new': index === unlockedStampIndex && stampSequenceKey > 0 },
              `passport-stamp--${index + 1}`,
            ]"
            :style="stampStyle(stamp, index)"
          >
            <span v-if="index === unlockedStampIndex" class="stamp-impact-ring" />
            <img v-if="stamp.image" class="passport-stamp-img" :src="stamp.image" :alt="`${stamp.title} stamp`" />
            <div v-else class="passport-stamp-mark">
              <span>{{ stamp.code }}</span>
              <small>{{ stamp.kind }}</small>
            </div>
            <div class="passport-stamp-copy">
              <strong>{{ stamp.title }}</strong>
              <span>{{ stamp.caption }}</span>
            </div>
            <b>{{ stamp.date }}</b>
          </article>

          <div class="passport-note passport-note--left">
            <span>Collected</span>
            <strong>{{ passportStamps.length }}</strong>
            <small>travel memories</small>
          </div>
          <div class="passport-note passport-note--right">
            <span>Next route</span>
            <strong>{{ profile.role === 'traveler' ? 'BRU' : 'TUN' }}</strong>
            <small>stamp pending</small>
          </div>
        </div>
      </section>

      <section class="reviews-section">
        <div class="section-heading">
          <span>Recent reviews</span>
          <small>Only visible to signed-in users</small>
        </div>
        <div class="reviews-list">
          <article v-for="review in reviews" :key="review.id" class="review-card">
            <div class="review-avatar" :style="{ background: review.color }">{{ review.initials }}</div>
            <div>
              <div class="review-top">
                <strong>{{ review.name }}</strong>
                <span>{{ review.date }}</span>
              </div>
              <div class="stars small">
                <svg v-for="n in 5" :key="n" width="13" height="13" viewBox="0 0 24 24" :fill="n <= review.rating ? '#d4a418' : 'none'" stroke="#d4a418" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <p>{{ review.comment }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="quick-actions">
        <router-link :to="profile.role === 'traveler' ? '/traveler/trips' : '/sender/bookings'" class="action-ticket">
          <span>{{ profile.role === 'traveler' ? 'My trips' : 'My bookings' }}</span>
          <b>Open</b>
        </router-link>
        <router-link to="/chat" class="action-ticket">
          <span>Messages</span>
          <b>Open</b>
        </router-link>
        <button class="action-ticket logout" @click="handleLogout">
          <span>Session</span>
          <b>Log out</b>
        </button>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { mockBookings, mockTrips } from '@/data/mock.js'

const router = useRouter()
const authStore = useAuthStore()
const editMode = ref(false)
const passportTilt = reactive({ '--tilt-x': '0deg', '--tilt-y': '0deg', '--glow-x': '50%', '--glow-y': '50%' })
const stampSequenceKey = ref(0)
const unlockedStampIndex = ref(2)

const isLoggedIn = computed(() => authStore.isLoggedIn)
const profile = computed(() => authStore.user || {})

const editForm = reactive({ name: '', city: '', bio: '' })

watch(
  profile,
  (user) => {
    editForm.name = user.name || ''
    editForm.city = user.city || ''
    editForm.bio = user.bio || ''
  },
  { immediate: true }
)

const roleLabel = computed(() => profile.value.role === 'traveler' ? 'Verified traveler' : 'Trusted sender')
const initials = computed(() => {
  const name = profile.value.name || profile.value.email || 'CarryIt'
  return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)
})
const joinDate = computed(() => {
  if (!profile.value.joinedDate) return '2026'
  return new Date(profile.value.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
})
const avatarGradient = computed(() => profile.value.role === 'traveler'
  ? 'linear-gradient(135deg, #171a3a, #2c6e7f)'
  : 'linear-gradient(135deg, #cf3a2c, #d4a418)'
)

const userBookings = computed(() => mockBookings.filter(booking =>
  booking.travelerId === profile.value.id || booking.senderId === profile.value.id
))
const deliveredBookings = computed(() => userBookings.value.filter(booking => booking.status === 'delivered' || booking.status === 'accepted' || booking.status === 'in_transit'))
const totalValue = computed(() => {
  if (profile.value.role === 'traveler') {
    const mockTotal = deliveredBookings.value.reduce((sum, booking) => sum + (booking.travelerPayout || 0), 0)
    return profile.value.totalEarnings || mockTotal
  }
  return userBookings.value.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)
})

const reviewCount = computed(() => Math.max(3, profile.value.totalTrips || profile.value.totalBookings || deliveredBookings.value.length))
const ratingLabel = computed(() => Number(profile.value.trustScore || 4.7).toFixed(1))
const roundedRating = computed(() => Math.round(Number(profile.value.trustScore || 4.7)))

const metrics = computed(() => {
  if (profile.value.role === 'traveler') {
    return [
      { label: 'Trips', value: profile.value.totalTrips || deliveredBookings.value.length, caption: 'Completed routes' },
      { label: 'Earned', value: money(totalValue.value), caption: 'Private total' },
      { label: 'Rating', value: ratingLabel.value, caption: `${reviewCount.value} reviews` },
    ]
  }

  return [
    { label: 'Bookings', value: profile.value.totalBookings || userBookings.value.length, caption: 'Shipments created' },
    { label: 'Shipped', value: money(totalValue.value), caption: 'Private total' },
    { label: 'Rating', value: ratingLabel.value, caption: `${reviewCount.value} reviews` },
  ]
})

const ratingBreakdown = [
  { stars: 5, percent: 72 },
  { stars: 4, percent: 20 },
  { stars: 3, percent: 6 },
  { stars: 2, percent: 2 },
]

const earningsBars = [
  { month: 'Jan', height: 42 },
  { month: 'Feb', height: 34 },
  { month: 'Mar', height: 58 },
  { month: 'Apr', height: 76 },
  { month: 'May', height: 64 },
  { month: 'Jun', height: 88 },
]

const trustChips = computed(() => profile.value.role === 'traveler'
  ? ['Punctual', 'Careful packaging', 'Airport fluent', 'Fast replies', 'Customs aware']
  : ['Clear pickup notes', 'Fast handoff', 'Verified sender', 'Careful packing']
)

const passportStamps = computed(() => {
  const trips = mockTrips.filter(trip => trip.travelerId === profile.value.id)
  const featuredStamps = [
    { code: 'LON', kind: 'earned', title: 'London stamp', caption: 'Postage revenue collector badge', date: 'UK', image: '/assets/stamp-london-cutout.png', x: 12, y: 17, rotate: -8, size: 31 },
    { code: 'CAI', kind: 'earned', title: 'Cairo stamp', caption: 'Pyramids of Giza route badge', date: 'Egypt', image: '/assets/stamp-cairo-cutout.png', x: 52, y: 12, rotate: 7, size: 24 },
    { code: 'ROM', kind: 'earned', title: 'Roma stamp', caption: 'Colosseum route badge', date: 'Italy', image: '/assets/stamp-roma-cutout.png', x: 58, y: 46, rotate: -5, size: 27 },
  ]
  const routeStamps = trips.slice(0, 2).map(trip => ({
    code: cityCode(trip.destination),
    kind: trip.transportMode,
    title: `${trip.origin} to ${trip.destination}`,
    caption: `${trip.availableKg} kg capacity cleared`,
    date: new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    x: cityCode(trip.destination) === 'LYS' ? 20 : 36,
    y: cityCode(trip.destination) === 'LYS' ? 54 : 35,
    rotate: cityCode(trip.destination) === 'LYS' ? 9 : -11,
    size: 17,
  }))

  return [
    ...featuredStamps,
    ...routeStamps,
    { code: 'KYC', kind: 'verified', title: 'Identity cleared', caption: 'Passport-grade trust check', date: 'Verified' },
    { code: 'TOP', kind: 'rating', title: 'Top rated route', caption: `${ratingLabel.value} community score`, date: 'Live' },
  ].slice(0, 6)
})

const reviews = [
  { id: 1, name: 'Marie Laurent', initials: 'ML', color: '#171a3a', rating: 5, date: 'Apr 10', comment: 'Precise pickup, clear updates, and the package arrived in perfect condition.' },
  { id: 2, name: 'Karim Bensaid', initials: 'KB', color: '#cf3a2c', rating: 5, date: 'Mar 28', comment: 'Smooth handoff and very polished communication throughout the route.' },
  { id: 3, name: 'Sofia Moreno', initials: 'SM', color: '#2c6e7f', rating: 4, date: 'Mar 14', comment: 'Reliable and careful. The delivery felt secure from pickup to arrival.' },
]

function cityCode(city = '') {
  const map = { Paris: 'CDG', Lyon: 'LYS', Tunis: 'TUN', Madrid: 'MAD', Brussels: 'BRU', London: 'LHR', Milan: 'MXP', Barcelona: 'BCN' }
  return map[city] || city.slice(0, 3).toUpperCase() || 'TRP'
}

function money(value) {
  return `${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} DT`
}

function stampStyle(stamp, index) {
  return {
    '--stamp-x': `${stamp.x ?? 18 + index * 12}%`,
    '--stamp-y': `${stamp.y ?? 20 + index * 9}%`,
    '--stamp-rotate': `${stamp.rotate ?? 0}deg`,
    '--stamp-size': `${stamp.size ?? 20}%`,
    '--stamp-delay': `${index * 120}ms`,
    '--stamp-key': stampSequenceKey.value,
  }
}

function handlePassportMove(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height
  passportTilt['--tilt-y'] = `${(x - 0.5) * 5}deg`
  passportTilt['--tilt-x'] = `${(0.5 - y) * 4}deg`
  passportTilt['--glow-x'] = `${x * 100}%`
  passportTilt['--glow-y'] = `${y * 100}%`
}

function resetPassportTilt() {
  passportTilt['--tilt-x'] = '0deg'
  passportTilt['--tilt-y'] = '0deg'
  passportTilt['--glow-x'] = '50%'
  passportTilt['--glow-y'] = '50%'
}

function replayStampUnlock() {
  stampSequenceKey.value += 1
}

function saveEdit() {
  authStore.setUser({ ...profile.value, name: editForm.name, city: editForm.city, bio: editForm.bio })
  editMode.value = false
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 18% 8%, rgba(212,164,24,.12) 0%, transparent 48%),
    radial-gradient(ellipse at 82% 18%, rgba(207,58,44,.09) 0%, transparent 44%),
    repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(23,26,58,.03) 3px, rgba(23,26,58,.03) 4px),
    #f1e7d0;
  color: #171a3a;
  font-family: 'Montserrat', sans-serif;
}

.profile-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 62px;
  padding: 0 18px;
  background: #111;
  color: #f7f0dc;
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 2px solid rgba(247,240,220,.08);
}

.icon-btn {
  width: 38px;
  height: 38px;
  border: 1.5px solid rgba(247,240,220,.22);
  background: rgba(247,240,220,.08);
  color: #f7f0dc;
  border-radius: 999px;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.wordmark {
  flex: 1;
  color: #e8dfa0;
  font-weight: 900;
  font-size: 18px;
  text-decoration: none;
}

.topbar-action {
  border: 1.5px solid #e8dfa0;
  background: transparent;
  color: #e8dfa0;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.profile-shell {
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 40px;
}

.passport-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 440px);
  gap: 24px;
  align-items: stretch;
  margin-bottom: 18px;
}

.hero-copy {
  min-height: 270px;
  border: 2px solid #171a3a;
  background: #f7f0dc;
  box-shadow: 6px 6px 0 #171a3a;
  padding: clamp(24px, 4vw, 42px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  overflow: hidden;
}

.hero-copy::after {
  content: 'CI';
  position: absolute;
  top: 20px;
  right: 22px;
  font-size: 110px;
  line-height: 1;
  font-weight: 900;
  color: rgba(207,58,44,.08);
  transform: rotate(-8deg);
}

.eyebrow,
.section-heading small,
.passport-label,
.metric-card span,
.lcd-total span {
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.eyebrow {
  width: fit-content;
  border: 2px solid #171a3a;
  border-radius: 999px;
  padding: 7px 13px;
  background: #f1e7d0;
  color: #cf3a2c;
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 18px;
}

.hero-copy h1 {
  margin: 0;
  max-width: 720px;
  font-size: clamp(42px, 7vw, 88px);
  line-height: .95;
  letter-spacing: 0;
  font-weight: 900;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.hero-meta span {
  border: 1.5px solid rgba(23,26,58,.22);
  background: rgba(255,255,255,.46);
  border-radius: 999px;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 800;
}

.passport-card,
.panel,
.edit-panel,
.passport-section,
.reviews-section,
.guest-ticket {
  border: 2px solid #171a3a;
  background: #faf6ec;
  box-shadow: 5px 5px 0 #171a3a;
}

.passport-card {
  position: relative;
  overflow: hidden;
  padding: 24px;
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 18px;
  align-content: start;
  isolation: isolate;
}

.passport-card::before {
  content: '';
  position: absolute;
  inset: 14px;
  border: 1.5px dashed rgba(23,26,58,.24);
  pointer-events: none;
}

.passport-ridge {
  position: absolute;
  inset: 0 auto 0 0;
  width: 14px;
  background: repeating-linear-gradient(180deg, #cf3a2c 0 12px, #171a3a 12px 24px, #d4a418 24px 36px);
}

.passport-avatar {
  width: 110px;
  height: 130px;
  color: #f7f0dc;
  border: 2px solid #171a3a;
  display: grid;
  place-items: center;
  font-size: 34px;
  font-weight: 900;
  box-shadow: 3px 3px 0 #171a3a;
}

.passport-identity {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.passport-label,
.section-heading small,
.metric-card span,
.lcd-total span {
  font-size: 10px;
  color: rgba(23,26,58,.58);
  font-weight: 700;
}

.passport-identity strong {
  font-size: 24px;
  line-height: 1.05;
}

.passport-identity span:last-child {
  color: rgba(23,26,58,.62);
  font-size: 13px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.passport-rating {
  grid-column: 1 / -1;
  border-top: 1.5px dashed rgba(23,26,58,.24);
  padding-top: 18px;
  display: grid;
  gap: 6px;
}

.stars {
  display: flex;
  gap: 3px;
  align-items: center;
}

.stars.small {
  margin: 3px 0 6px;
}

.passport-rating strong {
  font-size: 40px;
  line-height: 1;
}

.passport-rating span {
  color: rgba(23,26,58,.56);
  font-size: 12px;
  font-weight: 700;
}

.verified-stamp {
  position: absolute;
  right: 22px;
  bottom: 20px;
  color: #cf3a2c;
  border: 2px solid currentColor;
  padding: 8px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .08em;
  transform: rotate(-5deg);
}

.verified-stamp.pending {
  color: #9b7a28;
}

.edit-panel,
.passport-section,
.reviews-section {
  padding: 20px;
  margin-bottom: 18px;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.section-heading span {
  font-size: 18px;
  font-weight: 900;
}

.edit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.edit-grid label {
  display: grid;
  gap: 7px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.edit-grid .wide {
  grid-column: 1 / -1;
}

.text-input {
  width: 100%;
  border: 1.5px solid #171a3a;
  background: #fffaf0;
  padding: 13px 14px;
  color: #171a3a;
  font-size: 14px;
  font-weight: 700;
  outline: none;
}

.text-input:focus {
  box-shadow: 3px 3px 0 #cf3a2c;
}

.text-area {
  min-height: 98px;
  resize: vertical;
  line-height: 1.5;
}

.edit-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.primary-cta,
.ghost-cta {
  border: 2px solid #171a3a;
  box-shadow: 3px 3px 0 #171a3a;
  padding: 12px 18px;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .08em;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  justify-content: center;
}

.primary-cta {
  background: #171a3a;
  color: #f7f0dc;
}

.ghost-cta {
  background: #f7f0dc;
  color: #171a3a;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.metric-card {
  border: 2px solid #171a3a;
  background: #f7f0dc;
  box-shadow: 4px 4px 0 #171a3a;
  padding: 17px;
  display: grid;
  gap: 7px;
}

.metric-card strong {
  font-size: clamp(26px, 5vw, 42px);
  line-height: .95;
}

.metric-card small {
  font-size: 12px;
  color: rgba(23,26,58,.58);
  font-weight: 700;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 18px;
  margin-bottom: 18px;
}

.panel {
  padding: 20px;
}

.about-panel {
  grid-column: 1 / -1;
}

.rating-main {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.rating-main > strong {
  font-size: 68px;
  line-height: .9;
}

.rating-main p,
.about-panel p,
.review-card p {
  margin: 0;
  color: rgba(23,26,58,.66);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
}

.rating-bars {
  display: grid;
  gap: 8px;
}

.rating-row {
  display: grid;
  grid-template-columns: 52px 1fr 38px;
  gap: 9px;
  align-items: center;
  font-size: 11px;
  font-weight: 800;
}

.rating-row div {
  height: 9px;
  border: 1.5px solid #171a3a;
  background: #f1e7d0;
}

.rating-row i {
  display: block;
  height: 100%;
  background: #cf3a2c;
}

.lcd-total {
  border: 2px solid #171a3a;
  background: #141914;
  color: #e2c883;
  box-shadow: inset 0 0 30px rgba(0,0,0,.45);
  padding: 18px;
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.lcd-total::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,.18) 2px, rgba(0,0,0,.18) 3px);
  pointer-events: none;
}

.lcd-total strong {
  font-family: 'VT323', monospace;
  font-size: 54px;
  letter-spacing: .04em;
  line-height: .9;
}

.spark-bars {
  height: 108px;
  display: flex;
  align-items: end;
  gap: 9px;
}

.spark-bars span {
  flex: 1;
  min-height: 24px;
  background: linear-gradient(180deg, #d4a418, #cf3a2c);
  border: 1.5px solid #171a3a;
  position: relative;
}

.spark-bars i {
  position: absolute;
  left: 50%;
  bottom: -20px;
  transform: translateX(-50%);
  font-style: normal;
  font-size: 10px;
  font-weight: 800;
  color: rgba(23,26,58,.55);
}

.chip-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.chip-cloud span {
  border: 1.5px solid #171a3a;
  background: #f1e7d0;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.passport-stage {
  position: relative;
  width: min(900px, 100%);
  margin: 8px auto 0;
  aspect-ratio: 1.52 / 1;
  perspective: 1200px;
  transform: rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
  transition: transform 420ms cubic-bezier(.2,.8,.2,1);
  transform-style: preserve-3d;
  isolation: isolate;
}

.passport-glow {
  position: absolute;
  inset: -8%;
  background: radial-gradient(circle at var(--glow-x) var(--glow-y), rgba(255,255,255,.46), transparent 34%);
  filter: blur(10px);
  opacity: .75;
  pointer-events: none;
  z-index: 1;
}

.passport-base {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 2;
  filter: drop-shadow(0 24px 34px rgba(23,26,58,.24));
  animation: passportFloat 7s ease-in-out infinite;
}

.passport-shadow-page {
  position: absolute;
  z-index: 1;
  top: 10%;
  bottom: 8%;
  width: 44%;
  border-radius: 18px;
  background: rgba(23,26,58,.11);
  filter: blur(28px);
}

.passport-shadow-page--left { left: 4%; transform: rotate(-2deg); }
.passport-shadow-page--right { right: 4%; transform: rotate(2deg); }

.passport-fold {
  position: absolute;
  z-index: 4;
  top: 8%;
  bottom: 7%;
  left: 49.7%;
  width: 2.4%;
  background: linear-gradient(90deg, transparent, rgba(23,26,58,.22), rgba(255,255,255,.24), transparent);
  filter: blur(.4px);
  pointer-events: none;
}

.stamp-replay {
  position: absolute;
  z-index: 12;
  top: 8%;
  right: 8%;
  border: 1.5px solid rgba(23,26,58,.48);
  background: rgba(250,246,236,.82);
  color: #171a3a;
  box-shadow: 2px 2px 0 rgba(23,26,58,.42);
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.passport-stamp {
  position: absolute;
  z-index: 6;
  left: var(--stamp-x);
  top: var(--stamp-y);
  width: var(--stamp-size);
  min-width: 96px;
  color: #cf3a2c;
  transform: translate3d(0,0,34px) rotate(var(--stamp-rotate));
  filter: drop-shadow(0 10px 9px rgba(23,26,58,.22));
  animation:
    stampDrift 6s ease-in-out infinite,
    stampSettle 720ms cubic-bezier(.18,.9,.18,1.08) both;
  animation-delay: calc(var(--stamp-delay)), calc(var(--stamp-delay));
  transform-origin: 50% 55%;
}

.passport-stamp--image {
  padding: 0;
}

.passport-stamp-img {
  width: 100%;
  display: block;
  object-fit: contain;
  filter: saturate(.96) contrast(1.02);
}

.passport-stamp-copy,
.passport-stamp b {
  position: absolute;
  left: 10%;
  right: 10%;
  opacity: 0;
  pointer-events: none;
}

.passport-stamp-copy {
  bottom: -34px;
  display: grid;
  gap: 2px;
  color: #171a3a;
  text-shadow: 0 1px 0 rgba(250,246,236,.9);
}

.passport-stamp-copy strong {
  font-size: 11px;
  line-height: 1.1;
}

.passport-stamp-copy span {
  font-size: 9px;
  color: rgba(23,26,58,.6);
  font-weight: 800;
  line-height: 1.25;
}

.passport-stamp:hover {
  z-index: 10;
  filter: drop-shadow(0 18px 16px rgba(23,26,58,.28));
}

.passport-stamp:hover .passport-stamp-copy,
.passport-stamp:hover b {
  opacity: 1;
}

.passport-stamp.is-new {
  animation:
    stampPress 1300ms cubic-bezier(.18,.9,.18,1.08) both,
    stampDrift 6s ease-in-out 1500ms infinite;
}

.stamp-impact-ring {
  position: absolute;
  inset: 7%;
  border: 2px solid rgba(207,58,44,.75);
  border-radius: 12px;
  opacity: 0;
  transform: scale(.8);
  animation: stampRing 1300ms cubic-bezier(.2,.8,.2,1) both;
  pointer-events: none;
}

.passport-stamp-mark {
  width: 100%;
  aspect-ratio: 1 / .72;
  border: 2px solid currentColor;
  display: grid;
  place-items: center;
  align-content: center;
  background: rgba(250,246,236,.32);
  box-shadow: inset 0 0 0 2px rgba(250,246,236,.35);
}

.passport-stamp-mark span {
  font-size: clamp(18px, 3vw, 32px);
  font-weight: 900;
  line-height: 1;
}

.passport-stamp-mark small,
.passport-stamp b {
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: .08em;
  font-size: 9px;
  font-weight: 800;
}

.passport-note {
  position: absolute;
  z-index: 5;
  border: 1.5px dashed rgba(23,26,58,.34);
  background: rgba(250,246,236,.36);
  color: rgba(23,26,58,.68);
  padding: 10px 12px;
  display: grid;
  gap: 2px;
  backdrop-filter: blur(1px);
}

.passport-note span,
.passport-note small {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: .08em;
  font-weight: 800;
}

.passport-note strong {
  font-size: 26px;
  line-height: .9;
  color: #171a3a;
}

.passport-note--left {
  left: 13%;
  bottom: 13%;
  transform: rotate(-4deg);
}

.passport-note--right {
  right: 16%;
  bottom: 15%;
  transform: rotate(3deg);
}

@keyframes passportFloat {
  0%, 100% { transform: translateY(0) rotate(.08deg); }
  50% { transform: translateY(-5px) rotate(-.08deg); }
}

@keyframes stampSettle {
  0% { opacity: 0; transform: translate3d(0,-28px,90px) rotate(calc(var(--stamp-rotate) - 8deg)) scale(1.08); }
  70% { opacity: 1; transform: translate3d(0,2px,34px) rotate(var(--stamp-rotate)) scale(.98); }
  100% { opacity: 1; transform: translate3d(0,0,34px) rotate(var(--stamp-rotate)) scale(1); }
}

@keyframes stampPress {
  0% { opacity: 0; transform: translate3d(0,-110px,180px) rotate(calc(var(--stamp-rotate) - 12deg)) scale(1.35); filter: drop-shadow(0 34px 24px rgba(23,26,58,.2)); }
  48% { opacity: 1; transform: translate3d(0,3px,24px) rotate(var(--stamp-rotate)) scale(.92); filter: drop-shadow(0 2px 2px rgba(23,26,58,.24)); }
  62% { transform: translate3d(0,-8px,70px) rotate(calc(var(--stamp-rotate) + 1deg)) scale(1.03); }
  100% { opacity: 1; transform: translate3d(0,0,34px) rotate(var(--stamp-rotate)) scale(1); filter: drop-shadow(0 10px 9px rgba(23,26,58,.22)); }
}

@keyframes stampRing {
  0%, 34% { opacity: 0; transform: scale(.68); }
  45% { opacity: .9; transform: scale(.86); }
  100% { opacity: 0; transform: scale(1.28); }
}

@keyframes stampDrift {
  0%, 100% { margin-top: 0; }
  50% { margin-top: -4px; }
}

.reviews-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.review-card {
  border: 1.5px solid #171a3a;
  background: #f7f0dc;
  padding: 15px;
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 12px;
}

.review-avatar {
  width: 42px;
  height: 42px;
  border: 1.5px solid #171a3a;
  color: #fffaf0;
  display: grid;
  place-items: center;
  font-weight: 900;
}

.review-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.review-top strong {
  font-size: 13px;
}

.review-top span {
  font-size: 10px;
  font-weight: 800;
  color: rgba(23,26,58,.48);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.action-ticket {
  border: 2px solid #171a3a;
  background: #171a3a;
  color: #f7f0dc;
  padding: 16px;
  min-height: 82px;
  box-shadow: 4px 4px 0 #cf3a2c;
  text-decoration: none;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
}

.action-ticket span {
  font-size: 13px;
  font-weight: 800;
}

.action-ticket b {
  color: #e8dfa0;
  text-transform: uppercase;
  letter-spacing: .08em;
  font-size: 11px;
}

.action-ticket.logout {
  font-family: inherit;
  text-align: left;
}

.guest-safe {
  width: min(520px, calc(100% - 32px));
  margin: 70px auto;
}

.guest-ticket {
  padding: 28px;
  display: grid;
  gap: 14px;
}

.guest-ticket h1 {
  margin: 0;
  font-size: 36px;
  line-height: 1;
  letter-spacing: 0;
}

.guest-ticket p {
  margin: 0;
  color: rgba(23,26,58,.66);
  font-weight: 600;
  line-height: 1.6;
}

.guest-stamp {
  width: fit-content;
  color: #cf3a2c;
  border: 2px solid currentColor;
  padding: 7px 12px;
  text-transform: uppercase;
  font-weight: 900;
  letter-spacing: .1em;
  transform: rotate(-4deg);
}

@media (max-width: 860px) {
  .passport-hero,
  .content-grid,
  .reviews-list {
    grid-template-columns: 1fr;
  }

  .passport-stage {
    width: 100%;
  }
}

@media (max-width: 620px) {
  .profile-shell {
    width: calc(100% - 24px);
    padding-top: 18px;
  }

  .passport-hero,
  .metrics-grid,
  .quick-actions,
  .edit-grid {
    grid-template-columns: 1fr;
  }

  .passport-section {
    padding: 14px;
  }

  .passport-stage {
    aspect-ratio: 1.25 / 1;
  }

  .passport-stamp {
    min-width: 68px;
  }

  .passport-stamp--1 { width: 30%; left: 9%; top: 18%; }
  .passport-stamp--2 { width: 25%; left: 54%; top: 13%; }
  .passport-stamp--3 { width: 28%; left: 56%; top: 48%; }
  .passport-stamp--4,
  .passport-stamp--5,
  .passport-stamp--6 { width: 20%; }

  .passport-note {
    display: none;
  }

  .stamp-replay {
    top: 4%;
    right: 5%;
    padding: 7px 10px;
  }

  .hero-copy {
    min-height: 230px;
    padding: 24px;
  }

  .passport-card {
    grid-template-columns: 86px 1fr;
    padding: 18px;
  }

  .passport-avatar {
    width: 86px;
    height: 106px;
    font-size: 28px;
  }

  .passport-identity strong {
    font-size: 20px;
  }

  .verified-stamp {
    position: static;
    grid-column: 1 / -1;
    width: fit-content;
    margin-top: 2px;
  }

  .section-heading {
    align-items: start;
    flex-direction: column;
  }

  .rating-main {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
