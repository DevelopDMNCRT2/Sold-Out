<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="px-5 py-3 text-left w-1/12 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">ID</p>
            </th>
            <th class="px-5 py-3 text-left w-3/12 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Evento</p>
            </th>
            <th class="px-5 py-3 text-left w-2/12 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Fecha</p>
            </th>
            <th class="px-5 py-3 text-left w-2/12 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Estado</p>
            </th>
            <th class="px-5 py-3 text-left w-2/12 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Boletos Vendidos</p>
            </th>
            <th class="px-5 py-3 text-left w-2/12 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="event in events" :key="event.id" class="border-t border-gray-100 dark:border-gray-800">
            <td class="px-5 py-4 sm:px-6">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ event.id }}</p>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ event.name }}</span>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ event.date }}</p>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <span :class="['rounded-full px-2 py-0.5 text-theme-xs font-medium', getStatusColor(event.status)]">
                {{ event.status }}
              </span>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                {{ event.ticketTiers?.reduce((acc, tier) => acc + tier.sold, 0) || 0 }}
              </p>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <div class="flex items-center gap-3">
                <button @click="router.push('/eventos/' + event.id)" class="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors" title="Ver Detalles">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button @click="router.push('/eventos/' + event.id)" class="text-gray-500 hover:text-warning-500 dark:text-gray-400 dark:hover:text-warning-400 transition-colors" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>
                <button @click="deleteEvent(event)" class="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400 transition-colors" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const events = ref([])

onMounted(async () => {
  try {
    const response = await api.get('/events')
    events.value = response.data
  } catch (error) {
    console.error("Error fetching events:", error)
  }
})

const getStatusColor = (status) => {
  switch (status) {
    case 'Publicado': return 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500'
    case 'Finalizado': return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
    case 'SoldOut': return 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
    case 'Cancelado': return 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500'
    case 'Borrador': default: return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
}

const deleteEvent = (event) => {
  if (confirm(`¿Estás seguro de que deseas eliminar el evento "${event.name}"?`)) {
    events.value = events.value.filter(e => e.id !== event.id)
  }
}

</script>
