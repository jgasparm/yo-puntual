<template>
  <v-container fluid>
    <!-- CABECERA -->
    <v-row class="py-3">
      <v-col cols="12">
        <h1 class="text-h5 font-weight-bold mb-1">📚 Asignación de Docentes</h1>
        <p class="text-subtitle-2">Gestiona la asignación de docentes y sus cursos para el año escolar {{ anioEscolar }}.</p>
      </v-col>
    </v-row>

    <!-- BOTÓN AGREGAR DOCENTE -->
    <v-row class="justify-end mb-2">
      <v-btn color="primary" @click="mostrarDialogoAgregarDocentes = true" prepend-icon="mdi-account-plus">
        Agregar Docentes
      </v-btn>
    </v-row>

    <!-- VISTA DESKTOP -->
    <div v-if="isDesktop">
      <v-card class="pa-2 elevation-1">
        <v-card-text class="horario-scrollable">
          <v-data-table
            :items="docentesAsignados"
            item-key="aedo_id"
            :items-per-page="10"
            v-model:page="currentPage"
            hide-default-header
            class="elevation-0"
          >
            <template #body="{ items }">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Docente</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(doc, index) in items" :key="doc.aedo_id">
                  <tr :class="{ 'expanded-teacher-row': isExpanded(doc.aedo_id) }">
                    <td>{{ (currentPage - 1) * 10 + index + 1 }}</td>
                    <td>{{ doc.docente }}</td>
                    <td>{{ doc.fecha_asignacion }}</td>
                    <td>
                      <v-chip :color="doc.estado === 'A' ? 'green' : 'red'" small>
                        {{ doc.estado === 'A' ? 'Activo' : 'Inactivo' }}
                      </v-chip>
                    </td>
                    <td class="d-flex align-center">
                      <v-btn icon variant="text" color="primary" @click="verHorarioDocente(doc)">
                        <v-icon>mdi-calendar-clock</v-icon>
                      </v-btn>
                      <v-btn icon variant="text" @click.stop="abrirDialogoActualizarDocente(doc)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon variant="text" @click.stop="toggleExpand(doc.aedo_id)">
                        <v-icon>{{ isExpanded(doc.aedo_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                      </v-btn>
                    </td>
                  </tr>

                  <tr v-if="isExpanded(doc.aedo_id)" style="background: #fafafa;">
                    <td :colspan="5" class="pa-4">
                      <div class="font-weight-bold mb-2">
                        Cursos Asignados
                        <v-btn small color="primary" variant="text" class="ml-2" @click="abrirDialogoAgregarCurso(doc)">
                          +Agregar Curso
                        </v-btn>
                      </div>

                      <div v-if="filtrarCursosDocente(doc.aedo_id).length === 0">
                        No hay cursos asignados
                      </div>

                      <v-simple-table v-else dense class="mt-2">
                        <thead>
                          <tr>
                            <th>N°</th>
                            <th>Curso</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(curso, indexCurso) in filtrarCursosDocente(doc.aedo_id)" :key="curso.daed_id">
                            <td>{{ indexCurso + 1 }}</td>
                            <td>{{ curso.area_educativa }}</td>
                            <td>{{ curso.fecha_asignacion }}</td>
                            <td>
                              <v-chip :color="curso.estado === 'A' ? 'green' : 'red'" small>
                                {{ curso.estado === 'A' ? 'Activo' : 'Inactivo' }}
                              </v-chip>
                            </td>
                            <td>
                              <v-btn icon variant="text" @click.stop="abrirDialogoActualizarCurso(curso)">
                                <v-icon>mdi-pencil</v-icon>
                              </v-btn>
                            </td>
                          </tr>
                        </tbody>
                      </v-simple-table>
                    </td>
                  </tr>
                </template>
              </tbody>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </div>

    <!-- VISTA MOBILE / TABLET -->
    <div v-else>
      <v-row dense>
        <v-col v-for="doc in paginatedDocentes" :key="doc.aedo_id" cols="12">
          <v-card class="mb-4 pa-4 shadow-mobile">
            <div class="d-flex justify-end">
              <v-btn icon variant="text" color="primary" @click="verHorarioDocente(doc)">
                <v-icon>mdi-calendar-clock</v-icon>
              </v-btn>
              <v-btn icon variant="text" @click.stop="abrirDialogoActualizarDocente(doc)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon variant="text" @click.stop="toggleExpand(doc.aedo_id)">
                <v-icon>{{ isExpanded(doc.aedo_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>
            </div>

            <v-card-title class="text-h6 font-weight-bold text-primary">
              {{ doc.docente }}
            </v-card-title>
            <v-card-subtitle class="mb-2">
              Fecha Asignación: {{ doc.fecha_asignacion }}
            </v-card-subtitle>

            <v-chip :color="doc.estado === 'A' ? 'green' : 'red'" small class="mb-2">
              {{ doc.estado === 'A' ? 'Activo' : 'Inactivo' }}
            </v-chip>

            <v-expand-transition>
              <div v-if="isExpanded(doc.aedo_id)" class="mt-2">
                <v-divider class="my-2" />
                <div class="font-weight-bold mb-2">
                  Cursos Asignados
                  <v-btn small variant="text" color="primary" @click="abrirDialogoAgregarCurso(doc)">
                    +Agregar Curso
                  </v-btn>
                </div>

                <div v-if="filtrarCursosDocente(doc.aedo_id).length === 0">
                  No hay cursos asignados
                </div>

                <v-list v-else dense>
                  <v-list-item v-for="curso in filtrarCursosDocente(doc.aedo_id)" :key="curso.daed_id">
                    <v-list-item-content>
                      <v-list-item-title>{{ curso.area_educativa }}</v-list-item-title>
                      <v-list-item-subtitle>Fecha: {{ curso.fecha_asignacion }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-btn icon variant="text" @click.stop="abrirDialogoActualizarCurso(curso)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </v-list-item>
                </v-list>
              </div>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>

      <v-pagination
        v-if="totalDocentePages > 1"
        v-model="currentPage"
        :length="totalDocentePages"
        class="mt-4"
      />
    </div>

    <!-- DIÁLOGOS -->
    <DialogAgregarDocentes v-model="mostrarDialogoAgregarDocentes" :docentes-no-asignados="docentesNoAsignados" v-model:selected="docentesSeleccionados" @guardar="asignarDocentes" />
    <DialogEditarDocente v-model="dialogoActualizarDocente.visible" :docente="dialogoActualizarDocente.docente" v-model:estado="dialogoActualizarDocente.docenteEstado" @guardar="guardarEstadoDocente" />
    <DialogAgregarCurso v-model="dialogoAgregarCurso.visible" :docente="dialogoAgregarCurso.docente" :cursos-no-asignados="cursosNoAsignados" v-model:selected="cursosSeleccionados" @guardar="asignarCursosDocente" />
    <DialogEditarCurso v-model="dialogoActualizarCurso.visible" :curso="dialogoActualizarCurso.curso" v-model:estado="dialogoActualizarCurso.cursoEstado" @guardar="guardarEstadoCurso" />

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import axios from 'axios'
import { safeArray } from '@/utils/global.js'

import DialogAgregarDocentes from '@/components/Mantenimiento/Docentes/DialogAgregarDocentes.vue'
import DialogEditarDocente from '@/components/Mantenimiento/Docentes/DialogEditarDocente.vue'
import DialogAgregarCurso from '@/components/Mantenimiento/Docentes/DialogAgregarCurso.vue'
import DialogEditarCurso from '@/components/Mantenimiento/Docentes/DialogEditarCurso.vue'

/** CONFIGURACIONES */
const router = useRouter()
const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp

const anioEscolar = localStorage.getItem('anio_escolar')
const profile = localStorage.getItem('profile')
const token = localStorage.getItem('token')

const axiosInstance = axios.create({
  baseURL: 'https://amsoftsolution.com/amss/ws/',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
})

/** DATA PRINCIPAL */
const docentesAsignados = ref([])
const docentesNoAsignados = ref([])
const cursosDocentes = ref([])

const docentesSeleccionados = ref([])
const cursosSeleccionados = ref([])
const cursosNoAsignados = ref([])

/** DIÁLOGOS */
const mostrarDialogoAgregarDocentes = ref(false)
const dialogoActualizarDocente = ref({ visible: false, docente: null, docenteEstado: '' })
const dialogoActualizarCurso = ref({ visible: false, curso: null, cursoEstado: '' })
const dialogoAgregarCurso = ref({ visible: false, docente: null })

/** EXPANSIÓN */
const expandedAedoId = ref(null)
function isExpanded(aedoId) {
  return expandedAedoId.value === aedoId
}
function toggleExpand(aedoId) {
  expandedAedoId.value = expandedAedoId.value === aedoId ? null : aedoId
}

/** PAGINACIÓN DOCENTES */
const currentPage = ref(1)
const itemsPerPage = ref(5)
const paginatedDocentes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return docentesAsignados.value.slice(start, start + itemsPerPage.value)
})
const totalDocentePages = computed(() => 
  Math.ceil(docentesAsignados.value.length / itemsPerPage.value)
)

/** CURSOS */
function filtrarCursosDocente(aedoId) {
  return safeArray(cursosDocentes.value).filter(c => c.aedo_id === aedoId)
}

/** ACCIONES BÁSICAS */
function verHorarioDocente(doc) {
  router.push({
    name: 'DocentesHorarios',
    query: {
      usua_id: doc.usua_id,
      nombre_docente: doc.docente
    }
  })
}

/** LLAMADAS API */
onMounted(() => {
  obtenerDocentesAsignados()
  obtenerDocentesNoAsignados()
  obtenerCursosDocentes()
})

async function obtenerDocentesAsignados() {
  try {
    const { data } = await axiosInstance.get(`wsListaAnioEscolarDocentes.php?ac_anio_escolar=${anioEscolar}&av_profile=${profile}`)
    docentesAsignados.value = safeArray(data.data)
  } catch (error) {
    console.error('Error al obtener docentes asignados:', error)
  }
}

async function obtenerDocentesNoAsignados() {
  try {
    const { data } = await axiosInstance.get(`wsListaAnioEscolarNoDocentes.php?ac_anio_escolar=${anioEscolar}&av_profile=${profile}`)
    docentesNoAsignados.value = safeArray(data.data)
  } catch (error) {
    console.error('Error al obtener docentes no asignados:', error)
  }
}

async function obtenerCursosDocentes() {
  try {
    const { data } = await axiosInstance.get(`wsListaDocenteAreaEducativaDetalle.php?ac_anio_escolar=${anioEscolar}&av_profile=${profile}`)
    cursosDocentes.value = safeArray(data.data)
  } catch (error) {
    console.error('Error al obtener cursos:', error)
  }
}

/** AGREGAR DOCENTES */
async function asignarDocentes() {
  try {
    for (const docId of docentesSeleccionados.value) {
      await axiosInstance.post('wsRegistraAnioEscolarDocente.php', {
        ai_empl_id: docId,
        ac_anio_escolar: anioEscolar,
        av_profile: profile,
      })
    }
    docentesSeleccionados.value = []
    cerrarDialogoAgregarDocentes()
    obtenerDocentesAsignados()
    obtenerDocentesNoAsignados()
  } catch (error) {
    console.error('Error al asignar docentes:', error)
  }
}
function cerrarDialogoAgregarDocentes() {
  mostrarDialogoAgregarDocentes.value = false
}

/** ACTUALIZAR DOCENTE */
function abrirDialogoActualizarDocente(doc) {
  dialogoActualizarDocente.value.docente = { ...doc }
  dialogoActualizarDocente.value.docenteEstado = doc.estado === 'A' ? 'Activo' : 'Inactivo'
  dialogoActualizarDocente.value.visible = true
}
function cerrarDialogoActualizarDocente() {
  dialogoActualizarDocente.value.visible = false
}
async function guardarEstadoDocente() {
  try {
    const d = dialogoActualizarDocente.value.docente
    const nuevoEstado = dialogoActualizarDocente.value.docenteEstado === 'Activo' ? 'A' : 'I'
    await axiosInstance.post('wsActualizaAnioEscolarDocente.php', {
      ai_aedo_id: d.aedo_id,
      ac_aedo_estado: nuevoEstado,
      av_profile: profile,
    })
    cerrarDialogoActualizarDocente()
    obtenerDocentesAsignados()
  } catch (error) {
    console.error('Error al actualizar estado docente:', error)
  }
}

/** AGREGAR CURSOS */
function abrirDialogoAgregarCurso(doc) {
  dialogoAgregarCurso.value.docente = doc
  dialogoAgregarCurso.value.visible = true
  cursosSeleccionados.value = []
  cargarCursosNoAsignadosDocente(doc.aedo_id)
}
function cerrarDialogoAgregarCurso() {
  dialogoAgregarCurso.value.visible = false
}

async function cargarCursosNoAsignadosDocente(aedoId) {
  try {
    const { data } = await axiosInstance.get(`wsListaDocenteNoAreaEducativaDetalle.php?ai_aedo_id=${aedoId}&ac_anio_escolar=${anioEscolar}&av_profile=${profile}`)
    cursosNoAsignados.value = safeArray(data.data)
  } catch (error) {
    console.error('Error al cargar cursos no asignados:', error)
  }
}

async function asignarCursosDocente() {
  try {
    const doc = dialogoAgregarCurso.value.docente
    for (const cursoId of cursosSeleccionados.value) {
      await axiosInstance.post('wsRegistraDocenteAreaEducativaDetalle.php', {
        ai_aedo_id: doc.aedo_id,
        ai_aede_id: cursoId,
        av_profile: profile,
      })
    }
    cerrarDialogoAgregarCurso()
    obtenerCursosDocentes()
  } catch (error) {
    console.error('Error al asignar cursos:', error)
  }
}

/** ACTUALIZAR CURSO */
function abrirDialogoActualizarCurso(curso) {
  dialogoActualizarCurso.value.curso = { ...curso }
  dialogoActualizarCurso.value.cursoEstado = curso.estado === 'A' ? 'Activo' : 'Inactivo'
  dialogoActualizarCurso.value.visible = true
}
function cerrarDialogoActualizarCurso() {
  dialogoActualizarCurso.value.visible = false
}
async function guardarEstadoCurso() {
  try {
    const c = dialogoActualizarCurso.value.curso
    const nuevoEstado = dialogoActualizarCurso.value.cursoEstado === 'Activo' ? 'A' : 'I'
    await axiosInstance.post('wsActualizaDocenteAreaEducativaDetalle.php', {
      ai_daed_id: c.daed_id,
      ac_daed_estado: nuevoEstado,
      av_profile: profile,
    })
    cerrarDialogoActualizarCurso()
    obtenerCursosDocentes()
  } catch (error) {
    console.error('Error al actualizar estado curso:', error)
  }
}
</script>


<style scoped>
/* General */
.v-card, .v-list-item {
  text-align: left;
}

/* Desktop - fila expandida */
.expanded-teacher-row {
  background-color: #e3f2fd;
}

/* Mobile/Tablet - tarjeta expandida */
.shadow-mobile {
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

/* Scroll horizontal tabla desktop */
.horario-scrollable {
  overflow-x: auto;
  padding: 0;
}

/* Mejoras en tablas */
.v-data-table thead th {
  background-color: #E3F2FD;
  color: #1565C0;
  font-weight: bold;
  font-size: 0.9rem;
}
.v-data-table tbody td {
  font-size: 0.85rem;
  padding: 6px 8px;
}

/* Hover fila desktop */
.v-data-table tbody tr:hover {
  background-color: #f5f5f5;
}

/* Ajuste para Large Desktop */
@media (min-width: 1280px) {
  .v-container {
    max-width: 1400px;
  }
}

/* Mejorar botones pequeños en móviles */
.v-btn {
  min-width: 32px;
}

/* Espaciado extra en cards mobile */
.v-card-title, .v-card-subtitle {
  padding-bottom: 8px;
}
.v-card-text {
  padding-top: 8px;
}

/* Divider */
.v-divider {
  margin-top: 8px;
  margin-bottom: 8px;
}
</style>
