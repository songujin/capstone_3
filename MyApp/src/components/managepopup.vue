<template>
  <div>
    <div class='contents'>
        <div class='popup'>
            <p>관리 시작 기준 설정</p>
            <div class='buy'>
                <div class='text'>
                    <p>구매 날짜</p>
                </div>
                <div class='date'></div>
            </div>
            <div class='distance'>
                <div class='text'>
                    <p>주행 거리</p>
                </div>
                <div class='odometer'>
                    <p>{{ distanceTotal }}km</p>
                </div>
            </div>
            <button>
                <router-link v-bind:to="{ name: 'management' }">확인</router-link>
            </button>      
        </div>
    </div> 
  </div>
</template>
<script>
export default {
  name: 'managepopup',
  data: function () {
    return {
      distanceTotal: '0'
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
button {
    display: block;
    text-align: center;
    position: relative;
    margin: 0 auto;
    width: 65px;
    height: 40px;
    color: black;
    background-color: white 
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
