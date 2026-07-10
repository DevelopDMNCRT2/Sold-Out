<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="px-5 py-3 text-left w-2/12 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">ID</p>
            </th>
            <th class="px-5 py-3 text-left w-3/12 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Nombre</p>
            </th>
            <th class="px-5 py-3 text-left w-4/12 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Correo</p>
            </th>
            <th class="px-5 py-3 text-left w-3/12 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Boletos comprados</p>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="customer in customers" :key="customer.id" class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
            <td class="px-5 py-4 sm:px-6">
              <p class="text-gray-500 font-medium text-theme-sm dark:text-gray-400">#{{ customer.id }}</p>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <span class="block font-semibold text-gray-800 text-theme-sm dark:text-white/90">{{ customer.name }}</span>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ customer.email }}</p>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <span class="inline-flex items-center justify-center rounded-full bg-brand-50 px-2.5 py-1 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400 text-theme-xs font-semibold">
                {{ customer.ticketsBought }}
              </span>
            </td>
          </tr>
          <tr v-if="customers.length === 0 && !loading" class="border-t border-gray-100 dark:border-gray-800">
            <td colspan="4" class="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
              No hay clientes registrados aún.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const customers = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await api.get('/customers')
    customers.value = response.data
  } catch (error) {
    console.error("Error fetching customers:", error)
  } finally {
    loading.value = false
  }
})
</script>
