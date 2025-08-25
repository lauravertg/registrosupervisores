<script setup>
import { computed } from 'vue';

// 1. Props: Recibimos una propiedad 'isValid' (booleana) del componente padre.
const props = defineProps({
  isValid: Boolean,
});

// 2. Computed: Creamos propiedades que se recalculan automáticamente
// si 'isValid' cambia. Mucho más limpio que la lógica en el template.
const statusText = computed(() => props.isValid ? '✅ Registro OK' : '❌ Registro incompleto');
const backgroundColor = computed(() => props.isValid ? '#28a745' : '#dc3545');
</script>

<template>
  <!-- 3. Binding de estilo: Usamos ':' antes de un atributo para enlazarlo a una variable de JS. -->
  <div 
    class="fixed bottom-4 left-4 right-4 p-4 rounded-lg shadow-lg text-center font-bold text-white transition-all duration-300 ease-in-out"
    :style="{ backgroundColor: backgroundColor }"
  >
    {{ statusText }}
  </div>
</template>