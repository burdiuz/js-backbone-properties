/**
 * Created by Oleg Galaburda on 27.12.15.
 */
describe('ModelDecorator', function() {

  describe('Init', function() {

    describe('Model.properties', function() {
      var decorated;
      beforeEach(function() {
        decorated = new (ModelDecorator.extend({}));
      });
      it('should have facade object', function() {
        expect(decorated.properties).toBeDefined();
        expect(decorated.properties).toEqual(jasmine.any(Object));
      });
    });

    describe('From attributes', function() {
      var decorated;
      beforeEach(function() {
        var DecoratedModel = ModelDecorator.extend({});
        decorated = new DecoratedModel({
          booleanProp: true,
          stringProp: 'abc'
        });
      });
      it('should have properties defined', function() {
        expect(decorated.properties.booleanProp).toEqual(true);
        expect(decorated.properties.stringProp).toEqual('abc');
      });
    });

    describe('From defaults', function() {
      var decorated;
      beforeEach(function() {
        var DecoratedModel = ModelDecorator.extend({
          defaults: {
            booleanProp: true,
            stringProp: 'abc'
          }
        });
        decorated = new DecoratedModel({});
      });
      it('should have properties defined', function() {
        expect(decorated.properties.booleanProp).toEqual(true);
        expect(decorated.properties.stringProp).toEqual('abc');
      });
    });

    describe('From propertyOptions', function() {
      var decorated;
      beforeEach(function() {
        var DecoratedModel = ModelDecorator.extend({
          propertyOptions: {
            booleanProp: {},
            stringProp: {
              validate: true
            }
          }
        });
        decorated = new DecoratedModel({});
      });
      it('should have properties defined', function() {
        expect(decorated.properties.hasOwnProperty('booleanProp')).toBeTruthy();
        expect(decorated.properties.hasOwnProperty('stringProp')).toBeTruthy();
      });
    });

    describe('Mixed', function() {
      var decorated;
      beforeEach(function() {
        var DecoratedModel = ModelDecorator.extend({
          defaults: {
            stringProp: 'def'
          },
          propertyOptions: {
            numberProp: {}
          }
        });
        decorated = new DecoratedModel({
          booleanProp: false
        });
      });
      it('should have properties defined', function() {
        expect(decorated.properties.booleanProp).toEqual(false);
        expect(decorated.properties.stringProp).toEqual('def');
        expect(decorated.properties.hasOwnProperty('numberProp')).toBeTruthy();
      });
    });
  });

  describe('Using attribute options', function() {
    var decorated;
    beforeEach(function() {
      var DecoratedModel = ModelDecorator.extend({
        propertyOptions: {
          value: {
            validate: true
          }
        },
        validate: function(props, opts) {
          var error = '';
          if (!props.value || props.value.length < 5) {
            error = 'error';
          }
          return error;
        }
      });
      decorated = new DecoratedModel();
    });
    it('should call validation on set', function() {
      expect(decorated.validationError).toBeFalsy();
      decorated.properties.value = '123';
      expect(decorated.validationError).toBeTruthy();
      decorated.properties.value = '123456';
      expect(decorated.validationError).toBeFalsy();
    });
  });

  describe('Using facade properties', function() {
    var decorated;
    beforeEach(function() {
      var DecoratedModel = ModelDecorator.extend({
        defaults: {
          value: 1
        }
      });
      decorated = new DecoratedModel();
    });
    it('should be able to get current model value', function() {
      expect(decorated.properties.value).toBe(1);
      decorated.set({value: 3});
      expect(decorated.properties.value).toBe(3);
      decorated.properties.value = 5;
      expect(decorated.properties.value).toBe(5);
    });
    it('should be able to update model value', function() {
      decorated.properties.value = 3;
      expect(decorated.properties.value).toBe(3);
      expect(decorated.get('value')).toBe(3);
      decorated.properties.value = 5;
      expect(decorated.properties.value).toBe(5);
      expect(decorated.get('value')).toBe(5);
      ;
    });
  });

  describe('.property()', function() {
    var decorated;
    beforeEach(function() {
      var DecoratedModel = ModelDecorator.extend({});
      decorated = new DecoratedModel();
    });

    describe('Add property by name', function() {
      beforeEach(function() {
        decorated.property('value1');
        decorated.properties.value1 = 123;
      });
      it('should create property on facade object', function() {
        expect(decorated.properties.hasOwnProperty('value1')).toBeTruthy();
      });
      it('property should be connected with Model', function() {
        expect(decorated.get('value1')).toBe(123);
      });
    });

    describe('Add property with options', function() {
      beforeEach(function() {
        decorated.property('value2', {validate: true});
        decorated.validate = function(props) {
          return !props.value2;
        }
      });
      it('should create property on facade object', function() {
        expect(decorated.properties.hasOwnProperty('value2')).toBeTruthy();
      });
      it('options should be passed on set', function() {
        decorated.properties.value2 = 0;
        expect(decorated.validationError).toBeTruthy();
        decorated.properties.value2 = 123;
        expect(decorated.validationError).toBeFalsy();
      });
    });

    describe('Add read-only property', function() {
      beforeEach(function() {
        decorated.property('value3', null, true);
      });
      it('property should be readable', function() {
        decorated.set({value3: 123});
        expect(decorated.properties.value3).toBe(123);
      });
      it('should create property on facade object', function() {
        expect(decorated.properties.hasOwnProperty('value3')).toBeTruthy();
      });
      it('property should not be writable', function() {
        expect(function() {
          decorated.properties.value3 = 123;
        }).toThrow();
      });
    });

    describe('Reset property with custom get/set', function() {
      beforeEach(function() {
        decorated.property('value4', null, null, function() {
          return this.escape('value4');
        });
        decorated.property('value5', null,
          function(value) {
            this.set({value5: '-' + value});
          },
          function() {
            return this.get('value5') + '-';
          }
        );
      });
      it('should use custom getter', function() {
        decorated.set({value4: '<>'});
        expect(decorated.properties.value4).toBe('&lt;&gt;');
      });
      it('should use custom getter/setter', function() {
        decorated.properties.value5 = 'value';
        expect(decorated.properties.value5).toBe('-value-');
      });
    });

    describe('Request property\'s options', function() {
      var options;
      beforeEach(function() {
        decorated.validate = function() {
          return null;
        }
        decorated.property('value6', {validate: true, option1: 'any'});
        options = decorated.property('value6');
      });
      it('should return options by property name', function() {
        expect(options).toEqual({validate: true, option1: 'any'});
      });
      it('should have property', function() {
        expect(decorated.properties.hasOwnProperty('value6')).toBeTruthy();
        decorated.properties.value6 = 12;
        expect(decorated.properties.value6).toBe(12);
        expect(decorated.get('value6')).toBe(12);
      });
    });

  });

  describe('.validateProperties()', function() {
    var decorated;
    beforeEach(function() {
      var DecoratedModel = ModelDecorator.extend({});
      decorated = new DecoratedModel();
    });

    describe('Populate from attributes', function() {
      beforeEach(function() {
        decorated.set('value1', 'string');
        decorated.set('prop2', true);
        decorated.validateProperties();
      });
      it('should create properties on facade from Model\'s attributes', function() {
        expect(decorated.properties.value1).toBe('string');
        expect(decorated.properties.prop2).toBe(true);
      });
    });

    describe('Populate from any object', function() {
      beforeEach(function() {
        decorated.validateProperties({
          value1: 'anything',
          prop2: {}
        });
      });
      it('should create properties on facade from Model\'s attributes', function() {
        expect(decorated.properties.hasOwnProperty('value1')).toBeTruthy();
        expect(decorated.properties.hasOwnProperty('prop2')).toBeTruthy();
      });
      it('should not populate created properties with values', function() {
        expect(decorated.properties.value1).not.toBe('anything');
        expect(decorated.properties.value1).toBeUndefined();
      });
    });

  });

  describe('.facadeType', function() {
    var model;
    it('should be USE_FACADE by default', function() {
      expect(ModelDecorator.facadeType).toBe(ModelDecorator.USE_FACADE);
    });

    describe('When USE_MODEL applied', function() {
      var defaultFacadeType;
      beforeEach(function() {
        defaultFacadeType = ModelDecorator.facadeType;
        ModelDecorator.facadeType = ModelDecorator.USE_MODEL;
        var Decorated = ModelDecorator.extend({
          defaults: {
            value: 'my value'
          }
        });
        model = new Decorated();
      });
      afterEach(function() {
        ModelDecorator.facadeType = defaultFacadeType;
      });
      it('should not create facade', function() {
        expect(model[ModelDecorator.facadeFieldName]).toBeUndefined();
      });
      it('should have properties in model', function() {
        expect(model.value).toBe('my value');
        model.value = 'new value';
        expect(model.get('value')).toBe('new value');
      });

    });

    describe('When USE_FACADE applied', function() {
      var defaultFacadeType;
      beforeEach(function() {
        defaultFacadeType = ModelDecorator.facadeType;
        ModelDecorator.facadeType = ModelDecorator.USE_FACADE;
        var Decorated = ModelDecorator.extend({
          defaults: {
            value: 'my value'
          }
        });
        model = new Decorated();
      });
      afterEach(function() {
        ModelDecorator.facadeType = defaultFacadeType;
      });
      it('should create facade', function() {
        expect(model[ModelDecorator.facadeFieldName]).toBeDefined();
      });
      it('should have properties in facade', function() {
        expect(model[ModelDecorator.facadeFieldName].value).toBe('my value');
        model[ModelDecorator.facadeFieldName].value = 'new value';
        expect(model.get('value')).toBe('new value');
      });
    });

  });

  describe('.facadeFieldName', function() {
    it('should be `properties` by default', function() {
      expect(ModelDecorator.facadeFieldName).toBe('properties');
    });

    it('should throw error when set to empty', function() {
      expect(function() {
        ModelDecorator.facadeFieldName = '';
      }).toThrow();
    });

    describe('When changed', function() {
      var defaultFieldName;
      var model;
      beforeEach(function() {
        defaultFieldName = ModelDecorator.facadeFieldName;
        ModelDecorator.facadeFieldName = 'attrs';
        var Decorated = ModelDecorator.extend({
          defaults: {
            value: 'my value'
          }
        });
        model = new Decorated();
        model.attrs.value = 15;
      });
      afterEach(function() {
        ModelDecorator.facadeFieldName = defaultFieldName;
      });
      it('should have facade object accessible via `attrs` property', function() {
        expect(model.attrs).toBeDefined();
      });
      it('should have property in `attrs`', function() {
        expect(model.attrs.value).toBe(15);
        expect(model.get('value')).toBe(15);
      });

    });

  });

  describe('.createPropertyGetter', function() {
    var model;
    var getter;
    var value;
    beforeEach(function() {
      var Decorated = ModelDecorator.extend({});
      model = new Decorated();
    });
    describe('When default used', function() {
      beforeEach(function() {
        spyOn(model, 'get').and.returnValue('attrValue');
        getter = ModelDecorator.createPropertyGetter(model, 'myAttribute');
        value = getter();
      });
      it('should call model\'s get method', function() {
        expect(model.get).toHaveBeenCalled();
      });

      it('should pass attribute name', function() {
        expect(model.get).toHaveBeenCalledWith('myAttribute');
      });
      it('should return model\'s value', function() {
        expect(value).toBe('attrValue');
      });
    });

    describe('When using custom getters', function() {
      var defaultGetterGenerator;
      beforeEach(function() {
        defaultGetterGenerator = ModelDecorator.createPropertyGetter;
        ModelDecorator.createPropertyGetter = function(model, name) {
          return function() {
            return model.get('meta-' + name);
          };
        };
        spyOn(ModelDecorator, 'createPropertyGetter').and.callThrough();
        // read-only property `name`
        model.set({'meta-name': 'meta-value'});
        spyOn(model, 'get').and.callThrough();
        model.property('name', null, true);
      });
      afterEach(function() {
        ModelDecorator.createPropertyGetter = defaultGetterGenerator;
      });
      it('should call custom `createPropertyGetter` when property being generated', function() {
        expect(ModelDecorator.createPropertyGetter).toHaveBeenCalled();
        expect(ModelDecorator.createPropertyGetter).toHaveBeenCalledWith(model, 'name');
      });
      it('property should use custom getter', function() {
        expect(model.properties.name).toBe('meta-value');
        expect(model.get).toHaveBeenCalledWith('meta-name');
      });
    });
  });

  describe('.createPropertySetter', function() {
    var model;
    var setter;
    beforeEach(function() {
      var Decorated = ModelDecorator.extend({});
      model = new Decorated();
      spyOn(model, 'set').and.callThrough();
    });

    describe('When default used', function() {
      beforeEach(function() {
        setter = ModelDecorator.createPropertySetter(model, 'myAttribute');
        model.propertyOptions.myAttribute = {param1: true};
        setter('myValue');
      });
      it('should call model\'s set method', function() {
        expect(model.set).toHaveBeenCalled();
      });

      it('should pass attribute name', function() {
        expect(model.set).toHaveBeenCalledWith({myAttribute: 'myValue'}, {param1: true});
      });
      it('should update model\'s value', function() {
        expect(model.get('myAttribute')).toBe('myValue');
      });
    });

    describe('When using custom setters', function() {
      var defaultSetterGenerator;
      beforeEach(function() {
        defaultSetterGenerator = ModelDecorator.createPropertySetter;
        ModelDecorator.createPropertySetter = function(model, name) {
          return function(value) {
            var obj = {};
            obj['meta-' + name] = value;
            return model.set(obj);
          };
        };
        spyOn(ModelDecorator, 'createPropertySetter').and.callThrough();
        model.property('name');
        model.properties.name = 'meta-value';

      });
      afterEach(function() {
        ModelDecorator.createPropertySetter = defaultSetterGenerator;
      });
      it('should call custom `createPropertySetter` when property being generated', function() {
        expect(ModelDecorator.createPropertySetter).toHaveBeenCalled();
        expect(ModelDecorator.createPropertySetter).toHaveBeenCalledWith(model, 'name');
      });
      it('property should use custom setter', function() {
        expect(model.get('meta-name')).toBe('meta-value');
        expect(model.set).toHaveBeenCalledWith({'meta-name': 'meta-value'});
      });
    });

  });

});
