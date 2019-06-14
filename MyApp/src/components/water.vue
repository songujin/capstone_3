<template>
  <div>
    <div class='contents'>
        <div class='parts'>
            <b-button-group vertical class='select' v-for="item in items" :key="item.name">
                <b-button ref="string" @click='gomanage(item.name)'>{{ item.name }}</b-button>
            </b-button-group>
        </div>     
        <div class='manage'>
            <div class='top'>
                <div class='btn1'>
                    <div class='btn'>
                        <b-button @click='update()'>Update</b-button>
                    </div>
                </div>
                <div class='desc'>
                    <p>Coolant</p>
                </div>
                <div class='btn2'>
                    <div class='btn'>
                        <b-button @click='go()'>Go</b-button>
                    </div>
                </div>     
            </div>
            <div class='detail'>
                <div class='km'>
                  <radial-progress-bar :diameter="200"
                      :completed-steps="km"
                      :total-steps=40000
                      stopColor = '#ff0000'>
                    <p><br></p>
                    <p>Replacement Period<br>: {{ 40000 }} km</p>
                    <p>Remaining<br>: {{ 40000 - km }} km</p>
                  </radial-progress-bar>
                </div>
                <div class='cycle'>
                  <radial-progress-bar :diameter="200"
                      :completed-steps=month
                      :total-steps=24
                      stopColor = '#ff0000'>
                    <p><br></p>
                    <p>Replacement Period<br>: {{ 24 }} months</p>
                    <p>Remaining<br>: {{ 24 - month }} months</p>
                  </radial-progress-bar>
                </div>
            </div>
            <div class='status'>
              <div class='s_title'>
                <p>TEMP</p>
              </div>
              <div class='s_bar'>
                <mdb-container>
                  <mdb-progress :height="27" :value="temp+40" max = "254" :color="variant" striped animated>{{temp}}°C</mdb-progress>
                </mdb-container>
              </div>
            </div>
        </div>  
    </div> 
  </div>
</template>
<script>
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import RadialProgressBar from 'vue-radial-progress'
import { mdbContainer, mdbProgress } from 'mdbvue'
import { storage } from '../js/manageLibs'
import { mapGetters } from 'vuex'

export default {
  name: 'battery',
  components: {
    RadialProgressBar,
    mdbContainer,
    mdbProgress
  },
  data: function () {
    return {
      items: [
          { name: 'Engine oil' },
          { name: 'Battery' },
          { name: 'Coolant' },
          { name: 'Tire' },
          { name: 'Cabin filter' }
      ],
      km: 0,
      month: 0,
      temp: 0,
      variant: 'success',
      nowTotal: '',
      pastTotal: '',
      updateCnt: 0 // update를 했는지 안했는지 구분
    }
  },
  computed: {
    ...mapGetters([
      'getTemp'
    ])
  },
  created () {
    this.updateCnt = storage.loadWaterUpdate()
    console.log('count : ' + this.updateCnt)
  },
  mounted () {
    let date = new Date()
    var betweenDay = (date.getTime() - storage.loadWaterM()) / 1000 / 60 / 60 / 24
    this.month = Math.floor(betweenDay / 30.4)

    let vehicle = window.navigator.vehicle
    this.initOdometer(vehicle.odometer)
    this.temp = this.getTemp
    if (this.temp > 110 || this.temp < 0) {
      this.variant = 'danger'
    } else {
      this.variant = 'success'
    }
    if (this.month >= 24) {
      this.month = 24
    }
  },
  watch: {
    getTemp: function (newVal, old) {
      this.temp = this.getTemp
    },
    temp: function (newVal, old) {
      if (this.temp > 110 || this.temp < 0) {
        this.variant = 'danger'
      } else {
        this.variant = 'success'
      }
    }
  },
  methods: {
    update () {
      this.$router.push('/managePopupWater')
    },
    BeforeUpdate () {
      if (this.updateCnt === 0) {
        return true
      }
    },
    initOdometer (vo) {
      console.log('enter initOdometer')
      // Odometer
      this.getOdometer(vo)
      this.subscribeOdometer(vo)
    },
    getOdometer (vo) {
      vo.get().then((odometer) => {
        console.log('get')
        if (this.BeforeUpdate()) { // update 시도 전, 앱 최초 실행 시
          console.log('hello first')
          this.nowTotal = odometer.distanceTotal
          this.km = this.nowTotal
          this.$store.commit('setAlarmWater', this.km)
          // this.km = storage.loadWaterkm()
        } else { // update 시도 후
          console.log('hello update')
          this.nowTotal = odometer.distanceTotal
          this.pastTotal = storage.loadWaterkm()
          this.km = this.nowTotal - this.pastTotal
          this.$store.commit('setAlarmWater', this.km)
        }
        console.log('get distanceTotal(now) ' + this.nowTotal)
        console.log('get km ' + this.km)

        if (this.km >= 40000) {
          this.km = 40000
        }
      }, function (err) {
        console.log(err.error)
        console.log(err.message)
      })
    },
    subscribeOdometer (vo) {
      vo.subscribe((odometer) => {
        console.log('subscribe')
        if (this.BeforeUpdate()) { // update 시도 전, 앱 최초 실행 시
          console.log('hello first')
          this.nowTotal = odometer.distanceTotal
          this.km = this.nowTotal
          this.$store.commit('setAlarmWater', this.km)
          // this.km = storage.loadWaterkm()
        } else { // update 시도 후
          console.log('hello update')
          this.nowTotal = odometer.distanceTotal
          this.pastTotal = storage.loadWaterkm()
          this.km = this.nowTotal - this.pastTotal
          this.$store.commit('setAlarmWater', this.km)
        }
        console.log('sub distanceTotal(now) ' + this.nowTotal)
        console.log('get km ' + this.km)

        if (this.km >= 40000) {
          this.km = 40000
        }
      })
    },
    go () {
      this.$router.push('/')
    },
    gomanage (page) {
      let str = '/'

      if (page === 'Engine oil') {
        str += 'management'
      } else if (page === 'Battery') {
        str += 'battery'
      } else if (page === 'Coolant') {
        str += 'water'
      } else if (page === 'Tire') {
        str += 'tire'
      } else if (page === 'Cabin filter') {
        str += 'cabinAirFilter'
      }
      this.$router.push(str)
    }
  }
}
</script>
<style lang='scss' scoped>
.contents {
  padding:20px;
  color: white;
}
div.parts {
    float: left;
    height: 85%;
    width: 25%;
}
div.select {
    height: 20%;
    width: 100%;
    p {
        text-align: center;
        margin: 15px;
        font-size: 20px;
    }
}
div.manage {
    float: left;
    height: 85%;
    width: 75%;
    border: 1px solid rgb(128, 128, 128);
}
div.top {
    height: 60.6px;
    width: 100%;
    background: rgba(14, 13, 13, 0.493);
}
div.detail {
    margin: 0 auto;
    height: 65%;
    width: 100%;
    text-align: center;
    border: 1px solid rgb(128, 128, 128);
}
div.btn2 {
    float: right;
}
div.btn1 {
    float: left;
}
div.desc {
    float: left;
    text-align: center;
    padding: 8px;
    height: 50%;
    width: 60%;
    margin: 6px 0px 5px 7px;
    p {
        font-size: 22px;
    }
}
.btn-secondary {
  background: black;
  font-size: 22px;
}
div.parts > :nth-child(3) > .btn-secondary{
  border-width: 4px;
  border-color: gray;
}
div.km {
  float: left;
  width: 50%;
  height: 85%;
  .radial-progress-container {
    margin-top: 5px;
    margin-left: 60px;
    p {
      font-size: 16px;
    }
  }
}
div.cycle {
  float: left;
  width: 50%;
  height: 85%;
  .radial-progress-container {
    margin-top: 5px;
    margin-left: 30px;
    p {
      font-size: 16px;
    }
  }
}
div.s_title {
  float: left;
  width: 20%;
  p {
    font-size: 22px;
    margin-left: 35px;
    margin-top: 8px;
  }
}
div.s_bar {
  float: left;
  width: 72%;
  margin-top: 13px;
  .container {
    padding-right: 0px;
    padding-left: 0px;
  }
  .progress {
    background-color: rgb(50, 50, 50)
  }
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
