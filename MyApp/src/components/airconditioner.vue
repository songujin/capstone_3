<template>
  <div>
    <div class='contents'>
        <div class='sensor'>
            <div class='dust'>
                <p>미세먼지</p>
                <div class='measure'>
                    <div class='value'>
                      <p>{{ dustValue }}㎍/㎥</p>
                    </div>
                    <div class='standard'>
                      <p>{{ dustLevel }}</p>
                    </div>
                </div>
            </div>
            <div class='fineDust'>
                <p>초미세먼지</p>
                <div class='measure'>
                    <div class='value'>
                      <p>{{ fineDustValue }}㎍/㎥</p>
                    </div>
                    <div class='standard'>
                      <p>{{ fineDustLevel }}</p>
                    </div>
                </div>
            </div>
            <div class='co2'>
                <p>이산화탄소</p>
                <div class='measure'>
                    <div class='value'>
                      <p>{{ co2Value }}ppm</p>
                    </div>
                    <div class='standard'>
                      <p v-bind:style="co2Bg">{{ co2Level }}</p>
                    </div>
                </div>
            </div>
            <div class='screentrans'>
              <p @click='go()'>GO</p>
            </div>
        </div>     
        <div class='ventilation'>
            <div class='top'>
                <div class = 'switch'>
                  <toggle-button id="changed-font" @change="toggled = $event.value"
                  :labels="{checked: 'ON', unchecked: 'OFF'}"
                  :color="{checked: '#7DCE94',}"
                  :width="148"
                  :height="37"/>
                </div>
                <div class = 'desc'></div>
            </div>
            <div class = 'carImg'>
            </div>
        </div>  
    </div>
  </div>
</template>
<script>
import page from 'obigo-js-ui/mixins/page'
import { storage } from '../js/manageLibs'
export default {
  name: 'home',
  mixins: [page],
  components: { },
  props: {
  },
  data: function () {
    return {
      count: 0, // managementpopup을 한번만 뜨게 하기 위해서 정윤이가 만듦
      dustValue: 100, // 실시간으로 미세먼지 받아와야함
      dustLevel: '', // 미세먼지 등급은 mounted() 에서 계산
      fineDustValue: 15, // 실시간으로 초미세먼지 받아와야함
      fineDustLevel: '', // 초미세먼지 등급도 mounted () 에서 계산
      co2Value: 1234, // 실시간으로 이산화탄소 받아오기
      co2Level: '', // 이산화탄소 등급도 mounted ()에서 계산
      toggled: false
    }
  },
  created () {
    this.count = storage.loadFirst()
  },
  methods: {
    go () {
      if (this.isFirst()) {
        this.$router.push('/managepopup')
      } else {
        this.$router.push('/management')
      }
      // if (storage.loadAlarm() === 'cabinFilter') {
      //   this.$router.push('/alarmCFilter')
      // }
    },
    isFirst () {
      if (this.count === '0') {
        return true
      }
    }
  },
  mounted () {
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
    } else if (this.co2Value >= 1501 && this.Sco2Value <= 4000) {
      this.co2Level = '나쁨'
    } else if (this.co2Value >= 4001) {
      this.co2Level = '매우 나쁨'
    }
    console.log(this.toggle.$event.value)
  },
  updated: function () {
    console.log(this.toggled)
  },
  computed: {
    co2Bg: function (co2LevelBg) {
      return {
        // background: 'blue'
        // background: '#F33434'
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
div.sensor{
    height: 20%;
    padding-left: 10px;
    border: 1px solid white;
    p {
        font-size: 20px;
    }
}
div.dust, div.fineDust, div.co2 {
    margin-top: 5px;
    float: left;
    height: 65px;
    width: 30%;
    border: 1px solid white;
}
div.measure {
    float: left;
    width: 100%;
    height: 70%;
    border: 1px solid white;
}
div.screentrans {
    margin-top: 5px;
    float: left;
    height:65px;
    width:10%;
    button {
        width: 65px;
        height: 65px;
        color: black;
        background-color: white 
    }
}
div.ventilation {
    height:65%;
    border: 1px solid white;
}
div.switch {
    margin-top: 10px;
    margin-left: 5px;
    float: left;
    height: 40px;
    width: 150px;
    border: 1px solid white;
}
div.desc {
    margin-top: 10px;
    float: left;
    height:40px;
    width: 600px;
    border: 1px solid white;
}
div.carImg {
    margin: 10px 10px 5px 10px;
    float: left;
    height: 180px;
    width: 740px;
    border: 1px solid white;
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
