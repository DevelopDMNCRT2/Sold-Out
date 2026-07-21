<template>
  <FullScreenLayout>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans flex flex-col transition-colors duration-200">
      
      <!-- Top Header Standalone con Selector de Modo Diurno / Nocturno -->
      <header class="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white/90 dark:bg-gray-900/90 backdrop-blur sticky top-0 z-50 transition-colors">
        <div class="flex items-center text-gray-900 dark:text-white">
          <svg viewBox="0 0 190 40" xmlns="http://www.w3.org/2000/svg" class="h-8 w-auto">
            <circle cx="15" cy="20" r="10" fill="#c92a2a" />
            <circle cx="25" cy="20" r="10" fill="currentColor" opacity="0.8" />
            <text x="45" y="28" font-family="Outfit, sans-serif" font-weight="900" font-size="24" fill="currentColor" letter-spacing="0">
              SOLD OUT
            </text>
          </svg>
        </div>

        <div class="flex items-center gap-3">
          <!-- Botón de Modo Diurno / Nocturno -->
          <button 
            @click="toggleTheme" 
            type="button" 
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium transition-colors"
            :title="isDarkMode ? 'Cambiar a Modo Diurno' : 'Cambiar a Modo Nocturno'"
          >
            <!-- Icono Sol (Modo Diurno) -->
            <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-warning-500"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            <!-- Icono Luna (Modo Nocturno) -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            <span>{{ isDarkMode ? 'Diurno' : 'Nocturno' }}</span>
          </button>

          <div v-if="isPaired" class="flex items-center gap-2">
            <span class="text-xs font-medium px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/50 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {{ activeEvent?.name || 'Evento Conectado' }}
            </span>
          </div>
        </div>
      </header>

      <main class="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full flex flex-col justify-center">
        
        <!-- MODO 1: INGRESO DE PIN DE EMPAREJAMIENTO -->
        <div v-if="!isPaired" class="max-w-md mx-auto w-full py-8">
          <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div class="text-center space-y-2">
              <div class="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mx-auto border border-brand-200 dark:border-brand-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/></svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Vincular Dispositivo</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">Ingresa el PIN de 6 dígitos para comenzar a escanear boletos.</p>
            </div>

            <form @submit.prevent="pairDevice" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">PIN del Evento</label>
                <input 
                  v-model="pinInput" 
                  type="text" 
                  maxlength="6"
                  placeholder="000000"
                  class="w-full text-center text-3xl font-mono tracking-widest rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 py-3 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  required
                />
              </div>

              <div v-if="pairError" class="p-3 rounded-xl bg-error-50 dark:bg-error-950/40 border border-error-200 dark:border-error-800 text-error-600 dark:text-error-400 text-xs font-medium text-center animate-fade-in">
                {{ pairError }}
              </div>

              <button 
                type="submit" 
                :disabled="pairing" 
                class="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 text-sm"
              >
                <svg v-if="pairing" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ pairing ? 'Verificando PIN...' : 'Vincular y Comenzar Escáner' }}</span>
              </button>
            </form>
          </div>
        </div>

        <!-- MODO 2: ESCÁNER ACTIVO -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 my-auto">
          
          <!-- Lector QR -->
          <div class="lg:col-span-2 space-y-4">
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-xl">
              <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
                <span>Escáner de Cámara</span>
                <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Listo para escanear
                </span>
              </h3>

              <div class="relative w-full rounded-xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center border-2 border-gray-800" :class="cameraBorderClass">
                
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
                    <p class="text-sm">Iniciando cámara...</p>
                  </div>
                </qrcode-stream>

                <!-- Overlay de Éxito -->
                <div v-if="scanResult === 'success'" class="absolute inset-0 bg-emerald-500/95 flex flex-col items-center justify-center text-white z-10 animate-fade-in p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                  <h2 class="text-3xl font-bold mb-1">¡ACCESO CONCEDIDO!</h2>
                  <p class="text-xl font-semibold text-emerald-100">{{ lastScanDetails.buyerName }}</p>
                  <p class="text-base text-emerald-200">{{ lastScanDetails.tierName }}</p>
                </div>

                <!-- Overlay de Error -->
                <div v-if="scanResult === 'error'" class="absolute inset-0 bg-rose-500/95 flex flex-col items-center justify-center text-white z-10 animate-fade-in p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-3"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                  <h2 class="text-2xl font-bold mb-1">¡ENTRADA RECHAZADA!</h2>
                  <p class="text-lg font-medium text-rose-100">{{ errorMessage }}</p>
                </div>
                
                <!-- Overlay de Error de Cámara -->
                <div v-if="cameraError" class="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-10 p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-3 text-rose-500"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/></svg>
                  <h2 class="text-lg font-bold text-rose-400 mb-1">Error de cámara</h2>
                  <p class="text-gray-300 text-xs">{{ cameraError }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Historial Reciente -->
          <div class="space-y-4">
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-xl h-full flex flex-col">
              <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-3">Últimos Accesos</h3>
              
              <div class="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-1">
                <div 
                  v-for="(scan, index) in scanHistory" 
                  :key="index"
                  class="flex items-start p-3 rounded-xl border transition-colors"
                  :class="scan.valid ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50' : 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/50'"
                >
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-3 mt-0.5"
                    :class="scan.valid ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'"
                  >
                    <svg v-if="scan.valid" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold truncate" :class="scan.valid ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'">
                      {{ scan.valid ? 'Acceso Concedido' : 'Acceso Rechazado' }}
                    </p>
                    <p class="text-[11px] text-gray-700 dark:text-gray-300 truncate mt-0.5">
                      {{ scan.data }}
                    </p>
                    <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-mono">
                      {{ scan.time }}
                    </p>
                  </div>
                </div>
                
                <div v-if="scanHistory.length === 0" class="text-center py-12 text-gray-400 dark:text-gray-500 text-xs">
                  Aún no hay lecturas en este turno.
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </FullScreenLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import FullScreenLayout from "@/components/layout/FullScreenLayout.vue";
import { QrcodeStream } from "vue-qrcode-reader";
import api from "@/services/api";

const route = useRoute();

const isDarkMode = ref(false);

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const isPaired = ref(false);
const pinInput = ref("");
const pairing = ref(false);
const pairError = ref("");
const activeEvent = ref(null);

const loading = ref(false);
const isPaused = ref(false);
const scanResult = ref(null);
const errorMessage = ref("");
const lastScanDetails = ref({ buyerName: '', tierName: '' });
const cameraError = ref("");
const scanHistory = ref([]);

const cameraBorderClass = computed(() => {
  if (scanResult.value === 'success') return 'border-emerald-500';
  if (scanResult.value === 'error') return 'border-rose-500';
  return 'border-gray-800';
});

const getDeviceId = () => {
  let devId = localStorage.getItem('soldout_device_id');
  if (!devId) {
    devId = 'dev-' + crypto.randomUUID();
    localStorage.setItem('soldout_device_id', devId);
  }
  return devId;
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  isDarkMode.value = savedTheme === 'dark';
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  if (route.query.pin) {
    pinInput.value = route.query.pin;
    pairDevice();
  } else {
    const token = localStorage.getItem('soldout_scanner_token');
    if (token) {
      isPaired.value = true;
    }
  }
});

const pairDevice = async () => {
  if (!pinInput.value || pinInput.value.length < 6) {
    pairError.value = "Por favor ingresa un PIN válido de 6 dígitos.";
    return;
  }

  pairing.value = true;
  pairError.value = "";

  try {
    const deviceId = getDeviceId();
    const deviceName = `${navigator.platform || 'Móvil'} - ${navigator.userAgent.includes('Mobile') ? 'Celular' : 'Navegador'}`;

    const res = await api.post('/scanner/pair', {
      pin: pinInput.value,
      deviceId,
      deviceName
    });

    if (res.data.success) {
      localStorage.setItem('soldout_scanner_token', res.data.token);
      activeEvent.value = res.data.event;
      isPaired.value = true;
    }
  } catch (err) {
    console.error("Error al vincular dispositivo:", err);
    pairError.value = err.response?.data?.message || "PIN de evento inválido o límite de dispositivos alcanzado.";
  } finally {
    pairing.value = false;
  }
};

const unpairDevice = () => {
  if (confirm("¿Deseas desvincular este dispositivo del escáner?")) {
    localStorage.removeItem('soldout_scanner_token');
    isPaired.value = false;
    pinInput.value = "";
  }
};

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
    // Audio context no soportado
  }
};

const onDetect = async (detectedCodes) => {
  if (scanResult.value !== null) return;
  
  const content = detectedCodes[0]?.rawValue;
  if (!content) return;
  
  isPaused.value = true;
  
  try {
    const token = localStorage.getItem('soldout_scanner_token');

    const response = await api.post(
      '/orders/validate', 
      { qrCode: content },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    scanResult.value = 'success';
    lastScanDetails.value = {
      buyerName: response.data.ticket.buyerName,
      tierName: response.data.ticket.tierName
    };
    playBeep(true);
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    scanHistory.value.unshift({
      data: `${response.data.ticket.buyerName} (${response.data.ticket.tierName})`,
      valid: true,
      time: timeString
    });
  } catch (error) {
    scanResult.value = 'error';
    const errText = error.response?.data?.message || 'Boleto Inválido';
    errorMessage.value = errText;
    playBeep(false);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      setTimeout(() => {
        unpairDevice();
      }, 2500);
    }
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    scanHistory.value.unshift({
      data: errText,
      valid: false,
      time: timeString
    });
  }
  
  if (scanHistory.value.length > 10) {
    scanHistory.value.pop();
  }
  
  setTimeout(() => {
    scanResult.value = null;
    isPaused.value = false;
  }, 2500);
};

const paintBoundingBox = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const {
      boundingBox: { x, y, width, height }
    } = detectedCode;

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#10b981';
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
