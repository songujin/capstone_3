const routes = [{
  path: '/', component: () => import('@/components/airconditioner'), name: 'airconditioner'
}, { path: '/management', component: () => import('@/components/management'), name: 'management'
}, { path: '/managepopup', component: () => import('@/components/managepopup'), name: 'managepopup'
}, { path: '/battery', component: () => import('@/components/battery'), name: 'battery'
}, { path: '/tire', component: () => import('@/components/tire'), name: 'tire'
}, { path: '/rightFrontTire', component: () => import('@/components/rightFrontTire'), name: 'rightFrontTire'
}, { path: '/rightRearTire', component: () => import('@/components/rightRearTire'), name: 'rightRearTire'
}, { path: '/leftFrontTire', component: () => import('@/components/leftFrontTire'), name: 'leftFrontTire'
}, { path: '/leftRearTire', component: () => import('@/components/leftRearTire'), name: 'leftRearTire'
}, { path: '/managePopupRF', component: () => import('@/components/managePopupRF'), name: 'managePopupRF'
}, { path: '/managePopupRR', component: () => import('@/components/managePopupRR'), name: 'managePopupRR'
}, { path: '/managePopupLF', component: () => import('@/components/managePopupLF'), name: 'managePopupLF'
}, { path: '/managePopupLR', component: () => import('@/components/managePopupLR'), name: 'managePopupLR'
}, { path: '/alarmRF', component: () => import('@/components/alarmRF'), name: 'alarmRF' } ]

export default routes
