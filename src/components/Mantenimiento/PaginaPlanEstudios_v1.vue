<template>
  <v-container fluid>
    <!-- ENCABEZADO -->
    <v-row class="py-3">
      <v-col cols="12">
        <h1 class="text-h4">Plan de estudios - Año {{ anioEscolar }}</h1>
      </v-col>
    </v-row>

    <!-- BOTÓN AGREGAR -->
    <v-row>
      <v-col cols="12" class="d-flex justify-end">
        <v-btn color="primary" @click="mostrarDialogoAgregarPlanEstudio = true">
          Agregar Plan de Estudio
        </v-btn>
      </v-col>
    </v-row>

    <!-- VERSIÓN DESKTOP -->
    <div v-if="isDesktop">
      <v-data-table
        :items="planesEstudio"
        item-key="ples_id"
        :items-per-page="itemsPerPage"
        hide-default-header
        class="elevation-1 mt-4"
        v-model:page="currentPage"
      >
        <template #body="{ items }">
          <thead>
            <tr>
              <th>N°</th><th>Área Educativa</th><th>Grado</th><th>Horas</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(plan, idx) in items" :key="plan.ples_id">
              <tr :class="{ 'expanded-row': isExpanded(plan.ples_id) }">
                <td>{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
                <td>{{ plan.ared_nombre }}</td>
                <td>{{ plan.grad_nombre }}</td>
                <td>{{ plan.ples_horas }}</td>
                <td>
                  <v-chip :color="plan.ples_estado==='A'? 'green':'red'">
                    {{ plan.ples_estado==='A'? 'Activo':'Inactivo' }}
                  </v-chip>
                </td>
                <td>
                  <v-btn icon variant="text" @click.stop="abrirDialogoActualizarPlan(plan)"><v-icon>mdi-pencil</v-icon></v-btn>
                  <v-btn icon variant="text" @click.stop="toggleExpand(plan.ples_id)">
                    <v-icon>{{ isExpanded(plan.ples_id)? 'mdi-chevron-up':'mdi-chevron-down' }}</v-icon>
                  </v-btn>
                </td>
              </tr>
              <tr v-if="isExpanded(plan.ples_id)">
                <td colspan="6" class="expanded-section">
                  <div class="d-flex justify-space-between font-weight-bold mb-2">
                    <span>Planes Curriculares</span>
                    <v-btn small color="primary" variant="text" @click="abrirDialogoAgregarCurricular(plan)">+Agregar</v-btn>
                  </div>
                  <table v-if="(planCurriculares[plan.ples_id] || []).length" class="w-100">
                    <thead>
                      <tr>
                        <th>N°</th><th>Curso</th><th>Docente</th><th>Horas</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item,i) in paginatedCurr(plan.ples_id)" :key="item.pacu_id">
                        <td>{{ ((planCurrPage[plan.ples_id] ?? 1) - 1) * currItemsPerPage + i + 1 }}</td>
                        <td>{{ item.aede_nombre }}</td>
                        <td>{{ item.docente }}</td>
                        <td>{{ item.pacu_horas }}</td>
                        <td>{{ item.pacu_fecha_inicio }}</td>
                        <td>{{ item.pacu_fecha_fin }}</td>
                        <td>
                          <v-chip :color="item.pacu_estado==='A'? 'green':'red'">
                            {{ item.pacu_estado==='A'? 'Activo':'Inactivo' }}
                          </v-chip>
                        </td>
                        <td>
                          <v-btn icon variant="text" @click.stop="abrirDialogoActualizarCurricular(item)"><v-icon>mdi-pencil</v-icon></v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p v-else>No hay planes curriculares</p>
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
      <v-pagination v-if="totalPages > 1" v-model="currentPage" :length="totalPages" class="mt-4" />
    </div>

    <!-- VERSIÓN MOBILE -->
    <div v-else>
      <v-row dense>
        <v-col v-for="plan in paginatedPlanes" :key="plan.ples_id" cols="12" class="mb-4">
          <v-card>
            <v-card-text>
              <div><strong>Área:</strong> {{ plan.ared_nombre }}</div>
              <div><strong>Grado:</strong> {{ plan.grad_nombre }}</div>
              <div><strong>Horas:</strong> {{ plan.ples_horas }}</div>
              <div><strong>Estado:</strong>
                <v-chip :color="plan.ples_estado==='A'? 'green':'red'">
                  {{ plan.ples_estado==='A'? 'Activo':'Inactivo' }}
                </v-chip>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn text @click.stop="abrirDialogoActualizarPlan(plan)">Editar</v-btn>
              <v-btn text @click.stop="toggleExpand(plan.ples_id)">
                {{ isExpanded(plan.ples_id)? 'Ocultar Curriculares':'Ver Curriculares' }}
              </v-btn>
            </v-card-actions>
            <div v-if="isExpanded(plan.ples_id)" class="expanded-section">
              <div class="font-weight-bold mb-2">Planes Curriculares</div>
              <p v-if="!(planCurriculares[plan.ples_id]||[]).length">No hay planes curriculares</p>
              <v-row dense v-else>
                <v-col v-for="(item,i) in paginatedCurr(plan.ples_id)" :key="item.pacu_id" cols="12">
                  <v-card outlined class="mb-2">
                    <v-card-text>
                      <div><strong>N°:</strong> {{ ((planCurrPage[plan.ples_id] ?? 1) - 1) * currItemsPerPage + i + 1 }}</div>
                      <div><strong>Curso:</strong> {{ item.aede_nombre }}</div>
                      <div><strong>Docente:</strong> {{ item.docente }}</div>
                      <div><strong>Horas:</strong> {{ item.pacu_horas }}</div>
                      <div><strong>Inicio:</strong> {{ item.ad_pacu_fecha_inicio }}</div>
                      <div><strong>Fin:</strong> {{ item.ad_pacu_fecha_fin }}</div>
                      <div><strong>Estado:</strong>
                        <v-chip :color="item.ac_pacu_estado==='A'? 'green':'red'">
                          {{ item.ac_pacu_estado==='A'? 'Activo':'Inactivo' }}
                        </v-chip>
                      </div>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn icon variant="text" @click.stop="abrirDialogoActualizarCurricular(item)">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
              <v-pagination
                v-if="currTotalPages(plan.ples_id) > 1"
                v-model="planCurrPage[plan.ples_id]"
                :length="currTotalPages(plan.ples_id)"
                small
                class="mt-2"
              />
            </div>
          </v-card>
        </v-col>
      </v-row>
      <v-pagination v-if="totalPages > 1" v-model="currentPage" :length="totalPages" class="mt-4" />
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()
const isDesktop = mdAndUp

const anioEscolar = localStorage.getItem('anio_escolar')
const profile = localStorage.getItem('profile')
const token = localStorage.getItem('token')

const axiosInstance = axios.create({ baseURL: 'https://amsoftsolution.com/amss/ws/', headers: { Authorization: `Bearer ${token}` } })

const planesEstudio = ref([])
const planCurriculares = ref({})
const currentPage = ref(1)
const itemsPerPage = computed(() => isDesktop.value ? 10 : 5)

const planCurrPage = ref({})
const currItemsPerPage = computed(() => isDesktop.value ? 10 : 5)

const expandedId = ref(null)

const paginatedPlanes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return planesEstudio.value.slice(start, start + itemsPerPage.value)
})
const totalPages = computed(() => Math.ceil(planesEstudio.value.length / itemsPerPage.value))

function paginatedCurr(id) {
  const list = planCurriculares.value[id] || []
  const page = planCurrPage.value[id] || 1
  const start = (page - 1) * currItemsPerPage.value
  return list.slice(start, start + currItemsPerPage.value)
}

function currTotalPages(id) {
  return Math.ceil((planCurriculares.value[id]?.length || 0) / currItemsPerPage.value)
}

async function obtenerPlanesEstudio() {
  const { data } = await axiosInstance.get(`wsConsultaPlanEstudios.php?ac_anio_escolar=${anioEscolar}&av_profile=${profile}`)
  if (data.status) planesEstudio.value = data.data
}

async function obtenerPlanCurricular(id) {
  const { data } = await axiosInstance.get(`wsConsultaPlanCurricular.php?ai_ples_id=${id}&av_profile=${profile}`)
  if (data.status) planCurriculares.value[id] = data.data
}

function toggleExpand(id) {
  if (expandedId.value === id) {
    expandedId.value = null
  } else {
    expandedId.value = id
    obtenerPlanCurricular(id)
  }
}

function isExpanded(id) {
  return expandedId.value === id
}



onMounted(obtenerPlanesEstudio)

watch(currentPage, () => {
  expandedId.value = null
})


</script>

<style scoped>
th, td { padding: 12px 24px; }
.expanded-row { background-color: #e0f7fa; }
.expanded-section { background: #fafafa; padding: 12px; }
</style>
