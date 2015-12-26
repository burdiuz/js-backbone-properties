/**
 * Created by Oleg Galaburda on 26.12.15.
 */

/*
 1. all properties are enumerable
 2. need a way to define target type on compile time -- MODEL/FACADE
 3. exposed model properties/methods:
 properties -- Facade itself
 _propertyOptions -- permanent options applied each time Model's attribute is changed.
 validateProperties() -- check Model's attributes for new and chreate properties for them
 property(name:String, options:Object = null, setter:Function = null, getter:Function = null)
 property(name:String, options:Object = null, readOnly:Boolean = false)
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
    var force = typeof(getter) === 'function';
    if ((typeof setter === 'boolean' && setter) || !setter) {
      setter = null;
    } else force = true;

    if (force || !facade.hasOwnProperty(name)) {
      Object.defineProperty(facade, name, {
        get: getter || function() {
          return model.get(name);
        },
        set: setter || function(value) {
          var prop = {};
          prop[name] = value;
          model.set(prop, model._propertyOptions[name]);
        },
        enumerable: true,
        configurable: true
      });
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

  return Backbone.Model.extend({
    initialize: function() {
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
    },
    properties: null,
    property: property,
    validateProperties: validateProperties,
    _propertyOptions: {}
  });
})(null);
