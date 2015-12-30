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

  //FIXME add test case where options returned for property(name)
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
          return decorated.escape('value4');
        });
        decorated.property('value5', null,
          function(value) {
            decorated.set({value5: '-' + value});
          },
          function() {
            return decorated.get('value5') + '-';
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
});
