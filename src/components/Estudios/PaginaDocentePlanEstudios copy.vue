<template>
  <v-container fluid>
    <!-- ENCABEZADO -->
    <v-row class="py-3">
      <v-col cols="12">
        <h1 class="text-h4">Plan de estudios - Año {{ anioEscolar }}</h1>
      </v-col>
    </v-row>

    <!-- FILTROS -->
    <v-row class="mb-4" dense>
      <v-col cols="12" md="4">
        <v-select
          label="Área Educativa"
          :items="areasOptions"
          item-text="title"
          item-value="key"
          v-model="selectedArea"
          dense
          outlined
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          label="Nivel"
          :items="nivelOptions"
          item-text="title"
          item-value="key"
          v-model="selectedNivel"
          dense
          outlined
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          label="Grado"
          :items="gradoOptions"
          item-text="title"
          item-value="key"
          v-model="selectedGrado"
          dense
          outlined
        />
      </v-col>
    </v-row>

    <!-- TABLA DESKTOP -->
    <div v-if="isDesktop">
      <v-data-table
        :items="filteredPlanes"
        item-key="ples_id"
        :items-per-page="itemsPerPage"
        hide-default-header
        class="elevation-1 mt-4"
        v-model:page="currentPage"
      >
        <template #body="{ items }">
          <thead>
            <tr>
              <th>N°</th>
              <th>Área Educativa</th>
              <th>Nivel</th>
              <th>Grado</th>
              <th>Horas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- Primer nivel: filas de Plan de Estudio -->
            <template v-for="(plan, idx) in items" :key="plan.ples_id">
              <!-- Fila principal -->
              <tr :class="{ 'expanded-row': isExpanded(plan.ples_id) }">
                <td>{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
                <td>{{ plan.ared_nombre }}</td>
                <td>{{ plan.nive_nombre }}</td>
                <td>{{ plan.grad_nombre }}</td>
                <td>{{ plan.ples_horas }}</td>
                <td>
                  <v-chip :color="plan.ples_estado === 'A' ? 'green' : 'red'">
                    {{ plan.ples_estado === 'A' ? 'Activo' : 'Inactivo' }}
                  </v-chip>
                </td>
                <td>
                  <!-- Botón para expandir Plan Curricular -->
                  <v-btn icon variant="text" @click.stop="toggleExpand(plan.ples_id)">
                    <v-icon>{{ isExpanded(plan.ples_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                  </v-btn>
                </td>
              </tr>

              <!-- Fila expandida para Planes Curriculares de ese plan -->
              <tr v-if="isExpanded(plan.ples_id)">
                <td colspan="7" class="expanded-section">
                  <div class="d-flex justify-space-between font-weight-bold mb-2">
                    <span>Planes Curriculares</span>
                  </div>

                  <!-- Tabla de Planes Curriculares -->
                  <table v-if="(planCurriculares[plan.ples_id] || []).length" class="w-100">
                    <thead>
                      <tr>
                        <th>N°</th>
                        <th>Periodo</th>
                        <th>Curso</th>
                        <th>Horas</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Segundo nivel: filas de Plan Curricular (item) -->
                      <template v-for="(item, i) in paginatedCurr(plan.ples_id)" :key="item.pacu_id">
                        <!-- Fila principal del item -->
                        <tr :class="{ 'expanded-row': isEvaluationExpanded(item.pacu_id) }">
                          <td>
                            {{ ((planCurrPage[plan.ples_id] ?? 1) - 1) * currItemsPerPage + i + 1 }}
                          </td>
                          <td>{{ item.peed_nombre }}</td>
                          <td>{{ item.aede_nombre }}</td>
                          <td>{{ item.pacu_horas }}</td>
                          <td>
                            <v-chip :color="item.pacu_estado === 'A' ? 'green' : 'red'">
                              {{ item.pacu_estado === 'A' ? 'Activo' : 'Inactivo' }}
                            </v-chip>
                          </td>
                          <td>
                            <!-- Botón para expandir Evaluaciones -->
                            <v-btn icon variant="text" @click.stop="toggleExpandEvaluations(item.pacu_id)">
                              <v-icon>
                                {{ isEvaluationExpanded(item.pacu_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                              </v-icon>
                            </v-btn>
                          </td>
                        </tr>

                        <!-- Fila expandida para Evaluaciones de ese pacu_id -->
                        <tr v-if="isEvaluationExpanded(item.pacu_id)">
                          <td colspan="6" class="evaluation-section">
                            <div class="d-flex justify-space-between font-weight-bold mb-2">
                              <span>Evaluaciones</span>
                              <v-btn small color="primary" variant="text" @click="abrirDialogoAgregarEvaluacion(item)">
                                +Agregar
                              </v-btn>
                            </div>

                            <!-- Tabla de Evaluaciones -->
                            <table
                              v-if="(planCurricularEvaluaciones[item.pacu_id] || []).length"
                              class="w-100"
                            >
                              <thead>
                                <tr>
                                  <th>N°</th>
                                  <th>Nombre</th>
                                  <th>Cantidad</th>
                                  <th>Orden</th>
                                  <th>Estado</th>
                                  <th>Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="(evalItem, eIdx) in paginatedEvaluations(item.pacu_id)"
                                  :key="evalItem.pcev_id"
                                >
                                  <td>
                                    {{
                                      (evaluationPage[item.pacu_id] - 1) * evaluationItemsPerPage +
                                      eIdx +
                                      1
                                    }}
                                  </td>
                                  <td>{{ evalItem.eval_nombre }}</td>
                                  <td>{{ evalItem.pcev_cantidad_evaluacion }}</td>
                                  <td>{{ evalItem.pcev_orden }}</td>
                                  <td>
                                    <v-chip :color="evalItem.pcev_estado === 'A' ? 'green' : 'red'">
                                      {{ evalItem.pcev_estado === 'A' ? 'Activo' : 'Inactivo' }}
                                    </v-chip>
                                  </td>
                                  <td>
                                    <v-btn icon variant="text" @click.stop="abrirDialogoEditarEvaluacion(evalItem)">
                                      <v-icon>mdi-pencil</v-icon>
                                    </v-btn>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <p v-else>No hay evaluaciones registradas</p>

                            <!-- Paginación de Evaluaciones -->
                            <v-pagination
                              v-if="evaluationTotalPages(item.pacu_id) > 1"
                              v-model="evaluationPage[item.pacu_id]"
                              :length="evaluationTotalPages(item.pacu_id)"
                              small
                              class="mt-2"
                            />
                          </td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                  <p v-else>No hay planes curriculares</p>

                  <!-- Paginación de Planes Curriculares -->
                  <v-pagination
                    v-if="currTotalPages(plan.ples_id) > 1"
                    v-model="planCurrPage[plan.ples_id]"
                    :length="currTotalPages(plan.ples_id)"
                    small
                    class="mt-2"
                  />
                </td>
              </tr>
            </template>
          </tbody>
        </template>
      </v-data-table>

      <!-- Paginación de Planes de Estudio -->
      <v-pagination
        v-if="totalPages > 1"
        v-model="currentPage"
        :length="totalPages"
        class="mt-4"
      />
    </div>

    <!-- VERSIÓN MOBILE -->
    <div v-else>
      <v-row>
        <v-col cols="12" v-for="(plan) in paginatedMobilePlanes" :key="plan.ples_id">
          <v-card class="mb-4">
            <v-card-title class="d-flex justify-space-between align-center">
              <div>
                <div class="font-weight-medium">{{ plan.ared_nombre }}</div>
                <div class="text-subtitle-2">{{ plan.nive_nombre }} — {{ plan.grad_nombre }}</div>
              </div>
              <div>
                <v-btn icon @click.stop="toggleExpand(plan.ples_id)">
                  <v-icon>{{ isExpanded(plan.ples_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-btn>
              </div>
            </v-card-title>

            <v-card-subtitle class="px-4 pb-0">
              Horas: {{ plan.ples_horas }} |
              <v-chip x-small :color="plan.ples_estado === 'A' ? 'green' : 'red'">
                {{ plan.ples_estado === 'A' ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </v-card-subtitle>

            <!-- Expansión Mobile de Plan Curricular -->
            <v-expand-transition>
              <v-card-text v-if="isExpanded(plan.ples_id)">
                <v-list dense>
                  <!-- Listado de Planes Curriculares en mobile -->
                  <v-list-item
                    v-for="(item) in planCurriculares[plan.ples_id] || []"
                    :key="item.pacu_id"
                  >
                    <div class="d-flex justify-space-between align-center w-100">
                      <div>
                        {{ item.peed_nombre }} — {{ item.aede_nombre }}
                        <div class="text-caption">
                          Horas: {{ item.pacu_horas }}
                          <v-chip x-small :color="item.pacu_estado === 'A' ? 'green' : 'red'">
                            {{ item.pacu_estado === 'A' ? 'Activo' : 'Inactivo' }}
                          </v-chip>
                        </div>
                      </div>

                      <!-- Botón para expandir Evaluaciones Mobile -->
                      <v-btn icon variant="text" @click.stop="toggleExpandEvaluations(item.pacu_id)">
                        <v-icon>{{ isEvaluationExpanded(item.pacu_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                      </v-btn>
                    </div>

                    <!-- Expansión Mobile de Evaluaciones -->
                    <v-expand-transition>
                      <div v-if="isEvaluationExpanded(item.pacu_id)" class="evaluation-section pa-4">
                        <v-list dense>
                          <v-btn
                            small
                            color="primary"
                            variant="text"
                            class="mb-2"
                            @click="abrirDialogoAgregarEvaluacion(item)"
                          >
                            +Agregar
                          </v-btn>

                          <!-- Iteración de Evaluaciones mobile -->
                          <div
                            v-for="(evalItem) in paginatedEvaluations(item.pacu_id)"
                            :key="evalItem.pcev_id"
                            class="mb-2"
                          >
                            <div class="d-flex justify-space-between align-center">
                              <span class="font-weight-medium">{{ evalItem.eval_nombre }}</span>
                              <v-btn icon variant="text" @click.stop="abrirDialogoEditarEvaluacion(evalItem)">
                                <v-icon>mdi-pencil</v-icon>
                              </v-btn>
                            </div>
                            <div class="text-caption">
                              Cant: {{ evalItem.pcev_cantidad_evaluacion }} |
                              Orden: {{ evalItem.pcev_orden }}
                              <td>
                                <v-chip :color="evalItem.pcev_estado === 'A' ? 'green' : 'red'">
                                  {{ evalItem.pcev_estado === 'A' ? 'Activo' : 'Inactivo' }}
                                </v-chip>
                              </td>
                            </div>
                          </div>

                          <!-- Mensaje si no hay evaluaciones -->
                          <div v-if="!(planCurricularEvaluaciones[item.pacu_id]?.length)">
                            No hay evaluaciones registradas
                          </div>
                        </v-list>

                        <!-- Paginación Evaluaciones Mobile -->
                        <v-pagination
                          v-if="evaluationTotalPages(item.pacu_id) > 1"
                          v-model="evaluationPage[item.pacu_id]"
                          :length="evaluationTotalPages(item.pacu_id)"
                          small
                          class="mt-2"
                        />
                      </div>
                    </v-expand-transition>
                  </v-list-item>

                  <!-- Mensaje si no hay planes curriculares -->
                  <v-list-item v-if="!(planCurriculares[plan.ples_id]?.length)">
                    No hay planes curriculares
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>

      <!-- Paginación Mobile de Planes -->
      <v-pagination
        v-model="mobilePage"
        :length="mobileTotalPages"
        :total-visible="5"
        class="mt-4"
        dense
      />
    </div>

    <!-- DIÁLOGOS: Editar Plan de Estudio -->
    <v-dialog v-model="mostrarDialogoActualizarPlan" max-width="400">
      <v-card>
        <v-card-title>
          <span class="text-h6">Editar Plan de Estudio</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div><strong>Área Educativa:</strong> {{ planSeleccionado?.ared_nombre }}</div>
            </v-col>
            <v-col cols="12">
              <div><strong>Nivel:</strong> {{ nivelDelPlan }}</div>
            </v-col>
            <v-col cols="12">
              <div><strong>Grado:</strong> {{ planSeleccionado?.grad_nombre }}</div>
            </v-col>
            <v-col cols="12">
              <v-text-field label="Horas" v-model="planSeleccionadoHrs" type="number" />
            </v-col>
            <v-col cols="12">
              <v-select label="Estado" v-model="planSeleccionadoEstado" :items="['Activo','Inactivo']" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cerrarDialogoActualizarPlan">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarPlanEstudio">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIÁLOGO: Agregar Plan Curricular -->
    <v-dialog v-model="mostrarDialogoAgregarCurricular" max-width="400">
      <v-card>
        <v-card-title>Agregar Plan Curricular</v-card-title>
        <v-card-text>
          <v-select
            label="Periodo"
            :items="periodosOptions"
            item-text="title"
            item-value="key"
            v-model="newCurricular.periodo_id"
          />
          <v-select
            label="Docente / Curso"
            :items="docentesOptions"
            item-text="title"
            item-value="key"
            v-model="newCurricular.daed_id"
          />
          <v-text-field label="Horas" type="number" v-model="newCurricular.pacu_horas" />
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="mostrarDialogoAgregarCurricular = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarNuevoPlanCurricular">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIÁLOGO: Editar Plan Curricular -->
    <v-dialog v-model="mostrarDialogoActualizarCurricular" max-width="400">
      <v-card>
        <v-card-title>
          <span class="text-h6">Editar Plan Curricular</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div><strong>Curso:</strong> {{ planCurricularSeleccionado?.aede_nombre }}</div>
            </v-col>
            <v-col cols="12">
              <div><strong>Docente:</strong> {{ planCurricularSeleccionado?.docente }}</div>
            </v-col>
            <v-col cols="12">
              <v-text-field label="Horas" v-model="planCurricularHoras" type="number" />
            </v-col>
            <v-col cols="12">
              <v-select label="Estado" v-model="planCurricularEstado" :items="['Activo','Inactivo']" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cerrarDialogoActualizarCurricular">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarPlanCurricular">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIÁLOGO: Agregar Evaluación de Plan Curricular -->
    <v-dialog v-model="mostrarDialogoAgregarEvaluacion" max-width="400">
      <v-card>
        <v-card-title>Agregar Evaluación</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-select
                label="Tipo de Evaluación"
                :items="evaluacionesOptions"
                item-text="title"
                item-value="key"
                v-model="newEvaluacion.eval_id"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Cantidad Eval."
                type="number"
                v-model="newEvaluacion.pcev_cantidad_evaluacion"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Orden"
                type="number"
                v-model="newEvaluacion.pcev_orden"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="mostrarDialogoAgregarEvaluacion = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarNuevaEvaluacion">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIÁLOGO: Editar Evaluación de Plan Curricular -->
    <v-dialog v-model="mostrarDialogoEditarEvaluacion" max-width="400">
      <v-card>
        <v-card-title>Editar Evaluación</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <strong>Evaluación:</strong> {{ evaluacionSeleccionada?.eval_nombre }}
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Cantidad Eval."
                type="number"
                v-model="evaluacionSeleccionada.pcev_cantidad_evaluacion"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Orden"
                type="number"
                v-model="evaluacionSeleccionada.pcev_orden"
              />
            </v-col>
            <v-col cols="12">
              <v-select
                label="Estado"
                :items="['Activo','Inactivo']"
                v-model="evaluacionSeleccionadaEstado"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="cerrarDialogoEditarEvaluacion">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarEvaluacionActualizada">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import axios from 'axios'
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp

const usua_id = localStorage.getItem('usua_id')
const anioEscolar = localStorage.getItem('anio_escolar')
const profile = localStorage.getItem('profile')
const token = localStorage.getItem('token')

// Instancia de Axios
const axiosInstance = axios.create({
  baseURL: 'https://amsoftsolution.com/amss/ws/',
  headers: { Authorization: `Bearer ${token}` }
})

// --- VARIABLES PRINCIPALES ---
const planesEstudio = ref([])           // Lista de planes de estudio
const planCurriculares = ref({})        // planCurriculares[ples_id] => array de planes curr
const planCurricularEvaluaciones = ref({})  // planCurricularEvaluaciones[pacu_id] => array

// --- PAGINACIÓN (Planes) ---
const currentPage = ref(1)
const itemsPerPage = computed(() => (isDesktop.value ? 10 : 5))

// --- PAGINACIÓN (Planes Curriculares) ---
const planCurrPage = ref({})
const currItemsPerPage = computed(() => (isDesktop.value ? 10 : 5))

// --- PAGINACIÓN (Evaluaciones) ---
const evaluationPage = ref({})
const evaluationItemsPerPage = computed(() => (isDesktop.value ? 10 : 5))

// --- EXPANSIÓN de filas ---
const expandedId = ref(null)             // Para planes
const expandedEvaluationId = ref(null)   // Para evaluaciones

// --- FILTROS ---
const areasOptions = ref([{ title: 'TODOS', key: 'TODOS' }])
const nivelOptions = ref([{ title: 'TODOS', key: 'TODOS' }])
const gradosList = ref([])

const selectedArea = ref('TODOS')
const selectedNivel = ref('TODOS')
const selectedGrado = ref('TODOS')

// --- DIALOGOS Plan Curricular ---
const mostrarDialogoAgregarCurricular = ref(false)
const newCurricular = reactive({
  ples_id: null,
  ared_id: null,
  daed_id: null,
  periodo_id: null,
  pacu_horas: null,
  estado: 'Activo'
})

const mostrarDialogoActualizarCurricular = ref(false)
const planCurricularSeleccionado = ref(null)
const planCurricularHoras = ref(null)
const planCurricularEstado = ref('')

// --- DIALOGOS Plan Estudio ---
const mostrarDialogoActualizarPlan = ref(false)
const planSeleccionado = ref(null)
const planSeleccionadoHrs = ref(null)
const planSeleccionadoEstado = ref('')

// --- DIALOGOS Evaluaciones ---
const evaluacionesOptions = ref([
  { key: 1, title: 'Participaciones' },
  { key: 2, title: 'Prácticas' },
  { key: 3, title: 'Tareas' },
  { key: 4, title: 'Revisión de cuadernos' },
  { key: 5, title: 'Examen mensual' },
  { key: 6, title: 'Examen bimestral' }
])
const mostrarDialogoAgregarEvaluacion = ref(false)
const mostrarDialogoEditarEvaluacion = ref(false)
const newEvaluacion = reactive({
  pacu_id: null,
  eval_id: null,
  pcev_peso_porcentaje: null,
  pcev_cantidad_evaluacion: null,
  pcev_orden: null
})
const evaluacionSeleccionada = ref(null)
const evaluacionSeleccionadaEstado = ref('Activo')

// --- COMPUTED para FILTROS ---
const gradoOptions = computed(() => {
  const base = [{ title: 'TODOS', key: 'TODOS' }]
  if (selectedNivel.value === 'TODOS') {
    return base
  }
  const filtered = gradosList.value.filter(g => g.nive_id === selectedNivel.value)
  return base.concat(filtered.map(g => ({ title: g.grad_nombre, key: g.grad_nombre })))
})

const filteredPlanes = computed(() => {
  return planesEstudio.value.filter(plan => {
    const okArea = selectedArea.value === 'TODOS' || plan.ared_id === selectedArea.value
    const okNivel = selectedNivel.value === 'TODOS' || plan.nive_id === selectedNivel.value
    const okGrado = selectedGrado.value === 'TODOS' || plan.grad_nombre === selectedGrado.value
    return okArea && okNivel && okGrado
  })
})

/*
const filteredPlanes = computed(() => {
  return planesEstudio.value.filter(plan => {
    const okArea = selectedArea.value === 'TODOS' || plan.ared_id === selectedArea.value
    const okGrado = selectedGrado.value === 'TODOS' || plan.grad_nombre === selectedGrado.value
    let okNivel = true
    if (selectedNivel.value !== 'TODOS') {
      const foundGrado = gradosList.value.find(g => g.grad_nombre === plan.grad_nombre)
      if (!foundGrado || foundGrado.nive_id !== selectedNivel.value) {
        okNivel = false
      }
    }
    return okArea && okNivel && okGrado
  })
})
*/
const totalPages = computed(() => Math.ceil(filteredPlanes.value.length / itemsPerPage.value))

// --- COMPUTED para EDICIÓN de Plan ---
const nivelDelPlan = computed(() => {
  if (!planSeleccionado.value) return ''
  const gradoObj = gradosList.value.find(g => g.grad_nombre === planSeleccionado.value.grad_nombre)
  if (!gradoObj) return ''
  const nivelObj = nivelOptions.value.find(n => n.key === gradoObj.nive_id)
  return nivelObj ? nivelObj.title : ''
})

// --- PAGINACIÓN secundaria (Plan Curricular) ---
function paginatedCurr(plesId) {
  const list = planCurriculares.value[plesId] || []
  const page = planCurrPage.value[plesId] || 1
  const start = (page - 1) * currItemsPerPage.value
  return list.slice(start, start + currItemsPerPage.value)
}
function currTotalPages(plesId) {
  const list = planCurriculares.value[plesId] || []
  return Math.ceil(list.length / currItemsPerPage.value)
}

// --- PAGINACIÓN Evaluaciones ---
function paginatedEvaluations(pacuId) {
  if (!evaluationPage.value[pacuId]) {
    evaluationPage.value[pacuId] = 1
  }
  const list = planCurricularEvaluaciones.value[pacuId] || []
  const page = evaluationPage.value[pacuId]
  const start = (page - 1) * evaluationItemsPerPage.value
  return list.slice(start, start + evaluationItemsPerPage.value)
}
function evaluationTotalPages(pacuId) {
  const list = planCurricularEvaluaciones.value[pacuId] || []
  return Math.ceil(list.length / evaluationItemsPerPage.value)
}

// --- OBTENER DATOS PRINCIPALES ---
async function obtenerPlanesEstudio() {
  const { data } = await axiosInstance.get(
    `wsConsultaDocentePlanEstudios.php?ai_usua_id=${usua_id}&ac_anio_escolar=${anioEscolar}&av_profile=${profile}`
  )
  if (data.status) {
    planesEstudio.value = data.data
  }
}
async function obtenerPlanCurricular(plesId) {
  const { data } = await axiosInstance.get(
    `wsConsultaPlanCurricular.php?ai_usua_id=${usua_id}&ai_ples_id=${plesId}&av_profile=${profile}`
  )
  if (data.status) {
    // Insertamos en el objeto planCurriculares bajo la llave plesId
    planCurriculares.value = { ...planCurriculares.value, [plesId]: data.data }
  } else {
    planCurriculares.value[plesId] = []
  }
}
async function obtenerPlanCurricularEvaluaciones(pacuId) {
  try {
    const { data } = await axiosInstance.get(
      `wsConsultaPlanCurricularEvaluaciones.php?ai_pacu_id=${pacuId}&av_profile=${profile}`
    )
    if (data.status) {
      planCurricularEvaluaciones.value = {
        ...planCurricularEvaluaciones.value,
        [pacuId]: data.data
      }
    } else {
      planCurricularEvaluaciones.value[pacuId] = []
    }
  } catch (err) {
    console.error('Error al obtener evaluaciones:', err)
    planCurricularEvaluaciones.value[pacuId] = []
  }
}

// --- EXPANSIÓN de filas ---
function toggleExpand(plesId) {
  if (expandedId.value === plesId) {
    expandedId.value = null
  } else {
    expandedId.value = plesId
    // Cuando expandimos un plan, cargamos sus planes curriculares
    obtenerPlanCurricular(plesId)
  }
}
function isExpanded(plesId) {
  return expandedId.value === plesId
}
function toggleExpandEvaluations(pacuId) {
  if (expandedEvaluationId.value === pacuId) {
    expandedEvaluationId.value = null
  } else {
    expandedEvaluationId.value = pacuId
    // Cargamos evaluaciones
    obtenerPlanCurricularEvaluaciones(pacuId)
    // Forzamos página a 1 si no está definida
    if (!evaluationPage.value[pacuId]) {
      evaluationPage.value[pacuId] = 1
    }
  }
}
function isEvaluationExpanded(pacuId) {
  return expandedEvaluationId.value === pacuId
}

// --- EVALUACIONES: Agregar / Editar ---
function abrirDialogoAgregarEvaluacion(planCurr) {
  newEvaluacion.pacu_id = planCurr.pacu_id
  newEvaluacion.eval_id = null
  newEvaluacion.pcev_peso_porcentaje = null
  newEvaluacion.pcev_cantidad_evaluacion = null
  newEvaluacion.pcev_orden = null
  mostrarDialogoAgregarEvaluacion.value = true
}
async function guardarNuevaEvaluacion() {
  try {
    const params = new URLSearchParams()
    params.append('ai_pacu_id', newEvaluacion.pacu_id)
    params.append('ai_eval_id', newEvaluacion.eval_id)
    //params.append('adc_pcev_peso_porcentaje', evaluacionSeleccionada.value.pcev_peso_porcentaje)
    params.append('adc_pcev_cantidad_evaluacion', newEvaluacion.pcev_cantidad_evaluacion)
    params.append('adc_pcev_orden', newEvaluacion.pcev_orden)
    params.append('av_profile', profile)

    const { data } = await axiosInstance.post('wsRegistraPlanCurricularEvaluaciones.php', params)
    if (data.status) {
      mostrarDialogoAgregarEvaluacion.value = false
      // Refrescamos las evaluaciones
      await obtenerPlanCurricularEvaluaciones(newEvaluacion.pacu_id)
    } else {
      console.error('Error al guardar nueva evaluación:', data.message)
    }
  } catch (err) {
    console.error('Error al guardar nueva evaluación:', err)
  }
}

function abrirDialogoEditarEvaluacion(evalItem) {
  evaluacionSeleccionada.value = { ...evalItem }
  // Ajustamos su estado a 'Activo' o 'Inactivo' (si pcev_estado viene null, ajusta tu lógica)
  evaluacionSeleccionadaEstado.value = evalItem.pcev_estado === 'I' ? 'Inactivo' : 'Activo'
  mostrarDialogoEditarEvaluacion.value = true
}
async function guardarEvaluacionActualizada() {
  try {
    const params = new URLSearchParams()
    params.append('ai_pcev_id', evaluacionSeleccionada.value.pcev_id)
    params.append('ai_pacu_id', evaluacionSeleccionada.value.pacu_id)
    params.append('ai_eval_id', evaluacionSeleccionada.value.eval_id)
    params.append('adc_pcev_peso_porcentaje', evaluacionSeleccionada.value.pcev_peso_porcentaje)
    params.append('adc_pcev_cantidad_evaluacion', evaluacionSeleccionada.value.pcev_cantidad_evaluacion)
    params.append('adc_pcev_orden', evaluacionSeleccionada.value.pcev_orden)

    const estadoWS = evaluacionSeleccionadaEstado.value === 'Activo' ? 'A' : 'I'
    params.append('ac_pcev_estado', estadoWS)
    params.append('av_profile', profile)

    const { data } = await axiosInstance.post('wsActualizaPlanCurricularEvaluaciones.php', params)
    if (data.status) {
      mostrarDialogoEditarEvaluacion.value = false
      // Recargamos evaluaciones
      await obtenerPlanCurricularEvaluaciones(evaluacionSeleccionada.value.pacu_id)
    } else {
      console.error('Error al actualizar evaluación:', data.message)
    }
  } catch (err) {
    console.error('Error al actualizar evaluación:', err)
  }
}
function cerrarDialogoEditarEvaluacion() {
  mostrarDialogoEditarEvaluacion.value = false
}

// --- PLAN CURRICULAR: Agregar / Editar ---
async function guardarNuevoPlanCurricular() {
  // Llamar tu WS para crear plan curricular...
  // ...
  mostrarDialogoAgregarCurricular.value = false
}
function cerrarDialogoActualizarCurricular() {
  mostrarDialogoActualizarCurricular.value = false
}
function guardarPlanCurricular() {
  // WS para actualizar plan curricular...
  // ...
  mostrarDialogoActualizarCurricular.value = false
}

// --- PLAN DE ESTUDIO: Editar ---
function cerrarDialogoActualizarPlan() {
  mostrarDialogoActualizarPlan.value = false
}
function guardarPlanEstudio() {
  // WS para actualizar plan de estudio...
  // ...
  mostrarDialogoActualizarPlan.value = false
}

// --- PAGINACIÓN (MOBILE) ---
const mobilePage = ref(1)
const mobileItemsPerPage = 5
const paginatedMobilePlanes = computed(() => {
  const start = (mobilePage.value - 1) * mobileItemsPerPage
  return filteredPlanes.value.slice(start, start + mobileItemsPerPage)
})
const mobileTotalPages = computed(() => {
  return Math.ceil(filteredPlanes.value.length / mobileItemsPerPage)
})

// --- WATCH para resetear páginas al cambiar filtros ---
watch([selectedArea, selectedNivel, selectedGrado], () => {
  currentPage.value = 1
  mobilePage.value = 1
})

// --- onMounted para cargar datos iniciales ---
onMounted(() => {
  obtenerPlanesEstudio()
  obtenerAreasEducativas()
  obtenerNivelesGrados()
})

// --- CARGA de ÁREAS, NIVELES Y GRADOS ---
async function obtenerAreasEducativas() {
  const { data } = await axiosInstance.get(
    `wsListaAreaEducativa.php?ac_indicador_todos=N&av_profile=${profile}`
  )
  if (data.status) {
    areasOptions.value = [{ title: 'TODOS', key: 'TODOS' }].concat(
      data.data.map(a => ({ title: a.ared_nombre, key: a.ared_id }))
    )
  }
}
async function obtenerNivelesGrados() {
  const { data } = await axiosInstance.get(`wsListaNivelGradoAlumno.php?av_profile=${profile}`)
  if (data.status) {
    nivelOptions.value = [{ title: 'TODOS', key: 'TODOS' }].concat(
      data.data.niveles.map(n => ({ title: n.nive_nombre, key: n.nive_id }))
    )
    gradosList.value = data.data.grados
  }
}

// (Opcional) si necesitabas cargar docentes y periodos para
// Agregar Plan Curricular, descomenta y ajusta tu lógica:
// async function obtenerDocentesCursos(aredId) { ... }
// async function obtenerPeriodos() { ... }
</script>

<style scoped>
th,
td {
  padding: 12px 24px;
}
.expanded-row {
  background-color: #e0f7fa;
}
.expanded-section {
  background: #fafafa;
  padding: 12px;
}
.evaluation-section {
  background-color: #fff9c4; /* amarillo pastel */
  padding: 12px;
}
::v-deep .v-list,
::v-deep .v-list-item,
::v-deep .v-list-item__content {
  background-color: transparent !important;
}
</style>
