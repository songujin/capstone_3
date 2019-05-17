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
      alarmOillag: true,
      alarmBatterylag: true,
      engineOillevel: '',
      engineOilpressur: '',
      batterychargeLevel: '',
      batterylowVoltage: ''
    }
  },
  methods: {
    startVehicle () {
      let vehicle = window.navigator.vehicle
      if (vehicle) {
        vehicle.start(() => {
          // vehicle.batteryStatus.get().then((batteryStatus) => {
          //   this.batterychargeLevel = batteryStatus.chargeLevel
          //   this.batterylowVoltage = batteryStatus.lowVoltageDisplay
          //   console.log(batteryStatus.chargeLevel)
          //   console.log(batteryStatus.lowVoltageDisplay)
          // }, function (err) {
          //   console.log(err.error)
          //   console.log(err.message)
          // })
          // console.log('vehicle start')
          // vehicle.engineOil.get().then((engineOil) => {
          //   this.engineOillevel = engineOil.level
          //   this.engineOilpressur = engineOil.pressureWarning
          //   console.log(engineOil.level)
          //   console.log(engineOil.pressureWarning)
          // }, function (err) {
          //   console.log(err.error)
          //   console.log(err.message)
          // })
        }, function () {
          throw Error('constuctor fails')
        })
      }
    },
    startVehicleBattery () {
      let vehicle = window.navigator.vehicle
      if (vehicle) {
        vehicle.start(() => {
          console.log('vehicle start')
          vehicle.batteryStatus.get().then((batteryStatus) => {
            this.batterychargeLevel = batteryStatus.chargeLevel
            this.batterylowVoltage = batteryStatus.lowVoltageDisplay
            console.log(batteryStatus.chargeLevel)
            console.log(batteryStatus.lowVoltageDisplay)
          }, function (err) {
            console.log(err.error)
            console.log(err.message)
          })
        }, function () {
          throw Error('constuctor fails')
        })
      }
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
      if (this.alarmOillag === true && 15000 - storage.loadEngineOilkm() <= 0) {
        storage.saveOilProblem('problem_Distance')
        this.alarmOillag = false
        this.$router.push('/alarmEngineOil')
      }
      if (this.alarmOillag === true && 12 - this.calculateM(storage.loadEngineOilM()) <= 0) {
        storage.saveOilProblem('problem_Date')
        this.alarmOillag = false
        this.$router.push('/alarmEngineOil')
      }
      if (this.alarmBatterylag === true && 60000 - storage.loadBatterykm() <= 0) {
        storage.saveBatteryProblem('problem_Distance')
        this.alarmBatterylag = false
        this.$router.push('/alarmBattery')
      }
      if (this.alarmBatterylag === true && 36 - this.calculateM(storage.loadBatteryM()) <= 0) {
        storage.saveBatteryProblem('problem_Date')
        this.alarmBatterylag = false
        this.$router.push('/alarmBattery')
      }
      // if (this.alarmOillag === true && (this.engineOillevel === 'BargraphElement1' || this.engineOillevel === 'BargraphElement2')) {
      //   storage.saveOilProblem('problem_LevelAPI')
      //   this.alarmOillag = false
      //   this.$router.push('/alarmEngineOil')
      // }
      // if (this.alarmOillag === true && this.engineOilpressur === true) {
      //   storage.saveOilProblem('problem_PressAPI')
      //   this.alarmOillag = false
      //   this.$router.push('/alarmEngineOil')
      // }
      // if (this.alarmBatterylag === true && (this.batterychargeLevel <= 20)) {
      //   storage.saveBatteryProblem('problem_LevelAPI')
      //   this.alarmBatterylag = false
      //   this.$router.push('/alarmBattery')
      // }
      // if (this.alarmBatterylag === true && (this.batterylowVoltage === 'BatteryWeak' || this.batterylowVoltage === 'BatteryWeakStartEngine')) {
      //   storage.saveBatteryProblem('problem_VoltageAPI')
      //   this.alarmBatterylag = false
      //   this.$router.push('/alarmBattery')
      // }
    }
  },
  mounted () {
    this.startVehicle()
    // this.startVehicleBattery()
    let AP = this
    this.initHardKeyAction()
    setInterval(function () {
      AP.alarmPopup()
    }, 10000) // 30분 1800000
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
