<script setup>
import { ref, computed } from 'vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import LineaZBR from './LineaZBR.vue';
import CuchillosZBR from './CuchillosZBR.vue';
import Comprobador from '../Comprobador.vue';

const props = defineProps({
  allProducts: Array,
  isLoading: Boolean,
  recordDate: String,
  julianDay: String,
});
const emit = defineEmits(['goHome', 'update:recordDate']);

const supervisor = ref('');
const linea1Valid = ref(true);
const linea2Valid = ref(true);
const linea3Valid = ref(true);
const cuchillosValid = ref(true);

const linea1Ref = ref(null);
const linea2Ref = ref(null);
const linea3Ref = ref(null);
const cuchillosRef = ref(null);

const isSending = ref(false);
const sendStatus = ref('');

const isAllValid = computed(() => {
  return supervisor.value.trim() !== '' &&
         linea1Valid.value &&
         linea2Valid.value &&
         linea3Valid.value &&
         cuchillosValid.value;
});

function updateDate(event) {
  emit('update:recordDate', event.target.value);
}

function resetForm() {
    supervisor.value = '';
    linea1Ref.value?.resetSection();
    linea2Ref.value?.resetSection();
    linea3Ref.value?.resetSection();
    cuchillosRef.value?.resetSection();
    sendStatus.value = '';
}

async function generateAndSendPDF() {
  if (!isAllValid.value) return;
  isSending.value = true;
  sendStatus.value = '';

  const pdf = new jsPDF();
  let yPos = 15;
  pdf.setFontSize(20);
  pdf.text("Reporte de Registro ZBR / Empaquetado", 105, yPos, { align: 'center' });
  yPos += 15;
  pdf.setFontSize(12);
  pdf.text("Datos Generales", 14, yPos);
  yPos += 7;
  pdf.line(14, yPos - 5, 196, yPos - 5);
  autoTable(pdf, { startY: yPos, theme: 'plain', body: [['Supervisor:', supervisor.value], ['Fecha de Registro:', props.recordDate], ['Día Juliano:', props.julianDay]] });
  yPos = pdf.lastAutoTable.finalY + 15;

  if (cuchillosRef.value) {
    const cuchillosData = cuchillosRef.value.getData();
    pdf.text("Detalle de Cuchillos", 14, yPos);
    yPos += 7;
    pdf.line(14, yPos - 5, 196, yPos - 5);
    autoTable(pdf, { startY: yPos, theme: 'plain', body: [['¿Se han usado cuchillos?:', cuchillosData.usados ? 'Sí' : 'No'], ...(cuchillosData.usados ? [['Detalles:', cuchillosData.detalles]] : [])] });
    yPos = pdf.lastAutoTable.finalY + 15;
  }
  
  const lineasData = [linea1Ref.value, linea2Ref.value, linea3Ref.value].filter(l => l && l.isUsed()).map(l => l.getData());
  if (lineasData.length > 0) {
    pdf.text("Detalle de Líneas", 14, yPos);
    yPos += 7;
    pdf.line(14, yPos - 5, 196, yPos - 5);
    autoTable(pdf, { startY: yPos, head: [['Línea', 'Producto', 'P+X', 'Caducidad', 'Lote', 'Peso Teórico', 'Foto OK']], body: lineasData.map(d => [d.numero, d.producto, d.px, d.caducidad, d.lote, d.peso, d.confirmado ? 'Sí' : 'No']) });
    yPos = pdf.lastAutoTable.finalY + 15;

    for (const linea of lineasData) {
      if (linea.photoPreview) {
        const sectionHeight = 65; 
        if (yPos + sectionHeight > 280) {
          pdf.addPage();
          yPos = 15;
        }
        pdf.text(`Etiqueta - Línea ${linea.numero}`, 14, yPos);
        yPos += 7;
        try {
          pdf.addImage(linea.photoPreview, 'JPEG', 14, yPos, 0, 50); 
          yPos += 55;
        } catch (e) { console.error("Error al añadir imagen al PDF:", e); pdf.text("Error al cargar la imagen.", 14, yPos); yPos += 10; }
      }
    }
  }
  
  const base64PDF = pdf.output('datauristring');
  const pdfContent = base64PDF.split(',')[1];
  const fileName = `Registro_ZBR_${supervisor.value.replace(/ /g, '_')}_${props.recordDate}.pdf`;
  const url = 'https://prod-208.westeurope.logic.azure.com:443/workflows/bbe024b3af4e4100a67eaecb763958ea/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cjHp_ExVHtbd-U7mWgZuYp-Z7E8fC7TLrb5VqC-9pus';
  const payload = { fileName: fileName, pdfContent: pdfContent };

  try {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (response.ok && result.status === 'success') {
      sendStatus.value = 'success';
      setTimeout(() => {
        resetForm();
        emit('goHome');
      }, 2500);
    } else {
      throw new Error(result.message || 'Error en la respuesta del servidor');
    }
  } catch (error) {
    console.error('Error al enviar el registro:', error);
    sendStatus.value = 'error';
  } finally {
    isSending.value = false;
  }
}
</script>

<template>
  <!-- --- CAMBIO AQUÍ: Se añade 'pb-24' para dejar espacio al final --- -->
  <div class="container mx-auto p-4 md:p-8 pb-24">
    <div class="mb-6">
      <button @click="$emit('goHome')" class="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg shadow hover:bg-gray-600">
        &larr; Volver atrás
      </button>
    </div>
    
    <div class="bg-white p-6 md:p-8 rounded-xl shadow-lg">
      <h1 class="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">Registro ZBR / Empaquetado</h1>
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="flex flex-col">
            <label class="font-medium text-gray-700 mb-1">Nombre del supervisor:</label>
            <input type="text" v-model="supervisor" class="p-2 border rounded-md" />
          </div>
          <div class="flex flex-col">
            <label class="font-medium text-gray-700 mb-1">Fecha del registro:</label>
            <input type="date" :value="recordDate" @input="updateDate" class="p-2 border rounded-md" />
          </div>
          <div class="flex flex-col">
            <span class="font-medium text-gray-700 mb-1">Día juliano:</span>
            <input type="text" :value="julianDay" disabled class="p-2 bg-gray-200 rounded-md" />
          </div>
        </div>

        <div v-if="isLoading" class="text-center text-gray-500">
          <p>Cargando productos...</p>
        </div>
        <div v-else>
          <LineaZBR ref="linea1Ref" :number="1" :allProducts="allProducts" :recordDate="recordDate" :julianDay="julianDay" @validate="isValid => linea1Valid = isValid" />
          <LineaZBR ref="linea2Ref" :number="2" :allProducts="allProducts" :recordDate="recordDate" :julianDay="julianDay" @validate="isValid => linea2Valid = isValid" />
          <LineaZBR ref="linea3Ref" :number="3" :allProducts="allProducts" :recordDate="recordDate" :julianDay="julianDay" @validate="isValid => linea3Valid = isValid" />
          <CuchillosZBR ref="cuchillosRef" @validate="isValid => cuchillosValid = isValid" />
        </div>
      </div>
    </div>
    
    <div class="mt-8 text-center">
      <button v-if="sendStatus !== 'success'" @click="generateAndSendPDF" :disabled="!isAllValid || isSending" class="w-full md:w-1/2 px-6 py-4 bg-green-600 text-white font-bold text-lg rounded-lg shadow hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
        {{ isSending ? 'Enviando Registro...' : 'Enviar Registro por Correo' }}
      </button>
      
      <div v-if="sendStatus === 'success'" class="mt-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
        <p class="font-bold">¡Registro enviado con éxito!</p>
        <p>Serás redirigido a la pantalla inicial en unos segundos...</p>
      </div>

      <div v-if="sendStatus === 'error'" class="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
        <p class="font-bold">Hubo un error al enviar el registro.</p>
        <p>Por favor, comprueba tu conexión e inténtalo de nuevo.</p>
      </div>
    </div>

    <Comprobador :isValid="isAllValid" />
  </div>

</template>