<template>
  <div class="chart-container">
    <LineChartComponent :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Line as LineChartComponent } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

export default {
  name: 'LineChart',
  components: {
    LineChartComponent
  },
  props: {
    data: { type: Object, required: true },
    options: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      chartData: {},
      chartOptions: {}
    };
  },
  watch: {
    data: {
      immediate: true,
      deep: true,
      handler(newVal) {
        this.chartData = JSON.parse(JSON.stringify(newVal));
      }
    },
    options: {
      immediate: true,
      deep: true,
      handler(newVal) {
        this.chartOptions = JSON.parse(JSON.stringify(newVal));
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
