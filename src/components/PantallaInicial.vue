<script setup>
// Con defineEmits, declaramos los eventos que este componente puede "emitir" hacia el padre.
// En este caso, cuando se haga clic en un botón, emitirá un evento 'select' con un valor.
defineEmits(['select']);
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="flex flex-col items-center space-y-8 max-w-2xl w-full">
      <h1 class="text-4xl font-extrabold text-gray-900 mb-4 text-center">Selecciona el tipo de registro</h1>
      
      <!-- En Vue, los eventos se manejan con la arroba (@). -->
      <!-- Al hacer clic, emitimos el evento 'select' con el valor 'zac' -->
      <button @click="$emit('select', 'zac')" class="w-full py-6 text-2xl font-bold text-white bg-blue-600 rounded-lg shadow-xl hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105">
        Registro ZAC
      </button>
      
      <button @click="$emit('select', 'zbr')" class="w-full py-6 text-2xl font-bold text-white bg-green-600 rounded-lg shadow-xl hover:bg-green-700 transition-colors duration-300 transform hover:scale-105">
        Registro ZBR / Empaquetado
      </button>
    </div>
  </div>
</template>