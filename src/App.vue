<script setup>
import { ref, onMounted, computed, shallowRef } from 'vue';
import PantallaInicial from './components/PantallaInicial.vue';
import RegistroZAC from './components/zac/RegistroZAC.vue';
import RegistroZBR from './components/zbr/RegistroZBR.vue';

const currentView = ref('home');
const products = ref([]);
const isLoading = ref(true);
const recordDate = ref(new Date().toISOString().split('T')[0]);

const getJulianDay = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return String(dayOfYear).padStart(3, '0');
};

const julianDay = computed(() => getJulianDay(recordDate.value));

const views = {
  home: PantallaInicial,
  zac: RegistroZAC,
  zbr: RegistroZBR,
};
    
const activeComponent = shallowRef(views[currentView.value]);

onMounted(async () => {
  // URL correcta y actualizada.
  const url = 'https://prod-139.westeurope.logic.azure.com:443/workflows/2d5ddae0ea7342bea1aa8c80a89a5c0f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xne9u9qXzYYXs4Cyd4xsTIs7F7wFpyTo5f--kEjO25A'; 
  
  try {
    isLoading.value = true;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Network response was not ok. Status: ${response.status}`);
    }
    
    const data = await response.json();

    // Cadena de procesamiento final: filtra, limpia y ordena.
    products.value = data
      // 1. Filtra solo productos activos.
      .filter(p => {
        const status = p["EnActivo"];
        return ["sí", "si", "yes", "true", true].includes(typeof status === 'string' ? status.toLowerCase() : status);
      })
      // 2. Filtra solo productos con un nombre válido para evitar errores.
      .filter(p => p.NombreProducto && typeof p.NombreProducto === 'string' && p.NombreProducto.trim() !== '')
      // 3. Ordena la lista limpia alfabéticamente.
      .sort((a, b) => a.NombreProducto.localeCompare(b.NombreProducto));

  } catch (error) {
    console.error("Fetch error:", error);
    products.value = [];
  } finally {
    isLoading.value = false;
  }
});

function handleViewChange(viewName) {
  currentView.value = viewName;
  activeComponent.value = views[viewName];
}
    
function goHome() {
  currentView.value = 'home';
  activeComponent.value = views['home'];
}
</script>

<template>
  <div class="App">
    <component 
      :is="activeComponent"
      :allProducts="products"
      :isLoading="isLoading"
      v-model:recordDate="recordDate"
      :julianDay="julianDay"
      @select="handleViewChange"
      @goHome="goHome"
    />
  </div>
</template>