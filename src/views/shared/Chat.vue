<template>
  <div class="ch-root">

    <!-- ══════════════ LIST MODE ══════════════ -->
    <template v-if="!conversationId">
      <header class="ch-list-header">
        <button class="ch-back" @click="router.back()" aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <span class="ch-list-title">Messages</span>
        <div v-if="totalUnread > 0" class="ch-unread-badge">{{ totalUnread }}</div>
      </header>

      <!-- Security note -->
      <div class="ch-security-note">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Messages are end-to-end encrypted and scoped to your bookings
      </div>

      <div class="ch-conv-list">
        <div v-if="conversations.length === 0" class="ch-empty">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(17,17,17,0.18)" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <span>No conversations yet</span>
          <span class="ch-empty-sub">Book a trip to start chatting</span>
        </div>

        <div
          v-for="conv in conversations"
          :key="conv.id"
          class="ch-conv-row"
          @click="router.push('/chat/' + conv.id)"
        >
          <div class="ch-conv-avatar" :style="{ background: avatarColor(conv.otherUser) }">
            {{ initials(conv.otherUser) }}
          </div>
          <div class="ch-conv-body">
            <div class="ch-conv-top">
              <span class="ch-conv-name" :class="{ unread: conv.unread }">{{ conv.otherUser }}</span>
              <span class="ch-conv-time">{{ relativeTime(conv.lastTime) }}</span>
            </div>
            <div class="ch-conv-bottom">
              <span class="ch-conv-preview" :class="{ unread: conv.unread }">{{ truncate(conv.lastMsg, 42) }}</span>
              <div v-if="conv.unread" class="ch-unread-dot" />
            </div>
            <div v-if="conv.bookingRef" class="ch-conv-booking">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
              {{ conv.bookingRef }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ══════════════ CHAT MODE ══════════════ -->
    <template v-else>
      <!-- Fixed top bar -->
      <div class="ch-topbar">
        <button class="ch-back" @click="router.push('/chat')">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="ch-topbar-avatar" :style="{ background: avatarColor(currentConv?.otherUser || '') }">
          {{ initials(currentConv?.otherUser || 'U') }}
        </div>
        <div class="ch-topbar-info">
          <div class="ch-topbar-name">{{ currentConv?.otherUser || 'User' }}</div>
          <div class="ch-topbar-status">
            <span class="ch-online-dot" />
            <span>Active now</span>
          </div>
        </div>
        <!-- Booking ref pill -->
        <div v-if="currentConv?.bookingRef" class="ch-topbar-ref">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
          {{ currentConv.bookingRef }}
        </div>
      </div>

      <!-- Security note inside chat -->
      <div class="ch-security-note ch-security-note--chat">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        End-to-end encrypted · scoped to booking {{ currentConv?.bookingRef || '' }}
      </div>

      <!-- Messages area -->
      <div class="ch-messages" ref="messagesEl">
        <template v-for="(group, gi) in groupedMessages" :key="gi">
          <div class="ch-date-sep">
            <span>{{ group.date }}</span>
          </div>
          <div
            v-for="msg in group.messages"
            :key="msg.id"
            class="ch-msg-row"
            :class="msg.mine ? 'ch-msg-row--mine' : 'ch-msg-row--theirs'"
          >
            <!-- Image bubble -->
            <template v-if="msg.image">
              <div class="ch-bubble" :class="msg.mine ? 'ch-bubble--mine' : 'ch-bubble--theirs'">
                <img :src="msg.image" class="ch-img-bubble" alt="Shared photo" />
              </div>
            </template>
            <!-- Text bubble -->
            <template v-else>
              <div class="ch-bubble" :class="msg.mine ? 'ch-bubble--mine' : 'ch-bubble--theirs'">
                <p class="ch-bubble-text">{{ msg.text }}</p>
              </div>
            </template>
            <div class="ch-msg-time" :class="msg.mine ? 'ts-mine' : 'ts-theirs'">{{ formatTime(msg.ts) }}</div>
          </div>
        </template>

        <!-- Typing indicator -->
        <div v-if="showTyping" class="ch-msg-row ch-msg-row--theirs">
          <div class="ch-bubble ch-bubble--theirs ch-typing-bubble">
            <div class="ch-typing-dots">
              <span /><span /><span />
            </div>
          </div>
        </div>
      </div>

      <!-- Input bar -->
      <div class="ch-input-bar">
        <button class="ch-attach-btn" @click="triggerPhoto" title="Share photo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </button>
        <input
          ref="photoInputEl"
          type="file"
          accept="image/*"
          style="display:none"
          @change="handlePhoto"
        />
        <input
          v-model="draft"
          class="ch-text-input"
          placeholder="Message..."
          @keydown.enter.prevent="send"
        />
        <button class="ch-send-btn" :class="{ active: draft.trim() }" :disabled="!draft.trim()" @click="send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route  = useRoute()

const conversationId = computed(() => route.params.id || null)

const conversations = ref([
  { id: 'c1', otherUser: 'Yasmine B.',  lastMsg: 'I will be at the airport by 07:45.',    lastTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),  unread: true,  bookingRef: 'BK-20481' },
  { id: 'c2', otherUser: 'Mehdi K.',    lastMsg: 'Can you take 2.5 kg instead?',            lastTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), unread: true,  bookingRef: 'BK-20477' },
  { id: 'c3', otherUser: 'Amira S.',    lastMsg: 'Package delivered, thanks!',               lastTime: new Date(Date.now() - 86400 * 1000).toISOString(),    unread: false, bookingRef: 'BK-20441' },
  { id: 'c4', otherUser: 'Omar L.',     lastMsg: 'All good, see you tomorrow.',              lastTime: new Date(Date.now() - 3 * 86400 * 1000).toISOString(), unread: false, bookingRef: 'BK-20398' },
])

const currentConv = computed(() => conversations.value.find(c => c.id === conversationId.value))
const totalUnread  = computed(() => conversations.value.filter(c => c.unread).length)

const allMessages = ref([
  { id: 'm1', cid: 'c1', mine: false, text: 'Hi! I confirm I can carry your package to Paris.', ts: new Date(Date.now() - 3600 * 2 * 1000).toISOString() },
  { id: 'm2', cid: 'c1', mine: true,  text: 'Great! It weighs about 3kg. Electronics, all original.',   ts: new Date(Date.now() - 3600 * 1.9 * 1000).toISOString() },
  { id: 'm3', cid: 'c1', mine: false, text: 'No problem. Please pack it carefully. I leave Tuesday 08:30.', ts: new Date(Date.now() - 3600 * 1.5 * 1000).toISOString() },
  { id: 'm4', cid: 'c1', mine: true,  text: 'Understood! Will pack with bubble wrap. Should I meet you at TUN?', ts: new Date(Date.now() - 3600 * 1.2 * 1000).toISOString() },
  { id: 'm5', cid: 'c1', mine: false, text: 'Yes, Terminal 1, departures area. 07:30 sharp.',        ts: new Date(Date.now() - 3600 * 0.8 * 1000).toISOString() },
  { id: 'm6', cid: 'c1', mine: true,  text: 'Perfect! I will be there. Thank you so much.',           ts: new Date(Date.now() - 3600 * 0.3 * 1000).toISOString() },
  { id: 'm7', cid: 'c1', mine: false, text: 'I will be at the airport by 07:45.',                     ts: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
])

const filteredMessages = computed(() =>
  allMessages.value.filter(m => m.cid === conversationId.value)
    .sort((a, b) => new Date(a.ts) - new Date(b.ts))
)

const groupedMessages = computed(() => {
  const groups = []
  let lastDate = null
  let group = null
  for (const msg of filteredMessages.value) {
    const d = groupDate(msg.ts)
    if (d !== lastDate) {
      lastDate = d
      group = { date: d, messages: [] }
      groups.push(group)
    }
    group.messages.push(msg)
  }
  return groups
})

const draft = ref('')
const showTyping = ref(false)
const messagesEl = ref(null)
const photoInputEl = ref(null)

function send() {
  const text = draft.value.trim()
  if (!text) return
  const msg = { id: 'm_' + Date.now(), cid: conversationId.value, mine: true, text, ts: new Date().toISOString() }
  allMessages.value.push(msg)
  const conv = conversations.value.find(c => c.id === conversationId.value)
  if (conv) { conv.lastMsg = text; conv.lastTime = msg.ts; conv.unread = false }
  draft.value = ''
  scrollDown()
  showTyping.value = true
  scrollDown()
  setTimeout(() => {
    showTyping.value = false
    const replies = ['Got it, thanks!', 'Sure thing.', 'I will be ready.', 'Understood, see you soon!', 'Thank you for the update.']
    const reply = { id: 'm_' + (Date.now() + 1), cid: conversationId.value, mine: false, text: replies[Math.floor(Math.random() * replies.length)], ts: new Date().toISOString() }
    allMessages.value.push(reply)
    if (conv) { conv.lastMsg = reply.text; conv.lastTime = reply.ts }
    scrollDown()
  }, 1800)
}

function triggerPhoto() { photoInputEl.value?.click() }

function handlePhoto(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const url = URL.createObjectURL(file)
  const msg = { id: 'm_' + Date.now(), cid: conversationId.value, mine: true, image: url, ts: new Date().toISOString() }
  allMessages.value.push(msg)
  const conv = conversations.value.find(c => c.id === conversationId.value)
  if (conv) { conv.lastMsg = '[Photo]'; conv.lastTime = msg.ts }
  scrollDown()
  e.target.value = ''
}

async function scrollDown() {
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

onMounted(() => { if (conversationId.value) scrollDown() })
watch(() => route.params.id, () => { if (conversationId.value) scrollDown() })

// Helpers
function initials(name) {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const COLORS = ['#2230a0', '#8485d0', '#111', '#3b6d11', '#854f0b']
function avatarColor(name) {
  if (!name) return COLORS[0]
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return COLORS[h % COLORS.length]
}

function truncate(str, len) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

function relativeTime(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts)
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'now'
  if (m < 60) return m + 'm'
  const h = Math.floor(m / 60)
  if (h < 24) return h + 'h'
  const d = Math.floor(h / 24)
  if (d < 7)  return d + 'd'
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function groupDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 86400000 && d.getDate() === now.getDate()) return 'Today'
  if (diff < 172800000) return 'Yesterday'
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.ch-root { min-height: 100vh; background: #f0f0ee; font-family: 'Montserrat', sans-serif; display: flex; flex-direction: column; }

/* List header */
.ch-list-header { background: #111; padding: 20px 20px 16px; display: flex; align-items: center; gap: 10px; position: sticky; top: 0; z-index: 50; }
.ch-list-title { font-size: 20px; font-weight: 900; color: #fff; letter-spacing: -0.02em; flex: 1; }
.ch-unread-badge { background: #e8dfa0; color: #111; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; flex-shrink: 0; }

/* Security note */
.ch-security-note { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 10px; font-weight: 700; color: rgba(17,17,17,0.45); background: rgba(34,48,160,0.05); padding: 8px 16px; border-bottom: 1px solid rgba(17,17,17,0.06); }
.ch-security-note--chat { padding: 7px 12px; font-size: 9px; }

/* Conversation list */
.ch-conv-list { flex: 1; padding: 0 16px; }
.ch-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 60px 20px; text-align: center; color: rgba(17,17,17,0.35); font-size: 13px; font-weight: 600; }
.ch-empty-sub { font-size: 12px; color: rgba(17,17,17,0.3); }
.ch-conv-row { display: flex; align-items: flex-start; gap: 12px; padding: 14px 0; border-bottom: 1px solid rgba(17,17,17,0.07); cursor: pointer; transition: background 0.12s; border-radius: 0; }
.ch-conv-row:first-child { border-top: 1px solid rgba(17,17,17,0.07); }
.ch-conv-row:hover { background: rgba(17,17,17,0.02); }
.ch-conv-avatar { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 900; color: #fff; flex-shrink: 0; }
.ch-conv-body { flex: 1; min-width: 0; }
.ch-conv-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; }
.ch-conv-name { font-size: 14px; font-weight: 600; color: rgba(17,17,17,0.6); }
.ch-conv-name.unread { font-weight: 800; color: #111; }
.ch-conv-time { font-size: 11px; font-weight: 600; color: rgba(17,17,17,0.35); flex-shrink: 0; margin-left: 8px; }
.ch-conv-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ch-conv-preview { font-size: 12px; font-weight: 600; color: rgba(17,17,17,0.4); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.ch-conv-preview.unread { color: rgba(17,17,17,0.7); font-weight: 700; }
.ch-unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #2230a0; flex-shrink: 0; }
.ch-conv-booking { display: flex; align-items: center; gap: 4px; margin-top: 4px; font-size: 9px; font-weight: 700; color: rgba(34,48,160,0.6); }

/* Chat topbar */
.ch-topbar { position: fixed; top: 0; left: 0; right: 0; max-width: 680px; margin: 0 auto; background: #111; display: flex; align-items: center; gap: 10px; padding: 0 16px; height: 58px; z-index: 100; }
.ch-back { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); border: none; border-radius: 50%; color: #fff; cursor: pointer; flex-shrink: 0; }
.ch-back:hover { background: rgba(255,255,255,0.16); }
.ch-topbar-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; color: #fff; flex-shrink: 0; }
.ch-topbar-info { flex: 1; min-width: 0; }
.ch-topbar-name { font-size: 14px; font-weight: 800; color: #fff; }
.ch-topbar-status { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.5); }
.ch-online-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(232,223,160,0.9); flex-shrink: 0; }
.ch-topbar-ref { display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.1); border-radius: 99px; padding: 5px 10px; font-size: 9px; font-weight: 800; color: rgba(232,223,160,0.8); white-space: nowrap; flex-shrink: 0; }

/* Messages */
.ch-messages { flex: 1; padding: 80px 12px 90px; display: flex; flex-direction: column; gap: 3px; overflow-y: auto; min-height: 100vh; }
.ch-date-sep { display: flex; justify-content: center; margin: 12px 0 8px; }
.ch-date-sep span { font-size: 10px; font-weight: 700; color: rgba(17,17,17,0.38); background: rgba(17,17,17,0.07); padding: 3px 12px; border-radius: 99px; }
.ch-msg-row { display: flex; flex-direction: column; margin-bottom: 4px; }
.ch-msg-row--mine { align-items: flex-end; }
.ch-msg-row--theirs { align-items: flex-start; }
.ch-bubble { max-width: 78%; padding: 10px 14px; word-break: break-word; }
.ch-bubble--mine { background: #2230a0; color: #fff; border-radius: 18px 18px 4px 18px; }
.ch-bubble--theirs { background: #fff; color: #111; border-radius: 18px 18px 18px 4px; border: 1.5px solid rgba(17,17,17,0.1); }
.ch-bubble-text { font-size: 13px; font-weight: 600; line-height: 1.45; margin: 0; }
.ch-img-bubble { max-width: 200px; border-radius: 10px; display: block; }
.ch-msg-time { font-size: 9px; font-weight: 600; color: rgba(17,17,17,0.35); margin-top: 2px; }
.ts-mine { padding-right: 4px; }
.ts-theirs { padding-left: 4px; }

/* Typing bubble */
.ch-typing-bubble { padding: 12px 16px; }
.ch-typing-dots { display: flex; gap: 4px; align-items: center; height: 12px; }
.ch-typing-dots span { width: 6px; height: 6px; border-radius: 50%; background: rgba(17,17,17,0.3); animation: typingBounce 1.2s infinite; }
.ch-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.ch-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

/* Input bar */
.ch-input-bar { position: fixed; bottom: 0; left: 0; right: 0; max-width: 680px; margin: 0 auto; background: #fff; border-top: 1.5px solid rgba(17,17,17,0.1); padding: 10px 12px; display: flex; align-items: center; gap: 8px; z-index: 100; padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px)); }
.ch-attach-btn { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: rgba(17,17,17,0.05); border: none; border-radius: 50%; color: rgba(17,17,17,0.5); cursor: pointer; flex-shrink: 0; transition: all 0.15s; }
.ch-attach-btn:hover { background: rgba(34,48,160,0.1); color: #2230a0; }
.ch-text-input { flex: 1; background: rgba(17,17,17,0.05); border: 1.5px solid transparent; border-radius: 24px; padding: 10px 14px; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 600; color: #111; outline: none; transition: border-color 0.15s; }
.ch-text-input:focus { border-color: #2230a0; background: #fff; }
.ch-send-btn { width: 40px; height: 40px; border-radius: 50%; background: rgba(17,17,17,0.12); border: none; display: flex; align-items: center; justify-content: center; color: rgba(17,17,17,0.4); cursor: pointer; flex-shrink: 0; transition: all 0.15s; }
.ch-send-btn.active { background: #2230a0; color: #e8dfa0; }
.ch-send-btn:disabled { cursor: not-allowed; }

@media (min-width: 768px) {
  .ch-topbar, .ch-input-bar { left: 50%; transform: translateX(-50%); right: auto; width: 100%; }
  .ch-messages { max-width: 680px; margin: 0 auto; width: 100%; align-self: center; }
  .ch-conv-list { max-width: 680px; margin: 0 auto; }
}
</style>
