define([
    'text!/templates/feedbacks/CreateTemplate.html',
    'models/FeedbackModel',
    'custom'

], function (CreateFakeFeedbackTemplate, FeedbackModel, custom) {

    var LoginView = Backbone.View.extend({
        el: '#content-holder',
        template: _.template(CreateFakeFeedbackTemplate),
        imageSrc: '',
        initialize: function (options) {
            this.model = new FeedbackModel();
            this.render();
        },
        events: {
            'click #create': 'createClick'
        },
        createClick: function(e) {
            var self = this;
            var createData = {
                body: this.$el.find('#Feedback').val()
            };
            this.model.save(createData,{
                success: function (model, response) {
                    model.set({id: model.toJSON().success.id})
                    self.collection.add(model);
                    $(".trill-dialog").remove();
                },
                error: function (model, xhr) {
                    if (xhr&&xhr.responseJSON)
                        alert(xhr.responseJSON.error);
                }
            })

        },

        render: function(options) {
            var self = this;
            var formString = this.template();
            this.$el = $(formString).dialog({
                closeOnEscape: false,
                dialogClass: "trill-dialog",
                width: "520",
                title: "Create Feedback",
                appendTo: "#content-holder" ,
                buttons: {
                    save: {
                        text: "Create",
                        class: "btn",
                        click: function () {
                            self.createClick();
                        }
                    },
                    cancel: {
                        text: "Cancel",
                        class: "btn",
                        click: function () {
                            $(".trill-dialog").remove();
                        }
                    }
                }
            });
            custom.canvasDraw({  }, this);
            return this;
        }

    });

    return LoginView;

});
