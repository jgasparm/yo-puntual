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

        <!-- Selector de Bimestre -->
        <!--
        <v-select
          v-model="selectedBimestre"
          :items="bimestres"
          item-title="peed_nombre"
          item-value="peed_id"
          label="Bimestre"
          class="mb-4"
          dense
          outlined
        />
        -->
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
            <v-btn icon color="primary" class="action-btn" @click="verNotas(item)" aria-label="Ver notas">
              <v-icon size="24">mdi-eye-outline</v-icon>
            </v-btn>
            <v-btn icon color="secondary" class="action-btn" @click="registrarNotas(item)" aria-label="Registrar notas">
              <v-icon size="24">mdi-notebook-edit-outline</v-icon>
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
              color="secondary"
              @click="registrarNotas(curso)"
              class="btn-editar"
              aria-label="Registrar notas"
            >
              <v-icon>mdi-notebook-edit-outline</v-icon>
            </v-btn>
            <v-btn
              icon
              color="primary"
              @click="verNotas(curso)"
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

    <!-- Modal de no resultados -->
    <v-dialog v-model="dialogNoResults" max-width="400">
      <v-card>
        <v-card-title class="headline">No se encontraron resultados</v-card-title>
        <v-card-text>
          La consulta no arrojó resultados.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialogNoResults = false">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp
const router = useRouter()

const dialogNoResults = ref(false)
const allData = ref([])
const bimestres = ref([])
const selectedBimestre = ref(null)

const headers = [
  { title: 'Curso', key: 'aede_nombre' },
  { title: 'Aula', key: 'aula' },
  { title: 'Turno', key: 'turn_nombre' },
  { title: 'Nivel', key: 'nive_nombre' },
  { title: 'Grado', key: 'grad_nombre' },
  { title: 'Sección', key: 'secc_nombre' },
  { title: 'Acción', key: 'accion', sortable: false }
]

const currentPage = ref(1)
const itemsPerPage = ref(5)

const paginatedCursos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredCursos.value.slice(start, start + itemsPerPage.value)
})
const paginatedPages = computed(() => Math.ceil(filteredCursos.value.length / itemsPerPage.value))

onMounted(() => {
  fetchAllData()
})

watch(selectedBimestre, () => {
  currentPage.value = 1
})

async function fetchAllData() {
  try {
    const token = localStorage.getItem("token")
    const profile = localStorage.getItem("profile")
    const ai_usua_id = localStorage.getItem("usua_id")
    const ac_anio_escolar = localStorage.getItem("anio_escolar")
    if (!token || !profile) return

    const baseUrl = "https://amsoftsolution.com/amss/ws/wsConsultaRegistroAuxiliarDocenteAlumnos.php"
    const params = {
      ai_usua_id,
      ac_anio_escolar,
      av_profile: profile
    }
    const configReq = {
      params,
      headers: { Authorization: `Bearer ${token}` },
    }
    const response = await axios.get(baseUrl, configReq)
    if (response.data.status) {
      allData.value = response.data.data
      bimestres.value = allData.value.map(b => ({
        peed_id: b.peed_id,
        peed_nombre: b.peed_nombre
      }))
      if (bimestres.value.length > 0) selectedBimestre.value = bimestres.value[0].peed_id
    }
  } catch (error) {
    console.error('Error al obtener los cursos:', error)
  }
}

const filteredCursos = computed(() => allData.value)

function verNotas(curso) {
  const bimestre = allData.value.find(b => b.peed_id === Number(selectedBimestre.value))
  const token = localStorage.getItem("token")
  const profile = localStorage.getItem("profile")
  const ai_usua_id = localStorage.getItem("usua_id")
  const ac_anio_escolar = localStorage.getItem("anio_escolar")
  const { doad_id, aude_id } = curso

  const baseUrl = "https://amsoftsolution.com/amss/ws/wsConsultaRegistroAuxiliarDocenteAlumnosDetalle.php"
  const params = {
    ai_usua_id,
    ai_doad_id: doad_id,
    ai_aude_id: aude_id,
    ac_anio_escolar,
    av_profile: profile
  }
  const configReq = {
    params,
    headers: { Authorization: `Bearer ${token}` },
  }

  axios.get(baseUrl, configReq).then(response => {
    if (response.data.messageCode === "4") {
      dialogNoResults.value = true
    } else {
      router.push({
        name: 'DocenteMisCursosConsultaNotas',
        query: {
          curso: encodeURIComponent(JSON.stringify(curso)),
          bimestre: encodeURIComponent(JSON.stringify(bimestre)),
          detalle: encodeURIComponent(JSON.stringify(response.data)),
          doad_id: curso.doad_id
        }
      })
    }
  }).catch(error => {
    console.error('Error al obtener detalle de notas:', error)
  })
}

function registrarNotas(curso) {
  const bimestre = allData.value.find(b => b.peed_id === Number(selectedBimestre.value))
  router.push({
    name: 'DocenteMisCursosRegistroNotas',
    query: {
      curso: encodeURIComponent(JSON.stringify(curso)),
      bimestre: encodeURIComponent(JSON.stringify(bimestre)),
      doad_id: curso.doad_id
    }
  })
}
</script>

<style scoped>
.table-action {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}
.action-btn {
  padding: 4px !important;
  min-width: 0 !important;
}
.btn-ver {
  position: absolute;
  top: 8px;
  right: 48px;
}
.btn-editar {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>