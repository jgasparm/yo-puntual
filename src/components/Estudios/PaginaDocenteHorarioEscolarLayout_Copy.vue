<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold text-primary">📚 Horario del Docente</h2>
        <p class="text-body-2 text-grey-darken-1">
          Revisa los cursos que dictas cada día junto con el aula correspondiente.
        </p>
      </v-col>
    </v-row>

    <v-sheet
      v-if="infoEmpleado"
      color="blue-lighten-5"
      class="pa-4 mb-2 rounded-lg elevation-1 section-space"
    >
      <v-row>
        <v-col cols="12">
          <div class="text-h6 font-weight-bold text-primary mb-2">
            📘 {{ tituloTutor }}
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
                  <div
                    v-if="rango.hesh_indicador_recreo === 'S'"
                    class="recreo-text"
                  >
                    Recreo
                  </div>
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
  </v-container>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import axios from 'axios'
import { useDisplay } from 'vuetify'

const props = defineProps({
  usuaId: Number,
  profile: String,
  nombreTutor: String,
  tituloTutor: String
})

const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp

const horario = ref([])
const infoEmpleado = ref(null)

const anioEscolar = localStorage.getItem('anio_escolar')
const token = localStorage.getItem('token')

const diasOrdenados = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']

function cursoPorDia(rango, dia) {
  const diaObj = rango.dias.find((d) => d.dia === dia)
  return diaObj
    ? `${diaObj.grado} ${diaObj.nivel}<br><strong>${diaObj.curso}</strong>`
    : null
}

async function fetchInfoEmpleado() {
  if (!props.usuaId || !props.profile || !anioEscolar) {
    console.warn('❌ Parámetros incompletos para infoEmpleado:', {
      usuaId: props.usuaId,
      profile: props.profile,
      anioEscolar
    })
    return
  }

  try {
    const { data } = await axios.get(
      'https://amsoftsolution.com/amss/ws/wsConsultaInformacionEmpleado.php',
      {
        params: {
          ai_usua_id: props.usuaId,
          ac_anio_escolar: anioEscolar,
          av_profile: props.profile
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    if (data.status && data.data.length > 0) {
      infoEmpleado.value = data.data[0]
    }
  } catch (err) {
    console.error('❌ Error al obtener infoEmpleado:', err)
  }
}

async function fetchHorario() {
  if (!props.usuaId || !props.profile) {
    console.warn('❌ Parámetros incompletos para horario:', {
      usuaId: props.usuaId,
      profile: props.profile
    })
    return
  }

  try {
    const { data } = await axios.get(
      'https://amsoftsolution.com/amss/ws/wsConsultaHorarioEscolarDocente.php',
      {
        params: {
          ai_usua_id: props.usuaId,
          av_profile: props.profile
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    if (data.status) {
      horario.value = data.data
    }
  } catch (err) {
    console.error('❌ Error al obtener horario:', err)
  }
}

watchEffect(() => {
  if (props.usuaId && props.profile && anioEscolar) {
    fetchInfoEmpleado()
    fetchHorario()
  }
})
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
