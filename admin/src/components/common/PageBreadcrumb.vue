<template>
  <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
    <h2 class="text-xl font-semibold text-gray-800 dark:text-white/90">
      {{ pageTitle }}
    </h2>
    <div class="flex items-center gap-4">

    <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface BreadcrumbProps {
  pageTitle: string
}

defineProps<BreadcrumbProps>()
</script>
