define([
    "js/models/UserModel"
],
    function (UserModel) {
        var UsersCollection = Backbone.Collection.extend({
            model: UserModel,
            page: null,
            count: null,
            sort: null,
            url: function () {
                return "/users";
            },
            initialize: function (options) {
                if (options && options.count) {
                    this.count = options.count;
                    this.sort = options.sort;
                    this.page = options.page || 1;
                }
                var that = this;
                this.fetch({
                    data: options,
                    reset: true,
                    success: function () {
                        that.page++;
                    },
                    error: function (models, xhr) {
                        if (xhr.status == 401) Backbone.history.navigate('#login', { trigger: true });
                    }
                });
            }
        });
        return UsersCollection;
    });
