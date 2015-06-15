define([
    'Validation'
], function (Validation) {
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
            Validation.checkNotesField(errors, false, attrs.title, "Title");
            Validation.checkNotesField(errors, false, attrs.body, "Body");
            Validation.checkLonLat(errors, true, attrs.lon, "Longitude");
            Validation.checkLonLat(errors, true, attrs.lat, "Latitude");
            if (errors.length > 0)
                return errors;
        }
    });
    return PostModel;
});
