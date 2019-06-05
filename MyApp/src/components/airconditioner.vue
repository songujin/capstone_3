<template>
  <div>
    <div class='contents'>
      <div class='viewContent'>
        <div class='sensor'>
            <div class='dust'>
                <div class='dustFont'>
                  <p>DUST</p>
                </div>
                <div class='measure'>
                    <div class='value'>
                      <p>{{ dustValue }}㎍/㎥</p>
                    </div>
                    <div v-bind:style="dustBg" class='standard'>
                      <p>{{ dustLevel }}</p>
                    </div>
                </div>
            </div>
            <div class='fineDust'>
                <div class='finedustFont'>
                  <p>FINE DUST</p>
                </div>
                <div class='measure'>
                    <div class='value'>
                      <p>{{ fineDustValue }}㎍/㎥</p>
                    </div>
                    <div v-bind:style="fineDustBg" class='standard'>
                      <p>{{ fineDustLevel }}</p>
                    </div>
                </div>
            </div>
            <div class='co2'>
                <div class='co2Font'>
                  <p>CO2</p>
                </div>
                <div class='measure'>
                    <div class='value'>
                      <p>{{ co2Value }}ppm</p>
                    </div>
                    <div v-bind:style="co2Bg" class='standard'>
                      <p>{{ co2Level }}</p>
                    </div>
                </div>
            </div>
            <div class='screentrans'>
              <button @click='go()' type="button" class="btn-secondary">GO</button>
            </div>
        </div>     
        <div class='ventilation'>
            <div class='top'>
                <div class = 'switch'>
                  <toggle-button v-model="toggled" id="changed-font" @change="changeBody()"
                  :labels="{checked: 'Automation ON', unchecked: 'Automation OFF'}"
                  :color="{checked: '#7DCE94'}"
                  :sync="true"
                  :width="169"
                  :height="37"/>
                </div>
                <div class = 'desc'>
                  <div v-if='toggled===true' class = 'modeMessage'>
                    <span v-bind:style="modeColor">{{ RecirmodeMessage }}</span>
                    <span>{{ modeMessage }}</span>
                  </div>
                  <div v-if='toggled===false' class = 'modeMessage'>
                    <!-- <p>Circulation mode is off, click button</p> -->
                  </div>
                </div>
            </div>
            <div class = 'carImg'>
              <!--<img v-if='toggled===true' src='../assets/image/tmpimg1.jpg' >-->
              <!--<img v-if='toggled===true' src='../assets/image/tmpimg2.jpg' >-->
              <!-- <img v-if='toggled===false' src='../assets/image/tmpcarOff.jpg' > -->
              <img v-if='toggled===true && modeFlag===false' src='../assets/image/tmpcarOut.gif' >
              <img v-if='toggled===true && modeFlag===true' src='../assets/image/cartmp.gif' >
              <div class='modeOffMessage'>
                <span v-if='toggled===false' class='pressMessage'>If you press the Automation switch button</span>
                <span v-if='toggled===false' class='redPoint'>ON,</span>
                <p v-if='toggled===false'>Circulation mode according to the atmosphere is automated </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>
<script>
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import page from 'obigo-js-ui/mixins/page'
import { storage } from '../js/manageLibs'
import { Utils } from 'obigo-js-ui'

export default {
  name: 'home',
  mixins: [page],
  components: { },
  props: {
  },
  data: function () {
    return {
      boolean: 'true',
      dustValue: 0, // 실시간으로 미세먼지 받아와야함
      dustLevel: '', // 미세먼지 등급은 mounted() 에서 계산
      fineDustValue: 0, // 실시간으로 초미세먼지 받아와야함
      fineDustLevel: '', // 초미세먼지 등급도 mounted () 에서 계산
      co2Value: 1, // 실시간으로 이산화탄소 받아오기
      co2Level: '', // 이산화탄소 등급도 mounted ()에서 계산
      toggled: storage.loadMode(),
      dustFinalLevel: 'GOOD', // 미세먼지 농도 둘중 하나라도 나쁘면 나쁨
      modeFlag: storage.loadModeFlag(), // 외기순환모드 false, 내기순환모드 true
      RecirmodeMessage: storage.loadRecirmodeMessage(),
      modeMessage: ' mode is working now...'
    }
  },
  created () {
    this.boolean = storage.loadFirst()
    this.toggled = storage.loadMode()
    console.log('created boolean ' + this.boolean)
  },
  beforeMount () {
    this.toggled = storage.loadMode()
  },
  watch: {
    modeFlag: function (newVal, old) {
    },
    co2Value: function (newVal, old) {
      if (this.co2Value >= 0 && this.co2Value <= 450) {
        this.co2Level = '좋음'
      } else if (this.co2Value >= 451 && this.co2Value <= 1500) {
        this.co2Level = '보통'
      } else if (this.co2Value >= 1501 && this.co2Value <= 4000) {
        this.co2Level = '나쁨'
      } else if (this.co2Value >= 4001) {
        this.co2Level = '매우 나쁨'
      }
    },
    dustValue: function (newVal, old) {
      console.log('[watch]', this.dustValue)
      if (this.dustValue >= 0 && this.dustValue <= 30) {
        this.dustLevel = '좋음'
      } else if (this.dustValue >= 31 && this.dustValue <= 80) {
        this.dustLevel = '보통'
      } else if (this.dustValue >= 81 && this.dustValue <= 150) {
        this.dustLevel = '나쁨'
      } else if (this.dustValue >= 151) {
        this.dustLevel = '매우 나쁨'
      }
      // this.changeBody()
    },
    fineDustValue: function (newVal, old) {
      console.log('[watch]', this.fineDustValue)
      if (this.fineDustValue >= 0 && this.fineDustValue <= 15) {
        this.fineDustLevel = '좋음'
      } else if (this.fineDustValue >= 16 && this.fineDustValue <= 35) {
        this.fineDustLevel = '보통'
      } else if (this.fineDustValue >= 36 && this.fineDustValue <= 75) {
        this.fineDustLevel = '나쁨'
      } else if (this.fineDustValue >= 76) {
        this.fineDustLevel = '매우 나쁨'
      }
      // this.changeBody()
    }
  },
  methods: {
    getDustSensorValue: function () {
      const baseUrl = 'https://api.thingspeak.com/channels/790637/feeds.json?api_key=FGH157XY2MZ7LZO3&results=1' // http://devx.kr/capstone/
      Utils.ajax.get({
        url: baseUrl,
        dataType: 'json',
        timeout: 5000
      })
        .then((res) => {
          console.log('[parse data PM2.5]', res.data.feeds[0].field2)
          this.dustValue = res.data.feeds[0].field2
          console.log('[parse data PM10]', res.data.feeds[0].field3)
          this.fineDustValue = res.data.feeds[0].field3
        })
        .catch((err) => {
          console.log(err)
        })
    },
    getCo2SensorValue: function () {
      const baseUrl = 'https://api.thingspeak.com/channels/793917/fields/1.json?api_key=YKQCBYQG5HR1B29I&results=1'
      Utils.ajax.get({
        url: baseUrl,
        dataType: 'json',
        timeout: 5000
      })
        .then((res) => {
          this.co2Value = res.data.feeds[0].field1
          console.log('[co2]', this.co2Value)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    changeBody () {
      storage.saveMode(this.toggled)
      console.log('[changeBody function]', this.toggled)
      this.modeFlag = ''
      if (this.toggled === true) {
        if (this.dustValue >= 81 || this.fineDustValue >= 36) {
          this.dustFinalLevel = 'BAD'
        }
        if (this.dustFinalLevel === 'BAD' && this.co2Value >= 1501) {
          this.modeFlag = false
        } else if (this.dustFinalLevel === 'BAD' && this.co2Value < 1501) {
          this.modeFlag = true
        } else if (this.dustFinalLevel === 'GOOD' && this.co2Value >= 1501) {
          this.modeFlag = false
        } else if (this.dustFinalLevel === 'GOOD' && this.co2Value < 1501) {
          this.modeFlag = false
        }
      } else {

      }
      storage.saveModeFlag(this.modeFlag)
      if (this.modeFlag === true) {
        this.RecirmodeMessage = 'Recirculation'
        storage.saveRecirmodeMessageg(this.RecirmodeMessage)
      } else if (this.modeFlag === false) {
        this.RecirmodeMessage = 'ventilation'
        storage.saveRecirmodeMessageg(this.RecirmodeMessage)
      }
    },
    go () {
      if (this.isFirst()) {
        this.$router.push('/managepopup')
      } else {
        this.$router.push('/management')
      }
      // storage.saveMode(this.modeFlag)
      // if (storage.loadAlarm() === 'cabinFilter') {
      //   this.$router.push('/alarmCFilter')
      // }
    },
    isFirst () {
      if (this.boolean === 'true') { // true 일 경우
        return true
      }
    }
  },
  mounted () {
    let self = this
    setInterval(function () {
      self.getDustSensorValue()
      self.getCo2SensorValue()
    }, 1000)
    // this.toggle.$event.value = storage.loadMode()
    // this.toggled = storage.loadMode()
    // storage.saveFirst('true') // true일 경우 managepopup

    console.log('[mounted toggled value]', storage.loadMode())
    this.toggled = storage.loadMode()
    this.modeFlag = ''
    if (this.toggled === 'true') {
      if (this.dustValue >= 81 || this.fineDustValue >= 36) {
        this.dustFinalLevel = 'BAD'
      }
      if (this.dustFinalLevel === 'BAD' && this.co2Value >= 1501) {
        this.modeFlag = false
      } else if (this.dustFinalLevel === 'BAD' && this.co2Value < 1501) {
        console.log('test')
        this.modeFlag = true
      } else if (this.dustFinalLevel === 'GOOD' && this.co2Value >= 1501) {
        this.modeFlag = false
      } else if (this.dustFinalLevel === 'GOOD' && this.co2Value < 1501) {
        this.modeFlag = false
      }
    } else {

    }
    if (this.modeFlag === true) {
      this.RecirmodeMessage = 'Recirculation'
      storage.saveRecirmodeMessageg(this.RecirmodeMessage)
    } else if (this.modeFlag === false) {
      this.RecirmodeMessage = 'ventilation'
      storage.saveRecirmodeMessageg(this.RecirmodeMessage)
    }
    storage.saveModeFlag(this.modeFlag)
    this.modeFlag = storage.loadModeFlag()
    console.log('[mounted flag value]', storage.loadModeFlag())
    // 미세먼지 등급 계산
    console.log(this.dustValue)
    console.log(this.dustLevel)
    if (this.dustValue >= 0 && this.dustValue <= 30) {
      this.dustLevel = '좋음'
    } else if (this.dustValue >= 31 && this.dustValue <= 80) {
      this.dustLevel = '보통'
    } else if (this.dustValue >= 81 && this.dustValue <= 150) {
      this.dustLevel = '나쁨'
    } else if (this.dustValue >= 151) {
      this.dustLevel = '매우 나쁨'
    }
    // 초미세먼지 등급 계산
    if (this.fineDustValue >= 0 && this.fineDustValue <= 15) {
      this.fineDustLevel = '좋음'
    } else if (this.fineDustValue >= 16 && this.fineDustValue <= 35) {
      this.fineDustLevel = '보통'
    } else if (this.fineDustValue >= 36 && this.fineDustValue <= 75) {
      this.fineDustLevel = '나쁨'
    } else if (this.fineDustValue >= 76) {
      this.fineDustLevel = '매우 나쁨'
    }
    // 이산화탄소 등급 계산
    if (this.co2Value >= 0 && this.co2Value <= 450) {
      this.co2Level = '좋음'
    } else if (this.co2Value >= 451 && this.co2Value <= 1500) {
      this.co2Level = '보통'
    } else if (this.co2Value >= 1501 && this.co2Value <= 4000) {
      this.co2Level = '나쁨'
    } else if (this.co2Value >= 4001) {
      this.co2Level = '매우 나쁨'
    }
    // 공조기 알고리즘
    /*
    this.modeFlag = ''
    if (this.toggled === true) {
      if (this.dustValue >= 81 || this.fineDustValue >= 36) {
        this.dustFinalLevel = 'BAD'
      }
      if (this.dustFinalLevel === 'BAD' && this.co2Value >= 1501) {
        this.modeFlag = false
      } else if (this.dustFinalLevel === 'BAD' && this.co2Value < 1501) {
        this.modeFlag = true
      } else if (this.dustFinalLevel === 'GOOD' && this.co2Value >= 1501) {
        this.modeFlag = false
      } else if (this.dustFinalLevel === 'GOOD' && this.co2Value < 1501) {
        this.modeFlag = false
      }
    } else {

    }
    */
    // console.log(this.toggle.$event.value)
  },
  updated: function () {
    if (storage.loadMode() === 'true') {
      this.toggled = true
    } else {
      this.toggled = false
    }
    // if (storage.loadModeFlag() === 'true') {
    //   this.modeFlag = true
    // } else {
    //   this.modeFlag = false
    // }
    // this.toggled = storage.loadMode()
    console.log('[save Mode]', this.toggled)
    console.log('[save Mode Flag]', this.modeFlag)
    // this.changeBody()
  },
  computed: {
    co2Bg: function () {
      if ((this.dustLevel === '나쁨' || this.dustLevel === '매우 나쁨' || this.fineDustLevel === '나쁨' || this.fineDustLevel === '매우 나쁨') && (this.co2Level === '좋음' || this.co2Level === '보통')) {
        this.modeFlag = true
      } else {
        this.modeFlag = false
      }
      if (this.modeFlag === true) {
        this.RecirmodeMessage = 'Recirculation'
      } else if (this.modeFlag === false) {
        this.RecirmodeMessage = 'ventilation'
      }
      if (this.co2Level === '좋음') {
        return {
          color: '#31ddff'
        // background: 'blue'
        // background: '#F33434'
        }
      } else if (this.co2Level === '보통') {
        return {
          color: '#31ffbe'
        }
      } else if (this.co2Level === '나쁨') {
        return {
          color: '#fff900'
        }
      } else if (this.co2Level === '매우 나쁨') {
        return {
          color: '#ff0000'
        }
      }
    },
    dustBg: function () {
      if ((this.dustLevel === '나쁨' || this.dustLevel === '매우 나쁨' || this.fineDustLevel === '나쁨' || this.fineDustLevel === '매우 나쁨') && (this.co2Level === '좋음' || this.co2Level === '보통')) {
        this.modeFlag = true
      } else {
        this.modeFlag = false
      }
      if (this.modeFlag === true) {
        this.RecirmodeMessage = 'Recirculation'
      } else if (this.modeFlag === false) {
        this.RecirmodeMessage = 'ventilation'
      }
      if (this.dustLevel === '좋음') {
        return {
          color: '#31ddff'
        }
      } else if (this.dustLevel === '보통') {
        return {
          color: '#31ffbe'
        }
      } else if (this.dustLevel === '나쁨') {
        return {
          color: '#fff900'
        }
      } else if (this.dustLevel === '매우 나쁨') {
        return {
          color: '#ff0000'
        }
      }
    },
    fineDustBg: function () {
      if ((this.dustLevel === '나쁨' || this.dustLevel === '매우 나쁨' || this.fineDustLevel === '나쁨' || this.fineDustLevel === '매우 나쁨') && (this.co2Level === '좋음' || this.co2Level === '보통')) {
        this.modeFlag = true
      } else {
        this.modeFlag = false
      }
      if (this.modeFlag === true) {
        this.RecirmodeMessage = 'Recirculation'
      } else if (this.modeFlag === false) {
        this.RecirmodeMessage = 'ventilation'
      }
      if (this.fineDustLevel === '좋음') {
        return {
          color: '#31ddff'
        }
      } else if (this.fineDustLevel === '보통') {
        return {
          color: '#31ffbe'
        }
      } else if (this.fineDustLevel === '나쁨') {
        return {
          color: '#fff900'
        }
      } else if (this.fineDustLevel === '매우 나쁨') {
        return {
          color: '#ff0000'
        }
      }
    },
    modeColor: function () {
      if (this.RecirmodeMessage === 'Recirculation') {
        return {
          color: '#817aed'
        }
      } else if (this.RecirmodeMessage === 'ventilation') {
        return {
          color: '#ed7ad8'
        }
      }
    }
  }
}
</script>
<style lang='scss' scoped>
.contents {
  padding:20px;
  color: white;
}
div.viewContent {
  width: 100%;
  height: 100%;
  border: 1px solid #6c757d;
  background: rgba(14, 13, 13, 0.185);
}
div.sensor{
    height: 20%;
    background: rgba(14, 13, 13, 0.185);
    // border: 1px solid #6c757d;
    p {
        font-size: 20px;
    }
}
div.dust, div.fineDust, div.co2 {
    // margin-top: 5px;
    float: left;
    height: 71px;
    width: 30%;
    border: 1px solid #6c757d;
    text-align: center;
}
div.dustFont, div.finedustFont, div.co2Font {
  background: black;
  margin-left: 1px;
  // padding: 3px;
  p {
    margin: 0;
  }
}
div.measure {
    margin-left: 12px;
    float: left;
    width: 100%;
    height: 60%;
    // border: 1px solid white;
    text-align: center;
    div.value, div.standard {
      float:left;
      width: 104px;
      height: 38.5px;
      // border: 1px solid white;
      p {
        margin-top: 1px;
        font-size: 23px;
      }
    }
}
div.screentrans {
    // margin-top: 5px;
    float: left;
    height:69px;
    width:10%;
    button {
      margin-left: 6px;
      width: 70px;
      height: 71px;
      font-size: 22px;
      color: white;
      background-color: black;
      border: 1px solid #6c757d;
    }
}
div.ventilation {
    height:65.6%;
    border: 1px solid #6c757d;
    background: rgba(14, 13, 13, 0.185);
}
div.switch {
    margin-top: 10px;
    margin-left: 5px;
    float: left;
    height: 40px;
    width: 169px;
    // border: 1px solid white;
}
div.desc {
    margin-top: 2px;
    float: left;
    height:40px;
    width: 580px;
    // border: 1px solid white;
    div.modeMessage {
      margin-top: 5px;
      margin-left: 20px;
      p {
        font-size: 28px;
      }
    }
    span {
      font-size: 28px;
    }
}
div.carImg {
    margin: 10px 10px 5px 10px;
    float: left;
    height: 180px;
    width: 740px;
    background: black;
    // border: 1px solid white;
    div.modeOffMessage {
      margin-top: 50px;
      p {
        text-align: center;
        font-size: 25px;
      }
      span.pressMessage {
        margin-left: 113px;
        font-size: 25px;
      }
      span.redPoint {
        margin-left: 4px;
        font-size: 25px;
        color: red;
      }
    }
}
.vue-js-switch#changed-font {
  // 스위치 폰트 크기
  font-size: 16px !important;
}
@mixin mx-carmodel-7pr {
  .contents {
    color: white;
  }
}
@mixin get-style-of($model) {
  @if $model == '7pr' {
    @include mx-carmodel-7pr;
  }
}
@if $profile == 'production' {
  @media renault7P {
    @include get-style-of('7pr');
  }
} @else {
  @include get-style-of($car-model)
}
</style>