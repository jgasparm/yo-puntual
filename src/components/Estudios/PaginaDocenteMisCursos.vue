<template>
  <v-container class="py-4">
    <v-row>
      <v-col>
        <h2 class="text-h5 font-weight-bold text-primary">
          📘 Mis Cursos
        </h2>
        <p class="text-body-2 text-grey-darken-1 mb-4">
          Visualiza y gestiona los cursos que tienes asignados durante el año escolar.
        </p>
      </v-col>
    </v-row>

    <!-- Vista Desktop -->
    <div v-if="isDesktop">
      <v-alert v-if="!filteredCursos.length" type="info" class="mb-4">
        No hay cursos disponibles para mostrar.
      </v-alert>

      <v-data-table
        :headers="headers"
        :items="filteredCursos"
        class="elevation-1 mt-4"
      >
        <template v-slot:item.accion="{ item }">
          <div class="table-action">
            <v-btn
              icon
              variant="text"
              @click="openNotas(item, 'DocenteMisCursosRegistroNotas')"
              aria-label="Registrar notas"
            >
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top">Registrar notas</v-tooltip>
            </v-btn>
            <v-btn
              icon
              variant="text"
              color="info"
              @click="openNotas(item, 'DocenteMisCursosConsultaNotas')"
              aria-label="Ver notas"
            >
              <v-icon>mdi-eye-outline</v-icon>
              <v-tooltip activator="parent" location="top">Ver notas</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Vista Mobile -->
    <div v-else>
      <v-alert v-if="!filteredCursos.length" type="info">
        No hay cursos disponibles para mostrar.
      </v-alert>

      <v-row v-else dense>
        <v-col
          v-for="(curso, index) in paginatedCursos"
          :key="index"
          cols="12"
          class="mb-2"
        >
          <v-card outlined style="position: relative; text-align: left;">
            <v-btn
              icon
              variant="text"
              @click="openNotas(curso, 'DocenteMisCursosRegistroNotas')"
              class="btn-editar"
              aria-label="Registrar notas"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>

            <v-btn
              icon
              variant="text"
              color="info"
              @click="openNotas(curso, 'DocenteMisCursosConsultaNotas')"
              class="btn-ver"
              aria-label="Ver notas"
            >
              <v-icon>mdi-eye-outline</v-icon>
            </v-btn>

            <v-card-text style="padding-top: 60px;">
              <div><strong>Curso:</strong> {{ curso.aede_nombre }}</div>
              <div><strong>Aula:</strong> {{ curso.aula }}</div>
              <div><strong>Turno:</strong> {{ curso.turn_nombre }}</div>
              <div><strong>Nivel:</strong> {{ curso.nive_nombre }}</div>
              <div><strong>Grado:</strong> {{ curso.grad_nombre }}</div>
              <div><strong>Sección:</strong> {{ curso.secc_nombre }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-pagination
        v-if="paginatedPages > 1"
        v-model="currentPage"
        :length="paginatedPages"
        :total-visible="3"
        show-first-last
        first-icon="mdi-chevron-double-left"
        last-icon="mdi-chevron-double-right"
        prev-icon="mdi-chevron-left"
        next-icon="mdi-chevron-right"
        class="mt-2 custom-pagination"
      />
    </div>
  </v-container>

  <DialogMensaje
    v-model:mostrar="dialogMensajeVisible"
    :titulo="dialogMensajeTitulo"
    :mensaje="dialogMensajeTexto"
    :tipo="dialogMensajeTipo"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useDisplay } from 'vuetify'
import DialogMensaje from '@/components/DialogMensaje.vue'

// ——— DIÁLOGO —————————————————————————————————————————————
const dialogMensajeVisible = ref(false)
const dialogMensajeTitulo   = ref('')
const dialogMensajeTexto    = ref('')
const dialogMensajeTipo     = ref('error')
function mostrarDialogo(titulo, mensaje, tipo = 'error') {
  dialogMensajeTitulo.value  = titulo
  dialogMensajeTexto.value   = mensaje
  dialogMensajeTipo.value    = tipo
  dialogMensajeVisible.value = true
}

// ——— DISPLAY / RUTER ————————————————————————————————
const { mdAndUp } = useDisplay()
const isDesktop   = mdAndUp
const router      = useRouter()

// ——— DATOS —————————————————————————————————————————————
const allData           = ref([])
const bimestres         = ref([])
const selectedBimestre  = ref(null)

// ——— TABLA y PAGINACIÓN —————————————————————————
const headers = [
  { title: 'Curso',     key: 'aede_nombre' },
  { title: 'Aula',      key: 'aula' },
  { title: 'Turno',     key: 'turn_nombre' },
  { title: 'Nivel',     key: 'nive_nombre' },
  { title: 'Grado',     key: 'grad_nombre' },
  { title: 'Sección',   key: 'secc_nombre' },
  { title: 'Acción',    key: 'accion', sortable: false }
]

const currentPage  = ref(1)
const itemsPerPage = ref(5)

const filteredCursos = computed(() => allData.value)

const paginatedCursos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredCursos.value.slice(start, start + itemsPerPage.value)
})
const paginatedPages = computed(() =>
  Math.ceil(filteredCursos.value.length / itemsPerPage.value)
)

// ——— CARGA INICIAL ————————————————————————————————
onMounted(fetchAllData)
watch(selectedBimestre, () => { currentPage.value = 1 })

async function fetchAllData() {
  try {
    const token           = localStorage.getItem("token")
    const profile         = localStorage.getItem("profile")
    const ai_usua_id      = localStorage.getItem("usua_id")
    if (!token || !profile) return

    const { data } = await axios.get(
      "https://amsoftsolution.com/amss/ws/wsConsultaRegistroAuxiliarDocenteAlumnos.php",
      {
        params: {
          ai_usua_id,
          av_profile: profile
        },
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (data.status) {
      allData.value = data.data
      bimestres.value = allData.value.map(b => ({
        peed_id:     b.peed_id,
        peed_nombre: b.peed_nombre
      }))
      if (bimestres.value.length > 0)
        selectedBimestre.value = bimestres.value[0].peed_id
    }
  } catch (error) {
    console.error("Error al obtener los cursos:", error)
  }
}

// ——— FUNCIÓN REUTILIZABLE PARA PERIODOS + DETALLE —————————————————
async function fetchPeriodosYDetalle(curso) {
  const token   = localStorage.getItem("token")
  const profile = localStorage.getItem("profile")
  if (!token || !profile) throw new Error("Credenciales faltantes")

  // —– extraigo y renombro antes de usarlos —————————
  const { doad_id, aude_id, grad_id } = curso
  const ai_doad_id  = doad_id
  const ai_aude_id  = aude_id
  const ai_grad_id  = grad_id

  // 1) OBTENER PERIODOS
  const perRes = await axios.get(
    "https://amsoftsolution.com/amss/ws/wsListaPeriodoEducativoPlanCurricular.php",
    {
      params: { ai_doad_id, av_profile: profile },
      headers: { Authorization: `Bearer ${token}` }
    }
  )
  if (!perRes.data.status || !perRes.data.data.length) {
    throw { tipo: 'warning', titulo: 'Sin periodos', texto: 'No hay periodos asociados.' }
  }
  const periodos   = perRes.data.data
  const bimestre   = periodos.find(b => b.aepe_estado === "A") || periodos[0]
  const ai_peed_id = bimestre.peed_id

  // 2) OBTENER DETALLE DE ACTIVIDADES
  const detRes = await axios.get(
    "https://amsoftsolution.com/amss/ws/wsConsultaRegistroAuxiliar.php",
    {
      params: {
        ai_doad_id,
        ai_aude_id,
        ai_peed_id,
        ai_grad_id,
        av_profile: profile
      },
      headers: { Authorization: `Bearer ${token}` }
    }
  )
  if (!detRes.data.status || !detRes.data.data.length) {
    throw { tipo: 'info', titulo: 'Sin actividades', texto: 'No hay actividades asignadas.' }
  }

  return { periodos, bimestre, detalle: detRes.data }
}

// ——— ABRIR VENTANA DE NOTAS (REGISTRO o CONSULTA) —————————————————
async function openNotas(curso, ruta) {
  try {
    const { periodos, bimestre, detalle } = await fetchPeriodosYDetalle(curso)

    router.push({
      name: ruta,
      query: {
        curso:    encodeURIComponent(JSON.stringify(curso)),
        bimestre: encodeURIComponent(JSON.stringify({
          peed_id:     bimestre.peed_id,
          peed_nombre: bimestre.peed_nombre
        })),
        detalle:  encodeURIComponent(JSON.stringify(detalle)),
        doad_id:  curso.doad_id,
        aude_id:  curso.aude_id,
        periodos: encodeURIComponent(JSON.stringify(periodos)),
        pacu_id:  bimestre.pacu_id
      }
    })
  } catch (err) {
    if (err.tipo) {
      mostrarDialogo(err.titulo, err.texto, err.tipo)
    } else {
      mostrarDialogo('Error', err.message || 'Ocurrió un error.', 'error')
    }
  }
}
</script>

<style scoped>
.table-action {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}
.btn-editar {
  position: absolute;
  top: 8px;
  right: 48px;
}
.btn-ver {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
