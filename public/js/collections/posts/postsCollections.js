define([
        "models/PostModel"
    ],
    function (PostModel) {
        var PostsCollection = Backbone.Collection.extend({
            model: PostModel,
            page: null,
            count: null,
            sort: null,
            searchTerm: null,
            url: function () {
                return "/posts";
            },
            initialize: function (options) {
                if (options && options.count) {
                    this.count = options.count;
                    this.sort = options.sort;
                    this.searchTerm = options.searchTerm;
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
        return PostsCollection;
    });
