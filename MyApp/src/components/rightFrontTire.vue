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
                    <div class='btn'>
                        <p @click='update()'>날짜<br>수정</p>
                    </div>
                </div>
                <div class='desc'>
                    <p>오른쪽 앞 타이어의 현재 상태</p>
                </div>
                <div class='btn2'>
                    <div class='btn'>
                        <p @click='go()'>Go</p>
                    </div>
                </div>     
            </div>
            <div class='detail'>
                <div class='km'>
                    <div class='txt1'>
                        <p>{{ 60000 - km }}km 남음</p>
                    </div>
                    <div class='txt2'>
                        <p>60000km 마다 교체</p>
                    </div>
                    <div class='progressBar'>
                        <progress-bar size="large" :val=(km)*(100/60000)></progress-bar>
                    </div>
                </div>
                <div class='cycle'>
                    <div class='txt1'>
                        <p>{{ 36 - month }}개월 남음</p>
                    </div>
                    <div class='txt2'>
                        <p>36개월 마다 교체</p>
                    </div>
                    <div class='progressBar'>
                        <progress-bar size="large" :val=(month)*(100/36)></progress-bar>
                    </div>
                </div>
                <div class='img'>
                </div>
            </div>       
        </div>  
    </div> 
  </div>
</template>
<script>
import ProgressBar from 'vue-simple-progress'
import { storage } from '../js/manageLibs'

export default {
  name: 'rightFrontTire',
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
          { name: '필터' }
      ],
      km: 0,
      month: 0
    }
  },
  methods: {
    update () {
      this.$router.push('/managePopupRF')
    },
    go () {
      this.$router.push('/')
    },
    gomanage (page) {
      let str = '/'

      if (page === '엔진 오일') {
        str += 'engineoil'
      } else if (page === '배터리') {
        str += 'battery'
      } else if (page === '냉각수') {
        str += 'water'
      } else if (page === '타이어') {
        str += 'tire'
      } else if (page === '필터') {
      }
      this.$router.push(str)
    }
  },
  mounted () {
    this.km = storage.loadRFTireKm()
    this.month = storage.loadRFTireM()
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
div.btn {
    float: right;
    margin-top: 5px;
    margin-right: 9.79px;
    width: 65px;
    height: 65px;
    border: 1px solid white;
    text-align: center;
    p {
        text-align: center;
        font-size: 20px;
        margin-top: 10px;
    }
}
div.km, div.cycle {
    position: relative;
    left: 5%;
    top: 10%;
    height: 25%;
    width: 70%;
    border: 1px solid white;
    margin-bottom: 5px;
    div.txt1, div.txt2 {
        float: left;
        width: 50%;
        height: 60%;
        border: 1px solid white;
        p {
            margin-top: 10px;
            font-size: 20px;
        }
    }
}
div.progressBar {
    position: relative;
    top: 70%;
    width: 100%;
    height: 20%;
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