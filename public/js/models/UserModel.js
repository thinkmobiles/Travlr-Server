define([
    'Validation',
    'moment'
], function (Validation, moment) {
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
            Validation.checkNotesField(errors, false, attrs.first_name, "First name");
            Validation.checkNotesField(errors, false, attrs.last_name, "Last name");
            Validation.checkEmailField(errors, false, attrs.email, "Email");
            if (errors.length > 0)
                return errors;
        },
        parse: true,
        parse: function (response) {
            if (response.birthday){
                response.birthday = moment(response.birthday).format("DD/MM/YYYY");
            }

            return response;
        }
    });
    return UserModel;
});
