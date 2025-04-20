<template>
  <HorarioDocenteLayout
    :usuaId="usuaId"
    :profile="profile"
    :nombreTutor="nombreTutor"
    :tituloTutor="`Tutor: ${nombreTutor}`"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import HorarioDocenteLayout from '@/components/Estudios/PaginaDocenteHorarioEscolarLayout.vue'

const route = useRoute()
const usuaId = ref(null)
const nombreTutor = ref('')
const profile = ref('')

onMounted(() => {
  usuaId.value = Number(route.query.usua_id)
  nombreTutor.value = route.query.nombre_docente || ''
  profile.value = localStorage.getItem('profile') || ''
})
</script>
