<template>
  <v-app>
    <!-- Barra de navegación superior -->
    <v-app-bar app color="primary" dark>
      <v-container class="d-flex align-center">
        <v-img src="/logo.png" max-height="40" max-width="40" class="mr-3"></v-img>
        <v-toolbar-title class="text-h5 font-weight-bold">{{ centroEducativo }}</v-toolbar-title>
        <v-spacer></v-spacer>

        <!-- Menú desplegable -->
        <v-menu v-model="menuVisible" offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn text v-bind="attrs" v-on="on">
              <v-avatar class="mr-2" size="40">
                <img src="@/assets/images_perfil/10030796.jpg" alt="Perfil" style="width: 100%; height: 100%; object-fit: cover;" />
              </v-avatar>
              {{ usuarioNombre }}
              <v-icon>{{ menuVisible ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="verPerfil">
              <v-list-item-title>Ver perfil</v-list-item-title>
            </v-list-item>
            <v-list-item @click="cerrarSesion">
              <v-list-item-title>Cerrar sesión</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-container>
    </v-app-bar>

    <!-- Contenido de la página -->
    <v-main>
      <v-container fluid>
        <v-row>
          <!-- Menú lateral -->
          <v-col cols="2">
            <v-navigation-drawer app permanent color="grey lighten-4">
              <v-list dense>
                <v-list-item-group>
                  <v-list-item @click="cambiarVista('inicio')" link>
                    <v-list-item-icon>
                      <v-icon>mdi-home</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Inicio</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item
                    v-for="modulo in modulos"
                    :key="modulo.modu_id"
                    @click="cambiarVista(modulo.ruta)"
                    link
                  >
                    <v-list-item-icon>
                      <v-icon>mdi-folder</v-icon> <!-- Se puede personalizar por módulo -->
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{ modulo.modu_nombre }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-navigation-drawer>
          </v-col>

          <!-- Contenido Principal -->
          <v-col cols="7">
            <component :is="vistaActual"></component>
          </v-col>

          <!-- Sección Lateral -->
          <v-col cols="3">
            <v-card class="pa-4" outlined>
              <v-card-title>Calendario Académico</v-card-title>
              <v-date-picker></v-date-picker>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Inicio from "@/components/PaginaInicio.vue";
import Asistencia from "@/components/PaginaAsistencia.vue";
import Estudios from "@/components/PaginaEstudios.vue";
import Tramites from "@/components/PaginaTramites.vue";
import Finanzas from "@/components/PaginaFinanzas.vue";
import Incidencias from "@/components/PaginaIncidencias.vue";

export default {
  data() {
    return {
      menuVisible: false,
      usuarioNombre: "",
      centroEducativo: "",
      vistaActual: Inicio, // Se usa el componente, no una string
      modulos: [],
      componentes: {
        inicio: Inicio,
        'mi-asistencia': Asistencia,
        'mis-estudios': Estudios,
        'mis-tramites': Tramites,
        'mis-finanzas': Finanzas,
        'incidencias': Incidencias
      }
    };
  },
  methods: {
    verPerfil() {
      console.log("Ver perfil");
    },
    cerrarSesion() {
      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
    cambiarVista(vista) {
      if (this.componentes[vista]) {
        this.vistaActual = this.componentes[vista]; // Asigna el componente real
      } else {
        //console(this.vistaActual);
        //console(`a`);
        console.warn(`Vista '${vista}' no encontrada`);
      }
    },
    cargarDatosUsuario() {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        this.usuarioNombre = `${userData.pers_nombres} ${userData.pers_apellidos}`;
        this.centroEducativo = userData.cliente;
        this.modulos = userData.modulos.map((modulo) => ({
          ...modulo,
          ruta: modulo.modu_nombre.toLowerCase().replace(/\s+/g, '-')
        }));
      }
    }
  },
  mounted() {
    this.cargarDatosUsuario();
  },
  components: {
    Inicio,
    Asistencia,
    Estudios,
    Tramites,
    Finanzas,
    Incidencias
  }
};
</script>

<style scoped>
.v-card {
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.v-navigation-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.v-menu__content {
  z-index: 9999 !important;
}
</style>
