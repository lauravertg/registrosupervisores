<script setup>
import { ref, computed, watch } from 'vue';

// --- ¡¡¡LA LÍNEA QUE FALTABA ESTÁ AQUÍ!!! ---
// Declaramos que este componente acepta una prop llamada 'responsable'.
const props = defineProps({
  responsable: String,
});

const emit = defineEmits(['validate', 'update:responsable']);

// Esta variable interna se enlaza al input del template.
const responsableBandejas = ref('');
const cuchillosUsados = ref(false);
const codigoPersonaHora = ref('');
const confirmadoAnotado = ref(false);

const isSectionValid = computed(() => {
  if (cuchillosUsados.value && (codigoPersonaHora.value.trim() === '' || !confirmadoAnotado.value)) {
    return false;
  }
  return true;
});

// Cuando la variable interna cambia, emitimos el evento para actualizar al padre.
watch(isSectionValid, (newValue) => { emit('validate', newValue); });
watch(responsableBandejas, (newValue) => { emit('update:responsable', newValue); });

const resetSection = () => {
  responsableBandejas.value = '';
  cuchillosUsados.value = false;
  codigoPersonaHora.value = '';
  confirmadoAnotado.value = false;
};

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
    <h3 class="text-xl font-semibold text-gray-800 mb-4">Cuchillos y lavado de bandejas</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
      <div class="space-y-2">
        <label class="block font-medium text-gray-700">Responsable de bandejas (Obligatorio):</label>
        <input type="text" v-model="responsableBandejas" class="w-full p-2 border rounded-md" required />
      </div>
      <div class="border-t md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0 mt-4 md:mt-0">
        <div class="flex items-center justify-between">
          <span class="font-medium text-gray-700">¿Se han usado cuchillos?</span>
          <input type="checkbox" v-model="cuchillosUsados" class="form-checkbox text-blue-500 rounded" />
        </div>
        <div v-if="cuchillosUsados" class="space-y-4 mt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div class="space-y-2">
              <label class="block font-medium text-gray-700 text-sm">Código / persona / hora:</label>
              <input type="text" v-model="codigoPersonaHora" class="w-full p-2 border rounded-md" required />
            </div>
            <div class="flex items-center space-x-2 mt-5">
              <input type="checkbox" v-model="confirmadoAnotado" class="form-checkbox text-blue-500 rounded" required />
              <label class="text-sm">Confirmar anotado</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>