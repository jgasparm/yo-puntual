<template>
  <div v-if="userLogged" class="chat-widget">
    <v-btn icon @click="dialog = true" class="chat-btn">
      <v-icon>mdi-chat-processing</v-icon>
    </v-btn>
    <v-dialog v-model="dialog" width="350">
      <v-card>
        <v-toolbar flat color="primary">
          <v-toolbar-title class="white--text">Asistente IA</v-toolbar-title>
          <v-spacer/>
          <v-btn icon @click="dialog = false"><v-icon class="white--text">mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text class="pa-1">
          <div class="messages">
            <div v-for="m in messages" :key="m.id" :class="m.from">
              <strong>{{ m.from==='user'? 'Tú':'Asistente' }}:</strong>
              <div>{{ m.text }}</div>
            </div>
          </div>
          <v-text-field
            v-model="input"
            @keyup.enter="send"
            label="Escribe tu pregunta..."
            dense
            hide-details
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
const dialog   = ref(false)
const input    = ref('')
const messages = ref([])
const userLogged = true

const token  = localStorage.getItem('token')
const perfil = localStorage.getItem('perfil')

const filtros = {
  ai_pers_id: 0,
  ai_area_id: '0',
  ac_alum_turno:   '0',      // o tu valor por defecto
  ac_alum_nivel:   '0',      // …
  ac_alum_grado:   '0',
  ac_alum_seccion: '0',
  ai_hoes_id:      '0',
  ac_tipo_registro:'T',
  ac_permiso:      'T',
  ai_asju_id:      0,
  ac_aprobacion:   'T',
  ai_asde_id:      0,
  ac_anio_escolar: localStorage.getItem('anio_escolar'),
  av_profile: localStorage.getItem('profile')
}

const API     = process.env.VUE_APP_API_BASE_URL

async function send() {
  if (!input.value) return

  // 1️⃣ mete el mensaje del usuario
  messages.value.push({ id: Date.now(), from: 'user', text: input.value })
  const msg = input.value
  input.value = ''

  // 2️⃣ placeholder “Escribiendo…”
  messages.value.push({ id: Date.now()+1, from: 'bot', text: 'Escribiendo...' })

  try {
    const res = await fetch(`${API}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: msg, perfil, filtros })
    })
    const payload = await res.json()

    // quita el placeholder
    messages.value.pop()

    // 3️⃣ si viene resultado de función:
    if (payload.from === 'function') {
      // datos en array
      if (Array.isArray(payload.data)) {
        if (payload.data.length === 0) {
          // ✅ array vacío → mensaje claro
          messages.value.push({
            id: Date.now()+2,
            from:'bot',
            text:'⚠️ No se encontraron registros de asistencia.'
          })
        } else {
          // ✅ array con datos → pinta tabla
          const MAX = 10
          const total = payload.data.length
          const subset = payload.data.slice(0, MAX)
          const filas = subset
            .map(r =>
              `👤 ${r.alumno || r.persona}\n` +
              `📅 ${r.fecha} ⏰ ${r.hora}\n` +
              `📌 ${r.estado}\n`
            )
            .join('\n──────────\n') +
            (total > MAX ? `\n…y ${total-MAX} más` : '')
          messages.value.push({
            id: Date.now()+2,
            from:'bot',
            text: filas
          })
        }
      } else {
        // función devolvió error / objeto
        messages.value.push({
          id: Date.now()+2,
          from:'bot',
          text:'⚠️ ' + (payload.data?.message || 'Ocurrió un error')
        })
      }

    // 4️⃣ texto plano normal
    } else {
      messages.value.push({
        id: Date.now()+2,
        from:'bot',
        text: payload.reply
      })
    }

    // 5️⃣ scroll al fondo tras actualizar mensajes
    await nextTick()
    const box = document.querySelector('.messages')
    if (box) box.scrollTop = box.scrollHeight

  } catch (err) {
    // 6️⃣ fallo de red, JSON, etc.
    messages.value.pop()
    messages.value.push({
      id: Date.now()+2,
      from: 'bot',
      text: `❌ Hubo un error: ${err.message}`
    })
  }
}
</script>

<style scoped>
.chat-widget { position: fixed; bottom: 24px; right: 24px; }
.chat-btn { background: #1976D2; color: white; }
.messages { max-height: 300px; overflow-y: auto; margin-bottom: 8px; }
.user   { text-align: right; }
.bot    { text-align: left; white-space: pre-line; }
</style>
