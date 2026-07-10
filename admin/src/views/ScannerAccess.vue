<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Control de Acceso" />
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Lector QR -->
      <div class="lg:col-span-2 space-y-6">
        <ComponentCard title="Escáner de Boletos">
          <div class="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center border-4" :class="cameraBorderClass">
            
            <!-- Vista de cámara -->
            <qrcode-stream 
              v-if="!isPaused" 
              @detect="onDetect" 
              @error="onError"
              :track="paintBoundingBox"
            >
              <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-black/80 text-white flex-col">
                <svg class="animate-spin h-8 w-8 mb-4 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Cargando cámara...</p>
              </div>
            </qrcode-stream>

            <!-- Overlay de Éxito -->
            <div v-if="scanResult === 'success'" class="absolute inset-0 bg-success-500/90 flex flex-col items-center justify-center text-white z-10 animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
              <h2 class="text-4xl font-bold mb-2">¡Acceso Concedido!</h2>
              <p class="text-xl">Boleto válido</p>
            </div>

            <!-- Overlay de Error -->
            <div v-if="scanResult === 'error'" class="absolute inset-0 bg-error-500/90 flex flex-col items-center justify-center text-white z-10 animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              <h2 class="text-4xl font-bold mb-2">¡Boleto Inválido!</h2>
              <p class="text-xl">Ya escaneado o falso</p>
            </div>
            
            <!-- Overlay de Error de Cámara -->
            <div v-if="cameraError" class="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-10 p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4 text-error-500"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 0-2.41-1.46L4.06 4.05"/><path d="m15.14 6.78.45-1.81a2 2 0 0 1 2.41-1.46l1.94.54"/></svg>
              <h2 class="text-xl font-bold text-error-400 mb-2">Error de cámara</h2>
              <p class="text-gray-300 text-sm">{{ cameraError }}</p>
            </div>
          </div>
          
          <div class="mt-6 flex justify-center">
             <p class="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
               Apunta la cámara al código QR del boleto. El escaneo y validación ocurrirán automáticamente.
             </p>
          </div>
        </ComponentCard>
      </div>

      <!-- Historial Reciente -->
      <div class="space-y-6">
        <ComponentCard title="Últimos Accesos">
          <div class="space-y-4">
            <div 
              v-for="(scan, index) in scanHistory" 
              :key="index"
              class="flex items-start p-3 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors"
              :class="scan.valid ? 'bg-success-50 dark:bg-success-900/10' : 'bg-error-50 dark:bg-error-900/10'"
            >
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-3"
                :class="scan.valid ? 'bg-success-100 dark:bg-success-900/30 text-success-600' : 'bg-error-100 dark:bg-error-900/30 text-error-600'"
              >
                <svg v-if="scan.valid" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ scan.valid ? 'Boleto Válido' : 'Boleto Inválido' }}
                </p>
                <p class="text-xs text-gray-500 truncate mt-0.5">
                  ID: {{ scan.data }}
                </p>
                <p class="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">
                  {{ scan.time }}
                </p>
              </div>
            </div>
            
            <div v-if="scanHistory.length === 0" class="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-gray-300 mb-2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <p class="text-sm text-gray-500">Aún no hay lecturas.</p>
            </div>
          </div>
        </ComponentCard>
      </div>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import { QrcodeStream } from "vue-qrcode-reader";
import api from "@/services/api";

const loading = ref(false);
const isPaused = ref(false);
const scanResult = ref(null); // 'success' | 'error' | null
const cameraError = ref("");
const scanHistory = ref([]);

const cameraBorderClass = computed(() => {
  if (scanResult.value === 'success') return 'border-success-500';
  if (scanResult.value === 'error') return 'border-error-500';
  return 'border-gray-800 dark:border-gray-700';
});

// Sound effects (optional, if we had assets, but we can use browser audio context or just rely on visual)
const playBeep = (success) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = success ? 'sine' : 'sawtooth';
    osc.frequency.setValueAtTime(success ? 800 : 300, ctx.currentTime);
    if(success) {
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    }
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Audio context not supported or blocked
  }
};

const onDetect = async (detectedCodes) => {
  if (scanResult.value !== null) return; // Prevent multiple scans while showing result
  
  const content = detectedCodes[0]?.rawValue;
  if (!content) return;
  
  // Pause scanning temporarily
  isPaused.value = true;
  
  try {
    const response = await api.post('/orders/validate', { qrCode: content });
    scanResult.value = 'success';
    playBeep(true);
    
    // Add to history
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    scanHistory.value.unshift({
      data: `${response.data.ticket.buyerName} - ${response.data.ticket.tierName}`,
      valid: true,
      time: timeString
    });
  } catch (error) {
    scanResult.value = 'error';
    playBeep(false);
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    scanHistory.value.unshift({
      data: error.response?.data?.message || 'Boleto Inválido',
      valid: false,
      time: timeString
    });
  }
  
  // Keep max 10 in history
  if (scanHistory.value.length > 10) {
    scanHistory.value.pop();
  }
  
  // Resume after 2 seconds
  setTimeout(() => {
    scanResult.value = null;
    isPaused.value = false;
  }, 2000);
};

const paintBoundingBox = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const {
      boundingBox: { x, y, width, height }
    } = detectedCode;

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#3b82f6'; // brand-500
    ctx.strokeRect(x, y, width, height);
  }
};

const onError = (error) => {
  console.error("Scanner error:", error);
  if (error.name === 'NotAllowedError') {
    cameraError.value = "Debes otorgar permisos de cámara en tu navegador para poder escanear boletos.";
  } else if (error.name === 'NotFoundError') {
    cameraError.value = "No se detectó ninguna cámara en este dispositivo.";
  } else if (error.name === 'NotSupportedError') {
    cameraError.value = "El contexto seguro (HTTPS) es requerido para usar la cámara.";
  } else if (error.name === 'NotReadableError') {
    cameraError.value = "La cámara ya está siendo utilizada por otra aplicación.";
  } else {
    cameraError.value = `Error de cámara: ${error.message}`;
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
