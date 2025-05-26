<template>
  <v-container fluid>
    <!-- ENCABEZADO -->
    <v-row class="py-3">
      <v-col cols="12">
        <h1 class="text-h5 font-weight-bold mb-1">📚 Plan de Estudios</h1>
        <p class="text-subtitle-2">
          Gestiona el plan de estudios del año escolar {{ anioEscolar }}.
        </p>
      </v-col>
    </v-row>

    <!-- FILTROS -->
    <v-row dense class="mb-4">
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedArea"
          :items="areaOptions"
          item-title="title"
          item-value="key"
          label="Área Educativa"
          clearable
          dense
          outlined
          :menu-props="{ maxHeight: '300' }"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedNivel"
          :items="nivelOptions"
          item-title="title"
          item-value="key"
          label="Nivel"
          clearable
          dense
          outlined
          :menu-props="{ maxHeight: '300' }"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedGrado"
          :items="gradoOptions"
          item-title="title"
          item-value="key"
          label="Grado"
          clearable
          dense
          outlined
          :menu-props="{ maxHeight: '300' }"
        />
      </v-col>
    </v-row>

    <!-- BOTÓN AGREGAR PLAN -->
    <v-row class="justify-end mb-2">
      <v-btn color="primary" @click="abrirDialogoAgregarPlanEstudio" prepend-icon="mdi-plus">
        Agregar Plan de Estudio
      </v-btn>
    </v-row>

    <!-- VISTA DESKTOP -->
    <div v-if="isDesktop">
      <v-card class="pa-2 elevation-1">
        <v-data-table
          :headers="headers"
          :items="filteredPlanes"
          item-key="ples_id"
          v-model:page="currentPage"
          :items-per-page="itemsPerPage"
          hide-default-header
          class="elevation-0"
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
              <template v-for="(item, index) in items" :key="item.ples_id">
                <tr :class="{ 'expanded-row': isExpanded(item.ples_id) }">
                  <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                  <td>{{ item.ared_nombre }}</td>
                  <td>{{ item.nive_nombre }}</td>
                  <td>{{ item.grad_nombre }}</td>
                  <td>{{ item.ples_horas }}</td>
                  <td>
                    <v-chip :color="item.ples_estado === 'A' ? 'green' : 'red'" small>
                      {{ item.ples_estado === 'A' ? 'Activo' : 'Inactivo' }}
                    </v-chip>
                  </td>
                  <td class="d-flex align-center">
                    <v-btn icon variant="text" color="primary" @click.stop="abrirDialogoEditarPlan(item)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon variant="text" color="primary" @click.stop="toggleExpand(item.ples_id)">
                      <v-icon>
                        {{ isExpanded(item.ples_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                      </v-icon>
                    </v-btn>
                  </td>
                </tr>

                <tr v-if="isExpanded(item.ples_id)">
                  <td :colspan="7" class="pa-4" style="background: #fafafa;">
                    <!-- Planes curriculares -->
                    <div class="d-flex justify-space-between align-center mb-2">
                      <div class="font-weight-bold">Planes Curriculares</div>
                      <v-btn small color="primary" variant="text" @click.stop="abrirDialogoAgregarCurricular(item)">
                        +Agregar
                      </v-btn>
                    </div>

                    <div v-if="planCurriculares[item.ples_id]?.length">
                      <v-simple-table dense>
                        <thead>
                          <tr>
                            <th>N°</th>
                            <th>Periodo</th>
                            <th>Curso</th>
                            <th>Docente</th>
                            <th>Horas</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          <template
                            v-for="(curr, idx) in planCurriculares[item.ples_id]"
                            :key="curr.pacu_id"
                          >
                            <tr :class="{ 'expanded-row': isExpandedCompetencias(curr.pacu_id) }">
                              <td>{{ idx + 1 }}</td>
                              <td>{{ curr.peed_nombre }}</td>
                              <td>{{ curr.aede_nombre }}</td>
                              <td>{{ curr.docente }}</td>
                              <td>{{ curr.pacu_horas }}</td>
                              <td>
                                <v-chip :color="curr.pacu_estado === 'A' ? 'green' : 'red'" small>
                                  {{ curr.pacu_estado === 'A' ? 'Activo' : 'Inactivo' }}
                                </v-chip>
                              </td>
                              <td class="d-flex align-center">
                                <v-btn
                                  icon
                                  variant="text"
                                  @click.stop="abrirDialogoEditarCurricular(curr, item.ples_id)"
                                >
                                  <v-icon>mdi-pencil</v-icon>
                                </v-btn>
                                <v-btn
                                  icon
                                  variant="text"
                                  @click.stop="toggleExpandCompetencias(curr.pacu_id)"
                                >
                                  <v-icon>
                                    {{ isExpandedCompetencias(curr.pacu_id)
                                      ? 'mdi-chevron-up'
                                      : 'mdi-chevron-down' }}
                                  </v-icon>
                                </v-btn>
                              </td>
                            </tr>

                            <!-- Competencias -->
                            <tr v-if="isExpandedCompetencias(curr.pacu_id)">
                              <td colspan="7" class="pa-4" style="background: #fffde7;">
                                <!-- Encabezado de Competencias -->
                                <div class="d-flex justify-space-between align-center mb-2">
                                  <div class="font-weight-bold">Competencias</div>
                                  <v-btn
                                    small
                                    variant="text"
                                    color="primary"
                                    @click.stop="abrirDialogoAgregarCompetencia(curr, item)"
                                  >
                                    +Agregar
                                  </v-btn>
                                </div>

                                <!-- Si hay competencias, muestro la tabla -->
                                <div v-if="planCurricularCompetencias[curr.pacu_id]?.length">
                                  <v-simple-table dense>
                                    <thead>
                                      <tr>
                                        <th>N°</th>
                                        <th>Nombre</th>
                                        <th>Orden</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <template
                                        v-for="(comp, cIdx) in planCurricularCompetencias[curr.pacu_id]"
                                        :key="comp.pcco_id"
                                      >
                                        <tr>
                                          <td>{{ cIdx + 1 }}</td>
                                          <td>{{ comp.comp_nombre }}</td>
                                          <td>{{ comp.pcco_orden }}</td>
                                          <td>
                                            <v-chip :color="comp.pcco_estado === 'A' ? 'green' : 'red'" small>
                                              {{ comp.pcco_estado === 'A' ? 'Activo' : 'Inactivo' }}
                                            </v-chip>
                                          </td>
                                          <td class="d-flex align-center">
                                            <v-btn
                                              icon
                                              variant="text"
                                              @click.stop="abrirDialogoEditarCompetencia(comp, curr.pacu_id)"
                                            >
                                              <v-icon>mdi-pencil</v-icon>
                                            </v-btn>
                                            <v-btn
                                              icon
                                              variant="text"
                                              @click.stop="toggleExpandActividades(comp.pcco_id)"
                                            >
                                              <v-icon>
                                                {{ isExpandedActividades(comp.pcco_id)
                                                  ? 'mdi-chevron-up'
                                                  : 'mdi-chevron-down' }}
                                              </v-icon>
                                            </v-btn>
                                          </td>
                                        </tr>
                                      </template>
                                    </tbody>
                                  </v-simple-table>
                                </div>
                                <!-- Si no hay competencias, muestro mensaje -->
                                <div v-else class="text-center py-4">
                                  <em>No hay competencias registradas.</em>
                                </div>
                              </td>
                            </tr>
                          </template>
                        </tbody>
                      </v-simple-table>
                    </div>
                    <div v-else>No hay planes curriculares registrados.</div>
                  </td>
                </tr>
              </template>
            </tbody>
          </template>
        </v-data-table>
      </v-card>
    </div>
                
    <!-- VISTA MOBILE -->
    <div v-else>
      <v-row dense>
        <v-col cols="12" v-for="plan in filteredPlanesPaginados" :key="plan.ples_id">
          <v-card class="mb-4 shadow-mobile">
            <v-card-title class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h6 font-weight-bold text-primary">{{ plan.ared_nombre }}</div>
                <div class="text-subtitle-2">{{ plan.nive_nombre }} | {{ plan.grad_nombre }}</div>
              </div>
              <div>
                <v-btn icon variant="text" color="primary" @click.stop="abrirDialogoEditarPlan(plan)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon variant="text" color="primary" @click.stop="toggleExpand(plan.ples_id)">
                  <v-icon>{{ isExpanded(plan.ples_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-btn>
              </div>
            </v-card-title>

            <v-card-subtitle class="pb-0">
              Horas: {{ plan.ples_horas }}
            </v-card-subtitle>

            <v-card-text>
              <v-chip :color="plan.ples_estado === 'A' ? 'green' : 'red'" small>
                {{ plan.ples_estado === 'A' ? 'Activo' : 'Inactivo' }}
              </v-chip>

              <!-- EXPANSIÓN Mobile -->
              <v-expand-transition>
                <div v-if="isExpanded(plan.ples_id)" class="mt-2">
                  <v-divider class="my-2" />

                  <!-- PLANES CURRICULARES -->
                  <div class="d-flex justify-space-between align-center mb-2">
                    <strong>Planes Curriculares</strong>
                    <v-btn small variant="text" color="primary"
                          @click.stop="abrirDialogoAgregarCurricular(plan)">
                      +Agregar
                    </v-btn>
                  </div>

                  <!-- LISTADO CURRICULARES -->
                  <v-list dense>
                  <template
                    v-for="curr in (planCurriculares[plan.ples_id] || [])
                                      .filter(c => c && c.pacu_id)"
                    :key="curr.pacu_id"
                  >
                    <!-- 1 ▸ Ítem principal ------------------------------------ -->
                    <!-- Ítem principal en la lista móvil -->
                    <!-- ÍTEM PLAN CURRICULAR – versión móvil -->
                    <v-list-item class="pl-0 plan-item--mobile pa-0">
                      <div class="plan-curricular-card pa-2">

                        <!-- F I L A   1 :  iconos -->
                        <div class="iconos-mobile mb-1">
                          <v-btn
                            icon variant="text" class="mr-1"
                            @click.stop="abrirDialogoEditarCurricular(curr, plan.ples_id)"
                          >
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>

                          <v-btn
                            icon variant="text"
                            @click.stop="toggleExpandCompetencias(curr.pacu_id)"
                          >
                            <v-icon>
                              {{ isExpandedCompetencias(curr.pacu_id) ? 'mdi-chevron-up'
                                                                      : 'mdi-chevron-down' }}
                            </v-icon>
                          </v-btn>
                        </div>

                        <!-- F I L A S   2 + :  datos -->
                        <div class="text-body-2 font-weight-medium">
                          {{ curr.peed_nombre }} — {{ curr.aede_nombre }}
                        </div>
                        <div class="text-caption">{{ curr.docente }}</div>
                        <div class="text-caption">
                          Horas: {{ curr.pacu_horas }}
                          <v-chip x-small :color="curr.pacu_estado==='A' ? 'green' : 'red'">
                            {{ curr.pacu_estado==='A' ? 'Activo' : 'Inactivo' }}
                          </v-chip>
                        </div>

                      </div>
                    </v-list-item>

                    <!-- COMPETENCIAS -->
                    <v-expand-transition>
                      <div
                        v-if="isExpandedCompetencias(curr.pacu_id)"
                        class="competencia-section pa-3"
                      >
                        <div class="d-flex justify-space-between mb-2">
                          <strong>Competencias</strong>
                          <v-btn small variant="text" color="primary"
                                @click="abrirDialogoAgregarCompetencia(curr, plan)">
                            +Agregar
                          </v-btn>
                        </div>

                        <div
                          v-for="comp in planCurricularCompetencias[curr.pacu_id]"
                          :key="comp.pcco_id"
                          class="mb-2 pa-2"
                          style="border:1px solid #e0e0e0;border-radius:4px;"
                        >
                          <!-- Fila 1: iconos -->
                          <div class="iconos-mobile mb-1">
                            <v-btn icon variant="text" @click.stop="abrirDialogoEditarCompetencia(comp, curr.pacu_id)">
                              <v-icon>mdi-pencil</v-icon>
                            </v-btn>
                            <v-btn icon variant="text"
                                  @click.stop="toggleExpandActividades(comp.pcco_id)">
                              <v-icon>
                                {{ isExpandedActividades(comp.pcco_id)
                                    ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                              </v-icon>
                            </v-btn>
                          </div>

                          <!-- Fila 2–4 -->
                          <div class="text-body-2 font-weight-medium">{{ comp.comp_nombre }}</div>
                          <div class="text-caption">Orden: {{ comp.pcco_orden }}</div>
                          <div class="text-caption">
                            <v-chip x-small :color="comp.pcco_estado==='A'?'green':'red'">
                              {{ comp.pcco_estado==='A'?'Activo':'Inactivo' }}
                            </v-chip>
                          </div>

                          <!-- ACTIVIDADES -->
                          <v-expand-transition>
                            <div
                              v-if="isExpandedActividades(comp.pcco_id)"
                              class="actividades-section mt-2"
                            >
                              <div class="d-flex justify-space-between mb-1">
                                <strong>Actividades</strong>
                                <v-btn small variant="text" color="primary"
                                      @click="abrirDialogoAgregarActividad(comp.pcco_id)">
                                  +Agregar
                                </v-btn>
                              </div>
                              <div v-if="planCompetenciaActividades[comp.pcco_id]?.length">
                                <div
                                  v-for="act in planCompetenciaActividades[comp.pcco_id]"
                                  :key="act.pcca_id"
                                  class="actividad-mobile-card pa-2 mb-1"
                                >
                                  <div class="iconos-mobile mb-1">
                                    <v-btn icon variant="text" @click.stop="abrirDialogoEditarActividad(act)">
                                      <v-icon>mdi-pencil</v-icon>
                                    </v-btn>
                                  </div>
                                  <div class="text-body-2">{{ act.acti_nombre }}</div>
                                  <div class="text-caption">Orden: {{ act.pcca_orden }}</div>
                                  <div class="text-caption">
                                    <v-chip x-small :color="act.pcca_estado==='A'?'green':'red'">
                                      {{ act.pcca_estado==='A'?'Activo':'Inactivo' }}
                                    </v-chip>
                                  </div>
                                </div>
                              </div>
                              <em v-else>No hay actividades registradas.</em>

                              <!-- CAPACIDADES -->
                              <div class="capacidades-section mt-3">
                                <div class="d-flex justify-space-between mb-1">
                                  <strong>Capacidades</strong>
                                  <v-btn small variant="text" color="primary"
                                        @click="abrirDialogoAgregarCapacidad(comp.pcco_id)">
                                    +Agregar
                                  </v-btn>
                                </div>
                                <div v-if="planCompetenciaCapacidades[comp.pcco_id]?.length">
                                  <div
                                    v-for="cap in planCompetenciaCapacidades[comp.pcco_id]"
                                    :key="cap.pccc_id"
                                    class="capacidad-mobile-card pa-2 mb-1"
                                  >
                                    <div class="iconos-mobile mb-1">
                                      <v-btn icon variant="text" @click.stop="abrirDialogoEditarCapacidad(cap)">
                                        <v-icon>mdi-pencil</v-icon>
                                      </v-btn>
                                    </div>
                                    <div class="text-body-2">{{ cap.capa_nombre }}</div>
                                    <div class="text-caption">Orden: {{ cap.pccc_orden }}</div>
                                    <div class="text-caption">
                                      <v-chip x-small :color="cap.pccc_estado==='A'?'green':'red'">
                                        {{ cap.pccc_estado==='A'?'Activo':'Inactivo' }}
                                      </v-chip>
                                    </div>
                                  </div>
                                </div>
                                <em v-else>No hay capacidades registradas.</em>
                              </div>
                            </div>
                          </v-expand-transition>
                        </div>

                        <em v-if="!(planCurricularCompetencias[curr.pacu_id]?.length)">
                          No hay competencias registradas.
                        </em>
                      </div>
                    </v-expand-transition>

                  </template>
                  </v-list>
                  <em v-if="!(planCurriculares[plan.ples_id]?.length)">
                    No hay planes curriculares registrados.
                  </em>
                </div>
                
              </v-expand-transition>
            </v-card-text>

          </v-card>
        </v-col>
      </v-row>

      <!-- Paginación Mobile -->
      <v-pagination
        v-if="totalPaginas > 1"
        v-model="currentPage"
        :length="totalPaginas"
        class="mt-4"
        density="comfortable"
      />
    </div>

    <SnackbarMessage
      v-model="snackbar"
      :message="snackbarMessage"
      :color="snackbarColor"
    />

    <DialogAgregarPlanEstudio
      v-model="mostrarDialogoAgregarPlanEstudio"
      :area-options="areaOptions"
      :nivel-options="nivelOptions"
      :grado-options="gradoOptions"
      :loading="isSavingPlanEstudio"
      @guardar="guardarNuevoPlanEstudio"
    />

    <DialogEditarPlanEstudio
      v-model="mostrarDialogoEditarPlanEstudio"
      :horas="planHoras"
      :estado="planEstado"
      @update:horas="planHoras = $event"
      @update:estado="planEstado = $event"
      :loading="isSavingPlanEstudio"
      @guardar="guardarPlanEstudio"
    />

    <DialogAgregarPlanCurricular
      v-model="mostrarDialogoAgregarCurricular"
      :periodos-options="periodosOptions"
      :cursos-options="cursosOptions"
      :loading="isSavingPlanCurricular"
      @guardar="guardarNuevoPlanCurricular"
    />

    <DialogEditarPlanCurricular
      v-model="mostrarDialogoEditarPlanCurricular"
      :horas="planCurricularHoras"
      :estado="planCurricularEstado"
      :loading="isSavingPlanCurricular"
      @guardar="guardarPlanCurricular"
    />

    <DialogAgregarCompetencia
      :key="`dlg-comp-${newCompetencia.pacu_id}-${Date.now()}`"
      v-model="mostrarDialogoAgregarCompetencia"
      :competencias="competenciasOptions"
      v-model:pacu_id="newCompetencia.pacu_id"
      v-model:comp_id="newCompetencia.comp_id"
      v-model:pcco_orden="newCompetencia.pcco_orden"
      :loading="isSavingCompetencia"
      @guardar="guardarNuevaCompetencia"
    />

    <DialogEditarCompetencia
      v-model="mostrarDialogoEditarCompetencia"
      :competencia="competenciaSeleccionada"
      :loading="isSavingCompetencia"
      @guardar="guardarCompetenciaActualizada"
    />

    <DialogAgregarActividad
      v-model="mostrarDialogoAgregarActividad"
      :actividades="actividadesDisponibles"
      :loading="isSavingActividad"
      @guardar="guardarNuevaActividad"
    />

    <DialogEditarActividad
      v-model="mostrarDialogoEditarActividad"
      :actividad="actividadSeleccionada"
      :loading="isSavingActividad"
      @guardar="guardarActividadEditada"
    />

    <DialogAgregarCapacidad
      v-model="mostrarDialogoAgregarCapacidad"
      :capacidades="capacidadesDisponibles"
      :loading="isSavingCapacidad"
      @guardar="guardarNuevaCapacidad"
    />

    <DialogEditarCapacidad
      v-model="mostrarDialogoEditarCapacidad"
      :capacidad="capacidadSeleccionada"
      :loading="isSavingCapacidad"
      @guardar="guardarCapacidadEditada"
    />

  </v-container>
</template>


<script setup>
import { ref, computed, onMounted, watch, reactive  } from 'vue'
import { useDisplay } from 'vuetify'
import axios from 'axios'

// COMPONENTES
import SnackbarMessage from '@/components/ui/SnackbarMessage.vue'
import DialogAgregarPlanEstudio from '@/components/Mantenimiento/PlanEstudios/DialogAgregarPlanEstudio.vue'
import DialogEditarPlanEstudio from '@/components/Mantenimiento/PlanEstudios/DialogEditarPlanEstudio.vue'
import DialogAgregarPlanCurricular from '@/components/Mantenimiento/PlanEstudios/DialogAgregarPlanCurricular.vue'
import DialogEditarPlanCurricular from '@/components/Mantenimiento/PlanEstudios/DialogEditarPlanCurricular.vue'

import DialogAgregarCompetencia from '@/components/Mantenimiento/PlanEstudios/DialogAgregarCompetencia.vue'
import DialogEditarCompetencia  from '@/components/Mantenimiento/PlanEstudios/DialogEditarCompetencia.vue'
import DialogAgregarActividad   from '@/components/Mantenimiento/PlanEstudios/DialogAgregarActividad.vue'
import DialogEditarActividad    from '@/components/Mantenimiento/PlanEstudios/DialogEditarActividad.vue'
import DialogAgregarCapacidad   from '@/components/Mantenimiento/PlanEstudios/DialogAgregarCapacidad.vue'
import DialogEditarCapacidad    from '@/components/Mantenimiento/PlanEstudios/DialogEditarCapacidad.vue'

const isSavingPlanEstudio = ref(false)
const isSavingPlanCurricular = ref(false)
const isSavingCompetencia = ref(false)
const isSavingActividad   = ref(false)
const isSavingCapacidad   = ref(false)

const newCompetencia = reactive({
   pacu_id: null,
   comp_id: null,
   pcco_orden: null
})



/* -------------------------------------------
   GUARDAR – Nueva competencia en un Plan Curricular
------------------------------------------- */
async function guardarNuevaCompetencia ({ comp_id, pcco_orden, estado }) {
  isSavingCompetencia.value = true
  try {
    // Asegúrate de tener el plan curricular padre
    if (!planCurricularPadre.value) return

    const payload = {
      ai_pacu_id    : planCurricularPadre.value.pacu_id,      // plan curricular
      ai_comp_id    : comp_id,                                // competencia elegida
      adc_pcco_orden : pcco_orden,                             // orden
      ac_pcco_estado: estado === 'Activo' ? 'A' : 'I',
      av_profile    : profile
    }

    const { data } = await axiosInstance.post(
      'wsRegistraPlanCurricularCompetencia.php',
      payload
    )

    if (data.status) {
      snackbarMessage.value = 'Competencia añadida correctamente.'
      snackbarColor.value   = 'success'
      snackbar.value        = true

      // recarga la tabla de competencias del plan curricular
      await obtenerCompetencias(planCurricularPadre.value.pacu_id)

      mostrarDialogoAgregarCompetencia.value = false
    } else {
      throw new Error(data.message || 'No se pudo registrar la competencia')
    }
  } catch (err) {
    console.error(err)
    snackbarMessage.value = err.message
    snackbarColor.value   = 'error'
    snackbar.value        = true
  } finally {
    isSavingCompetencia.value = false
  }
}


/* -------------------------------------------
   GUARDAR – Actualizar una competencia
------------------------------------------- */
async function guardarCompetenciaActualizada (datos) {
  isSavingCompetencia.value = true
  try {
    if (!competenciaSeleccionada.value) return

    const estado = datos.estado === 'Activo' ? 'A' : 'I'

    const payload = {
      ai_pcco_id   : competenciaSeleccionada.value.pcco_id,
      adc_pcco_orden: datos.pcco_orden,
      ac_pcco_estado: estado,
      av_profile   : profile
    }

    const { data } = await axiosInstance.post(
      'wsActualizaPlanCurricularCompetencia.php',
      payload
    )

    if (data.status) {
      snackbarMessage.value = 'Competencia actualizada exitosamente.'
      snackbarColor.value   = 'success'
      snackbar.value        = true

      /* recargamos la lista de competencias del plan curricular padre */
      await obtenerCompetencias(planCurricularPadre.value.pacu_id)

      /* cerramos el diálogo y limpiamos selección */
      mostrarDialogoEditarCompetencia.value = false
      competenciaSeleccionada.value = null
    } else {
      throw new Error(data.message || 'Error en la actualización')
    }
  } catch (err) {
    console.error(err)
    snackbarMessage.value = err.message || 'Error al actualizar la competencia.'
    snackbarColor.value   = 'error'
    snackbar.value        = true
  } finally {
    isSavingCompetencia.value = false
  }
}

/* NUEVO: acepta área y nivel */
async function cargarCompetenciasDisponibles (pacuId, aredId, niveId) {
  try {
    const { data } = await axiosInstance.get(
      'wsListaCompetenciasDisponiblesPlanCurricular.php',
      {
        params: {
          ai_pacu_id: pacuId,   // plan curricular
          ai_ared_id: aredId,   // área educativa
          ac_nive_id: niveId,   // nivel
          av_profile: profile
        }
      }
    )

    competenciasOptions.value = data.status
      ? data.data.map(c => ({ key: c.comp_id, title: c.comp_nombre }))
      : []
  } catch (e) {
    console.error('Error al cargar competencias disponibles:', e)
    competenciasOptions.value = []
  }
}

/* ============================================================
   ACTIVIDADES
============================================================ */

/* Guardar NUEVA actividad */
async function guardarNuevaActividad ({ acti_id, pcca_orden, estado }) {   // 👈 NUEVO
  isSavingActividad.value = true
  try {
    const payload = {
      ai_pcco_id    : actividadSeleccionada.value.pcco_id,
      ai_acti_id    : acti_id,
      adc_pcca_orden: pcca_orden,
      ac_pcca_estado: estado === 'Activo' ? 'A' : 'I',
      av_profile    : profile
    }
    const { data } = await axiosInstance.post('wsRegistraPCCompetenciaActividad.php', payload)
    if (data.status) {
      snackbarMessage.value = 'Actividad añadida correctamente.'
      snackbarColor.value   = 'success'
      snackbar.value        = true
      await obtenerActividadesPorCompetencia(payload.ai_pcco_id)  // refresca
      mostrarDialogoAgregarActividad.value = false
    } else throw new Error(data.message)
  } catch (e) {
    snackbarMessage.value = e.message || 'Error al registrar la actividad'
    snackbarColor.value   = 'error'
    snackbar.value        = true
  } finally {
    isSavingActividad.value = false
  }
}

/* Guardar EDICIÓN de actividad */
async function guardarActividadEditada ({ pcca_orden, estado }) {         // 👈 NUEVO
  isSavingActividad.value = true
  try {
    const payload = {
      ai_pcca_id    : actividadSeleccionada.value.pcca_id,
      adc_pcca_orden: pcca_orden,
      ac_pcca_estado: estado === 'Activo' ? 'A' : 'I',
      av_profile    : profile
    }
    const { data } = await axiosInstance.post('wsActualizaPCCompetenciaActividad.php', payload)
    if (data.status) {
      snackbarMessage.value = 'Actividad actualizada.'
      snackbarColor.value   = 'success'
      snackbar.value        = true
      await obtenerActividadesPorCompetencia(actividadSeleccionada.value.pcco_id)
      mostrarDialogoEditarActividad.value = false
      actividadSeleccionada.value = null
    } else throw new Error(data.message)
  } catch (e) {
    snackbarMessage.value = e.message || 'Error al actualizar la actividad'
    snackbarColor.value   = 'error'
    snackbar.value        = true
  } finally {
    isSavingActividad.value = false
  }
}

/* ============================================================
   CAPACIDADES
============================================================ */

/* Guardar NUEVA capacidad */
async function guardarNuevaCapacidad ({ capa_id, pccc_orden, estado }) {   // 👈 NUEVO
  isSavingCapacidad.value = true
  try {
    const payload = {
      ai_pcco_id    : capacidadSeleccionada.value.pcco_id,
      ai_capa_id    : capa_id,
      adc_pccc_orden: pccc_orden,
      ac_pccc_estado: estado === 'Activo' ? 'A' : 'I',
      av_profile    : profile
    }
    const { data } = await axiosInstance.post('wsRegistraPCCompetenciaCapacidad.php', payload)
    if (data.status) {
      snackbarMessage.value = 'Capacidad añadida correctamente.'
      snackbarColor.value   = 'success'
      snackbar.value        = true
      await obtenerCapacidadesPorCompetencia(payload.ai_pcco_id)
      mostrarDialogoAgregarCapacidad.value = false
    } else throw new Error(data.message)
  } catch (e) {
    snackbarMessage.value = e.message || 'Error al registrar la capacidad'
    snackbarColor.value   = 'error'
    snackbar.value        = true
  } finally {
    isSavingCapacidad.value = false
  }
}

/* Guardar EDICIÓN de capacidad */
async function guardarCapacidadEditada ({ pccc_orden, estado }) {         // 👈 NUEVO
  isSavingCapacidad.value = true
  try {
    const payload = {
      ai_pccc_id    : capacidadSeleccionada.value.pccc_id,
      adc_pccc_orden: pccc_orden,
      ac_pccc_estado: estado === 'Activo' ? 'A' : 'I',
      av_profile    : profile
    }
    const { data } = await axiosInstance.post('wsActualizaPCCompetenciaCapacidad.php', payload)
    if (data.status) {
      snackbarMessage.value = 'Capacidad actualizada.'
      snackbarColor.value   = 'success'
      snackbar.value        = true
      await obtenerCapacidadesPorCompetencia(capacidadSeleccionada.value.pcco_id)
      mostrarDialogoEditarCapacidad.value = false
      capacidadSeleccionada.value = null
    } else throw new Error(data.message)
  } catch (e) {
    snackbarMessage.value = e.message || 'Error al actualizar la capacidad'
    snackbarColor.value   = 'error'
    snackbar.value        = true
  } finally {
    isSavingCapacidad.value = false
  }
}


/* ========== ACTIVIDADES DISPONIBLES ========== */            // 👈 NUEVO
async function cargarActividadesDisponibles (pccoId) {
  try {
    const { data } = await axiosInstance.get(
      'wsListaActividadesDisponiblesCompetencias.php',
      { params: { ai_pcco_id: pccoId, av_profile: profile } }
    )
    actividadesDisponibles.value = data.status
      ? data.data.map(a => ({ key: a.acti_id, title: a.acti_nombre }))
      : []
  } catch (e) {
    console.error('Error al cargar actividades disponibles:', e)
    actividadesDisponibles.value = []
  }
}

/* ========== CAPACIDADES DISPONIBLES ========== */            // 👈 NUEVO
async function cargarCapacidadesDisponibles (pccoId) {
  try {
    const { data } = await axiosInstance.get(
      'wsListaCapacidadesDisponiblesCompetencias.php',
      { params: { ai_pcco_id: pccoId, av_profile: profile } }
    )
    capacidadesDisponibles.value = data.status
      ? data.data.map(c => ({ key: c.capa_id, title: c.capa_nombre }))
      : []
  } catch (e) {
    console.error('Error al cargar capacidades disponibles:', e)
    capacidadesDisponibles.value = []
  }
}


const mostrarDialogoAgregarCompetencia  = ref(false)
const mostrarDialogoEditarCompetencia   = ref(false)
const competenciaSeleccionada           = ref(null)

const mostrarDialogoAgregarActividad     = ref(false)  
const mostrarDialogoEditarActividad      = ref(false)  
const mostrarDialogoAgregarCapacidad     = ref(false)  
const mostrarDialogoEditarCapacidad      = ref(false)

/* ---------- ACTIVIDADES & CAPACIDADES ---------- */          
const actividadesDisponibles  = ref([])   // prop p/DialogAgregarActividad
const capacidadesDisponibles  = ref([])   // prop p/DialogAgregarCapacidad
const actividadSeleccionada   = ref(null) // para editar
const capacidadSeleccionada   = ref(null) // para editar

/* abrir diálogo para editar una competencia */
function abrirDialogoEditarCompetencia (comp, pacuId) {
  competenciaSeleccionada.value = { ...comp }
  /* ① guarda la referencia del plan curricular al que pertenece */
  planCurricularPadre.value = { pacu_id: pacuId }

  mostrarDialogoEditarCompetencia.value = true
}


/* -------------- ACTIVIDADES -------------- */                // 👈 NUEVO
async function abrirDialogoAgregarActividad (pccoId) {
  // 1. Guarda la competencia padre
  actividadSeleccionada.value = { pcco_id: pccoId }
  // 2. Carga las actividades aún no vinculadas
  await cargarActividadesDisponibles(pccoId)
  // 3. Abre el diálogo
  mostrarDialogoAgregarActividad.value = true
}

function abrirDialogoEditarActividad (actividad) {             // (ya existía)
  actividadSeleccionada.value = { ...actividad }
  mostrarDialogoEditarActividad.value = true
}

/* -------------- CAPACIDADES -------------- */                // 👈 NUEVO
async function abrirDialogoAgregarCapacidad (pccoId) {
  capacidadSeleccionada.value = { pcco_id: pccoId }
  await cargarCapacidadesDisponibles(pccoId)
  mostrarDialogoAgregarCapacidad.value = true
}

function abrirDialogoEditarCapacidad (capacidad) {             // (ya existía)
  capacidadSeleccionada.value = { ...capacidad }
  mostrarDialogoEditarCapacidad.value = true
}


/* === NUEVO === */
const competenciasOptions              = ref([])  //  si no lo tienes aún
const planCurricularPadre              = ref(null) //  para saber a qué pacu pertenece


async function abrirDialogoAgregarCompetencia(planCurricular, planEstudio) {
   newCompetencia.pacu_id    = planCurricular.pacu_id
   newCompetencia.comp_id = null
   newCompetencia.pcco_orden = null

  // 1.  Guarda el plan curricular al que se van a añadir competencias
  planCurricularPadre.value = planCurricular

  await cargarCompetenciasDisponibles(
    planCurricular.pacu_id,
    planEstudio.ared_id,       // área educativa
    planEstudio.nive_id        // nivel
  )

  // 3.  Muestra el diálogo
  mostrarDialogoAgregarCompetencia.value = true
}


/** CONFIGURACIONES */
const expandedItems = ref([])
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

/** DATOS PRINCIPALES */
const planesEstudio = ref([])
const planCurriculares = ref({})
// STEP 1 – Competencias, actividades y capacidades
const planCurricularCompetencias   = ref({}) // pacu_id => array de competencias
const planCompetenciaActividades   = ref({}) // pcco_id => array de actividades
const planCompetenciaCapacidades   = ref({}) // pcco_id => array de capacidades

const expandedCompetencias   = ref([])   // pacu_id que están abiertos
const expandedActividadId    = ref(null) // pcco_id de actividades/capacidades abiertos

const areaOptions = ref([{ title: 'Todos', key: 'TODOS' }])
const nivelOptions = ref([{ title: 'Todos', key: 'TODOS' }])
const gradosList = ref([])

const selectedArea = ref('TODOS')
const selectedNivel = ref('TODOS')
const selectedGrado = ref('TODOS')

/** PAGINACIÓN */
const currentPage = ref(1)
const itemsPerPage = 10

/** EXPANSIÓN */
function toggleExpand(id) {
  const index = expandedItems.value.indexOf(id)
  if (index === -1) {
    expandedItems.value = [...expandedItems.value, id]
    if (!planCurriculares.value[id] || planCurriculares.value[id].length === 0) {
      obtenerCurriculares(id)
    }
  } else {
    expandedItems.value = expandedItems.value.filter(x => x !== id)
  }
}


function isExpanded(plesId) {
  return expandedItems.value.includes(plesId)
}

/** DIÁLOGOS */
const mostrarDialogoAgregarPlanEstudio = ref(false)
const mostrarDialogoEditarPlanEstudio = ref(false)
const mostrarDialogoAgregarCurricular = ref(false)
const mostrarDialogoEditarPlanCurricular = ref(false)

/** MODELOS PARA EDITAR */
const plesIdSeleccionado = ref(null); // <- NUEVO
const planSeleccionado = ref(null)
const planHoras = ref(null)
const planEstado = ref('')

const planCurricularSeleccionado = ref(null)
const planCurricularHoras = ref(null)
const planCurricularEstado = ref('')

const periodosOptions = ref([]);
const cursosOptions = ref([]);

/** CABECERAS DE TABLA */
const headers = [
  { title: 'N°', value: 'index', sortable: false },
  { title: 'Área Educativa', value: 'ared_nombre' },
  { title: 'Nivel', value: 'nive_nombre' },
  { title: 'Grado', value: 'grad_nombre' },
  { title: 'Horas', value: 'ples_horas' },
  { title: 'Estado', value: 'estado', sortable: false },
  { title: 'Acciones', value: 'acciones', sortable: false }
]

/** FILTROS */
const filteredPlanes = computed(() => {
  return planesEstudio.value.filter(plan => {
    const filtroArea = selectedArea.value === 'TODOS' || plan.ared_id === selectedArea.value
    const filtroNivel = selectedNivel.value === 'TODOS' || plan.nive_id === selectedNivel.value
    const filtroGrado = selectedGrado.value === 'TODOS' || plan.grad_id === selectedGrado.value
    return filtroArea && filtroNivel && filtroGrado
  })
})

const gradoOptions = computed(() => {
  const base = gradosList.value.map(g => ({
    title: g.grad_nombre,
    key: g.grad_id,
    nive_id: g.nive_id
  }))
  if (!selectedNivel.value || selectedNivel.value === 'TODOS') {
    return [{ title: 'Todos', key: 'TODOS' }, ...base]
  }
  return [{ title: 'Todos', key: 'TODOS' }, ...base.filter(g => g.nive_id === selectedNivel.value)]
})

const filteredPlanesPaginados = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredPlanes.value.slice(start, end)
})

const totalPaginas = computed(() => Math.ceil(filteredPlanes.value.length / itemsPerPage))



/** LLAMADAS API */
async function obtenerPlanes() {
  try {
    const { data } = await axiosInstance.get(`wsConsultaPlanEstudios.php?ac_anio_escolar=${anioEscolar}&av_profile=${profile}`)
    planesEstudio.value = Array.isArray(data.data) ? data.data : []
  } catch (error) {
    console.error('Error al obtener planes:', error)
  }
}

async function obtenerCurriculares(ples_id) {
  try {
    const { data } = await axiosInstance.get(
      `wsConsultaPlanCurricular.php?ai_ples_id=${ples_id}&av_profile=${profile}`
    )

    // ✅  Filtramos nulos o sin pacu_id
    const rows = (data.status && Array.isArray(data.data))
      ? data.data.filter(r => r && r.pacu_id)
      : []

    // guardamos de forma reactiva
    planCurriculares.value = {
      ...planCurriculares.value,
      [ples_id]: rows
    }

    // nos aseguramos de crear la llave en planCurricularCompetencias
    rows.forEach(r => {
      if (!planCurricularCompetencias.value[r.pacu_id]) {
        planCurricularCompetencias.value[r.pacu_id] = []
      }
    })
  } catch (err) {
    console.error('Error al obtener curriculares:', err)
    planCurriculares.value[ples_id] = []
  }
}

// STEP 3 – Helpers de expansión
function toggleExpandCompetencias(pacuId) {
  if (!pacuId) return

  const idx = expandedCompetencias.value.indexOf(pacuId)
  if (idx === -1) {
    expandedCompetencias.value.push(pacuId)

    // ─── CORRECCIÓN ───
    const lista = planCurricularCompetencias.value[pacuId]
    if (!lista || lista.length === 0) {
      obtenerCompetencias(pacuId)
    }
  } else {
    expandedCompetencias.value.splice(idx, 1)
  }
}

const isExpandedCompetencias = pacuId => expandedCompetencias.value.includes(pacuId)

function toggleExpandActividades(pccoId) {
  expandedActividadId.value = expandedActividadId.value === pccoId ? null : pccoId
  if (expandedActividadId.value) {
    obtenerActividadesPorCompetencia(pccoId)
    obtenerCapacidadesPorCompetencia(pccoId)
  }
}
const isExpandedActividades = pccoId => expandedActividadId.value === pccoId


async function obtenerAreasNivelesGrados() {
  try {
    const { data } = await axiosInstance.get(`wsListaNivelGradoAlumno.php?av_profile=${profile}`)
    if (data.status) {
      nivelOptions.value = [{ title: 'Todos', key: 'TODOS' }].concat(
        data.data.niveles.map(n => ({ title: n.nive_nombre, key: n.nive_id }))
      )
      gradosList.value = data.data.grados
    }

    const areasResponse = await axiosInstance.get(`wsListaAreaEducativa.php?ac_indicador_todos=N&av_profile=${profile}`)
    if (areasResponse.data.status) {
      areaOptions.value = [{ title: 'Todos', key: 'TODOS' }].concat(
        areasResponse.data.data.map(a => ({ title: a.ared_nombre, key: a.ared_id }))
      )
    }
  } catch (error) {
    console.error('Error al obtener áreas, niveles o grados:', error)
  }
}

// STEP 4A – Competencias de un Plan Curricular
async function obtenerCompetencias(pacuId) {
  try {
    const { data } = await axiosInstance.get(
      `wsConsultaPlanCurricularCompetencias.php?ai_pacu_id=${pacuId}&ac_pcco_estado=T&av_profile=${profile}`
    )
    planCurricularCompetencias.value[pacuId] =
      data.status && Array.isArray(data.data) ? data.data : []
  } catch (e) {
    console.error('Error competencias:', e)
    planCurricularCompetencias.value[pacuId] = []
  }
}

// STEP 4B – Actividades de una Competencia
async function obtenerActividadesPorCompetencia(pccoId) {
  try {
    const { data } = await axiosInstance.get(
      `wsConsultaPCCompetenciasActividades.php?ai_pcco_id=${pccoId}&ac_pcca_estado=T&av_profile=${profile}`
    )
    planCompetenciaActividades.value[pccoId] =
      data.status ? data.data : []
  } catch (e) {
    console.error('Error actividades:', e)
    planCompetenciaActividades.value[pccoId] = []
  }
}

// STEP 4C – Capacidades de una Competencia
async function obtenerCapacidadesPorCompetencia(pccoId) {
  try {
    const { data } = await axiosInstance.get(
      `wsConsultaPCCompetenciasCapacidades.php?ai_pcco_id=${pccoId}&av_profile=${profile}`
    )
    planCompetenciaCapacidades.value[pccoId] =
      data.status && Array.isArray(data.data) ? data.data : []
  } catch (e) {
    console.error('Error capacidades:', e)
    planCompetenciaCapacidades.value[pccoId] = []
  }
}


/** FUNCIONES PARA ABRIR/MANEJAR DIÁLOGOS */
function abrirDialogoAgregarPlanEstudio() {
  mostrarDialogoAgregarPlanEstudio.value = true
}

function abrirDialogoEditarPlan(plan) {
  planSeleccionado.value = { ...plan }
  planHoras.value = plan.ples_horas
  planEstado.value = plan.ples_estado
  mostrarDialogoEditarPlanEstudio.value = true
}

async function abrirDialogoAgregarCurricular(plan) {
  planSeleccionado.value = plan;
  await cargarPeriodos();
  await cargarCursos();
  mostrarDialogoAgregarCurricular.value = true;
}


function abrirDialogoEditarCurricular(curricular, plesIdPadre) {
  planCurricularSeleccionado.value = curricular;
  planCurricularHoras.value = Number(curricular.pacu_horas);
  planCurricularEstado.value = curricular.pacu_estado === 'A' ? 'Activo' : 'Inactivo';
  plesIdSeleccionado.value = plesIdPadre; 
  mostrarDialogoEditarPlanCurricular.value = true;
}

/** FUNCIONES GUARDAR */
async function guardarNuevoPlanEstudio(plan) {
  isSavingPlanEstudio.value = true
  try {
    const payload = {
      ai_grad_id: plan.grad_id,
      ai_ared_id: plan.ared_id,
      ai_ples_horas: plan.ples_horas, 
      ac_anio_escolar: anioEscolar,
      av_profile: profile
    }
    const { data } = await axiosInstance.post('wsRegistraPlanEstudios.php', payload)

    if (data.status) {
      snackbarMessage.value = 'Plan de estudio registrado exitosamente.'
      snackbarColor.value = 'success'
      snackbar.value = true
      obtenerPlanes()
    } else {
      snackbarMessage.value = data.message || 'Error al registrar plan de estudio.'
      snackbarColor.value = 'error'
      snackbar.value = true
    }
  } catch (error) {
    console.error('Error al guardar plan:', error)
    snackbarMessage.value = 'Error de conexión al registrar el plan de estudio.'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    isSavingPlanEstudio.value = false
  }
}

async function guardarPlanEstudio() {
  isSavingPlanEstudio.value = true
  try {
    if (!planSeleccionado.value) {
      snackbarMessage.value = 'No hay plan seleccionado para actualizar.'
      snackbarColor.value = 'error'
      snackbar.value = true
      return
    }

    const payload = {
      ai_ples_id: planSeleccionado.value.ples_id,
      ai_grad_id: planSeleccionado.value.grad_id,
      ai_ared_id: planSeleccionado.value.ared_id,
      ai_ples_horas: planHoras.value,
      ac_ples_estado: planEstado.value,
      av_profile: profile
    }

    const { data } = await axiosInstance.post('wsActualizaPlanEstudios.php', payload)

    if (data.status) {
      snackbarMessage.value = 'Plan de estudio actualizado exitosamente.'
      snackbarColor.value = 'success'
      snackbar.value = true
      obtenerPlanes()
    } else {
      snackbarMessage.value = data.message || 'Error al actualizar plan de estudio.'
      snackbarColor.value = 'error'
      snackbar.value = true
    }
  } catch (error) {
    console.error('Error al actualizar plan:', error)
    snackbarMessage.value = 'Error de conexión al actualizar el plan de estudio.'
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    isSavingPlanEstudio.value = false
  }
}

async function guardarNuevoPlanCurricular(nuevoCurricular) {
  isSavingPlanCurricular.value = true
  try {
    const payload = {
      ai_ples_id: planSeleccionado.value.ples_id, // ID del plan de estudio expandido
      ai_daed_id: nuevoCurricular.curso_id,        // ID del docente/curso seleccionado
      ai_peed_id: nuevoCurricular.periodo_id,      // ID del período educativo seleccionado
      ai_pacu_horas: nuevoCurricular.horas,        // Número de horas
      av_profile: profile
    };

    const { data } = await axiosInstance.post('wsRegistraPlanCurricular.php', payload);

    if (data.status) {
      snackbarMessage.value = 'Plan curricular registrado exitosamente.';
      snackbarColor.value = 'success';
      snackbar.value = true;
      const plesId = planSeleccionado.value.ples_id;
      //expandedItems.value = expandedItems.value.filter(id => id !== plesId);
      obtenerCurriculares(plesId); // Recargar los curriculares
      mostrarDialogoAgregarCurricular.value = false;
    } else {
      snackbarMessage.value = data.message || 'Error al registrar plan curricular.';
      snackbarColor.value = 'error';
      snackbar.value = true;
    }
  } catch (error) {
    console.error('Error al guardar plan curricular:', error);
    snackbarMessage.value = 'Error de conexión al registrar el plan curricular.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    isSavingPlanCurricular.value = false
  }
}

async function guardarPlanCurricular(nuevoCurricular) {
  isSavingPlanCurricular.value = true
  try {
    if (!planCurricularSeleccionado.value) {
      snackbarMessage.value = 'No hay plan curricular seleccionado para actualizar.';
      snackbarColor.value = 'error';
      snackbar.value = true;
      return;
    }

    const estado = nuevoCurricular.estado === 'Activo' ? 'A' : 'I';

    const payload = {
      ai_pacu_id: planCurricularSeleccionado.value.pacu_id, // ID del plan curricular
      ai_daed_id: planCurricularSeleccionado.value.daed_id,
      ai_pacu_horas: nuevoCurricular.horas,
      ac_pacu_estado: estado,
      av_profile: profile
    };

    const { data } = await axiosInstance.post('wsActualizaPlanCurricular.php', payload);

    if (data.status) {
      snackbarMessage.value = 'Plan curricular actualizado exitosamente.';
      snackbarColor.value = 'success';
      snackbar.value = true;

      mostrarDialogoEditarPlanCurricular.value = false;
      const plesId = plesIdSeleccionado.value; // Lo guardamos
      //expandedItems.value = expandedItems.value.filter(id => id !== plesId);
      await obtenerCurriculares(plesId); // Ahora sí: refrescar con el ples correcto

    } else {
      snackbarMessage.value = data.message || 'Error al actualizar plan curricular.';
      snackbarColor.value = 'error';
      snackbar.value = true;
    }
  } catch (error) {
    console.error('Error al actualizar plan curricular:', error);
    snackbarMessage.value = 'Error de conexión al actualizar el plan curricular.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    isSavingPlanCurricular.value = false
  }
}


async function cargarPeriodos() {
  try {
    const { data } = await axiosInstance.get(`wsListaPeriodoEducativo.php?av_profile=${profile}`);
    if (data.status) {
      periodosOptions.value = data.data.map(p => ({
        title: p.periodo,
        key: p.id
      }));
    }
  } catch (error) {
    console.error('Error al cargar periodos:', error);
    periodosOptions.value = [];
  }
}

async function cargarCursos() {
  try {
    const { data } = await axiosInstance.get(`wsListaDocenteAreaEducativaDetalle.php?ac_anio_escolar=${anioEscolar}&av_profile=${profile}`);
    if (data.status) {
      cursosOptions.value = data.data.map(c => ({
        key: c.daed_id, // Aquí el ID único correcto
        title: `${c.docente} / ${c.area_educativa}` // Aquí el nombre correcto del curso + docente
      }));
    }
  } catch (error) {
    console.error('Error al cargar cursos:', error);
    cursosOptions.value = [];
  }
}


/** SNACKBAR */
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

/** WATCH */
let inicializado = false;
watch(selectedNivel, () => {
  if (!inicializado) {
    inicializado = true;
    return; // Durante la primera carga NO haces nada
  }
  selectedGrado.value = 'TODOS';
});

/** MONTAJE */
onMounted(async () => {
  await obtenerAreasNivelesGrados(); // <-- primero cargas las áreas, niveles y grados
  await obtenerPlanes();             // <-- luego cargas los planes de estudio
})

</script>

<style scoped>
/* General */
.v-card,
.v-list-item {
  text-align: left;
}

/* Hover filas de la tabla */
.v-data-table tbody tr:hover {
  background-color: #f5f5f5;
}

/* Cabecera de la tabla */
.v-data-table:not(.evaluaciones-table) thead th {
  background-color: #E3F2FD;
  color: #1565C0;
  font-weight: bold;
  font-size: 0.9rem;
  padding: 10px;
}

/* Celdas del cuerpo de tabla */
.v-data-table tbody td {
  font-size: 0.85rem;
  padding: 6px 8px;
}

/* Botones de acción pequeños */
.v-btn {
  min-width: 32px;
}

/* Paginación centrada */
.v-pagination {
  justify-content: center;
  margin-top: 16px;
}

/* Sombra ligera en tarjetas mobile */
.shadow-mobile {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

/* Ajustes Mobile/Tablet */
@media (max-width: 960px) {
  .v-card {
    margin-bottom: 12px;
  }
  .v-card-title {
    font-size: 1rem;
  }
  .v-card-subtitle {
    font-size: 0.85rem;
  }
}

/* Ajustes para Large Desktop */
@media (min-width: 1280px) {
  .v-container {
    max-width: 100% !important;
  }
}

.v-container {
  max-width: 100% !important;
}

/* Fila expandida */
.expanded-row {
  background-color: #fafafa;
}

/* Hover normal en filas */
.v-data-table tbody tr:hover {
  background-color: #f5f5f5;
}

/* Asegura que la tabla principal ocupe todo el ancho del contenedor */
.v-data-table {
  width: 100% !important;
  table-layout: auto;
}

/* Asegura que el v-card que la contiene no restrinja el ancho */
.v-card.pa-2.elevation-1 {
  width: 100% !important;
}
.competencia-section {
  background-color: #fff9c4; /* amarillo pastel */
  padding: 8px;
}
::v-deep .v-list,
::v-deep .v-list-item,
::v-deep .v-list-item__content {
  background-color: transparent !important;
}
.actividades-section {
  background-color: #e3f2fd; /* celeste pastel */
  padding: 8px;
  border-radius: 4px;
}
.chip-xs {
  font-size: 0.75rem;
  height: 24px;
}
.capacidades-section {
  background-color: #f3e5f5; /* lila pastel */
  padding: 8px;
  border-radius: 4px;
}
.iconos-mobile {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  align-items: center;
}
@media (max-width: 600px) {
  .competencia-section .v-list-item {
    padding-left: 8px;
    padding-right: 8px;
  }
  .text-caption {
    text-align: left !important;
  }
}
.actividad-mobile-card {
  background-color: #e3f2fd; /* celeste pastel */
  border-radius: 4px;
  border: 1px solid #d0e3f5;
}
.capacidad-mobile-card {
  background-color: #f3e5f5; /* lila pastel */
  border-radius: 4px;
  border: 1px solid #e1cce7;
}
/* sólo mobile: centraremos la corrección en ancho chicos */
@media (max-width: 600px) {
  .plan-item--mobile {
    padding-right: 0 !important;   /* adiós 16 px del lado derecho */
  }
}
</style>
