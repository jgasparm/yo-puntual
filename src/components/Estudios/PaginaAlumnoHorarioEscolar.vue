<template>
  <v-container fluid>
    <v-row class="section-space">
      <v-col cols="12">
        <div class="text-h5 font-weight-bold text-primary mb-2">
          🕘 Horario Escolar
        </div>
        <div class="text-body-2 text-grey-darken-1">
          Consulta los cursos que tienes cada día. ¡No olvides tus útiles!
        </div>
      </v-col>
    </v-row>

    <v-sheet 
      v-if="infoAlumno"
      color="blue-lighten-5" 
      class="pa-4 mb-2 rounded-lg elevation-1 section-space"
    >
      <v-row>
        <!-- Fila 2: Tutor -->
        <v-col cols="12">
          <v-icon color="primary" start>mdi-account</v-icon>
          <strong>Tutor:</strong> <span>{{ infoAlumno.tutor }}</span>
        </v-col>

        <!-- Fila 3: Turno, Nivel, Grado y Sección -->
        <v-col cols="12" sm="6" md="3">
          <v-icon color="primary" start>mdi-clock-time-eight-outline</v-icon>
          <strong>Turno:</strong> <span>{{ infoAlumno.turn_nombre }}</span>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-icon color="primary" start>mdi-school</v-icon>
          <strong>Nivel:</strong> <span>{{ infoAlumno.nive_nombre }}</span>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-icon color="primary" start>mdi-numeric</v-icon>
          <strong>Grado:</strong> <span>{{ infoAlumno.grad_nombre }}</span>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-icon color="primary" start>mdi-alpha-s-circle-outline</v-icon>
          <strong>Sección:</strong> <span>{{ infoAlumno.secc_nombre }}</span>
        </v-col>
      </v-row>
    </v-sheet>



    <!-- TABLA DE HORARIO (VERSIÓN DESKTOP) -->
    <div v-if="isDesktop">
      <v-card>
        <v-card-text>
          <!-- Cabecera con días de la semana -->
          <table class="horario-desktop-table">
            <thead>
              <tr>
<!--                 <th style="min-width: 90px;">Hora</th>
                <th v-for="dia in diasOrdenados" :key="dia" style="min-width: 120px;">
                  <v-card-title class="text-primary font-weight-bold text-uppercase">
                    {{ dia }}
                  </v-card-title>
                </th> -->
                <th>Hora</th>
                <th v-for="dia in diasOrdenados" :key="dia">{{ dia }}</th>
              </tr>
            </thead>
            <tbody>
              <!-- Iteramos cada rango (fila) -->
              <tr v-for="rango in horario" :key="rango.hesh_id">
                <!-- Primera celda: Rango de horas -->
                <td class="text-center">
                  <div class="text-body-2 d-inline-flex align-center justify-star">
                    <!-- <v-icon start color="primary">mdi-clock-outline</v-icon> -->
                    <strong>{{ rango.hesh_hora_inicio }}  {{ rango.hesh_hora_fin }}</strong>
                  </div>
                  <div v-if="rango.hesh_indicador_recreo === 'S'" class="recreo-text">
                    Recreo
                  </div>
                </td>

                <!-- Celdas de cursos por día -->
                <td v-for="dia in diasOrdenados" :key="dia">
                  <!-- Buscamos si existe un objeto en rango.dias con .dia == el "dia actual" -->
                  <template v-if="cursoPorDia(rango, dia)">
                    <div>
                      {{ cursoPorDia(rango, dia).docente }}
                    </div>
                    <div><strong>{{ cursoPorDia(rango, dia).curso }}</strong></div>
                  </template>
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
          <v-card-title class="text-primary font-weight-bold text-uppercase">
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
              <div class="text-body-2">
                <v-icon start color="primary">mdi-clock-outline</v-icon>
                <strong>{{ rango.hesh_hora_inicio }} - {{ rango.hesh_hora_fin }}</strong>
              </div>
              <span style="color: #F44336; font-weight: bold;">
                (RECREO)
              </span>
              <v-divider class="my-2"></v-divider>
            </div>
            <!-- Si NO es recreo, mostramos el curso si aplica a este día -->
            <div v-else-if="cursoPorDia(rango, dia)">
              <div class="text-body-2">
                <v-icon start color="primary">mdi-clock-outline</v-icon>
                <strong>{{ rango.hesh_hora_inicio }} - {{ rango.hesh_hora_fin }}</strong>
              </div>
              
              <template v-if="cursoPorDia(rango, dia)">
                <div>{{ cursoPorDia(rango, dia).docente }}</div>
                <div><strong>{{ cursoPorDia(rango, dia).curso }}</strong></div>
              </template>

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
const userId = localStorage.getItem('usua_id') 
const anioEscolar = localStorage.getItem('anio_escolar') 
const profile = localStorage.getItem('profile') 

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
        fetchHorarioEscolar(infoAlumno.value.aude_id, infoAlumno.value.nive_id)
      }
    }
  } catch (error) {
    console.error('Error fetchInformacionAlumno:', error)
  }
}

async function fetchHorarioEscolar(audeId, niveId) {
  try {
    const token = localStorage.getItem('token')
    const anesId = localStorage.getItem('anes_id')
    const baseUrl = 'https://amsoftsolution.com/amss/ws/wsConsultaHorarioEscolarAlumno.php'
    const params = {
      ai_anes_id: anesId,
      ac_nive_id: niveId,
      ai_aude_id: audeId,
      av_profile: profile
    }
    const config = {
      params,
      headers: { Authorization: `Bearer ${token}` }
    }
    const response = await axios.get(baseUrl, config)
    if (response.data.status) {
      horario.value = response.data.data.map(rango => ({
        ...rango,
        dias: rango.dias.filter(dc => dc.hesc_estado === 'A')
      }))
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
/* function cursoPorDia(rango, dia) {
  const diaObj = rango.dias.find(d => d.dia === dia)
  return diaObj ? diaObj.curso : null
} */

function cursoPorDia(rango, dia) {
  return rango.dias.find(d => d.dia === dia) || null
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
  border: 1px solid #E0E0E0;
}

.horario-desktop-table th {
  background-color: #E3F2FD;
  font-weight: bold;
  color: #1565C0;
}

.horario-desktop-table td {
  font-size: 0.95rem;
}

.recreo-text {
  color: #F44336;
  font-weight: bold;
}
.horario-desktop-table td.text-end {
  text-align: right;
}
.section-space {
  margin-bottom: 24px;
}

.horario-desktop-table th,
.horario-desktop-table td {
  border: 1px solid #E0E0E0;
  padding: 12px 8px;
}
</style>
