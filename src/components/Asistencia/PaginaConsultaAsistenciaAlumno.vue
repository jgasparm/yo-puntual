<template>
  <v-container>
    <!-- Encabezado: Información del Alumno -->
    <v-card class="pa-2 mb-2">
      <v-card-title class="text-subtitle-3 font-weight-bold">
        Asistencia del alumno
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="6" md="3">
            <div><strong>Turno:</strong> {{ alumno.turno }}</div>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <div><strong>Nivel:</strong> {{ alumno.nivel }}</div>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <div><strong>Grado:</strong> {{ alumno.grado }}</div>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <div><strong>Sección:</strong> {{ alumno.seccion }}</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Filtro: Rango de Fechas -->
    <v-row dense>
      <v-col cols="12" md="6">
        <v-dialog v-model="menuFechaInicio" persistent max-width="320">
          <template #activator="{ props }">
            <v-text-field
              v-bind="props"
              label="Fecha inicial"
              v-model="filtros.fechaInicio"
              prepend-icon="mdi-calendar"
              dense
              outlined
              readonly
            />
          </template>
          <v-card>
            <v-card-title class="text-subtitle-2 font-weight-bold">
              Seleccionar Fecha
            </v-card-title>
            <v-date-picker
              v-model="fechaInicioObjeto"
              locale="es"
              color="primary"
              first-day-of-week="1"
              hide-header
            />
            <v-card-actions class="d-flex justify-end">
              <v-btn text @click="menuFechaInicio = false">Cancelar</v-btn>
              <v-btn color="primary" @click="actualizarFechaInicio">Aceptar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>

      <v-col cols="12" md="6">
        <v-dialog v-model="menuFechaFinal" persistent max-width="320">
          <template #activator="{ props }">
            <v-text-field
              v-bind="props"
              label="Fecha final"
              v-model="filtros.fechaFinal"
              prepend-icon="mdi-calendar"
              dense
              outlined
              readonly
            />
          </template>
          <v-card>
            <v-card-title class="text-subtitle-2 font-weight-bold">
              Seleccionar Fecha
            </v-card-title>
            <v-date-picker
              v-model="fechaFinalObjeto"
              locale="es"
              color="primary"
              first-day-of-week="1"
              hide-header
            />
            <v-card-actions class="d-flex justify-end">
              <v-btn text @click="menuFechaFinal = false">Cancelar</v-btn>
              <v-btn color="primary" @click="actualizarFechaFinal">Aceptar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>

    <!-- Botón de Consulta -->
    <v-row class="mt-2">
      <v-col cols="12" class="d-flex justify-end">
        <v-btn color="primary" small @click="consultarAsistencia">
          <v-icon left size="18">mdi-magnify</v-icon>
          Consultar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Resultados de Asistencia -->
    <v-card class="pa-2 mt-3 rounded-lg elevation-2">
      <v-card-title class="text-subtitle-3 font-weight-bold">
        Resultados de la Consulta
      </v-card-title>
      <v-divider></v-divider>

      

      <v-card-text>
        <!-- Vista para desktop: tabla -->
        <div v-if="isDesktop">
          <v-data-table
            :headers="headers"
            :items="resultados"
            class="elevation-2 bg-light-blue-lighten-5"
            no-data-text="No hay resultados disponibles"
            :loading="loading"
          >
          <template v-slot:progress>
            <v-progress-linear indeterminate color="primary"></v-progress-linear>
          </template>

            <template v-slot:header="{ headers }">
              <tr>
                <th
                  v-for="header in headers"
                  :key="header.key"
                  class="text-center"
                  @click="header.sort"
                  style="cursor: pointer;"
                >
                  {{ header.title }}
                  <v-icon small v-if="header.isSorted">
                    {{ header.isSortedDesc ? 'mdi-arrow-down' : 'mdi-arrow-up' }}
                  </v-icon>
                </th>
              </tr>
            </template>
            <template v-slot:item="{ item }">
              <tr>
                <td class="text-center">{{ item.fecha }}</td>
                <td class="text-center">{{ item.hora }}</td>
                <td class="text-center">
                  <v-chip :color="estadoColor(item.estado)" dark>
                    {{ item.estado }}
                  </v-chip>
                </td>
              </tr>
            </template>
          </v-data-table>
        </div>
        <!-- Vista para mobile: tarjetas con paginación -->
        <div v-else>
          <v-alert v-if="!resultados.length && !loading" type="info">
            No hay resultados disponibles
          </v-alert>

          <!-- 🔹 Overlay para bloquear la vista mientras carga -->
            <v-overlay v-if="loading" absolute class="d-flex align-center justify-center">
              <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
            </v-overlay>

          <v-row v-else dense>
            <v-col
              v-for="(item, index) in paginatedResultados"
              :key="index"
              cols="12"
              class="mb-2"
            >
              <v-card outlined>
                <v-card-title class="subtitle-2 font-weight-bold text-start">
                  {{ alumno.nombre }}
                </v-card-title>
                <v-card-text class="text-start">
                  <v-row dense>
                    <v-col cols="12">
                      <strong>Fecha:</strong> {{ item.fecha }}
                    </v-col>
                    <v-col cols="12">
                      <strong>Hora:</strong> {{ item.hora }}
                    </v-col>
                    <v-col cols="12">
                      <strong>Estado:</strong>
                      <v-chip :color="estadoColor(item.estado)" dark small>
                        {{ item.estado }}
                      </v-chip>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Paginación personalizada para mobile -->
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
      </v-card-text>
    </v-card>

  <!-- Modal de "No se encontraron resultados" -->
  <v-dialog v-model="dialogNoResults" max-width="400">
    <v-card>
      <v-card-title class="headline">No se encontraron resultados</v-card-title>
      <v-card-text>
        La consulta no arrojó resultados. Por favor, ajuste los filtros e intente nuevamente.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="dialogNoResults = false">Aceptar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  </v-container>
</template>

<script>
import axios from "axios";
import { useDisplay } from "vuetify";
export default {
  name: "PaginaConsultaAsistenciaAlumno",
  setup() {
    const { mdAndUp } = useDisplay();
    return { isDesktop: mdAndUp };
  },
  data() {
    return {
      // La información del alumno se cargará desde el API; se obtienen parámetros desde localStorage
      alumno: {
        nombre: "",
        turno: "",
        nivel: "",
        grado: "",
        seccion: ""
      },
      filtros: {
        fechaInicio: this.formatearFecha(new Date()),
        fechaFinal: this.formatearFecha(new Date())
      },
      menuFechaInicio: false,
      menuFechaFinal: false,
      fechaInicioObjeto: new Date(),
      fechaFinalObjeto: new Date(),
      resultados: [],
      loading: false,
      headers: [
        { title: "Fecha", key: "fecha", align: "center", sortable: true },
        { title: "Hora", key: "hora", align: "center", sortable: true },
        { title: "Estado", key: "estado", align: "center", sortable: true }
      ],
      currentPage: 1,
      itemsPerPage: 5,
      dialogNoResults: false,
    };
  },
  computed: {
    paginatedResultados() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.resultados.slice(start, start + this.itemsPerPage);
    },
    paginatedPages() {
      return Math.ceil(this.resultados.length / this.itemsPerPage);
    }
  },
  mounted() {
    const token = localStorage.getItem("token");
    const profile = localStorage.getItem("profile");
    const anio_escolar = localStorage.getItem("anio_escolar");
    const usua_id = localStorage.getItem("usua_id");
    if (!token || !profile) {
      console.warn("Falta token o profile en localStorage.");
      return;
    }
    this.cargarInformacionAlumno(token, profile, anio_escolar, usua_id);
  },
  methods: {
    formatearFecha(fecha) {
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).format(fecha);
    },
    toApiDate(dateString) {
      const [dia, mes, anio] = dateString.split("/");
      return `${anio}-${mes}-${dia}`;
    },
    actualizarFechaInicio() {
      this.filtros.fechaInicio = this.formatearFecha(this.fechaInicioObjeto);
      this.menuFechaInicio = false;
    },
    actualizarFechaFinal() {
      this.filtros.fechaFinal = this.formatearFecha(this.fechaFinalObjeto);
      this.menuFechaFinal = false;
    },
    async cargarInformacionAlumno(token, profile, anio_escolar, usua_id) {
      try {
        // Se obtienen los valores del localStorage
        const url = `https://amsoftsolution.com/amss/ws/wsConsultaInformacionAlumno.php?ai_usua_id=${usua_id}&ac_anio_escolar=${anio_escolar}&av_profile=${profile}`;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(url, config);
            if (response.data.status) {
              const data = response.data.data[0];
              this.alumno = {
                turno: data.turn_nombre,
                nivel: data.nive_nombre,
                grado: data.grad_nombre,
                seccion: data.secc_nombre
              };
            } else {
              console.error("Error al obtener información de alumno:", response.data.message);
            }
          } catch (error) {
        console.error("Error al obtener información de alumno:", error);
      }
    },
    async consultarAsistencia() {
      this.loading = true; 
      const profile = localStorage.getItem("profile");
      const anio_escolar = localStorage.getItem("anio_escolar");
      const usua_id = localStorage.getItem("usua_id");
      try {
        const fechaInicio = this.toApiDate(this.filtros.fechaInicio);
        const fechaFinal = this.toApiDate(this.filtros.fechaFinal);
        const baseUrl = "https://amsoftsolution.com/amss/ws/wsConsultaAsistenciaAlumno.php";
        const params = {
          ai_usua_id: usua_id,
          ai_hoes_id: 0,
          ac_fecha_inicial: fechaInicio,
          ac_fecha_final: fechaFinal,
          ac_tipo_registro: "T",
          ac_permiso: "T",
          ai_asju_id: 0,
          ac_aprobacion: "T",
          ai_asde_id: 0,
          ac_anio_escolar: anio_escolar,
          av_profile: profile,
        };
        const token = localStorage.getItem("token");
        const configReq = {
          params,
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.get(baseUrl, configReq);
        if (response.data.status) {
          if (Array.isArray(response.data.data)) {
            this.resultados = response.data.data.map(item => ({
              fecha: item.fecha_asistencia,
              hora: item.hora_asistencia,
              estado: item.horario_estado_descripcion
            }));
          } else {
            this.resultados = [];
            this.dialogNoResults = true; // <-- Agregar esta línea para mostrar el modal
          }
        } else {
          console.error("Error en la respuesta:", response.data.message);
          this.resultados = [];
          this.dialogNoResults = true; // <-- Agregar esta línea para mostrar el modal
        }
      } catch (error) {
        console.error("Error al consultar asistencia:", error);
        this.resultados = [];
      } finally {
        this.loading = false;
      }
    },
    exportarCSV() {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        ["Alumno,Fecha,Estado"]
          .concat(this.resultados.map(row => `${row.fecha},${row.hora},${row.estado}`))
          .join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "asistencia.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    estadoColor(estado) {
      if (estado === "ENTRADA" || estado === "SALIDA") return "green";
      if (estado === "Tardanza") return "orange";
      return "red";
    }
  }
};
</script>
<style scoped>
.my-overlay {
  z-index: 9999;
  background-color: rgba(255, 0, 0, 0.3);
}
</style>
