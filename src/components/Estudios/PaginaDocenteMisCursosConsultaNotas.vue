<template>
  <v-container class="pt-0 pb-4">
    <v-container class="pt-0 pb-4">
  <!-- Mobile: Botón en primera fila (oculto en desktop) -->
  <v-row class="d-md-none mt-0 mb-2">
    <v-col cols="12" class="text-start">
      <v-btn color="primary" @click="goBack" prepend-icon="mdi-arrow-left">
        Regresar
      </v-btn>
    </v-col>
  </v-row>

  <!-- Título centrado -->
  <v-row class="mb-2">
    <v-col cols="12" class="text-center">
      <h2 class="text-h5 font-weight-bold text-primary">📖 Consulta de Notas</h2>
      <p class="text-subtitle-2 mt-1 text-grey-darken-1">
        Visualiza las calificaciones registradas por periodo y tipo de evaluación.
      </p>
    </v-col>
  </v-row>

  <!-- Mobile: curso centrado -->
  <v-row class="d-md-none mt-0 mb-2">
    <v-col cols="12" class="text-center">
      <div class="text-subtitle-1 curso-highlight">
        <v-icon small class="mr-1 text-secondary">mdi-book-open-page-variant</v-icon>
        <strong>Curso:</strong> {{ cursoSeleccionado?.aede_nombre }}
      </div>
    </v-col>
  </v-row>

  <!-- Desktop: curso a la izquierda y botón a la derecha -->
  <v-row class="d-none d-md-flex mb-4 align-center">
    <v-col md="6" class="text-md-left">
      <div class="text-subtitle-1 curso-highlight">
        <v-icon small class="mr-1 text-secondary">mdi-book-open-page-variant</v-icon>
        <strong>Curso:</strong> {{ cursoSeleccionado?.aede_nombre }}
      </div>
    </v-col>
    <v-col md="6" class="text-md-right">
      <v-btn color="primary" @click="goBack" prepend-icon="mdi-arrow-left">
        Regresar
      </v-btn>
    </v-col>
  </v-row>
</v-container>


    <!-- Datos del Curso -->
    <v-row class="mb-4 text-body-2">
      <v-col cols="12" sm="6" md="3"><strong>Turno:</strong> {{ cursoSeleccionado?.turn_nombre }}</v-col>
      <v-col cols="12" sm="6" md="3"><strong>Nivel:</strong> {{ cursoSeleccionado?.nive_nombre }}</v-col>
      <v-col cols="12" sm="6" md="3"><strong>Grado:</strong> {{ cursoSeleccionado?.grad_nombre }}</v-col>
      <v-col cols="12" sm="6" md="3"><strong>Sección:</strong> {{ cursoSeleccionado?.secc_nombre }}</v-col>
    </v-row>

    <!-- Filtros -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6">
        <v-select
          v-model="selectedBimestre"
          :items="bimestres"
          item-title="peed_nombre"
          return-object
          label="Bimestre"
          dense
          solo
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="searchQuery"
          label="Buscar alumno"
          clearable
          solo
        />
      </v-col>
    </v-row>

    <!-- Tabla Desktop -->
<div v-if="isDesktop">
  <v-alert v-if="filteredItems.length === 0" type="info" class="mt-4">
    No hay notas disponibles para este bimestre.
  </v-alert>
  <div v-if="filteredItems.length > 0">
  <table class="custom-table">
  <thead>
    <tr>
      <th rowspan="2" class="sticky-col col-num">N°</th>
      <th rowspan="2" class="sticky-col col-name">Apellidos y Nombres</th>
      <template v-for="(group, gIndex) in groupedColumnHeaders" :key="gIndex">
        <th :colspan="group.columns.length" :style="{ backgroundColor: gIndex % 2 === 0 ? '#f9f9f9' : '#f0f0f0' }">
          {{ group.title }}
        </th>
      </template>
    </tr>
    <tr>
      <template v-for="group in groupedColumnHeaders" :key="group.title">
        <th v-for="col in group.columns" :key="col.key" :class="{ 'promedio-bold': col.label === 'LOGRO' }">
          {{ col.label }}
        </th>
      </template>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(item, index) in filteredItems" :key="index">
      <td class="sticky-col col-num">{{ item.numero }}</td>
      <td class="sticky-col col-name text-left">{{ item.alumno }}</td>
      <template v-for="group in groupedColumnHeaders" :key="group.title">
        <td
          v-for="col in group.columns"
          :key="col.key"
        >
          <div v-if="item[col.key]" :style="getNotaCellStyle(item[col.key])" class="cell-custom">
            {{ item[col.key] }}
          </div>
        </td>
      </template>
    </tr>
  </tbody>
</table>
</div>


</div>


    <!-- Tarjetas Móvil -->
    <div v-else>
      <v-alert v-if="dynamicHeaders.length === 0 || tableItems.length === 0" type="info">
        No hay notas disponibles.
      </v-alert>

      <v-row v-else dense>
        <v-col
          v-for="(item, index) in paginatedItems"
          :key="index"
          cols="12"
          class="mb-2"
        >
          <v-card outlined>
            <v-card-title class="subtitle-2 font-weight-bold text-start">
              <div class="multiline2-ellipsis">{{ item.numero }}. {{ item.alumno }}</div>
            </v-card-title>
            <v-card-text class="text-start">
              <v-row dense>
                <template v-for="(group, groupIndex) in groupedHeaders" :key="groupIndex">
                  <v-col cols="12" :class="groupIndex % 2 === 0 ? 'eval-group-a' : 'eval-group-b'">
                    <v-row dense>
                      <v-col
                        v-for="(header, i) in group"
                        :key="i"
                        cols="12"
                      >
                      <div :class="{ 'prom-header-mobile': header.key.includes('_prom') }">
                        <strong>{{ header.mobileTitle || header.title }}:</strong>
                        <span :style="getNotaCellStyle(item[header.key])">
                          {{ item[header.key] }}
                        </span>
                      </div>
                      </v-col>
                    </v-row>
                  </v-col>
                </template>

                <v-col cols="12" class="promedio-mobile">
                  <strong>Promedio Bimestral:</strong>
                  <div :style="getNotaCellStyle(item.promBim)">
                    {{ item.promBim }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Paginación para móvil -->
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

    <!-- Modal sin resultados -->
    <v-dialog v-model="dialogNoResults" max-width="400">
      <v-card>
        <v-card-title class="headline">No se encontraron resultados</v-card-title>
        <v-card-text>La consulta no arrojó resultados.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialogNoResults = false">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify' // <-- Importar
import axios from 'axios'
import { getNotaColor, getNotaTextColor } from '@/utils/notas'

const bimestres = ref([])
const selectedBimestre = ref(null)

const groupedColumnHeaders = computed(() => {
  const grupos = []
  const map = new Map()

  dynamicHeaders.value.forEach(header => {
    if (header.key === 'numero' || header.key === 'alumno') return

    const match = header.title.match(/^(.+?)\s+-\s+(.+)$/)
    if (!match) return

    const competencia = match[1].trim()
    const subtitulo = match[2].trim()

    if (!map.has(competencia)) {
      const nuevoGrupo = {
        title: competencia,
        columns: []
      }
      map.set(competencia, nuevoGrupo)
      grupos.push(nuevoGrupo)
    }

    map.get(competencia).columns.push({
      label: subtitulo,
      key: header.key
    })
  })

  return grupos
})


// Detecta si la pantalla es "md" o mayor
const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp

const currentPage = ref(1)
const itemsPerPage = ref(5)
const searchQuery = ref("") // Variable reactiva para la búsqueda

const router = useRouter()
const route = useRoute()

const periodos = ref([])

if (route.query.periodos) {
  try {
    periodos.value = JSON.parse(decodeURIComponent(route.query.periodos))
    bimestres.value = periodos.value

    // Selecciona por defecto el que tenga estado "A"
    let activo = bimestres.value.find(b => b.aepe_estado === "A")
    if (!activo) activo = bimestres.value.find(b => b.peed_id === 1)
    selectedBimestre.value = activo

  } catch (error) {
    console.error("Error al parsear periodos:", error)
  }
}

const cursoSeleccionado = ref(
  route.query.curso
    ? JSON.parse(decodeURIComponent(route.query.curso))
    : null
)

  /* const doad_id = ref(
    route.query.doad_id || (cursoSeleccionado.value ? cursoSeleccionado.value.doad_id : null  
    ));
 */

// Agrupamos los headers dinámicos por evaluación
const groupedHeaders = computed(() => {
  const groups = []
  let tempGroup = []

  dynamicHeaders.value.forEach(header => {
    if (header.key.includes('_nota_')) {
      tempGroup.push(header)
    } else if (header.key.includes('_prom')) {
      tempGroup.push(header)
      groups.push(tempGroup)
      tempGroup = []
    }
  })

  return groups
})

function getNotaCellStyle(valor) {
  const notaStr = typeof valor === 'string' ? valor : '';
  const match = notaStr.match(/^([\d.]+)/);
  const notaNum = match ? parseFloat(match[1]) : null;
  if (!Number.isFinite(notaNum)) return {};
  return {
    backgroundColor: getNotaColor(notaNum),
    color: getNotaTextColor(notaNum),
    padding: '4px 8px',
    borderRadius: '6px',
    display: 'inline-block',
    minWidth: '60px',
    textAlign: 'center'
  };
}

/* function getNotaNumero(valor) {
  const notaStr = typeof valor === 'string' ? valor : ''
  const match = notaStr.match(/^([\d.]+)/)
  return match ? match[1] : ''
}

function getNotaLetra(valor) {
  const notaStr = typeof valor === 'string' ? valor : ''
  const match = notaStr.match(/\(([^)]+)\)/)
  return match ? match[1] : ''
}

 */
 /* async function fetchBimestres() {
  try {
    const profile = localStorage.getItem("profile")
    const token = localStorage.getItem("token")

    const baseUrl = "https://amsoftsolution.com/amss/ws/wsListaPeriodoEducativoPlanCurricular.php"
    const params = {
      ai_doad_id: doad_id.value,
      av_profile: profile
    }

    const configReq = {
      params,
      headers: { Authorization: `Bearer ${token}` }
    }

    const response = await axios.get(baseUrl, configReq)

    if (response.data.status) {
      bimestres.value = response.data.data

      // ✅ Buscar el bimestre con estado A
      let bimestreActivo = bimestres.value.find(b => b.aepe_estado === "A")

      // ✅ Si no hay ninguno con estado A, usar peed_id = 1 por defecto
      const peed_id = bimestreActivo?.peed_id || 1

      // Guardar bimestre seleccionado
      selectedBimestre.value = bimestreActivo || bimestres.value.find(b => b.peed_id === 1)

      // Llamar API de notas con peed_id
      await fetchRegistroAuxiliar(peed_id)
    } else {
      console.warn("No se encontraron bimestres.")
    }
  } catch (error) {
    console.error("Error al obtener bimestres:", error)
  }
}
 */


const alumnos = ref([])

// dynamicHeaders y tableItems se generan dinámicamente
const dynamicHeaders = ref([])  
const tableItems = ref([])

// Computed para filtrar alumnos por nombre
const filteredItems = computed(() => {
  if (!searchQuery.value) return tableItems.value
  return tableItems.value.filter(item => 
    item.alumno.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Computed para paginación en vista móvil usando los items filtrados
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredItems.value.slice(start, start + itemsPerPage.value)
})

const paginatedPages = computed(() => {
  return Math.ceil(filteredItems.value.length / itemsPerPage.value)
})

// Cuando cambie bimestre, reconstruye tabla y reinicia paginación
watch(selectedBimestre, async (nuevo) => {
  if (nuevo?.peed_id) {
    await fetchRegistroAuxiliar(nuevo.peed_id)
  }
},
  { deep: true } // <-- se ejecuta al inicio y detecta cambios internos
)

onMounted(async () => {
  if (!cursoSeleccionado.value) {
    router.push({ name: 'DocenteMisCursos' })
    return
  }
})


  
  // Si viene la información del API en el query, la usamos
  if (route.query.detalle) {
  const responseData = JSON.parse(decodeURIComponent(route.query.detalle))
  if (responseData.status) {
    alumnos.value = responseData.data
    parseRegistroAuxiliar()
  }
}

async function fetchRegistroAuxiliar(peed_id) {
  try {
    const token = localStorage.getItem("token")
    const profile = localStorage.getItem("profile")
    const ai_doad_id = cursoSeleccionado.value?.doad_id
    const ai_aude_id = cursoSeleccionado.value?.aude_id

    const baseUrl = "https://amsoftsolution.com/amss/ws/wsConsultaRegistroAuxiliar.php"
    const params = {
      ai_peed_id: peed_id,
      ai_doad_id,
      ai_aude_id,
      av_profile: profile
    }

    const configReq = {
      params,
      headers: { Authorization: `Bearer ${token}` }
    }

    const response = await axios.get(baseUrl, configReq)
    if (response.data.status) {
      alumnos.value = response.data.data
      parseRegistroAuxiliar()
    } else {
      alumnos.value = []
      dynamicHeaders.value = []
      tableItems.value = []
    }
  } catch (error) {
    console.error("Error al obtener datos de registro auxiliar:", error)
  }
}


function parseRegistroAuxiliar() {
  if (!alumnos.value.length) {
    dynamicHeaders.value = []
    tableItems.value = []
    return
  }

  const allCompetencias = {}
  alumnos.value.forEach(alumno => {
    alumno.competencias.forEach(comp => {
      if (!allCompetencias[comp.comp_id]) {
        allCompetencias[comp.comp_id] = {
          comp_nombre: comp.comp_nombre,
          actividades: new Set()
        }
      }
      comp.actividades.forEach(act => {
        allCompetencias[comp.comp_id].actividades.add(act.abreviatura)
      })
    })
  })

  const headers = [
  { title: "N°", key: "numero", class: "text-center sticky-column-left" },
  { title: "Apellidos y Nombres", key: "alumno", class: "text-left sticky-column-left-2" }
]

  let groupIndex = 0
  Object.entries(allCompetencias).forEach(([comp_id, comp]) => {
    const groupClass = `eval-group-${groupIndex % 2 === 0 ? 'a' : 'b'}`

    const actividades = Array.from(comp.actividades).sort() // para mantener orden
    actividades.forEach((act) => {
      headers.push({
        title: `${comp.comp_nombre} - ${act}`,
        key: `comp_${comp_id}_acti_${act}`,
        mobileTitle: `${act}`,
        sortable: false,
        groupClass,
        class: "text-center"
      })
    })

    headers.push({
      title: `${comp.comp_nombre} - LOGRO`,
      key: `comp_${comp_id}_logro`,
      mobileTitle: `LOGRO`,
      sortable: false,
      groupClass,
      class: "text-center promedio-bold"
    })

    groupIndex++
  })

  const rows = alumnos.value.map((alumno, index) => {
    const row = {
      numero: index + 1,
      alumno: alumno.alumno
    }

    alumno.competencias.forEach(comp => {
      const comp_id = comp.comp_id
      comp.actividades.forEach(act => {
        row[`comp_${comp_id}_acti_${act.abreviatura}`] =
          act.nota !== null ? `${act.nota} (${act.nota_letra})` : ""
      })
      row[`comp_${comp_id}_logro`] =
        comp.logro !== null ? `${comp.logro} (${comp.logro_letra})` : ""
    })

    return row
  })

  dynamicHeaders.value = headers
  tableItems.value = rows
}


function goBack() {
  router.push({ name: 'DocenteMisCursos' })
}
</script>

<style scoped>
.cell-custom {
  padding: 8px;
  background-clip: padding-box;
  transition: background-color 0.3s ease;
}
.eval-group-a {
  background-color: #f9f9f9;
}
.eval-group-b {
  background-color: #f0f0f0;
}
.prom-header-mobile {
  font-weight: bold;
  font-size: 16px;
}
.promedio-mobile {
  font-weight: bold;
  font-size: 18px;
  margin-top: 4px;
  display: inline-block;
}
.multiline2-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.table-desktop {
  width: 100%;
  border-collapse: collapse;
}
.table-desktop th,
.table-desktop td {
  border: 1px solid #ddd;
  padding: 8px;
  vertical-align: middle;
  text-align: center;
}
.promedio-bold {
  font-weight: bold;
}
th.promedio-bold {
  font-weight: bold;
  background-color: #e0f7e9;
  color: #2e7d32;
}
.sticky-column-left {
  position: sticky;
  left: 0;
  background-color: white;
  z-index: 2;
}
.sticky-column-left {
  position: sticky;
  left: 0;
  z-index: 3;
  background-color: white;
}

.sticky-column-left-2 {
  position: sticky;
  left: 60px; /* ajusta si N° es más ancho */
  z-index: 3;
  background-color: white;
}
thead tr:nth-child(1) th,
thead tr:nth-child(2) th {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 4;
}

.custom-table {
  width: 100%;
  border-collapse: collapse; /* elimina espacios entre celdas */
  border: 1px solid #ccc; /* borde externo */
  font-size: 0.8rem; /* o usa 12px si prefieres */
}

.custom-table th,
.custom-table td {
  border: 1px solid #ccc;
  font-size: 12px;
  padding: 6px 4px; /* también puedes reducir padding */
  vertical-align: middle;
  text-align: center;
  background-color: white;
}

.promedio-bold {
  font-weight: bold;
  background-color: #e0f7e9;
  color: #2e7d32;
}

.cell-custom {
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  min-width: 60px;
  text-align: center;
}

.sticky-col {
  position: sticky;
  background: white;
  z-index: 3;
  border-right: 1px solid #ccc;
}


.col-num {
  width: 50px;
  left: 0;
}


.col-name {
  left: 50px;
  z-index: 3;
  text-align: left;
  width: 250px; /* puedes ajustar este valor */
  min-width: 200px; /* para evitar que se achique demasiado */
  max-width: 300px;
}

</style>
