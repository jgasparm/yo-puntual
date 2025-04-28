<template>
  <v-container id="contenedor-horario">
    <!-- Botón exportar -->
    <v-row class="mb-4 justify-end">
      <v-btn color="primary" @click="exportarPDF" prepend-icon="mdi-file-pdf-box">
        Exportar PDF
      </v-btn>
    </v-row>

    <!-- Cabecera PDF (oculta en pantalla) -->
    <div id="cabecera-pdf" style="text-align: center; margin-bottom: 1rem;">
      <img src="/logo.png" alt="Logo" height="60" style="margin-bottom: 10px;" />
      <h2 style="margin: 0; font-size: 18px;">Horario del Docente</h2>
      <p style="margin: 4px 0;">Nombre: {{ infoEmpleado?.nombre_completo || '---' }}</p>
      <p style="margin: 0;">Año escolar: {{ anioEscolar }}</p>
    </div>

    <!-- Vista Desktop -->
    <div v-if="mdAndUp">
      <v-card>
        <v-card-text class="horario-scrollable">
          <table class="horario-desktop-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th v-for="dia in diasOrdenados" :key="dia">{{ dia }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rango, index) in horarioAgrupado" :key="index">
                <td>
                  <strong>{{ rango.hesh_hora_inicio }} - {{ rango.hesh_hora_fin }}</strong>
                  <div v-if="rango.hesh_indicador_recreo === 'S'" class="recreo-text">
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

    <!-- Vista Mobile -->
    <div v-else>
      <v-row>
        <v-col
          v-for="(rango, index) in horarioAgrupado"
          :key="index"
          cols="12"
        >
          <v-card class="pa-2 mb-4 rounded-lg shadow-mobile">
            <v-card-title class="text-primary text-h6">
              {{ rango.hesh_hora_inicio }} - {{ rango.hesh_hora_fin }}
            </v-card-title>
            <v-card-text>
              <v-alert
                v-if="rango.hesh_indicador_recreo === 'S'"
                type="warning"
                dense
                outlined
                class="mb-2"
              >
                Recreo
              </v-alert>
              <div
                v-for="dia in diasConCurso(rango)"
                :key="dia"
                class="mb-3"
              >
                <div class="text-caption font-weight-bold text-grey-darken-1">{{ dia }}</div>
                <div v-html="cursoPorDia(rango, dia)" class="ml-2" />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import axios from 'axios'
import { useDisplay } from 'vuetify'
import html2pdf from 'html2pdf.js'

const props = defineProps({
  usuaId: Number,
  profile: String,
  nombreTutor: String,
  tituloTutor: String
})

const { mdAndUp } = useDisplay()
const anioEscolar = localStorage.getItem('anio_escolar')
const token = localStorage.getItem('token')

const horario = ref([])
const infoEmpleado = ref(null)

const diasOrdenados = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']

function cursoPorDia(rango, dia) {
  const cursosDelDia = rango.dias.filter((d) => d.dia === dia)
  if (!cursosDelDia.length) return null

  return cursosDelDia
    .map((d) => `${d.grado} ${d.nivel}<br><strong>${d.curso}</strong>`)
    .join('<hr style="margin: 4px 0;">')
}

function diasConCurso(rango) {
  return diasOrdenados.filter((dia) => cursoPorDia(rango, dia))
}

const horarioAgrupado = computed(() => {
  const agrupado = {}

  horario.value.forEach((rango) => {
    const key = `${rango.hesh_hora_inicio}-${rango.hesh_hora_fin}`

    if (!agrupado[key]) {
      agrupado[key] = {
        hesh_hora_inicio: rango.hesh_hora_inicio,
        hesh_hora_fin: rango.hesh_hora_fin,
        hesh_indicador_recreo: rango.hesh_indicador_recreo,
        dias: []
      }
    }

    agrupado[key].dias = agrupado[key].dias.concat(rango.dias)
  })

  return Object.values(agrupado)
})

async function fetchInfoEmpleado() {
  if (!props.usuaId || !props.profile || !anioEscolar) return

  try {
    const { data } = await axios.get(
      'https://amsoftsolution.com/amss/ws/wsConsultaInformacionEmpleado.php',
      {
        params: {
          ai_usua_id: props.usuaId,
          ac_anio_escolar: anioEscolar,
          av_profile: props.profile
        },
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    if (data.status && data.data.length > 0) {
      const d = data.data[0]
      infoEmpleado.value = {
        ...d,
        nombre_completo: `${d.nombres} ${d.apellido_paterno} ${d.apellido_materno}`
      }
    }
  } catch (err) {
    console.error('❌ Error al obtener infoEmpleado:', err)
  }
}

async function fetchHorario() {
  if (!props.usuaId || !props.profile) return

  try {
    const { data } = await axios.get(
      'https://amsoftsolution.com/amss/ws/wsConsultaHorarioEscolarDocente.php',
      {
        params: {
          ai_usua_id: props.usuaId,
          av_profile: props.profile
        },
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    if (data.status) {
      horario.value = data.data
    }
  } catch (err) {
    console.error('❌ Error al obtener horario:', err)
  }
}

function exportarPDF() {
  const horario = document.getElementById('contenedor-horario').cloneNode(true)
  const cabecera = document.getElementById('cabecera-pdf').cloneNode(true)

  const contenedor = document.createElement('div')
  contenedor.appendChild(cabecera)
  contenedor.appendChild(horario)

  const opciones = {
    margin: 0.5,
    filename: 'HorarioDocente.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  }

  html2pdf().from(contenedor).set(opciones).save()
}

watchEffect(() => {
  if (props.usuaId && props.profile && anioEscolar) {
    fetchInfoEmpleado()
    fetchHorario()
  }
})
</script>

<style scoped>
.horario-scrollable {
  overflow-x: auto;
  padding: 0;
}
.horario-desktop-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  border: 1px solid #ccc;
  min-width: 700px;
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
#cabecera-pdf {
  display: none;
}
@media print {
  #cabecera-pdf {
    display: block;
  }
  .v-btn {
    display: none !important;
  }
}
.section-space {
  margin-bottom: 24px;
}
.shadow-mobile {
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
