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
    pressureLR: 0,
    oilLevel: '',
    temp: '',
    warningFlag: true,
    alarmWater: 0,
    alarmCF: 0,
    alarmBattery: 0,
    alarmOil: 0,
    alarmLF: 0,
    alarmLR: 0,
    alarmRF: 0,
    alarmRR: 0
  },
  mutations: {
    setWarningFlag (state, value) {
      state.warningFlag = value
    },
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
    },
    setOilLevel (state, value) {
      state.oilLevel = value
    },
    setTemp (state, value) {
      state.temp = value
    },
    setAlarmWater (state, value) {
      state.alarmWater = value
    },
    setAlarmCF (state, value) {
      state.alarmCF = value
    },
    setAlarmBattery (state, value) {
      state.alarmBattery = value
    },
    setAlarmOil (state, value) {
      state.alarmOil = value
    },
    setAlarmLF (state, value) {
      state.alarmLF = value
    },
    setAlarmLR (state, value) {
      state.alarmLR = value
    },
    setAlarmRF (state, value) {
      state.alarmRF = value
    },
    setAlarmRR (state, value) {
      state.alarmRR = value
    }
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})

export default store
