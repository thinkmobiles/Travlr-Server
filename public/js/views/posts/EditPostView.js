define([
    'text!/templates/posts/EditTemplate.html',
    'models/PostModel',
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
//                lon: this.model.attributes.lon,
//                lat: this.model.attributes.lat,
                lon: this.$el.find('#lon').val(),
                lat: this.$el.find('#lat').val(),
                country: {
                    name: this.model.attributes.country.name,
                    city: this.model.attributes.city.name,
                    code:  this.model.attributes.country.code
                },
                author_id: this.model.attributes.author.id
            };
            if (this.imageSrc) {
                editData['image'] = this.imageSrc;
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
                appendTo: "#dialog-overflow",
                modal: true,
                open: function(){
                    $('.ui-widget-overlay').bind('click', function(){
                        $('.ui-dialog-content').dialog('close');
                    });
                },
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
                            $(this).dialog('close');
                        }
                    }
                },
                close: function() {
                    $(this).dialog('destroy');
                }
            });
            custom.canvasDraw({ url: this.model.toJSON().avatar }, this);
            return this;
        }

    });

    return EditPostView;

});
