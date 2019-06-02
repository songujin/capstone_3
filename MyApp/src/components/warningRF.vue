<template>
  <div>
    <div class='contents'>
        <div class='popup'>
            <div class='title'>
                <p>Warning!</p>
            </div>
            <div class='problem'>
                <div class='text'>
                  <p>Right Front Tire needs to be replaced</p>
                </div>
            </div>
            <div class='btnGo'>
                <b-button @click='go()'>Ok</b-button>
            </div>
        </div>
    </div> 
  </div>
</template>
<script>
// import { storage } from '../js/manageLibs'
export default {
  name: 'warningRF',
  methods: {
    go () {
      this.$router.push('/rightFrontTire')
    }
  },
  created () {
  }
}
</script>
<style lang='scss' scoped>
.contents {
  padding:20px;
  color: white;
}
div.popup {
    margin: 65px auto 55px auto;
    width: 50%;
    height: 55%;
    border: 1px solid gray;
    background: rgba(14, 13, 13, 0.185);
}
div.title {
    height: 35px;
    border-bottom: 1px solid gray;
    p {
      color: red;
      text-align: center;
      font-size: 22px;
      background: black
    }
}
div.problem {
    padding-top: 10px;
    height: 45%;
    width: 100%;
    text-align: center;
    p {
      text-align: center;
      font-size: 22px;
      margin-top: 10px;
    }
}
div.btnGo {
    p {
        text-align: center;
        margin-top: 7px;
        font-size: 15px;
    }
}
.btn-secondary {
  background: black;
  font-size: 22px;
  color: white;
  width: 95%;
  float: left;
  text-align: center;
  margin-left: 12px;
  margin-top: 30px;
}
div.text {
  background-image: url('../img/warning.png');
  background-repeat: no-repeat;
  background-size: 25% 60%;
  background-position-x: center;
  background-position-y: top;
  float: left;
  width: 90%;
  height: 100%;
  margin-left: 20px;
  p {
    margin-top: 40px;
  }
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
