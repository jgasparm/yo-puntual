<template>
    <v-breadcrumbs class="mb-4" :items="items" divider=">">
      <template #prepend>
        <v-icon color="primary" class="me-2">mdi-home</v-icon>
      </template>
    </v-breadcrumbs>
  </template>
  
  <script setup>
  import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const items = computed(() => {
  if (route.meta?.breadcrumb) {
    return route.meta.breadcrumb.map((crumb, i, arr) => ({
      title: crumb.text,
      to: crumb.to || undefined,
      disabled: i === arr.length - 1
    }))
  }

  // fallback en caso no haya breadcrumb definido
  const segments = route.path.split('/').filter(Boolean)
  const crumbs = []
  let fullPath = ''

  segments.forEach((segment, i) => {
    fullPath += `/${segment}`
    crumbs.push({
      title: segment.charAt(0).toUpperCase() + segment.slice(1),
      disabled: i === segments.length - 1,
      to: i === segments.length - 1 ? undefined : fullPath,
    })
  })

  return crumbs
})

  </script>
  
  <style scoped>
  .v-breadcrumbs {
    font-size: 0.875rem;
  }
  </style>
  