/**
 * Created by Oleg Galaburda on 26.12.15.
 */

var MyView = (function() {

  function initialize() {
    this.properties = this.model.properties;
    this.render();
    this.$el.closest('form').on('submit', function() {
      return false;
    });
  }

  function verify() {
    this.properties.email = this.$el.find('#email').val();
    this.properties.password = this.$el.find('#password').val();
    if (this.model.isValid()) {
      this.$el.find('.error-block').addClass('hidden');
    } else {
      this.$el.find('.error-text').text(this.model.validationError);
      this.$el.find('.error-block').removeClass('hidden');
    }
    return this;
  }

  function render() {
    this.$el.find('#email').val(this.properties.email);
    this.$el.find('#password').val(this.properties.password);
    return this;
  }

  function updateEmail() {
    this.properties.email = this.$el.find('#email').value();
    return this;
  }

  function updatePassword() {
    this.properties.password = this.$el.find('#password').value();
    return this;
  }

  return Backbone.View.extend({
    initialize: initialize,
    events: {
      'click .btn-primary': 'verify'
    },
    verify: verify,
    render: render,
    updateEmail: updateEmail,
    updatePassword: updatePassword
  });
})();
