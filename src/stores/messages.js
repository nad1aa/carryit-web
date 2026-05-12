import { defineStore } from 'pinia'
import { mockConversations, mockMessages, mockUsers, mockBookings } from '@/data/mock.js'

function userName(user) {
  return user?.name || user?.email || 'CarryIt user'
}

function makeConversationId(userA, userB, bookingId) {
  return `conv-${bookingId || [userA, userB].sort().join('-')}`
}

function normalizeConversation(conversation, currentUserId) {
  const otherId = conversation.participants.find(id => id !== currentUserId)
  const otherUser = mockUsers.find(user => user.id === otherId) || conversation.otherUser || null

  return {
    id: conversation.id,
    participants: conversation.participants,
    bookingId: conversation.bookingId,
    otherUserId: otherId,
    otherUserName: userName(otherUser),
    otherUser,
    lastMsg: conversation.lastMessage || '',
    lastTime: conversation.lastTime || new Date().toISOString(),
    unread: false,
    bookingRef: conversation.bookingId ? conversation.bookingId.toUpperCase() : null,
  }
}

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    conversations: [...mockConversations],
    messages: [...mockMessages],
  }),

  getters: {
    conversationById: (state) => (id) => state.conversations.find(conv => conv.id === id),
    messagesForConversation: (state) => (conversationId) =>
      state.messages
        .filter(message => message.conversationId === conversationId)
        .sort((a, b) => new Date(a.time) - new Date(b.time)),
  },

  actions: {
    listForUser(userId) {
      return this.conversations
        .filter(conv => conv.participants.includes(userId))
        .map(conv => normalizeConversation(conv, userId))
        .sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime))
    },

    ensureConversation({ currentUserId, otherUserId, bookingId, seedText, otherUser }) {
      if (!currentUserId || !otherUserId) return null

      const existing = this.conversations.find(conv =>
        (bookingId && conv.bookingId === bookingId) ||
        (conv.participants.includes(currentUserId) && conv.participants.includes(otherUserId))
      )

      if (existing) return existing.id

      const id = makeConversationId(currentUserId, otherUserId, bookingId)
      const resolvedOtherUser = otherUser || mockUsers.find(user => user.id === otherUserId)
      const booking = mockBookings.find(item => item.id === bookingId)
      const now = new Date().toISOString()
      const lastMessage = seedText || `Booking accepted for ${booking?.origin || 'your route'} to ${booking?.destination || 'destination'}.`

      this.conversations.push({
        id,
        participants: [currentUserId, otherUserId],
        lastMessage,
        lastTime: now,
        bookingId,
        otherUser: resolvedOtherUser,
      })

      this.messages.push({
        id: `m-${Date.now()}`,
        conversationId: id,
        senderId: currentUserId,
        receiverId: otherUserId,
        text: lastMessage,
        time: now,
        read: true,
      })

      return id
    },

    sendMessage({ conversationId, senderId, text, image }) {
      const conversation = this.conversationById(conversationId)
      if (!conversation || !senderId) return null

      const receiverId = conversation.participants.find(id => id !== senderId)
      const now = new Date().toISOString()
      const message = {
        id: `m-${Date.now()}`,
        conversationId,
        senderId,
        receiverId,
        text,
        image,
        time: now,
        read: true,
      }

      this.messages.push(message)
      conversation.lastMessage = image ? '[Photo]' : text
      conversation.lastTime = now
      return message
    },
  },
})
