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
                        <router-link v-bind:to="{ name: 'managepopup' }">날짜수정</router-link>
                    </button>
                </div>
                <div class='desc'>
                    <p>타이어를 선택해주세요</p>
                </div>
                <div class='btn2'>
                    <button>
                        <router-link v-bind:to="{ name: 'airconditioner' }">Go</router-link>
                    </button>
                </div>     
            </div>
            <div class='position'>
                <div class='right'>
                    <div @click='goTire("rightFront")' class='front'>
                        <p>오른쪽 앞</p>
                    </div>
                    <div @click='goTire("rightRear")' class='rear'>
                        <p>오른쪽 뒤</p>
                    </div>
                </div>
                <div class='left'>
                    <div @click='goTire("leftFront")' class='front'>
                        <p>왼쪽 앞</p>
                    </div>
                    <div @click='goTire("leftRear")' class='rear'>
                        <p>왼쪽 뒤</p>
                    </div>
                </div>
            </div>  
        </div>  
    </div> 
  </div>
</template>
<script>
export default {
  name: 'tire',
  data: function () {
    return {
      items: [
          { name: '엔진 오일' },
          { name: '배터리' },
          { name: '냉각수' },
          { name: '타이어' },
          { name: '캐빈필터' }
      ]
    }
  },
  methods: {
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
      } else if (page === '캐빈필터') {
        str += 'cabinAirFilter'
      }
      this.$router.push(str)
    },
    goTire (pos) {
      let str = '/' + pos + 'Tire'
      let title = -1

      if (pos === 'rightFront') {
        title = '오른쪽 앞'
      } else if (pos === 'rightRear') {
        title = '오른쪽 뒤'
      } else if (pos === 'leftFront') {
        title = '왼쪽 앞'
      } else if (pos === 'leftRear') {
        title = '왼쪽 뒤'
      }

      this.$store.commit('changeTitle', title)
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
div.position {
    margin: 0 auto;
    height: 77%;
    width: 100%;
    text-align: center;
    p {
        text-align: center;
        margin-top: 15%;
        font-size: 30px;
    }
    div.right, div.left {
        width: 100%;
        height: 50%;
        div.front, div.rear {
            float: left;
            border: 1px solid white;
            width: 50%;
            height: 100%;
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