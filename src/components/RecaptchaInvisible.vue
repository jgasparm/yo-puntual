<template>
    <div style="display: none"></div>
  </template>
  
  <script>
  export default {
    name: 'RecaptchaInvisible',
    props: {
      siteKey: {
        type: String,
        required: true
      },
      trigger: {
        type: Boolean,
        required: true
      }
    },
    emits: ['verified', 'error'],
    watch: {
      trigger(newVal) {
        if (newVal) this.injectRecaptchaScript();
      }
    },
    methods: {
      injectRecaptchaScript() {
        if (document.querySelector('script[src*="recaptcha/api.js"]')) {
          console.log('🧠 Script de reCAPTCHA ya presente');
          this.waitForRender();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://www.recaptcha.net/recaptcha/api.js?onload=onRecaptchaLoadCallback&render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        //console.log('🧩 Script de reCAPTCHA v2 inyectado');
        window.onRecaptchaLoadCallback = () => {
          //console.log("✅ Callback onRecaptchaLoadCallback ejecutado");
          this.waitForRender();
        };
      },
      waitForRender(retries = 10) {
        if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
          //console.log('✅ reCAPTCHA.render está disponible');
        } else if (retries > 0) {
          setTimeout(() => this.waitForRender(retries - 1), 300);
        } else {
          this.$emit('error', new Error('No se cargó correctamente grecaptcha.render'));
        }
      }
    }
  };
  </script>