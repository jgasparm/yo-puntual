<template>
  <v-container>
    <!-- Título principal -->
    <v-row class="mb-4">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold text-primary">
          👨‍💼 Consulta de Asistencia del Empleado
        </h2>
        <p class="text-body-2 text-grey-darken-1">
          Visualiza los registros de asistencia del trabajador para un rango de fechas específico.
        </p>
      </v-col>
    </v-row>

    <!-- Información del Empleado -->
    <v-card class="pa-2 mb-2">
      <v-card-title class="text-subtitle-3 font-weight-bold">
        <v-icon left size="18">mdi-account-badge</v-icon>
        Información del Empleado
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="6" md="3">
            <div><strong>Area:</strong> {{ empleado.area }}</div>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <div><strong>Cargo:</strong> {{ empleado.cargo }}</div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Filtros de Fecha -->
    <v-row dense>
      <v-col cols="12" md="6">
        <v-text-field label="Fecha inicial" v-model="filtros.fechaInicio" prepend-icon="mdi-calendar" dense outlined readonly @click="menuFechaInicio = true" />
        <v-dialog v-model="menuFechaInicio" persistent max-width="320">
          <v-date-picker v-model="fechaInicioObjeto" locale="es" color="primary" @update:model-value="actualizarFechaInicio" />
        </v-dialog>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field label="Fecha final" v-model="filtros.fechaFinal" prepend-icon="mdi-calendar" dense outlined readonly @click="menuFechaFinal = true" />
        <v-dialog v-model="menuFechaFinal" persistent max-width="320">
          <v-date-picker v-model="fechaFinalObjeto" locale="es" color="primary" @update:model-value="actualizarFechaFinal" />
        </v-dialog>
      </v-col>
    </v-row>

    <!-- Alertas -->
    <v-alert v-if="alertaRangoLargo" type="info" color="orange" dense outlined class="my-3">
      Estás consultando un rango mayor a 30 días. La carga podría demorar más de lo habitual.
    </v-alert>
    <v-alert v-if="alertaAnioInvalido" type="error" color="red" dense outlined class="my-3">
      Las fechas seleccionadas deben pertenecer al año escolar {{ anioEscolar }}.
    </v-alert>

    <!-- Botón de Consulta -->
    <v-row class="mt-2">
      <v-col cols="12" class="d-flex justify-end">
        <v-btn color="primary" small @click="consultarAsistencia" :loading="loading">
          <v-icon left size="18">mdi-magnify</v-icon>
          Consultar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Resultados -->
    <v-card class="pa-2 mt-3 rounded-lg elevation-2" v-if="resultados.length">
      <v-card-title class="text-subtitle-3 font-weight-bold">
        Resultados de la Consulta
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <div v-if="isDesktop">
          <v-data-table :headers="headers" :items="resultados" class="elevation-2 bg-light-blue-lighten-5" :loading="loading" no-data-text="No hay resultados disponibles">
            <template v-slot:item.estado="{ item }">
              <v-chip :color="estadoColor(item.estado)" dark>{{ item.estado }}</v-chip>
            </template>
          </v-data-table>
        </div>
        <div v-else>
          <v-alert v-if="!resultados.length && !loading" type="info">
            No hay resultados disponibles
          </v-alert>
          <v-overlay v-if="loading" absolute class="d-flex align-center justify-center">
            <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
          </v-overlay>
          <v-row v-else dense>
            <v-col v-for="(item, index) in paginatedResultados" :key="index" cols="12" class="mb-2">
              <v-card outlined>
                <v-card-title class="subtitle-2 font-weight-bold text-start">
                  <v-icon left size="18">mdi-calendar-clock</v-icon>
                  {{ item.fecha }}
                </v-card-title>
                <v-card-text class="text-start">
                  <div><strong>Hora:</strong> {{ item.hora }}</div>
                  <div><strong>Estado:</strong> <v-chip :color="estadoColor(item.estado)" dark small>{{ item.estado }}</v-chip></div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-pagination v-if="paginatedPages > 1" v-model="currentPage" :length="paginatedPages" :total-visible="3" show-first-last first-icon="mdi-chevron-double-left" last-icon="mdi-chevron-double-right" prev-icon="mdi-chevron-left" next-icon="mdi-chevron-right" class="mt-2 custom-pagination" />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="success" small @click="exportarCSV">
          <v-icon left>mdi-file-export</v-icon>
          Exportar CSV
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Modal sin resultados -->
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
  name: "PaginaConsultaAsistenciaEmpleado",
  setup() {
    const { mdAndUp } = useDisplay();
    return { isDesktop: mdAndUp };
  },
  data() {
    return {
      empleado: { area: "", cargo: "" },
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
      alertaAnioInvalido: false,
      alertaRangoLargo: false,
      anioEscolar: localStorage.getItem("anio_escolar"),
      dialogNoResults: false,
      currentPage: 1,
      itemsPerPage: 5,
      headers: [
        { title: "Fecha", key: "fecha", align: "center" },
        { title: "Hora", key: "hora", align: "center" },
        { title: "Estado", key: "estado", align: "center" }
      ]
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
    const usua_id = localStorage.getItem("usua_id");
    if (token && profile) {
      this.cargarInformacionEmpleado(token, profile, usua_id);
    }
  },
  methods: {
    formatearFecha(fecha) {
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit", month: "2-digit", year: "numeric"
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
    async cargarInformacionEmpleado(token, profile, usua_id) {
      try {
        const url = `https://amsoftsolution.com/amss/ws/wsConsultaInformacionEmpleado.php?ai_usua_id=${usua_id}&av_profile=${profile}`;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(url, config);
        if (response.data.status) {
          const data = response.data.data[0];
          this.empleado = {
            area: data.area_descripcion,
            cargo: data.emca_descripcion,
          };
        }
      } catch (error) {
        console.error("Error al obtener información del empleado:", error);
      }
    },
    async consultarAsistencia() {
      this.loading = true;
      const profile = localStorage.getItem("profile");
      const usua_id = localStorage.getItem("usua_id");
      try {
        const fechaInicio = this.toApiDate(this.filtros.fechaInicio);
        const fechaFinal = this.toApiDate(this.filtros.fechaFinal);
        const anioInicio = new Date(fechaInicio).getFullYear();
        const anioFinal = new Date(fechaFinal).getFullYear();
        const anioEscolar = parseInt(this.anioEscolar);
        this.alertaAnioInvalido = anioInicio !== anioEscolar || anioFinal !== anioEscolar;
        if (this.alertaAnioInvalido) {
          this.loading = false;
          return;
        }
        const diff = (new Date(fechaFinal) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24);
        this.alertaRangoLargo = diff > 30;

        const url = "https://amsoftsolution.com/amss/ws/wsConsultaAsistenciaEmpleado.php";
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
          av_profile: profile,
        };
        const token = localStorage.getItem("token");
        const configReq = {
          params,
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.get(url, configReq);
        if (response.data.status && Array.isArray(response.data.data)) {
          this.resultados = response.data.data.map(item => ({
            fecha: item.fecha_asistencia,
            hora: item.hora_asistencia,
            estado: item.horario_estado_descripcion
          }));
        } else {
          this.resultados = [];
          this.dialogNoResults = true;
        }
      } catch (error) {
        console.error("Error al consultar asistencia:", error);
        this.resultados = [];
      } finally {
        this.loading = false;
      }
    },
    exportarCSV() {
      const encabezado = [
        `Fecha: ${this.filtros.fechaInicio} a ${this.filtros.fechaFinal}`,
        '',
        'Fecha,Hora,Estado'
      ];
      const filas = this.resultados.map(row => (
        `${row.fecha},${row.hora},${row.estado}`
      ));
      const csvContent = 'data:text/csv;charset=utf-8,' + [...encabezado, ...filas].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "asistencia_empleado.csv");
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