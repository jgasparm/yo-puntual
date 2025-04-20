<template>
  <HorarioDocenteLayout
    v-if="usuaId && profile"
    :usuaId="usuaId"
    :profile="profile"
    tituloTutor="Tutor del aula"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import HorarioDocenteLayout from '@/components/Estudios/PaginaDocenteHorarioEscolarLayout.vue'

const usuaId = ref(null)
const profile = ref('')

onMounted(() => {
  usuaId.value = Number(localStorage.getItem('usua_id') || 0)
  profile.value = localStorage.getItem('profile') || ''
})
</script>
