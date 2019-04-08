class ScrollPositionManager {
  constructor () {
    this.saveMap = {}
  }
  set (key, val) {
    this.saveMap[key] = val
  }
  get (key) {
    return this.saveMap[key]
  }
}

export default new ScrollPositionManager()
