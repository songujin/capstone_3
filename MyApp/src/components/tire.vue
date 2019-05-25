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
                    <div class='front'>
                        <div class='RFstatus'>
                          <span>Status : </span><span v-bind:style="s_stateLF">{{ tireStateLF }}</span>
                        </div>
                        <div class='RFpressure'>
                          <span>Pressure : </span><span v-bind:style="s_pressureLF">{{ pressureLF }}</span>
                        </div>
                        <img v-if='warningLF===false' class='rightfrontImg' src='../img/rightfront.png'>
                        <img v-if='warningLF===true' class='rightfrontImg' src='../img/redTire.png'>
                        <div class='detailbuttonRF'>
                          <b-button @click='goTire("leftFront")'>Detail</b-button>
                        </div>
                    </div>
                    <div class='rear'>
                        <div class='RRstatus'>
                          <span v-bind:style="s_stateRF">{{ tireStateRF }}</span><span> : Status</span>
                        </div>
                        <div class='RRpressure'>
                          <span v-bind:style="s_pressureRF">{{ pressureRF }}</span><span> : Pressure</span>
                        </div>
                        <img v-if='warningRF===false' class='rightrearImg' src='../img/rightfront.png'>
                        <img v-if='warningRF===true' class='rightrearImg' src='../img/redTire.png'>
                        <div class='detailbuttonRR'>
                          <b-button @click='goTire("rightFront")'>Detail</b-button>
                        </div>
                    </div>
                </div>
                <div class='left'>
                    <div class='front'>
                        <div class='LFstatus'>
                          <span>Status : </span><span v-bind:style="s_stateLR">{{ tireStateLR }}</span>
                        </div>
                        <div class='LFpressure'>
                          <span>Pressure : </span><span v-bind:style="s_pressureLR">{{ pressureLR }}</span>
                        </div>
                        <img v-if='warningLR===false' class='leftfrontImg' src='../img/rightfront.png'>
                        <img v-if='warningLR===true' class='leftfrontImg' src='../img/redTire.png'>
                        <div class='detailbuttonLF'>
                          <b-button @click='goTire("leftRear")'>Detail</b-button>
                        </div>
                    </div>
                    <div class='rear'>
                        <div class='LRstatus'>
                          <span v-bind:style="s_stateRR">{{ tireStateRR }}</span><span> : Status</span>
                        </div>
                        <div class='LRpressure'>
                          <span v-bind:style="s_pressureRR">{{ pressureRR }}</span><span> : Pressure</span>
                        </div>
                        <img v-if='warningRR===false' class='leftrearImg' src='../img/rightfront.png'>
                        <img v-if='warningRR===true' class='leftrearImg' src='../img/redTire.png'>
                        <div class='detailbuttonLR'>
                          <b-button @click='goTire("rightRear")'>Detail</b-button>
                        </div>
                    </div>
                </div>
            </div>  
        </div>  
    </div> 
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
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
      ],
      tireStateRF: '',
      pressureRF: 0,
      tireStateLF: '',
      pressureLF: 0,
      tireStateRR: '',
      pressureRR: 0,
      tireStateLR: '',
      pressureLR: 0,
      warningRF: false,
      warningRR: false,
      warningLF: false,
      warningLR: false
    }
  },
  computed: {
    ...mapGetters([
      'getTireStateRF',
      'getPressureRF',
      'getTireStateLF',
      'getPressureLF',
      'getTireStateRR',
      'getPressureRR',
      'getTireStateLR',
      'getPressureLR'
    ]),
    s_pressureRF: function () {
      if ((this.pressureRF < 1900 || this.pressureRF > 3800) || (this.tireStateRF !== 'Good State')) {
        this.warningRF = true
      } else {
        this.warningRF = false
      }
      if (this.pressureRF < 1900) {
        return {
          color: 'red'
        }
      } else if (this.pressureRF > 3800) {
        return {
          color: 'red'
        }
      } else {
      }
    },
    s_stateRF: function () {
      if (this.tireStateRF === 'Good State') {
      } else {
        return {
          color: 'red'
        }
      }
    },
    s_pressureLF: function () {
      if ((this.pressureLF < 1900 || this.pressureLF > 3800) || (this.tireStateLF !== 'Good State')) {
        this.warningLF = true
      } else {
        this.warningLF = false
      }
      if (this.pressureLF < 1900) {
        return {
          color: 'red'
        }
      } else if (this.pressureLF > 3800) {
        return {
          color: 'red'
        }
      } else {
      }
    },
    s_stateLF: function () {
      if (this.tireStateLF === 'Good State') {
      } else {
        return {
          color: 'red'
        }
      }
    },
    s_pressureRR: function () {
      if ((this.pressureRR < 1900 || this.pressureRR > 3800) || (this.tireStateRR !== 'Good State')) {
        this.warningRR = true
      } else {
        this.warningRR = false
      }
      if (this.pressureRR < 1900) {
        return {
          color: 'red'
        }
      } else if (this.pressureRR > 3800) {
        return {
          color: 'red'
        }
      } else {
      }
    },
    s_stateRR: function () {
      if (this.tireStateRR === 'Good State') {
      } else {
        return {
          color: 'red'
        }
      }
    },
    s_pressureLR: function () {
      if ((this.pressureLR < 1900 || this.pressureLR > 3800) || (this.tireStateLR !== 'Good State')) {
        this.warningLR = true
      } else {
        this.warningLR = false
      }
      if (this.pressureLR < 1900) {
        return {
          color: 'red'
        }
      } else if (this.pressureLR > 3800) {
        return {
          color: 'red'
        }
      } else {
      }
    },
    s_stateLR: function () {
      if (this.tireStateLR === 'Good State') {
      } else {
        return {
          color: 'red'
        }
      }
    }
  },
  watch: {
    getTireStateRF: function (newVal, old) {
      this.tireStateRF = this.getTireStateRF
      if (this.tireStateRF === 'PressureOkAndNoFailure') {
        this.tireStateRF = 'Good State'
      } else if (this.tireStateRF === 'UnderInflationAndFailure') {
        this.tireStateRF = 'UnderInflation'
      } else if (this.tireStateRF === 'PunctureAndFailure') {
        this.tireStateRF = 'Puncture'
      } else if (this.tireStateRF === 'PunctureAndUnderInflation') {
        this.tireStateRF = 'Puncture'
      } else if (this.tireStateRF === 'PunctureAndUnderInflationAndFailure') {
        this.tireStateRF = 'Puncture'
      }
    },
    getPressureRF: function (newVal, old) {
      this.pressureRF = this.getPressureRF
    },
    getTireStateLF: function (newVal, old) {
      this.tireStateLF = this.getTireStateLF
      if (this.tireStateLF === 'PressureOkAndNoFailure') {
        this.tireStateLF = 'Good State'
      } else if (this.tireStateLF === 'UnderInflationAndFailure') {
        this.tireStateLF = 'UnderInflation'
      } else if (this.tireStateLF === 'PunctureAndFailure') {
        this.tireStateLF = 'Puncture'
      } else if (this.tireStateLF === 'PunctureAndUnderInflation') {
        this.tireStateLF = 'Puncture'
      } else if (this.tireStateLF === 'PunctureAndUnderInflationAndFailure') {
        this.tireStateLF = 'Puncture'
      }
    },
    getPressureLF: function (newVal, old) {
      this.pressureLF = this.getPressureLF
    },
    getTireStateRR: function (newVal, old) {
      this.tireStateRR = this.getTireStateRR
      if (this.tireStateRR === 'PressureOkAndNoFailure') {
        this.tireStateRR = 'Good State'
      } else if (this.tireStateRR === 'UnderInflationAndFailure') {
        this.tireStateRR = 'UnderInflation'
      } else if (this.tireStateRR === 'PunctureAndFailure') {
        this.tireStateRR = 'Puncture'
      } else if (this.tireStateRR === 'PunctureAndUnderInflation') {
        this.tireStateRR = 'Puncture'
      } else if (this.tireStateRR === 'PunctureAndUnderInflationAndFailure') {
        this.tireStateRR = 'Puncture'
      }
    },
    getPressureRR: function (newVal, old) {
      this.pressureRR = this.getPressureRR
    },
    getTireStateLR: function (newVal, old) {
      this.tireStateLR = this.getTireStateLR
      if (this.tireStateLR === 'PressureOkAndNoFailure') {
        this.tireStateLR = 'Good State'
      } else if (this.tireStateLR === 'UnderInflationAndFailure') {
        this.tireStateLR = 'UnderInflation'
      } else if (this.tireStateLR === 'PunctureAndFailure') {
        this.tireStateLR = 'Puncture'
      } else if (this.tireStateLR === 'PunctureAndUnderInflation') {
        this.tireStateLR = 'Puncture'
      } else if (this.tireStateLR === 'PunctureAndUnderInflationAndFailure') {
        this.tireStateLR = 'Puncture'
      }
    },
    getPressureLR: function (newVal, old) {
      this.pressureLR = this.getPressureLR
    }
  },
  mounted () {
    this.tireStateRF = this.getTireStateRF
    if (this.tireStateRF === 'PressureOkAndNoFailure') {
      this.tireStateRF = 'Good State'
    } else if (this.tireStateRF === 'UnderInflationAndFailure') {
      this.tireStateRF = 'UnderInflation'
    } else if (this.tireStateRF === 'PunctureAndFailure') {
      this.tireStateRF = 'Puncture'
    } else if (this.tireStateRF === 'PunctureAndUnderInflation') {
      this.tireStateRF = 'Puncture'
    } else if (this.tireStateRF === 'PunctureAndUnderInflationAndFailure') {
      this.tireStateRF = 'Puncture'
    }
    this.pressureRF = this.getPressureRF

    this.tireStateLF = this.getTireStateLF
    if (this.tireStateLF === 'PressureOkAndNoFailure') {
      this.tireStateLF = 'Good State'
    } else if (this.tireStateLF === 'UnderInflationAndFailure') {
      this.tireStateLF = 'UnderInflation'
    } else if (this.tireStateLF === 'PunctureAndFailure') {
      this.tireStateLF = 'Puncture'
    } else if (this.tireStateLF === 'PunctureAndUnderInflation') {
      this.tireStateLF = 'Puncture'
    } else if (this.tireStateLF === 'PunctureAndUnderInflationAndFailure') {
      this.tireStateLF = 'Puncture'
    }
    this.pressureLF = this.getPressureLF

    this.tireStateRR = this.getTireStateRR
    if (this.tireStateRR === 'PressureOkAndNoFailure') {
      this.tireStateRR = 'Good State'
    } else if (this.tireStateRR === 'UnderInflationAndFailure') {
      this.tireStateRR = 'UnderInflation'
    } else if (this.tireStateRR === 'PunctureAndFailure') {
      this.tireStateRR = 'Puncture'
    } else if (this.tireStateRR === 'PunctureAndUnderInflation') {
      this.tireStateRR = 'Puncture'
    } else if (this.tireStateRR === 'PunctureAndUnderInflationAndFailure') {
      this.tireStateRR = 'Puncture'
    }
    this.pressureRR = this.getPressureRR

    this.tireStateLR = this.getTireStateLR
    if (this.tireStateLR === 'PressureOkAndNoFailure') {
      this.tireStateLR = 'Good State'
    } else if (this.tireStateLR === 'UnderInflationAndFailure') {
      this.tireStateLR = 'UnderInflation'
    } else if (this.tireStateLR === 'PunctureAndFailure') {
      this.tireStateLR = 'Puncture'
    } else if (this.tireStateLR === 'PunctureAndUnderInflation') {
      this.tireStateLR = 'Puncture'
    } else if (this.tireStateLR === 'PunctureAndUnderInflationAndFailure') {
      this.tireStateLR = 'Puncture'
    }
    this.pressureLR = this.getPressureLR
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
    background-image: url('../img/tireBackground.png');
    // p {
    //     text-align: center;
    //     margin-top: 15%;
    //     font-size: 30px;
    //     color: rgba(180, 189, 183, 0.795);
    // }
    div.right {
        width: 100%;
        height: 50%;
        div.front{
            float: left;
            border: 1px solid gray;
            width: 50%;
            height: 100%;
            div.RFstatus {
              float: left;
              margin-top: 13px;
              margin-left: 20px;
              font-size: 20px;
              color: rgba(180, 189, 183, 0.795);
            }
            div.RFpressure {
              float: left;
              margin-left: 20px;
              font-size: 20px;
              color: rgba(180, 189, 183, 0.795);
            }
            img {
              float: left;
              position: absolute;
              top: 152px;
              left: 427px;
            }
            .btn-secondary {
              font-size: 16px;
              position: absolute;
              top: 160px;
              left: 230px;
            }
            div.detailbuttonRF {
              float: left;
            }
        }
        div.rear{
            float: left;
            border: 1px solid gray;
            width: 50%;
            height: 100%;
            div.RRstatus {
              float: right;
              margin-top: 13px;
              margin-right: 20px;
              font-size: 20px;
              color: rgba(180, 189, 183, 0.795);
            }
            div.RRpressure {
              float: right;
              margin-right: 20px;
              font-size: 20px;
              color: rgba(180, 189, 183, 0.795);
            }
            img {
              float: left;
              position: absolute;
              top: 152px;
              left: 534px;
            }
            .btn-secondary {
              font-size: 16px;
              position: absolute;
              top: 160px;
              left: 690px;
            }
            div.detailbuttonRR {
              float: left;
            }
        }
    }
    div.left {
        width: 100%;
        height: 50%;
        div.front {
            float: left;
            border: 1px solid gray;
            width: 50%;
            height: 100%;
            div.LFstatus {
              float: left;
              margin-top: 13px;
              margin-left: 20px;
              font-size: 20px;
              color: rgba(180, 189, 183, 0.795);
            }
            div.LFpressure {
              float: left;
              margin-left: 20px;
              font-size: 20px;
              color: rgba(180, 189, 183, 0.795);
            }
            img {
              float: left;
              position: absolute;
              top: 250px;
              left: 427px;
            }
            .btn-secondary {
              font-size: 16px;
              position: absolute;
              top: 293px;
              left: 230px;
            }
            div.detailbuttonLF {
              float: left;
            }
        }
        div.rear {
            float: left;
            border: 1px solid gray;
            width: 50%;
            height: 100%;
            div.LRstatus {
              float: right;
              margin-top: 13px;
              margin-right: 20px;
              font-size: 20px;
              color: rgba(180, 189, 183, 0.795);
            }
            div.LRpressure {
              float: right;
              margin-right: 20px;
              font-size: 20px;
              color: rgba(180, 189, 183, 0.795);
            }
            img {
              float: left;
              position: absolute;
              top: 250px;
              left: 534px;
            }
            .btn-secondary {
              font-size: 16px;
              position: absolute;
              top: 293px;
              left: 691px;
            }
            div.detailbuttonLR {
              float: left;
            }
        }
    }
}
div.right > div.front {
  // background-image: url('../img/1.png');
  background-position-x: right;
  background-size: contain;
  background-repeat: no-repeat;
}
div.right > div.rear {
  // background-image: url('../img/2.png');
  background-position-x: left;
  background-size: contain;
  background-repeat: no-repeat;
}
div.left > div.front {
  // background-image: url('../img/4.png');
  background-position-x: right;
  background-size: contain;
  background-repeat: no-repeat;
}
div.left > div.rear {
  // background-image: url('../img/3.png');
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