let bus

export function install (_Vue) {
  if (!bus) {
    bus = new _Vue()
    window.obigoUI.$events = bus
  }
  return bus
}

export default {
  $on (...args) {
    if (!bus) bus = window.obigoUI.$events
    bus && bus.$on(...args)
  },
  $once (...args) {
    if (!bus) bus = window.obigoUI.$events
    bus && bus.$once(...args)
  },
  $emit (...args) {
    if (!bus) bus = window.obigoUI.$events
    bus && bus.$emit(...args)
  },
  $off (...args) {
    if (!bus) bus = window.obigoUI.$events
    bus && bus.$off(...args)
  }
}
