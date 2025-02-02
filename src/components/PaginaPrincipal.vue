<template>
  <v-app>
    <!-- Barra de navegación superior -->
    <v-app-bar app color="primary" dark>
      <v-img src="/logo.png" max-height="40" max-width="40" class="mr-3"></v-img>
      <v-toolbar-title>{{ centroEducativo.nombre }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on">
            <v-avatar class="mr-2" size="40">
              <img :src="usuario.imagenPerfil" alt="Perfil" style="width: 100%; height: 100%; object-fit: cover;" />
            </v-avatar>
            {{ usuario.nombre }}
            <v-icon>mdi-chevron-down</v-icon>
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
                    :key="modulo.id"
                    @click="cambiarVista(modulo.ruta)"
                    link
                  >
                    <v-list-item-icon>
                      <v-icon>{{ modulo.icono }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{ modulo.nombre }}</v-list-item-title>
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
// Importamos los componentes de cada módulo
import Inicio from "@/components/PaginaInicio.vue";
import Asistencia from "@/components/PaginaAsistencia.vue";
import Estudios from "@/components/PaginaEstudios.vue";
import Tramites from "@/components/PaginaTramites.vue";
import Finanzas from "@/components/PaginaFinanzas.vue";
import Incidencias from "@/components/PaginaIncidencias.vue";

export default {
  data() {
    return {
      centroEducativo: {
        nombre: "Colegio San Martín"
      },
      usuario: {
        nombre: "Juan Pérez",
        imagenPerfil: require("@/assets/images_perfil/10030796.jpg")
      },
      vistaActual: "Inicio", // Vista por defecto
      modulos: [
        { id: 1, nombre: "Mi asistencia", icono: "mdi-check", ruta: "Asistencia" },
        { id: 2, nombre: "Mis estudios", icono: "mdi-book", ruta: "Estudios" },
        { id: 3, nombre: "Mis trámites", icono: "mdi-file-document", ruta: "Tramites" },
        { id: 4, nombre: "Mis finanzas", icono: "mdi-cash", ruta: "Finanzas" },
        { id: 5, nombre: "Incidencias", icono: "mdi-alert", ruta: "Incidencias" }
      ]
    };
  },
  methods: {
    verPerfil() {
      console.log("Ver perfil");
    },
    cerrarSesion() {
      localStorage.removeItem("auth");
      this.$router.push("/login");
    },
    cambiarVista(vista) {
      this.vistaActual = vista;
    }
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
</style>
