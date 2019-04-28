<template>
  <div>
    <div class='contents'>
        <div class='popup'>
            <p>관리 시작 기준 설정</p>
            <div class='buy'>
                <div class='text'>
                    <p>구매 날짜</p>
                </div>
                <div class='date'>
                  <vuejs-datepicker v-model="selectedDate" placeholder="click..." style="color:black;"></vuejs-datepicker>
                </div>
            </div>
            <div class='distance'>
                <div class='text'>
                    <p>주행 거리</p>
                </div>
                <div class='odometer'>
                    <p>{{ distance }}km</p>
                </div>
            </div>
            <div class='btn'>
                <p @click='go()'>확인</p>
            </div>
        </div>
    </div> 
  </div>
</template>
<script>
import { storage } from '../js/manageLibs'
import Datepicker from 'vuejs-datepicker'

export default {
  name: 'managepopupOil',
  props: ['value'],
  components: {
    'vuejs-datepicker': Datepicker
  },
  data: function () {
    return {
      distance: '10000',
      selectedDate: '',
      setMonth: ''
    }
  },
  mounted () {
    this.startVehicle()
  },
  methods: {
    // persist () {
    //   this.$store.commit('changeOilMonth', this.oilMonth)
    // },
    startVehicle () {
      let vehicle = window.navigator.vehicle
      if (vehicle) {
        vehicle.start(function () {
          window.navigator.vehicle.odometer.get().then(function (data) {
            console.log(data.distanceTotal)
            this.distance = data.distanceTotal
          }, function (err) {
            console.log(err)
          })
        }, function () {
          throw Error('constuctor fails')
        })
      }
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
      // var betweenDay = (date.getTime() - setDate.getTime()) / 1000 / 60 / 60 / 24
      // this.setMonth = Math.floor(betweenDay / 30.4)
      // console.log(this.setMonth)
      console.log(settingDate.year)
      // console.log(this.setMonth)
      console.log(settingDate.date)
      console.log(date.getTime())
      console.log(setDate.getTime())
      // console.log(betweenDay)

      storage.saveEngineOilM(setDate.getTime())
      storage.saveEngineOilkm(this.distance)

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
    margin: 25px auto 55px auto;
    width: 50%;
    height: 60%;
    border: 1px solid white;
    > p {
        text-align: center;
        margin: 10px;
        font-size: 20px;
    }
}
div.buy, div.distance {
    margin: 0 auto;
    padding: 5px;
    height: 33%;
    width: 100%;
    border: 1px solid white;
    text-align: center;
    div.text, div.date, div.odometer {
        position: relative;
        left: 5%;
        float: left;
        text-align: center;
        margin: 0 10px;
        height: 95%;
        width: 40%;
        border: 1px solid white;
        p {
            text-align: center;
            margin-top: 20px;
            font-size: 20px;
        }
    }
}
div.btn {
    margin: 0 auto;
    width: 65px;
    height: 40px;
    border: 1px solid white;
    p {
        text-align: center;
        margin: 14px;
        font-size: 15px;
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
