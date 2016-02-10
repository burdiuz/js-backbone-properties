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
  var ModelDecorator = (function() {
    'use strict';
  
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
          get: getter ? getter.bind(model) : ModelDecorator.createPropertyGetter(model, name),
          enumerable: true,
          configurable: true
        };
  
        if (setter !== true) {
          descriptor.set = setter ? setter.bind(model) : ModelDecorator.createPropertySetter(model, name);
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
        options = this.propertyOptions[name];
      } else {
        options = options || {};
        this.propertyOptions[name] = options;
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
      defineProperties(model, facade, model.propertyOptions);
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
      switch (ModelDecorator.facadeType) {
        case ModelDecorator.USE_MODEL:
          target = model;
          break;
        case ModelDecorator.USE_FACADE:
        default:
          target = facade;
          break;
      }
      return target;
    }
  
    function initialize() {
      Object.defineProperty(this, 'propertyOptions', {
        value: this.propertyOptions || {},
        writable: false,
        enumerable: false,
        configurable: false
      });
      var facade = new ModelFacade(this);
      if (ModelDecorator.facadeType !== ModelDecorator.USE_MODEL) {
        Object.defineProperty(this, ModelDecorator.facadeFieldName, {
          value: facade,
          writable: false,
          enumerable: false,
          configurable: false
        });
      }
    }
  
    /**
     * @extends Backbone.Model
     * @constructor
     */
    var ModelDecorator = Backbone.Model.extend({
      initialize: initialize,
      property: property,
      validateProperties: validateProperties
    });
  
    Object.defineProperties(ModelDecorator, {
      /**
       * One of possible `facadeType` values, if set, will decorate Model itself with new properties.
       * @type {string}
       */
      USE_MODEL: {
        value: 'model'
      },
      /**
       * One of possible `facadeType` values, if set, will keep generated properties in Facade object available via `model.properties`.
       * @type {string}
       */
      USE_FACADE: {
        value: 'facade'
      },
      /**
       * @type {String} 'model' or 'facade' defining where properties will be created. By default 'facade'.
       */
      facadeType: {
        value: 'facade',
        writable: true
      },
      /**
       * Default facade field name, name of model property where facade object will be accessed.
       * @type {string}
       */
      DEFAULT_FACADE_FIELD_NAME: {
        value: 'properties'
      },
      facadeFieldName: {
        get: function() {
          return _facadeFieldName;
        },
        set: function(value) {
          value = String(value);
          if (!value) {
            throw new Error('Value for ModelDecorator.facadeFieldName must be proper identifier.');
          }
          _facadeFieldName = value;
        }
      }
    });
    var _facadeFieldName = ModelDecorator.DEFAULT_FACADE_FIELD_NAME;
  
    ModelDecorator.createPropertyGetter = function(model, name) {
      return function getter() {
        return model.get(name);
      }
    };
  
    ModelDecorator.createPropertySetter = function(model, name) {
      return function setter(value) {
        var prop = {};
        prop[name] = value;
        model.set(prop, model.propertyOptions[name]);
      };
    };
    return ModelDecorator;
  })();
  
  return ModelDecorator;
}));
