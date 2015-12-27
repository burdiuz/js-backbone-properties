/**
 * Created by Oleg Galaburda on 26.12.15.
 */

var MyModel = (function() {

  function validate() {
    var error = '';
    console.log(this.properties.password, (/\d+/).test(this.properties.password));
    if (!(/^[^@]+@[^@]+$/).test(this.properties.email)) {
      error = 'Invalid email';
    } else if (this.properties.password.length < 8) {
      error = 'Password must be atleast 8 symbols long.';
    } else if (!(/\d+/).test(this.properties.password)) {
      error = 'Password should contain a digit.';
    } else if (!(/[A-Z]+/).test(this.properties.password)) {
      error = 'Password should contain upper case letter.';
    } else if (!(/[a-z]+/).test(this.properties.password)) {
      error = 'Password should contain lower case letter.';
    }
    return error;
  }

  return ModelDecorator.extend({
    defaults: {
      email: 'default@email.com',
      password: ''
    },
    validate: validate
  });
})();
