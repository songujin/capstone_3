<template>
  <div>
    <div class='contents'>
        <div class='popup'>
            <div class='title'>
                <p>Battery needs to be replaced</p>
            </div>
            <div class='problem_Distance'>
                <div class='text'>
                  <p>Problems with driving distance</p>
                </div>
                <div class='desc'>
                  <p class='safe'>{{ SP_Distance }}</p>
                  <p class='danger'>{{ DP_Distance }}</p>
                </div>
            </div>
            <div class='problem_Date'>
                <div class='text'>
                  <p>Problems with driving time</p>
                </div>
                <div class='desc'>
                  <p class='safe'>{{ SP_Date }}</p>
                  <p class='danger'>{{ DP_Date }}</p>
                </div>
            </div>
            <div class='btnGo'>
                <b-button @click='go()'>Don't show notifications until you turn on app</b-button>
            </div>
        </div>
    </div> 
  </div>
</template>
<script>
import { storage } from '../js/manageLibs'
export default {
  name: 'alarmBattery',
  data: function () {
    return {
      SP_Distance: '',
      DP_Distance: '',
      SP_Date: '',
      DP_Date: '',
      P_sentence: ''
    }
  },
  methods: {
    go () {
      this.$router.push('/battery')
    },
    problem () {
      if (this.P_sentence === 'problem_Distance') {
        this.DP_Distance = 'It is time for replacement'
      } else {
        this.SP_Distance = 'It is not time for replacement'
      }

      if (this.P_sentence === 'problem_Date') {
        this.DP_Date = 'It is time for replacement'
      } else {
        this.SP_Date = 'It is not time for replacement'
      }
    }
  },
  created () {
    this.P_sentence = storage.loadBatteryProblem()
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
    margin: 35px auto 55px auto;
    width: 70%;
    height: 65%;
    border: 1px solid gray;
    background: rgba(14, 13, 13, 0.185);
}
div.title {
    height: 35px;
    border-bottom: 1px solid gray;
    p {
      text-align: center;
      font-size: 22px;
      background: black
    }
}
div.problem_Distance, div.problem_Date {
    height: 23%;
    width: 100%;
    text-align: center;
    p {
      text-align: center;
      font-size: 22px;
      margin-top: 10px;
    }
}
div.btnGo {
    margin: 10px auto;
    width: 100%;
    height: 30px;
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
    font-size: 22px;
}
.danger {
    color: red;
    text-align: center;
    margin-top: 16px;
    font-size: 22px;
}
.btn-secondary {
  background: black;
  font-size: 22px;
  color: white;
  width: 95%;
  float: left;
  text-align: center;
  margin-left: 12px;
  margin-top: 20px;
}
div.text {
  float: left;
  width: 30%;
  height: 20%;
  margin-left: 20px;
}
div.desc {
  float: left;
  width: 60%;
  padding-top: 10px;
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
