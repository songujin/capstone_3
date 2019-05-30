<template>
  <div id='app'>
    <router-view></router-view>
    <obg-footer :mask=false @back='onBack' @more='onMore' disable='right'></obg-footer>
  </div>
</template>

<script>
import footer from 'obigo-js-ui-rnbs/components/footer'
import { storage } from './js/manageLibs'
import 'obigo-js-webapi/vehicle/vehicle'

export default {
  name: 'home',
  components: {
    'obg-footer': footer
  },
  data () {
    return {
      hardkeyCodes: this.$hardkey.getCodes(),
      alarmRFFlag: true,
      alarmRRFlag: true,
      alarmLRFlag: true,
      alarmLFFlag: true,
      alarmEngineOilFlag: true,
      alarmBatteryFlag: true,
      alarmCFilterFlag: true,
      alarmWaterFlag: true,
      warningBatteryFlag: true,
      warningRFFlag: true,
      warningRRFlag: true,
      warningLRFlag: true,
      warningLFFlag: true,
      warningEngineOilFlag: true,
      warningWaterFlag: true,
      chargeLevel: '',
      oilLevel: '',
      temp: '',
      tireStateRF: '',
      pressureRF: '',
      tireStateLF: '',
      pressureLF: '',
      tireStateRR: '',
      pressureRR: '',
      tireStateLR: '',
      pressureLR: ''
    }
  },
  methods: {
    startVehicle: function () {
      let self = this
      let vehicle = window.navigator.vehicle
      if (vehicle) {
        vehicle.start(() => {
          console.log('hello startVehicle')
          self.initBatteryStatus(vehicle.batteryStatus)
          self.initTire(vehicle.tire)
          self.initEngineOil(vehicle.engineOil)
          self.initEngineCoolant(vehicle.engineCoolant)
        }, function () {
          throw Error('constuctor fails')
        })
      }
    },
    initEngineOil (ve) {
      console.log('enter initEngineOil')
      // EnginOil
      this.getEngineOil(ve)
      this.subscribeEngineOil(ve)
    },
    getEngineOil (ve) {
      ve.get().then((engineOil) => {
        console.log('get')
        switch (engineOil.level) {
          case 'warning': this.oilLevel = 0
            break
          case 'BargraphElement1': this.oilLevel = 12.5
            break
          case 'BargraphElement2': this.oilLevel = 25
            break
          case 'BargraphElement3': this.oilLevel = 37.5
            break
          case 'BargraphElement4': this.oilLevel = 50
            break
          case 'BargraphElement5': this.oilLevel = 62.5
            break
          case 'BargraphElement6': this.oilLevel = 75
            break
          case 'BargraphElement7': this.oilLevel = 87.5
            break
          case 'BargraphElement8': this.oilLevel = 100
            break
        }
        this.$store.commit('setOilLevel', this.oilLevel)
        console.log('get oilLevel ' + this.oilLevel)
      }, function (err) {
        console.log(err.error)
        console.log(err.message)
      })
    },
    subscribeEngineOil (ve) {
      ve.subscribe((engineOil) => {
        console.log('subscribe')
        switch (engineOil.level) {
          case 'warning': this.oilLevel = 0
            break
          case 'BargraphElement1': this.oilLevel = 12.5
            break
          case 'BargraphElement2': this.oilLevel = 25
            break
          case 'BargraphElement3': this.oilLevel = 37.5
            break
          case 'BargraphElement4': this.oilLevel = 50
            break
          case 'BargraphElement5': this.oilLevel = 62.5
            break
          case 'BargraphElement6': this.oilLevel = 75
            break
          case 'BargraphElement7': this.oilLevel = 87.5
            break
          case 'BargraphElement8': this.oilLevel = 100
            break
        }
        this.$store.commit('setOilLevel', this.oilLevel)
        console.log('sub oilLevel ' + this.oilLevel)
      })
    },
    initBatteryStatus (vb) {
      console.log('enter initBatteryStatus')
      // Battery
      this.getBatteryStatus(vb)
      this.subscribeBatteryStatus(vb)
    },
    getBatteryStatus (vb) {
      vb.get().then((batteryStatus) => {
        console.log('get')
        this.chargeLevel = batteryStatus.chargeLevel
        this.$store.commit('setChargeLevel', this.chargeLevel)
        console.log('get chargeLevel ' + this.chargeLevel)
      }, function (err) {
        console.log(err.error)
        console.log(err.message)
      })
    },
    subscribeBatteryStatus (vb) {
      vb.subscribe((batteryStatus) => {
        console.log('subscribe')
        this.chargeLevel = batteryStatus.chargeLevel
        this.$store.commit('setChargeLevel', this.chargeLevel)
        console.log('sub chargeLevel ' + this.chargeLevel)
      })
    },
    initTire (vt) {
      console.log('enter initTire')
      // Tire
      this.getTire(vt)
      this.subscribeTire(vt)
    },
    getTire (vt) {
      vt.get().then((tire) => {
        console.log('get')
        this.tireStateRF = tire[0].state
        this.pressureRF = tire[0].pressure
        this.tireStateLF = tire[1].state
        this.pressureLF = tire[1].pressure
        this.tireStateRR = tire[2].state
        this.pressureRR = tire[2].pressure
        this.tireStateLR = tire[3].state
        this.pressureLR = tire[3].pressure
        this.$store.commit('setTireStateRF', this.tireStateRF)
        this.$store.commit('setPressureRF', this.pressureRF)
        this.$store.commit('setTireStateLF', this.tireStateLF)
        this.$store.commit('setPressureLF', this.pressureLF)
        this.$store.commit('setTireStateRR', this.tireStateRR)
        this.$store.commit('setPressureRR', this.pressureRR)
        this.$store.commit('setTireStateLR', this.tireStateLR)
        this.$store.commit('setPressureLR', this.pressureLR)
        console.log('get TireState ' + this.TireState)
        console.log('get pressure ' + this.pressure)
      }, function (err) {
        console.log(err.error)
        console.log(err.message)
      })
    },
    subscribeTire (vt) {
      vt.subscribe((tire) => {
        console.log('subscribe')
        this.tireStateRF = tire[0].state
        this.pressureRF = tire[0].pressure
        this.tireStateLF = tire[1].state
        this.pressureLF = tire[1].pressure
        this.tireStateRR = tire[2].state
        this.pressureRR = tire[2].pressure
        this.tireStateLR = tire[3].state
        this.pressureLR = tire[3].pressure
        this.$store.commit('setTireStateRF', this.tireStateRF)
        this.$store.commit('setPressureRF', this.pressureRF)
        this.$store.commit('setTireStateLF', this.tireStateLF)
        this.$store.commit('setPressureLF', this.pressureLF)
        this.$store.commit('setTireStateRR', this.tireStateRR)
        this.$store.commit('setPressureRR', this.pressureRR)
        this.$store.commit('setTireStateLR', this.tireStateLR)
        this.$store.commit('setPressureLR', this.pressureLR)
        console.log('sub TireState ' + this.TireState)
        console.log('sub pressure ' + this.pressure)
      })
    },
    initEngineCoolant (vc) {
      console.log('enter initEngineCoolant')
      // EngineCoolant
      this.getEngineCoolant(vc)
      this.subscribeEngineCoolant(vc)
    },
    getEngineCoolant (vc) {
      vc.get().then((engineCoolant) => {
        console.log('get')
        this.temp = engineCoolant.temperature
        this.$store.commit('setTemp', this.temp)
        console.log('get temperature ' + this.temp)
      }, function (err) {
        console.log(err.error)
        console.log(err.message)
      })
    },
    subscribeEngineCoolant (vc) {
      vc.subscribe((engineCoolant) => {
        console.log('subscribe')
        this.temp = engineCoolant.temperature
        this.$store.commit('setTemp', this.temp)
        console.log('sub temperature ' + this.temp)
      })
    },
    onBack (evt) {
      console.log(evt)
      if (window.applicationFramework) {
        window.applicationFramework.applicationManager.getOwnerApplication(window.document).back()
      }
    },
    onMore (evt) {
      console.log(evt)
    },
    initHardKeyAction () {
      this.$hardkey.addHardkeyListener(this.hardkeyCodes.code.HARDKEY_BUTTON_BACK, (e) => {
        this.onBack()
      })
    },
    calculateM (m) {
      let date = new Date()
      var betweenDay = (date.getTime() - m) / 1000 / 60 / 60 / 24
      return Math.floor(betweenDay / 30.4)
    },
    alarmPopup () {
      if (this.alarmRFFlag === true && 60000 - storage.loadRFTireKm() <= 0) {
        storage.saveRFProblem('problem_Distance')
        this.alarmRFFlag = false
        this.$router.push('/alarmRF')
      }
      if (this.alarmRFFlag === true && 36 - this.calculateM(storage.loadRFTireM()) <= 0) {
        storage.saveRFProblem('problem_Date')
        this.alarmRFFlag = false
        this.$router.push('/alarmRF')
      }
      if (this.alarmRRFlag === true && 60000 - storage.loadRRTireKm() <= 0) {
        storage.saveRRProblem('problem_Distance')
        this.alarmRRFlag = false
        this.$router.push('/alarmRR')
      }
      if (this.alarmRRFlag === true && 36 - this.calculateM(storage.loadRRTireM()) <= 0) {
        storage.saveRRProblem('problem_Date')
        this.alarmRRFlag = false
        this.$router.push('/alarmRR')
      }
      if (this.alarmLFFlag === true && 60000 - storage.loadLFTireKm() <= 0) {
        storage.saveLFProblem('problem_Distance')
        this.alarmLFFlag = false
        this.$router.push('/alarmLF')
      }
      if (this.alarmLFFlag === true && 36 - this.calculateM(storage.loadLFTireM()) <= 0) {
        storage.saveLFProblem('problem_Date')
        this.alarmLFFlag = false
        this.$router.push('/alarmLF')
      }
      if (this.alarmLRFlag === true && 60000 - storage.loadLRTireKm() <= 0) {
        storage.saveLRProblem('problem_Distance')
        this.alarmLRFlag = false
        this.$router.push('/alarmLR')
      }
      if (this.alarmLRFlag === true && 36 - this.calculateM(storage.loadLRTireM()) <= 0) {
        storage.saveLRProblem('problem_Date')
        this.alarmLRFlag = false
        this.$router.push('/alarmLR')
      }
      if (this.alarmOilFlag === true && 15000 - storage.loadEngineOilkm() <= 0) {
        storage.saveOilProblem('problem_Distance')
        this.alarmOilFlag = false
        this.$router.push('/alarmEngineOil')
      }
      if (this.alarmOilFlag === true && 12 - this.calculateM(storage.loadEngineOilM()) <= 0) {
        storage.saveOilProblem('problem_Date')
        this.alarmOilFlag = false
        this.$router.push('/alarmEngineOil')
      }
      if (this.alarmBatteryFlag === true && 60000 - storage.loadBatterykm() <= 0) {
        storage.saveBatteryProblem('problem_Distance')
        this.alarmBatteryFlag = false
        this.$router.push('/alarmBattery')
      }
      if (this.alarmBatteryFlag === true && 36 - this.calculateM(storage.loadBatteryM()) <= 0) {
        storage.saveBatteryProblem('problem_Date')
        this.alarmBatteryFlag = false
        this.$router.push('/alarmBattery')
      }
      if (this.alarmCFilterFlag === true && 15000 - storage.loadCFilterKm() <= 0) {
        storage.saveCFilterProblem('problem_Distance')
        this.alarmCFilterFlag = false
        this.$router.push('/alarmCFilter')
      }
      if (this.alarmCFilterFlag === true && 6 - this.calculateM(storage.loadCFilterM()) <= 0) {
        storage.saveCFilterProblem('problem_Date')
        this.alarmCFilterFlag = false
        this.$router.push('/alarmCFilter')
      }
      if (this.alarmWaterFlag === true && 15000 - storage.loadWaterkm() <= 0) {
        storage.saveWaterProblem('problem_Distance')
        this.alarmWaterFlag = false
        this.$router.push('/alarmWater')
      }
      if (this.alarmWaterFlag === true && 6 - this.calculateM(storage.loadWaterM()) <= 0) {
        storage.saveWaterProblem('problem_Date')
        this.alarmWaterFlag = false
        this.$router.push('/alarmWater')
      }
    }
  },
  mounted () {
    this.startVehicle()
    let AP = this
    this.initHardKeyAction()
    setInterval(function () {
      AP.alarmPopup()
    }, 10000) // 30분 1800000
  },
  watch: {
    chargeLevel: function () {
      if (this.chargeLevel <= 50 && this.warningBatteryFlag === true) {
        this.warningBatteryFlag = false
        this.$router.push('/warningBattery')
      }
    },
    oilLevel: function () {
      if (this.oilLevel < 50 && this.warningEngineOilFlag === true) {
        this.warningEngineOilFlag = false
        this.$router.push('/warningEngineOil')
      }
    },
    temp: function () {
      if ((this.temp > 110 || this.temp < 0) && this.warningWaterFlag === true) {
        this.warningWaterFlag = false
        this.$router.push('/warningWater')
      }
    },
    tireStateRF: function () {
      if (this.tireStateRF !== 'Good State' && this.warningRFFlag === true) {
        this.warningRFFlag = false
        this.$router.push('/warningRF')
      }
    },
    pressureRF: function () {
      if ((this.pressureRF < 1900 || this.pressureRF > 3800) && this.warningRFFlag === true) {
        this.warningRFFlag = false
        this.$router.push('/warningRF')
      }
    },
    tireStateLF: function () {
      if (this.tireStateLF !== 'Good State' && this.warningLFFlag === true) {
        this.warningLFFlag = false
        this.$router.push('/warningLF')
      }
    },
    pressureLF: function () {
      if ((this.pressureLF < 1900 || this.pressureLF > 3800) && this.warningLFFlag === true) {
        this.warningLFFlag = false
        this.$router.push('/warningLF')
      }
    },
    tireStateRR: function () {
      if (this.tireStateRR !== 'Good State' && this.warningRRFlag === true) {
        this.warningRRFlag = false
        this.$router.push('/warningRR')
      }
    },
    pressureRR: function () {
      if ((this.pressureRR < 1900 || this.pressureRR > 3800) && this.warningRRFlag === true) {
        this.warningRRFlag = false
        this.$router.push('/warningRR')
      }
    },
    tireStateLR: function () {
      if (this.tireStateLR !== 'Good State' && this.warningWaterFlag === true) {
        this.warningWaterFlag = false
        this.$router.push('/warningLR')
      }
    },
    pressureLR: function () {
      if ((this.pressureLR < 1900 || this.pressureLR > 3800) && this.warningLRFlag === true) {
        this.warningLRFlag = false
        this.$router.push('/warningLR')
      }
    }
  }
}
</script>

<style lang="scss">
#app{
  position: relative;
  background:#2a2a2a;
  color: #ffffff;
}
</style>
