<template>
  <div ref="el" :class="classes">
    <slot />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  variant: { type: String, default: undefined }, // 'from-left' | 'from-right' | 'rotate'
  delay:   { type: Number, default: 0 },         // 1-5
})

const el = ref(null)
let observer = null

const classes = computed(() => {
  const c = ['reveal']
  if (props.variant) c.push(props.variant)
  if (props.delay)   c.push(`delay-${props.delay}`)
  return c
})

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.value?.classList.add('in')
    return
  }
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        el.value?.classList.add('in')
        observer?.unobserve(el.value)
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )
  if (el.value) observer.observe(el.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>
