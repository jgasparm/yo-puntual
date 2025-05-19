<template>
  <div>
    <v-alert v-if="items.length === 0" type="info">
      No hay calificaciones registradas para el <strong>{{ nombrePeriodo }}</strong>.
    </v-alert>

    <v-row v-else dense>
      <v-col
        v-for="(item, idx) in paginatedItems"
        :key="idx"
        cols="12"
        class="mb-2"
      >
        <v-card outlined>
          <v-card-title class="subtitle-2 font-weight-bold text-start allow-wrap">
            {{ item.numero }}. {{ item.alumno }}
          </v-card-title>
          <v-card-text class="text-body-2 text-start">
            <template v-for="(group, gi) in groupedColumnHeaders" :key="gi">
              <div class="mb-2">
                <strong>{{ group.title }}:</strong>
                <ul class="pl-4 mb-0">
                  <li
                    v-for="col in group.columns"
                    :key="col.key"
                    :class="{ 'no-bullet': col.label === 'LOGRO' }"
                  >
                    {{ col.label === 'LOGRO' ? 'Logro' : getActivityName(col.key) }}:
                    <span>{{ item[col.key] || '–' }}</span>
                  </li>
                </ul>
              </div>
            </template>

            <div class="text-center mt-3">
              <v-chip class="highlight-average">
                Promedio Bimestral: {{ item.promedio }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-pagination
      v-if="paginatedPages > 1"
      v-model="currentPage"
      :length="paginatedPages"
      :total-visible="3"
      show-first-last
      first-icon="mdi-chevron-double-left"
      last-icon="mdi-chevron-double-right"
      prev-icon="mdi-chevron-left"
      next-icon="mdi-chevron-right"
      class="mt-2 custom-pagination"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  items: Array,
  groupedColumnHeaders: Array,
  legendAbreviaturas: Array,
  nombrePeriodo: String,
  itemsPerPage: { type: Number, default: 5 }
})

const currentPage = ref(1)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  return props.items.slice(start, start + props.itemsPerPage)
})

const paginatedPages = computed(() =>
  Math.ceil(props.items.length / props.itemsPerPage)
)

function getActivityName(colKey) {
  const parts = colKey.split('_acti_')
  if (parts.length < 2) return colKey
  const abre = parts[1]
  const ent = props.legendAbreviaturas.find(l => l.sigla === abre)
  return ent ? ent.nombre : abre
}
</script>

<style scoped>
.allow-wrap { white-space: normal !important; word-break: break-word; }
.no-bullet { list-style-type: none; margin: 0; padding-left: 0; }
/* … tus otros estilos móviles … */
</style>
