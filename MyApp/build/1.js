webpackJsonp([1],{

/***/ 212:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_airconditioner_vue__ = __webpack_require__(220);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_airconditioner_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_airconditioner_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_airconditioner_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_airconditioner_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3955368e_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_airconditioner_vue__ = __webpack_require__(224);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(222)
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

/***/ 216:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)();
// imports


// module
exports.push([module.i, "\n.contents[data-v-3955368e] {\n  padding: 20px;\n  color: white;\n}\ndiv.sensor[data-v-3955368e] {\n  height: 20%;\n  padding-left: 10px;\n  border: 1px solid white;\n}\ndiv.sensor p[data-v-3955368e] {\n  font-size: 20px;\n}\ndiv.dust[data-v-3955368e],\ndiv.finedust[data-v-3955368e],\ndiv.co2[data-v-3955368e] {\n  margin-top: 5px;\n  float: left;\n  height: 65px;\n  width: 30%;\n  border: 1px solid white;\n}\ndiv.measure[data-v-3955368e] {\n  float: left;\n  width: 100%;\n  height: 70%;\n  border: 1px solid white;\n}\ndiv.screentrans[data-v-3955368e] {\n  margin-top: 5px;\n  float: left;\n  height: 65px;\n  width: 10%;\n}\ndiv.screentrans button[data-v-3955368e] {\n  width: 65px;\n  height: 65px;\n  color: black;\n  background-color: white;\n}\ndiv.ventilation[data-v-3955368e] {\n  height: 65%;\n  border: 1px solid white;\n}\ndiv.switch[data-v-3955368e] {\n  margin-top: 10px;\n  margin-left: 5px;\n  float: left;\n  height: 40px;\n  width: 150px;\n  border: 1px solid white;\n}\ndiv.desc[data-v-3955368e] {\n  margin-top: 10px;\n  float: left;\n  height: 40px;\n  width: 600px;\n  border: 1px solid white;\n}\ndiv.carImg[data-v-3955368e] {\n  margin: 10px 10px 5px 10px;\n  float: left;\n  height: 180px;\n  width: 740px;\n  border: 1px solid white;\n}", ""]);

// exports


/***/ }),

/***/ 220:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _page = __webpack_require__(223);

var _page2 = _interopRequireDefault(_page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  name: 'home',
  mixins: [_page2.default],
  methods: {
    isFirst: function isFirst() {
      return true;
    }
  }
};

/***/ }),

/***/ 222:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(216);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(10)("e2d20e88", content, false);
// Hot Module Replacement
if(true) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept(216, function() {
     var newContent = __webpack_require__(216);
     if(typeof newContent === 'string') newContent = [[module.i, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 223:
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

/***/ 224:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c("div", { staticClass: "contents" }, [
      _c("div", { staticClass: "sensor" }, [
        _vm._m(0),
        _vm._v(" "),
        _vm._m(1),
        _vm._v(" "),
        _vm._m(2),
        _vm._v(" "),
        _c("div", { staticClass: "screentrans" }, [
          _c(
            "button",
            [
              !_vm.isFirst()
                ? _c("router-link", { attrs: { to: { name: "management" } } }, [
                    _vm._v("Go")
                  ])
                : _vm._e(),
              _vm._v(" "),
              _vm.isFirst()
                ? _c(
                    "router-link",
                    { attrs: { to: { name: "managepopup" } } },
                    [_vm._v("Go")]
                  )
                : _vm._e()
            ],
            1
          )
        ])
      ]),
      _vm._v(" "),
      _vm._m(3)
    ])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "dust" }, [
      _c("p", [_vm._v("미세먼지")]),
      _vm._v(" "),
      _c("div", { staticClass: "measure" }, [
        _c("div", { staticClass: "value" }),
        _vm._v(" "),
        _c("div", { staticClass: "standard" })
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "finedust" }, [
      _c("p", [_vm._v("초미세먼지")]),
      _vm._v(" "),
      _c("div", { staticClass: "measure" }, [
        _c("div", { staticClass: "value" }),
        _vm._v(" "),
        _c("div", { staticClass: "standard" })
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "co2" }, [
      _c("p", [_vm._v("Co2")]),
      _vm._v(" "),
      _c("div", { staticClass: "measure" }, [
        _c("div", { staticClass: "value" }),
        _vm._v(" "),
        _c("div", { staticClass: "standard" })
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "ventilation" }, [
      _c("div", { staticClass: "top" }, [
        _c("div", { staticClass: "switch" }),
        _vm._v(" "),
        _c("div", { staticClass: "desc" })
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "carImg" })
    ])
  }
]
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