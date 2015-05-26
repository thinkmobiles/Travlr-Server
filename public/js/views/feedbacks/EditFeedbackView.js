define([
    'text!templates/feedbacks/EditTemplate.html',
    'js/models/FeedbackModel',
    'custom',
    'constants/responses'

], function (EditFakeFeedbackTemplate, FeedbackModel, custom, RESPONSES) {

    var LoginView = Backbone.View.extend({
        el: '#content-holder',
        template: _.template(EditFakeFeedbackTemplate),
        imageSrc: '',
        initialize: function (options) {
            this.render();
        },
        events: {
            'click #edit': 'editClick'
        },
        editClick: function (e) {
            var editData = {
                body: this.$el.find('#Feedback').val()
            };

            this.model.urlRoot = '/feedbacks/';
            this.model.save(editData, {
                patch: true,
                success: function (model, response) {
                    $(e).remove();
                },
                error: custom.errorHandler
            })
        },
        render: function (options) {
            var self = this;
            var formString = this.template({model: this.model.toJSON()});
            this.$el = $(formString).dialog({
                closeOnEscape: false,
                dialogClass: "trill-dialog",
                width: "520",
                title: "Edit Feedback",
                appendTo: "#content-holder",
                buttons: {
                    save: {
                        text: "Save",
                        class: "btn",
                        click: function () {
                            self.editClick(this);
                        }
                    },
                    cancel: {
                        text: "Cancel",
                        class: "btn",
                        click: function () {
                            $(this).remove();
                        }
                    }
                }
            });
            return this;
        }

    });

    return LoginView;

});
