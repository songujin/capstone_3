import Vue from 'vue'
import Router from 'vue-router'
import { ObigoRouter } from 'obigo-js-ui'
import routes from './routes'

Vue.use(Router)

const router = ObigoRouter(new Router({
  mode: 'abstract',
  routes
}))
router.push('/')

export default router
