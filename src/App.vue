<template>
  <v-app>
    <!-- Overlay global para loading -->
    <v-overlay :value="loading" fixed class="my-overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <router-view />
  </v-app>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      loading: false,
    };
  },
  created() {
    // Puedes usar un EventBus, provide/inject o Vuex para actualizar 'loading'
    // Por ejemplo, si utilizas un EventBus, podrías hacer:
    // EventBus.$on("toggle-loading", (state) => { this.loading = state; });
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
.my-overlay {
  z-index: 9999;
  /* Para pruebas, un fondo semitransparente para verificar su visibilidad */
  background-color: rgba(255, 0, 0, 0.3);
}
.v-data-table__header th {
  color: #26995a !important;
  font-weight: bold;
  display: table-cell !important;
}

.v-menu__content {
  overflow: auto !important;
}

@media (max-width: 600px) {
  .v-menu__content {
    position: fixed !important;
    transform: none !important;
    will-change: auto;
  }
}

.custom-pagination {
  width: 100%;
  justify-content: center;
  display: flex;
  flex-wrap: wrap;
  min-width: 250px; /* Ajusta este valor según el tamaño adecuado */
  max-width: 100%;  /* Evita que crezca más allá del contenedor */
  overflow: hidden;  /* Evita que elementos internos empujen el diseño */
}

/* .custom-pagination .v-pagination__navigation {
  display: inline-flex !important;
  opacity: 1 !important;
  visibility: visible
} */

.custom-pagination .v-pagination__item,
.custom-pagination .v-pagination__navigation {
  min-width: 32px; /* Tamaño mínimo para cada botón de paginación */
  max-width: 40px; /* Tamaño máximo para evitar expansión */
  text-align: center;
}

.custom-pagination .v-pagination__item:first-child {
  margin-left: 15px; /* Ajusta este valor según lo necesites */
}

.custom-pagination .v-pagination__item:last-child {
  margin-right: 15px; /* Ajusta este valor según lo necesites */
}
</style>
