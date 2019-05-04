webpackJsonp([6],{

/***/ 220:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_management_vue__ = __webpack_require__(280);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_management_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_management_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_management_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_management_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_4d12265a_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_management_vue__ = __webpack_require__(308);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(307)
}
var normalizeComponent = __webpack_require__(11)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-4d12265a"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_management_vue___default.a,
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_4d12265a_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_management_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/components/management.vue"

/* hot reload */
if (true) {(function () {
  var hotAPI = __webpack_require__(1)
  hotAPI.install(__webpack_require__(2), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4d12265a", Component.options)
  } else {
    hotAPI.reload("data-v-4d12265a", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),

/***/ 245:
/***/ (function(module, exports, __webpack_require__) {

/*!
 * vue-simple-progress v1.1.0 (https://github.com/dzwillia/vue-simple-progress)
 * (c) 2018 David Z. Williams
 * Released under the MIT License.
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["VueSimpleProgress"] = factory();
	else
		root["VueSimpleProgress"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VueSimpleProgress = undefined;

var _Progress = __webpack_require__(1);

var _Progress2 = _interopRequireDefault(_Progress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (typeof window !== 'undefined' && window.Vue) {
  Vue.component('vue-simple-progress', _Progress2.default);
}

exports.VueSimpleProgress = _Progress2.default;
exports.default = _Progress2.default;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(2)(
  /* script */
  __webpack_require__(3),
  /* template */
  __webpack_require__(4),
  /* scopeId */
  null,
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 2 */
/***/ (function(module, exports) {

// this module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  scopeId,
  cssModules
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  // inject cssModules
  if (cssModules) {
    var computed = Object.create(options.computed || null)
    Object.keys(cssModules).forEach(function (key) {
      var module = cssModules[key]
      computed[key] = function () { return module }
    })
    options.computed = computed
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});


var isNumber = function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

exports.default = {
  props: {
    'val': {
      default: 0
    },
    'max': {
      default: 100
    },
    'size': {
      default: 3
    },
    'bg-color': {
      type: String,
      default: '#eee'
    },
    'bar-color': {
      type: String,
      default: '#2196f3' },
    'bar-transition': {
      type: String,
      default: 'all 0.5s ease'
    },
    'spacing': {
      type: Number,
      default: 4
    },
    'text': {
      type: String,
      default: ''
    },
    'text-position': {
      type: String,
      default: 'bottom' },
    'font-size': {
      type: Number,
      default: 13
    },
    'text-fg-color': {
      type: String,
      default: '#222'
    }
  },
  computed: {
    pct: function pct() {
      var pct = this.val / this.max * 100;
      pct = pct.toFixed(2);
      return Math.min(pct, this.max);
    },
    size_px: function size_px() {
      switch (this.size) {
        case 'tiny':
          return 2;
        case 'small':
          return 4;
        case 'medium':
          return 8;
        case 'large':
          return 12;
        case 'big':
          return 16;
        case 'huge':
          return 32;
        case 'massive':
          return 64;
      }

      return isNumber(this.size) ? this.size : 32;
    },
    text_padding: function text_padding() {
      switch (this.size) {
        case 'tiny':
        case 'small':
        case 'medium':
        case 'large':
        case 'big':
        case 'huge':
        case 'massive':
          return Math.min(Math.max(Math.ceil(this.size_px / 8), 3), 12);
      }

      return isNumber(this.spacing) ? this.spacing : 4;
    },
    text_font_size: function text_font_size() {
      switch (this.size) {
        case 'tiny':
        case 'small':
        case 'medium':
        case 'large':
        case 'big':
        case 'huge':
        case 'massive':
          return Math.min(Math.max(Math.ceil(this.size_px * 1.4), 11), 32);
      }

      return isNumber(this.fontSize) ? this.fontSize : 13;
    },
    progress_style: function progress_style() {
      var style = {
        'background': this.bgColor
      };

      if (this.textPosition == 'middle' || this.textPosition == 'inside') {
        style['position'] = 'relative';
        style['min-height'] = this.size_px + 'px';
        style['z-index'] = '-2';
      }

      return style;
    },
    bar_style: function bar_style() {
      var style = {
        'background': this.barColor,
        'width': this.pct + '%',
        'height': this.size_px + 'px',
        'transition': this.barTransition
      };

      if (this.textPosition == 'middle' || this.textPosition == 'inside') {
        style['position'] = 'absolute';
        style['top'] = '0';
        style['height'] = '100%';
        style['min-height'] = this.size_px + 'px', style['z-index'] = '-1';
      }

      return style;
    },
    text_style: function text_style() {
      var style = {
        'color': this.textFgColor,
        'font-size': this.text_font_size + 'px',
        'text-align': 'center'
      };

      if (this.textPosition == 'top' || this.textPosition == 'middle' || this.textPosition == 'inside') style['padding-bottom'] = this.text_padding + 'px';
      if (this.textPosition == 'bottom' || this.textPosition == 'middle' || this.textPosition == 'inside') style['padding-top'] = this.text_padding + 'px';

      return style;
    }
  }
};

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [(_vm.text.length > 0 && _vm.textPosition == 'top') ? _c('div', {
    staticClass: "vue-simple-progress-text",
    style: (_vm.text_style)
  }, [_vm._v(_vm._s(_vm.text))]) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "vue-simple-progress",
    style: (_vm.progress_style)
  }, [(_vm.text.length > 0 && _vm.textPosition == 'middle') ? _c('div', {
    staticClass: "vue-simple-progress-text",
    style: (_vm.text_style)
  }, [_vm._v(_vm._s(_vm.text))]) : _vm._e(), _vm._v(" "), (_vm.text.length > 0 && _vm.textPosition == 'inside') ? _c('div', {
    staticStyle: {
      "position": "relative",
      "left": "-9999px"
    },
    style: (_vm.text_style)
  }, [_vm._v(_vm._s(_vm.text))]) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "vue-simple-progress-bar",
    style: (_vm.bar_style)
  }, [(_vm.text.length > 0 && _vm.textPosition == 'inside') ? _c('div', {
    style: (_vm.text_style)
  }, [_vm._v(_vm._s(_vm.text))]) : _vm._e()])]), _vm._v(" "), (_vm.text.length > 0 && _vm.textPosition == 'bottom') ? _c('div', {
    staticClass: "vue-simple-progress-text",
    style: (_vm.text_style)
  }, [_vm._v(_vm._s(_vm.text))]) : _vm._e()])
},staticRenderFns: []}

/***/ })
/******/ ])["default"];
});

/***/ }),

/***/ 251:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)();
// imports


// module
exports.push([module.i, "\ndiv.api button[data-v-4d12265a] {\n  height: 35px;\n  width: 80px;\n}\n.contents[data-v-4d12265a] {\n  padding: 20px;\n  color: white;\n}\ndiv.parts[data-v-4d12265a] {\n  float: left;\n  height: 85%;\n  width: 25%;\n  border: 1px solid white;\n}\ndiv.select[data-v-4d12265a] {\n  height: 20%;\n  width: 100%;\n  border: 1px solid white;\n}\ndiv.select p[data-v-4d12265a] {\n  text-align: center;\n  margin: 15px;\n  font-size: 20px;\n}\ndiv.manage[data-v-4d12265a] {\n  float: left;\n  height: 85%;\n  width: 75%;\n  border: 1px solid white;\n}\ndiv.top[data-v-4d12265a] {\n  height: 76.6px;\n  width: 100%;\n  border: 1px solid white;\n}\ndiv.detail[data-v-4d12265a] {\n  margin: 0 auto;\n  height: 100%;\n  width: 100%;\n  text-align: center;\n  border: 1px solid white;\n}\ndiv.btn2[data-v-4d12265a] {\n  float: right;\n}\ndiv.btn1[data-v-4d12265a] {\n  float: left;\n  margin-left: 20px;\n}\ndiv.desc[data-v-4d12265a] {\n  float: left;\n  text-align: center;\n  padding: 8px;\n  height: 50%;\n  width: 60%;\n  border: 1px solid white;\n  margin: 20px 33px 5px 23px;\n}\ndiv.desc p[data-v-4d12265a] {\n  font-size: 20px;\n}\nbutton[data-v-4d12265a] {\n  float: right;\n  margin-top: 5px;\n  margin-right: 9.79px;\n  width: 65px;\n  height: 65px;\n  color: black;\n  background-color: white;\n}\ndiv.api[data-v-4d12265a] {\n  position: absolute;\n  top: 30%;\n  left: 82%;\n}\ndiv.km[data-v-4d12265a],\ndiv.cycle[data-v-4d12265a] {\n  position: relative;\n  left: 5%;\n  top: 10%;\n  height: 25%;\n  width: 70%;\n  margin-bottom: 5px;\n}\ndiv.km_str[data-v-4d12265a],\ndiv.mon_str[data-v-4d12265a] {\n  position: relative;\n  height: 46%;\n  width: 100%;\n  border: 1px solid white;\n}\ndiv.km_bar[data-v-4d12265a],\ndiv.mon_bar[data-v-4d12265a] {\n  position: relative;\n  height: 46%;\n  width: 100%;\n  border: 1px solid white;\n  margin-top: 6px;\n}\nspan.kmstr_left[data-v-4d12265a],\nspan.monstr_left[data-v-4d12265a] {\n  top: 7px;\n  left: 5%;\n  position: absolute;\n  text-align: left;\n  width: 100%;\n}\nspan.kmstr_right[data-v-4d12265a],\nspan.monstr_right[data-v-4d12265a] {\n  top: 7px;\n  right: 5%;\n  position: absolute;\n  text-align: right;\n  width: 100%;\n}\ndiv.img[data-v-4d12265a] {\n  position: absolute;\n  top: 37%;\n  left: 81.5%;\n  height: 130px;\n  width: 110px;\n  border: 1px solid white;\n}", ""]);

// exports


/***/ }),

/***/ 280:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(97);

var _vueSimpleProgress = __webpack_require__(245);

var _vueSimpleProgress2 = _interopRequireDefault(_vueSimpleProgress);

var _manageLibs = __webpack_require__(96);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: 'management',
  components: {
    'progress-bar': _vueSimpleProgress2.default
  },
  data: function data() {
    return {
      items: [{ name: '엔진 오일' }, { name: '배터리' }, { name: '냉각수' }, { name: '타이어' }, { name: '캐빈필터' }],
      engineOillevel: '0',
      engineOilpressur: '0',
      month: 0,
      km: 0
    };
  },
  mounted: function mounted() {
    this.startVehicle();
    this.km = _manageLibs.storage.loadEngineOilkm();
    var date = new Date();
    var betweenDay = (date.getTime() - _manageLibs.storage.loadEngineOilM()) / 1000 / 60 / 60 / 24;
    this.month = Math.floor(betweenDay / 30.4);
    if (this.month >= 12) {
      this.month = 12;
    }
    if (this.km >= 15000) {
      this.km = 15000;
    }
    console.log(date.getTime());
  },

  methods: {
    startVehicle: function startVehicle() {
      var _this = this;

      var vehicle = window.navigator.vehicle;
      if (vehicle) {
        vehicle.start(function () {
          console.log('vehicle start');
          vehicle.engineOil.get().then(function (engineOil) {
            _this.engineOillevel = engineOil.level;
            _this.engineOilpressur = engineOil.pressureWarning;
            _manageLibs.storage.saveOillevelApi(engineOil.level);
            _manageLibs.storage.saveOilPresApi(engineOil.pressureWarning);
            console.log(engineOil.level);
            console.log(engineOil.pressureWarning);
          }, function (err) {
            console.log(err.error);
            console.log(err.message);
          });
        }, function () {
          throw Error('constuctor fails');
        });
      }
    },
    gomanage: function gomanage(page) {
      var str = '/';
      if (page === '엔진 오일') {
        str += 'management';
      } else if (page === '배터리') {
        str += 'battery';
      } else if (page === '냉각수') {
        str += 'water';
      } else if (page === '타이어') {
        str += 'tire';
      } else if (page === '캐빈필터') {
        str += 'cabinAirFilter';
      }
      this.$router.push(str);
    }
  }
};

/***/ }),

/***/ 307:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(251);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(10)("7a5a7da2", content, false);
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(251, function() {
     var newContent = __webpack_require__(251);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 308:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c("div", { staticClass: "contents" }, [
      _c(
        "div",
        { staticClass: "parts" },
        _vm._l(_vm.items, function(item) {
          return _c("div", { key: item.name, staticClass: "select" }, [
            _c(
              "p",
              {
                ref: "string",
                refInFor: true,
                on: {
                  click: function($event) {
                    return _vm.gomanage(item.name)
                  }
                }
              },
              [_vm._v(_vm._s(item.name))]
            )
          ])
        }),
        0
      ),
      _vm._v(" "),
      _c("div", { staticClass: "manage" }, [
        _c("div", { staticClass: "top" }, [
          _c("div", { staticClass: "btn1" }, [
            _c(
              "button",
              [
                _c(
                  "router-link",
                  { attrs: { to: { name: "managepopupOil" } } },
                  [_vm._v("날짜수정")]
                )
              ],
              1
            )
          ]),
          _vm._v(" "),
          _vm._m(0),
          _vm._v(" "),
          _c("div", { staticClass: "btn2" }, [
            _c(
              "button",
              [
                _c(
                  "router-link",
                  { attrs: { to: { name: "airconditioner" } } },
                  [_vm._v("Go")]
                )
              ],
              1
            )
          ])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "detail" }, [
          _c("div", { staticClass: "api" }, [
            _c("span", [_vm._v("Engine Oil")]),
            _c("span", [_vm._v(" : ")]),
            _c("span", [_vm._v(_vm._s(_vm.engineOillevel))]),
            _c("span", [_vm._v(" , ")]),
            _c("span", [_vm._v(_vm._s(_vm.engineOilpressur))])
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "km" }, [
            _c("div", { staticClass: "km_str" }, [
              _c("span", { staticClass: "kmstr_left" }, [
                _vm._v(_vm._s(15000 - _vm.km) + "km 남음")
              ]),
              _vm._v(" "),
              _c("span", { staticClass: "kmstr_right" }, [
                _vm._v("15,000km 마다 교체")
              ])
            ]),
            _vm._v(" "),
            _c(
              "div",
              { staticClass: "km_bar" },
              [
                _c("progress-bar", {
                  attrs: { size: "large", val: _vm.km * (100 / 15000) }
                })
              ],
              1
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "cycle" }, [
            _c("div", { staticClass: "mon_str" }, [
              _c("span", { staticClass: "monstr_left" }, [
                _vm._v(_vm._s(12 - _vm.month) + "개월 남음")
              ]),
              _vm._v(" "),
              _c("span", { staticClass: "monstr_right" }, [
                _vm._v("12개월 마다 교체")
              ])
            ]),
            _vm._v(" "),
            _c(
              "div",
              { staticClass: "mon_bar" },
              [
                _c("progress-bar", {
                  attrs: { size: "large", val: (_vm.month * 100) / 12 }
                })
              ],
              1
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "img" })
        ])
      ])
    ])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "desc" }, [
      _c("p", [_vm._v("엔진 오일의 현재 상태")])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (true) {
  module.hot.accept()
  if (module.hot.data) {
    __webpack_require__(1)      .rerender("data-v-4d12265a", esExports)
  }
}

/***/ })

});