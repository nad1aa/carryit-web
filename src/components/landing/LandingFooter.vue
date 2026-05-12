<template>
  <footer class="lp-footer">
    <div class="lp-footer-row">
      <!-- Logo + wordmark -->
      <div class="lp-footer-brand">
        <img src="/assets/logo.png" alt="CarryIt" class="lp-footer-logo" />
        <span class="lp-footer-word">CarryIt</span>
      </div>

      <!-- Links -->
      <div class="lp-footer-links">
        <router-link v-for="link in links" :key="link.label" :to="link.to">{{ link.label }}</router-link>
      </div>

      <!-- Copyright -->
      <div class="lp-footer-copy">© 2026 carryit · made in tunis</div>
    </div>

    <!-- Marquee strip -->
    <div class="lp-footer-marquee">
      <div class="lp-marquee-track">
        <template v-for="n in 2" :key="n">
          <span>★ tunis → paris</span><span class="lp-msep">·</span>
          <span>sfax → marseille</span><span class="lp-msep">·</span>
          <span>algiers → rome</span><span class="lp-msep">·</span>
          <span>casablanca → madrid</span><span class="lp-msep">·</span>
          <span>cairo → istanbul</span><span class="lp-msep">·</span>
          <span>dakar → london</span><span class="lp-msep">·</span>
          <span>tunis → berlin</span><span class="lp-msep">·</span>
        </template>
      </div>
    </div>
  </footer>
</template>

<script setup>
const links = [
  { label: 'About',  to: '/about'        },
  { label: 'Privacy', to: '/about'       },
  { label: 'Terms',   to: '/about'       },
  { label: 'Sign Up', to: '/auth/signup' },
  { label: 'Sign In', to: '/auth/signin' },
]
</script>

<style scoped>
.lp-footer {
  background: var(--lp-ink);
  color: var(--lp-paper);
  padding: 44px 64px 0;
  overflow: hidden;
}

.lp-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  padding-bottom: 32px;
}

/* Brand */
.lp-footer-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}
.lp-footer-logo {
  width: 54px;
  height: 54px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}
.lp-footer-word {
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  font-size: 36px;
  letter-spacing: -0.02em;
  color: var(--lp-paper);
}

/* Links */
.lp-footer-links {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.lp-footer-links a {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(241,231,208,.7);
  text-decoration: none;
  padding: 6px 10px;
  transition: color .15s;
}
.lp-footer-links a:hover { color: var(--lp-gold); }

/* Copyright */
.lp-footer-copy {
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: 13px;
  color: rgba(241,231,208,.55);
}

/* Marquee */
.lp-footer-marquee {
  border-top: 1px dashed rgba(241,231,208,.25);
  overflow: hidden;
  padding: 14px 0;
}
.lp-marquee-track {
  display: flex;
  gap: 16px;
  align-items: center;
  white-space: nowrap;
  animation: lpMarquee 28s linear infinite;
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: 13px;
  color: var(--lp-gold);
}
.lp-msep {
  opacity: .4;
}

@keyframes lpMarquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@media (max-width: 880px) {
  .lp-footer { padding: 32px 20px 0; }
  .lp-footer-row { flex-direction: column; align-items: flex-start; }
}
</style>
