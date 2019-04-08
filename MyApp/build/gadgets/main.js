webpackJsonp([1],{

/***/ 104:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(105);
__webpack_require__(114);
__webpack_require__(117);
__webpack_require__(120);
__webpack_require__(151);
__webpack_require__(164);
__webpack_require__(166);
__webpack_require__(171);
module.exports = __webpack_require__(175);


/***/ }),

/***/ 175:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _vue = __webpack_require__(84);

var _vue2 = _interopRequireDefault(_vue);

var _App = __webpack_require__(177);

var _App2 = _interopRequireDefault(_App);

var _obigoJsUi = __webpack_require__(184);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_obigoJsUi.obigoGadgetUI);

new _vue2.default({
  el: '#app',
  template: '<App/>',
  components: { App: _App2.default }
});

/***/ }),

/***/ 177:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__ = __webpack_require__(85);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__);
/* harmony namespace reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_7ba5bd90_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__ = __webpack_require__(183);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(178)
}
var normalizeComponent = __webpack_require__(182)
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
  var hotAPI = __webpack_require__(86)
  hotAPI.install(__webpack_require__(84), false)
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

/***/ 178:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(57);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(180)("5d085b06", content, false);
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

/***/ 183:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      attrs: { id: "gadget" },
      on: { "jog-click": _vm.onClickJog, click: _vm.onClickJog }
    },
    [
      _c("div", { staticClass: "header" }, [_vm._v("\n    Title\n  ")]),
      _vm._v(" "),
      _c("div", { staticClass: "body" }, [_vm._v("\n    Gadget\n  ")]),
      _vm._v(" "),
      _c("div", { staticClass: "buttons" })
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
    __webpack_require__(86)      .rerender("data-v-7ba5bd90", esExports)
  }
}

/***/ }),

/***/ 57:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(179)();
// imports


// module
exports.push([module.i, "\n@media renault9p and (min-height: 192px) and (max-width: 396px) and (max-height: 390px) {\n#gadget {\n    width: 396px;\n    height: 390px;\n}\n#gadget > .header {\n      height: 40px;\n}\n#gadget > .body {\n      height: 264px;\n}\n}\n@media dacia7p and (min-width: 193px) and (min-height: 179px) and (max-width: 390px) and (max-height: 362px) {\n#gadget {\n    width: 390px;\n    height: 362px;\n}\n#gadget > .header {\n      height: 40px;\n}\n#gadget > .body {\n      height: 243px;\n}\n#gadget > .buttons {\n      display: flex;\n      justify-content: center;\n}\n#gadget > .buttons > button {\n        float: left;\n        width: 50%;\n        height: 60px;\n}\n}\n@media renault7p and (min-width: 193px) and (min-height: 179px) and (max-width: 390px) and (max-height: 362px) {\n#gadget {\n    width: 390px;\n    height: 362px;\n}\n#gadget > .header {\n      height: 40px;\n}\n#gadget > .body {\n      height: 243px;\n}\n#gadget > .buttons {\n      display: flex;\n      justify-content: center;\n}\n#gadget > .buttons > button {\n        float: left;\n        width: 50%;\n        height: 60px;\n}\n}\n@media renault9p and (min-width: 195px) and (max-width: 396px) and (max-height: 191px) {\n#gadget {\n    width: 396px;\n    height: 191px;\n}\n#gadget > .header {\n      height: 40px;\n}\n#gadget > .body {\n      height: 98px;\n}\n}\n@media dacia7p and (min-width: 193px) and (min-height: 140px) and (max-width: 390px) and (max-height: 178px) {\n#gadget {\n    background: #170003;\n    width: 390px;\n    height: 178px;\n}\n#gadget > .header {\n      height: 40px;\n}\n#gadget > .body {\n      height: 87px;\n}\n}\n@media renault7p and (min-width: 193px) and (min-height: 140px) and (max-width: 390px) and (max-height: 178px) {\n#gadget {\n    width: 390px;\n    height: 178px;\n}\n#gadget > .header {\n      height: 40px;\n}\n#gadget > .body {\n      height: 87px;\n}\n}\n@media renault9p and (max-width: 194px) and (max-height: 191px) {\n#gadget {\n    width: 194px;\n    height: 191px;\n}\n}\n@media dacia7p and (max-width: 192px) and (max-height: 178px) {\n#gadget {\n    background: #170003;\n    width: 192px;\n    height: 178px;\n}\n#gadget > .header {\n      height: 40px;\n}\n}\n@media renault7p and (max-width: 192px) and (max-height: 178px) {\n#gadget {\n    width: 192px;\n    height: 178px;\n}\n#gadget > .header {\n      height: 40px;\n}\n}\n#gadget {\n  position: relative;\n  background: #1a1a1a;\n  color: #ffffff;\n}\n#gadget.obg-focus {\n    box-shadow: inset 0 0 0 4px #fff;\n}\n#gadget > .header {\n    height: 57px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 32px;\n    background: rgba(10, 10, 10, 0.5);\n}\n#gadget > .body {\n    font-size: 32px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}\n", ""]);

// exports


/***/ }),

/***/ 85:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  name: 'home',
  components: {},
  methods: {
    onClickJog: function onClickJog() {
      this.$focus.exitFocusMode();
      window.applicationFramework.applicationManager.getOwnerApplication(window.document).fullscreen();
    }
  }
};

/***/ })

},[104]);