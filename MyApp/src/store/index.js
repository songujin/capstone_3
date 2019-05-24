import Vue from 'vue'
import Vuex from 'vuex'
import * as getters from './getters'
import createLogger from './util/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  getters,
  state: {
    chargeLevel: 0
  },
  mutations: {
    setChargeLevel (state, value) {
      state.chargeLevel = value
    }
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})

export default store
