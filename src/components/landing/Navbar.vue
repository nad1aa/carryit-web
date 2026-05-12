<template>
  <nav class="lp-nav">
    <router-link class="lp-nav-logo" to="/">
      <img src="/assets/logo.png" alt="CarryIt" />
      <span class="lp-nav-word">CarryIt</span>
    </router-link>
    <div class="lp-nav-links">
      <a href="#about"   @click.prevent="scrollTo('about')">About</a>
      <a href="#how"     @click.prevent="scrollTo('how')">How it works</a>
      <a href="#contact" @click.prevent="scrollTo('contact')">Contact</a>
      <router-link to="/auth/signin" class="lp-nav-link-router">Login</router-link>
      <router-link to="/auth/onboarding" class="lp-nav-cta">Get Started →</router-link>
    </div>
  </nav>
</template>

<script setup>
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.lp-nav {
  position: sticky;
  top: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 36px;
  background: rgba(241,231,208,.88);
  backdrop-filter: blur(6px);
  border-bottom: 2px dashed rgba(23,26,58,.22);
}

.lp-nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.lp-nav-logo img {
  width: 46px;
  height: 46px;
  object-fit: contain;
}
.lp-nav-word {
  font-family: 'Montserrat', sans-serif;
  font-weight: 900;
  font-size: 26px;
  color: var(--lp-ink);
  letter-spacing: -0.02em;
}

.lp-nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}
.lp-nav-links a {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lp-ink);
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 30px;
  border: 2px solid transparent;
  transition: background 0.15s, border-color 0.15s;
}
.lp-nav-links a:hover {
  background: var(--lp-cream);
  border-color: var(--lp-ink);
}
.lp-nav-cta {
  background: var(--lp-ink) !important;
  color: #fff !important;
  border-color: var(--lp-ink) !important;
}
.lp-nav-cta:hover {
  background: var(--lp-stamp-red) !important;
  border-color: var(--lp-stamp-red) !important;
}

/* router-link inherits the same styles as <a> already since we use the same class */
.lp-nav-link-router {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lp-ink);
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 30px;
  border: 2px solid transparent;
  transition: background 0.15s, border-color 0.15s;
}
.lp-nav-link-router:hover {
  background: var(--lp-cream);
  border-color: var(--lp-ink);
}

@media (max-width: 880px) {
  .lp-nav { padding: 12px 20px; }
  .lp-nav-links a { padding: 8px 10px; font-size: 11px; }
}
@media (max-width: 600px) {
  .lp-nav-links a:not(.lp-nav-cta):not(:last-child) { display: none; }
}
</style>
