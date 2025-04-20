<template>
  <v-breadcrumbs class="mb-4" :items="items" divider=">">
    <template #prepend>
      <v-icon color="primary" class="me-2">mdi-home</v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script setup>
//import { computed } from 'vue'
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const items = ref([])

watchEffect(() => {
  const metaCrumbs = route.meta?.breadcrumb
  if (Array.isArray(metaCrumbs)) {
    items.value = metaCrumbs.map((b, i, arr) => ({
      title: b.text,
      disabled: i === arr.length - 1,
      to: b.to || undefined
    }))
  } else {
    items.value = []
  }
})

/* const items = computed(() => {
  const metaCrumbs = route.meta?.breadcrumb
  if (metaCrumbs) {
    return metaCrumbs.map((b, i, arr) => ({
      title: b.text,
      disabled: i === arr.length - 1,
      to: b.to || undefined
    }))
  }
  return []
}) */
</script>

<style scoped>
.v-breadcrumbs {
  font-size: 0.875rem;
  flex-wrap: nowrap;
  overflow-x: auto;
  white-space: nowrap;
}

.v-breadcrumbs .v-breadcrumbs-item:last-child {
  white-space: normal;
  max-width: 60%;
  overflow-wrap: break-word;
}

@media (max-width: 768px) {
  .v-breadcrumbs {
    font-size: 0.8rem;
    padding-inline: 8px;
  }
}
</style>
