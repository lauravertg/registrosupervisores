<script setup>
import { ref, computed, watch } from 'vue';
import SearchableSelect from '../SearchableSelect.vue';

const props = defineProps({
  number: Number,
  allProducts: Array,
  recordDate: String,
  julianDay: String,
});
const emit = defineEmits(['validate']);

const isUsed = ref(false);
const selectedProduct = ref(null);
const px = ref('');
const photoFile = ref(null);
const photoPreview = ref(null);
const isConfirmed = ref(false);

const fileInput = ref(null);

const caducidad = computed(() => {
  if (!props.recordDate || !px.value) return '';
  const date = new Date(props.recordDate);
  date.setDate(date.getDate() + parseInt(px.value, 10));
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

const lote = computed(() => {
  if (!props.julianDay) return '';
  const lineaPadded = String(props.number).padStart(3, '0');
  return `${lineaPadded}${props.julianDay}`;
});

const peso = computed(() => {
  const pesoFijo = selectedProduct.value?.GramajePF;
  return pesoFijo ? `${pesoFijo} g` : 'No aplica';
});

const isLineValid = computed(() => {
  return !isUsed.value || (
    selectedProduct.value &&
    String(px.value).trim() !== '' &&
    photoFile.value &&
    isConfirmed.value
  );
});

watch(isLineValid, (newValue) => {
  emit('validate', newValue);
});

const handlePhotoChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    photoFile.value = file;
    if (photoPreview.value) {
      URL.revokeObjectURL(photoPreview.value);
    }
    photoPreview.value = URL.createObjectURL(file);
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const resetSection = () => {
  isUsed.value = false;
  selectedProduct.value = null;
  px.value = '';
  photoFile.value = null;
  photoPreview.value = null;
  isConfirmed.value = false;
};

defineExpose({
  isUsed: () => isUsed.value,
  getData: () => ({
    numero: props.number,
    producto: selectedProduct.value?.NombreProducto || 'N/A',
    px: px.value,
    caducidad: caducidad.value,
    lote: lote.value,
    peso: peso.value,
    confirmado: isConfirmed.value,
    photoPreview: photoPreview.value,
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block font-medium text-gray-700">Producto:</label>
          <SearchableSelect
            v-model="selectedProduct"
            :options="allProducts"
            option-label="NombreProducto"
            placeholder="Busca un producto..."
          />
        </div>
        <div>
          <label class="block font-medium text-gray-700">P+X:</label>
          <input type="number" v-model="px" class="w-full p-2 border rounded-md" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
        <div v-if="selectedProduct" class="space-y-2 p-3 bg-blue-50 rounded-md">
          <p><strong>Caducidad Teórica:</strong> {{ caducidad }}</p>
          <p><strong>Lote Teórico:</strong> {{ lote }}</p>
          <p><strong>Peso Teórico:</strong> {{ peso }}</p>
        </div>
        <div v-else class="flex items-center justify-center text-gray-500">
          <p>Selecciona un producto para ver los datos.</p>
        </div>

        <div class="space-y-2">
          <label class="block font-medium text-gray-700">Foto de la etiqueta:</label>
          <input type="file" accept="image/*" @change="handlePhotoChange" ref="fileInput" class="hidden" />
          <button @click="triggerFileInput" class="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Subir foto
          </button>

          <img v-if="photoPreview" :src="photoPreview" alt="Vista previa" class="h-48 w-auto rounded-md shadow-sm mt-2" />

          <div v-if="photoPreview" :class="['flex items-center space-x-2 p-2 rounded-md transition-colors mt-2', isConfirmed ? 'bg-green-100' : '']">
            <input type="checkbox" v-model="isConfirmed" class="form-checkbox text-blue-500 rounded" />
            <label>La etiqueta coincide</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>