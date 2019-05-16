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
      alarmWaterFlag: true
    }
  },
  methods: {
    startVehicle () {
      console.log('hello startVehicle')
      let vehicle = window.navigator.vehicle
      vehicle.start(function () {
        vehicle.odometer.get().then((data) => {
          console.log('start vehicle')
          console.log(data)
        }, (err) => {
          console.log(err)
        })
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
    this.initHardKeyAction()
    let AP = this
    setInterval(function () {
      AP.alarmPopup()
    }, 15000) // 30분 1800000
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
