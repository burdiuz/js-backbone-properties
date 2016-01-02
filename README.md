# Backbone Model Decorator

[![Build Status](https://travis-ci.org/burdiuz/js-backbone-properties.svg?branch=master)](https://travis-ci.org/burdiuz/js-backbone-properties)
[![Coverage Status](https://coveralls.io/repos/burdiuz/js-backbone-properties/badge.svg?branch=master&service=github)](https://coveralls.io/github/burdiuz/js-backbone-properties?branch=master)
[![Dependencies](https://img.shields.io/david/burdiuz/js-backbone-properties.svg?label=deps)](https://david-dm.org/burdiuz/js-backbone-properties)
[![Dev Dependencies](https://img.shields.io/david/dev/burdiuz/js-backbone-properties.svg?label=devDeps)](https://david-dm.org/burdiuz/js-backbone-properties#info=devDependencies)

Backbone Model Decorator is a [Backbone.js](http://backbonejs.org/) plugin that decorates `Backbone.Model` with `properties` property that plays role of Model Facade and contains model attributes in form of properties.
```javascript
var DecoratedModel = ModelDecorator.extend({
  defaults: {
    email: 'default@email.com',
    password: ''
  }
});
var decorated = new DecoratedModel();
```
Getting model attribute via such property will return current value of the attribute.
```javascript
console.log(decorated.properties.email); // default@email.com
decorated.set({password: '@!$^&SEvjH#'}); 
console.log(decorated.properties.password); // @!$^&SEvjH#
```
And setting new value to property will immediately change model attribute.
```javascript
decorated.properties.email = 'other@email.com';
console.log(decorated.get('email')); // other@email.com
decorated.properties.email = '@!$^&SEvjH#';
console.log(decorated.get('password')); // @!$^&SEvjH#
```

## Installation

This package is available via npm 
 ```
 npm install backbone-model-decorator --save
 ```
 and bower distribution systems
 ```
 bower install backbone-model-decorator --save
 ```
 Also you can download it as [single file with comments](https://raw.githubusercontent.com/burdiuz/js-backbone-properties/master/dist/backbone-properties.js) or [minified](https://raw.githubusercontent.com/burdiuz/js-backbone-properties/master/dist/backbone-properties.min.js) from this repository. 


## Usage

To start using decorator you should extend model from ModelDecorator instead of Backbone.Model.
```javascript
var decorated = ModelDecorator.extend({
  ...
});
```
With extending from ModelDecorator, extended model gains new properties and methods.

 * `properties` -- Facade object with all generated properties
 * `propertyOptions` -- Object containing options for model attributes that should be used by default when setting new value via setter function
 * `validateProperties()` -- Method that allows creating bunch of properties on Facade object by going through passed object's property names
 * `property()` -- Method that allows adding or changing single property on Facade object

Worth noting that Model should `know` about possible attributes it might have to properly initialize Facade properties.
Facade object is populated with properties when model initialization occurs, so it has 3 sources for possible properties:
1. Model `attributes` object
2. Model `defaults` object
3. Model `propertyOptions` object that contains default options applied on property set
These objects are checked for property names and each found property will be mirrored on facade object as possible Model attribute.  

There are two ways to add properties to Facade after model initialization
 * Using `Model.validateProperties()`
 * Using `Model.property()`
Also its possible to re-define property via `Model.property()` adding custom getter/setter functions or making read-only properties.
 
### Model.properties

Default place where Model Facade object will be stored is `properties` field in Model object. This can be changed in 2 ways.
1. Set ModelDecorator to create properties using Model object without creating Facade object. All newly created properties will be available directly from model.
```javascript
ModelDecorator.facadeType = ModelDecorator.USE_MODEL;
var DecoratedModel = ModelDecorator.extend({
  defaults: {
    value: 'this is value',
    name: 'this is name'
  }
});

var decorated = new DecoratedModel();

console.log(decorated.properties); // null
console.log(decorated.value); // this is value
console.log(decorated.name); // this is name

decorated.value = 'new value';
decorated.set({name: 'update name'});

console.log(decorated.get('value')); // new value
console.log(decorated.name); // update name
```
**Note:* Creating properties on model may cause name collisions with internal Backbone Model instance fields.*
  
2. Change Facade property name from `properties` to anything else. In this case Facade will be created and stored in field with specified name. All created properties will be stored in Facade object.
```javascript
ModelDecorator.facadeFieldName = 'props';

var DecoratedModel = ModelDecorator.extend({
  defaults: {
    value: 'this is value',
    name: 'this is name'
  }
});
var decorated = new DecoratedModel();

console.log(decorated.properties); // null
console.log(decorated.props); // ModelFacade {}

console.log(decorated.props.value); // this is value
console.log(decorated.props.name); // this is name

decorated.props.value = 'new value';
decorated.set({name: 'update name'});

console.log(decorated.get('value')); // new value
console.log(decorated.props.name); // update name
```
**Note:*Renaming facade property to names used by Backbone Model, like `attributes`, may cause unexpected errors.*

### Model.validateProperties()

`validateProperties()` does lookup for names on passed object and uses this names to create new properties on facade. 
It will not apply values from passed objects, so new model properties will be created but not initialized.
```javascript
var DecoratedModel = ModelDecorator.extend({});
var decorated = new DecoratedModel();
decorated.validateProperties({value:'any value here', name: '#$%#$'});

console.log(decorated.properties.hasOwnProperty('value')); // true
console.log(decorated.properties.value); // undefined
console.log(decorated.properties.name); // undefined

decorated.properties.value = 'value1';
decorated.properties.name = 'new name';

console.log(decorated.attributes); // Object {value: "value1", name: "new name"}
console.log(decorated.properties.value); // value1
console.log(decorated.properties.name); // new name
```

### Model.property()

This method has up to 4 arguments with only first argument required, other are optional.
1. name -- Model attribute name for which property should be created
2. options -- Object containing options that should be used on every value update
3. setter -- Accepts custom setter function or `true` if property should be read-only
4. getter -- Custom getter function

With this method its easy to create computed properties that will not mess with original model
```javascript
var DecoratedModel = ModelDecorator.extend({
  defaults: {
    email: 'default@email.com',
    password: ''
  }
});
var decorated = new DecoratedModel();
decorated.property('emailLink', null, true, (function() {
  return 'emailTo:'+this.properties.email; 
}).bind(decorated));
console.log(decorated.properties.emailLink); // emailTo:default@email.com
```

It always returns property options, if called with name of existing property it will do nothing but return this property options.
```javascript
var DecoratedModel = ModelDecorator.extend({
  defaults: {
    value: ''
  },
  validate: function(options, opts){
    return !options.value || options.value.length < opts.minLength;
  },
  propertyOptions: {
    value: {
      validate: true,
      minLength: 2
    }
  }
});
var decorated = new DecoratedModel();

console.log(decorated.property('value').validate); // true
console.log(decorated.property('value').minLength); // 2
``` 

### ModelDecorator.createPropertyGetter/Setter()

ModelDecorator has 2 statics methods that called when getter or setter should be generated. These methods can be replaced by custom implementation.
* `ModelDecorator.createPropertyGetter()` -- property getter method generator
* `ModelDecorator.createPropertySetter()` -- property setter method generator

They have identical signature, as parameters model and property name should be passed and both will return function as result.
 ```typescript
 ModelDecorator.createPropertyGetter(model:Backbone.Model, name:String):Function
 ```
