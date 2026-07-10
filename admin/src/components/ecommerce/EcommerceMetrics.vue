<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
    <div
      v-for="(metric, index) in metrics"
      :key="index"
      class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
    >
      <div
        class="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800"
      >
        <component
          :is="metric.icon"
          class="text-gray-800 dark:text-white/90 w-6 h-6"
        />
      </div>

      <div class="flex items-end justify-between mt-5">
        <div>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ metric.title }}</span>
          <h4 class="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{{ metric.value }}</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { DollarSignIcon, TicketIcon, CalendarIcon, UsersIcon } from 'lucide-vue-next'

const metrics = ref([
  {
    title: 'Ingresos Totales',
    value: '$1,200,000',
    icon: DollarSignIcon,
  },
  {
    title: 'Boletos Vendidos',
    value: '3,450',
    icon: TicketIcon,
  },
  {
    title: 'Eventos Activos',
    value: '12',
    icon: CalendarIcon,
  },
  {
    title: 'Clientes',
    value: '850',
    icon: UsersIcon,
  },
])
</script>
