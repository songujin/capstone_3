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
                    <p>Left Front Tire</p>
                </div>
                <div class='btn2'>
                    <div class='btn'>
                        <b-button @click='go()'>Go</b-button>
                    </div>
                </div>     
            </div>
            <div class='detail'>
                <div class='km'>
                  <radial-progress-bar :diameter="250"
                      :completed-steps="km"
                      :total-steps=60000
                      stopColor = '#ff0000'>
                    <p><br></p>
                    <p>Replacement Period<br>: {{ 60000 }} km</p>
                    <p>Remaining<br>: {{ 60000 - km }} km</p>
                  </radial-progress-bar>
                </div>
                <div class='cycle'>
                  <radial-progress-bar :diameter="250"
                      :completed-steps=month
                      :total-steps=36
                      stopColor = '#ff0000'>
                    <p><br></p>
                    <p>Replacement Period<br>: {{ 36 }} months</p>
                    <p>Remaining<br>: {{ 36 - month }} months</p>
                  </radial-progress-bar>
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
import { storage } from '../js/manageLibs'

export default {
  name: 'leftFrontTire',
  components: {
    RadialProgressBar
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
      // TireState: '',
      // pressure: '', // Unit: mbar
      nowTotal: '',
      pastTotal: '',
      updateCnt: 0 // update를 했는지 안했는지 구분
    }
  },
  created () {
    this.updateCnt = storage.loadLFTireUpdate()
    console.log('count : ' + this.updateCnt)
  },
  mounted () {
    let date = new Date()
    var betweenDay = (date.getTime() - storage.loadLFTireM()) / 1000 / 60 / 60 / 24
    this.month = Math.floor(betweenDay / 30.4)

    let vehicle = window.navigator.vehicle
    // this.initTire(vehicle.tire)
    this.initOdometer(vehicle.odometer)

    if (this.month >= 36) {
      this.month = 36
    }
  },
  methods: {
    update () {
      this.$router.push('/managePopupLF')
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
          // this.km = storage.loadLFTireKm()
        } else { // update 시도 후
          console.log('hello update')
          this.nowTotal = odometer.distanceTotal
          this.pastTotal = storage.loadLFTireKm()
          this.km = this.nowTotal - this.pastTotal
        }
        console.log('get distanceTotal(now) ' + this.nowTotal)
        console.log('get km ' + this.km)

        if (this.km >= 60000) {
          this.km = 60000
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
          // this.km = storage.loadLFTireKm()
        } else { // update 시도 후
          console.log('hello update')
          this.nowTotal = odometer.distanceTotal
          this.pastTotal = storage.loadLFTireKm()
          this.km = this.nowTotal - this.pastTotal
        }
        console.log('sub distanceTotal(now) ' + this.nowTotal)
        console.log('get km ' + this.km)

        if (this.km >= 60000) {
          this.km = 60000
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
    height: 100%;
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
div.parts > :nth-child(4) > .btn-secondary{
  border-width: 4px;
  border-color: gray;
}
div.km {
  float: left;
  width: 50%;
  height: 100%;
  .radial-progress-container {
    margin-top: 5px;
    margin-left: 25px;
    p {
      font-size: 18px;
    }
  }
}
div.cycle {
  float: left;
  width: 50%;
  height: 100%;
  .radial-progress-container {
    margin-top: 5px;
    margin-left: 20px;
    p {
      font-size: 18px;
    }
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