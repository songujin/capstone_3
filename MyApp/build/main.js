webpackJsonp([28],Array(32).concat([
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)();
// imports


// module
exports.push([module.i, "\n#app {\n  position: relative;\n  background: #2a2a2a;\n  color: #ffffff;\n}", ""]);

// exports


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)();
// imports


// module
exports.push([module.i, "/* .obg-footer{\n   display:flex;\n   position: absolute;\n   bottom: 0px;\n   justify-content: center;\n   align-items: center;\n   text-align: center;\n   transition-duration: 200ms;\n   .zone-3{\n     display: flex;\n     align-items: center;\n     justify-content: center;\n   }\n   .footer-button{\n     float:left;\n     z-index: 150;\n   }\n }*/", ""]);

// exports


/***/ }),
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)();
// imports


// module
exports.push([module.i, "/*\r\n  @import '../../styles/common/colors.variables.scss';\r\n  */", ""]);

// exports


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)();
// imports


// module
exports.push([module.i, "\n.menu-item-wrapper[data-v-88d6d906] {\n  position: relative;\n}\n.animate-scale[data-v-88d6d906] {\n  animation: popover-scale-data-v-88d6d906 .2s;\n}\n@keyframes popover-scale-data-v-88d6d906 {\n0% {\n    opacity: 0;\n    transform: scale(0.7);\n}\n100% {\n    opacity: 1;\n    transform: scale(1);\n}\n}", ""]);

// exports


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)();
// imports


// module
exports.push([module.i, "\n.obg-popover[data-v-ea9ccd2e] {\n  position: fixed;\n  z-index: 200;\n  /* overflow-y:auto;\n  overflow-x:hidden;*/\n}\n.animate-scale[data-v-ea9ccd2e] {\n  animation: popover-scale-data-v-ea9ccd2e .2s;\n}\n@keyframes popover-scale-data-v-ea9ccd2e {\n0% {\n    opacity: 0;\n    transform: scale(0.7);\n}\n100% {\n    opacity: 1;\n    transform: scale(1);\n}\n}", ""]);

// exports


/***/ }),
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)();
// imports


// module
exports.push([module.i, "/*\r\n@import '../../styles/common/colors.variables';\r\n*/", ""]);

// exports


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)();
// imports


// module
exports.push([module.i, "/*\r\n@import '../../styles/common/colors.variables';\r\n\r\n.overlay{\r\n    position:fixed;\r\n    width:100%;\r\n    height:100%;\r\n    top:0;\r\n    left:0;\r\n    z-index:400;\r\n    background-color:rgba(0, 0, 0, 0.8);\r\n    display:flex;\r\n    align-items:center;\r\n    justify-content:center;\r\n    color:white;\r\n\r\n    .popup{\r\n        flex:none;\r\n        width:340px;\r\n        min-height:66px;\r\n        border:1px solid #737480;\r\n        font-size:32px;\r\n        flex-direction:column;\r\n        display:flex;\r\n        background:#2a2a2a;\r\n        .pop-contents{\r\n          padding-left:10px;\r\n          padding-right:10px;\r\n          text-align:center;\r\n          display:flex;\r\n          align-items:center;\r\n          justify-content:center;\r\n          .title{\r\n              padding-left:10px;\r\n              max-width:300px;\r\n              font-size:32px; line-height:66px;\r\n              text-align:center;\r\n              overflow:hidden;\r\n              text-overflow:ellipsis;\r\n              display:block;\r\n              white-space: nowrap;\r\n              word-wrap: normal;\r\n          }\r\n        }\r\n    }\r\n}\r\n*/", ""]);

// exports


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _footer = __webpack_require__(107);

var _footer2 = _interopRequireDefault(_footer);

var _manageLibs = __webpack_require__(96);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: 'home',
  components: {
    'obg-footer': _footer2.default
  },
  data: function data() {
    return {
      hardkeyCodes: this.$hardkey.getCodes(),
      alarmRFFlag: true,
      alarmRRFlag: true,
      alarmLRFlag: true,
      alarmLFFlag: true,
      alarmOillag: true,
      alarmBatterylag: true
    };
  },

  methods: {
    onBack: function onBack(evt) {
      console.log(evt);
      if (window.applicationFramework) {
        window.applicationFramework.applicationManager.getOwnerApplication(window.document).back();
      }
    },
    onMore: function onMore(evt) {
      console.log(evt);
    },
    initHardKeyAction: function initHardKeyAction() {
      var _this = this;

      this.$hardkey.addHardkeyListener(this.hardkeyCodes.code.HARDKEY_BUTTON_BACK, function (e) {
        _this.onBack();
      });
    },
    calculateM: function calculateM(m) {
      var date = new Date();
      var betweenDay = (date.getTime() - m) / 1000 / 60 / 60 / 24;
      return Math.floor(betweenDay / 30.4);
    },
    alarmPopup: function alarmPopup() {
      if (this.alarmRFFlag === true && 60000 - _manageLibs.storage.loadRFTireKm() <= 0) {
        _manageLibs.storage.saveRFProblem('problem_Distance');
        this.alarmRFFlag = false;
        this.$router.push('/alarmRF');
      }
      if (this.alarmRFFlag === true && 36 - this.calculateM(_manageLibs.storage.loadRFTireM()) <= 0) {
        _manageLibs.storage.saveRFProblem('problem_Date');
        this.alarmRFFlag = false;
        this.$router.push('/alarmRF');
      }
      if (this.alarmRRFlag === true && 60000 - _manageLibs.storage.loadRRTireKm() <= 0) {
        _manageLibs.storage.saveRRProblem('problem_Distance');
        this.alarmRRFlag = false;
        this.$router.push('/alarmRR');
      }
      if (this.alarmRRFlag === true && 36 - this.calculateM(_manageLibs.storage.loadRRTireM()) <= 0) {
        _manageLibs.storage.saveRRProblem('problem_Date');
        this.alarmRRFlag = false;
        this.$router.push('/alarmRR');
      }
      if (this.alarmLFFlag === true && 60000 - _manageLibs.storage.loadLFTireKm() <= 0) {
        _manageLibs.storage.saveLFProblem('problem_Distance');
        this.alarmLFFlag = false;
        this.$router.push('/alarmLF');
      }
      if (this.alarmLFFlag === true && 36 - this.calculateM(_manageLibs.storage.loadLFTireM()) <= 0) {
        _manageLibs.storage.saveLFProblem('problem_Date');
        this.alarmLFFlag = false;
        this.$router.push('/alarmLF');
      }
      if (this.alarmLRFlag === true && 60000 - _manageLibs.storage.loadLRTireKm() <= 0) {
        _manageLibs.storage.saveLRProblem('problem_Distance');
        this.alarmLRFlag = false;
        this.$router.push('/alarmLR');
      }
      if (this.alarmLRFlag === true && 36 - this.calculateM(_manageLibs.storage.loadLRTireM()) <= 0) {
        _manageLibs.storage.saveLRProblem('problem_Date');
        this.alarmLRFlag = false;
        this.$router.push('/alarmLR');
      }
      if (this.alarmOillag === true && 15000 - _manageLibs.storage.loadEngineOilkm() <= 0) {
        _manageLibs.storage.saveOilProblem('problem_Distance');
        this.alarmOillag = false;
        this.$router.push('/alarmEngineOil');
      }
      if (this.alarmOillag === true && 12 - this.calculateM(_manageLibs.storage.loadEngineOilM()) <= 0) {
        _manageLibs.storage.saveOilProblem('problem_Date');
        this.alarmOillag = false;
        this.$router.push('/alarmEngineOil');
      }
      if (this.alarmBatterylag === true && 60000 - _manageLibs.storage.loadBatterykm() <= 0) {
        _manageLibs.storage.saveBatteryProblem('problem_Distance');
        this.alarmBatterylag = false;
        this.$router.push('/alarmBattery');
      }
      if (this.alarmBatterylag === true && 36 - this.calculateM(_manageLibs.storage.loadBatteryM()) <= 0) {
        _manageLibs.storage.saveBatteryProblem('problem_Date');
        this.alarmBatterylag = false;
        this.$router.push('/alarmBattery');
      }
      if (this.alarmOillag === true && (_manageLibs.storage.loadOillevelApi() === 'BargraphElement1' || _manageLibs.storage.loadOillevelApi() === 'BargraphElement2')) {
        _manageLibs.storage.saveBatteryProblem('problem_LevelAPI');
        this.alarmOillag = false;
        this.$router.push('/management');
      }
      if (this.alarmOillag === true && _manageLibs.storage.loadOilPresApi() === 'true') {
        _manageLibs.storage.saveBatteryProblem('problem_PressAPI');
        this.alarmOillag = false;
        this.$router.push('/management');
      }
    }
  },
  mounted: function mounted() {
    var AP = this;
    this.initHardKeyAction();
    setInterval(function () {
      AP.alarmPopup();
    }, 60000);
  }
};

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _from = __webpack_require__(61);

var _from2 = _interopRequireDefault(_from);

var _button = __webpack_require__(73);

var _button2 = _interopRequireDefault(_button);

var _contextMenu = __webpack_require__(122);

var _contextMenu2 = _interopRequireDefault(_contextMenu);

var _events = __webpack_require__(13);

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: 'obg-footer',
  components: {
    'obg-button': _button2.default,
    'obg-context-menu': _contextMenu2.default
  },
  mounted: function mounted() {
    var _this = this;

    this.addFocusComponents();
    this.$refs.back.$el.addEventListener('mousedown', this.onPressStart);
    this.$refs.back.$el.addEventListener('touchstart', this.onPressStart);
    this.$refs.back.$el.addEventListener('mouseup', this.onPressEnd);
    this.$refs.back.$el.addEventListener('touchend', this.onPressEnd);
    _events2.default.$on('list:scrollstart', function () {
      _this.scrolling = true;
    });
    _events2.default.$on('list:scrollend', function () {
      _this.scrolling = false;
    });
  },
  beforeDestroy: function beforeDestroy() {
    this.$focus._removeSceneMap(3, this.scene);
  },

  computed: {
    hideAnimation: function hideAnimation() {
      return this.animation ? 'translateY( ' + (this.scrolling ? 93 : 0) + 'px)' : '';
    },
    self: function self() {
      return this.wheelPosition === 'lhd' ? 'bottom right' : 'bottom left';
    }
  },
  data: function data() {
    return {
      childrenCount: 0,
      isPressed: false,
      timer: null,
      scrolling: false,
      wheelPosition: this.$model ? this.$model.wheelPosition : 'lhd'
    };
  },

  props: {
    mask: {
      type: Boolean,
      default: false
    },
    offset: {
      type: Array
    },
    disable: {
      type: String,
      default: 'none',
      validator: function validator(value) {
        return ['none', 'left', 'right', 'both'].indexOf(value) > -1;
      }
    },
    rightIcon: {
      type: String,
      default: 'more'
    },
    options: {
      type: Array,
      default: function _default() {
        return [{ name: '', label: '' }];
      }
    },
    scene: {
      default: 0,
      type: Number
    },
    contextMenuScene: {
      default: 800,
      type: Number
    },
    animation: {
      default: true,
      type: Boolean
    }
  },
  methods: {
    onClickBack: function onClickBack(evt) {
      this.$emit('back', evt);
    },
    onInput: function onInput(evt) {
      this.$emit('input', evt);
    },
    onOpen: function onOpen() {
      this.$focus.setScene(this.contextMenuScene);
      this.$emit('open');
    },
    onClose: function onClose() {
      this.$focus.setScene(this.scene);
      this.$emit('close');
    },
    onJogClick: function onJogClick() {
      this.$focus._zoneFocusMode = true;
      this.$focus._componentFocusMode = true;
    },
    onClickContextMenu: function onClickContextMenu() {
      var $target = this.$refs.contextMenu.$el;
      var clickEvent = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': false
      });
      $target.dispatchEvent(clickEvent);
    },
    onPressStart: function onPressStart(e) {
      if (this.isPressing) return;
      this.isPressing = true;
      this.timer = setTimeout(function () {
        if (window.applicationFramework) {
          window.applicationFramework.applicationManager.getOwnerApplication(window.document).home();
        }
      }, 1000);
    },
    onPressEnd: function onPressEnd(e) {
      this.isPressing = false;
      clearTimeout(this.timer);
    },
    refreshFocusComponents: function refreshFocusComponents() {
      this.$focus.exitFocusMode();
      this.$focus._removeSceneMap(3, this.scene);
      this.addFocusComponents();
    },
    addFocusComponents: function addFocusComponents() {
      var _this2 = this;

      var back = this.$children[0];
      var contextMenu = this.$refs.contextMenu;
      var children = this.$children[1].$el.classList.contains('obg-tab') ? this.$children[1].$children : (0, _from2.default)(this.$el.children[1].children);
      this.childrenCount = children.length;

      if (this.childrenCount > 0) {
        var count = 0;
        children.forEach(function (child, index) {
          if (child.$vnode) {
            _this2.$focus._addComponent(child.$el, { scene: _this2.scene, order: count++, zone: 3, isFocus: false }, child.$vnode);
          } else {
            if (child.dataset.focusable && child.dataset.focusable === 'false') return;
            _this2.$focus._addComponent(child, { scene: _this2.scene, order: count++, zone: 3, isFocus: false }, null);
          }
        });
        this.$focus._addComponent(back.$el, { scene: this.scene, order: count++, zone: 3, isFocus: false }, back.$vnode);
        this.$focus._addComponent(contextMenu.$el, { scene: this.scene, order: count, zone: 3, isFocus: false }, contextMenu.$vnode);
      } else {
        this.$focus._addComponent(back.$el, { scene: this.scene, order: 0, zone: 3, isFocus: false }, back.$vnode);
        this.$focus._addComponent(contextMenu.$el, { scene: this.scene, order: 1, zone: 3, isFocus: false }, contextMenu.$vnode);
      }
    }
  }
};

/***/ }),
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _event = __webpack_require__(75);

exports.default = {
  name: 'obg-button',
  methods: {
    start: function start(evt) {
      this.$refs.btn.classList.add('active');
    },
    end: function end(evt) {
      this.$refs.btn.classList.remove('active');
    },
    handleClick: function handleClick(evt) {
      (0, _event.triggerBodyClickEvent)(evt);
      this.$emit('click', evt);
    }
  },
  computed: {
    iconOnly: function iconOnly() {
      if ((this.icon || this.$slots.icon) && typeof this.$slots.default === 'undefined') {
        return true;
      }
      return false;
    }
  },
  props: {
    icon: String,
    disabled: Boolean,
    type: {
      type: String,
      default: 'default',
      validator: function validator(value) {
        return ['default', 'round', 'square', 'squareroundlist', 'squareroundoutline', 'squareround', 'footer'].indexOf(value) > -1;
      }
    },
    size: {
      type: String,
      default: 'normal',
      validator: function validator(value) {
        return ['small', 'normal', 'large'].indexOf(value) > -1;
      }
    }
  }
};

/***/ }),
/* 75 */,
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _popover = __webpack_require__(125);

var _popover2 = _interopRequireDefault(_popover);

var _button = __webpack_require__(73);

var _button2 = _interopRequireDefault(_button);

var _events = __webpack_require__(13);

var _events2 = _interopRequireDefault(_events);

var _event = __webpack_require__(75);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  props: {
    disable: Boolean,
    btnType: {
      type: String,
      default: 'round'
    },
    icon: {
      type: String,
      default: 'more'
    },
    focusZone: {
      type: Number,
      default: 99
    },
    scene: {
      default: 800,
      type: Number
    },
    anchor: {
      default: 'top middle',
      type: String
    },
    self: {
      default: 'bottom right',
      type: String
    },
    offset: {
      type: Array
    },
    options: {
      type: Array,
      required: true,
      default: [],
      validator: function validator(arr) {
        if (arr.length < 1 || arr.length > 5) {
          return false;
        }
        arr.forEach(function (item) {
          if (!(item.hasOwnProperty('name') && item.hasOwnProperty('label'))) {
            throw new Error('options should be [{ name: xxxx, label: yyyy}, ...]');
          }
        });
        return true;
      }
    }
  },
  components: {
    'obg-button': _button2.default,
    'obg-popover': _popover2.default
  },
  computed: {
    contextMenuHeight: function contextMenuHeight() {
      return this.options.length * 69 + this.options.length - 2;
    }
  },
  watch: {
    options: function options(val, oldVal) {
      this.$focus._focusMap.get(2).get(this.scene).delete(oldVal.length);
    }
  },
  updated: function updated() {
    this.$focus._addComponent(this.$refs.closeButton, { scene: this.scene, zone: 2, order: this.options.length });
  },

  methods: {
    start: function start(evt) {
      evt.currentTarget.classList.add('active');
    },
    end: function end(evt) {
      evt.currentTarget.classList.remove('active');
    },
    close: function close() {
      if (this.$refs.popover) this.$refs.popover.close();
      this.hideDimScreen();
    },
    __open: function __open(event) {
      if (!this.disable) {
        this.$refs.popover.open(event);
      }
    },
    onItemClick: function onItemClick(e) {
      var name = e.currentTarget.getAttribute('name');
      this.$emit('input', name);
      (0, _event.triggerBodyClickEvent)();
      this.close();
    },
    onJogClick: function onJogClick() {
      this.$focus._zoneFocusMode = true;
      this.$focus._componentFocusMode = true;
    },
    onClickDim: function onClickDim() {
      this.$focus.exitFocusMode();
    },
    showDimScreen: function showDimScreen() {
      var _this = this;

      document.querySelector('#app').classList.add('obg-filter-blur');
      if (window.applicationFramework) window.applicationFramework.applicationManager.getOwnerApplication(window.document).setPopupActivationStatus(true);
      this.focusPos = this.$focus.getCurrentPosition();
      document.body.appendChild(this.$dim);
      document.body.appendChild(this.$closeButton);
      this.$dim.addEventListener('click', this.close);
      this.$closeButton.addEventListener('click', this.close);
      this.$emit('open');
      var focusPos = this.$focus.getCurrentPosition();
      this.previousScene = focusPos.scene;
      this._Loop = this.$focus._Loop;
      this.$focus.setScene(this.scene);
      this.$focus.setOptions({ loop: true });
      this.$nextTick(function () {
        setTimeout(function () {
          _events2.default.$emit('popup:show', {
            type: 'context',
            el: document.getElementsByClassName('obg-popover context-menu')[0],
            prevFocusPosition: _this.focusPos
          });
        }, 200);
      });
    },
    hideDimScreen: function hideDimScreen() {
      this.$dim.removeEventListener('click', this.close);
      this.$closeButton.removeEventListener('click', this.close);
      this.$emit('close');
      if (document.body.querySelector('.dim-context-menu')) {
        document.body.removeChild(this.$dim);
        document.querySelector('#app').classList.remove('obg-filter-blur');
        if (window.applicationFramework) window.applicationFramework.applicationManager.getOwnerApplication(window.document).setPopupActivationStatus(false);
      }
      if (document.body.querySelector('.close-button-context-menu')) {
        document.body.removeChild(this.$closeButton);
        this.$focus.setScene(this.previousScene);
        this.$focus.setOptions({ loop: this._Loop });
        this.$nextTick(function () {
          _events2.default.$emit('popup:hide', {
            type: 'context'
          });
        });
      }
    }
  },
  mounted: function mounted() {
    var _this2 = this;

    var originPos = this.$refs.origin.$el.getBoundingClientRect();

    this.target = this.$refs.popover.$el.parentNode;
    this.target.addEventListener('contextmenu', this.__open);
    this.$dim = this.$refs.dim;
    this.$closeButton = this.$refs.closeButton;
    this.$closeButton.style.top = originPos.top + originPos.height / 2 - this.$refs.closeButton.offsetHeight / 2 + 'px';
    this.$closeButton.style.left = originPos.left + originPos.width / 2 - this.$refs.closeButton.offsetWidth / 2 + 'px';

    var $origin = this.$refs.origin.$el.getElementsByClassName('obg-button-text')[0];
    $origin.style.display = 'none';

    this.$nextTick(function () {
      _this2.$el.childNodes[2].removeChild(_this2.$dim);
      _this2.$el.childNodes[2].removeChild(_this2.$closeButton);
    });
  },
  beforeDestroy: function beforeDestroy() {
    this.target.removeEventListener('contexmenu', this.handler);
  }
};

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _popover = __webpack_require__(128);

var validator = _interopRequireWildcard(_popover);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = {
  props: {
    anchor: {
      type: String,
      default: 'bottom left',
      validator: validator.positionValidator
    },
    self: {
      type: String,
      default: 'top left',
      validator: validator.positionValidator
    },
    maxHeight: String,
    touchPosition: Boolean,
    anchorClick: {
      type: Boolean,
      default: true
    },
    offset: {
      type: Array,
      validator: validator.offsetValidator
    },
    disable: Boolean
  },
  data: function data() {
    return {
      opened: false,
      progress: false
    };
  },

  computed: {
    transformCSS: function transformCSS() {
      return this.getTransformProperties({ selfOrigin: this.selfOrigin });
    },
    anchorOrigin: function anchorOrigin() {
      return this.parsePosition(this.anchor);
    },
    selfOrigin: function selfOrigin() {
      return this.parsePosition(this.self);
    }
  },
  mounted: function mounted() {
    var _this = this;

    this.$nextTick(function () {
      _this.anchorEl = _this.$el.parentNode;
      _this.anchorEl.removeChild(_this.$el);
      _this.anchorEl = _this.anchorEl.tagName === 'BUTTON' ? _this.anchorEl : _this.anchorEl.parentNode;
      if (_this.anchorClick) {
        _this.anchorEl.classList.add('cursor-pointer');
        _this.anchorEl.addEventListener('click', _this.toggle);
      }
    });
  },
  beforeDestroy: function beforeDestroy() {
    if (this.anchorClick && this.anchorEl) {
      this.anchorEl.removeEventListener('click', this.toggle);
    }
    this.close();
  },

  methods: {
    toggle: function toggle(event) {
      if (this.opened) {
        this.close();
      } else {
        this.open(event);
      }
    },
    open: function open(event) {
      var _this2 = this;

      if (this.disable || this.opened) {
        return;
      }
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }

      this.opened = true;
      document.body.click();
      document.body.appendChild(this.$el);
      document.addEventListener('click', this.close);
      this.$el.addEventListener('click', this.close);
      this.$nextTick(function () {
        _this2.__updatePosition(event);
        _this2.$emit('open');
      });
    },
    close: function close(fn) {
      var _this3 = this;

      if (!this.opened || this.progress) {
        return;
      }
      document.removeEventListener('click', this.close);
      this.progress = true;

      this.$nextTick(function () {
        _this3.opened = false;
        _this3.progress = false;

        var $popover = document.body.getElementsByClassName('obg-popover animate-scale');
        if ($popover.length > 0) document.body.removeChild($popover[0]);
        _this3.$emit('close');
        if (typeof fn === 'function') {
          fn();
        }
      });
    },
    __updatePosition: function __updatePosition(event) {
      this.setPosition({
        event: event,
        el: this.$el,
        offset: this.offset,
        anchorEl: this.anchorEl,
        anchorOrigin: this.anchorOrigin,
        selfOrigin: this.selfOrigin,
        maxHeight: this.maxHeight,
        anchorClick: this.anchorClick,
        touchPosition: this.touchPosition
      });
    },
    parsePosition: function parsePosition(pos) {
      var parts = pos.split(' ');
      return { vertical: parts[0], horizontal: parts[1] };
    },
    getTransformProperties: function getTransformProperties(_ref) {
      var selfOrigin = _ref.selfOrigin;

      var vert = selfOrigin.vertical;
      var horiz = selfOrigin.horizontal === 'middle' ? 'center' : selfOrigin.horizontal;

      return {
        'transform-origin': vert + ' ' + horiz + ' 0px'
      };
    },
    setPosition: function setPosition(_ref2) {
      var el = _ref2.el,
          anchorEl = _ref2.anchorEl,
          anchorOrigin = _ref2.anchorOrigin,
          selfOrigin = _ref2.selfOrigin,
          maxHeight = _ref2.maxHeight,
          event = _ref2.event,
          anchorClick = _ref2.anchorClick,
          touchPosition = _ref2.touchPosition,
          offset = _ref2.offset;

      var anchor = void 0;

      if (event && (!anchorClick || touchPosition)) {
        var _eventPosition = this.eventPosition(event),
            top = _eventPosition.top,
            left = _eventPosition.left;

        anchor = { top: top, left: left, width: 1, height: 1, right: left + 1, center: top, middle: left, bottom: top + 1 };
      } else {
        anchor = this.getAnchorPosition(anchorEl, offset);
      }

      var target = this.getTargetPosition(el);
      var targetPosition = {
        top: anchor[anchorOrigin.vertical] - target[selfOrigin.vertical],
        left: anchor[anchorOrigin.horizontal] - target[selfOrigin.horizontal]
      };

      el.style.top = Math.max(0, targetPosition.top) + 'px';
      el.style.left = Math.max(0, targetPosition.left) + 'px';
      el.style.maxHeight = this.maxHeight || window.innerHeight * 0.9 + 'px';
    },
    eventPosition: function eventPosition(e) {
      var posx = void 0,
          posy = void 0;

      if (e.clientX || e.clientY) {
        posx = e.clientX;
        posy = e.clientY;
      } else if (e.pageX || e.pageY) {
        posx = e.pageX - document.body.scrollLeft - document.documentElement.scrollLeft;
        posy = e.pageY - document.body.scrollTop - document.documentElement.scrollTop;
      }

      return {
        top: posy,
        left: posx
      };
    },
    getAnchorPosition: function getAnchorPosition(el, offset) {
      var _el$getBoundingClient = el.getBoundingClientRect(),
          top = _el$getBoundingClient.top,
          left = _el$getBoundingClient.left,
          right = _el$getBoundingClient.right,
          bottom = _el$getBoundingClient.bottom;

      var a = {
        top: top,
        left: left,
        width: el.offsetWidth,
        height: el.offsetHeight
      };

      if (offset) {
        a.top += offset[1];
        a.left += offset[0];
        if (bottom) {
          bottom += offset[1];
        }
        if (right) {
          right += offset[0];
        }
      }

      a.right = right || a.left + a.width;
      a.bottom = bottom || a.top + a.height;
      a.middle = a.left + (a.right - a.left) / 2;
      a.center = a.top + (a.bottom - a.top) / 2;

      return a;
    },
    getTargetPosition: function getTargetPosition(el) {
      return {
        top: 0,
        center: el.offsetHeight / 2,
        bottom: el.offsetHeight,
        left: 0,
        middle: el.offsetWidth / 2,
        right: el.offsetWidth
      };
    }
  }
};

/***/ }),
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = __webpack_require__(52);

var _typeof3 = _interopRequireDefault(_typeof2);

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _events = __webpack_require__(13);

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: 'obg-popup',
  methods: {
    down: function down(e) {
      e.target.classList.add('active');
    },
    up: function up(e) {
      e.target.classList.remove('active');
    },
    close: function close() {
      document.querySelector('#app').classList.remove('obg-filter-blur');
      if (window.applicationFramework) window.applicationFramework.applicationManager.getOwnerApplication(window.document).setPopupActivationStatus(false);
      var contentData = void 0;
      var titleData = void 0;
      if (this.componentContent) {
        contentData = this.componentContent.$children[0].$data;
        this.componentContent.$destroy();
      }
      if (this.componentTitle) {
        titleData = this.componentTitle.$children[0].$data;
        this.componentTitle.$destroy();
      }
      this.$root.$destroy();
      this.$root.$el.parentNode.removeChild(this.$root.$el);
      this.onClose(contentData, titleData);
    },
    getBtnWidth: function getBtnWidth() {
      return {
        width: 100 / this.buttons.length + '%'
      };
    },
    clickOverlay: function clickOverlay(e) {
      this.$focus.exitFocusMode();
      if (this.buttons === undefined || this.buttons.length === 0) {
        clearTimeout(this.autoCloseTimer);
        this.close();
      }
    },
    clickPopup: function clickPopup(e) {
      this.$focus.exitFocusMode();
    },
    onClickButton: function onClickButton(e) {
      var buttonIndex = Number(e.target.getAttribute('index'));
      if (e.isTrusted) {
        this.$focus.exitFocusMode();
      } else {
        e.stopPropagation();
      }
      var contentData = void 0;
      var titleData = void 0;
      if (this.componentContent) {
        contentData = this.componentContent.$children[0].$data;
      }
      if (this.componentTitle) {
        titleData = this.componentTitle.$children[0].$data;
      }
      this.buttons[buttonIndex].onClick(contentData, titleData);
    }
  },
  data: function data() {
    return {
      scene: 700,
      previousScene: 0
    };
  },

  props: {
    buttons: {
      type: Array
    },
    title: {
      type: [String, Object]
    },
    content: {
      type: [String, Object]
    },
    height: {
      type: Number,
      default: 287
    },
    width: {
      type: Number,
      default: 519
    },
    onOpen: {
      type: Function,
      default: function _default() {}
    },
    onClose: {
      type: Function,
      default: function _default() {}
    },
    timeout: {
      type: Number,
      default: 5000
    },
    subClass: {
      type: String
    }
  },
  mounted: function mounted() {
    var _this = this;

    this.$refs.popup.style.width = this.width + 'px';

    var contentHeight = this.height - 2;
    if (this.title) {
      contentHeight = contentHeight - 66;
    }
    if (this.buttons && this.buttons.length > 0) {
      contentHeight = contentHeight - 60;
    }

    if (!this.buttons || this.buttons.length === 0) {
      this.autoCloseTimer = setTimeout(this.close, this.timeout);
    }
    if ((0, _typeof3.default)(this.content) === 'object') {
      this.$el.querySelector('#component-content').style.height = contentHeight + 'px';
      this.$refs.popup.style.height = this.height + 'px';
      var props = this.content.props || {};
      props.height = this.height;
      props.width = this.width;
      this.componentContent = new _vue2.default({
        el: this.$el.querySelector('.content-inner'),
        render: function render(h) {
          return h(_this.content.component, { props: props });
        }
      });
    } else {
      this.$refs.popup.style.minHeight = this.height + 'px';
    }

    if ((0, _typeof3.default)(this.title) === 'object') {
      var _props = this.title.props || {};
      _props.height = this.height;
      _props.width = this.width;
      this.componentTitle = new _vue2.default({
        el: this.$el.querySelector('.title-inner'),
        render: function render(h) {
          return h(_this.title.component, { props: _props });
        }
      });
    }

    var focusPos = this.$focus.getCurrentPosition();
    this.previousScene = focusPos.scene;
    this.$focus.setScene(this.scene);
    this.$nextTick(function () {
      _events2.default.$emit('popup:show', {
        type: 'popup',
        el: document.body.getElementsByClassName('popup')[0],
        prevFocusPosition: focusPos
      });

      document.querySelector('#app').classList.add('obg-filter-blur');
      if (window.applicationFramework) window.applicationFramework.applicationManager.getOwnerApplication(window.document).setPopupActivationStatus(true);
    });

    this.$root.closePopup = this.close;
    this.onOpen();
  },
  beforeDestroy: function beforeDestroy() {
    this.$focus.setScene(this.previousScene);
    _events2.default.$emit('popup:hide', {
      type: 'popup'
    });
  }
};

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = __webpack_require__(13);

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: 'obg-progress-popup',
  methods: {
    down: function down(e) {
      e.target.classList.add('active');
    },
    up: function up(e) {
      e.target.classList.remove('active');
    },
    close: function close() {
      document.querySelector('#app').classList.remove('obg-filter-blur');
      if (window.applicationFramework) window.applicationFramework.applicationManager.getOwnerApplication(window.document).setPopupActivationStatus(false);
      if (this.$root) {
        this.$root.$el.parentNode.removeChild(this.$root.$el);
        this.$root.$destroy();
        this.$root = null;
      }
    },
    updateProgress: function updateProgress(width) {
      this.barWidth = width;
    },
    getBtnWidth: function getBtnWidth() {
      return {
        width: 100 / this.buttons.length + '%'
      };
    },
    clickPopup: function clickPopup(e) {
      this.$focus.exitFocusMode();
    },
    onClickButton: function onClickButton(e) {
      var buttonIndex = Number(e.target.getAttribute('index'));
      if (e.isTrusted) {
        this.$focus.exitFocusMode();
      } else {
        e.stopPropagation();
      }
      this.buttons[buttonIndex].onClick();
    }
  },
  data: function data() {
    return {
      barWidth: 0,
      scene: 710,
      previousScene: 0
    };
  },

  props: {
    buttons: {
      type: Array
    },
    title: {
      type: String
    },
    content: {
      type: String
    },
    progress: {
      type: Number,
      validator: function validator(value) {
        return value >= 0 && value <= 100;
      }
    }
  },
  mounted: function mounted() {
    if (this.progress !== undefined) {
      this.updateProgress(this.progress);
    }
    var focusPos = this.$focus.getCurrentPosition();
    this.previousScene = focusPos.scene;
    this.$focus.setScene(this.scene);
    this.$nextTick(function () {
      _events2.default.$emit('popup:show', {
        type: 'popup',
        el: document.body.getElementsByClassName('popup')[0],
        prevFocusPosition: focusPos
      });
      document.querySelector('#app').classList.add('obg-filter-blur');
      if (window.applicationFramework) window.applicationFramework.applicationManager.getOwnerApplication(window.document).setPopupActivationStatus(true);
    });
    this.$root.closePopup = this.close;
    this.$root.updateProgress = this.updateProgress;
  },
  beforeDestroy: function beforeDestroy() {
    this.$focus.setScene(this.previousScene);
    _events2.default.$emit('popup:hide', {
      type: 'popup'
    });
  }
};

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _spinner = __webpack_require__(194);

var _spinner2 = _interopRequireDefault(_spinner);

var _events = __webpack_require__(13);

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: 'obg-loading-popup',
  components: {
    'obg-spinner': _spinner2.default
  },
  methods: {
    close: function close() {
      document.querySelector('#app').classList.remove('obg-filter-blur');
      if (window.applicationFramework) window.applicationFramework.applicationManager.getOwnerApplication(window.document).setPopupActivationStatus(false);
      this.$root.$destroy();
      this.$root.$el.parentNode.removeChild(this.$root.$el);
    }
  },
  data: function data() {
    return {
      timeout: 5000,
      scene: 720,
      previousScene: 0
    };
  },

  props: {
    title: {
      type: String
    },
    clickOverlay: {
      type: Function,
      default: function _default() {}
    }
  },
  mounted: function mounted() {
    var focusPos = this.$focus.getCurrentPosition();
    this.previousScene = focusPos.scene;
    this.$focus.setScene(this.scene);
    this.$nextTick(function () {
      _events2.default.$emit('popup:show', {
        type: 'popup',
        el: document.body.getElementsByClassName('popup')[0],
        prevFocusPosition: focusPos
      });
      document.querySelector('#app').classList.add('obg-filter-blur');
      if (window.applicationFramework) window.applicationFramework.applicationManager.getOwnerApplication(window.document).setPopupActivationStatus(true);
    });
    this.$root.closePopup = this.close;
  },
  beforeDestroy: function beforeDestroy() {
    this.$focus.setScene(this.previousScene);
    _events2.default.$emit('popup:hide', {
      type: 'popup'
    });
  }
};

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  name: 'obg-spinner',
  props: {
    height: {
      type: Number,
      default: 100
    },
    color: {
      type: String,
      default: '#00D4FF'
    },
    overlay: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    onClick: function onClick() {
      this.$emit('click');
    }
  }
};

/***/ }),
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var storage = {
  saveRFTireKm: function saveRFTireKm(km) {
    localStorage.setItem('RFtireKm', km);
  },
  loadRFTireKm: function loadRFTireKm() {
    var RFtireKm = localStorage.getItem('RFtireKm');
    RFtireKm = RFtireKm || '';
    return RFtireKm;
  },
  saveRRTireKm: function saveRRTireKm(km) {
    localStorage.setItem('RRtireKm', km);
  },
  loadRRTireKm: function loadRRTireKm() {
    var RRtireKm = localStorage.getItem('RRtireKm');
    RRtireKm = RRtireKm || '';
    return RRtireKm;
  },
  saveLFTireKm: function saveLFTireKm(km) {
    localStorage.setItem('LFtireKm', km);
  },
  loadLFTireKm: function loadLFTireKm() {
    var LFtireKm = localStorage.getItem('LFtireKm');
    LFtireKm = LFtireKm || '';
    return LFtireKm;
  },
  saveLRTireKm: function saveLRTireKm(km) {
    localStorage.setItem('LRtireKm', km);
  },
  loadLRTireKm: function loadLRTireKm() {
    var LRtireKm = localStorage.getItem('LRtireKm');
    LRtireKm = LRtireKm || '';
    return LRtireKm;
  },
  saveCFilterKm: function saveCFilterKm(km) {
    localStorage.setItem('CFilterKm', km);
  },
  loadCFilterKm: function loadCFilterKm() {
    var CFilterKm = localStorage.getItem('CFilterKm');
    CFilterKm = CFilterKm || '';
    return CFilterKm;
  },
  saveRFTireM: function saveRFTireM(m) {
    localStorage.setItem('RFtireM', m);
  },
  loadRFTireM: function loadRFTireM() {
    var RFtireM = localStorage.getItem('RFtireM');
    RFtireM = RFtireM || '';
    return RFtireM;
  },
  saveRRTireM: function saveRRTireM(m) {
    localStorage.setItem('RRtireM', m);
  },
  loadRRTireM: function loadRRTireM() {
    var RRtireM = localStorage.getItem('RRtireM');
    RRtireM = RRtireM || '';
    return RRtireM;
  },
  saveLFTireM: function saveLFTireM(m) {
    localStorage.setItem('LFtireM', m);
  },
  loadLFTireM: function loadLFTireM() {
    var LFtireM = localStorage.getItem('LFtireM');
    LFtireM = LFtireM || '';
    return LFtireM;
  },
  saveLRTireM: function saveLRTireM(m) {
    localStorage.setItem('LRtireM', m);
  },
  loadLRTireM: function loadLRTireM() {
    var LRtireM = localStorage.getItem('LRtireM');
    LRtireM = LRtireM || '';
    return LRtireM;
  },
  saveCFilterM: function saveCFilterM(m) {
    localStorage.setItem('CFilterM', m);
  },
  loadCFilterM: function loadCFilterM() {
    var CFilterM = localStorage.getItem('CFilterM');
    CFilterM = CFilterM || '';
    return CFilterM;
  },
  saveFirst: function saveFirst(cnt) {
    localStorage.setItem('First', cnt);
  },
  loadFirst: function loadFirst() {
    var First = localStorage.getItem('First');
    First = First || '0';
    return First;
  },
  saveCFilterProblem: function saveCFilterProblem(pText) {
    localStorage.setItem('CFilterProblem', pText);
  },
  loadCFilterProblem: function loadCFilterProblem() {
    var Probelm = localStorage.getItem('CFilterProblem');
    Probelm = Probelm || '';
    return Probelm;
  },
  saveRFProblem: function saveRFProblem(pText) {
    localStorage.setItem('RFProblem', pText);
  },
  loadRFProblem: function loadRFProblem() {
    var Probelm = localStorage.getItem('RFProblem');
    Probelm = Probelm || '';
    return Probelm;
  },
  saveRRProblem: function saveRRProblem(pText) {
    localStorage.setItem('RRProblem', pText);
  },
  loadRRProblem: function loadRRProblem() {
    var Probelm = localStorage.getItem('RRProblem');
    Probelm = Probelm || '';
    return Probelm;
  },
  saveLFProblem: function saveLFProblem(pText) {
    localStorage.setItem('LFProblem', pText);
  },
  loadLFProblem: function loadLFProblem() {
    var Probelm = localStorage.getItem('LFProblem');
    Probelm = Probelm || '';
    return Probelm;
  },
  saveLRProblem: function saveLRProblem(pText) {
    localStorage.setItem('LRProblem', pText);
  },
  loadLRProblem: function loadLRProblem() {
    var Probelm = localStorage.getItem('LRProblem');
    Probelm = Probelm || '';
    return Probelm;
  },
  saveAlarm: function saveAlarm(name) {
    localStorage.setItem('Alarm', name);
  },
  loadAlarm: function loadAlarm() {
    var Alarm = localStorage.getItem('Alarm');
    Alarm = Alarm || '';
    return Alarm;
  },
  saveEngineOilkm: function saveEngineOilkm(km) {
    localStorage.setItem('engineOilkm', km);
  },
  loadEngineOilkm: function loadEngineOilkm() {
    var engineOilkm = localStorage.getItem('engineOilkm');
    engineOilkm = engineOilkm || '';
    return engineOilkm;
  },
  saveEngineOilM: function saveEngineOilM(m) {
    localStorage.setItem('engineOilM', m);
  },
  loadEngineOilM: function loadEngineOilM() {
    var engineOilM = localStorage.getItem('engineOilM');
    engineOilM = engineOilM || '';
    return engineOilM;
  },
  saveBatterykm: function saveBatterykm(km) {
    localStorage.setItem('batterykm', km);
  },
  loadBatterykm: function loadBatterykm() {
    var batterykm = localStorage.getItem('batterykm');
    batterykm = batterykm || '';
    return batterykm;
  },
  saveBatteryM: function saveBatteryM(m) {
    localStorage.setItem('batteryM', m);
  },
  loadBatteryM: function loadBatteryM() {
    var batteryM = localStorage.getItem('batteryM');
    batteryM = batteryM || '';
    return batteryM;
  },
  saveOilProblem: function saveOilProblem(pText) {
    localStorage.setItem('oilProblem', pText);
  },
  loadOilProblem: function loadOilProblem() {
    var Probelm = localStorage.getItem('oilProblem');
    Probelm = Probelm || '';
    return Probelm;
  },
  saveBatteryProblem: function saveBatteryProblem(pText) {
    localStorage.setItem('batteryProblem', pText);
  },
  loadBatteryProblem: function loadBatteryProblem() {
    var Probelm = localStorage.getItem('batteryProblem');
    Probelm = Probelm || '';
    return Probelm;
  },
  saveWaterProblem: function saveWaterProblem(pText) {
    localStorage.setItem('waterProblem', pText);
  },
  loadWaterProblem: function loadWaterProblem() {
    var Probelm = localStorage.getItem('waterProblem');
    Probelm = Probelm || '';
    return Probelm;
  },
  saveOillevelApi: function saveOillevelApi(pText) {
    localStorage.setItem('oillevelApi', pText);
  },
  loadOillevelApi: function loadOillevelApi() {
    var oillevelApi = localStorage.getItem('oillevelApi');
    oillevelApi = oillevelApi || '';
    return oillevelApi;
  },
  saveOilPresApi: function saveOilPresApi(pText) {
    localStorage.setItem('oilPresApi', pText);
  },
  loadOilPresApi: function loadOilPresApi() {
    var oilPresApi = localStorage.getItem('oilPresApi');
    oilPresApi = oilPresApi || '';
    return oilPresApi;
  }
};

exports.storage = storage;

/***/ }),
/* 97 */,
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(99);


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _i18n = __webpack_require__(101);

var _i18n2 = _interopRequireDefault(_i18n);

var _App = __webpack_require__(104);

var _App2 = _interopRequireDefault(_App);

var _obigoJsUi = __webpack_require__(78);

var _obigoJsUi2 = _interopRequireDefault(_obigoJsUi);

var _router = __webpack_require__(175);

var _router2 = _interopRequireDefault(_router);

var _store = __webpack_require__(178);

var _store2 = _interopRequireDefault(_store);

var _vueJsToggleButton = __webpack_require__(182);

var _vueJsToggleButton2 = _interopRequireDefault(_vueJsToggleButton);

__webpack_require__(97);

__webpack_require__(183);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_obigoJsUi2.default);
_vue2.default.use(_router2.default);
_vue2.default.use(_vueJsToggleButton2.default);

new _vue2.default({
  el: '#app',
  router: _router2.default,
  i18n: _i18n2.default,
  store: _store2.default,
  render: function render(h) {
    return h(_App2.default);
  }
});

/***/ }),
/* 100 */,
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _vueI18n = __webpack_require__(102);

var _vueI18n2 = _interopRequireDefault(_vueI18n);

var _enUs = __webpack_require__(103);

var _enUs2 = _interopRequireDefault(_enUs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_vueI18n2.default);

var FALLBACK = 'en-us';
var currentLocale = window.applicationFramework ? window.applicationFramework.util.getLanguage() : FALLBACK;

function loadLocaleMessage(locale) {
  var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

  var url = './locales/' + locale + '.json';
  var fileReader = new XMLHttpRequest();
  fileReader.open('GET', url, true);
  fileReader.onload = function () {
    var message = JSON.parse(fileReader.responseText);
    i18n.setLocaleMessage(locale, message);
    i18n.locale = locale;
  };
  fileReader.onerror = function () {
    console.log('[obigo-js-ui] ' + locale + '.json is not exit');
    i18n.locale = FALLBACK;
  };
  fileReader.send(null);
}

var i18n = new _vueI18n2.default({
  locale: FALLBACK,
  fallbackLocale: FALLBACK,
  messages: {
    'en-us': _enUs2.default,
    'en': _enUs2.default
  }
});

loadLocaleMessage(currentLocale);

i18n.loadLocaleMessage = loadLocaleMessage;

exports.default = i18n;

/***/ }),
/* 102 */,
/* 103 */
/***/ (function(module, exports) {

module.exports = {"title":"title","hello":"hello Obigo","introduce":"This is {name}"}

/***/ }),
/* 104 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__ = __webpack_require__(59);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_7ba5bd90_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__ = __webpack_require__(132);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(105)
}
var normalizeComponent = __webpack_require__(11)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_7ba5bd90_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/App.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(1)
  hotAPI.install(__webpack_require__(2), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-7ba5bd90", Component.options)
  } else {
    hotAPI.reload("data-v-7ba5bd90", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(32);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(10)("2d47694f", content, false);
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(32, function() {
     var newContent = __webpack_require__(32);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 106 */,
/* 107 */,
/* 108 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_footer_vue__ = __webpack_require__(60);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_footer_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_footer_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_footer_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_footer_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_1720843d_hasScoped_false_buble_transforms_vue_loader_lib_selector_type_template_index_0_footer_vue__ = __webpack_require__(131);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(109)
}
var normalizeComponent = __webpack_require__(11)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_footer_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_1720843d_hasScoped_false_buble_transforms_vue_loader_lib_selector_type_template_index_0_footer_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "node_modules/obigo-js-ui-rnbs/components/footer/footer.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(1)
  hotAPI.install(__webpack_require__(2), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1720843d", Component.options)
  } else {
    hotAPI.reload("data-v-1720843d", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(33);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(10)("60f5b43d", content, false);
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(33, function() {
     var newContent = __webpack_require__(33);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_button_vue__ = __webpack_require__(74);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_button_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_button_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_button_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_button_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_5b906746_hasScoped_false_buble_transforms_vue_loader_lib_selector_type_template_index_0_button_vue__ = __webpack_require__(121);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(120)
}
var normalizeComponent = __webpack_require__(11)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_button_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_5b906746_hasScoped_false_buble_transforms_vue_loader_lib_selector_type_template_index_0_button_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "node_modules/obigo-js-ui-rnbs/components/button/button.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(1)
  hotAPI.install(__webpack_require__(2), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5b906746", Component.options)
  } else {
    hotAPI.reload("data-v-5b906746", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(44);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(10)("975e55e0", content, false);
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(44, function() {
     var newContent = __webpack_require__(44);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 121 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "button",
    {
      ref: "btn",
      staticClass: "obg-button",
      class: [
        "obg-button-" + _vm.type,
        "obg-button-" + _vm.size,
        {
          "is-disabled": _vm.disabled,
          "is-icon": _vm.icon || _vm.$slots.icon,
          "icon-only": _vm.iconOnly
        }
      ],
      attrs: { disabled: _vm.disabled },
      on: {
        click: function($event) {
          $event.stopPropagation()
          return _vm.handleClick($event)
        },
        mousedown: _vm.start,
        mouseup: _vm.end,
        mouseleave: _vm.end,
        touchstart: _vm.start,
        touchend: _vm.end,
        touchcancel: _vm.end,
        touchleave: _vm.end
      }
    },
    [
      _vm.icon || _vm.$slots.icon
        ? _c(
            "span",
            { staticClass: "obg-button-icon" },
            [
              _vm._t("icon", [
                _vm.icon ? _c("i", { class: "obg-icon-" + _vm.icon }) : _vm._e()
              ])
            ],
            2
          )
        : _vm._e(),
      _vm._v(" "),
      _c("label", { staticClass: "obg-button-text" }, [_vm._t("default")], 2)
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(1)      .rerender("data-v-5b906746", esExports)
  }
}

/***/ }),
/* 122 */,
/* 123 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_context_menu_vue__ = __webpack_require__(76);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_context_menu_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_context_menu_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_context_menu_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_context_menu_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_88d6d906_hasScoped_true_buble_transforms_vue_loader_lib_selector_type_template_index_0_context_menu_vue__ = __webpack_require__(130);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(124)
}
var normalizeComponent = __webpack_require__(11)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-88d6d906"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_context_menu_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_88d6d906_hasScoped_true_buble_transforms_vue_loader_lib_selector_type_template_index_0_context_menu_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "node_modules/obigo-js-ui-rnbs/components/context-menu/context-menu.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(1)
  hotAPI.install(__webpack_require__(2), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-88d6d906", Component.options)
  } else {
    hotAPI.reload("data-v-88d6d906", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(45);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(10)("f272f12c", content, false);
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(45, function() {
     var newContent = __webpack_require__(45);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 125 */,
/* 126 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_popover_vue__ = __webpack_require__(77);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_popover_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_popover_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_popover_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_popover_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_ea9ccd2e_hasScoped_true_buble_transforms_vue_loader_lib_selector_type_template_index_0_popover_vue__ = __webpack_require__(129);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(127)
}
var normalizeComponent = __webpack_require__(11)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-ea9ccd2e"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_popover_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_ea9ccd2e_hasScoped_true_buble_transforms_vue_loader_lib_selector_type_template_index_0_popover_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "node_modules/obigo-js-ui-rnbs/components/popover/popover.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(1)
  hotAPI.install(__webpack_require__(2), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-ea9ccd2e", Component.options)
  } else {
    hotAPI.reload("data-v-ea9ccd2e", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(46);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(10)("0439503b", content, false);
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(46, function() {
     var newContent = __webpack_require__(46);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 128 */,
/* 129 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "obg-popover animate-scale",
      style: _vm.transformCSS,
      on: {
        click: function($event) {
          $event.stopPropagation()
        }
      }
    },
    [_vm._t("default")],
    2
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(1)      .rerender("data-v-ea9ccd2e", esExports)
  }
}

/***/ }),
/* 130 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "obg-button",
    {
      ref: "origin",
      staticClass: "anchor",
      attrs: { icon: _vm.icon, type: _vm.btnType }
    },
    [
      _vm._t("icon"),
      _vm._v(" "),
      _vm._t("default"),
      _vm._v(" "),
      _c(
        "obg-popover",
        {
          ref: "popover",
          staticClass: "context-menu",
          style: { height: _vm.contextMenuHeight + "px" },
          attrs: { anchor: _vm.anchor, self: _vm.self, offset: _vm.offset },
          on: { open: _vm.showDimScreen, close: _vm.hideDimScreen }
        },
        _vm._l(_vm.options, function(item, index) {
          return _c("div", { staticClass: "menu-item-wrapper" }, [
            _c(
              "div",
              {
                directives: [
                  {
                    name: "obg-focus",
                    rawName: "v-obg-focus",
                    value: { scene: _vm.scene, order: index },
                    expression: "{scene: scene, order: index}"
                  }
                ],
                key: index,
                class: ["menu-item", { disabled: item.disabled }],
                attrs: { name: item.name },
                on: {
                  click: function($event) {
                    $event.stopPropagation()
                    return _vm.onItemClick($event)
                  },
                  "jog-click": _vm.onJogClick,
                  mousedown: _vm.start,
                  mouseup: _vm.end,
                  mouseleave: _vm.end,
                  touchstart: _vm.start,
                  touchend: _vm.end,
                  touchcancel: _vm.end,
                  touchleave: _vm.end
                }
              },
              [
                _c("span", { staticClass: "item-content" }, [
                  _vm._v("\n          " + _vm._s(item.label) + "\n        ")
                ])
              ]
            )
          ])
        }),
        0
      ),
      _vm._v(" "),
      _c("div", {
        ref: "dim",
        staticClass: "dim-context-menu",
        on: { click: _vm.onClickDim }
      }),
      _vm._v(" "),
      _c(
        "button",
        {
          directives: [
            {
              name: "obg-focus",
              rawName: "v-obg-focus",
              value: {
                scene: _vm.scene,
                order: _vm.options.length === 0 ? -1 : _vm.options.length
              },
              expression:
                "{scene: scene, order: (options.length === 0) ? -1 : options.length}"
            }
          ],
          ref: "closeButton",
          staticClass: "close-button-context-menu animate-scale",
          on: {
            mousedown: _vm.start,
            mouseup: _vm.end,
            mouseleave: _vm.end,
            touchstart: _vm.start,
            touchend: _vm.end,
            touchcancel: _vm.end,
            touchleave: _vm.end
          }
        },
        [_c("i", { staticClass: "obg-icon-close" })]
      )
    ],
    2
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(1)      .rerender("data-v-88d6d906", esExports)
  }
}

/***/ }),
/* 131 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "obg-footer",
      class: _vm.wheelPosition,
      style: { "-webkit-transform": _vm.hideAnimation }
    },
    [
      _c("div", {
        directives: [
          {
            name: "show",
            rawName: "v-show",
            value: _vm.mask,
            expression: "mask"
          }
        ],
        staticClass: "obg-footer-mask"
      }),
      _vm._v(" "),
      _c("obg-button", {
        ref: "back",
        staticClass: "footer-button back",
        attrs: {
          type: "footer",
          icon: "back",
          disabled:
            this.disable == "left" || this.disable == "both" ? true : false
        },
        on: { click: _vm.onClickBack }
      }),
      _vm._v(" "),
      _c("div", { staticClass: "zone-3" }, [_vm._t("default")], 2),
      _vm._v(" "),
      _c("obg-context-menu", {
        ref: "contextMenu",
        staticClass: "footer-button context",
        attrs: {
          btnType: "footer",
          icon: _vm.rightIcon,
          disabled:
            this.disable == "right" || this.disable == "both" ? true : false,
          options: _vm.options,
          self: _vm.self,
          scene: _vm.contextMenuScene,
          offset: _vm.offset
        },
        on: {
          input: _vm.onInput,
          open: _vm.onOpen,
          close: _vm.onClose,
          click: _vm.onClickContextMenu,
          "jog-click": _vm.onJogClick
        }
      })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(1)      .rerender("data-v-1720843d", esExports)
  }
}

/***/ }),
/* 132 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { attrs: { id: "app" } },
    [
      _c("router-view"),
      _vm._v(" "),
      _c("obg-footer", {
        attrs: { mask: false, disable: "right" },
        on: { back: _vm.onBack, more: _vm.onMore }
      })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(1)      .rerender("data-v-7ba5bd90", esExports)
  }
}

/***/ }),
/* 133 */,
/* 134 */,
/* 135 */,
/* 136 */,
/* 137 */,
/* 138 */,
/* 139 */,
/* 140 */,
/* 141 */,
/* 142 */,
/* 143 */,
/* 144 */,
/* 145 */,
/* 146 */,
/* 147 */,
/* 148 */,
/* 149 */,
/* 150 */,
/* 151 */,
/* 152 */,
/* 153 */,
/* 154 */,
/* 155 */,
/* 156 */,
/* 157 */,
/* 158 */,
/* 159 */,
/* 160 */,
/* 161 */,
/* 162 */,
/* 163 */,
/* 164 */,
/* 165 */,
/* 166 */,
/* 167 */,
/* 168 */,
/* 169 */,
/* 170 */,
/* 171 */,
/* 172 */,
/* 173 */,
/* 174 */,
/* 175 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _vueRouter = __webpack_require__(176);

var _vueRouter2 = _interopRequireDefault(_vueRouter);

var _obigoJsUi = __webpack_require__(78);

var _routes = __webpack_require__(177);

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_vueRouter2.default);

var router = (0, _obigoJsUi.ObigoRouter)(new _vueRouter2.default({
  mode: 'abstract',
  routes: _routes2.default
}));
router.push('/');

exports.default = router;

/***/ }),
/* 176 */,
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var routes = [{
  path: '/', component: function component() {
    return __webpack_require__.e/* import() */(17).then(__webpack_require__.bind(null, 219));
  }, name: 'airconditioner'
}, { path: '/management', component: function component() {
    return __webpack_require__.e/* import() */(6).then(__webpack_require__.bind(null, 220));
  }, name: 'management'
}, { path: '/managepopup', component: function component() {
    return __webpack_require__.e/* import() */(5).then(__webpack_require__.bind(null, 217));
  }, name: 'managepopup'
}, { path: '/battery', component: function component() {
    return __webpack_require__.e/* import() */(16).then(__webpack_require__.bind(null, 221));
  }, name: 'battery'
}, { path: '/tire', component: function component() {
    return __webpack_require__.e/* import() */(18).then(__webpack_require__.bind(null, 222));
  }, name: 'tire'
}, { path: '/water', component: function component() {
    return __webpack_require__.e/* import() */(0).then(__webpack_require__.bind(null, 223));
  }, name: 'water'
}, { path: '/rightFrontTire', component: function component() {
    return __webpack_require__.e/* import() */(2).then(__webpack_require__.bind(null, 224));
  }, name: 'rightFrontTire'
}, { path: '/rightRearTire', component: function component() {
    return __webpack_require__.e/* import() */(1).then(__webpack_require__.bind(null, 225));
  }, name: 'rightRearTire'
}, { path: '/leftFrontTire', component: function component() {
    return __webpack_require__.e/* import() */(14).then(__webpack_require__.bind(null, 226));
  }, name: 'leftFrontTire'
}, { path: '/leftRearTire', component: function component() {
    return __webpack_require__.e/* import() */(13).then(__webpack_require__.bind(null, 227));
  }, name: 'leftRearTire'
}, { path: '/managePopupRF', component: function component() {
    return __webpack_require__.e/* import() */(9).then(__webpack_require__.bind(null, 228));
  }, name: 'managePopupRF'
}, { path: '/managePopupRR', component: function component() {
    return __webpack_require__.e/* import() */(8).then(__webpack_require__.bind(null, 229));
  }, name: 'managePopupRR'
}, { path: '/managePopupLF', component: function component() {
    return __webpack_require__.e/* import() */(11).then(__webpack_require__.bind(null, 230));
  }, name: 'managePopupLF'
}, { path: '/managePopupLR', component: function component() {
    return __webpack_require__.e/* import() */(10).then(__webpack_require__.bind(null, 231));
  }, name: 'managePopupLR'
}, { path: '/cabinAirFilter', component: function component() {
    return __webpack_require__.e/* import() */(15).then(__webpack_require__.bind(null, 232));
  }, name: 'cabinAirFilter'
}, { path: '/managePopupCF', component: function component() {
    return __webpack_require__.e/* import() */(12).then(__webpack_require__.bind(null, 233));
  }, name: 'managePopupCF'
}, { path: '/alarmRF', component: function component() {
    return __webpack_require__.e/* import() */(21).then(__webpack_require__.bind(null, 234));
  }, name: 'alarmRF'
}, { path: '/alarmCFilter', component: function component() {
    return __webpack_require__.e/* import() */(25).then(__webpack_require__.bind(null, 235));
  }, name: 'alarmCFilter'
}, { path: '/alarmRR', component: function component() {
    return __webpack_require__.e/* import() */(20).then(__webpack_require__.bind(null, 236));
  }, name: 'alarmRR'
}, { path: '/managepopupBattery', component: function component() {
    return __webpack_require__.e/* import() */(4).then(__webpack_require__.bind(null, 237));
  }, name: 'managepopupBattery'
}, { path: '/managepopupOil', component: function component() {
    return __webpack_require__.e/* import() */(3).then(__webpack_require__.bind(null, 238));
  }, name: 'managepopupOil'
}, { path: '/managePopupWater', component: function component() {
    return __webpack_require__.e/* import() */(7).then(__webpack_require__.bind(null, 218));
  }, name: 'managePopupWater'
}, { path: '/alarmEngineOil', component: function component() {
    return __webpack_require__.e/* import() */(24).then(__webpack_require__.bind(null, 239));
  }, name: 'alarmEngineOil'
}, { path: '/alarmBattery', component: function component() {
    return __webpack_require__.e/* import() */(26).then(__webpack_require__.bind(null, 240));
  }, name: 'alarmBattery'
}, { path: '/alarmLF', component: function component() {
    return __webpack_require__.e/* import() */(23).then(__webpack_require__.bind(null, 241));
  }, name: 'alarmLF'
}, { path: '/alarmLR', component: function component() {
    return __webpack_require__.e/* import() */(22).then(__webpack_require__.bind(null, 242));
  }, name: 'alarmLR'
}, { path: '/alarmWater', component: function component() {
    return __webpack_require__.e/* import() */(19).then(__webpack_require__.bind(null, 243));
  }, name: 'alarmWater' }];

exports.default = routes;

/***/ }),
/* 178 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

var _vuex = __webpack_require__(179);

var _vuex2 = _interopRequireDefault(_vuex);

var _logger = __webpack_require__(180);

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_vuex2.default);

var debug = "development" !== 'production';

var store = new _vuex2.default.Store({
  state: {
    alarmRFValue: 0
  },
  mutations: {
    changeAlarmRFValue: function changeAlarmRFValue(state, value) {
      state.value = value;
    }
  },
  strict: debug,
  plugins: debug ? [(0, _logger2.default)()] : []
});

_vue2.default.use(store);

exports.default = store;

/***/ }),
/* 179 */,
/* 180 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createLogger;

var _utils = __webpack_require__(181);

function createLogger() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$collapsed = _ref.collapsed,
      collapsed = _ref$collapsed === undefined ? true : _ref$collapsed,
      _ref$transformer = _ref.transformer,
      transformer = _ref$transformer === undefined ? function (state) {
    return state;
  } : _ref$transformer,
      _ref$mutationTransfor = _ref.mutationTransformer,
      mutationTransformer = _ref$mutationTransfor === undefined ? function (mut) {
    return mut;
  } : _ref$mutationTransfor;

  return function (store) {
    var prevState = (0, _utils.deepCopy)(store.state);
    store.subscribe(function (mutation, state) {
      if (typeof console === 'undefined') {
        return;
      }
      var nextState = (0, _utils.deepCopy)(state);
      var time = new Date();
      var formattedTime = ' @ ' + pad(time.getHours(), 2) + ':' + pad(time.getMinutes(), 2) + ':' + pad(time.getSeconds(), 2) + '.' + pad(time.getMilliseconds(), 3);
      var formattedMutation = mutationTransformer(mutation);
      var message = 'mutation ' + mutation.type + formattedTime;
      var startMessage = collapsed ? console.groupCollapsed : console.group;

      try {
        startMessage.call(console, message);
      } catch (e) {
        console.log(message);
      }

      console.log('%c prev state', 'color: #9E9E9E; font-weight: bold', transformer(prevState));
      console.log('%c mutation', 'color: #03A9F4; font-weight: bold', formattedMutation);
      console.log('%c next state', 'color: #4CAF50; font-weight: bold', transformer(nextState));

      try {
        console.groupEnd();
      } catch (e) {
        console.log('—— log end ——');
      }
      prevState = nextState;
    });
  };
}

function repeat(str, times) {
  return new Array(times + 1).join(str);
}

function pad(num, maxLength) {
  return repeat('0', maxLength - num.toString().length) + num;
}

/***/ }),
/* 181 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = __webpack_require__(51);

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = __webpack_require__(52);

var _typeof3 = _interopRequireDefault(_typeof2);

exports.deepCopy = deepCopy;
exports.forEachValue = forEachValue;
exports.isObject = isObject;
exports.isPromise = isPromise;
exports.assert = assert;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function find(list, f) {
  return list.filter(f)[0];
}

function deepCopy(obj) {
  var cache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  if (obj === null || (typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) !== 'object') {
    return obj;
  }

  var hit = find(cache, function (c) {
    return c.original === obj;
  });
  if (hit) {
    return hit.copy;
  }

  var copy = Array.isArray(obj) ? [] : {};

  cache.push({
    original: obj,
    copy: copy
  });

  (0, _keys2.default)(obj).forEach(function (key) {
    copy[key] = deepCopy(obj[key], cache);
  });

  return copy;
}

function forEachValue(obj, fn) {
  (0, _keys2.default)(obj).forEach(function (key) {
    return fn(obj[key], key);
  });
}

function isObject(obj) {
  return obj !== null && (typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) === 'object';
}

function isPromise(val) {
  return val && typeof val.then === 'function';
}

function assert(condition, msg) {
  if (!condition) throw new Error('[vuex] ' + msg);
}

/***/ }),
/* 182 */,
/* 183 */,
/* 184 */,
/* 185 */,
/* 186 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_popup_vue__ = __webpack_require__(88);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_popup_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_popup_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_popup_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_popup_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_6caaadb7_hasScoped_true_buble_transforms_vue_loader_lib_selector_type_template_index_0_popup_vue__ = __webpack_require__(188);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(187)
}
var normalizeComponent = __webpack_require__(11)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-6caaadb7"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_popup_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_6caaadb7_hasScoped_true_buble_transforms_vue_loader_lib_selector_type_template_index_0_popup_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "node_modules/obigo-js-ui-rnbs/components/popup/popup.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(1)
  hotAPI.install(__webpack_require__(2), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6caaadb7", Component.options)
  } else {
    hotAPI.reload("data-v-6caaadb7", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 187 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(55);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(10)("7ff64429", content, false);
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(55, function() {
     var newContent = __webpack_require__(55);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 188 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "overlay",
      on: {
        click: function($event) {
          $event.stopPropagation()
          return _vm.clickOverlay($event)
        }
      }
    },
    [
      _c(
        "div",
        {
          ref: "popup",
          staticClass: "popup",
          class: _vm.subClass,
          on: {
            click: function($event) {
              $event.stopPropagation()
              return _vm.clickPopup($event)
            }
          }
        },
        [
          _vm.title
            ? _c("div", { staticClass: "title" }, [
                _c("div", { staticClass: "title-inner" }, [
                  _vm._v(_vm._s(_vm.title) + " ")
                ])
              ])
            : _vm._e(),
          _vm._v(" "),
          typeof _vm.content === "object"
            ? _c(
                "div",
                {
                  staticClass: "content-area",
                  attrs: { id: "component-content" }
                },
                [
                  _c("div", { staticClass: "content-inner" }, [
                    _vm._v(_vm._s(_vm.content))
                  ])
                ]
              )
            : _vm._e(),
          _vm._v(" "),
          typeof _vm.content === "string"
            ? _c(
                "div",
                { staticClass: "content-area", attrs: { id: "text-content" } },
                [
                  _c("div", { staticClass: "content-inner text" }, [
                    _vm._v(_vm._s(_vm.content))
                  ])
                ]
              )
            : _vm._e(),
          _vm._v(" "),
          _vm.buttons && _vm.buttons.length > 0
            ? _c(
                "div",
                { staticClass: "btn-area" },
                _vm._l(_vm.buttons, function(btn, index) {
                  return _c(
                    "button",
                    {
                      directives: [
                        {
                          name: "obg-focus",
                          rawName: "v-obg-focus",
                          value: {
                            scene: _vm.scene,
                            order: index,
                            isFocus: btn.isFocus
                          },
                          expression:
                            "{scene:scene, order: index, isFocus: btn.isFocus}"
                        }
                      ],
                      key: index,
                      style: _vm.getBtnWidth(),
                      attrs: { index: index },
                      on: {
                        click: function($event) {
                          $event.stopPropagation()
                          return _vm.onClickButton($event)
                        },
                        mousedown: _vm.down,
                        mouseup: _vm.up,
                        mouseleave: _vm.up,
                        touchstart: _vm.down,
                        touchend: _vm.up,
                        touchcancel: _vm.up
                      }
                    },
                    [
                      _vm._v(
                        "\n        " + _vm._s(btn.label) + "\n            "
                      )
                    ]
                  )
                }),
                0
              )
            : _vm._e()
        ]
      )
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(1)      .rerender("data-v-6caaadb7", esExports)
  }
}

/***/ }),
/* 189 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_progress_popup_vue__ = __webpack_require__(89);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_progress_popup_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_progress_popup_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_progress_popup_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_progress_popup_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_71c8e2de_hasScoped_true_buble_transforms_vue_loader_lib_selector_type_template_index_0_progress_popup_vue__ = __webpack_require__(191);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(190)
}
var normalizeComponent = __webpack_require__(11)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-71c8e2de"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_progress_popup_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_71c8e2de_hasScoped_true_buble_transforms_vue_loader_lib_selector_type_template_index_0_progress_popup_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "node_modules/obigo-js-ui-rnbs/components/popup/progress-popup.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(1)
  hotAPI.install(__webpack_require__(2), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-71c8e2de", Component.options)
  } else {
    hotAPI.reload("data-v-71c8e2de", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 190 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(56);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(10)("0d61728b", content, false);
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(56, function() {
     var newContent = __webpack_require__(56);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 191 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "overlay",
      on: {
        click: function($event) {
          $event.stopPropagation()
          return _vm.clickPopup($event)
        }
      }
    },
    [
      _c(
        "div",
        {
          staticClass: "popup",
          on: {
            click: function($event) {
              $event.stopPropagation()
              return _vm.clickPopup($event)
            }
          }
        },
        [
          _vm.title
            ? _c("div", { staticClass: "title" }, [
                _c("div", { staticClass: "title-inner" }, [
                  _vm._v(_vm._s(_vm.title) + " ")
                ])
              ])
            : _vm._e(),
          _vm._v(" "),
          _c("div", { staticClass: "pop-contents" }, [
            _c("div", { staticClass: "content" }, [
              _c("div", { staticClass: "text-content" }, [
                _vm._v(_vm._s(_vm.content))
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "progress-area" }, [
                _c("div", { staticClass: "progress-bar" }, [
                  _c("div", { staticClass: "bar-outline" }, [
                    _c("div", {
                      staticClass: "bar-gauge",
                      style: { width: _vm.barWidth + "%" }
                    })
                  ])
                ]),
                _vm._v(" "),
                _c("div", { staticClass: "progress-text" }, [
                  _vm._v(
                    "\n              " +
                      _vm._s(_vm.barWidth) +
                      "%\n            "
                  )
                ])
              ])
            ])
          ]),
          _vm._v(" "),
          _vm.buttons && _vm.buttons.length != 0
            ? _c(
                "div",
                { staticClass: "btn-area" },
                _vm._l(_vm.buttons, function(btn, index) {
                  return _c(
                    "button",
                    {
                      directives: [
                        {
                          name: "obg-focus",
                          rawName: "v-obg-focus",
                          value: {
                            scene: _vm.scene,
                            order: index,
                            isFocus: btn.isFocus
                          },
                          expression:
                            "{scene:scene, order:index, isFocus: btn.isFocus}"
                        }
                      ],
                      key: index,
                      style: _vm.getBtnWidth(),
                      attrs: { index: index },
                      on: {
                        click: [
                          btn.onClick,
                          function($event) {
                            $event.stopPropagation()
                            return _vm.onClickButton($event)
                          }
                        ],
                        mousedown: _vm.down,
                        mouseup: _vm.up,
                        mouseleave: _vm.up,
                        touchstart: _vm.down,
                        touchend: _vm.up,
                        touchcancel: _vm.up
                      }
                    },
                    [_vm._v("\n        " + _vm._s(btn.label) + "\n      ")]
                  )
                }),
                0
              )
            : _vm._e()
        ]
      )
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(1)      .rerender("data-v-71c8e2de", esExports)
  }
}

/***/ }),
/* 192 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_loading_popup_vue__ = __webpack_require__(90);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_loading_popup_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_loading_popup_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_loading_popup_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_loading_popup_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_2d56f366_hasScoped_true_buble_transforms_vue_loader_lib_selector_type_template_index_0_loading_popup_vue__ = __webpack_require__(198);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(193)
}
var normalizeComponent = __webpack_require__(11)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-2d56f366"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_loading_popup_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_2d56f366_hasScoped_true_buble_transforms_vue_loader_lib_selector_type_template_index_0_loading_popup_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "node_modules/obigo-js-ui-rnbs/components/popup/loading-popup.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(1)
  hotAPI.install(__webpack_require__(2), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2d56f366", Component.options)
  } else {
    hotAPI.reload("data-v-2d56f366", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 193 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(57);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(10)("3f5bd542", content, false);
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(57, function() {
     var newContent = __webpack_require__(57);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 194 */,
/* 195 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_spinner_vue__ = __webpack_require__(91);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_spinner_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_spinner_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_spinner_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_spinner_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_6935d851_hasScoped_false_buble_transforms_vue_loader_lib_selector_type_template_index_0_spinner_vue__ = __webpack_require__(197);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(196)
}
var normalizeComponent = __webpack_require__(11)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_vue_loader_lib_selector_type_script_index_0_spinner_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__vue_loader_lib_template_compiler_index_id_data_v_6935d851_hasScoped_false_buble_transforms_vue_loader_lib_selector_type_template_index_0_spinner_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "node_modules/obigo-js-ui-rnbs/components/spinner/spinner.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(1)
  hotAPI.install(__webpack_require__(2), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6935d851", Component.options)
  } else {
    hotAPI.reload("data-v-6935d851", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 196 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(58);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(10)("44dabc72", content, false);
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(58, function() {
     var newContent = __webpack_require__(58);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 197 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "obg-spinner",
      class: [
        {
          "is-overlay": _vm.overlay
        }
      ],
      on: { click: _vm.onClick }
    },
    [
      _c("div", { staticClass: "img-spinner" }),
      _vm._v(" "),
      _c("p", [_vm._t("default")], 2)
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(1)      .rerender("data-v-6935d851", esExports)
  }
}

/***/ }),
/* 198 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "overlay",
      on: {
        click: function($event) {
          $event.stopPropagation()
          return _vm.clickOverlay($event)
        }
      }
    },
    [
      _c(
        "div",
        {
          directives: [
            {
              name: "obg-focus",
              rawName: "v-obg-focus",
              value: { scene: _vm.scene, order: 0 },
              expression: "{scene:scene, order:0}"
            }
          ],
          staticClass: "popup loading",
          on: {
            click: function($event) {
              $event.stopPropagation()
            }
          }
        },
        [
          _c(
            "div",
            { staticClass: "pop-contents" },
            [
              _c("obg-spinner", { attrs: { overlay: false } }),
              _vm._v(" "),
              _c("h2", { staticClass: "title" }, [
                _vm._v("\n        " + _vm._s(_vm.title) + "\n      ")
              ])
            ],
            1
          )
        ]
      )
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(1)      .rerender("data-v-2d56f366", esExports)
  }
}

/***/ })
]),[98]);