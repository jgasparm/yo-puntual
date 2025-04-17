<template>
  <div class="pa-4">
    <!-- Título y descripción -->
    <h1 class="text-h5 font-weight-bold mb-1">Registro de Asistencia</h1>
    <p class="text-subtitle-2 mb-4">{{ subtitulo }}</p>

    <!-- Hora actual -->
    <div class="mb-4 text-right hora-container">
      <v-chip color="info" text-color="white" class="text-caption">
        <v-icon start icon="mdi-clock-outline" class="me-1" /> Hora actual: {{ horaActual }}
      </v-chip>
    </div>

    <!-- Buscador -->
    <v-autocomplete
      v-model="personaSeleccionada"
      :items="personas"
      item-title="persona_descripcion"
      item-value="pers_id"
      label="Buscar persona"
      clearable
      prepend-icon="mdi-account-search"
      :loading="loadingPersonas"
      return-object
    />

    <!-- Info de persona -->
    <v-card v-if="infoPersona" class="mt-4" outlined>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="6">
            <p><v-icon start icon="mdi-card-account-details-outline" />
              <strong>{{ infoPersona.tidi_abreviacion || 'DNI' }}:</strong>
              {{ infoPersona.pers_numero_documento_identidad || 'Sin documento' }}
            </p>
          </v-col>
          <v-col cols="12" sm="6">
            <p><v-icon start icon="mdi-email-outline" />
              <strong>Correo:</strong> {{ infoPersona.pers_correo_electronico || 'No registrado' }}
            </p>
          </v-col>
          <v-col cols="12" sm="6">
            <p><v-icon start icon="mdi-phone-outline" />
              <strong>Teléfono:</strong> {{ infoPersona.pers_telefono_movil1 || 'No registrado' }}
            </p>
          </v-col>
        </v-row>

        <v-divider class="my-2" />

        <div v-if="infoPersona.tipo_persona === 'Alumno'">
          <p><strong>Turno:</strong> {{ infoPersona.turn_nombre || 'No registrado' }}</p>
          <p><strong>Nivel:</strong> {{ infoPersona.nive_nombre || 'No registrado' }}</p>
          <p><strong>Grado:</strong> {{ infoPersona.grad_nombre || 'No registrado' }}</p>
          <p><strong>Sección:</strong> {{ infoPersona.secc_nombre || 'No registrado' }}</p>
        </div>

        <div v-else-if="infoPersona.tipo_persona === 'Empleado'">
          <p><strong>Área:</strong> {{ infoPersona.area_empleado || 'No registrado' }}</p>
          <p><strong>Cargo:</strong> {{ infoPersona.cargo_empleado || 'No registrado' }}</p>
        </div>

        <div v-else>
          <p><strong>Tipo:</strong> Otro</p>
        </div>
      </v-card-text>

      <!-- Botón centrado -->
      <v-card-actions>
        <v-row justify="center" class="w-100">
          <v-col cols="auto">
            <v-btn
              color="primary"
              @click="registrarAsistencia"
              :loading="registrando"
              :disabled="!personaSeleccionada"
            >
              Registrar Asistencia
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>

    <!-- Snackbar éxito -->
    <v-snackbar v-model="mensajeVisible" :timeout="4000" color="success">
      Asistencia registrada correctamente.
    </v-snackbar>

    <!-- Historial -->
    <v-card v-if="historialAsistencia.length" class="mt-6" outlined>
      <v-card-title class="text-h6">Últimos registros de hoy</v-card-title>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th>Persona</th>
              <th>Hora</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in historialAsistencia" :key="i">
              <td>{{ item.persona_descripcion }}</td>
              <td>{{ item.hora }}</td>
              <td>{{ item.tipo_persona }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "RegistroAsistencia",
  data() {
    return {
      personas: [],
      personaSeleccionada: null,
      infoPersona: null,
      loadingPersonas: false,
      registrando: false,
      mensajeVisible: false,
      horaActual: "",
      historialAsistencia: [],
      subtitulo: ""
    };
  },
  mounted() {
    this.cargarDatosSegunPerfil();
    this.cargarHistorialLocal();
    this.actualizarHora();
    setInterval(this.actualizarHora, 1000);
  },
  watch: {
    personaSeleccionada(nuevaPersona) {
      if (nuevaPersona && nuevaPersona.pers_id) {
        const encontrada = this.personas.find(p => p.pers_id === nuevaPersona.pers_id);
        this.infoPersona = encontrada || nuevaPersona;
      } else {
        this.infoPersona = null;
      }
    }
  },
  methods: {
    actualizarHora() {
      const ahora = new Date();
      this.horaActual = ahora.toLocaleTimeString();
    },
    async cargarDatosSegunPerfil() {
      this.loadingPersonas = true;
      const token = localStorage.getItem("token");
      const profile = localStorage.getItem("profile");
      const usua_id = localStorage.getItem("usua_id");
      const id_perfil = localStorage.getItem("perfil");
      let url = "";
      
      switch (parseInt(id_perfil)) {
        case 1:
          this.subtitulo = "Registra la asistencia de personas del centro educativo según su tipo.";
          url = `https://amsoftsolution.com/amss/ws/wsConsultaPersonasInformacion.php?av_profile=${profile}`;
          break;
        case 3:
          this.subtitulo = "Registra la asistencia de los alumnos que están dentro de su tutoría.";
          url = `https://amsoftsolution.com/amss/ws/wsConsultaTutorAlumnos.php?ai_usua_id=${usua_id}&av_profile=${profile}`;
          break;
        case 4:
          this.subtitulo = "Registra la asistencia de los empleados.";
          url = `https://amsoftsolution.com/amss/ws/wsConsultaEmpleadosInformacion.php?av_profile=${profile}`;
          break;
        default:
          console.warn("Perfil no reconocido");
          this.subtitulo = "Registra la asistencia.";
          return;
      }

      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.status) {
          this.personas = result.data;
        }
      } catch (error) {
        console.error("Error al cargar datos según perfil:", error);
      } finally {
        this.loadingPersonas = false;
      }
    },
    async cargarPersonas() {
      this.loadingPersonas = true;
      try {
        const token = localStorage.getItem("token");
        const profile = localStorage.getItem("profile");
        const response = await fetch(`https://amsoftsolution.com/amss/ws/wsConsultaPersonasInformacion.php?av_profile=${profile}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.status) this.personas = result.data;
      } catch (error) {
        console.error("Error al cargar personas:", error);
      } finally {
        this.loadingPersonas = false;
      }
    },
    cargarHistorialLocal() {
      const hoy = new Date().toISOString().slice(0, 10);
      const id_perfil = localStorage.getItem("id_perfil");
      const usua_id = localStorage.getItem("usua_id");

      let clave = `asistencia_${hoy}_p${id_perfil}`;
      if (parseInt(id_perfil) === 3) {
        clave += `_u${usua_id}`; // más específico para tutoría
      }

      const historial = localStorage.getItem(clave);
      this.historialAsistencia = historial ? JSON.parse(historial) : [];
    },
    guardarEnHistorialLocal(persona) {
      const hoy = new Date().toISOString().slice(0, 10);
      const profile = localStorage.getItem("profile");
      const usua_id = localStorage.getItem("usua_id");

      let clave = `asistencia_${hoy}_p${profile}`;
      if (parseInt(profile) === 3) {
        clave += `_u${usua_id}`;
      }

      const ahora = new Date();
      const nuevo = {
        persona_descripcion: persona.persona_descripcion,
        hora: ahora.toLocaleTimeString(),
        tipo_persona: persona.tipo_persona
      };

      this.historialAsistencia.unshift(nuevo);
      localStorage.setItem(clave, JSON.stringify(this.historialAsistencia.slice(0, 10)));
    },
    async registrarAsistencia() {
      if (!this.personaSeleccionada) return;
      this.registrando = true;
      try {
        const token = localStorage.getItem("token");
        const profile = localStorage.getItem("profile");
        const usua_id = localStorage.getItem("usua_id");
        const response = await fetch(`https://amsoftsolution.com/amss/ws/wsRegistroAsistenciaManual.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ai_pers_id: this.personaSeleccionada.pers_id,
            ac_pers_tipo: this.personaSeleccionada.pers_tipo,
            ai_usuario_registro: usua_id,
            av_profile: profile
          })
        });
        const result = await response.json();
        if (result.status) {
          this.mensajeVisible = true;
          this.guardarEnHistorialLocal(this.personaSeleccionada);
          this.personaSeleccionada = null;
          this.infoPersona = null;
        } else {
          alert("No se pudo registrar la asistencia.");
        }
      } catch (error) {
        console.error("Error al registrar asistencia:", error);
        alert("Error al registrar asistencia.");
      } finally {
        this.registrando = false;
      }
    }
  }
};
</script>

<style scoped>
@media screen and (max-width: 600px) {
  .hora-container {
    text-align: center !important;
    margin-bottom: 12px;
  }
}
</style>
