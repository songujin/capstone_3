import Vue from 'vue'
import Vuex from 'vuex'

import createLogger from './util/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  state: {
    alarmRFValue: 0
  },
  mutations: {
    changeAlarmRFValue (state, value) {
      state.value = value
    }
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})

Vue.use(store)

export default store
