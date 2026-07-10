<template>
  <router-link to="/" class="lg:hidden text-gray-900 dark:text-white flex items-center">
    <svg viewBox="0 0 190 40" xmlns="http://www.w3.org/2000/svg" class="h-8 w-auto">
      <circle cx="15" cy="20" r="10" fill="#c92a2a" />
      <circle cx="25" cy="20" r="10" fill="currentColor" opacity="0.8" />
      <text x="45" y="28" font-family="Outfit, sans-serif" font-weight="900" font-size="24" fill="currentColor" letter-spacing="0">
        SOLD OUT
      </text>
    </svg>
  </router-link>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
