<template>
  <v-container class="px-4">
    <v-row>
      <v-col cols="12">
        <div class="text-h5 font-weight-bold text-primary mb-2">
          📚 Consulta de Notas
        </div>
        <div class="text-body-2 text-grey-darken-1">
          Revisa tus promedios y notas por bimestre y curso.
        </div>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" md="8">
        <!-- Información del Alumno -->
        <v-card class="mb-4" v-if="alumno">
          <v-card-title>
            <v-sheet color="blue-lighten-5" class="pa-4 mb-4 rounded-lg elevation-1">
  <v-row>
    <v-col cols="12">
      <div class="text-h6 font-weight-bold text-primary mb-2">
        🧑‍🎓 Información del Alumno
      </div>
    </v-col>

    <v-col cols="12" sm="6">
      <div class="info-line">
        <v-icon color="primary" start>mdi-clock-outline</v-icon>
        <strong>Turno:</strong> <span>{{ alumno.turn_nombre }}</span>
      </div>
    </v-col>

    <v-col cols="12" sm="6">
      <div class="info-line">
        <v-icon color="primary" start>mdi-school</v-icon>
        <strong>Nivel:</strong> <span>{{ alumno.nive_nombre }}</span>
      </div>
    </v-col>

    <v-col cols="12" sm="6">
      <div class="info-line">
        <v-icon color="primary" start>mdi-numeric</v-icon>
        <strong>Grado:</strong> <span>{{ alumno.grad_nombre }}</span>
      </div>
    </v-col>

    <v-col cols="12" sm="6">
      <div class="info-line">
        <v-icon color="primary" start>mdi-alpha-s-circle-outline</v-icon>
        <strong>Sección:</strong> <span>{{ alumno.secc_nombre }}</span>
      </div>
    </v-col>
  </v-row>
</v-sheet>

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
                <strong>{{ bimester.peed_nombre }}</strong>
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
                               <strong><v-icon left small color="primary">mdi-book</v-icon>Curso:</strong> {{ course.aede_nombre }}
                          </div>
                        </v-col>
                        <v-col cols="6" class="text-right">
                          <div class="text-h6 font-weight-bold bimestre"
                               :title="`Promedio: ${courseData.pcal_promedio_periodo_letra}`">
                            Promedio: <span>{{ courseData.pcal_promedio_periodo_letra }}</span>
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
                               <strong><v-icon left small color="primary">mdi-book</v-icon>Curso:</strong> {{ course.aede_nombre }}
                          </div>
                        </v-col>
                        <v-col cols="12">
                          <div class="text-h6 font-weight-bold docente docente-wrap"
                               :title="`Docente: ${courseData.docente}`">
                            <strong>Docente:</strong> {{ courseData.docente }}
                          </div>
                        </v-col>
                        <v-col cols="12" class="text-center">
                          <strong>
                          <div class="bimestre"
                               :title="`Promedio: ${courseData.pcal_promedio_periodo_letra}`">
                            Promedio: <span>{{ courseData.pcal_promedio_periodo_letra }}</span>
                          </div>
                        </strong>
                        </v-col>
                      </v-row>
                    </div>
                  </v-expansion-panel-title>

                  <!-- Mensaje motivacional si el promedio es mayor o igual a 18 -->
<v-alert
  type="success"
  dense
  border="start"
  color="green lighten-4"
  class="mb-2"
  v-if="courseData.pcal_promedio_periodo >= 18"
>
  🎉 ¡Felicitaciones! Excelente promedio en este curso.
</v-alert>

                  <!-- Contenido colapsable: evaluaciones y notas -->
                  <v-expansion-panel-text>
                    <v-expansion-panels v-if="courseData.cursos_promedios && courseData.cursos_promedios.length">
                      <v-expansion-panel
                        v-for="(evaluacion) in courseData.cursos_promedios"
                        :key="evaluacion.eval_id"
                      >
                      <v-expansion-panel-title class="expansion-title-responsive">
                        <div class="line" :title="evaluacion.eval_nombre">
                          {{ evaluacion.eval_nombre }}
                        </div>
                        <div class="line promedio"
                            :title="`Promedio: ${evaluacion.pcae_promedio_evaluacion_letra}`">
                          Promedio: {{ evaluacion.pcae_promedio_evaluacion_letra }}
                        </div>
                      </v-expansion-panel-title>

                        <v-expansion-panel-text>
                          <v-list>
                            <v-list-item
                              v-for="(nota, index) in evaluacion.cursos_notas"
                              :key="nota.reau_id"
                            >
                            <v-list-item-content>
                              <strong>
                                Nota {{ index + 1 }}:
                              </strong>
                              {{ nota.reau_evaluacion_letra }}
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
.info-line {
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
}
.v-list-item-content {
  font-size: 1rem;
  line-height: 1.4;
}
.v-expansion-panel {
  background-color: #f9f9fb; /* fondo claro suave */
}
.expansion-title-responsive {
  display: flex;
  flex-direction: column; /* <-- forzar disposición en columna (una línea abajo de otra) */
  /*align-items: center;*/
  gap: 4px; /* Espacio entre evaluación y promedio */
}
.expansion-title-responsive .line {
    font-weight: 500;
    font-size: 1.1rem;
    line-height: 1.6;
    /*white-space: nowrap;*/
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
    /*overflow: hidden;
    text-overflow: ellipsis;*/
  }
  .expansion-title-responsive .line.promedio {
  font-weight: bold;
  color: #1976D2;
}
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
  .info-line {
    font-size: 1rem;
    justify-content: center;
    text-align: center;
    flex-wrap: wrap;
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
