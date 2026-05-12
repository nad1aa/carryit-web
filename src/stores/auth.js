import { defineStore } from 'pinia'
import { mockUsers } from '@/data/mock.js'

const STORAGE_KEY = 'carryit_user'

function decodeJwtPayload(token) {
  const payload = token?.split('.')?.[1]
  if (!payload) return null
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  const normalized = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), '=')
  const json = decodeURIComponent(
    atob(normalized)
      .split('')
      .map(char => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join('')
  )
  return JSON.parse(json)
}

function loadScript(src, globalName) {
  if (globalName && window[globalName]) return Promise.resolve()
  const existing = document.querySelector(`script[src="${src}"]`)
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    let user = null
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) user = JSON.parse(stored)
    } catch (_) {}
    return { user }
  },

  getters: {
    isLoggedIn: (state) => !!state.user,
    isTraveler: (state) => state.user?.role === 'traveler',
    isSender:   (state) => state.user?.role === 'sender',
    userName:   (state) => state.user?.name || 'Guest',
    userInitials: (state) => {
      const name = state.user?.name || state.user?.email || 'U'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },
  },

  actions: {
    setUser(u) {
      this.user = u
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)) } catch (_) {}
    },

    setOAuthUser(provider, profile, tokens = {}) {
      const newUser = {
        id: `${provider}_${profile.sub || profile.id || Date.now()}`,
        name: profile.name || [profile.given_name, profile.family_name].filter(Boolean).join(' ') || profile.email || 'CarryIt member',
        email: profile.email || '',
        avatarUrl: profile.picture || null,
        role: profile.role || 'sender',
        city: profile.city || '',
        trustScore: 4.7,
        kycStatus: 'pending',
        totalTrips: 0,
        totalEarnings: 0,
        totalBookings: 0,
        bio: '',
        joinedDate: new Date().toISOString().split('T')[0],
        authProvider: provider,
        authSession: {
          provider,
          idToken: tokens.idToken || null,
          accessToken: tokens.accessToken || null,
          issuedAt: new Date().toISOString(),
        },
      }
      this.setUser(newUser)
      return newUser
    },

    clearUser() {
      this.user = null
      try { localStorage.removeItem(STORAGE_KEY) } catch (_) {}
    },

    logout() {
      this.clearUser()
    },

    refreshUser() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        this.user = stored ? JSON.parse(stored) : null
      } catch (_) {
        this.user = null
      }
    },

    login(email, _password) {
      const found = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (found) { this.setUser(found); return true }
      return false
    },

    register(userData) {
      const newUser = {
        id: 'u' + Date.now(),
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || 'sender',
        city: userData.city || '',
        trustScore: 0,
        kycStatus: 'pending',
        totalTrips: 0,
        totalEarnings: 0,
        totalBookings: 0,
        bio: userData.bio || '',
        joinedDate: new Date().toISOString().split('T')[0],
        ...userData,
      }
      mockUsers.push(newUser)
      this.setUser(newUser)
      return newUser
    },

    async signInWithGoogle() {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      if (!clientId) {
        throw new Error('Google OAuth is not configured. Add VITE_GOOGLE_CLIENT_ID to your environment.')
      }

      await loadScript('https://accounts.google.com/gsi/client', 'google')

      return new Promise((resolve, reject) => {
        try {
          const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'openid email profile',
            prompt: 'select_account consent',
            callback: async (response) => {
              try {
                if (response.error) throw new Error(response.error)
                const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${response.access_token}` },
                })
                if (!profileResponse.ok) throw new Error('Google profile request failed.')
                const profile = await profileResponse.json()
                const user = this.setOAuthUser('google', profile, { accessToken: response.access_token })
                resolve(user)
              } catch (error) {
                reject(error)
              }
            },
          })
          tokenClient.requestAccessToken()
        } catch (error) {
          reject(error)
        }
      })
    },

    async signInWithApple() {
      const clientId = import.meta.env.VITE_APPLE_CLIENT_ID
      const redirectURI = import.meta.env.VITE_APPLE_REDIRECT_URI || window.location.origin
      if (!clientId) {
        throw new Error('Apple Sign-In is not configured. Add VITE_APPLE_CLIENT_ID to your environment.')
      }

      await loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js', 'AppleID')

      window.AppleID.auth.init({
        clientId,
        scope: 'name email',
        redirectURI,
        usePopup: true,
      })

      const response = await window.AppleID.auth.signIn()
      const payload = decodeJwtPayload(response.authorization?.id_token)
      const name = response.user?.name
        ? [response.user.name.firstName, response.user.name.lastName].filter(Boolean).join(' ')
        : payload?.email

      if (!payload?.email && !name) {
        throw new Error('Apple did not return profile information.')
      }

      return this.setOAuthUser('apple', { ...payload, name }, {
        idToken: response.authorization?.id_token,
        accessToken: response.authorization?.code,
      })
    },
  },
})
