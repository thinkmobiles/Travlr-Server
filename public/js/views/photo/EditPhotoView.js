define([
    'text!templates/photo/EditTemplate.html',
    'js/models/PhotoModel',
	'js/collections/users/usersCollections'

], function (EditFakePhotoTemplate,PhotoModel, UsersCollections) {

    var EditPhotoView = Backbone.View.extend({
        el: '#content-holder',
        template: _.template(EditFakePhotoTemplate),
        initialize: function (options) {
			this.usersCollection = new UsersCollections();
			this.usersCollection.bind('reset', this.render, this );
           
        },
        events: {
            'click #edit': 'editPhoto'
        },

        editPhoto: function(e) {
            var location = {};

            location.lat = parseFloat(this.$el.find('#latitude').val());
            location.lon = parseFloat(this.$el.find('#longitude').val());

            var editData = {
                fake_likes: parseInt(this.$el.find('#likes').val()),
                location: location,
				author_id: this.$el.find('.selectUser option:selected').data("id"),
                show_hot: this.$el.find('#show_hot').prop('checked')
            };
            this.model.urlRoot = '/images/';
            this.model.save(editData,{
				patch:true,
                success: function (model, response) {

                },
                error: function (model, xhr) {
                    alert('Photo updated ERROR ' );
                }
            })

        },
        render: function(options) {
            var self = this;
            var formString = this.template({model:this.model.toJSON(), users:this.usersCollection.toJSON()});
            this.$el = $(formString).dialog({
                closeOnEscape: false,
                dialogClass: "trill-dialog",
                width: "360",
                title: "Edit Photo",
                appendTo: "#content-holder" ,
                buttons: {
                    save: {
                        text: "Save",
                        class: "btn",
                        click: function () {
                            self.editPhoto();
                            $(this).remove();
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

    return EditPhotoView;

});
