import Vue from 'vue'
import i18n from './i18n'
import App from './App'
import ObigoUI from 'obigo-js-ui'
import router from './router'
import store from './store'
import ToggleButton from 'vue-js-toggle-button'
import VueNumericInput from 'vue-numeric-input'
import BootstrapVue from 'bootstrap-vue'

import Button from 'bootstrap-vue/es/components/button'

import 'obigo-js-webapi/vehicle/vehicle'
import 'obigo-js-ui/features/commonPopup'

Vue.use(ObigoUI)
Vue.use(router)
Vue.use(ToggleButton)
Vue.use(BootstrapVue)
Vue.use(VueNumericInput)
Vue.use(Button)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  i18n,
  store,
  render: h => h(App)
})
