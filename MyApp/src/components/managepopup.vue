<template>
  <div>
    <div class='contents'>
        <div class='popup'>
            <p>{{ title }}</p>
            <div class='buy'>
                <div class='text'>
                    <p>Purchase Date</p>
                </div>
                <div class='date'>
                  <vuejs-datepicker v-model="selectedDate" placeholder="click..." style="color:black;" :disabledDates="state.disabledDates" format="yyyy-MM-dd"></vuejs-datepicker>
                </div>
            </div>
            <div class='distance'>
                <div class='text'>
                    <p>Total Distance</p>
                </div>
                <div class='odometer'>
                    <p>{{ distance }}km</p>
                </div>
            </div>
            <div class='btn'>
              <div class='btnBack'>
                <b-button @click='goback()'>Cancel</b-button>
              </div>
              <div class='btnGo'>
                <b-button @click='go()'>Ok</b-button>
              </div>
            </div>
        </div>
    </div> 
  </div>
</template>
<script>
import { storage } from '../js/manageLibs'
import Datepicker from 'vuejs-datepicker'
import 'obigo-js-webapi/vehicle/vehicle'

export default {
  name: 'managepopup',
  props: ['value'],
  components: {
    'vuejs-datepicker': Datepicker
  },
  data: function () {
    return {
      title: 'Setting',
      distance: '',
      selectedDate: '',
      setMonth: '',
      state: {
        disabledDates: {
          from: new Date()
        }
      }
    }
  },
  mounted () {
    let vo = window.navigator.vehicle.odometer
    this.initOdometer(vo)
  },
  methods: {
    initOdometer (vo) {
      console.log('enter initOdometer')
      // Odometer
      this.getOdometer(vo)
      this.subscribeOdometer(vo)
    },
    getOdometer (vo) {
      vo.get().then((odometer) => {
        console.log('get')
        this.distance = odometer.distanceTotal
        console.log('get distanceTotal(now) ' + this.distance)
      }, function (err) {
        console.log(err.error)
        console.log(err.message)
      })
    },
    subscribeOdometer (vo) {
      vo.subscribe((odometer) => {
        console.log('subscribe')
        this.distance = odometer.distanceTotal
        console.log('sub distanceTotal(now) ' + this.distance)
      })
    },
    goback () {
      this.$router.push('/')
    },
    go () {
      let date = new Date()
      let monthNames = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
      let settingDate = [{'month': '', 'date': '', 'year': ''}]

      console.log(monthNames[date.getMonth()])
      console.log(date.getDate())
      console.log(date.getFullYear())
      console.log('getDate', this.selectedDate)

      settingDate.month = (this.selectedDate).toString().substr(4, 3)
      settingDate.date = (this.selectedDate).toString().substr(8, 2)
      settingDate.year = (this.selectedDate).toString().substr(11, 4)

      if ((settingDate.year === '') && (settingDate.month === '') && (settingDate.date === '')) {
        this.title = '날짜를 선택하십시오'
        return false
      }

      if (settingDate.month === 'Jan') {
        this.setMonth = 1
      } else if (settingDate.month === 'Feb') {
        this.setMonth = 2
      } else if (settingDate.month === 'Mar') {
        this.setMonth = 3
      } else if (settingDate.month === 'Apr') {
        this.setMonth = 4
      } else if (settingDate.month === 'May') {
        this.setMonth = 5
      } else if (settingDate.month === 'Jun') {
        this.setMonth = 6
      } else if (settingDate.month === 'Jul') {
        this.setMonth = 7
      } else if (settingDate.month === 'Aug') {
        this.setMonth = 8
      } else if (settingDate.month === 'Sep') {
        this.setMonth = 9
      } else if (settingDate.month === 'Oct') {
        this.setMonth = 10
      } else if (settingDate.month === 'Nov') {
        this.setMonth = 11
      } else if (settingDate.month === 'Dec') {
        this.setMonth = 12
      }

      var setDate = new Date(settingDate.year, this.setMonth - 1, settingDate.date)
      storage.saveEngineOilkm(this.distance)
      storage.saveEngineOilM(setDate.getTime())

      storage.saveBatterykm(this.distance)
      storage.saveBatteryM(setDate.getTime())

      storage.saveRFTireKm(this.distance)
      storage.saveRFTireM(setDate.getTime())
      storage.saveRRTireKm(this.distance)
      storage.saveRRTireM(setDate.getTime())
      storage.saveLFTireKm(this.distance)
      storage.saveLFTireM(setDate.getTime())
      storage.saveLRTireKm(this.distance)
      storage.saveLRTireM(setDate.getTime())

      storage.saveCFilterKm(this.distance)
      storage.saveCFilterM(setDate.getTime())

      storage.saveFirst('false') // managepopup에 한번 입장했음을 의미
      this.$router.push('/management')
    }
  }
}
</script>
<style lang='scss' scoped>
.contents {
  padding:20px;
  color: white;
}
div.popup {
    margin: 48px auto 55px auto;
    width: 50%;
    height: 60%;
    border: 1px solid gray;
    > p {
        background: black;
        margin: 0px;
        text-align: center;
        font-size: 22px;
        height: 35px;
        border-bottom: 1px solid gray;
    }
}
div.buy, div.distance {
    background: rgba(14, 13, 13, 0.185);
    margin: 0 auto;
    padding: 5px;
    height: 30%;
    width: 100%;
    text-align: center;
    div.text {
        position: relative;
        float: left;
        text-align: center;
        margin: 0 10px;
        height: 95%;
        width: 30%;
        p {
            text-align: center;
            font-size: 20px;
        }
    }
    div.date {
        padding-top: 15px;
        padding-left: 15px;
        position: relative;
        float: left;
        text-align: center;
        margin: 0 10px;
        height: 95%;
        width: 58%;
        p {
            text-align: center;
            font-size: 20px;
        }
    }
    div.odometer {
        position: relative;
        float: left;
        text-align: center;
        margin: 0 10px;
        height: 95%;
        width: 58%;
        border: 1px solid gray;
        p {
            text-align: center;
            font-size: 20px;
        }
    }
}
div.btn {
    background: rgba(14, 13, 13, 0.185);
    margin: 0 auto;
    padding: 0 auto;
    height: 25%;
    width: 100%;
    text-align: center;
    div.btnGo, div.btnBack {
        position: relative;
        text-align: center;
        p {
            text-align: center;
            font-size: 20px;
            padding: 5px;
        }
    }
}
.btn-secondary {
  background: black;
  font-size: 22px;
  width: 176px;
  float: left;
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
