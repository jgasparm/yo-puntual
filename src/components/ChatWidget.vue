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
                  v-if="msg.items && msg.pagination.hasMore"
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
import { ref, nextTick } from 'vue';

const dialog = ref(false);
const userInput = ref('');
const messages = ref([]);
const lastUserMessage = ref('');
const userLogged = true;

const token  = localStorage.getItem('token');
const perfil = localStorage.getItem('perfil');

// Filtros base (el offset/limit se añadirá dinámicamente)
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
};

const API = process.env.VUE_APP_API_BASE_URL;

/**
 * 1) En `send()` pedimos al backend el primer bloque (offset=0, limit=5).
 * 2) El backend nos devolverá un JSON que contiene:
 *       { from: 'function', data: [Array de hasta 5 filas], meta: { total, offset, limit, hasMore, nextOffset } }
 * 3) Creamos un objeto `msg` con `msg.items = data` y `msg.pagination = meta`.
 * 4) Si `meta.hasMore === true`, el botón “Mostrar 5 registros más…“ aparee.
 */
async function send() {
  if (!userInput.value.trim()) return;

  lastUserMessage.value = userInput.value;

  // 1️⃣ Mensaje del usuario
  messages.value.push({
    id: Date.now(),
    from: 'user',
    text: lastUserMessage.value
  });

  // 2️⃣ Placeholder “Escribiendo…”
  messages.value.push({
    id: Date.now() + 1,
    from: 'bot',
    text: 'Escribiendo…'
  });

  // 3️⃣ Filtros iniciales (offset=0, limit=5)
  const filtros = {
    ...filtrosBase,
    offset: 0,
    limit: 5
  };

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
    });

    const payload = await res.json();

    // 4️⃣ Quitamos el placeholder
    messages.value.pop();

    // 5️⃣ Si el backend indica “from: 'function'” y tenemos un array en `data`:
    if (payload.from === 'function' && Array.isArray(payload.data)) {
      // payload.data ya es el “chunk” de hasta 5 filas
      // payload.meta contiene: { total, offset, limit, hasMore, nextOffset }

      // a) Si no hay ningún registro
      if (payload.data.length === 0) {
        messages.value.push({
          id: Date.now() + 2,
          from: 'bot',
          text: '⚠️ No se encontraron registros de asistencia.'
        });
      } else {
        // b) Creamos el objeto msg con items y paginación tal cual vino del backend
        messages.value.push({
          id: Date.now() + 2,
          from: 'bot',
          items: payload.data,          // ya es un array de hasta 5 filas
          pagination: {
            total:      payload.meta.total,
            offset:     payload.meta.offset,
            limit:      payload.meta.limit,
            hasMore:    payload.meta.hasMore,
            nextOffset: payload.meta.nextOffset
          }
        });
      }
    } else {
      // 6️⃣ Si vino texto libre o algo distinto
      messages.value.push({
        id: Date.now() + 2,
        from: 'bot',
        text: payload.reply || '❌ Ocurrió un error inesperado.'
      });
    }

    // 7️⃣ Scroll al fondo
    await nextTick();
    const box = document.querySelector('.messages');
    if (box) box.scrollTop = box.scrollHeight;

  } catch (err) {
    // 8️⃣ Si hubo un error de red o similar
    messages.value.pop();
    messages.value.push({
      id: Date.now() + 2,
      from: 'bot',
      text: `❌ Hubo un error: ${err.message}`
    });
  }

  userInput.value = '';
}

/**
 * loadMore: al hacer click en “Mostrar X registros más…”
 * hacemos otra petición al mismo endpoint, pero ahora con offset = nextOffset
 * El backend devolverá otro “chunk” y un nuevo meta.hasMore
 * A ese nuevo array (chunk) lo concatenamos a msg.items y actualizamos msg.pagination.
 */
async function loadMore(msg) {
  // 1) Extraemos la paginación actual
  const { offset: prevOffset, limit } = msg.pagination;

  // 2) Preparamos los filtros para pedir el siguiente bloque
  const filtros = {
    ...filtrosBase,
    offset: prevOffset + limit,
    limit
  };

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
    });

    const payload = await res.json();

    if (payload.from === 'function' && Array.isArray(payload.data)) {
      // payload.data es el siguiente bloque (hasta `limit` filas)
      // payload.meta trae el nuevo meta.hasMore, meta.nextOffset, etc.

      // 3) Concatenamos el “chunk” nuevo a los items existentes
      msg.items = [
        ...msg.items,
        ...payload.data
      ];

      // 4) Actualizamos la paginación con base en payload.meta
      msg.pagination = {
        total:      payload.meta.total,
        offset:     payload.meta.offset,
        limit:      payload.meta.limit,
        hasMore:    payload.meta.hasMore,
        nextOffset: payload.meta.nextOffset
      };

      // 5) Scroll al fondo
      await nextTick();
      const box = document.querySelector('.messages');
      if (box) box.scrollTop = box.scrollHeight;
    }
  } catch (err) {
    console.error('Error en loadMore:', err);
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
