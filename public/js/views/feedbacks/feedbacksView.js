define([
    'js/views/feedbacks/EditFeedbackView',
    'js/views/feedbacks/CreateFeedbackView',
    "js/collections/feedbacks/feedbacksCollection",
    'text!templates/feedbacks/feedbacksTemplate.html',
    'text!templates/feedbacks/ListTemplate.html',
    'custom',
    'constants/responses'
], function (EditFeedbackView, CreateFeedbackView,  feedbacksCollection, feedbacksTemplate, ListTemplate, custom, RESPONSES) {

    var FeedbacksView = Backbone.View.extend({
        el: '#content-holder',
        template: _.template(feedbacksTemplate),
        initialize: function (options) {
            this.collection = options.feedbacksCollection;
            this.checkItemCount = 0;
            this.contentType = "feedbacks";
            this.sort = this.collection.sort;
            this.page = this.collection.page;
            this.defaultItemsNumber = this.collection.count || 50;
            this.collection.bind('add', this.addElement, this);
            this.getTotalLength(null, this.defaultItemsNumber);
            this.render();
        },

        events: {
            "click .edit": "editFeedback",
            "click .editButton": "editFeedback",
//            "click .remove": "removeFeedback",
            "click .deleteButton": "removeFeedback",
            "click .create": "createFeedback"
//            "click .checkAll": "checkAll",
//            "click table.fakeUserList tr": "check",
//            "click .oe-sortable": "goSort",
//            "click .itemsNumber": "switchPageCounter",
//            "click #itemsButton": "itemsNumber",
//            "click .currentPageList": "itemsNumber",
//            "click .showPage": "showPage",
//            "click #firstShowPage": "firstPage",
//            "click #lastShowPage": "lastPage",
//            "click #previousPage": "previousPage",
//            "click #nextPage": "nextPage"
        },

        editFeedback: function (e) {
            var id;
            var model;
            var targetClass = $(e.target).attr('class');

            e.stopPropagation();

            if (targetClass.indexOf('editButton') !== -1) {
                id = $(e.target).closest("tr").data("id");
            } else {
                id = this.$el.find("table tr td input:checked").eq(0).closest("tr").data("id");
            }
            model = this.collection.get(id);
            model.bind('change', this.updateElement, this);
            new EditFeedbackView({model: model});
            return false;
        },

        removeFeedback: function (e) {
            var id;
            var model;
            var self = this;
            var targetClass = $(e.target).attr('class');

            e.stopPropagation();

            if (targetClass.indexOf('deleteButton') !== -1) {
                id = $(e.target).closest("tr").data("id");
                model = self.collection.get(id);
                model.destroy({
                    wait: true,
                    success: function () {
                        self.fetchCollection();
                        self.getTotalLength(null, self.defaultItemsNumber);
                    },
                    error: custom.errorHandler
                });
            } else {
                this.$el.find("table tr th input").prop("checked", false);
                this.$el.find(".remove").hide();
                var count = this.$el.find("table tr td input:checked").length;
                this.$el.find("table tr td input").each(function () {
                    if ($(this).prop("checked")) {
                        id = $(this).closest("tr").data("id");
                        model = self.collection.get(id);
                        model.destroy({
                            wait: true,
                            success: function () {
                                count--;
                                if (!count) {
                                    self.fetchCollection();
                                    self.getTotalLength(null, self.defaultItemsNumber);
                                }
                            },
                            error: custom.errorHandler
                        });
                    }
                });
            }
        },

        createFeedback: function (e) {
            new CreateFeedbackView({collection: this.collection});
            return false;
        },

        previousPage: function (event) {
            $("#top-bar-deleteBtn").hide();
            $('#check_all').prop('checked', false);
            event.preventDefault();
            custom.prevP.call(this, {
                sort: this.sort
            }, custom);
            this.getTotalLength(null, this.defaultItemsNumber);
        },

        nextPage: function (event) {
            $("#top-bar-deleteBtn").hide();
            $('#check_all').prop('checked', false);
            event.preventDefault();
            custom.nextP.call(this, {
                sort: this.sort
            }, custom);
            this.getTotalLength(null, this.defaultItemsNumber);
        },

        lastPage: function (event) {
            $("#top-bar-deleteBtn").hide();
            $('#check_all').prop('checked', false);
            event.preventDefault();
            custom.lastP.call(this, {
                sort: this.sort
            }, custom);
            this.getTotalLength(null, this.defaultItemsNumber);
        },  //end first last page in paginations

        firstPage: function (event) {
            $("#top-bar-deleteBtn").hide();
            $('#check_all').prop('checked', false);
            event.preventDefault();
            custom.firstP.call(this, {
                sort: this.sort
            }, custom);
            this.getTotalLength(null, this.defaultItemsNumber);
        },

        showPage: function (event) {
            event.preventDefault();
            custom.showP.call(this, event, { sort: this.sort }, custom);
        },

        itemsNumber: function (e) {
            $(e.target).closest("button").next("ul").toggle();
            return false;
        },

        switchPageCounter: function (e) {
            e.preventDefault();
            $(e.target).closest(".popUp").hide();
            this.startTime = new Date();
            var itemsNumber = event.target.textContent;
            this.defaultItemsNumber = itemsNumber;
            this.getTotalLength(null, itemsNumber);
            this.page = 1;
            this.fetchCollection();
            $("#top-bar-deleteBtn").hide();
            $('#check_all').prop('checked', false);
            custom.changeLocationHash.call(this, 1, itemsNumber);
        },

        fetchCollection: function () {
            this.checkItemCount = 0;
            this.$el.find(".remove").hide();
            this.$el.find(".edit").hide();
            this.collection = new feedbacksCollection({
                sort: this.sort,
                page: this.page,
                count: this.defaultItemsNumber
            });
            this.collection.bind('reset', this.renderContent, this);
//			this.collection.bind('remove', this.deleteElement, this);
            this.collection.bind('add', this.addElement, this);
        },

        goSort: function (e) {
            this.collection.unbind('reset');
            var target$ = $(e.target).closest(".oe-sortable");
            var currentParrentSortClass = target$.attr('class');
            var sortClass = currentParrentSortClass.split(' ')[1];
            var sortConst = 1;
            var sortBy = target$.data('sort');
            var sortObject = {};
            if (!sortClass) {
                target$.addClass('sortDn');
                sortClass = "sortDn";
            }
            switch (sortClass) {
                case "sortDn":
                {
                    target$.parent().find("th").removeClass('sortDn').removeClass('sortUp');
                    target$.removeClass('sortDn').addClass('sortUp');
                    sortConst = 1;
                }
                    break;
                case "sortUp":
                {
                    target$.parent().find("th").removeClass('sortDn').removeClass('sortUp');
                    target$.removeClass('sortUp').addClass('sortDn');
                    sortConst = -1;
                }
                    break;
            }
            sortObject[sortBy] = sortConst;
            this.sort = sortObject;
            this.fetchCollection();
            custom.changeLocationHash.call(this, this.page, this.defaultItemsNumber, "feedbacks");
        },

        getTotalLength: function (currentNumber, itemsNumber) {
            var self = this;
            custom.getData('/feedbacks/count', {
            }, function (response) {
                var page = self.page || 1;
                var length = self.listLength = response.count || 0;
                if (itemsNumber * (page - 1) > length) {
                    self.page = page = Math.ceil(length / self.defaultItemsNumber);
                    self.fetchCollection();
                    custom.changeLocationHash.call(this, page, self.defaultItemsNumber, "feedbacks");
                }
                custom.pageElementRender(response.count, itemsNumber, page);//prototype in main.js
            }, this);


        },

        check: function (e) {
            var currentCheckbox = $(e.target);
            if (!$(e.target).hasClass("checkbox")) {
                currentCheckbox = $(e.target).parents("tr").find(".checkbox");
                currentCheckbox.prop("checked", !currentCheckbox.prop("checked"));
            }
            if (currentCheckbox.prop("checked")) {
                this.checkItemCount++;
            } else {
                this.checkItemCount--;
            }
            if (this.checkItemCount) {
                this.$el.find(".remove").show();
                if (this.checkItemCount == 1) {
                    this.$el.find(".edit").show();
                } else {
                    this.$el.find(".edit").hide();
                }
            } else {
                this.$el.find(".remove").hide();
                this.$el.find(".edit").hide();
            }
        },

        checkAll: function (e) {
            if ($(e.target).prop("checked")) {
                this.checkItemCount = this.$el.find("table tr td input").length;
                this.$el.find("table tr td input").each(function () {
                    $(this).prop("checked", true);
                });
                this.$el.find(".remove").show();
                if (this.checkItemCount == 1) {
                    this.$el.find(".edit").show();
                } else {
                    this.$el.find(".edit").hide();
                }
            } else {
                this.checkItemCount = 0;
                this.$el.find("table tr td input").each(function () {
                    $(this).prop("checked", false);
                });
                this.$el.find(".remove").hide();
            }
        },

        deleteElement: function (model) {
            /*this.$el.find("table tr[data-id='"+model.toJSON().id+"']").remove();*/
            this.fetchCollection();
            this.getTotalLength(null, this.defaultItemsNumber);
        },

        updateElement: function (model) {

            this.fetchCollection();
            this.getTotalLength(null, this.defaultItemsNumber);
        },

        addElement: function (model) {
            this.fetchCollection();
            this.getTotalLength(null, this.defaultItemsNumber);
        },

        render: function (options) {
            this.$el.html(this.template());
            if (this.sort) {
                this.$el.find(".table-header .oe-sortable[data-sort='" + Object.keys(this.sort)[0] + "']").addClass(this.sort[Object.keys(this.sort)[0]] == 1 ? "sortUp" : "sortDn");
            }
            this.$el.find("#feedbacksList tbody:last").html(_.template(ListTemplate, {feedbacksCollection: this.collection.toJSON(), startNumber: this.defaultItemsNumber * (this.page - 1)}));
            return this;
        },
        renderContent: function (options) {
            this.$el.find("#feedbacksList tbody:last").html(_.template(ListTemplate, {feedbacksCollection: this.collection.toJSON(), startNumber: this.defaultItemsNumber * (this.page - 1)}));
            return this;
        }

    });

    return FeedbacksView;

});
