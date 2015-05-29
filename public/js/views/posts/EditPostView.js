define([
    'text!templates/posts/EditTemplate.html',
    'js/models/PostModel',
    'custom',
    'constants/responses'

], function (EditTemplate, PostsModel, custom, RESPONSES) {

    var EditPostView = Backbone.View.extend({
        el: '#content-holder',
        template: _.template(EditTemplate),
        imageSrc: '',
        initialize: function (options) {
            this.render();
        },
        events: {
            'click #edit': 'editClick'
        },
        editClick: function (e) {
            var editData = {
                title: this.$el.find('#title').val(),
                body: this.$el.find('#body').val(),
                lon: this.$el.find('#lon').val(),
                lat: this.$el.find('#lat').val()
            };
            if (this.imageSrc) {
                editData['image_src'] = this.imageSrc;
            }

            this.model.urlRoot = '/posts/';
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
                title: "Edit Post",
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
            custom.canvasDraw({ url: this.model.toJSON().avatar }, this);
            return this;
        }

    });

    return EditPostView;

});
