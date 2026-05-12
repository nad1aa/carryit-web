import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const routes = [
  { path: '/',                     component: () => import('@/views/LandingPage.vue') },
  { path: '/about',                component: () => import('@/views/shared/AboutPage.vue') },
  { path: '/settings',             component: () => import('@/views/shared/SettingsPage.vue'), meta: { requiresAuth: true } },

  // Auth
  { path: '/auth/onboarding',      component: () => import('@/views/auth/Onboarding.vue') },
  { path: '/auth/signin',          component: () => import('@/views/auth/SignIn.vue') },
  { path: '/auth/signup',          component: () => import('@/views/auth/SignUp.vue') },
  { path: '/auth/verify',          component: () => import('@/views/auth/IdVerification.vue') },
  { path: '/auth/profile-setup',   component: () => import('@/views/auth/ProfileSetUp.vue') },

  // Shared
  { path: '/profile',              component: () => import('@/views/shared/ProfilePage.vue'), meta: { requiresAuth: true } },
  { path: '/notifications',        component: () => import('@/views/shared/Notifications.vue'), meta: { requiresAuth: true } },
  { path: '/chat',                 component: () => import('@/views/shared/Chat.vue'), meta: { requiresAuth: true } },
  { path: '/chat/:id',             component: () => import('@/views/shared/Chat.vue'), meta: { requiresAuth: true } },

  // Sender
  { path: '/sender/search',        component: () => import('@/views/sender/SearchTrips.vue'), meta: { requiresAuth: true } },
  { path: '/sender/results',       component: () => import('@/views/sender/TripResults.vue'), meta: { requiresAuth: true } },
  { path: '/sender/trip/:id',      component: () => import('@/views/sender/TripDetail.vue'), meta: { requiresAuth: true } },
  { path: '/sender/book/:tripId',  component: () => import('@/views/sender/BookingForm.vue'), meta: { requiresAuth: true } },
  { path: '/sender/booking/:id/confirmation', component: () => import('@/views/sender/BookingConfirmation.vue'), meta: { requiresAuth: true } },
  { path: '/sender/bookings',      component: () => import('@/views/sender/MyBookings.vue'), meta: { requiresAuth: true } },
  { path: '/sender/tracking/:id',  component: () => import('@/views/sender/BookingTracking.vue'), meta: { requiresAuth: true } },

  // Traveler
  { path: '/traveler/post-trip',   component: () => import('@/views/traveler/PostTrip.vue'), meta: { requiresAuth: true } },
  { path: '/traveler/trips',       component: () => import('@/views/traveler/MyTrips.vue'), meta: { requiresAuth: true } },
  { path: '/traveler/requests',    component: () => import('@/views/traveler/BookingRequests.vue'), meta: { requiresAuth: true } },
  { path: '/traveler/earnings',    component: () => import('@/views/traveler/Earnings.vue'), meta: { requiresAuth: true } },

  // Delivery
  { path: '/delivery/active/:id',  component: () => import('@/views/delivery/ActiveDelivery.vue'), meta: { requiresAuth: true } },
  { path: '/delivery/scan',        component: () => import('@/views/delivery/QRScanner.vue'), meta: { requiresAuth: true } },
  { path: '/delivery/handoff/:id', component: () => import('@/views/delivery/QRHandoff.vue'), meta: { requiresAuth: true } },
  { path: '/delivery/otp/:id',     component: () => import('@/views/delivery/OTPConfirmation.vue'), meta: { requiresAuth: true } },

  // Post-delivery
  { path: '/review/:id',           component: () => import('@/views/post-delivery/RatingReview.vue'), meta: { requiresAuth: true } },
  { path: '/dispute/:id',          component: () => import('@/views/post-delivery/DisputeForm.vue'), meta: { requiresAuth: true } },

  // Business portal
  { path: '/business/dashboard',   component: () => import('@/views/business/BizDashboard.vue'), meta: { requiresAuth: true }    },
  { path: '/business/bulk',        component: () => import('@/views/business/BulkBooking.vue'), meta: { requiresAuth: true }      },
  { path: '/business/storefront',  component: () => import('@/views/business/SellerStorefront.vue'), meta: { requiresAuth: true } },
  { path: '/business/integrations',component: () => import('@/views/business/ApiIntegrations.vue'), meta: { requiresAuth: true }  },

  // 404
  { path: '/:pathMatch(.*)*',      component: () => import('@/views/NotFound.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { path: '/auth/signin', query: { redirect: to.fullPath } }
  }
})

export default router
