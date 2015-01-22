
/**
 * Module dependencies.
 */

var css = require('css');
var convertSourceMap = require('convert-source-map');
var parse = css.parse;
var stringify = css.stringify;
var Promise = require('bluebird');
var clone = require('clone');

/**
 * Expose `rework`.
 */

exports = module.exports = rework;

/**
 * Initialize a new stylesheet `Rework` with `str`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Rework}
 * @api public
 */

function rework(str, options) {
  return new Rework(parse(str, options));
}

/**
 * Initialize a new stylesheet `Rework` with `obj`.
 *
 * @param {Object} obj
 * @api private
 */

function Rework(obj) {
  this.obj = obj;
}

/**
 * Use the given plugin `fn(style, rework)`.
 *
 * @param {Function} fn
 * @return {Rework}
 * @api public
 */

Rework.prototype.use = function(fn){
  fn(this.obj.stylesheet, this);
  return this;
};

/**
 * Use the given async plugin `fn(style)`.
 *
 * @param {Function} fn
 * @return {Promise}
 * @api public
 */

Rework.prototype.then = function(fn) {
  var self = this;
  var style = clone(self.obj.stylesheet, true);
  return fn(style).then(
    function(newStyle) {
      self.obj.stylesheet = newStyle;
      return newStyle;
    }, function(error) { throw error; }
  );
};

/**
 * Stringify the stylesheet.
 *
 * @param {Object} options
 * @return {String}
 * @api public
 */

Rework.prototype.toString = function(options){
  options = options || {};
  var result = stringify(this.obj, options);
  if (options.sourcemap && !options.sourcemapAsObject) {
    result = result.code + '\n' + sourcemapToComment(result.map);
  }
  return result;
};

/**
 * Convert sourcemap to base64-encoded comment
 *
 * @param {Object} map
 * @return {String}
 * @api private
 */

function sourcemapToComment(map) {
  var content = convertSourceMap.fromObject(map).toBase64();
  return '/*# sourceMappingURL=data:application/json;base64,' + content + ' */';
}
