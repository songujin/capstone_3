<template>
  <div id='app'>
    <router-view></router-view>
    <obg-footer :mask=false @back='onBack' @more='onMore' disable='right'></obg-footer>
  </div>
</template>

<script>
import footer from 'obigo-js-ui-rnbs/components/footer'
import { storage } from './js/manageLibs'

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
      alarmBatterylag: true
    }
  },
  methods: {
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
      // if (this.alarmOillag === true && (storage.loadOillevelApi() === 'BargraphElement1' || storage.loadOillevelApi() === 'BargraphElement2')) {
      //   storage.saveBatteryProblem('problem_LevelAPI')
      //   this.alarmOillag = false
      //   this.$router.push('/management')
      // }
      // if (this.alarmOillag === true && storage.loadOilPresApi() === true) {
      //   storage.saveBatteryProblem('problem_PressAPI')
      //   this.alarmOillag = false
      //   this.$router.push('/management')
      // }
    }
  },
  mounted () {
    let AP = this
    this.initHardKeyAction()
    setInterval(function () {
      AP.alarmPopup()
    }, 1800000) // 30분
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
