import Vue from 'vue'
import Vuex from 'vuex'

import createLogger from './util/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  state: {
    title: ''
  },
  mutations: {
    changeTitle (state, title) {
      state.title = title
    }
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})

Vue.use(store)

export default store
