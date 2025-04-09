<template>
  <v-container>

    <!-- ENCABEZADO -->
    <v-row class="py-3">
      <v-col cols="12">
        <h1 class="text-h4">Matrícula de Alumnos - Año {{ anioEscolar }}</h1>
      </v-col>
    </v-row>

    <!-- BOTÓN Agregar Matrícula -->
    <v-card class="mb-2">
      <v-card-title class="d-flex justify-end">
        <v-btn color="primary" small @click="abrirDialogoAgregarMatricula">
          <v-icon left>mdi-account-plus</v-icon>
          Agregar Matrícula
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- FILTROS (Turno, Nivel, Grado, Sección) -->
    <v-card class="pa-2 mb-3">
      <v-card-title class="text-subtitle-3 font-weight-bold">
        Filtrar Matrículas
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="3">
            <v-select
              label="Turno"
              :items="turnos"
              v-model="filtro.turno"
              item-title="turn_nombre"
              item-value="turn_id"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              label="Nivel"
              :items="niveles"
              v-model="filtro.nivel"
              item-title="nive_nombre"
              item-value="nive_id"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              label="Grado"
              :items="grados"
              v-model="filtro.grado"
              item-title="grad_nombre"
              item-value="grad_id"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              label="Sección"
              :items="secciones"
              v-model="filtro.seccion"
              item-title="secc_nombre"
              item-value="secc_id"
              outlined
              dense
            />
          </v-col>
        </v-row>
      </v-card-text>
      <!-- BOTÓN Consultar -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" small @click="consultarMatriculas">
          <v-icon left>mdi-magnify</v-icon>
          Consultar
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- VISTA DESKTOP: DataTable con paginación interna -->
    <div v-if="isDesktop">
      <v-data-table
        :headers="headers"
        :items="matriculados"
        :loading="loading"
        v-model:page="currentPage"
        :items-per-page="itemsPerPage"
        class="elevation-1"
        no-data-text="No hay alumnos matriculados"
      >
        <template #progress>
          <v-progress-linear color="primary" indeterminate></v-progress-linear>
        </template>

        <!-- Columna para correlativo -->
        <template #item.correlativo="{ index }">
          {{ (currentPage - 1) * itemsPerPage + (index + 1) }}
        </template>

        <!-- Columna de acciones (editar) -->
        <template #item.acciones="{ item }">
          <v-btn icon @click="abrirDialogoActualizarMatricula(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <!-- Paginación Desktop (según versión de Vuetify) -->
      <v-pagination
        v-if="totalPages > 1"
        v-model="currentPage"
        :length="totalPages"
        class="mt-2"
      />
    </div>

    <!-- VISTA MOBILE: Tarjetas con paginación manual -->
    <div v-else>
      <v-row dense>
        <v-col
          v-for="(item, index) in paginatedMatriculados"
          :key="index"
          cols="12"
          class="mb-3"
        >
          <v-card outlined>
            <v-card-actions>
              <v-btn icon @click="abrirDialogoActualizarMatricula(item)" style="position: absolute; top: 8px; right: 8px;">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </v-card-actions>
            <v-card-title class="font-weight-bold">
              N° {{ (currentPage - 1) * itemsPerPage + (index + 1) }}
            </v-card-title>
            <v-card-title class="font-weight-bold">
              {{ item.alumno }}
            </v-card-title>
            <v-card-text>
              <div><strong>Fecha Matrícula:</strong> {{ item.fecha_matricula }}</div>
              <div><strong>Turno:</strong> {{ item.turno_descripcion }}</div>
              <div><strong>Nivel:</strong> {{ item.nivel_descripcion }}</div>
              <div><strong>Grado:</strong> {{ item.grado_descripcion }}</div>
              <div><strong>Sección:</strong> {{ item.seccion_descripcion }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <!-- Paginación Mobile -->
      <v-pagination
        v-if="totalPages > 1"
        v-model="currentPage"
        :length="totalPages"
        class="mt-2"
      />
    </div>

    <!-- Diálogo Agregar Matrícula -->
    <v-dialog v-model="dialogoAgregar" max-width="400">
      <v-card>
        <v-card-title>
          <span class="text-h6">Agregar Matrícula</span>
        </v-card-title>
        <v-card-text>
          <v-select
            label="Alumno"
            :items="alumnosNoMatriculados"
            v-model="nuevoMatricula.alum_id"
            item-title="nombre_completo"
            item-value="alum_id"
            dense
            outlined
          />
          <v-select
            label="Aula Detalle"
            :items="aulasDetalleFormateadas"
            v-model="nuevoMatricula.aude_id"
            item-title="aulaConcatenada"
            item-value="aude_id"
            dense
            outlined
            class="mt-3"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogoAgregar = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarMatricula">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo Actualizar Matrícula -->
    <v-dialog v-model="dialogoActualizar" max-width="400">
      <v-card>
        <v-card-title>
          <span class="text-h6">Actualizar Matrícula</span>
        </v-card-title>
        <v-card-text>
          <div><strong>Alumno: </strong>{{ matriculaSeleccionada?.alumno }}</div>
          <v-select
            label="Estado de la Matrícula"
            v-model="matriculaSeleccionadaEstado"
            :items="['Activo','Inactivo']"
            dense
            outlined
            class="mt-3"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogoActualizar = false">Cancelar</v-btn>
          <v-btn color="primary" @click="actualizarMatricula">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import axios from "axios";
import { computed, ref } from "vue";
import { useDisplay } from "vuetify";

export default {
  name: "PaginaMatricula",
  setup() {
    
    const anioEscolar = ref(localStorage.getItem("anio_escolar"));
    const profile = ref(localStorage.getItem("profile"));
    const token = ref(localStorage.getItem("token"));
    
    // Detectar si es Desktop o Mobile
    const { mdAndUp } = useDisplay();
    const isDesktop = mdAndUp;

    const currentPage = ref(1);
    const itemsPerPage = computed(() => (isDesktop.value ? 10 : 5));

    return { anioEscolar, profile, token, isDesktop, currentPage, itemsPerPage };
  },
  data() {
    return {

      // Catálogos
      turnosAll: [],
      nivelesAll: [],
      gradosAll: [],
      seccionesAll: [],

      // Arrays usados en <v-select>
      turnos: [],
      niveles: [],
      grados: [],
      secciones: [],

      // Filtros
      filtro: {
        turno: 0,   // "TODOS" = 0
        nivel: 0,
        grado: 0,
        seccion: 0
      },

      matriculados: [],  // Data que se muestra en la tabla
      loading: false,

      headers: [
        { title: "N°", value: "correlativo", align: "center" },
        { title: "Alumno", value: "alumno", align: "center" },
        { title: "Fecha Matrícula", value: "fecha_matricula", align: "center" },
        { title: "Turno", value: "turno_descripcion", align: "center" },
        { title: "Nivel", value: "nivel_descripcion", align: "center" },
        { title: "Grado", value: "grado_descripcion", align: "center" },
        { title: "Sección", value: "seccion_descripcion", align: "center" },
        { title: "Acciones", value: "acciones", align: "center" },
      ],

      // Para "Agregar"
      dialogoAgregar: false,
      alumnosNoMatriculados: [],
      aulasDetalle: [],
      nuevoMatricula: {
        alum_id: null,
        aude_id: null
      },

      // Para "Actualizar"
      dialogoActualizar: false,
      matriculaSeleccionada: null,
      matriculaSeleccionadaEstado: "",
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.matriculados.length / this.itemsPerPage);
    },
    paginatedMatriculados() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.matriculados.slice(start, start + this.itemsPerPage);
    },
    aulasDetalleFormateadas() {
      if (!Array.isArray(this.aulasDetalle)) return [];
      return this.aulasDetalle.map(item => ({
        ...item,
        aulaConcatenada: `${item.turn_nombre} - ${item.nive_nombre} - ${item.grad_nombre} - ${item.secc_nombre}`
      }));
    }
  },
  mounted() {
    // Cargar catálogos (Turno, Nivel, Grado, Sección)
    this.cargarFiltrosMatricula();

    // Al montar la página, si deseas puedes llamar de inmediato a consultar
    // o esperar a que el usuario presione "Consultar".
    this.consultarMatriculas();
  },
  methods: {
    // Trae catálogos de turnos, niveles, grados, secciones
    async cargarFiltrosMatricula() {
      try {
        const url = "https://amsoftsolution.com/amss/ws/wsConsultaFiltrosAlumno.php";
        const config = {
          params: { av_profile: this.profile },
          headers: { Authorization: `Bearer ${this.token}` },
        };
        const resp = await axios.get(url, config);
        if (resp.data.status) {
          this.turnosAll = resp.data.data.turnos || [];
          this.nivelesAll = resp.data.data.niveles || [];
          this.gradosAll = resp.data.data.grados || [];
          this.seccionesAll = resp.data.data.secciones || [];

          // Insertamos "TODOS" = 0
          this.turnos = [{ turn_id: 0, turn_nombre: "TODOS" }, ...this.turnosAll];
          this.niveles = [{ nive_id: 0, nive_nombre: "TODOS" }, ...this.nivelesAll];
          this.grados = [{ grad_id: 0, grad_nombre: "TODOS" }, ...this.gradosAll];
          this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }, ...this.seccionesAll];

          // Setear a "TODOS" (0)
          this.filtro.turno = 0;
          this.filtro.nivel = 0;
          this.filtro.grado = 0;
          this.filtro.seccion = 0;
        } else {
          console.error("Error al cargar filtros:", resp.data.message);
        }
      } catch (err) {
        console.error("Error en cargarFiltrosMatricula:", err);
      }
    },

    // Se llama al hacer clic en "Consultar"
    async consultarMatriculas() {
      this.loading = true;
      try {
        const url = "https://amsoftsolution.com/amss/ws/wsConsultaMatricula.php";
        const config = {
          params: {
            // Ajusta según tu endpoint
            ac_anio_escolar: this.anioEscolar,  // p.ej. 2025
            ai_turn_id: this.filtro.turno,      // Turno
            ac_nive_id: this.filtro.nivel,      // Nivel
            ai_grad_id: this.filtro.grado,      // Grado
            ai_secc_id: this.filtro.seccion,    // Sección
            av_profile: this.profile
          },
          headers: { Authorization: `Bearer ${this.token}` },
        };
        const resp = await axios.get(url, config);
        if (resp.data.status) {
          // Mapear la data devuelta
          this.matriculados = resp.data.data.map(item => ({
            alumno: item.nombre_alumno,
            fecha_matricula: item.fecha_matricula 
            ? item.fecha_matricula.split(' ')[0] 
            : '', // Para prevenir errores si fuese null o vacío
            turno_descripcion: item.turno,
            nivel_descripcion: item.nivel,
            grado_descripcion: item.grado,
            seccion_descripcion: item.seccion,
            matr_id: item.matr_id
          }));
        } else {
          this.matriculados = [];
          console.error("Error consultando matrículas:", resp.data.message);
        }
      } catch (err) {
        console.error("Error consultando matrículas:", err);
        this.matriculados = [];
      } finally {
        this.loading = false;
      }
    },

    // Watchers para repoblar combos de Grados/Secciones
    onChangeNivelLocal() {
      const nivelId = this.filtro.nivel;
      if (!nivelId || nivelId === 0) {
        this.grados = [{ grad_id: 0, grad_nombre: "TODOS" }, ...this.gradosAll];
        this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }, ...this.seccionesAll];
        this.filtro.grado = 0;
        this.filtro.seccion = 0;
        return;
      }
      // Filtra grados
      const gradosFiltrados = this.gradosAll.filter(g => g.nive_id === nivelId);
      this.grados = [{ grad_id: 0, grad_nombre: "TODOS" }, ...gradosFiltrados];
      this.filtro.grado = 0;

      // Secciones se resetean
      this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }];
      this.filtro.seccion = 0;
    },
    onChangeGradoLocal() {
      const gradoId = this.filtro.grado;
      if (!gradoId || gradoId === 0) {
        this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }, ...this.seccionesAll];
        this.filtro.seccion = 0;
        return;
      }
      // Filtra secciones
      const seccionesFiltradas = this.seccionesAll.filter(s => s.grad_id === gradoId);
      this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }, ...seccionesFiltradas];
      this.filtro.seccion = 0;
    },

    // Agregar Matrícula
    async abrirDialogoAgregarMatricula() {
      this.dialogoAgregar = true;
      this.nuevoMatricula.alum_id = null;
      this.nuevoMatricula.aude_id = null;
      await this.cargarAlumnosNoMatriculados();
      await this.cargarAulaDetalle();
    },
    async cargarAlumnosNoMatriculados() {
      try {
        const url = "https://amsoftsolution.com/amss/ws/wsListaAlumnosNoMatriculados.php";
        const config = {
          params: {
            ac_anio_escolar: this.anioEscolar,
            av_profile: this.profile
          },
          headers: { Authorization: `Bearer ${this.token}` }
        };
        const resp = await axios.get(url, config);
        if (resp.data.status) {
          this.alumnosNoMatriculados = resp.data.data;
        } else {
          this.alumnosNoMatriculados = [];
          console.error("Error al obtener alumnos no matriculados:", resp.data.message);
        }
      } catch (err) {
        console.error("Error cargarAlumnosNoMatriculados:", err);
        this.alumnosNoMatriculados = [];
      }
    },
    async cargarAulaDetalle() {
      try {
        const url = "https://amsoftsolution.com/amss/ws/wsListaAulaDetalleAnioEscolar.php";
        const config = {
          params: {
            ac_anio_escolar: this.anioEscolar,
            av_profile: this.profile
          },
          headers: { Authorization: `Bearer ${this.token}` }
        };
        const resp = await axios.get(url, config);
        if (resp.data.status) {
          this.aulasDetalle = resp.data.data;
        } else {
          this.aulasDetalle = [];
          console.error("Error al obtener las aulas detalle:", resp.data.message);
        }
      } catch (err) {
        console.error("Error cargarAulaDetalle:", err);
        this.aulasDetalle = [];
      }
    },
    async guardarMatricula() {
      if (!this.nuevoMatricula.alum_id || !this.nuevoMatricula.aude_id) {
        alert("Seleccione el alumno y el aula.");
        return;
      }
      try {
        const url = "https://amsoftsolution.com/amss/ws/wsRegistraMatricula.php";
        // Crea el objeto de datos para el cuerpo de la petición
        const data = {
          ai_alum_id: this.nuevoMatricula.alum_id,
          ai_aude_id: this.nuevoMatricula.aude_id,
          ac_anio_escolar: this.anioEscolar,
          av_profile: this.profile
        };
        const config = {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json"
          }
        };
        const resp = await axios.post(url, data, config);
        if (resp.data.status) {
          this.dialogoAgregar = false;
          // Llamar de nuevo para refrescar la tabla
          this.consultarMatriculas();
        } else {
          console.error("Error al registrar matrícula:", resp.data.message);
        }
      } catch (err) {
        console.error("Error registrando matrícula:", err);
      }
    },

    // Actualizar Matrícula
    abrirDialogoActualizarMatricula(item) {
      this.matriculaSeleccionada = item;
      // Asumir "Activo" si no te llega un estado
      this.matriculaSeleccionadaEstado = "Activo";
      this.dialogoActualizar = true;
    },
    async actualizarMatricula() {
      try {
        const nuevoEstado = this.matriculaSeleccionadaEstado === "Activo" ? "A" : "I";
        const url = "https://amsoftsolution.com/amss/ws/wsActualizaMatricula.php";
        const data = {
          ai_matr_id: this.matriculaSeleccionada.matr_id,
          ac_matr_estado: nuevoEstado,
          av_profile: this.profile
        };
        const config = {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json"
          }
        };
        const resp = await axios.post(url, data, config);
        if (resp.data.status) {
          this.dialogoActualizar = false;
          // Volver a consultar
          this.consultarMatriculas();
        } else {
          console.error("Error al actualizar matrícula:", resp.data.message);
        }
      } catch (err) {
        console.error("Error actualizando matrícula:", err);
      }
    },

    textoAula(a) {
      return `AulaID: ${a.aude_id}, Turno: ${a.turn_nombre}, Nivel: ${a.nive_nombre}, Grado: ${a.grad_nombre}, Secc: ${a.secc_nombre}`;
    }
  },

  watch: {
  "filtro.nivel": function (newVal) {
    // Si el usuario selecciona "TODOS" (nivel = 0)
    if (newVal === 0) {
      this.grados = [{ grad_id: 0, grad_nombre: "TODOS" }];
      this.filtro.grado = 0;

      this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }];
      this.filtro.seccion = 0;
      return;
    }

    // Caso contrario: filtras los grados que pertenezcan a ese nivel
    const nivelId = newVal;
    const gradosFiltrados = this.gradosAll.filter(g => g.nive_id === nivelId);

    // Asignas la nueva lista de grados
    this.grados = [
      { grad_id: 0, grad_nombre: "TODOS" },
      ...gradosFiltrados
    ];
    // Reinicias el grado a 0, y de paso la lista de secciones
    this.filtro.grado = 0;
    this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }];
    this.filtro.seccion = 0;
  },

  "filtro.grado": function (newVal) {
    // Si el usuario selecciona "TODOS" (grado = 0)
    if (newVal === 0) {
      this.secciones = [{ secc_id: 0, secc_nombre: "TODOS" }];
      this.filtro.seccion = 0;
      return;
    }

    // Caso contrario: filtras las secciones que pertenezcan a ese grado
    const gradoId = newVal;
    const seccionesFiltradas = this.seccionesAll.filter(s => s.grad_id === gradoId);

    this.secciones = [
      { secc_id: 0, secc_nombre: "TODOS" },
      ...seccionesFiltradas
    ];
    this.filtro.seccion = 0;
  }
},

};
</script>

<style scoped>
.v-card-title.d-flex.justify-end {
  padding-right: 16px;
}
</style>
