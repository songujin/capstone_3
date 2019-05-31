<template>
  <div>
    <div class='contents'>
        <div class='popup'>
            <p>{{ title }}</p>
            <div class='buy'>
                <div class='text'>
                    <p>Replacement Date</p>
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
                    <vue-numeric-input v-model="userInputKM" separator="," :min="0" :controls="false"></vue-numeric-input>
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
  name: 'managepopupLR',
  props: ['value'],
  components: {
    'vuejs-datepicker': Datepicker
  },
  data: function () {
    return {
      title: 'Setting',
      userInputKM: '', // 사용자 입력 km
      selectedDate: '',
      setMonth: '',
      state: {
        disabledDates: {
          from: new Date()
        }
      },
      nowTotal: '' // 교체할 때의 누적거리
    }
  },
  mounted () {
    let vo = window.navigator.vehicle.odometer
    this.initVehicle(vo)
  },
  methods: {
    initVehicle (vo) {
      console.log('enter init')
      this.getOdometer(vo)
      this.subscribeOdometer(vo) // 2번 실행되고 있음.. why?
    },
    getOdometer (vo) {
      vo.get().then((odometer) => {
        console.log('get')
        this.nowTotal = odometer.distanceTotal
        console.log('get distanceTotal(now)' + this.nowTotal)
      }, function (err) {
        console.log(err.error)
        console.log(err.message)
      })
    },
    subscribeOdometer (vo) {
      vo.subscribe((odometer) => {
        console.log('subscribe')
        this.nowTotal = odometer.distanceTotal
        console.log('sub distanceTotal(now)' + this.nowTotal)
      })
    },
    goback () {
      this.$router.push('/leftRearTire')
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
      storage.saveLRTireM(setDate.getTime())

      var today = new Date(date.getFullYear(), date.getMonth(), date.getDate())

      if (today.getTime() === setDate.getTime()) { // 오늘 부품을 교체할 시
        storage.saveLRTireKm(this.nowTotal)
        console.log('PopLR NT ' + this.nowTotal)
      } else if (today.getTime() > setDate.getTime()) { // 과거에 부품을 교체했을 시
        if (this.userInputKM === '') {
          this.title = 'Please enter a distance'
          return false
        }
        if (this.userInputKM > this.nowTotal) {
          this.title = 'Input error'
          return false
        }

        storage.saveLRTireKm(this.userInputKM)
      }

      storage.saveLRTireUpdate(1) // update를 했다는 의미

      this.$router.push('/leftRearTire')
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
.vue-numeric-input {
  width: 196px !important;
  margin-left: 10px;
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
