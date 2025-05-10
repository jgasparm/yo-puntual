<template>
  <div class="login-wrapper">
    <v-app>
      <v-container class="d-flex justify-center align-center" style="min-height: 100vh">
        <v-card class="pa-6" max-width="380" width="100%" elevation="10" outlined>
          <v-img src="./logo.webp" height="120" contain class="mx-auto mb-2" />
          <h2 class="text-center text-h5 font-weight-bold mb-4">Ingreso al Sistema</h2>

          <v-form>
            <v-select
              v-model="document_type"
              :items="tipoDocumentoItems"
              item-text="title"
              item-value="key"
              label="Tipo de Documento"
              required
              outlined
              prepend-icon="mdi-card-account-details"
              dense
            />

            <v-text-field
              v-model="document_number"
              label="Número de documento"
              placeholder="Ej. 12345678"
              prepend-icon="mdi-account-circle-outline"
              outlined
              dense
              :rules="[v => !!v || 'Campo obligatorio']"
              ref="docInput"
            />

            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Contraseña"
              prepend-icon="mdi-lock-outline"
              :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append="showPassword = !showPassword"
              outlined
              dense
              :rules="[v => !!v || 'Campo obligatorio']"
            />

            <v-checkbox v-model="rememberMe" label="Recordarme" dense class="mt-1" />

            <v-btn
              color="primary"
              block
              class="mt-4"
              :disabled="!document_number || !password"
              @click="login"
            >
              Iniciar sesión
            </v-btn>

            <div class="my-4 text-center">
              <div id="recaptcha-v2-container" :style="{ display: showRecaptchaV2 ? 'inline-block' : 'none' }"></div>
            </div>
          </v-form>

          <DialogMensaje
            v-model:mostrar="ModalMensajeVisible"
            :titulo="tituloMensaje"
            :mensaje="contenidoMensaje"
            :tipo="tipoMensaje"
          />
        </v-card>

        <RecaptchaInvisible
          :siteKey="recaptchaV2SiteKey"
          :trigger="showRecaptchaV2"
          action="login"
          @verified="onRecaptchaV2Success"
          @error="onRecaptchaV2Error"
        />
      </v-container>
    </v-app>
  </div>
</template>

<script>
import DialogMensaje from '@/components/DialogMensaje.vue';
import RecaptchaInvisible from '@/components/RecaptchaInvisible.vue';
import { useLoadingStore } from '@/stores/loadingStore';

export default {
  name: 'LoginForm',
  components: { DialogMensaje, RecaptchaInvisible },
  data() {
    return {
      document_type: '1',
      tipoDocumentoItems: [
        { title: 'DNI', key: '1' },
        { title: 'Carnet de extranjería', key: '4' }
      ],
      document_number: '',
      password: '',
      showPassword: false,
      rememberMe: false,

      ModalMensajeVisible: false,
      tituloMensaje: '',
      contenidoMensaje: '',
      tipoMensaje: 'error',

      recaptchaV2SiteKey: '6LfHiiIrAAAAAPd1YIS7Cf1OBtEcY_j0fVT92_Ad',
      recaptchaAttempts: 0,
      maxAttempts: 2,
      showRecaptchaV2: false,
      recaptchaV2Token: '',
      recaptchaV2WidgetId: null
    }
  },
  mounted() {
    if (localStorage.getItem('auth') === 'true') {
      this.$router.push('/principal');
    }

    const rememberedDoc = localStorage.getItem('remembered_document');
    if (rememberedDoc) {
      this.document_number = rememberedDoc;
      this.rememberMe = true;
    }

    this.$nextTick(() => {
      this.$refs.docInput.focus();
    });
  },
  methods: {
    async login() {
      const loadingStore = useLoadingStore();
      if (!this.document_number || !this.password) return;
      loadingStore.mostrarLoading();

      try {
        if (this.showRecaptchaV2) {
          this.$nextTick(() => {
            if (window.grecaptcha && this.recaptchaV2WidgetId !== null) {
              window.grecaptcha.ready(() => {
                try {
                    window.grecaptcha.execute(this.recaptchaV2WidgetId);
                  } catch (e) {
                    console.error("⚠️ Error ejecutando reCAPTCHA v2:", e);
                    this.tituloMensaje = 'Error de verificación';
                    this.contenidoMensaje = 'Hubo un problema al ejecutar el reCAPTCHA. Intenta nuevamente.';
                    this.tipoMensaje = 'error';
                    this.ModalMensajeVisible = true;
                    useLoadingStore().ocultarLoading();
                  }
                });
              }
            });
            return;
          }


        const tokenV3 = await this.$recaptcha('login');
        this.realizarLogin(tokenV3, 'v3');
      } catch (error) {
        console.error('❌ Error al iniciar sesión:', error);
        loadingStore.ocultarLoading();
      }
    },

    async realizarLogin(token, tipo) {
      const loadingStore = useLoadingStore();
      try {
        const apiUrl = `https://amsoftsolution.com/amss/ws/wsLoginWeb.php?ai_tipo_documento=${this.document_type}&av_numero_documento_identidad=${this.document_number}&av_usua_clave=${this.password}&recaptcha=${token}&recaptcha_tipo=${tipo}`;
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.status && result.data.length > 0) {
          const userData = result.data[0];

          if (this.rememberMe) {
            localStorage.setItem('remembered_document', this.document_number);
          } else {
            localStorage.removeItem('remembered_document');
          }

          localStorage.setItem('auth', 'true');
          localStorage.setItem('token', userData.token);
          localStorage.setItem('profile', userData.profile);
          localStorage.setItem('anes_id', userData.anes_id);
          localStorage.setItem('anio_escolar', userData.anio_escolar);
          localStorage.setItem('usua_id', userData.usua_id);
          localStorage.setItem('pers_id', userData.pers_id);
          localStorage.setItem('perfil', userData.id_perfil);
          localStorage.setItem('user', JSON.stringify(userData));

          const submenuUrl = `https://amsoftsolution.com/amss/ws/wsConsultaUsuarioPermisos.php?ai_perf_id=${userData.id_perfil}`;
          const submenuResponse = await fetch(submenuUrl, {
            headers: {
              Authorization: `Bearer ${userData.token}`,
              'Content-Type': 'application/json'
            }
          });

          const submenuResult = await submenuResponse.json();
          if (submenuResult.status) {
            localStorage.setItem('submenus', JSON.stringify(submenuResult));
          }

          this.$router.push('/principal');
        } else if (result.usar_recaptcha_v2) {
          this.recaptchaAttempts++;
          this.showRecaptchaV2 = true;
          this.recaptchaV2Token = '';
          this.tituloMensaje = 'Verificación adicional requerida';
          this.contenidoMensaje = 'Por favor haz clic nuevamente para verificar tu identidad.';
          this.tipoMensaje = 'info';
          this.ModalMensajeVisible = true;

          setTimeout(() => {
            this.initRecaptchaV2();
          }, 300);
        } else {
          this.tituloMensaje = 'Credenciales incorrectas';
          this.contenidoMensaje = 'Por favor, revisa tu usuario y contraseña.';
          this.tipoMensaje = 'info';
          this.ModalMensajeVisible = true;
        }
      } catch (error) {
        console.error(error);
        alert('Error al conectar con el servidor.');
      } finally {
        loadingStore.ocultarLoading();
      }
    },

    onRecaptchaV2Success(token) {
      this.recaptchaV2Token = token;
      this.realizarLogin(token, 'v2');
    },

    onRecaptchaV2Error(err) {
      console.error('Error al ejecutar reCAPTCHA v2:', err);
      this.tituloMensaje = 'Error de seguridad';
      this.contenidoMensaje = 'No se pudo validar tu identidad. Intenta nuevamente.';
      this.tipoMensaje = 'error';
      this.ModalMensajeVisible = true;
    },

    initRecaptchaV2() {
      this.$nextTick(() => {
        const el = document.getElementById('recaptcha-v2-container');
        if (!el || this.recaptchaV2WidgetId !== null) return;

        if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
          this.recaptchaV2WidgetId = window.grecaptcha.render(el, {
            sitekey: this.recaptchaV2SiteKey,
            size: 'invisible',
            callback: (token) => this.onRecaptchaV2Success(token),
            'expired-callback': () => {
              this.$emit('error', new Error('Token expirado'));
            }
          });
        }
      });
    }
  }
}
</script>
