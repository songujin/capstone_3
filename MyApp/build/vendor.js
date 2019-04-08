webpackJsonp([3],[
/* 0 */
/***/ (function(module, exports) {

var core = module.exports = { version: '2.6.5' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),
/* 1 */
/***/ (function(module, exports) {

var Vue // late bind
var version
var map = Object.create(null)
if (typeof window !== 'undefined') {
  window.__VUE_HOT_MAP__ = map
}
var installed = false
var isBrowserify = false
var initHookName = 'beforeCreate'

exports.install = function (vue, browserify) {
  if (installed) { return }
  installed = true

  Vue = vue.__esModule ? vue.default : vue
  version = Vue.version.split('.').map(Number)
  isBrowserify = browserify

  // compat with < 2.0.0-alpha.7
  if (Vue.config._lifecycleHooks.indexOf('init') > -1) {
    initHookName = 'init'
  }

  exports.compatible = version[0] >= 2
  if (!exports.compatible) {
    console.warn(
      '[HMR] You are using a version of vue-hot-reload-api that is ' +
        'only compatible with Vue.js core ^2.0.0.'
    )
    return
  }
}

/**
 * Create a record for a hot module, which keeps track of its constructor
 * and instances
 *
 * @param {String} id
 * @param {Object} options
 */

exports.createRecord = function (id, options) {
  if(map[id]) { return }

  var Ctor = null
  if (typeof options === 'function') {
    Ctor = options
    options = Ctor.options
  }
  makeOptionsHot(id, options)
  map[id] = {
    Ctor: Ctor,
    options: options,
    instances: []
  }
}

/**
 * Check if module is recorded
 *
 * @param {String} id
 */

exports.isRecorded = function (id) {
  return typeof map[id] !== 'undefined'
}

/**
 * Make a Component options object hot.
 *
 * @param {String} id
 * @param {Object} options
 */

function makeOptionsHot(id, options) {
  if (options.functional) {
    var render = options.render
    options.render = function (h, ctx) {
      var instances = map[id].instances
      if (ctx && instances.indexOf(ctx.parent) < 0) {
        instances.push(ctx.parent)
      }
      return render(h, ctx)
    }
  } else {
    injectHook(options, initHookName, function() {
      var record = map[id]
      if (!record.Ctor) {
        record.Ctor = this.constructor
      }
      record.instances.push(this)
    })
    injectHook(options, 'beforeDestroy', function() {
      var instances = map[id].instances
      instances.splice(instances.indexOf(this), 1)
    })
  }
}

/**
 * Inject a hook to a hot reloadable component so that
 * we can keep track of it.
 *
 * @param {Object} options
 * @param {String} name
 * @param {Function} hook
 */

function injectHook(options, name, hook) {
  var existing = options[name]
  options[name] = existing
    ? Array.isArray(existing) ? existing.concat(hook) : [existing, hook]
    : [hook]
}

function tryWrap(fn) {
  return function (id, arg) {
    try {
      fn(id, arg)
    } catch (e) {
      console.error(e)
      console.warn(
        'Something went wrong during Vue component hot-reload. Full reload required.'
      )
    }
  }
}

function updateOptions (oldOptions, newOptions) {
  for (var key in oldOptions) {
    if (!(key in newOptions)) {
      delete oldOptions[key]
    }
  }
  for (var key$1 in newOptions) {
    oldOptions[key$1] = newOptions[key$1]
  }
}

exports.rerender = tryWrap(function (id, options) {
  var record = map[id]
  if (!options) {
    record.instances.slice().forEach(function (instance) {
      instance.$forceUpdate()
    })
    return
  }
  if (typeof options === 'function') {
    options = options.options
  }
  if (record.Ctor) {
    record.Ctor.options.render = options.render
    record.Ctor.options.staticRenderFns = options.staticRenderFns
    record.instances.slice().forEach(function (instance) {
      instance.$options.render = options.render
      instance.$options.staticRenderFns = options.staticRenderFns
      // reset static trees
      // pre 2.5, all static trees are cached together on the instance
      if (instance._staticTrees) {
        instance._staticTrees = []
      }
      // 2.5.0
      if (Array.isArray(record.Ctor.options.cached)) {
        record.Ctor.options.cached = []
      }
      // 2.5.3
      if (Array.isArray(instance.$options.cached)) {
        instance.$options.cached = []
      }

      // post 2.5.4: v-once trees are cached on instance._staticTrees.
      // Pure static trees are cached on the staticRenderFns array
      // (both already reset above)

      // 2.6: temporarily mark rendered scoped slots as unstable so that
      // child components can be forced to update
      var restore = patchScopedSlots(instance)
      instance.$forceUpdate()
      instance.$nextTick(restore)
    })
  } else {
    // functional or no instance created yet
    record.options.render = options.render
    record.options.staticRenderFns = options.staticRenderFns

    // handle functional component re-render
    if (record.options.functional) {
      // rerender with full options
      if (Object.keys(options).length > 2) {
        updateOptions(record.options, options)
      } else {
        // template-only rerender.
        // need to inject the style injection code for CSS modules
        // to work properly.
        var injectStyles = record.options._injectStyles
        if (injectStyles) {
          var render = options.render
          record.options.render = function (h, ctx) {
            injectStyles.call(ctx)
            return render(h, ctx)
          }
        }
      }
      record.options._Ctor = null
      // 2.5.3
      if (Array.isArray(record.options.cached)) {
        record.options.cached = []
      }
      record.instances.slice().forEach(function (instance) {
        instance.$forceUpdate()
      })
    }
  }
})

exports.reload = tryWrap(function (id, options) {
  var record = map[id]
  if (options) {
    if (typeof options === 'function') {
      options = options.options
    }
    makeOptionsHot(id, options)
    if (record.Ctor) {
      if (version[1] < 2) {
        // preserve pre 2.2 behavior for global mixin handling
        record.Ctor.extendOptions = options
      }
      var newCtor = record.Ctor.super.extend(options)
      record.Ctor.options = newCtor.options
      record.Ctor.cid = newCtor.cid
      record.Ctor.prototype = newCtor.prototype
      if (newCtor.release) {
        // temporary global mixin strategy used in < 2.0.0-alpha.6
        newCtor.release()
      }
    } else {
      updateOptions(record.options, options)
    }
  }
  record.instances.slice().forEach(function (instance) {
    if (instance.$vnode && instance.$vnode.context) {
      instance.$vnode.context.$forceUpdate()
    } else {
      console.warn(
        'Root or manually mounted instance modified. Full reload required.'
      )
    }
  })
})

// 2.6 optimizes template-compiled scoped slots and skips updates if child
// only uses scoped slots. We need to patch the scoped slots resolving helper
// to temporarily mark all scoped slots as unstable in order to force child
// updates.
function patchScopedSlots (instance) {
  if (!instance._u) { return }
  // https://github.com/vuejs/vue/blob/dev/src/core/instance/render-helpers/resolve-scoped-slots.js
  var original = instance._u
  instance._u = function (slots) {
    try {
      // 2.6.4 ~ 2.6.6
      return original(slots, true)
    } catch (e) {
      // 2.5 / >= 2.6.7
      return original(slots, null, true)
    }
  }
  return function () {
    instance._u = original
  }
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * Vue.js v2.4.2
 * (c) 2014-2017 Evan You
 * Released under the MIT License.
 */


/*  */

// these helpers produces better vm code in JS engines due to their
// explicitness and function inlining
function isUndef (v) {
  return v === undefined || v === null
}

function isDef (v) {
  return v !== undefined && v !== null
}

function isTrue (v) {
  return v === true
}

function isFalse (v) {
  return v === false
}

/**
 * Check if value is primitive
 */
function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

var _toString = Object.prototype.toString;

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

function isRegExp (v) {
  return _toString.call(v) === '[object RegExp]'
}

/**
 * Check if val is a valid array index.
 */
function isValidArrayIndex (val) {
  var n = parseFloat(val);
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

/**
 * Convert a value to a string that is actually rendered.
 */
function toString (val) {
  return val == null
    ? ''
    : typeof val === 'object'
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 */
function toNumber (val) {
  var n = parseFloat(val);
  return isNaN(n) ? val : n
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap (
  str,
  expectsLowerCase
) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()]; }
    : function (val) { return map[val]; }
}

/**
 * Check if a tag is a built-in tag.
 */
var isBuiltInTag = makeMap('slot,component', true);

/**
 * Check if a attribute is a reserved attribute.
 */
var isReservedAttribute = makeMap('key,ref,slot,is');

/**
 * Remove an item from an array
 */
function remove (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Check whether the object has the property.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Create a cached version of a pure function.
 */
function cached (fn) {
  var cache = Object.create(null);
  return (function cachedFn (str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str))
  })
}

/**
 * Camelize a hyphen-delimited string.
 */
var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
});

/**
 * Capitalize a string.
 */
var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
});

/**
 * Hyphenate a camelCase string.
 */
var hyphenateRE = /([^-])([A-Z])/g;
var hyphenate = cached(function (str) {
  return str
    .replace(hyphenateRE, '$1-$2')
    .replace(hyphenateRE, '$1-$2')
    .toLowerCase()
});

/**
 * Simple bind, faster than native
 */
function bind (fn, ctx) {
  function boundFn (a) {
    var l = arguments.length;
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
  // record original fn length
  boundFn._length = fn.length;
  return boundFn
}

/**
 * Convert an Array-like object to a real Array.
 */
function toArray (list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret
}

/**
 * Mix properties into target object.
 */
function extend (to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }
  return to
}

/**
 * Merge an Array of Objects into a single Object.
 */
function toObject (arr) {
  var res = {};
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res
}

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
 */
function noop (a, b, c) {}

/**
 * Always return false.
 */
var no = function (a, b, c) { return false; };

/**
 * Return same value
 */
var identity = function (_) { return _; };

/**
 * Generate a static keys string from compiler modules.
 */
function genStaticKeys (modules) {
  return modules.reduce(function (keys, m) {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
function looseEqual (a, b) {
  if (a === b) { return true }
  var isObjectA = isObject(a);
  var isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    try {
      var isArrayA = Array.isArray(a);
      var isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every(function (e, i) {
          return looseEqual(e, b[i])
        })
      } else if (!isArrayA && !isArrayB) {
        var keysA = Object.keys(a);
        var keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(function (key) {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

function looseIndexOf (arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) { return i }
  }
  return -1
}

/**
 * Ensure a function is called only once.
 */
function once (fn) {
  var called = false;
  return function () {
    if (!called) {
      called = true;
      fn.apply(this, arguments);
    }
  }
}

var SSR_ATTR = 'data-server-rendered';

var ASSET_TYPES = [
  'component',
  'directive',
  'filter'
];

var LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated'
];

/*  */

var config = ({
  /**
   * Option merge strategies (used in core/util/options)
   */
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Show production mode tip message on boot?
   */
  productionTip: "development" !== 'production',

  /**
   * Whether to enable devtools
   */
  devtools: "development" !== 'production',

  /**
   * Whether to record perf
   */
  performance: false,

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Warn handler for watcher warns
   */
  warnHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   */
  isReservedAttr: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * Exposed for legacy reasons
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
});

/*  */

var emptyObject = Object.freeze({});

/**
 * Check if a string starts with $ or _
 */
function isReserved (str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 */
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Parse simple path.
 */
var bailRE = /[^\w.$]/;
function parsePath (path) {
  if (bailRE.test(path)) {
    return
  }
  var segments = path.split('.');
  return function (obj) {
    for (var i = 0; i < segments.length; i++) {
      if (!obj) { return }
      obj = obj[segments[i]];
    }
    return obj
  }
}

/*  */

var warn = noop;
var tip = noop;
var formatComponentName = (null); // work around flow check

if (true) {
  var hasConsole = typeof console !== 'undefined';
  var classifyRE = /(?:^|[-_])(\w)/g;
  var classify = function (str) { return str
    .replace(classifyRE, function (c) { return c.toUpperCase(); })
    .replace(/[-_]/g, ''); };

  warn = function (msg, vm) {
    var trace = vm ? generateComponentTrace(vm) : '';

    if (config.warnHandler) {
      config.warnHandler.call(null, msg, vm, trace);
    } else if (hasConsole && (!config.silent)) {
      console.error(("[Vue warn]: " + msg + trace));
    }
  };

  tip = function (msg, vm) {
    if (hasConsole && (!config.silent)) {
      console.warn("[Vue tip]: " + msg + (
        vm ? generateComponentTrace(vm) : ''
      ));
    }
  };

  formatComponentName = function (vm, includeFile) {
    if (vm.$root === vm) {
      return '<Root>'
    }
    var name = typeof vm === 'string'
      ? vm
      : typeof vm === 'function' && vm.options
        ? vm.options.name
        : vm._isVue
          ? vm.$options.name || vm.$options._componentTag
          : vm.name;

    var file = vm._isVue && vm.$options.__file;
    if (!name && file) {
      var match = file.match(/([^/\\]+)\.vue$/);
      name = match && match[1];
    }

    return (
      (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
      (file && includeFile !== false ? (" at " + file) : '')
    )
  };

  var repeat = function (str, n) {
    var res = '';
    while (n) {
      if (n % 2 === 1) { res += str; }
      if (n > 1) { str += str; }
      n >>= 1;
    }
    return res
  };

  var generateComponentTrace = function (vm) {
    if (vm._isVue && vm.$parent) {
      var tree = [];
      var currentRecursiveSequence = 0;
      while (vm) {
        if (tree.length > 0) {
          var last = tree[tree.length - 1];
          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++;
            vm = vm.$parent;
            continue
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence];
            currentRecursiveSequence = 0;
          }
        }
        tree.push(vm);
        vm = vm.$parent;
      }
      return '\n\nfound in\n\n' + tree
        .map(function (vm, i) { return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
            ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
            : formatComponentName(vm))); })
        .join('\n')
    } else {
      return ("\n\n(found in " + (formatComponentName(vm)) + ")")
    }
  };
}

/*  */

function handleError (err, vm, info) {
  if (config.errorHandler) {
    config.errorHandler.call(null, err, vm, info);
  } else {
    if (true) {
      warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
    }
    /* istanbul ignore else */
    if (inBrowser && typeof console !== 'undefined') {
      console.error(err);
    } else {
      throw err
    }
  }
}

/*  */
/* globals MutationObserver */

// can we use __proto__?
var hasProto = '__proto__' in {};

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined';
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && /msie|trident/.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isEdge = UA && UA.indexOf('edge/') > 0;
var isAndroid = UA && UA.indexOf('android') > 0;
var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

// Firefix has a "watch" function on Object.prototype...
var nativeWatch = ({}).watch;

var supportsPassive = false;
if (inBrowser) {
  try {
    var opts = {};
    Object.defineProperty(opts, 'passive', ({
      get: function get () {
        /* istanbul ignore next */
        supportsPassive = true;
      }
    })); // https://github.com/facebook/flow/issues/285
    window.addEventListener('test-passive', null, opts);
  } catch (e) {}
}

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
var _isServer;
var isServerRendering = function () {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && typeof global !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer = global['process'].env.VUE_ENV === 'server';
    } else {
      _isServer = false;
    }
  }
  return _isServer
};

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

/* istanbul ignore next */
function isNative (Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

var hasSymbol =
  typeof Symbol !== 'undefined' && isNative(Symbol) &&
  typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

/**
 * Defer a task to execute it asynchronously.
 */
var nextTick = (function () {
  var callbacks = [];
  var pending = false;
  var timerFunc;

  function nextTickHandler () {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks.length = 0;
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  // the nextTick behavior leverages the microtask queue, which can be accessed
  // via either native Promise.then or MutationObserver.
  // MutationObserver has wider support, however it is seriously bugged in
  // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is available, we will use it:
  /* istanbul ignore if */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve();
    var logError = function (err) { console.error(err); };
    timerFunc = function () {
      p.then(nextTickHandler).catch(logError);
      // in problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS) { setTimeout(noop); }
    };
  } else if (typeof MutationObserver !== 'undefined' && (
    isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]'
  )) {
    // use MutationObserver where native Promise is not available,
    // e.g. PhantomJS IE11, iOS7, Android 4.4
    var counter = 1;
    var observer = new MutationObserver(nextTickHandler);
    var textNode = document.createTextNode(String(counter));
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = String(counter);
    };
  } else {
    // fallback to setTimeout
    /* istanbul ignore next */
    timerFunc = function () {
      setTimeout(nextTickHandler, 0);
    };
  }

  return function queueNextTick (cb, ctx) {
    var _resolve;
    callbacks.push(function () {
      if (cb) {
        try {
          cb.call(ctx);
        } catch (e) {
          handleError(e, ctx, 'nextTick');
        }
      } else if (_resolve) {
        _resolve(ctx);
      }
    });
    if (!pending) {
      pending = true;
      timerFunc();
    }
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve, reject) {
        _resolve = resolve;
      })
    }
  }
})();

var _Set;
/* istanbul ignore if */
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = (function () {
    function Set () {
      this.set = Object.create(null);
    }
    Set.prototype.has = function has (key) {
      return this.set[key] === true
    };
    Set.prototype.add = function add (key) {
      this.set[key] = true;
    };
    Set.prototype.clear = function clear () {
      this.set = Object.create(null);
    };

    return Set;
  }());
}

/*  */


var uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
var Dep = function Dep () {
  this.id = uid++;
  this.subs = [];
};

Dep.prototype.addSub = function addSub (sub) {
  this.subs.push(sub);
};

Dep.prototype.removeSub = function removeSub (sub) {
  remove(this.subs, sub);
};

Dep.prototype.depend = function depend () {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Dep.prototype.notify = function notify () {
  // stabilize the subscriber list first
  var subs = this.subs.slice();
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;
var targetStack = [];

function pushTarget (_target) {
  if (Dep.target) { targetStack.push(Dep.target); }
  Dep.target = _target;
}

function popTarget () {
  Dep.target = targetStack.pop();
}

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break
      case 'splice':
        inserted = args.slice(2);
        break
    }
    if (inserted) { ob.observeArray(inserted); }
    // notify change
    ob.dep.notify();
    return result
  });
});

/*  */

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
var observerState = {
  shouldConvert: true
};

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
var Observer = function Observer (value) {
  this.value = value;
  this.dep = new Dep();
  this.vmCount = 0;
  def(value, '__ob__', this);
  if (Array.isArray(value)) {
    var augment = hasProto
      ? protoAugment
      : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value);
  } else {
    this.walk(value);
  }
};

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
Observer.prototype.walk = function walk (obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    defineReactive$$1(obj, keys[i], obj[keys[i]]);
  }
};

/**
 * Observe a list of Array items.
 */
Observer.prototype.observeArray = function observeArray (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src, keys) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
function observe (value, asRootData) {
  if (!isObject(value)) {
    return
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    observerState.shouldConvert &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
function defineReactive$$1 (
  obj,
  key,
  val,
  customSetter,
  shallow
) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;

  var childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        if (Array.isArray(value)) {
          dependArray(value);
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if ("development" !== 'production' && customSetter) {
        customSetter();
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = !shallow && observe(newVal);
      dep.notify();
    }
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
function set (target, key, val) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val
  }
  if (hasOwn(target, key)) {
    target[key] = val;
    return val
  }
  var ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
    "development" !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    );
    return val
  }
  if (!ob) {
    target[key] = val;
    return val
  }
  defineReactive$$1(ob.value, key, val);
  ob.dep.notify();
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
function del (target, key) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return
  }
  var ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
    "development" !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    );
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key];
  if (!ob) {
    return
  }
  ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value) {
  for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
var strats = config.optionMergeStrategies;

/**
 * Options with restrictions
 */
if (true) {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        "option \"" + key + "\" can only be used during instance " +
        'creation with the `new` keyword.'
      );
    }
    return defaultStrat(parent, child)
  };
}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData (to, from) {
  if (!from) { return to }
  var key, toVal, fromVal;
  var keys = Object.keys(from);
  for (var i = 0; i < keys.length; i++) {
    key = keys[i];
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }
  return to
}

/**
 * Data
 */
function mergeDataOrFn (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this) : parentVal
      )
    }
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn () {
      // instance merge
      var instanceData = typeof childVal === 'function'
        ? childVal.call(vm)
        : childVal;
      var defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm)
        : undefined;
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

strats.data = function (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
      "development" !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      );

      return parentVal
    }
    return mergeDataOrFn.call(this, parentVal, childVal)
  }

  return mergeDataOrFn(parentVal, childVal, vm)
};

/**
 * Hooks and props are merged as arrays.
 */
function mergeHook (
  parentVal,
  childVal
) {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}

LIFECYCLE_HOOKS.forEach(function (hook) {
  strats[hook] = mergeHook;
});

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets (parentVal, childVal) {
  var res = Object.create(parentVal || null);
  return childVal
    ? extend(res, childVal)
    : res
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (parentVal, childVal) {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) { parentVal = undefined; }
  if (childVal === nativeWatch) { childVal = undefined; }
  /* istanbul ignore if */
  if (!childVal) { return Object.create(parentVal || null) }
  if (!parentVal) { return childVal }
  var ret = {};
  extend(ret, parentVal);
  for (var key in childVal) {
    var parent = ret[key];
    var child = childVal[key];
    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child];
  }
  return ret
};

/**
 * Other object hashes.
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (parentVal, childVal) {
  if (!parentVal) { return childVal }
  var ret = Object.create(null);
  extend(ret, parentVal);
  if (childVal) { extend(ret, childVal); }
  return ret
};
strats.provide = mergeDataOrFn;

/**
 * Default strategy.
 */
var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
};

/**
 * Validate component names
 */
function checkComponents (options) {
  for (var key in options.components) {
    var lower = key.toLowerCase();
    if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
      warn(
        'Do not use built-in or reserved HTML elements as component ' +
        'id: ' + key
      );
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options) {
  var props = options.props;
  if (!props) { return }
  var res = {};
  var i, val, name;
  if (Array.isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = { type: null };
      } else if (true) {
        warn('props must be strings when using array syntax.');
      }
    }
  } else if (isPlainObject(props)) {
    for (var key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val)
        ? val
        : { type: val };
    }
  }
  options.props = res;
}

/**
 * Normalize all injections into Object-based format
 */
function normalizeInject (options) {
  var inject = options.inject;
  if (Array.isArray(inject)) {
    var normalized = options.inject = {};
    for (var i = 0; i < inject.length; i++) {
      normalized[inject[i]] = inject[i];
    }
  }
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives (options) {
  var dirs = options.directives;
  if (dirs) {
    for (var key in dirs) {
      var def = dirs[key];
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def };
      }
    }
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
function mergeOptions (
  parent,
  child,
  vm
) {
  if (true) {
    checkComponents(child);
  }

  if (typeof child === 'function') {
    child = child.options;
  }

  normalizeProps(child);
  normalizeInject(child);
  normalizeDirectives(child);
  var extendsFrom = child.extends;
  if (extendsFrom) {
    parent = mergeOptions(parent, extendsFrom, vm);
  }
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm);
    }
  }
  var options = {};
  var key;
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField (key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
function resolveAsset (
  options,
  type,
  id,
  warnMissing
) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  var assets = options[type];
  // check local registration variations first
  if (hasOwn(assets, id)) { return assets[id] }
  var camelizedId = camelize(id);
  if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
  var PascalCaseId = capitalize(camelizedId);
  if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
  // fallback to prototype chain
  var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
  if ("development" !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    );
  }
  return res
}

/*  */

function validateProp (
  key,
  propOptions,
  propsData,
  vm
) {
  var prop = propOptions[key];
  var absent = !hasOwn(propsData, key);
  var value = propsData[key];
  // handle boolean props
  if (isType(Boolean, prop.type)) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (!isType(String, prop.type) && (value === '' || value === hyphenate(key))) {
      value = true;
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key);
    // since the default value is a fresh copy,
    // make sure to observe it.
    var prevShouldConvert = observerState.shouldConvert;
    observerState.shouldConvert = true;
    observe(value);
    observerState.shouldConvert = prevShouldConvert;
  }
  if (true) {
    assertProp(prop, key, value, vm, absent);
  }
  return value
}

/**
 * Get the default value of a prop.
 */
function getPropDefaultValue (vm, prop, key) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  var def = prop.default;
  // warn against non-factory defaults for Object & Array
  if ("development" !== 'production' && isObject(def)) {
    warn(
      'Invalid default value for prop "' + key + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    );
  }
  // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
  if (vm && vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm._props[key] !== undefined
  ) {
    return vm._props[key]
  }
  // call factory function for non-Function types
  // a value is Function if its prototype is function even across different execution context
  return typeof def === 'function' && getType(prop.type) !== 'Function'
    ? def.call(vm)
    : def
}

/**
 * Assert whether a prop is valid.
 */
function assertProp (
  prop,
  name,
  value,
  vm,
  absent
) {
  if (prop.required && absent) {
    warn(
      'Missing required prop: "' + name + '"',
      vm
    );
    return
  }
  if (value == null && !prop.required) {
    return
  }
  var type = prop.type;
  var valid = !type || type === true;
  var expectedTypes = [];
  if (type) {
    if (!Array.isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType || '');
      valid = assertedType.valid;
    }
  }
  if (!valid) {
    warn(
      'Invalid prop: type check failed for prop "' + name + '".' +
      ' Expected ' + expectedTypes.map(capitalize).join(', ') +
      ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.',
      vm
    );
    return
  }
  var validator = prop.validator;
  if (validator) {
    if (!validator(value)) {
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      );
    }
  }
}

var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

function assertType (value, type) {
  var valid;
  var expectedType = getType(type);
  if (simpleCheckRE.test(expectedType)) {
    valid = typeof value === expectedType.toLowerCase();
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value);
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid: valid,
    expectedType: expectedType
  }
}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
function getType (fn) {
  var match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : ''
}

function isType (type, fn) {
  if (!Array.isArray(fn)) {
    return getType(fn) === getType(type)
  }
  for (var i = 0, len = fn.length; i < len; i++) {
    if (getType(fn[i]) === getType(type)) {
      return true
    }
  }
  /* istanbul ignore next */
  return false
}

/*  */

var mark;
var measure;

if (true) {
  var perf = inBrowser && window.performance;
  /* istanbul ignore if */
  if (
    perf &&
    perf.mark &&
    perf.measure &&
    perf.clearMarks &&
    perf.clearMeasures
  ) {
    mark = function (tag) { return perf.mark(tag); };
    measure = function (name, startTag, endTag) {
      perf.measure(name, startTag, endTag);
      perf.clearMarks(startTag);
      perf.clearMarks(endTag);
      perf.clearMeasures(name);
    };
  }
}

/* not type checking this file because flow doesn't play well with Proxy */

var initProxy;

if (true) {
  var allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  );

  var warnNonPresent = function (target, key) {
    warn(
      "Property or method \"" + key + "\" is not defined on the instance but " +
      "referenced during render. Make sure to declare reactive data " +
      "properties in the data option.",
      target
    );
  };

  var hasProxy =
    typeof Proxy !== 'undefined' &&
    Proxy.toString().match(/native code/);

  if (hasProxy) {
    var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta');
    config.keyCodes = new Proxy(config.keyCodes, {
      set: function set (target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
          return false
        } else {
          target[key] = value;
          return true
        }
      }
    });
  }

  var hasHandler = {
    has: function has (target, key) {
      var has = key in target;
      var isAllowed = allowedGlobals(key) || key.charAt(0) === '_';
      if (!has && !isAllowed) {
        warnNonPresent(target, key);
      }
      return has || !isAllowed
    }
  };

  var getHandler = {
    get: function get (target, key) {
      if (typeof key === 'string' && !(key in target)) {
        warnNonPresent(target, key);
      }
      return target[key]
    }
  };

  initProxy = function initProxy (vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      var options = vm.$options;
      var handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler;
      vm._renderProxy = new Proxy(vm, handlers);
    } else {
      vm._renderProxy = vm;
    }
  };
}

/*  */

var VNode = function VNode (
  tag,
  data,
  children,
  text,
  elm,
  context,
  componentOptions,
  asyncFactory
) {
  this.tag = tag;
  this.data = data;
  this.children = children;
  this.text = text;
  this.elm = elm;
  this.ns = undefined;
  this.context = context;
  this.functionalContext = undefined;
  this.key = data && data.key;
  this.componentOptions = componentOptions;
  this.componentInstance = undefined;
  this.parent = undefined;
  this.raw = false;
  this.isStatic = false;
  this.isRootInsert = true;
  this.isComment = false;
  this.isCloned = false;
  this.isOnce = false;
  this.asyncFactory = asyncFactory;
  this.asyncMeta = undefined;
  this.isAsyncPlaceholder = false;
};

var prototypeAccessors = { child: {} };

// DEPRECATED: alias for componentInstance for backwards compat.
/* istanbul ignore next */
prototypeAccessors.child.get = function () {
  return this.componentInstance
};

Object.defineProperties( VNode.prototype, prototypeAccessors );

var createEmptyVNode = function (text) {
  if ( text === void 0 ) text = '';

  var node = new VNode();
  node.text = text;
  node.isComment = true;
  return node
};

function createTextVNode (val) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
function cloneVNode (vnode) {
  var cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  );
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isComment = vnode.isComment;
  cloned.isCloned = true;
  return cloned
}

function cloneVNodes (vnodes) {
  var len = vnodes.length;
  var res = new Array(len);
  for (var i = 0; i < len; i++) {
    res[i] = cloneVNode(vnodes[i]);
  }
  return res
}

/*  */

var normalizeEvent = cached(function (name) {
  var passive = name.charAt(0) === '&';
  name = passive ? name.slice(1) : name;
  var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
  name = once$$1 ? name.slice(1) : name;
  var capture = name.charAt(0) === '!';
  name = capture ? name.slice(1) : name;
  return {
    name: name,
    once: once$$1,
    capture: capture,
    passive: passive
  }
});

function createFnInvoker (fns) {
  function invoker () {
    var arguments$1 = arguments;

    var fns = invoker.fns;
    if (Array.isArray(fns)) {
      var cloned = fns.slice();
      for (var i = 0; i < cloned.length; i++) {
        cloned[i].apply(null, arguments$1);
      }
    } else {
      // return handler return value for single handlers
      return fns.apply(null, arguments)
    }
  }
  invoker.fns = fns;
  return invoker
}

function updateListeners (
  on,
  oldOn,
  add,
  remove$$1,
  vm
) {
  var name, cur, old, event;
  for (name in on) {
    cur = on[name];
    old = oldOn[name];
    event = normalizeEvent(name);
    if (isUndef(cur)) {
      "development" !== 'production' && warn(
        "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
        vm
      );
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur);
      }
      add(event.name, cur, event.once, event.capture, event.passive);
    } else if (cur !== old) {
      old.fns = cur;
      on[name] = old;
    }
  }
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name);
      remove$$1(event.name, oldOn[name], event.capture);
    }
  }
}

/*  */

function mergeVNodeHook (def, hookKey, hook) {
  var invoker;
  var oldHook = def[hookKey];

  function wrappedHook () {
    hook.apply(this, arguments);
    // important: remove merged hook to ensure it's called only once
    // and prevent memory leak
    remove(invoker.fns, wrappedHook);
  }

  if (isUndef(oldHook)) {
    // no existing hook
    invoker = createFnInvoker([wrappedHook]);
  } else {
    /* istanbul ignore if */
    if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
      // already a merged invoker
      invoker = oldHook;
      invoker.fns.push(wrappedHook);
    } else {
      // existing plain hook
      invoker = createFnInvoker([oldHook, wrappedHook]);
    }
  }

  invoker.merged = true;
  def[hookKey] = invoker;
}

/*  */

function extractPropsFromVNodeData (
  data,
  Ctor,
  tag
) {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  var propOptions = Ctor.options.props;
  if (isUndef(propOptions)) {
    return
  }
  var res = {};
  var attrs = data.attrs;
  var props = data.props;
  if (isDef(attrs) || isDef(props)) {
    for (var key in propOptions) {
      var altKey = hyphenate(key);
      if (true) {
        var keyInLowerCase = key.toLowerCase();
        if (
          key !== keyInLowerCase &&
          attrs && hasOwn(attrs, keyInLowerCase)
        ) {
          tip(
            "Prop \"" + keyInLowerCase + "\" is passed to component " +
            (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
            " \"" + key + "\". " +
            "Note that HTML attributes are case-insensitive and camelCased " +
            "props need to use their kebab-case equivalents when using in-DOM " +
            "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
          );
        }
      }
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey, false);
    }
  }
  return res
}

function checkProp (
  res,
  hash,
  key,
  altKey,
  preserve
) {
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];
      if (!preserve) {
        delete hash[key];
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];
      if (!preserve) {
        delete hash[altKey];
      }
      return true
    }
  }
  return false
}

/*  */

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
function simpleNormalizeChildren (children) {
  for (var i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
function normalizeChildren (children) {
  return isPrimitive(children)
    ? [createTextVNode(children)]
    : Array.isArray(children)
      ? normalizeArrayChildren(children)
      : undefined
}

function isTextNode (node) {
  return isDef(node) && isDef(node.text) && isFalse(node.isComment)
}

function normalizeArrayChildren (children, nestedIndex) {
  var res = [];
  var i, c, last;
  for (i = 0; i < children.length; i++) {
    c = children[i];
    if (isUndef(c) || typeof c === 'boolean') { continue }
    last = res[res.length - 1];
    //  nested
    if (Array.isArray(c)) {
      res.push.apply(res, normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i)));
    } else if (isPrimitive(c)) {
      if (isTextNode(last)) {
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        (last).text += String(c);
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c));
      }
    } else {
      if (isTextNode(c) && isTextNode(last)) {
        // merge adjacent text nodes
        res[res.length - 1] = createTextVNode(last.text + c.text);
      } else {
        // default key for nested array children (likely generated by v-for)
        if (isTrue(children._isVList) &&
          isDef(c.tag) &&
          isUndef(c.key) &&
          isDef(nestedIndex)) {
          c.key = "__vlist" + nestedIndex + "_" + i + "__";
        }
        res.push(c);
      }
    }
  }
  return res
}

/*  */

function ensureCtor (comp, base) {
  if (comp.__esModule && comp.default) {
    comp = comp.default;
  }
  return isObject(comp)
    ? base.extend(comp)
    : comp
}

function createAsyncPlaceholder (
  factory,
  data,
  context,
  children,
  tag
) {
  var node = createEmptyVNode();
  node.asyncFactory = factory;
  node.asyncMeta = { data: data, context: context, children: children, tag: tag };
  return node
}

function resolveAsyncComponent (
  factory,
  baseCtor,
  context
) {
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp
  }

  if (isDef(factory.resolved)) {
    return factory.resolved
  }

  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp
  }

  if (isDef(factory.contexts)) {
    // already pending
    factory.contexts.push(context);
  } else {
    var contexts = factory.contexts = [context];
    var sync = true;

    var forceRender = function () {
      for (var i = 0, l = contexts.length; i < l; i++) {
        contexts[i].$forceUpdate();
      }
    };

    var resolve = once(function (res) {
      // cache resolved
      factory.resolved = ensureCtor(res, baseCtor);
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        forceRender();
      }
    });

    var reject = once(function (reason) {
      "development" !== 'production' && warn(
        "Failed to resolve async component: " + (String(factory)) +
        (reason ? ("\nReason: " + reason) : '')
      );
      if (isDef(factory.errorComp)) {
        factory.error = true;
        forceRender();
      }
    });

    var res = factory(resolve, reject);

    if (isObject(res)) {
      if (typeof res.then === 'function') {
        // () => Promise
        if (isUndef(factory.resolved)) {
          res.then(resolve, reject);
        }
      } else if (isDef(res.component) && typeof res.component.then === 'function') {
        res.component.then(resolve, reject);

        if (isDef(res.error)) {
          factory.errorComp = ensureCtor(res.error, baseCtor);
        }

        if (isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor);
          if (res.delay === 0) {
            factory.loading = true;
          } else {
            setTimeout(function () {
              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true;
                forceRender();
              }
            }, res.delay || 200);
          }
        }

        if (isDef(res.timeout)) {
          setTimeout(function () {
            if (isUndef(factory.resolved)) {
              reject(
                 true
                  ? ("timeout (" + (res.timeout) + "ms)")
                  : null
              );
            }
          }, res.timeout);
        }
      }
    }

    sync = false;
    // return in case resolved synchronously
    return factory.loading
      ? factory.loadingComp
      : factory.resolved
  }
}

/*  */

function getFirstComponentChild (children) {
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (isDef(c) && isDef(c.componentOptions)) {
        return c
      }
    }
  }
}

/*  */

/*  */

function initEvents (vm) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  // init parent attached events
  var listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

var target;

function add (event, fn, once$$1) {
  if (once$$1) {
    target.$once(event, fn);
  } else {
    target.$on(event, fn);
  }
}

function remove$1 (event, fn) {
  target.$off(event, fn);
}

function updateComponentListeners (
  vm,
  listeners,
  oldListeners
) {
  target = vm;
  updateListeners(listeners, oldListeners || {}, add, remove$1, vm);
}

function eventsMixin (Vue) {
  var hookRE = /^hook:/;
  Vue.prototype.$on = function (event, fn) {
    var this$1 = this;

    var vm = this;
    if (Array.isArray(event)) {
      for (var i = 0, l = event.length; i < l; i++) {
        this$1.$on(event[i], fn);
      }
    } else {
      (vm._events[event] || (vm._events[event] = [])).push(fn);
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        vm._hasHookEvent = true;
      }
    }
    return vm
  };

  Vue.prototype.$once = function (event, fn) {
    var vm = this;
    function on () {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }
    on.fn = fn;
    vm.$on(event, on);
    return vm
  };

  Vue.prototype.$off = function (event, fn) {
    var this$1 = this;

    var vm = this;
    // all
    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm
    }
    // array of events
    if (Array.isArray(event)) {
      for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
        this$1.$off(event[i$1], fn);
      }
      return vm
    }
    // specific event
    var cbs = vm._events[event];
    if (!cbs) {
      return vm
    }
    if (arguments.length === 1) {
      vm._events[event] = null;
      return vm
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break
      }
    }
    return vm
  };

  Vue.prototype.$emit = function (event) {
    var vm = this;
    if (true) {
      var lowerCaseEvent = event.toLowerCase();
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          "Event \"" + lowerCaseEvent + "\" is emitted in component " +
          (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
          "Note that HTML attributes are case-insensitive and you cannot use " +
          "v-on to listen to camelCase events when using in-DOM templates. " +
          "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
        );
      }
    }
    var cbs = vm._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      for (var i = 0, l = cbs.length; i < l; i++) {
        try {
          cbs[i].apply(vm, args);
        } catch (e) {
          handleError(e, vm, ("event handler for \"" + event + "\""));
        }
      }
    }
    return vm
  };
}

/*  */

/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
function resolveSlots (
  children,
  context
) {
  var slots = {};
  if (!children) {
    return slots
  }
  var defaultSlot = [];
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i];
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.functionalContext === context) &&
      child.data && child.data.slot != null
    ) {
      var name = child.data.slot;
      var slot = (slots[name] || (slots[name] = []));
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children);
      } else {
        slot.push(child);
      }
    } else {
      defaultSlot.push(child);
    }
  }
  // ignore whitespace
  if (!defaultSlot.every(isWhitespace)) {
    slots.default = defaultSlot;
  }
  return slots
}

function isWhitespace (node) {
  return node.isComment || node.text === ' '
}

function resolveScopedSlots (
  fns, // see flow/vnode
  res
) {
  res = res || {};
  for (var i = 0; i < fns.length; i++) {
    if (Array.isArray(fns[i])) {
      resolveScopedSlots(fns[i], res);
    } else {
      res[fns[i].key] = fns[i].fn;
    }
  }
  return res
}

/*  */

var activeInstance = null;
var isUpdatingChildComponent = false;

function initLifecycle (vm) {
  var options = vm.$options;

  // locate first non-abstract parent
  var parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  vm.$children = [];
  vm.$refs = {};

  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

function lifecycleMixin (Vue) {
  Vue.prototype._update = function (vnode, hydrating) {
    var vm = this;
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate');
    }
    var prevEl = vm.$el;
    var prevVnode = vm._vnode;
    var prevActiveInstance = activeInstance;
    activeInstance = vm;
    vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(
        vm.$el, vnode, hydrating, false /* removeOnly */,
        vm.$options._parentElm,
        vm.$options._refElm
      );
      // no need for the ref nodes after initial patch
      // this prevents keeping a detached DOM tree in memory (#5851)
      vm.$options._parentElm = vm.$options._refElm = null;
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    activeInstance = prevActiveInstance;
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  };

  Vue.prototype.$forceUpdate = function () {
    var vm = this;
    if (vm._watcher) {
      vm._watcher.update();
    }
  };

  Vue.prototype.$destroy = function () {
    var vm = this;
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true;
    // remove self from parent
    var parent = vm.$parent;
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm);
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown();
    }
    var i = vm._watchers.length;
    while (i--) {
      vm._watchers[i].teardown();
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    }
    // call the last hook...
    vm._isDestroyed = true;
    // invoke destroy hooks on current rendered tree
    vm.__patch__(vm._vnode, null);
    // fire destroyed hook
    callHook(vm, 'destroyed');
    // turn off all instance listeners.
    vm.$off();
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null;
    }
  };
}

function mountComponent (
  vm,
  el,
  hydrating
) {
  vm.$el = el;
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
    if (true) {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        );
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        );
      }
    }
  }
  callHook(vm, 'beforeMount');

  var updateComponent;
  /* istanbul ignore if */
  if ("development" !== 'production' && config.performance && mark) {
    updateComponent = function () {
      var name = vm._name;
      var id = vm._uid;
      var startTag = "vue-perf-start:" + id;
      var endTag = "vue-perf-end:" + id;

      mark(startTag);
      var vnode = vm._render();
      mark(endTag);
      measure((name + " render"), startTag, endTag);

      mark(startTag);
      vm._update(vnode, hydrating);
      mark(endTag);
      measure((name + " patch"), startTag, endTag);
    };
  } else {
    updateComponent = function () {
      vm._update(vm._render(), hydrating);
    };
  }

  vm._watcher = new Watcher(vm, updateComponent, noop);
  hydrating = false;

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }
  return vm
}

function updateChildComponent (
  vm,
  propsData,
  listeners,
  parentVnode,
  renderChildren
) {
  if (true) {
    isUpdatingChildComponent = true;
  }

  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren
  var hasChildren = !!(
    renderChildren ||               // has new static slots
    vm.$options._renderChildren ||  // has old static slots
    parentVnode.data.scopedSlots || // has new scoped slots
    vm.$scopedSlots !== emptyObject // has old scoped slots
  );

  vm.$options._parentVnode = parentVnode;
  vm.$vnode = parentVnode; // update vm's placeholder node without re-render

  if (vm._vnode) { // update child tree's parent
    vm._vnode.parent = parentVnode;
  }
  vm.$options._renderChildren = renderChildren;

  // update $attrs and $listensers hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  vm.$attrs = parentVnode.data && parentVnode.data.attrs;
  vm.$listeners = listeners;

  // update props
  if (propsData && vm.$options.props) {
    observerState.shouldConvert = false;
    var props = vm._props;
    var propKeys = vm.$options._propKeys || [];
    for (var i = 0; i < propKeys.length; i++) {
      var key = propKeys[i];
      props[key] = validateProp(key, vm.$options.props, propsData, vm);
    }
    observerState.shouldConvert = true;
    // keep a copy of raw propsData
    vm.$options.propsData = propsData;
  }

  // update listeners
  if (listeners) {
    var oldListeners = vm.$options._parentListeners;
    vm.$options._parentListeners = listeners;
    updateComponentListeners(vm, listeners, oldListeners);
  }
  // resolve slots + force update if has children
  if (hasChildren) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context);
    vm.$forceUpdate();
  }

  if (true) {
    isUpdatingChildComponent = false;
  }
}

function isInInactiveTree (vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) { return true }
  }
  return false
}

function activateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = false;
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false;
    for (var i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'activated');
  }
}

function deactivateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = true;
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true;
    for (var i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'deactivated');
  }
}

function callHook (vm, hook) {
  var handlers = vm.$options[hook];
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      try {
        handlers[i].call(vm);
      } catch (e) {
        handleError(e, vm, (hook + " hook"));
      }
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook);
  }
}

/*  */


var MAX_UPDATE_COUNT = 100;

var queue = [];
var activatedChildren = [];
var has = {};
var circular = {};
var waiting = false;
var flushing = false;
var index = 0;

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0;
  has = {};
  if (true) {
    circular = {};
  }
  waiting = flushing = false;
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue () {
  flushing = true;
  var watcher, id;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(function (a, b) { return a.id - b.id; });

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if ("development" !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? ("in watcher with expression \"" + (watcher.expression) + "\"")
              : "in a component render function."
          ),
          watcher.vm
        );
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  var activatedQueue = activatedChildren.slice();
  var updatedQueue = queue.slice();

  resetSchedulerState();

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue);
  callUpdatedHooks(updatedQueue);

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush');
  }
}

function callUpdatedHooks (queue) {
  var i = queue.length;
  while (i--) {
    var watcher = queue[i];
    var vm = watcher.vm;
    if (vm._watcher === watcher && vm._isMounted) {
      callHook(vm, 'updated');
    }
  }
}

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
function queueActivatedComponent (vm) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false;
  activatedChildren.push(vm);
}

function callActivatedHooks (queue) {
  for (var i = 0; i < queue.length; i++) {
    queue[i]._inactive = true;
    activateChildComponent(queue[i], true /* true */);
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
function queueWatcher (watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1;
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}

/*  */

var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
var Watcher = function Watcher (
  vm,
  expOrFn,
  cb,
  options
) {
  this.vm = vm;
  vm._watchers.push(this);
  // options
  if (options) {
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.sync = !!options.sync;
  } else {
    this.deep = this.user = this.lazy = this.sync = false;
  }
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.expression =  true
    ? expOrFn.toString()
    : '';
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = function () {};
      "development" !== 'production' && warn(
        "Failed watching path: \"" + expOrFn + "\" " +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
      );
    }
  }
  this.value = this.lazy
    ? undefined
    : this.get();
};

/**
 * Evaluate the getter, and re-collect dependencies.
 */
Watcher.prototype.get = function get () {
  pushTarget(this);
  var value;
  var vm = this.vm;
  try {
    value = this.getter.call(vm, vm);
  } catch (e) {
    if (this.user) {
      handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value);
    }
    popTarget();
    this.cleanupDeps();
  }
  return value
};

/**
 * Add a dependency to this directive.
 */
Watcher.prototype.addDep = function addDep (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

/**
 * Clean up for dependency collection.
 */
Watcher.prototype.cleanupDeps = function cleanupDeps () {
    var this$1 = this;

  var i = this.deps.length;
  while (i--) {
    var dep = this$1.deps[i];
    if (!this$1.newDepIds.has(dep.id)) {
      dep.removeSub(this$1);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
Watcher.prototype.update = function update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};

/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
Watcher.prototype.run = function run () {
  if (this.active) {
    var value = this.get();
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          handleError(e, this.vm, ("callback for watcher \"" + (this.expression) + "\""));
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */
Watcher.prototype.evaluate = function evaluate () {
  this.value = this.get();
  this.dirty = false;
};

/**
 * Depend on all deps collected by this watcher.
 */
Watcher.prototype.depend = function depend () {
    var this$1 = this;

  var i = this.deps.length;
  while (i--) {
    this$1.deps[i].depend();
  }
};

/**
 * Remove self from all dependencies' subscriber list.
 */
Watcher.prototype.teardown = function teardown () {
    var this$1 = this;

  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed.
    if (!this.vm._isBeingDestroyed) {
      remove(this.vm._watchers, this);
    }
    var i = this.deps.length;
    while (i--) {
      this$1.deps[i].removeSub(this$1);
    }
    this.active = false;
  }
};

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
var seenObjects = new _Set();
function traverse (val) {
  seenObjects.clear();
  _traverse(val, seenObjects);
}

function _traverse (val, seen) {
  var i, keys;
  var isA = Array.isArray(val);
  if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
    return
  }
  if (val.__ob__) {
    var depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) { _traverse(val[i], seen); }
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) { _traverse(val[keys[i]], seen); }
  }
}

/*  */

var sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  };
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function initState (vm) {
  vm._watchers = [];
  var opts = vm.$options;
  if (opts.props) { initProps(vm, opts.props); }
  if (opts.methods) { initMethods(vm, opts.methods); }
  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true /* asRootData */);
  }
  if (opts.computed) { initComputed(vm, opts.computed); }
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}

function checkOptionType (vm, name) {
  var option = vm.$options[name];
  if (!isPlainObject(option)) {
    warn(
      ("component option \"" + name + "\" should be an object."),
      vm
    );
  }
}

function initProps (vm, propsOptions) {
  var propsData = vm.$options.propsData || {};
  var props = vm._props = {};
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  var keys = vm.$options._propKeys = [];
  var isRoot = !vm.$parent;
  // root instance props should be converted
  observerState.shouldConvert = isRoot;
  var loop = function ( key ) {
    keys.push(key);
    var value = validateProp(key, propsOptions, propsData, vm);
    /* istanbul ignore else */
    if (true) {
      if (isReservedAttribute(key) || config.isReservedAttr(key)) {
        warn(
          ("\"" + key + "\" is a reserved attribute and cannot be used as component prop."),
          vm
        );
      }
      defineReactive$$1(props, key, value, function () {
        if (vm.$parent && !isUpdatingChildComponent) {
          warn(
            "Avoid mutating a prop directly since the value will be " +
            "overwritten whenever the parent component re-renders. " +
            "Instead, use a data or computed property based on the prop's " +
            "value. Prop being mutated: \"" + key + "\"",
            vm
          );
        }
      });
    } else {
      defineReactive$$1(props, key, value);
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      proxy(vm, "_props", key);
    }
  };

  for (var key in propsOptions) loop( key );
  observerState.shouldConvert = true;
}

function initData (vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {};
  if (!isPlainObject(data)) {
    data = {};
    "development" !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    );
  }
  // proxy data on instance
  var keys = Object.keys(data);
  var props = vm.$options.props;
  var methods = vm.$options.methods;
  var i = keys.length;
  while (i--) {
    var key = keys[i];
    if (true) {
      if (methods && hasOwn(methods, key)) {
        warn(
          ("method \"" + key + "\" has already been defined as a data property."),
          vm
        );
      }
    }
    if (props && hasOwn(props, key)) {
      "development" !== 'production' && warn(
        "The data property \"" + key + "\" is already declared as a prop. " +
        "Use prop default value instead.",
        vm
      );
    } else if (!isReserved(key)) {
      proxy(vm, "_data", key);
    }
  }
  // observe data
  observe(data, true /* asRootData */);
}

function getData (data, vm) {
  try {
    return data.call(vm)
  } catch (e) {
    handleError(e, vm, "data()");
    return {}
  }
}

var computedWatcherOptions = { lazy: true };

function initComputed (vm, computed) {
  "development" !== 'production' && checkOptionType(vm, 'computed');
  var watchers = vm._computedWatchers = Object.create(null);

  for (var key in computed) {
    var userDef = computed[key];
    var getter = typeof userDef === 'function' ? userDef : userDef.get;
    if ("development" !== 'production' && getter == null) {
      warn(
        ("Getter is missing for computed property \"" + key + "\"."),
        vm
      );
    }
    // create internal watcher for the computed property.
    watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions);

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    } else if (true) {
      if (key in vm.$data) {
        warn(("The computed property \"" + key + "\" is already defined in data."), vm);
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
      }
    }
  }
}

function defineComputed (target, key, userDef) {
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = createComputedGetter(key);
    sharedPropertyDefinition.set = noop;
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? userDef.cache !== false
        ? createComputedGetter(key)
        : userDef.get
      : noop;
    sharedPropertyDefinition.set = userDef.set
      ? userDef.set
      : noop;
  }
  if ("development" !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        ("Computed property \"" + key + "\" was assigned to but it has no setter."),
        this
      );
    };
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter (key) {
  return function computedGetter () {
    var watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value
    }
  }
}

function initMethods (vm, methods) {
  "development" !== 'production' && checkOptionType(vm, 'methods');
  var props = vm.$options.props;
  for (var key in methods) {
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm);
    if (true) {
      if (methods[key] == null) {
        warn(
          "method \"" + key + "\" has an undefined value in the component definition. " +
          "Did you reference the function correctly?",
          vm
        );
      }
      if (props && hasOwn(props, key)) {
        warn(
          ("method \"" + key + "\" has already been defined as a prop."),
          vm
        );
      }
    }
  }
}

function initWatch (vm, watch) {
  "development" !== 'production' && checkOptionType(vm, 'watch');
  for (var key in watch) {
    var handler = watch[key];
    if (Array.isArray(handler)) {
      for (var i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher (
  vm,
  keyOrFn,
  handler,
  options
) {
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  return vm.$watch(keyOrFn, handler, options)
}

function stateMixin (Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  var dataDef = {};
  dataDef.get = function () { return this._data };
  var propsDef = {};
  propsDef.get = function () { return this._props };
  if (true) {
    dataDef.set = function (newData) {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      );
    };
    propsDef.set = function () {
      warn("$props is readonly.", this);
    };
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef);
  Object.defineProperty(Vue.prototype, '$props', propsDef);

  Vue.prototype.$set = set;
  Vue.prototype.$delete = del;

  Vue.prototype.$watch = function (
    expOrFn,
    cb,
    options
  ) {
    var vm = this;
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn () {
      watcher.teardown();
    }
  };
}

/*  */

function initProvide (vm) {
  var provide = vm.$options.provide;
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide;
  }
}

function initInjections (vm) {
  var result = resolveInject(vm.$options.inject, vm);
  if (result) {
    observerState.shouldConvert = false;
    Object.keys(result).forEach(function (key) {
      /* istanbul ignore else */
      if (true) {
        defineReactive$$1(vm, key, result[key], function () {
          warn(
            "Avoid mutating an injected value directly since the changes will be " +
            "overwritten whenever the provided component re-renders. " +
            "injection being mutated: \"" + key + "\"",
            vm
          );
        });
      } else {
        defineReactive$$1(vm, key, result[key]);
      }
    });
    observerState.shouldConvert = true;
  }
}

function resolveInject (inject, vm) {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    var result = Object.create(null);
    var keys = hasSymbol
        ? Reflect.ownKeys(inject)
        : Object.keys(inject);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var provideKey = inject[key];
      var source = vm;
      while (source) {
        if (source._provided && provideKey in source._provided) {
          result[key] = source._provided[provideKey];
          break
        }
        source = source.$parent;
      }
      if ("development" !== 'production' && !source) {
        warn(("Injection \"" + key + "\" not found"), vm);
      }
    }
    return result
  }
}

/*  */

function createFunctionalComponent (
  Ctor,
  propsData,
  data,
  context,
  children
) {
  var props = {};
  var propOptions = Ctor.options.props;
  if (isDef(propOptions)) {
    for (var key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || {});
    }
  } else {
    if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
    if (isDef(data.props)) { mergeProps(props, data.props); }
  }
  // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
  var _context = Object.create(context);
  var h = function (a, b, c, d) { return createElement(_context, a, b, c, d, true); };
  var vnode = Ctor.options.render.call(null, h, {
    data: data,
    props: props,
    children: children,
    parent: context,
    listeners: data.on || {},
    injections: resolveInject(Ctor.options.inject, context),
    slots: function () { return resolveSlots(children, context); }
  });
  if (vnode instanceof VNode) {
    vnode.functionalContext = context;
    vnode.functionalOptions = Ctor.options;
    if (data.slot) {
      (vnode.data || (vnode.data = {})).slot = data.slot;
    }
  }
  return vnode
}

function mergeProps (to, from) {
  for (var key in from) {
    to[camelize(key)] = from[key];
  }
}

/*  */

// hooks to be invoked on component VNodes during patch
var componentVNodeHooks = {
  init: function init (
    vnode,
    hydrating,
    parentElm,
    refElm
  ) {
    if (!vnode.componentInstance || vnode.componentInstance._isDestroyed) {
      var child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance,
        parentElm,
        refElm
      );
      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
    } else if (vnode.data.keepAlive) {
      // kept-alive components, treat as a patch
      var mountedNode = vnode; // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode);
    }
  },

  prepatch: function prepatch (oldVnode, vnode) {
    var options = vnode.componentOptions;
    var child = vnode.componentInstance = oldVnode.componentInstance;
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    );
  },

  insert: function insert (vnode) {
    var context = vnode.context;
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true;
      callHook(componentInstance, 'mounted');
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance);
      } else {
        activateChildComponent(componentInstance, true /* direct */);
      }
    }
  },

  destroy: function destroy (vnode) {
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy();
      } else {
        deactivateChildComponent(componentInstance, true /* direct */);
      }
    }
  }
};

var hooksToMerge = Object.keys(componentVNodeHooks);

function createComponent (
  Ctor,
  data,
  context,
  children,
  tag
) {
  if (isUndef(Ctor)) {
    return
  }

  var baseCtor = context.$options._base;

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  if (typeof Ctor !== 'function') {
    if (true) {
      warn(("Invalid Component definition: " + (String(Ctor))), context);
    }
    return
  }

  // async component
  var asyncFactory;
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor;
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context);
    if (Ctor === undefined) {
      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }

  data = data || {};

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor);

  // transform component v-model data into props & events
  if (isDef(data.model)) {
    transformModel(Ctor.options, data);
  }

  // extract props
  var propsData = extractPropsFromVNodeData(data, Ctor, tag);

  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  var listeners = data.on;
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn;

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot

    // work around flow
    var slot = data.slot;
    data = {};
    if (slot) {
      data.slot = slot;
    }
  }

  // merge component management hooks onto the placeholder node
  mergeHooks(data);

  // return a placeholder vnode
  var name = Ctor.options.name || tag;
  var vnode = new VNode(
    ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
    data, undefined, undefined, undefined, context,
    { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
    asyncFactory
  );
  return vnode
}

function createComponentInstanceForVnode (
  vnode, // we know it's MountedComponentVNode but flow doesn't
  parent, // activeInstance in lifecycle state
  parentElm,
  refElm
) {
  var vnodeComponentOptions = vnode.componentOptions;
  var options = {
    _isComponent: true,
    parent: parent,
    propsData: vnodeComponentOptions.propsData,
    _componentTag: vnodeComponentOptions.tag,
    _parentVnode: vnode,
    _parentListeners: vnodeComponentOptions.listeners,
    _renderChildren: vnodeComponentOptions.children,
    _parentElm: parentElm || null,
    _refElm: refElm || null
  };
  // check inline-template render functions
  var inlineTemplate = vnode.data.inlineTemplate;
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }
  return new vnodeComponentOptions.Ctor(options)
}

function mergeHooks (data) {
  if (!data.hook) {
    data.hook = {};
  }
  for (var i = 0; i < hooksToMerge.length; i++) {
    var key = hooksToMerge[i];
    var fromParent = data.hook[key];
    var ours = componentVNodeHooks[key];
    data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours;
  }
}

function mergeHook$1 (one, two) {
  return function (a, b, c, d) {
    one(a, b, c, d);
    two(a, b, c, d);
  }
}

// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel (options, data) {
  var prop = (options.model && options.model.prop) || 'value';
  var event = (options.model && options.model.event) || 'input';(data.props || (data.props = {}))[prop] = data.model.value;
  var on = data.on || (data.on = {});
  if (isDef(on[event])) {
    on[event] = [data.model.callback].concat(on[event]);
  } else {
    on[event] = data.model.callback;
  }
}

/*  */

var SIMPLE_NORMALIZE = 1;
var ALWAYS_NORMALIZE = 2;

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
function createElement (
  context,
  tag,
  data,
  children,
  normalizationType,
  alwaysNormalize
) {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    children = data;
    data = undefined;
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE;
  }
  return _createElement(context, tag, data, children, normalizationType)
}

function _createElement (
  context,
  tag,
  data,
  children,
  normalizationType
) {
  if (isDef(data) && isDef((data).__ob__)) {
    "development" !== 'production' && warn(
      "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
      'Always create fresh vnode data objects in each render!',
      context
    );
    return createEmptyVNode()
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is;
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  if ("development" !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    warn(
      'Avoid using non-primitive value as key, ' +
      'use string/number value instead.',
      context
    );
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {};
    data.scopedSlots = { default: children[0] };
    children.length = 0;
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children);
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }
  var vnode, ns;
  if (typeof tag === 'string') {
    var Ctor;
    ns = config.getTagNamespace(tag);
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      );
    } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      );
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children);
  }
  if (isDef(vnode)) {
    if (ns) { applyNS(vnode, ns); }
    return vnode
  } else {
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns) {
  vnode.ns = ns;
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    return
  }
  if (isDef(vnode.children)) {
    for (var i = 0, l = vnode.children.length; i < l; i++) {
      var child = vnode.children[i];
      if (isDef(child.tag) && isUndef(child.ns)) {
        applyNS(child, ns);
      }
    }
  }
}

/*  */

/**
 * Runtime helper for rendering v-for lists.
 */
function renderList (
  val,
  render
) {
  var ret, i, l, keys, key;
  if (Array.isArray(val) || typeof val === 'string') {
    ret = new Array(val.length);
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === 'number') {
    ret = new Array(val);
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    keys = Object.keys(val);
    ret = new Array(keys.length);
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      ret[i] = render(val[key], key, i);
    }
  }
  if (isDef(ret)) {
    (ret)._isVList = true;
  }
  return ret
}

/*  */

/**
 * Runtime helper for rendering <slot>
 */
function renderSlot (
  name,
  fallback,
  props,
  bindObject
) {
  var scopedSlotFn = this.$scopedSlots[name];
  if (scopedSlotFn) { // scoped slot
    props = props || {};
    if (bindObject) {
      props = extend(extend({}, bindObject), props);
    }
    return scopedSlotFn(props) || fallback
  } else {
    var slotNodes = this.$slots[name];
    // warn duplicate slot usage
    if (slotNodes && "development" !== 'production') {
      slotNodes._rendered && warn(
        "Duplicate presence of slot \"" + name + "\" found in the same render tree " +
        "- this will likely cause render errors.",
        this
      );
      slotNodes._rendered = true;
    }
    return slotNodes || fallback
  }
}

/*  */

/**
 * Runtime helper for resolving filters
 */
function resolveFilter (id) {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}

/*  */

/**
 * Runtime helper for checking keyCodes from config.
 */
function checkKeyCodes (
  eventKeyCode,
  key,
  builtInAlias
) {
  var keyCodes = config.keyCodes[key] || builtInAlias;
  if (Array.isArray(keyCodes)) {
    return keyCodes.indexOf(eventKeyCode) === -1
  } else {
    return keyCodes !== eventKeyCode
  }
}

/*  */

/**
 * Runtime helper for merging v-bind="object" into a VNode's data.
 */
function bindObjectProps (
  data,
  tag,
  value,
  asProp,
  isSync
) {
  if (value) {
    if (!isObject(value)) {
      "development" !== 'production' && warn(
        'v-bind without argument expects an Object or Array value',
        this
      );
    } else {
      if (Array.isArray(value)) {
        value = toObject(value);
      }
      var hash;
      var loop = function ( key ) {
        if (
          key === 'class' ||
          key === 'style' ||
          isReservedAttribute(key)
        ) {
          hash = data;
        } else {
          var type = data.attrs && data.attrs.type;
          hash = asProp || config.mustUseProp(tag, type, key)
            ? data.domProps || (data.domProps = {})
            : data.attrs || (data.attrs = {});
        }
        if (!(key in hash)) {
          hash[key] = value[key];

          if (isSync) {
            var on = data.on || (data.on = {});
            on[("update:" + key)] = function ($event) {
              value[key] = $event;
            };
          }
        }
      };

      for (var key in value) loop( key );
    }
  }
  return data
}

/*  */

/**
 * Runtime helper for rendering static trees.
 */
function renderStatic (
  index,
  isInFor
) {
  var tree = this._staticTrees[index];
  // if has already-rendered static tree and not inside v-for,
  // we can reuse the same tree by doing a shallow clone.
  if (tree && !isInFor) {
    return Array.isArray(tree)
      ? cloneVNodes(tree)
      : cloneVNode(tree)
  }
  // otherwise, render a fresh tree.
  tree = this._staticTrees[index] =
    this.$options.staticRenderFns[index].call(this._renderProxy);
  markStatic(tree, ("__static__" + index), false);
  return tree
}

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
function markOnce (
  tree,
  index,
  key
) {
  markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
  return tree
}

function markStatic (
  tree,
  key,
  isOnce
) {
  if (Array.isArray(tree)) {
    for (var i = 0; i < tree.length; i++) {
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], (key + "_" + i), isOnce);
      }
    }
  } else {
    markStaticNode(tree, key, isOnce);
  }
}

function markStaticNode (node, key, isOnce) {
  node.isStatic = true;
  node.key = key;
  node.isOnce = isOnce;
}

/*  */

function bindObjectListeners (data, value) {
  if (value) {
    if (!isPlainObject(value)) {
      "development" !== 'production' && warn(
        'v-on without argument expects an Object value',
        this
      );
    } else {
      var on = data.on = data.on ? extend({}, data.on) : {};
      for (var key in value) {
        var existing = on[key];
        var ours = value[key];
        on[key] = existing ? [].concat(ours, existing) : ours;
      }
    }
  }
  return data
}

/*  */

function initRender (vm) {
  vm._vnode = null; // the root of the child tree
  vm._staticTrees = null;
  var parentVnode = vm.$vnode = vm.$options._parentVnode; // the placeholder node in parent tree
  var renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(vm.$options._renderChildren, renderContext);
  vm.$scopedSlots = emptyObject;
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  var parentData = parentVnode && parentVnode.data;
  /* istanbul ignore else */
  if (true) {
    defineReactive$$1(vm, '$attrs', parentData && parentData.attrs, function () {
      !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
    }, true);
    defineReactive$$1(vm, '$listeners', vm.$options._parentListeners, function () {
      !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
    }, true);
  } else {
    defineReactive$$1(vm, '$attrs', parentData && parentData.attrs, null, true);
    defineReactive$$1(vm, '$listeners', vm.$options._parentListeners, null, true);
  }
}

function renderMixin (Vue) {
  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  };

  Vue.prototype._render = function () {
    var vm = this;
    var ref = vm.$options;
    var render = ref.render;
    var staticRenderFns = ref.staticRenderFns;
    var _parentVnode = ref._parentVnode;

    if (vm._isMounted) {
      // clone slot nodes on re-renders
      for (var key in vm.$slots) {
        vm.$slots[key] = cloneVNodes(vm.$slots[key]);
      }
    }

    vm.$scopedSlots = (_parentVnode && _parentVnode.data.scopedSlots) || emptyObject;

    if (staticRenderFns && !vm._staticTrees) {
      vm._staticTrees = [];
    }
    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode;
    // render self
    var vnode;
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
      handleError(e, vm, "render function");
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if (true) {
        vnode = vm.$options.renderError
          ? vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
          : vm._vnode;
      } else {
        vnode = vm._vnode;
      }
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if ("development" !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        );
      }
      vnode = createEmptyVNode();
    }
    // set parent
    vnode.parent = _parentVnode;
    return vnode
  };

  // internal render helpers.
  // these are exposed on the instance prototype to reduce generated render
  // code size.
  Vue.prototype._o = markOnce;
  Vue.prototype._n = toNumber;
  Vue.prototype._s = toString;
  Vue.prototype._l = renderList;
  Vue.prototype._t = renderSlot;
  Vue.prototype._q = looseEqual;
  Vue.prototype._i = looseIndexOf;
  Vue.prototype._m = renderStatic;
  Vue.prototype._f = resolveFilter;
  Vue.prototype._k = checkKeyCodes;
  Vue.prototype._b = bindObjectProps;
  Vue.prototype._v = createTextVNode;
  Vue.prototype._e = createEmptyVNode;
  Vue.prototype._u = resolveScopedSlots;
  Vue.prototype._g = bindObjectListeners;
}

/*  */

var uid$1 = 0;

function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    var vm = this;
    // a uid
    vm._uid = uid$1++;

    var startTag, endTag;
    /* istanbul ignore if */
    if ("development" !== 'production' && config.performance && mark) {
      startTag = "vue-perf-init:" + (vm._uid);
      endTag = "vue-perf-end:" + (vm._uid);
      mark(startTag);
    }

    // a flag to avoid this being observed
    vm._isVue = true;
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );
    }
    /* istanbul ignore else */
    if (true) {
      initProxy(vm);
    } else {
      vm._renderProxy = vm;
    }
    // expose real self
    vm._self = vm;
    initLifecycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, 'beforeCreate');
    initInjections(vm); // resolve injections before data/props
    initState(vm);
    initProvide(vm); // resolve provide after data/props
    callHook(vm, 'created');

    /* istanbul ignore if */
    if ("development" !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false);
      mark(endTag);
      measure(((vm._name) + " init"), startTag, endTag);
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
}

function initInternalComponent (vm, options) {
  var opts = vm.$options = Object.create(vm.constructor.options);
  // doing this because it's faster than dynamic enumeration.
  opts.parent = options.parent;
  opts.propsData = options.propsData;
  opts._parentVnode = options._parentVnode;
  opts._parentListeners = options._parentListeners;
  opts._renderChildren = options._renderChildren;
  opts._componentTag = options._componentTag;
  opts._parentElm = options._parentElm;
  opts._refElm = options._refElm;
  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}

function resolveConstructorOptions (Ctor) {
  var options = Ctor.options;
  if (Ctor.super) {
    var superOptions = resolveConstructorOptions(Ctor.super);
    var cachedSuperOptions = Ctor.superOptions;
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions;
      // check if there are any late-modified/attached options (#4976)
      var modifiedOptions = resolveModifiedOptions(Ctor);
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions);
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor) {
  var modified;
  var latest = Ctor.options;
  var extended = Ctor.extendOptions;
  var sealed = Ctor.sealedOptions;
  for (var key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) { modified = {}; }
      modified[key] = dedupe(latest[key], extended[key], sealed[key]);
    }
  }
  return modified
}

function dedupe (latest, extended, sealed) {
  // compare latest and sealed to ensure lifecycle hooks won't be duplicated
  // between merges
  if (Array.isArray(latest)) {
    var res = [];
    sealed = Array.isArray(sealed) ? sealed : [sealed];
    extended = Array.isArray(extended) ? extended : [extended];
    for (var i = 0; i < latest.length; i++) {
      // push original options and not sealed options to exclude duplicated options
      if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
        res.push(latest[i]);
      }
    }
    return res
  } else {
    return latest
  }
}

function Vue$3 (options) {
  if ("development" !== 'production' &&
    !(this instanceof Vue$3)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword');
  }
  this._init(options);
}

initMixin(Vue$3);
stateMixin(Vue$3);
eventsMixin(Vue$3);
lifecycleMixin(Vue$3);
renderMixin(Vue$3);

/*  */

function initUse (Vue) {
  Vue.use = function (plugin) {
    var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args);
    }
    installedPlugins.push(plugin);
    return this
  };
}

/*  */

function initMixin$1 (Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this
  };
}

/*  */

function initExtend (Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var SuperId = Super.cid;
    var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    var name = extendOptions.name || Super.options.name;
    if (true) {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
        warn(
          'Invalid component name: "' + name + '". Component names ' +
          'can only contain alphanumeric characters and the hyphen, ' +
          'and must start with a letter.'
        );
      }
    }

    var Sub = function VueComponent (options) {
      this._init(options);
    };
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    );
    Sub['super'] = Super;

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    if (Sub.options.props) {
      initProps$1(Sub);
    }
    if (Sub.options.computed) {
      initComputed$1(Sub);
    }

    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    Sub.sealedOptions = extend({}, Sub.options);

    // cache constructor
    cachedCtors[SuperId] = Sub;
    return Sub
  };
}

function initProps$1 (Comp) {
  var props = Comp.options.props;
  for (var key in props) {
    proxy(Comp.prototype, "_props", key);
  }
}

function initComputed$1 (Comp) {
  var computed = Comp.options.computed;
  for (var key in computed) {
    defineComputed(Comp.prototype, key, computed[key]);
  }
}

/*  */

function initAssetRegisters (Vue) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(function (type) {
    Vue[type] = function (
      id,
      definition
    ) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (true) {
          if (type === 'component' && config.isReservedTag(id)) {
            warn(
              'Do not use built-in or reserved HTML elements as component ' +
              'id: ' + id
            );
          }
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id;
          definition = this.options._base.extend(definition);
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition };
        }
        this.options[type + 's'][id] = definition;
        return definition
      }
    };
  });
}

/*  */

var patternTypes = [String, RegExp, Array];

function getComponentName (opts) {
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches (pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}

function pruneCache (cache, current, filter) {
  for (var key in cache) {
    var cachedNode = cache[key];
    if (cachedNode) {
      var name = getComponentName(cachedNode.componentOptions);
      if (name && !filter(name)) {
        if (cachedNode !== current) {
          pruneCacheEntry(cachedNode);
        }
        cache[key] = null;
      }
    }
  }
}

function pruneCacheEntry (vnode) {
  if (vnode) {
    vnode.componentInstance.$destroy();
  }
}

var KeepAlive = {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes
  },

  created: function created () {
    this.cache = Object.create(null);
  },

  destroyed: function destroyed () {
    var this$1 = this;

    for (var key in this$1.cache) {
      pruneCacheEntry(this$1.cache[key]);
    }
  },

  watch: {
    include: function include (val) {
      pruneCache(this.cache, this._vnode, function (name) { return matches(val, name); });
    },
    exclude: function exclude (val) {
      pruneCache(this.cache, this._vnode, function (name) { return !matches(val, name); });
    }
  },

  render: function render () {
    var vnode = getFirstComponentChild(this.$slots.default);
    var componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
      // check pattern
      var name = getComponentName(componentOptions);
      if (name && (
        (this.include && !matches(this.include, name)) ||
        (this.exclude && matches(this.exclude, name))
      )) {
        return vnode
      }
      var key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
        : vnode.key;
      if (this.cache[key]) {
        vnode.componentInstance = this.cache[key].componentInstance;
      } else {
        this.cache[key] = vnode;
      }
      vnode.data.keepAlive = true;
    }
    return vnode
  }
};

var builtInComponents = {
  KeepAlive: KeepAlive
};

/*  */

function initGlobalAPI (Vue) {
  // config
  var configDef = {};
  configDef.get = function () { return config; };
  if (true) {
    configDef.set = function () {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      );
    };
  }
  Object.defineProperty(Vue, 'config', configDef);

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn: warn,
    extend: extend,
    mergeOptions: mergeOptions,
    defineReactive: defineReactive$$1
  };

  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  Vue.options = Object.create(null);
  ASSET_TYPES.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null);
  });

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue;

  extend(Vue.options.components, builtInComponents);

  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}

initGlobalAPI(Vue$3);

Object.defineProperty(Vue$3.prototype, '$isServer', {
  get: isServerRendering
});

Object.defineProperty(Vue$3.prototype, '$ssrContext', {
  get: function get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
});

Vue$3.version = '2.4.2';

/*  */

// these are reserved for web because they are directly compiled away
// during template compilation
var isReservedAttr = makeMap('style,class');

// attributes that should be using props for binding
var acceptValue = makeMap('input,textarea,option,select');
var mustUseProp = function (tag, type, attr) {
  return (
    (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
  )
};

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

var isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,translate,' +
  'truespeed,typemustmatch,visible'
);

var xlinkNS = 'http://www.w3.org/1999/xlink';

var isXlink = function (name) {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
};

var getXlinkProp = function (name) {
  return isXlink(name) ? name.slice(6, name.length) : ''
};

var isFalsyAttrValue = function (val) {
  return val == null || val === false
};

/*  */

function genClassForVnode (vnode) {
  var data = vnode.data;
  var parentNode = vnode;
  var childNode = vnode;
  while (isDef(childNode.componentInstance)) {
    childNode = childNode.componentInstance._vnode;
    if (childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }
  while (isDef(parentNode = parentNode.parent)) {
    if (parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }
  return renderClass(data.staticClass, data.class)
}

function mergeClassData (child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: isDef(child.class)
      ? [child.class, parent.class]
      : parent.class
  }
}

function renderClass (
  staticClass,
  dynamicClass
) {
  if (isDef(staticClass) || isDef(dynamicClass)) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
  /* istanbul ignore next */
  return ''
}

function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function stringifyClass (value) {
  if (Array.isArray(value)) {
    return stringifyArray(value)
  }
  if (isObject(value)) {
    return stringifyObject(value)
  }
  if (typeof value === 'string') {
    return value
  }
  /* istanbul ignore next */
  return ''
}

function stringifyArray (value) {
  var res = '';
  var stringified;
  for (var i = 0, l = value.length; i < l; i++) {
    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
      if (res) { res += ' '; }
      res += stringified;
    }
  }
  return res
}

function stringifyObject (value) {
  var res = '';
  for (var key in value) {
    if (value[key]) {
      if (res) { res += ' '; }
      res += key;
    }
  }
  return res
}

/*  */

var namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
};

var isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template,blockquote,iframe,tfoot'
);

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
var isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
  'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
);

var isPreTag = function (tag) { return tag === 'pre'; };

var isReservedTag = function (tag) {
  return isHTMLTag(tag) || isSVG(tag)
};

function getTagNamespace (tag) {
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}

var unknownElementCache = Object.create(null);
function isUnknownElement (tag) {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true
  }
  if (isReservedTag(tag)) {
    return false
  }
  tag = tag.toLowerCase();
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  var el = document.createElement(tag);
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
  }
}

/*  */

/**
 * Query an element selector if it's not an element already.
 */
function query (el) {
  if (typeof el === 'string') {
    var selected = document.querySelector(el);
    if (!selected) {
      "development" !== 'production' && warn(
        'Cannot find element: ' + el
      );
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}

/*  */

function createElement$1 (tagName, vnode) {
  var elm = document.createElement(tagName);
  if (tagName !== 'select') {
    return elm
  }
  // false or null will remove the attribute but undefined will not
  if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
    elm.setAttribute('multiple', 'multiple');
  }
  return elm
}

function createElementNS (namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName)
}

function createTextNode (text) {
  return document.createTextNode(text)
}

function createComment (text) {
  return document.createComment(text)
}

function insertBefore (parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild (node, child) {
  node.removeChild(child);
}

function appendChild (node, child) {
  node.appendChild(child);
}

function parentNode (node) {
  return node.parentNode
}

function nextSibling (node) {
  return node.nextSibling
}

function tagName (node) {
  return node.tagName
}

function setTextContent (node, text) {
  node.textContent = text;
}

function setAttribute (node, key, val) {
  node.setAttribute(key, val);
}


var nodeOps = Object.freeze({
	createElement: createElement$1,
	createElementNS: createElementNS,
	createTextNode: createTextNode,
	createComment: createComment,
	insertBefore: insertBefore,
	removeChild: removeChild,
	appendChild: appendChild,
	parentNode: parentNode,
	nextSibling: nextSibling,
	tagName: tagName,
	setTextContent: setTextContent,
	setAttribute: setAttribute
});

/*  */

var ref = {
  create: function create (_, vnode) {
    registerRef(vnode);
  },
  update: function update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy: function destroy (vnode) {
    registerRef(vnode, true);
  }
};

function registerRef (vnode, isRemoval) {
  var key = vnode.data.ref;
  if (!key) { return }

  var vm = vnode.context;
  var ref = vnode.componentInstance || vnode.elm;
  var refs = vm.$refs;
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref);
    } else if (refs[key] === ref) {
      refs[key] = undefined;
    }
  } else {
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref];
      } else if (refs[key].indexOf(ref) < 0) {
        // $flow-disable-line
        refs[key].push(ref);
      }
    } else {
      refs[key] = ref;
    }
  }
}

/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *

/*
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

var emptyNode = new VNode('', {}, []);

var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

function sameVnode (a, b) {
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}

// Some browsers do not support dynamically changing type for <input>
// so they need to be treated as different nodes
function sameInputType (a, b) {
  if (a.tag !== 'input') { return true }
  var i;
  var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
  var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
  return typeA === typeB
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  var i, key;
  var map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) { map[key] = i; }
  }
  return map
}

function createPatchFunction (backend) {
  var i, j;
  var cbs = {};

  var modules = backend.modules;
  var nodeOps = backend.nodeOps;

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]]);
      }
    }
  }

  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  function createRmCb (childElm, listeners) {
    function remove$$1 () {
      if (--remove$$1.listeners === 0) {
        removeNode(childElm);
      }
    }
    remove$$1.listeners = listeners;
    return remove$$1
  }

  function removeNode (el) {
    var parent = nodeOps.parentNode(el);
    // element may have already been removed due to v-html / v-text
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el);
    }
  }

  var inPre = 0;
  function createElm (vnode, insertedVnodeQueue, parentElm, refElm, nested) {
    vnode.isRootInsert = !nested; // for transition enter check
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    var data = vnode.data;
    var children = vnode.children;
    var tag = vnode.tag;
    if (isDef(tag)) {
      if (true) {
        if (data && data.pre) {
          inPre++;
        }
        if (
          !inPre &&
          !vnode.ns &&
          !(config.ignoredElements.length && config.ignoredElements.indexOf(tag) > -1) &&
          config.isUnknownElement(tag)
        ) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          );
        }
      }
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode);
      setScope(vnode);

      /* istanbul ignore if */
      {
        createChildren(vnode, children, insertedVnodeQueue);
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        insert(parentElm, vnode.elm, refElm);
      }

      if ("development" !== 'production' && data && data.pre) {
        inPre--;
      }
    } else if (isTrue(vnode.isComment)) {
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i = vnode.data;
    if (isDef(i)) {
      var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false /* hydrating */, parentElm, refElm);
      }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue);
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true
      }
    }
  }

  function initComponent (vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
      vnode.data.pendingInsert = null;
    }
    vnode.elm = vnode.componentInstance.$el;
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode);
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode);
    }
  }

  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i;
    // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
    var innerNode = vnode;
    while (innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode;
      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode);
        }
        insertedVnodeQueue.push(innerNode);
        break
      }
    }
    // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
    insert(parentElm, vnode.elm, refElm);
  }

  function insert (parent, elm, ref$$1) {
    if (isDef(parent)) {
      if (isDef(ref$$1)) {
        if (ref$$1.parentNode === parent) {
          nodeOps.insertBefore(parent, elm, ref$$1);
        }
      } else {
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true);
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text));
    }
  }

  function isPatchable (vnode) {
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode;
    }
    return isDef(vnode.tag)
  }

  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
      cbs.create[i$1](emptyNode, vnode);
    }
    i = vnode.data.hook; // Reuse variable
    if (isDef(i)) {
      if (isDef(i.create)) { i.create(emptyNode, vnode); }
      if (isDef(i.insert)) { insertedVnodeQueue.push(vnode); }
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope (vnode) {
    var i;
    var ancestor = vnode;
    while (ancestor) {
      if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
        nodeOps.setAttribute(vnode.elm, i, '');
      }
      ancestor = ancestor.parent;
    }
    // for slot content they should also get the scopeId from the host instance.
    if (isDef(i = activeInstance) &&
      i !== vnode.context &&
      isDef(i = i.$options._scopeId)
    ) {
      nodeOps.setAttribute(vnode.elm, i, '');
    }
  }

  function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm);
    }
  }

  function invokeDestroyHook (vnode) {
    var i, j;
    var data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
      for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
          invokeDestroyHook(ch);
        } else { // Text node
          removeNode(ch.elm);
        }
      }
    }
  }

  function removeAndInvokeRemoveHook (vnode, rm) {
    if (isDef(rm) || isDef(vnode.data)) {
      var i;
      var listeners = cbs.remove.length + 1;
      if (isDef(rm)) {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      } else {
        // directly removing
        rm = createRmCb(vnode.elm, listeners);
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm);
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      removeNode(vnode.elm);
    }
  }

  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0;
    var newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, elmToMove, refElm;

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    var canMove = !removeOnly;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
        idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null;
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          elmToMove = oldCh[idxInOld];
          /* istanbul ignore if */
          if ("development" !== 'production' && !elmToMove) {
            warn(
              'It seems there are duplicate keys that is causing an update error. ' +
              'Make sure each v-for item has a unique key.'
            );
          }
          if (sameVnode(elmToMove, newStartVnode)) {
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
            oldCh[idxInOld] = undefined;
            canMove && nodeOps.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
            newStartVnode = newCh[++newStartIdx];
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
            newStartVnode = newCh[++newStartIdx];
          }
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    if (oldVnode === vnode) {
      return
    }

    var elm = vnode.elm = oldVnode.elm;

    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
      } else {
        vnode.isAsyncPlaceholder = true;
      }
      return
    }

    // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      vnode.componentInstance = oldVnode.componentInstance;
      return
    }

    var i;
    var data = vnode.data;
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode);
    }

    var oldCh = oldVnode.children;
    var ch = vnode.children;
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
      if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text);
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
    }
  }

  function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (isTrue(initial) && isDef(vnode.parent)) {
      vnode.parent.data.pendingInsert = queue;
    } else {
      for (var i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }

  var bailed = false;
  // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
  var isRenderedModule = makeMap('attrs,style,class,staticClass,staticStyle,key');

  // Note: this is a browser-only function so we can assume elms are DOM nodes.
  function hydrate (elm, vnode, insertedVnodeQueue) {
    if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
      vnode.elm = elm;
      vnode.isAsyncPlaceholder = true;
      return true
    }
    if (true) {
      if (!assertNodeMatch(elm, vnode)) {
        return false
      }
    }
    vnode.elm = elm;
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
      if (isDef(i = vnode.componentInstance)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue);
        return true
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        if (!elm.hasChildNodes()) {
          createChildren(vnode, children, insertedVnodeQueue);
        } else {
          var childrenMatch = true;
          var childNode = elm.firstChild;
          for (var i$1 = 0; i$1 < children.length; i$1++) {
            if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue)) {
              childrenMatch = false;
              break
            }
            childNode = childNode.nextSibling;
          }
          // if childNode is not null, it means the actual childNodes list is
          // longer than the virtual children list.
          if (!childrenMatch || childNode) {
            if ("development" !== 'production' &&
              typeof console !== 'undefined' &&
              !bailed
            ) {
              bailed = true;
              console.warn('Parent: ', elm);
              console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
            }
            return false
          }
        }
      }
      if (isDef(data)) {
        for (var key in data) {
          if (!isRenderedModule(key)) {
            invokeCreateHooks(vnode, insertedVnodeQueue);
            break
          }
        }
      }
    } else if (elm.data !== vnode.text) {
      elm.data = vnode.text;
    }
    return true
  }

  function assertNodeMatch (node, vnode) {
    if (isDef(vnode.tag)) {
      return (
        vnode.tag.indexOf('vue-component') === 0 ||
        vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
      )
    } else {
      return node.nodeType === (vnode.isComment ? 8 : 3)
    }
  }

  return function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) { invokeDestroyHook(oldVnode); }
      return
    }

    var isInitialPatch = false;
    var insertedVnodeQueue = [];

    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true;
      createElm(vnode, insertedVnodeQueue, parentElm, refElm);
    } else {
      var isRealElement = isDef(oldVnode.nodeType);
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR);
            hydrating = true;
          }
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode
            } else if (true) {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              );
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          oldVnode = emptyNodeAt(oldVnode);
        }
        // replacing existing element
        var oldElm = oldVnode.elm;
        var parentElm$1 = nodeOps.parentNode(oldElm);
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm$1,
          nodeOps.nextSibling(oldElm)
        );

        if (isDef(vnode.parent)) {
          // component root element replaced.
          // update parent placeholder node element, recursively
          var ancestor = vnode.parent;
          while (ancestor) {
            ancestor.elm = vnode.elm;
            ancestor = ancestor.parent;
          }
          if (isPatchable(vnode)) {
            for (var i = 0; i < cbs.create.length; ++i) {
              cbs.create[i](emptyNode, vnode.parent);
            }
          }
        }

        if (isDef(parentElm$1)) {
          removeVnodes(parentElm$1, [oldVnode], 0, 0);
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode);
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    return vnode.elm
  }
}

/*  */

var directives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode) {
    updateDirectives(vnode, emptyNode);
  }
};

function updateDirectives (oldVnode, vnode) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode);
  }
}

function _update (oldVnode, vnode) {
  var isCreate = oldVnode === emptyNode;
  var isDestroy = vnode === emptyNode;
  var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
  var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

  var dirsWithInsert = [];
  var dirsWithPostpatch = [];

  var key, oldDir, dir;
  for (key in newDirs) {
    oldDir = oldDirs[key];
    dir = newDirs[key];
    if (!oldDir) {
      // new directive, bind
      callHook$1(dir, 'bind', vnode, oldVnode);
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir);
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value;
      callHook$1(dir, 'update', vnode, oldVnode);
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir);
      }
    }
  }

  if (dirsWithInsert.length) {
    var callInsert = function () {
      for (var i = 0; i < dirsWithInsert.length; i++) {
        callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
      }
    };
    if (isCreate) {
      mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', callInsert);
    } else {
      callInsert();
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'postpatch', function () {
      for (var i = 0; i < dirsWithPostpatch.length; i++) {
        callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
      }
    });
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
      }
    }
  }
}

var emptyModifiers = Object.create(null);

function normalizeDirectives$1 (
  dirs,
  vm
) {
  var res = Object.create(null);
  if (!dirs) {
    return res
  }
  var i, dir;
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i];
    if (!dir.modifiers) {
      dir.modifiers = emptyModifiers;
    }
    res[getRawDirName(dir)] = dir;
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
  }
  return res
}

function getRawDirName (dir) {
  return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
}

function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
  var fn = dir.def && dir.def[hook];
  if (fn) {
    try {
      fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
    } catch (e) {
      handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
    }
  }
}

var baseModules = [
  ref,
  directives
];

/*  */

function updateAttrs (oldVnode, vnode) {
  var opts = vnode.componentOptions;
  if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
    return
  }
  if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
    return
  }
  var key, cur, old;
  var elm = vnode.elm;
  var oldAttrs = oldVnode.data.attrs || {};
  var attrs = vnode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(attrs.__ob__)) {
    attrs = vnode.data.attrs = extend({}, attrs);
  }

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      setAttr(elm, key, cur);
    }
  }
  // #4391: in IE9, setting type can reset value for input[type=radio]
  /* istanbul ignore if */
  if (isIE9 && attrs.value !== oldAttrs.value) {
    setAttr(elm, 'value', attrs.value);
  }
  for (key in oldAttrs) {
    if (isUndef(attrs[key])) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key);
      }
    }
  }
}

function setAttr (el, key, value) {
  if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, key);
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, value);
    }
  }
}

var attrs = {
  create: updateAttrs,
  update: updateAttrs
};

/*  */

function updateClass (oldVnode, vnode) {
  var el = vnode.elm;
  var data = vnode.data;
  var oldData = oldVnode.data;
  if (
    isUndef(data.staticClass) &&
    isUndef(data.class) && (
      isUndef(oldData) || (
        isUndef(oldData.staticClass) &&
        isUndef(oldData.class)
      )
    )
  ) {
    return
  }

  var cls = genClassForVnode(vnode);

  // handle transition classes
  var transitionClass = el._transitionClasses;
  if (isDef(transitionClass)) {
    cls = concat(cls, stringifyClass(transitionClass));
  }

  // set the class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

var klass = {
  create: updateClass,
  update: updateClass
};

/*  */

var validDivisionCharRE = /[\w).+\-_$\]]/;

function parseFilters (exp) {
  var inSingle = false;
  var inDouble = false;
  var inTemplateString = false;
  var inRegex = false;
  var curly = 0;
  var square = 0;
  var paren = 0;
  var lastFilterIndex = 0;
  var c, prev, i, expression, filters;

  for (i = 0; i < exp.length; i++) {
    prev = c;
    c = exp.charCodeAt(i);
    if (inSingle) {
      if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
    } else if (
      c === 0x7C && // pipe
      exp.charCodeAt(i + 1) !== 0x7C &&
      exp.charCodeAt(i - 1) !== 0x7C &&
      !curly && !square && !paren
    ) {
      if (expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        expression = exp.slice(0, i).trim();
      } else {
        pushFilter();
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break         // "
        case 0x27: inSingle = true; break         // '
        case 0x60: inTemplateString = true; break // `
        case 0x28: paren++; break                 // (
        case 0x29: paren--; break                 // )
        case 0x5B: square++; break                // [
        case 0x5D: square--; break                // ]
        case 0x7B: curly++; break                 // {
        case 0x7D: curly--; break                 // }
      }
      if (c === 0x2f) { // /
        var j = i - 1;
        var p = (void 0);
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j);
          if (p !== ' ') { break }
        }
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true;
        }
      }
    }
  }

  if (expression === undefined) {
    expression = exp.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  function pushFilter () {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
    lastFilterIndex = i + 1;
  }

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i]);
    }
  }

  return expression
}

function wrapFilter (exp, filter) {
  var i = filter.indexOf('(');
  if (i < 0) {
    // _f: resolveFilter
    return ("_f(\"" + filter + "\")(" + exp + ")")
  } else {
    var name = filter.slice(0, i);
    var args = filter.slice(i + 1);
    return ("_f(\"" + name + "\")(" + exp + "," + args)
  }
}

/*  */

function baseWarn (msg) {
  console.error(("[Vue compiler]: " + msg));
}

function pluckModuleFunction (
  modules,
  key
) {
  return modules
    ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; })
    : []
}

function addProp (el, name, value) {
  (el.props || (el.props = [])).push({ name: name, value: value });
}

function addAttr (el, name, value) {
  (el.attrs || (el.attrs = [])).push({ name: name, value: value });
}

function addDirective (
  el,
  name,
  rawName,
  value,
  arg,
  modifiers
) {
  (el.directives || (el.directives = [])).push({ name: name, rawName: rawName, value: value, arg: arg, modifiers: modifiers });
}

function addHandler (
  el,
  name,
  value,
  modifiers,
  important,
  warn
) {
  // warn prevent and passive modifier
  /* istanbul ignore if */
  if (
    "development" !== 'production' && warn &&
    modifiers && modifiers.prevent && modifiers.passive
  ) {
    warn(
      'passive and prevent can\'t be used together. ' +
      'Passive handler can\'t prevent default event.'
    );
  }
  // check capture modifier
  if (modifiers && modifiers.capture) {
    delete modifiers.capture;
    name = '!' + name; // mark the event as captured
  }
  if (modifiers && modifiers.once) {
    delete modifiers.once;
    name = '~' + name; // mark the event as once
  }
  /* istanbul ignore if */
  if (modifiers && modifiers.passive) {
    delete modifiers.passive;
    name = '&' + name; // mark the event as passive
  }
  var events;
  if (modifiers && modifiers.native) {
    delete modifiers.native;
    events = el.nativeEvents || (el.nativeEvents = {});
  } else {
    events = el.events || (el.events = {});
  }
  var newHandler = { value: value, modifiers: modifiers };
  var handlers = events[name];
  /* istanbul ignore if */
  if (Array.isArray(handlers)) {
    important ? handlers.unshift(newHandler) : handlers.push(newHandler);
  } else if (handlers) {
    events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
  } else {
    events[name] = newHandler;
  }
}

function getBindingAttr (
  el,
  name,
  getStatic
) {
  var dynamicValue =
    getAndRemoveAttr(el, ':' + name) ||
    getAndRemoveAttr(el, 'v-bind:' + name);
  if (dynamicValue != null) {
    return parseFilters(dynamicValue)
  } else if (getStatic !== false) {
    var staticValue = getAndRemoveAttr(el, name);
    if (staticValue != null) {
      return JSON.stringify(staticValue)
    }
  }
}

function getAndRemoveAttr (el, name) {
  var val;
  if ((val = el.attrsMap[name]) != null) {
    var list = el.attrsList;
    for (var i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1);
        break
      }
    }
  }
  return val
}

/*  */

/**
 * Cross-platform code generation for component v-model
 */
function genComponentModel (
  el,
  value,
  modifiers
) {
  var ref = modifiers || {};
  var number = ref.number;
  var trim = ref.trim;

  var baseValueExpression = '$$v';
  var valueExpression = baseValueExpression;
  if (trim) {
    valueExpression =
      "(typeof " + baseValueExpression + " === 'string'" +
        "? " + baseValueExpression + ".trim()" +
        ": " + baseValueExpression + ")";
  }
  if (number) {
    valueExpression = "_n(" + valueExpression + ")";
  }
  var assignment = genAssignmentCode(value, valueExpression);

  el.model = {
    value: ("(" + value + ")"),
    expression: ("\"" + value + "\""),
    callback: ("function (" + baseValueExpression + ") {" + assignment + "}")
  };
}

/**
 * Cross-platform codegen helper for generating v-model value assignment code.
 */
function genAssignmentCode (
  value,
  assignment
) {
  var modelRs = parseModel(value);
  if (modelRs.idx === null) {
    return (value + "=" + assignment)
  } else {
    return ("$set(" + (modelRs.exp) + ", " + (modelRs.idx) + ", " + assignment + ")")
  }
}

/**
 * parse directive model to do the array update transform. a[idx] = val => $$a.splice($$idx, 1, val)
 *
 * for loop possible cases:
 *
 * - test
 * - test[idx]
 * - test[test1[idx]]
 * - test["a"][idx]
 * - xxx.test[a[a].test1[idx]]
 * - test.xxx.a["asa"][test1[idx]]
 *
 */

var len;
var str;
var chr;
var index$1;
var expressionPos;
var expressionEndPos;

function parseModel (val) {
  str = val;
  len = str.length;
  index$1 = expressionPos = expressionEndPos = 0;

  if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
    return {
      exp: val,
      idx: null
    }
  }

  while (!eof()) {
    chr = next();
    /* istanbul ignore if */
    if (isStringStart(chr)) {
      parseString(chr);
    } else if (chr === 0x5B) {
      parseBracket(chr);
    }
  }

  return {
    exp: val.substring(0, expressionPos),
    idx: val.substring(expressionPos + 1, expressionEndPos)
  }
}

function next () {
  return str.charCodeAt(++index$1)
}

function eof () {
  return index$1 >= len
}

function isStringStart (chr) {
  return chr === 0x22 || chr === 0x27
}

function parseBracket (chr) {
  var inBracket = 1;
  expressionPos = index$1;
  while (!eof()) {
    chr = next();
    if (isStringStart(chr)) {
      parseString(chr);
      continue
    }
    if (chr === 0x5B) { inBracket++; }
    if (chr === 0x5D) { inBracket--; }
    if (inBracket === 0) {
      expressionEndPos = index$1;
      break
    }
  }
}

function parseString (chr) {
  var stringQuote = chr;
  while (!eof()) {
    chr = next();
    if (chr === stringQuote) {
      break
    }
  }
}

/*  */

var warn$1;

// in some cases, the event used has to be determined at runtime
// so we used some reserved tokens during compile.
var RANGE_TOKEN = '__r';
var CHECKBOX_RADIO_TOKEN = '__c';

function model (
  el,
  dir,
  _warn
) {
  warn$1 = _warn;
  var value = dir.value;
  var modifiers = dir.modifiers;
  var tag = el.tag;
  var type = el.attrsMap.type;

  if (true) {
    var dynamicType = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
    if (tag === 'input' && dynamicType) {
      warn$1(
        "<input :type=\"" + dynamicType + "\" v-model=\"" + value + "\">:\n" +
        "v-model does not support dynamic input types. Use v-if branches instead."
      );
    }
    // inputs with type="file" are read only and setting the input's
    // value will throw an error.
    if (tag === 'input' && type === 'file') {
      warn$1(
        "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
        "File inputs are read only. Use a v-on:change listener instead."
      );
    }
  }

  if (el.component) {
    genComponentModel(el, value, modifiers);
    // component v-model doesn't need extra runtime
    return false
  } else if (tag === 'select') {
    genSelect(el, value, modifiers);
  } else if (tag === 'input' && type === 'checkbox') {
    genCheckboxModel(el, value, modifiers);
  } else if (tag === 'input' && type === 'radio') {
    genRadioModel(el, value, modifiers);
  } else if (tag === 'input' || tag === 'textarea') {
    genDefaultModel(el, value, modifiers);
  } else if (!config.isReservedTag(tag)) {
    genComponentModel(el, value, modifiers);
    // component v-model doesn't need extra runtime
    return false
  } else if (true) {
    warn$1(
      "<" + (el.tag) + " v-model=\"" + value + "\">: " +
      "v-model is not supported on this element type. " +
      'If you are working with contenteditable, it\'s recommended to ' +
      'wrap a library dedicated for that purpose inside a custom component.'
    );
  }

  // ensure runtime directive metadata
  return true
}

function genCheckboxModel (
  el,
  value,
  modifiers
) {
  var number = modifiers && modifiers.number;
  var valueBinding = getBindingAttr(el, 'value') || 'null';
  var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
  var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
  addProp(el, 'checked',
    "Array.isArray(" + value + ")" +
      "?_i(" + value + "," + valueBinding + ")>-1" + (
        trueValueBinding === 'true'
          ? (":(" + value + ")")
          : (":_q(" + value + "," + trueValueBinding + ")")
      )
  );
  addHandler(el, CHECKBOX_RADIO_TOKEN,
    "var $$a=" + value + "," +
        '$$el=$event.target,' +
        "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
    'if(Array.isArray($$a)){' +
      "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," +
          '$$i=_i($$a,$$v);' +
      "if($$el.checked){$$i<0&&(" + value + "=$$a.concat($$v))}" +
      "else{$$i>-1&&(" + value + "=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}" +
    "}else{" + (genAssignmentCode(value, '$$c')) + "}",
    null, true
  );
}

function genRadioModel (
    el,
    value,
    modifiers
) {
  var number = modifiers && modifiers.number;
  var valueBinding = getBindingAttr(el, 'value') || 'null';
  valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding;
  addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")"));
  addHandler(el, CHECKBOX_RADIO_TOKEN, genAssignmentCode(value, valueBinding), null, true);
}

function genSelect (
    el,
    value,
    modifiers
) {
  var number = modifiers && modifiers.number;
  var selectedVal = "Array.prototype.filter" +
    ".call($event.target.options,function(o){return o.selected})" +
    ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
    "return " + (number ? '_n(val)' : 'val') + "})";

  var assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
  var code = "var $$selectedVal = " + selectedVal + ";";
  code = code + " " + (genAssignmentCode(value, assignment));
  addHandler(el, 'change', code, null, true);
}

function genDefaultModel (
  el,
  value,
  modifiers
) {
  var type = el.attrsMap.type;
  var ref = modifiers || {};
  var lazy = ref.lazy;
  var number = ref.number;
  var trim = ref.trim;
  var needCompositionGuard = !lazy && type !== 'range';
  var event = lazy
    ? 'change'
    : type === 'range'
      ? RANGE_TOKEN
      : 'input';

  var valueExpression = '$event.target.value';
  if (trim) {
    valueExpression = "$event.target.value.trim()";
  }
  if (number) {
    valueExpression = "_n(" + valueExpression + ")";
  }

  var code = genAssignmentCode(value, valueExpression);
  if (needCompositionGuard) {
    code = "if($event.target.composing)return;" + code;
  }

  addProp(el, 'value', ("(" + value + ")"));
  addHandler(el, event, code, null, true);
  if (trim || number) {
    addHandler(el, 'blur', '$forceUpdate()');
  }
}

/*  */

// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
function normalizeEvents (on) {
  var event;
  /* istanbul ignore if */
  if (isDef(on[RANGE_TOKEN])) {
    // IE input[type=range] only supports `change` event
    event = isIE ? 'change' : 'input';
    on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
    delete on[RANGE_TOKEN];
  }
  if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
    // Chrome fires microtasks in between click/change, leads to #4521
    event = isChrome ? 'click' : 'change';
    on[event] = [].concat(on[CHECKBOX_RADIO_TOKEN], on[event] || []);
    delete on[CHECKBOX_RADIO_TOKEN];
  }
}

var target$1;

function add$1 (
  event,
  handler,
  once$$1,
  capture,
  passive
) {
  if (once$$1) {
    var oldHandler = handler;
    var _target = target$1; // save current target element in closure
    handler = function (ev) {
      var res = arguments.length === 1
        ? oldHandler(ev)
        : oldHandler.apply(null, arguments);
      if (res !== null) {
        remove$2(event, handler, capture, _target);
      }
    };
  }
  target$1.addEventListener(
    event,
    handler,
    supportsPassive
      ? { capture: capture, passive: passive }
      : capture
  );
}

function remove$2 (
  event,
  handler,
  capture,
  _target
) {
  (_target || target$1).removeEventListener(event, handler, capture);
}

function updateDOMListeners (oldVnode, vnode) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return
  }
  var on = vnode.data.on || {};
  var oldOn = oldVnode.data.on || {};
  target$1 = vnode.elm;
  normalizeEvents(on);
  updateListeners(on, oldOn, add$1, remove$2, vnode.context);
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
};

/*  */

function updateDOMProps (oldVnode, vnode) {
  if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
    return
  }
  var key, cur;
  var elm = vnode.elm;
  var oldProps = oldVnode.data.domProps || {};
  var props = vnode.data.domProps || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(props.__ob__)) {
    props = vnode.data.domProps = extend({}, props);
  }

  for (key in oldProps) {
    if (isUndef(props[key])) {
      elm[key] = '';
    }
  }
  for (key in props) {
    cur = props[key];
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) { vnode.children.length = 0; }
      if (cur === oldProps[key]) { continue }
    }

    if (key === 'value') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur;
      // avoid resetting cursor position when value is the same
      var strCur = isUndef(cur) ? '' : String(cur);
      if (shouldUpdateValue(elm, vnode, strCur)) {
        elm.value = strCur;
      }
    } else {
      elm[key] = cur;
    }
  }
}

// check platforms/web/util/attrs.js acceptValue


function shouldUpdateValue (
  elm,
  vnode,
  checkVal
) {
  return (!elm.composing && (
    vnode.tag === 'option' ||
    isDirty(elm, checkVal) ||
    isInputChanged(elm, checkVal)
  ))
}

function isDirty (elm, checkVal) {
  // return true when textbox (.number and .trim) loses focus and its value is
  // not equal to the updated value
  var notInFocus = true;
  // #6157
  // work around IE bug when accessing document.activeElement in an iframe
  try { notInFocus = document.activeElement !== elm; } catch (e) {}
  return notInFocus && elm.value !== checkVal
}

function isInputChanged (elm, newVal) {
  var value = elm.value;
  var modifiers = elm._vModifiers; // injected by v-model runtime
  if (isDef(modifiers) && modifiers.number) {
    return toNumber(value) !== toNumber(newVal)
  }
  if (isDef(modifiers) && modifiers.trim) {
    return value.trim() !== newVal.trim()
  }
  return value !== newVal
}

var domProps = {
  create: updateDOMProps,
  update: updateDOMProps
};

/*  */

var parseStyleText = cached(function (cssText) {
  var res = {};
  var listDelimiter = /;(?![^(]*\))/g;
  var propertyDelimiter = /:(.+)/;
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      var tmp = item.split(propertyDelimiter);
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return res
});

// merge static and dynamic style data on the same vnode
function normalizeStyleData (data) {
  var style = normalizeStyleBinding(data.style);
  // static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it
  return data.staticStyle
    ? extend(data.staticStyle, style)
    : style
}

// normalize possible array / string values into Object
function normalizeStyleBinding (bindingStyle) {
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle)
  }
  if (typeof bindingStyle === 'string') {
    return parseStyleText(bindingStyle)
  }
  return bindingStyle
}

/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */
function getStyle (vnode, checkChild) {
  var res = {};
  var styleData;

  if (checkChild) {
    var childNode = vnode;
    while (childNode.componentInstance) {
      childNode = childNode.componentInstance._vnode;
      if (childNode.data && (styleData = normalizeStyleData(childNode.data))) {
        extend(res, styleData);
      }
    }
  }

  if ((styleData = normalizeStyleData(vnode.data))) {
    extend(res, styleData);
  }

  var parentNode = vnode;
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData);
    }
  }
  return res
}

/*  */

var cssVarRE = /^--/;
var importantRE = /\s*!important$/;
var setProp = function (el, name, val) {
  /* istanbul ignore if */
  if (cssVarRE.test(name)) {
    el.style.setProperty(name, val);
  } else if (importantRE.test(val)) {
    el.style.setProperty(name, val.replace(importantRE, ''), 'important');
  } else {
    var normalizedName = normalize(name);
    if (Array.isArray(val)) {
      // Support values array created by autoprefixer, e.g.
      // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
      // Set them one by one, and the browser will only set those it can recognize
      for (var i = 0, len = val.length; i < len; i++) {
        el.style[normalizedName] = val[i];
      }
    } else {
      el.style[normalizedName] = val;
    }
  }
};

var vendorNames = ['Webkit', 'Moz', 'ms'];

var emptyStyle;
var normalize = cached(function (prop) {
  emptyStyle = emptyStyle || document.createElement('div').style;
  prop = camelize(prop);
  if (prop !== 'filter' && (prop in emptyStyle)) {
    return prop
  }
  var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (var i = 0; i < vendorNames.length; i++) {
    var name = vendorNames[i] + capName;
    if (name in emptyStyle) {
      return name
    }
  }
});

function updateStyle (oldVnode, vnode) {
  var data = vnode.data;
  var oldData = oldVnode.data;

  if (isUndef(data.staticStyle) && isUndef(data.style) &&
    isUndef(oldData.staticStyle) && isUndef(oldData.style)
  ) {
    return
  }

  var cur, name;
  var el = vnode.elm;
  var oldStaticStyle = oldData.staticStyle;
  var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

  // if static style exists, stylebinding already merged into it when doing normalizeStyleData
  var oldStyle = oldStaticStyle || oldStyleBinding;

  var style = normalizeStyleBinding(vnode.data.style) || {};

  // store normalized style under a different key for next diff
  // make sure to clone it if it's reactive, since the user likley wants
  // to mutate it.
  vnode.data.normalizedStyle = isDef(style.__ob__)
    ? extend({}, style)
    : style;

  var newStyle = getStyle(vnode, true);

  for (name in oldStyle) {
    if (isUndef(newStyle[name])) {
      setProp(el, name, '');
    }
  }
  for (name in newStyle) {
    cur = newStyle[name];
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      setProp(el, name, cur == null ? '' : cur);
    }
  }
}

var style = {
  create: updateStyle,
  update: updateStyle
};

/*  */

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function addClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) { return el.classList.add(c); });
    } else {
      el.classList.add(cls);
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function removeClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) { return el.classList.remove(c); });
    } else {
      el.classList.remove(cls);
    }
    if (!el.classList.length) {
      el.removeAttribute('class');
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    cur = cur.trim();
    if (cur) {
      el.setAttribute('class', cur);
    } else {
      el.removeAttribute('class');
    }
  }
}

/*  */

function resolveTransition (def$$1) {
  if (!def$$1) {
    return
  }
  /* istanbul ignore else */
  if (typeof def$$1 === 'object') {
    var res = {};
    if (def$$1.css !== false) {
      extend(res, autoCssTransition(def$$1.name || 'v'));
    }
    extend(res, def$$1);
    return res
  } else if (typeof def$$1 === 'string') {
    return autoCssTransition(def$$1)
  }
}

var autoCssTransition = cached(function (name) {
  return {
    enterClass: (name + "-enter"),
    enterToClass: (name + "-enter-to"),
    enterActiveClass: (name + "-enter-active"),
    leaveClass: (name + "-leave"),
    leaveToClass: (name + "-leave-to"),
    leaveActiveClass: (name + "-leave-active")
  }
});

var hasTransition = inBrowser && !isIE9;
var TRANSITION = 'transition';
var ANIMATION = 'animation';

// Transition property/event sniffing
var transitionProp = 'transition';
var transitionEndEvent = 'transitionend';
var animationProp = 'animation';
var animationEndEvent = 'animationend';
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  ) {
    transitionProp = 'WebkitTransition';
    transitionEndEvent = 'webkitTransitionEnd';
  }
  if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  ) {
    animationProp = 'WebkitAnimation';
    animationEndEvent = 'webkitAnimationEnd';
  }
}

// binding to window is necessary to make hot reload work in IE in strict mode
var raf = inBrowser && window.requestAnimationFrame
  ? window.requestAnimationFrame.bind(window)
  : setTimeout;

function nextFrame (fn) {
  raf(function () {
    raf(fn);
  });
}

function addTransitionClass (el, cls) {
  var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
  if (transitionClasses.indexOf(cls) < 0) {
    transitionClasses.push(cls);
    addClass(el, cls);
  }
}

function removeTransitionClass (el, cls) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls);
  }
  removeClass(el, cls);
}

function whenTransitionEnds (
  el,
  expectedType,
  cb
) {
  var ref = getTransitionInfo(el, expectedType);
  var type = ref.type;
  var timeout = ref.timeout;
  var propCount = ref.propCount;
  if (!type) { return cb() }
  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
  var ended = 0;
  var end = function () {
    el.removeEventListener(event, onEnd);
    cb();
  };
  var onEnd = function (e) {
    if (e.target === el) {
      if (++ended >= propCount) {
        end();
      }
    }
  };
  setTimeout(function () {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(event, onEnd);
}

var transformRE = /\b(transform|all)(,|$)/;

function getTransitionInfo (el, expectedType) {
  var styles = window.getComputedStyle(el);
  var transitionDelays = styles[transitionProp + 'Delay'].split(', ');
  var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
  var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  var animationDelays = styles[animationProp + 'Delay'].split(', ');
  var animationDurations = styles[animationProp + 'Duration'].split(', ');
  var animationTimeout = getTimeout(animationDelays, animationDurations);

  var type;
  var timeout = 0;
  var propCount = 0;
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null;
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0;
  }
  var hasTransform =
    type === TRANSITION &&
    transformRE.test(styles[transitionProp + 'Property']);
  return {
    type: type,
    timeout: timeout,
    propCount: propCount,
    hasTransform: hasTransform
  }
}

function getTimeout (delays, durations) {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }

  return Math.max.apply(null, durations.map(function (d, i) {
    return toMs(d) + toMs(delays[i])
  }))
}

function toMs (s) {
  return Number(s.slice(0, -1)) * 1000
}

/*  */

function enter (vnode, toggleDisplay) {
  var el = vnode.elm;

  // call leave callback now
  if (isDef(el._leaveCb)) {
    el._leaveCb.cancelled = true;
    el._leaveCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (isUndef(data)) {
    return
  }

  /* istanbul ignore if */
  if (isDef(el._enterCb) || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var enterClass = data.enterClass;
  var enterToClass = data.enterToClass;
  var enterActiveClass = data.enterActiveClass;
  var appearClass = data.appearClass;
  var appearToClass = data.appearToClass;
  var appearActiveClass = data.appearActiveClass;
  var beforeEnter = data.beforeEnter;
  var enter = data.enter;
  var afterEnter = data.afterEnter;
  var enterCancelled = data.enterCancelled;
  var beforeAppear = data.beforeAppear;
  var appear = data.appear;
  var afterAppear = data.afterAppear;
  var appearCancelled = data.appearCancelled;
  var duration = data.duration;

  // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.
  var context = activeInstance;
  var transitionNode = activeInstance.$vnode;
  while (transitionNode && transitionNode.parent) {
    transitionNode = transitionNode.parent;
    context = transitionNode.context;
  }

  var isAppear = !context._isMounted || !vnode.isRootInsert;

  if (isAppear && !appear && appear !== '') {
    return
  }

  var startClass = isAppear && appearClass
    ? appearClass
    : enterClass;
  var activeClass = isAppear && appearActiveClass
    ? appearActiveClass
    : enterActiveClass;
  var toClass = isAppear && appearToClass
    ? appearToClass
    : enterToClass;

  var beforeEnterHook = isAppear
    ? (beforeAppear || beforeEnter)
    : beforeEnter;
  var enterHook = isAppear
    ? (typeof appear === 'function' ? appear : enter)
    : enter;
  var afterEnterHook = isAppear
    ? (afterAppear || afterEnter)
    : afterEnter;
  var enterCancelledHook = isAppear
    ? (appearCancelled || enterCancelled)
    : enterCancelled;

  var explicitEnterDuration = toNumber(
    isObject(duration)
      ? duration.enter
      : duration
  );

  if ("development" !== 'production' && explicitEnterDuration != null) {
    checkDuration(explicitEnterDuration, 'enter', vnode);
  }

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(enterHook);

  var cb = el._enterCb = once(function () {
    if (expectsCSS) {
      removeTransitionClass(el, toClass);
      removeTransitionClass(el, activeClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass);
      }
      enterCancelledHook && enterCancelledHook(el);
    } else {
      afterEnterHook && afterEnterHook(el);
    }
    el._enterCb = null;
  });

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function () {
      var parent = el.parentNode;
      var pendingNode = parent && parent._pending && parent._pending[vnode.key];
      if (pendingNode &&
        pendingNode.tag === vnode.tag &&
        pendingNode.elm._leaveCb
      ) {
        pendingNode.elm._leaveCb();
      }
      enterHook && enterHook(el, cb);
    });
  }

  // start enter transition
  beforeEnterHook && beforeEnterHook(el);
  if (expectsCSS) {
    addTransitionClass(el, startClass);
    addTransitionClass(el, activeClass);
    nextFrame(function () {
      addTransitionClass(el, toClass);
      removeTransitionClass(el, startClass);
      if (!cb.cancelled && !userWantsControl) {
        if (isValidDuration(explicitEnterDuration)) {
          setTimeout(cb, explicitEnterDuration);
        } else {
          whenTransitionEnds(el, type, cb);
        }
      }
    });
  }

  if (vnode.data.show) {
    toggleDisplay && toggleDisplay();
    enterHook && enterHook(el, cb);
  }

  if (!expectsCSS && !userWantsControl) {
    cb();
  }
}

function leave (vnode, rm) {
  var el = vnode.elm;

  // call enter callback now
  if (isDef(el._enterCb)) {
    el._enterCb.cancelled = true;
    el._enterCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (isUndef(data)) {
    return rm()
  }

  /* istanbul ignore if */
  if (isDef(el._leaveCb) || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var leaveClass = data.leaveClass;
  var leaveToClass = data.leaveToClass;
  var leaveActiveClass = data.leaveActiveClass;
  var beforeLeave = data.beforeLeave;
  var leave = data.leave;
  var afterLeave = data.afterLeave;
  var leaveCancelled = data.leaveCancelled;
  var delayLeave = data.delayLeave;
  var duration = data.duration;

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(leave);

  var explicitLeaveDuration = toNumber(
    isObject(duration)
      ? duration.leave
      : duration
  );

  if ("development" !== 'production' && isDef(explicitLeaveDuration)) {
    checkDuration(explicitLeaveDuration, 'leave', vnode);
  }

  var cb = el._leaveCb = once(function () {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null;
    }
    if (expectsCSS) {
      removeTransitionClass(el, leaveToClass);
      removeTransitionClass(el, leaveActiveClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass);
      }
      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }
    el._leaveCb = null;
  });

  if (delayLeave) {
    delayLeave(performLeave);
  } else {
    performLeave();
  }

  function performLeave () {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return
    }
    // record leaving element
    if (!vnode.data.show) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
    }
    beforeLeave && beforeLeave(el);
    if (expectsCSS) {
      addTransitionClass(el, leaveClass);
      addTransitionClass(el, leaveActiveClass);
      nextFrame(function () {
        addTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveClass);
        if (!cb.cancelled && !userWantsControl) {
          if (isValidDuration(explicitLeaveDuration)) {
            setTimeout(cb, explicitLeaveDuration);
          } else {
            whenTransitionEnds(el, type, cb);
          }
        }
      });
    }
    leave && leave(el, cb);
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
}

// only used in dev mode
function checkDuration (val, name, vnode) {
  if (typeof val !== 'number') {
    warn(
      "<transition> explicit " + name + " duration is not a valid number - " +
      "got " + (JSON.stringify(val)) + ".",
      vnode.context
    );
  } else if (isNaN(val)) {
    warn(
      "<transition> explicit " + name + " duration is NaN - " +
      'the duration expression might be incorrect.',
      vnode.context
    );
  }
}

function isValidDuration (val) {
  return typeof val === 'number' && !isNaN(val)
}

/**
 * Normalize a transition hook's argument length. The hook may be:
 * - a merged hook (invoker) with the original in .fns
 * - a wrapped component method (check ._length)
 * - a plain function (.length)
 */
function getHookArgumentsLength (fn) {
  if (isUndef(fn)) {
    return false
  }
  var invokerFns = fn.fns;
  if (isDef(invokerFns)) {
    // invoker
    return getHookArgumentsLength(
      Array.isArray(invokerFns)
        ? invokerFns[0]
        : invokerFns
    )
  } else {
    return (fn._length || fn.length) > 1
  }
}

function _enter (_, vnode) {
  if (vnode.data.show !== true) {
    enter(vnode);
  }
}

var transition = inBrowser ? {
  create: _enter,
  activate: _enter,
  remove: function remove$$1 (vnode, rm) {
    /* istanbul ignore else */
    if (vnode.data.show !== true) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
} : {};

var platformModules = [
  attrs,
  klass,
  events,
  domProps,
  style,
  transition
];

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
var modules = platformModules.concat(baseModules);

var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

var isTextInputType = makeMap('text,number,password,search,email,tel,url');

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', function () {
    var el = document.activeElement;
    if (el && el.vmodel) {
      trigger(el, 'input');
    }
  });
}

var model$1 = {
  inserted: function inserted (el, binding, vnode) {
    if (vnode.tag === 'select') {
      var cb = function () {
        setSelected(el, binding, vnode.context);
      };
      cb();
      /* istanbul ignore if */
      if (isIE || isEdge) {
        setTimeout(cb, 0);
      }
      el._vOptions = [].map.call(el.options, getValue);
    } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
      el._vModifiers = binding.modifiers;
      if (!binding.modifiers.lazy) {
        // Safari < 10.2 & UIWebView doesn't fire compositionend when
        // switching focus before confirming composition choice
        // this also fixes the issue where some browsers e.g. iOS Chrome
        // fires "change" instead of "input" on autocomplete.
        el.addEventListener('change', onCompositionEnd);
        if (!isAndroid) {
          el.addEventListener('compositionstart', onCompositionStart);
          el.addEventListener('compositionend', onCompositionEnd);
        }
        /* istanbul ignore if */
        if (isIE9) {
          el.vmodel = true;
        }
      }
    }
  },
  componentUpdated: function componentUpdated (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context);
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.
      var prevOptions = el._vOptions;
      var curOptions = el._vOptions = [].map.call(el.options, getValue);
      if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
        trigger(el, 'change');
      }
    }
  }
};

function setSelected (el, binding, vm) {
  var value = binding.value;
  var isMultiple = el.multiple;
  if (isMultiple && !Array.isArray(value)) {
    "development" !== 'production' && warn(
      "<select multiple v-model=\"" + (binding.expression) + "\"> " +
      "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
      vm
    );
    return
  }
  var selected, option;
  for (var i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i];
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1;
      if (option.selected !== selected) {
        option.selected = selected;
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i;
        }
        return
      }
    }
  }
  if (!isMultiple) {
    el.selectedIndex = -1;
  }
}

function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value
}

function onCompositionStart (e) {
  e.target.composing = true;
}

function onCompositionEnd (e) {
  // prevent triggering an input event for no reason
  if (!e.target.composing) { return }
  e.target.composing = false;
  trigger(e.target, 'input');
}

function trigger (el, type) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
}

/*  */

// recursively search for possible transition defined inside the component root
function locateNode (vnode) {
  return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
    ? locateNode(vnode.componentInstance._vnode)
    : vnode
}

var show = {
  bind: function bind (el, ref, vnode) {
    var value = ref.value;

    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;
    var originalDisplay = el.__vOriginalDisplay =
      el.style.display === 'none' ? '' : el.style.display;
    if (value && transition$$1) {
      vnode.data.show = true;
      enter(vnode, function () {
        el.style.display = originalDisplay;
      });
    } else {
      el.style.display = value ? originalDisplay : 'none';
    }
  },

  update: function update (el, ref, vnode) {
    var value = ref.value;
    var oldValue = ref.oldValue;

    /* istanbul ignore if */
    if (value === oldValue) { return }
    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;
    if (transition$$1) {
      vnode.data.show = true;
      if (value) {
        enter(vnode, function () {
          el.style.display = el.__vOriginalDisplay;
        });
      } else {
        leave(vnode, function () {
          el.style.display = 'none';
        });
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none';
    }
  },

  unbind: function unbind (
    el,
    binding,
    vnode,
    oldVnode,
    isDestroy
  ) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay;
    }
  }
};

var platformDirectives = {
  model: model$1,
  show: show
};

/*  */

// Provides transition support for a single element/component.
// supports transition mode (out-in / in-out)

var transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterToClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String,
  duration: [Number, String, Object]
};

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
function getRealChild (vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function extractTransitionData (comp) {
  var data = {};
  var options = comp.$options;
  // props
  for (var key in options.propsData) {
    data[key] = comp[key];
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  var listeners = options._parentListeners;
  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1];
  }
  return data
}

function placeholder (h, rawChild) {
  if (/\d-keep-alive$/.test(rawChild.tag)) {
    return h('keep-alive', {
      props: rawChild.componentOptions.propsData
    })
  }
}

function hasParentTransition (vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

function isSameChild (child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag
}

function isAsyncPlaceholder (node) {
  return node.isComment && node.asyncFactory
}

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,

  render: function render (h) {
    var this$1 = this;

    var children = this.$options._renderChildren;
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(function (c) { return c.tag || isAsyncPlaceholder(c); });
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if ("development" !== 'production' && children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      );
    }

    var mode = this.mode;

    // warn invalid mode
    if ("development" !== 'production' &&
      mode && mode !== 'in-out' && mode !== 'out-in'
    ) {
      warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      );
    }

    var rawChild = children[0];

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    var child = getRealChild(rawChild);
    /* istanbul ignore if */
    if (!child) {
      return rawChild
    }

    if (this._leaving) {
      return placeholder(h, rawChild)
    }

    // ensure a key that is unique to the vnode type and to this transition
    // component instance. This key will be used to remove pending leaving nodes
    // during entering.
    var id = "__transition-" + (this._uid) + "-";
    child.key = child.key == null
      ? child.isComment
        ? id + 'comment'
        : id + child.tag
      : isPrimitive(child.key)
        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
        : child.key;

    var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild);

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
      child.data.show = true;
    }

    if (
      oldChild &&
      oldChild.data &&
      !isSameChild(child, oldChild) &&
      !isAsyncPlaceholder(oldChild)
    ) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      var oldData = oldChild && (oldChild.data.transition = extend({}, data));
      // handle transition mode
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true;
        mergeVNodeHook(oldData, 'afterLeave', function () {
          this$1._leaving = false;
          this$1.$forceUpdate();
        });
        return placeholder(h, rawChild)
      } else if (mode === 'in-out') {
        if (isAsyncPlaceholder(child)) {
          return oldRawChild
        }
        var delayedLeave;
        var performLeave = function () { delayedLeave(); };
        mergeVNodeHook(data, 'afterEnter', performLeave);
        mergeVNodeHook(data, 'enterCancelled', performLeave);
        mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
      }
    }

    return rawChild
  }
};

/*  */

// Provides transition support for list items.
// supports move transitions using the FLIP technique.

// Because the vdom's children update algorithm is "unstable" - i.e.
// it doesn't guarantee the relative positioning of removed elements,
// we force transition-group to update its children into two passes:
// in the first pass, we remove all nodes that need to be removed,
// triggering their leaving transition; in the second pass, we insert/move
// into the final desired state. This way in the second pass removed
// nodes will remain where they should be.

var props = extend({
  tag: String,
  moveClass: String
}, transitionProps);

delete props.mode;

var TransitionGroup = {
  props: props,

  render: function render (h) {
    var tag = this.tag || this.$vnode.data.tag || 'span';
    var map = Object.create(null);
    var prevChildren = this.prevChildren = this.children;
    var rawChildren = this.$slots.default || [];
    var children = this.children = [];
    var transitionData = extractTransitionData(this);

    for (var i = 0; i < rawChildren.length; i++) {
      var c = rawChildren[i];
      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c);
          map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData;
        } else if (true) {
          var opts = c.componentOptions;
          var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
          warn(("<transition-group> children must be keyed: <" + name + ">"));
        }
      }
    }

    if (prevChildren) {
      var kept = [];
      var removed = [];
      for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
        var c$1 = prevChildren[i$1];
        c$1.data.transition = transitionData;
        c$1.data.pos = c$1.elm.getBoundingClientRect();
        if (map[c$1.key]) {
          kept.push(c$1);
        } else {
          removed.push(c$1);
        }
      }
      this.kept = h(tag, null, kept);
      this.removed = removed;
    }

    return h(tag, null, children)
  },

  beforeUpdate: function beforeUpdate () {
    // force removing pass
    this.__patch__(
      this._vnode,
      this.kept,
      false, // hydrating
      true // removeOnly (!important, avoids unnecessary moves)
    );
    this._vnode = this.kept;
  },

  updated: function updated () {
    var children = this.prevChildren;
    var moveClass = this.moveClass || ((this.name || 'v') + '-move');
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return
    }

    // we divide the work into three loops to avoid mixing DOM reads and writes
    // in each iteration - which helps prevent layout thrashing.
    children.forEach(callPendingCbs);
    children.forEach(recordPosition);
    children.forEach(applyTranslation);

    // force reflow to put everything in position
    var body = document.body;
    var f = body.offsetHeight; // eslint-disable-line

    children.forEach(function (c) {
      if (c.data.moved) {
        var el = c.elm;
        var s = el.style;
        addTransitionClass(el, moveClass);
        s.transform = s.WebkitTransform = s.transitionDuration = '';
        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb);
            el._moveCb = null;
            removeTransitionClass(el, moveClass);
          }
        });
      }
    });
  },

  methods: {
    hasMove: function hasMove (el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false
      }
      /* istanbul ignore if */
      if (this._hasMove) {
        return this._hasMove
      }
      // Detect whether an element with the move class applied has
      // CSS transitions. Since the element may be inside an entering
      // transition at this very moment, we make a clone of it and remove
      // all other transition classes applied to ensure only the move class
      // is applied.
      var clone = el.cloneNode();
      if (el._transitionClasses) {
        el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
      }
      addClass(clone, moveClass);
      clone.style.display = 'none';
      this.$el.appendChild(clone);
      var info = getTransitionInfo(clone);
      this.$el.removeChild(clone);
      return (this._hasMove = info.hasTransform)
    }
  }
};

function callPendingCbs (c) {
  /* istanbul ignore if */
  if (c.elm._moveCb) {
    c.elm._moveCb();
  }
  /* istanbul ignore if */
  if (c.elm._enterCb) {
    c.elm._enterCb();
  }
}

function recordPosition (c) {
  c.data.newPos = c.elm.getBoundingClientRect();
}

function applyTranslation (c) {
  var oldPos = c.data.pos;
  var newPos = c.data.newPos;
  var dx = oldPos.left - newPos.left;
  var dy = oldPos.top - newPos.top;
  if (dx || dy) {
    c.data.moved = true;
    var s = c.elm.style;
    s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
    s.transitionDuration = '0s';
  }
}

var platformComponents = {
  Transition: Transition,
  TransitionGroup: TransitionGroup
};

/*  */

// install platform specific utils
Vue$3.config.mustUseProp = mustUseProp;
Vue$3.config.isReservedTag = isReservedTag;
Vue$3.config.isReservedAttr = isReservedAttr;
Vue$3.config.getTagNamespace = getTagNamespace;
Vue$3.config.isUnknownElement = isUnknownElement;

// install platform runtime directives & components
extend(Vue$3.options.directives, platformDirectives);
extend(Vue$3.options.components, platformComponents);

// install platform patch function
Vue$3.prototype.__patch__ = inBrowser ? patch : noop;

// public mount method
Vue$3.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating)
};

// devtools global hook
/* istanbul ignore next */
setTimeout(function () {
  if (config.devtools) {
    if (devtools) {
      devtools.emit('init', Vue$3);
    } else if ("development" !== 'production' && isChrome) {
      console[console.info ? 'info' : 'log'](
        'Download the Vue Devtools extension for a better development experience:\n' +
        'https://github.com/vuejs/vue-devtools'
      );
    }
  }
  if ("development" !== 'production' &&
    config.productionTip !== false &&
    inBrowser && typeof console !== 'undefined'
  ) {
    console[console.info ? 'info' : 'log'](
      "You are running Vue in development mode.\n" +
      "Make sure to turn on production mode when deploying for production.\n" +
      "See more tips at https://vuejs.org/guide/deployment.html"
    );
  }
}, 0);

/*  */

// check whether current browser encodes a char inside attribute values
function shouldDecode (content, encoded) {
  var div = document.createElement('div');
  div.innerHTML = "<div a=\"" + content + "\"/>";
  return div.innerHTML.indexOf(encoded) > 0
}

// #3663
// IE encodes newlines inside attribute values while other browsers don't
var shouldDecodeNewlines = inBrowser ? shouldDecode('\n', '&#10;') : false;

/*  */

var defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;
var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

var buildRegex = cached(function (delimiters) {
  var open = delimiters[0].replace(regexEscapeRE, '\\$&');
  var close = delimiters[1].replace(regexEscapeRE, '\\$&');
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
});

function parseText (
  text,
  delimiters
) {
  var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
  if (!tagRE.test(text)) {
    return
  }
  var tokens = [];
  var lastIndex = tagRE.lastIndex = 0;
  var match, index;
  while ((match = tagRE.exec(text))) {
    index = match.index;
    // push text token
    if (index > lastIndex) {
      tokens.push(JSON.stringify(text.slice(lastIndex, index)));
    }
    // tag token
    var exp = parseFilters(match[1].trim());
    tokens.push(("_s(" + exp + ")"));
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)));
  }
  return tokens.join('+')
}

/*  */

function transformNode (el, options) {
  var warn = options.warn || baseWarn;
  var staticClass = getAndRemoveAttr(el, 'class');
  if ("development" !== 'production' && staticClass) {
    var expression = parseText(staticClass, options.delimiters);
    if (expression) {
      warn(
        "class=\"" + staticClass + "\": " +
        'Interpolation inside attributes has been removed. ' +
        'Use v-bind or the colon shorthand instead. For example, ' +
        'instead of <div class="{{ val }}">, use <div :class="val">.'
      );
    }
  }
  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass);
  }
  var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
  if (classBinding) {
    el.classBinding = classBinding;
  }
}

function genData (el) {
  var data = '';
  if (el.staticClass) {
    data += "staticClass:" + (el.staticClass) + ",";
  }
  if (el.classBinding) {
    data += "class:" + (el.classBinding) + ",";
  }
  return data
}

var klass$1 = {
  staticKeys: ['staticClass'],
  transformNode: transformNode,
  genData: genData
};

/*  */

function transformNode$1 (el, options) {
  var warn = options.warn || baseWarn;
  var staticStyle = getAndRemoveAttr(el, 'style');
  if (staticStyle) {
    /* istanbul ignore if */
    if (true) {
      var expression = parseText(staticStyle, options.delimiters);
      if (expression) {
        warn(
          "style=\"" + staticStyle + "\": " +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div style="{{ val }}">, use <div :style="val">.'
        );
      }
    }
    el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
  }

  var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
  if (styleBinding) {
    el.styleBinding = styleBinding;
  }
}

function genData$1 (el) {
  var data = '';
  if (el.staticStyle) {
    data += "staticStyle:" + (el.staticStyle) + ",";
  }
  if (el.styleBinding) {
    data += "style:(" + (el.styleBinding) + "),";
  }
  return data
}

var style$1 = {
  staticKeys: ['staticStyle'],
  transformNode: transformNode$1,
  genData: genData$1
};

var modules$1 = [
  klass$1,
  style$1
];

/*  */

function text (el, dir) {
  if (dir.value) {
    addProp(el, 'textContent', ("_s(" + (dir.value) + ")"));
  }
}

/*  */

function html (el, dir) {
  if (dir.value) {
    addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"));
  }
}

var directives$1 = {
  model: model,
  text: text,
  html: html
};

/*  */

var isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr'
);

// Elements that you can, intentionally, leave open
// (and which close themselves)
var canBeLeftOpenTag = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
);

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
var isNonPhrasingTag = makeMap(
  'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
  'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
  'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
  'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
  'title,tr,track'
);

/*  */

var baseOptions = {
  expectHTML: true,
  modules: modules$1,
  directives: directives$1,
  isPreTag: isPreTag,
  isUnaryTag: isUnaryTag,
  mustUseProp: mustUseProp,
  canBeLeftOpenTag: canBeLeftOpenTag,
  isReservedTag: isReservedTag,
  getTagNamespace: getTagNamespace,
  staticKeys: genStaticKeys(modules$1)
};

/*  */

var decoder;

var he = {
  decode: function decode (html) {
    decoder = decoder || document.createElement('div');
    decoder.innerHTML = html;
    return decoder.textContent
  }
};

/**
 * Not type-checking this file because it's mostly vendor code.
 */

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

// Regular Expressions for parsing tags and attributes
var singleAttrIdentifier = /([^\s"'<>/=]+)/;
var singleAttrAssign = /(?:=)/;
var singleAttrValues = [
  // attr value double quotes
  /"([^"]*)"+/.source,
  // attr value, single quotes
  /'([^']*)'+/.source,
  // attr value, no quotes
  /([^\s"'=<>`]+)/.source
];
var attribute = new RegExp(
  '^\\s*' + singleAttrIdentifier.source +
  '(?:\\s*(' + singleAttrAssign.source + ')' +
  '\\s*(?:' + singleAttrValues.join('|') + '))?'
);

// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
var ncname = '[a-zA-Z_][\\w\\-\\.]*';
var qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')';
var startTagOpen = new RegExp('^<' + qnameCapture);
var startTagClose = /^\s*(\/?)>/;
var endTag = new RegExp('^<\\/' + qnameCapture + '[^>]*>');
var doctype = /^<!DOCTYPE [^>]+>/i;
var comment = /^<!--/;
var conditionalComment = /^<!\[/;

var IS_REGEX_CAPTURING_BROKEN = false;
'x'.replace(/x(.)?/g, function (m, g) {
  IS_REGEX_CAPTURING_BROKEN = g === '';
});

// Special Elements (can contain anything)
var isPlainTextElement = makeMap('script,style,textarea', true);
var reCache = {};

var decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n'
};
var encodedAttr = /&(?:lt|gt|quot|amp);/g;
var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10);/g;

// #5992
var isIgnoreNewlineTag = makeMap('pre,textarea', true);
var shouldIgnoreFirstNewline = function (tag, html) { return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'; };

function decodeAttr (value, shouldDecodeNewlines) {
  var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
  return value.replace(re, function (match) { return decodingMap[match]; })
}

function parseHTML (html, options) {
  var stack = [];
  var expectHTML = options.expectHTML;
  var isUnaryTag$$1 = options.isUnaryTag || no;
  var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no;
  var index = 0;
  var last, lastTag;
  while (html) {
    last = html;
    // Make sure we're not in a plaintext content element like script/style
    if (!lastTag || !isPlainTextElement(lastTag)) {
      var textEnd = html.indexOf('<');
      if (textEnd === 0) {
        // Comment:
        if (comment.test(html)) {
          var commentEnd = html.indexOf('-->');

          if (commentEnd >= 0) {
            if (options.shouldKeepComment) {
              options.comment(html.substring(4, commentEnd));
            }
            advance(commentEnd + 3);
            continue
          }
        }

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        if (conditionalComment.test(html)) {
          var conditionalEnd = html.indexOf(']>');

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2);
            continue
          }
        }

        // Doctype:
        var doctypeMatch = html.match(doctype);
        if (doctypeMatch) {
          advance(doctypeMatch[0].length);
          continue
        }

        // End tag:
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          var curIndex = index;
          advance(endTagMatch[0].length);
          parseEndTag(endTagMatch[1], curIndex, index);
          continue
        }

        // Start tag:
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          handleStartTag(startTagMatch);
          if (shouldIgnoreFirstNewline(lastTag, html)) {
            advance(1);
          }
          continue
        }
      }

      var text = (void 0), rest = (void 0), next = (void 0);
      if (textEnd >= 0) {
        rest = html.slice(textEnd);
        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
        ) {
          // < in plain text, be forgiving and treat it as text
          next = rest.indexOf('<', 1);
          if (next < 0) { break }
          textEnd += next;
          rest = html.slice(textEnd);
        }
        text = html.substring(0, textEnd);
        advance(textEnd);
      }

      if (textEnd < 0) {
        text = html;
        html = '';
      }

      if (options.chars && text) {
        options.chars(text);
      }
    } else {
      var endTagLength = 0;
      var stackedTag = lastTag.toLowerCase();
      var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
      var rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length;
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text
            .replace(/<!--([\s\S]*?)-->/g, '$1')
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
        }
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1);
        }
        if (options.chars) {
          options.chars(text);
        }
        return ''
      });
      index += html.length - rest$1.length;
      html = rest$1;
      parseEndTag(stackedTag, index - endTagLength, index);
    }

    if (html === last) {
      options.chars && options.chars(html);
      if ("development" !== 'production' && !stack.length && options.warn) {
        options.warn(("Mal-formatted tag at end of template: \"" + html + "\""));
      }
      break
    }
  }

  // Clean up any remaining tags
  parseEndTag();

  function advance (n) {
    index += n;
    html = html.substring(n);
  }

  function parseStartTag () {
    var start = html.match(startTagOpen);
    if (start) {
      var match = {
        tagName: start[1],
        attrs: [],
        start: index
      };
      advance(start[0].length);
      var end, attr;
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length);
        match.attrs.push(attr);
      }
      if (end) {
        match.unarySlash = end[1];
        advance(end[0].length);
        match.end = index;
        return match
      }
    }
  }

  function handleStartTag (match) {
    var tagName = match.tagName;
    var unarySlash = match.unarySlash;

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag);
      }
      if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
        parseEndTag(tagName);
      }
    }

    var unary = isUnaryTag$$1(tagName) || !!unarySlash;

    var l = match.attrs.length;
    var attrs = new Array(l);
    for (var i = 0; i < l; i++) {
      var args = match.attrs[i];
      // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
      if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
        if (args[3] === '') { delete args[3]; }
        if (args[4] === '') { delete args[4]; }
        if (args[5] === '') { delete args[5]; }
      }
      var value = args[3] || args[4] || args[5] || '';
      attrs[i] = {
        name: args[1],
        value: decodeAttr(
          value,
          options.shouldDecodeNewlines
        )
      };
    }

    if (!unary) {
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs });
      lastTag = tagName;
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end);
    }
  }

  function parseEndTag (tagName, start, end) {
    var pos, lowerCasedTagName;
    if (start == null) { start = index; }
    if (end == null) { end = index; }

    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase();
    }

    // Find the closest opened tag of the same type
    if (tagName) {
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0;
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (var i = stack.length - 1; i >= pos; i--) {
        if ("development" !== 'production' &&
          (i > pos || !tagName) &&
          options.warn
        ) {
          options.warn(
            ("tag <" + (stack[i].tag) + "> has no matching end tag.")
          );
        }
        if (options.end) {
          options.end(stack[i].tag, start, end);
        }
      }

      // Remove the open elements from the stack
      stack.length = pos;
      lastTag = pos && stack[pos - 1].tag;
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end);
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end);
      }
      if (options.end) {
        options.end(tagName, start, end);
      }
    }
  }
}

/*  */

var onRE = /^@|^v-on:/;
var dirRE = /^v-|^@|^:/;
var forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/;
var forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/;

var argRE = /:(.*)$/;
var bindRE = /^:|^v-bind:/;
var modifierRE = /\.[^.]+/g;

var decodeHTMLCached = cached(he.decode);

// configurable state
var warn$2;
var delimiters;
var transforms;
var preTransforms;
var postTransforms;
var platformIsPreTag;
var platformMustUseProp;
var platformGetTagNamespace;

/**
 * Convert HTML string to AST.
 */
function parse (
  template,
  options
) {
  warn$2 = options.warn || baseWarn;

  platformIsPreTag = options.isPreTag || no;
  platformMustUseProp = options.mustUseProp || no;
  platformGetTagNamespace = options.getTagNamespace || no;

  transforms = pluckModuleFunction(options.modules, 'transformNode');
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');

  delimiters = options.delimiters;

  var stack = [];
  var preserveWhitespace = options.preserveWhitespace !== false;
  var root;
  var currentParent;
  var inVPre = false;
  var inPre = false;
  var warned = false;

  function warnOnce (msg) {
    if (!warned) {
      warned = true;
      warn$2(msg);
    }
  }

  function endPre (element) {
    // check pre state
    if (element.pre) {
      inVPre = false;
    }
    if (platformIsPreTag(element.tag)) {
      inPre = false;
    }
  }

  parseHTML(template, {
    warn: warn$2,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldKeepComment: options.comments,
    start: function start (tag, attrs, unary) {
      // check namespace.
      // inherit parent ns if there is one
      var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

      // handle IE svg bug
      /* istanbul ignore if */
      if (isIE && ns === 'svg') {
        attrs = guardIESVGBug(attrs);
      }

      var element = {
        type: 1,
        tag: tag,
        attrsList: attrs,
        attrsMap: makeAttrsMap(attrs),
        parent: currentParent,
        children: []
      };
      if (ns) {
        element.ns = ns;
      }

      if (isForbiddenTag(element) && !isServerRendering()) {
        element.forbidden = true;
        "development" !== 'production' && warn$2(
          'Templates should only be responsible for mapping the state to the ' +
          'UI. Avoid placing tags with side-effects in your templates, such as ' +
          "<" + tag + ">" + ', as they will not be parsed.'
        );
      }

      // apply pre-transforms
      for (var i = 0; i < preTransforms.length; i++) {
        preTransforms[i](element, options);
      }

      if (!inVPre) {
        processPre(element);
        if (element.pre) {
          inVPre = true;
        }
      }
      if (platformIsPreTag(element.tag)) {
        inPre = true;
      }
      if (inVPre) {
        processRawAttrs(element);
      } else {
        processFor(element);
        processIf(element);
        processOnce(element);
        processKey(element);

        // determine whether this is a plain element after
        // removing structural attributes
        element.plain = !element.key && !attrs.length;

        processRef(element);
        processSlot(element);
        processComponent(element);
        for (var i$1 = 0; i$1 < transforms.length; i$1++) {
          transforms[i$1](element, options);
        }
        processAttrs(element);
      }

      function checkRootConstraints (el) {
        if (true) {
          if (el.tag === 'slot' || el.tag === 'template') {
            warnOnce(
              "Cannot use <" + (el.tag) + "> as component root element because it may " +
              'contain multiple nodes.'
            );
          }
          if (el.attrsMap.hasOwnProperty('v-for')) {
            warnOnce(
              'Cannot use v-for on stateful component root element because ' +
              'it renders multiple elements.'
            );
          }
        }
      }

      // tree management
      if (!root) {
        root = element;
        checkRootConstraints(root);
      } else if (!stack.length) {
        // allow root elements with v-if, v-else-if and v-else
        if (root.if && (element.elseif || element.else)) {
          checkRootConstraints(element);
          addIfCondition(root, {
            exp: element.elseif,
            block: element
          });
        } else if (true) {
          warnOnce(
            "Component template should contain exactly one root element. " +
            "If you are using v-if on multiple elements, " +
            "use v-else-if to chain them instead."
          );
        }
      }
      if (currentParent && !element.forbidden) {
        if (element.elseif || element.else) {
          processIfConditions(element, currentParent);
        } else if (element.slotScope) { // scoped slot
          currentParent.plain = false;
          var name = element.slotTarget || '"default"';(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
        } else {
          currentParent.children.push(element);
          element.parent = currentParent;
        }
      }
      if (!unary) {
        currentParent = element;
        stack.push(element);
      } else {
        endPre(element);
      }
      // apply post-transforms
      for (var i$2 = 0; i$2 < postTransforms.length; i$2++) {
        postTransforms[i$2](element, options);
      }
    },

    end: function end () {
      // remove trailing whitespace
      var element = stack[stack.length - 1];
      var lastNode = element.children[element.children.length - 1];
      if (lastNode && lastNode.type === 3 && lastNode.text === ' ' && !inPre) {
        element.children.pop();
      }
      // pop stack
      stack.length -= 1;
      currentParent = stack[stack.length - 1];
      endPre(element);
    },

    chars: function chars (text) {
      if (!currentParent) {
        if (true) {
          if (text === template) {
            warnOnce(
              'Component template requires a root element, rather than just text.'
            );
          } else if ((text = text.trim())) {
            warnOnce(
              ("text \"" + text + "\" outside root element will be ignored.")
            );
          }
        }
        return
      }
      // IE textarea placeholder bug
      /* istanbul ignore if */
      if (isIE &&
        currentParent.tag === 'textarea' &&
        currentParent.attrsMap.placeholder === text
      ) {
        return
      }
      var children = currentParent.children;
      text = inPre || text.trim()
        ? isTextTag(currentParent) ? text : decodeHTMLCached(text)
        // only preserve whitespace if its not right after a starting tag
        : preserveWhitespace && children.length ? ' ' : '';
      if (text) {
        var expression;
        if (!inVPre && text !== ' ' && (expression = parseText(text, delimiters))) {
          children.push({
            type: 2,
            expression: expression,
            text: text
          });
        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          children.push({
            type: 3,
            text: text
          });
        }
      }
    },
    comment: function comment (text) {
      currentParent.children.push({
        type: 3,
        text: text,
        isComment: true
      });
    }
  });
  return root
}

function processPre (el) {
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true;
  }
}

function processRawAttrs (el) {
  var l = el.attrsList.length;
  if (l) {
    var attrs = el.attrs = new Array(l);
    for (var i = 0; i < l; i++) {
      attrs[i] = {
        name: el.attrsList[i].name,
        value: JSON.stringify(el.attrsList[i].value)
      };
    }
  } else if (!el.pre) {
    // non root node in pre blocks with no attributes
    el.plain = true;
  }
}

function processKey (el) {
  var exp = getBindingAttr(el, 'key');
  if (exp) {
    if ("development" !== 'production' && el.tag === 'template') {
      warn$2("<template> cannot be keyed. Place the key on real elements instead.");
    }
    el.key = exp;
  }
}

function processRef (el) {
  var ref = getBindingAttr(el, 'ref');
  if (ref) {
    el.ref = ref;
    el.refInFor = checkInFor(el);
  }
}

function processFor (el) {
  var exp;
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    var inMatch = exp.match(forAliasRE);
    if (!inMatch) {
      "development" !== 'production' && warn$2(
        ("Invalid v-for expression: " + exp)
      );
      return
    }
    el.for = inMatch[2].trim();
    var alias = inMatch[1].trim();
    var iteratorMatch = alias.match(forIteratorRE);
    if (iteratorMatch) {
      el.alias = iteratorMatch[1].trim();
      el.iterator1 = iteratorMatch[2].trim();
      if (iteratorMatch[3]) {
        el.iterator2 = iteratorMatch[3].trim();
      }
    } else {
      el.alias = alias;
    }
  }
}

function processIf (el) {
  var exp = getAndRemoveAttr(el, 'v-if');
  if (exp) {
    el.if = exp;
    addIfCondition(el, {
      exp: exp,
      block: el
    });
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true;
    }
    var elseif = getAndRemoveAttr(el, 'v-else-if');
    if (elseif) {
      el.elseif = elseif;
    }
  }
}

function processIfConditions (el, parent) {
  var prev = findPrevElement(parent.children);
  if (prev && prev.if) {
    addIfCondition(prev, {
      exp: el.elseif,
      block: el
    });
  } else if (true) {
    warn$2(
      "v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + " " +
      "used on element <" + (el.tag) + "> without corresponding v-if."
    );
  }
}

function findPrevElement (children) {
  var i = children.length;
  while (i--) {
    if (children[i].type === 1) {
      return children[i]
    } else {
      if ("development" !== 'production' && children[i].text !== ' ') {
        warn$2(
          "text \"" + (children[i].text.trim()) + "\" between v-if and v-else(-if) " +
          "will be ignored."
        );
      }
      children.pop();
    }
  }
}

function addIfCondition (el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = [];
  }
  el.ifConditions.push(condition);
}

function processOnce (el) {
  var once$$1 = getAndRemoveAttr(el, 'v-once');
  if (once$$1 != null) {
    el.once = true;
  }
}

function processSlot (el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name');
    if ("development" !== 'production' && el.key) {
      warn$2(
        "`key` does not work on <slot> because slots are abstract outlets " +
        "and can possibly expand into multiple elements. " +
        "Use the key on a wrapping element instead."
      );
    }
  } else {
    var slotTarget = getBindingAttr(el, 'slot');
    if (slotTarget) {
      el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
    }
    if (el.tag === 'template') {
      el.slotScope = getAndRemoveAttr(el, 'scope');
    }
  }
}

function processComponent (el) {
  var binding;
  if ((binding = getBindingAttr(el, 'is'))) {
    el.component = binding;
  }
  if (getAndRemoveAttr(el, 'inline-template') != null) {
    el.inlineTemplate = true;
  }
}

function processAttrs (el) {
  var list = el.attrsList;
  var i, l, name, rawName, value, modifiers, isProp;
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name;
    value = list[i].value;
    if (dirRE.test(name)) {
      // mark element as dynamic
      el.hasBindings = true;
      // modifiers
      modifiers = parseModifiers(name);
      if (modifiers) {
        name = name.replace(modifierRE, '');
      }
      if (bindRE.test(name)) { // v-bind
        name = name.replace(bindRE, '');
        value = parseFilters(value);
        isProp = false;
        if (modifiers) {
          if (modifiers.prop) {
            isProp = true;
            name = camelize(name);
            if (name === 'innerHtml') { name = 'innerHTML'; }
          }
          if (modifiers.camel) {
            name = camelize(name);
          }
          if (modifiers.sync) {
            addHandler(
              el,
              ("update:" + (camelize(name))),
              genAssignmentCode(value, "$event")
            );
          }
        }
        if (isProp || (
          !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
        )) {
          addProp(el, name, value);
        } else {
          addAttr(el, name, value);
        }
      } else if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '');
        addHandler(el, name, value, modifiers, false, warn$2);
      } else { // normal directives
        name = name.replace(dirRE, '');
        // parse arg
        var argMatch = name.match(argRE);
        var arg = argMatch && argMatch[1];
        if (arg) {
          name = name.slice(0, -(arg.length + 1));
        }
        addDirective(el, name, rawName, value, arg, modifiers);
        if ("development" !== 'production' && name === 'model') {
          checkForAliasModel(el, value);
        }
      }
    } else {
      // literal attribute
      if (true) {
        var expression = parseText(value, delimiters);
        if (expression) {
          warn$2(
            name + "=\"" + value + "\": " +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div id="{{ val }}">, use <div :id="val">.'
          );
        }
      }
      addAttr(el, name, JSON.stringify(value));
    }
  }
}

function checkInFor (el) {
  var parent = el;
  while (parent) {
    if (parent.for !== undefined) {
      return true
    }
    parent = parent.parent;
  }
  return false
}

function parseModifiers (name) {
  var match = name.match(modifierRE);
  if (match) {
    var ret = {};
    match.forEach(function (m) { ret[m.slice(1)] = true; });
    return ret
  }
}

function makeAttrsMap (attrs) {
  var map = {};
  for (var i = 0, l = attrs.length; i < l; i++) {
    if (
      "development" !== 'production' &&
      map[attrs[i].name] && !isIE && !isEdge
    ) {
      warn$2('duplicate attribute: ' + attrs[i].name);
    }
    map[attrs[i].name] = attrs[i].value;
  }
  return map
}

// for script (e.g. type="x/template") or style, do not decode content
function isTextTag (el) {
  return el.tag === 'script' || el.tag === 'style'
}

function isForbiddenTag (el) {
  return (
    el.tag === 'style' ||
    (el.tag === 'script' && (
      !el.attrsMap.type ||
      el.attrsMap.type === 'text/javascript'
    ))
  )
}

var ieNSBug = /^xmlns:NS\d+/;
var ieNSPrefix = /^NS\d+:/;

/* istanbul ignore next */
function guardIESVGBug (attrs) {
  var res = [];
  for (var i = 0; i < attrs.length; i++) {
    var attr = attrs[i];
    if (!ieNSBug.test(attr.name)) {
      attr.name = attr.name.replace(ieNSPrefix, '');
      res.push(attr);
    }
  }
  return res
}

function checkForAliasModel (el, value) {
  var _el = el;
  while (_el) {
    if (_el.for && _el.alias === value) {
      warn$2(
        "<" + (el.tag) + " v-model=\"" + value + "\">: " +
        "You are binding v-model directly to a v-for iteration alias. " +
        "This will not be able to modify the v-for source array because " +
        "writing to the alias is like modifying a function local variable. " +
        "Consider using an array of objects and use v-model on an object property instead."
      );
    }
    _el = _el.parent;
  }
}

/*  */

var isStaticKey;
var isPlatformReservedTag;

var genStaticKeysCached = cached(genStaticKeys$1);

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
function optimize (root, options) {
  if (!root) { return }
  isStaticKey = genStaticKeysCached(options.staticKeys || '');
  isPlatformReservedTag = options.isReservedTag || no;
  // first pass: mark all non-static nodes.
  markStatic$1(root);
  // second pass: mark static roots.
  markStaticRoots(root, false);
}

function genStaticKeys$1 (keys) {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs' +
    (keys ? ',' + keys : '')
  )
}

function markStatic$1 (node) {
  node.static = isStatic(node);
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    for (var i = 0, l = node.children.length; i < l; i++) {
      var child = node.children[i];
      markStatic$1(child);
      if (!child.static) {
        node.static = false;
      }
    }
    if (node.ifConditions) {
      for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
        var block = node.ifConditions[i$1].block;
        markStatic$1(block);
        if (!block.static) {
          node.static = false;
        }
      }
    }
  }
}

function markStaticRoots (node, isInFor) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor;
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true;
      return
    } else {
      node.staticRoot = false;
    }
    if (node.children) {
      for (var i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for);
      }
    }
    if (node.ifConditions) {
      for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
        markStaticRoots(node.ifConditions[i$1].block, isInFor);
      }
    }
  }
}

function isStatic (node) {
  if (node.type === 2) { // expression
    return false
  }
  if (node.type === 3) { // text
    return true
  }
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in
    isPlatformReservedTag(node.tag) && // not a component
    !isDirectChildOfTemplateFor(node) &&
    Object.keys(node).every(isStaticKey)
  ))
}

function isDirectChildOfTemplateFor (node) {
  while (node.parent) {
    node = node.parent;
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}

/*  */

var fnExpRE = /^\s*([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/;
var simplePathRE = /^\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?']|\[".*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*\s*$/;

// keyCode aliases
var keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  'delete': [8, 46]
};

// #4868: modifiers that prevent the execution of the listener
// need to explicitly return null so that we can determine whether to remove
// the listener for .once
var genGuard = function (condition) { return ("if(" + condition + ")return null;"); };

var modifierCode = {
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  self: genGuard("$event.target !== $event.currentTarget"),
  ctrl: genGuard("!$event.ctrlKey"),
  shift: genGuard("!$event.shiftKey"),
  alt: genGuard("!$event.altKey"),
  meta: genGuard("!$event.metaKey"),
  left: genGuard("'button' in $event && $event.button !== 0"),
  middle: genGuard("'button' in $event && $event.button !== 1"),
  right: genGuard("'button' in $event && $event.button !== 2")
};

function genHandlers (
  events,
  isNative,
  warn
) {
  var res = isNative ? 'nativeOn:{' : 'on:{';
  for (var name in events) {
    var handler = events[name];
    // #5330: warn click.right, since right clicks do not actually fire click events.
    if ("development" !== 'production' &&
      name === 'click' &&
      handler && handler.modifiers && handler.modifiers.right
    ) {
      warn(
        "Use \"contextmenu\" instead of \"click.right\" since right clicks " +
        "do not actually fire \"click\" events."
      );
    }
    res += "\"" + name + "\":" + (genHandler(name, handler)) + ",";
  }
  return res.slice(0, -1) + '}'
}

function genHandler (
  name,
  handler
) {
  if (!handler) {
    return 'function(){}'
  }

  if (Array.isArray(handler)) {
    return ("[" + (handler.map(function (handler) { return genHandler(name, handler); }).join(',')) + "]")
  }

  var isMethodPath = simplePathRE.test(handler.value);
  var isFunctionExpression = fnExpRE.test(handler.value);

  if (!handler.modifiers) {
    return isMethodPath || isFunctionExpression
      ? handler.value
      : ("function($event){" + (handler.value) + "}") // inline statement
  } else {
    var code = '';
    var genModifierCode = '';
    var keys = [];
    for (var key in handler.modifiers) {
      if (modifierCode[key]) {
        genModifierCode += modifierCode[key];
        // left/right
        if (keyCodes[key]) {
          keys.push(key);
        }
      } else {
        keys.push(key);
      }
    }
    if (keys.length) {
      code += genKeyFilter(keys);
    }
    // Make sure modifiers like prevent and stop get executed after key filtering
    if (genModifierCode) {
      code += genModifierCode;
    }
    var handlerCode = isMethodPath
      ? handler.value + '($event)'
      : isFunctionExpression
        ? ("(" + (handler.value) + ")($event)")
        : handler.value;
    return ("function($event){" + code + handlerCode + "}")
  }
}

function genKeyFilter (keys) {
  return ("if(!('button' in $event)&&" + (keys.map(genFilterCode).join('&&')) + ")return null;")
}

function genFilterCode (key) {
  var keyVal = parseInt(key, 10);
  if (keyVal) {
    return ("$event.keyCode!==" + keyVal)
  }
  var alias = keyCodes[key];
  return ("_k($event.keyCode," + (JSON.stringify(key)) + (alias ? ',' + JSON.stringify(alias) : '') + ")")
}

/*  */

function on (el, dir) {
  if ("development" !== 'production' && dir.modifiers) {
    warn("v-on without argument does not support modifiers.");
  }
  el.wrapListeners = function (code) { return ("_g(" + code + "," + (dir.value) + ")"); };
}

/*  */

function bind$1 (el, dir) {
  el.wrapData = function (code) {
    return ("_b(" + code + ",'" + (el.tag) + "'," + (dir.value) + "," + (dir.modifiers && dir.modifiers.prop ? 'true' : 'false') + (dir.modifiers && dir.modifiers.sync ? ',true' : '') + ")")
  };
}

/*  */

var baseDirectives = {
  on: on,
  bind: bind$1,
  cloak: noop
};

/*  */

var CodegenState = function CodegenState (options) {
  this.options = options;
  this.warn = options.warn || baseWarn;
  this.transforms = pluckModuleFunction(options.modules, 'transformCode');
  this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
  this.directives = extend(extend({}, baseDirectives), options.directives);
  var isReservedTag = options.isReservedTag || no;
  this.maybeComponent = function (el) { return !isReservedTag(el.tag); };
  this.onceId = 0;
  this.staticRenderFns = [];
};



function generate (
  ast,
  options
) {
  var state = new CodegenState(options);
  var code = ast ? genElement(ast, state) : '_c("div")';
  return {
    render: ("with(this){return " + code + "}"),
    staticRenderFns: state.staticRenderFns
  }
}

function genElement (el, state) {
  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state)
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.tag === 'template' && !el.slotTarget) {
    return genChildren(el, state) || 'void 0'
  } else if (el.tag === 'slot') {
    return genSlot(el, state)
  } else {
    // component or element
    var code;
    if (el.component) {
      code = genComponent(el.component, el, state);
    } else {
      var data = el.plain ? undefined : genData$2(el, state);

      var children = el.inlineTemplate ? null : genChildren(el, state, true);
      code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
    }
    // module transforms
    for (var i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code);
    }
    return code
  }
}

// hoist static sub-trees out
function genStatic (el, state) {
  el.staticProcessed = true;
  state.staticRenderFns.push(("with(this){return " + (genElement(el, state)) + "}"));
  return ("_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
}

// v-once
function genOnce (el, state) {
  el.onceProcessed = true;
  if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.staticInFor) {
    var key = '';
    var parent = el.parent;
    while (parent) {
      if (parent.for) {
        key = parent.key;
        break
      }
      parent = parent.parent;
    }
    if (!key) {
      "development" !== 'production' && state.warn(
        "v-once can only be used inside v-for that is keyed. "
      );
      return genElement(el, state)
    }
    return ("_o(" + (genElement(el, state)) + "," + (state.onceId++) + (key ? ("," + key) : "") + ")")
  } else {
    return genStatic(el, state)
  }
}

function genIf (
  el,
  state,
  altGen,
  altEmpty
) {
  el.ifProcessed = true; // avoid recursion
  return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
}

function genIfConditions (
  conditions,
  state,
  altGen,
  altEmpty
) {
  if (!conditions.length) {
    return altEmpty || '_e()'
  }

  var condition = conditions.shift();
  if (condition.exp) {
    return ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions, state, altGen, altEmpty)))
  } else {
    return ("" + (genTernaryExp(condition.block)))
  }

  // v-if with v-once should generate code like (a)?_m(0):_m(1)
  function genTernaryExp (el) {
    return altGen
      ? altGen(el, state)
      : el.once
        ? genOnce(el, state)
        : genElement(el, state)
  }
}

function genFor (
  el,
  state,
  altGen,
  altHelper
) {
  var exp = el.for;
  var alias = el.alias;
  var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
  var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';

  if ("development" !== 'production' &&
    state.maybeComponent(el) &&
    el.tag !== 'slot' &&
    el.tag !== 'template' &&
    !el.key
  ) {
    state.warn(
      "<" + (el.tag) + " v-for=\"" + alias + " in " + exp + "\">: component lists rendered with " +
      "v-for should have explicit keys. " +
      "See https://vuejs.org/guide/list.html#key for more info.",
      true /* tip */
    );
  }

  el.forProcessed = true; // avoid recursion
  return (altHelper || '_l') + "((" + exp + ")," +
    "function(" + alias + iterator1 + iterator2 + "){" +
      "return " + ((altGen || genElement)(el, state)) +
    '})'
}

function genData$2 (el, state) {
  var data = '{';

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  var dirs = genDirectives(el, state);
  if (dirs) { data += dirs + ','; }

  // key
  if (el.key) {
    data += "key:" + (el.key) + ",";
  }
  // ref
  if (el.ref) {
    data += "ref:" + (el.ref) + ",";
  }
  if (el.refInFor) {
    data += "refInFor:true,";
  }
  // pre
  if (el.pre) {
    data += "pre:true,";
  }
  // record original tag name for components using "is" attribute
  if (el.component) {
    data += "tag:\"" + (el.tag) + "\",";
  }
  // module data generation functions
  for (var i = 0; i < state.dataGenFns.length; i++) {
    data += state.dataGenFns[i](el);
  }
  // attributes
  if (el.attrs) {
    data += "attrs:{" + (genProps(el.attrs)) + "},";
  }
  // DOM props
  if (el.props) {
    data += "domProps:{" + (genProps(el.props)) + "},";
  }
  // event handlers
  if (el.events) {
    data += (genHandlers(el.events, false, state.warn)) + ",";
  }
  if (el.nativeEvents) {
    data += (genHandlers(el.nativeEvents, true, state.warn)) + ",";
  }
  // slot target
  if (el.slotTarget) {
    data += "slot:" + (el.slotTarget) + ",";
  }
  // scoped slots
  if (el.scopedSlots) {
    data += (genScopedSlots(el.scopedSlots, state)) + ",";
  }
  // component v-model
  if (el.model) {
    data += "model:{value:" + (el.model.value) + ",callback:" + (el.model.callback) + ",expression:" + (el.model.expression) + "},";
  }
  // inline-template
  if (el.inlineTemplate) {
    var inlineTemplate = genInlineTemplate(el, state);
    if (inlineTemplate) {
      data += inlineTemplate + ",";
    }
  }
  data = data.replace(/,$/, '') + '}';
  // v-bind data wrap
  if (el.wrapData) {
    data = el.wrapData(data);
  }
  // v-on data wrap
  if (el.wrapListeners) {
    data = el.wrapListeners(data);
  }
  return data
}

function genDirectives (el, state) {
  var dirs = el.directives;
  if (!dirs) { return }
  var res = 'directives:[';
  var hasRuntime = false;
  var i, l, dir, needRuntime;
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i];
    needRuntime = true;
    var gen = state.directives[dir.name];
    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      needRuntime = !!gen(el, dir, state.warn);
    }
    if (needRuntime) {
      hasRuntime = true;
      res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:\"" + (dir.arg) + "\"") : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}

function genInlineTemplate (el, state) {
  var ast = el.children[0];
  if ("development" !== 'production' && (
    el.children.length > 1 || ast.type !== 1
  )) {
    state.warn('Inline-template components must have exactly one child element.');
  }
  if (ast.type === 1) {
    var inlineRenderFns = generate(ast, state.options);
    return ("inlineTemplate:{render:function(){" + (inlineRenderFns.render) + "},staticRenderFns:[" + (inlineRenderFns.staticRenderFns.map(function (code) { return ("function(){" + code + "}"); }).join(',')) + "]}")
  }
}

function genScopedSlots (
  slots,
  state
) {
  return ("scopedSlots:_u([" + (Object.keys(slots).map(function (key) {
      return genScopedSlot(key, slots[key], state)
    }).join(',')) + "])")
}

function genScopedSlot (
  key,
  el,
  state
) {
  if (el.for && !el.forProcessed) {
    return genForScopedSlot(key, el, state)
  }
  return "{key:" + key + ",fn:function(" + (String(el.attrsMap.scope)) + "){" +
    "return " + (el.tag === 'template'
      ? genChildren(el, state) || 'void 0'
      : genElement(el, state)) + "}}"
}

function genForScopedSlot (
  key,
  el,
  state
) {
  var exp = el.for;
  var alias = el.alias;
  var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
  var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';
  el.forProcessed = true; // avoid recursion
  return "_l((" + exp + ")," +
    "function(" + alias + iterator1 + iterator2 + "){" +
      "return " + (genScopedSlot(key, el, state)) +
    '})'
}

function genChildren (
  el,
  state,
  checkSkip,
  altGenElement,
  altGenNode
) {
  var children = el.children;
  if (children.length) {
    var el$1 = children[0];
    // optimize single v-for
    if (children.length === 1 &&
      el$1.for &&
      el$1.tag !== 'template' &&
      el$1.tag !== 'slot'
    ) {
      return (altGenElement || genElement)(el$1, state)
    }
    var normalizationType = checkSkip
      ? getNormalizationType(children, state.maybeComponent)
      : 0;
    var gen = altGenNode || genNode;
    return ("[" + (children.map(function (c) { return gen(c, state); }).join(',')) + "]" + (normalizationType ? ("," + normalizationType) : ''))
  }
}

// determine the normalization needed for the children array.
// 0: no normalization needed
// 1: simple normalization needed (possible 1-level deep nested array)
// 2: full normalization needed
function getNormalizationType (
  children,
  maybeComponent
) {
  var res = 0;
  for (var i = 0; i < children.length; i++) {
    var el = children[i];
    if (el.type !== 1) {
      continue
    }
    if (needsNormalization(el) ||
        (el.ifConditions && el.ifConditions.some(function (c) { return needsNormalization(c.block); }))) {
      res = 2;
      break
    }
    if (maybeComponent(el) ||
        (el.ifConditions && el.ifConditions.some(function (c) { return maybeComponent(c.block); }))) {
      res = 1;
    }
  }
  return res
}

function needsNormalization (el) {
  return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
}

function genNode (node, state) {
  if (node.type === 1) {
    return genElement(node, state)
  } if (node.type === 3 && node.isComment) {
    return genComment(node)
  } else {
    return genText(node)
  }
}

function genText (text) {
  return ("_v(" + (text.type === 2
    ? text.expression // no need for () because already wrapped in _s()
    : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
}

function genComment (comment) {
  return ("_e(" + (JSON.stringify(comment.text)) + ")")
}

function genSlot (el, state) {
  var slotName = el.slotName || '"default"';
  var children = genChildren(el, state);
  var res = "_t(" + slotName + (children ? ("," + children) : '');
  var attrs = el.attrs && ("{" + (el.attrs.map(function (a) { return ((camelize(a.name)) + ":" + (a.value)); }).join(',')) + "}");
  var bind$$1 = el.attrsMap['v-bind'];
  if ((attrs || bind$$1) && !children) {
    res += ",null";
  }
  if (attrs) {
    res += "," + attrs;
  }
  if (bind$$1) {
    res += (attrs ? '' : ',null') + "," + bind$$1;
  }
  return res + ')'
}

// componentName is el.component, take it as argument to shun flow's pessimistic refinement
function genComponent (
  componentName,
  el,
  state
) {
  var children = el.inlineTemplate ? null : genChildren(el, state, true);
  return ("_c(" + componentName + "," + (genData$2(el, state)) + (children ? ("," + children) : '') + ")")
}

function genProps (props) {
  var res = '';
  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    res += "\"" + (prop.name) + "\":" + (transformSpecialNewlines(prop.value)) + ",";
  }
  return res.slice(0, -1)
}

// #3895, #4268
function transformSpecialNewlines (text) {
  return text
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/*  */

// these keywords should not appear inside expressions, but operators like
// typeof, instanceof and in are allowed
var prohibitedKeywordRE = new RegExp('\\b' + (
  'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
  'super,throw,while,yield,delete,export,import,return,switch,default,' +
  'extends,finally,continue,debugger,function,arguments'
).split(',').join('\\b|\\b') + '\\b');

// these unary operators should not be used as property/method names
var unaryOperatorsRE = new RegExp('\\b' + (
  'delete,typeof,void'
).split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)');

// check valid identifier for v-for
var identRE = /[A-Za-z_$][\w$]*/;

// strip strings in expressions
var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

// detect problematic expressions in a template
function detectErrors (ast) {
  var errors = [];
  if (ast) {
    checkNode(ast, errors);
  }
  return errors
}

function checkNode (node, errors) {
  if (node.type === 1) {
    for (var name in node.attrsMap) {
      if (dirRE.test(name)) {
        var value = node.attrsMap[name];
        if (value) {
          if (name === 'v-for') {
            checkFor(node, ("v-for=\"" + value + "\""), errors);
          } else if (onRE.test(name)) {
            checkEvent(value, (name + "=\"" + value + "\""), errors);
          } else {
            checkExpression(value, (name + "=\"" + value + "\""), errors);
          }
        }
      }
    }
    if (node.children) {
      for (var i = 0; i < node.children.length; i++) {
        checkNode(node.children[i], errors);
      }
    }
  } else if (node.type === 2) {
    checkExpression(node.expression, node.text, errors);
  }
}

function checkEvent (exp, text, errors) {
  var stipped = exp.replace(stripStringRE, '');
  var keywordMatch = stipped.match(unaryOperatorsRE);
  if (keywordMatch && stipped.charAt(keywordMatch.index - 1) !== '$') {
    errors.push(
      "avoid using JavaScript unary operator as property name: " +
      "\"" + (keywordMatch[0]) + "\" in expression " + (text.trim())
    );
  }
  checkExpression(exp, text, errors);
}

function checkFor (node, text, errors) {
  checkExpression(node.for || '', text, errors);
  checkIdentifier(node.alias, 'v-for alias', text, errors);
  checkIdentifier(node.iterator1, 'v-for iterator', text, errors);
  checkIdentifier(node.iterator2, 'v-for iterator', text, errors);
}

function checkIdentifier (ident, type, text, errors) {
  if (typeof ident === 'string' && !identRE.test(ident)) {
    errors.push(("invalid " + type + " \"" + ident + "\" in expression: " + (text.trim())));
  }
}

function checkExpression (exp, text, errors) {
  try {
    new Function(("return " + exp));
  } catch (e) {
    var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
    if (keywordMatch) {
      errors.push(
        "avoid using JavaScript keyword as property name: " +
        "\"" + (keywordMatch[0]) + "\" in expression " + (text.trim())
      );
    } else {
      errors.push(("invalid expression: " + (text.trim())));
    }
  }
}

/*  */

function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err: err, code: code });
    return noop
  }
}

function createCompileToFunctionFn (compile) {
  var cache = Object.create(null);

  return function compileToFunctions (
    template,
    options,
    vm
  ) {
    options = options || {};

    /* istanbul ignore if */
    if (true) {
      // detect possible CSP restriction
      try {
        new Function('return 1');
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) {
          warn(
            'It seems you are using the standalone build of Vue.js in an ' +
            'environment with Content Security Policy that prohibits unsafe-eval. ' +
            'The template compiler cannot work in this environment. Consider ' +
            'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
            'templates into render functions.'
          );
        }
      }
    }

    // check cache
    var key = options.delimiters
      ? String(options.delimiters) + template
      : template;
    if (cache[key]) {
      return cache[key]
    }

    // compile
    var compiled = compile(template, options);

    // check compilation errors/tips
    if (true) {
      if (compiled.errors && compiled.errors.length) {
        warn(
          "Error compiling template:\n\n" + template + "\n\n" +
          compiled.errors.map(function (e) { return ("- " + e); }).join('\n') + '\n',
          vm
        );
      }
      if (compiled.tips && compiled.tips.length) {
        compiled.tips.forEach(function (msg) { return tip(msg, vm); });
      }
    }

    // turn code into functions
    var res = {};
    var fnGenErrors = [];
    res.render = createFunction(compiled.render, fnGenErrors);
    res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
      return createFunction(code, fnGenErrors)
    });

    // check function generation errors.
    // this should only happen if there is a bug in the compiler itself.
    // mostly for codegen development use
    /* istanbul ignore if */
    if (true) {
      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
        warn(
          "Failed to generate render function:\n\n" +
          fnGenErrors.map(function (ref) {
            var err = ref.err;
            var code = ref.code;

            return ((err.toString()) + " in\n\n" + code + "\n");
        }).join('\n'),
          vm
        );
      }
    }

    return (cache[key] = res)
  }
}

/*  */

function createCompilerCreator (baseCompile) {
  return function createCompiler (baseOptions) {
    function compile (
      template,
      options
    ) {
      var finalOptions = Object.create(baseOptions);
      var errors = [];
      var tips = [];
      finalOptions.warn = function (msg, tip) {
        (tip ? tips : errors).push(msg);
      };

      if (options) {
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules);
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives),
            options.directives
          );
        }
        // copy other options
        for (var key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key];
          }
        }
      }

      var compiled = baseCompile(template, finalOptions);
      if (true) {
        errors.push.apply(errors, detectErrors(compiled.ast));
      }
      compiled.errors = errors;
      compiled.tips = tips;
      return compiled
    }

    return {
      compile: compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}

/*  */

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
var createCompiler = createCompilerCreator(function baseCompile (
  template,
  options
) {
  var ast = parse(template.trim(), options);
  optimize(ast, options);
  var code = generate(ast, options);
  return {
    ast: ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
});

/*  */

var ref$1 = createCompiler(baseOptions);
var compileToFunctions = ref$1.compileToFunctions;

/*  */

var idToTemplate = cached(function (id) {
  var el = query(id);
  return el && el.innerHTML
});

var mount = Vue$3.prototype.$mount;
Vue$3.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && query(el);

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    "development" !== 'production' && warn(
      "Do not mount Vue to <html> or <body> - mount to normal elements instead."
    );
    return this
  }

  var options = this.$options;
  // resolve template/el and convert to render function
  if (!options.render) {
    var template = options.template;
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template);
          /* istanbul ignore if */
          if ("development" !== 'production' && !template) {
            warn(
              ("Template element not found or is empty: " + (options.template)),
              this
            );
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML;
      } else {
        if (true) {
          warn('invalid template option:' + template, this);
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el);
    }
    if (template) {
      /* istanbul ignore if */
      if ("development" !== 'production' && config.performance && mark) {
        mark('compile');
      }

      var ref = compileToFunctions(template, {
        shouldDecodeNewlines: shouldDecodeNewlines,
        delimiters: options.delimiters,
        comments: options.comments
      }, this);
      var render = ref.render;
      var staticRenderFns = ref.staticRenderFns;
      options.render = render;
      options.staticRenderFns = staticRenderFns;

      /* istanbul ignore if */
      if ("development" !== 'production' && config.performance && mark) {
        mark('compile end');
        measure(((this._name) + " compile"), 'compile', 'compile end');
      }
    }
  }
  return mount.call(this, el, hydrating)
};

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el) {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    var container = document.createElement('div');
    container.appendChild(el.cloneNode(true));
    return container.innerHTML
  }
}

Vue$3.compile = compileToFunctions;

module.exports = Vue$3;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(98)))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(7);
var core = __webpack_require__(0);
var ctx = __webpack_require__(17);
var hide = __webpack_require__(12);
var has = __webpack_require__(15);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(42)('wks');
var uid = __webpack_require__(27);
var Symbol = __webpack_require__(7).Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(18);
var IE8_DOM_DEFINE = __webpack_require__(61);
var toPrimitive = __webpack_require__(38);
var dP = Object.defineProperty;

exports.f = __webpack_require__(6) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(14)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 7 */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 9 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function() {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for(var i = 0; i < this.length; i++) {
			var item = this[i];
			if(item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/

var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

var listToStyles = __webpack_require__(104)

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

module.exports = function (parentId, list, _isProduction) {
  isProduction = _isProduction

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[data-vue-ssr-id~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),
/* 11 */
/***/ (function(module, exports) {

/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file.
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */
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
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = injectStyles
  }

  if (hook) {
    var functional = options.functional
    var existing = functional
      ? options.render
      : options.beforeCreate

    if (!functional) {
      // inject component registration as beforeCreate hook
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    } else {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return existing(h, context)
      }
    }
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(5);
var createDesc = __webpack_require__(21);
module.exports = __webpack_require__(6) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.install = install;
var bus = void 0;

function install(_Vue) {
  if (!bus) {
    bus = new _Vue();
    window.obigoUI.$events = bus;
  }
  return bus;
}

exports.default = {
  $on: function $on() {
    var _bus;

    if (!bus) bus = window.obigoUI.$events;
    bus && (_bus = bus).$on.apply(_bus, arguments);
  },
  $once: function $once() {
    var _bus2;

    if (!bus) bus = window.obigoUI.$events;
    bus && (_bus2 = bus).$once.apply(_bus2, arguments);
  },
  $emit: function $emit() {
    var _bus3;

    if (!bus) bus = window.obigoUI.$events;
    bus && (_bus3 = bus).$emit.apply(_bus3, arguments);
  },
  $off: function $off() {
    var _bus4;

    if (!bus) bus = window.obigoUI.$events;
    bus && (_bus4 = bus).$off.apply(_bus4, arguments);
  }
};

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),
/* 15 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(39);
var defined = __webpack_require__(36);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(60);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(8);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(36);
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

// most Object methods by ES6 should accept primitives
var $export = __webpack_require__(3);
var core = __webpack_require__(0);
var fails = __webpack_require__(14);
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};


/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(65);
var enumBugKeys = __webpack_require__(43);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = true;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__(18);
var dPs = __webpack_require__(64);
var enumBugKeys = __webpack_require__(43);
var IE_PROTO = __webpack_require__(41)('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(62)('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(113).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(35);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),
/* 27 */
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__(5).f;
var has = __webpack_require__(15);
var TAG = __webpack_require__(4)('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var META = __webpack_require__(27)('meta');
var isObject = __webpack_require__(8);
var has = __webpack_require__(15);
var setDesc = __webpack_require__(5).f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !__webpack_require__(14)(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};


/***/ }),
/* 30 */
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__(17);
var call = __webpack_require__(67);
var isArrayIter = __webpack_require__(68);
var anObject = __webpack_require__(18);
var toLength = __webpack_require__(26);
var getIterFn = __webpack_require__(69);
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;


/***/ }),
/* 32 */,
/* 33 */,
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $at = __webpack_require__(109)(true);

// 21.1.3.27 String.prototype[@@iterator]()
__webpack_require__(37)(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});


/***/ }),
/* 35 */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),
/* 36 */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__(24);
var $export = __webpack_require__(3);
var redefine = __webpack_require__(63);
var hide = __webpack_require__(12);
var Iterators = __webpack_require__(22);
var $iterCreate = __webpack_require__(110);
var setToStringTag = __webpack_require__(28);
var getPrototypeOf = __webpack_require__(66);
var ITERATOR = __webpack_require__(4)('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(8);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(40);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),
/* 40 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(42)('keys');
var uid = __webpack_require__(27);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var global = __webpack_require__(7);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__(24) ? 'pure' : 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});


/***/ }),
/* 43 */
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(132), __esModule: true };

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

exports.f = __webpack_require__(4);


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(7);
var core = __webpack_require__(0);
var LIBRARY = __webpack_require__(24);
var wksExt = __webpack_require__(48);
var defineProperty = __webpack_require__(5).f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};


/***/ }),
/* 50 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _defineProperty = __webpack_require__(84);

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/***/ }),
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(108), __esModule: true };

/***/ }),
/* 60 */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(6) && !__webpack_require__(14)(function () {
  return Object.defineProperty(__webpack_require__(62)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(8);
var document = __webpack_require__(7).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(12);


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(5);
var anObject = __webpack_require__(18);
var getKeys = __webpack_require__(23);

module.exports = __webpack_require__(6) ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(15);
var toIObject = __webpack_require__(16);
var arrayIndexOf = __webpack_require__(111)(false);
var IE_PROTO = __webpack_require__(41)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__(15);
var toObject = __webpack_require__(19);
var IE_PROTO = __webpack_require__(41)('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

// call something on iterator step with safe closing on error
var anObject = __webpack_require__(18);
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

// check on default Array iterator
var Iterators = __webpack_require__(22);
var ITERATOR = __webpack_require__(4)('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(70);
var ITERATOR = __webpack_require__(4)('iterator');
var Iterators = __webpack_require__(22);
module.exports = __webpack_require__(0).getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__(40);
var TAG = __webpack_require__(4)('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _button = __webpack_require__(117);

var _button2 = _interopRequireDefault(_button);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _button2.default;

/***/ }),
/* 72 */,
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.position = position;
exports.targetElement = targetElement;
exports.getMouseWheelDirection = getMouseWheelDirection;
exports.triggerBodyClickEvent = triggerBodyClickEvent;
exports.mouseEventPolyfill = mouseEventPolyfill;
function getEvent(e) {
  return !e ? window.event : e;
}

function position(e) {
  var posx = void 0,
      posy = void 0;
  e = getEvent(e);

  if (e.touches && e.touches[0]) {
    e = e.touches[0];
  } else if (e.changedTouches && e.changedTouches[0]) {
    e = e.changedTouches[0];
  }

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
}

function targetElement(e) {
  var target = void 0;
  e = getEvent(e);

  if (e.target) {
    target = e.target;
  } else if (e.srcElement) {
    target = e.srcElement;
  }
  return target;
}

function getMouseWheelDirection(e) {
  e = getEvent(e);
  return Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
}

function triggerBodyClickEvent() {
  var e = new MouseEvent('click', {
    'view': window,
    'bubbles': false,
    'cancelable': true
  });
  window.dispatchEvent(e);
}

function mouseEventPolyfill() {
  try {
    new MouseEvent('test');
    return false;
  } catch (e) {}

  var MouseEvent = function MouseEvent(eventType, params) {
    params = params || { bubbles: false, cancelable: false };
    var mouseEvent = document.createEvent('MouseEvent');
    mouseEvent.initMouseEvent(eventType, params.bubbles, params.cancelable, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

    return mouseEvent;
  };

  MouseEvent.prototype = Event.prototype;

  window.MouseEvent = MouseEvent;
}

/***/ }),
/* 74 */,
/* 75 */,
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _symbol = __webpack_require__(47);

var _symbol2 = _interopRequireDefault(_symbol);

var _assign = __webpack_require__(136);

var _assign2 = _interopRequireDefault(_assign);

var _stringify = __webpack_require__(140);

var _stringify2 = _interopRequireDefault(_stringify);

var _getOwnPropertyDescriptor = __webpack_require__(142);

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _getPrototypeOf = __webpack_require__(145);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _defineProperties = __webpack_require__(148);

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _from = __webpack_require__(59);

var _from2 = _interopRequireDefault(_from);

var _getOwnPropertyNames = __webpack_require__(151);

var _getOwnPropertyNames2 = _interopRequireDefault(_getOwnPropertyNames);

var _getOwnPropertySymbols = __webpack_require__(154);

var _getOwnPropertySymbols2 = _interopRequireDefault(_getOwnPropertySymbols);

var _preventExtensions = __webpack_require__(156);

var _preventExtensions2 = _interopRequireDefault(_preventExtensions);

var _isExtensible = __webpack_require__(159);

var _isExtensible2 = _interopRequireDefault(_isExtensible);

var _create = __webpack_require__(162);

var _create2 = _interopRequireDefault(_create);

var _keys = __webpack_require__(83);

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty = __webpack_require__(84);

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _typeof2 = __webpack_require__(85);

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

!function (e, t) {
  "object" == ( false ? "undefined" : (0, _typeof3.default)(exports)) && "object" == ( false ? "undefined" : (0, _typeof3.default)(module)) ? module.exports = t() :  true ? !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (t),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : "object" == (typeof exports === "undefined" ? "undefined" : (0, _typeof3.default)(exports)) ? exports.ObigoUI = t() : e.ObigoUI = t();
}("undefined" != typeof self ? self : undefined, function () {
  return function (e) {
    function t(o) {
      if (n[o]) return n[o].exports;var i = n[o] = { i: o, l: !1, exports: {} };return e[o].call(i.exports, i, i.exports, t), i.l = !0, i.exports;
    }var n = {};return t.m = e, t.c = n, t.d = function (e, n, o) {
      t.o(e, n) || (0, _defineProperty2.default)(e, n, { configurable: !1, enumerable: !0, get: o });
    }, t.n = function (e) {
      var n = e && e.__esModule ? function () {
        return e.default;
      } : function () {
        return e;
      };return t.d(n, "a", n), n;
    }, t.o = function (e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }, t.p = "/", t(t.s = 150);
  }([, function (e, t) {
    var n = e.exports = { version: "2.5.7" };"number" == typeof __e && (__e = n);
  }, function (e, t) {
    var n = e.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();"number" == typeof __g && (__g = n);
  }, function (e, t, n) {
    var o = n(41)("wks"),
        i = n(28),
        r = n(2).Symbol,
        s = "function" == typeof r;(e.exports = function (e) {
      return o[e] || (o[e] = s && r[e] || (s ? r : i)("Symbol." + e));
    }).store = o;
  }, function (e, t, n) {
    var o = n(2),
        i = n(1),
        r = n(11),
        s = n(10),
        u = n(13),
        a = function a(e, t, n) {
      var c,
          d,
          l,
          f = e & a.F,
          h = e & a.G,
          p = e & a.S,
          v = e & a.P,
          _ = e & a.B,
          y = e & a.W,
          m = h ? i : i[t] || (i[t] = {}),
          g = m.prototype,
          b = h ? o : p ? o[t] : (o[t] || {}).prototype;h && (n = t);for (c in n) {
        (d = !f && b && void 0 !== b[c]) && u(m, c) || (l = d ? b[c] : n[c], m[c] = h && "function" != typeof b[c] ? n[c] : _ && d ? r(l, o) : y && b[c] == l ? function (e) {
          var t = function t(_t, n, o) {
            if (this instanceof e) {
              switch (arguments.length) {case 0:
                  return new e();case 1:
                  return new e(_t);case 2:
                  return new e(_t, n);}return new e(_t, n, o);
            }return e.apply(this, arguments);
          };return t.prototype = e.prototype, t;
        }(l) : v && "function" == typeof l ? r(Function.call, l) : l, v && ((m.virtual || (m.virtual = {}))[c] = l, e & a.R && g && !g[c] && s(g, c, l)));
      }
    };a.F = 1, a.G = 2, a.S = 4, a.P = 8, a.B = 16, a.W = 32, a.U = 64, a.R = 128, e.exports = a;
  }, function (e, t, n) {
    var o = n(9),
        i = n(57),
        r = n(34),
        s = _defineProperty2.default;t.f = n(7) ? _defineProperty2.default : function (e, t, n) {
      if (o(e), t = r(t, !0), o(n), i) try {
        return s(e, t, n);
      } catch (e) {}if ("get" in n || "set" in n) throw TypeError("Accessors not supported!");return "value" in n && (e[t] = n.value), e;
    };
  }, function (e, t) {
    e.exports = function (e) {
      return "object" == (typeof e === "undefined" ? "undefined" : (0, _typeof3.default)(e)) ? null !== e : "function" == typeof e;
    };
  }, function (e, t, n) {
    e.exports = !n(12)(function () {
      return 7 != Object.defineProperty({}, "a", { get: function get() {
          return 7;
        } }).a;
    });
  }, function (e, t, n) {
    "use strict";
    function o(e) {
      return i || (i = new e(), window.obigoUI.$events = i), i;
    }Object.defineProperty(t, "__esModule", { value: !0 }), t.install = o;var i = void 0;t.default = { $on: function $on() {
        var e;i || (i = window.obigoUI.$events), i && (e = i).$on.apply(e, arguments);
      }, $once: function $once() {
        var e;i || (i = window.obigoUI.$events), i && (e = i).$once.apply(e, arguments);
      }, $emit: function $emit() {
        var e;i || (i = window.obigoUI.$events), i && (e = i).$emit.apply(e, arguments);
      }, $off: function $off() {
        var e;i || (i = window.obigoUI.$events), i && (e = i).$off.apply(e, arguments);
      } };
  }, function (e, t, n) {
    var o = n(6);e.exports = function (e) {
      if (!o(e)) throw TypeError(e + " is not an object!");return e;
    };
  }, function (e, t, n) {
    var o = n(5),
        i = n(25);e.exports = n(7) ? function (e, t, n) {
      return o.f(e, t, i(1, n));
    } : function (e, t, n) {
      return e[t] = n, e;
    };
  }, function (e, t, n) {
    var o = n(17);e.exports = function (e, t, n) {
      if (o(e), void 0 === t) return e;switch (n) {case 1:
          return function (n) {
            return e.call(t, n);
          };case 2:
          return function (n, o) {
            return e.call(t, n, o);
          };case 3:
          return function (n, o, i) {
            return e.call(t, n, o, i);
          };}return function () {
        return e.apply(t, arguments);
      };
    };
  }, function (e, t) {
    e.exports = function (e) {
      try {
        return !!e();
      } catch (e) {
        return !0;
      }
    };
  }, function (e, t) {
    var n = {}.hasOwnProperty;e.exports = function (e, t) {
      return n.call(e, t);
    };
  }, function (e, t, n) {
    "use strict";
    t.__esModule = !0, t.default = function (e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    };
  }, function (e, t, n) {
    "use strict";
    t.__esModule = !0;var o = n(83),
        i = function (e) {
      return e && e.__esModule ? e : { default: e };
    }(o);t.default = function () {
      function e(e, t) {
        for (var n = 0; n < t.length; n++) {
          var o = t[n];o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), (0, i.default)(e, o.key, o);
        }
      }return function (t, n, o) {
        return n && e(t.prototype, n), o && e(t, o), t;
      };
    }();
  }, function (e, t, n) {
    var o = n(39),
        i = n(36);e.exports = function (e) {
      return o(i(e));
    };
  }, function (e, t) {
    e.exports = function (e) {
      if ("function" != typeof e) throw TypeError(e + " is not a function!");return e;
    };
  }, function (e, t, n) {
    "use strict";
    function o(e) {
      return e && e.__esModule ? e : { default: e };
    }t.__esModule = !0;var i = n(87),
        r = o(i),
        s = n(63),
        u = o(s),
        a = "function" == typeof u.default && "symbol" == (0, _typeof3.default)(r.default) ? function (e) {
      return typeof e === "undefined" ? "undefined" : (0, _typeof3.default)(e);
    } : function (e) {
      return e && "function" == typeof u.default && e.constructor === u.default && e !== u.default.prototype ? "symbol" : typeof e === "undefined" ? "undefined" : (0, _typeof3.default)(e);
    };t.default = "function" == typeof u.default && "symbol" === a(r.default) ? function (e) {
      return void 0 === e ? "undefined" : a(e);
    } : function (e) {
      return e && "function" == typeof u.default && e.constructor === u.default && e !== u.default.prototype ? "symbol" : void 0 === e ? "undefined" : a(e);
    };
  }, function (e, t) {
    e.exports = !0;
  }, function (e, t) {
    e.exports = {};
  }, function (e, t, n) {
    var o = n(60),
        i = n(42);e.exports = _keys2.default || function (e) {
      return o(e, i);
    };
  }, function (e, t) {
    var n = {}.toString;e.exports = function (e) {
      return n.call(e).slice(8, -1);
    };
  }, function (e, t, n) {
    var o = n(5).f,
        i = n(13),
        r = n(3)("toStringTag");e.exports = function (e, t, n) {
      e && !i(e = n ? e : e.prototype, r) && o(e, r, { configurable: !0, value: t });
    };
  }, function (e, t, n) {
    var o = n(11),
        i = n(77),
        r = n(78),
        s = n(9),
        u = n(31),
        a = n(68),
        c = {},
        d = {},
        t = e.exports = function (e, t, n, l, f) {
      var h,
          p,
          v,
          _,
          y = f ? function () {
        return e;
      } : a(e),
          m = o(n, l, t ? 2 : 1),
          g = 0;if ("function" != typeof y) throw TypeError(e + " is not iterable!");if (r(y)) {
        for (h = u(e.length); h > g; g++) {
          if ((_ = t ? m(s(p = e[g])[0], p[1]) : m(e[g])) === c || _ === d) return _;
        }
      } else for (v = y.call(e); !(p = v.next()).done;) {
        if ((_ = i(v, m, p.value, t)) === c || _ === d) return _;
      }
    };t.BREAK = c, t.RETURN = d;
  }, function (e, t) {
    e.exports = function (e, t) {
      return { enumerable: !(1 & e), configurable: !(2 & e), writable: !(4 & e), value: t };
    };
  }, function (e, t, n) {
    var o = n(36);e.exports = function (e) {
      return Object(o(e));
    };
  }, function (e, t, n) {
    "use strict";
    var o = n(89)(!0);n(37)(String, "String", function (e) {
      this._t = String(e), this._i = 0;
    }, function () {
      var e,
          t = this._t,
          n = this._i;return n >= t.length ? { value: void 0, done: !0 } : (e = o(t, n), this._i += e.length, { value: e, done: !1 });
    });
  }, function (e, t) {
    var n = 0,
        o = Math.random();e.exports = function (e) {
      return "Symbol(".concat(void 0 === e ? "" : e, ")_", (++n + o).toString(36));
    };
  }, function (e, t) {
    t.f = {}.propertyIsEnumerable;
  }, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 }), t.default = function () {
      if (window.applicationFramework) return window.applicationFramework.applicationManager.getOwnerApplication(window.document);
    }();
  }, function (e, t, n) {
    var o = n(35),
        i = Math.min;e.exports = function (e) {
      return e > 0 ? i(o(e), 9007199254740991) : 0;
    };
  }, function (e, t, n) {
    n(95);for (var o = n(2), i = n(10), r = n(20), s = n(3)("toStringTag"), u = "CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","), a = 0; a < u.length; a++) {
      var c = u[a],
          d = o[c],
          l = d && d.prototype;l && !l[s] && i(l, s, c), r[c] = r.Array;
    }
  }, function (e, t, n) {
    var o = n(6),
        i = n(2).document,
        r = o(i) && o(i.createElement);e.exports = function (e) {
      return r ? i.createElement(e) : {};
    };
  }, function (e, t, n) {
    var o = n(6);e.exports = function (e, t) {
      if (!o(e)) return e;var n, i;if (t && "function" == typeof (n = e.toString) && !o(i = n.call(e))) return i;if ("function" == typeof (n = e.valueOf) && !o(i = n.call(e))) return i;if (!t && "function" == typeof (n = e.toString) && !o(i = n.call(e))) return i;throw TypeError("Can't convert object to primitive value");
    };
  }, function (e, t) {
    var n = Math.ceil,
        o = Math.floor;e.exports = function (e) {
      return isNaN(e = +e) ? 0 : (e > 0 ? o : n)(e);
    };
  }, function (e, t) {
    e.exports = function (e) {
      if (void 0 == e) throw TypeError("Can't call method on  " + e);return e;
    };
  }, function (e, t, n) {
    "use strict";
    var o = n(19),
        i = n(4),
        r = n(59),
        s = n(10),
        u = n(20),
        a = n(90),
        c = n(23),
        d = n(94),
        l = n(3)("iterator"),
        f = !([].keys && "next" in [].keys()),
        h = function h() {
      return this;
    };e.exports = function (e, t, n, p, v, _, y) {
      a(n, t, p);var m,
          g,
          b,
          E = function E(e) {
        if (!f && e in T) return T[e];switch (e) {case "keys":case "values":
            return function () {
              return new n(this, e);
            };}return function () {
          return new n(this, e);
        };
      },
          k = t + " Iterator",
          O = "values" == v,
          w = !1,
          T = e.prototype,
          R = T[l] || T["@@iterator"] || v && T[v],
          M = R || E(v),
          F = v ? O ? E("entries") : M : void 0,
          S = "Array" == t ? T.entries || R : R;if (S && (b = d(S.call(new e()))) !== Object.prototype && b.next && (c(b, k, !0), o || "function" == typeof b[l] || s(b, l, h)), O && R && "values" !== R.name && (w = !0, M = function M() {
        return R.call(this);
      }), o && !y || !f && !w && T[l] || s(T, l, M), u[t] = M, u[k] = h, v) if (m = { values: O ? M : E("values"), keys: _ ? M : E("keys"), entries: F }, y) for (g in m) {
        g in T || r(T, g, m[g]);
      } else i(i.P + i.F * (f || w), t, m);return m;
    };
  }, function (e, t, n) {
    var o = n(9),
        i = n(91),
        r = n(42),
        s = n(40)("IE_PROTO"),
        u = function u() {},
        _a = function a() {
      var e,
          t = n(33)("iframe"),
          o = r.length;for (t.style.display = "none", n(61).appendChild(t), t.src = "javascript:", e = t.contentWindow.document, e.open(), e.write("<script>document.F=Object<\/script>"), e.close(), _a = e.F; o--;) {
        delete _a.prototype[r[o]];
      }return _a();
    };e.exports = _create2.default || function (e, t) {
      var n;return null !== e ? (u.prototype = o(e), n = new u(), u.prototype = null, n[s] = e) : n = _a(), void 0 === t ? n : i(n, t);
    };
  }, function (e, t, n) {
    var o = n(22);e.exports = Object("z").propertyIsEnumerable(0) ? Object : function (e) {
      return "String" == o(e) ? e.split("") : Object(e);
    };
  }, function (e, t, n) {
    var o = n(41)("keys"),
        i = n(28);e.exports = function (e) {
      return o[e] || (o[e] = i(e));
    };
  }, function (e, t, n) {
    var o = n(1),
        i = n(2),
        r = i["__core-js_shared__"] || (i["__core-js_shared__"] = {});(e.exports = function (e, t) {
      return r[e] || (r[e] = void 0 !== t ? t : {});
    })("versions", []).push({ version: o.version, mode: n(19) ? "pure" : "global", copyright: "© 2018 Denis Pushkarev (zloirock.ru)" });
  }, function (e, t) {
    e.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");
  }, function (e, t, n) {
    t.f = n(3);
  }, function (e, t, n) {
    var o = n(28)("meta"),
        i = n(6),
        r = n(13),
        s = n(5).f,
        u = 0,
        a = _isExtensible2.default || function () {
      return !0;
    },
        c = !n(12)(function () {
      return a((0, _preventExtensions2.default)({}));
    }),
        d = function d(e) {
      s(e, o, { value: { i: "O" + ++u, w: {} } });
    },
        l = function l(e, t) {
      if (!i(e)) return "symbol" == (typeof e === "undefined" ? "undefined" : (0, _typeof3.default)(e)) ? e : ("string" == typeof e ? "S" : "P") + e;if (!r(e, o)) {
        if (!a(e)) return "F";if (!t) return "E";d(e);
      }return e[o].i;
    },
        f = function f(e, t) {
      if (!r(e, o)) {
        if (!a(e)) return !0;if (!t) return !1;d(e);
      }return e[o].w;
    },
        h = function h(e) {
      return c && p.NEED && a(e) && !r(e, o) && d(e), e;
    },
        p = e.exports = { KEY: o, NEED: !1, fastKey: l, getWeak: f, onFreeze: h };
  }, function (e, t, n) {
    var o = n(2),
        i = n(1),
        r = n(19),
        s = n(43),
        u = n(5).f;e.exports = function (e) {
      var t = i.Symbol || (i.Symbol = r ? {} : o.Symbol || {});"_" == e.charAt(0) || e in t || u(t, e, { value: s.f(e) });
    };
  }, function (e, t) {
    t.f = _getOwnPropertySymbols2.default;
  }, function (e, t) {}, function (e, t, n) {
    "use strict";
    function o(e) {
      return e || window.event;
    }function i(e) {
      var t = void 0,
          n = void 0;return e = o(e), e.touches && e.touches[0] ? e = e.touches[0] : e.changedTouches && e.changedTouches[0] && (e = e.changedTouches[0]), e.clientX || e.clientY ? (t = e.clientX, n = e.clientY) : (e.pageX || e.pageY) && (t = e.pageX - document.body.scrollLeft - document.documentElement.scrollLeft, n = e.pageY - document.body.scrollTop - document.documentElement.scrollTop), { top: n, left: t };
    }function r(e) {
      var t = void 0;return e = o(e), e.target ? t = e.target : e.srcElement && (t = e.srcElement), t;
    }function s(e) {
      return e = o(e), Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
    }function u() {
      var e = new MouseEvent("click", { view: window, bubbles: !1, cancelable: !0 });window.dispatchEvent(e);
    }function a() {
      try {
        return new e("test"), !1;
      } catch (e) {}var e = function e(_e, t) {
        t = t || { bubbles: !1, cancelable: !1 };var n = document.createEvent("MouseEvent");return n.initMouseEvent(_e, t.bubbles, t.cancelable, window, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, null), n;
      };e.prototype = Event.prototype, window.MouseEvent = e;
    }Object.defineProperty(t, "__esModule", { value: !0 }), t.position = i, t.targetElement = r, t.getMouseWheelDirection = s, t.triggerBodyClickEvent = u, t.mouseEventPolyfill = a;
  }, function (e, t, n) {
    var o = n(22),
        i = n(3)("toStringTag"),
        r = "Arguments" == o(function () {
      return arguments;
    }()),
        s = function s(e, t) {
      try {
        return e[t];
      } catch (e) {}
    };e.exports = function (e) {
      var t, n, u;return void 0 === e ? "Undefined" : null === e ? "Null" : "string" == typeof (n = s(t = Object(e), i)) ? n : r ? o(t) : "Object" == (u = o(t)) && "function" == typeof t.callee ? "Arguments" : u;
    };
  }, function (e, t) {
    e.exports = function (e, t, n, o) {
      if (!(e instanceof t) || void 0 !== o && o in e) throw TypeError(n + ": incorrect invocation!");return e;
    };
  }, function (e, t, n) {
    "use strict";
    function o(e) {
      var t, n;this.promise = new e(function (e, o) {
        if (void 0 !== t || void 0 !== n) throw TypeError("Bad Promise constructor");t = e, n = o;
      }), this.resolve = i(t), this.reject = i(n);
    }var i = n(17);e.exports.f = function (e) {
      return new o(e);
    };
  }, function (e, t, n) {
    var o = n(10);e.exports = function (e, t, n) {
      for (var i in t) {
        n && e[i] ? e[i] = t[i] : o(e, i, t[i]);
      }return e;
    };
  }, function (e, t, n) {
    "use strict";
    function o(e) {
      return e && e.__esModule ? e : { default: e };
    }Object.defineProperty(t, "__esModule", { value: !0 }), t.getHardkeyInstance = t.hardkeyCode = void 0;var i = n(14),
        r = o(i),
        s = n(15),
        u = o(s),
        a = n(63),
        c = o(a),
        d = n(30),
        l = o(d),
        f = n(8),
        h = o(f),
        p = { HARDKEY_TYPE_NONE: 1e3, HARDKEY_BUTTON_HOME: 1001, HARDKEY_BUTTON_BACK: 1002, HARDKEY_ROTARY_ROTATE: 2001, HARDKEY_ROTARY_ENTER: 2002, HARDKEY_ROTARY_LEFT: 2003, HARDKEY_ROTARY_RIGHT: 2004, HARDKEY_ROTARY_UP: 2005, HARDKEY_ROTARY_DOWN: 2006 },
        v = { HARDKEY_MODE_NONE: 0, HARDKEY_MODE_PRESS: 1, HARDKEY_MODE_LONG_PRESS: 2, HARDKEY_MODE_RELEASE: 3, HARDKEY_MODE_LEFT: 4, HARDKEY_MODE_RIGHT: 5 },
        _ = t.hardkeyCode = function () {
      return window.applicationFramework || (p = { HARDKEY_TYPE_NONE: 1e3, HARDKEY_BUTTON_HOME: 104, HARDKEY_BUTTON_BACK: 98, HARDKEY_ROTARY_ROTATE: 113, HARDKEY_ROTARY_ENTER: 114, HARDKEY_ROTARY_LEFT: 97, HARDKEY_ROTARY_RIGHT: 100, HARDKEY_ROTARY_UP: 119, HARDKEY_ROTARY_DOWN: 115 }), { code: p, mode: v };
    }(),
        y = (0, c.default)(),
        m = (0, c.default)(),
        g = function () {
      function e(t) {
        if ((0, r.default)(this, e), t !== m) throw new Error("Cannot construct singleton");this.appManager = l.default, this._bind(), this._hardKeyListener = [];
      }return (0, u.default)(e, [{ key: "_bind", value: function value() {
          this.appManager ? window.addEventListener("hardkey", this._handleEvent.bind(this)) : document.addEventListener("keypress", this._handleEvent.bind(this));
        } }, { key: "_handleEvent", value: function value(e) {
          var t = void 0 !== e.hardkeyType ? e.hardkeyType : "Q" === e.key | "q" === e.key ? 113 : e.key.charCodeAt(0),
              n = void 0 !== e.hardkeyMode ? e.hardkeyMode : ["w", "r", "a", "s", "d"].includes(e.key) ? _.mode.HARDKEY_MODE_RELEASE : e.shiftKey ? _.mode.HARDKEY_MODE_LEFT : _.mode.HARDKEY_MODE_RIGHT,
              o = e.hardkeyTick;(window.hardkeyEventObj = e.hardkeyType ? e : { notProcessedCount: function notProcessedCount() {} }, window.hardkeyEventObj.code = t, window.hardkeyEventObj.mode = n, [_.mode.HARDKEY_MODE_RELEASE, _.mode.HARDKEY_MODE_RIGHT, _.mode.HARDKEY_MODE_LEFT].indexOf(n) < 0 && t !== _.code.HARDKEY_ROTARY_ENTER) || (this._findKeyCode(t).forEach(function (e) {
            e.cb({ code: t, mode: n, tick: o });
          }), this._emitArrowKeyEvent(e));
        } }, { key: "addHardkeyListener", value: function value(e, t) {
          this._hardKeyListener.push({ type: e, cb: t });
        } }, { key: "removeHardkeyListener", value: function value(e, t) {
          this._hardKeyListener = this._hardKeyListener.filter(function (n) {
            return !(n.cb === t && n.type === e);
          });
        } }, { key: "_findKeyCode", value: function value(e) {
          return this._hardKeyListener.filter(function (t) {
            return t.type === e;
          });
        } }, { key: "getCodes", value: function value() {
          return _;
        } }, { key: "sendRemainTick", value: function value() {
          var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 1;window.hardkeyEventObj.notProcessedCount(window.hardkeyEventObj.code, window.hardkeyEventObj.mode, e);
        } }, { key: "_emitArrowKeyEvent", value: function value(e) {
          switch (e.hardkeyType) {case _.code.HARDKEY_ROTARY_LEFT:
              h.default.$emit("csw:left", e);break;case _.code.HARDKEY_ROTARY_RIGHT:
              h.default.$emit("csw:right", e);break;case _.code.HARDKEY_ROTARY_UP:
              h.default.$emit("csw:up", e);break;case _.code.HARDKEY_ROTARY_DOWN:
              h.default.$emit("csw:down", e);}
        } }], [{ key: "instance", get: function get() {
          return this[y] || (this[y] = new e(m)), this[y];
        } }]), e;
    }();t.getHardkeyInstance = function () {
      return g.instance;
    };
  },,,, function (e, t, n) {
    e.exports = !n(7) && !n(12)(function () {
      return 7 != Object.defineProperty(n(33)("div"), "a", { get: function get() {
          return 7;
        } }).a;
    });
  }, function (e, t, n) {
    "use strict";
    function o(e) {
      if (e && e.__esModule) return e;var t = {};if (null != e) for (var n in e) {
        Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
      }return t.default = e, t;
    }function i(e) {
      return e && e.__esModule ? e : { default: e };
    }Object.defineProperty(t, "__esModule", { value: !0 });var r = n(86),
        s = i(r),
        u = n(76),
        a = o(u),
        c = n(107),
        d = i(c),
        l = n(48),
        f = o(l),
        h = n(108),
        p = o(h),
        v = n(67),
        _ = i(v),
        y = n(109),
        m = i(y);t.default = { dom: a, loglevel: s.default, time: d.default, event: f, store: p, uid: _.default, ajax: m.default };
  }, function (e, t, n) {
    e.exports = n(10);
  }, function (e, t, n) {
    var o = n(13),
        i = n(16),
        r = n(92)(!1),
        s = n(40)("IE_PROTO");e.exports = function (e, t) {
      var n,
          u = i(e),
          a = 0,
          c = [];for (n in u) {
        n != s && o(u, n) && c.push(n);
      }for (; t.length > a;) {
        o(u, n = t[a++]) && (~r(c, n) || c.push(n));
      }return c;
    };
  }, function (e, t, n) {
    var o = n(2).document;e.exports = o && o.documentElement;
  }, function (e, t) {
    e.exports = function (e, t) {
      return { value: t, done: !!e };
    };
  }, function (e, t, n) {
    e.exports = { default: n(97), __esModule: !0 };
  }, function (e, t, n) {
    var o = n(22);e.exports = Array.isArray || function (e) {
      return "Array" == o(e);
    };
  }, function (e, t, n) {
    var o = n(60),
        i = n(42).concat("length", "prototype");t.f = _getOwnPropertyNames2.default || function (e) {
      return o(e, i);
    };
  }, function (e, t, n) {
    e.exports = { default: n(104), __esModule: !0 };
  }, function (e, t, n) {
    "use strict";
    function o() {
      return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
    }Object.defineProperty(t, "__esModule", { value: !0 }), t.default = function () {
      return o() + o() + "-" + o() + "-" + o() + "-" + o() + "-" + o() + o() + o();
    };
  }, function (e, t, n) {
    var o = n(49),
        i = n(3)("iterator"),
        r = n(20);e.exports = n(1).getIteratorMethod = function (e) {
      if (void 0 != e) return e[i] || e["@@iterator"] || r[o(e)];
    };
  }, function (e, t, n) {
    var o = n(9),
        i = n(17),
        r = n(3)("species");e.exports = function (e, t) {
      var n,
          s = o(e).constructor;return void 0 === s || void 0 == (n = o(s)[r]) ? t : i(n);
    };
  }, function (e, t, n) {
    var o,
        i,
        r,
        s = n(11),
        u = n(115),
        a = n(61),
        c = n(33),
        d = n(2),
        l = d.process,
        f = d.setImmediate,
        h = d.clearImmediate,
        p = d.MessageChannel,
        v = d.Dispatch,
        _ = 0,
        y = {},
        m = function m() {
      var e = +this;if (y.hasOwnProperty(e)) {
        var t = y[e];delete y[e], t();
      }
    },
        g = function g(e) {
      m.call(e.data);
    };f && h || (f = function f(e) {
      for (var t = [], n = 1; arguments.length > n;) {
        t.push(arguments[n++]);
      }return y[++_] = function () {
        u("function" == typeof e ? e : Function(e), t);
      }, o(_), _;
    }, h = function h(e) {
      delete y[e];
    }, "process" == n(22)(l) ? o = function o(e) {
      l.nextTick(s(m, e, 1));
    } : v && v.now ? o = function o(e) {
      v.now(s(m, e, 1));
    } : p ? (i = new p(), r = i.port2, i.port1.onmessage = g, o = s(r.postMessage, r, 1)) : d.addEventListener && "function" == typeof postMessage && !d.importScripts ? (o = function o(e) {
      d.postMessage(e + "", "*");
    }, d.addEventListener("message", g, !1)) : o = "onreadystatechange" in c("script") ? function (e) {
      a.appendChild(c("script")).onreadystatechange = function () {
        a.removeChild(this), m.call(e);
      };
    } : function (e) {
      setTimeout(s(m, e, 1), 0);
    }), e.exports = { set: f, clear: h };
  }, function (e, t) {
    e.exports = function (e) {
      try {
        return { e: !1, v: e() };
      } catch (e) {
        return { e: !0, v: e };
      }
    };
  }, function (e, t, n) {
    var o = n(9),
        i = n(6),
        r = n(51);e.exports = function (e, t) {
      if (o(e), i(t) && t.constructor === e) return t;var n = r.f(e);return (0, n.resolve)(t), n.promise;
    };
  }, function (e, t, n) {
    "use strict";
    var o = n(2),
        i = n(1),
        r = n(5),
        s = n(7),
        u = n(3)("species");e.exports = function (e) {
      var t = "function" == typeof i[e] ? i[e] : o[e];s && t && !t[u] && r.f(t, u, { configurable: !0, get: function get() {
          return this;
        } });
    };
  }, function (e, t, n) {
    var o = n(6);e.exports = function (e, t) {
      if (!o(e) || e._t !== t) throw TypeError("Incompatible receiver, " + t + " required!");return e;
    };
  },, function (e, t, n) {
    "use strict";
    function o(e) {
      if (e === window) return { top: 0, left: 0 };var t = e.getBoundingClientRect();return { top: t.top, left: t.left };
    }function i(e, t) {
      return window.getComputedStyle(e).getPropertyValue(t);
    }function r(e) {
      return e === window ? a().height : parseFloat(window.getComputedStyle(e).getPropertyValue("height"), 10);
    }function s(e) {
      return e === window ? a().width : parseFloat(window.getComputedStyle(e).getPropertyValue("width"), 10);
    }function u(e, t) {
      var n = e.style;(0, v.default)(t).forEach(function (e) {
        n[e] = t[e];
      });
    }function a() {
      var e = window,
          t = "inner";return "innerWidth" in window || (t = "client", e = document.documentElement || document.body), { width: e[t + "Width"], height: e[t + "Height"] };
    }function c(e) {
      if ("function" == typeof e) return "complete" === document.readyState ? e() : void document.addEventListener("DOMContentLoaded", e, !1);
    }function d(e) {
      var t = { transform: e };return _.forEach(function (n) {
        t[n + "transform"] = e;
      }), t;
    }function l(e, t) {
      var n = [];e = e.parentNode.firstChild;do {
        t && !t(e) || n.push(e);
      } while (e = e.nextSibling);return n;
    }function f(e, t) {
      for (var n = []; e = e.nextSibling;) {
        t && !t(e) || n.push(e);
      }return n;
    }function h(e, t) {
      for (var n = []; e = e.previousSibling;) {
        t && !t(e) || n.push(e);
      }return n;
    }Object.defineProperty(t, "__esModule", { value: !0 });var p = n(66),
        v = function (e) {
      return e && e.__esModule ? e : { default: e };
    }(p);t.offset = o, t.style = i, t.height = r, t.width = s, t.css = u, t.viewport = a, t.ready = c, t.cssTransform = d, t.getSiblings = l, t.getNextSiblings = f, t.getPreviousSiblings = h;var _ = ["-webkit-", "-moz-", "-ms-", "-o-"];
  }, function (e, t, n) {
    var o = n(9);e.exports = function (e, t, n, i) {
      try {
        return i ? t(o(n)[0], n[1]) : t(n);
      } catch (t) {
        var r = e.return;throw void 0 !== r && o(r.call(e)), t;
      }
    };
  }, function (e, t, n) {
    var o = n(20),
        i = n(3)("iterator"),
        r = Array.prototype;e.exports = function (e) {
      return void 0 !== e && (o.Array === e || r[i] === e);
    };
  }, function (e, t, n) {
    var o = n(3)("iterator"),
        i = !1;try {
      var r = [7][o]();r.return = function () {
        i = !0;
      }, (0, _from2.default)(r, function () {
        throw 2;
      });
    } catch (e) {}e.exports = function (e, t) {
      if (!t && !i) return !1;var n = !1;try {
        var r = [7],
            s = r[o]();s.next = function () {
          return { done: n = !0 };
        }, r[o] = function () {
          return s;
        }, e(r);
      } catch (e) {}return n;
    };
  }, function (e, t, n) {
    "use strict";
    function o(e) {
      return e && e.__esModule ? e : { default: e };
    }function i(e) {
      return m = (0, h.getHardkeyInstance)(), b._bind(), e.prototype.$focus = b, e.prototype.$hardkey = m, b;
    }Object.defineProperty(t, "__esModule", { value: !0 }), t.focusInstance = void 0;var r = n(81),
        s = o(r),
        u = n(14),
        a = o(u),
        c = n(15),
        d = o(c);t.install = i;var l = n(30),
        f = o(l),
        h = n(53),
        p = n(8),
        v = o(p),
        _ = { GADGET: "gadget", WIDGET: "widget" },
        y = { NONE: "none", CONTEXT: "context" },
        m = null,
        g = function () {
      function e() {
        (0, a.default)(this, e), this.appManager = f.default, this._focusMap = new s.default(), this._lastFocusMap = new s.default(), this._subSectionMap = new s.default(), this._tabMap = new s.default(), this._binded = !1, this._currentScene = 0, this._currentZone = 2, this._currentOrder = 0, this._currentTabNumber = 0, this._Loop = !0, this._zoneFocusMode = !1, this._componentFocusMode = !1, this._componentControlMode = !1, this._focusOnSubSection = !1, this._tabFocusMode = !1, this._hardkeyCode = 1e3, this._hardkeyMode = 0, this._appType = _.WIDGET, this._popupType = y.NONE, this._popupZoneStyle = {}, this._$focusZoneEle = null, this._onBodyClickListener = this._onBodyClickListener.bind(this), this.prevZone = this.prevZone.bind(this), this.nextZone = this.nextZone.bind(this), this._onRotaryLeftRight = this._onRotaryLeftRight.bind(this), this._onRotaryUpDown = this._onRotaryUpDown.bind(this), this._handleRotateClick = this._handleRotateClick.bind(this), this._handleRotateEnter = this._handleRotateEnter.bind(this), this.exitFocusMode = this.exitFocusMode.bind(this), this._handleRotate = this._handleRotate.bind(this), this._handleWheelEvent = this._handleWheelEvent.bind(this), this._getSubSection = this._getSubSection.bind(this), this._onRotaryUpDown = this._onRotaryUpDown.bind(this);
      }return (0, d.default)(e, [{ key: "_bind", value: function value() {
          var e = this;this._binded || (this._binded = !0, m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_UP, this._onRotaryUpDown), m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_DOWN, this._onRotaryUpDown), m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_LEFT, this._onRotaryLeftRight), m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_RIGHT, this._onRotaryLeftRight), m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_ENTER, this._handleRotateClick), m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_ENTER, this._handleRotateEnter), m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_BUTTON_HOME, this.exitFocusMode), m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_BUTTON_BACK, this.exitFocusMode), this.appManager ? (m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_ROTATE, this._handleRotate), this._appType = 2 === this.appManager.type ? _.GADGET : _.WIDGET) : m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_ROTATE, this._handleWheelEvent), v.default.$on("scene:update", function (t) {
            e.setScene(t);
          }), v.default.$on("popup:show", function (t) {
            if (t.el) {
              e._setZoneFocusOff(), e._setComponentFocusOff();var n = t.el.getBoundingClientRect();e._popupType = t.type, e._popupZoneStyle = { height: n.height, width: n.width, left: n.left, top: n.top }, e._lastFocusMap.set(t.type, t.prevFocusPosition), (e._zoneFocusMode || e._componentFocusMode) && (e.startFocusMode(), window.removeEventListener("click", e._onBodyClickListener));
            }
          }), v.default.$on("popup:hide", function (t) {
            if (e._setZoneFocusOff(), e._setComponentFocusOff(), e._popupType = y.NONE, e._popupZoneStyle = {}, e._zoneFocusMode || e._componentFocusMode) {
              var n = e._lastFocusMap.get(t.type),
                  o = 2 === n.zone && n.order > 0 && e._isTargetAvailable(n.scene, n.order) ? n.order : -1;e.startFocusMode(!0, o);
            }
          }), v.default.$on("list:scrollstart", this.exitFocusMode), v.default.$on("focus:control-get", function (t) {
            e._unbindRotateListener(), e._componentControlMode = !0;var n = e._getCurrentTarget(),
                o = !1;n && n.el && n.el.classList.contains("obg-list-item") && n.el.querySelector('[data-type="focus-control-able"]') && (o = !0, n.el.classList.add("has-focus-control-child")), o || setTimeout(e._setComponentFocusOff.bind(e), 0);
          }), v.default.$on("focus:control-loss", function (t) {
            e._bindRotateListener(), e._componentControlMode = !1, e._focusOnSubSection && (t.touch || e.startFocusMode(!0, e.loadLastFocusPosition("section")), e._focusOnSubSection = !1);var n = e._getCurrentTarget();n && n.el && n.el.classList.contains("obg-list-item") && n.el.classList.contains("has-focus-control-child") && n.el.classList.remove("has-focus-control-child");
          }), v.default.$on("tab:update", function (t) {
            if (void 0 !== t.tabNumber) {
              console.log("tab mode check");var n = t.tabNumber;if (e._currentTabNumber = n, t.isFocus) {
                var o = e._tabMap.get(n);e.storeLastFocusPosition("tab:last-order", t.lastOrder), o && o.size > 0 && e.startTabFocusMode(n, t.newOrder);
              }
            } else (e._componentFocusMode || e._zoneFocusMode) && (e._setZoneFocusOff(), e._setComponentFocusOff(), t.isFocus ? (e._currentZone = 3, e._currentOrder = t.currentIndex, e._setZoneFocusOn(3), console.log("[Focus.js] Focus On from tabUpdate"), e._setComponentFocusOn()) : e.startFocusMode());
          }), m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_BUTTON_BACK, function () {
            e._appType === _.GADGET && e._componentFocusMode && (e.exitFocusMode(), e._sendRemainTick(1));
          }), m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_BUTTON_HOME, function () {
            e._componentFocusMode && (e.exitFocusMode(), e._sendRemainTick(1));
          }));
        } }, { key: "_bindRotateListener", value: function value() {
          this.appManager ? m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_ROTATE, this._handleRotate) : m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_ROTATE, this._handleWheelEvent), m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_ENTER, this._handleRotateClick), m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_ENTER, this._handleRotateEnter), m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_UP, this._onRotaryUpDown), m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_DOWN, this._onRotaryUpDown), m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_LEFT, this._onRotaryLeftRight), m.addHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_RIGHT, this._onRotaryLeftRight);
        } }, { key: "_unbindRotateListener", value: function value() {
          this.appManager ? m.removeHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_ROTATE, this._handleRotate) : m.removeHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_ROTATE, this._handleWheelEvent), m.removeHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_ENTER, this._handleRotateClick), m.removeHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_ENTER, this._handleRotateEnter), m.removeHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_UP, this._onRotaryUpDown), m.removeHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_DOWN, this._onRotaryUpDown), m.removeHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_LEFT, this._onRotaryLeftRight), m.removeHardkeyListener(h.hardkeyCode.code.HARDKEY_ROTARY_RIGHT, this._onRotaryLeftRight);
        } }, { key: "_handleRotate", value: function value(e) {
          var t = e.code,
              n = e.mode,
              o = e.tick;return this.hardkeyCode = t, this.hardkeyMode = n, 0 === o ? (this.exitFocusMode(), void this._sendRemainTick(0)) : this._zoneFocusMode || this._componentFocusMode || this._appType === _.GADGET ? this._appType !== _.GADGET || this._zoneFocusMode ? this._componentFocusMode ? n === h.hardkeyCode.mode.HARDKEY_MODE_RIGHT ? void this.nextOrder(o) : void this.prevOrder(o) : this._appType === _.GADGET ? (this.exitFocusMode(), void this._sendRemainTick(1)) : void (n === h.hardkeyCode.mode.HARDKEY_MODE_RIGHT ? this.nextZone() : this.prevZone()) : (this._zoneFocusMode = !0, this._setZoneFocusOn(), this._sendRemainTick(1), void window.addEventListener("click", this._onBodyClickListener)) : (this.startFocusMode(), void this._sendRemainTick(0));
        } }, { key: "_handleWheelEvent", value: function value(e) {
          var t = e.mode;return this._zoneFocusMode || this._componentFocusMode || this._appType === _.GADGET ? this._appType !== _.GADGET || this._zoneFocusMode ? this._componentFocusMode ? t === h.hardkeyCode.mode.HARDKEY_MODE_RIGHT ? void this.nextOrder() : void this.prevOrder() : void (t === h.hardkeyCode.mode.HARDKEY_MODE_RIGHT ? this.nextZone({}) : this.prevZone({})) : (this._zoneFocusMode = !0, this._setZoneFocusOn(), this._sendRemainTick(1), void window.addEventListener("click", this._onBodyClickListener)) : (this.startFocusMode(), void this._sendRemainTick(0));
        } }, { key: "_handleRotateClick", value: function value(e) {
          var t = e.code,
              n = void 0 === t ? 1e3 : t,
              o = e.mode,
              i = void 0 === o ? 0 : o;this._hardkeyCode = n, this._hardkeyMode = i;var r = this._currentOrder;if (i === h.hardkeyCode.mode.HARDKEY_MODE_RELEASE) {
            if (!this._zoneFocusMode && !this._componentFocusMode) return this.startFocusMode(), void this._sendRemainTick(0);if (this._zoneFocusMode) if (this._componentFocusMode) {
              var s = this._getCurrentTarget();if (s) {
                var u = s.el;if (s.vnode && s.vnode.componentInstance) s.vnode.componentInstance.$emit("click", { view: window, bubbles: !0, cancelable: !1, currentTarget: u, isFocus: !0 }), s.vnode.componentInstance.$emit("jog-click", { order: r });else {
                  var a = new MouseEvent("click", { view: window, bubbles: !0, cancelable: !1, currentTarget: u, isFocus: !0, isTrusted: !1 });u.dispatchEvent(a);var c = new CustomEvent("jog-click", { detail: { order: r } });u.dispatchEvent(c);
                }
              }this._sendRemainTick(0);
            } else this._currentOrder = this._getClosestFocusableComponent(0), -1 === this._currentOrder ? (this.exitFocusMode(), this._sendRemainTick(1)) : (this._componentFocusMode = !0, console.log("[Focus.js] Focus On from RotateClick"), this._setComponentFocusOn(), this._sendRemainTick(0));
          }
        } }, { key: "_handleRotateEnter", value: function value(e) {
          var t = e.code,
              n = void 0 === t ? 1e3 : t,
              o = e.mode,
              i = void 0 === o ? 0 : o;if (this._hardkeyCode = n, this._hardkeyMode = i, this._zoneFocusMode && this._componentFocusMode) {
            var r = this._getCurrentTarget();if (r) {
              var s = r.el;if (s.classList.contains("obg-list-item")) {
                var u = s.classList.contains("active"),
                    a = s.querySelector('[data-type="focus-control-able"]');i !== h.hardkeyCode.mode.HARDKEY_MODE_PRESS || a || u || s.classList.add("active"), i === h.hardkeyCode.mode.HARDKEY_MODE_RELEASE && u && s.classList.remove("active");
              }
            }
          }
        } }, { key: "_onBodyClickListener", value: function value() {
          console.log("[Focus.js] Exit focus by body click"), this.exitFocusMode(), this._sendRemainTick(1);
        } }, { key: "_onRotaryLeftRight", value: function value(e) {
          var t = e.code,
              n = void 0 === t ? 1e3 : t,
              o = e.mode,
              i = void 0 === o ? 0 : o;if (this._hardkeyCode = n, this._hardkeyMode = i, this._hardkeyMode === h.hardkeyCode.mode.HARDKEY_MODE_RELEASE) {
            if (this._appType === _.GADGET || this._tabFocusMode) return this.exitFocusMode(), void this._sendRemainTick(1);var r = this._getSubSection(n);if (r) this._focusToSubSection(r);else if (!this._zoneFocusMode && !this._componentFocusMode && this._appType !== _.GADGET) return this.startFocusMode(), void this._sendRemainTick(0);
          }
        } }, { key: "_onRotaryUpDown", value: function value(e) {
          var t = e.code,
              n = void 0 === t ? 1e3 : t,
              o = e.mode,
              i = void 0 === o ? 0 : o;if (this._hardkeyCode = n, this._hardkeyMode = i, this._hardkeyMode === h.hardkeyCode.mode.HARDKEY_MODE_RELEASE) {
            if (this._tabFocusMode) return this.exitFocusMode(), void this._sendRemainTick(1);var r = this._getSubSection(n);r ? this._focusToSubSection(r) : "up" === this.hardkeyCode ? this.prevZone() : this.nextZone();
          }
        } }, { key: "_getSubSection", value: function value(e) {
          var t = null;switch (e) {case h.hardkeyCode.code.HARDKEY_ROTARY_LEFT:
              t = "left";break;case h.hardkeyCode.code.HARDKEY_ROTARY_RIGHT:
              t = "right";break;case h.hardkeyCode.code.HARDKEY_ROTARY_UP:
              t = "up";break;case h.hardkeyCode.code.HARDKEY_ROTARY_DOWN:
              t = "down";}return this._subSectionMap.get(t);
        } }, { key: "_focusToSubSection", value: function value(e) {
          this.storeLastFocusPosition("section", this._currentOrder), this._setComponentFocusOff(), e.vnode.componentInstance.$emit("jog-click"), this._focusOnSubSection = !0;
        } }, { key: "_findDefaultComponent", value: function value() {
          var e = this._getCurrentSceneMap(),
              t = 0;if (e) for (var n = e.size; t++ < n;) {
            var o = e.get(t);if (o && o.isFocus) return t;
          }return -1;
        } }, { key: "startFocusMode", value: function value() {
          var e = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0],
              t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : -1;this._setComponentFocusOff(), this._zoneFocusMode = !0, this._currentZone = 2;var n = this._findDefaultComponent();this._currentOrder = n > -1 ? n : t, this._isTargetAvailable(this._currentScene, this._currentOrder) || (this._currentOrder = this._getClosestFocusableComponent(0)), -1 === this._currentOrder && this._popupType === y.NONE && (this._currentZone = 3, this._currentOrder = this._getClosestFocusableComponent(0)), this._setZoneFocusOn(this._currentZone), e && (this._componentFocusMode = !0, console.log("[Focus.js] Focus On from StartMode"), this._setComponentFocusOn()), window.addEventListener("click", this._onBodyClickListener);
        } }, { key: "startTabFocusMode", value: function value(e) {
          var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;this._currentTabNumber = e, this._tabFocusMode = !0, this._componentFocusMode = !0, this._currentOrder = t, this._setComponentFocusOn(), window.addEventListener("click", this._onBodyClickListener);
        } }, { key: "exitFocusMode", value: function value() {
          this._setZoneFocusOff(), this._setComponentFocusOff(), this._zoneFocusMode = !1, this._componentControlMode = !1, this._componentFocusMode = !1, this._currentZone = 2, this._currentOrder = -1, this._tabFocusMode = !1, window.removeEventListener("click", this._onBodyClickListener), console.log("[Focus.js] [obigo-ui] exit focus mode");
        } }, { key: "_setZoneFocusOn", value: function value() {
          var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 2,
              t = 2 === e ? "two" : "three",
              n = 0 !== document.body.getElementsByClassName("zone-focus").length;this._$focusZoneEle = n ? this._$focusZoneEle : document.createElement("div"), this._$focusZoneEle.classList = [], this._$focusZoneEle.classList.add("zone-focus", t, this._appType, this._popupType), this._popupType !== y.NONE && (this._$focusZoneEle.style.height = this._popupZoneStyle.height + "px", this._$focusZoneEle.style.width = this._popupZoneStyle.width + "px", this._$focusZoneEle.style.top = this._popupZoneStyle.top + "px", this._$focusZoneEle.style.left = this._popupZoneStyle.left + "px"), n || document.body.appendChild(this._$focusZoneEle), v.default.$emit("focus:zone-focus-in");
        } }, { key: "_setZoneFocusOff", value: function value() {
          if (0 === document.body.getElementsByClassName("zone-focus").length) return void window.removeEventListener("click", this._onBodyClickListener);document.body.removeChild(this._$focusZoneEle);
        } }, { key: "nextZone", value: function value() {
          return this._appType === _.GADGET ? (this.exitFocusMode(), void this._sendRemainTick(1)) : this._zoneFocusMode || this._componentFocusMode ? (this._setComponentFocusOff(), void (2 === this._currentZone && this._popupType === y.NONE ? (this._$focusZoneEle.classList.remove("two"), this._$focusZoneEle.classList.add("three"), this._currentZone += 1, this._componentFocusMode = !0, this._currentOrder = this._getClosestFocusableComponent(0), console.log("[Focus.js] Focus On from NextZone"), this._setComponentFocusOn(), this._sendRemainTick(0)) : (this.exitFocusMode(), this._sendRemainTick(1)))) : (this.startFocusMode(), void this._sendRemainTick(0));
        } }, { key: "prevZone", value: function value() {
          return this._appType === _.GADGET ? (this.exitFocusMode(), void this._sendRemainTick(1)) : this._zoneFocusMode || this._componentFocusMode ? (this._setComponentFocusOff(), void (3 === this._currentZone && this._popupType === y.NONE ? (this._$focusZoneEle.classList.remove("three"), this._$focusZoneEle.classList.add("two"), this._currentZone -= 1, this.startFocusMode(), this._sendRemainTick(0)) : (this.exitFocusMode(), this._sendRemainTick(1)))) : (this.startFocusMode(), void this._sendRemainTick(0));
        } }, { key: "nextOrder", value: function value() {
          arguments.length > 0 && void 0 !== arguments[0] && arguments[0];if (this._tabFocusMode) {
            var e = this._tabMap.get(this._currentTabNumber);this._currentOrder === e.size - 1 ? (this._setComponentFocusOff(), this._tabFocusMode = !1, this._sendRemainTick(0), this._currentOrder = this.loadLastFocusPosition("tab:last-order"), this.startFocusMode(!0, this._currentOrder)) : (this._setComponentFocusOff(), this._currentOrder += 1, this._setComponentFocusOn("right"), this._sendRemainTick(0));
          } else {
            var t = this._getClosestFocusableComponent(this._currentOrder + 1),
                n = this._getCurrentTarget(),
                o = n.el.attributes.role && "tab" === n.el.attributes.role.textContent,
                i = this._getCurrentSceneMap().size - 1;if (o && t === i && !this._Loop && this._currentOrder === t) {
              this._setComponentFocusOff();var r = this._tabMap.get(this._currentTabNumber);if (r && r.size > 0) return this.startTabFocusMode(this._currentTabNumber, 0), void this._sendRemainTick(0);
            }this._setComponentFocusOff(), this._currentOrder = -1 === t ? this._currentOrder : t, console.log("[Focus.js] Focus on by nextOrder"), this._setComponentFocusOn("right"), this._sendRemainTick(0);
          }
        } }, { key: "prevOrder", value: function value() {
          arguments.length > 0 && void 0 !== arguments[0] && arguments[0];if (this._tabFocusMode) 0 === this._currentOrder ? (this._setComponentFocusOff(), this._tabFocusMode = !1, this._sendRemainTick(0), this._currentOrder = this.loadLastFocusPosition("tab:last-order"), this.startFocusMode(!0, this._currentOrder)) : (this._setComponentFocusOff(), this._currentOrder -= 1, this._setComponentFocusOn("right"), this._sendRemainTick(0));else {
            var e = this._getClosestFocusableComponent(this._currentOrder - 1, !1),
                t = this._getCurrentTarget();if (t.el.attributes.role && "tab" === t.el.attributes.role.textContent && 0 === e && !this._Loop && this._currentOrder === e) {
              this._setComponentFocusOff();var n = this._tabMap.get(this._currentTabNumber);if (n && n.size > 0) return this.startTabFocusMode(this._currentTabNumber, n.size - 1), void this._sendRemainTick(0);
            }this._setComponentFocusOff(), this._currentOrder = -1 === e ? this._currentOrder : e, console.log("[Focus.js] Focus on by prevOrder"), this._setComponentFocusOn("left"), this._sendRemainTick(0);
          }
        } }, { key: "_getClosestFocusableComponent", value: function value() {
          var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this._currentOrder,
              t = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1],
              n = this._getCurrentSceneMap(),
              o = this._currentScene,
              i = 0;n || 3 !== this._currentZone || (o = 0, n = this._getSceneMap(this._currentZone, o));var r = t ? 1 : -1,
              s = n ? n.size : 0;for (e = this._Loop || 3 === this._currentZone ? e < 0 ? s - 1 : e >= s ? 0 : e : e < 0 ? this._currentOrder : e >= s ? this._currentOrder : e; i++ < s;) {
            if (this._isTargetAvailable(o, e, r)) return e;e += r, e = e < 0 ? s : e > s ? 0 : e;
          }return -1;
        } }, { key: "_isTargetAvailable", value: function value(e, t, n) {
          var o = this._getSceneMap(this._currentZone, e),
              i = o ? o.get(t) : null;if (i) {
            var r = i.el,
                s = i.el.getBoundingClientRect(),
                u = !(n > 0) || s.top >= 0;return !(r.disabled || r.classList.contains("disabled") || r.classList.contains("disable") || !u);
          }return !1;
        } }, { key: "_getCurrentTarget", value: function value() {
          if (this._tabFocusMode) {
            console.log(this._currentOrder);var e = this._tabMap.get(this._currentTabNumber);if (e && e.size > 0) return e.get(this._currentOrder);
          } else {
            var t = this._getCurrentSceneMap();if (t && t.size > 0) return t.get(this._currentOrder);if (3 === this._currentZone) return t = this._getSceneMap(this._currentZone, 0), t.get(this._currentOrder);
          }return null;
        } }, { key: "_setComponentFocusOn", value: function value(e) {
          var t = this._getCurrentTarget();if (t && !t.el.classList.contains("obg-focus")) if (t.el.classList.add("obg-focus"), t.vnode && t.vnode.componentInstance) t.vnode.componentInstance.$emit("focusin", { target: t.el, direction: e });else {
            var n = new CustomEvent("focusin", { target: t.el, direction: e });t.el.dispatchEvent(n);
          }
        } }, { key: "_setComponentFocusOff", value: function value() {
          var e = this._getCurrentTarget();if (e) if (e.el.classList.remove("obg-focus"), e.vnode && e.vnode.componentInstance) e.vnode.componentInstance.$emit("focusout", { target: e.el });else {
            var t = new CustomEvent("focusout", { target: e.el });e.el.dispatchEvent(t);
          }
        } }, { key: "_getZoneMap", value: function value(e) {
          var t = this._focusMap.get(e);return t || (t = new s.default(), this._focusMap.set(e, t)), t;
        } }, { key: "_getSceneMap", value: function value(e, t) {
          var n = this._getZoneMap(e),
              o = n.get(t);return o || (o = new s.default(), n.set(t, o)), o;
        } }, { key: "_removeSceneMap", value: function value(e, t) {
          var n = this._getZoneMap(e),
              o = n.get(t);return o && n.set(t, new s.default()), o;
        } }, { key: "_getCurrentSceneMap", value: function value() {
          var e = this._focusMap.get(this._currentZone);return e ? e.get(this._currentScene) : null;
        } }, { key: "_addComponent", value: function value(e, t, n) {
          var o = t.scene,
              i = void 0 === o ? 0 : o,
              r = t.zone,
              u = void 0 === r ? 2 : r,
              a = t.order,
              c = t.isFocus,
              d = void 0 !== c && c,
              l = t.tabNumber,
              f = void 0 === l ? null : l;if (null === f || e.attributes.role && "tab" === e.attributes.role.textContent) {
            var h = this._getSceneMap(u, i);if (void 0 === a && (a = h.size), h.get(a)) return h.set(a, { el: e, vnode: n, isFocus: d }), void console.log("[Focus.js] [ObigoUI:error] Focus order is duplicated [ scene : " + i + " / order : " + a + "] - overwrite");h.set(a, { el: e, vnode: n, isFocus: d });
          } else {
            var p = this._tabMap.get(f);p ? void 0 === a && (a = p.size) : (a = 0, p = new s.default(), this._tabMap.set(f, p)), p.set(a, { el: e, vnode: n, isFocus: d });
          }
        } }, { key: "_removeComponent", value: function value(e, t) {
          var n = t.zone,
              o = void 0 === n ? 2 : n,
              i = t.scene,
              r = void 0 === i ? 0 : i,
              s = t.order,
              u = t.tabNumber,
              a = void 0 === u ? null : u;if (null !== a) {
            var c = this._tabMap.get(a);void 0 === s && (s = c.size - 1), c && c.delete(s);
          } else {
            var d = this._getSceneMap(o, r);void 0 === s && (s = d.size - 1), d.delete(s);
          }
        } }, { key: "_addSubSection", value: function value(e, t, n) {
          this._subSectionMap.set(t, { el: e, vnode: n });
        } }, { key: "_removeSubSection", value: function value(e, t) {
          this._subSectionMap.delete(t);
        } }, { key: "_sendRemainTick", value: function value(e) {
          console.log("[Focus.js] notProcessedCount : " + e), window.hardkeyEventObj && window.hardkeyEventObj.notProcessedCount(this._hardkeyCode, this._hardkeyMode, e);
        } }, { key: "setScene", value: function value(e) {
          this._setZoneFocusOff(), this._setComponentFocusOff(), this._currentZone = 2, this._currentOrder = 0, this._currentScene = e;
        } }, { key: "setFocusPosition", value: function value(e) {
          var t = e.scene,
              n = void 0 === t ? 0 : t,
              o = e.order,
              i = void 0 === o ? 0 : o,
              r = e.zone,
              s = void 0 === r ? 2 : r;this._setZoneFocusOff(), this._setComponentFocusOff(), this._zoneFocusMode = !1, this._componentFocusMode = !1, this._currentOrder = i, this._currentZone = s, this._currentScene = n;
        } }, { key: "getCurrentPosition", value: function value() {
          return { order: this._currentOrder, zone: this._currentZone, scene: this._currentScene };
        } }, { key: "isFocusOn", value: function value() {
          return this._zoneFocusMode && this._componentFocusMode;
        } }, { key: "setFocusOnByElement", value: function value(e) {
          this.exitFocusMode();for (var t = this._getSceneMap(2, this._currentScene), n = t.size, o = -1, i = 0; i < n; i++) {
            if (t.get(i).el === e) {
              o = i;break;
            }
          }return o > -1 && (this._currentZone = 2, this._currentOrder = o, this._zoneFocusMode = !0, this._componentFocusMode = !0, this._setZoneFocusOn(), console.log("[Focus.js] Focus On from SetFocusByElement"), this._setComponentFocusOn(), window.addEventListener("click", this._onBodyClickListener)), o;
        } }, { key: "setOptions", value: function value(e) {
          var t = e.loop;this._Loop = t;
        } }, { key: "storeLastFocusPosition", value: function value(e, t) {
          this._lastFocusMap.set(e, t);
        } }, { key: "loadLastFocusPosition", value: function value(e) {
          return this._lastFocusMap.get(e);
        } }]), e;
    }(),
        b = t.focusInstance = new g();
  }, function (e, t, n) {
    e.exports = { default: n(120), __esModule: !0 };
  }, function (e, t, n) {
    "use strict";
    function o(e) {
      return e && e.__esModule ? e : { default: e };
    }Object.defineProperty(t, "__esModule", { value: !0 }), t.current = void 0;var i = n(14),
        r = o(i),
        s = n(15),
        u = o(s),
        a = n(58),
        c = o(a),
        d = n(8),
        l = o(d),
        f = function () {
      function e(t) {
        var n = this;(0, r.default)(this, e), this._currentTheme = t, c.default.dom.ready(function () {
          document.body.classList.add("obg-theme-" + n._currentTheme);
        });
      }return (0, u.default)(e, [{ key: "set", value: function value(e) {
          document.body.classList.remove("obg-theme-" + this._currentTheme), this._currentTheme = e, document.body.classList.add("obg-theme-" + e), l.default.$emit("theme:update", { name: e });
        } }, { key: "get", value: function value() {
          return this._currentTheme;
        } }]), e;
    }();t.current = new f("basic");
  }, function (e, t, n) {
    e.exports = { default: n(84), __esModule: !0 };
  }, function (e, t, n) {
    n(85);var o = n(1).Object;e.exports = function (e, t, n) {
      return o.defineProperty(e, t, n);
    };
  }, function (e, t, n) {
    var o = n(4);o(o.S + o.F * !n(7), "Object", { defineProperty: n(5).f });
  }, function (e, t, n) {
    "use strict";
    var o,
        i,
        r = n(18),
        s = function (e) {
      return e && e.__esModule ? e : { default: e };
    }(r);!function (r, s) {
      o = s, void 0 !== (i = "function" == typeof o ? o.call(t, n, t, e) : o) && (e.exports = i);
    }(0, function () {
      function e(e) {
        return ("undefined" == typeof console ? "undefined" : (0, s.default)(console)) !== a && (void 0 !== console[e] ? t(console, e) : void 0 !== console.log ? t(console, "log") : u);
      }function t(e, t) {
        var n = e[t];if ("function" == typeof n.bind) return n.bind(e);try {
          return Function.prototype.bind.call(n, e);
        } catch (t) {
          return function () {
            return Function.prototype.apply.apply(n, [e, arguments]);
          };
        }
      }function n(e, t, n) {
        return function () {
          ("undefined" == typeof console ? "undefined" : (0, s.default)(console)) !== a && (o.call(this, t, n), this[e].apply(this, arguments));
        };
      }function o(e, t) {
        for (var n = 0; n < c.length; n++) {
          var o = c[n];this[o] = n < e ? u : this.methodFactory(o, e, t);
        }
      }function i(t, o, i) {
        return e(t) || n.apply(this, arguments);
      }function r(e, t, n) {
        function r(e) {
          var t = (c[e] || "silent").toUpperCase();try {
            return void (window.localStorage[f] = t);
          } catch (e) {}try {
            window.document.cookie = encodeURIComponent(f) + "=" + t + ";";
          } catch (e) {}
        }function u() {
          var e;try {
            e = window.localStorage[f];
          } catch (e) {}if ((void 0 === e ? "undefined" : (0, s.default)(e)) === a) try {
            var t = window.document.cookie,
                n = t.indexOf(encodeURIComponent(f) + "=");n && (e = /^([^;]+)/.exec(t.slice(n))[1]);
          } catch (e) {}return void 0 === l.levels[e] && (e = void 0), e;
        }var d,
            l = this,
            f = "loglevel";e && (f += ":" + e), l.levels = { TRACE: 0, DEBUG: 1, INFO: 2, WARN: 3, ERROR: 4, SILENT: 5 }, l.methodFactory = n || i, l.getLevel = function () {
          return d;
        }, l.setLevel = function (t, n) {
          if ("string" == typeof t && void 0 !== l.levels[t.toUpperCase()] && (t = l.levels[t.toUpperCase()]), !("number" == typeof t && t >= 0 && t <= l.levels.SILENT)) throw "log.setLevel() called with invalid level: " + t;if (d = t, !1 !== n && r(t), o.call(l, t, e), ("undefined" == typeof console ? "undefined" : (0, s.default)(console)) === a && t < l.levels.SILENT) return "No console available for logging";
        }, l.setDefaultLevel = function (e) {
          u() || l.setLevel(e, !1);
        }, l.enableAll = function (e) {
          l.setLevel(l.levels.TRACE, e);
        }, l.disableAll = function (e) {
          l.setLevel(l.levels.SILENT, e);
        };var h = u();null == h && (h = null == t ? "WARN" : t), l.setLevel(h, !1);
      }var u = function u() {},
          a = "undefined",
          c = ["trace", "debug", "info", "warn", "error"],
          d = new r(),
          l = {};d.getLogger = function (e) {
        if ("string" != typeof e || "" === e) throw new TypeError("You must supply a name when creating a logger.");var t = l[e];return t || (t = l[e] = new r(e, d.getLevel(), d.methodFactory)), t;
      };var f = ("undefined" == typeof window ? "undefined" : (0, s.default)(window)) !== a ? window.log : void 0;return d.noConflict = function () {
        return ("undefined" == typeof window ? "undefined" : (0, s.default)(window)) !== a && window.log === d && (window.log = f), d;
      }, d;
    });
  }, function (e, t, n) {
    e.exports = { default: n(88), __esModule: !0 };
  }, function (e, t, n) {
    n(27), n(32), e.exports = n(43).f("iterator");
  }, function (e, t, n) {
    var o = n(35),
        i = n(36);e.exports = function (e) {
      return function (t, n) {
        var r,
            s,
            u = String(i(t)),
            a = o(n),
            c = u.length;return a < 0 || a >= c ? e ? "" : void 0 : (r = u.charCodeAt(a), r < 55296 || r > 56319 || a + 1 === c || (s = u.charCodeAt(a + 1)) < 56320 || s > 57343 ? e ? u.charAt(a) : r : e ? u.slice(a, a + 2) : s - 56320 + (r - 55296 << 10) + 65536);
      };
    };
  }, function (e, t, n) {
    "use strict";
    var o = n(38),
        i = n(25),
        r = n(23),
        s = {};n(10)(s, n(3)("iterator"), function () {
      return this;
    }), e.exports = function (e, t, n) {
      e.prototype = o(s, { next: i(1, n) }), r(e, t + " Iterator");
    };
  }, function (e, t, n) {
    var o = n(5),
        i = n(9),
        r = n(21);e.exports = n(7) ? _defineProperties2.default : function (e, t) {
      i(e);for (var n, s = r(t), u = s.length, a = 0; u > a;) {
        o.f(e, n = s[a++], t[n]);
      }return e;
    };
  }, function (e, t, n) {
    var o = n(16),
        i = n(31),
        r = n(93);e.exports = function (e) {
      return function (t, n, s) {
        var u,
            a = o(t),
            c = i(a.length),
            d = r(s, c);if (e && n != n) {
          for (; c > d;) {
            if ((u = a[d++]) != u) return !0;
          }
        } else for (; c > d; d++) {
          if ((e || d in a) && a[d] === n) return e || d || 0;
        }return !e && -1;
      };
    };
  }, function (e, t, n) {
    var o = n(35),
        i = Math.max,
        r = Math.min;e.exports = function (e, t) {
      return e = o(e), e < 0 ? i(e + t, 0) : r(e, t);
    };
  }, function (e, t, n) {
    var o = n(13),
        i = n(26),
        r = n(40)("IE_PROTO"),
        s = Object.prototype;e.exports = _getPrototypeOf2.default || function (e) {
      return e = i(e), o(e, r) ? e[r] : "function" == typeof e.constructor && e instanceof e.constructor ? e.constructor.prototype : e instanceof Object ? s : null;
    };
  }, function (e, t, n) {
    "use strict";
    var o = n(96),
        i = n(62),
        r = n(20),
        s = n(16);e.exports = n(37)(Array, "Array", function (e, t) {
      this._t = s(e), this._i = 0, this._k = t;
    }, function () {
      var e = this._t,
          t = this._k,
          n = this._i++;return !e || n >= e.length ? (this._t = void 0, i(1)) : "keys" == t ? i(0, n) : "values" == t ? i(0, e[n]) : i(0, [n, e[n]]);
    }, "values"), r.Arguments = r.Array, o("keys"), o("values"), o("entries");
  }, function (e, t) {
    e.exports = function () {};
  }, function (e, t, n) {
    n(98), n(47), n(102), n(103), e.exports = n(1).Symbol;
  }, function (e, t, n) {
    "use strict";
    var o = n(2),
        i = n(13),
        r = n(7),
        s = n(4),
        u = n(59),
        a = n(44).KEY,
        c = n(12),
        d = n(41),
        l = n(23),
        f = n(28),
        h = n(3),
        p = n(43),
        v = n(45),
        _ = n(99),
        y = n(64),
        m = n(9),
        g = n(6),
        b = n(16),
        E = n(34),
        k = n(25),
        O = n(38),
        w = n(100),
        T = n(101),
        R = n(5),
        M = n(21),
        F = T.f,
        S = R.f,
        C = w.f,
        _L = o.Symbol,
        x = o.JSON,
        A = x && x.stringify,
        D = h("_hidden"),
        P = h("toPrimitive"),
        H = {}.propertyIsEnumerable,
        N = d("symbol-registry"),
        Y = d("symbols"),
        j = d("op-symbols"),
        I = Object.prototype,
        K = "function" == typeof _L,
        $ = o.QObject,
        Z = !$ || !$.prototype || !$.prototype.findChild,
        G = r && c(function () {
      return 7 != O(S({}, "a", { get: function get() {
          return S(this, "a", { value: 7 }).a;
        } })).a;
    }) ? function (e, t, n) {
      var o = F(I, t);o && delete I[t], S(e, t, n), o && e !== I && S(I, t, o);
    } : S,
        z = function z(e) {
      var t = Y[e] = O(_L.prototype);return t._k = e, t;
    },
        U = K && "symbol" == (0, _typeof3.default)(_L.iterator) ? function (e) {
      return "symbol" == (typeof e === "undefined" ? "undefined" : (0, _typeof3.default)(e));
    } : function (e) {
      return e instanceof _L;
    },
        B = function B(e, t, n) {
      return e === I && B(j, t, n), m(e), t = E(t, !0), m(n), i(Y, t) ? (n.enumerable ? (i(e, D) && e[D][t] && (e[D][t] = !1), n = O(n, { enumerable: k(0, !1) })) : (i(e, D) || S(e, D, k(1, {})), e[D][t] = !0), G(e, t, n)) : S(e, t, n);
    },
        W = function W(e, t) {
      m(e);for (var n, o = _(t = b(t)), i = 0, r = o.length; r > i;) {
        B(e, n = o[i++], t[n]);
      }return e;
    },
        q = function q(e, t) {
      return void 0 === t ? O(e) : W(O(e), t);
    },
        V = function V(e) {
      var t = H.call(this, e = E(e, !0));return !(this === I && i(Y, e) && !i(j, e)) && (!(t || !i(this, e) || !i(Y, e) || i(this, D) && this[D][e]) || t);
    },
        X = function X(e, t) {
      if (e = b(e), t = E(t, !0), e !== I || !i(Y, t) || i(j, t)) {
        var n = F(e, t);return !n || !i(Y, t) || i(e, D) && e[D][t] || (n.enumerable = !0), n;
      }
    },
        J = function J(e) {
      for (var t, n = C(b(e)), o = [], r = 0; n.length > r;) {
        i(Y, t = n[r++]) || t == D || t == a || o.push(t);
      }return o;
    },
        Q = function Q(e) {
      for (var t, n = e === I, o = C(n ? j : b(e)), r = [], s = 0; o.length > s;) {
        !i(Y, t = o[s++]) || n && !i(I, t) || r.push(Y[t]);
      }return r;
    };K || (_L = function L() {
      if (this instanceof _L) throw TypeError("Symbol is not a constructor!");var e = f(arguments.length > 0 ? arguments[0] : void 0),
          t = function t(n) {
        this === I && t.call(j, n), i(this, D) && i(this[D], e) && (this[D][e] = !1), G(this, e, k(1, n));
      };return r && Z && G(I, e, { configurable: !0, set: t }), z(e);
    }, u(_L.prototype, "toString", function () {
      return this._k;
    }), T.f = X, R.f = B, n(65).f = w.f = J, n(29).f = V, n(46).f = Q, r && !n(19) && u(I, "propertyIsEnumerable", V, !0), p.f = function (e) {
      return z(h(e));
    }), s(s.G + s.W + s.F * !K, { Symbol: _L });for (var ee = "hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","), te = 0; ee.length > te;) {
      h(ee[te++]);
    }for (var ne = M(h.store), oe = 0; ne.length > oe;) {
      v(ne[oe++]);
    }s(s.S + s.F * !K, "Symbol", { for: function _for(e) {
        return i(N, e += "") ? N[e] : N[e] = _L(e);
      }, keyFor: function keyFor(e) {
        if (!U(e)) throw TypeError(e + " is not a symbol!");for (var t in N) {
          if (N[t] === e) return t;
        }
      }, useSetter: function useSetter() {
        Z = !0;
      }, useSimple: function useSimple() {
        Z = !1;
      } }), s(s.S + s.F * !K, "Object", { create: q, defineProperty: B, defineProperties: W, getOwnPropertyDescriptor: X, getOwnPropertyNames: J, getOwnPropertySymbols: Q }), x && s(s.S + s.F * (!K || c(function () {
      var e = _L();return "[null]" != A([e]) || "{}" != A({ a: e }) || "{}" != A(Object(e));
    })), "JSON", { stringify: function stringify(e) {
        for (var t, n, o = [e], i = 1; arguments.length > i;) {
          o.push(arguments[i++]);
        }if (n = t = o[1], (g(t) || void 0 !== e) && !U(e)) return y(t) || (t = function t(e, _t2) {
          if ("function" == typeof n && (_t2 = n.call(this, e, _t2)), !U(_t2)) return _t2;
        }), o[1] = t, A.apply(x, o);
      } }), _L.prototype[P] || n(10)(_L.prototype, P, _L.prototype.valueOf), l(_L, "Symbol"), l(Math, "Math", !0), l(o.JSON, "JSON", !0);
  }, function (e, t, n) {
    var o = n(21),
        i = n(46),
        r = n(29);e.exports = function (e) {
      var t = o(e),
          n = i.f;if (n) for (var s, u = n(e), a = r.f, c = 0; u.length > c;) {
        a.call(e, s = u[c++]) && t.push(s);
      }return t;
    };
  }, function (e, t, n) {
    var o = n(16),
        i = n(65).f,
        r = {}.toString,
        s = "object" == (typeof window === "undefined" ? "undefined" : (0, _typeof3.default)(window)) && window && _getOwnPropertyNames2.default ? (0, _getOwnPropertyNames2.default)(window) : [],
        u = function u(e) {
      try {
        return i(e);
      } catch (e) {
        return s.slice();
      }
    };e.exports.f = function (e) {
      return s && "[object Window]" == r.call(e) ? u(e) : i(o(e));
    };
  }, function (e, t, n) {
    var o = n(29),
        i = n(25),
        r = n(16),
        s = n(34),
        u = n(13),
        a = n(57),
        c = _getOwnPropertyDescriptor2.default;t.f = n(7) ? c : function (e, t) {
      if (e = r(e), t = s(t, !0), a) try {
        return c(e, t);
      } catch (e) {}if (u(e, t)) return i(!o.f.call(e, t), e[t]);
    };
  }, function (e, t, n) {
    n(45)("asyncIterator");
  }, function (e, t, n) {
    n(45)("observable");
  }, function (e, t, n) {
    n(105), e.exports = n(1).Object.keys;
  }, function (e, t, n) {
    var o = n(26),
        i = n(21);n(106)("keys", function () {
      return function (e) {
        return i(o(e));
      };
    });
  }, function (e, t, n) {
    var o = n(4),
        i = n(1),
        r = n(12);e.exports = function (e, t) {
      var n = (i.Object || {})[e] || Object[e],
          s = {};s[e] = t(n), o(o.S + o.F * r(function () {
        n(1);
      }), "Object", s);
    };
  }, function (e, t, n) {
    "use strict";
    e.exports = { timeToSec: function timeToSec(e) {
        var t = /^(?:(?:([01]?\d|[0-9][0-9]):)?([0-5]?\d):)?([0-5]?\d)$/.exec(e),
            n = 0;return t ? (t = t.slice(1), t.map(function (e, t) {
          if (e) {
            var o = Number(e);switch (t) {case 0:
                n += 3600 * o;break;case 1:
                n += 60 * o;break;case 2:
                n += o;}
          }
        })) : n = e, n;
      }, secToTime: function secToTime(e) {
        var t = new Date(null),
            n = /^(00)+:[0-5]?\d:[0-5]?\d/,
            o = void 0;return t.setSeconds(Math.round(e)), o = t.toISOString().substr(11, 8), n.exec(o) ? o.substr(3, 6) : o;
      }, getCurrentTimeText: function getCurrentTimeText(e, t) {
        var n = this.timeToSec(e);return this.secToTime(n * t / 100);
      } };
  }, function (e, t, n) {
    "use strict";
    function o(e, t, n) {
      var o = (0, u.default)();t.dataset["__" + e] = o, a[e] ? a[e][o] && console.warn("Element store [add]: overwriting data") : a[e] = {}, a[e][o] = n;
    }function i(e, t) {
      var n = t.dataset["__" + e];if (!n) return void console.warn("Element store [get]: id not registered", e, t);if (!a[e]) return void console.warn("Element store [get]: name not registered", e, t);var o = a[e][n];return o || void console.warn("Element store [get]: data not found for", e, ":", n, "->", t);
    }function r(e, t) {
      var n = t.dataset["__" + e];if (!n) return void console.warn("Element store [remove]: id not registered", e, t);a[e] && a[e][n] && delete a[e][n];
    }Object.defineProperty(t, "__esModule", { value: !0 }), t.add = o, t.get = i, t.remove = r;var s = n(67),
        u = function (e) {
      return e && e.__esModule ? e : { default: e };
    }(s),
        a = {};
  }, function (e, t, n) {
    "use strict";
    function o(e) {
      return e && e.__esModule ? e : { default: e };
    }Object.defineProperty(t, "__esModule", { value: !0 });var i = n(18),
        r = o(i),
        s = n(110),
        u = o(s),
        a = n(112),
        c = o(a),
        d = n(14),
        l = o(d),
        f = n(15),
        h = o(f),
        p = function () {
      function e(t) {
        (0, l.default)(this, e), this.xmlhttp = null, this.opt = { url: null, type: "GET", data: null, async: !0, timeout: 5e3, dataType: "text", requestHeader: null };for (var n in t) {
          this.opt[n] = t[n];
        }
      }return (0, h.default)(e, [{ key: "_encodeFormData", value: function value(e) {
          var t = [],
              n = /%20/g;for (var o in e) {
            if (e.hasOwnProperty(o)) {
              var i = e[o].toString(),
                  r = encodeURIComponent(o).replace(n, "+") + "=" + encodeURIComponent(i).replace(n, "+");t.push(r);
            }
          }return t.join("&");
        } }, { key: "_parseXML", value: function value(e) {
          var t, n;if (!e || "string" != typeof e) return null;try {
            n = new DOMParser(), t = n.parseFromString(e, "text/xml");
          } catch (e) {
            t = void 0;
          }if (!t || t.getElementsByTagName("parsererror").length) throw new Error("Invalid XML: " + e);return t;
        } }, { key: "_onLoad", value: function value(e) {
          var t,
              n,
              o = {};if (o.status = this.xmlhttp.status, o.statusText = this.xmlhttp.statusText, 200 === this.xmlhttp.status || 0 === this.xmlhttp.status) {
            if ("json" === this.opt.dataType) {
              if (this.xmlhttp.responseText) {
                try {
                  n = JSON.parse(this.xmlhttp.responseText);
                } catch (e) {
                  return o.data = "json parseerror", void this.reject(o);
                }o.data = n, this.resolve(o);
              } else o.data = "empty json", this.reject(o);
            } else if ("xml" === this.opt.dataType) {
              if (this.xmlhttp.responseXML) o.data = this.xmlhttp.responseXML, this.resolve(o);else if (this.xmlhttp.responseText) {
                try {
                  t = this._parseXML(this.xmlhttp.responseText);
                } catch (e) {
                  return o.data = "xml parseerror", void this.reject(o);
                }o.data = t, this.resolve(o);
              } else o.data = "empty xml", this.reject(o);
            } else o.data = this.xmlhttp.responseText, this.resolve(o);
          } else 0 !== this.xmlhttp.status && (o.data = "error", this.reject(o));
        } }, { key: "_onTimeout", value: function value(e) {
          var t = {};t.status = this.xmlhttp.status, t.statusText = this.xmlhttp.statusText, t.data = "timeout", this.reject(t);
        } }, { key: "_onError", value: function value(e) {
          var t = {};t.status = this.xmlhttp.status, t.statusText = this.xmlhttp.statusText, t.data = "string" != typeof e || "timeerror" !== e && "nonetwork" !== e ? "error" : e, this.reject(t);
        } }, { key: "_req", value: function value() {
          var e = this;return new c.default(function (t, n) {
            if (e.resolve = t, e.reject = n, e.opt.url || n({ data: "no url" }), e.xmlhttp = null, e.xmlhttp = new XMLHttpRequest(), e.xmlhttp.onload = e._onLoad.bind(e), e.xmlhttp.ontimeout = e._onTimeout.bind(e), e.xmlhttp.onerror = e._onError.bind(e), e.opt.type = e.opt.type.toUpperCase(), e.opt.async && (e.xmlhttp.timeout = e.opt.timeout), "GET" === e.opt.type && e.opt.data && (e.opt.data = e._encodeFormData(e.opt.data), e.opt.url = e.opt.url + "?" + e.opt.data, e.opt.data = null), e.xmlhttp.open(e.opt.type, e.opt.url, e.opt.async), "POST" !== e.opt.type || (0, u.default)(e.opt.requestHeader).match(/content-type/gi) || e.xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8"), e.opt.requestHeader) {
              var o = e.opt.requestHeader;for (var i in o) {
                o.hasOwnProperty(i) && e.xmlhttp.setRequestHeader(i, o[i]);
              }
            }"object" === (0, r.default)(e.opt.data) && (e.opt.data = e._encodeFormData(e.opt.data)), e.xmlhttp.send(e.opt.data);
          });
        } }]), e;
    }(),
        v = function () {
      function e() {
        (0, l.default)(this, e);
      }return (0, h.default)(e, [{ key: "get", value: function value(e) {
          return e.type = "GET", new p(e)._req();
        } }, { key: "post", value: function value(e) {
          return e.type = "POST", new p(e)._req();
        } }, { key: "delete", value: function value(e) {
          return e.type = "DELETE", new p(e)._req();
        } }, { key: "put", value: function value(e) {
          return e.type = "PUT", new p(e)._req();
        } }, { key: "http", value: function value(e) {
          return new p(e)._req();
        } }]), e;
    }();t.default = new v();
  }, function (e, t, n) {
    e.exports = { default: n(111), __esModule: !0 };
  }, function (e, t, n) {
    var o = n(1),
        i = o.JSON || (o.JSON = { stringify: _stringify2.default });e.exports = function (e) {
      return i.stringify.apply(i, arguments);
    };
  }, function (e, t, n) {
    e.exports = { default: n(113), __esModule: !0 };
  }, function (e, t, n) {
    n(47), n(27), n(32), n(114), n(118), n(119), e.exports = n(1).Promise;
  }, function (e, t, n) {
    "use strict";
    var o,
        i,
        r,
        s,
        u = n(19),
        a = n(2),
        c = n(11),
        d = n(49),
        l = n(4),
        f = n(6),
        h = n(17),
        p = n(50),
        v = n(24),
        _ = n(69),
        y = n(70).set,
        m = n(116)(),
        g = n(51),
        b = n(71),
        E = n(117),
        k = n(72),
        O = a.TypeError,
        w = a.process,
        T = w && w.versions,
        R = T && T.v8 || "",
        _M = a.Promise,
        F = "process" == d(w),
        S = function S() {},
        C = i = g.f,
        L = !!function () {
      try {
        var e = _M.resolve(1),
            t = (e.constructor = {})[n(3)("species")] = function (e) {
          e(S, S);
        };return (F || "function" == typeof PromiseRejectionEvent) && e.then(S) instanceof t && 0 !== R.indexOf("6.6") && -1 === E.indexOf("Chrome/66");
      } catch (e) {}
    }(),
        x = function x(e) {
      var t;return !(!f(e) || "function" != typeof (t = e.then)) && t;
    },
        A = function A(e, t) {
      if (!e._n) {
        e._n = !0;var n = e._c;m(function () {
          for (var o = e._v, i = 1 == e._s, r = 0; n.length > r;) {
            !function (t) {
              var n,
                  r,
                  s,
                  u = i ? t.ok : t.fail,
                  a = t.resolve,
                  c = t.reject,
                  d = t.domain;try {
                u ? (i || (2 == e._h && H(e), e._h = 1), !0 === u ? n = o : (d && d.enter(), n = u(o), d && (d.exit(), s = !0)), n === t.promise ? c(O("Promise-chain cycle")) : (r = x(n)) ? r.call(n, a, c) : a(n)) : c(o);
              } catch (e) {
                d && !s && d.exit(), c(e);
              }
            }(n[r++]);
          }e._c = [], e._n = !1, t && !e._h && D(e);
        });
      }
    },
        D = function D(e) {
      y.call(a, function () {
        var t,
            n,
            o,
            i = e._v,
            r = P(e);if (r && (t = b(function () {
          F ? w.emit("unhandledRejection", i, e) : (n = a.onunhandledrejection) ? n({ promise: e, reason: i }) : (o = a.console) && o.error && o.error("Unhandled promise rejection", i);
        }), e._h = F || P(e) ? 2 : 1), e._a = void 0, r && t.e) throw t.v;
      });
    },
        P = function P(e) {
      return 1 !== e._h && 0 === (e._a || e._c).length;
    },
        H = function H(e) {
      y.call(a, function () {
        var t;F ? w.emit("rejectionHandled", e) : (t = a.onrejectionhandled) && t({ promise: e, reason: e._v });
      });
    },
        N = function N(e) {
      var t = this;t._d || (t._d = !0, t = t._w || t, t._v = e, t._s = 2, t._a || (t._a = t._c.slice()), A(t, !0));
    },
        Y = function Y(e) {
      var t,
          n = this;if (!n._d) {
        n._d = !0, n = n._w || n;try {
          if (n === e) throw O("Promise can't be resolved itself");(t = x(e)) ? m(function () {
            var o = { _w: n, _d: !1 };try {
              t.call(e, c(Y, o, 1), c(N, o, 1));
            } catch (e) {
              N.call(o, e);
            }
          }) : (n._v = e, n._s = 1, A(n, !1));
        } catch (e) {
          N.call({ _w: n, _d: !1 }, e);
        }
      }
    };L || (_M = function M(e) {
      p(this, _M, "Promise", "_h"), h(e), o.call(this);try {
        e(c(Y, this, 1), c(N, this, 1));
      } catch (e) {
        N.call(this, e);
      }
    }, o = function o(e) {
      this._c = [], this._a = void 0, this._s = 0, this._d = !1, this._v = void 0, this._h = 0, this._n = !1;
    }, o.prototype = n(52)(_M.prototype, { then: function then(e, t) {
        var n = C(_(this, _M));return n.ok = "function" != typeof e || e, n.fail = "function" == typeof t && t, n.domain = F ? w.domain : void 0, this._c.push(n), this._a && this._a.push(n), this._s && A(this, !1), n.promise;
      }, catch: function _catch(e) {
        return this.then(void 0, e);
      } }), r = function r() {
      var e = new o();this.promise = e, this.resolve = c(Y, e, 1), this.reject = c(N, e, 1);
    }, g.f = C = function C(e) {
      return e === _M || e === s ? new r(e) : i(e);
    }), l(l.G + l.W + l.F * !L, { Promise: _M }), n(23)(_M, "Promise"), n(73)("Promise"), s = n(1).Promise, l(l.S + l.F * !L, "Promise", { reject: function reject(e) {
        var t = C(this);return (0, t.reject)(e), t.promise;
      } }), l(l.S + l.F * (u || !L), "Promise", { resolve: function resolve(e) {
        return k(u && this === s ? _M : this, e);
      } }), l(l.S + l.F * !(L && n(79)(function (e) {
      _M.all(e).catch(S);
    })), "Promise", { all: function all(e) {
        var t = this,
            n = C(t),
            o = n.resolve,
            i = n.reject,
            r = b(function () {
          var n = [],
              r = 0,
              s = 1;v(e, !1, function (e) {
            var u = r++,
                a = !1;n.push(void 0), s++, t.resolve(e).then(function (e) {
              a || (a = !0, n[u] = e, --s || o(n));
            }, i);
          }), --s || o(n);
        });return r.e && i(r.v), n.promise;
      }, race: function race(e) {
        var t = this,
            n = C(t),
            o = n.reject,
            i = b(function () {
          v(e, !1, function (e) {
            t.resolve(e).then(n.resolve, o);
          });
        });return i.e && o(i.v), n.promise;
      } });
  }, function (e, t) {
    e.exports = function (e, t, n) {
      var o = void 0 === n;switch (t.length) {case 0:
          return o ? e() : e.call(n);case 1:
          return o ? e(t[0]) : e.call(n, t[0]);case 2:
          return o ? e(t[0], t[1]) : e.call(n, t[0], t[1]);case 3:
          return o ? e(t[0], t[1], t[2]) : e.call(n, t[0], t[1], t[2]);case 4:
          return o ? e(t[0], t[1], t[2], t[3]) : e.call(n, t[0], t[1], t[2], t[3]);}return e.apply(n, t);
    };
  }, function (e, t, n) {
    var o = n(2),
        i = n(70).set,
        r = o.MutationObserver || o.WebKitMutationObserver,
        s = o.process,
        u = o.Promise,
        a = "process" == n(22)(s);e.exports = function () {
      var e,
          t,
          n,
          c = function c() {
        var o, i;for (a && (o = s.domain) && o.exit(); e;) {
          i = e.fn, e = e.next;try {
            i();
          } catch (o) {
            throw e ? n() : t = void 0, o;
          }
        }t = void 0, o && o.enter();
      };if (a) n = function n() {
        s.nextTick(c);
      };else if (!r || o.navigator && o.navigator.standalone) {
        if (u && u.resolve) {
          var d = u.resolve(void 0);n = function n() {
            d.then(c);
          };
        } else n = function n() {
          i.call(o, c);
        };
      } else {
        var l = !0,
            f = document.createTextNode("");new r(c).observe(f, { characterData: !0 }), n = function n() {
          f.data = l = !l;
        };
      }return function (o) {
        var i = { fn: o, next: void 0 };t && (t.next = i), e || (e = i, n()), t = i;
      };
    };
  }, function (e, t, n) {
    var o = n(2),
        i = o.navigator;e.exports = i && i.userAgent || "";
  }, function (e, t, n) {
    "use strict";
    var o = n(4),
        i = n(1),
        r = n(2),
        s = n(69),
        u = n(72);o(o.P + o.R, "Promise", { finally: function _finally(e) {
        var t = s(this, i.Promise || r.Promise),
            n = "function" == typeof e;return this.then(n ? function (n) {
          return u(t, e()).then(function () {
            return n;
          });
        } : e, n ? function (n) {
          return u(t, e()).then(function () {
            throw n;
          });
        } : e);
      } });
  }, function (e, t, n) {
    "use strict";
    var o = n(4),
        i = n(51),
        r = n(71);o(o.S, "Promise", { try: function _try(e) {
        var t = i.f(this),
            n = r(e);return (n.e ? t.reject : t.resolve)(n.v), t.promise;
      } });
  }, function (e, t, n) {
    n(47), n(27), n(32), n(121), n(127), n(130), n(132), e.exports = n(1).Map;
  }, function (e, t, n) {
    "use strict";
    var o = n(122),
        i = n(74);e.exports = n(123)("Map", function (e) {
      return function () {
        return e(this, arguments.length > 0 ? arguments[0] : void 0);
      };
    }, { get: function get(e) {
        var t = o.getEntry(i(this, "Map"), e);return t && t.v;
      }, set: function set(e, t) {
        return o.def(i(this, "Map"), 0 === e ? 0 : e, t);
      } }, o, !0);
  }, function (e, t, n) {
    "use strict";
    var o = n(5).f,
        i = n(38),
        r = n(52),
        s = n(11),
        u = n(50),
        a = n(24),
        c = n(37),
        d = n(62),
        l = n(73),
        f = n(7),
        h = n(44).fastKey,
        p = n(74),
        v = f ? "_s" : "size",
        _ = function _(e, t) {
      var n,
          o = h(t);if ("F" !== o) return e._i[o];for (n = e._f; n; n = n.n) {
        if (n.k == t) return n;
      }
    };e.exports = { getConstructor: function getConstructor(e, t, n, c) {
        var d = e(function (e, o) {
          u(e, d, t, "_i"), e._t = t, e._i = i(null), e._f = void 0, e._l = void 0, e[v] = 0, void 0 != o && a(o, n, e[c], e);
        });return r(d.prototype, { clear: function clear() {
            for (var e = p(this, t), n = e._i, o = e._f; o; o = o.n) {
              o.r = !0, o.p && (o.p = o.p.n = void 0), delete n[o.i];
            }e._f = e._l = void 0, e[v] = 0;
          }, delete: function _delete(e) {
            var n = p(this, t),
                o = _(n, e);if (o) {
              var i = o.n,
                  r = o.p;delete n._i[o.i], o.r = !0, r && (r.n = i), i && (i.p = r), n._f == o && (n._f = i), n._l == o && (n._l = r), n[v]--;
            }return !!o;
          }, forEach: function forEach(e) {
            p(this, t);for (var n, o = s(e, arguments.length > 1 ? arguments[1] : void 0, 3); n = n ? n.n : this._f;) {
              for (o(n.v, n.k, this); n && n.r;) {
                n = n.p;
              }
            }
          }, has: function has(e) {
            return !!_(p(this, t), e);
          } }), f && o(d.prototype, "size", { get: function get() {
            return p(this, t)[v];
          } }), d;
      }, def: function def(e, t, n) {
        var o,
            i,
            r = _(e, t);return r ? r.v = n : (e._l = r = { i: i = h(t, !0), k: t, v: n, p: o = e._l, n: void 0, r: !1 }, e._f || (e._f = r), o && (o.n = r), e[v]++, "F" !== i && (e._i[i] = r)), e;
      }, getEntry: _, setStrong: function setStrong(e, t, n) {
        c(e, t, function (e, n) {
          this._t = p(e, t), this._k = n, this._l = void 0;
        }, function () {
          for (var e = this, t = e._k, n = e._l; n && n.r;) {
            n = n.p;
          }return e._t && (e._l = n = n ? n.n : e._t._f) ? "keys" == t ? d(0, n.k) : "values" == t ? d(0, n.v) : d(0, [n.k, n.v]) : (e._t = void 0, d(1));
        }, n ? "entries" : "values", !n, !0), l(t);
      } };
  }, function (e, t, n) {
    "use strict";
    var o = n(2),
        i = n(4),
        r = n(44),
        s = n(12),
        u = n(10),
        a = n(52),
        c = n(24),
        d = n(50),
        l = n(6),
        f = n(23),
        h = n(5).f,
        p = n(124)(0),
        v = n(7);e.exports = function (e, t, n, _, y, m) {
      var g = o[e],
          b = g,
          E = y ? "set" : "add",
          k = b && b.prototype,
          O = {};return v && "function" == typeof b && (m || k.forEach && !s(function () {
        new b().entries().next();
      })) ? (b = t(function (t, n) {
        d(t, b, e, "_c"), t._c = new g(), void 0 != n && c(n, y, t[E], t);
      }), p("add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON".split(","), function (e) {
        var t = "add" == e || "set" == e;e in k && (!m || "clear" != e) && u(b.prototype, e, function (n, o) {
          if (d(this, b, e), !t && m && !l(n)) return "get" == e && void 0;var i = this._c[e](0 === n ? 0 : n, o);return t ? this : i;
        });
      }), m || h(b.prototype, "size", { get: function get() {
          return this._c.size;
        } })) : (b = _.getConstructor(t, e, y, E), a(b.prototype, n), r.NEED = !0), f(b, e), O[e] = b, i(i.G + i.W + i.F, O), m || _.setStrong(b, e, y), b;
    };
  }, function (e, t, n) {
    var o = n(11),
        i = n(39),
        r = n(26),
        s = n(31),
        u = n(125);e.exports = function (e, t) {
      var n = 1 == e,
          a = 2 == e,
          c = 3 == e,
          d = 4 == e,
          l = 6 == e,
          f = 5 == e || l,
          h = t || u;return function (t, u, p) {
        for (var v, _, y = r(t), m = i(y), g = o(u, p, 3), b = s(m.length), E = 0, k = n ? h(t, b) : a ? h(t, 0) : void 0; b > E; E++) {
          if ((f || E in m) && (v = m[E], _ = g(v, E, y), e)) if (n) k[E] = _;else if (_) switch (e) {case 3:
              return !0;case 5:
              return v;case 6:
              return E;case 2:
              k.push(v);} else if (d) return !1;
        }return l ? -1 : c || d ? d : k;
      };
    };
  }, function (e, t, n) {
    var o = n(126);e.exports = function (e, t) {
      return new (o(e))(t);
    };
  }, function (e, t, n) {
    var o = n(6),
        i = n(64),
        r = n(3)("species");e.exports = function (e) {
      var t;return i(e) && (t = e.constructor, "function" != typeof t || t !== Array && !i(t.prototype) || (t = void 0), o(t) && null === (t = t[r]) && (t = void 0)), void 0 === t ? Array : t;
    };
  }, function (e, t, n) {
    var o = n(4);o(o.P + o.R, "Map", { toJSON: n(128)("Map") });
  }, function (e, t, n) {
    var o = n(49),
        i = n(129);e.exports = function (e) {
      return function () {
        if (o(this) != e) throw TypeError(e + "#toJSON isn't generic");return i(this);
      };
    };
  }, function (e, t, n) {
    var o = n(24);e.exports = function (e, t) {
      var n = [];return o(e, !1, n.push, n, t), n;
    };
  }, function (e, t, n) {
    n(131)("Map");
  }, function (e, t, n) {
    "use strict";
    var o = n(4);e.exports = function (e) {
      o(o.S, e, { of: function of() {
          for (var e = arguments.length, t = new Array(e); e--;) {
            t[e] = arguments[e];
          }return new this(t);
        } });
    };
  }, function (e, t, n) {
    n(133)("Map");
  }, function (e, t, n) {
    "use strict";
    var o = n(4),
        i = n(17),
        r = n(11),
        s = n(24);e.exports = function (e) {
      o(o.S, e, { from: function from(e) {
          var t,
              n,
              o,
              u,
              a = arguments[1];return i(this), t = void 0 !== a, t && i(a), void 0 == e ? new this() : (n = [], t ? (o = 0, u = r(a, arguments[2], 2), s(e, !1, function (e) {
            n.push(u(e, o++));
          })) : s(e, !1, n.push, n), new this(n));
        } });
    };
  }, function (e, t, n) {
    e.exports = { default: n(135), __esModule: !0 };
  }, function (e, t, n) {
    n(136), e.exports = n(1).Object.assign;
  }, function (e, t, n) {
    var o = n(4);o(o.S + o.F, "Object", { assign: n(137) });
  }, function (e, t, n) {
    "use strict";
    var o = n(21),
        i = n(46),
        r = n(29),
        s = n(26),
        u = n(39),
        a = _assign2.default;e.exports = !a || n(12)(function () {
      var e = {},
          t = {},
          n = (0, _symbol2.default)(),
          o = "abcdefghijklmnopqrst";return e[n] = 7, o.split("").forEach(function (e) {
        t[e] = e;
      }), 7 != a({}, e)[n] || (0, _keys2.default)(a({}, t)).join("") != o;
    }) ? function (e, t) {
      for (var n = s(e), a = arguments.length, c = 1, d = i.f, l = r.f; a > c;) {
        for (var f, h = u(arguments[c++]), p = d ? o(h).concat(d(h)) : o(h), v = p.length, _ = 0; v > _;) {
          l.call(h, f = p[_++]) && (n[f] = h[f]);
        }
      }return n;
    } : a;
  },,,,,,,,,,,,, function (e, t, n) {
    "use strict";
    function o(e) {
      return e && e.__esModule ? e : { default: e };
    }Object.defineProperty(t, "__esModule", { value: !0 }), t.obigoGadgetUI = t.ObigoRouter = t.Lockout = t.Events = t.appManager = t.Mixins = t.Utils = void 0;var i = n(151),
        r = o(i),
        s = n(82),
        u = function (e) {
      if (e && e.__esModule) return e;var t = {};if (null != e) for (var n in e) {
        Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
      }return t.default = e, t;
    }(s),
        a = n(58),
        c = o(a),
        d = n(157),
        l = o(d),
        f = n(8),
        h = o(f),
        p = n(159),
        v = o(p),
        _ = n(160),
        y = n(30),
        m = o(y),
        g = { version: "1.0.21", install: (0, r.default)(), theme: u },
        b = { version: "1.0.21", install: (0, r.default)("gadget"), theme: u };t.Utils = c.default, t.Mixins = l.default, t.appManager = m.default, t.Events = h.default, t.Lockout = _.install, t.ObigoRouter = v.default, t.obigoGadgetUI = b, window && !window.obigoUI && (window.obigoUI = g), t.default = g;
  }, function (e, t, n) {
    "use strict";
    function o(e) {
      return e && e.__esModule ? e : { default: e };
    }function i(e) {
      var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "core";e.directive("obg-focus", h.default), e.directive("tap", y.default), "core" === t && e.directive("obg-touch-swipe", v.default);
    }function r() {
      var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "core";return function (n) {
        if (this.installed) return void console.warn("Obigo-js-ui already installed in Vue.");t.Vue = g = n, (0, a.install)(n), (0, d.install)(n), (0, c.install)(n), (0, u.install)(n), i(n, e), (0, m.mouseEventPolyfill)(), n.prototype.$theme = s.current, n.prototype.$hardkey = (0, l.getHardkeyInstance)();
      };
    }Object.defineProperty(t, "__esModule", { value: !0 }), t.Vue = void 0, t.default = r;var s = n(82),
        u = n(80),
        a = n(8),
        c = n(152),
        d = n(153),
        l = n(53),
        f = n(154),
        h = o(f),
        p = n(155),
        v = o(p),
        _ = n(156),
        y = o(_),
        m = n(48),
        g = t.Vue = void 0;
  }, function (e, t, n) {
    "use strict";
    function o(e) {
      return e && e.__esModule ? e : { default: e };
    }function i(e) {
      new p();return h;
    }Object.defineProperty(t, "__esModule", { value: !0 });var r = n(14),
        s = o(r),
        u = n(15),
        a = o(u);t.install = i;var c = n(30),
        d = o(c),
        l = n(82),
        f = [{ name: "regular", rgb: "rgb(140,160,200)" }, { name: "basic", rgb: "rgb(0,120,240)" }, { name: "eco", rgb: "rgb(120,220,0)" }, { name: "sport", rgb: "rgb(255,0,0)" }, { name: "initiale", rgb: "rgb(150,0,255)" }, { name: "zen", rgb: "rgb(0,220,255)" }, { name: "race", rgb: "rgb(255,200,0)" }, { name: "mysense", rgb: "rgb(255,90,0)" }],
        h = void 0,
        p = function () {
      function e() {
        return (0, s.default)(this, e), h || (h = this, this.appManager = d.default, this.appManager && (this._currentMode = this._matchingColor(window.applicationFramework.util.getAmbientColor()), this._bind(), l.current.set(this._currentMode))), h;
      }return (0, a.default)(e, [{ key: "_matchingColor", value: function value(e) {
          var t = f.filter(function (t) {
            return t.rgb === e;
          });return 0 === t.length ? f[0].name : t[0] ? t[0].name : "basic";
        } }, { key: "_bind", value: function value() {
          var e = this;this.appManager.addEventListener("AmbientColorChanged", function (t) {
            e._currentMode = e._matchingColor(t.str), l.current.set(e._currentMode);
          });
        } }, { key: "get", value: function value() {
          return this._currentMode;
        } }]), e;
    }();
  }, function (e, t, n) {
    "use strict";
    function o(e, t) {
      e.prototype.$model = { name: c, wheelPosition: d, options: { list: t && t.list ? t.list : l.list } };
    }Object.defineProperty(t, "__esModule", { value: !0 }), t.install = o;var i = n(30),
        r = function (e) {
      return e && e.__esModule ? e : { default: e };
    }(i),
        s = { RENAULT7P: "renault7p", RENAULT9P: "renault9p", DACIA7P: "dacia7p", NISSAN9P: "nissan9p" },
        u = { RHD: "rhd", LHD: "lhd" },
        a = r.default ? window.applicationFramework.util : void 0,
        c = a && a.getDeviceModel ? a.getDeviceModel() : window.$model ? window.$model : s.RENAULT7P,
        d = a && a.getSteeringWheelPosition && 1 === a.getSteeringWheelPosition() ? u.RHD : u.LHD,
        l = { list: { listIndicator: c === s.NISSAN9P, hideDummyItem: c === s.NISSAN9P, scrollbars: c !== s.NISSAN9P, fadeScrollbars: c !== s.NISSAN9P, bounce: c !== s.NISSAN9P, preventBounce: c === s.NISSAN9P, enableJogUpDown: c === s.NISSAN9P } };
  }, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });var o = n(80);t.default = { inserted: function inserted(e, t, n) {
        var i = t.value,
            r = void 0 === i ? { scene: 0, zone: 2, skip: !1, subSection: !1, sectionDirection: "left", tabNumber: null } : i;r.skip || (r.subSection ? o.focusInstance._addSubSection(e, r.sectionDirection, n) : o.focusInstance._addComponent(e, r, n));
      }, componentUpdated: function componentUpdated(e, t) {
        var n = t.value;(void 0 === n ? { scene: 0, zone: 2, skip: !1 } : n).skip || e.disabled || e.classList.contains("disabled") || e.classList.contains("disable") || !o.focusInstance._componentFocusMode || o.focusInstance._componentControlMode || o.focusInstance._setComponentFocusOn();
      }, unbind: function unbind(e, t) {
        var n = t.value,
            i = void 0 === n ? { scene: 0, zone: 2, subSection: !1, sectionDirection: "left", tabNumber: null } : n;t.modifiers;i.skip || (i.subSection ? o.focusInstance._removeSubSection(e, i.sectionDirection) : o.focusInstance._removeComponent(e, i));
      } };
  }, function (e, t, n) {
    "use strict";
    function o(e) {
      return e && e.__esModule ? e : { default: e };
    }function i(e) {
      if (0 === (0, u.default)(e).length) return { left: !0, right: !0, up: !0, down: !0, horizontal: !0, vertical: !0 };var t = {};return ["left", "right", "up", "down", "horizontal", "vertical"].forEach(function (n) {
        e[n] && (t[n] = !0);
      }), t.horizontal && (t.left = t.right = !0), t.vertical && (t.up = t.down = !0), (t.left || t.right) && (t.horizontal = !0), (t.up || t.down) && (t.vertical = !0), t;
    }function r(e, t) {
      e.classList.add("obg-touch"), t.horizontal && !t.vertical ? (e.classList.add("obg-touch-y"), e.classList.remove("obg-touch-x")) : !t.horizontal && t.vertical && (e.classList.add("obg-touch-x"), e.classList.remove("obg-touch-y"));
    }Object.defineProperty(t, "__esModule", { value: !0 });var s = n(66),
        u = o(s),
        a = n(58),
        c = o(a),
        d = "ontouchstart" in window,
        l = d ? "touchstart" : "mousedown",
        f = d ? "touchmove" : "mousemove",
        h = d ? "touchend" : "mouseup";t.default = { bind: function bind(e, t) {
        var n = { handler: t.value, direction: i(t.modifiers), start: function start(e) {
            var t = c.default.event.position(e);n.event = { x: t.left, y: t.top, time: new Date().getTime(), detected: !1, prevent: n.direction.horizontal && n.direction.vertical }, document.addEventListener(f, n.move), document.addEventListener(h, n.end);
          }, move: function move(e) {
            var t = c.default.event.position(e),
                o = t.left - n.event.x,
                i = t.top - n.event.y;if (n.event.prevent) return void e.preventDefault();n.event.detected || (n.event.detected = !0, n.direction.horizontal && !n.direction.vertical ? Math.abs(o) > Math.abs(i) && (e.preventDefault(), n.event.prevent = !0) : Math.abs(o) < Math.abs(i) && (e.preventDefault(), n.event.prevent = !0));
          }, end: function end(e) {
            document.removeEventListener(f, n.move), document.removeEventListener(h, n.end);var t = void 0,
                o = c.default.event.position(e),
                i = o.left - n.event.x,
                r = o.top - n.event.y;0 === i && 0 === r || (t = Math.abs(i) >= Math.abs(r) ? i < 0 ? "left" : "right" : r < 0 ? "up" : "down", n.direction[t] && n.handler({ evt: e, direction: t, duration: new Date().getTime() - n.event.time, distance: { x: Math.abs(i), y: Math.abs(r) } }));
          } };c.default.store.add("touchswipe", e, n), r(e, n.direction), e.addEventListener(l, n.start);
      }, update: function update(e, t) {
        if (t.oldValue !== t.value) {
          c.default.store.get("touchswipe", e).handler = t.value;
        }
      }, unbind: function unbind(e, t) {
        var n = c.default.store.get("touchswipe", e);e.removeEventListener(l, n.start), e.removeEventListener(f, n.move), e.removeEventListener(h, n.end), c.default.store.remove("touchswipe", e);
      } };
  }, function (e, t, n) {
    "use strict";
    function o(e, t, n, o) {
      if (!e || !t) return !1;var i = o.getBoundingClientRect(),
          r = { startX: i.left, endX: i.left + i.width, startY: i.top, endY: i.top + i.height },
          s = Math.abs(e.pageX - t.pageX) <= n && Math.abs(e.pageY - t.pageY) <= n,
          u = r.startX < t.clientX && t.clientX < r.endX && r.startY < t.clientY && t.clientY < r.endY;return e.target === t.target && s && u;
    }function i(e, t) {
      var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
          o = document.createEvent("HTMLEvents");return o.initEvent(e, t, !0), (0, s.default)(o, n);
    }Object.defineProperty(t, "__esModule", { value: !0 });var r = n(134),
        s = function (e) {
      return e && e.__esModule ? e : { default: e };
    }(r),
        u = "ontouchstart" in window,
        a = u ? "touchstart" : "mousedown",
        c = u ? "touchmove" : "mousemove",
        d = u ? "touchend" : "mouseup";t.default = { bind: function bind(e, t) {
        function n(e) {}function r(t) {
          s();var n = t.changedTouches && t.changedTouches.length > 0 ? t.changedTouches[0] : t;if (o(h, n, y ? 9999 : 100, p)) {
            if (f.prevent && t.preventDefault(), f.stop && t.stopPropagation(), +new Date() - v <= 3e3 || m) {
              var r = i("tap", !f.capture, { e: t });_(r), e.dispatchEvent(r);
            }h = null, v = null;
          }
        }function s() {
          e.removeEventListener(c, n), e.removeEventListener(d, r);
        }var u = t.value,
            l = void 0 === u ? function () {} : u,
            f = t.modifiers,
            h = void 0,
            p = void 0,
            v = void 0,
            _ = "function" == typeof l ? l : l.cb,
            y = f.ignoreThreshold,
            m = f.ignoreDelay;e.addEventListener(a, function (t) {
          p = t.currentTarget, (h = t.touches ? 1 === t.touches.length ? t.touches[0] : null : t) && (v = +new Date(), e.addEventListener(c, n), e.addEventListener(d, r));
        });
      } };
  }, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });var o = n(158),
        i = function (e) {
      return e && e.__esModule ? e : { default: e };
    }(o);t.default = { page: i.default };
  }, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });var o = { methods: { setTitle: function setTitle(e) {
          if ("string" == typeof e) this._title = e;else if (this._title === this._appName) {
            var t = this._application.getDescriptor(),
                n = this._util.getLanguage(),
                o = t.getWidgetName(n);o ? (this._title = o, this._appName = o) : this._title = "(No title)";
          }try {
            var i = this.$t ? this.$t(this._title) : this._title;this._application.setStatusBarTitle(i);
          } catch (e) {
            console.log(e.message);
          }
        } }, mounted: function mounted() {
        if (window.applicationFramework) {
          this._application = window.applicationFramework.applicationManager.getOwnerApplication(window.document), this._util = window.applicationFramework.util, this._application.addEventListener("ApplicationShown", this.setTitle, !1), this._title = "";var e = this._application.getDescriptor(),
              t = this._util.getLanguage(),
              n = e.getWidgetName(t);n ? (this._title = n, this._appName = n) : this._title = "(No title)";
        }if (this.$focus._componentFocusMode && this.autoFocus) {
          var o = this.$focus.loadLastFocusPosition(this.scene);this.$focus.setScene(this.scene), o && 3 === o.zone ? (this.$focus._currentZone = 3, this.$focus._currentOrder = o.order, this.$focus._setZoneFocusOn(3), this.$focus._setComponentFocusOn()) : this.$focus.startFocusMode();
        }
      }, activated: function activated() {
        if (this.$focus._componentFocusMode && this.autoFocus) {
          var e = this.$focus.loadLastFocusPosition(this.scene);this.$focus.setScene(this.scene), e && 3 === e.zone ? (this.$focus._currentZone = 3, this.$focus._currentOrder = e.order, this.$focus._setZoneFocusOn(3), this.$focus._setComponentFocusOn()) : this.$focus.startFocusMode();
        }
      }, beforeDestroy: function beforeDestroy() {
        window.applicationFramework && this._application.removeEventListener("ApplicationShown", this.setTitle, !1), this.$focus.storeLastFocusPosition(this.scene, this.$focus.getCurrentPosition());
      }, deactivated: function deactivated() {
        this.$focus.storeLastFocusPosition(this.scene, this.$focus.getCurrentPosition());
      }, data: function data() {
        return { scene: 0, _lastFocusOrder: -1, autoFocus: !0 };
      }, watch: { scene: function scene(e, t) {
          this.$focus.setScene(e);
        } } };t.default = o;
  }, function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 }), t.default = function (e) {
      return e.isBack = !1, e._go = e.go, e._push = e.push, e.go = function (t) {
        e._go(t), t < 0 && (e.isBack = !0);
      }, e.push = function (t, n, o) {
        e._push(t, n, o), e.isBack = !1;
      }, e;
    };
  }, function (e, t, n) {
    "use strict";
    function o(e) {
      return e && e.__esModule ? e : { default: e };
    }function i(e) {
      var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { toastContent: "" };return m._bind(), t && t.toastContent && "" !== t.toastContent && m.setToastContent(t.toastContent), e.prototype.$lockout = m, m;
    }Object.defineProperty(t, "__esModule", { value: !0 }), t.lockoutInstance = void 0;var r = n(81),
        s = o(r),
        u = n(14),
        a = o(u),
        c = n(15),
        d = o(c);t.install = i;var l = n(30),
        f = o(l),
        h = { NO_POPUP: 0, TOAST_POPUP: 1, CENTER_POPUP: 2 },
        p = { NOT_DRIVING: 0, DRIVING: 1 },
        v = { GADGET: "gadget", WIDGET: "widget" },
        _ = "/",
        y = function () {
      function e() {
        (0, a.default)(this, e), this.appManager = f.default, this._pathMap = new s.default(), this._appType = "", this._binded = !1, this._currentPath = _, this._lockoutStatus = "NONE", this._toastContent = "Not available while driving", this._addEvent = this._addEvent.bind(this), this._addElement = this._addElement.bind(this), this._removeElement = this._removeElement.bind(this), this._onChangedLockoutStatus = this._onChangedLockoutStatus.bind(this), this._setLockout = this._setLockout.bind(this), this.setToastContent = this.setToastContent.bind(this), this.getDrivingFlag = this.getDrivingFlag.bind(this), this.getPathCollection = this.getPathCollection.bind(this);
      }return (0, d.default)(e, [{ key: "_bind", value: function value() {
          this._binded || (this._binded = !0, this.appManager && (this._appType = 2 === this.appManager.type ? v.GADGET : v.WIDGET, this._lockoutStatus = this.appManager.getLockoutStatus()));
        } }, { key: "_addEvent", value: function value() {
          this.appManager && this.appManager.addEventListener("ChangedLockoutStatus", this._onChangedLockoutStatus);
        } }, { key: "_addElement", value: function value(t, n, o) {
          var i = this,
              r = { element: t, condition: n.modifiers, originStyle: void 0 },
              s = this.getDrivingFlag(),
              u = this.getPathCollection();u.push(r), this._pathMap.set(this._currentPath, u);var a = function a(e) {
            i.getDrivingFlag() && r.condition.disable && (e.preventDefault(), e.stopPropagation(), i.appManager.requestPopup(h.TOAST_POPUP, "", i._toastContent, []));
          };r.element.addEventListener("click", a, !0), e.applyLockoutMode(r, s);
        } }, { key: "_removeElement", value: function value(e, t) {
          var n = this.getPathCollection();n = n.filter(function (t) {
            var n = t.element;return !!n && !e.isEqualNode(n);
          }), this._pathMap.set(this._currentPath, n);
        } }, { key: "_onChangedLockoutStatus", value: function value(t) {
          this._lockoutStatus = t;var n = this.getDrivingFlag();this.getPathCollection().forEach(function (t, o) {
            t.element && e.applyLockoutMode(t, n);
          });
        } }, { key: "_setLockout", value: function value() {
          var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
              t = document.querySelector("#obg-lockout"),
              n = null !== t && void 0 !== t,
              o = this;if (e && !n) {
            var i = document.createElement("div");i.setAttribute("id", "obg-lockout"), i.classList.add("lockout-cover"), i.addEventListener("click", function (e) {
              e.preventDefault(), e.stopPropagation();o.appManager.requestPopup(h.TOAST_POPUP, "", o._toastContent, []);
            });var r = document.createElement("i");r.classList.add("obg-icon-drive-restriction"), i.append(r), document.body.append(i);
          } else !e && n && t.remove();
        } }, { key: "getPathCollection", value: function value() {
          var e = this._currentPath;return this._pathMap.has(e) || this._pathMap.set(e, []), this._pathMap.get(e);
        } }, { key: "getDrivingFlag", value: function value() {
          var e = !1;switch (this._lockoutStatus) {case p.DRIVING:
              e = !0;break;case p.NOT_DRIVING:
              e = !1;}return e;
        } }, { key: "setToastContent", value: function value(e) {
          e && "string" == typeof e && "" !== e && (this._toastContent = e);
        } }, { key: "show", value: function value() {
          this._setLockout(!0);
        } }, { key: "hide", value: function value() {
          this._setLockout();
        } }], [{ key: "applyLockoutMode", value: function value(t, n) {
          var o = t.condition;o.disable ? e.setDisable(t, n) : o.invisible && e.setInvisible(t, n);
        } }, { key: "setDisable", value: function value(t) {
          var n = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];e.setStyleByEnable(t, "opacity: 0.5", n);
        } }, { key: "setInvisible", value: function value(t) {
          var n = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];e.setStyleByEnable(t, "display: none", n);
        } }, { key: "setStyleByEnable", value: function value(e, t, n) {
          if (!e.element) return void console.warn("Lockout.setStyleByEnable element undefined", e.element);var o = void 0 !== e.originStyle;if (n) {
            var i = e.element,
                r = i.getAttribute("style") || "";o || (e.originStyle = i.getAttribute("style") || ""), r === e.originStyle && e.element.setAttribute("style", e.originStyle + ";" + t);
          } else !n && o && (e.element.setAttribute("style", e.originStyle), e.originStyle = void 0);
        } }]), e;
    }();t.default = y;var m = t.lockoutInstance = new y();
  }]);
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(131)(module)))

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// ECMAScript 6 symbols shim
var global = __webpack_require__(7);
var has = __webpack_require__(15);
var DESCRIPTORS = __webpack_require__(6);
var $export = __webpack_require__(3);
var redefine = __webpack_require__(63);
var META = __webpack_require__(29).KEY;
var $fails = __webpack_require__(14);
var shared = __webpack_require__(42);
var setToStringTag = __webpack_require__(28);
var uid = __webpack_require__(27);
var wks = __webpack_require__(4);
var wksExt = __webpack_require__(48);
var wksDefine = __webpack_require__(49);
var enumKeys = __webpack_require__(133);
var isArray = __webpack_require__(78);
var anObject = __webpack_require__(18);
var isObject = __webpack_require__(8);
var toIObject = __webpack_require__(16);
var toPrimitive = __webpack_require__(38);
var createDesc = __webpack_require__(21);
var _create = __webpack_require__(25);
var gOPNExt = __webpack_require__(79);
var $GOPD = __webpack_require__(81);
var $DP = __webpack_require__(5);
var $keys = __webpack_require__(23);
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  __webpack_require__(80).f = gOPNExt.f = $getOwnPropertyNames;
  __webpack_require__(30).f = $propertyIsEnumerable;
  __webpack_require__(50).f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !__webpack_require__(24)) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(12)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
var cof = __webpack_require__(40);
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = __webpack_require__(16);
var gOPN = __webpack_require__(80).f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = __webpack_require__(65);
var hiddenKeys = __webpack_require__(43).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

var pIE = __webpack_require__(30);
var createDesc = __webpack_require__(21);
var toIObject = __webpack_require__(16);
var toPrimitive = __webpack_require__(38);
var has = __webpack_require__(15);
var IE8_DOM_DEFINE = __webpack_require__(61);
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__(6) ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};


/***/ }),
/* 82 */
/***/ (function(module, exports) {



/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(165), __esModule: true };

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(167), __esModule: true };

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _iterator = __webpack_require__(169);

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = __webpack_require__(47);

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(171);
var global = __webpack_require__(7);
var hide = __webpack_require__(12);
var Iterators = __webpack_require__(22);
var TO_STRING_TAG = __webpack_require__(4)('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}


/***/ }),
/* 87 */
/***/ (function(module, exports) {

module.exports = function (done, value) {
  return { value: value, done: !!done };
};


/***/ }),
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

var hide = __webpack_require__(12);
module.exports = function (target, src, safe) {
  for (var key in src) {
    if (safe && target[key]) target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};


/***/ }),
/* 93 */
/***/ (function(module, exports) {

module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(8);
module.exports = function (it, TYPE) {
  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
function getAppManager() {
  if (window.applicationFramework) {
    return window.applicationFramework.applicationManager.getOwnerApplication(window.document);
  }
}

exports.default = getAppManager();

/***/ }),
/* 96 */,
/* 97 */,
/* 98 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 99 */,
/* 100 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/*!
 * vue-i18n v7.8.1 
 * (c) 2018 kazuya kawaguchi
 * Released under the MIT License.
 */
/*  */

/**
 * utilites
 */

function warn (msg, err) {
  if (typeof console !== 'undefined') {
    console.warn('[vue-i18n] ' + msg);
    /* istanbul ignore if */
    if (err) {
      console.warn(err.stack);
    }
  }
}

function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';
function isPlainObject (obj) {
  return toString.call(obj) === OBJECT_STRING
}

function isNull (val) {
  return val === null || val === undefined
}

function parseArgs () {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var locale = null;
  var params = null;
  if (args.length === 1) {
    if (isObject(args[0]) || Array.isArray(args[0])) {
      params = args[0];
    } else if (typeof args[0] === 'string') {
      locale = args[0];
    }
  } else if (args.length === 2) {
    if (typeof args[0] === 'string') {
      locale = args[0];
    }
    /* istanbul ignore if */
    if (isObject(args[1]) || Array.isArray(args[1])) {
      params = args[1];
    }
  }

  return { locale: locale, params: params }
}

function getOldChoiceIndexFixed (choice) {
  return choice
    ? choice > 1
      ? 1
      : 0
    : 1
}

function getChoiceIndex (choice, choicesLength) {
  choice = Math.abs(choice);

  if (choicesLength === 2) { return getOldChoiceIndexFixed(choice) }

  return choice ? Math.min(choice, 2) : 0
}

function fetchChoice (message, choice) {
  /* istanbul ignore if */
  if (!message && typeof message !== 'string') { return null }
  var choices = message.split('|');

  choice = getChoiceIndex(choice, choices.length);
  if (!choices[choice]) { return message }
  return choices[choice].trim()
}

function looseClone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

function remove (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

function merge (target) {
  var arguments$1 = arguments;

  var output = Object(target);
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments$1[i];
    if (source !== undefined && source !== null) {
      var key = (void 0);
      for (key in source) {
        if (hasOwn(source, key)) {
          if (isObject(source[key])) {
            output[key] = merge(output[key], source[key]);
          } else {
            output[key] = source[key];
          }
        }
      }
    }
  }
  return output
}

function looseEqual (a, b) {
  if (a === b) { return true }
  var isObjectA = isObject(a);
  var isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    try {
      var isArrayA = Array.isArray(a);
      var isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every(function (e, i) {
          return looseEqual(e, b[i])
        })
      } else if (!isArrayA && !isArrayB) {
        var keysA = Object.keys(a);
        var keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(function (key) {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

var canUseDateTimeFormat =
  typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat !== 'undefined';

var canUseNumberFormat =
  typeof Intl !== 'undefined' && typeof Intl.NumberFormat !== 'undefined';

/*  */

function extend (Vue) {
  // $FlowFixMe
  Object.defineProperty(Vue.prototype, '$t', {
    get: function get () {
      var this$1 = this;

      return function (key) {
        var values = [], len = arguments.length - 1;
        while ( len-- > 0 ) values[ len ] = arguments[ len + 1 ];

        var i18n = this$1.$i18n;
        return i18n._t.apply(i18n, [ key, i18n.locale, i18n._getMessages(), this$1 ].concat( values ))
      }
    }
  });
  // $FlowFixMe
  Object.defineProperty(Vue.prototype, '$tc', {
    get: function get () {
      var this$1 = this;

      return function (key, choice) {
        var values = [], len = arguments.length - 2;
        while ( len-- > 0 ) values[ len ] = arguments[ len + 2 ];

        var i18n = this$1.$i18n;
        return i18n._tc.apply(i18n, [ key, i18n.locale, i18n._getMessages(), this$1, choice ].concat( values ))
      }
    }
  });
  // $FlowFixMe
  Object.defineProperty(Vue.prototype, '$te', {
    get: function get () {
      var this$1 = this;

      return function (key, locale) {
        var i18n = this$1.$i18n;
        return i18n._te(key, i18n.locale, i18n._getMessages(), locale)
      }
    }
  });
  // $FlowFixMe
  Object.defineProperty(Vue.prototype, '$d', {
    get: function get () {
      var this$1 = this;

      return function (value) {
        var ref;

        var args = [], len = arguments.length - 1;
        while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
        return (ref = this$1.$i18n).d.apply(ref, [ value ].concat( args ))
      }
    }
  });
  // $FlowFixMe
  Object.defineProperty(Vue.prototype, '$n', {
    get: function get () {
      var this$1 = this;

      return function (value) {
        var ref;

        var args = [], len = arguments.length - 1;
        while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
        return (ref = this$1.$i18n).n.apply(ref, [ value ].concat( args ))
      }
    }
  });
}

/*  */

var mixin = {
  beforeCreate: function beforeCreate () {
    var options = this.$options;
    options.i18n = options.i18n || (options.__i18n ? {} : null);

    if (options.i18n) {
      if (options.i18n instanceof VueI18n) {
        // init locale messages via custom blocks
        if (options.__i18n) {
          try {
            var localeMessages = {};
            options.__i18n.forEach(function (resource) {
              localeMessages = merge(localeMessages, JSON.parse(resource));
            });
            Object.keys(localeMessages).forEach(function (locale) {
              options.i18n.mergeLocaleMessage(locale, localeMessages[locale]);
            });
          } catch (e) {
            if (true) {
              warn("Cannot parse locale messages via custom blocks.", e);
            }
          }
        }
        this._i18n = options.i18n;
        this._i18nWatcher = this._i18n.watchI18nData();
        this._i18n.subscribeDataChanging(this);
        this._subscribing = true;
      } else if (isPlainObject(options.i18n)) {
        // component local i18n
        if (this.$root && this.$root.$i18n && this.$root.$i18n instanceof VueI18n) {
          options.i18n.root = this.$root.$i18n;
          options.i18n.formatter = this.$root.$i18n.formatter;
          options.i18n.fallbackLocale = this.$root.$i18n.fallbackLocale;
          options.i18n.silentTranslationWarn = this.$root.$i18n.silentTranslationWarn;
        }

        // init locale messages via custom blocks
        if (options.__i18n) {
          try {
            var localeMessages$1 = {};
            options.__i18n.forEach(function (resource) {
              localeMessages$1 = merge(localeMessages$1, JSON.parse(resource));
            });
            options.i18n.messages = localeMessages$1;
          } catch (e) {
            if (true) {
              warn("Cannot parse locale messages via custom blocks.", e);
            }
          }
        }

        this._i18n = new VueI18n(options.i18n);
        this._i18nWatcher = this._i18n.watchI18nData();
        this._i18n.subscribeDataChanging(this);
        this._subscribing = true;

        if (options.i18n.sync === undefined || !!options.i18n.sync) {
          this._localeWatcher = this.$i18n.watchLocale();
        }
      } else {
        if (true) {
          warn("Cannot be interpreted 'i18n' option.");
        }
      }
    } else if (this.$root && this.$root.$i18n && this.$root.$i18n instanceof VueI18n) {
      // root i18n
      this._i18n = this.$root.$i18n;
      this._i18n.subscribeDataChanging(this);
      this._subscribing = true;
    } else if (options.parent && options.parent.$i18n && options.parent.$i18n instanceof VueI18n) {
      // parent i18n
      this._i18n = options.parent.$i18n;
      this._i18n.subscribeDataChanging(this);
      this._subscribing = true;
    }
  },

  beforeDestroy: function beforeDestroy () {
    if (!this._i18n) { return }

    if (this._subscribing) {
      this._i18n.unsubscribeDataChanging(this);
      delete this._subscribing;
    }

    if (this._i18nWatcher) {
      this._i18nWatcher();
      delete this._i18nWatcher;
    }

    if (this._localeWatcher) {
      this._localeWatcher();
      delete this._localeWatcher;
    }

    this._i18n = null;
  }
}

/*  */

var component = {
  name: 'i18n',
  functional: true,
  props: {
    tag: {
      type: String,
      default: 'span'
    },
    path: {
      type: String,
      required: true
    },
    locale: {
      type: String
    },
    places: {
      type: [Array, Object]
    }
  },
  render: function render (h, ref) {
    var props = ref.props;
    var data = ref.data;
    var children = ref.children;
    var parent = ref.parent;

    var i18n = parent.$i18n;

    children = (children || []).filter(function (child) {
      return child.tag || (child.text = child.text.trim())
    });

    if (!i18n) {
      if (true) {
        warn('Cannot find VueI18n instance!');
      }
      return children
    }

    var path = props.path;
    var locale = props.locale;

    var params = {};
    var places = props.places || {};

    var hasPlaces = Array.isArray(places)
      ? places.length > 0
      : Object.keys(places).length > 0;

    var everyPlace = children.every(function (child) {
      if (child.data && child.data.attrs) {
        var place = child.data.attrs.place;
        return (typeof place !== 'undefined') && place !== ''
      }
    });

    if (hasPlaces && children.length > 0 && !everyPlace) {
      warn('If places prop is set, all child elements must have place prop set.');
    }

    if (Array.isArray(places)) {
      places.forEach(function (el, i) {
        params[i] = el;
      });
    } else {
      Object.keys(places).forEach(function (key) {
        params[key] = places[key];
      });
    }

    children.forEach(function (child, i) {
      var key = everyPlace
        ? ("" + (child.data.attrs.place))
        : ("" + i);
      params[key] = child;
    });

    return h(props.tag, data, i18n.i(path, locale, params))
  }
}

/*  */

function bind (el, binding, vnode) {
  if (!assert(el, vnode)) { return }

  t(el, binding, vnode);
}

function update (el, binding, vnode, oldVNode) {
  if (!assert(el, vnode)) { return }

  if (localeEqual(el, vnode) && looseEqual(binding.value, binding.oldValue)) { return }

  t(el, binding, vnode);
}

function unbind (el, binding, vnode, oldVNode) {
  if (!assert(el, vnode)) { return }

  el.textContent = '';
  el._vt = undefined;
  delete el['_vt'];
  el._locale = undefined;
  delete el['_locale'];
}

function assert (el, vnode) {
  var vm = vnode.context;
  if (!vm) {
    warn('not exist Vue instance in VNode context');
    return false
  }

  if (!vm.$i18n) {
    warn('not exist VueI18n instance in Vue instance');
    return false
  }

  return true
}

function localeEqual (el, vnode) {
  var vm = vnode.context;
  return el._locale === vm.$i18n.locale
}

function t (el, binding, vnode) {
  var ref$1, ref$2;

  var value = binding.value;

  var ref = parseValue(value);
  var path = ref.path;
  var locale = ref.locale;
  var args = ref.args;
  var choice = ref.choice;
  if (!path && !locale && !args) {
    warn('not support value type');
    return
  }

  if (!path) {
    warn('required `path` in v-t directive');
    return
  }

  var vm = vnode.context;
  if (choice) {
    el._vt = el.textContent = (ref$1 = vm.$i18n).tc.apply(ref$1, [ path, choice ].concat( makeParams(locale, args) ));
  } else {
    el._vt = el.textContent = (ref$2 = vm.$i18n).t.apply(ref$2, [ path ].concat( makeParams(locale, args) ));
  }
  el._locale = vm.$i18n.locale;
}

function parseValue (value) {
  var path;
  var locale;
  var args;
  var choice;

  if (typeof value === 'string') {
    path = value;
  } else if (isPlainObject(value)) {
    path = value.path;
    locale = value.locale;
    args = value.args;
    choice = value.choice;
  }

  return { path: path, locale: locale, args: args, choice: choice }
}

function makeParams (locale, args) {
  var params = [];

  locale && params.push(locale);
  if (args && (Array.isArray(args) || isPlainObject(args))) {
    params.push(args);
  }

  return params
}

var Vue;

function install (_Vue) {
  Vue = _Vue;

  var version = (Vue.version && Number(Vue.version.split('.')[0])) || -1;
  /* istanbul ignore if */
  if ("development" !== 'production' && install.installed) {
    warn('already installed.');
    return
  }
  install.installed = true;

  /* istanbul ignore if */
  if ("development" !== 'production' && version < 2) {
    warn(("vue-i18n (" + (install.version) + ") need to use Vue 2.0 or later (Vue: " + (Vue.version) + ")."));
    return
  }

  Object.defineProperty(Vue.prototype, '$i18n', {
    get: function get () { return this._i18n }
  });

  extend(Vue);
  Vue.mixin(mixin);
  Vue.directive('t', { bind: bind, update: update, unbind: unbind });
  Vue.component(component.name, component);

  // use object-based merge strategy
  var strats = Vue.config.optionMergeStrategies;
  strats.i18n = strats.methods;
}

/*  */

var BaseFormatter = function BaseFormatter () {
  this._caches = Object.create(null);
};

BaseFormatter.prototype.interpolate = function interpolate (message, values) {
  if (!values) {
    return [message]
  }
  var tokens = this._caches[message];
  if (!tokens) {
    tokens = parse(message);
    this._caches[message] = tokens;
  }
  return compile(tokens, values)
};



var RE_TOKEN_LIST_VALUE = /^(\d)+/;
var RE_TOKEN_NAMED_VALUE = /^(\w)+/;

function parse (format) {
  var tokens = [];
  var position = 0;

  var text = '';
  while (position < format.length) {
    var char = format[position++];
    if (char === '{') {
      if (text) {
        tokens.push({ type: 'text', value: text });
      }

      text = '';
      var sub = '';
      char = format[position++];
      while (char !== '}') {
        sub += char;
        char = format[position++];
      }

      var type = RE_TOKEN_LIST_VALUE.test(sub)
        ? 'list'
        : RE_TOKEN_NAMED_VALUE.test(sub)
          ? 'named'
          : 'unknown';
      tokens.push({ value: sub, type: type });
    } else if (char === '%') {
      // when found rails i18n syntax, skip text capture
      if (format[(position)] !== '{') {
        text += char;
      }
    } else {
      text += char;
    }
  }

  text && tokens.push({ type: 'text', value: text });

  return tokens
}

function compile (tokens, values) {
  var compiled = [];
  var index = 0;

  var mode = Array.isArray(values)
    ? 'list'
    : isObject(values)
      ? 'named'
      : 'unknown';
  if (mode === 'unknown') { return compiled }

  while (index < tokens.length) {
    var token = tokens[index];
    switch (token.type) {
      case 'text':
        compiled.push(token.value);
        break
      case 'list':
        compiled.push(values[parseInt(token.value, 10)]);
        break
      case 'named':
        if (mode === 'named') {
          compiled.push((values)[token.value]);
        } else {
          if (true) {
            warn(("Type of token '" + (token.type) + "' and format of value '" + mode + "' don't match!"));
          }
        }
        break
      case 'unknown':
        if (true) {
          warn("Detect 'unknown' type of token!");
        }
        break
    }
    index++;
  }

  return compiled
}

/*  */

/**
 *  Path paerser
 *  - Inspired:
 *    Vue.js Path parser
 */

// actions
var APPEND = 0;
var PUSH = 1;
var INC_SUB_PATH_DEPTH = 2;
var PUSH_SUB_PATH = 3;

// states
var BEFORE_PATH = 0;
var IN_PATH = 1;
var BEFORE_IDENT = 2;
var IN_IDENT = 3;
var IN_SUB_PATH = 4;
var IN_SINGLE_QUOTE = 5;
var IN_DOUBLE_QUOTE = 6;
var AFTER_PATH = 7;
var ERROR = 8;

var pathStateMachine = [];

pathStateMachine[BEFORE_PATH] = {
  'ws': [BEFORE_PATH],
  'ident': [IN_IDENT, APPEND],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[IN_PATH] = {
  'ws': [IN_PATH],
  '.': [BEFORE_IDENT],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[BEFORE_IDENT] = {
  'ws': [BEFORE_IDENT],
  'ident': [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  'number': [IN_IDENT, APPEND]
};

pathStateMachine[IN_IDENT] = {
  'ident': [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  'number': [IN_IDENT, APPEND],
  'ws': [IN_PATH, PUSH],
  '.': [BEFORE_IDENT, PUSH],
  '[': [IN_SUB_PATH, PUSH],
  'eof': [AFTER_PATH, PUSH]
};

pathStateMachine[IN_SUB_PATH] = {
  "'": [IN_SINGLE_QUOTE, APPEND],
  '"': [IN_DOUBLE_QUOTE, APPEND],
  '[': [IN_SUB_PATH, INC_SUB_PATH_DEPTH],
  ']': [IN_PATH, PUSH_SUB_PATH],
  'eof': ERROR,
  'else': [IN_SUB_PATH, APPEND]
};

pathStateMachine[IN_SINGLE_QUOTE] = {
  "'": [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_SINGLE_QUOTE, APPEND]
};

pathStateMachine[IN_DOUBLE_QUOTE] = {
  '"': [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_DOUBLE_QUOTE, APPEND]
};

/**
 * Check if an expression is a literal value.
 */

var literalValueRE = /^\s?(true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;
function isLiteral (exp) {
  return literalValueRE.test(exp)
}

/**
 * Strip quotes from a string
 */

function stripQuotes (str) {
  var a = str.charCodeAt(0);
  var b = str.charCodeAt(str.length - 1);
  return a === b && (a === 0x22 || a === 0x27)
    ? str.slice(1, -1)
    : str
}

/**
 * Determine the type of a character in a keypath.
 */

function getPathCharType (ch) {
  if (ch === undefined || ch === null) { return 'eof' }

  var code = ch.charCodeAt(0);

  switch (code) {
    case 0x5B: // [
    case 0x5D: // ]
    case 0x2E: // .
    case 0x22: // "
    case 0x27: // '
    case 0x30: // 0
      return ch

    case 0x5F: // _
    case 0x24: // $
    case 0x2D: // -
      return 'ident'

    case 0x20: // Space
    case 0x09: // Tab
    case 0x0A: // Newline
    case 0x0D: // Return
    case 0xA0:  // No-break space
    case 0xFEFF:  // Byte Order Mark
    case 0x2028:  // Line Separator
    case 0x2029:  // Paragraph Separator
      return 'ws'
  }

  // a-z, A-Z
  if ((code >= 0x61 && code <= 0x7A) || (code >= 0x41 && code <= 0x5A)) {
    return 'ident'
  }

  // 1-9
  if (code >= 0x31 && code <= 0x39) { return 'number' }

  return 'else'
}

/**
 * Format a subPath, return its plain form if it is
 * a literal string or number. Otherwise prepend the
 * dynamic indicator (*).
 */

function formatSubPath (path) {
  var trimmed = path.trim();
  // invalid leading 0
  if (path.charAt(0) === '0' && isNaN(path)) { return false }

  return isLiteral(trimmed) ? stripQuotes(trimmed) : '*' + trimmed
}

/**
 * Parse a string path into an array of segments
 */

function parse$1 (path) {
  var keys = [];
  var index = -1;
  var mode = BEFORE_PATH;
  var subPathDepth = 0;
  var c;
  var key;
  var newChar;
  var type;
  var transition;
  var action;
  var typeMap;
  var actions = [];

  actions[PUSH] = function () {
    if (key !== undefined) {
      keys.push(key);
      key = undefined;
    }
  };

  actions[APPEND] = function () {
    if (key === undefined) {
      key = newChar;
    } else {
      key += newChar;
    }
  };

  actions[INC_SUB_PATH_DEPTH] = function () {
    actions[APPEND]();
    subPathDepth++;
  };

  actions[PUSH_SUB_PATH] = function () {
    if (subPathDepth > 0) {
      subPathDepth--;
      mode = IN_SUB_PATH;
      actions[APPEND]();
    } else {
      subPathDepth = 0;
      key = formatSubPath(key);
      if (key === false) {
        return false
      } else {
        actions[PUSH]();
      }
    }
  };

  function maybeUnescapeQuote () {
    var nextChar = path[index + 1];
    if ((mode === IN_SINGLE_QUOTE && nextChar === "'") ||
      (mode === IN_DOUBLE_QUOTE && nextChar === '"')) {
      index++;
      newChar = '\\' + nextChar;
      actions[APPEND]();
      return true
    }
  }

  while (mode !== null) {
    index++;
    c = path[index];

    if (c === '\\' && maybeUnescapeQuote()) {
      continue
    }

    type = getPathCharType(c);
    typeMap = pathStateMachine[mode];
    transition = typeMap[type] || typeMap['else'] || ERROR;

    if (transition === ERROR) {
      return // parse error
    }

    mode = transition[0];
    action = actions[transition[1]];
    if (action) {
      newChar = transition[2];
      newChar = newChar === undefined
        ? c
        : newChar;
      if (action() === false) {
        return
      }
    }

    if (mode === AFTER_PATH) {
      return keys
    }
  }
}





function empty (target) {
  /* istanbul ignore else */
  if (Array.isArray(target)) {
    return target.length === 0
  } else {
    return false
  }
}

var I18nPath = function I18nPath () {
  this._cache = Object.create(null);
};

/**
 * External parse that check for a cache hit first
 */
I18nPath.prototype.parsePath = function parsePath (path) {
  var hit = this._cache[path];
  if (!hit) {
    hit = parse$1(path);
    if (hit) {
      this._cache[path] = hit;
    }
  }
  return hit || []
};

/**
 * Get path value from path string
 */
I18nPath.prototype.getPathValue = function getPathValue (obj, path) {
  if (!isObject(obj)) { return null }

  var paths = this.parsePath(path);
  if (empty(paths)) {
    return null
  } else {
    var length = paths.length;
    var ret = null;
    var last = obj;
    var i = 0;
    while (i < length) {
      var value = last[paths[i]];
      if (value === undefined) {
        last = null;
        break
      }
      last = value;
      i++;
    }

    ret = last;
    return ret
  }
};

/*  */



var numberFormatKeys = [
  'style',
  'currency',
  'currencyDisplay',
  'useGrouping',
  'minimumIntegerDigits',
  'minimumFractionDigits',
  'maximumFractionDigits',
  'minimumSignificantDigits',
  'maximumSignificantDigits',
  'localeMatcher',
  'formatMatcher'
];

var VueI18n = function VueI18n (options) {
  var this$1 = this;
  if ( options === void 0 ) options = {};

  // Auto install if it is not done yet and `window` has `Vue`.
  // To allow users to avoid auto-installation in some cases,
  // this code should be placed here. See #290
  /* istanbul ignore if */
  if (!Vue && typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
  }

  var locale = options.locale || 'en-US';
  var fallbackLocale = options.fallbackLocale || 'en-US';
  var messages = options.messages || {};
  var dateTimeFormats = options.dateTimeFormats || {};
  var numberFormats = options.numberFormats || {};

  this._vm = null;
  this._formatter = options.formatter || new BaseFormatter();
  this._missing = options.missing || null;
  this._root = options.root || null;
  this._sync = options.sync === undefined ? true : !!options.sync;
  this._fallbackRoot = options.fallbackRoot === undefined
    ? true
    : !!options.fallbackRoot;
  this._silentTranslationWarn = options.silentTranslationWarn === undefined
    ? false
    : !!options.silentTranslationWarn;
  this._dateTimeFormatters = {};
  this._numberFormatters = {};
  this._path = new I18nPath();
  this._dataListeners = [];

  this._exist = function (message, key) {
    if (!message || !key) { return false }
    return !isNull(this$1._path.getPathValue(message, key))
  };

  this._initVM({
    locale: locale,
    fallbackLocale: fallbackLocale,
    messages: messages,
    dateTimeFormats: dateTimeFormats,
    numberFormats: numberFormats
  });
};

var prototypeAccessors = { vm: { configurable: true },messages: { configurable: true },dateTimeFormats: { configurable: true },numberFormats: { configurable: true },locale: { configurable: true },fallbackLocale: { configurable: true },missing: { configurable: true },formatter: { configurable: true },silentTranslationWarn: { configurable: true } };

VueI18n.prototype._initVM = function _initVM (data) {
  var silent = Vue.config.silent;
  Vue.config.silent = true;
  this._vm = new Vue({ data: data });
  Vue.config.silent = silent;
};

VueI18n.prototype.subscribeDataChanging = function subscribeDataChanging (vm) {
  this._dataListeners.push(vm);
};

VueI18n.prototype.unsubscribeDataChanging = function unsubscribeDataChanging (vm) {
  remove(this._dataListeners, vm);
};

VueI18n.prototype.watchI18nData = function watchI18nData () {
  var self = this;
  return this._vm.$watch('$data', function () {
    var i = self._dataListeners.length;
    while (i--) {
      Vue.nextTick(function () {
        self._dataListeners[i] && self._dataListeners[i].$forceUpdate();
      });
    }
  }, { deep: true })
};

VueI18n.prototype.watchLocale = function watchLocale () {
  /* istanbul ignore if */
  if (!this._sync || !this._root) { return null }
  var target = this._vm;
  return this._root.vm.$watch('locale', function (val) {
    target.$set(target, 'locale', val);
    target.$forceUpdate();
  }, { immediate: true })
};

prototypeAccessors.vm.get = function () { return this._vm };

prototypeAccessors.messages.get = function () { return looseClone(this._getMessages()) };
prototypeAccessors.dateTimeFormats.get = function () { return looseClone(this._getDateTimeFormats()) };
prototypeAccessors.numberFormats.get = function () { return looseClone(this._getNumberFormats()) };

prototypeAccessors.locale.get = function () { return this._vm.locale };
prototypeAccessors.locale.set = function (locale) {
  this._vm.$set(this._vm, 'locale', locale);
};

prototypeAccessors.fallbackLocale.get = function () { return this._vm.fallbackLocale };
prototypeAccessors.fallbackLocale.set = function (locale) {
  this._vm.$set(this._vm, 'fallbackLocale', locale);
};

prototypeAccessors.missing.get = function () { return this._missing };
prototypeAccessors.missing.set = function (handler) { this._missing = handler; };

prototypeAccessors.formatter.get = function () { return this._formatter };
prototypeAccessors.formatter.set = function (formatter) { this._formatter = formatter; };

prototypeAccessors.silentTranslationWarn.get = function () { return this._silentTranslationWarn };
prototypeAccessors.silentTranslationWarn.set = function (silent) { this._silentTranslationWarn = silent; };

VueI18n.prototype._getMessages = function _getMessages () { return this._vm.messages };
VueI18n.prototype._getDateTimeFormats = function _getDateTimeFormats () { return this._vm.dateTimeFormats };
VueI18n.prototype._getNumberFormats = function _getNumberFormats () { return this._vm.numberFormats };

VueI18n.prototype._warnDefault = function _warnDefault (locale, key, result, vm, values) {
  if (!isNull(result)) { return result }
  if (this._missing) {
    var missingRet = this._missing.apply(null, [locale, key, vm, values]);
    if (typeof missingRet === 'string') {
      return missingRet
    }
  } else {
    if ("development" !== 'production' && !this._silentTranslationWarn) {
      warn(
        "Cannot translate the value of keypath '" + key + "'. " +
        'Use the value of keypath as default.'
      );
    }
  }
  return key
};

VueI18n.prototype._isFallbackRoot = function _isFallbackRoot (val) {
  return !val && !isNull(this._root) && this._fallbackRoot
};

VueI18n.prototype._interpolate = function _interpolate (
  locale,
  message,
  key,
  host,
  interpolateMode,
  values
) {
  if (!message) { return null }

  var pathRet = this._path.getPathValue(message, key);
  if (Array.isArray(pathRet) || isPlainObject(pathRet)) { return pathRet }

  var ret;
  if (isNull(pathRet)) {
    /* istanbul ignore else */
    if (isPlainObject(message)) {
      ret = message[key];
      if (typeof ret !== 'string') {
        if ("development" !== 'production' && !this._silentTranslationWarn) {
          warn(("Value of key '" + key + "' is not a string!"));
        }
        return null
      }
    } else {
      return null
    }
  } else {
    /* istanbul ignore else */
    if (typeof pathRet === 'string') {
      ret = pathRet;
    } else {
      if ("development" !== 'production' && !this._silentTranslationWarn) {
        warn(("Value of key '" + key + "' is not a string!"));
      }
      return null
    }
  }

  // Check for the existance of links within the translated string
  if (ret.indexOf('@:') >= 0) {
    ret = this._link(locale, message, ret, host, interpolateMode, values);
  }

  return this._render(ret, interpolateMode, values)
};

VueI18n.prototype._link = function _link (
  locale,
  message,
  str,
  host,
  interpolateMode,
  values
) {
    var this$1 = this;

  var ret = str;

  // Match all the links within the local
  // We are going to replace each of
  // them with its translation
  var matches = ret.match(/(@:[\w\-_|.]+)/g);
  for (var idx in matches) {
    // ie compatible: filter custom array
    // prototype method
    if (!matches.hasOwnProperty(idx)) {
      continue
    }
    var link = matches[idx];
    // Remove the leading @:
    var linkPlaceholder = link.substr(2);
    // Translate the link
    var translated = this$1._interpolate(
      locale, message, linkPlaceholder, host,
      interpolateMode === 'raw' ? 'string' : interpolateMode,
      interpolateMode === 'raw' ? undefined : values
    );

    if (this$1._isFallbackRoot(translated)) {
      if ("development" !== 'production' && !this$1._silentTranslationWarn) {
        warn(("Fall back to translate the link placeholder '" + linkPlaceholder + "' with root locale."));
      }
      /* istanbul ignore if */
      if (!this$1._root) { throw Error('unexpected error') }
      var root = this$1._root;
      translated = root._translate(
        root._getMessages(), root.locale, root.fallbackLocale,
        linkPlaceholder, host, interpolateMode, values
      );
    }
    translated = this$1._warnDefault(
      locale, linkPlaceholder, translated, host,
      Array.isArray(values) ? values : [values]
    );

    // Replace the link with the translated
    ret = !translated ? ret : ret.replace(link, translated);
  }

  return ret
};

VueI18n.prototype._render = function _render (message, interpolateMode, values) {
  var ret = this._formatter.interpolate(message, values);
  // if interpolateMode is **not** 'string' ('row'),
  // return the compiled data (e.g. ['foo', VNode, 'bar']) with formatter
  return interpolateMode === 'string' ? ret.join('') : ret
};

VueI18n.prototype._translate = function _translate (
  messages,
  locale,
  fallback,
  key,
  host,
  interpolateMode,
  args
) {
  var res =
    this._interpolate(locale, messages[locale], key, host, interpolateMode, args);
  if (!isNull(res)) { return res }

  res = this._interpolate(fallback, messages[fallback], key, host, interpolateMode, args);
  if (!isNull(res)) {
    if ("development" !== 'production' && !this._silentTranslationWarn) {
      warn(("Fall back to translate the keypath '" + key + "' with '" + fallback + "' locale."));
    }
    return res
  } else {
    return null
  }
};

VueI18n.prototype._t = function _t (key, _locale, messages, host) {
    var ref;

    var values = [], len = arguments.length - 4;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 4 ];
  if (!key) { return '' }

  var parsedArgs = parseArgs.apply(void 0, values);
  var locale = parsedArgs.locale || _locale;

  var ret = this._translate(
    messages, locale, this.fallbackLocale, key,
    host, 'string', parsedArgs.params
  );
  if (this._isFallbackRoot(ret)) {
    if ("development" !== 'production' && !this._silentTranslationWarn) {
      warn(("Fall back to translate the keypath '" + key + "' with root locale."));
    }
    /* istanbul ignore if */
    if (!this._root) { throw Error('unexpected error') }
    return (ref = this._root).t.apply(ref, [ key ].concat( values ))
  } else {
    return this._warnDefault(locale, key, ret, host, values)
  }
};

VueI18n.prototype.t = function t (key) {
    var ref;

    var values = [], len = arguments.length - 1;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 1 ];
  return (ref = this)._t.apply(ref, [ key, this.locale, this._getMessages(), null ].concat( values ))
};

VueI18n.prototype._i = function _i (key, locale, messages, host, values) {
  var ret =
    this._translate(messages, locale, this.fallbackLocale, key, host, 'raw', values);
  if (this._isFallbackRoot(ret)) {
    if ("development" !== 'production' && !this._silentTranslationWarn) {
      warn(("Fall back to interpolate the keypath '" + key + "' with root locale."));
    }
    if (!this._root) { throw Error('unexpected error') }
    return this._root.i(key, locale, values)
  } else {
    return this._warnDefault(locale, key, ret, host, [values])
  }
};

VueI18n.prototype.i = function i (key, locale, values) {
  /* istanbul ignore if */
  if (!key) { return '' }

  if (typeof locale !== 'string') {
    locale = this.locale;
  }

  return this._i(key, locale, this._getMessages(), null, values)
};

VueI18n.prototype._tc = function _tc (
  key,
  _locale,
  messages,
  host,
  choice
) {
    var ref;

    var values = [], len = arguments.length - 5;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 5 ];
  if (!key) { return '' }
  if (choice === undefined) {
    choice = 1;
  }
  return fetchChoice((ref = this)._t.apply(ref, [ key, _locale, messages, host ].concat( values )), choice)
};

VueI18n.prototype.tc = function tc (key, choice) {
    var ref;

    var values = [], len = arguments.length - 2;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 2 ];
  return (ref = this)._tc.apply(ref, [ key, this.locale, this._getMessages(), null, choice ].concat( values ))
};

VueI18n.prototype._te = function _te (key, locale, messages) {
    var args = [], len = arguments.length - 3;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 3 ];

  var _locale = parseArgs.apply(void 0, args).locale || locale;
  return this._exist(messages[_locale], key)
};

VueI18n.prototype.te = function te (key, locale) {
  return this._te(key, this.locale, this._getMessages(), locale)
};

VueI18n.prototype.getLocaleMessage = function getLocaleMessage (locale) {
  return looseClone(this._vm.messages[locale] || {})
};

VueI18n.prototype.setLocaleMessage = function setLocaleMessage (locale, message) {
  this._vm.$set(this._vm.messages, locale, message);
};

VueI18n.prototype.mergeLocaleMessage = function mergeLocaleMessage (locale, message) {
  this._vm.$set(this._vm.messages, locale, Vue.util.extend(this._vm.messages[locale] || {}, message));
};

VueI18n.prototype.getDateTimeFormat = function getDateTimeFormat (locale) {
  return looseClone(this._vm.dateTimeFormats[locale] || {})
};

VueI18n.prototype.setDateTimeFormat = function setDateTimeFormat (locale, format) {
  this._vm.$set(this._vm.dateTimeFormats, locale, format);
};

VueI18n.prototype.mergeDateTimeFormat = function mergeDateTimeFormat (locale, format) {
  this._vm.$set(this._vm.dateTimeFormats, locale, Vue.util.extend(this._vm.dateTimeFormats[locale] || {}, format));
};

VueI18n.prototype._localizeDateTime = function _localizeDateTime (
  value,
  locale,
  fallback,
  dateTimeFormats,
  key
) {
  var _locale = locale;
  var formats = dateTimeFormats[_locale];

  // fallback locale
  if (isNull(formats) || isNull(formats[key])) {
    if (true) {
      warn(("Fall back to '" + fallback + "' datetime formats from '" + locale + " datetime formats."));
    }
    _locale = fallback;
    formats = dateTimeFormats[_locale];
  }

  if (isNull(formats) || isNull(formats[key])) {
    return null
  } else {
    var format = formats[key];
    var id = _locale + "__" + key;
    var formatter = this._dateTimeFormatters[id];
    if (!formatter) {
      formatter = this._dateTimeFormatters[id] = new Intl.DateTimeFormat(_locale, format);
    }
    return formatter.format(value)
  }
};

VueI18n.prototype._d = function _d (value, locale, key) {
  /* istanbul ignore if */
  if ("development" !== 'production' && !VueI18n.availabilities.dateTimeFormat) {
    warn('Cannot format a Date value due to not supported Intl.DateTimeFormat.');
    return ''
  }

  if (!key) {
    return new Intl.DateTimeFormat(locale).format(value)
  }

  var ret =
    this._localizeDateTime(value, locale, this.fallbackLocale, this._getDateTimeFormats(), key);
  if (this._isFallbackRoot(ret)) {
    if (true) {
      warn(("Fall back to datetime localization of root: key '" + key + "' ."));
    }
    /* istanbul ignore if */
    if (!this._root) { throw Error('unexpected error') }
    return this._root.d(value, key, locale)
  } else {
    return ret || ''
  }
};

VueI18n.prototype.d = function d (value) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  var locale = this.locale;
  var key = null;

  if (args.length === 1) {
    if (typeof args[0] === 'string') {
      key = args[0];
    } else if (isObject(args[0])) {
      if (args[0].locale) {
        locale = args[0].locale;
      }
      if (args[0].key) {
        key = args[0].key;
      }
    }
  } else if (args.length === 2) {
    if (typeof args[0] === 'string') {
      key = args[0];
    }
    if (typeof args[1] === 'string') {
      locale = args[1];
    }
  }

  return this._d(value, locale, key)
};

VueI18n.prototype.getNumberFormat = function getNumberFormat (locale) {
  return looseClone(this._vm.numberFormats[locale] || {})
};

VueI18n.prototype.setNumberFormat = function setNumberFormat (locale, format) {
  this._vm.$set(this._vm.numberFormats, locale, format);
};

VueI18n.prototype.mergeNumberFormat = function mergeNumberFormat (locale, format) {
  this._vm.$set(this._vm.numberFormats, locale, Vue.util.extend(this._vm.numberFormats[locale] || {}, format));
};

VueI18n.prototype._localizeNumber = function _localizeNumber (
  value,
  locale,
  fallback,
  numberFormats,
  key,
  options
) {
  var _locale = locale;
  var formats = numberFormats[_locale];

  // fallback locale
  if (isNull(formats) || isNull(formats[key])) {
    if (true) {
      warn(("Fall back to '" + fallback + "' number formats from '" + locale + " number formats."));
    }
    _locale = fallback;
    formats = numberFormats[_locale];
  }

  if (isNull(formats) || isNull(formats[key])) {
    return null
  } else {
    var format = formats[key];

    var formatter;
    if (options) {
      // If options specified - create one time number formatter
      formatter = new Intl.NumberFormat(_locale, Object.assign({}, format, options));
    } else {
      var id = _locale + "__" + key;
      formatter = this._numberFormatters[id];
      if (!formatter) {
        formatter = this._numberFormatters[id] = new Intl.NumberFormat(_locale, format);
      }
    }
    return formatter.format(value)
  }
};

VueI18n.prototype._n = function _n (value, locale, key, options) {
  /* istanbul ignore if */
  if ("development" !== 'production' && !VueI18n.availabilities.numberFormat) {
    warn('Cannot format a Number value due to not supported Intl.NumberFormat.');
    return ''
  }

  if (!key) {
    var nf = !options ? new Intl.NumberFormat(locale) : new Intl.NumberFormat(locale, options);
    return nf.format(value)
  }

  var ret =
    this._localizeNumber(value, locale, this.fallbackLocale, this._getNumberFormats(), key, options);
  if (this._isFallbackRoot(ret)) {
    if (true) {
      warn(("Fall back to number localization of root: key '" + key + "' ."));
    }
    /* istanbul ignore if */
    if (!this._root) { throw Error('unexpected error') }
    return this._root.n(value, Object.assign({}, { key: key, locale: locale }, options))
  } else {
    return ret || ''
  }
};

VueI18n.prototype.n = function n (value) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  var locale = this.locale;
  var key = null;
  var options = null;

  if (args.length === 1) {
    if (typeof args[0] === 'string') {
      key = args[0];
    } else if (isObject(args[0])) {
      if (args[0].locale) {
        locale = args[0].locale;
      }
      if (args[0].key) {
        key = args[0].key;
      }

      // Filter out number format options only
      options = Object.keys(args[0]).reduce(function (acc, key) {
          var obj;

        if (numberFormatKeys.includes(key)) {
          return Object.assign({}, acc, ( obj = {}, obj[key] = args[0][key], obj ))
        }
        return acc
      }, null);
    }
  } else if (args.length === 2) {
    if (typeof args[0] === 'string') {
      key = args[0];
    }
    if (typeof args[1] === 'string') {
      locale = args[1];
    }
  }

  return this._n(value, locale, key, options)
};

Object.defineProperties( VueI18n.prototype, prototypeAccessors );

VueI18n.availabilities = {
  dateTimeFormat: canUseDateTimeFormat,
  numberFormat: canUseNumberFormat
};
VueI18n.install = install;
VueI18n.version = '7.8.1';

/* harmony default export */ __webpack_exports__["default"] = (VueI18n);


/***/ }),
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */
/***/ (function(module, exports) {

/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
module.exports = function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _footer = __webpack_require__(106);

var _footer2 = _interopRequireDefault(_footer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _footer2.default;

/***/ }),
/* 106 */,
/* 107 */,
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(34);
__webpack_require__(114);
module.exports = __webpack_require__(0).Array.from;


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(35);
var defined = __webpack_require__(36);
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var create = __webpack_require__(25);
var descriptor = __webpack_require__(21);
var setToStringTag = __webpack_require__(28);
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__(12)(IteratorPrototype, __webpack_require__(4)('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(16);
var toLength = __webpack_require__(26);
var toAbsoluteIndex = __webpack_require__(112);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(35);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__(7).document;
module.exports = document && document.documentElement;


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ctx = __webpack_require__(17);
var $export = __webpack_require__(3);
var toObject = __webpack_require__(19);
var call = __webpack_require__(67);
var isArrayIter = __webpack_require__(68);
var toLength = __webpack_require__(26);
var createProperty = __webpack_require__(115);
var getIterFn = __webpack_require__(69);

$export($export.S + $export.F * !__webpack_require__(116)(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $defineProperty = __webpack_require__(5);
var createDesc = __webpack_require__(21);

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

var ITERATOR = __webpack_require__(4)('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};


/***/ }),
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _contextMenu = __webpack_require__(121);

var _contextMenu2 = _interopRequireDefault(_contextMenu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _contextMenu2.default;

/***/ }),
/* 121 */,
/* 122 */,
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _popover = __webpack_require__(124);

var _popover2 = _interopRequireDefault(_popover);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _popover2.default;

/***/ }),
/* 124 */,
/* 125 */,
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.positionValidator = positionValidator;
exports.offsetValidator = offsetValidator;
function positionValidator(pos) {
  var parts = pos.split(' ');
  if (parts.length !== 2) {
    return false;
  }
  if (!['top', 'center', 'bottom'].includes(parts[0])) {
    console.error('Anchor/Self position must start with one of top/center/bottom');
    return false;
  }
  if (!['left', 'middle', 'right'].includes(parts[1])) {
    console.error('Anchor/Self position must end with one of left/middle/right');
    return false;
  }
  return true;
}
function offsetValidator(val) {
  if (!val) {
    return true;
  }
  if (val.length !== 2) {
    return false;
  }
  if (typeof val[0] !== 'number' || typeof val[1] !== 'number') {
    return false;
  }
  return true;
}

/***/ }),
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */,
/* 131 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(77);
__webpack_require__(82);
__webpack_require__(134);
__webpack_require__(135);
module.exports = __webpack_require__(0).Symbol;


/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

// all enumerable object keys, includes symbols
var getKeys = __webpack_require__(23);
var gOPS = __webpack_require__(50);
var pIE = __webpack_require__(30);
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};


/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(49)('asyncIterator');


/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(49)('observable');


/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(137), __esModule: true };

/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(138);
module.exports = __webpack_require__(0).Object.assign;


/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.3.1 Object.assign(target, source)
var $export = __webpack_require__(3);

$export($export.S + $export.F, 'Object', { assign: __webpack_require__(139) });


/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = __webpack_require__(23);
var gOPS = __webpack_require__(50);
var pIE = __webpack_require__(30);
var toObject = __webpack_require__(19);
var IObject = __webpack_require__(39);
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || __webpack_require__(14)(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;


/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(141), __esModule: true };

/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(0);
var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};


/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(143), __esModule: true };

/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(144);
var $Object = __webpack_require__(0).Object;
module.exports = function getOwnPropertyDescriptor(it, key) {
  return $Object.getOwnPropertyDescriptor(it, key);
};


/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = __webpack_require__(16);
var $getOwnPropertyDescriptor = __webpack_require__(81).f;

__webpack_require__(20)('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});


/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(146), __esModule: true };

/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(147);
module.exports = __webpack_require__(0).Object.getPrototypeOf;


/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = __webpack_require__(19);
var $getPrototypeOf = __webpack_require__(66);

__webpack_require__(20)('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return $getPrototypeOf(toObject(it));
  };
});


/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(149), __esModule: true };

/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(150);
var $Object = __webpack_require__(0).Object;
module.exports = function defineProperties(T, D) {
  return $Object.defineProperties(T, D);
};


/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(3);
// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
$export($export.S + $export.F * !__webpack_require__(6), 'Object', { defineProperties: __webpack_require__(64) });


/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(152), __esModule: true };

/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(153);
var $Object = __webpack_require__(0).Object;
module.exports = function getOwnPropertyNames(it) {
  return $Object.getOwnPropertyNames(it);
};


/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 Object.getOwnPropertyNames(O)
__webpack_require__(20)('getOwnPropertyNames', function () {
  return __webpack_require__(79).f;
});


/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(155), __esModule: true };

/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(77);
module.exports = __webpack_require__(0).Object.getOwnPropertySymbols;


/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(157), __esModule: true };

/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(158);
module.exports = __webpack_require__(0).Object.preventExtensions;


/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.15 Object.preventExtensions(O)
var isObject = __webpack_require__(8);
var meta = __webpack_require__(29).onFreeze;

__webpack_require__(20)('preventExtensions', function ($preventExtensions) {
  return function preventExtensions(it) {
    return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
  };
});


/***/ }),
/* 159 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(160), __esModule: true };

/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(161);
module.exports = __webpack_require__(0).Object.isExtensible;


/***/ }),
/* 161 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.11 Object.isExtensible(O)
var isObject = __webpack_require__(8);

__webpack_require__(20)('isExtensible', function ($isExtensible) {
  return function isExtensible(it) {
    return isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
  };
});


/***/ }),
/* 162 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(163), __esModule: true };

/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(164);
var $Object = __webpack_require__(0).Object;
module.exports = function create(P, D) {
  return $Object.create(P, D);
};


/***/ }),
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(3);
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', { create: __webpack_require__(25) });


/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(166);
module.exports = __webpack_require__(0).Object.keys;


/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 Object.keys(O)
var toObject = __webpack_require__(19);
var $keys = __webpack_require__(23);

__webpack_require__(20)('keys', function () {
  return function keys(it) {
    return $keys(toObject(it));
  };
});


/***/ }),
/* 167 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(168);
var $Object = __webpack_require__(0).Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};


/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(3);
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !__webpack_require__(6), 'Object', { defineProperty: __webpack_require__(5).f });


/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(170), __esModule: true };

/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(34);
__webpack_require__(86);
module.exports = __webpack_require__(48).f('iterator');


/***/ }),
/* 171 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var addToUnscopables = __webpack_require__(172);
var step = __webpack_require__(87);
var Iterators = __webpack_require__(22);
var toIObject = __webpack_require__(16);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__(37)(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),
/* 172 */
/***/ (function(module, exports) {

module.exports = function () { /* empty */ };


/***/ }),
/* 173 */,
/* 174 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/**
  * vue-router v2.8.1
  * (c) 2017 Evan You
  * @license MIT
  */
/*  */

function assert (condition, message) {
  if (!condition) {
    throw new Error(("[vue-router] " + message))
  }
}

function warn (condition, message) {
  if ("development" !== 'production' && !condition) {
    typeof console !== 'undefined' && console.warn(("[vue-router] " + message));
  }
}

function isError (err) {
  return Object.prototype.toString.call(err).indexOf('Error') > -1
}

var View = {
  name: 'router-view',
  functional: true,
  props: {
    name: {
      type: String,
      default: 'default'
    }
  },
  render: function render (_, ref) {
    var props = ref.props;
    var children = ref.children;
    var parent = ref.parent;
    var data = ref.data;

    data.routerView = true;

    // directly use parent context's createElement() function
    // so that components rendered by router-view can resolve named slots
    var h = parent.$createElement;
    var name = props.name;
    var route = parent.$route;
    var cache = parent._routerViewCache || (parent._routerViewCache = {});

    // determine current view depth, also check to see if the tree
    // has been toggled inactive but kept-alive.
    var depth = 0;
    var inactive = false;
    while (parent && parent._routerRoot !== parent) {
      if (parent.$vnode && parent.$vnode.data.routerView) {
        depth++;
      }
      if (parent._inactive) {
        inactive = true;
      }
      parent = parent.$parent;
    }
    data.routerViewDepth = depth;

    // render previous view if the tree is inactive and kept-alive
    if (inactive) {
      return h(cache[name], data, children)
    }

    var matched = route.matched[depth];
    // render empty node if no matched route
    if (!matched) {
      cache[name] = null;
      return h()
    }

    var component = cache[name] = matched.components[name];

    // attach instance registration hook
    // this will be called in the instance's injected lifecycle hooks
    data.registerRouteInstance = function (vm, val) {
      // val could be undefined for unregistration
      var current = matched.instances[name];
      if (
        (val && current !== vm) ||
        (!val && current === vm)
      ) {
        matched.instances[name] = val;
      }
    }

    // also register instance in prepatch hook
    // in case the same component instance is reused across different routes
    ;(data.hook || (data.hook = {})).prepatch = function (_, vnode) {
      matched.instances[name] = vnode.componentInstance;
    };

    // resolve props
    var propsToPass = data.props = resolveProps(route, matched.props && matched.props[name]);
    if (propsToPass) {
      // clone to prevent mutation
      propsToPass = data.props = extend({}, propsToPass);
      // pass non-declared props as attrs
      var attrs = data.attrs = data.attrs || {};
      for (var key in propsToPass) {
        if (!component.props || !(key in component.props)) {
          attrs[key] = propsToPass[key];
          delete propsToPass[key];
        }
      }
    }

    return h(component, data, children)
  }
};

function resolveProps (route, config) {
  switch (typeof config) {
    case 'undefined':
      return
    case 'object':
      return config
    case 'function':
      return config(route)
    case 'boolean':
      return config ? route.params : undefined
    default:
      if (true) {
        warn(
          false,
          "props in \"" + (route.path) + "\" is a " + (typeof config) + ", " +
          "expecting an object, function or boolean."
        );
      }
  }
}

function extend (to, from) {
  for (var key in from) {
    to[key] = from[key];
  }
  return to
}

/*  */

var encodeReserveRE = /[!'()*]/g;
var encodeReserveReplacer = function (c) { return '%' + c.charCodeAt(0).toString(16); };
var commaRE = /%2C/g;

// fixed encodeURIComponent which is more conformant to RFC3986:
// - escapes [!'()*]
// - preserve commas
var encode = function (str) { return encodeURIComponent(str)
  .replace(encodeReserveRE, encodeReserveReplacer)
  .replace(commaRE, ','); };

var decode = decodeURIComponent;

function resolveQuery (
  query,
  extraQuery,
  _parseQuery
) {
  if ( extraQuery === void 0 ) extraQuery = {};

  var parse = _parseQuery || parseQuery;
  var parsedQuery;
  try {
    parsedQuery = parse(query || '');
  } catch (e) {
    "development" !== 'production' && warn(false, e.message);
    parsedQuery = {};
  }
  for (var key in extraQuery) {
    parsedQuery[key] = extraQuery[key];
  }
  return parsedQuery
}

function parseQuery (query) {
  var res = {};

  query = query.trim().replace(/^(\?|#|&)/, '');

  if (!query) {
    return res
  }

  query.split('&').forEach(function (param) {
    var parts = param.replace(/\+/g, ' ').split('=');
    var key = decode(parts.shift());
    var val = parts.length > 0
      ? decode(parts.join('='))
      : null;

    if (res[key] === undefined) {
      res[key] = val;
    } else if (Array.isArray(res[key])) {
      res[key].push(val);
    } else {
      res[key] = [res[key], val];
    }
  });

  return res
}

function stringifyQuery (obj) {
  var res = obj ? Object.keys(obj).map(function (key) {
    var val = obj[key];

    if (val === undefined) {
      return ''
    }

    if (val === null) {
      return encode(key)
    }

    if (Array.isArray(val)) {
      var result = [];
      val.forEach(function (val2) {
        if (val2 === undefined) {
          return
        }
        if (val2 === null) {
          result.push(encode(key));
        } else {
          result.push(encode(key) + '=' + encode(val2));
        }
      });
      return result.join('&')
    }

    return encode(key) + '=' + encode(val)
  }).filter(function (x) { return x.length > 0; }).join('&') : null;
  return res ? ("?" + res) : ''
}

/*  */


var trailingSlashRE = /\/?$/;

function createRoute (
  record,
  location,
  redirectedFrom,
  router
) {
  var stringifyQuery$$1 = router && router.options.stringifyQuery;

  var query = location.query || {};
  try {
    query = clone(query);
  } catch (e) {}

  var route = {
    name: location.name || (record && record.name),
    meta: (record && record.meta) || {},
    path: location.path || '/',
    hash: location.hash || '',
    query: query,
    params: location.params || {},
    fullPath: getFullPath(location, stringifyQuery$$1),
    matched: record ? formatMatch(record) : []
  };
  if (redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery$$1);
  }
  return Object.freeze(route)
}

function clone (value) {
  if (Array.isArray(value)) {
    return value.map(clone)
  } else if (value && typeof value === 'object') {
    var res = {};
    for (var key in value) {
      res[key] = clone(value[key]);
    }
    return res
  } else {
    return value
  }
}

// the starting route that represents the initial state
var START = createRoute(null, {
  path: '/'
});

function formatMatch (record) {
  var res = [];
  while (record) {
    res.unshift(record);
    record = record.parent;
  }
  return res
}

function getFullPath (
  ref,
  _stringifyQuery
) {
  var path = ref.path;
  var query = ref.query; if ( query === void 0 ) query = {};
  var hash = ref.hash; if ( hash === void 0 ) hash = '';

  var stringify = _stringifyQuery || stringifyQuery;
  return (path || '/') + stringify(query) + hash
}

function isSameRoute (a, b) {
  if (b === START) {
    return a === b
  } else if (!b) {
    return false
  } else if (a.path && b.path) {
    return (
      a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '') &&
      a.hash === b.hash &&
      isObjectEqual(a.query, b.query)
    )
  } else if (a.name && b.name) {
    return (
      a.name === b.name &&
      a.hash === b.hash &&
      isObjectEqual(a.query, b.query) &&
      isObjectEqual(a.params, b.params)
    )
  } else {
    return false
  }
}

function isObjectEqual (a, b) {
  if ( a === void 0 ) a = {};
  if ( b === void 0 ) b = {};

  // handle null value #1566
  if (!a || !b) { return a === b }
  var aKeys = Object.keys(a);
  var bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false
  }
  return aKeys.every(function (key) {
    var aVal = a[key];
    var bVal = b[key];
    // check nested equality
    if (typeof aVal === 'object' && typeof bVal === 'object') {
      return isObjectEqual(aVal, bVal)
    }
    return String(aVal) === String(bVal)
  })
}

function isIncludedRoute (current, target) {
  return (
    current.path.replace(trailingSlashRE, '/').indexOf(
      target.path.replace(trailingSlashRE, '/')
    ) === 0 &&
    (!target.hash || current.hash === target.hash) &&
    queryIncludes(current.query, target.query)
  )
}

function queryIncludes (current, target) {
  for (var key in target) {
    if (!(key in current)) {
      return false
    }
  }
  return true
}

/*  */

// work around weird flow bug
var toTypes = [String, Object];
var eventTypes = [String, Array];

var Link = {
  name: 'router-link',
  props: {
    to: {
      type: toTypes,
      required: true
    },
    tag: {
      type: String,
      default: 'a'
    },
    exact: Boolean,
    append: Boolean,
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    event: {
      type: eventTypes,
      default: 'click'
    }
  },
  render: function render (h) {
    var this$1 = this;

    var router = this.$router;
    var current = this.$route;
    var ref = router.resolve(this.to, current, this.append);
    var location = ref.location;
    var route = ref.route;
    var href = ref.href;

    var classes = {};
    var globalActiveClass = router.options.linkActiveClass;
    var globalExactActiveClass = router.options.linkExactActiveClass;
    // Support global empty active class
    var activeClassFallback = globalActiveClass == null
            ? 'router-link-active'
            : globalActiveClass;
    var exactActiveClassFallback = globalExactActiveClass == null
            ? 'router-link-exact-active'
            : globalExactActiveClass;
    var activeClass = this.activeClass == null
            ? activeClassFallback
            : this.activeClass;
    var exactActiveClass = this.exactActiveClass == null
            ? exactActiveClassFallback
            : this.exactActiveClass;
    var compareTarget = location.path
      ? createRoute(null, location, null, router)
      : route;

    classes[exactActiveClass] = isSameRoute(current, compareTarget);
    classes[activeClass] = this.exact
      ? classes[exactActiveClass]
      : isIncludedRoute(current, compareTarget);

    var handler = function (e) {
      if (guardEvent(e)) {
        if (this$1.replace) {
          router.replace(location);
        } else {
          router.push(location);
        }
      }
    };

    var on = { click: guardEvent };
    if (Array.isArray(this.event)) {
      this.event.forEach(function (e) { on[e] = handler; });
    } else {
      on[this.event] = handler;
    }

    var data = {
      class: classes
    };

    if (this.tag === 'a') {
      data.on = on;
      data.attrs = { href: href };
    } else {
      // find the first <a> child and apply listener and href
      var a = findAnchor(this.$slots.default);
      if (a) {
        // in case the <a> is a static node
        a.isStatic = false;
        var extend = _Vue.util.extend;
        var aData = a.data = extend({}, a.data);
        aData.on = on;
        var aAttrs = a.data.attrs = extend({}, a.data.attrs);
        aAttrs.href = href;
      } else {
        // doesn't have <a> child, apply listener to self
        data.on = on;
      }
    }

    return h(this.tag, data, this.$slots.default)
  }
};

function guardEvent (e) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) { return }
  // don't redirect when preventDefault called
  if (e.defaultPrevented) { return }
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) { return }
  // don't redirect if `target="_blank"`
  if (e.currentTarget && e.currentTarget.getAttribute) {
    var target = e.currentTarget.getAttribute('target');
    if (/\b_blank\b/i.test(target)) { return }
  }
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) {
    e.preventDefault();
  }
  return true
}

function findAnchor (children) {
  if (children) {
    var child;
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      if (child.tag === 'a') {
        return child
      }
      if (child.children && (child = findAnchor(child.children))) {
        return child
      }
    }
  }
}

var _Vue;

function install (Vue) {
  if (install.installed && _Vue === Vue) { return }
  install.installed = true;

  _Vue = Vue;

  var isDef = function (v) { return v !== undefined; };

  var registerInstance = function (vm, callVal) {
    var i = vm.$options._parentVnode;
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal);
    }
  };

  Vue.mixin({
    beforeCreate: function beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this;
        this._router = this.$options.router;
        this._router.init(this);
        Vue.util.defineReactive(this, '_route', this._router.history.current);
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
      }
      registerInstance(this, this);
    },
    destroyed: function destroyed () {
      registerInstance(this);
    }
  });

  Object.defineProperty(Vue.prototype, '$router', {
    get: function get () { return this._routerRoot._router }
  });

  Object.defineProperty(Vue.prototype, '$route', {
    get: function get () { return this._routerRoot._route }
  });

  Vue.component('router-view', View);
  Vue.component('router-link', Link);

  var strats = Vue.config.optionMergeStrategies;
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created;
}

/*  */

var inBrowser = typeof window !== 'undefined';

/*  */

function resolvePath (
  relative,
  base,
  append
) {
  var firstChar = relative.charAt(0);
  if (firstChar === '/') {
    return relative
  }

  if (firstChar === '?' || firstChar === '#') {
    return base + relative
  }

  var stack = base.split('/');

  // remove trailing segment if:
  // - not appending
  // - appending to trailing slash (last segment is empty)
  if (!append || !stack[stack.length - 1]) {
    stack.pop();
  }

  // resolve relative path
  var segments = relative.replace(/^\//, '').split('/');
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    if (segment === '..') {
      stack.pop();
    } else if (segment !== '.') {
      stack.push(segment);
    }
  }

  // ensure leading slash
  if (stack[0] !== '') {
    stack.unshift('');
  }

  return stack.join('/')
}

function parsePath (path) {
  var hash = '';
  var query = '';

  var hashIndex = path.indexOf('#');
  if (hashIndex >= 0) {
    hash = path.slice(hashIndex);
    path = path.slice(0, hashIndex);
  }

  var queryIndex = path.indexOf('?');
  if (queryIndex >= 0) {
    query = path.slice(queryIndex + 1);
    path = path.slice(0, queryIndex);
  }

  return {
    path: path,
    query: query,
    hash: hash
  }
}

function cleanPath (path) {
  return path.replace(/\/\//g, '/')
}

var isarray = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

/**
 * Expose `pathToRegexp`.
 */
var pathToRegexp_1 = pathToRegexp;
var parse_1 = parse;
var compile_1 = compile;
var tokensToFunction_1 = tokensToFunction;
var tokensToRegExp_1 = tokensToRegExp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g');

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  var tokens = [];
  var key = 0;
  var index = 0;
  var path = '';
  var defaultDelimiter = options && options.delimiter || '/';
  var res;

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0];
    var escaped = res[1];
    var offset = res.index;
    path += str.slice(index, offset);
    index = offset + m.length;

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1];
      continue
    }

    var next = str[index];
    var prefix = res[2];
    var name = res[3];
    var capture = res[4];
    var group = res[5];
    var modifier = res[6];
    var asterisk = res[7];

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path);
      path = '';
    }

    var partial = prefix != null && next != null && next !== prefix;
    var repeat = modifier === '+' || modifier === '*';
    var optional = modifier === '?' || modifier === '*';
    var delimiter = res[2] || defaultDelimiter;
    var pattern = capture || group;

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
    });
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index);
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path);
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
function compile (str, options) {
  return tokensToFunction(parse(str, options))
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty (str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk (str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length);

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
    }
  }

  return function (obj, opts) {
    var path = '';
    var data = obj || {};
    var options = opts || {};
    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        path += token;

        continue
      }

      var value = data[token.name];
      var segment;

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix;
          }

          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j]);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment;
        }

        continue
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value);

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment;
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys;
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      });
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var route = '';

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (typeof token === 'string') {
      route += escapeString(token);
    } else {
      var prefix = escapeString(token.prefix);
      var capture = '(?:' + token.pattern + ')';

      keys.push(token);

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*';
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?';
        } else {
          capture = prefix + '(' + capture + ')?';
        }
      } else {
        capture = prefix + '(' + capture + ')';
      }

      route += capture;
    }
  }

  var delimiter = escapeString(options.delimiter || '/');
  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys)
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  if (path instanceof RegExp) {
    return regexpToRegexp(path, /** @type {!Array} */ (keys))
  }

  if (isarray(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
  }

  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
}

pathToRegexp_1.parse = parse_1;
pathToRegexp_1.compile = compile_1;
pathToRegexp_1.tokensToFunction = tokensToFunction_1;
pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

/*  */

// $flow-disable-line
var regexpCompileCache = Object.create(null);

function fillParams (
  path,
  params,
  routeMsg
) {
  try {
    var filler =
      regexpCompileCache[path] ||
      (regexpCompileCache[path] = pathToRegexp_1.compile(path));
    return filler(params || {}, { pretty: true })
  } catch (e) {
    if (true) {
      warn(false, ("missing param for " + routeMsg + ": " + (e.message)));
    }
    return ''
  }
}

/*  */

function createRouteMap (
  routes,
  oldPathList,
  oldPathMap,
  oldNameMap
) {
  // the path list is used to control path matching priority
  var pathList = oldPathList || [];
  // $flow-disable-line
  var pathMap = oldPathMap || Object.create(null);
  // $flow-disable-line
  var nameMap = oldNameMap || Object.create(null);

  routes.forEach(function (route) {
    addRouteRecord(pathList, pathMap, nameMap, route);
  });

  // ensure wildcard routes are always at the end
  for (var i = 0, l = pathList.length; i < l; i++) {
    if (pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0]);
      l--;
      i--;
    }
  }

  return {
    pathList: pathList,
    pathMap: pathMap,
    nameMap: nameMap
  }
}

function addRouteRecord (
  pathList,
  pathMap,
  nameMap,
  route,
  parent,
  matchAs
) {
  var path = route.path;
  var name = route.name;
  if (true) {
    assert(path != null, "\"path\" is required in a route configuration.");
    assert(
      typeof route.component !== 'string',
      "route config \"component\" for path: " + (String(path || name)) + " cannot be a " +
      "string id. Use an actual component instead."
    );
  }

  var pathToRegexpOptions = route.pathToRegexpOptions || {};
  var normalizedPath = normalizePath(
    path,
    parent,
    pathToRegexpOptions.strict
  );

  if (typeof route.caseSensitive === 'boolean') {
    pathToRegexpOptions.sensitive = route.caseSensitive;
  }

  var record = {
    path: normalizedPath,
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
    components: route.components || { default: route.component },
    instances: {},
    name: name,
    parent: parent,
    matchAs: matchAs,
    redirect: route.redirect,
    beforeEnter: route.beforeEnter,
    meta: route.meta || {},
    props: route.props == null
      ? {}
      : route.components
        ? route.props
        : { default: route.props }
  };

  if (route.children) {
    // Warn if route is named, does not redirect and has a default child route.
    // If users navigate to this route by name, the default child will
    // not be rendered (GH Issue #629)
    if (true) {
      if (route.name && !route.redirect && route.children.some(function (child) { return /^\/?$/.test(child.path); })) {
        warn(
          false,
          "Named Route '" + (route.name) + "' has a default child route. " +
          "When navigating to this named route (:to=\"{name: '" + (route.name) + "'\"), " +
          "the default child route will not be rendered. Remove the name from " +
          "this route and use the name of the default child route for named " +
          "links instead."
        );
      }
    }
    route.children.forEach(function (child) {
      var childMatchAs = matchAs
        ? cleanPath((matchAs + "/" + (child.path)))
        : undefined;
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs);
    });
  }

  if (route.alias !== undefined) {
    var aliases = Array.isArray(route.alias)
      ? route.alias
      : [route.alias];

    aliases.forEach(function (alias) {
      var aliasRoute = {
        path: alias,
        children: route.children
      };
      addRouteRecord(
        pathList,
        pathMap,
        nameMap,
        aliasRoute,
        parent,
        record.path || '/' // matchAs
      );
    });
  }

  if (!pathMap[record.path]) {
    pathList.push(record.path);
    pathMap[record.path] = record;
  }

  if (name) {
    if (!nameMap[name]) {
      nameMap[name] = record;
    } else if ("development" !== 'production' && !matchAs) {
      warn(
        false,
        "Duplicate named routes definition: " +
        "{ name: \"" + name + "\", path: \"" + (record.path) + "\" }"
      );
    }
  }
}

function compileRouteRegex (path, pathToRegexpOptions) {
  var regex = pathToRegexp_1(path, [], pathToRegexpOptions);
  if (true) {
    var keys = Object.create(null);
    regex.keys.forEach(function (key) {
      warn(!keys[key.name], ("Duplicate param keys in route with path: \"" + path + "\""));
      keys[key.name] = true;
    });
  }
  return regex
}

function normalizePath (path, parent, strict) {
  if (!strict) { path = path.replace(/\/$/, ''); }
  if (path[0] === '/') { return path }
  if (parent == null) { return path }
  return cleanPath(((parent.path) + "/" + path))
}

/*  */


function normalizeLocation (
  raw,
  current,
  append,
  router
) {
  var next = typeof raw === 'string' ? { path: raw } : raw;
  // named target
  if (next.name || next._normalized) {
    return next
  }

  // relative params
  if (!next.path && next.params && current) {
    next = assign({}, next);
    next._normalized = true;
    var params = assign(assign({}, current.params), next.params);
    if (current.name) {
      next.name = current.name;
      next.params = params;
    } else if (current.matched.length) {
      var rawPath = current.matched[current.matched.length - 1].path;
      next.path = fillParams(rawPath, params, ("path " + (current.path)));
    } else if (true) {
      warn(false, "relative params navigation requires a current route.");
    }
    return next
  }

  var parsedPath = parsePath(next.path || '');
  var basePath = (current && current.path) || '/';
  var path = parsedPath.path
    ? resolvePath(parsedPath.path, basePath, append || next.append)
    : basePath;

  var query = resolveQuery(
    parsedPath.query,
    next.query,
    router && router.options.parseQuery
  );

  var hash = next.hash || parsedPath.hash;
  if (hash && hash.charAt(0) !== '#') {
    hash = "#" + hash;
  }

  return {
    _normalized: true,
    path: path,
    query: query,
    hash: hash
  }
}

function assign (a, b) {
  for (var key in b) {
    a[key] = b[key];
  }
  return a
}

/*  */


function createMatcher (
  routes,
  router
) {
  var ref = createRouteMap(routes);
  var pathList = ref.pathList;
  var pathMap = ref.pathMap;
  var nameMap = ref.nameMap;

  function addRoutes (routes) {
    createRouteMap(routes, pathList, pathMap, nameMap);
  }

  function match (
    raw,
    currentRoute,
    redirectedFrom
  ) {
    var location = normalizeLocation(raw, currentRoute, false, router);
    var name = location.name;

    if (name) {
      var record = nameMap[name];
      if (true) {
        warn(record, ("Route with name '" + name + "' does not exist"));
      }
      if (!record) { return _createRoute(null, location) }
      var paramNames = record.regex.keys
        .filter(function (key) { return !key.optional; })
        .map(function (key) { return key.name; });

      if (typeof location.params !== 'object') {
        location.params = {};
      }

      if (currentRoute && typeof currentRoute.params === 'object') {
        for (var key in currentRoute.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key];
          }
        }
      }

      if (record) {
        location.path = fillParams(record.path, location.params, ("named route \"" + name + "\""));
        return _createRoute(record, location, redirectedFrom)
      }
    } else if (location.path) {
      location.params = {};
      for (var i = 0; i < pathList.length; i++) {
        var path = pathList[i];
        var record$1 = pathMap[path];
        if (matchRoute(record$1.regex, location.path, location.params)) {
          return _createRoute(record$1, location, redirectedFrom)
        }
      }
    }
    // no match
    return _createRoute(null, location)
  }

  function redirect (
    record,
    location
  ) {
    var originalRedirect = record.redirect;
    var redirect = typeof originalRedirect === 'function'
        ? originalRedirect(createRoute(record, location, null, router))
        : originalRedirect;

    if (typeof redirect === 'string') {
      redirect = { path: redirect };
    }

    if (!redirect || typeof redirect !== 'object') {
      if (true) {
        warn(
          false, ("invalid redirect option: " + (JSON.stringify(redirect)))
        );
      }
      return _createRoute(null, location)
    }

    var re = redirect;
    var name = re.name;
    var path = re.path;
    var query = location.query;
    var hash = location.hash;
    var params = location.params;
    query = re.hasOwnProperty('query') ? re.query : query;
    hash = re.hasOwnProperty('hash') ? re.hash : hash;
    params = re.hasOwnProperty('params') ? re.params : params;

    if (name) {
      // resolved named direct
      var targetRecord = nameMap[name];
      if (true) {
        assert(targetRecord, ("redirect failed: named route \"" + name + "\" not found."));
      }
      return match({
        _normalized: true,
        name: name,
        query: query,
        hash: hash,
        params: params
      }, undefined, location)
    } else if (path) {
      // 1. resolve relative redirect
      var rawPath = resolveRecordPath(path, record);
      // 2. resolve params
      var resolvedPath = fillParams(rawPath, params, ("redirect route with path \"" + rawPath + "\""));
      // 3. rematch with existing query and hash
      return match({
        _normalized: true,
        path: resolvedPath,
        query: query,
        hash: hash
      }, undefined, location)
    } else {
      if (true) {
        warn(false, ("invalid redirect option: " + (JSON.stringify(redirect))));
      }
      return _createRoute(null, location)
    }
  }

  function alias (
    record,
    location,
    matchAs
  ) {
    var aliasedPath = fillParams(matchAs, location.params, ("aliased route with path \"" + matchAs + "\""));
    var aliasedMatch = match({
      _normalized: true,
      path: aliasedPath
    });
    if (aliasedMatch) {
      var matched = aliasedMatch.matched;
      var aliasedRecord = matched[matched.length - 1];
      location.params = aliasedMatch.params;
      return _createRoute(aliasedRecord, location)
    }
    return _createRoute(null, location)
  }

  function _createRoute (
    record,
    location,
    redirectedFrom
  ) {
    if (record && record.redirect) {
      return redirect(record, redirectedFrom || location)
    }
    if (record && record.matchAs) {
      return alias(record, location, record.matchAs)
    }
    return createRoute(record, location, redirectedFrom, router)
  }

  return {
    match: match,
    addRoutes: addRoutes
  }
}

function matchRoute (
  regex,
  path,
  params
) {
  var m = path.match(regex);

  if (!m) {
    return false
  } else if (!params) {
    return true
  }

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = regex.keys[i - 1];
    var val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i];
    if (key) {
      params[key.name] = val;
    }
  }

  return true
}

function resolveRecordPath (path, record) {
  return resolvePath(path, record.parent ? record.parent.path : '/', true)
}

/*  */


var positionStore = Object.create(null);

function setupScroll () {
  // Fix for #1585 for Firefox
  window.history.replaceState({ key: getStateKey() }, '');
  window.addEventListener('popstate', function (e) {
    saveScrollPosition();
    if (e.state && e.state.key) {
      setStateKey(e.state.key);
    }
  });
}

function handleScroll (
  router,
  to,
  from,
  isPop
) {
  if (!router.app) {
    return
  }

  var behavior = router.options.scrollBehavior;
  if (!behavior) {
    return
  }

  if (true) {
    assert(typeof behavior === 'function', "scrollBehavior must be a function");
  }

  // wait until re-render finishes before scrolling
  router.app.$nextTick(function () {
    var position = getScrollPosition();
    var shouldScroll = behavior(to, from, isPop ? position : null);

    if (!shouldScroll) {
      return
    }

    if (typeof shouldScroll.then === 'function') {
      shouldScroll.then(function (shouldScroll) {
        scrollToPosition((shouldScroll), position);
      }).catch(function (err) {
        if (true) {
          assert(false, err.toString());
        }
      });
    } else {
      scrollToPosition(shouldScroll, position);
    }
  });
}

function saveScrollPosition () {
  var key = getStateKey();
  if (key) {
    positionStore[key] = {
      x: window.pageXOffset,
      y: window.pageYOffset
    };
  }
}

function getScrollPosition () {
  var key = getStateKey();
  if (key) {
    return positionStore[key]
  }
}

function getElementPosition (el, offset) {
  var docEl = document.documentElement;
  var docRect = docEl.getBoundingClientRect();
  var elRect = el.getBoundingClientRect();
  return {
    x: elRect.left - docRect.left - offset.x,
    y: elRect.top - docRect.top - offset.y
  }
}

function isValidPosition (obj) {
  return isNumber(obj.x) || isNumber(obj.y)
}

function normalizePosition (obj) {
  return {
    x: isNumber(obj.x) ? obj.x : window.pageXOffset,
    y: isNumber(obj.y) ? obj.y : window.pageYOffset
  }
}

function normalizeOffset (obj) {
  return {
    x: isNumber(obj.x) ? obj.x : 0,
    y: isNumber(obj.y) ? obj.y : 0
  }
}

function isNumber (v) {
  return typeof v === 'number'
}

function scrollToPosition (shouldScroll, position) {
  var isObject = typeof shouldScroll === 'object';
  if (isObject && typeof shouldScroll.selector === 'string') {
    var el = document.querySelector(shouldScroll.selector);
    if (el) {
      var offset = shouldScroll.offset && typeof shouldScroll.offset === 'object' ? shouldScroll.offset : {};
      offset = normalizeOffset(offset);
      position = getElementPosition(el, offset);
    } else if (isValidPosition(shouldScroll)) {
      position = normalizePosition(shouldScroll);
    }
  } else if (isObject && isValidPosition(shouldScroll)) {
    position = normalizePosition(shouldScroll);
  }

  if (position) {
    window.scrollTo(position.x, position.y);
  }
}

/*  */

var supportsPushState = inBrowser && (function () {
  var ua = window.navigator.userAgent;

  if (
    (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
    ua.indexOf('Mobile Safari') !== -1 &&
    ua.indexOf('Chrome') === -1 &&
    ua.indexOf('Windows Phone') === -1
  ) {
    return false
  }

  return window.history && 'pushState' in window.history
})();

// use User Timing api (if present) for more accurate key precision
var Time = inBrowser && window.performance && window.performance.now
  ? window.performance
  : Date;

var _key = genKey();

function genKey () {
  return Time.now().toFixed(3)
}

function getStateKey () {
  return _key
}

function setStateKey (key) {
  _key = key;
}

function pushState (url, replace) {
  saveScrollPosition();
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  var history = window.history;
  try {
    if (replace) {
      history.replaceState({ key: _key }, '', url);
    } else {
      _key = genKey();
      history.pushState({ key: _key }, '', url);
    }
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url);
  }
}

function replaceState (url) {
  pushState(url, true);
}

/*  */

function runQueue (queue, fn, cb) {
  var step = function (index) {
    if (index >= queue.length) {
      cb();
    } else {
      if (queue[index]) {
        fn(queue[index], function () {
          step(index + 1);
        });
      } else {
        step(index + 1);
      }
    }
  };
  step(0);
}

/*  */

function resolveAsyncComponents (matched) {
  return function (to, from, next) {
    var hasAsync = false;
    var pending = 0;
    var error = null;

    flatMapComponents(matched, function (def, _, match, key) {
      // if it's a function and doesn't have cid attached,
      // assume it's an async component resolve function.
      // we are not using Vue's default async resolving mechanism because
      // we want to halt the navigation until the incoming component has been
      // resolved.
      if (typeof def === 'function' && def.cid === undefined) {
        hasAsync = true;
        pending++;

        var resolve = once(function (resolvedDef) {
          if (isESModule(resolvedDef)) {
            resolvedDef = resolvedDef.default;
          }
          // save resolved on async factory in case it's used elsewhere
          def.resolved = typeof resolvedDef === 'function'
            ? resolvedDef
            : _Vue.extend(resolvedDef);
          match.components[key] = resolvedDef;
          pending--;
          if (pending <= 0) {
            next();
          }
        });

        var reject = once(function (reason) {
          var msg = "Failed to resolve async component " + key + ": " + reason;
          "development" !== 'production' && warn(false, msg);
          if (!error) {
            error = isError(reason)
              ? reason
              : new Error(msg);
            next(error);
          }
        });

        var res;
        try {
          res = def(resolve, reject);
        } catch (e) {
          reject(e);
        }
        if (res) {
          if (typeof res.then === 'function') {
            res.then(resolve, reject);
          } else {
            // new syntax in Vue 2.3
            var comp = res.component;
            if (comp && typeof comp.then === 'function') {
              comp.then(resolve, reject);
            }
          }
        }
      }
    });

    if (!hasAsync) { next(); }
  }
}

function flatMapComponents (
  matched,
  fn
) {
  return flatten(matched.map(function (m) {
    return Object.keys(m.components).map(function (key) { return fn(
      m.components[key],
      m.instances[key],
      m, key
    ); })
  }))
}

function flatten (arr) {
  return Array.prototype.concat.apply([], arr)
}

var hasSymbol =
  typeof Symbol === 'function' &&
  typeof Symbol.toStringTag === 'symbol';

function isESModule (obj) {
  return obj.__esModule || (hasSymbol && obj[Symbol.toStringTag] === 'Module')
}

// in Webpack 2, require.ensure now also returns a Promise
// so the resolve/reject functions may get called an extra time
// if the user uses an arrow function shorthand that happens to
// return that Promise.
function once (fn) {
  var called = false;
  return function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    if (called) { return }
    called = true;
    return fn.apply(this, args)
  }
}

/*  */

var History = function History (router, base) {
  this.router = router;
  this.base = normalizeBase(base);
  // start with a route object that stands for "nowhere"
  this.current = START;
  this.pending = null;
  this.ready = false;
  this.readyCbs = [];
  this.readyErrorCbs = [];
  this.errorCbs = [];
};

History.prototype.listen = function listen (cb) {
  this.cb = cb;
};

History.prototype.onReady = function onReady (cb, errorCb) {
  if (this.ready) {
    cb();
  } else {
    this.readyCbs.push(cb);
    if (errorCb) {
      this.readyErrorCbs.push(errorCb);
    }
  }
};

History.prototype.onError = function onError (errorCb) {
  this.errorCbs.push(errorCb);
};

History.prototype.transitionTo = function transitionTo (location, onComplete, onAbort) {
    var this$1 = this;

  var route = this.router.match(location, this.current);
  this.confirmTransition(route, function () {
    this$1.updateRoute(route);
    onComplete && onComplete(route);
    this$1.ensureURL();

    // fire ready cbs once
    if (!this$1.ready) {
      this$1.ready = true;
      this$1.readyCbs.forEach(function (cb) { cb(route); });
    }
  }, function (err) {
    if (onAbort) {
      onAbort(err);
    }
    if (err && !this$1.ready) {
      this$1.ready = true;
      this$1.readyErrorCbs.forEach(function (cb) { cb(err); });
    }
  });
};

History.prototype.confirmTransition = function confirmTransition (route, onComplete, onAbort) {
    var this$1 = this;

  var current = this.current;
  var abort = function (err) {
    if (isError(err)) {
      if (this$1.errorCbs.length) {
        this$1.errorCbs.forEach(function (cb) { cb(err); });
      } else {
        warn(false, 'uncaught error during route navigation:');
        console.error(err);
      }
    }
    onAbort && onAbort(err);
  };
  if (
    isSameRoute(route, current) &&
    // in the case the route map has been dynamically appended to
    route.matched.length === current.matched.length
  ) {
    this.ensureURL();
    return abort()
  }

  var ref = resolveQueue(this.current.matched, route.matched);
    var updated = ref.updated;
    var deactivated = ref.deactivated;
    var activated = ref.activated;

  var queue = [].concat(
    // in-component leave guards
    extractLeaveGuards(deactivated),
    // global before hooks
    this.router.beforeHooks,
    // in-component update hooks
    extractUpdateHooks(updated),
    // in-config enter guards
    activated.map(function (m) { return m.beforeEnter; }),
    // async components
    resolveAsyncComponents(activated)
  );

  this.pending = route;
  var iterator = function (hook, next) {
    if (this$1.pending !== route) {
      return abort()
    }
    try {
      hook(route, current, function (to) {
        if (to === false || isError(to)) {
          // next(false) -> abort navigation, ensure current URL
          this$1.ensureURL(true);
          abort(to);
        } else if (
          typeof to === 'string' ||
          (typeof to === 'object' && (
            typeof to.path === 'string' ||
            typeof to.name === 'string'
          ))
        ) {
          // next('/') or next({ path: '/' }) -> redirect
          abort();
          if (typeof to === 'object' && to.replace) {
            this$1.replace(to);
          } else {
            this$1.push(to);
          }
        } else {
          // confirm transition and pass on the value
          next(to);
        }
      });
    } catch (e) {
      abort(e);
    }
  };

  runQueue(queue, iterator, function () {
    var postEnterCbs = [];
    var isValid = function () { return this$1.current === route; };
    // wait until async components are resolved before
    // extracting in-component enter guards
    var enterGuards = extractEnterGuards(activated, postEnterCbs, isValid);
    var queue = enterGuards.concat(this$1.router.resolveHooks);
    runQueue(queue, iterator, function () {
      if (this$1.pending !== route) {
        return abort()
      }
      this$1.pending = null;
      onComplete(route);
      if (this$1.router.app) {
        this$1.router.app.$nextTick(function () {
          postEnterCbs.forEach(function (cb) { cb(); });
        });
      }
    });
  });
};

History.prototype.updateRoute = function updateRoute (route) {
  var prev = this.current;
  this.current = route;
  this.cb && this.cb(route);
  this.router.afterHooks.forEach(function (hook) {
    hook && hook(route, prev);
  });
};

function normalizeBase (base) {
  if (!base) {
    if (inBrowser) {
      // respect <base> tag
      var baseEl = document.querySelector('base');
      base = (baseEl && baseEl.getAttribute('href')) || '/';
      // strip full URL origin
      base = base.replace(/^https?:\/\/[^\/]+/, '');
    } else {
      base = '/';
    }
  }
  // make sure there's the starting slash
  if (base.charAt(0) !== '/') {
    base = '/' + base;
  }
  // remove trailing slash
  return base.replace(/\/$/, '')
}

function resolveQueue (
  current,
  next
) {
  var i;
  var max = Math.max(current.length, next.length);
  for (i = 0; i < max; i++) {
    if (current[i] !== next[i]) {
      break
    }
  }
  return {
    updated: next.slice(0, i),
    activated: next.slice(i),
    deactivated: current.slice(i)
  }
}

function extractGuards (
  records,
  name,
  bind,
  reverse
) {
  var guards = flatMapComponents(records, function (def, instance, match, key) {
    var guard = extractGuard(def, name);
    if (guard) {
      return Array.isArray(guard)
        ? guard.map(function (guard) { return bind(guard, instance, match, key); })
        : bind(guard, instance, match, key)
    }
  });
  return flatten(reverse ? guards.reverse() : guards)
}

function extractGuard (
  def,
  key
) {
  if (typeof def !== 'function') {
    // extend now so that global mixins are applied.
    def = _Vue.extend(def);
  }
  return def.options[key]
}

function extractLeaveGuards (deactivated) {
  return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
}

function extractUpdateHooks (updated) {
  return extractGuards(updated, 'beforeRouteUpdate', bindGuard)
}

function bindGuard (guard, instance) {
  if (instance) {
    return function boundRouteGuard () {
      return guard.apply(instance, arguments)
    }
  }
}

function extractEnterGuards (
  activated,
  cbs,
  isValid
) {
  return extractGuards(activated, 'beforeRouteEnter', function (guard, _, match, key) {
    return bindEnterGuard(guard, match, key, cbs, isValid)
  })
}

function bindEnterGuard (
  guard,
  match,
  key,
  cbs,
  isValid
) {
  return function routeEnterGuard (to, from, next) {
    return guard(to, from, function (cb) {
      next(cb);
      if (typeof cb === 'function') {
        cbs.push(function () {
          // #750
          // if a router-view is wrapped with an out-in transition,
          // the instance may not have been registered at this time.
          // we will need to poll for registration until current route
          // is no longer valid.
          poll(cb, match.instances, key, isValid);
        });
      }
    })
  }
}

function poll (
  cb, // somehow flow cannot infer this is a function
  instances,
  key,
  isValid
) {
  if (instances[key]) {
    cb(instances[key]);
  } else if (isValid()) {
    setTimeout(function () {
      poll(cb, instances, key, isValid);
    }, 16);
  }
}

/*  */


var HTML5History = (function (History$$1) {
  function HTML5History (router, base) {
    var this$1 = this;

    History$$1.call(this, router, base);

    var expectScroll = router.options.scrollBehavior;

    if (expectScroll) {
      setupScroll();
    }

    var initLocation = getLocation(this.base);
    window.addEventListener('popstate', function (e) {
      var current = this$1.current;

      // Avoiding first `popstate` event dispatched in some browsers but first
      // history route not updated since async guard at the same time.
      var location = getLocation(this$1.base);
      if (this$1.current === START && location === initLocation) {
        return
      }

      this$1.transitionTo(location, function (route) {
        if (expectScroll) {
          handleScroll(router, route, current, true);
        }
      });
    });
  }

  if ( History$$1 ) HTML5History.__proto__ = History$$1;
  HTML5History.prototype = Object.create( History$$1 && History$$1.prototype );
  HTML5History.prototype.constructor = HTML5History;

  HTML5History.prototype.go = function go (n) {
    window.history.go(n);
  };

  HTML5History.prototype.push = function push (location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(location, function (route) {
      pushState(cleanPath(this$1.base + route.fullPath));
      handleScroll(this$1.router, route, fromRoute, false);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HTML5History.prototype.replace = function replace (location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(location, function (route) {
      replaceState(cleanPath(this$1.base + route.fullPath));
      handleScroll(this$1.router, route, fromRoute, false);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HTML5History.prototype.ensureURL = function ensureURL (push) {
    if (getLocation(this.base) !== this.current.fullPath) {
      var current = cleanPath(this.base + this.current.fullPath);
      push ? pushState(current) : replaceState(current);
    }
  };

  HTML5History.prototype.getCurrentLocation = function getCurrentLocation () {
    return getLocation(this.base)
  };

  return HTML5History;
}(History));

function getLocation (base) {
  var path = window.location.pathname;
  if (base && path.indexOf(base) === 0) {
    path = path.slice(base.length);
  }
  return (path || '/') + window.location.search + window.location.hash
}

/*  */


var HashHistory = (function (History$$1) {
  function HashHistory (router, base, fallback) {
    History$$1.call(this, router, base);
    // check history fallback deeplinking
    if (fallback && checkFallback(this.base)) {
      return
    }
    ensureSlash();
  }

  if ( History$$1 ) HashHistory.__proto__ = History$$1;
  HashHistory.prototype = Object.create( History$$1 && History$$1.prototype );
  HashHistory.prototype.constructor = HashHistory;

  // this is delayed until the app mounts
  // to avoid the hashchange listener being fired too early
  HashHistory.prototype.setupListeners = function setupListeners () {
    var this$1 = this;

    var router = this.router;
    var expectScroll = router.options.scrollBehavior;
    var supportsScroll = supportsPushState && expectScroll;

    if (supportsScroll) {
      setupScroll();
    }

    window.addEventListener(supportsPushState ? 'popstate' : 'hashchange', function () {
      var current = this$1.current;
      if (!ensureSlash()) {
        return
      }
      this$1.transitionTo(getHash(), function (route) {
        if (supportsScroll) {
          handleScroll(this$1.router, route, current, true);
        }
        if (!supportsPushState) {
          replaceHash(route.fullPath);
        }
      });
    });
  };

  HashHistory.prototype.push = function push (location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(location, function (route) {
      pushHash(route.fullPath);
      handleScroll(this$1.router, route, fromRoute, false);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HashHistory.prototype.replace = function replace (location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(location, function (route) {
      replaceHash(route.fullPath);
      handleScroll(this$1.router, route, fromRoute, false);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HashHistory.prototype.go = function go (n) {
    window.history.go(n);
  };

  HashHistory.prototype.ensureURL = function ensureURL (push) {
    var current = this.current.fullPath;
    if (getHash() !== current) {
      push ? pushHash(current) : replaceHash(current);
    }
  };

  HashHistory.prototype.getCurrentLocation = function getCurrentLocation () {
    return getHash()
  };

  return HashHistory;
}(History));

function checkFallback (base) {
  var location = getLocation(base);
  if (!/^\/#/.test(location)) {
    window.location.replace(
      cleanPath(base + '/#' + location)
    );
    return true
  }
}

function ensureSlash () {
  var path = getHash();
  if (path.charAt(0) === '/') {
    return true
  }
  replaceHash('/' + path);
  return false
}

function getHash () {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  var href = window.location.href;
  var index = href.indexOf('#');
  return index === -1 ? '' : href.slice(index + 1)
}

function getUrl (path) {
  var href = window.location.href;
  var i = href.indexOf('#');
  var base = i >= 0 ? href.slice(0, i) : href;
  return (base + "#" + path)
}

function pushHash (path) {
  if (supportsPushState) {
    pushState(getUrl(path));
  } else {
    window.location.hash = path;
  }
}

function replaceHash (path) {
  if (supportsPushState) {
    replaceState(getUrl(path));
  } else {
    window.location.replace(getUrl(path));
  }
}

/*  */


var AbstractHistory = (function (History$$1) {
  function AbstractHistory (router, base) {
    History$$1.call(this, router, base);
    this.stack = [];
    this.index = -1;
  }

  if ( History$$1 ) AbstractHistory.__proto__ = History$$1;
  AbstractHistory.prototype = Object.create( History$$1 && History$$1.prototype );
  AbstractHistory.prototype.constructor = AbstractHistory;

  AbstractHistory.prototype.push = function push (location, onComplete, onAbort) {
    var this$1 = this;

    this.transitionTo(location, function (route) {
      this$1.stack = this$1.stack.slice(0, this$1.index + 1).concat(route);
      this$1.index++;
      onComplete && onComplete(route);
    }, onAbort);
  };

  AbstractHistory.prototype.replace = function replace (location, onComplete, onAbort) {
    var this$1 = this;

    this.transitionTo(location, function (route) {
      this$1.stack = this$1.stack.slice(0, this$1.index).concat(route);
      onComplete && onComplete(route);
    }, onAbort);
  };

  AbstractHistory.prototype.go = function go (n) {
    var this$1 = this;

    var targetIndex = this.index + n;
    if (targetIndex < 0 || targetIndex >= this.stack.length) {
      return
    }
    var route = this.stack[targetIndex];
    this.confirmTransition(route, function () {
      this$1.index = targetIndex;
      this$1.updateRoute(route);
    });
  };

  AbstractHistory.prototype.getCurrentLocation = function getCurrentLocation () {
    var current = this.stack[this.stack.length - 1];
    return current ? current.fullPath : '/'
  };

  AbstractHistory.prototype.ensureURL = function ensureURL () {
    // noop
  };

  return AbstractHistory;
}(History));

/*  */

var VueRouter = function VueRouter (options) {
  if ( options === void 0 ) options = {};

  this.app = null;
  this.apps = [];
  this.options = options;
  this.beforeHooks = [];
  this.resolveHooks = [];
  this.afterHooks = [];
  this.matcher = createMatcher(options.routes || [], this);

  var mode = options.mode || 'hash';
  this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false;
  if (this.fallback) {
    mode = 'hash';
  }
  if (!inBrowser) {
    mode = 'abstract';
  }
  this.mode = mode;

  switch (mode) {
    case 'history':
      this.history = new HTML5History(this, options.base);
      break
    case 'hash':
      this.history = new HashHistory(this, options.base, this.fallback);
      break
    case 'abstract':
      this.history = new AbstractHistory(this, options.base);
      break
    default:
      if (true) {
        assert(false, ("invalid mode: " + mode));
      }
  }
};

var prototypeAccessors = { currentRoute: { configurable: true } };

VueRouter.prototype.match = function match (
  raw,
  current,
  redirectedFrom
) {
  return this.matcher.match(raw, current, redirectedFrom)
};

prototypeAccessors.currentRoute.get = function () {
  return this.history && this.history.current
};

VueRouter.prototype.init = function init (app /* Vue component instance */) {
    var this$1 = this;

  "development" !== 'production' && assert(
    install.installed,
    "not installed. Make sure to call `Vue.use(VueRouter)` " +
    "before creating root instance."
  );

  this.apps.push(app);

  // main app already initialized.
  if (this.app) {
    return
  }

  this.app = app;

  var history = this.history;

  if (history instanceof HTML5History) {
    history.transitionTo(history.getCurrentLocation());
  } else if (history instanceof HashHistory) {
    var setupHashListener = function () {
      history.setupListeners();
    };
    history.transitionTo(
      history.getCurrentLocation(),
      setupHashListener,
      setupHashListener
    );
  }

  history.listen(function (route) {
    this$1.apps.forEach(function (app) {
      app._route = route;
    });
  });
};

VueRouter.prototype.beforeEach = function beforeEach (fn) {
  return registerHook(this.beforeHooks, fn)
};

VueRouter.prototype.beforeResolve = function beforeResolve (fn) {
  return registerHook(this.resolveHooks, fn)
};

VueRouter.prototype.afterEach = function afterEach (fn) {
  return registerHook(this.afterHooks, fn)
};

VueRouter.prototype.onReady = function onReady (cb, errorCb) {
  this.history.onReady(cb, errorCb);
};

VueRouter.prototype.onError = function onError (errorCb) {
  this.history.onError(errorCb);
};

VueRouter.prototype.push = function push (location, onComplete, onAbort) {
  this.history.push(location, onComplete, onAbort);
};

VueRouter.prototype.replace = function replace (location, onComplete, onAbort) {
  this.history.replace(location, onComplete, onAbort);
};

VueRouter.prototype.go = function go (n) {
  this.history.go(n);
};

VueRouter.prototype.back = function back () {
  this.go(-1);
};

VueRouter.prototype.forward = function forward () {
  this.go(1);
};

VueRouter.prototype.getMatchedComponents = function getMatchedComponents (to) {
  var route = to
    ? to.matched
      ? to
      : this.resolve(to).route
    : this.currentRoute;
  if (!route) {
    return []
  }
  return [].concat.apply([], route.matched.map(function (m) {
    return Object.keys(m.components).map(function (key) {
      return m.components[key]
    })
  }))
};

VueRouter.prototype.resolve = function resolve (
  to,
  current,
  append
) {
  var location = normalizeLocation(
    to,
    current || this.history.current,
    append,
    this
  );
  var route = this.match(location, current);
  var fullPath = route.redirectedFrom || route.fullPath;
  var base = this.history.base;
  var href = createHref(base, fullPath, this.mode);
  return {
    location: location,
    route: route,
    href: href,
    // for backwards compat
    normalizedTo: location,
    resolved: route
  }
};

VueRouter.prototype.addRoutes = function addRoutes (routes) {
  this.matcher.addRoutes(routes);
  if (this.history.current !== START) {
    this.history.transitionTo(this.history.getCurrentLocation());
  }
};

Object.defineProperties( VueRouter.prototype, prototypeAccessors );

function registerHook (list, fn) {
  list.push(fn);
  return function () {
    var i = list.indexOf(fn);
    if (i > -1) { list.splice(i, 1); }
  }
}

function createHref (base, fullPath, mode) {
  var path = mode === 'hash' ? '#' + fullPath : fullPath;
  return base ? cleanPath(base + '/' + path) : path
}

VueRouter.install = install;
VueRouter.version = '2.8.1';

if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter);
}

/* harmony default export */ __webpack_exports__["default"] = (VueRouter);


/***/ }),
/* 175 */,
/* 176 */
/***/ (function(module, exports) {

!function(t){function e(o){if(n[o])return n[o].exports;var i=n[o]={exports:{},id:o,loaded:!1};return t[o].call(i.exports,i,i.exports,e),i.loaded=!0,i.exports}var n={};return e.m=t,e.c=n,e.p="",e(0)}({0:function(t,e,n){"use strict";function o(t){return t&&t.__esModule?t:{default:t}}function i(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function r(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function _(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),u=n(43),T=o(u),s=n(2),E=o(s),c=n(5),O=o(c);n(46),function(){function t(t){var e=Object.getPrototypeOf(this);e.message=t,e.name="UnmatchedParameterTypeError"}function e(t){var e=Object.getPrototypeOf(this);e.message=t,e.name="NotSupportedEventTypeError"}function n(t){var e=Object.getPrototypeOf(this);e.message=t,e.name="OutOfSwitchCaseException"}function o(t){var e=Object.getPrototypeOf(this);e.message=t,e.name="NullParameterException"}function u(t){var e=Object.getPrototypeOf(this);e.message=t,e.name="UndefinedParameterException"}function s(t,e,n){var o=p[t];return Array.isArray(o)&&(o=o[0]),o.hasOwnProperty(e)&&o[e].hasOwnProperty(n)?le[o[e][n]]||le[5]:le[1]}var c={ZONES:"zones",SUPPORTED:"supported",AVAILABLE_FOR_RETRIEVALS:"availableForRetrievals",AVAILABLE_FOR_SETTINGS:"availableForSettings",AVAILABLE_FOR_SUBSCRIPTIONS:"availableForSubscriptions",IDENTIFICATION:"identification",SIZE_CONFIGURATION:"sizeConfiguration",FUEL_CONFIGURATION:"fuelConfiguration",TRANSMISSION_CONFIGURATION:"transmissionConfiguration",WHEEL_CONFIGURATION:"wheelConfiguration",STEERING_WHEEL_CONFIGURATION:"steeringWheelConfiguration",VEHICLE_SPEED:"vehicleSpeed",WHEEL_SPEED:"wheelSpeed",ENGINE_SPEED:"engineSpeed",VEHICLE_POWER_MODE_TYPE:"vehiclePowerModeType",POWER_TRAIN_TORQUE:"powertrainTorque",ACCELERATOR_PEDAL_POSITION:"acceleratorPedalPosition",THROTTLE_POSITION:"throttlePosition",TRIP_METERS:"tripMeters",TRANSMISSION:"transmission",CRUISE_CONTROL_STATUS:"cruiseControlStatus",LIGHT_STATUS:"lightStatus",INTERIOR_LIGHT_STATUS:"interiorLightStatus",HORN:"horn",CHIME:"chime",FUEL:"fuel",ENGINE_OIL:"engineOil",ACCELERATION:"acceleration",ENGINE_COOLANT:"engineCoolant",STEERING_WHEEL:"steeringWheel",WHEEL_TICK:"wheelTick",IGNITION_TIME:"ignitionTime",YAW_RATE:"yawRate",BRAKE_OPERATION:"brakeOperation",BUTTON_EVENT:"buttonEvent",DRIVING_MODE:"drivingMode",NIGHT_MODE:"nightMode",ADVISOR:"advisor",AUTO_PHASE:"autoPhase",CLUTCH_SWITCH:"clutchSwitch",EFFECTIVE_TORQUE:"effectiveTorque",ENGINE_CONTROL:"engineControl",ENGINE_STATUS:"engineStatus",FLUENT_DRIVING:"fluentDriving",GLOBAL_WARNING:"globalWarning",GSI:"gsi",METER_ADAC:"meterADAC",POWER_TRAIN:"powerTrain",RANGE_INDICATION:"rangeIndication",TIRE_TORQUE:"tireTorque",VEHICLE_STATE:"vehicleState",WATER:"water",CLUSTER_VEHICLE_SPEED:"clusterVehicleSpeed",ODOMETER:"odometer",TRANSMISSION_OIL:"transmissionOil",TRANSMISSION_CLUTCH:"transmissionClutch",BRAKE_MAINTENANCE:"brakeMaintenance",WASHER_FLUID:"washerFluid",MALFUNCTION_INDICATOR:"malfunctionIndicator",BATTERY_STATUS:"batteryStatus",TIRE:"tire",DIAGNOSTIC:"diagnostic",LONGITUDINAL_ACCEL:"longitudinalAccel",OVERHAUL:"overhaul",LANGUAGE_CONFIGURATION:"languageConfiguration",UNITS_OF_MEASURE:"unitsOfMeasure",MIRROR:"mirror",SEAT_ADJUSTMENT:"seatAdjustment",DRIVE_MODE:"driveMode",DASHBOARD_ILLUMINATION:"dashboardIllumination",VEHICLE_SOUND:"vehicleSound",ECO_SCORES:"ecoScores",NIGHT_RHEO_STATED_LIGHT:"nightRheoStatedLight",ANTILOCK_BRAKING_SYSTEM:"antilockBrakingSystem",TRACTION_CONTROL_SYSTEM:"tractionControlSystem",ELECTRONIC_STABILITY_CONTROL:"electronicStabilityControl",TOP_SPEED_LIMIT:"topSpeedLimit",AIRBAG_STATUS:"airbagStatus",DOOR:"door",CHILD_SAFETY_LOCK:"childSafetyLock",SEAT:"seat",TEMPERATURE:"temperature",RAIN_SENSOR:"rainSensor",WIPER_STATUS:"wiperStatus",WIPER_SETTING:"wiperSetting",DEFROST:"defrost",SUNROOF:"sunroof",CONVERTIBLE_ROOF:"convertibleRoof",SIDE_WINDOW:"sideWindow",CLIMATE_CONTROL:"climateControl",ATMOSPHERIC_PRESSURE:"atmosphericPressure",ASR:"asr",AYC:"ayc",EBD:"ebd",EPS:"eps",TAIL_GATE:"tailGate",VDC:"vdc",LANE_DEPARTURE_DETECTION:"laneDepartureDetection",ALARM:"alarm",PARKING_BRAKE:"parkingBrake",PARKING_LIGHTS:"parkingLights",NEUTRAL_CONTACT:"neutralContact",RAW_SENSOR:"rawSensor",BRAKE_SWITCH:"brakeSwitch"},I=0,l=2,p={size:0,zones:null,supported:null,availableForRetrievals:null,availableForSettings:null,availableForSubscriptions:null},f=window.vehicle,h=new window.Zone,N=function t(e,n){_(this,t),this.error=e,this.message=n},R=function(){function t(e,n,o,i){_(this,t),this.supported=e||!1,this.zones=n,this.me={eventType:o},this.me.__proto__={zones:i}}return a(t,[{key:"get",value:function(){var t=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;if(!this.supported||this.zones<0)throw new e(this.me.eventType+" is not supported");var o=void 0,i=void 0,r=void 0,_=0;return new window.Promise(function(e,a){o=function(n){var o=n,i=Array.isArray(o);if(r=h.bitToZoneToBit(h.BIT_TO_ZONE_GET,o),i){_=o.length;for(var a=0;a<_;a++)o[a].hasOwnProperty("zone")&&(o[a].zone=r[a])}else o.hasOwnProperty("zone")&&(o.zone=r[0]);if("fuelConfiguration"===t.me.eventType){var u=[];for(var T in h.zones)o.refuelPosition&h.zones[T]&&u.push(T);o.refuelPosition=new window.Zone(u)}e(o)},i=function(t){a(new N(t.code,t.message))};var u=null===n?t.me.__proto__.zones:h.bitToZoneToBit(l,n);f.get(t.me.eventType,{zone:u},o,i)})}},{key:"availableForRetrieval",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;if(null===t)throw new o("During "+this.me.eventType+".availableForRetrieval()");if(void 0===t)throw new u("During "+this.me.eventType+".availableForRetrieval()");return s(c.AVAILABLE_FOR_RETRIEVALS,this.me.eventType,t)}}]),t}(),S=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(R),A=function(t){function n(){return _(this,n),i(this,(n.__proto__||Object.getPrototypeOf(n)).apply(this,arguments))}return r(n,t),a(n,[{key:"set",value:function(t){var n=this,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(!this.supported||this.zones<0)throw new e(this.me.eventType+" is not supported");return new window.Promise(function(t,e){var i=function(e){t(e)},r=function(t){e(new N(t.code,t.message))};f.set(n.me.eventType,null===o?null:h.bitToZoneToBit(l,o),i,r)})}},{key:"subscribe",value:function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(!this.supported||this.zones<0)throw new e(this.me.eventType+" is not supported");if(null===t)throw new o("During "+this.me.eventType+".subscribe()");if(void 0===t)throw new u("During "+this.me.eventType+".subscribe()");return f.addListener(this.me.eventType,null===n?null:h.bitToZoneToBit(l,n),t)}},{key:"unsubscribe",value:function(t){if(!this.supported||this.zones<0)throw new e(this.me.eventType+" is not supported");if(null===t)throw new o("During "+this.me.eventType+".unsubscribe()");if(void 0===t)throw new u("During "+this.me.eventType+".unsubscribe()");return f.removeListener(this.me.eventType,t)}},{key:"availableForSetting",value:function(t){if(null===t)throw new o("During "+this.me.eventType+".availableForSetting()");if(void 0===t)throw new u("During "+this.me.eventType+".availableForSetting()");return s(c.AVAILABLE_FOR_SETTINGS,this.me.eventType,t)}},{key:"availableForSubscription",value:function(t){if(null===t)throw new o("During "+this.me.eventType+".availableForSubscription()");if(void 0===t)throw new u("During "+this.me.eventType+".availableForSubscription()");return s(c.AVAILABLE_FOR_SUBSCRIPTIONS,this.me.eventType,t)}}]),n}(R),g=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(S),y=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(S),C=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(S),v=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(S),w=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(S),d=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(S),L=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),b=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),P=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),D=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),U=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),G=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),m=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),B=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),M=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),H=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),F=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),j=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),W=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Z=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),V=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),k=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),K=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Y=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),z=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),J=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),x=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Q=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),q=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),X=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),$=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),tt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),et=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),nt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),ot=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),it=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),rt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),_t=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),at=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),ut=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Tt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),st=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Et=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),ct=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Ot=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),It=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),lt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),pt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),ft=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),ht=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Nt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Rt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),St=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),At=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),gt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),yt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Ct=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),vt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),wt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),dt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Lt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),bt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Pt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Dt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Ut=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Gt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),mt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Bt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(S),Mt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Ht=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Ft=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),jt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Wt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Zt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Vt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),kt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Kt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Yt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),zt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Jt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),xt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Qt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),qt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Xt=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),$t=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),te=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),ee=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),ne=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),oe=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),ie=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),re=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),_e=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),ae=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),ue=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Te=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),se=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Ee=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),ce=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Oe=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(A),Ie=function(t){function e(){return _(this,e),i(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return r(e,t),e}(T.default),le=[];le.push("available"),le.push("not_supported"),le.push("not_supported_yet"),le.push("not_supported_security_policy"),le.push("not_supported_business_policy"),le.push("not_supported_other");var pe={name:"vehicle",version:"2.1.1.9",start:function(e,n,o){function i(){var t=[],e=!1;p.size=0,t.push(c.SUPPORTED),t.push(c.ZONES),t.push(c.AVAILABLE_FOR_RETRIEVALS),t.push(c.AVAILABLE_FOR_SETTINGS),t.push(c.AVAILABLE_FOR_SUBSCRIPTIONS);var n=function(n){if(e)return"break";var o=t[n];f.get(o,null,function(e){p[o]=e,p.size++,E.default.debug&&console.log(o+" is ready"),p.size===t.length&&a(p)},function(t){e=!0,function(t,e){console.error("("+e+") Based-data Collection Error \n                => errorCode:"+t.code+"\n                => message:"+t.message)}(t,o)})};for(var o in t){var i=n(o);if("break"===i)break}}function r(t){"function"==typeof o?o(t):console.warn("["+pe.name+"] close_callback is called ---- %")}function _(t){"function"==typeof n?n(t):console.error("["+pe.name+"] error_callback is called")}function a(t){E.default.info&&console.info("%c === Hello Vehicle ===","color:dodgerblue");var n=t.supported,o=t.zones;Array.isArray(n)&&(n=n[0]),Array.isArray(o)&&(o=o[0]);try{window.navigator.vehicle[c.IDENTIFICATION]=new g(n[c.IDENTIFICATION],h.bitToZoneToBit(I,o[c.IDENTIFICATION]),c.IDENTIFICATION,o[c.IDENTIFICATION]),window.navigator.vehicle[c.SIZE_CONFIGURATION]=new y(n[c.SIZE_CONFIGURATION],h.bitToZoneToBit(I,o[c.SIZE_CONFIGURATION]),c.SIZE_CONFIGURATION,o[c.SIZE_CONFIGURATION]),window.navigator.vehicle[c.FUEL_CONFIGURATION]=new C(n[c.FUEL_CONFIGURATION],h.bitToZoneToBit(I,o[c.FUEL_CONFIGURATION]),c.FUEL_CONFIGURATION,o[c.FUEL_CONFIGURATION]),window.navigator.vehicle[c.TRANSMISSION_CONFIGURATION]=new v(n[c.TRANSMISSION_CONFIGURATION],h.bitToZoneToBit(I,o[c.TRANSMISSION_CONFIGURATION]),c.TRANSMISSION_CONFIGURATION,o[c.TRANSMISSION_CONFIGURATION]),window.navigator.vehicle[c.WHEEL_CONFIGURATION]=new w(n[c.WHEEL_CONFIGURATION],h.bitToZoneToBit(I,o[c.WHEEL_CONFIGURATION]),c.WHEEL_CONFIGURATION,o[c.WHEEL_CONFIGURATION]),window.navigator.vehicle[c.STEERING_WHEEL_CONFIGURATION]=new d(n[c.STEERING_WHEEL_CONFIGURATION],h.bitToZoneToBit(I,o[c.STEERING_WHEEL_CONFIGURATION]),c.STEERING_WHEEL_CONFIGURATION,o[c.STEERING_WHEEL_CONFIGURATION])}catch(t){console.error(t)}try{window.navigator.vehicle[c.VEHICLE_SPEED]=new b(n[c.VEHICLE_SPEED],h.bitToZoneToBit(I,o[c.VEHICLE_SPEED]),c.VEHICLE_SPEED,o[c.VEHICLE_SPEED]),window.navigator.vehicle[c.WHEEL_SPEED]=new P(n[c.WHEEL_SPEED],h.bitToZoneToBit(I,o[c.WHEEL_SPEED]),c.WHEEL_SPEED,o[c.WHEEL_SPEED]),window.navigator.vehicle[c.ENGINE_SPEED]=new D(n[c.ENGINE_SPEED],h.bitToZoneToBit(I,o[c.ENGINE_SPEED]),c.ENGINE_SPEED,o[c.ENGINE_SPEED]),window.navigator.vehicle[c.VEHICLE_POWER_MODE_TYPE]=new U(n[c.VEHICLE_POWER_MODE_TYPE],h.bitToZoneToBit(I,o[c.VEHICLE_POWER_MODE_TYPE]),c.VEHICLE_POWER_MODE_TYPE,o[c.VEHICLE_POWER_MODE_TYPE]),window.navigator.vehicle[c.POWER_TRAIN_TORQUE]=new G(n[c.POWER_TRAIN_TORQUE],h.bitToZoneToBit(I,o[c.POWER_TRAIN_TORQUE]),c.POWER_TRAIN_TORQUE,o[c.POWER_TRAIN_TORQUE]),window.navigator.vehicle[c.ACCELERATOR_PEDAL_POSITION]=new m(n[c.ACCELERATOR_PEDAL_POSITION],h.bitToZoneToBit(I,o[c.ACCELERATOR_PEDAL_POSITION]),c.ACCELERATOR_PEDAL_POSITION,o[c.ACCELERATOR_PEDAL_POSITION]),window.navigator.vehicle[c.THROTTLE_POSITION]=new B(n[c.THROTTLE_POSITION],h.bitToZoneToBit(I,o[c.THROTTLE_POSITION]),c.THROTTLE_POSITION,o[c.THROTTLE_POSITION]),window.navigator.vehicle[c.TRIP_METERS]=new M(n[c.TRIP_METERS],h.bitToZoneToBit(I,o[c.TRIP_METERS]),c.TRIP_METERS,o[c.TRIP_METERS]),window.navigator.vehicle[c.TRANSMISSION]=new H(n[c.TRANSMISSION],h.bitToZoneToBit(I,o[c.TRANSMISSION]),c.TRANSMISSION,o[c.TRANSMISSION]),window.navigator.vehicle[c.CRUISE_CONTROL_STATUS]=new F(n[c.CRUISE_CONTROL_STATUS],h.bitToZoneToBit(I,o[c.CRUISE_CONTROL_STATUS]),c.CRUISE_CONTROL_STATUS,o[c.CRUISE_CONTROL_STATUS]),window.navigator.vehicle[c.LIGHT_STATUS]=new j(n[c.LIGHT_STATUS],h.bitToZoneToBit(I,o[c.LIGHT_STATUS]),c.LIGHT_STATUS,o[c.LIGHT_STATUS]),window.navigator.vehicle[c.INTERIOR_LIGHT_STATUS]=new W(n[c.INTERIOR_LIGHT_STATUS],h.bitToZoneToBit(I,o[c.INTERIOR_LIGHT_STATUS]),c.INTERIOR_LIGHT_STATUS,o[c.INTERIOR_LIGHT_STATUS]),window.navigator.vehicle[c.HORN]=new Z(n[c.HORN],h.bitToZoneToBit(I,o[c.HORN]),c.HORN,o[c.HORN]),window.navigator.vehicle[c.CHIME]=new V(n[c.CHIME],h.bitToZoneToBit(I,o[c.CHIME]),c.CHIME,o[c.CHIME]),window.navigator.vehicle[c.FUEL]=new k(n[c.FUEL],h.bitToZoneToBit(I,o[c.FUEL]),c.FUEL,o[c.FUEL]),window.navigator.vehicle[c.ENGINE_OIL]=new K(n[c.ENGINE_OIL],h.bitToZoneToBit(I,o[c.ENGINE_OIL]),c.ENGINE_OIL,o[c.ENGINE_OIL]),window.navigator.vehicle[c.ACCELERATION]=new Y(n[c.ACCELERATION],h.bitToZoneToBit(I,o[c.ACCELERATION]),c.ACCELERATION,o[c.ACCELERATION]),window.navigator.vehicle[c.ENGINE_COOLANT]=new z(n[c.ENGINE_COOLANT],h.bitToZoneToBit(I,o[c.ENGINE_COOLANT]),c.ENGINE_COOLANT,o[c.ENGINE_COOLANT]),window.navigator.vehicle[c.STEERING_WHEEL]=new J(n[c.STEERING_WHEEL],h.bitToZoneToBit(I,o[c.STEERING_WHEEL]),c.STEERING_WHEEL,o[c.STEERING_WHEEL]),window.navigator.vehicle[c.IGNITION_TIME]=new x(n[c.IGNITION_TIME],h.bitToZoneToBit(I,o[c.IGNITION_TIME]),c.IGNITION_TIME,o[c.IGNITION_TIME]),window.navigator.vehicle[c.YAW_RATE]=new Q(n[c.YAW_RATE],h.bitToZoneToBit(I,o[c.YAW_RATE]),c.YAW_RATE,o[c.YAW_RATE]),window.navigator.vehicle[c.BRAKE_OPERATION]=new q(n[c.BRAKE_OPERATION],h.bitToZoneToBit(I,o[c.BRAKE_OPERATION]),c.BRAKE_OPERATION,o[c.BRAKE_OPERATION]),window.navigator.vehicle[c.WHEEL_TICK]=new X(n[c.WHEEL_TICK],h.bitToZoneToBit(I,o[c.WHEEL_TICK]),c.WHEEL_TICK,o[c.WHEEL_TICK]),window.navigator.vehicle[c.BUTTON_EVENT]=new $(n[c.BUTTON_EVENT],h.bitToZoneToBit(I,o[c.BUTTON_EVENT]),c.BUTTON_EVENT,o[c.BUTTON_EVENT]),window.navigator.vehicle[c.DRIVING_MODE]=new tt(n[c.DRIVING_MODE],h.bitToZoneToBit(I,o[c.DRIVING_MODE]),c.DRIVING_MODE,o[c.DRIVING_MODE]),window.navigator.vehicle[c.NIGHT_MODE]=new et(n[c.NIGHT_MODE],h.bitToZoneToBit(I,o[c.NIGHT_MODE]),c.NIGHT_MODE,o[c.NIGHT_MODE])}catch(t){console.error(t)}try{window.navigator.vehicle[c.ADVISOR]=new nt(n[c.ADVISOR],h.bitToZoneToBit(I,o[c.ADVISOR]),c.ADVISOR,o[c.ADVISOR]),window.navigator.vehicle[c.AUTO_PHASE]=new ot(n[c.AUTO_PHASE],h.bitToZoneToBit(I,o[c.AUTO_PHASE]),c.AUTO_PHASE,o[c.AUTO_PHASE]),window.navigator.vehicle[c.CLUTCH_SWITCH]=new it(n[c.CLUTCH_SWITCH],h.bitToZoneToBit(I,o[c.CLUTCH_SWITCH]),c.CLUTCH_SWITCH,o[c.CLUTCH_SWITCH]),window.navigator.vehicle[c.EFFECTIVE_TORQUE]=new rt(n[c.EFFECTIVE_TORQUE],h.bitToZoneToBit(I,o[c.EFFECTIVE_TORQUE]),c.EFFECTIVE_TORQUE,o[c.EFFECTIVE_TORQUE]),window.navigator.vehicle[c.ENGINE_CONTROL]=new _t(n[c.ENGINE_CONTROL],h.bitToZoneToBit(I,o[c.ENGINE_CONTROL]),c.ENGINE_CONTROL,o[c.ENGINE_CONTROL]),window.navigator.vehicle[c.ENGINE_STATUS]=new at(n[c.ENGINE_STATUS],h.bitToZoneToBit(I,o[c.ENGINE_STATUS]),c.ENGINE_STATUS,o[c.ENGINE_STATUS]),window.navigator.vehicle[c.FLUENT_DRIVING]=new ut(n[c.FLUENT_DRIVING],h.bitToZoneToBit(I,o[c.FLUENT_DRIVING]),c.FLUENT_DRIVING,o[c.FLUENT_DRIVING]),window.navigator.vehicle[c.GLOBAL_WARNING]=new Tt(n[c.GLOBAL_WARNING],h.bitToZoneToBit(I,o[c.GLOBAL_WARNING]),c.GLOBAL_WARNING,o[c.GLOBAL_WARNING]),window.navigator.vehicle[c.GSI]=new st(n[c.GSI],h.bitToZoneToBit(I,o[c.GSI]),c.GSI,o[c.GSI]),window.navigator.vehicle[c.METER_ADAC]=new Et(n[c.METER_ADAC],h.bitToZoneToBit(I,o[c.METER_ADAC]),c.METER_ADAC,o[c.METER_ADAC]),window.navigator.vehicle[c.POWER_TRAIN]=new ct(n[c.POWER_TRAIN],h.bitToZoneToBit(I,o[c.POWER_TRAIN]),c.POWER_TRAIN,o[c.POWER_TRAIN]),window.navigator.vehicle[c.RANGE_INDICATION]=new Ot(n[c.RANGE_INDICATION],h.bitToZoneToBit(I,o[c.RANGE_INDICATION]),c.RANGE_INDICATION,o[c.RANGE_INDICATION]),window.navigator.vehicle[c.TIRE_TORQUE]=new It(n[c.TIRE_TORQUE],h.bitToZoneToBit(I,o[c.TIRE_TORQUE]),c.TIRE_TORQUE,o[c.TIRE_TORQUE]),window.navigator.vehicle[c.VEHICLE_STATE]=new lt(n[c.VEHICLE_STATE],h.bitToZoneToBit(I,o[c.VEHICLE_STATE]),c.VEHICLE_STATE,o[c.VEHICLE_STATE]),window.navigator.vehicle[c.WATER]=new pt(n[c.WATER],h.bitToZoneToBit(I,o[c.WATER]),c.WATER,o[c.WATER]),window.navigator.vehicle[c.CLUSTER_VEHICLE_SPEED]=new L(n[c.CLUSTER_VEHICLE_SPEED],h.bitToZoneToBit(I,o[c.CLUSTER_VEHICLE_SPEED]),c.CLUSTER_VEHICLE_SPEED,o[c.CLUSTER_VEHICLE_SPEED])}catch(t){console.error(t)}try{window.navigator.vehicle[c.ODOMETER]=new ft(n[c.ODOMETER],h.bitToZoneToBit(I,o[c.ODOMETER]),c.ODOMETER,o[c.ODOMETER]),window.navigator.vehicle[c.TRANSMISSION_OIL]=new ht(n[c.TRANSMISSION_OIL],h.bitToZoneToBit(I,o[c.TRANSMISSION_OIL]),c.TRANSMISSION_OIL,o[c.TRANSMISSION_OIL]),window.navigator.vehicle[c.TRANSMISSION_CLUTCH]=new Nt(n[c.TRANSMISSION_CLUTCH],h.bitToZoneToBit(I,o[c.TRANSMISSION_CLUTCH]),c.TRANSMISSION_CLUTCH,o[c.TRANSMISSION_CLUTCH]),window.navigator.vehicle[c.BRAKE_MAINTENANCE]=new Rt(n[c.BRAKE_MAINTENANCE],h.bitToZoneToBit(I,o[c.BRAKE_MAINTENANCE]),c.BRAKE_MAINTENANCE,o[c.BRAKE_MAINTENANCE]),window.navigator.vehicle[c.WASHER_FLUID]=new St(n[c.WASHER_FLUID],h.bitToZoneToBit(I,o[c.WASHER_FLUID]),c.WASHER_FLUID,o[c.WASHER_FLUID]),window.navigator.vehicle[c.MALFUNCTION_INDICATOR]=new At(n[c.MALFUNCTION_INDICATOR],h.bitToZoneToBit(I,o[c.MALFUNCTION_INDICATOR]),c.MALFUNCTION_INDICATOR,o[c.MALFUNCTION_INDICATOR]),window.navigator.vehicle[c.BATTERY_STATUS]=new gt(n[c.BATTERY_STATUS],h.bitToZoneToBit(I,o[c.BATTERY_STATUS]),c.BATTERY_STATUS,o[c.BATTERY_STATUS]),window.navigator.vehicle[c.TIRE]=new yt(n[c.TIRE],h.bitToZoneToBit(I,o[c.TIRE]),c.TIRE,o[c.TIRE]),window.navigator.vehicle[c.DIAGNOSTIC]=new Ct(n[c.DIAGNOSTIC],h.bitToZoneToBit(I,o[c.DIAGNOSTIC]),c.DIAGNOSTIC,o[c.DIAGNOSTIC])}catch(t){console.error(t)}try{navigator.vehicle[c.LONGITUDINAL_ACCEL]=new vt(n[c.LONGITUDINAL_ACCEL],h.bitToZoneToBit(I,o[c.LONGITUDINAL_ACCEL]),c.LONGITUDINAL_ACCEL,o[c.LONGITUDINAL_ACCEL]),navigator.vehicle[c.OVERHAUL]=new wt(n[c.OVERHAUL],h.bitToZoneToBit(I,o[c.OVERHAUL]),c.OVERHAUL,o[c.OVERHAUL])}catch(t){console.error(t)}try{window.navigator.vehicle[c.LANGUAGE_CONFIGURATION]=new dt(n[c.LANGUAGE_CONFIGURATION],h.bitToZoneToBit(I,o[c.LANGUAGE_CONFIGURATION]),c.LANGUAGE_CONFIGURATION,o[c.LANGUAGE_CONFIGURATION]),window.navigator.vehicle[c.UNITS_OF_MEASURE]=new Lt(n[c.UNITS_OF_MEASURE],h.bitToZoneToBit(I,o[c.UNITS_OF_MEASURE]),c.UNITS_OF_MEASURE,o[c.UNITS_OF_MEASURE]),window.navigator.vehicle[c.MIRROR]=new bt(n[c.MIRROR],h.bitToZoneToBit(I,o[c.MIRROR]),c.MIRROR,o[c.MIRROR]),
window.navigator.vehicle[c.DRIVE_MODE]=new Dt(n[c.DRIVE_MODE],h.bitToZoneToBit(I,o[c.DRIVE_MODE]),c.DRIVE_MODE,o[c.DRIVE_MODE]),window.navigator.vehicle[c.SEAT_ADJUSTMENT]=new Pt(n[c.SEAT_ADJUSTMENT],h.bitToZoneToBit(I,o[c.SEAT_ADJUSTMENT]),c.SEAT_ADJUSTMENT,o[c.SEAT_ADJUSTMENT]),window.navigator.vehicle[c.DASHBOARD_ILLUMINATION]=new Ut(n[c.DASHBOARD_ILLUMINATION],h.bitToZoneToBit(I,o[c.DASHBOARD_ILLUMINATION]),c.DASHBOARD_ILLUMINATION,o[c.DASHBOARD_ILLUMINATION]),window.navigator.vehicle[c.VEHICLE_SOUND]=new Gt(n[c.VEHICLE_SOUND],h.bitToZoneToBit(I,o[c.VEHICLE_SOUND]),c.VEHICLE_SOUND,o[c.VEHICLE_SOUND])}catch(t){console.error(t)}try{window.navigator.vehicle[c.ECO_SCORES]=new Bt(n[c.ECO_SCORES],h.bitToZoneToBit(I,o[c.ECO_SCORES]),c.ECO_SCORES,o[c.ECO_SCORES]),window.navigator.vehicle[c.NIGHT_RHEO_STATED_LIGHT]=new mt(n[c.NIGHT_RHEO_STATED_LIGHT],h.bitToZoneToBit(I,o[c.NIGHT_RHEO_STATED_LIGHT]),c.NIGHT_RHEO_STATED_LIGHT,o[c.NIGHT_RHEO_STATED_LIGHT])}catch(t){console.error(t)}try{window.navigator.vehicle[c.ANTILOCK_BRAKING_SYSTEM]=new Mt(n[c.ANTILOCK_BRAKING_SYSTEM],h.bitToZoneToBit(I,o[c.ANTILOCK_BRAKING_SYSTEM]),c.ANTILOCK_BRAKING_SYSTEM,o[c.ANTILOCK_BRAKING_SYSTEM]),window.navigator.vehicle[c.TRACTION_CONTROL_SYSTEM]=new Ht(n[c.TRACTION_CONTROL_SYSTEM],h.bitToZoneToBit(I,o[c.TRACTION_CONTROL_SYSTEM]),c.TRACTION_CONTROL_SYSTEM,o[c.TRACTION_CONTROL_SYSTEM]),window.navigator.vehicle[c.ELECTRONIC_STABILITY_CONTROL]=new Ft(n[c.ELECTRONIC_STABILITY_CONTROL],h.bitToZoneToBit(I,o[c.ELECTRONIC_STABILITY_CONTROL]),c.ELECTRONIC_STABILITY_CONTROL,o[c.ELECTRONIC_STABILITY_CONTROL]),window.navigator.vehicle[c.TOP_SPEED_LIMIT]=new jt(n[c.TOP_SPEED_LIMIT],h.bitToZoneToBit(I,o[c.TOP_SPEED_LIMIT]),c.TOP_SPEED_LIMIT,o[c.TOP_SPEED_LIMIT]),window.navigator.vehicle[c.AIRBAG_STATUS]=new Wt(n[c.AIRBAG_STATUS],h.bitToZoneToBit(I,o[c.AIRBAG_STATUS]),c.AIRBAG_STATUS,o[c.AIRBAG_STATUS]),window.navigator.vehicle[c.DOOR]=new Zt(n[c.DOOR],h.bitToZoneToBit(I,o[c.DOOR]),c.DOOR,o[c.DOOR]),window.navigator.vehicle[c.CHILD_SAFETY_LOCK]=new Vt(n[c.CHILD_SAFETY_LOCK],h.bitToZoneToBit(I,o[c.CHILD_SAFETY_LOCK]),c.CHILD_SAFETY_LOCK,o[c.CHILD_SAFETY_LOCK]),window.navigator.vehicle[c.SEAT]=new kt(n[c.SEAT],h.bitToZoneToBit(I,o[c.SEAT]),c.SEAT,o[c.SEAT])}catch(t){console.error(t)}try{window.navigator.vehicle[c.ASR]=new Kt(n[c.ASR],h.bitToZoneToBit(I,o[c.ASR]),c.ASR,o[c.ASR]),window.navigator.vehicle[c.AYC]=new Yt(n[c.AYC],h.bitToZoneToBit(I,o[c.AYC]),c.AYC,o[c.AYC]),window.navigator.vehicle[c.EBD]=new zt(n[c.EBD],h.bitToZoneToBit(I,o[c.EBD]),c.EBD,o[c.EBD]),window.navigator.vehicle[c.EPS]=new Jt(n[c.EPS],h.bitToZoneToBit(I,o[c.EPS]),c.EPS,o[c.EPS]),window.navigator.vehicle[c.TAIL_GATE]=new xt(n[c.TAIL_GATE],h.bitToZoneToBit(I,o[c.TAIL_GATE]),c.TAIL_GATE,o[c.TAIL_GATE]),window.navigator.vehicle[c.VDC]=new Qt(n[c.VDC],h.bitToZoneToBit(I,o[c.VDC]),c.VDC,o[c.VDC])}catch(t){console.error(t)}try{window.navigator.vehicle[c.TEMPERATURE]=new qt(n[c.TEMPERATURE],h.bitToZoneToBit(I,o[c.TEMPERATURE]),c.TEMPERATURE,o[c.TEMPERATURE]),window.navigator.vehicle[c.RAIN_SENSOR]=new Xt(n[c.RAIN_SENSOR],h.bitToZoneToBit(I,o[c.RAIN_SENSOR]),c.RAIN_SENSOR,o[c.RAIN_SENSOR]),window.navigator.vehicle[c.WIPER_STATUS]=new $t(n[c.WIPER_STATUS],h.bitToZoneToBit(I,o[c.WIPER_STATUS]),c.WIPER_STATUS,o[c.WIPER_STATUS]),window.navigator.vehicle[c.WIPER_SETTING]=new te(n[c.WIPER_SETTING],h.bitToZoneToBit(I,o[c.WIPER_SETTING]),c.WIPER_SETTING,o[c.WIPER_SETTING]),window.navigator.vehicle[c.DEFROST]=new ee(n[c.DEFROST],h.bitToZoneToBit(I,o[c.DEFROST]),c.DEFROST,o[c.DEFROST]),window.navigator.vehicle[c.SUNROOF]=new ne(n[c.SUNROOF],h.bitToZoneToBit(I,o[c.SUNROOF]),c.SUNROOF,o[c.SUNROOF]),window.navigator.vehicle[c.CONVERTIBLE_ROOF]=new oe(n[c.CONVERTIBLE_ROOF],h.bitToZoneToBit(I,o[c.CONVERTIBLE_ROOF]),c.CONVERTIBLE_ROOF,o[c.CONVERTIBLE_ROOF]),window.navigator.vehicle[c.SIDE_WINDOW]=new ie(n[c.SIDE_WINDOW],h.bitToZoneToBit(I,o[c.SIDE_WINDOW]),c.SIDE_WINDOW,o[c.SIDE_WINDOW]),window.navigator.vehicle[c.CLIMATE_CONTROL]=new re(n[c.CLIMATE_CONTROL],h.bitToZoneToBit(I,o[c.CLIMATE_CONTROL]),c.CLIMATE_CONTROL,o[c.CLIMATE_CONTROL]),window.navigator.vehicle[c.ATMOSPHERIC_PRESSURE]=new _e(n[c.ATMOSPHERIC_PRESSURE],h.bitToZoneToBit(I,o[c.ATMOSPHERIC_PRESSURE]),c.ATMOSPHERIC_PRESSURE,o[c.ATMOSPHERIC_PRESSURE])}catch(t){console.error(t)}try{window.navigator.vehicle[c.LANE_DEPARTURE_DETECTION]=new ae(n[c.LANE_DEPARTURE_DETECTION],h.bitToZoneToBit(I,o[c.LANE_DEPARTURE_DETECTION]),c.LANE_DEPARTURE_DETECTION,o[c.LANE_DEPARTURE_DETECTION]),window.navigator.vehicle[c.ALARM]=new ue(n[c.ALARM],h.bitToZoneToBit(I,o[c.ALARM]),c.ALARM,o[c.ALARM]),window.navigator.vehicle[c.PARKING_BRAKE]=new Te(n[c.PARKING_BRAKE],h.bitToZoneToBit(I,o[c.PARKING_BRAKE]),c.PARKING_BRAKE,o[c.PARKING_BRAKE]),window.navigator.vehicle[c.PARKING_LIGHTS]=new se(n[c.PARKING_LIGHTS],h.bitToZoneToBit(I,o[c.PARKING_LIGHTS]),c.PARKING_LIGHTS,o[c.PARKING_LIGHTS]),window.navigator.vehicle[c.PARKING_BRAKE]=new se(n[c.PARKING_BRAKE],h.bitToZoneToBit(I,o[c.PARKING_BRAKE]),c.PARKING_BRAKE,o[c.PARKING_BRAKE])}catch(t){console.error(t)}try{window.navigator.vehicle[c.NEUTRAL_CONTACT]=new Ee(n[c.NEUTRAL_CONTACT],h.bitToZoneToBit(I,o[c.NEUTRAL_CONTACT]),c.NEUTRAL_CONTACT,o[c.NEUTRAL_CONTACT]),window.navigator.vehicle[c.RAW_SENSOR]=new ce(n[c.RAW_SENSOR],h.bitToZoneToBit(I,o[c.RAW_SENSOR]),c.RAW_SENSOR,o[c.RAW_SENSOR]),window.navigator.vehicle[c.BRAKE_SWITCH]=new Oe(n[c.BRAKE_SWITCH],h.bitToZoneToBit(I,o[c.BRAKE_SWITCH]),c.BRAKE_SWITCH,o[c.BRAKE_SWITCH])}catch(t){console.error(t)}var i=new Ie;window.navigator.vehicle[i.me.category]=i,O.default.conn.setConnection(pe),e()}if("function"!=typeof e)throw new t("function is required as a parameter");f.init(O.default.apps.getWidgetId(),i,r,_)},enum:{}};window.navigator.vehicle=pe,pe.isConnected=function(t){return t},t.prototype=new Error,e.prototype=new Error,n.prototype=new Error,o.prototype=new Error,u.prototype=new Error,window.navigator.vehicle.enum={zonePosition:{FRONT:"front",MIDDLE:"middle",REAR:"rear",LEFT:"left",CENTER:"center",RIGHT:"right"},vehicleError:{PERMISSION_DENIED:"permission_denied",INVALID_OPERATION:"invalid_operation",TIMEOUT:"timeout",INVALID_ZONE:"invalid_zone",UNKNOWN:"unknown"},availability:{AVAILABLE:"available",NOT_SUPPORTED:"not_supported",NOT_SUPPORTED_YET:"not_supported_yet",NOT_SUPPORTED_SECURITY_POLICY:"not_supported_security_policy",NOT_SUPPORTED_BUSINESS_POLICY:"not_supported_business_policy",NOT_SUPPORTED_OTHER:"not_supported_other"}}}()},1:function(t,e){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var o=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),i=function(){function t(){n(this,t),this.me={}}return o(t,[{key:"getClass",value:function(){return this.constructor.name}},{key:"clone",value:function(){}},{key:"getBaseContext",value:function(){return this}},{key:"equals",value:function(t){return this instanceof t.constructor}}]),t}();e.default=i},2:function(t,e){"use strict";t.exports={debug:!0,info:!0,error:!0}},3:function(t,e,n){"use strict";function o(t){return t&&t.__esModule?t:{default:t}}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function r(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function _(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),u=n(4),T=o(u),s=function(t){function e(t,n,o){i(this,e);var _=r(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));return _.me.domain=t,_.me.category=n,_.me.types=o,_}return _(e,t),a(e,[{key:"get",value:function(t){var e=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return new window.Promise(function(o,i){var r=function(t){o(t)},_=function(t){i(t)};window[e.me.domain].get(t,n,r,_)})}},{key:"set",value:function(t){var e=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return new window.Promise(function(o,i){var r=function(t){o(t)},_=function(t){i(t)};window[e.me.domain].set(t,n,r,_)})}},{key:"subscribe",value:function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;return window[this.me.domain].addListener(t,n,e)}},{key:"unsubscribe",value:function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;return window[this.me.domain].removeListener(t,e,n)}},{key:"unsubscribeAll",value:function(t){}},{key:"getType",value:function(t){return this.me.category+"_"+t}}]),e}(T.default);e.default=s},4:function(t,e,n){"use strict";function o(t){return t&&t.__esModule?t:{default:t}}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function r(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function _(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),u=n(1),T=o(u),s=function(t){function e(){return i(this,e),r(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return _(e,t),a(e,[{key:"getWebSocket",value:function(){}}]),e}(T.default);e.default=s},5:function(t,e){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};e.default={name:"shared",apps:{getWidgetId:function(){var t=null;if(window.applicationFramework)if(window.applicationFramework.hasOwnProperty("applicationManager")){var e=window.applicationFramework.applicationManager.getOwnerApplication(window.document);t=e.getDescriptor().id}else console.log("window.applicationFramework does not have applicationManager");return t}},utils:{isNull:function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return e===!0?null===t&&"object"===("undefined"==typeof t?"undefined":n(t)):null===t},isNotNull:function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return e===!0?!(null===t&&"object"===("undefined"==typeof t?"undefined":n(t))):!(null===t)},isFunc:function(t){return"function"==typeof t},isNotFunc:function(t){return"function"!=typeof t}},conn:{setConnection:function(t){t.isConnected=function(){return 1===window[t.name].getWs().readyState}}}}},43:function(t,e,n){"use strict";function o(t){return t&&t.__esModule?t:{default:t}}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function r(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function _(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var a=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),u=n(44),T=o(u),s=function(t){function e(){return i(this,e),r(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,"carConfiguration",{IDENTIFICATION:"identification",SYSTEM_CONFIGURATION:"systemConfiguration",REGION_CONFIGURATION:"regionConfiguration",RESTRICTION_CONFIGURATION:"restrictionConfiguration",TUNER_CONFIGURATION:"tunerConfiguration",DISPLAY_CONFIGURATION:"displayConfiguration",ENGINE:"engine",VARIANT_SELECTION:"variantSelection",STEERING_WHEEL:"steeringWheel"}))}return _(e,t),a(e,[{key:"getIdentification",value:function(){return this.get(this.getType(this.me.types.IDENTIFICATION))}},{key:"getEngine",value:function(){return this.get(this.getType(this.me.types.ENGINE))}},{key:"getSystemConfiguration",value:function(){return this.get(this.getType(this.me.types.SYSTEM_CONFIGURATION))}},{key:"getRegionConfiguration",value:function(){return this.get(this.getType(this.me.types.REGION_CONFIGURATION))}},{key:"getRestrictionConfiguration",value:function(){return this.get(this.getType(this.me.types.RESTRICTION_CONFIGURATION))}},{key:"getTunerConfiguration",value:function(){return this.get(this.getType(this.me.types.TUNER_CONFIGURATION))}},{key:"getDisplayConfiguration",value:function(){return this.get(this.getType(this.me.types.DISPLAY_CONFIGURATION))}},{key:"getVariantSelection",value:function(){return this.get(this.getType(this.me.types.VARIANT_SELECTION))}},{key:"getSteeringWheel",value:function(){return this.get(this.getType(this.me.types.STEERING_WHEEL))}},{key:"productDiversityEnum",get:function(){return{ENTRY:"entry",MID:"mid"}}},{key:"SpeedLockRestrictionEnum",get:function(){return{VIDEO_PLAYING_RESTRICTION:0,PICTURE_SLIDESHOW_RESTRICTION:1,SMS_TEXT_INPUT_RESTRICTION:2,FEATURES_TUTORIALS_RESTRICTION:3,SYSTEM_USER_HANDBOOK_RESTRICTION:4,TEXT_INPUT_RESTRICTION:5,PHONE_DAIL_INPUT_RESTRICTION:6,NAVI_DESTINATION_INPUT_RESTRICTION:7,MUSIC_RADIO_COVER_DISPLAY_RESTRICTION:8,GENERAL_HMI_RESTRICTION:9,SERVICE_ACTIVATION_RESTRICTION:10,DISPLAYED_TEXT_LENGTH_RESTRICTION:11,HMI_ANIMATIONS_RESTRICTION:12,STATIONARY_PICTURE_INDICATION_RESTRICTION:13,ONE_BY_ONE_LINE_OPERATION_NONMUSIC_LIST_SCROLL_RESTRICTION:14,DRAGGING_OPERATION_RESTRICTION:15,PINCH_IN_OUT_OPERATION_RESTRICTION:16,PICTURE_TEXT_BACKGROUND_DISPLAY_RESTRICTION:17,RENAULT_5_OPERATION_COUNT_RESTRICTION:18,RENAULT_8_OPERATION_COUNT_RESTRICTION:19,AUDIO_PLAY_AUTOMATICALLY_RESTRICTION:20,SYSTEM_UPDATE_RESTRICTION:21,ONE_BY_ONE_LINE_OPERATION_MUSIC_LIST_SCROLL_RESTRICTION:22}}},{key:"BoschRegionEnum",get:function(){return{REGION_US:0,REGION_CAN:1,REGION_MEX:2,REGION_UK:3,REGION_TKY:4,REGION_RUS:5,REGION_OTHER_EUR:6,REGION_PRC:7,REGION_TWN:8,REGION_HKG_MACAU:9,REGION_GCC:10,REGION_EGP:11,REGION_ASR_NZE:12,REGION_BRA:13,REGION_AGT:14,REGION_OTHER_LAC:15,REGION_SAF:16,REGION_THI:17,REGION_SGP:18,REGION_MLY:19,REGION_BRN:20,REGION_INN:21,REGION_VNM:22,REGION_PHL:23,REGION_IND:24,REGION_JPN:25,REGION_KOR:26,REGION_OTHER_GOM:27}}},{key:"EngineTypeEnum",get:function(){return{PETROL_2L:"petrol_2L",PETROL_2L_3_5L:"petrol_2L_3_5L",PETROL_3_5L:"petrol_3_5L",DIESEL_2L:"diesel_2L",DIESEL_2L_3_5L:"diesel_2L_3_5L",DIESEL_3_5L:"diesel_3_5L",EV_40_JPN:"ev_40_jpn",EV_60_JPN:"ev_60_jpn",EV_40_NAM:"ev_40_nam",EV_60_NAM:"ev_60_nam",EV_40_EUR:"ev_40_eur",EV_60_EUR:"ev_60_eur",PETROL_DEF:"petrol_def",DIESEL_DEF:"diesel_def",EV_DEF:"ev_def",UNKNOWN:"unknown"}}},{key:"FuelTypeEnum",get:function(){return{PETROL:"petrol",DIESEL:"diesel",HYBRID_DIESEL:"hybrid_diesel",HYBRID_PETROL:"hybrid_petrol",ELECTRICITY:"electricity"}}},{key:"PetrolTypeEnum",get:function(){return{NA:"na",REGULAR:"regular",PREMIUM:"premium",NON_PETROL:"non_petrol"}}},{key:"OemTypeEnum",get:function(){return{JLR:"JLR",VW:"VW",SEAT:"Seat",SKODA:"Skoda",AUDI:"Audi",BMW:"BMW",TATA:"Tata",NISSAN:"Nissan",TOYOTA:"Toyota",RENAULT:"Renault",FLAT:"Fiat",GM:"GM",OPEL:"Opel",SUZUKI:"Suzuki",MAZDA:"Mazda",PEUGEOT:"Peugeot",SCANIA:"Scania",DAIMLER:"Daimler",JAC:"JAC",DACIA:"Dacia",AVTOVAZ:"Avtovaz",RSM:"RSM",INFINITI:"Infiniti"}}},{key:"VariantSelectionEnum",get:function(){return{NOT_CONFIGURED:"not_configured",NAVI:"navi",DA:"da"}}},{key:"BrandEnum",get:function(){return{RENAULT:"Renault",NISSAN:"Nissan",INFINITI:"Infiniti",MITSUBISHI:"Mitsubishi",DACIA:"Dacia",DAIMLER:"Daimler",AVTOAZ:"Avtoaz",RSM:"RSM"}}},{key:"DisplayEnum",get:function(){return{LANDSCAPE:"landscape",POTRAIT:"potrait"}}},{key:"SteeringPositionEnum",get:function(){return{LEFT:"left",RIGHT:"right"}}}]),e}(T.default);e.default=s},44:function(t,e,n){"use strict";function o(t){return t&&t.__esModule?t:{default:t}}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function r(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function _(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}Object.defineProperty(e,"__esModule",{value:!0});var a=n(3),u=o(a),T=function(t){function e(t,n){return i(this,e),r(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,"vehicle",t,n))}return _(e,t),e}(u.default);e.default=T},45:function(t,e){"use strict";function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),r=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:["front","left"];n(this,t),this.value=e,Object.defineProperty(this,"driver",{enumerable:!1,get:function(){return new t(o)}})}return i(t,[{key:"equals",value:function(t){for(var e=!0,n=this.bitToZoneToBit(this.ZONE_TO_BIT,this),o=this.bitToZoneToBit(this.ZONE_TO_BIT,t),i=n.length,r=o.length,_=!1,a=0;a<i&&e;a++)for(var u=0;u<r;u++)if(_=n[a]===o[u]){if(_){e=!0;break}}else e=!1;return e}},{key:"contains",value:function(t){for(var e=!1,n=this.bitToZoneToBit(this.ZONE_TO_BIT,this),o=this.bitToZoneToBit(this.ZONE_TO_BIT,t),i=n.length,r=o.length,_=0;_<i;_++){for(var a=0;a<r;a++)if(n[_]===o[a]){e=!0;break}if(e)break}return e}},{key:"bitToZoneToBit",value:function(t,e){if(0===t&&void 0===e)return-1;var n=void 0,i=[],r=void 0,_=void 0,a=void 0,u=[];switch(t){case this.BIT_TO_ZONE_INIT:u=this.BIT_TO_ZONE(e);break;case this.BIT_TO_ZONE_GET:if(Array.isArray(e)){n=e.length;for(var T=0;T<n;T++)i[T]=e[T].zone}else e.hasOwnProperty("zone")&&(i[0]=e.zone);u=this.BIT_TO_ZONE(i);break;case this.ZONE_TO_BIT:if(r=o(e.value[0]),_=e.value.length,a=0,"string"===r){for(var s=0;s<_;s++)a+=this.zones[e.value[s]];u.push(a),a=0}else for(var E=0;E<_;E++){for(var c=e.value[E],O=c.length,I=0;I<O;I++)a+=this.zones[c[I]];u.push(a),a=0}break;default:console.log("out of case")}return u}},{key:"BIT_TO_ZONE",value:function(e){for(var n=e.length,o=[],i=[],r=[],_=0;_<n;_++){for(var a in this.zones){if(0===e[_]){o.push(a);break}e[_]&this.zones[a]&&o.push(a)}r=new t(o),i.push(r),r=i,o=[]}return r}},{key:"BIT_TO_ZONE_INIT",get:function(){return 0}},{key:"BIT_TO_ZONE_GET",get:function(){return 1}},{key:"ZONE_TO_BIT",get:function(){return 2}},{key:"zones",get:function(){return{none:0,front:1,middle:2,right:4,left:8,rear:16,center:32,top:64,central:128,bottom:256}}}]),t}();e.default=r,window.Zone=r},46:function(t,e,n){"use strict";function o(t){return t&&t.__esModule?t:{default:t}}var i=n(45),r=o(i),_=new r.default,a={};a.ParseError=-32700,a.InvalidRequest=-32600,a.MethodNotFound=-32601,a.InvalidParams=-32602,a.InternalError=-32603,a.AccessError=-32604,a.DuplicateListener=-32605,a.ServiceError=-32e3,a.UnknownError=-32001,a.DbusError=-32002,a.EtchError=-32003,a.PbError=-32004,a.ServerError=-32099;var u={};u.Unknown=11,u.MethodNotFound=12,u.AccessUndetermined=20,u.AccessDeny=21,u.AccessPromptOneShot=22,u.AccessPromptSession=23,u.AccessPromptBlanket=24,u.JsonParsingError=30,u.JsonMessageValidateError=31,u.JsonVersionError=40,u.JsonMessageIdNotExistError=41,u.JsonMessageObjectNameNotExistError=42,u.JsonFunctionTypeError=43,u.JsonMessageFormateError=44,u.JsonFunctionEventTypeNotExistError=45,u.JsonFunctionMethodNotExistError=46,u.JsonFunctionIdNotExistError=47,u.DuplicateAddlistenerError=55,u.RegFailedAddlistenerError=56,u.MessageIdDismatch=60,u.MessageObjectDismatch=61,u.MessageUnknownEventType=62,u.MessageUnknownMethodType=63,u.MessageUnregListener=64,u.InvalidParams=70,u.ServiceNotAvailable=80,u.ServiceNoResponse=81,u.ServiceUnknownValue=82,u.SendError=90,u.CloseError=91,u.DbusCanNotCreateConnection=100,u.DbusCanNotCreateProxy=101,u.DbusUnknownService=102,u.DbusMethodCallFailed=103,u.EtchPortBindingFailed=120,u.PbOutOfRange=140,u.PbInvalidArgument=141,u.PbMissMandatory=142,u.PbNullException=143,u.PbBadAllocException=144,u.PbOutOfRangeException=145;var T={};T.PromptOneShotDenyAlways=350,T.PromptOneShotDenyThisTime=351,T.PromptOneShotDenyAllowThisTime=352,T.PromptSessionDenyForThisSession=353,T.PromptSessionAllowForThisSession=354,T.PromptBlanketDenyForThisSession=355,T.PromptBlanketAllowForThisSession=356,T.PromptBlanketAllowAlways=357,function(){var t="vehicle",e=1002,n=1003,o=1004,i=1005,r={jsonrpc:2,app_id:null,id:null,method:""},a=null,u=null,T={lst:{},push:function(t,e,n,o){var i={};return i.id=window.performance.now().toString(),i.type=t,i.method=e,i.handle1=n,i.handle2=o,this.lst[i.id]=i,i.id},pop:function(t){var e=this.lst[t];return e&&delete this.lst[t],e},clear:function(){return!Object.keys(this.lst={}).length}},s={lst:{},push:function(t,e){e&&(this.lst[t]?this.lst[t].push(e):this.lst[t]=[e])},pop:function(t,e){if(e){var n=this.lst[t];if(n)for(var o=0;o<n.length;o++)if(n[o]===e)return n.splice(o,1),void(0===n.length&&(this.lst[t]=void 0))}},get:function(t){return this.lst[t]},clear:function(){this.lst={}}},E={msg_type:0,method_type:"",event_type:null,json:"",init:function(t){this.json=JSON.parse(t);var r=null,_=null,a=null,u=null;try{r=this.json.result}catch(t){console.log(t)}try{_=this.json.id}catch(t){console.log(t)}try{a=this.json.error}catch(t){console.log(t)}try{u=this.json.app_id}catch(t){console.log(t)}a?this.msg_type=i:_?this.msg_type=e:u?this.msg_type=n:this.msg_type=o;var T=this.json.method.split(".");T.length;3===T.length?(this.method_type=T[1],this.event_type=T[2]):2===T.length&&(this.method_type="get",this.event_type=T[1]),this.msg_type===o||"addListener"!==this.method_type&&"removeListener"!==this.method_type||(this.msg_type=n)}},c=function(){var r=new WebSocket("ws://localhost:18892/webapp/"+t);return r.onmessage=function(t){var r=E;if(r.init(t.data),r.msg_type===e){var u=T.pop(r.json.id);u&&u.handle1&&u.handle1(r.json.result)}else if(r.msg_type===i){var c=T.pop(r.json.id);c&&c.handle2&&c.handle2(r.json.error)}else if(r.msg_type===n){if("addListener"===r.method_type){var O=s.get(r.event_type),I=function(t,e){var n=_.bitToZoneToBit(_.BIT_TO_ZONE_GET,e),o=e.length;if(Array.isArray(e))for(var i=0;i<o;i++)e[i].hasOwnProperty("zone")&&(e[i].zone=n[i]);else e.hasOwnProperty("zone")&&(e.zone=n[0]);t(e)};for(var l in O)"undefined"!=typeof r.json.result?I(O[l],r.json.result):"undefined"!=typeof r.json.error?O[l](r.json.error):console.log("undefine result")}}else r.msg_type===o?a&&a(r.json.result):console.log("unknown json message")},r.send_data=function(t,e){return 1===u.readyState&&(e?t.params=e:t.params&&delete t.params,u.send(JSON.stringify(t)),!0)},r},O={zones:"zones",supported:"supported",availableForRetrievals:"availableForRetrievals",availableForSettings:"availableForSettings",availableForSubscriptions:"availableForSubscriptions",identification:"identification",sizeConfiguration:"sizeConfiguration",fuelConfiguration:"fuelConfiguration",transmissionConfiguration:"transmissionConfiguration",wheelConfiguration:"wheelConfiguration",steeringWheelConfiguration:"steeringWheelConfiguration",vehicleSpeed:"vehicleSpeed",wheelSpeed:"wheelSpeed",engineSpeed:"engineSpeed",vehiclePowerModeType:"vehiclePowerModeType",powertrainTorque:"powertrainTorque",acceleratorPedalPosition:"acceleratorPedalPosition",throttlePosition:"throttlePosition",tripMeters:"tripMeters",transmission:"transmission",cruiseControlStatus:"cruiseControlStatus",lightStatus:"lightStatus",interiorLightStatus:"interiorLightStatus",horn:"horn",chime:"chime",fuel:"fuel",engineOil:"engineOil",acceleration:"acceleration",engineCoolant:"engineCoolant",steeringWheel:"steeringWheel",wheelTick:"wheelTick",ignitionTime:"ignitionTime",yawRate:"yawRate",brakeOperation:"brakeOperation",buttonEvent:"buttonEvent",drivingMode:"drivingMode",nightMode:"nightMode",advisor:"advisor",autoPhase:"autoPhase",clutchSwitch:"clutchSwitch",effectiveTorque:"effectiveTorque",engineControl:"engineControl",engineStatus:"engineStatus",fluentDriving:"fluentDriving",globalWarning:"globalWarning",gsi:"gsi",meterADAC:"meterADAC",powerTrain:"powerTrain",rangeIndication:"rangeIndication",tireTorque:"tireTorque",vehicleState:"vehicleState",water:"water",clusterVehicleSpeed:"clusterVehicleSpeed",odometer:"odometer",transmissionOil:"transmissionOil",transmissionClutch:"transmissionClutch",brakeMaintenance:"brakeMaintenance",washerFluid:"washerFluid",malfunctionIndicator:"malfunctionIndicator",batteryStatus:"batteryStatus",tire:"tire",diagnostic:"diagnostic",longitudinalAccel:"longitudinalAccel",overhaul:"overhaul",languageConfiguration:"languageConfiguration",mirror:"mirror",seatAdjustment:"seatAdjustment",driveMode:"driveMode",dashboardIllumination:"dashboardIllumination",vehicleSound:"vehicleSound",unitsOfMeasure:"unitsOfMeasure",ecoScores:"ecoScores",nightRheoStatedLight:"nightRheoStatedLight",antilockBrakingSystem:"antilockBrakingSystem",tractionControlSystem:"tractionControlSystem",electronicStabilityControl:"electronicStabilityControl",topSpeedLimit:"topSpeedLimit",airbagStatus:"airbagStatus",door:"door",childSafetyLock:"childSafetyLock",seat:"seat",asr:"asr",ayc:"ayc",ebd:"ebd",eps:"eps",tailGate:"tailGate",vdc:"vdc",temperature:"temperature",rainSensor:"rainSensor",wiperStatus:"wiperStatus",wiperSetting:"wiperSetting",defrost:"defrost",sunroof:"sunroof",convertibleRoof:"convertibleRoof",sideWindow:"sideWindow",climateControl:"climateControl",atmosphericPressure:"atmosphericPressure",laneDepartureDetection:"laneDepartureDetection",alarm:"alarm",parkingBrake:"parkingBrake",parkingLights:"parkingLights",neutralContact:"neutralContact",rawSensor:"rawSensor",brakeSwitch:"brakeSwitch",carConfiguration_engine:"carConfiguration_engine",carConfiguration_identification:"carConfiguration_identification",carConfiguration_systemConfiguration:"carConfiguration_systemConfiguration",carConfiguration_steeringWheel:"carConfiguration_steeringWheel",carConfiguration_restrictionConfiguration:"carConfiguration_restrictionConfiguration",carConfiguration_tunerConfiguration:"carConfiguration_tunerConfiguration",carConfiguration_displayConfiguration:"carConfiguration_displayConfiguration",carConfiguration_variantSelection:"carConfiguration_variantSelection",carConfiguration_regionConfiguration:"carConfiguration_regionConfiguration",get:function(e,n,o,i){var _=r;return null===o?_.id=window.performance.now().toString():_.id=T.push(e,"get",o,i),_.method=t+".get."+e,u.send_data(_,n)},set:function(e,n,o,i){var _=r;return null===o?_.id=window.performance.now().toString():_.id=T.push(e,"set",o,i),_.method=t+".set."+e,u.send_data(_,n)},query:function(e,n,o,i){var _=r;return null===o?_.id=window.performance.now().toString():_.id=T.push(e,"query",o,i),_.method=t+".query."+e,u.send_data(_,n)},addListener:function(e,n,o){if(o){s.push(e,o);var i=s.get(e);if(i&&1===i.length){var _=r;return _.method=t+".addListener."+e,u.send_data(_,n)}return!0}return!1},removeListener:function(e,n){if(n){if(s.pop(e,n),s.get(e))return!0;var o=r;return o.method=t+".removeListener."+e,u.send_data(o,null)}return!1},init:function(t,e,n,o){u=c(),t&&(r.app_id=t),e&&(u.onopen=e),n&&(u.onclose=n),o&&(a=o)},reset:function(t,e,n,o){u.close(),T.clear(),s.clear(),u=c(),t&&(r.app_id=t),e&&(u.onopen=e),n&&(u.onclose=n),o&&(a=o)},getWs:function(){return u},clearCallback:function(t){switch(t){case"all":return T.clear();default:return-1}},version:function(){return"2.1.1.4"}};window.vehicle=O}()}});

/***/ }),
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = __webpack_require__(51);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(52);

var _createClass3 = _interopRequireDefault(_createClass2);

var _popup = __webpack_require__(178);

var _popup2 = _interopRequireDefault(_popup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AIC_NOTIFICATION = 'from-launcher-notification';
var instance = void 0;

var CommonPopup = function () {
  function CommonPopup() {
    (0, _classCallCheck3.default)(this, CommonPopup);

    if (!instance) {
      instance = this;
      this.init();
    }
    return instance;
  }

  (0, _createClass3.default)(CommonPopup, [{
    key: 'init',
    value: function init() {
      var _this = this;

      if (window.applicationFramework) {
        this.isShown = true;
        var appManager = window.applicationFramework.applicationManager;
        var application = appManager.getOwnerApplication(window.document);
        var model = window.applicationFramework.util.getDeviceModel();
        var isActive = application.isPopupActive();

        application.registerMessageListener(AIC_NOTIFICATION);
        if (isActive) {
          this.toggleBlurClass(true);
        }
        application.addEventListener('ApplicationShown', function () {
          _this.toggleBlurClass(window.applicationFramework.applicationManager.getOwnerApplication(window.document).isPopupActive());
          _this.isShown = true;
        });
        application.addEventListener('ApplicationHidden', function () {
          _this.isShown = false;
        });
        application.addEventListener('ApplicationMessage', function (msg, origin) {
          var filterName = origin.indexOf('filter-name=') > -1 ? origin.split('filter-name=')[1] : '';
          if (filterName === AIC_NOTIFICATION && _this.isShown) {
            msg = JSON.parse(msg);
            if (msg.type === 'popup') {
              if (model === 'nissan9p') {
                var okIconPath = application.getCommonLibraryPath() + '/icon/ok.png';
                application.requestPopup(2, model === 'nissan9p' ? '' : msg.title, msg.content, [okIconPath]);
              } else {
                var shownPopup = _popup2.default.show({
                  title: model === 'nissan9p' ? '' : msg.title,
                  width: model === 'nissan9p' ? 1000 : 500,
                  content: msg.content,
                  buttons: [{
                    label: msg.button,
                    onClick: function onClick() {
                      shownPopup.close();
                    }
                  }]
                });
              }
            } else {
              _this.toggleBlurClass(msg.isActive);
            }
          }
        }, false);
      }
    }
  }, {
    key: 'toggleBlurClass',
    value: function toggleBlurClass(flag) {
      var $app = document.querySelector('#app');
      var blurTarget = document.querySelectorAll('.obg-popover, .close-button-context-menu, .overlay .popup, .obg-dialog');
      if (blurTarget.length > 0) {
        blurTarget.forEach(function ($target) {
          if (flag) {
            $target.classList.add('obg-filter-blur');
          } else {
            $target.classList.remove('obg-filter-blur');
          }
        });
      } else {
        if (flag) {
          $app.classList.add('obg-filter-blur');
        } else {
          $app.classList.remove('obg-filter-blur');
        }
      }
    }
  }]);
  return CommonPopup;
}();

exports.default = new CommonPopup();

/***/ }),
/* 178 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _popup = __webpack_require__(179);

var _popup2 = _interopRequireDefault(_popup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _popup2.default)();

/***/ }),
/* 179 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = __webpack_require__(83);

var _keys2 = _interopRequireDefault(_keys);

exports.default = function () {
  return {
    show: function show(props) {
      var node = document.createElement('div');
      document.body.appendChild(node);
      var popup = void 0;
      if (props.type === 'progress') {
        popup = _progressPopup2.default;
      } else if (props.type === 'loading') {
        popup = _loadingPopup2.default;
      } else {
        popup = _popup2.default;
      }
      var vm = new _vue2.default({
        el: node,
        data: function data() {
          return { props: props };
        },
        destroyed: function destroyed() {
          delete shownPopupHashMap[this._uid];
        },

        render: function render(h) {
          return h(popup, { props: props });
        }
      });

      var popupObj = {};
      popupObj.close = function () {
        vm.closePopup();
        _events2.default.$off('cancel-popup');
      };

      if (props.type === 'progress') {
        popupObj.updateProgress = function (width) {
          vm.updateProgress(width);
        };
      }
      shownPopupHashMap[vm._uid] = popupObj;

      _events2.default.$once('cancel-popup', function (e) {
        popupObj.close();
      });

      return popupObj;
    },
    closeTopPopup: function closeTopPopup() {
      var keys = (0, _keys2.default)(shownPopupHashMap);
      keys.sort(function (a, b) {
        return b - a;
      });
      if (keys.length === 0) {
        return false;
      } else {
        var topPopup = shownPopupHashMap[keys[keys.length - 1]];
        topPopup.close();
        delete shownPopupHashMap[keys.length - 1];
        return true;
      }
    },
    checkTopPopup: function checkTopPopup() {
      var keys = (0, _keys2.default)(shownPopupHashMap);
      return !(keys.length === 0);
    }
  };
};

var _popup = __webpack_require__(180);

var _popup2 = _interopRequireDefault(_popup);

var _progressPopup = __webpack_require__(183);

var _progressPopup2 = _interopRequireDefault(_progressPopup);

var _loadingPopup = __webpack_require__(186);

var _loadingPopup2 = _interopRequireDefault(_loadingPopup);

var _focus = __webpack_require__(193);

var _events = __webpack_require__(13);

var _events2 = _interopRequireDefault(_events);

var _vue = __webpack_require__(2);

var _vue2 = _interopRequireDefault(_vue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.prototype.$focus = _focus.focusInstance;

var shownPopupHashMap = {};

/***/ }),
/* 180 */,
/* 181 */,
/* 182 */,
/* 183 */,
/* 184 */,
/* 185 */,
/* 186 */,
/* 187 */,
/* 188 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _spinner = __webpack_require__(189);

var _spinner2 = _interopRequireDefault(_spinner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _spinner2.default;

/***/ }),
/* 189 */,
/* 190 */,
/* 191 */,
/* 192 */,
/* 193 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.focusInstance = undefined;

var _map = __webpack_require__(194);

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = __webpack_require__(51);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(52);

var _createClass3 = _interopRequireDefault(_createClass2);

exports.install = install;

var _appManager = __webpack_require__(95);

var _appManager2 = _interopRequireDefault(_appManager);

var _hardkey = __webpack_require__(210);

var _events = __webpack_require__(13);

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var APP_TYPE = { 'GADGET': 'gadget', 'WIDGET': 'widget' };
var POPUP_TYPE = { 'NONE': 'none', 'CONTEXT': 'context' };
var ROTATE_RIGHT = 'right';
var ROTATE_LEFT = 'left';
var hardkey = null;

var Focus = function () {
  function Focus() {
    (0, _classCallCheck3.default)(this, Focus);

    this.appManager = _appManager2.default;
    this._focusMap = new _map2.default();
    this._lastFocusMap = new _map2.default();
    this._subSectionMap = new _map2.default();
    this._tabMap = new _map2.default();
    this._binded = false;

    this._currentScene = 0;
    this._currentZone = 2;
    this._currentOrder = 0;
    this._currentTabNumber = 0;

    this._Loop = true;

    this._zoneFocusMode = false;
    this._componentFocusMode = false;
    this._componentControlMode = false;
    this._focusOnSubSection = false;
    this._tabFocusMode = false;

    this._hardkeyCode = 1000;
    this._hardkeyMode = 0;
    this._appType = APP_TYPE.WIDGET;

    this._popupType = POPUP_TYPE.NONE;
    this._popupZoneStyle = {};
    this._$focusZoneEle = null;

    this._onBodyClickListener = this._onBodyClickListener.bind(this);
    this.prevZone = this.prevZone.bind(this);
    this.nextZone = this.nextZone.bind(this);
    this._onRotaryLeftRight = this._onRotaryLeftRight.bind(this);
    this._onRotaryUpDown = this._onRotaryUpDown.bind(this);
    this._handleRotateClick = this._handleRotateClick.bind(this);
    this._handleRotateEnter = this._handleRotateEnter.bind(this);
    this.exitFocusMode = this.exitFocusMode.bind(this);
    this._handleRotate = this._handleRotate.bind(this);
    this._handleWheelEvent = this._handleWheelEvent.bind(this);
    this._getSubSection = this._getSubSection.bind(this);
    this._onRotaryUpDown = this._onRotaryUpDown.bind(this);
  }

  (0, _createClass3.default)(Focus, [{
    key: '_bind',
    value: function _bind() {
      var _this = this;

      if (this._binded) {
        return;
      } else {
        this._binded = true;
      }

      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_UP, this._onRotaryUpDown);
      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_DOWN, this._onRotaryUpDown);

      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_LEFT, this._onRotaryLeftRight);
      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_RIGHT, this._onRotaryLeftRight);

      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_ENTER, this._handleRotateClick);
      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_ENTER, this._handleRotateEnter);

      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_BUTTON_HOME, this.exitFocusMode);
      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_BUTTON_BACK, this.exitFocusMode);

      if (this.appManager) {
        hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_ROTATE, this._handleRotate);
        this._appType = this.appManager.type === 2 ? APP_TYPE.GADGET : APP_TYPE.WIDGET;
      } else {
        hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_ROTATE, this._handleWheelEvent);
      }

      _events2.default.$on('scene:update', function (scene) {
        _this.setScene(scene);
      });

      _events2.default.$on('popup:show', function (obj) {
        if (!obj.el) return;
        _this._setZoneFocusOff();
        _this._setComponentFocusOff();
        var popupRect = obj.el.getBoundingClientRect();
        _this._popupType = obj.type;
        _this._popupZoneStyle = {
          'height': popupRect.height,
          'width': popupRect.width,
          'left': popupRect.left,
          'top': popupRect.top
        };

        _this._lastFocusMap.set(obj.type, obj.prevFocusPosition);

        if (_this._zoneFocusMode || _this._componentFocusMode) {
          _this.startFocusMode();

          window.removeEventListener('click', _this._onBodyClickListener);
        }
      });

      _events2.default.$on('popup:hide', function (obj) {
        _this._setZoneFocusOff();
        _this._setComponentFocusOff();
        _this._popupType = POPUP_TYPE.NONE;
        _this._popupZoneStyle = {};

        if (_this._zoneFocusMode || _this._componentFocusMode) {
          var lastPosition = _this._lastFocusMap.get(obj.type);
          var lastOrder = lastPosition.zone === 2 && lastPosition.order > 0 && _this._isTargetAvailable(lastPosition.scene, lastPosition.order) ? lastPosition.order : -1;
          _this.startFocusMode(true, lastOrder);
        }
      });

      _events2.default.$on('list:scrollstart', this.exitFocusMode);

      _events2.default.$on('focus:control-get', function (obj) {
        _this._unbindRotateListener();
        _this._componentControlMode = true;

        var target = _this._getCurrentTarget();
        var hasFocusControlChild = false;
        var listItemClass = 'obg-list-item';
        if (target && target.el && target.el.classList.contains(listItemClass)) {
          if (target.el.querySelector('[data-type="focus-control-able"]')) {
            hasFocusControlChild = true;
            target.el.classList.add('has-focus-control-child');
          }
        }
        if (!hasFocusControlChild) {
          setTimeout(_this._setComponentFocusOff.bind(_this), 0);
        }
      });
      _events2.default.$on('focus:control-loss', function (obj) {
        _this._bindRotateListener();
        _this._componentControlMode = false;
        if (_this._focusOnSubSection) {
          if (!obj.touch) {
            _this.startFocusMode(true, _this.loadLastFocusPosition('section'));
          }
          _this._focusOnSubSection = false;
        }

        var target = _this._getCurrentTarget();
        var listItemClass = 'obg-list-item';
        var hasFocusControlChild = 'has-focus-control-child';
        if (target && target.el && target.el.classList.contains(listItemClass) && target.el.classList.contains(hasFocusControlChild)) {
          target.el.classList.remove(hasFocusControlChild);
        }
      });

      _events2.default.$on('tab:update', function (obj) {
        if (obj.tabNumber !== undefined) {
          console.log('tab mode check');
          var tabNumber = obj.tabNumber;
          _this._currentTabNumber = tabNumber;
          if (obj.isFocus) {
            var tabMap = _this._tabMap.get(tabNumber);
            _this.storeLastFocusPosition('tab:last-order', obj.lastOrder);
            if (tabMap && tabMap.size > 0) {
              _this.startTabFocusMode(tabNumber, obj.newOrder);
            } else {}
          }
        } else {
          if (_this._componentFocusMode || _this._zoneFocusMode) {
            _this._setZoneFocusOff();
            _this._setComponentFocusOff();
            if (obj.isFocus) {
              _this._currentZone = 3;
              _this._currentOrder = obj.currentIndex;
              _this._setZoneFocusOn(3);
              console.log('[Focus.js] Focus On from tabUpdate');
              _this._setComponentFocusOn();
            } else {
              _this.startFocusMode();
            }
          }
        }
      });

      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_BUTTON_BACK, function () {
        if (_this._appType === APP_TYPE.GADGET && _this._componentFocusMode) {
          _this.exitFocusMode();
          _this._sendRemainTick(1);
        }
      });

      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_BUTTON_HOME, function () {
        if (_this._componentFocusMode) {
          _this.exitFocusMode();
          _this._sendRemainTick(1);
        }
      });
    }
  }, {
    key: '_bindRotateListener',
    value: function _bindRotateListener() {
      if (this.appManager) {
        hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_ROTATE, this._handleRotate);
      } else {
        hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_ROTATE, this._handleWheelEvent);
      }
      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_ENTER, this._handleRotateClick);
      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_ENTER, this._handleRotateEnter);
      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_UP, this._onRotaryUpDown);
      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_DOWN, this._onRotaryUpDown);

      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_LEFT, this._onRotaryLeftRight);
      hardkey.addHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_RIGHT, this._onRotaryLeftRight);
    }
  }, {
    key: '_unbindRotateListener',
    value: function _unbindRotateListener() {
      if (this.appManager) {
        hardkey.removeHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_ROTATE, this._handleRotate);
      } else {
        hardkey.removeHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_ROTATE, this._handleWheelEvent);
      }
      hardkey.removeHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_ENTER, this._handleRotateClick);
      hardkey.removeHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_ENTER, this._handleRotateEnter);

      hardkey.removeHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_UP, this._onRotaryUpDown);
      hardkey.removeHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_DOWN, this._onRotaryUpDown);

      hardkey.removeHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_LEFT, this._onRotaryLeftRight);
      hardkey.removeHardkeyListener(_hardkey.hardkeyCode.code.HARDKEY_ROTARY_RIGHT, this._onRotaryLeftRight);
    }
  }, {
    key: '_handleRotate',
    value: function _handleRotate(_ref) {
      var code = _ref.code,
          mode = _ref.mode,
          tick = _ref.tick;

      this.hardkeyCode = code;
      this.hardkeyMode = mode;

      if (tick === 0) {
        this.exitFocusMode();
        this._sendRemainTick(0);
        return;
      }

      if (!this._zoneFocusMode && !this._componentFocusMode && this._appType !== APP_TYPE.GADGET) {
        this.startFocusMode();
        this._sendRemainTick(0);
        return;
      } else if (this._appType === APP_TYPE.GADGET && !this._zoneFocusMode) {
        this._zoneFocusMode = true;
        this._setZoneFocusOn();
        this._sendRemainTick(1);

        window.addEventListener('click', this._onBodyClickListener);

        return;
      }

      if (!this._componentFocusMode) {
        if (this._appType === APP_TYPE.GADGET) {
          this.exitFocusMode();
          this._sendRemainTick(1);
          return;
        }

        if (mode === _hardkey.hardkeyCode.mode.HARDKEY_MODE_RIGHT) {
          this.nextZone();
        } else {
          this.prevZone();
        }
        return;
      }

      if (mode === _hardkey.hardkeyCode.mode.HARDKEY_MODE_RIGHT) {
        this.nextOrder(tick);
        return;
      } else {
        this.prevOrder(tick);
        return;
      }
    }
  }, {
    key: '_handleWheelEvent',
    value: function _handleWheelEvent(e) {
      var mode = e.mode;
      if (!this._zoneFocusMode && !this._componentFocusMode && this._appType !== APP_TYPE.GADGET) {
        this.startFocusMode();
        this._sendRemainTick(0);
        return;
      } else if (this._appType === APP_TYPE.GADGET && !this._zoneFocusMode) {
        this._zoneFocusMode = true;
        this._setZoneFocusOn();
        this._sendRemainTick(1);

        window.addEventListener('click', this._onBodyClickListener);

        return;
      }

      if (!this._componentFocusMode) {
        if (mode === _hardkey.hardkeyCode.mode.HARDKEY_MODE_RIGHT) {
          this.nextZone({});
        } else {
          this.prevZone({});
        }
        return;
      }

      if (mode === _hardkey.hardkeyCode.mode.HARDKEY_MODE_RIGHT) {
        this.nextOrder();
        return;
      } else {
        this.prevOrder();
        return;
      }
    }
  }, {
    key: '_handleRotateClick',
    value: function _handleRotateClick(_ref2) {
      var _ref2$code = _ref2.code,
          code = _ref2$code === undefined ? 1000 : _ref2$code,
          _ref2$mode = _ref2.mode,
          mode = _ref2$mode === undefined ? 0 : _ref2$mode;

      this._hardkeyCode = code;
      this._hardkeyMode = mode;
      var currentOrder = this._currentOrder;

      if (mode !== _hardkey.hardkeyCode.mode.HARDKEY_MODE_RELEASE) {
        return;
      }

      if (!this._zoneFocusMode && !this._componentFocusMode) {
        this.startFocusMode();
        this._sendRemainTick(0);
        return;
      }

      if (this._zoneFocusMode) {
        if (!this._componentFocusMode) {
          this._currentOrder = this._getClosestFocusableComponent(0);
          if (this._currentOrder === -1) {
            this.exitFocusMode();
            this._sendRemainTick(1);
          } else {
            this._componentFocusMode = true;

            console.log('[Focus.js] Focus On from RotateClick');
            this._setComponentFocusOn();
            this._sendRemainTick(0);
          }
        } else {
          var target = this._getCurrentTarget();
          if (target) {
            var $target = target.el;

            if (target.vnode && target.vnode.componentInstance) {
              target.vnode.componentInstance.$emit('click', {
                'view': window,
                'bubbles': true,
                'cancelable': false,
                'currentTarget': $target,
                'isFocus': true
              });
              target.vnode.componentInstance.$emit('jog-click', {
                order: currentOrder
              });
            } else {
              var clickEvent = new MouseEvent('click', {
                'view': window,
                'bubbles': true,
                'cancelable': false,
                'currentTarget': $target,
                'isFocus': true,
                'isTrusted': false
              });
              $target.dispatchEvent(clickEvent);
              var jogClickEvent = new CustomEvent('jog-click', {
                'detail': {
                  order: currentOrder
                }
              });
              $target.dispatchEvent(jogClickEvent);
            }
          }
          this._sendRemainTick(0);
        }
      }
    }
  }, {
    key: '_handleRotateEnter',
    value: function _handleRotateEnter(_ref3) {
      var _ref3$code = _ref3.code,
          code = _ref3$code === undefined ? 1000 : _ref3$code,
          _ref3$mode = _ref3.mode,
          mode = _ref3$mode === undefined ? 0 : _ref3$mode;

      this._hardkeyCode = code;
      this._hardkeyMode = mode;

      if (!this._zoneFocusMode || !this._componentFocusMode) {
        return;
      }

      var target = this._getCurrentTarget();
      if (target) {
        var $target = target.el;
        var activeClass = 'active';
        var listItemClass = 'obg-list-item';
        var isListItem = $target.classList.contains(listItemClass);
        if (isListItem) {
          var isActive = $target.classList.contains(activeClass);
          var focusControlComponent = $target.querySelector('[data-type="focus-control-able"]');
          if (mode === _hardkey.hardkeyCode.mode.HARDKEY_MODE_PRESS && !focusControlComponent && !isActive) {
            $target.classList.add(activeClass);
          }
          if (mode === _hardkey.hardkeyCode.mode.HARDKEY_MODE_RELEASE && isActive) {
            $target.classList.remove(activeClass);
          }
        }
      }
    }
  }, {
    key: '_onBodyClickListener',
    value: function _onBodyClickListener() {
      console.log('[Focus.js] Exit focus by body click');
      this.exitFocusMode();
      this._sendRemainTick(1);
    }
  }, {
    key: '_onRotaryLeftRight',
    value: function _onRotaryLeftRight(_ref4) {
      var _ref4$code = _ref4.code,
          code = _ref4$code === undefined ? 1000 : _ref4$code,
          _ref4$mode = _ref4.mode,
          mode = _ref4$mode === undefined ? 0 : _ref4$mode;

      this._hardkeyCode = code;
      this._hardkeyMode = mode;
      if (this._hardkeyMode !== _hardkey.hardkeyCode.mode.HARDKEY_MODE_RELEASE) return;
      if (this._appType === APP_TYPE.GADGET || this._tabFocusMode) {
        this.exitFocusMode();
        this._sendRemainTick(1);
        return;
      }

      var subSection = this._getSubSection(code);
      if (subSection) {
        this._focusToSubSection(subSection);
      } else if (!this._zoneFocusMode && !this._componentFocusMode && this._appType !== APP_TYPE.GADGET) {
        this.startFocusMode();
        this._sendRemainTick(0);
        return;
      }
    }
  }, {
    key: '_onRotaryUpDown',
    value: function _onRotaryUpDown(_ref5) {
      var _ref5$code = _ref5.code,
          code = _ref5$code === undefined ? 1000 : _ref5$code,
          _ref5$mode = _ref5.mode,
          mode = _ref5$mode === undefined ? 0 : _ref5$mode;

      this._hardkeyCode = code;
      this._hardkeyMode = mode;
      if (this._hardkeyMode !== _hardkey.hardkeyCode.mode.HARDKEY_MODE_RELEASE) return;

      if (this._tabFocusMode) {
        this.exitFocusMode();
        this._sendRemainTick(1);
        return;
      }

      var subSection = this._getSubSection(code);
      if (subSection) {
        this._focusToSubSection(subSection);
      } else if (this.hardkeyCode === 'up') {
        this.prevZone();
      } else {
        this.nextZone();
      }
    }
  }, {
    key: '_getSubSection',
    value: function _getSubSection(code) {
      var direction = null;
      switch (code) {
        case _hardkey.hardkeyCode.code.HARDKEY_ROTARY_LEFT:
          direction = 'left';
          break;
        case _hardkey.hardkeyCode.code.HARDKEY_ROTARY_RIGHT:
          direction = 'right';
          break;
        case _hardkey.hardkeyCode.code.HARDKEY_ROTARY_UP:
          direction = 'up';
          break;
        case _hardkey.hardkeyCode.code.HARDKEY_ROTARY_DOWN:
          direction = 'down';
          break;
      }
      return this._subSectionMap.get(direction);
    }
  }, {
    key: '_focusToSubSection',
    value: function _focusToSubSection(subsection) {
      this.storeLastFocusPosition('section', this._currentOrder);
      this._setComponentFocusOff();
      subsection.vnode.componentInstance.$emit('jog-click');
      this._focusOnSubSection = true;
    }
  }, {
    key: '_findDefaultComponent',
    value: function _findDefaultComponent() {
      var sceneMap = this._getCurrentSceneMap();
      var n = 0;
      if (sceneMap) {
        var size = sceneMap.size;
        while (n++ < size) {
          var item = sceneMap.get(n);
          if (item && item.isFocus) return n;
        }
      }
      return -1;
    }
  }, {
    key: 'startFocusMode',
    value: function startFocusMode() {
      var componentFocusOn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var lastFocusOrder = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

      this._setComponentFocusOff();
      this._zoneFocusMode = true;
      this._currentZone = 2;

      var defaultComponentOrder = this._findDefaultComponent();

      this._currentOrder = defaultComponentOrder > -1 ? defaultComponentOrder : lastFocusOrder;
      if (!this._isTargetAvailable(this._currentScene, this._currentOrder)) {
        this._currentOrder = this._getClosestFocusableComponent(0);
      }

      if (this._currentOrder === -1 && this._popupType === POPUP_TYPE.NONE) {
        this._currentZone = 3;
        this._currentOrder = this._getClosestFocusableComponent(0);
      }

      this._setZoneFocusOn(this._currentZone);

      if (componentFocusOn) {
        this._componentFocusMode = true;
        console.log('[Focus.js] Focus On from StartMode');
        this._setComponentFocusOn();
      }

      window.addEventListener('click', this._onBodyClickListener);
    }
  }, {
    key: 'startTabFocusMode',
    value: function startTabFocusMode(tabNumber) {
      var order = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      this._currentTabNumber = tabNumber;
      this._tabFocusMode = true;
      this._componentFocusMode = true;
      this._currentOrder = order;
      this._setComponentFocusOn();
      window.addEventListener('click', this._onBodyClickListener);
    }
  }, {
    key: 'exitFocusMode',
    value: function exitFocusMode() {
      this._setZoneFocusOff();
      this._setComponentFocusOff();
      this._zoneFocusMode = false;
      this._componentControlMode = false;
      this._componentFocusMode = false;
      this._currentZone = 2;
      this._currentOrder = -1;

      this._tabFocusMode = false;
      window.removeEventListener('click', this._onBodyClickListener);
      console.log('[Focus.js] [obigo-ui] exit focus mode');
    }
  }, {
    key: '_setZoneFocusOn',
    value: function _setZoneFocusOn() {
      var zone = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;

      var zoneClass = zone === 2 ? 'two' : 'three';
      var isExitZoneFocus = document.body.getElementsByClassName('zone-focus').length !== 0;

      this._$focusZoneEle = isExitZoneFocus ? this._$focusZoneEle : document.createElement('div');
      this._$focusZoneEle.classList = [];
      this._$focusZoneEle.classList.add('zone-focus', zoneClass, this._appType, this._popupType);

      if (this._popupType !== POPUP_TYPE.NONE) {
        this._$focusZoneEle.style.height = this._popupZoneStyle.height + 'px';
        this._$focusZoneEle.style.width = this._popupZoneStyle.width + 'px';
        this._$focusZoneEle.style.top = this._popupZoneStyle.top + 'px';
        this._$focusZoneEle.style.left = this._popupZoneStyle.left + 'px';
      }

      if (!isExitZoneFocus) document.body.appendChild(this._$focusZoneEle);

      _events2.default.$emit('focus:zone-focus-in');
    }
  }, {
    key: '_setZoneFocusOff',
    value: function _setZoneFocusOff() {
      if (document.body.getElementsByClassName('zone-focus').length === 0) {
        window.removeEventListener('click', this._onBodyClickListener);
        return;
      }
      document.body.removeChild(this._$focusZoneEle);
    }
  }, {
    key: 'nextZone',
    value: function nextZone() {
      if (this._appType === APP_TYPE.GADGET) {
        this.exitFocusMode();
        this._sendRemainTick(1);
        return;
      }

      if (!this._zoneFocusMode && !this._componentFocusMode) {
        this.startFocusMode();
        this._sendRemainTick(0);
        return;
      }

      this._setComponentFocusOff();

      if (this._currentZone === 2 && this._popupType === POPUP_TYPE.NONE) {
        this._$focusZoneEle.classList.remove('two');
        this._$focusZoneEle.classList.add('three');
        this._currentZone += 1;
        this._componentFocusMode = true;
        this._currentOrder = this._getClosestFocusableComponent(0);
        console.log('[Focus.js] Focus On from NextZone');
        this._setComponentFocusOn();
        this._sendRemainTick(0);
      } else {
        this.exitFocusMode();
        this._sendRemainTick(1);
      }
    }
  }, {
    key: 'prevZone',
    value: function prevZone() {
      if (this._appType === APP_TYPE.GADGET) {
        this.exitFocusMode();
        this._sendRemainTick(1);
        return;
      }

      if (!this._zoneFocusMode && !this._componentFocusMode) {
        this.startFocusMode();
        this._sendRemainTick(0);
        return;
      }

      this._setComponentFocusOff();

      if (this._currentZone === 3 && this._popupType === POPUP_TYPE.NONE) {
        this._$focusZoneEle.classList.remove('three');
        this._$focusZoneEle.classList.add('two');
        this._currentZone -= 1;
        this.startFocusMode();
        this._sendRemainTick(0);
      } else {
        this.exitFocusMode();
        this._sendRemainTick(1);
      }
    }
  }, {
    key: 'nextOrder',
    value: function nextOrder() {
      var tick = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      if (this._tabFocusMode) {
        var tabMap = this._tabMap.get(this._currentTabNumber);
        if (this._currentOrder === tabMap.size - 1) {
          this._setComponentFocusOff();
          this._tabFocusMode = false;
          this._sendRemainTick(0);
          this._currentOrder = this.loadLastFocusPosition('tab:last-order');

          this.startFocusMode(true, this._currentOrder);
        } else {
          this._setComponentFocusOff();
          this._currentOrder += 1;
          this._setComponentFocusOn(ROTATE_RIGHT);
          this._sendRemainTick(0);
        }
      } else {
        var newOrder = this._getClosestFocusableComponent(this._currentOrder + 1);

        var $currentTarget = this._getCurrentTarget();
        var isTabItem = $currentTarget.el.attributes.role && $currentTarget.el.attributes.role.textContent === 'tab';
        var maxOrder = this._getCurrentSceneMap().size - 1;
        if (isTabItem && newOrder === maxOrder && !this._Loop && this._currentOrder === newOrder) {
          this._setComponentFocusOff();
          var _tabMap = this._tabMap.get(this._currentTabNumber);
          if (_tabMap && _tabMap.size > 0) {
            this.startTabFocusMode(this._currentTabNumber, 0);
            this._sendRemainTick(0);
            return;
          }
        }

        this._setComponentFocusOff();
        this._currentOrder = newOrder === -1 ? this._currentOrder : newOrder;
        console.log('[Focus.js] Focus on by nextOrder');
        this._setComponentFocusOn(ROTATE_RIGHT);
        this._sendRemainTick(0);
      }
    }
  }, {
    key: 'prevOrder',
    value: function prevOrder() {
      var tick = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      if (this._tabFocusMode) {
        if (this._currentOrder === 0) {
          this._setComponentFocusOff();
          this._tabFocusMode = false;
          this._sendRemainTick(0);
          this._currentOrder = this.loadLastFocusPosition('tab:last-order');

          this.startFocusMode(true, this._currentOrder);
        } else {
          this._setComponentFocusOff();
          this._currentOrder -= 1;
          this._setComponentFocusOn(ROTATE_RIGHT);
          this._sendRemainTick(0);
        }
      } else {
        var newOrder = this._getClosestFocusableComponent(this._currentOrder - 1, false);

        var $currentTarget = this._getCurrentTarget();
        var isTabItem = $currentTarget.el.attributes.role && $currentTarget.el.attributes.role.textContent === 'tab';
        if (isTabItem && newOrder === 0 && !this._Loop && this._currentOrder === newOrder) {
          this._setComponentFocusOff();
          var tabMap = this._tabMap.get(this._currentTabNumber);
          if (tabMap && tabMap.size > 0) {
            this.startTabFocusMode(this._currentTabNumber, tabMap.size - 1);

            this._sendRemainTick(0);
            return;
          }
        }

        this._setComponentFocusOff();
        this._currentOrder = newOrder === -1 ? this._currentOrder : newOrder;
        console.log('[Focus.js] Focus on by prevOrder');
        this._setComponentFocusOn(ROTATE_LEFT);
        this._sendRemainTick(0);
      }
    }
  }, {
    key: '_getClosestFocusableComponent',
    value: function _getClosestFocusableComponent() {
      var order = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._currentOrder;
      var isNext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      var sceneMap = this._getCurrentSceneMap();
      var scene = this._currentScene;
      var n = 0;

      if (!sceneMap && this._currentZone === 3) {
        scene = 0;
        sceneMap = this._getSceneMap(this._currentZone, scene);
      }

      var incrementer = isNext ? 1 : -1;
      var size = sceneMap ? sceneMap.size : 0;

      if (!this._Loop && this._currentZone !== 3) {
        order = order < 0 ? this._currentOrder : order >= size ? this._currentOrder : order;
      } else {
        order = order < 0 ? size - 1 : order >= size ? 0 : order;
      }

      while (n++ < size) {
        if (this._isTargetAvailable(scene, order, incrementer)) {
          return order;
        }
        order = order + incrementer;
        order = order < 0 ? size : order > size ? 0 : order;
      }

      return -1;
    }
  }, {
    key: '_isTargetAvailable',
    value: function _isTargetAvailable(scene, order, incrementer) {
      var sceneMap = this._getSceneMap(this._currentZone, scene);
      var targetComponent = sceneMap ? sceneMap.get(order) : null;

      if (targetComponent) {
        var $target = targetComponent.el;
        var rect = targetComponent.el.getBoundingClientRect();
        var inScreen = incrementer > 0 ? rect.top >= 0 : true;
        return !($target.disabled || $target.classList.contains('disabled') || $target.classList.contains('disable') || !inScreen);
      }

      return false;
    }
  }, {
    key: '_getCurrentTarget',
    value: function _getCurrentTarget() {
      if (this._tabFocusMode) {
        console.log(this._currentOrder);
        var tabMap = this._tabMap.get(this._currentTabNumber);
        if (tabMap && tabMap.size > 0) {
          return tabMap.get(this._currentOrder);
        }
      } else {
        var sceneMap = this._getCurrentSceneMap();

        if (sceneMap && sceneMap.size > 0) {
          return sceneMap.get(this._currentOrder);
        }

        if (this._currentZone === 3) {
          sceneMap = this._getSceneMap(this._currentZone, 0);
          return sceneMap.get(this._currentOrder);
        }
      }
      return null;
    }
  }, {
    key: '_setComponentFocusOn',
    value: function _setComponentFocusOn(direction) {
      var target = this._getCurrentTarget();
      if (target && !target.el.classList.contains('obg-focus')) {
        target.el.classList.add('obg-focus');
        if (target.vnode && target.vnode.componentInstance) {
          target.vnode.componentInstance.$emit('focusin', { 'target': target.el, 'direction': direction });
        } else {
          var focusInEvent = new CustomEvent('focusin', { 'target': target.el, 'direction': direction });
          target.el.dispatchEvent(focusInEvent);
        }
      }
    }
  }, {
    key: '_setComponentFocusOff',
    value: function _setComponentFocusOff() {
      var target = this._getCurrentTarget();
      if (target) {
        target.el.classList.remove('obg-focus');
        if (target.vnode && target.vnode.componentInstance) {
          target.vnode.componentInstance.$emit('focusout', { 'target': target.el });
        } else {
          var focusOutEvent = new CustomEvent('focusout', { 'target': target.el });
          target.el.dispatchEvent(focusOutEvent);
        }
      }
    }
  }, {
    key: '_getZoneMap',
    value: function _getZoneMap(zone) {
      var zoneMap = this._focusMap.get(zone);
      if (!zoneMap) {
        zoneMap = new _map2.default();
        this._focusMap.set(zone, zoneMap);
      }
      return zoneMap;
    }
  }, {
    key: '_getSceneMap',
    value: function _getSceneMap(zone, scene) {
      var zoneMap = this._getZoneMap(zone);
      var sceneMap = zoneMap.get(scene);
      if (!sceneMap) {
        sceneMap = new _map2.default();
        zoneMap.set(scene, sceneMap);
      }
      return sceneMap;
    }
  }, {
    key: '_removeSceneMap',
    value: function _removeSceneMap(zone, scene) {
      var zoneMap = this._getZoneMap(zone);
      var sceneMap = zoneMap.get(scene);
      if (sceneMap) zoneMap.set(scene, new _map2.default());
      return sceneMap;
    }
  }, {
    key: '_getCurrentSceneMap',
    value: function _getCurrentSceneMap() {
      var zoneMap = this._focusMap.get(this._currentZone);
      return zoneMap ? zoneMap.get(this._currentScene) : null;
    }
  }, {
    key: '_addComponent',
    value: function _addComponent(el, _ref6, vnode) {
      var _ref6$scene = _ref6.scene,
          scene = _ref6$scene === undefined ? 0 : _ref6$scene,
          _ref6$zone = _ref6.zone,
          zone = _ref6$zone === undefined ? 2 : _ref6$zone,
          order = _ref6.order,
          _ref6$isFocus = _ref6.isFocus,
          isFocus = _ref6$isFocus === undefined ? false : _ref6$isFocus,
          _ref6$tabNumber = _ref6.tabNumber,
          tabNumber = _ref6$tabNumber === undefined ? null : _ref6$tabNumber;

      if (tabNumber !== null && !(el.attributes.role && el.attributes.role.textContent === 'tab')) {
        var tabMap = this._tabMap.get(tabNumber);
        if (tabMap) {
          if (typeof order === 'undefined') {
            order = tabMap.size;
          }
        } else {
          order = 0;
          tabMap = new _map2.default();
          this._tabMap.set(tabNumber, tabMap);
        }
        tabMap.set(order, { el: el, vnode: vnode, isFocus: isFocus });
      } else {
        var sceneMap = this._getSceneMap(zone, scene);
        if (typeof order === 'undefined') {
          order = sceneMap.size;
        }
        if (sceneMap.get(order)) {
          sceneMap.set(order, { el: el, vnode: vnode, isFocus: isFocus });
          console.log('[Focus.js] [ObigoUI:error] Focus order is duplicated [ scene : ' + scene + ' / order : ' + order + '] - overwrite');
          return;
        } else {
          sceneMap.set(order, { el: el, vnode: vnode, isFocus: isFocus });
        }
      }
    }
  }, {
    key: '_removeComponent',
    value: function _removeComponent(el, _ref7) {
      var _ref7$zone = _ref7.zone,
          zone = _ref7$zone === undefined ? 2 : _ref7$zone,
          _ref7$scene = _ref7.scene,
          scene = _ref7$scene === undefined ? 0 : _ref7$scene,
          order = _ref7.order,
          _ref7$tabNumber = _ref7.tabNumber,
          tabNumber = _ref7$tabNumber === undefined ? null : _ref7$tabNumber;

      if (tabNumber !== null) {
        var tabMap = this._tabMap.get(tabNumber);
        if (typeof order === 'undefined') {
          order = tabMap.size - 1;
        }
        if (tabMap) tabMap.delete(order);
      } else {
        var sceneMap = this._getSceneMap(zone, scene);
        if (typeof order === 'undefined') {
          order = sceneMap.size - 1;
        }
        sceneMap.delete(order);
      }
    }
  }, {
    key: '_addSubSection',
    value: function _addSubSection(el, direction, vnode) {
      this._subSectionMap.set(direction, { el: el, vnode: vnode });
    }
  }, {
    key: '_removeSubSection',
    value: function _removeSubSection(el, direction) {
      this._subSectionMap.delete(direction);
    }
  }, {
    key: '_sendRemainTick',
    value: function _sendRemainTick(tick) {
      console.log('[Focus.js] notProcessedCount : ' + tick);
      if (window.hardkeyEventObj) window.hardkeyEventObj.notProcessedCount(this._hardkeyCode, this._hardkeyMode, tick);
    }
  }, {
    key: 'setScene',
    value: function setScene(scene) {
      this._setZoneFocusOff();
      this._setComponentFocusOff();

      this._currentZone = 2;
      this._currentOrder = 0;
      this._currentScene = scene;
    }
  }, {
    key: 'setFocusPosition',
    value: function setFocusPosition(_ref8) {
      var _ref8$scene = _ref8.scene,
          scene = _ref8$scene === undefined ? 0 : _ref8$scene,
          _ref8$order = _ref8.order,
          order = _ref8$order === undefined ? 0 : _ref8$order,
          _ref8$zone = _ref8.zone,
          zone = _ref8$zone === undefined ? 2 : _ref8$zone;

      this._setZoneFocusOff();
      this._setComponentFocusOff();
      this._zoneFocusMode = false;
      this._componentFocusMode = false;
      this._currentOrder = order;
      this._currentZone = zone;
      this._currentScene = scene;
    }
  }, {
    key: 'getCurrentPosition',
    value: function getCurrentPosition() {
      return {
        'order': this._currentOrder,
        'zone': this._currentZone,
        'scene': this._currentScene
      };
    }
  }, {
    key: 'isFocusOn',
    value: function isFocusOn() {
      return this._zoneFocusMode && this._componentFocusMode;
    }
  }, {
    key: 'setFocusOnByElement',
    value: function setFocusOnByElement(el) {
      this.exitFocusMode();
      var sceneMap = this._getSceneMap(2, this._currentScene);
      var size = sceneMap.size;
      var newOrder = -1;

      for (var i = 0; i < size; i++) {
        var item = sceneMap.get(i);
        if (item.el === el) {
          newOrder = i;
          break;
        }
      }

      if (newOrder > -1) {
        this._currentZone = 2;
        this._currentOrder = newOrder;

        this._zoneFocusMode = true;
        this._componentFocusMode = true;
        this._setZoneFocusOn();
        console.log('[Focus.js] Focus On from SetFocusByElement');
        this._setComponentFocusOn();
        window.addEventListener('click', this._onBodyClickListener);
      }

      return newOrder;
    }
  }, {
    key: 'setOptions',
    value: function setOptions(_ref9) {
      var loop = _ref9.loop;

      this._Loop = loop;
    }
  }, {
    key: 'storeLastFocusPosition',
    value: function storeLastFocusPosition(key, value) {
      this._lastFocusMap.set(key, value);
    }
  }, {
    key: 'loadLastFocusPosition',
    value: function loadLastFocusPosition(key) {
      return this._lastFocusMap.get(key);
    }
  }]);
  return Focus;
}();

var focusInstance = exports.focusInstance = new Focus();

function install(_Vue) {
  hardkey = (0, _hardkey.getHardkeyInstance)();
  focusInstance._bind();
  _Vue.prototype.$focus = focusInstance;
  _Vue.prototype.$hardkey = hardkey;
  return focusInstance;
}

/***/ }),
/* 194 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(195), __esModule: true };

/***/ }),
/* 195 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(82);
__webpack_require__(34);
__webpack_require__(86);
__webpack_require__(196);
__webpack_require__(203);
__webpack_require__(206);
__webpack_require__(208);
module.exports = __webpack_require__(0).Map;


/***/ }),
/* 196 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var strong = __webpack_require__(197);
var validate = __webpack_require__(94);
var MAP = 'Map';

// 23.1 Map Objects
module.exports = __webpack_require__(199)(MAP, function (get) {
  return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = strong.getEntry(validate(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return strong.def(validate(this, MAP), key === 0 ? 0 : key, value);
  }
}, strong, true);


/***/ }),
/* 197 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var dP = __webpack_require__(5).f;
var create = __webpack_require__(25);
var redefineAll = __webpack_require__(92);
var ctx = __webpack_require__(17);
var anInstance = __webpack_require__(93);
var forOf = __webpack_require__(31);
var $iterDefine = __webpack_require__(37);
var step = __webpack_require__(87);
var setSpecies = __webpack_require__(198);
var DESCRIPTORS = __webpack_require__(6);
var fastKey = __webpack_require__(29).fastKey;
var validate = __webpack_require__(94);
var SIZE = DESCRIPTORS ? '_s' : 'size';

var getEntry = function (that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index];
  // frozen object case
  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;         // collection type
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = validate(this, NAME);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        validate(this, NAME);
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(validate(this, NAME), key);
      }
    });
    if (DESCRIPTORS) dP(C.prototype, 'size', {
      get: function () {
        return validate(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var entry = getEntry(that, key);
    var prev, index;
    // change existing entry
    if (entry) {
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index !== 'F') that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function (C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function (iterated, kind) {
      this._t = validate(iterated, NAME); // target
      this._k = kind;                     // kind
      this._l = undefined;                // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l;
      // revert to the last existing entry
      while (entry && entry.r) entry = entry.p;
      // get next entry
      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if (kind == 'keys') return step(0, entry.k);
      if (kind == 'values') return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};


/***/ }),
/* 198 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(7);
var core = __webpack_require__(0);
var dP = __webpack_require__(5);
var DESCRIPTORS = __webpack_require__(6);
var SPECIES = __webpack_require__(4)('species');

module.exports = function (KEY) {
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};


/***/ }),
/* 199 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(7);
var $export = __webpack_require__(3);
var meta = __webpack_require__(29);
var fails = __webpack_require__(14);
var hide = __webpack_require__(12);
var redefineAll = __webpack_require__(92);
var forOf = __webpack_require__(31);
var anInstance = __webpack_require__(93);
var isObject = __webpack_require__(8);
var setToStringTag = __webpack_require__(28);
var dP = __webpack_require__(5).f;
var each = __webpack_require__(200)(0);
var DESCRIPTORS = __webpack_require__(6);

module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};
  if (!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    C = wrapper(function (target, iterable) {
      anInstance(target, C, NAME, '_c');
      target._c = new Base();
      if (iterable != undefined) forOf(iterable, IS_MAP, target[ADDER], target);
    });
    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','), function (KEY) {
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if (KEY in proto && !(IS_WEAK && KEY == 'clear')) hide(C.prototype, KEY, function (a, b) {
        anInstance(this, C, KEY);
        if (!IS_ADDER && IS_WEAK && !isObject(a)) return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    IS_WEAK || dP(C.prototype, 'size', {
      get: function () {
        return this._c.size;
      }
    });
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F, O);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};


/***/ }),
/* 200 */
/***/ (function(module, exports, __webpack_require__) {

// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = __webpack_require__(17);
var IObject = __webpack_require__(39);
var toObject = __webpack_require__(19);
var toLength = __webpack_require__(26);
var asc = __webpack_require__(201);
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};


/***/ }),
/* 201 */
/***/ (function(module, exports, __webpack_require__) {

// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = __webpack_require__(202);

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};


/***/ }),
/* 202 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(8);
var isArray = __webpack_require__(78);
var SPECIES = __webpack_require__(4)('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};


/***/ }),
/* 203 */
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = __webpack_require__(3);

$export($export.P + $export.R, 'Map', { toJSON: __webpack_require__(204)('Map') });


/***/ }),
/* 204 */
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = __webpack_require__(70);
var from = __webpack_require__(205);
module.exports = function (NAME) {
  return function toJSON() {
    if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};


/***/ }),
/* 205 */
/***/ (function(module, exports, __webpack_require__) {

var forOf = __webpack_require__(31);

module.exports = function (iter, ITERATOR) {
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};


/***/ }),
/* 206 */
/***/ (function(module, exports, __webpack_require__) {

// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
__webpack_require__(207)('Map');


/***/ }),
/* 207 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// https://tc39.github.io/proposal-setmap-offrom/
var $export = __webpack_require__(3);

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { of: function of() {
    var length = arguments.length;
    var A = new Array(length);
    while (length--) A[length] = arguments[length];
    return new this(A);
  } });
};


/***/ }),
/* 208 */
/***/ (function(module, exports, __webpack_require__) {

// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
__webpack_require__(209)('Map');


/***/ }),
/* 209 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// https://tc39.github.io/proposal-setmap-offrom/
var $export = __webpack_require__(3);
var aFunction = __webpack_require__(60);
var ctx = __webpack_require__(17);
var forOf = __webpack_require__(31);

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { from: function from(source /* , mapFn, thisArg */) {
    var mapFn = arguments[1];
    var mapping, A, n, cb;
    aFunction(this);
    mapping = mapFn !== undefined;
    if (mapping) aFunction(mapFn);
    if (source == undefined) return new this();
    A = [];
    if (mapping) {
      n = 0;
      cb = ctx(mapFn, arguments[2], 2);
      forOf(source, false, function (nextItem) {
        A.push(cb(nextItem, n++));
      });
    } else {
      forOf(source, false, A.push, A);
    }
    return new this(A);
  } });
};


/***/ }),
/* 210 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHardkeyInstance = exports.hardkeyCode = undefined;

var _classCallCheck2 = __webpack_require__(51);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(52);

var _createClass3 = _interopRequireDefault(_createClass2);

var _symbol = __webpack_require__(47);

var _symbol2 = _interopRequireDefault(_symbol);

var _appManager = __webpack_require__(95);

var _appManager2 = _interopRequireDefault(_appManager);

var _events = __webpack_require__(13);

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var code = {
  HARDKEY_TYPE_NONE: 1000,
  HARDKEY_BUTTON_HOME: 1001,
  HARDKEY_BUTTON_BACK: 1002,
  HARDKEY_ROTARY_ROTATE: 2001,
  HARDKEY_ROTARY_ENTER: 2002,
  HARDKEY_ROTARY_LEFT: 2003,
  HARDKEY_ROTARY_RIGHT: 2004,
  HARDKEY_ROTARY_UP: 2005,
  HARDKEY_ROTARY_DOWN: 2006 };

var mode = {
  HARDKEY_MODE_NONE: 0,
  HARDKEY_MODE_PRESS: 1,
  HARDKEY_MODE_LONG_PRESS: 2,
  HARDKEY_MODE_RELEASE: 3,
  HARDKEY_MODE_LEFT: 4,
  HARDKEY_MODE_RIGHT: 5 };

function getKeyCodes() {
  if (!window.applicationFramework) {
    code = {
      HARDKEY_TYPE_NONE: 1000,
      HARDKEY_BUTTON_HOME: 104,
      HARDKEY_BUTTON_BACK: 98,
      HARDKEY_ROTARY_ROTATE: 113,
      HARDKEY_ROTARY_ENTER: 114,
      HARDKEY_ROTARY_LEFT: 97,
      HARDKEY_ROTARY_RIGHT: 100,
      HARDKEY_ROTARY_UP: 119,
      HARDKEY_ROTARY_DOWN: 115 };
  }
  return {
    code: code,
    mode: mode
  };
}

var hardkeyCode = exports.hardkeyCode = getKeyCodes();

var singleton = (0, _symbol2.default)();
var singletonEnforcer = (0, _symbol2.default)();

var Hardkey = function () {
  function Hardkey(enforcer) {
    (0, _classCallCheck3.default)(this, Hardkey);

    if (enforcer !== singletonEnforcer) {
      throw new Error('Cannot construct singleton');
    }
    this.appManager = _appManager2.default;
    this._bind();
    this._hardKeyListener = [];
  }

  (0, _createClass3.default)(Hardkey, [{
    key: '_bind',
    value: function _bind() {
      if (this.appManager) {
        window.addEventListener('hardkey', this._handleEvent.bind(this));
      } else {
        document.addEventListener('keypress', this._handleEvent.bind(this));
      }
    }
  }, {
    key: '_handleEvent',
    value: function _handleEvent(event) {
      var code = event.hardkeyType !== undefined ? event.hardkeyType : event.key === 'Q' | event.key === 'q' ? 113 : event.key.charCodeAt(0);
      var mode = event.hardkeyMode !== undefined ? event.hardkeyMode : ['w', 'r', 'a', 's', 'd'].includes(event.key) ? hardkeyCode.mode.HARDKEY_MODE_RELEASE : event.shiftKey ? hardkeyCode.mode.HARDKEY_MODE_LEFT : hardkeyCode.mode.HARDKEY_MODE_RIGHT;
      var tick = event.hardkeyTick;

      window.hardkeyEventObj = event.hardkeyType ? event : { 'notProcessedCount': function notProcessedCount() {} };
      window.hardkeyEventObj.code = code;
      window.hardkeyEventObj.mode = mode;

      var modeInEmit = [hardkeyCode.mode.HARDKEY_MODE_RELEASE, hardkeyCode.mode.HARDKEY_MODE_RIGHT, hardkeyCode.mode.HARDKEY_MODE_LEFT];
      if (modeInEmit.indexOf(mode) < 0 && code !== hardkeyCode.code.HARDKEY_ROTARY_ENTER) {
        return;
      }

      var arr = this._findKeyCode(code);
      arr.forEach(function (item) {
        item.cb({ code: code, mode: mode, tick: tick });
      });

      this._emitArrowKeyEvent(event);
    }
  }, {
    key: 'addHardkeyListener',
    value: function addHardkeyListener(type, cb) {
      this._hardKeyListener.push({
        type: type,
        cb: cb
      });
    }
  }, {
    key: 'removeHardkeyListener',
    value: function removeHardkeyListener(type, cb) {
      this._hardKeyListener = this._hardKeyListener.filter(function (obj) {
        return !(obj.cb === cb && obj.type === type);
      });
    }
  }, {
    key: '_findKeyCode',
    value: function _findKeyCode(val) {
      return this._hardKeyListener.filter(function (obj) {
        return obj.type === val;
      });
    }
  }, {
    key: 'getCodes',
    value: function getCodes() {
      return hardkeyCode;
    }
  }, {
    key: 'sendRemainTick',
    value: function sendRemainTick() {
      var tick = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      window.hardkeyEventObj.notProcessedCount(window.hardkeyEventObj.code, window.hardkeyEventObj.mode, tick);
    }
  }, {
    key: '_emitArrowKeyEvent',
    value: function _emitArrowKeyEvent(event) {
      switch (event.hardkeyType) {
        case hardkeyCode.code.HARDKEY_ROTARY_LEFT:
          _events2.default.$emit('csw:left', event);
          break;
        case hardkeyCode.code.HARDKEY_ROTARY_RIGHT:
          _events2.default.$emit('csw:right', event);
          break;
        case hardkeyCode.code.HARDKEY_ROTARY_UP:
          _events2.default.$emit('csw:up', event);
          break;
        case hardkeyCode.code.HARDKEY_ROTARY_DOWN:
          _events2.default.$emit('csw:down', event);
          break;
        default:
          break;
      }
    }
  }], [{
    key: 'instance',
    get: function get() {
      if (!this[singleton]) {
        this[singleton] = new Hardkey(singletonEnforcer);
      }

      return this[singleton];
    }
  }]);
  return Hardkey;
}();

var getHardkeyInstance = exports.getHardkeyInstance = function getHardkeyInstance() {
  return Hardkey.instance;
};

/***/ })
]);