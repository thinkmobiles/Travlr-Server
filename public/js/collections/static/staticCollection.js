define([
        "models/StaticModel"
    ],
    function (StaticModel) {
        var StaticCollection = Backbone.Collection.extend({
            model: StaticModel,
            url: function () {
                return "/info";
            },
            initialize: function (options) {
                var that = this;
                this.fetch({
                    data: options,
                    reset: true,
                    wait: true,
                    error: function (models, xhr) {
                        if (xhr.status == 401) Backbone.history.navigate('#login', {trigger: true});
                    }
                });
            }
        });
        return StaticCollection;
    });
