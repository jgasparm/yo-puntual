<template>
    <v-overlay :model-value="isVisible" class="d-flex flex-column justify-center align-center" persistent>
      <v-img src="/logo.webp" height="100" class="logo-spin mb-4" />
      <span class="text-h6 font-weight-medium">{{ loadingText }}</span>
    </v-overlay>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useLoadingStore } from '@/stores/loadingStore'
  
  const store = useLoadingStore()
  const isVisible = computed(() => store.isLoading)
  const loadingText = computed(() => store.text || 'Procesando...')
  </script>
  
  <style scoped>
  .logo-spin {
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>
  