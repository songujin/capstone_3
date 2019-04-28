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
                        <router-link v-bind:to="{ name: 'managepopupBattery' }">날짜수정</router-link>
                    </button>
                </div>
                <div class='desc'>
                    <p>배터리의 현재 상태</p>
                </div>
                <div class='btn2'>
                    <button>
                        <router-link v-bind:to="{ name: 'airconditioner' }">Go</router-link>
                    </button>
                </div>     
            </div>
            <div class='detail'>
                <div class='api'>
                <span>Battery</span><span> : </span><span>{{battery}}</span>
                </div>
                <div class='km'>
                  <div class='km_str'>
                    <span class='kmstr_left'>{{ 60000 - km }}km 남음</span>
                    <span class='kmstr_right'>60,000km 마다 교체</span>
                  </div>
                  <div class='km_bar'>
                    <progress-bar size="large" :val=(km)*(100/60000)></progress-bar>
                  </div>
                </div>
                <div class='cycle'>
                  <div class='mon_str'>
                    <span class='monstr_left'>{{ 36 - month }}개월 남음</span>
                    <span class='monstr_right'>36개월 마다 교체</span>
                  </div>
                  <div class='mon_bar'>
                    <progress-bar size="large" :val=(month)*100/36></progress-bar>
                  </div>
                </div>
                <div class='img'></div>
            </div>       
        </div>  
    </div> 
  </div>
</template>
<script>
import managepopup from './managepopup.vue'
import managepopupBattery from './managepopupBattery.vue'
// import 'obigo-js-webapi/vehicle/vehicle'
import ProgressBar from 'vue-simple-progress'
import { storage } from '../js/manageLibs'
// window.navigator.vehicle.start(function () {
//   window.navigator.vehicle.engineOil.get().then(function (data) {
//     alert(data.level)
//     console.log(data.level)
//     console.log(data.pressureWarning)
//   }, function (err) {
//     console.log(err)
//   })
//   // call vehicle API after initialization is completed
// }, function () {
//   throw Error('constructor fails')
// })

export default {
  name: 'battery',
  components: {
    'manage-popup': managepopup,
    'manage-popupBattery': managepopupBattery,
    'progress-bar': ProgressBar
  },
  data: function () {
    return {
      km_max: 60000,
      km_value: 10000,
      mon_max: 36,
      mon_value: 3,
      items: [
          { name: '엔진 오일' },
          { name: '배터리' },
          { name: '냉각수' },
          { name: '타이어' },
          { name: '캐빈필터' }
      ],
      battery: '0',
      km: 0,
      month: 0
    }
  },
  // mounted () {
  //   this.startVehicle()
  // },
  // computed: {
  //   //  this.startVehicle()
  //   tmp: function () {
  //     // alert('get 실행')
  //     this.$store.commit('changeBatteryMonth', localStorage.getItem('battery_month'))
  //     return this.$store.state.battery_month
  //   }
  // },
  mounted () {
    // this.startVehicle()
    this.km = storage.loadBatterykm()
    let date = new Date()
    var betweenDay = (date.getTime() - storage.loadBatteryM()) / 1000 / 60 / 60 / 24
    this.month = Math.floor(betweenDay / 30.4)
  },
  methods: {
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
      }
      this.$router.push(str)
    }
    // startVehicle () {
    //   let vehicle = window.navigator.vehicle
    //   if (vehicle) {
    //     if (vehicle.engineOil === undefined) {
    //       vehicle.start(() => {
    //         vehicle.engineOil.get().then(function (data) {
    //           this.$data.engineOil = data
    //         })
    //         alert('vehicle start')
    //         console.log('vehicle start')
    //       })
    //     }
    //   }
    // }
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





<!--<template>
  <div>
    <management-view></management-view>
  </div>
</template>
<script>
import management from './management.vue'
export default {
  name: 'managepopup',
  components: {
    'management-view': management
  }
}
</script>
<style lang='scss' scoped>
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
</style>-->