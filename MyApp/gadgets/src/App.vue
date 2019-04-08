<template>
  <div id="gadget" @jog-click="onClickJog" @click="onClickJog">
    <div class="header">
      Title
    </div>
    <div class="body">
      Gadget
    </div>
    <div class="buttons">
      <!-- button area -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',
  components: {
  },
  methods: {
    onClickJog () {
      this.$focus.exitFocusMode()
      window.applicationFramework.applicationManager.getOwnerApplication(window.document).fullscreen()
    }
  }
}
</script>

<style lang="scss">
@import './css/l.scss';
@import './css/m.scss';
@import './css/s.scss';

  #gadget {
    position: relative;
    background:#1a1a1a;
    color: #ffffff;
    &.obg-focus{
      box-shadow: inset 0 0 0 4px #fff;
    }
    > .header {
      height: 57px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      background: rgba(10,10,10,0.5);
    }
    > .body {
      font-size: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
