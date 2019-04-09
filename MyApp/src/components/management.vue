<template>
  <div>
    <div class='contents'>
        <div class='parts'>
            <div class='select' v-for="item in items" :key="item.name">
                <p ref="string" @click=gomanage()>{{ item.name }}</p>
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
                    <p>엔진 오일의 현재 상태</p>
                </div>
                <div class='btn2'>
                    <button>
                        <router-link v-bind:to="{ name: 'airconditioner' }">Go</router-link>
                    </button>
                </div>     
            </div>
            <div class='detail'>
                <div class='km'></div>
                <div class='cycle'></div>
                <div class='reset'>
                    <button>reset</button>
                </div>
                <div class='img'></div>
            </div>       
        </div>  
    </div> 
  </div>
</template>
<script>
import managepopup from './managepopup.vue'

export default {
  name: 'management',
  components: {
    'manage-popup': managepopup
  },
  data: function () {
    return {
      items: [
          { name: '엔진 오일' },
          { name: '배터리' },
          { name: '냉각수' },
          { name: '타이어' }
      ]
    }
  },
  methods: {
    gomanage () {
      this.$router.push('/battery')
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
    height: 15%;
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
div.km, div.cycle {
    position: relative;
    left: 5%;
    top: 10%;
    height: 25%;
    width: 70%;
    border: 1px solid white;
    margin-bottom: 5px;
}
div.reset {
    margin-left: 190px;
    margin-top: 30px;
    float: left;
    button {
        height: 35px;
        width: 80px;
    }
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
