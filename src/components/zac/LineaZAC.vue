<script setup>
import { ref, computed, watch } from 'vue';
import SearchableSelect from '../SearchableSelect.vue';

const props = defineProps({
  number: Number,
  allProducts: Array,
});
const emit = defineEmits(['validate']);

const isUsed = ref(false);
const selectedProduct = ref(null);
const maquinistaControladora = ref('');
const maquinistaReal = ref('');
const pesoMedio = ref('');
const testMetalesRealizado = ref(false);

const hasMaxWeight = computed(() => !!selectedProduct.value && !!selectedProduct.value.GramajePM);
const hasFixedWeight = computed(() => !!selectedProduct.value && !!selectedProduct.value.GramajePF);

const isMaquinistaCorrect = computed(() => {
  if (!selectedProduct.value) return true;
  const mc = maquinistaControladora.value;
  const mr = maquinistaReal.value;
  if (!mc && !mr) return false;
  return mc === mr;
});

const isPesoTooLow = computed(() => {
  if (!hasFixedWeight.value || pesoMedio.value === '') return false;
  const fixedWeight = selectedProduct.value.GramajePF;
  const currentWeight = parseFloat(pesoMedio.value);
  return currentWeight < fixedWeight;
});

const isPesoOverLimit = computed(() => {
  if (!hasMaxWeight.value || pesoMedio.value === '') return false;
  return parseFloat(pesoMedio.value) > selectedProduct.value.GramajePM;
});

const isLineValid = computed(() => !isUsed.value || (isMaquinistaCorrect.value && !isPesoTooLow.value && testMetalesRealizado.value));

watch(isLineValid, (newValue) => { emit('validate', newValue); });

const resetSection = () => {
  isUsed.value = false;
  selectedProduct.value = null;
  maquinistaControladora.value = '';
  maquinistaReal.value = '';
  pesoMedio.value = '';
  testMetalesRealizado.value = false;
};

defineExpose({
  isUsed: () => isUsed.value,
  getData: () => ({
    numero: props.number,
    producto: selectedProduct.value?.NombreProducto || 'N/A',
    controladora: maquinistaControladora.value,
    real: maquinistaReal.value,
    pesoMedio: hasMaxWeight.value ? pesoMedio.value : 'No aplica',
    metalesOK: testMetalesRealizado.value,
  }),
  resetSection: resetSection
});
</script>

<template>
  <div class="bg-gray-100 p-4 rounded-lg mb-4 shadow">
    <div class="flex items-center justify-between cursor-pointer" @click="isUsed = !isUsed">
      <h3 class="text-xl font-semibold text-gray-800">Línea {{ number }}</h3>
      <input type="checkbox" v-model="isUsed" class="form-checkbox text-blue-500 rounded" />
    </div>
    <div v-if="isUsed" class="mt-4 space-y-4">
      <button @click="resetSection" class="text-red-500 hover:text-red-700">Borrar datos de este apartado</button>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div class="space-y-2">
          <label class="block font-medium text-gray-700">Producto:</label>
          <SearchableSelect
            v-model="selectedProduct"
            :options="allProducts"
            option-label="NombreProducto"
            placeholder="Busca un producto..."
          />
        </div>
        <div v-if="selectedProduct && selectedProduct.GramajePM" class="p-3 bg-blue-50 rounded-md text-sm text-gray-600 mt-6">
          <p><strong>Peso máximo:</strong> {{ selectedProduct.GramajePM }} g</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="block font-medium text-gray-700">Nombre en controladora:</label>
          <input type="text" v-model="maquinistaControladora" class="w-full p-2 border rounded-md" />
        </div>
        <div class="space-y-2">
          <label class="block font-medium text-gray-700">Nombre maquinista real:</label>
          <input type="text" v-model="maquinistaReal" class="w-full p-2 border rounded-md" />
        </div>
      </div>
      <span v-if="selectedProduct" :class="isMaquinistaCorrect ? 'text-green-600' : 'text-red-600'">
        {{ isMaquinistaCorrect ? 'Correcto ✅' : 'Incorrecto ❌' }}
      </span>
      
      <div class="space-y-2">
        <label class="block font-medium text-gray-700">Peso medio del lote:</label>
        <input 
          type="number" 
          v-model="pesoMedio" 
          class="w-full p-2 border rounded-md transition-colors"
          :disabled="!hasFixedWeight"
          :class="{ 
            'bg-gray-200 cursor-not-allowed': !hasFixedWeight,
            'bg-orange-100 border-orange-400': isPesoOverLimit,
            'bg-red-100 border-red-400': isPesoTooLow
          }"
        />
        <span v-if="pesoMedio && isPesoTooLow" class="text-red-600">
          Error: El peso medio no puede ser inferior al peso fijo ({{ selectedProduct.GramajePF }} g).
        </span>
        <span v-else-if="pesoMedio && isPesoOverLimit" class="text-orange-600">
          Advertencia: Peso por encima del máximo permitido.
        </span>
      </div>

      <div 
        :class="['flex items-center space-x-2 p-2 rounded-md transition-colors', testMetalesRealizado ? 'bg-green-100' : '']"
      >
        <input type="checkbox" v-model="testMetalesRealizado" class="form-checkbox text-blue-500 rounded" />
        <label>Test de metales realizado</label>
      </div>
    </div>
  </div>
</template>