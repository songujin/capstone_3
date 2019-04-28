<template>
  <div>
    <div class='contents'>
        <div class='popup'>
            <div class='title'>
                <p>엔진오일에 문제가 발생했어요</p>
            </div>
            <div class='img'></div>
            <div class='problem_API'></div>
            <div class='problem_Distance'></div>
            <div class='problem_Date'></div>
            <div class='btn'>
                <p @click='go()'>다시 어플을 킬 때 까지 보지 않기</p>
            </div>      
        </div>
    </div> 
  </div>
</template>
<script>
export default {
  name: 'alarmRF',
  methods: {
    go () {
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
    width: 80%;
    height: 70%;
    border: 1px solid white;
}
div.title {
    border: 1px solid white;
    margin-bottom: 3px;
    p {
      text-align: center;
      margin: 10px;
      font-size: 20px;
    }
}
div.img {
    float: left;
    width: 80px;
    height: 80px;
    margin-left: 5px;
    border: 1px solid white;
}
div.problem_API, div.problem_Distance, div.problem_Date {
    border: 1px solid white;
    height: 20%;
    width: 70%;
    margin: 0 auto 10px auto;
}
div.btn {
    margin: 0 auto;
    width: 60%;
    height: 30px;
    border: 1px solid white;
    p {
        text-align: center;
        margin-top: 7px;
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