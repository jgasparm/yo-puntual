<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="options" />
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Bar } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'BarChart',
  components: { Bar },
  props: {
    data: { type: Object, required: true }
  },
  data() {
    return {
      chartData: {},
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: false }
        }
      }
    };
  },
  watch: {
    data: {
      immediate: true,
      deep: true,
      handler(newVal) {
        // Clonamos los datos para evitar conflictos de reactividad
        this.chartData = JSON.parse(JSON.stringify(newVal));
      }
    }
  }
};
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
