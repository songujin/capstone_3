let storage = {
  saveRFTireKm: function (km) {
    localStorage.setItem('RFtireKm', km)
  },
  loadRFTireKm: function () {
    let RFtireKm = localStorage.getItem('RFtireKm')
    RFtireKm = RFtireKm || ''
    return RFtireKm
  },
  saveRRTireKm: function (km) {
    localStorage.setItem('RRtireKm', km)
  },
  loadRRTireKm: function () {
    let RRtireKm = localStorage.getItem('RRtireKm')
    RRtireKm = RRtireKm || ''
    return RRtireKm
  },
  saveLFTireKm: function (km) {
    localStorage.setItem('LFtireKm', km)
  },
  loadLFTireKm: function () {
    let LFtireKm = localStorage.getItem('LFtireKm')
    LFtireKm = LFtireKm || ''
    return LFtireKm
  },
  saveLRTireKm: function (km) {
    localStorage.setItem('LRtireKm', km)
  },
  loadLRTireKm: function () {
    let LRtireKm = localStorage.getItem('LRtireKm')
    LRtireKm = LRtireKm || ''
    return LRtireKm
  },
  saveCFilterKm: function (km) {
    localStorage.setItem('CFilterKm', km)
  },
  loadCFilterKm: function () {
    let CFilterKm = localStorage.getItem('CFilterKm')
    CFilterKm = CFilterKm || ''
    return CFilterKm
  },
  saveRFTireM: function (m) {
    localStorage.setItem('RFtireM', m)
  },
  loadRFTireM: function () {
    let RFtireM = localStorage.getItem('RFtireM')
    RFtireM = RFtireM || ''
    return RFtireM
  },
  saveRRTireM: function (m) {
    localStorage.setItem('RRtireM', m)
  },
  loadRRTireM: function () {
    let RRtireM = localStorage.getItem('RRtireM')
    RRtireM = RRtireM || ''
    return RRtireM
  },
  saveLFTireM: function (m) {
    localStorage.setItem('LFtireM', m)
  },
  loadLFTireM: function () {
    let LFtireM = localStorage.getItem('LFtireM')
    LFtireM = LFtireM || ''
    return LFtireM
  },
  saveLRTireM: function (m) {
    localStorage.setItem('LRtireM', m)
  },
  loadLRTireM: function () {
    let LRtireM = localStorage.getItem('LRtireM')
    LRtireM = LRtireM || ''
    return LRtireM
  },
  saveCFilterM: function (m) {
    localStorage.setItem('CFilterM', m)
  },
  loadCFilterM: function () {
    let CFilterM = localStorage.getItem('CFilterM')
    CFilterM = CFilterM || ''
    return CFilterM
  },
  saveFirst: function (cnt) {
    localStorage.setItem('First', cnt)
  },
  loadFirst: function () {
    let First = localStorage.getItem('First')
    First = First || '0'
    return First
  },
  saveCFilterProblem: function (pText) {
    localStorage.setItem('CFilterProblem', pText)
  },
  loadCFilterProblem: function () {
    let Probelm = localStorage.getItem('CFilterProblem')
    Probelm = Probelm || ''
    return Probelm
  },
  saveRFProblem: function (pText) {
    localStorage.setItem('RFProblem', pText)
  },
  loadRFProblem: function () {
    let Probelm = localStorage.getItem('RFProblem')
    Probelm = Probelm || ''
    return Probelm
  },
  saveRRProblem: function (pText) {
    localStorage.setItem('RRProblem', pText)
  },
  loadRRProblem: function () {
    let Probelm = localStorage.getItem('RRProblem')
    Probelm = Probelm || ''
    return Probelm
  },
  saveLFProblem: function (pText) {
    localStorage.setItem('LFProblem', pText)
  },
  loadLFProblem: function () {
    let Probelm = localStorage.getItem('LFProblem')
    Probelm = Probelm || ''
    return Probelm
  },
  saveLRProblem: function (pText) {
    localStorage.setItem('LRProblem', pText)
  },
  loadLRProblem: function () {
    let Probelm = localStorage.getItem('LRProblem')
    Probelm = Probelm || ''
    return Probelm
  },
  saveAlarm: function (name) {
    localStorage.setItem('Alarm', name)
  },
  loadAlarm: function () {
    let Alarm = localStorage.getItem('Alarm')
    Alarm = Alarm || ''
    return Alarm
  },
  saveEngineOilkm: function (km) {
    localStorage.setItem('engineOilkm', km)
  },
  loadEngineOilkm: function () {
    let engineOilkm = localStorage.getItem('engineOilkm')
    engineOilkm = engineOilkm || ''
    return engineOilkm
  },
  saveEngineOilM: function (m) {
    localStorage.setItem('engineOilM', m)
  },
  loadEngineOilM: function () {
    let engineOilM = localStorage.getItem('engineOilM')
    engineOilM = engineOilM || ''
    return engineOilM
  },
  saveBatterykm: function (km) {
    localStorage.setItem('batterykm', km)
  },
  loadBatterykm: function () {
    let batterykm = localStorage.getItem('batterykm')
    batterykm = batterykm || ''
    return batterykm
  },
  saveBatteryM: function (m) {
    localStorage.setItem('batteryM', m)
  },
  loadBatteryM: function () {
    let batteryM = localStorage.getItem('batteryM')
    batteryM = batteryM || ''
    return batteryM
  },
  saveOilProblem: function (pText) {
    localStorage.setItem('oilProblem', pText)
  },
  loadOilProblem: function () {
    let Probelm = localStorage.getItem('oilProblem')
    Probelm = Probelm || ''
    return Probelm
  },
  saveBatteryProblem: function (pText) {
    localStorage.setItem('batteryProblem', pText)
  },
  loadBatteryProblem: function () {
    let Probelm = localStorage.getItem('batteryProblem')
    Probelm = Probelm || ''
    return Probelm
  },
  saveWaterProblem: function (pText) {
    localStorage.setItem('waterProblem', pText)
  },
  loadWaterProblem: function () {
    let Probelm = localStorage.getItem('waterProblem')
    Probelm = Probelm || ''
    return Probelm
  },
  saveOillevelApi: function (pText) {
    localStorage.setItem('oillevelApi', pText)
  },
  loadOillevelApi: function () {
    let oillevelApi = localStorage.getItem('oillevelApi')
    oillevelApi = oillevelApi || ''
    return oillevelApi
  },
  saveOilPresApi: function (pText) {
    localStorage.setItem('oilPresApi', pText)
  },
  loadOilPresApi: function () {
    let oilPresApi = localStorage.getItem('oilPresApi')
    oilPresApi = oilPresApi || ''
    return oilPresApi
  }
}

export { storage }
