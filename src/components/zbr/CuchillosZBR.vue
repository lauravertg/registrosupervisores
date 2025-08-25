<script setup>
import { ref, computed, watch } from 'vue';

const emit = defineEmits(['validate']);

const cuchillosUsados = ref(false);
const codigoPersonaHora = ref('');
const confirmadoAnotado = ref(false);

const isSectionValid = computed(() => {
  return !cuchillosUsados.value || (codigoPersonaHora.value.trim() !== '' && confirmadoAnotado.value);
});

watch(isSectionValid, (newValue) => {
  emit('validate', newValue);
});

// Función para resetear los campos del componente
const resetSection = () => {
  cuchillosUsados.value = false;
  codigoPersonaHora.value = '';
  confirmadoAnotado.value = false;
};

// Exponemos las funciones para que el padre pueda llamarlas
defineExpose({
  getData: () => ({
    usados: cuchillosUsados.value,
    detalles: cuchillosUsados.value ? codigoPersonaHora.value : 'No se han usado cuchillos',
  }),
  resetSection: resetSection
});
</script>

<template>
  <div class="bg-gray-100 p-4 rounded-lg mb-4 shadow">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-semibold text-gray-800">Cuchillos</h3>
      <input type="checkbox" v-model="cuchillosUsados" class="form-checkbox text-blue-500 rounded" />
    </div>

    <div v-if="cuchillosUsados" class="space-y-4 mt-4 border-t pt-4">
      <div class="space-y-2">
        <label class="block font-medium text-gray-700">Código / persona / hora:</label>
        <input type="text" v-model="codigoPersonaHora" class="w-full p-2 border rounded-md" required />
      </div>
      <div class="flex items-center space-x-2">
        <input type="checkbox" v-model="confirmadoAnotado" class="form-checkbox text-blue-500 rounded" required />
        <label>Confirmar que está anotado</label>
      </div>
    </div>
  </div>
</template>