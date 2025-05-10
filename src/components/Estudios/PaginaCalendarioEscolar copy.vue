<template>
  <v-container fluid>
    <!-- Encabezado principal -->
    <v-row>
      <v-col cols="12">
        <div class="text-h5 font-weight-bold text-primary mb-2">
          📅 Calendario Escolar {{ anioEscolar }}
        </div>
        <div class="text-body-2 text-grey-darken-1">
          Revisa los eventos escolares por mes. Puedes descargar el calendario en PDF.
        </div>
      </v-col>
    </v-row>

    <!-- Barra de navegación de mes -->
    <v-row align="center" class="my-4">
      <v-col cols="12" sm="6" class="d-flex align-center justify-start">
        <v-btn variant="text" @click="prevMonth" icon :title="'Mes anterior'">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <span class="mx-2 month-year-label">
          {{ currentMonthLabel }}
        </span>
        <v-btn variant="text" @click="nextMonth" icon :title="'Mes siguiente'">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12" sm="6" class="d-flex align-center justify-end" v-if="filteredEvents.length">
        <v-btn color="primary" @click="downloadPDF" prepend-icon="mdi-download">
          Descargar PDF
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loading indicator -->
    <v-progress-linear
      v-if="events.length === 0"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <!-- Lista de eventos -->
    <v-row ref="calendarContent">
      <v-col cols="12" v-for="(event, index) in filteredEvents" :key="index">
        <v-card class="mb-3 px-3 py-2 elevation-1">
          <v-row no-gutters align="center">
            <!-- Día y número -->
            <v-col cols="3" sm="2" class="text-center day-col">
              <div class="day-abbrev">
                {{ getDayAbbreviation(event.caes_fecha_inicio) }}
              </div>
              <div class="day-number">
                {{ getDayNumber(event.caes_fecha_inicio) }}
              </div>
            </v-col>

            <!-- Detalles -->
            <v-col cols="9" sm="10">
              <div class="event-title">
                {{ event.caes_titulo }}
              </div>
              <div class="d-flex align-center date-range mt-1">
                <v-icon size="18" class="me-2" color="primary">mdi-calendar</v-icon>
                {{ getDateRangeText(event.caes_fecha_inicio, event.caes_fecha_fin) }}
              </div>
              <div
                v-if="daysUntilStart(event.caes_fecha_inicio) > 0"
                class="d-flex align-center mt-1 days-remaining"
              >
                <v-icon size="18" class="me-2" color="primary">mdi-timer</v-icon>
                Quedan {{ daysUntilStart(event.caes_fecha_inicio) }} días
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Sin eventos -->
      <v-col cols="12" v-if="filteredEvents.length === 0">
        <v-alert type="info" border="start" border-color="primary">
          No hay eventos para el mes seleccionado.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>


<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Obtenemos el año escolar desde localStorage
const anioEscolar = ref(localStorage.getItem("anio_escolar"))

// Opciones de meses para el encabezado
const monthOptions = [
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
]

// Variable reactiva para el mes seleccionado (1-12)
const selectedMonth = ref(null)
const events = ref([])         // Eventos obtenidos de la API
const filteredEvents = ref([]) // Eventos filtrados por mes

// Array para abreviar días de la semana (en español)
const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

/**
 * Convierte una cadena "YYYY-MM-DD" a una fecha local sin offset
 */
function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split('-')
  return new Date(year, month - 1, day)
}

/**
 * Retorna la abreviatura del día de la semana (ej. 'Mar')
 */
function getDayAbbreviation(dateString) {
  if (!dateString) return ''
  const date = parseLocalDate(dateString)
  return daysOfWeek[date.getDay()]
}

/**
 * Retorna el número de día (ej. '3')
 */
function getDayNumber(dateString) {
  if (!dateString) return ''
  return parseLocalDate(dateString).getDate()
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
  const startDate = parseLocalDate(dateString)
  const diff = startDate - now
  const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

// Referencia al contenedor para generar el PDF
const calendarContent = ref(null)

/**
 * Llama a la API y obtiene los eventos
 */
async function calendarioEscolar() {
  try {
    const token = localStorage.getItem("token")
    const profile = localStorage.getItem("profile")

    if (!token || !profile) {
      console.warn("Falta token o profile en localStorage.")
      return
    }
    console.log("Ejecutando consulta a la API...")
    const baseUrl = "https://amsoftsolution.com/amss/ws/wsConsultaCalendarioEscolar.php"
    const params = {
      ac_anio_escolar: anioEscolar.value,
      av_profile: profile,
    }

    const configReq = {
      params,
      headers: { Authorization: `Bearer ${token}` },
    }

    const response = await axios.get(baseUrl, configReq)
    if (response.data.status) {
      events.value = response.data.data
      filterByMonth()
    }
  } catch (error) {
    console.error('Error al obtener los eventos:', error)
  }
}

/**
 * Filtra los eventos según el mes seleccionado
 */
function filterByMonth() {
  console.log("Mes seleccionado:", selectedMonth.value)
  if (!selectedMonth.value) {
    filteredEvents.value = events.value
  } else {
    filteredEvents.value = events.value.filter(event => {
      const start = parseLocalDate(event.caes_fecha_inicio)
      // Sumamos 1 porque getMonth() retorna 0-11
      const eventMonth = start.getMonth() + 1
      return eventMonth === selectedMonth.value
    })
  }
  console.log("Eventos filtrados:", filteredEvents.value)
}

/**
 * Avanza al siguiente mes y actualiza la lista
 */
function nextMonth() {
  if (selectedMonth.value === 12) {
    selectedMonth.value = 1
    // Si deseas cambiar el año al llegar a diciembre, hazlo aquí
    // anioEscolar.value = parseInt(anioEscolar.value) + 1
  } else {
    selectedMonth.value++
  }
  filterByMonth()
}

/**
 * Retrocede al mes anterior y actualiza la lista
 */
function prevMonth() {
  if (selectedMonth.value === 1) {
    selectedMonth.value = 12
    // Si deseas cambiar el año al llegar a enero, hazlo aquí
    // anioEscolar.value = parseInt(anioEscolar.value) - 1
  } else {
    selectedMonth.value--
  }
  filterByMonth()
}

/**
 * Genera un PDF con la información mostrada
 */
 async function downloadPDF() {
  try {
    // Esperamos a que el DOM se actualice para asegurarnos que el elemento esté adjunto
    await nextTick();
    // Si calendarContent es un componente, accedemos a su elemento nativo
    const element = calendarContent.value.$el || calendarContent.value;
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const imgRatio = imgProps.height / imgProps.width;
    const imageHeight = pdfWidth * imgRatio;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imageHeight);
    pdf.save(`CalendarioEscolar_${anioEscolar.value}.pdf`);
  } catch (error) {
    console.error('Error al generar PDF:', error);
  }
}


// Computed para mostrar el nombre del mes actual
const currentMonthLabel = computed(() => {
  const month = monthOptions.find(m => m.value === selectedMonth.value)
  return month ? month.label.toUpperCase() : ''
})

// Al montar el componente: se preselecciona el mes actual y consultamos la API
onMounted(() => {
  selectedMonth.value = new Date().getMonth() + 1
  calendarioEscolar()
})
</script>

<style scoped>
.event-row {
  border-bottom: 1px solid #eee;
}
.day-col {
  background-color: #f9f9f9;
  padding: 1rem 0;
  border-radius: 8px;
}
.day-abbrev {
  font-size: 0.85rem;
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
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976D2;
}

.date-range,
.days-remaining {
  font-size: 0.95rem;
  color: #555;
}

.month-year-label {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1976D2;
}
</style>
