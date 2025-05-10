import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    isLoading: false,
    mensaje: 'Cargando...'
  }),
  actions: {
    mostrarLoading(mensaje = 'Cargando...') {
      this.isLoading = true
      this.mensaje = mensaje
    },
    ocultarLoading() {
      this.isLoading = false
      this.mensaje = 'Cargando...'
    }
  }
})
