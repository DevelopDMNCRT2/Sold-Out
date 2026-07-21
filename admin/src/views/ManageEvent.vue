<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle">
      <template #action>
        <div class="flex gap-3">
          <button @click="router.push('/eventos')" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors text-sm font-medium">
            {{ isReadOnly ? 'Volver' : 'Cancelar' }}
          </button>
          <button v-if="!isReadOnly" @click="saveEvent" class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors text-sm font-medium">
            Guardar Evento
          </button>
        </div>
      </template>
    </PageBreadcrumb>

    <!-- Tabs Navigation -->
    <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex gap-6 overflow-x-auto custom-scrollbar" aria-label="Tabs">
        <button 
          v-for="tab in visibleTabs" :key="tab.id"
          @click="currentTab = tab.id"
          :class="[
            currentTab === tab.id 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300',
            'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <div class="space-y-6">
      <!-- TAB 1: INFORMACIÓN GENERAL -->
      <div v-if="currentTab === 'informacion'" class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <fieldset :disabled="isReadOnly" class="contents">
        
        <!-- Main Content (Left Column) -->
        <div class="xl:col-span-2 space-y-6">
          <ComponentCard title="Información General">
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del evento *</label>
                  <input v-model="form.name" type="text" placeholder="Ej. Concierto BLNKO" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Artista *</label>
                  <input v-model="form.artist" type="text" placeholder="Ej. BLNKO" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción corta</label>
                <textarea v-model="form.shortDescription" rows="2" placeholder="Breve resumen del evento..." class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400"></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción completa</label>
                <textarea v-model="form.longDescription" rows="5" placeholder="Detalles, line-up, restricciones..." class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400"></textarea>
              </div>
            </div>
          </ComponentCard>
        </div>

        <!-- Sidebar (Right Column) - Images & Meta -->
        <div class="space-y-6">
          <ComponentCard title="Detalles & Imágenes">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                <select v-model="form.category" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400">
                  <option value="Concierto">Concierto</option>
                  <option value="Festival">Festival</option>
                  <option value="Meet & Greet">Meet & Greet</option>
                  <option value="Showcase">Showcase</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              
              <div class="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 pt-2">Imagen Portada (Cuadrada)</label>
                <div class="flex items-center justify-center w-full">
                    <label for="dropzone-file-1" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700">
                        <div v-if="!coverImagePreview" class="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 dark:text-gray-400">
                            <svg class="w-6 h-6 mb-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p class="mb-1 text-xs"><span class="font-semibold">Sube una imagen</span></p>
                        </div>
                        <img v-else :src="coverImagePreview" class="w-full h-full object-cover rounded-lg" />
                        <input id="dropzone-file-1" type="file" class="hidden" @change="handleCoverImageUpload" accept="image/*" />
                    </label>
                    <p v-if="coverImageName" class="mt-2 text-sm text-brand-600 dark:text-brand-400 font-medium text-center truncate w-full px-2">{{ coverImageName }}</p>
                </div>
              </div>
              
              <div class="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 pt-2">Banner Principal (Rectangular)</label>
                <div class="flex items-center justify-center w-full">
                    <label for="dropzone-file-2" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700">
                        <div v-if="!bannerImagePreview" class="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 dark:text-gray-400">
                            <svg class="w-6 h-6 mb-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p class="mb-1 text-xs"><span class="font-semibold">Sube un banner</span></p>
                        </div>
                        <img v-else :src="bannerImagePreview" class="w-full h-full object-cover rounded-lg" />
                        <input id="dropzone-file-2" type="file" class="hidden" @change="handleBannerImageUpload" accept="image/*" />
                    </label>
                    <p v-if="bannerImageName" class="mt-2 text-sm text-brand-600 dark:text-brand-400 font-medium text-center truncate w-full px-2">{{ bannerImageName }}</p>
                </div>
              </div>
            </div>
          </ComponentCard>
        </div>
        </fieldset>
      </div>
      
      <!-- TAB 2: FECHA Y LUGAR -->
      <div v-if="currentTab === 'lugar'" class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <fieldset :disabled="isReadOnly" class="contents">
        
        <!-- Main Content (Left Column) - Location -->
        <div class="xl:col-span-2 space-y-6">
          <ComponentCard title="Ubicación">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lugar (Foro/Recinto)</label>
                <input v-model="form.venue" type="text" placeholder="Ej. Foro Indie Rocks" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
                <input v-model="form.address" type="text" placeholder="Calle, número, colonia" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ciudad</label>
                  <input v-model="form.city" type="text" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                  <input v-model="form.state" type="text" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Maps URL (Opcional)</label>
                <input v-model="form.mapUrl" type="url" placeholder="https://maps.app.goo.gl/..." class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>
            </div>
          </ComponentCard>
        </div>

        <!-- Sidebar (Right Column) - Dates & Status -->
        <div class="space-y-6">
          <ComponentCard title="Programación">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha del evento</label>
                <input v-model="form.date" type="date" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>
              
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apertura</label>
                  <input v-model="form.doorsOpenTime" type="time" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inicio</label>
                  <input v-model="form.startTime" type="time" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                </div>
              </div>
              
              <div class="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado del evento</label>
                <select v-model="form.status" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                  <option value="Borrador">Borrador</option>
                  <option value="Publicado">Publicado</option>
                  <option value="SoldOut">SoldOut</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </ComponentCard>
        </div>
        </fieldset>
      </div>

      <!-- TAB 3: BOLETOS -->
      <div v-if="currentTab === 'boletos'" class="space-y-6">
        <fieldset :disabled="isReadOnly" class="contents">
        <ComponentCard title="Boletos y Accesos">
          <template #header-action v-if="!isReadOnly">
            <button @click="isTicketModalOpen = true" type="button" class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors text-xs font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Agregar boleto
            </button>
          </template>
          
          <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Tipo</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Precio</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Stock Total</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-gray-400" v-if="isEditMode">Vendidos</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-gray-400" v-if="isEditMode">Ingresos Estimados</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-gray-400" v-if="!isReadOnly">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200 dark:bg-transparent dark:divide-gray-700">
                <tr v-for="(ticket, idx) in tickets" :key="idx">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ ticket.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">${{ ticket.price }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">{{ ticket.stock }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 font-semibold dark:text-white" v-if="isEditMode">{{ ticket.sold }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-success-600 font-medium" v-if="isEditMode">${{ ticket.price * ticket.sold }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" v-if="!isReadOnly">
                    <div class="flex items-center justify-center gap-3">
                      <button @click="editTicket(idx)" class="text-gray-500 hover:text-warning-500 dark:text-gray-400 dark:hover:text-warning-400 transition-colors" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      </button>
                      <button @click="removeTicket(idx)" class="text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-400 transition-colors" title="Eliminar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="tickets.length === 0">
                  <td :colspan="isEditMode ? 6 : 4" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No hay boletos creados. Agrega uno para empezar.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ComponentCard>
        </fieldset>
      </div>

      <!-- TAB 4: VENTAS (Only visible in edit mode) -->
      <div v-if="currentTab === 'ventas'" class="space-y-6">
        
        <!-- KPIs -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4 shadow-sm">
            <div class="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total vendido</p>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">${{ totalVendido.toLocaleString() }}</h3>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4 shadow-sm">
            <div class="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Boletos vendidos</p>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ boletosVendidos }}</h3>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4 shadow-sm">
            <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Compras realizadas</p>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ comprasRealizadas }}</h3>
            </div>
          </div>
        </div>

        <ComponentCard title="Órdenes de Compra">
          <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Folio</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Comprador</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Tipo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Cantidad</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Total</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Fecha</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Estado</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200 dark:bg-transparent dark:divide-gray-700">
                <tr v-for="sale in sales" :key="sale.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-600 dark:text-brand-400" :title="sale.id">
                    #{{ sale.id.substring(0, 8).toUpperCase() }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {{ sale.buyer }}
                    <span class="block text-xs text-gray-500">{{ sale.email }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ sale.ticketType }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium dark:text-white">
                    {{ sale.qty }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold dark:text-white">
                    ${{ sale.total }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ sale.date }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span 
                      class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="{
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': sale.status === 'Pagado',
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': sale.status === 'Pendiente',
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': sale.status === 'Rechazado' || sale.status === 'Cancelado' || sale.status === 'Reembolsado'
                      }"
                    >
                      {{ sale.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-2">
                    <button @click="viewOrder(sale)" class="text-gray-500 hover:text-brand-500 transition-colors" title="Ver Orden">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button 
                      v-if="sale.status === 'Pagado'"
                      @click="changeOrderStatus(sale.id, 'Reembolsado')" 
                      class="text-red-500 hover:text-red-700 transition-colors" 
                      title="Cancelar / Reembolsar Orden"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="sales.length === 0">
                  <td colspan="8" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Todavía no hay ventas para este evento.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>

      <!-- TAB 5: ASISTENCIA -->
      <div v-if="currentTab === 'asistencia'" class="space-y-6">
        
        <!-- KPIs de Asistencia -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4 shadow-sm">
            <div class="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Boletos Emitidos</p>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ attendanceSummary.totalSold }}</h3>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4 shadow-sm">
            <div class="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Ingresados (Escaneados)</p>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ attendanceSummary.totalScanned }}</h3>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4 shadow-sm">
            <div class="w-12 h-12 rounded-full bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Pendientes por Ingresar</p>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ attendanceSummary.pending }}</h3>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4 shadow-sm">
            <div class="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400">% de Asistencia</p>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ attendanceSummary.percentage }}%</h3>
            </div>
          </div>
        </div>

        <!-- Tabla de Asistentes -->
        <ComponentCard title="Registro de Asistentes (Boletos Validados)">
          <template #header-action>
            <div class="flex items-center gap-3">
              <button @click="exportAttendancePDF" type="button" class="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
                Exportar PDF
              </button>
              <button @click="loadAttendanceData" type="button" class="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                Actualizar
              </button>
            </div>
          </template>
          <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Comprador</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Tipo de Boleto</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Hora de Ingreso</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">ID Dispositivo Escáner</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200 dark:bg-transparent dark:divide-gray-700">
                <tr v-for="ticket in scannedList" :key="ticket.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {{ ticket.buyerName }}
                    <span class="block text-xs text-gray-500">{{ ticket.buyerEmail }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300">
                      {{ ticket.tierName }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    {{ formatDate(ticket.scannedAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {{ ticket.scannedByDeviceId ? ticket.scannedByDeviceId.substring(0, 13) + '...' : 'Escáner General' }}
                  </td>
                </tr>
                <tr v-if="scannedList.length === 0">
                  <td colspan="4" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aún no se ha escaneado ningún boleto para este evento.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>

      <!-- TAB 6: CONFIGURACIÓN -->
      <div v-if="currentTab === 'configuracion'" class="space-y-6 max-w-3xl">
        <fieldset :disabled="isReadOnly" class="contents">
        <ComponentCard title="Configuración General del Evento">
          <div class="space-y-6">
            <label class="flex items-center gap-3 cursor-pointer">
              <div class="relative">
                <input v-model="form.settings.featured" type="checkbox" class="sr-only peer" />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Evento destacado en la página de inicio</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer">
              <div class="relative">
                <input v-model="form.settings.showCountdown" type="checkbox" class="sr-only peer" />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar contador regresivo para la venta</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer">
              <div class="relative">
                <input v-model="form.settings.allowMultiple" type="checkbox" class="sr-only peer" />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Permitir compra múltiple (diferentes tipos de boletos)</span>
            </label>
            
            <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-4">Límites de Compra</h4>
              <label class="flex items-center gap-3 cursor-pointer mb-4">
                <div class="relative">
                  <input v-model="form.settings.limitPerPerson" type="checkbox" class="sr-only peer" />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Limitar boletos por persona</span>
              </label>

              <div v-if="form.settings.limitPerPerson" class="pl-14 transition-all">
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Cantidad máxima permitida por usuario</label>
                <input v-model="form.settings.maxTicketsPerPerson" type="number" min="1" class="w-24 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
        </ComponentCard>
      </fieldset>

        <!-- SECCIÓN DE CONFIGURACIÓN DEL ESCÁNER -->
        <ComponentCard title="🔒 Control de Acceso y Escáner de Puerta">
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- PIN de Escáner -->
              <div class="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">PIN del Evento</label>
                <div class="flex items-center gap-2">
                  <span class="text-3xl font-mono font-bold tracking-widest text-brand-600 dark:text-brand-400 bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    {{ scannerConfig.scannerPin || '******' }}
                  </span>
                  <button @click="regeneratePin" type="button" class="p-2.5 text-gray-600 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors" title="Generar Nuevo PIN">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                  </button>
                </div>
              </div>

              <!-- Límite de Dispositivos -->
              <div class="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Límite de Dispositivos Autorizados</label>
                <div class="flex items-center gap-3">
                  <select v-model="scannerConfig.maxDevices" @change="saveScannerSettings" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white font-medium">
                    <option :value="1">1 Dispositivo</option>
                    <option :value="2">2 Dispositivos (Recomendado)</option>
                    <option :value="3">3 Dispositivos</option>
                    <option :value="5">5 Dispositivos</option>
                    <option :value="10">10 Dispositivos</option>
                    <option :value="50">50 Dispositivos (Sin límite práctico)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Link Directo para Staff -->
            <div class="p-4 rounded-xl border border-brand-200 dark:border-brand-900/50 bg-brand-50/50 dark:bg-brand-950/20">
              <label class="block text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider mb-2">Enlace Directo para Staff</label>
              <div class="flex gap-2">
                <input :value="scannerLink" readonly class="w-full text-xs font-mono bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200" />
                <button @click="copyScannerLink" type="button" class="px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Copiar
                </button>
              </div>
            </div>

            <!-- Lista de Dispositivos Conectados -->
            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Dispositivos Actualmente Conectados ({{ pairedDevices.length }} / {{ scannerConfig.maxDevices }})
              </h4>

              <div class="space-y-3">
                <div v-for="device in pairedDevices" :key="device.id" class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ device.deviceName || 'Navegador Web' }}</p>
                      <p class="text-xs text-gray-400 font-mono">ID: {{ device.deviceId.substring(0, 16) }}...</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-4">
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      Vinculado: {{ formatDate(device.pairedAt) }}
                    </span>
                    <button @click="revokeDeviceAccess(device.id)" type="button" class="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-md text-xs font-medium transition-colors">
                      Revocar
                    </button>
                  </div>
                </div>

                <div v-if="pairedDevices.length === 0" class="text-center py-6 text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                  No hay dispositivos registrados para este evento aún.
                </div>
              </div>
            </div>

          </div>
        </ComponentCard>
      </div>
    </div>

    <!-- Ticket Modal -->
    <Modal v-if="isTicketModalOpen" @close="closeTicketModal" :fullScreenBackdrop="true">
      <template #body>
        <div class="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden p-6 z-50 transform transition-all">
          <div class="flex justify-between items-center mb-5">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Agregar Boleto</h3>
            <button @click="closeTicketModal" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre (Tipo)</label>
              <input v-model="newTicket.name" type="text" placeholder="Ej. General, VIP..." class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio ($)</label>
                <input v-model="newTicket.price" type="number" min="0" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cantidad (Stock)</label>
                <input v-model="newTicket.stock" type="number" min="1" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button @click="closeTicketModal" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg dark:bg-gray-800 dark:text-white transition-colors">
              Cancelar
            </button>
            <button @click="saveTicket" class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">
              Guardar
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Order Details Modal -->
    <Modal v-if="isOrderModalOpen" @close="isOrderModalOpen = false" :fullScreenBackdrop="true">
      <template #body>
        <div class="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden p-6 z-50 transform transition-all">
          <div class="flex justify-between items-start mb-5">
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">Detalle de Orden</h3>
              <p class="text-sm text-brand-600 dark:text-brand-400 font-medium">#{{ selectedOrder?.id }}</p>
            </div>
            <button @click="isOrderModalOpen = false" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          
          <div class="space-y-6">
            <!-- Comprador Info -->
            <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Información del Comprador</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Nombre</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ selectedOrder?.buyer }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p class="font-medium text-gray-900 dark:text-white truncate">{{ selectedOrder?.email }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Fecha de compra</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ selectedOrder?.date }}</p>
                </div>
              </div>
            </div>

            <!-- Resumen de Boletos -->
            <div>
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Boletos Comprados</h4>
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cant.</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td class="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{{ selectedOrder?.ticketType }}</td>
                      <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">{{ selectedOrder?.qty }}</td>
                      <td class="px-4 py-3 text-sm text-gray-900 dark:text-white font-bold text-right">${{ selectedOrder?.total }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
          <div class="mt-8 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
            <div class="flex items-center gap-2">
              <button 
                v-if="selectedOrder?.status === 'Pagado'"
                @click="changeOrderStatus(selectedOrder.id, 'Reembolsado')" 
                type="button" 
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Cancelar y Reembolsar Orden
              </button>
              <button 
                v-if="selectedOrder?.status === 'Cancelado' || selectedOrder?.status === 'Reembolsado'"
                @click="changeOrderStatus(selectedOrder.id, 'Pagado')" 
                type="button" 
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Reactivar / Marcar como Pagado
              </button>
            </div>
            <button @click="isOrderModalOpen = false" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg dark:bg-gray-800 dark:text-white transition-colors font-medium text-sm">
              Cerrar
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { jsPDF } from "jspdf";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import Modal from "@/components/ui/Modal.vue";
import api from "@/services/api";

const route = useRoute();
const router = useRouter();

// Determinar si estamos creando un nuevo evento o editando uno existente
const isEditMode = computed(() => route.params.id !== undefined && route.params.id !== 'nuevo');
const eventId = route.params.id;
const isReadOnly = computed(() => route.query.mode === 'view');

const currentPageTitle = computed(() => {
  if (isReadOnly.value) return `Ver Detalles del Evento #${eventId}`;
  return isEditMode.value ? `Administrar Evento #${eventId}` : 'Crear Nuevo Evento';
});

const currentTab = ref('informacion');

// Las pestañas disponibles varían según el modo
const tabs = [
  { id: 'informacion', name: '1. Información' },
  { id: 'lugar', name: '2. Fecha y Lugar' },
  { id: 'boletos', name: '3. Boletos' },
  { id: 'ventas', name: '4. Ventas' },
  { id: 'asistencia', name: '5. Asistencia' },
  { id: 'configuracion', name: '6. Configuración' }
];

const visibleTabs = computed(() => {
  if (isEditMode.value) return tabs;
  return tabs.filter(tab => tab.id !== 'ventas' && tab.id !== 'asistencia');
});

// Estado del formulario
const form = reactive({
  name: "",
  artist: "",
  category: "Concierto",
  shortDescription: "",
  longDescription: "",
  date: "",
  startTime: "",
  doorsOpenTime: "",
  venue: "",
  address: "",
  city: "",
  state: "",
  mapUrl: "",
  status: "Borrador",
  coverImage: "",
  bannerImage: "",
  settings: {
    featured: false,
    showCountdown: true,
    allowMultiple: true,
    limitPerPerson: false,
    maxTicketsPerPerson: 6
  }
});

// Boletos
const tickets = ref([]);
const isTicketModalOpen = ref(false);
const newTicket = ref({ name: '', price: 0, stock: 1 });

// Ventas
const sales = ref([]);
const isOrderModalOpen = ref(false);
const selectedOrder = ref(null);

const viewOrder = (sale) => {
  selectedOrder.value = sale;
  isOrderModalOpen.value = true;
};

const changeOrderStatus = async (orderId, newStatus) => {
  const confirmMsg = newStatus === 'Reembolsado' || newStatus === 'Cancelado'
    ? `¿Estás seguro de cancelar y reembolsar la orden #${orderId}? Se invalidarán sus boletos en el escáner y se enviará la solicitud de reembolso a Mercado Pago.`
    : `¿Deseas cambiar el estado de la orden #${orderId} a "${newStatus}"?`;

  if (!confirm(confirmMsg)) return;

  try {
    const res = await api.put(`/orders/${orderId}/status`, {
      status: newStatus,
      refundMercadoPago: true
    });
    alert(res.data.message || 'Estado de la orden actualizado correctamente.');
    isOrderModalOpen.value = false;

    loadEventData();
    loadAttendanceData();
  } catch (err) {
    console.error('Error al actualizar estado de la orden:', err);
    alert('Error al actualizar la orden: ' + (err.response?.data?.error || err.message));
  }
};

const totalVendido = computed(() => {
  return sales.value.reduce((acc, sale) => acc + sale.total, 0);
});

const boletosVendidos = computed(() => {
  return sales.value.reduce((acc, sale) => acc + sale.qty, 0);
});

const comprasRealizadas = computed(() => {
  return sales.value.length;
});

const loadEventData = async () => {
  if (!isEditMode.value) return;
  try {
    const response = await api.get(`/events/${eventId}`);
    const data = response.data;
    
    Object.assign(form, {
      name: data.name,
      artist: data.artist,
      category: data.category,
      shortDescription: data.shortDescription,
      longDescription: data.longDescription,
      date: data.date,
      startTime: data.startTime,
      doorsOpenTime: data.doorsOpenTime,
      venue: data.venue,
      address: data.address,
      city: data.city,
      state: data.state,
      mapUrl: data.mapUrl,
      status: data.status,
      coverImage: data.coverImage,
      bannerImage: data.bannerImage,
      settings: {
        featured: data.featured,
        showCountdown: data.showCountdown,
        allowMultiple: data.allowMultiple,
        limitPerPerson: data.limitPerPerson,
        maxTicketsPerPerson: data.maxTicketsPerPerson
      }
    });
    
    coverImagePreview.value = data.coverImage || '';
    bannerImagePreview.value = data.bannerImage || '';
    tickets.value = data.ticketTiers || [];
    sales.value = data.orders || [];
    
    loadScannerConfig();
    loadAttendanceData();
  } catch (error) {
    console.error("Error loading event:", error);
  }
};

onMounted(async () => {
  await loadEventData();
});

// Asistencia y Escáner State
const attendanceSummary = ref({ totalSold: 0, totalScanned: 0, pending: 0, percentage: 0 });
const scannedList = ref([]);
const pairedDevices = ref([]);
const scannerConfig = reactive({ scannerPin: '', maxDevices: 2 });

const scannerLink = computed(() => {
  const origin = window.location.origin;
  return `${origin}/validador?pin=${scannerConfig.scannerPin}`;
});

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
};

const loadAttendanceData = async () => {
  if (!isEditMode.value) return;
  try {
    const res = await api.get(`/scanner/attendance/${eventId}`);
    attendanceSummary.value = res.data.summary;
    scannedList.value = res.data.scannedList;
    pairedDevices.value = res.data.devices;
  } catch (err) {
    console.error('Error al cargar datos de asistencia:', err);
  }
};

const exportAttendancePDF = () => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [201, 42, 42]; // SoldOut Red
    const darkColor = [30, 41, 59]; // Slate 800
    const lightBg = [248, 250, 252];

    // Encabezado principal
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 22, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("SOLD OUT", 14, 14);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Reporte Oficial de Asistencia de Puerta", 125, 14);

    // Caja de Información del Evento
    doc.setFillColor(...lightBg);
    doc.rect(14, 28, 182, 30, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, 28, 182, 30, 'S');

    doc.setTextColor(...darkColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(form.name || "Evento", 18, 36);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Artista: ${form.artist || 'N/A'}`, 18, 42);
    doc.text(`Lugar: ${form.venue || 'N/A'} (${form.city || ''})`, 18, 47);
    doc.text(`Fecha del Evento: ${form.date || 'N/A'}`, 18, 52);

    const reportDate = new Date().toLocaleString('es-MX');
    doc.text(`Generado: ${reportDate}`, 125, 52);

    // Resumen de Métricas
    doc.setFillColor(241, 245, 249);
    doc.rect(14, 63, 182, 18, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, 63, 182, 18, 'S');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    doc.setTextColor(30, 41, 59);
    doc.text(`Emitidos: ${attendanceSummary.value.totalSold}`, 18, 74);

    doc.setTextColor(16, 185, 129);
    doc.text(`Escaneados: ${attendanceSummary.value.totalScanned}`, 65, 74);

    doc.setTextColor(245, 158, 11);
    doc.text(`Pendientes: ${attendanceSummary.value.pending}`, 115, 74);

    doc.setTextColor(99, 102, 241);
    doc.text(`Asistencia: ${attendanceSummary.value.percentage}%`, 162, 74);

    // Título Tabla
    doc.setTextColor(...darkColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Registro de Asistentes Validados en Puerta", 14, 90);

    // Encabezado de Tabla
    let y = 95;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 8, 'F');

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Comprador", 18, y + 5.5);
    doc.text("Tipo de Boleto", 85, y + 5.5);
    doc.text("Hora de Ingreso", 130, y + 5.5);
    doc.text("ID Escáner", 168, y + 5.5);

    y += 8;

    if (scannedList.value.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(148, 163, 184);
      doc.text("Aún no se ha escaneado ningún boleto para este evento.", 18, y + 8);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);

      scannedList.value.forEach((item, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, 182, 7, 'F');
        }

        doc.setFontSize(8);
        const name = item.buyerName ? (item.buyerName.length > 32 ? item.buyerName.substring(0, 30) + '...' : item.buyerName) : 'Comprador';
        doc.text(name, 18, y + 4.5);
        doc.text(item.tierName || 'General', 85, y + 4.5);
        doc.text(formatDate(item.scannedAt), 130, y + 4.5);
        
        const deviceShort = item.scannedByDeviceId ? item.scannedByDeviceId.substring(0, 12) + '...' : 'Escáner General';
        doc.text(deviceShort, 168, y + 4.5);

        y += 7;
      });
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Página ${i} de ${totalPages} - Sistema de Boletería SoldOut`, 14, 287);
    }

    const safeEventName = (form.name || "Evento").replace(/[^a-zA-Z0-9_-]/g, "_");
    doc.save(`Reporte_Asistencia_${safeEventName}.pdf`);
  } catch (err) {
    console.error("Error al generar PDF:", err);
    alert("Error al generar el reporte PDF");
  }
};

const loadScannerConfig = async () => {
  if (!isEditMode.value) return;
  try {
    const res = await api.get(`/scanner/config/${eventId}`);
    scannerConfig.scannerPin = res.data.scannerPin || '';
    scannerConfig.maxDevices = res.data.maxDevices || 2;
    pairedDevices.value = res.data.scannerDevices || [];
  } catch (err) {
    console.error('Error al cargar configuración de escáner:', err);
  }
};

const saveScannerSettings = async () => {
  if (!isEditMode.value) return;
  try {
    await api.put(`/scanner/config/${eventId}`, {
      scannerPin: scannerConfig.scannerPin,
      maxDevices: scannerConfig.maxDevices
    });
  } catch (err) {
    console.error('Error al guardar configuración de escáner:', err);
  }
};

const regeneratePin = async () => {
  if (!isEditMode.value) return;
  try {
    const res = await api.put(`/scanner/config/${eventId}`, { generatePin: true });
    scannerConfig.scannerPin = res.data.config.scannerPin;
    alert(`Nuevo PIN generado: ${scannerConfig.scannerPin}`);
  } catch (err) {
    console.error('Error al regenerar PIN:', err);
  }
};

const copyScannerLink = () => {
  navigator.clipboard.writeText(scannerLink.value);
  alert('¡Enlace de escáner copiado al portapapeles!');
};

const revokeDeviceAccess = async (deviceId) => {
  if (!confirm('¿Seguro que deseas revocar el acceso a este dispositivo?')) return;
  try {
    await api.delete(`/scanner/devices/${deviceId}`);
    await loadScannerConfig();
    await loadAttendanceData();
  } catch (err) {
    console.error('Error al revocar dispositivo:', err);
  }
};

// Acciones de Boletos
const closeTicketModal = () => {
  isTicketModalOpen.value = false;
  newTicket.value = { name: '', price: 0, stock: 1 };
};

const saveTicket = () => {
  if (newTicket.value.name) {
    tickets.value.push({
      ...newTicket.value,
      sold: 0
    });
  }
  closeTicketModal();
};

const removeTicket = (idx) => {
  tickets.value.splice(idx, 1);
};

const editTicket = (idx) => {
  const ticket = tickets.value[idx];
  newTicket.value = { ...ticket };
  removeTicket(idx); 
  isTicketModalOpen.value = true;
};

const isSaving = ref(false);
const coverImageFile = ref(null);
const coverImageName = ref("");
const coverImagePreview = ref(null);

const bannerImageFile = ref(null);
const bannerImageName = ref("");
const bannerImagePreview = ref(null);

const handleCoverImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    coverImageFile.value = file;
    coverImageName.value = file.name;
    coverImagePreview.value = URL.createObjectURL(file);
  }
};

const handleBannerImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    bannerImageFile.value = file;
    bannerImageName.value = file.name;
    bannerImagePreview.value = URL.createObjectURL(file);
  }
};

const uploadImage = async (file) => {
  if (!file) return null;
  const formData = new FormData();
  formData.append('image', file);
  try {
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.url;
  } catch (error) {
    console.error("Upload error", error);
    return null;
  }
};

const saveEvent = async () => {
  try {
    isSaving.value = true;
    
    // Upload images if selected
    if (coverImageFile.value) {
      form.coverImage = await uploadImage(coverImageFile.value);
    }
    if (bannerImageFile.value) {
      form.bannerImage = await uploadImage(bannerImageFile.value);
    }
    
    const payload = {
      ...form,
      ...form.settings,
      tickets: tickets.value,
      scannerPin: scannerConfig.scannerPin,
      maxDevices: scannerConfig.maxDevices
    };
    
    delete payload.settings; // Flatten settings as per our Prisma model
    
    if (isEditMode.value) {
      await api.put(`/events/${eventId}`, payload);
      alert("Cambios guardados con éxito.");
      router.push('/eventos');
    } else {
      await api.post('/events', payload);
      alert("Evento creado con éxito.");
      router.push('/eventos');
    }
  } catch (error) {
    console.error("Error saving event:", error);
    alert("Hubo un error al guardar el evento");
  } finally {
    isSaving.value = false;
  }
};
</script>
