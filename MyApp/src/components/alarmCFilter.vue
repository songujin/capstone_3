<template>
  <div>
    <div class='contents'>
        <div class='popup'>
            <div class='title'>
                <p>캐빈필터에 문제가 발생했어요</p>
            </div>
            <div class='img'></div>
            <div class='problem_API'>
                <p class='safe'>{{ SP_API }}</p>
                <p class='danger'>{{ DP_API }}</p>
            </div>
            <div class='problem_Distance'>
                <p class='safe'>{{ SP_Distance }}</p>
                <p class='danger'>{{ DP_Distance }}</p>
            </div>
            <div class='problem_Date'>
                <p class='safe'>{{ SP_Date }}</p>
                <p class='danger'>{{ DP_Date }}</p>
            </div>
            <div class='btn'>
                <p @click='go()'>다시 어플을 킬 때 까지 보지 않기</p>
            </div>      
        </div>
    </div> 
  </div>
</template>
<script>
import { storage } from '../js/manageLibs'
export default {
  name: 'alarmCFilter',
  data: function () {
    return {
      SP_API: '',
      DP_API: '',
      SP_Distance: '',
      DP_Distance: '',
      SP_Date: '',
      DP_Date: '',
      P_sentence: ''
    }
  },
  methods: {
    go () {
      this.$router.push('/cabinAirFilter')
    },
    problem () {
      if (this.P_sentence === 'problem_API') {
        this.DP_API = '캐빈필터에 문제 상황이 발생했어요'
      } else {
        this.SP_API = '캐빈필터의 상태는 괜찮아요'
      }

      if (this.P_sentence === 'problem_Distance') {
        this.DP_Distance = '캐빈필터의 사용시간이 지나서 교체시기가 되었어요'
      } else {
        this.SP_Distance = '캐빈필터의 사용시간에 따른 수명은 아직 남았어요'
      }

      if (this.P_sentence === 'problem_Date') {
        this.DP_Date = '캐빈필터의 주행거리가 지나서 교체시기가 되었어요'
      } else {
        this.SP_Date = '캐빈필터의 주행거리에 따른 수명은 아직 남았어요'
      }
    }
  },
  created () {
    this.P_sentence = storage.loadCFilterProblem()
    this.problem()
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
.safe {
    color: green;
    text-align: center;
    margin-top: 16px;
    font-size: 17px;
}
.danger {
    color: red;
    text-align: center;
    margin-top: 16px;
    font-size: 17px;
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
