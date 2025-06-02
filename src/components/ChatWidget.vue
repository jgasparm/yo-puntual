<template>
  <div v-if="userLogged" class="chat-widget">
    <v-btn
      class="chat-fab"
      fab
      elevation="6"
      color="primary"
      aria-label="Abrir Asistente IA"
      @click="dialog = true"
    >
      <v-icon class="white--text">mdi-chat-processing</v-icon>
    </v-btn>

    <v-dialog v-model="dialog" width="350">
      <v-card>
        <v-toolbar flat color="primary">
          <v-toolbar-title class="white--text">Asistente IA</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="dialog = false">
            <v-icon class="white--text">mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-1">
          <!-- Lista de mensajes -->
          <div class="messages">
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="msg.from"
            >
              <!-- Si viene paginado (msg.items) -->
              <template v-if="msg.items">
                <div
                  v-for="(row, idx) in msg.items"
                  :key="idx"
                  class="bot formatted-item"
                >
                  <!-- 1) Nombre (puede ocupar dos líneas) -->
                  <div class="item-name">
                    <v-icon small color="secondary" class="mr-1">mdi-account</v-icon>
                    <span>{{ row.alumno || row.persona }}</span>
                  </div>

                  <!-- 2) Fecha y hora -->
                  <div class="item-info">
                    <v-icon small color="primary" class="mr-1">mdi-calendar</v-icon>
                    <span>{{ row.fecha }}</span>
                    <v-icon small color="orange" class="mx-1">mdi-clock-time-four</v-icon>
                    <span>{{ row.hora }}</span>
                  </div>

                  <!-- 3) Estado -->
                  <div class="item-status">
                    <v-icon small color="success" class="mr-1">mdi-pin</v-icon>
                    <span>{{ row.estado }}</span>
                  </div>
                </div>

                <!-- Botón “mostrar más” si quedan más registros -->
                <button
                  v-if="msg.pagination.hasMore"
                  @click="loadMore(msg)"
                  class="load-more-btn"
                >
                  Mostrar {{ msg.pagination.limit }} registros más…
                </button>
              </template>

              <!-- Si no viene paginado, texto plano o reply normal -->
              <template v-else>
                {{ msg.text || msg.reply }}
              </template>
            </div>
          </div>

          <!-- Campo de texto + botón “Enviar” -->
          <div class="input-container">
            <v-text-field
              v-model="userInput"
              label="Escribe tu pregunta..."
              dense
              hide-details
              solo-inverted
              @keyup.enter="send"
              class="flex-grow-1"
            />

            <v-hover v-slot="{ hover }">
              <v-btn
                class="send-btn"
                :elevation="hover ? 8 : 4"
                color="primary"
                :disabled="!userInput.trim()"
                rounded
                @click="send"
              >
                <v-icon color="white">mdi-send</v-icon>
              </v-btn>
            </v-hover>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const dialog = ref(false)
const userInput = ref('')
const messages = ref([])
const lastUserMessage = ref('')
const userLogged = true

const token  = localStorage.getItem('token')
const perfil = localStorage.getItem('perfil')

// Filtros base
const filtrosBase = {
  ai_pers_id:         0,
  ai_area_id:        '0',
  ai_emca_id:        '0',
  ac_alum_turno:     '0',
  ac_alum_nivel:     '0',
  ac_alum_grado:     '0',
  ac_alum_seccion:   '0',
  ai_hoes_id:        '0',
  ac_tipo_registro: 'T',
  ac_permiso:       'T',
  ai_asju_id:        0,
  ac_aprobacion:    'T',
  ai_asde_id:        0,
  ac_anio_escolar:  localStorage.getItem('anio_escolar'),
  av_profile:       localStorage.getItem('profile')
}

const API = process.env.VUE_APP_API_BASE_URL

async function send() {
  if (!userInput.value.trim()) return

  lastUserMessage.value = userInput.value

  // Mensaje del usuario
  messages.value.push({
    id: Date.now(),
    from: 'user',
    text: lastUserMessage.value
  })

  // Placeholder “Escribiendo…”
  messages.value.push({
    id: Date.now() + 1,
    from: 'bot',
    text: 'Escribiendo…'
  })

  // Filtros iniciales (offset=0, limit=5)
  const filtros = {
    ...filtrosBase,
    offset: 0,
    limit: 5
  }

  try {
    const res = await fetch(`${API}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: lastUserMessage.value,
        perfil,
        filtros
      })
    })
    const payload = await res.json()

    messages.value.pop() // Quitamos el placeholder

    if (payload.from === 'function' && Array.isArray(payload.data)) {
      if (payload.data.length === 0) {
        messages.value.push({
          id: Date.now() + 2,
          from: 'bot',
          text: '⚠️ No se encontraron registros de asistencia.'
        })
      } else {
        const formattedItems = payload.data.map(r => ({
          alumno: r.alumno || r.persona,
          fecha:  r.fecha,
          hora:   r.hora,
          estado: r.estado
        }))

        messages.value.push({
          id: Date.now() + 2,
          from: 'bot',
          items: formattedItems.slice(0, filtros.limit),
          pagination: {
            total:      formattedItems.length,
            offset:     filtros.offset,
            limit:      filtros.limit,
            hasMore:    formattedItems.length > filtros.limit,
            nextOffset: filtros.offset + filtros.limit
          }
        })
      }
    } else {
      messages.value.push({
        id: Date.now() + 2,
        from: 'bot',
        text: payload.reply || '❌ Ocurrió un error inesperado.'
      })
    }

    // Scroll al fondo
    await nextTick()
    const box = document.querySelector('.messages')
    if (box) box.scrollTop = box.scrollHeight

  } catch (err) {
    messages.value.pop()
    messages.value.push({
      id: Date.now() + 2,
      from: 'bot',
      text: `❌ Hubo un error: ${err.message}`
    })
  }

  userInput.value = ''
}

async function loadMore(msg) {
  const { nextOffset, limit } = msg.pagination

  const filtros = {
    ...filtrosBase,
    offset: nextOffset,
    limit
  }

  try {
    const res = await fetch(`${API}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: lastUserMessage.value,
        perfil,
        filtros
      })
    })
    const payload = await res.json()

    if (payload.from === 'function' && Array.isArray(payload.data)) {
      const formattedItems = payload.data.map(r => ({
        alumno: r.alumno || r.persona,
        fecha:  r.fecha,
        hora:   r.hora,
        estado: r.estado
      }))

      msg.items = [
        ...msg.items,
        ...formattedItems.slice(0, limit)
      ]

      msg.pagination = {
        total:      formattedItems.length,
        offset:     nextOffset,
        limit,
        hasMore:    nextOffset + limit < formattedItems.length,
        nextOffset: nextOffset + limit
      }

      await nextTick()
      const box = document.querySelector('.messages')
      if (box) box.scrollTop = box.scrollHeight
    }

  } catch (err) {
    console.error('Error en loadMore:', err)
  }
}
</script>

<style scoped>
/* ===== Botón flotante “Asistente IA” ===== */
.chat-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 2000;
}
.chat-fab:hover {
  transform: scale(1.05);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.35);
}
.chat-fab:active {
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.45);
}

/* ===== Lista de mensajes: contenedor principal ===== */
.messages {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 8px;
  padding-right: 4px;
}
.user {
  text-align: right;
  margin: 4px 0;
}
.bot {
  text-align: left;
  margin: 4px 0;
}

/* ===== Cada item formateado ===== */
.formatted-item {
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
  padding: 8px 10px;
  margin-bottom: 6px;
  border-radius: 4px;
}

/* ===== Nombre (puede ocupar hasta 2 líneas si es necesario) ===== */
.item-name {
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  margin-bottom: 2px;
}

/* ===== Fecha y hora ===== */
.item-info {
  display: flex;
  align-items: center;
  color: #555;
  margin-bottom: 2px;
}

/* ===== Estado ===== */
.item-status {
  display: flex;
  align-items: center;
  color: #333;
}

/* Iconos pequeños dentro de cada línea */
.item-name v-icon,
.item-info v-icon,
.item-status v-icon {
  font-size: 16px;
}

/* ===== Botón “Mostrar más” ===== */
.load-more-btn {
  display: block;
  margin: 6px auto;
  padding: 4px 8px;
  background: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.load-more-btn:hover {
  background: #bdbdbd;
}

/* ===== Campo de texto + botón “Enviar” ===== */
.input-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.send-btn {
  width: 40px;
  height: 40px;
  min-width: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.send-btn:hover {
  transform: scale(1.08);
}
.send-btn:disabled {
  opacity: 0.6;
}

/* ===== Media queries para responsive (mobile, tablet, desktop, large desktop) ===== */
@media (max-width: 600px) {
  /* Mobile */
  .item-name {
    font-size: 13px;
  }
  .item-info,
  .item-status {
    font-size: 12px;
  }
}
@media (min-width: 600px) and (max-width: 960px) {
  /* Tablet */
  .item-name {
    font-size: 14px;
  }
  .item-info,
  .item-status {
    font-size: 13px;
  }
}
@media (min-width: 960px) and (max-width: 1264px) {
  /* Desktop normal */
  .item-name {
    font-size: 15px;
  }
  .item-info,
  .item-status {
    font-size: 14px;
  }
}
@media (min-width: 1264px) {
  /* Large desktop */
  .item-name {
    font-size: 16px;
  }
  .item-info,
  .item-status {
    font-size: 15px;
  }
}
</style>
