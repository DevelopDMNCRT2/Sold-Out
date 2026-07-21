<template>
  <div :class="isDarkMode ? 'dark' : ''">
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans flex flex-col transition-colors duration-200">
      <!-- Header -->
      <header class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/90 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div class="flex items-center gap-2">
          <span class="text-xl font-black text-indigo-600 dark:text-indigo-400">SoldOut</span>
          <span class="text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-200 dark:border-indigo-500/30">Validador</span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Botón Modo Diurno / Nocturno -->
          <button 
            @click="toggleTheme" 
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
          >
            <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            <span>{{ isDarkMode ? 'Diurno' : 'Nocturno' }}</span>
          </button>

          <div v-if="isPaired" class="flex items-center gap-2">
            <button @click="unpairDevice" class="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium">Salir</button>
          </div>
        </div>
      </header>

      <main class="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full">
        <!-- MODO 1: INGRESAR PIN DE EVENTO -->
        <div v-if="!isPaired" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div class="text-center space-y-2">
            <div class="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/></svg>
            </div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Modo Validador</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Ingresa el PIN de 6 dígitos del evento para autorizar este celular.</p>
          </div>

          <form @submit.prevent="pairDevice" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">PIN del Evento</label>
              <input 
                v-model="pinInput" 
                type="text" 
                maxlength="6"
                placeholder="000000"
                class="w-full text-center text-3xl font-mono tracking-widest bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div v-if="pairError" class="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs rounded-xl text-center">
              {{ pairError }}
            </div>

            <button 
              type="submit" 
              :disabled="pairing" 
              class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-lg shadow-indigo-600/30 flex justify-center items-center gap-2"
            >
              <span v-if="pairing" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              <span>{{ pairing ? 'Verificando PIN...' : 'Vincular y Escanear' }}</span>
            </button>
          </form>
        </div>

        <!-- MODO 2: ESCÁNER -->
        <div v-else class="w-full space-y-4">
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex justify-between items-center shadow-sm">
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400">Evento Activo</p>
              <p class="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[220px]">{{ activeEvent?.name || 'Evento Autenticado' }}</p>
            </div>
            <span class="flex h-2.5 w-2.5 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <!-- Entrada manual de código como respaldo -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
            <label class="block text-xs text-slate-500 dark:text-slate-400">¿No funciona la cámara? Ingresa el código QR manualmente:</label>
            <div class="flex gap-2">
              <input v-model="manualQr" type="text" placeholder="Código de boleto..." class="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none" />
              <button @click="validateManual" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold">Validar</button>
            </div>
          </div>

          <!-- Feedback de Lectura -->
          <div v-if="scanResult === 'success'" class="p-6 bg-emerald-500/90 rounded-2xl text-center space-y-2 animate-bounce text-white shadow-xl">
            <h2 class="text-2xl font-bold">¡Acceso Concedido!</h2>
            <p class="text-lg font-medium text-emerald-100">{{ lastScanDetails.buyerName }}</p>
            <p class="text-sm text-emerald-200">{{ lastScanDetails.tierName }}</p>
          </div>

          <div v-if="scanResult === 'error'" class="p-6 bg-rose-500/90 rounded-2xl text-center space-y-2 text-white shadow-xl">
            <h2 class="text-2xl font-bold">¡Entrada Rechazada!</h2>
            <p class="text-sm text-rose-100">{{ errorMessage }}</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const API_URL = 'http://localhost:3001/api';

const isDarkMode = ref(false);

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('validador_theme', isDarkMode.value ? 'dark' : 'light');
};

const isPaired = ref(false);
const pinInput = ref('');
const pairing = ref(false);
const pairError = ref('');
const activeEvent = ref(null);
const deviceId = ref('');

const manualQr = ref('');
const scanResult = ref(null);
const errorMessage = ref('');
const lastScanDetails = ref({ buyerName: '', tierName: '' });

const getDeviceId = () => {
  let id = localStorage.getItem('soldout_device_id');
  if (!id) {
    id = 'dev-' + crypto.randomUUID();
    localStorage.setItem('soldout_device_id', id);
  }
  return id;
};

onMounted(() => {
  isDarkMode.value = localStorage.getItem('validador_theme') === 'dark';
  deviceId.value = getDeviceId();
  if (route.query.pin) {
    pinInput.value = route.query.pin;
    pairDevice();
  } else {
    const token = localStorage.getItem('soldout_scanner_token');
    if (token) isPaired.value = true;
  }
});

const pairDevice = async () => {
  if (!pinInput.value || pinInput.value.length < 6) {
    pairError.value = "Ingresa un PIN válido de 6 dígitos.";
    return;
  }

  pairing.value = true;
  pairError.value = "";

  try {
    const res = await fetch(`${API_URL}/scanner/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin: pinInput.value,
        deviceId: deviceId.value,
        deviceName: 'Celular Staff Web'
      })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem('soldout_scanner_token', data.token);
      activeEvent.value = data.event;
      isPaired.value = true;
    } else {
      pairError.value = data.message || "PIN inválido o límite de dispositivos alcanzado.";
    }
  } catch (err) {
    pairError.value = "Error al conectar con el servidor.";
  } finally {
    pairing.value = false;
  }
};

const unpairDevice = () => {
  localStorage.removeItem('soldout_scanner_token');
  isPaired.value = false;
  pinInput.value = '';
};

const validateManual = async () => {
  if (!manualQr.value) return;
  const code = manualQr.value;
  manualQr.value = '';

  try {
    const token = localStorage.getItem('soldout_scanner_token');
    const res = await fetch(`${API_URL}/orders/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ qrCode: code })
    });

    const data = await res.json();

    if (res.ok && data.valid) {
      scanResult.value = 'success';
      lastScanDetails.value = data.ticket;
    } else {
      scanResult.value = 'error';
      errorMessage.value = data.message || 'Boleto no válido';
    }
  } catch (err) {
    scanResult.value = 'error';
    errorMessage.value = 'Error al comunicar con el servidor';
  }

  setTimeout(() => {
    scanResult.value = null;
  }, 3000);
};
</script>
