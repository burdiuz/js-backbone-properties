# Backbone Model Decorator

[![Build Status](https://travis-ci.org/burdiuz/js-backbone-properties.svg?branch=master)](https://travis-ci.org/burdiuz/js-backbone-properties)
[![Coverage Status](https://coveralls.io/repos/burdiuz/js-backbone-properties/badge.svg?branch=master&service=github)](https://coveralls.io/github/burdiuz/js-backbone-properties?branch=master)
[![Dependencies](https://img.shields.io/david/burdiuz/js-backbone-properties.svg?label=deps)](https://david-dm.org/burdiuz/js-backbone-properties)
[![Dev Dependencies](https://img.shields.io/david/dev/burdiuz/js-backbone-properties.svg?label=devDeps)](https://david-dm.org/burdiuz/js-backbone-properties#info=devDependencies)

Backbone Model Decorator is a [Backbone.js]() plugin that decorates `Backbone.Model` with `properties` property that plays role of Model Facade and contains model attributes in form of properties.
```javascript
var decorated = ModelDecorator.extend({
  defaults: {
    email: 'default@email.com',
    password: ''
  }
});
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
This package available via npm 
 ```
 bower install backbone-model-decorator --save
 ```
 and bower distribution systems
 ```
 npm install backbone-model-decorator --save
 ```
 Also you can [download it as single file](). 


## Usage

To start using decorator you should extend model from ModelDecorator instead of Backbone.Model.
```javascript
var decorated = ModelDecorator.extend({
  ...
});
```
Worth noting that Model should `know` about possible attributes it might have to properly initialize Facade properties.
Facade object is populated with properties when model initialization occurs, so it has 3 sources for possible properties:
1. Model attributes object
2. Model defaults object
3. Model _propertyOptions object that contains default options applied on property set
These objects are checked for property names and each found property will be mirrored on facade object as possible Model attribute.  

There are two ways to add properties to Facade after model initialization
 * Using `Model.validateProperties()`
 * Using `Model.property()`

Backbone model extension which adds facade for Backbone Model accessible via `.properies` 
property of any Model extended from it. This facade will contain accessors and mutators
(getters and setters) for each Model attribute described in `attributes` or `defaults`
(also will look in `_propertyOptions`).  
