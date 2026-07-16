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

    <fieldset :disabled="isReadOnly" class="contents">
    <div class="space-y-6">
      
      <!-- TAB 1: INFORMACIÓN GENERAL -->
      <div v-if="currentTab === 'informacion'" class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
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
        
      </div>
      
      <!-- TAB 2: FECHA Y LUGAR -->
      <div v-if="currentTab === 'lugar'" class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
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
        
      </div>

      <!-- TAB 3: BOLETOS -->
      <div v-if="currentTab === 'boletos'">
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
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': sale.status === 'Rechazado' || sale.status === 'Cancelado'
                      }"
                    >
                      {{ sale.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button @click="viewOrder(sale)" class="text-gray-500 hover:text-brand-500 transition-colors" title="Ver Orden">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
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

      <!-- TAB 5: CONFIGURACIÓN -->
      <div v-if="currentTab === 'configuracion'" class="max-w-2xl">
        <ComponentCard title="Configuración del Evento">
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
      </div>

    </div>
    </fieldset>

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
          <div class="mt-8 flex justify-end">
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

// Las pestañas disponibles varían según el modo (no mostramos "Ventas" al crear un evento nuevo)
const tabs = [
  { id: 'informacion', name: '1. Información' },
  { id: 'lugar', name: '2. Fecha y Lugar' },
  { id: 'boletos', name: '3. Boletos' },
  { id: 'ventas', name: '4. Ventas' },
  { id: 'configuracion', name: '5. Configuración' }
];

const visibleTabs = computed(() => {
  if (isEditMode.value) return tabs;
  return tabs.filter(tab => tab.id !== 'ventas');
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

const totalVendido = computed(() => {
  return sales.value.reduce((acc, sale) => acc + sale.total, 0);
});

const boletosVendidos = computed(() => {
  return sales.value.reduce((acc, sale) => acc + sale.qty, 0);
});

const comprasRealizadas = computed(() => {
  return sales.value.length;
});

onMounted(async () => {
  if (isEditMode.value) {
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
      sales.value = data.orders || []; // Assuming orders are returned
    } catch (error) {
      console.error("Error loading event:", error);
      alert("Error al cargar el evento");
    }
  }
});

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
  // A real implementation would track the index being edited
  // For now, we just open the modal with the ticket data
  // In a full implementation, saveTicket would update the existing one
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
      tickets: tickets.value
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
