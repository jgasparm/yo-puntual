<template>
  <v-container>
    <!-- Fila 1: Niveles Académicos -->
    <v-card class="pa-2 mb-2">
      <v-card-title class="text-subtitle-3 font-weight-bold">
        <v-icon left size="18">mdi-school</v-icon>
        Niveles Académicos
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="3">
            <v-select
              label="Turno"
              :items="turnos"
              v-model="filtros.turno"
              item-title="turn_nombre"
              item-value="turn_id"
              dense
              outlined
              solo
              hide-no-data
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              label="Nivel"
              :items="niveles"
              v-model="filtros.nivel"
              item-title="nive_nombre"
              item-value="nive_id"              
              dense
              outlined
              solo
              hide-no-data
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              label="Grado"
              :items="grados"
              v-model="filtros.grado"
              item-title="grad_nombre"
              item-value="grad_id"
              dense
              outlined
              solo
              hide-no-data
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              label="Sección"
              :items="secciones"
              v-model="filtros.seccion"
              item-title="secc_nombre"
              item-value="secc_id"
              dense
              outlined
              solo
              hide-no-data
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Fila 2: Alumno y Rango de Fechas -->
    <v-row dense>
      <v-col cols="12" md="6">
        <v-card class="pa-2">
          <v-card-title class="text-subtitle-3 font-weight-bold">
            <v-icon left size="18">mdi-account</v-icon>
            Alumno
          </v-card-title>
          <v-card-text>
            <!-- El v-autocomplete usa return-object para que el v-model sea el objeto completo -->
            <v-autocomplete
              v-if="alumnos.length"
              label="Alumno"
              :items="alumnos"
              v-model="filtros.alumno"
              :item-title="itemTitle"
              item-value="pers_id"
              return-object
              dense
              outlined
              clearable
              solo
              hide-no-data
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Resto del código de fechas y resultados se mantiene igual -->
      <v-col cols="12" md="6">
        <v-card class="pa-2">
          <v-card-title class="text-subtitle-3 font-weight-bold">
            <v-icon left size="18">mdi-calendar</v-icon>
            Rango de Fechas
          </v-card-title>
          <v-card-text>
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
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Botón de consulta -->
    <v-row class="mt-2">
      <v-col cols="12" class="d-flex justify-end">
        <v-btn color="primary" small @click="consultarAsistencia">
          <v-icon left size="18">mdi-magnify</v-icon>
          Consultar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Resultados -->
    <v-card class="pa-2 mt-3 rounded-lg elevation-2">
      <v-card-title class="text-subtitle-3 font-weight-bold d-flex align-center">
        <v-icon left size="18">mdi-table</v-icon>
        Resultados de la Consulta
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>

        <v-data-table
          :headers="headers"
          :items="resultados"
          class="elevation-2 bg-light-blue-lighten-5"
          no-data-text="No hay resultados disponibles"
        >
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
              <td class="text-left">{{ item.alumno }}</td>
              <td class="text-center">{{ item.fecha }}</td>
              <td class="text-center">{{ item.hora }}</td>
              <td class="text-center">
                <v-chip :color="estadoColor(item.estado)" dark>
                  {{ item.estado }}
                </v-chip>
              </td>
              <td class="text-center">{{ item.turno }}</td>
              <td class="text-center">{{ item.nivel }}</td>
              <td class="text-center">{{ item.grado }}</td>
              <td class="text-center">{{ item.seccion }}</td>
            </tr>
          </template>
        </v-data-table>       

      </v-card-text>
      <v-card-actions v-if="resultados.length">
        <v-spacer></v-spacer>
        <v-btn color="success" small @click="exportarCSV">
          <v-icon left>mdi-file-export</v-icon>
          Exportar CSV
        </v-btn>
      </v-card-actions>
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
export default {
  name: "PaginaConsultaAsistenciaAlumnos",
  data() {
    return {
      
      filtros: {
        turno: 0,
        nivel: 0,
        grado: 0,
        seccion: 0,
        alumno: 0,
        fechaInicio: this.formatearFecha(new Date()),
        fechaFinal: this.formatearFecha(new Date()),
      },
      turnosAll: [],
      nivelesAll: [],
      gradosAll: [],
      seccionesAll: [],
      alumnosAll: [],
      turnos: [],
      niveles: [],
      grados: [],
      secciones: [],
      alumnos: [],
      menuFechaInicio: false,
      menuFechaFinal: false,
      fechaInicioObjeto: new Date(),
      fechaFinalObjeto: new Date(),
      resultados: [],
       headers: [
         { title: "Alumno", key: "alumno", align: "center", sortable: true },
         { title: "Fecha", key: "fecha", align: "center", sortable: true },
         { title: "Hora", key: "hora", align: "center", sortable: true },
         { title: "Estado", key: "estado", align: "center", sortable: true },
         { title: "Turno", key: "turno", align: "center", sortable: true },
         { title: "Nivel", key: "nivel", align: "center", sortable: true },
         { title: "Grado", key: "grado", align: "center", sortable: true },
         { title: "Seccion", key: "seccion", align: "center", sortable: true }, 
       ],
      
      loading: false,
      dialogNoResults: false,
    };
  },
  mounted() {
    const token = localStorage.getItem("token");
    const profile = localStorage.getItem("profile");
    const anio_academico = localStorage.getItem("anio_academico");
    if (!token || !profile) {
      console.warn("Falta token o profile en localStorage.");
      return;
    }
    // await this.cargarFiltrosAlumno(profile, token);
    // this.onChangeNivel();
    // this.cargarListaAlumno(anio_academico, profile, token);

    this.cargarListaAlumno(anio_academico, profile, token);
    this.cargarFiltrosAlumno(profile, token)
    .then(() => {
      this.onChangeNivel();
    })
    .catch(error => {
      console.error("Error al cargar filtros:", error);
    });
    
  },
  methods: {
    // Función que devuelve la descripción para el item-title
    itemTitle(item) {
      return item ? item.persona_descripcion : "";
    },
    async cargarFiltrosAlumno(profile, token) {
      try {
        const url = `https://amsoftsolution.com/amss/ws/wsConsultaFiltrosAlumno.php?av_profile=${profile}`;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(url, config);
        if (response.data.status) {
          const { turnos, niveles, grados, secciones } = response.data.data;
          this.turnosAll = turnos;
          this.turnos = [
             { turn_id: 0, turn_nombre: "TODOS" },
             ...this.turnosAll
           ]
          this.filtros.turno = 0 // Objeto con turn_id=0, turn_nombre="TODOS"
          
          this.nivelesAll = niveles;
          this.niveles = [
             { nive_id: 0, nive_nombre: "TODOS" },
             ...this.nivelesAll
           ]
          this.filtros.nivel = 0 // Objeto con nive_id=0, nive_nombre="TODOS"

          this.gradosAll = grados;
          this.grados = [
             { grad_id: 0, grad_nombre: "TODOS" },
             ...this.gradosAll
           ]
          this.filtros.grado = 0

          this.seccionesAll = secciones;
          this.secciones = [
             { secc_id: 0, secc_nombre: "TODOS" },
             ...this.seccionesAll
           ]
          this.filtros.seccion = 0

        } else {
          console.error("Error al obtener catálogos:", response.data.message);
        }
      } catch (error) {
        console.error("Error en cargarFiltrosAlumno:", error);
      }
    },
    async cargarListaAlumno(anio_academico, profile, token) {
      try {
        const url = `https://amsoftsolution.com/amss/ws/wsListaAlumnosMatriculados.php?ac_anio_academico=${anio_academico}&ac_indicador_todos=S&av_profile=${profile}`;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(url, config);
        if (response.data.status) {
          const data = response.data.data;
          this.alumnosAll = data;
          // Asignamos el array completo de objetos
          this.alumnos = this.alumnosAll;
          // Si existe la opción TODOS (pers_id === 0), se asigna como valor inicial
          const todos = this.alumnos.find(item => item.pers_id === 0);
          if (todos) {
            this.filtros.alumno = todos;
          }
        } else {
          console.error("Error al obtener alumnos:", response.data.message);
        }
      } catch (error) {
        console.error("Error en cargarListaAlumno:", error);
      }
    },
    formatearFecha(fecha) {
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(fecha);
    },
    toApiDate(dateString) {
      const [dia, mes, anio] = dateString.split("/");
      return `${anio}-${mes}-${dia}`;
    },
    onChangeNivel() {
      const nivelId = this.filtros.nivel;
      if (!nivelId || nivelId === 0) {
        // Seleccionó "TODOS"
        this.grados = [{ grad_id: 0, grad_nombre: "TODOS" }];
        this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }];
        this.filtros.grado = this.grados[0].grad_id;
        this.filtros.seccion = this.secciones[0].secc_id;
        return;
      }

      // Filtrar los grados que pertenezcan a ese nivel
      const gradosFiltrados = this.gradosAll.filter(
        g => g.nive_id === nivelId
      );

      this.grados = [
          { grad_id: 0, grad_nombre: "TODOS" },
          ...gradosFiltrados
        ];
        this.filtros.grado = this.grados[0].grad_id;  // "TODOS"
        // Resetear sección
        this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }];
        this.filtros.seccion = this.secciones[0].secc_id;
    },

    onChangeGrado() {
      const gradoId = this.filtros.grado;
      if (!gradoId || gradoId === 0) {
        // Seleccionó "TODOS"
        this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }];
        this.filtros.seccion = this.secciones[0].secc_id;
        return;
      }

      // Filtrar las secciones que pertenezcan a ese grado
      const seccionesFiltrados = this.seccionesAll.filter(
        g => g.grad_id === gradoId
      );

      this.secciones = [
          { secc_id: 0, secc_nombre: "TODOS" },
          ...seccionesFiltrados
        ];
        this.filtros.seccion = this.secciones[0].secc_id;  // "TODOS"
    },
    async consultarAsistencia() {
      this.$root.loading = true;
      console.log("Overlay ref:", this.$refs.overlay);
      console.log("Loading activado:", this.loading);
      await this.$nextTick(); // Permite que el overlay se renderice antes de la petición
      await new Promise(resolve => setTimeout(resolve, 2000));
      const profile = localStorage.getItem("profile");
      const anio_academico = localStorage.getItem("anio_academico");
      try {
        const fechaInicio = this.toApiDate(this.filtros.fechaInicio);
        const fechaFinal = this.toApiDate(this.filtros.fechaFinal);
        const baseUrl = "https://amsoftsolution.com/amss/ws/wsConsultaAsistenciaAlumno.php";
        const params = {
          // ac_alum_turno: this.filtros.turno === "TODOS" ? 0 : this.filtros.turno,
          ac_alum_turno: this.filtros.turno,
          ac_alum_nivel: this.filtros.nivel,
          ac_alum_grado: this.filtros.grado,
          ac_alum_seccion: this.filtros.seccion,
          ai_pers_id: this.filtros.alumno ? this.filtros.alumno.pers_id : 0,
          ai_hoes_id: 0,
          ac_fecha_inicial: fechaInicio,
          ac_fecha_final: fechaFinal,
          ac_tipo_registro: "T",
          ac_permiso: "T",
          ai_asju_id: 0,
          ac_aprobacion: "T",
          ai_asde_id: 0,
          ac_anio_academico: anio_academico,
          av_profile: profile,
        };
        console.log(params);
        const token = localStorage.getItem("token");
        const configReq = {
          params,
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.get(baseUrl, configReq);
        console.log("Respuesta del servicio:", response.data);
        if (response.data.status) {
          if (Array.isArray(response.data.data)) {
            this.resultados = response.data.data.map(item => ({
              alumno: item.alumno_descripcion,
              fecha: item.fecha_asistencia,
              hora: item.hora_asistencia,
              estado: item.horario_estado_descripcion,
              turno: item.turno_descripcion,
              nivel: item.nivel_descripcion,
              grado: item.grado_descripcion,
              seccion: item.seccion_descripcion
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
        console.log("Desactivando loading overlay");
        this.$root.loading = false;
      }
    },
    exportarCSV() {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        ["Alumno,Fecha,Estado"]
          .concat(this.resultados.map(row => `${row.alumno},${row.fecha},${row.estado},${row.turno},${row.nivel},${row.grado},${row.seccion}`))
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
    },
    actualizarFechaInicio() {
      this.filtros.fechaInicio = this.formatearFecha(this.fechaInicioObjeto);
      this.menuFechaInicio = false;
    },
    actualizarFechaFinal() {
      this.filtros.fechaFinal = this.formatearFecha(this.fechaFinalObjeto);
      this.menuFechaFinal = false;
    },
  },
  watch: {
    "filtros.nivel": function () {
      this.onChangeNivel();
    },
    "filtros.grado": function () {
      this.onChangeGrado();
    },
  },
};
</script>

<style scoped>
  .my-overlay {
  z-index: 9999;
  background-color: rgba(255, 0, 0, 0.3); /* Fondo rojo semitransparente para depuración */
}
</style>

