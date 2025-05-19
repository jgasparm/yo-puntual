<template>
  <v-container class="pt-0 pb-2">
    <v-container class="pt-0 pb-2">
  <!-- Mobile: Botón en primera fila (oculto en desktop) -->
  <v-row class="d-md-none mt-0 mb-2">
    <v-col cols="12" class="text-start">
      <v-btn color="primary" @click="goBack" prepend-icon="mdi-arrow-left">
        Regresar
      </v-btn>
    </v-col>
  </v-row>

  <!-- Título centrado -->
  <v-row class="mb-1">
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
  <v-row class="mb-2 align-center">
    <v-col cols="12" md="6" class="text-md-left">
      <div class="text-subtitle-1 curso-highlight">
        <v-icon small class="mr-1 text-secondary">mdi-book-open-page-variant</v-icon>
        <strong>Curso:</strong> {{ cursoSeleccionado?.aede_nombre }}
      </div>
    </v-col>
    <v-col cols="12" md="6" class="text-md-right">
      <v-btn color="primary" @click="goBack" prepend-icon="mdi-arrow-left">
        Regresar
      </v-btn>
    </v-col>
  </v-row>
</v-container>


    <!-- Datos del Curso -->
    <v-row class="mb-2 text-body-2">
      <v-col cols="12" sm="6" md="3"><strong>Turno:</strong> {{ cursoSeleccionado?.turn_nombre }}</v-col>
      <v-col cols="12" sm="6" md="3"><strong>Nivel:</strong> {{ cursoSeleccionado?.nive_nombre }}</v-col>
      <v-col cols="12" sm="6" md="3"><strong>Grado:</strong> {{ cursoSeleccionado?.grad_nombre }}</v-col>
      <v-col cols="12" sm="6" md="3"><strong>Sección:</strong> {{ cursoSeleccionado?.secc_nombre }}</v-col>
    </v-row>

    <!-- Filtros -->
    <v-row class="mb-2" text-body-2>
      <v-col cols="12" sm="6" md="6">
        <v-select
          v-model="selectedBimestre"
          :items="bimestres"
          item-title="peed_nombre"
          return-object
          label="Bimestre"
          solo
          dense
          class="text-body-2"
        />
      </v-col>
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="searchQuery"
          label="Buscar alumno"
          clearable
          solo
          dense
          class="text-body-2"
        />
      </v-col>
    </v-row>

    <!-- Leyenda de abreviaturas -->
    <v-row v-if="legendAbreviaturas.length" class="mb-4 text-body-2">
      <v-col cols="12" sm="6" md="6" class="pa-0 text-start">
        <strong>Leyenda de abreviaturas</strong>
        <div class="legend-chips mt-2">
          <v-chip
            v-for="({ sigla, nombre }, i) in legendAbreviaturas"
            :key="i"
            small
            class="ma-1"
            color="grey lighten-3"
            text-color="black"
            label
          >
            {{ sigla }} = {{ nombre }}
          </v-chip>
        </div>
      </v-col>
    </v-row>


    <!-- Tabla Desktop -->
<div v-if="isDesktop">
  <v-alert v-if="filteredItems.length === 0" type="info" class="mt-4">
    No hay notas disponibles para este bimestre.
  </v-alert>
  <div v-if="filteredItems.length > 0">
<div class="table-wrapper">
  <table class="custom-table">
    <thead>
      <tr>
       <th rowspan="2" class="sticky-col col-num">N°</th>
       <th rowspan="2" class="sticky-col col-name">Apellidos y Nombres</th>
       <th rowspan="2" class="sticky-col col-prom text-center">Promedio</th>

      <template v-for="hdr in summaryHeaders" :key="hdr.key">
      <th rowspan="2" class="vertical-header" :title="hdr.title">
        <div class="vertical-title">{{ hdr.title }}</div>
      </th>
    </template>

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
      <td class="sticky-col col-prom">
        <div class="cell-custom" :style="getNotaCellStyle(item.promedio)">
          {{ item.promedio }}
        </div>
      </td>

      <template v-for="hdr in summaryHeaders" :key="hdr.key">
        <td>
          <div class="cell-custom" :style="getNotaCellStyle(item[hdr.key])">
            {{ item[hdr.key] }}
          </div>
        </td>
      </template>

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

// Sólo los headers que acaban en "_res"
const summaryHeaders = computed(() =>
  dynamicHeaders.value.filter(h => h.key.endsWith('_res'))
)

const legendAbreviaturas = ref([]) 

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

  // 0) construir mapa (sigla → nombre)
  const leyendaMap = new Map()
  alumnos.value.forEach(alum => {
    alum.competencias.forEach(comp => {
      comp.actividades.forEach(act => {
        // act.abreviatura y act.acti_nombre deben venir del API
        if (!leyendaMap.has(act.abreviatura)) {
          leyendaMap.set(act.abreviatura, act.acti_nombre)
        }
      })
    })
  })
  // 1) vuelca el mapa a un array ordenado por la sigla
  legendAbreviaturas.value = Array.from(leyendaMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([sigla, nombre]) => ({ sigla, nombre }))


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
    { title: "Apellidos y Nombres", key: "alumno", class: "text-left sticky-column-left-2" },
    { title: "Promedio", key: "promedio", class: "text-center" }
  ]

  // 1️⃣ Genera un mini-array con un header por cada competencia
    const resumenCompetencias = Object.entries(alumnos.value[0].competencias).map(([ , comp]) => ({
    title: comp.comp_nombre,               // p.ej. “Construye su identidad”
    key:   `comp_${comp.comp_id}_res`,    // usa un sufijo único
    class: "text-center vertical-header"  // aplicaremos CSS para rotar
  }))

  // 2️⃣ Inserta esos headers a partir del índice 2
  headers.splice(3, 0, ...resumenCompetencias)


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
      alumno: alumno.alumno,
      promedio: `${alumno.promedio}\n(${alumno.promedio_letra})`
    }

    // ——> Aquí: pon el resumen de cada competencia
    alumno.competencias.forEach(comp => {
      // si hay logro, muéstralo igual que antes
      row[`comp_${comp.comp_id}_res`] =
      comp.logro !== null
        ? `${comp.logro}\n(${comp.logro_letra})`
        : ""
    })

    alumno.competencias.forEach(comp => {
      const comp_id = comp.comp_id
      comp.actividades.forEach(act => {
        row[`comp_${comp_id}_acti_${act.abreviatura}`] =
          act.nota !== null
            ? `${act.nota}\n(${act.nota_letra})`
            : ""
      })
      row[`comp_${comp_id}_logro`] =
        comp.logro !== null
          ? `${comp.logro}\n(${comp.logro_letra})`
          : ""
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
.table-wrapper {
  overflow-x: auto;
  position: relative; /* para que los sticky se calculen dentro de este contenedor */
}

/* -------------------------------------------
   Base de la tabla
-------------------------------------------- */
.custom-table {
  border-collapse: collapse;
  border-spacing: 0;
  table-layout: fixed;
  width: max-content;  /* ancho según contenido provoca scroll horizontal */
  position: relative;
}

.custom-table th,
.custom-table td {
  font-size: 0.75rem;
  border: 1px solid #ccc;
  padding: 2px 4px;
  background: white;
  text-align: center;
  vertical-align: middle;
}

/* -------------------------------------------
   Cabeceras siempre visibles al desplazar vertical
-------------------------------------------- */
.custom-table thead th {
  position: sticky;
  top: 0;
  background: white;
  z-index: 5;
}

/* -------------------------------------------
   Sólo estas tres columnas quedan fijas
-------------------------------------------- */
/* 1) N° */
.custom-table th.col-num,
.custom-table td.col-num {
  position: sticky;
  left: 0;
  width: 50px;    /* ajusta al ancho que necesites */
  background: white;
  z-index: 6;
}

/* 2) Apellidos y Nombres */
.custom-table th.col-name,
.custom-table td.col-name {
  position: sticky;
  left: 50px;     /* = ancho de col-num */
  min-width: 250px; /* ajusta según tu layout */
  background: white;
  z-index: 6;
}

/* 3) Promedio */
.custom-table th.col-prom,
.custom-table td.col-prom {
  position: sticky;
  left: calc(50px + 250px); /* = col-num + col-name */
  min-width: 80px;           /* ajusta según tu layout */
  background: white;
  z-index: 6;
}
/* -------------------------------------------
   Estilos de celdas de nota
-------------------------------------------- */
.cell-custom {
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  min-width: 60px;
  text-align: center;
  white-space: pre-line;
}

.promedio-bold {
  font-weight: bold;
  background-color: #e0f7e9;
  color: #2e7d32;
}

.eval-group-a {
  background-color: #f9f9f9;
}

.eval-group-b {
  background-color: #f0f0f0;
}

/* Para los headers verticales truncados */
.vertical-header {
  position: relative;
  width: 32px;
  height: 100px;
  padding: 0;
  border-bottom: 1px solid #ccc;
  cursor: help;
}
.legend-chips {
  display: flex;
  flex-wrap: nowrap;    /* evita que se rompan en dos filas */
  overflow-x: auto;     /* si faltase espacio, permite scroll horizontal */
}
</style>

