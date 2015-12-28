/*
 TODO's:
 1. Make getter/setter generator functions to be static methods of ModelDecorator, so developer can overwrite them.
 2. make facadeType to be static field available from ModelDecorator
 3. Add possibility to change facade property name from `properties`, for example, to `props`via static field. `ModelDecorator.facadeFieldName`?
 */

/**
 * @extends Backbone.Model
 * @constructor
 */
var ModelDecorator = (/**
 *
 * @param facadeType {String} 'model' or 'facade' defining where properties will be defined. By default 'facade'.
 * @returns {ModelFacade}
 */
  function(facadeType) {
  'use strict';
  /**
   * One of possible `facadeType` values, if set, will decorate Model itself with new properties.
   * @type {string}
   */
  var USE_MODEL = 'model';
  /**
   * One of possible `facadeType` values, if set, will keep generated properties in Facade object available via `model.properties`.
   * @type {string}
   */
  var USE_FACADE = 'facade';

  /**
   *
   * @param model {ModelDecorator}
   * @param facade {ModelFacade}
   * @param name {String}
   * @param setter {Function|Boolean}
   * @param getter {Function}
   * @returns {boolean}
   */
  function defineProperty(model, facade, name, setter, getter) {
    var result = false;
    if (setter || getter || !facade.hasOwnProperty(name)) {
      var descriptor = {
        get: getter || function() {
          return model.get(name);
        },
        enumerable: true,
        configurable: true
      };

      if (setter !== true) {
        descriptor.set = setter || function(value) {
            var prop = {};
            prop[name] = value;
            model.set(prop, model._propertyOptions[name]);
          };
      }
      Object.defineProperty(facade, name, descriptor);
      result = true;
    }
    return result;
  }

  /**
   *
   * @param model {ModelDecorator}
   * @param facade {ModelFacade}
   * @param names {Object}
   */
  function defineProperties(model, facade, names) {
    if (names) {
      for (var name in names) {
        defineProperty(model, facade, name);
      }
    }
  }

  /**
   *
   * @param name {String}
   * @param options {Object}
   * @param setter {Function|boolean}
   * @param getter {Function}
   * @returns {Object}
   */
  function property(name, options, setter, getter) {
    if (!defineProperty(this, this.properties, name, setter, getter) && arguments.length === 1) {
      options = this._propertyOptions[name];
    } else {
      options = options || {};
      this._propertyOptions[name] = options;
    }
    return options;
  }

  /**
   * @param source {Object}
   */
  function validateProperties(source) {
    source = source || this.attributes;
    var facade = getDecorationTarget(this, this.properties);
    defineProperties(this, facade, source);
  }

  /**
   *
   * @param model {ModelDecorator}
   * @param facade {Object}
   * @constructor
   */
  function ModelFacade(model) {
    var facade = getDecorationTarget(model, this);
    defineProperties(model, facade, model.attributes);
    defineProperties(model, facade, model._propertyOptions);
    defineProperties(model, facade, model.defaults);
  }

  /**
   *
   * @param model {ModelDecorator}
   * @param facade {ModelFacade}
   * @returns {ModelDecorator|ModelFacade}
   */
  function getDecorationTarget(model, facade) {
    var target;
    switch (facadeType) {
      case USE_MODEL:
        target = model;
        break;
      case USE_FACADE:
      default:
        target = facade;
        break;
    }
    return target;
  }

  function initialize() {
    Object.defineProperty(this, '_propertyOptions', {
      value: this._propertyOptions || {},
      writable: false,
      enumerable: false,
      configurable: false
    });
    Object.defineProperty(this, 'properties', {
      value: new ModelFacade(this),
      writable: false,
      enumerable: false,
      configurable: false
    });
  }

  return Backbone.Model.extend({
    initialize: initialize,
    properties: null,
    property: property,
    validateProperties: validateProperties
  });
})(null);
