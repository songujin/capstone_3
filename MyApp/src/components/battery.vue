<template>
  <div>
    <management-view></management-view>
  </div>
</template>
<script>
import management from './management.vue'

export default {
  name: 'managepopup',
  components: {
    'management-view': management
  }
}
</script>
<style lang='scss' scoped>
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
