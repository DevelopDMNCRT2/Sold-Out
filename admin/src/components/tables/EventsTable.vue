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
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ event.ticketsSold }}</p>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <div class="flex items-center gap-3">
                <button @click="viewEvent(event)" class="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors" title="Ver">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button @click="editEvent(event)" class="text-gray-500 hover:text-warning-500 dark:text-gray-400 dark:hover:text-warning-400 transition-colors" title="Editar">
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

  <!-- View Modal -->
  <Modal v-if="isViewModalOpen" @close="isViewModalOpen = false" :fullScreenBackdrop="true">
    <template #body>
      <div class="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden p-6 z-50 transform transition-all">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Detalles del Evento</h3>
          <button @click="isViewModalOpen = false" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div v-if="selectedEvent" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">ID</label>
            <p class="mt-1 text-base text-gray-900 dark:text-white">{{ selectedEvent.id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Evento</label>
            <p class="mt-1 text-base text-gray-900 dark:text-white">{{ selectedEvent.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Fecha</label>
            <p class="mt-1 text-base text-gray-900 dark:text-white">{{ selectedEvent.date }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Estado</label>
            <span :class="['mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium', getStatusColor(selectedEvent.status)]">
              {{ selectedEvent.status }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Boletos Vendidos</label>
            <p class="mt-1 text-base text-gray-900 dark:text-white">{{ selectedEvent.ticketsSold }}</p>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <button @click="isViewModalOpen = false" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </template>
  </Modal>

  <!-- Edit Modal -->
  <Modal v-if="isEditModalOpen" @close="isEditModalOpen = false" :fullScreenBackdrop="true">
    <template #body>
      <div class="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden p-6 z-50 transform transition-all">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Editar Evento</h3>
          <button @click="isEditModalOpen = false" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div v-if="selectedEvent" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Evento</label>
            <input v-model="selectedEvent.name" type="text" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
            <input v-model="selectedEvent.date" type="date" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <select v-model="selectedEvent.status" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400">
              <option value="Borrador">Borrador</option>
              <option value="Publicado">Publicado</option>
              <option value="Finalizado">Finalizado</option>
              <option value="SoldOut">SoldOut</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Boletos Vendidos</label>
            <input v-model="selectedEvent.ticketsSold" type="number" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400" />
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button @click="isEditModalOpen = false" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button @click="saveEvent" class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </template>
  </Modal>

  <!-- New Event Modal -->
  <Modal v-if="isNewModalOpen" @close="isNewModalOpen = false" :fullScreenBackdrop="true">
    <template #body>
      <div class="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden p-6 z-50 transform transition-all">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Nuevo Evento</h3>
          <button @click="isNewModalOpen = false" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Evento</label>
            <input v-model="newEvent.name" type="text" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
            <input v-model="newEvent.date" type="date" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <select v-model="newEvent.status" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400">
              <option value="Borrador">Borrador</option>
              <option value="Publicado">Publicado</option>
              <option value="Finalizado">Finalizado</option>
              <option value="SoldOut">SoldOut</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
          <p v-if="newEventError" class="text-error-500 text-sm mt-1">{{ newEventError }}</p>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button @click="isNewModalOpen = false" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button @click="createNewEvent" class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">
            Crear
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import Modal from '@/components/ui/Modal.vue'

const events = ref([
  { id: '1', name: 'Concierto BLNKO', date: '2026-08-15', status: 'Publicado', ticketsSold: 450 },
  { id: '2', name: 'Festival Indie', date: '2026-09-10', status: 'SoldOut', ticketsSold: 3000 },
  { id: '3', name: 'Noche de Comedia', date: '2026-10-05', status: 'Borrador', ticketsSold: 0 },
  { id: '4', name: 'Presentación Libro', date: '2026-07-01', status: 'Finalizado', ticketsSold: 120 },
  { id: '5', name: 'Evento VIP Cancelado', date: '2026-11-20', status: 'Cancelado', ticketsSold: 0 },
])

const isViewModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isNewModalOpen = ref(false)
const selectedEvent = ref(null)

const newEvent = ref({ name: '', date: '', status: 'Borrador', ticketsSold: 0 })
const newEventError = ref('')

const getStatusColor = (status) => {
  switch (status) {
    case 'Publicado': return 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500'
    case 'Finalizado': return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
    case 'SoldOut': return 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
    case 'Cancelado': return 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500'
    case 'Borrador': default: return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
}

const openNewEventModal = () => {
  newEvent.value = { name: '', date: '', status: 'Borrador', ticketsSold: 0 }
  newEventError.value = ''
  isNewModalOpen.value = true
}

const createNewEvent = () => {
  if (!newEvent.value.name || !newEvent.value.date) {
    newEventError.value = 'Por favor llena los campos Evento y Fecha.'
    return
  }
  
  const nextId = (events.value.length > 0 ? Math.max(...events.value.map(e => parseInt(e.id))) + 1 : 1).toString()
  
  events.value.push({
    id: nextId,
    name: newEvent.value.name,
    date: newEvent.value.date,
    status: newEvent.value.status,
    ticketsSold: 0
  })
  
  isNewModalOpen.value = false
}

const viewEvent = (event) => {
  selectedEvent.value = event
  isViewModalOpen.value = true
}

const editEvent = (event) => {
  selectedEvent.value = { ...event }
  isEditModalOpen.value = true
}

const saveEvent = () => {
  if (selectedEvent.value) {
    const index = events.value.findIndex(e => e.id === selectedEvent.value.id)
    if (index !== -1) {
      events.value[index] = { ...selectedEvent.value }
    }
  }
  isEditModalOpen.value = false
}

const deleteEvent = (event) => {
  if (confirm(`¿Estás seguro de que deseas eliminar el evento "${event.name}"?`)) {
    events.value = events.value.filter(e => e.id !== event.id)
  }
}

defineExpose({
  openNewEventModal
})
</script>
