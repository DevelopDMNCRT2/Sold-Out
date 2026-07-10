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
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Nombre</p>
            </th>
            <th class="px-5 py-3 text-left w-3/12 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Correo</p>
            </th>
            <th class="px-5 py-3 text-left w-2/12 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Rol</p>
            </th>
            <th class="px-5 py-3 text-left w-3/12 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="user in users" :key="user.id" class="border-t border-gray-100 dark:border-gray-800">
            <td class="px-5 py-4 sm:px-6">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ user.id }}</p>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ user.name }}</span>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">{{ user.email }}</p>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <span :class="['rounded-full px-2 py-0.5 text-theme-xs font-medium', user.role === 'Administrador' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400' : 'bg-gray-50 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400']">{{ user.role }}</span>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <div class="flex items-center gap-3">
                <button @click="viewUser(user)" class="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors" title="Ver">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button @click="editUser(user)" class="text-gray-500 hover:text-warning-500 dark:text-gray-400 dark:hover:text-warning-400 transition-colors" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>
                <button @click="deleteUser(user)" class="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400 transition-colors" title="Borrar">
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
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Detalles del Usuario</h3>
          <button @click="isViewModalOpen = false" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div v-if="selectedUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">ID</label>
            <p class="mt-1 text-base text-gray-900 dark:text-white">{{ selectedUser.id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</label>
            <p class="mt-1 text-base text-gray-900 dark:text-white">{{ selectedUser.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Correo</label>
            <p class="mt-1 text-base text-gray-900 dark:text-white">{{ selectedUser.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Rol</label>
            <span :class="['mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium', selectedUser.role === 'Administrador' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400' : 'bg-gray-50 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400']">{{ selectedUser.role }}</span>
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
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Editar Usuario</h3>
          <button @click="isEditModalOpen = false" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div v-if="selectedUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input v-model="selectedUser.name" type="text" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo</label>
            <input v-model="selectedUser.email" type="email" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
            <select v-model="selectedUser.role" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400">
              <option value="Administrador">Administrador</option>
              <option value="Usuario">Usuario</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button @click="isEditModalOpen = false" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button @click="saveUser" class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </template>
  </Modal>

  <!-- New User Modal -->
  <Modal v-if="isNewModalOpen" @close="isNewModalOpen = false" :fullScreenBackdrop="true">
    <template #body>
      <div class="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden p-6 z-50 transform transition-all">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Nuevo Usuario</h3>
          <button @click="isNewModalOpen = false" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input v-model="newUser.name" type="text" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo</label>
            <input v-model="newUser.email" type="email" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
            <select v-model="newUser.role" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400">
              <option value="Administrador">Administrador</option>
              <option value="Usuario">Usuario</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
            <input v-model="newUser.password" type="password" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Contraseña</label>
            <input v-model="newUser.confirmPassword" type="password" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400" />
          </div>
          <p v-if="newUserError" class="text-error-500 text-sm mt-1">{{ newUserError }}</p>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button @click="isNewModalOpen = false" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors">
            Cancelar
          </button>
          <button @click="createNewUser" class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">
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

const users = ref([
  { id: '1', name: 'Ana Garcia', email: 'ana@example.com', role: 'Administrador' },
  { id: '2', name: 'Carlos Lopez', email: 'carlos@example.com', role: 'Usuario' },
  { id: '3', name: 'María Fernandez', email: 'maria@example.com', role: 'Staff' },
])

const isViewModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isNewModalOpen = ref(false)
const selectedUser = ref(null)

const newUser = ref({ name: '', email: '', role: 'Usuario', password: '', confirmPassword: '' })
const newUserError = ref('')

const openNewUserModal = () => {
  newUser.value = { name: '', email: '', role: 'Usuario', password: '', confirmPassword: '' }
  newUserError.value = ''
  isNewModalOpen.value = true
}

const createNewUser = () => {
  if (!newUser.value.name || !newUser.value.email || !newUser.value.password) {
    newUserError.value = 'Por favor llena todos los campos requeridos.'
    return
  }
  if (newUser.value.password !== newUser.value.confirmPassword) {
    newUserError.value = 'Las contraseñas no coinciden.'
    return
  }
  
  const nextId = (users.value.length > 0 ? Math.max(...users.value.map(u => parseInt(u.id))) + 1 : 1).toString()
  
  users.value.push({
    id: nextId,
    name: newUser.value.name,
    email: newUser.value.email,
    role: newUser.value.role,
  })
  
  isNewModalOpen.value = false
}

const viewUser = (user) => {
  selectedUser.value = user
  isViewModalOpen.value = true
}

const editUser = (user) => {
  selectedUser.value = { ...user } // create a copy for editing
  isEditModalOpen.value = true
}

const saveUser = () => {
  if (selectedUser.value) {
    const index = users.value.findIndex(u => u.id === selectedUser.value.id)
    if (index !== -1) {
      users.value[index] = { ...selectedUser.value }
    }
  }
  isEditModalOpen.value = false
}

const deleteUser = (user) => {
  if (confirm(`¿Estás seguro de que deseas borrar al usuario ${user.name}?`)) {
    users.value = users.value.filter(u => u.id !== user.id)
  }
}

defineExpose({
  openNewUserModal
})
</script>
