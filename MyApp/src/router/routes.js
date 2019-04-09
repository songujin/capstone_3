const routes = [{
  path: '/', component: () => import('@/components/airconditioner'), name: 'airconditioner'
}, { path: '/management', component: () => import('@/components/management'), name: 'management'
}, { path: '/managepopup', component: () => import('@/components/managepopup'), name: 'managepopup'
}, { path: '/battery', component: () => import('@/components/battery'), name: 'battery' }]

export default routes
