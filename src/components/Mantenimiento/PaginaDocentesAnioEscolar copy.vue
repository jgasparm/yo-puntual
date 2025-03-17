<template>
  <v-container fluid>
    <!-- ENCABEZADO / TÍTULO -->
    <v-row class="py-3">
      <v-col cols="12">
        <h1 class="text-h4">Asignación de Docentes - Año {{ anioEscolar }}</h1>
      </v-col>
    </v-row>

    <!-- BOTÓN: Agregar Docentes -->
    <v-row>
      <v-col cols="12" class="d-flex justify-end">
        <v-btn color="primary" @click="mostrarDialogoAgregarDocentes = true">
          Agregar Docentes
        </v-btn>
      </v-col>
    </v-row>

    <!-- VERSIÓN DESKTOP: Tabla con expansión manual -->
    <div v-if="isDesktop">
      <v-data-table
        :items="docentesAsignados"
        item-key="aedo_id"
        :items-per-page="5"
        hide-default-header
        class="elevation-1 mt-4"
      >
        <template #body="{ items }">
          <!-- CABECERA MANUAL -->
          <thead>
            <tr style="text-align: left;">
              <th style="width: 50px;">N°</th>
              <th style="min-width: 180px;">Docente</th>
              <th style="min-width: 120px;">Fecha</th>
              <th style="width: 90px;">Estado</th>
              <th style="width: 130px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- ÚNICO v-for en <template> con key en la etiqueta -->
            <template v-for="(doc, dIndex) in items" :key="doc.aedo_id">
              <!-- FILA PRINCIPAL: Información del docente -->
              <tr style="text-align: left;">
                <td>{{ (currentPage - 1) * itemsPerPage + dIndex + 1 }}</td>
                <td>{{ doc.docente }}</td>
                <td>{{ doc.fecha_asignacion }}</td>
                <td>
                  <v-chip v-if="doc.estado === 'A'" color="green">Activo</v-chip>
                  <v-chip color="red" v-else>Inactivo</v-chip>
                </td>
                <td>
                  <!-- Botón editar docente -->
                  <v-btn icon variant="text" @click.stop="abrirDialogoActualizarDocente(doc)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <!-- Botón expandir/collapse -->
                  <v-btn icon variant="text" @click.stop="toggleExpand(doc.aedo_id)">
                    <v-icon>
                      {{ isExpanded(doc.aedo_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                    </v-icon>
                  </v-btn>
                </td>
              </tr>
              <!-- FILA EXPANDIDA: Sección de cursos asignados -->
              <tr v-if="isExpanded(doc.aedo_id)" style="background: #fafafa; text-align: left;">
                <td :colspan="5" style="padding: 12px;">
                  <!-- Sub-encabezado para cursos -->
                  <div style="font-weight: bold; display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="flex: 1;">Cursos Asignados</span>
                    <v-btn small color="primary" variant="text" @click="abrirDialogoAgregarCurso(doc)">
                      +Agregar
                    </v-btn>
                  </div>
                  <!-- Si el docente no tiene cursos asignados, se muestra el mensaje -->
                  <div v-if="filtrarCursosDocente(doc.aedo_id).length === 0">
                    <p>No hay cursos asignados</p>
                  </div>
                  <!-- Si tiene cursos, se muestra la tabla de cursos -->
                  <div v-else>
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                      <thead>
                        <tr style="background: #f0f0f0;">
                          <th style="width: 50px;">N°</th>
                          <th style="min-width: 160px;">Curso</th>
                          <th style="min-width: 120px;">Fecha</th>
                          <th style="width: 90px;">Estado</th>
                          <th style="width: 80px;">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(curso, cIndex) in filtrarCursosDocente(doc.aedo_id)" :key="curso.daed_id">
                          <td>{{ (currentPage - 1) * itemsPerPage + cIndex + 1 }}</td>
                          <td>{{ curso.area_educativa }}</td>
                          <td>{{ curso.fecha_asignacion }}</td>
                          <td>
                            <v-chip v-if="curso.estado === 'A'" color="green">Activo</v-chip>
                            <v-chip color="red" v-else>Inactivo</v-chip>
                          </td>
                          <td>
                            <!-- Botón editar curso -->
                            <v-btn icon variant="text" @click.stop="abrirDialogoActualizarCurso(curso)">
                              <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </template>
      </v-data-table>
    </div>

    <!-- VERSIÓN MOBILE/TABLET: Tarjetas con funcionalidad similar -->
    <div v-else>
      <v-row dense>
        <v-col v-for="(doc, dIndex) in paginatedDocentes" :key="doc.aedo_id" cols="12" class="mb-4">
          <v-card style="position: relative; text-align: left;">
            <!-- Botones: Editar y Expandir, posicionados en la esquina superior derecha -->
            <v-btn
              icon
              variant="text"
              @click="abrirDialogoActualizarDocente(doc)"
              style="position: absolute; top: 8px; right: 48px;"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              @click="toggleExpand(doc.aedo_id)"
              style="position: absolute; top: 8px; right: 8px;"
            >
              <v-icon>
                {{ isExpanded(doc.aedo_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-btn>

            <!-- Información del docente -->
            <v-card-text style="padding-top: 60px;">
              <div><strong>N°:</strong> {{ (currentPage - 1) * itemsPerPage + dIndex + 1 }}</div>
              <div><strong>Docente:</strong> {{ doc.docente }}</div>
              <div><strong>Fecha:</strong> {{ doc.fecha_asignacion }}</div>
              <div>
                <strong>Estado:</strong>
                <v-chip v-if="doc.estado === 'A'" color="green">Activo</v-chip>
                <v-chip color="red" v-else>Inactivo</v-chip>
              </div>
            </v-card-text>

            <!-- Botón para expandir/collapse en mobile -->
            <v-card-actions style="justify-content: flex-start;">
              <v-btn color="primary" variant="text" @click="toggleExpand(doc.aedo_id)">
                {{ isExpanded(doc.aedo_id) ? 'Ocultar Cursos' : 'Ver Cursos' }}
              </v-btn>
            </v-card-actions>

            <!-- Sección expandida: Cursos asignados -->
            <div v-if="isExpanded(doc.aedo_id)" style="padding: 12px; background: #fafafa;">
              <!-- Subencabezado para cursos -->
              <div style="font-weight: bold; display: flex; align-items: center; margin-bottom: 8px;">
                <span style="flex: 1;">Cursos Asignados</span>
                <v-btn small color="primary" variant="text" @click="abrirDialogoAgregarCurso(doc)">
                  +Agregar
                </v-btn>
              </div>
              <!-- Si no hay cursos asignados, se muestra el mensaje -->
              <div v-if="filtrarCursosDocente(doc.aedo_id).length === 0" style="text-align: left;">
                <p>No hay cursos asignados</p>
              </div>
              <!-- Si hay cursos, se muestran como cards -->
              <v-row dense v-else>
                <v-col
                  v-for="(curso, cIndex) in paginatedCursos(doc.aedo_id)"
                  :key="curso.daed_id"
                  cols="12"
                  class="mb-2"
                >
                  <v-card style="position: relative; text-align: left;">
                    <!-- Botón editar curso en esquina superior derecha -->
                    <v-btn
                      icon
                      variant="text"
                      @click.stop="abrirDialogoActualizarCurso(curso)"
                      style="position: absolute; top: 8px; right: 8px;"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-card-text style="padding-top: 40px;">
                      <div><strong>N°:</strong> {{ (currentPage - 1) * itemsPerPage + cIndex + 1 }}</div>
                      <div><strong>Curso:</strong> {{ curso.area_educativa }}</div>
                      <div><strong>Fecha:</strong> {{ curso.fecha_asignacion }}</div>
                      <div>
                        <strong>Estado:</strong>
                        <v-chip v-if="curso.estado === 'A'" color="green">Activo</v-chip>
                        <v-chip color="red" v-else>Inactivo</v-chip>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              <!-- Paginación interna para cursos en mobile -->
              <v-pagination
                v-if="paginatedCoursesTotal(doc.aedo_id) > 1"
                v-model="currentCoursePage[doc.aedo_id]"
                :length="paginatedCoursesTotal(doc.aedo_id)"
                class="mt-2"
              />
            </div>
          </v-card>
        </v-col>
      </v-row>
      <!-- Paginación para docentes en mobile -->
      <v-pagination v-if="totalDocentePages > 1" v-model="currentPage" :length="totalDocentePages" class="mt-2" />
    </div>

    <!-- DIÁLOGOS (se muestran igual en ambas versiones) -->
    <!-- Diálogo: Agregar NUEVOS Docentes -->
    <v-dialog v-model="mostrarDialogoAgregarDocentes" max-width="600">
      <v-card>
        <v-card-title>
          <span class="text-h6">Selecciona los docentes a asignar</span>
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="docentesSeleccionados"
            :items="docentesNoAsignados"
            item-value="id"
            item-title="docente"
            label="Docentes disponibles"
            multiple
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cerrarDialogoAgregarDocentes">Cancelar</v-btn>
          <v-btn color="primary" @click="asignarDocentes">Asignar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo: Editar estado del DOCENTE -->
    <v-dialog v-model="dialogoActualizarDocente.visible" max-width="400">
      <v-card>
        <v-card-title>
          <span class="text-h6">Editar estado del docente</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div><strong>Docente:</strong> {{ dialogoActualizarDocente.docente?.docente }}</div>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="dialogoActualizarDocente.docenteEstado"
                :items="['Activo', 'Inactivo']"
                label="Nuevo estado"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cerrarDialogoActualizarDocente">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarEstadoDocente">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo: Editar estado del CURSO -->
    <v-dialog v-model="dialogoActualizarCurso.visible" max-width="400">
      <v-card>
        <v-card-title>
          <span class="text-h6">Editar estado del curso</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div><strong>Curso:</strong> {{ dialogoActualizarCurso.curso?.area_educativa }}</div>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="dialogoActualizarCurso.cursoEstado"
                :items="['Activo', 'Inactivo']"
                label="Nuevo estado"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cerrarDialogoActualizarCurso">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarEstadoCurso">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo: Agregar CURSO a un docente -->
    <v-dialog v-model="dialogoAgregarCurso.visible" max-width="500">
      <v-card>
        <v-card-title>
          <span class="text-h6">Agregar Curso a {{ dialogoAgregarCurso.docente?.docente }}</span>
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="cursosSeleccionados"
            :items="cursosNoAsignados"
            item-value="aede_id"
            item-title="aede_nombre"
            label="Cursos disponibles"
            multiple
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cerrarDialogoAgregarCurso">Cancelar</v-btn>
          <v-btn color="primary" @click="asignarCursosDocente">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useDisplay } from 'vuetify'

/** DETECTAR BREAKPOINTS */
const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp

/** PARÁMETROS (localstorage) */
const anioEscolar = localStorage.getItem('ac_anio_escolar') || '2025'
const profile = localStorage.getItem('av_profile') || 'demo'
const token = localStorage.getItem('token') || ''

/** DATA REACTIVA */
const docentesAsignados = ref([])
const docentesNoAsignados = ref([])
const cursosDocentes = ref([])

const docentesSeleccionados = ref([])
const cursosSeleccionados = ref([])
const cursosNoAsignados = ref([])

/** DIÁLOGOS */
const mostrarDialogoAgregarDocentes = ref(false)
const dialogoActualizarDocente = ref({
  visible: false,
  docente: null,
  docenteEstado: '',
})
const dialogoActualizarCurso = ref({
  visible: false,
  curso: null,
  cursoEstado: '',
})
const dialogoAgregarCurso = ref({
  visible: false,
  docente: null,
})

/** AXIOS con token */
const axiosInstance = axios.create({
  baseURL: 'https://amsoftsolution.com/amss/ws/',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})

/** SINGLE EXPAND: Un docente a la vez */
const expandedAedoId = ref(null)
function isExpanded(aedoId) {
  return expandedAedoId.value === aedoId
}
function toggleExpand(aedoId) {
  if (expandedAedoId.value === aedoId) {
    expandedAedoId.value = null
  } else {
    expandedAedoId.value = aedoId
  }
}

/** PAGINACIÓN (docentes en mobile) */
const currentPage = ref(1)
const itemsPerPage = ref(5)
const paginatedDocentes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return docentesAsignados.value.slice(start, start + itemsPerPage.value)
})
const totalDocentePages = computed(() =>
  Math.ceil(docentesAsignados.value.length / itemsPerPage.value)
)

/** PAGINACIÓN (cursos en mobile) */
const coursesPerPage = 5
const currentCoursePage = ref({})
function paginatedCursos(aedoId) {
  const page = currentCoursePage.value[aedoId] || 1
  const all = filtrarCursosDocente(aedoId)
  const start = (page - 1) * coursesPerPage
  return all.slice(start, start + coursesPerPage)
}
function paginatedCoursesTotal(aedoId) {
  const all = filtrarCursosDocente(aedoId)
  return Math.ceil(all.length / coursesPerPage)
}

/** CARGAR DATA AL MONTAR */
onMounted(() => {
  obtenerDocentesAsignados()
  obtenerDocentesNoAsignados()
  obtenerCursosDocentes()
})

async function obtenerDocentesAsignados() {
  try {
    const url = `wsListaAnioEscolarDocentes.php?ac_anio_escolar=${anioEscolar}&av_profile=${profile}`
    const { data } = await axiosInstance.get(url)
    if (data.status) {
      docentesAsignados.value = data.data
    }
  } catch (err) {
    console.error('Error al obtener docentes asignados:', err)
  }
}
async function obtenerDocentesNoAsignados() {
  try {
    const url = `wsListaAnioEscolarNoDocentes.php?ac_anio_escolar=${anioEscolar}&av_profile=${profile}`
    const resp = await axiosInstance.get(url)
    if (resp.data.status) {
      docentesNoAsignados.value = resp.data.data
    }
  } catch (err) {
    console.error('Error al obtener docentes no asignados:', err)
  }
}
async function obtenerCursosDocentes() {
  try {
    const url = `wsListaDocenteAreaEducativaDetalle.php?ac_anio_escolar=${anioEscolar}&av_profile=${profile}`
    const resp = await axiosInstance.get(url)
    if (resp.data.status) {
      cursosDocentes.value = resp.data.data
    }
  } catch (err) {
    console.error('Error al obtener cursos:', err)
  }
}

/** FILTRAR CURSOS X DOCENTE (aedo_id) */
function filtrarCursosDocente(aedoId) {
  return cursosDocentes.value.filter(c => c.aedo_id === aedoId)
}

/** EDITAR ESTADO DEL DOCENTE */
function abrirDialogoActualizarDocente(doc) {
  dialogoActualizarDocente.value.docente = { ...doc }
  dialogoActualizarDocente.value.docenteEstado = doc.estado === 'A' ? 'Activo' : 'Inactivo'
  dialogoActualizarDocente.value.visible = true
}
function cerrarDialogoActualizarDocente() {
  dialogoActualizarDocente.value.visible = false
  dialogoActualizarDocente.value.docente = null
  dialogoActualizarDocente.value.docenteEstado = ''
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
  } catch (err) {
    console.error('Error al actualizar docente:', err)
  }
}

/** EDITAR ESTADO DEL CURSO */
function abrirDialogoActualizarCurso(curso) {
  dialogoActualizarCurso.value.curso = { ...curso }
  dialogoActualizarCurso.value.cursoEstado = curso.estado === 'A' ? 'Activo' : 'Inactivo'
  dialogoActualizarCurso.value.visible = true
}
function cerrarDialogoActualizarCurso() {
  dialogoActualizarCurso.value.visible = false
  dialogoActualizarCurso.value.curso = null
  dialogoActualizarCurso.value.cursoEstado = ''
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
  } catch (err) {
    console.error('Error al actualizar curso:', err)
  }
}

/** AGREGAR CURSO A DOCENTE */
function abrirDialogoAgregarCurso(doc) {
  dialogoAgregarCurso.value.docente = doc
  dialogoAgregarCurso.value.visible = true
  cursosSeleccionados.value = []
  cargarCursosNoAsignadosDocente(doc.aedo_id)
}
function cerrarDialogoAgregarCurso() {
  dialogoAgregarCurso.value.visible = false
  dialogoAgregarCurso.value.docente = null
  cursosSeleccionados.value = []
}
async function cargarCursosNoAsignadosDocente(aedoId) {
  try {
    const url = `wsListaDocenteNoAreaEducativaDetalle.php?ai_aedo_id=${aedoId}&ac_anio_escolar=${anioEscolar}&av_profile=${profile}`
    const resp = await axiosInstance.get(url)
    if (resp.data.status) {
      cursosNoAsignados.value = resp.data.data
    }
  } catch (err) {
    console.error('Error al cargar cursos no asignados:', err)
  }
}
async function asignarCursosDocente() {
  try {
    const doc = dialogoAgregarCurso.value.docente
    for (const cursoId of cursosSeleccionados.value) {
      await axiosInstance.post('wsRegistraDocenteAreaEducativaDetalle.php', {
        ai_aedo_id: doc.aedo_id,
        ai_aede_id: cursoId,
      })
    }
    cerrarDialogoAgregarCurso()
    obtenerCursosDocentes()
  } catch (err) {
    console.error('Error al asignar cursos:', err)
  }
}

/** ASIGNAR NUEVOS DOCENTES */
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
  } catch (err) {
    console.error('Error al asignar docentes:', err)
  }
}
function cerrarDialogoAgregarDocentes() {
  mostrarDialogoAgregarDocentes.value = false
}
</script>

<style scoped>
/* Puedes ajustar los estilos a tu gusto */
/* Por ejemplo, para mobile: */
.v-card {
  /* Aseguramos que el contenido se alinee a la izquierda */
  text-align: left;
}
</style>
