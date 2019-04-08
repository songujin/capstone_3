<template>
  <div>
    <div class='contents'>
        <div class='sensor'>
            <div class='dust'>
                <p>미세먼지</p>
                <div class='measure'>
                    <div class='value'></div>
                    <div class='standard'></div>
                </div>
            </div>
            <div class='finedust'>
                <p>초미세먼지</p>
                <div class='measure'>
                    <div class='value'></div>
                    <div class='standard'></div>
                </div>
            </div>
            <div class='co2'>
                <p>Co2</p>
                <div class='measure'>
                    <div class='value'></div>
                    <div class='standard'></div>
                </div>
            </div>
            <div class='screentrans'>
                <button>
                    <router-link v-if=!isFirst() v-bind:to="{ name: 'management' }">Go</router-link>
                    <router-link v-if=isFirst() v-bind:to="{ name: 'managepopup' }">Go</router-link>
                </button>
            </div>
        </div>     
        <div class='ventilation'>
            <div class='top'>
                <div class = 'switch'></div>
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

export default {
  name: 'home',
  mixins: [page],
  methods: {
    isFirst () {
      return true
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
div.dust, div.finedust, div.co2 {
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
