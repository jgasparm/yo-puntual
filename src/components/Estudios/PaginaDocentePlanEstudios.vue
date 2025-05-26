<template>
  <v-container fluid>
    <!-- ENCABEZADO -->
    <v-row class="py-3">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold text-primary">
          📘 Plan de estudios - Año {{ anioEscolar }}
        </h2>
        <p class="text-body-2 text-grey-darken-1">
          Gestiona los planes de estudio, curriculares y competencias asignadas por nivel, grado y área educativa.
        </p>
      </v-col>
    </v-row>

    <!-- CONTADOR RESULTADOS FILTRADOS -->
   <!--  <v-row class="mb-2">
      <v-col cols="12">
        <p class="text-caption text-grey">Resultados encontrados: {{ filteredPlanes.length }}</p>
      </v-col>
    </v-row> -->

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

    <!-- SNACKBAR MENSAJES -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000">
      {{ snackbar.text }}
      <template #actions>
        <v-btn text @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>

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
                  <v-chip :color="plan.ples_estado === 'A' ? 'green' : 'red'" class="chip-xs">
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
                            <v-chip :color="item.pacu_estado === 'A' ? 'green' : 'red'" class="chip-xs">
                              {{ item.pacu_estado === 'A' ? 'Activo' : 'Inactivo' }}
                            </v-chip>
                          </td>
                          <td>
                            <!-- Botón para expandir Competencias -->
                            <v-btn icon variant="text" @click.stop="toggleExpandCompetencias(item.pacu_id)">
                              <v-icon>
                                {{ isEvaluationExpanded(item.pacu_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                              </v-icon>
                            </v-btn>
                          </td>
                        </tr>

                        <!-- Fila expandida para Competencias de ese pacu_id -->
                        <tr v-if="isEvaluationExpanded(item.pacu_id)">
                          <td colspan="6" class="competencia-section">
                            <div class="d-flex justify-space-between font-weight-bold mb-2">
                              <span>Competencias</span>
                              <v-btn small color="primary" variant="text" @click="abrirDialogoAgregarCompetencia(item, plan.ples_id)">
                                +Agregar
                              </v-btn>
                            </div>

                            <!-- Tabla de Competencias -->
                            <table
                              v-if="(planCurricularCompetencias[item.pacu_id] || []).length"
                              class="w-100"
                            >
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
                                  v-for="(compItem, eIdx) in paginatedCompetencias(item.pacu_id).map(c => ({ ...c, pacu_id: item.pacu_id }))"
                                  :key="compItem.pcco_id"
                                >
                                  <tr>
                                    <td>
                                      {{
                                        (competenciaPage[item.pacu_id] - 1) * competenciaItemsPerPage +
                                        eIdx +
                                        1
                                      }}
                                    </td>
                                    <td>{{ compItem.comp_nombre }}</td>
                                    <td>{{ compItem.pcco_orden }}</td>
                                    <td>
                                      <v-chip :color="compItem.pcco_estado === 'A' ? 'green' : 'red'" class="chip-xs">
                                        {{ compItem.pcco_estado === 'A' ? 'Activo' : 'Inactivo' }}
                                      </v-chip>
                                    </td>
                                    <td>
                                      <v-btn icon variant="text" @click.stop="abrirDialogoEditarCompetencia(compItem)">
                                        <v-icon>mdi-pencil</v-icon>
                                      </v-btn>
                                      <v-btn
                                        icon
                                        variant="text"
                                        @click.stop="toggleExpandActividades(compItem.pcco_id)"
                                        :title="isActividadesExpanded(compItem.pcco_id) ? 'Ocultar actividades' : 'Ver actividades'"
                                      >
                                        <v-icon>
                                          {{ isActividadesExpanded(compItem.pcco_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                                        </v-icon>
                                      </v-btn>
                                    </td>
                                  </tr>

                                <!-- Fila de Actividades -->
                                <tr
                                  v-if="isActividadesExpanded(compItem.pcco_id)"
                                  :key="'actividades-' + compItem.pcco_id"
                                >
                                  <td colspan="5">
                                    <div class="actividades-section mt-2">
                                      <div class="d-flex justify-space-between align-center mb-2">
                                        <h4 class="text-subtitle-2 font-weight-bold">Actividades</h4>
                                        <v-btn small color="primary" variant="text" @click="abrirDialogoAgregarActividad(compItem.pcco_id)">
                                          +Agregar
                                        </v-btn>
                                      </div>

                                      <table v-if="(planCompetenciaActividades[compItem.pcco_id] || []).length" class="w-100">
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
                                          <tr
                                            v-for="(act, idx) in planCompetenciaActividades[compItem.pcco_id]"
                                            :key="act.pcca_id"
                                          >
                                            <td>{{ idx + 1 }}</td>
                                            <td>{{ act.acti_nombre }}</td>
                                            <td>{{ act.pcca_orden }}</td>
                                            <td>
                                              <v-chip :color="act.pcca_estado === 'A' ? 'green' : 'red'" class="chip-xs">
                                                {{ act.pcca_estado === 'A' ? 'Activo' : 'Inactivo' }}
                                              </v-chip>
                                            </td>
                                            <td>
                                              <v-btn icon variant="text" @click.stop="abrirDialogoEditarActividad(act)">
                                                <v-icon>mdi-pencil</v-icon>
                                              </v-btn>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <p v-else>No hay actividades registradas</p>
                                    </div>
                                  </td>
                                </tr>

                                <!-- Fila de Capacidades debajo de Actividades -->
                                <tr
                                  v-if="isActividadesExpanded(compItem.pcco_id)"
                                  :key="'capacidades-' + compItem.pcco_id"
                                >
                                  <td colspan="5">
                                    <div class="capacidades-section mt-2">
                                      <div class="d-flex justify-space-between align-center mb-2">
                                        <h4 class="text-subtitle-2 font-weight-bold">Capacidades</h4>
                                          <v-btn small color="primary" variant="text" @click="abrirDialogoAgregarCapacidad(compItem.pcco_id)">
                                            +Agregar
                                          </v-btn>
                                      </div>

                                      <table
                                        v-if="Array.isArray(planCompetenciaCapacidades[compItem.pcco_id]) && planCompetenciaCapacidades[compItem.pcco_id].some(c => c && c.pccc_id)"
                                        class="w-100"
                                      >

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
                                          <tr
                                            v-for="(cap, idx) in (planCompetenciaCapacidades[compItem.pcco_id] || []).filter(c => c && c.pccc_id)"
                                            :key="cap.pccc_id"
                                          >
                                            <td>{{ idx + 1 }}</td>
                                            <td>{{ cap.capa_nombre }}</td>
                                            <td>{{ cap.pccc_orden }}</td>
                                            <td>
                                              <v-chip :color="cap.pccc_estado === 'A' ? 'green' : 'red'" class="chip-xs">
                                                {{ cap.pccc_estado === 'A' ? 'Activo' : 'Inactivo' }}
                                              </v-chip>
                                            </td>
                                            <td>
                                              <v-btn icon variant="text" @click.stop="abrirDialogoEditarCapacidad(cap)">
                                                <v-icon>mdi-pencil</v-icon>
                                              </v-btn>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <p v-else>No hay capacidades registradas</p>
                                    </div>
                                  </td>
                                </tr>

                              </template>
                              </tbody>
                            </table>

                            



                            <p v-else>No hay competencias registradas</p>
                            

                            <!-- Paginación de Competencias -->
                            <v-pagination
                              v-if="competenciaTotalPages(item.pacu_id) > 1"
                              v-model="competenciaPage[item.pacu_id]"
                              :length="competenciaTotalPages(item.pacu_id)"
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
              <v-chip x-small :color="plan.ples_estado === 'A' ? 'green' : 'red'" class="chip-xs">
                {{ plan.ples_estado === 'A' ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </v-card-subtitle>

            <!-- Expansión Mobile de Plan Curricular -->
            <v-expand-transition>
              <v-card-text v-if="isExpanded(plan.ples_id)">
                <h4 class="text-subtitle-2 font-weight-bold mb-2">Planes Curriculares</h4>
                <v-list dense>
                  <!-- Listado de Planes Curriculares en mobile -->
                  <v-list-item
                    v-for="(item) in planCurriculares[plan.ples_id] || []"
                    :key="item.pacu_id"
                  >
                    <div class="d-flex justify-space-between align-center w-100">
                      <div>
                        {{ item.peed_nombre }} — {{ item.aede_nombre }}
                        <div class="text-caption d-flex flex-column align-start">
                          <span>Horas: {{ item.pacu_horas }}</span>
                          <v-chip x-small :color="item.pacu_estado === 'A' ? 'green' : 'red'" class="chip-xs mt-1">
                            {{ item.pacu_estado === 'A' ? 'Activo' : 'Inactivo' }}
                          </v-chip>
                        </div>

                      </div>

                      <!-- Botón para expandir Competencias Mobile -->
                      <v-btn icon variant="text" @click.stop="toggleExpandCompetencias(item.pacu_id)">
                        <v-icon>{{ isEvaluationExpanded(item.pacu_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                      </v-btn>
                    </div>

                    <!-- Expansión Mobile de Competencias -->
                    <v-expand-transition>
                      <div v-if="isEvaluationExpanded(item.pacu_id)" class="competencia-section pa-4">
                        <h4 class="text-subtitle-2 font-weight-bold mb-2">Competencias</h4>
                        <v-list dense>
                          <v-btn
                            small
                            color="primary"
                            variant="text"
                            class="mb-2"
                            @click="abrirDialogoAgregarCompetencia(item, plan.ples_id)"
                          >
                            +Agregar
                          </v-btn>

                          <!-- Iteración de Competencias mobile -->
                          <div
                            v-for="(compItem) in paginatedCompetencias(item.pacu_id).map(c => ({ ...c, pacu_id: item.pacu_id }))"
                            :key="compItem.pcco_id"
                            class="mb-2 pa-2 competencia-mobile-card"
                          >
                            <!-- Fila 1: Iconos -->
                            <div class="d-flex justify-end mb-1">
                              <v-btn icon variant="text" @click.stop="abrirDialogoEditarCompetencia(compItem)">
                                <v-icon>mdi-pencil</v-icon>
                              </v-btn>
                              <v-btn
                                icon
                                variant="text"
                                @click.stop="toggleExpandActividades(compItem.pcco_id)"
                                :title="isActividadesExpanded(compItem.pcco_id) ? 'Ocultar actividades' : 'Ver actividades'"
                              >
                                <v-icon>
                                  {{ isActividadesExpanded(compItem.pcco_id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                                </v-icon>
                              </v-btn>
                            </div>

                            <!-- Fila 2: Nombre -->
                            <div class="text-body-2 font-weight-medium mb-1 text-left">
                              {{ compItem.comp_nombre }}
                            </div>

                            <!-- Fila 3: Orden -->
                            <div class="text-caption text-left mb-1">
                              Orden: {{ compItem.pcco_orden }}
                            </div>

                            <!-- Fila 4: Estado -->
                            <div class="text-caption text-left">
                              <v-chip x-small :color="compItem.pcco_estado === 'A' ? 'green' : 'red'" class="chip-xs">
                                {{ compItem.pcco_estado === 'A' ? 'Activo' : 'Inactivo' }}
                              </v-chip>
                            </div>

                            <!-- ACTIVIDADES -->
                            <v-expand-transition>
                              <div
                                v-if="isActividadesExpanded(compItem.pcco_id)"
                                class="actividades-section mt-2"
                              >
                                <div class="d-flex justify-space-between align-center mb-2">
                                  <h4 class="text-subtitle-2 font-weight-bold">Actividades</h4>
                                  <v-btn small color="primary" variant="text" @click="abrirDialogoAgregarActividad(compItem.pcco_id)">
                                    +Agregar
                                  </v-btn>
                                </div>
                                <div v-if="planCompetenciaActividades[compItem.pcco_id]?.length">
                                  <div
                                    v-for="(act) in planCompetenciaActividades[compItem.pcco_id]"
                                    :key="act.pcca_id"
                                    class="mb-1 text-caption"
                                  >
                                  <div :key="act.pcca_id" class="mb-2 pa-2 actividad-mobile-card">
                                    <div class="d-flex justify-end mb-1">
                                      <v-btn icon variant="text" @click.stop="abrirDialogoEditarActividad(act)">
                                        <v-icon>mdi-pencil</v-icon>
                                      </v-btn>
                                    </div>
                                    <div class="text-body-2 font-weight-medium mb-1 text-left">
                                      {{ act.acti_nombre }}
                                    </div>
                                    <div class="text-caption text-left mb-1">
                                      Orden: {{ act.pcca_orden }}
                                    </div>
                                    <div class="text-caption text-left">
                                      <v-chip x-small :color="act.pcca_estado === 'A' ? 'green' : 'red'" class="chip-xs">
                                        {{ act.pcca_estado === 'A' ? 'Activo' : 'Inactivo' }}
                                      </v-chip>
                                    </div>
                                  </div>

                                  </div>
                                </div>
                                <div v-else class="text-caption">No hay actividades registradas</div>
                              </div>
                            </v-expand-transition>

                            <!-- CAPACIDADES -->
                            <v-expand-transition>
                              <div
                                v-if="isActividadesExpanded(compItem.pcco_id)"
                                class="capacidades-section mt-2"
                              >
                                <div class="d-flex justify-space-between align-center mb-2">
                                  <h4 class="text-subtitle-2 font-weight-bold">Capacidades</h4>
                                  <v-btn small color="primary" variant="text" @click="abrirDialogoAgregarCapacidad(compItem.pcco_id)">
                                    +Agregar
                                  </v-btn>
                                </div>
                                <div v-if="planCompetenciaCapacidades[compItem.pcco_id]?.length">
                                  <div
                                    v-for="(cap) in planCompetenciaCapacidades[compItem.pcco_id]"
                                    :key="cap.pccc_id"
                                    class="mb-1 text-caption"
                                  >
                                  <div :key="cap.pccc_id" class="mb-2 pa-2 capacidad-mobile-card">
                                    <div class="d-flex justify-end mb-1">
                                      <v-btn icon variant="text" @click.stop="abrirDialogoEditarCapacidad(cap)">
                                        <v-icon>mdi-pencil</v-icon>
                                      </v-btn>
                                    </div>
                                    <div class="text-body-2 font-weight-medium mb-1 text-left">
                                      {{ cap.capa_nombre }}
                                    </div>
                                    <div class="text-caption text-left mb-1">
                                      Orden: {{ cap.pccc_orden }}
                                    </div>
                                    <div class="text-caption text-left">
                                      <v-chip x-small :color="cap.pccc_estado === 'A' ? 'green' : 'red'" class="chip-xs">
                                        {{ cap.pccc_estado === 'A' ? 'Activo' : 'Inactivo' }}
                                      </v-chip>
                                    </div>
                                  </div>

                                  </div>
                                </div>
                                <div v-else class="text-caption">No hay capacidades registradas</div>
                              </div>
                            </v-expand-transition>


                          </div>

                          <!-- Mensaje si no hay competencias -->
                          <div v-if="!(planCurricularCompetencias[item.pacu_id]?.length)">
                            No hay competencias registradas
                          </div>
                        </v-list>

                        <!-- Paginación Competencias Mobile -->
                        <v-pagination
                          v-if="competenciaTotalPages(item.pacu_id) > 1"
                          v-model="competenciaPage[item.pacu_id]"
                          :length="competenciaTotalPages(item.pacu_id)"
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

    <!-- DIÁLOGO: Agregar Competencia de Plan Curricular -->
    <v-dialog v-model="mostrarDialogoAgregarCompetencia" max-width="400">
      <v-card>
        <v-card-title>Agregar Competencia</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-select
                label="Tipo de Competencia"
                :items="competenciasOptions"
                item-text="title"
                item-value="key"
                v-model="newCompetencia.comp_id"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Orden"
                type="number"
                v-model="newCompetencia.pcco_orden"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="mostrarDialogoAgregarCompetencia = false">Cancelar</v-btn>
          <v-btn 
            color="primary"
            :loading="isSavingCompetencia"
            :disabled="isSavingCompetencia"
            @click="guardarNuevaCompetencia">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIÁLOGO: Editar Competencia de Plan Curricular -->
    <v-dialog v-model="mostrarDialogoEditarCompetencia" max-width="400">
      <v-card>
        <v-card-title>Editar Competencia</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <strong>Competencia:</strong> {{ competenciaSeleccionada?.comp_nombre }}
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Orden"
                type="number"
                v-model="competenciaSeleccionada.pcco_orden"
              />
            </v-col>
            <v-col cols="12">
              <v-select
                label="Estado"
                :items="['Activo','Inactivo']"
                v-model="competenciaSeleccionadaEstado"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="cerrarDialogoEditarEvaluacion">Cancelar</v-btn>
          <v-btn
            color="primary" 
            :loading="isSavingCompetencia"
            :disabled="isSavingCompetencia"
            @click="guardarCompetenciaActualizada">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIÁLOGO: Agregar Actividad -->
<v-dialog v-model="mostrarDialogoAgregarActividad" max-width="400">
  <v-card>
    <v-card-title>Agregar Actividad</v-card-title>
    <v-card-text>
      <v-select
        label="Actividad"
        :items="actividadesDisponibles"
        item-text="title"
        item-value="key"
        v-model="nuevaActividad.acti_id"
      />
      <v-text-field
        label="Orden"
        type="number"
        v-model="nuevaActividad.pcca_orden"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn text @click="mostrarDialogoAgregarActividad = false">Cancelar</v-btn>
      <v-btn
        color="primary" 
        :disabled="isSavingActividad || !nuevaActividad.acti_id || !nuevaActividad.pcca_orden"
        :loading="isSavingActividad"
        @click="guardarNuevaActividad">
        Guardar
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<!-- DIÁLOGO: Editar Actividad -->
<v-dialog v-model="mostrarDialogoEditarActividad" max-width="400">
  <v-card>
    <v-card-title>Editar Actividad</v-card-title>
    <v-card-text>
      <div><strong>Actividad:</strong> {{ actividadSeleccionada?.acti_nombre }}</div>
      <v-text-field
        label="Orden"
        type="number"
        v-model="actividadSeleccionada.pcca_orden"
      />
      <v-select
        label="Estado"
        :items="['Activo','Inactivo']"
        v-model="actividadSeleccionadaEstado"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn text @click="mostrarDialogoEditarActividad = false">Cancelar</v-btn>
      <v-btn 
        color="primary"
        :loading="isSavingCompetenciaActividad"
        :disabled="isSavingCompetenciaActividad"
        @click="guardarActividadEditada">
        Guardar
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<!-- DIÁLOGO: Agregar Capacidad -->
<v-dialog v-model="mostrarDialogoAgregarCapacidad" max-width="400">
  <v-card>
    <v-card-title>Agregar Capacidad</v-card-title>
    <v-card-text>
      <v-select
        label="Capacidad"
        :items="capacidadesDisponibles"
        item-text="title"
        item-value="key"
        v-model="nuevaCapacidad.capa_id"
      />
      <v-text-field
        label="Orden"
        type="number"
        v-model="nuevaCapacidad.pccc_orden"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn text @click="mostrarDialogoAgregarCapacidad = false">Cancelar</v-btn>
      <v-btn 
        color="primary" 
        :disabled="isSavingCapacidad || !nuevaCapacidad.capa_id || !nuevaCapacidad.pccc_orden"
        :loading="isSavingCapacidad"
        @click="guardarNuevaCapacidad">
        Guardar
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<!-- DIÁLOGO: Editar Capacidad -->
<v-dialog v-model="mostrarDialogoEditarCapacidad" max-width="400">
  <v-card>
    <v-card-title>Editar Capacidad</v-card-title>
    <v-card-text>
      <div><strong>Capacidad:</strong> {{ capacidadSeleccionada?.capa_nombre }}</div>
      <v-text-field
        label="Orden"
        type="number"
        v-model="capacidadSeleccionada.pccc_orden"
      />
      <v-select
        label="Estado"
        :items="['Activo','Inactivo']"
        v-model="capacidadSeleccionadaEstado"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn text @click="mostrarDialogoEditarCapacidad = false">Cancelar</v-btn>
      <v-btn 
        color="primary"
        :loading="isSavingCapacidad"
        :disabled="isSavingCapacidad"
        @click="guardarCapacidadEditada">
        Guardar
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import axios from 'axios'
import { useDisplay } from 'vuetify'

const isSavingCompetencia = ref(false)
const isSavingActividad   = ref(false)
const isSavingCapacidad   = ref(false)

const capacidadesDisponibles = ref([])
const mostrarDialogoAgregarCapacidad = ref(false)
const mostrarDialogoEditarCapacidad = ref(false)
const nuevaCapacidad = ref({ pcco_id: null, capa_id: null, pccc_orden: null })
const capacidadSeleccionada = ref(null)
const capacidadSeleccionadaEstado = ref('Activo')


const expandedActividadId = ref(null)

const toggleExpandActividades = async (pcco_id) => {
  if (expandedActividadId.value === pcco_id) {
    expandedActividadId.value = null
  } else {
    expandedActividadId.value = pcco_id
    await obtenerActividadesPorCompetencia(pcco_id)
    await obtenerCapacidadesPorCompetencia(pcco_id) // <-- AGREGAR ESTA LÍNEA
  }
}



const isActividadesExpanded = (pcco_id) => {
  return expandedActividadId.value === pcco_id
}

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
const planCurricularCompetencias = ref({})  // planCurricularCompetencias[pacu_id] => array

// --- PAGINACIÓN (Planes) ---
const currentPage = ref(1)
const itemsPerPage = computed(() => (isDesktop.value ? 10 : 5))

// --- PAGINACIÓN (Planes Curriculares) ---
const planCurrPage = ref({})
const currItemsPerPage = computed(() => (isDesktop.value ? 10 : 5))

// --- PAGINACIÓN (Competencias) ---
const competenciaPage = ref({})
const competenciaItemsPerPage = computed(() => (isDesktop.value ? 10 : 5))

// --- EXPANSIÓN de filas ---
const expandedId = ref(null)             // Para planes
const expandedCompetenciaId = ref(null)   // Para competencias

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

// --- DIALOGOS Competencias ---
const competenciasOptions = ref([])
const mostrarDialogoAgregarCompetencia = ref(false)
const mostrarDialogoEditarCompetencia = ref(false)
const newCompetencia = reactive({
  pacu_id: null,
  comp_id: null,
  pcco_orden: null
})
const competenciaSeleccionada = ref(null)
const competenciaSeleccionadaEstado = ref('Activo')

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

const planCompetenciaActividades = ref({}) // pcco_id => actividades
const actividadesDisponibles = ref([])
const mostrarDialogoAgregarActividad = ref(false)
const mostrarDialogoEditarActividad = ref(false)
const nuevaActividad = ref({ pcco_id: null, acti_id: null, pcca_orden: null })
const actividadSeleccionada = ref(null)
const actividadSeleccionadaEstado = ref('Activo')

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

// --- PAGINACIÓN Competencias ---
function paginatedCompetencias(pacuId) {
  if (!competenciaPage.value[pacuId]) {
    competenciaPage.value[pacuId] = 1
  }
  const list = planCurricularCompetencias.value[pacuId] || []
  const page = competenciaPage.value[pacuId]
  const start = (page - 1) * competenciaItemsPerPage.value
  return list.slice(start, start + competenciaItemsPerPage.value)
}
function competenciaTotalPages(pacuId) {
  const list = planCurricularCompetencias.value[pacuId] || []
  return Math.ceil(list.length / competenciaItemsPerPage.value)
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
async function obtenerPlanCurricularCompetencias(pacuId) {
  try {
    const { data } = await axiosInstance.get(
      `wsConsultaPlanCurricularCompetencias.php?ai_pacu_id=${pacuId}&ac_pcco_estado=T&av_profile=${profile}`
    )
    if (data.status) {
      planCurricularCompetencias.value = {
        ...planCurricularCompetencias.value,
        [pacuId]: data.data
      }
    } else {
      planCurricularCompetencias.value[pacuId] = []
    }
  } catch (err) {
    console.error('Error al obtener competencias:', err)
    planCurricularCompetencias.value[pacuId] = []
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

async function toggleExpandCompetencias(pacuId) {
  if (expandedCompetenciaId.value === pacuId) {
    expandedCompetenciaId.value = null
  } else {
    expandedCompetenciaId.value = pacuId

    await obtenerPlanCurricularCompetencias(pacuId)

    if (!competenciaPage.value[pacuId]) {
      competenciaPage.value[pacuId] = 1
    }

    const competencias = planCurricularCompetencias.value[pacuId] || []
    for (const c of competencias) {
      if (c && c.pcco_id) {
        await obtenerActividadesPorCompetencia(c.pcco_id)
        await obtenerCapacidadesPorCompetencia(c.pcco_id)
      }
    }
  }
}




function isEvaluationExpanded(pacuId) {
  return expandedCompetenciaId.value === pacuId
}

// --- EVALUACIONES: Agregar / Editar ---
function abrirDialogoAgregarCompetencia(planCurr, ples_id) {
  newCompetencia.pacu_id = planCurr.pacu_id
  newCompetencia.comp_id = null
  newCompetencia.pcco_orden = null

  const planPadre = planesEstudio.value.find(p => p.ples_id === ples_id)
  if (planPadre) {
    const ared_id = planPadre.ared_id
    const nive_id = planPadre.nive_id
    obtenerCompetenciasDisponibles(planCurr.pacu_id, ared_id, nive_id)
  } else {
    console.warn(`No se encontró el plan padre con ples_id=${ples_id}`)
    competenciasOptions.value = []
  }

  mostrarDialogoAgregarCompetencia.value = true
}


async function guardarNuevaCompetencia() {
  isSavingCompetencia.value = true
  try {
    const params = new URLSearchParams()
    params.append('ai_pacu_id', newCompetencia.pacu_id)
    params.append('ai_comp_id', newCompetencia.comp_id)
    //params.append('adc_pcev_peso_porcentaje', competenciaSeleccionada.value.pcev_peso_porcentaje)
    params.append('adc_pcco_orden', newCompetencia.pcco_orden)
    params.append('av_profile', profile)

    const { data } = await axiosInstance.post('wsRegistraPlanCurricularCompetencia.php', params)
    if (data.status) {
      mostrarDialogoAgregarCompetencia.value = false
      // Refrescamos las competencias
      await obtenerPlanCurricularCompetencias(newCompetencia.pacu_id)
    } else {
      console.error('Error al guardar nueva competencia:', data.message)
    }
  } catch (err) {
    console.error('Error al guardar nueva competencia:', err)
  } finally {
    isSavingCompetencia.value = false
  }
}

function abrirDialogoEditarCompetencia(compItem) {
  competenciaSeleccionada.value = { ...compItem }
  // Ajustamos su estado a 'Activo' o 'Inactivo' (si pcco_estado viene null, ajusta tu lógica)
  competenciaSeleccionadaEstado.value = compItem.pcco_estado === 'I' ? 'Inactivo' : 'Activo'
  mostrarDialogoEditarCompetencia.value = true
}
async function guardarCompetenciaActualizada() {
  isSavingCompetencia.value = true
  try {
    const params = new URLSearchParams()
    params.append('ai_pcco_id', competenciaSeleccionada.value.pcco_id)
    params.append('adc_pcco_orden', competenciaSeleccionada.value.pcco_orden)

    const estadoWS = competenciaSeleccionadaEstado.value === 'Activo' ? 'A' : 'I'
    params.append('ac_pcco_estado', estadoWS)
    params.append('av_profile', profile)

    const { data } = await axiosInstance.post('wsActualizaPlanCurricularCompetencia.php', params)
    if (data.status) {
      mostrarDialogoEditarCompetencia.value = false
      if (competenciaSeleccionada.value) {
        await obtenerPlanCurricularCompetencias(competenciaSeleccionada.value.pacu_id)
      } else {
        console.warn('No se encontró pacu_id al actualizar competencia')
      }
    } else {
      console.error('Error al actualizar competencia:', data.message)
    }
  } catch (err) {
    console.error('Error al actualizar competencia:', err)
  } finally {
    isSavingCompetencia.value = false
  }
}

function cerrarDialogoEditarEvaluacion() {
  mostrarDialogoEditarCompetencia.value = false
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

async function obtenerCompetenciasDisponibles(pacu_id, ared_id, nive_id) {
  try {
    const { data } = await axiosInstance.get(
      `wsListaCompetenciasDisponiblesPlanCurricular.php?ai_pacu_id=${pacu_id}&ai_ared_id=${ared_id}&ac_nive_id=${nive_id}&av_profile=${profile}`
    )
    if (data.status) {
      competenciasOptions.value = data.data.map(c => ({
        key: c.comp_id,
        title: c.comp_nombre
      }))
    } else {
      competenciasOptions.value = []
    }
  } catch (err) {
    console.error('Error al obtener competencias disponibles:', err)
    competenciasOptions.value = []
  }
}


function abrirDialogoAgregarCapacidad(pcco_id) {
  nuevaCapacidad.value = { pcco_id, capa_id: null, pccc_orden: null }
  obtenerCapacidadesDisponibles(pcco_id)
  mostrarDialogoAgregarCapacidad.value = true
}

async function guardarNuevaCapacidad() {
  isSavingCapacidad.value = true
  const { pcco_id, capa_id, pccc_orden } = nuevaCapacidad.value
  const params = new URLSearchParams()
  params.append('ai_pcco_id', pcco_id)
  params.append('ai_capa_id', capa_id)
  params.append('adc_pccc_orden', pccc_orden)
  params.append('av_profile', profile)

  try {
    const { data } = await axiosInstance.post('wsRegistraPCCompetenciaCapacidad.php', params)
    if (data.status) {
      mostrarDialogoAgregarCapacidad.value = false
      await obtenerCapacidadesPorCompetencia(pcco_id)
    }
  } catch (err) {
    console.error('Error al guardar capacidad:', err)
  } finally {
    isSavingCapacidad.value = false
  }
}

function abrirDialogoEditarCapacidad(capacidad) {
  capacidadSeleccionada.value = { ...capacidad,
  pcco_id: capacidad.pcco_id }
  capacidadSeleccionadaEstado.value = capacidad.pccc_estado === 'I' ? 'Inactivo' : 'Activo'
  mostrarDialogoEditarCapacidad.value = true
}

async function guardarCapacidadEditada() {
  isSavingCapacidad.value = true
  const { pccc_id, pcco_id, pccc_orden } = capacidadSeleccionada.value
  const estado = capacidadSeleccionadaEstado.value === 'Activo' ? 'A' : 'I'
  const params = new URLSearchParams()
  params.append('ai_pccc_id', pccc_id)
  params.append('adc_pccc_orden', pccc_orden)
  params.append('ac_pccc_estado', estado)
  params.append('av_profile', profile)

  try {
    const { data } = await axiosInstance.post('wsActualizaPCCompetenciaCapacidad.php', params)
    if (data.status) {
      mostrarDialogoEditarCapacidad.value = false
      await obtenerCapacidadesPorCompetencia(pcco_id)
    }
  } catch (err) {
    console.error('Error al actualizar capacidad:', err)
  } finally {
    isSavingCapacidad.value = false
  }
}

async function obtenerCapacidadesDisponibles(pcco_id) {
  try {
    const { data } = await axiosInstance.get(`wsListaCapacidadesDisponiblesCompetencias.php?ai_pcco_id=${pcco_id}&av_profile=${profile}`)
    if (data.status) {
      capacidadesDisponibles.value = data.data.map(c => ({ key: c.capa_id, title: c.capa_nombre }))
    } else {
      capacidadesDisponibles.value = []
    }
  } catch (error) {
    console.error('Error al obtener capacidades disponibles:', error)
  }
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
// Snackbar global para mensajes
const snackbar = reactive({
  show: false,
  text: '',
  color: 'success'
})

//function mostrarMensaje(texto, tipo = 'success') {
//  snackbar.text = texto
//  snackbar.color = tipo
//  snackbar.show = true
//}

const planCompetenciaCapacidades = ref({}) // pcco_id => capacidades

async function obtenerCapacidadesPorCompetencia(pcco_id) {
  try {
    const { data } = await axiosInstance.get(
      `wsConsultaPCCompetenciasCapacidades.php?ai_pcco_id=${pcco_id}&av_profile=${profile}`
    )
    if (data.status) {
      planCompetenciaCapacidades.value[pcco_id] = Array.isArray(data.data) ? data.data : []
    } else {
      planCompetenciaCapacidades.value[pcco_id] = []
    }
  } catch (error) {
    console.error('Error al obtener capacidades:', error)
    planCompetenciaCapacidades.value[pcco_id] = []
  }
}


async function obtenerActividadesPorCompetencia(pcco_id) {
  try {
    const { data } = await axiosInstance.get(
      `wsConsultaPCCompetenciasActividades.php?ai_pcco_id=${pcco_id}&ac_pcca_estado=T&av_profile=${profile}`
    )
    if (data.status) {
      planCompetenciaActividades.value[pcco_id] = data.data
    } else {
      planCompetenciaActividades.value[pcco_id] = []
    }
  } catch (error) {
    console.error('Error al obtener actividades:', error)
    planCompetenciaActividades.value[pcco_id] = []
  }
}

async function obtenerActividadesDisponibles(pcco_id) {
  try {
    const { data } = await axiosInstance.get(
      `wsListaActividadesDisponiblesCompetencias.php?ai_pcco_id=${pcco_id}&av_profile=${profile}`
    )
    if (data.status) {
      actividadesDisponibles.value = data.data.map(a => ({ key: a.acti_id, title: a.acti_nombre }))
    } else {
      actividadesDisponibles.value = []
    }
  } catch (error) {
    console.error('Error al obtener actividades disponibles:', error)
    actividadesDisponibles.value = []
  }
}

function abrirDialogoAgregarActividad(pcco_id) {
  nuevaActividad.value = { pcco_id, acti_id: null, pcca_orden: null }
  obtenerActividadesDisponibles(pcco_id)
  mostrarDialogoAgregarActividad.value = true
}

async function guardarNuevaActividad() {
  isSavingActividad.value = true
  const { pcco_id, acti_id, pcca_orden } = nuevaActividad.value
  if (!pcco_id || !acti_id || !pcca_orden) return

  const params = new URLSearchParams()
  params.append('ai_pcco_id', pcco_id)
  params.append('ai_acti_id', acti_id)
  params.append('adc_pcca_orden', pcca_orden)
  params.append('av_profile', profile)

  try {
    const { data } = await axiosInstance.post('wsRegistraPCCompetenciaActividad.php', params)
    if (data.status) {
      mostrarDialogoAgregarActividad.value = false
      await obtenerActividadesPorCompetencia(pcco_id)
    } else {
      console.error('Error al guardar actividad:', data.message)
    }
  } catch (error) {
    console.error('Error al guardar actividad:', error)
  } finally {
    isSavingActividad.value = false
  }
}

function abrirDialogoEditarActividad(actividad) {
  actividadSeleccionada.value = {
    ...actividad,
    pcco_id: actividad.pcco_id // asegúrate de incluirlo explícitamente
  }
  actividadSeleccionadaEstado.value = actividad.pcca_estado === 'I' ? 'Inactivo' : 'Activo'
  mostrarDialogoEditarActividad.value = true
}


async function guardarActividadEditada() {
  isSavingActividad.value = true
  const { pcca_id, pcco_id, pcca_orden } = actividadSeleccionada.value
  const estado = actividadSeleccionadaEstado.value === 'Activo' ? 'A' : 'I'

  const params = new URLSearchParams()
  params.append('ai_pcca_id', pcca_id)
  params.append('adc_pcca_orden', pcca_orden)
  params.append('ac_pcca_estado', estado)
  params.append('av_profile', profile)

  try {
    const { data } = await axiosInstance.post('wsActualizaPCCompetenciaActividad.php', params)
    if (data.status) {
      mostrarDialogoEditarActividad.value = false
      await obtenerActividadesPorCompetencia(pcco_id)
    } else {
      console.error('Error al actualizar actividad:', data.message)
    }
  } catch (error) {
    console.error('Error al actualizar actividad:', error)
  } finally {
    isSavingActividad.value = false
  }
}

</script>

<style scoped>
th,
td {
  padding: 6px 12px;
  font-size: 0.875rem; /* opcional: reduce el tamaño de fuente */
  line-height: 1.2;
}
.expanded-row {
  background-color: #e0f7fa;
}
.expanded-section {
  background: #fafafa;
  padding: 12px;
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
</style>
