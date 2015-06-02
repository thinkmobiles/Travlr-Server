define([
    'text!templates/users/EditTemplate.html',
    'js/models/UserModel',
    'custom',
    'constants/responses'

], function (EditUserTemplate, UserModel, custom, RESPONSES) {

    var LoginView = Backbone.View.extend({
        el: '#content-holder',
        template: _.template(EditUserTemplate),
        imageSrc: '',
        initialize: function (options) {
            this.render();
        },
        events: {
            'click #edit': 'editClick'
        },
        editClick: function (e) {
            var editData = {
                first_name: this.$el.find('#firstName').val(),
                last_name: this.$el.find('#lastName').val(),
                email: this.$el.find('#email').val()
            };
            if (this.imageSrc) {
                editData['image'] = this.imageSrc;
            }

            this.model.urlRoot = '/users/';
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
                title: "Edit User",
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

    return LoginView;

});
