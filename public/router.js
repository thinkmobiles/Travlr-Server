// Filename: router.js
define([
	'js/views/main/MainView',
	'js/views/login/LoginView',
	'js/views/topMenu/TopMenuView',
	'custom'
], function (mainView, loginView, topMenuView, custom) {

    var appRouter = Backbone.Router.extend({

        mainView: null,
        topBarView: null,
		current:null,

        routes: {
            "login": "login",
            "users": "users",
            "users/list(/p=:page)(/c=:countPerPage)(/sort=:sort)": "users",
            "feedbacks": "feedbacks",
            "complaints": "complaints",
            "posts/list(/p=:page)(/c=:countPerPage)(/sort=:sort)": "posts",
            "posts": "posts",
			"*any": "any"
        },

        initialize: function () {
			$(document).on("click", function (e) {
	            if ($(e.target).closest(".popUp").length == 0 && $(e.target).closest(".trill-dialog").length == 0) {
	                $(".popUp").hide();
	                $(".trill-dialog").hide();
	            }
	        });
        },

        any: function () {
            this.mainView = new mainView();
			this.changeWrapperView(this.mainView);
        },

        login: function () {
			this.mainView = null;
			new loginView();
        },
		users: function (page, countPerPage, sort) {
            var self = this;
	        this.main();
            var navigatePage = (page) ? parseInt(page) || 1 : 1;
            var count = (countPerPage) ? parseInt(countPerPage) || 50 : 50;
			sort = (sort) ? JSON.parse(decodeURIComponent(sort)) : "";

			require([
                "js/views/users/UsersView",
                "js/collections/users/usersCollections"
            ], function (UsersView, UsersCollection) {
                    if (this.current) {
                        this.current.undelegateEvents();
                    }
                    var usersCollection = new UsersCollection({
						page: navigatePage,
                        count: count,
						sort: sort
					});

                    usersCollection.bind('reset', _.bind(createViews, self));
                    function createViews() {
                        usersCollection.unbind('reset');
						self.changeView(UsersView, {usersCollection: usersCollection});
                    }
	        });
		},

		posts: function (page, countPerPage, sort) {
            var self = this;
	        this.main();
            var navigatePage = (page) ? parseInt(page) || 1 : 1;
            var count = (countPerPage) ? parseInt(countPerPage) || 50 : 50;
			sort = (sort) ? JSON.parse(decodeURIComponent(sort)) : "";

			require([
                "js/views/posts/PostsView",
                "js/collections/posts/postsCollections"
            ], function (PostsView, PostsCollection) {
                if (this.current) {
                    this.current.undelegateEvents();
                }
                var postsCollection = new PostsCollection({
                    page: navigatePage,
                    count: count,
                    sort: sort
                });

                postsCollection.bind('reset', _.bind(createViews, self));
                    function createViews() {
                        postsCollection.unbind('reset');
						self.changeView(PostsView, {postsCollection: postsCollection});
                    }
	        });
		},

        feedbacks: function (page, countPerPage, sort){
            var self = this;
            this.main();
            var navigatePage = (page) ? parseInt(page) || 1 : 1;
            var count = (countPerPage) ? parseInt(countPerPage) || 50 : 50;
            sort = (sort) ? JSON.parse(decodeURIComponent(sort)) : "";

            require([
                "js/views/feedbacks/feedbacksView",
                "js/collections/feedbacks/feedbacksCollection"
            ],  function (FeedbacksView, FeedbacksCollection) {
                if (this.current) {
                    this.current.undelegateEvents();
                }
                var feedbacksCollection = new FeedbacksCollection({
                    page: navigatePage,
                    count: count,
                    sort: sort
                });

                feedbacksCollection.bind('reset', _.bind(createViews, self));
                function createViews() {
                    feedbacksCollection.unbind('reset');
                    self.changeView(FeedbacksView, {feedbacksCollection: feedbacksCollection});
                }
            });
        },

        complaints: function (page, countPerPage, sort){
            var self = this;
            this.main();
            var navigatePage = (page) ? parseInt(page) || 1 : 1;
            var count = (countPerPage) ? parseInt(countPerPage) || 50 : 50;
            sort = (sort) ? JSON.parse(decodeURIComponent(sort)) : "";

            require([
                "js/views/complaints/ComplaintsView",
                "js/collections/complaints/complaintsCollection"
            ],  function (ComplaintsView, ComplaintsCollection) {
                if (this.current) {
                    this.current.undelegateEvents();
                }
                var complaintsCollection = new ComplaintsCollection({
                    page: navigatePage,
                    count: count,
                    sort: sort
                });

                complaintsCollection.bind('reset', _.bind(createViews, self));
                function createViews() {
                    complaintsCollection.unbind('reset');
                    self.changeView(ComplaintsView, {complaintsCollection: complaintsCollection});
                }
            });
        },

	    changeView: function (view, options) {
	        if (this.current) {
	            this.current.undelegateEvents();
				$(".ui-dialog").remove();
	        }
	        this.current = new view(options);
	    },

	    main: function () {
	        if (!this.mainView) {
	            this.mainView = new mainView();
	            this.topBarView = new topMenuView();
	            this.changeWrapperView(this.mainView);
	        }
	    },
		changeWrapperView: function (wrapperView) {
	        if (this.wrapperView) {
	            this.wrapperView.undelegateEvents();
	        }
	        this.wrapperView = wrapperView;
	    },
        createUser: function () {
            var that = this;
            this.main();
            require(["js/views/users/CreateUserView"], function (CreateUsersView) {
                that.changeView(CreateUsersView);
            });
        },
        editUser: function (uId) {
            var that = this;
            this.main();
            require(["js/views/users/EditUserView"], function (EditUserView) {
                that.changeView(EditUserView, {uId:uId});
            });
        }
    });

    return appRouter;
});
