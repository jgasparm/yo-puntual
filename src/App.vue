<template>
  <v-app>
    <!-- Overlay global para loading -->
    <GlobalLoading />
    <router-view />
    <ChatWidget v-if="mostrarAsistente" />
  </v-app>
</template>

<script setup>
import GlobalLoading from '@/components/GlobalLoading.vue'
import ChatWidget from '@/components/ChatWidget.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
// Ocultar en login
const mostrarAsistente = computed(() => route.name !== 'login')
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
