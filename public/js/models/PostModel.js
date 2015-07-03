define([
    'Validation',
    'moment'
], function (Validation, moment) {
    var PostModel = Backbone.Model.extend({
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
        defaults: {
            author_id: "",
            body: "",
            title: ""
        },
        urlRoot: function () {
            return "/posts";
        },
        validate: function (attrs) {
            var errors = [];
            Validation.checkNotesField(errors, false, attrs.title, "Location");
            Validation.checkNotesField(errors, false, attrs.body, "Body");
            Validation.checkLonLat(errors, true, attrs.lat+', '+attrs.lon, "Longitude or Latitude");
            if (errors.length > 0)
                return errors;
        },
        parse: true,
        parse: function (response) {
            if (response.created_at)
                response.created_at = moment(response.created_at).format("DD/MM/YYYY");

            return response;
        }
    });
    return PostModel;
});
