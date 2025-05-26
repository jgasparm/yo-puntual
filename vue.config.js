const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      // ruta local en tu Vue
      '/chat': {
        target: 'http://165.227.123.136:3000',
        changeOrigin: true,
        pathRewrite: { '^/chat': '/chat' }
      }
    }
  }
})