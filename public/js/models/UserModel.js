define([
    'Validation'
], function (Validation) {
    var UserModel = Backbone.Model.extend({
        initialize: function () {
            this.on('invalid', function (model, errors) {
                if (errors.length > 0) {
                    if (errors.length > 0) {
                        var msg = errors.join('\n');
                        alert(msg);
                    }
                }
            });
        },
        urlRoot: function () {
            return "/users";
        },
        validate: function (attrs) {
            var errors = [];
            Validation.checkNameField(errors, false, attrs.first_name, "First name");
            Validation.checkNameField(errors, false, attrs.last_name, "Last name");
            Validation.checkEmailField(errors, false, attrs.email, "Email");
            if (errors.length > 0)
                return errors;
        }
    });
    return UserModel;
});
