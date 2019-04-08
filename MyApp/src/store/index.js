import Vue from 'vue'
import Vuex from 'vuex'

import createLogger from './util/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  strict: debug,
  plugins: debug ? [createLogger()] : []
})

export default store
