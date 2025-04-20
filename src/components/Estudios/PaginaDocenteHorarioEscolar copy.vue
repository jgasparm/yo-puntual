<template>
  <!-- ✅ Breadcrumb local -->
  <v-breadcrumbs class="mb-4" :items="breadcrumbItems" divider=">">
    <template #prepend>
      <v-icon color="primary" class="me-2">mdi-home</v-icon>
    </template>
  </v-breadcrumbs>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold text-primary">📚 Horario del Docente</h2>
        <p class="text-body-2 text-grey-darken-1">
          Revisa los cursos que dictas cada día junto con el aula correspondiente.
        </p>
      </v-col>
    </v-row>

    <v-sheet v-if="infoEmpleado" color="blue-lighten-5" class="pa-4 mb-2 rounded-lg elevation-1 section-space">
      <v-row>
        <v-col cols="12">
          <div class="text-h6 font-weight-bold text-primary mb-2">
            📘 {{ perfil === 1 ? `Tutor: ${nombreTutor}` : 'Tutor del aula' }}
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-icon color="primary" start>mdi-clock-time-eight-outline</v-icon>
          <strong>Turno:</strong> <span>{{ infoEmpleado.turno }}</span>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-icon color="primary" start>mdi-school</v-icon>
          <strong>Nivel:</strong> <span>{{ infoEmpleado.nivel }}</span>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-icon color="primary" start>mdi-numeric</v-icon>
          <strong>Grado:</strong> <span>{{ infoEmpleado.grado }}</span>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-icon color="primary" start>mdi-alpha-s-circle-outline</v-icon>
          <strong>Sección:</strong> <span>{{ infoEmpleado.seccion }}</span>
        </v-col>
      </v-row>
    </v-sheet>

    <div v-if="isDesktop">
      <v-card>
        <v-card-text>
          <table class="horario-desktop-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th v-for="dia in diasOrdenados" :key="dia">{{ dia }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rango in horario" :key="rango.hesh_id">
                <td>
                  <strong>{{ rango.hesh_hora_inicio }} {{ rango.hesh_hora_fin }}</strong>
                  <div v-if="rango.hesh_indicador_recreo === 'S'" class="recreo-text">Recreo</div>
                </td>
                <td v-for="dia in diasOrdenados" :key="dia">
                  <div v-if="cursoPorDia(rango, dia)" v-html="cursoPorDia(rango, dia)" />
                </td>
              </tr>
            </tbody>
          </table>
        </v-card-text>
      </v-card>
    </div>

    <template v-else>
      <v-row dense>
        <v-col cols="12" v-for="dia in diasOrdenados" :key="dia">
          <v-card>
            <v-card-title>{{ dia }}</v-card-title>
            <v-card-text>
              <div v-for="rango in horario" :key="rango.hesh_id">
                <div v-if="cursoPorDia(rango, dia)">
                  <p><strong>{{ rango.hesh_hora_inicio }} - {{ rango.hesh_hora_fin }}</strong></p>
                  <p v-html="cursoPorDia(rango, dia)"></p>
                  <v-divider class="my-2" />
                </div>
                <div v-else-if="rango.hesh_indicador_recreo === 'S'">
                  <p><strong>{{ rango.hesh_hora_inicio }} - {{ rango.hesh_hora_fin }}</strong></p>
                  <span class="recreo-text">(RECREO)</span>
                  <v-divider class="my-2" />
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
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useDisplay } from 'vuetify'

const route = useRoute()
const horario = ref([])
const infoEmpleado = ref(null)
const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp

const perfil = ref(null)
const profile = ref('')
const userId = ref(null)
const nombreTutor = ref(null)

const breadcrumbItems = ref([]) // ✅ Nuevo breadcrumb reactivo

const anioEscolar = localStorage.getItem('anio_escolar')
const token = localStorage.getItem('token')

const diasOrdenados = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']

function cursoPorDia(rango, dia) {
  const diaObj = rango.dias.find(d => d.dia === dia)
  return diaObj ? `${diaObj.grado} ${diaObj.nivel}<br><strong>${diaObj.curso}</strong>` : null
}

async function fetchInfoEmpleado() {
  if (!userId.value) return
  try {
    const config = {
      params: {
        ai_usua_id: userId.value,
        ac_anio_escolar: anioEscolar,
        av_profile: profile.value
      },
      headers: { Authorization: `Bearer ${token}` }
    }
    const url = 'https://amsoftsolution.com/amss/ws/wsConsultaInformacionEmpleado.php'
    const { data } = await axios.get(url, config)
    if (data.status && data.data.length > 0) {
      infoEmpleado.value = data.data[0]
    }
  } catch (error) {
    console.error('Error al obtener infoEmpleado:', error)
  }
}

async function fetchHorario() {
  if (!userId.value) return
  try {
    const config = {
      params: {
        ai_usua_id: userId.value,
        av_profile: profile.value
      },
      headers: { Authorization: `Bearer ${token}` }
    }
    const url = 'https://amsoftsolution.com/amss/ws/wsConsultaHorarioEscolarDocente.php'
    const { data } = await axios.get(url, config)
    if (data.status) horario.value = data.data
  } catch (error) {
    console.error('Error al cargar horario del docente:', error)
  }
}

onMounted(() => {
  perfil.value = Number(localStorage.getItem('perfil'))
  profile.value = localStorage.getItem('profile')
  const idGuardado = localStorage.getItem('usua_id')

  if (perfil.value === 1) {
    userId.value = route.query.usua_id
    nombreTutor.value = route.query.nombre_docente
    breadcrumbItems.value = [
      { text: 'Principal', to: '/principal' },
      { text: 'Docentes', to: '/principal/docentes-anio-escolar' },
      { text: 'Horario escolar' }
    ]
  } else {
    userId.value = idGuardado
    nombreTutor.value = null
    breadcrumbItems.value = [
      { text: 'Principal', to: '/principal' },
      { text: 'Horario escolar' }
    ]
  }

  fetchHorario()
  fetchInfoEmpleado()
})

watch(
  () => route.query,
  (newQuery) => {
    if (perfil.value === 1) {
      userId.value = newQuery.usua_id
      nombreTutor.value = newQuery.nombre_docente
      fetchHorario()
      fetchInfoEmpleado()
    }
  }
)
</script>

<style scoped>
.horario-desktop-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  border: 1px solid #ccc;
}
.horario-desktop-table th {
  background-color: #E3F2FD;
  color: #1565C0;
  font-weight: bold;
}
.horario-desktop-table td {
  padding: 8px;
  border: 1px solid #ccc;
}
.recreo-text {
  color: #F44336;
  font-weight: bold;
}
.section-space {
  margin-bottom: 24px;
}
</style>
