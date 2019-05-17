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
                    <p>Current status of Right Rear Tire</p>
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
                      :total-steps=60000>
                    <p><br></p>
                    <p>Replacement Period<br>: {{ 60000 }} km</p>
                    <p>Remaining<br>: {{ 60000 - km }} km</p>
                  </radial-progress-bar>
                </div>
                <div class='cycle'>
                  <radial-progress-bar :diameter="250"
                      :completed-steps=month
                      :total-steps=36>
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
  name: 'rightRearTire',
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
      month: 0
    }
  },
  methods: {
    update () {
      this.$router.push('/managePopupRR')
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
  },
  mounted () {
    let date = new Date()
    var betweenDay = (date.getTime() - storage.loadRRTireM()) / 1000 / 60 / 60 / 24
    this.km = storage.loadRRTireKm()
    this.month = Math.floor(betweenDay / 30.4)
    if (this.month >= 36) {
      this.month = 36
    }
    if (this.km >= 60000) {
      this.km = 60000
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