import Vue from 'vue'
import Vuex from 'vuex'
import * as getters from './getters'
import createLogger from './util/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  getters,
  state: {
    chargeLevel: 0,
    tireStateRF: '',
    pressureRF: 0,
    tireStateLF: '',
    pressureLF: 0,
    tireStateRR: '',
    pressureRR: 0,
    tireStateLR: '',
    pressureLR: 0
  },
  mutations: {
    setChargeLevel (state, value) {
      state.chargeLevel = value
    },
    setTireStateRF (state, value) {
      state.tireStateRF = value
    },
    setPressureRF (state, value) {
      state.pressureRF = value
    },
    setTireStateLF (state, value) {
      state.tireStateLF = value
    },
    setPressureLF (state, value) {
      state.pressureLF = value
    },
    setTireStateRR (state, value) {
      state.tireStateRR = value
    },
    setPressureRR (state, value) {
      state.pressureRR = value
    },
    setTireStateLR (state, value) {
      state.tireStateLR = value
    },
    setPressureLR (state, value) {
      state.pressureLR = value
    }
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})

export default store
