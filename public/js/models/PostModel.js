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
        urlRoot: function () {
            return "/posts";
        }
    });
    return PostModel;
});
