/**
 * Created by Ivan on 22.05.2015.
 */
define([], function () {
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
            //  imageSrc: "",
            first_name: "",
            last_name: "",
            email: ""
        },
        urlRoot: function () {
            return "/posts";
        }
    });
    return PostModel;
});
