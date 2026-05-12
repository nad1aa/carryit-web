<template>
  <v-app :theme="appStore.darkMode ? 'carryitDark' : 'carryit'">
    <!-- Splash shown on every hard page load, not on SPA navigation -->
    <Splash v-if="isLanding" />
    <div :class="{ 'dark-mode': appStore.darkMode }">
      <AppNavbar v-if="showNavbar" />

      <v-main>
        <router-view v-slot="{ Component }">
          <transition :name="pageTransition">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </v-main>

      <!-- Global snackbar -->
      <v-snackbar
        v-model="appStore.snackbar.show"
        :color="appStore.snackbar.color || 'primary'"
        :timeout="appStore.snackbar.timeout || 3000"
        location="bottom center"
      >
        <span class="lbl" style="font-size: 11px;">{{ appStore.snackbar.message }}</span>
        <template #actions>
          <v-btn
            variant="text"
            icon="mdi-close"
            size="small"
            @click="appStore.snackbar.show = false"
          />
        </template>
      </v-snackbar>
    </div>
  </v-app>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app.js'
import AppNavbar from '@/components/AppNavbar.vue'
import Splash from '@/components/landing/Splash.vue'

const route    = useRoute()
const appStore = useAppStore()

// Auth routes get a retro-stamp slide, main app gets a clean fade-lift
const AUTH_ROUTES = ['/auth/', '/']
const pageTransition = computed(() =>
  AUTH_ROUTES.some(p => route.path.startsWith(p)) ? 'page-stamp' : 'page-lift'
)

// Hide the Vuetify AppNavbar for landing, auth, and all app screens
// (app screens use their own per-page dark header)
const NAVBAR_SHOW_ONLY = [/* currently none — landing has its own Navbar.vue */]
const showNavbar = computed(() => false) // all pages use their own headers now
const isLanding  = computed(() => route.path === '/')

// Sync dark mode class to <html> so CSS vars apply globally
watch(
  () => appStore.darkMode,
  (v) => {
    document.documentElement.classList.toggle('dark-mode', v)
  },
  { immediate: true }
)
</script>

<style>
/* ── Page transitions ── */

/* Retro stamp: used for landing → auth routes */
.page-stamp-enter-active {
  transition: opacity 0.38s cubic-bezier(.2,.8,.2,1), transform 0.38s cubic-bezier(.2,.8,.2,1);
}
.page-stamp-leave-active {
  transition: opacity 0.22s cubic-bezier(.4,0,1,1), transform 0.22s cubic-bezier(.4,0,1,1);
}
.page-stamp-enter-from {
  opacity: 0;
  transform: translateY(28px) scale(0.97);
}
.page-stamp-leave-to {
  opacity: 0;
  transform: translateY(-14px) scale(0.98);
}

/* Clean lift: used for app inner navigation */
.page-lift-enter-active {
  transition: opacity 0.28s cubic-bezier(.2,.8,.2,1), transform 0.28s cubic-bezier(.2,.8,.2,1);
}
.page-lift-leave-active {
  transition: opacity 0.18s cubic-bezier(.4,0,1,1);
}
.page-lift-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.page-lift-leave-to {
  opacity: 0;
}

/* Apply bg token globally */
.v-application__wrap {
  background-color: var(--bg) !important;
}
</style>
