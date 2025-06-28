<template>
  <Bar
    :data="data"
    :options="optionsMerged"
  />
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  data: { type: Object, required: true },
  options: { type: Object, default: () => ({}) }
})

// 🚨 Desactiva aspectRatio y fuerza layout vertical
const optionsMerged = computed(() => ({
  responsive: true,
  maintainAspectRatio: false, // 👈 IMPORTANTE
  indexAxis: 'y', // 👈 Gráfico horizontal
  scales: {
    x: {
      beginAtZero: true
    },
    y: {
      ticks: {
        font: {
          size: 12
        }
      }
    }
  },
  ...props.options
}))
</script>

<style scoped>
canvas {
  height: auto !important;
  max-height: 300px !important; /* mismo alto que tu v-card */
}
</style>

