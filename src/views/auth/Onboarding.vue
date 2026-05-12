<template>
  <!-- Backdrop (desktop only) -->
  <div class="ob-backdrop" @click.self="goToAuth">
    <!-- Modal shell -->
    <div class="ob-modal" :class="`ob-slide-${current}`">
      <!-- Skip -->
      <button class="ob-skip" @click="goToAuth">skip</button>

      <!-- Badge -->
      <router-link to="/" class="ob-badge" :class="{ 'ob-badge-light': current === 3 }">
        carryit · {{ current + 1 }}/4
      </router-link>

      <!-- Slide track -->
      <div class="ob-track" @touchstart="onTouchStart" @touchend="onTouchEnd">
        <transition :name="slideDir === 1 ? 'ob-left' : 'ob-right'" mode="out-in">
          <div class="ob-slide" :key="current">

            <!-- ─── Slide 0: hi friends ─── -->
            <template v-if="current === 0">
              <div class="ob-illustration">
                <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="60" y="70" width="100" height="110" rx="20" fill="#2230a0"/>
                  <rect x="95" y="55" width="30" height="18" rx="9" fill="#2230a0"/>
                  <rect x="78" y="120" width="64" height="40" rx="10" fill="#1a258a"/>
                  <line x1="78" y1="140" x2="142" y2="140" stroke="#e8dfa0" stroke-width="2.5" stroke-dasharray="4 3"/>
                  <rect x="52" y="75" width="12" height="75" rx="6" fill="#1a258a"/>
                  <rect x="156" y="75" width="12" height="75" rx="6" fill="#1a258a"/>
                  <circle cx="95" cy="98" r="7" fill="#fff"/>
                  <circle cx="125" cy="98" r="7" fill="#fff"/>
                  <circle cx="97" cy="100" r="4" fill="#111"/>
                  <circle cx="127" cy="100" r="4" fill="#111"/>
                  <path d="M95 115 Q110 128 125 115" stroke="#e8dfa0" stroke-width="3" stroke-linecap="round" fill="none"/>
                  <circle cx="35" cy="68" r="4" fill="#e8dfa0" opacity="0.6"/>
                  <circle cx="185" cy="58" r="3" fill="#8485d0" opacity="0.7"/>
                  <circle cx="192" cy="148" r="2.5" fill="#2230a0" opacity="0.5"/>
                </svg>
              </div>
              <div class="ob-content">
                <h1 class="ob-heading">hi friends,<br><em>we carry</em><br>your world.</h1>
                <p class="ob-body">connect with travelers going your way and send packages across borders — safely, affordably, personally.</p>
              </div>
            </template>

            <!-- ─── Slide 1: travelers carry ─── -->
            <template v-if="current === 1">
              <div class="ob-illustration">
                <svg viewBox="0 0 260 170" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="55" cy="55" r="28" fill="#2230a0"/>
                  <circle cx="55" cy="46" r="12" fill="#e8dfa0"/>
                  <path d="M28 98 Q30 74 55 71 Q80 74 82 98" fill="#2230a0"/>
                  <path d="M90 85 L168 85" stroke="#111" stroke-width="2.5" stroke-dasharray="6 4" stroke-linecap="round"/>
                  <polygon points="168,80 180,85 168,90" fill="#111"/>
                  <rect x="112" y="70" width="36" height="30" rx="5" fill="#fff" stroke="#111" stroke-width="2"/>
                  <line x1="130" y1="70" x2="130" y2="100" stroke="#111" stroke-width="1.5"/>
                  <path d="M112 80 Q130 74 148 80" stroke="#111" stroke-width="1.5" fill="none"/>
                  <circle cx="205" cy="55" r="28" fill="#8485d0"/>
                  <circle cx="205" cy="46" r="12" fill="#e8dfa0"/>
                  <path d="M178 98 Q180 74 205 71 Q230 74 232 98" fill="#8485d0"/>
                  <text x="55" y="126" font-family="Montserrat,sans-serif" font-size="10" font-weight="700" fill="#111" text-anchor="middle">sender</text>
                  <text x="205" y="126" font-family="Montserrat,sans-serif" font-size="10" font-weight="700" fill="#111" text-anchor="middle">traveler</text>
                </svg>
              </div>
              <div class="ob-content">
                <h1 class="ob-heading">travelers carry.<br>senders save.<br><em>everyone wins.</em></h1>
                <p class="ob-body">travelers earn extra on trips they're already taking. senders skip the courier fees.</p>
              </div>
            </template>

            <!-- ─── Slide 2: pick your destination ─── -->
            <template v-if="current === 2">
              <div class="ob-illustration">
                <svg viewBox="0 0 260 155" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="130" cy="78" rx="108" ry="65" stroke="#2230a0" stroke-width="1.5" stroke-dasharray="8 5" fill="#d4d8f8" fill-opacity="0.3"/>
                  <path d="M50 108 Q130 22 210 108" stroke="#2230a0" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                  <circle cx="50" cy="108" r="7" fill="#2230a0"/>
                  <circle cx="210" cy="108" r="7" fill="#8485d0"/>
                  <text x="50" y="126" font-family="Montserrat,sans-serif" font-size="9" font-weight="700" fill="#111" text-anchor="middle">TUN</text>
                  <text x="210" y="126" font-family="Montserrat,sans-serif" font-size="9" font-weight="700" fill="#111" text-anchor="middle">PAR</text>
                  <g transform="translate(130,40) rotate(-18)">
                    <polygon points="0,-12 7,8 0,5 -7,8" fill="#e8dfa0" stroke="#111" stroke-width="1.5"/>
                  </g>
                  <circle cx="92" cy="58" r="3" fill="#8485d0"/>
                  <circle cx="168" cy="58" r="3" fill="#8485d0"/>
                </svg>
              </div>
              <div class="ob-content">
                <h1 class="ob-heading">where are<br>you sending?</h1>
                <div class="ob-city-list">
                  <button
                    v-for="city in staticCities"
                    :key="city"
                    class="ob-city-pill"
                    :class="{ active: selectedCity === city }"
                    @click="selectedCity = city"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 010 16c-4.42 0-8-3.58-8-8s3.58-8 8-8z"/></svg>
                    {{ city }}
                  </button>
                  <!-- "Another city" pill / inline search -->
                  <template v-if="!showCitySearch">
                    <button class="ob-city-pill ob-city-pill--other" @click="openCitySearch">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      another city…
                    </button>
                  </template>
                  <template v-else>
                    <div class="ob-city-search-wrap">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <input
                        ref="citySearchInput"
                        v-model="cityQuery"
                        class="ob-city-search"
                        placeholder="type a city…"
                        @keydown.escape="closeCitySearch"
                      />
                      <button class="ob-city-search-close" @click="closeCitySearch">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </template>

            <!-- ─── Slide 3: let's get started (dark bg) ─── -->
            <template v-if="current === 3">
              <div class="ob-illustration ob-illustration-dark">
                <svg viewBox="0 0 260 190" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 145 Q90 95 145 72" stroke="#e8dfa0" stroke-width="1.5" stroke-dasharray="5 4" stroke-linecap="round" fill="none" opacity="0.45"/>
                  <path d="M40 158 Q90 118 145 95" stroke="#8485d0" stroke-width="1" stroke-dasharray="5 4" stroke-linecap="round" fill="none" opacity="0.35"/>
                  <g transform="translate(100,65) rotate(-30)">
                    <polygon points="0,-42 28,28 0,15 -28,28" fill="#e8dfa0" stroke="#fff" stroke-width="2"/>
                    <line x1="0" y1="-42" x2="0" y2="15" stroke="#c8c090" stroke-width="1.5"/>
                    <polygon points="0,15 -28,28 0,-6" fill="#c8c090"/>
                  </g>
                  <circle cx="202" cy="55" r="5" fill="#e8dfa0"/>
                  <circle cx="222" cy="88" r="3" fill="#8485d0"/>
                  <circle cx="195" cy="108" r="3.5" fill="#e8dfa0" opacity="0.6"/>
                  <circle cx="55" cy="48" r="2.5" fill="#e8dfa0" opacity="0.5"/>
                </svg>
              </div>
              <div class="ob-content ob-content-dark">
                <h1 class="ob-heading ob-heading-light">let's get<br><em>started.</em></h1>
                <p class="ob-body ob-body-light">create your account and start sending or carrying today.</p>
                <div class="ob-auth-btns">
                  <router-link to="/auth/signup" class="ob-btn-signup">
                    sign up
                  </router-link>
                  <button class="ob-btn-sso">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    continue with google
                  </button>
                  <button class="ob-btn-sso">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.41c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.53 3.98zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    continue with apple
                  </button>
                  <router-link to="/auth/signin" class="ob-btn-signin">
                    i already have an account
                  </router-link>
                </div>
              </div>
            </template>

          </div>
        </transition>
      </div>

      <!-- Footer: dots + ghost circle arrows -->
      <div class="ob-footer">
        <button
          class="ob-nav-arrow ob-nav-arrow--prev"
          :class="{ invisible: current === 0 }"
          @click="prev"
          aria-label="Previous slide"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <div class="ob-dots">
          <button
            v-for="i in 4"
            :key="i"
            class="ob-dot"
            :class="{ active: current === i - 1 }"
            @click="goTo(i - 1)"
            :aria-label="`Go to slide ${i}`"
          />
        </div>

        <button
          v-if="current < 3"
          class="ob-nav-arrow ob-nav-arrow--next"
          @click="next"
          aria-label="Next slide"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div v-else style="width:44px"/>
      </div>

    </div><!-- /ob-modal -->
  </div><!-- /ob-backdrop -->
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router       = useRouter()
const current      = ref(0)
const slideDir     = ref(1)
const selectedCity = ref(null)
const showCitySearch = ref(false)
const cityQuery    = ref('')
const citySearchInput = ref(null)

const staticCities = ['Tunis', 'Paris', 'London']

let touchStartX = 0
function onTouchStart(e) { touchStartX = e.touches[0].clientX }
function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (dx < -40) next()
  else if (dx > 40) prev()
}

function goTo(i) {
  slideDir.value = i > current.value ? 1 : -1
  current.value  = i
}
function next() { if (current.value < 3) { slideDir.value = 1; current.value++ } }
function prev() { if (current.value > 0) { slideDir.value = -1; current.value-- } }
function goToAuth() { router.push('/auth/signin') }

async function openCitySearch() {
  showCitySearch.value = true
  await nextTick()
  citySearchInput.value?.focus()
}
function closeCitySearch() {
  showCitySearch.value = false
  cityQuery.value = ''
}
</script>

<style scoped>
/* ── Backdrop (desktop dim) ── */
.ob-backdrop {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0ee;
  font-family: 'Montserrat', sans-serif;
}

/* ── Modal shell ── */
.ob-modal {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f0ee;
  position: relative;
  overflow: hidden;
  transition: background 0.45s cubic-bezier(.4,0,.2,1);
}
.ob-slide-1 { background: #f5f0d8; }
.ob-slide-3 { background: #2230a0; }

/* Desktop: modal style */
@media (min-width: 640px) {
  .ob-backdrop {
    background: rgba(17,17,17,0.55);
    backdrop-filter: blur(4px);
  }
  .ob-modal {
    width: 480px;
    min-height: 0;
    height: 680px;
    max-height: 90vh;
    border-radius: 24px;
    box-shadow: 0 32px 80px rgba(17,17,17,0.35);
    overflow: hidden;
  }
}

/* ── Badge ── */
.ob-badge {
  align-self: center;
  background: #2230a0;
  color: #e8dfa0;
  text-decoration: none;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: lowercase;
  padding: 5px 16px;
  border-radius: 99px;
  margin: 18px 0 0;
  flex-shrink: 0;
  z-index: 5;
  position: relative;
}
.ob-badge-light {
  background: rgba(255,255,255,0.18);
  color: #e8dfa0;
}

/* ── Skip ── */
.ob-skip {
  position: absolute;
  top: 18px; right: 20px;
  z-index: 20;
  background: none;
  border: none;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(17,17,17,0.38);
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 99px;
  transition: color 0.2s, background 0.2s;
}
.ob-slide-3 .ob-skip { color: rgba(255,255,255,0.45); }
.ob-skip:hover { color: #111; background: rgba(17,17,17,0.06); }

/* ── Track ── */
.ob-track {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* ── Slide ── */
.ob-slide {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 32px 16px;
  position: absolute;
  inset: 0;
}

/* ── Illustration ── */
.ob-illustration {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 220px;
  flex-shrink: 0;
}
.ob-illustration svg {
  width: 100%;
  max-width: 220px;
  height: auto;
}
.ob-illustration-dark { max-height: 180px; }

/* ── Content ── */
.ob-content { flex-shrink: 0; padding-bottom: 4px; }

.ob-heading {
  font-size: clamp(24px, 7vw, 34px);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: #111;
  margin: 0 0 12px;
  text-transform: lowercase;
}
.ob-heading em { font-style: italic; color: #2230a0; }
.ob-heading-light { color: #fff; }
.ob-heading-light em { color: #e8dfa0; font-style: italic; }

.ob-body {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.6;
  color: #555;
  margin: 0;
  text-transform: lowercase;
}
.ob-body-light { color: rgba(255,255,255,0.66); }

/* ── City pills (slide 2) ── */
.ob-city-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}
.ob-city-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1.5px solid rgba(17,17,17,0.16);
  border-radius: 12px;
  padding: 10px 16px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #111;
  cursor: pointer;
  transition: all 0.15s;
  text-transform: lowercase;
  text-align: left;
}
.ob-city-pill.active,
.ob-city-pill:hover {
  background: #2230a0;
  border-color: #2230a0;
  color: #e8dfa0;
}
.ob-city-pill--other {
  background: transparent;
  border-style: dashed;
  color: rgba(17,17,17,0.5);
}
.ob-city-pill--other:hover {
  background: #2230a0;
  border-color: #2230a0;
  border-style: solid;
  color: #e8dfa0;
}

/* Inline city search */
.ob-city-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1.5px solid #2230a0;
  border-radius: 12px;
  padding: 9px 12px;
  color: #2230a0;
}
.ob-city-search {
  flex: 1;
  border: none;
  outline: none;
  background: none;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #111;
}
.ob-city-search::placeholder { color: rgba(17,17,17,0.35); }
.ob-city-search-close {
  display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px;
  background: rgba(17,17,17,0.08); border: none; border-radius: 50%;
  color: rgba(17,17,17,0.5); cursor: pointer;
  flex-shrink: 0;
  padding: 0;
}

/* ── Auth buttons (slide 3) ── */
.ob-auth-btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}
.ob-btn-signup {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8dfa0;
  color: #111;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.01em;
  padding: 14px 24px;
  border-radius: 12px;
  text-decoration: none;
  text-transform: lowercase;
  transition: opacity 0.15s;
}
.ob-btn-signup:hover { opacity: 0.88; }

.ob-btn-sso {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(255,255,255,0.10);
  border: 1.5px solid rgba(255,255,255,0.22);
  color: rgba(255,255,255,0.85);
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  text-transform: lowercase;
  transition: background 0.15s;
}
.ob-btn-sso:hover { background: rgba(255,255,255,0.18); }

.ob-btn-signin {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: rgba(255,255,255,0.42);
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  text-transform: lowercase;
  padding: 4px;
  cursor: pointer;
  transition: color 0.15s;
}
.ob-btn-signin:hover { color: rgba(255,255,255,0.75); }

/* ── Footer ── */
.ob-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px 28px;
  flex-shrink: 0;
}

.ob-nav-arrow {
  width: 44px; height: 44px;
  border-radius: 50%;
  border: 1.5px solid rgba(17,17,17,0.18);
  background: rgba(255,255,255,0.7);
  color: #111;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.18s;
  flex-shrink: 0;
}
.ob-nav-arrow:hover { background: #111; color: #fff; border-color: #111; }
.ob-nav-arrow.invisible { opacity: 0; pointer-events: none; }
.ob-slide-3 .ob-nav-arrow {
  border-color: rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.1);
  color: #fff;
}
.ob-slide-3 .ob-nav-arrow:hover {
  background: rgba(255,255,255,0.22);
}

.ob-dots { display: flex; gap: 8px; align-items: center; }
.ob-dot {
  width: 8px; height: 8px;
  border-radius: 99px;
  border: none;
  background: rgba(17,17,17,0.18);
  cursor: pointer;
  padding: 0;
  transition: all 0.22s;
}
.ob-slide-3 .ob-dot { background: rgba(255,255,255,0.28); }
.ob-dot.active { width: 24px; }
.ob-slide-0 .ob-dot.active,
.ob-slide-2 .ob-dot.active { background: #2230a0; }
.ob-slide-1 .ob-dot.active { background: #111; }
.ob-slide-3 .ob-dot.active { background: #e8dfa0; }

/* ── Slide transitions ── */
.ob-left-enter-active,
.ob-left-leave-active,
.ob-right-enter-active,
.ob-right-leave-active {
  transition: transform 0.36s cubic-bezier(.4,0,.2,1), opacity 0.36s;
  position: absolute;
  inset: 0;
}
.ob-left-enter-from  { transform: translateX(100%); opacity: 0; }
.ob-left-leave-to    { transform: translateX(-40%); opacity: 0; }
.ob-right-enter-from { transform: translateX(-100%); opacity: 0; }
.ob-right-leave-to   { transform: translateX(40%); opacity: 0; }
</style>
