<template>
  <div>
    <div class='contents'>
        <div class='parts'>
            <div class='select' v-for="item in items" :key="item.name">
                <p ref="string" @click='gomanage(item.name)'>{{ item.name }}</p>
            </div>
        </div>     
        <div class='manage'>
            <div class='top'>
                <div class='btn1'>
                    <button>
                        <router-link v-bind:to="{ name: 'managepopupOil' }">날짜수정</router-link>
                    </button>
                </div>
                <div class='desc'>
                    <p>엔진 오일의 현재 상태</p>
                </div>
                <div class='btn2'>
                    <button>
                        <router-link v-bind:to="{ name: 'airconditioner' }">Go</router-link>
                    </button>
                </div>     
            </div>
            <div class='detail'>
                <div class='api'>
                  <span>Engine Oil</span><span> : </span><span>{{engineOillevel}}</span><span> , </span><span>{{engineOilpressur}}</span>
                </div>
                <div class='km'>
                  <div class='km_str'>
                    <span class='kmstr_left'>{{ 15000 - km }}km 남음</span>
                    <span class='kmstr_right'>15,000km 마다 교체</span>
                  </div>
                  <div class='km_bar'>
                    <progress-bar size="large" :val=(km)*(100/15000)></progress-bar>
                  </div>
                </div>
                <div class='cycle'>
                  <div class='mon_str'>
                    <span class='monstr_left'>{{ 12 - month }}개월 남음</span>
                    <span class='monstr_right'>12개월 마다 교체</span>
                  </div>
                  <div class='mon_bar'>
                    <progress-bar size="large" :val=(month)*100/12></progress-bar>
                  </div>
                </div>
                <div class='img'></div>
            </div>       
        </div>  
    </div> 
  </div>
</template>
<script>
import 'obigo-js-webapi/vehicle/vehicle'
import ProgressBar from 'vue-simple-progress'
import { storage } from '../js/manageLibs'

export default {
  name: 'management',
  components: {
    'progress-bar': ProgressBar
  },
  data: function () {
    return {
      items: [
          { name: '엔진 오일' },
          { name: '배터리' },
          { name: '냉각수' },
          { name: '타이어' },
          { name: '캐빈필터' }
      ],
      engineOillevel: '0',
      engineOilpressur: '0',
      month: 0,
      km: 0
    }
  },
  mounted () {
    this.startVehicle()
    this.km = storage.loadEngineOilkm()
    let date = new Date()
    var betweenDay = (date.getTime() - storage.loadEngineOilM()) / 1000 / 60 / 60 / 24
    this.month = Math.floor(betweenDay / 30.4)
    if (this.month >= 12) {
      this.month = 12
    }
    if (this.km >= 15000) {
      this.km = 15000
    }
    console.log(date.getTime())
  },
  methods: {
    startVehicle () {
      let vehicle = window.navigator.vehicle
      if (vehicle) {
        vehicle.start(() => {
          console.log('vehicle start')
          vehicle.engineOil.get().then((engineOil) => {
            this.engineOillevel = engineOil.level
            this.engineOilpressur = engineOil.pressureWarning
            // storage.saveOillevelApi(engineOil.level)
            // storage.saveOilPresApi(engineOil.pressureWarning)
            console.log(engineOil.level)
            console.log(engineOil.pressureWarning)
          }, function (err) {
            console.log(err.error)
            console.log(err.message)
          })
        }, function () {
          throw Error('constuctor fails')
        })
      }
    },
    gomanage (page) {
      let str = '/'
      if (page === '엔진 오일') {
        str += 'management'
      } else if (page === '배터리') {
        str += 'battery'
      } else if (page === '냉각수') {
        str += 'water'
      } else if (page === '타이어') {
        str += 'tire'
      } else if (page === '캐빈필터') {
        str += 'cabinAirFilter'
      }
      this.$router.push(str)
    }
  }
}
</script>
<style lang='scss' scoped>
div.api {
  button {
      height: 35px;
      width: 80px;
  }
}
.contents {
  padding:20px;
  color: white;
}
div.parts {
    float: left;
    height: 85%;
    width: 25%;
    border: 1px solid white;
}
div.select {
    height: 20%;
    width: 100%;
    border: 1px solid white;
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
    border: 1px solid white;
}
div.top {
    height: 76.6px;
    width: 100%;
    border: 1px solid white;
}
div.detail {
    margin: 0 auto;
    height: 100%;
    width: 100%;
    text-align: center;
    border: 1px solid white;
}
div.btn2 {
    float: right;
}
div.btn1 {
    float: left;
    margin-left: 20px;
}
div.desc {
    float: left;
    text-align: center;
    padding: 8px;
    height: 50%;
    width: 60%;
    border: 1px solid white;
    margin: 20px 33px 5px 23px;
    p {
        font-size: 20px;
    }
}
button {
    float: right;
    margin-top: 5px;
    margin-right: 9.79px;
    width: 65px;
    height: 65px;
    color: black;
    background-color: white 
}
div.api {
    position: absolute;
    top: 30%;
    left: 82%;
}
div.km, div.cycle {
    position: relative;
    left: 5%;
    top: 10%;
    height: 25%;
    width: 70%;
    // border: 1px solid white;
    margin-bottom: 5px;
}
div.km_str, div.mon_str {
    position: relative;
    height: 46%;
    width: 100%;
    border: 1px solid white;
}
div.km_bar, div.mon_bar {
    position: relative;
    height: 46%;
    width: 100%;
    border: 1px solid white;
    margin-top: 6px;
}
span.kmstr_left, span.monstr_left {
  top:7px;
  left:5%;
  position: absolute;
  text-align: left;
  width: 100%;
}
span.kmstr_right, span.monstr_right {
  top:7px;
  right:5%;
  position: absolute;
  text-align: right;
  width: 100%;
}
div.img {
    position: absolute;
    top: 37%;
    left: 81.5%;
    height: 130px;
    width: 110px;
    border: 1px solid white;
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
