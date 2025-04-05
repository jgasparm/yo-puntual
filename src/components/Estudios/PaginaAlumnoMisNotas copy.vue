<template>
  <v-container class="px-4">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <!-- Información del Alumno -->
        <v-card class="mb-4" v-if="alumno">
          <v-card-title>
            <v-row>
              <v-col cols="12" sm="6">
                <div class="d-flex flex-row align-center">
                  <strong class="mr-1">Turno:</strong>
                  <span :title="alumno.turn_nombre">{{ alumno.turn_nombre }}</span>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="d-flex flex-row align-center">
                  <strong class="mr-1">Nivel:</strong>
                  <span :title="alumno.nive_nombre">{{ alumno.nive_nombre }}</span>
                </div>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <div class="d-flex flex-row align-center">
                  <strong class="mr-1">Grado:</strong>
                  <span :title="alumno.grad_nombre">{{ alumno.grad_nombre }}</span>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="d-flex flex-row align-center">
                  <strong class="mr-1">Sección:</strong>
                  <span :title="alumno.secc_nombre">{{ alumno.secc_nombre }}</span>
                </div>
              </v-col>
            </v-row>
          </v-card-title>
        </v-card>

        <!-- Mensaje de error y Loader -->
        <v-alert type="error" v-if="error">{{ error }}</v-alert>
        <v-skeleton-loader v-if="loading" type="card"></v-skeleton-loader>

        <!-- Información agrupada por Bimestre y Curso -->
        <div v-if="bimestres.length">
          <div v-for="(bimester) in bimestres" :key="bimester.peed_id">
            <v-card class="mb-2">
              <v-card-title class="text-h6 text-center">
                {{ bimester.peed_nombre }}
              </v-card-title>
            </v-card>

            <!-- Iteramos sobre cada curso del bimestre -->
            <div v-for="(course) in bimester.cursos" :key="course.aede_id">
              <v-expansion-panels>
                <v-expansion-panel
                  v-for="(courseData, dIndex) in course.cursos_data"
                  :key="dIndex"
                  class="mb-4"
                >
                  <!-- Título del panel -->
                  <v-expansion-panel-title>
                    <!-- Layout para desktop -->
                    <div class="d-none d-md-block w-100">
                      <v-row>
                        <v-col cols="6">
                          <div class="text-h6 font-weight-bold curso"
                               :title="`Curso: ${course.aede_nombre}`">
                            <strong>Curso:</strong> {{ course.aede_nombre }}
                          </div>
                        </v-col>
                        <v-col cols="6" class="text-right">
                          <div class="text-h6 font-weight-bold bimestre"
                               :title="`Promedio: ${courseData.pcal_promedio_periodo} (${courseData.pcal_promedio_periodo_letra})`">
                            Promedio: <span>{{ courseData.pcal_promedio_periodo }}</span>
                            ({{ courseData.pcal_promedio_periodo_letra }})
                          </div>
                        </v-col>
                      </v-row>
                      <!-- Ahora el docente en una línea completa sin truncar -->
                      <v-row>
                        <v-col cols="12">
                          <div class="text-h6 font-weight-bold docente docente-wrap"
                               :title="`Docente: ${courseData.docente}`">
                            <strong>Docente:</strong> {{ courseData.docente }}
                          </div>
                        </v-col>
                      </v-row>
                    </div>

                    <!-- Layout para mobile -->
                    <div class="d-md-none w-100">
                      <v-row>
                        <v-col cols="12">
                          <div class="text-h6 font-weight-bold curso"
                               :title="`Curso: ${course.aede_nombre}`">
                            <strong>Curso:</strong> {{ course.aede_nombre }}
                          </div>
                        </v-col>
                        <v-col cols="12">
                          <div class="text-h6 font-weight-bold docente docente-wrap"
                               :title="`Docente: ${courseData.docente}`">
                            <strong>Docente:</strong> {{ courseData.docente }}
                          </div>
                        </v-col>
                        <v-col cols="12" class="text-center">
                          <div class="bimestre"
                               :title="`Promedio: ${courseData.pcal_promedio_periodo} (${courseData.pcal_promedio_periodo_letra})`">
                            Promedio: <span>{{ courseData.pcal_promedio_periodo }}</span>
                            ({{ courseData.pcal_promedio_periodo_letra }})
                          </div>
                        </v-col>
                      </v-row>
                    </div>
                  </v-expansion-panel-title>

                  <!-- Contenido colapsable: evaluaciones y notas -->
                  <v-expansion-panel-text>
                    <v-expansion-panels v-if="courseData.cursos_promedios && courseData.cursos_promedios.length">
                      <v-expansion-panel
                        v-for="(evaluacion) in courseData.cursos_promedios"
                        :key="evaluacion.eval_id"
                      >
                        <v-expansion-panel-title>
                          <div class="truncate" :title="evaluacion.eval_nombre">
                            {{ evaluacion.eval_nombre }}
                          </div>
                          <div class="ml-2 truncate"
                               :title="`Promedio: ${evaluacion.pcae_promedio_evaluacion} (${evaluacion.pcae_promedio_evaluacion_letra})`">
                            - Promedio: {{ evaluacion.pcae_promedio_evaluacion }}
                            ({{ evaluacion.pcae_promedio_evaluacion_letra }})
                          </div>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <v-list>
                            <v-list-item
                              v-for="(nota) in evaluacion.cursos_notas"
                              :key="nota.reau_id"
                            >
                              <v-list-item-content
                                :title="`Nota: ${nota.reau_evaluacion} (${nota.reau_evaluacion_letra})`">
                                {{ nota.reau_evaluacion }} ({{ nota.reau_evaluacion_letra }})
                              </v-list-item-content>
                            </v-list-item>
                          </v-list>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const alumno = ref(null)
const bimestres = ref([])

const loading = ref(false)
const error = ref('')

// Recuperar token y otros parámetros desde localStorage
const token = localStorage.getItem("token")
const profile = localStorage.getItem("profile")
const anio_escolar = localStorage.getItem("anio_escolar")
const usua_id = localStorage.getItem("usua_id")

if (!token || !profile || !anio_escolar || !usua_id) {
  error.value = "Faltan parámetros de autenticación en localStorage."
}

// Obtener información del alumno
const fetchAlumnoInfo = async () => {
  try {
    const url = `https://amsoftsolution.com/amss/ws/wsConsultaInformacionAlumno.php?ai_usua_id=${usua_id}&ac_anio_escolar=${anio_escolar}&av_profile=${profile}`
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
    if (response.data?.status && response.data.data?.length) {
      alumno.value = response.data.data[0]
    } else {
      error.value = 'No se pudo obtener la información del alumno'
    }
  } catch (err) {
    error.value = 'Error al obtener la información del alumno'
    console.error(err)
  }
}

// Obtener la información de los bimestres (ya agrupada según la estructura del API)
const fetchBimestresInfo = async () => {
  try {
    const url = `https://amsoftsolution.com/amss/ws/wsConsultaRegistroAuxiliarAlumno.php?ai_usua_id=${usua_id}&ac_anio_escolar=${anio_escolar}&av_profile=${profile}`
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
    if (response.data?.status && response.data.data?.length) {
      bimestres.value = response.data.data
    } else {
      error.value = 'No se pudo obtener la información de los cursos'
    }
  } catch (err) {
    error.value = 'Error al obtener la información de los cursos'
    console.error(err)
  }
}

// Cargar datos al montar el componente
onMounted(async () => {
  if (!error.value) {
    loading.value = true
    await Promise.all([fetchAlumnoInfo(), fetchBimestresInfo()])
    loading.value = false
  }
})
</script>

<style scoped>
/* Añadimos padding lateral al contenedor principal */
.v-container {
  padding-left: 16px;
  padding-right: 16px;
}

/* Permitir que el nombre del docente se envuelva en múltiples líneas */
.docente-wrap {
  overflow: visible;
  white-space: normal;
  word-break: break-word;
}

/* Truncar texto con puntos suspensivos */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  display: inline-block;
}

/* Resaltar docente y curso */
.docente,
.curso {
  color: #1976D2;
}

/* Espaciado extra para el encabezado del curso */
.v-card-subtitle.py-2 {
  padding-top: 16px !important;
  padding-bottom: 16px !important;
}

/* Estilos responsivos para fuentes */
@media (max-width: 600px) {
  .docente,
  .curso,
  .bimestre {
    font-size: 1.1rem;
  }
  .v-card-title div {
    font-size: 0.95rem;
  }
}
@media (min-width: 601px) and (max-width: 960px) {
  .docente,
  .curso,
  .bimestre {
    font-size: 1.2rem;
  }
}
@media (min-width: 961px) and (max-width: 1264px) {
  .docente,
  .curso,
  .bimestre {
    font-size: 1.3rem;
  }
}
@media (min-width: 1265px) {

  .docente,
  .curso,
  .bimestre {
    font-size: 1.4rem;
  }
}
</style>
