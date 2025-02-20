<template>
  <v-container>
    <v-row>
      <!-- Tarjeta de Asistencia -->
      <v-col cols="12" md="6" lg="3">
        <v-card class="pa-3" outlined>
          <v-card-title>Asistencia</v-card-title>
          <v-card-text>
            <v-progress-circular
              :size="100"
              :width="8"
              :value="asistenciaPorcentaje"
              color="green"
            >
              {{ asistencia.asistidos }}/{{ asistencia.total_dias }}
            </v-progress-circular>
            <div class="mt-3 text-center">
              <strong>Faltas:</strong> {{ asistencia.faltas }} | <strong>Tardanzas:</strong> {{ asistencia.tardanzas }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Tarjeta de Finanzas -->
      <v-col cols="12" md="6" lg="3">
        <v-card class="pa-3" outlined>
          <v-card-title>Finanzas</v-card-title>
          <v-card-text>
            <p><strong>Saldo Pendiente:</strong> S/ {{ finanzas.saldo_pendiente }}</p>
            <p><strong>Último Pago:</strong> {{ finanzas.ultimo_pago }}</p>
            <p><strong>Próximo Vencimiento:</strong> {{ finanzas.proximo_vencimiento }}</p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Tarjeta de Últimas Notas -->
      <v-col cols="12" md="6" lg="3">
        <v-card class="pa-3" outlined>
          <v-card-title>Últimas Notas</v-card-title>
          <v-list dense>
            <v-list-item v-for="nota in notas" :key="nota.curso">
              <v-list-item-content>
                <v-list-item-title>{{ nota.curso }}</v-list-item-title>
                <v-list-item-subtitle class="font-weight-bold">Nota: {{ nota.nota }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Tarjeta de Incidencias -->
      <v-col cols="12" md="6" lg="3">
        <v-card class="pa-3" outlined>
          <v-card-title>Incidencias</v-card-title>
          <v-list dense>
            <v-list-item v-for="inc in incidencias" :key="inc.fecha">
              <v-list-item-content>
                <v-list-item-title>{{ inc.tipo }}</v-list-item-title>
                <v-list-item-subtitle>{{ inc.fecha }} - {{ inc.detalle }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      asistencia: {},
      finanzas: {},
      notas: [],
      incidencias: []
    };
  },
  computed: {
    asistenciaPorcentaje() {
      return (this.asistencia.asistidos / this.asistencia.total_dias) * 100;
    }
  },
  async mounted() {
    try {
      const response = await axios.get("/api/dashboard/alumno?alumno_id=12345");
      this.asistencia = response.data.asistencia;
      this.finanzas = response.data.finanzas;
      this.notas = response.data.notas;
      this.incidencias = response.data.incidencias;
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
    }
  }
};
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}
</style>
