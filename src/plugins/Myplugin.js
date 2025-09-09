

export default {
  install(app, options) {
    app.provide('i18n', options)

    app.config.globalProperties.$translate = (str) => {
      return str.split('.').reduce((o,k)=> {
        if (o) {
          return o[k]
        }
      }, options)
    }
  }
}