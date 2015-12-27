# JS-Backbone-Properties

![Build](https://travis-ci.org/burdiuz/js-backbone-properties.svg)
![Coverage](https://travis-ci.org/burdiuz/js-backbone-properties.svg)
[![Dependencies](https://img.shields.io/david/burdiuz/js-backbone-properties.svg?label=deps)](https://david-dm.org/burdiuz/js-backbone-properties)
[![Dev Dependencies](https://img.shields.io/david/dev/burdiuz/js-backbone-properties.svg?label=devDeps)](https://david-dm.org/burdiuz/js-backbone-properties#info=devDependencies)


Backbone model extension which adds facade for Backbone Model accessible via `.properies` 
property of any Model extended from it. This facade will contain accessors and mutators
(getters and setters) for each Model attribute described in `attributes` or `defaults`
(also will look in `_propertyOptions`).  
