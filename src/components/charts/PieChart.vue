<template>
  <div class="chart-container">
    <Pie :data="data" :options="optionsMerged" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
ChartJS.register(ChartDataLabels)

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  data: { type: Object, required: true },
  options: { type: Object, default: () => ({}) }
})

const optionsMerged = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    },
    datalabels: {
      color: '#fff',
      font: {
        weight: 'bold',
        size: 14
      },
      formatter: (value) => value
    }
  },
  ...props.options
}))

</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

:deep(canvas) {
  height: 100% !important;
  max-height: 300px;
}
</style>
