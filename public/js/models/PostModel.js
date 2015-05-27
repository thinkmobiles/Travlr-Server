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
            author_id: "",
            title: "",
            body: "",
            lat: "",
            lon: "",
            city_id: "",
            type: ""
        },
        urlRoot: function () {
            return "/posts";
        }
    });
    return PostModel;
});
