<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: { // Para que funcione con v-model
    type: Object,
    default: null,
  },
  options: {
    type: Array,
    required: true,
  },
  optionLabel: { // La clave del objeto a mostrar (ej: 'NombreProducto')
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Busca o selecciona una opción...',
  }
});

const emit = defineEmits(['update:modelValue']);

const searchTerm = ref('');
const isOpen = ref(false);
const rootEl = ref(null); // Referencia al elemento raíz para detectar clics fuera

// Muestra el nombre del producto si hay uno seleccionado, si no, lo que el usuario está buscando
const displayValue = computed(() => {
  if (props.modelValue) {
    return props.modelValue[props.optionLabel];
  }
  return searchTerm.value;
});

// Filtra las opciones basándose en el término de búsqueda
const filteredOptions = computed(() => {
  if (!searchTerm.value) {
    return props.options;
  }
  return props.options.filter(option =>
    option[props.optionLabel].toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

// Función para seleccionar una opción de la lista
function selectOption(option) {
  emit('update:modelValue', option);
  searchTerm.value = ''; // Limpiamos la búsqueda
  isOpen.value = false; // Cerramos el desplegable
}

// Limpia la selección y la búsqueda
function clearSelection() {
    emit('update:modelValue', null);
    searchTerm.value = '';
}

// Cierra el desplegable si se hace clic fuera del componente
function handleClickOutside(event) {
  if (rootEl.value && !rootEl.value.contains(event.target)) {
    isOpen.value = false;
  }
}

// Añadimos y quitamos el listener para clics fuera
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="relative" ref="rootEl">
    <div class="relative">
      <input
        type="text"
        :value="displayValue"
        @input="searchTerm = $event.target.value; emit('update:modelValue', null);"
        @focus="isOpen = true"
        :placeholder="placeholder"
        class="w-full p-2 border border-gray-300 rounded-md"
      />
      <!-- Botón para limpiar la selección -->
      <button v-if="modelValue" @click="clearSelection" class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-red-500">
        &times;
      </button>
    </div>
    
    <ul v-if="isOpen && filteredOptions.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
      <li
        v-for="option in filteredOptions"
        :key="option[optionLabel]"
        @click="selectOption(option)"
        class="px-4 py-2 cursor-pointer hover:bg-gray-100"
      >
        {{ option[optionLabel] }}
      </li>
    </ul>
  </div>
</template>