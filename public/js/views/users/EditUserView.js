define([
    'text!templates/users/EditTemplate.html',
    'js/models/UserModel',
	'custom'

], function (EditFakeUserTemplate,UserModel, custom) {

    var LoginView = Backbone.View.extend({
        el: '#content-holder',
		template: _.template(EditFakeUserTemplate),
		imageSrc: '',
        initialize: function (options) {
			this.render();
        },
        events: {
            'click #edit': 'editClick'
        },
        editClick: function(e) {
            var editData = {};
			if (this.imageSrc){
				editData = {
					user_name: this.$el.find('#name').val(),
					email: this.$el.find('#email').val(),
					image_src: this.imageSrc
				};
			}else{
				editData = {
					user_name: this.$el.find('#name').val(),
					email: this.$el.find('#email').val()
				};
			}
			this.model.urlRoot = '/users/';
            this.model.save(editData,{
				patch:true,
                success: function (model, response) {
					
                },
                error: function (model, xhr) {
                    alert('User created ERROR ' );
                }
            })

        },
        render: function(options) {
			var self = this;
			var formString = this.template({model:this.model.toJSON()});
			this.$el = $(formString).dialog({
                closeOnEscape: false,
                dialogClass: "trill-dialog",
                width: "360",
                title: "Edit User",
				appendTo: "#content-holder" ,
                buttons: {
                    save: {
                        text: "Save",
                        class: "btn",
                        click: function () {
							self.editClick();
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
			custom.canvasDraw({ url:this.model.toJSON().avatar }, this);
            return this;
        }

    });

    return LoginView;

});
