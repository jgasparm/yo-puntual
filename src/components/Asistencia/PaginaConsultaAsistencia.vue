<template>
  <v-container>
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-header>
          <v-icon left>mdi-check-circle</v-icon> Consulta de asistencia
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-text-field label="Buscar por nombre o fecha" outlined dense></v-text-field>
          <v-btn color="primary">Buscar</v-btn>
          <v-list>
            <v-list-item v-for="(item, i) in asistencias" :key="i">
              <v-list-item-content>
                <v-list-item-title>{{ item.nombre }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.fecha }} - {{ item.estado }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-header>
          <v-icon left>mdi-alert-outline</v-icon> Consultar incidencias
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-text-field label="Filtrar por tipo de incidencia" outlined dense></v-text-field>
          <v-btn color="error">Buscar</v-btn>
          <v-list>
            <v-list-item v-for="(item, i) in incidencias" :key="i">
              <v-list-item-content>
                <v-list-item-title>{{ item.tipo }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.detalle }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      asistencias: [
        { nombre: "Juan Pérez", fecha: "2025-02-06", estado: "Presente" },
        { nombre: "Ana López", fecha: "2025-02-06", estado: "Tardanza" },
      ],
      incidencias: [
        { tipo: "Retraso", detalle: "Llegó 15 minutos tarde" },
        { tipo: "Inasistencia", detalle: "No presentó justificación" },
      ],
    };
  },
};
</script>
