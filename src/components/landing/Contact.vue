<template>
  <section class="lp-section lp-contact" id="contact">
    <Sticker src="/assets/item-10.webp"  :size="110" top="8%"  right="6%" :rotation="14"  :duration="8" :parallax=".14" :z="3" />
    <Sticker src="/assets/plane-pin.webp":size="120" top="64%" left="-2%" :rotation="-22" :duration="7" :parallax=".18" :z="3" />

    <Reveal class="lp-eyebrow"><span class="lp-star">✦</span> reach a real human</Reveal>
    <Reveal :delay="1" class="lp-section-title">talk <span class="lp-ital">to us</span>.</Reveal>
    <Reveal :delay="2" class="lp-section-sub">no chatbots. our team is five humans in a tunis attic with very strong coffee.</Reveal>

    <div class="lp-contact-grid">
      <!-- Form -->
      <Reveal variant="from-left" :delay="1" class="lp-contact-form">
        <div v-if="sent" class="lp-sent-msg">✓ Message sent! We'll reply within 24h.</div>
        <template v-else>
          <div class="lp-form-row">
            <label>your name</label>
            <input v-model="contactForm.name" type="text" placeholder="ex. amira khalfaoui" />
          </div>
          <div class="lp-form-row">
            <label>email</label>
            <input v-model="contactForm.email" type="email" placeholder="you@somewhere.com" />
          </div>
          <div class="lp-form-row">
            <label>tell us what's up</label>
            <textarea v-model="contactForm.message" rows="4" placeholder="i lost a parcel / i want to partner / i think your logo is a cat on a bike, why?"></textarea>
          </div>
          <button class="lp-send-btn" @click="sendPostcard" :disabled="!contactForm.name || !contactForm.email || !contactForm.message">Send Postcard <span>✉</span></button>
        </template>
      </Reveal>

      <!-- Info cards -->
      <div class="lp-info-grid">
        <Reveal
          v-for="(card, i) in infoCards"
          :key="i"
          variant="from-right"
          :delay="i+2"
          class="lp-info-card"
        >
          <div class="lp-info-ico">{{ card.ico }}</div>
          <h5 class="lp-info-title">{{ card.title }}</h5>
          <div class="lp-info-val">{{ card.val }}</div>
        </Reveal>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import Sticker from './Sticker.vue'
import Reveal  from './Reveal.vue'

const contactForm = ref({ name: '', email: '', message: '' })
const sent = ref(false)

function sendPostcard() {
  if (!contactForm.value.name || !contactForm.value.email || !contactForm.value.message) return
  sent.value = true
  contactForm.value = { name: '', email: '', message: '' }
  setTimeout(() => { sent.value = false }, 4000)
}

const infoCards = [
  { ico:'@',  title:'general',  val:'hi@carryit.tn'       },
  { ico:'⚑',  title:'HQ',       val:'tunis · medina · 1006'},
  { ico:'▣',  title:'press',    val:'press@carryit.tn'    },
  { ico:'⚒',  title:'business', val:'sellers@carryit.tn'  },
]
</script>

<style scoped>
.lp-contact {
  background: var(--lp-paper-2);
  border-top: 2px dashed rgba(23,26,58,.25);
  position: relative;
}

.lp-contact-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 48px;
  margin-top: 48px;
  align-items: start;
}

/* Form */
.lp-contact-form {
  background: var(--lp-cream);
  border: 2.5px solid var(--lp-ink);
  border-radius: 18px;
  padding: 32px;
  box-shadow: 6px 6px 0 var(--lp-ink);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.lp-form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lp-form-row label {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lp-ink-soft);
}
.lp-form-row input,
.lp-form-row textarea {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  padding: 14px;
  border: 2px solid var(--lp-ink);
  border-radius: 8px;
  background: var(--lp-paper);
  color: var(--lp-ink);
  outline: none;
  resize: vertical;
  transition: border-color .15s, box-shadow .15s;
}
.lp-form-row input:focus,
.lp-form-row textarea:focus {
  border-color: var(--lp-stamp-red);
  box-shadow: 3px 3px 0 var(--lp-stamp-red);
}
.lp-form-row input::placeholder,
.lp-form-row textarea::placeholder {
  color: rgba(23,26,58,.4);
}

.lp-send-btn {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 16px 28px;
  border-radius: 50px;
  border: 2px solid var(--lp-ink);
  background: var(--lp-ink);
  color: var(--lp-paper);
  cursor: pointer;
  box-shadow: 4px 4px 0 var(--lp-stamp-red);
  transition: transform .15s, box-shadow .15s;
  align-self: flex-start;
}
.lp-send-btn:hover:not(:disabled) {
  transform: translate(-2px,-2px);
  box-shadow: 6px 6px 0 var(--lp-stamp-red);
}
.lp-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.lp-sent-msg {
  padding: 24px;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: var(--lp-teal);
  background: var(--lp-cream);
  border-radius: 10px;
  border: 2px solid var(--lp-teal);
}

/* Info grid */
.lp-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.lp-info-card {
  background: var(--lp-paper);
  border: 2px solid var(--lp-ink);
  border-radius: 14px;
  padding: 18px;
  cursor: default;
  transition: transform .15s, background .15s;
}
.lp-info-card:hover {
  transform: rotate(-1deg);
  background: var(--lp-cream);
}

.lp-info-ico {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: var(--lp-ink);
  color: var(--lp-paper);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  margin-bottom: 10px;
}
.lp-info-title {
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 15px;
  color: var(--lp-ink);
  margin-bottom: 4px;
}
.lp-info-val {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--lp-ink-soft);
}

@media (max-width: 880px) {
  .lp-contact-grid { grid-template-columns: 1fr; }
  .lp-info-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .lp-info-grid { grid-template-columns: 1fr; }
}
</style>
