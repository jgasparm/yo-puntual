<template>
  <v-container fluid>

    <!-- ENCABEZADO / CABECERA CON INFO DEL ALUMNO -->
    <v-row class="my-4">
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <div v-if="infoAlumno">
              <p><strong>Tutor:</strong> {{ infoAlumno.tutor }}</p>
              <p><strong>Turno:</strong> {{ infoAlumno.turn_nombre }}</p>
              <p><strong>Nivel:</strong> {{ infoAlumno.nive_nombre }}</p>
              <p><strong>Grado:</strong> {{ infoAlumno.grad_nombre }}</p>
              <p><strong>Sección:</strong> {{ infoAlumno.secc_nombre }}</p>
            </div>
            <div v-else>
              <v-alert type="info">No se encontró información del alumno.</v-alert>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- TABLA DE HORARIO (VERSIÓN DESKTOP) -->
    <div v-if="isDesktop">
      <v-card>
        <v-card-title>
          <span class="text-h6">Horario Escolar</span>
        </v-card-title>
        <v-card-text>
          <!-- Cabecera con días de la semana -->
          <table class="horario-desktop-table">
            <thead>
              <tr>
                <th style="min-width: 90px;">Hora</th>
                <th v-for="dia in diasOrdenados" :key="dia" style="min-width: 120px;">
                  {{ dia }}
                </th>
              </tr>
            </thead>
            <tbody>
              <!-- Iteramos cada rango (fila) -->
              <tr v-for="rango in horario" :key="rango.hesh_id">
                <!-- Primera celda: Rango de horas -->
                <td>
                  <strong>{{ rango.hesh_hora_inicio }} - {{ rango.hesh_hora_fin }}</strong>
                  <div v-if="rango.hesh_indicador_recreo === 'S'" style="color: #F44336; font-weight: bold;">
                    Recreo
                  </div>
                </td>
                <!-- Celdas de cursos por día -->
                <td v-for="dia in diasOrdenados" :key="dia">
                  <!-- Buscamos si existe un objeto en rango.dias con .dia == el "dia actual" -->
                  <span v-if="cursoPorDia(rango, dia)">
                    {{ cursoPorDia(rango, dia) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </v-card-text>
      </v-card>
    </div>

    <!-- VERSIÓN MOBILE: LISTA DE RANGOS EN TARJETAS -->
    <template v-else>
  <v-row dense>
    <!-- Iteramos primero sobre los días (LUNES, MARTES, MIÉRCOLES, etc.) -->
    <v-col
      v-for="dia in diasOrdenados"
      :key="dia"
      cols="12"
      class="mb-3"
    >
      <v-card outlined>
        <!-- Cabecera que muestra el nombre del día -->
        <v-card-title>
          {{ dia }}
        </v-card-title>

        <v-card-text>
          <!-- Listado de RANGOS donde aparezca este día -->
          <div
            v-for="(rango) in horario"
            :key="rango.hesh_id"
          >
            <!-- Preguntamos si el rango es recreo -->
            <div v-if="rango.hesh_indicador_recreo === 'S'">
              <strong>{{ rango.hesh_hora_inicio }} - {{ rango.hesh_hora_fin }}</strong>
              <span style="color: #F44336; font-weight: bold;">
                (RECREO)
              </span>
              <v-divider class="my-2"></v-divider>
            </div>
            <!-- Si NO es recreo, mostramos el curso si aplica a este día -->
            <div v-else-if="cursoPorDia(rango, dia)">
              <strong>{{ rango.hesh_hora_inicio }} - {{ rango.hesh_hora_fin }}</strong>
              <div>{{ cursoPorDia(rango, dia) }}</div>
              <v-divider class="my-2"></v-divider>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import axios from 'axios'

// EJEMPLO: IDs y perfil obtenidos del localStorage
const userId = localStorage.getItem('userId') || 1 // 'ai_usua_id'
const anioEscolar = localStorage.getItem('ac_anio_escolar') || 2025
const profile = localStorage.getItem('profile') || 'demo'

// DATA REACTIVA
const infoAlumno = ref(null) // Tutor, Turno, Nivel, Grado, Seccion, etc.
const horario = ref([])      // Array de rangos con subarray 'dias'

// LLAMADAS API
async function fetchInformacionAlumno() {
  try {
    const token = localStorage.getItem('token')
    const baseUrl = 'https://amsoftsolution.com/amss/ws/wsConsultaInformacionAlumno.php'
    const params = {
      ai_usua_id: userId,
      ac_anio_escolar: anioEscolar,
      av_profile: profile
    }
    const config = {
      params,
      headers: { Authorization: `Bearer ${token}` }
    }
    const response = await axios.get(baseUrl, config)
    if (response.data.status && response.data.data.length > 0) {
      infoAlumno.value = response.data.data[0]
      // Y con ese aude_id, llamas a fetchHorarioEscolar
      if (infoAlumno.value.aude_id) {
        fetchHorarioEscolar(infoAlumno.value.aude_id)
      }
    }
  } catch (error) {
    console.error('Error fetchInformacionAlumno:', error)
  }
}

async function fetchHorarioEscolar(audeId) {
  try {
    const token = localStorage.getItem('token')
    const baseUrl = 'https://amsoftsolution.com/amss/ws/wsConsultaHorarioEscolar.php'
    const params = {
      ai_aude_id: audeId,
      av_profile: profile
    }
    const config = {
      params,
      headers: { Authorization: `Bearer ${token}` }
    }
    const response = await axios.get(baseUrl, config)
    if (response.data.status) {
      horario.value = response.data.data
    } else {
      horario.value = []
    }
  } catch (error) {
    console.error('Error fetchHorarioEscolar:', error)
    horario.value = []
  }
}

// LÓGICA PARA MOSTRAR LOS DÍAS (LUNES, MARTES, ETC.)
const diasOrdenados = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES'
  // ... si tuvieras más
]

// Función para retornar el nombre del curso (o lo que sea) de un rango en un día específico
function cursoPorDia(rango, dia) {
  const diaObj = rango.dias.find(d => d.dia === dia)
  return diaObj ? diaObj.curso : null
}

// DETECTAR DESKTOP/MOBILE
const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp

// Al montar, cargamos la info
onMounted(() => {
  fetchInformacionAlumno()
})
</script>

<style scoped>
.horario-desktop-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.horario-desktop-table th,
.horario-desktop-table td {
  border: 1px solid #ccc;
  padding: 8px 6px;
}
</style>
