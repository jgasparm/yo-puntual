<template>
  <v-container fluid>
    <!-- Encabezado -->
    <v-row class="py-4">
      <v-col cols="12" class="text-center">
        <h1 class="text-h4">Calendario Escolar {{ anioAcademico }}</h1>
      </v-col>
    </v-row>

    <!-- Filtro de Mes -->
    <v-row class="mb-4" justify="center" align="center">
      <v-col cols="12" sm="6" md="4">
        <v-select
          v-model="selectedMonth"
          :items="monthOptions"
          item-title="label"
          item-value="value"
          :return-object="false"
          label="Mes"
          outlined
          dense
        ></v-select>
      </v-col>
      <v-col cols="12" sm="6" md="2" class="d-flex align-center">
        <v-btn color="primary" @click="filterByMonth" block>
          Filtrar
        </v-btn>
      </v-col>
      <v-col
        cols="12"
        sm="6"
        md="2"
        class="d-flex align-center"
        v-if="filteredEvents.length > 0"
      >
        <v-btn color="secondary" @click="downloadPDF" block>
          Descargar PDF
        </v-btn>
      </v-col>
    </v-row>

    <!-- Lista de eventos -->
    <v-row ref="calendarContent">
      <!-- Iteramos sobre los eventos filtrados -->
      <v-col cols="12" v-for="(event, index) in filteredEvents" :key="index">
        <v-row class="align-center my-4 py-2 event-row">
          <!-- Primera columna: Día abreviado y número -->
          <v-col cols="12" sm="2" class="text-center day-col">
            <div class="day-abbrev">
              {{ getDayAbbreviation(event.caes_fecha_inicio) }}
            </div>
            <div class="day-number">
              {{ getDayNumber(event.caes_fecha_inicio) }}
            </div>
          </v-col>

          <!-- Segunda columna: Detalles del evento -->
          <v-col cols="12" sm="10">
            <div class="event-title text-left">
              {{ event.caes_titulo }}
            </div>
            <div class="d-flex align-center date-range mt-1">
              <v-icon size="18" class="me-2" color="primary">mdi-calendar</v-icon>
              {{ getDateRangeText(event.caes_fecha_inicio, event.caes_fecha_fin) }}
            </div>
            <!-- Días restantes (solo si la fecha de inicio es futura) -->
            <div
              v-if="daysUntilStart(event.caes_fecha_inicio) > 0"
              class="d-flex align-center mt-1 days-remaining"
            >
              <v-icon size="18" class="me-2" color="primary">mdi-timer</v-icon>
              Quedan {{ daysUntilStart(event.caes_fecha_inicio) }} días
            </div>
          </v-col>
        </v-row>
      </v-col>

      <!-- Si no hay eventos filtrados -->
      <v-col cols="12" v-if="filteredEvents.length === 0">
        <v-alert type="info">
          No hay eventos para el mes seleccionado.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Obtenemos el año académico desde localStorage
const anioAcademico = ref(localStorage.getItem("anio_academico"));

// Opciones de meses para el select
const monthOptions = ref([
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 },
]);

// Variables reactivas
// selectedMonth será un número (por ejemplo, 3 para marzo)
const selectedMonth = ref(null);
const events = ref([]);         // Eventos obtenidos de la API
const filteredEvents = ref([]); // Eventos filtrados por mes

// Array para abreviar días de la semana (en español)
const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function parseLocalDate(dateString) {
  // dateString: "2025-03-03"
  const [year, month, day] = dateString.split('-')
  // month - 1, porque los meses en JS van de 0 a 11
  return new Date(year, month - 1, day)
}

/**
 * Retorna la abreviatura del día de la semana (ej. 'Mar')
 */
 function getDayAbbreviation(dateString) {
  console.log(dateString)
  if (!dateString) return ''
  const date = parseLocalDate(dateString)
  return daysOfWeek[date.getDay()]
}

/**
 * Retorna el número de día (ej. '3')
 */
 function getDayNumber(dateString) {
  if (!dateString) return ''
  const date = parseLocalDate(dateString)
  return date.getDate()
}

/**
 * Formato corto de fecha en español (ej. '3 de marzo')
 */
 function formatShortDate(dateString) {
  if (!dateString) return ''
  const date = parseLocalDate(dateString)
  const day = date.getDate()
  const month = date.toLocaleString('es-ES', { month: 'long' })
  return `${day} de ${month}`
}

/**
 * Genera el texto del rango de fechas:
 * - Si inicio y fin son iguales, retorna la fecha única.
 * - Sino, retorna "Desde [fecha inicio] - hasta [fecha fin]".
 */
 function getDateRangeText(startStr, endStr) {
  if (!startStr) return ''
  if (!endStr) return formatShortDate(startStr)
  
  const start = parseLocalDate(startStr)
  const end = parseLocalDate(endStr)
  
  if (start.getTime() === end.getTime()) {
    return formatShortDate(startStr)
  } else {
    return `Desde ${formatShortDate(startStr)} - hasta ${formatShortDate(endStr)}`
  }
}

/**
 * Calcula cuántos días faltan para que inicie el evento.
 * Retorna 0 si la fecha de inicio ya pasó o es hoy.
 */
 function daysUntilStart(dateString) {
  if (!dateString) return 0
  const now = new Date()
  const startDate = new Date(dateString)
  const diff = startDate - now
  const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

// Referencia al contenedor para generar el PDF
const calendarContent = ref(null);

// Función para llamar a la API y obtener los eventos
async function calendarioEscolar() {
  try {
    const token = localStorage.getItem("token");
    const profile = localStorage.getItem("profile");

    if (!token || !profile) {
      console.warn("Falta token o profile en localStorage.");
      return;
    }
    console.log("Ejecutando consulta a la API...");
    const baseUrl = "https://amsoftsolution.com/amss/ws/wsConsultaCalendarioEscolar.php";
    const params = {
      ac_anio_academico: anioAcademico.value,
      av_profile: profile,
    };

    const configReq = {
      params,
      headers: { Authorization: `Bearer ${token}` },
    };

    const response = await axios.get(baseUrl, configReq);
    if (response.data.status) {
      // Asignamos la data de la API al arreglo de eventos
      events.value = response.data.data;
      filterByMonth();
    }
  } catch (error) {
    console.error('Error al obtener los eventos:', error);
  }
}

// Filtra los eventos según el mes seleccionado
function filterByMonth() {
  console.log("Mes seleccionado:", selectedMonth.value);
  if (!selectedMonth.value) {
    filteredEvents.value = events.value;
  } else {
    filteredEvents.value = events.value.filter(event => {
      const start = parseLocalDate(event.caes_fecha_inicio);
      const eventMonth = start.getMonth() + 1; // Ajuste para que Enero = 1
      console.log(`Evento: ${event.caes_titulo}, Fecha: ${event.caes_fecha_inicio}, Mes calculado: ${eventMonth}`);
      return eventMonth === selectedMonth.value;
    });
  }
  console.log("Eventos filtrados:", filteredEvents.value);
}

// Genera un PDF con la información mostrada
async function downloadPDF() {
  try {
    const element = calendarContent.value;
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const imgRatio = imgProps.height / imgProps.width;
    const imageHeight = pdfWidth * imgRatio;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imageHeight);
    pdf.save(`CalendarioEscolar_${anioAcademico.value}.pdf`);
  } catch (error) {
    console.error('Error al generar PDF:', error);
  }
}

// Al montar el componente:
// Se preselecciona el mes actual (valor numérico) y se ejecuta la consulta.
onMounted(() => {
  selectedMonth.value = new Date().getMonth() + 1;
  calendarioEscolar();
});
</script>

<style scoped>
/* Estilos para la visualización */
.event-row {
  border-bottom: 1px solid #eee;
}

.day-col {
  background-color: #f9f9f9;
  padding: 1rem 0;
}

.day-abbrev {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #666;
}

.day-number {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
  color: #333;
}

.event-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.date-range {
  font-size: 0.9rem;
  color: #555;
}

.days-remaining {
  font-size: 0.9rem;
  color: #999;
}
</style>