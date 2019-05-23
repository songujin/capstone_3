let storage = {
  // ================ KM ====================
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
  saveEngineOilkm: function (km) {
    localStorage.setItem('engineOilkm', km)
  },
  loadEngineOilkm: function () {
    let engineOilkm = localStorage.getItem('engineOilkm')
    engineOilkm = engineOilkm || ''
    return engineOilkm
  },
  saveBatterykm: function (km) {
    localStorage.setItem('batterykm', km)
  },
  loadBatterykm: function () {
    let batterykm = localStorage.getItem('batterykm')
    batterykm = batterykm || ''
    return batterykm
  },
  saveCFilterKm: function (km) {
    localStorage.setItem('CFilterKm', km)
  },
  loadCFilterKm: function () {
    let CFilterKm = localStorage.getItem('CFilterKm')
    CFilterKm = CFilterKm || ''
    return CFilterKm
  },
  saveWaterkm: function (km) {
    localStorage.setItem('Waterkm', km)
  },
  loadWaterkm: function () {
    let Waterkm = localStorage.getItem('Waterkm')
    Waterkm = Waterkm || ''
    return Waterkm
  },
  // ================ M ====================
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
  saveEngineOilM: function (m) {
    localStorage.setItem('engineOilM', m)
  },
  loadEngineOilM: function () {
    let engineOilM = localStorage.getItem('engineOilM')
    engineOilM = engineOilM || ''
    return engineOilM
  },
  saveBatteryM: function (m) {
    localStorage.setItem('batteryM', m)
  },
  loadBatteryM: function () {
    let batteryM = localStorage.getItem('batteryM')
    batteryM = batteryM || ''
    return batteryM
  },
  saveCFilterM: function (m) {
    localStorage.setItem('CFilterM', m)
  },
  loadCFilterM: function () {
    let CFilterM = localStorage.getItem('CFilterM')
    CFilterM = CFilterM || ''
    return CFilterM
  },
  saveWaterM: function (m) {
    localStorage.setItem('WaterM', m)
  },
  loadWaterM: function () {
    let WaterM = localStorage.getItem('WaterM')
    WaterM = WaterM || ''
    return WaterM
  },
  // ================ Problem ====================
  saveRFProblem: function (pText) {
    localStorage.setItem('Problem', pText)
  },
  loadRFProblem: function () {
    let Probelm = localStorage.getItem('Problem')
    Probelm = Probelm || ''
    return Probelm
  },
  saveRRProblem: function (pText) {
    localStorage.setItem('Problem', pText)
  },
  loadRRProblem: function () {
    let Probelm = localStorage.getItem('Problem')
    Probelm = Probelm || ''
    return Probelm
  },
  saveLFProblem: function (pText) {
    localStorage.setItem('Problem', pText)
  },
  loadLFProblem: function () {
    let Probelm = localStorage.getItem('Problem')
    Probelm = Probelm || ''
    return Probelm
  },
  saveLRProblem: function (pText) {
    localStorage.setItem('Problem', pText)
  },
  loadLRProblem: function () {
    let Probelm = localStorage.getItem('Problem')
    Probelm = Probelm || ''
    return Probelm
  },
  saveOilProblem: function (pText) {
    localStorage.setItem('Problem', pText)
  },
  loadOilProblem: function () {
    let Probelm = localStorage.getItem('Problem')
    Probelm = Probelm || ''
    return Probelm
  },
  saveBatteryProblem: function (pText) {
    localStorage.setItem('Problem', pText)
  },
  loadBatteryProblem: function () {
    let Probelm = localStorage.getItem('Problem')
    Probelm = Probelm || ''
    return Probelm
  },
  saveCFilterProblem: function (pText) {
    localStorage.setItem('Problem', pText)
  },
  loadCFilterProblem: function () {
    let Probelm = localStorage.getItem('Problem')
    Probelm = Probelm || ''
    return Probelm
  },
  saveWaterProblem: function (pText) {
    localStorage.setItem('Problem', pText)
  },
  loadWaterProblem: function () {
    let Probelm = localStorage.getItem('Problem')
    Probelm = Probelm || ''
    return Probelm
  },
  // ================ Update ====================
  saveLFTireUpdate: function (TnF) {
    localStorage.setItem('LFTireUpdate', TnF)
  },
  loadLFTireUpdate: function () {
    let count = localStorage.getItem('LFTireUpdate')
    count = count || 0
    return count
  },
  saveLRTireUpdate: function (TnF) {
    localStorage.setItem('LRTireUpdate', TnF)
  },
  loadLRTireUpdate: function () {
    let count = localStorage.getItem('LRTireUpdate')
    count = count || 0
    return count
  },
  saveRFTireUpdate: function (TnF) {
    localStorage.setItem('RFTireUpdate', TnF)
  },
  loadRFTireUpdate: function () {
    let count = localStorage.getItem('RFTireUpdate')
    count = count || 0
    return count
  },
  saveRRTireUpdate: function (TnF) {
    localStorage.setItem('RRTireUpdate', TnF)
  },
  loadRRTireUpdate: function () {
    let count = localStorage.getItem('RRTireUpdate')
    count = count || 0
    return count
  },
  saveEngineOilUpdate: function (TnF) {
    localStorage.setItem('EngineOilUpdate', TnF)
  },
  loadEngineOilUpdate: function () {
    let count = localStorage.getItem('EngineOilUpdate')
    count = count || 0
    return count
  },
  saveBatteryUpdate: function (TnF) {
    localStorage.setItem('BatteryUpdate', TnF)
  },
  loadBatteryUpdate: function () {
    let count = localStorage.getItem('BatteryUpdate')
    count = count || 0
    return count
  },
  saveCFilterUpdate: function (TnF) {
    localStorage.setItem('CFilterUpdate', TnF)
  },
  loadCFilterUpdate: function () {
    let count = localStorage.getItem('CFilterUpdate')
    count = count || 0
    return count
  },
  saveWaterUpdate: function (TnF) {
    localStorage.setItem('WaterUpdate', TnF)
  },
  loadWaterUpdate: function () {
    let count = localStorage.getItem('WaterUpdate')
    count = count || 0
    return count
  },
  // =========== First ===========
  saveFirst: function (boolean) {
    localStorage.setItem('First', boolean)
  },
  loadFirst: function () {
    let First = localStorage.getItem('First')
    First = First || true
    return First
  },
  // =========== Alarm ============
  saveAlarm: function (name) {
    localStorage.setItem('Alarm', name)
  },
  loadAlarm: function () {
    let Alarm = localStorage.getItem('Alarm')
    Alarm = Alarm || ''
    return Alarm
  },
  // =========== Mode ============
  saveMode: function (m) {
    localStorage.setItem('mode', m)
  },
  loadMode: function () {
    let mode = localStorage.getItem('mode')
    mode = mode || ''
    return mode
  },
  saveModeFlag: function (m) {
    localStorage.setItem('modeFlag', m)
  },
  loadModeFlag: function () {
    let modeFlag = localStorage.getItem('modeFlag')
    modeFlag = modeFlag || ''
    return modeFlag
  },
  saveRecirmodeMessageg: function (m) {
    localStorage.setItem('RecirmodeMessage', m)
  },
  loadRecirmodeMessage: function () {
    let RecirmodeMessage = localStorage.getItem('RecirmodeMessage')
    RecirmodeMessage = RecirmodeMessage || ''
    return RecirmodeMessage
  }
}

export { storage }
