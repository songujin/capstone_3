<template>
  <div>
    <div class='contents'>
        <div class='parts'>
            <b-button-group vertical class='select' v-for="item in items" :key="item.name">
                <b-button ref="string" @click='gomanage(item.name)'>{{ item.name }}</b-button>
            </b-button-group>
        </div>     
        <div class='manage'>
            <div class='top'>
                <div class='btn1'>
                </div>
                <div class='desc'>
                    <p>Please select a position of the tire</p>
                </div>
                <div class='btn2'>
                    <div class='btn'>
                        <b-button @click='go()'>Go</b-button>
                    </div>
                </div>     
            </div>
            <div class='position'>
                <div class='right'>
                    <div @click='goTire("rightFront")' class='front'>
                        <p>Right Front</p>
                    </div>
                    <div @click='goTire("rightRear")' class='rear'>
                        <p>Right Rear</p>
                    </div>
                </div>
                <div class='left'>
                    <div @click='goTire("leftFront")' class='front'>
                        <p>Left Front</p>
                    </div>
                    <div @click='goTire("leftRear")' class='rear'>
                        <p>Left Rear</p>
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
          { name: 'Engine oil' },
          { name: 'Battery' },
          { name: 'Coolant' },
          { name: 'Tire' },
          { name: 'Cabin filter' }
      ]
    }
  },
  methods: {
    go () {
      this.$router.push('/')
    },
    gomanage (page) {
      let str = '/'

      if (page === 'Engine oil') {
        str += 'management'
      } else if (page === 'Battery') {
        str += 'battery'
      } else if (page === 'Coolant') {
        str += 'water'
      } else if (page === 'Tire') {
        str += 'tire'
      } else if (page === 'Cabin filter') {
        str += 'cabinAirFilter'
      }
      this.$router.push(str)
    },
    goTire (pos) {
      let str = '/' + pos + 'Tire'
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
}
div.select {
    height: 20%;
    width: 100%;
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
    border: 1px solid rgb(128, 128, 128);
}
div.top {
    height: 60.6px;
    width: 100%;
    background: rgba(14, 13, 13, 0.493);
}
div.btn2 {
    float: right;
}
div.btn1 {
    float: left;
}
div.desc {
    float: left;
    text-align: center;
    padding: 8px;
    height: 50%;
    width: 70%;
    margin: 5px 0px 5px 7px;
    p {
        font-size: 22px;
    }
}
.btn-secondary {
  background: black;
  font-size: 22px;
}
div.parts > :nth-child(4) > .btn-secondary{
  border-width: 4px;
  border-color: gray;
}
div.position {
    margin: 0 auto;
    height: 82.5%;
    width: 100%;
    text-align: center;
    p {
        text-align: center;
        margin-top: 15%;
        font-size: 30px;
        color: rgba(180, 189, 183, 0.795);
    }
    div.right, div.left {
        width: 100%;
        height: 50%;
        div.front, div.rear {
            float: left;
            border: 1px solid gray;
            width: 50%;
            height: 100%;
        }
    }
}
div.right > div.front {
  background-image: url('../img/1.png');
  background-position-x: right;
  background-size: contain;
  background-repeat: no-repeat;
}
div.right > div.rear {
  background-image: url('../img/2.png');
  background-position-x: left;
  background-size: contain;
  background-repeat: no-repeat;
}
div.left > div.front {
  background-image: url('../img/4.png');
  background-position-x: right;
  background-size: contain;
  background-repeat: no-repeat;
}
div.left > div.rear {
  background-image: url('../img/3.png');
  background-position-x: left;
  background-size: contain;
  background-repeat: no-repeat;
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