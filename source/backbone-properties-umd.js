/**
 * Created by Oleg Galaburda on 26.12.15.
 */
// Uses Node, AMD or browser globals to create a module.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['backbone'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('backbone'));
  } else {
    // Browser globals (root is window)
    root.ModelDecorator = factory(root.Backbone);
  }
}(this, function (Backbone) {
  // here should be injected backbone-properties.js content
  //=require backbone-properties.js
  return ModelDecorator;
}));
