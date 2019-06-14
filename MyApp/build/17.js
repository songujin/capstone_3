webpackJsonp([17],{

/***/ 219:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_airconditioner_vue__ = __webpack_require__(279);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_airconditioner_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_airconditioner_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_airconditioner_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_airconditioner_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3955368e_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_airconditioner_vue__ = __webpack_require__(306);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(304)
}
var normalizeComponent = __webpack_require__(11)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-3955368e"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_airconditioner_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3955368e_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_airconditioner_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/components/airconditioner.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(1)
  hotAPI.install(__webpack_require__(2), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3955368e", Component.options)
  } else {
    hotAPI.reload("data-v-3955368e", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ 250:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)();
// imports


// module
exports.push([module.i, "\n.contents[data-v-3955368e] {\n  padding: 20px;\n  color: white;\n}\ndiv.sensor[data-v-3955368e] {\n  height: 20%;\n  padding-left: 10px;\n  border: 1px solid white;\n}\ndiv.sensor p[data-v-3955368e] {\n  font-size: 20px;\n}\ndiv.dust[data-v-3955368e],\ndiv.fineDust[data-v-3955368e],\ndiv.co2[data-v-3955368e] {\n  margin-top: 5px;\n  float: left;\n  height: 65px;\n  width: 30%;\n  border: 1px solid white;\n}\ndiv.measure[data-v-3955368e] {\n  float: left;\n  width: 100%;\n  height: 70%;\n  border: 1px solid white;\n}\ndiv.screentrans[data-v-3955368e] {\n  margin-top: 5px;\n  float: left;\n  height: 65px;\n  width: 10%;\n}\ndiv.screentrans button[data-v-3955368e] {\n  width: 65px;\n  height: 65px;\n  color: black;\n  background-color: white;\n}\ndiv.ventilation[data-v-3955368e] {\n  height: 65%;\n  border: 1px solid white;\n}\ndiv.switch[data-v-3955368e] {\n  margin-top: 10px;\n  margin-left: 5px;\n  float: left;\n  height: 40px;\n  width: 150px;\n  border: 1px solid white;\n}\ndiv.desc[data-v-3955368e] {\n  margin-top: 10px;\n  float: left;\n  height: 40px;\n  width: 600px;\n  border: 1px solid white;\n}\ndiv.carImg[data-v-3955368e] {\n  margin: 10px 10px 5px 10px;\n  float: left;\n  height: 180px;\n  width: 740px;\n  border: 1px solid white;\n}\n.vue-js-switch#changed-font[data-v-3955368e] {\n  font-size: 16px !important;\n}", ""]);

// exports


/***/ }),

/***/ 279:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _page = __webpack_require__(305);

var _page2 = _interopRequireDefault(_page);

var _manageLibs = __webpack_require__(96);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: 'home',
  mixins: [_page2.default],
  components: {},
  props: {},
  data: function data() {
    return {
      count: 0,
      dustValue: 100,
      dustLevel: '',
      fineDustValue: 15,
      fineDustLevel: '',
      co2Value: 1234,
      co2Level: '',
      toggled: false
    };
  },
  created: function created() {
    this.count = _manageLibs.storage.loadFirst();
  },

  methods: {
    go: function go() {
      if (this.isFirst()) {
        this.$router.push('/managepopup');
      } else {
        this.$router.push('/management');
      }
    },
    isFirst: function isFirst() {
      if (this.count === '0') {
        return true;
      }
    }
  },
  mounted: function mounted() {
    console.log(this.dustValue);
    console.log(this.dustLevel);
    if (this.dustValue >= 0 && this.dustValue <= 30) {
      this.dustLevel = '좋음';
    } else if (this.dustValue >= 31 && this.dustValue <= 80) {
      this.dustLevel = '보통';
    } else if (this.dustValue >= 81 && this.dustValue <= 150) {
      this.dustLevel = '나쁨';
    } else if (this.dustValue >= 151) {
      this.dustLevel = '매우 나쁨';
    }

    if (this.fineDustValue >= 0 && this.fineDustValue <= 15) {
      this.fineDustLevel = '좋음';
    } else if (this.fineDustValue >= 16 && this.fineDustValue <= 35) {
      this.fineDustLevel = '보통';
    } else if (this.fineDustValue >= 36 && this.fineDustValue <= 75) {
      this.fineDustLevel = '나쁨';
    } else if (this.fineDustValue >= 76) {
      this.fineDustLevel = '매우 나쁨';
    }

    if (this.co2Value >= 0 && this.co2Value <= 450) {
      this.co2Level = '좋음';
    } else if (this.co2Value >= 451 && this.co2Value <= 1500) {
      this.co2Level = '보통';
    } else if (this.co2Value >= 1501 && this.Sco2Value <= 4000) {
      this.co2Level = '나쁨';
    } else if (this.co2Value >= 4001) {
      this.co2Level = '매우 나쁨';
    }
    console.log(this.toggle.$event.value);
  },

  updated: function updated() {
    console.log(this.toggled);
  },
  computed: {
    co2Bg: function co2Bg(co2LevelBg) {
      return {};
    }
  }
};

/***/ }),

/***/ 304:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(250);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(10)("e2d20e88", content, false);
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(250, function() {
     var newContent = __webpack_require__(250);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 305:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var pageMixin = {
  methods: {
    setTitle: function setTitle(title) {
      if (typeof title === 'string') {
        this._title = title;
      } else if (this._title === this._appName) {
        var wd = this._application.getDescriptor();
        var lang = this._util.getLanguage();
        var name = wd.getWidgetName(lang);
        if (name) {
          this._title = name;
          this._appName = name;
        } else {
          this._title = '(No title)';
        }
      }
      try {
        var transTitle = this.$t ? this.$t(this._title) : this._title;
        this._application.setStatusBarTitle(transTitle);
      } catch (e) {
        console.log(e.message);
      }
    }
  },
  mounted: function mounted() {
    if (window.applicationFramework) {
      this._application = window.applicationFramework.applicationManager.getOwnerApplication(window.document);
      this._util = window.applicationFramework.util;
      this._application.addEventListener('ApplicationShown', this.setTitle, false);
      this._title = '';
      var wd = this._application.getDescriptor();
      var lang = this._util.getLanguage();

      var name = wd.getWidgetName(lang);
      if (name) {
        this._title = name;
        this._appName = name;
      } else {
        this._title = '(No title)';
      }
    }

    if (this.$focus._componentFocusMode && this.autoFocus) {
      var lastPos = this.$focus.loadLastFocusPosition(this.scene);

      this.$focus.setScene(this.scene);

      if (lastPos && lastPos.zone === 3) {
        this.$focus._currentZone = 3;
        this.$focus._currentOrder = lastPos.order;
        this.$focus._setZoneFocusOn(3);
        this.$focus._setComponentFocusOn();
      } else {
        this.$focus.startFocusMode();
      }
    }
  },
  activated: function activated() {
    if (this.$focus._componentFocusMode && this.autoFocus) {
      var lastPos = this.$focus.loadLastFocusPosition(this.scene);

      this.$focus.setScene(this.scene);

      if (lastPos && lastPos.zone === 3) {
        this.$focus._currentZone = 3;
        this.$focus._currentOrder = lastPos.order;
        this.$focus._setZoneFocusOn(3);
        this.$focus._setComponentFocusOn();
      } else {
        this.$focus.startFocusMode();
      }
    }
  },
  beforeDestroy: function beforeDestroy() {
    if (window.applicationFramework) {
      this._application.removeEventListener('ApplicationShown', this.setTitle, false);
    }

    this.$focus.storeLastFocusPosition(this.scene, this.$focus.getCurrentPosition());
  },
  deactivated: function deactivated() {
    this.$focus.storeLastFocusPosition(this.scene, this.$focus.getCurrentPosition());
  },
  data: function data() {
    return {
      scene: 0,
      _lastFocusOrder: -1,
      autoFocus: true
    };
  },

  watch: {
    scene: function scene(newScene, oldScene) {
      this.$focus.setScene(newScene);
    }
  }
};
exports.default = pageMixin;

/***/ }),

/***/ 306:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c("div", { staticClass: "contents" }, [
      _c("div", { staticClass: "sensor" }, [
        _c("div", { staticClass: "dust" }, [
          _c("p", [_vm._v("미세먼지")]),
          _vm._v(" "),
          _c("div", { staticClass: "measure" }, [
            _c("div", { staticClass: "value" }, [
              _c("p", [_vm._v(_vm._s(_vm.dustValue) + "㎍/㎥")])
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "standard" }, [
              _c("p", [_vm._v(_vm._s(_vm.dustLevel))])
            ])
          ])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "fineDust" }, [
          _c("p", [_vm._v("초미세먼지")]),
          _vm._v(" "),
          _c("div", { staticClass: "measure" }, [
            _c("div", { staticClass: "value" }, [
              _c("p", [_vm._v(_vm._s(_vm.fineDustValue) + "㎍/㎥")])
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "standard" }, [
              _c("p", [_vm._v(_vm._s(_vm.fineDustLevel))])
            ])
          ])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "co2" }, [
          _c("p", [_vm._v("이산화탄소")]),
          _vm._v(" "),
          _c("div", { staticClass: "measure" }, [
            _c("div", { staticClass: "value" }, [
              _c("p", [_vm._v(_vm._s(_vm.co2Value) + "ppm")])
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "standard" }, [
              _c("p", { style: _vm.co2Bg }, [_vm._v(_vm._s(_vm.co2Level))])
            ])
          ])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "screentrans" }, [
          _c(
            "p",
            {
              on: {
                click: function($event) {
                  return _vm.go()
                }
              }
            },
            [_vm._v("GO")]
          )
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "ventilation" }, [
        _c("div", { staticClass: "top" }, [
          _c(
            "div",
            { staticClass: "switch" },
            [
              _c("toggle-button", {
                attrs: {
                  id: "changed-font",
                  labels: { checked: "ON", unchecked: "OFF" },
                  color: { checked: "#7DCE94" },
                  width: 148,
                  height: 37
                },
                on: {
                  change: function($event) {
                    _vm.toggled = $event.value
                  }
                }
              })
            ],
            1
          ),
          _vm._v(" "),
          _c("div", { staticClass: "desc" })
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "carImg" })
      ])
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(1)      .rerender("data-v-3955368e", esExports)
  }
}

/***/ })

});