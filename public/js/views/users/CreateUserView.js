define([
    'text!templates/users/CreateTemplate.html',
    'js/models/UserModel',
	'custom'

], function (CreateFakeUserTemplate, UserModel, custom) {

    var LoginView = Backbone.View.extend({
        el: '#content-holder',
		template: _.template(CreateFakeUserTemplate),
		imageSrc: '',
        initialize: function (options) {
            this.model = new UserModel();
            this.render();
        },
        events: {
            'click #create': 'createClick'
        },
        createClick: function(e) {
			var self = this;
            var createData = {
                // imgSrc : that.imgSrc,
                user_name: this.$el.find('#name').val(),
                email: this.$el.find('#email').val(),
				image_src: this.imageSrc
            };
            this.model.save(createData,{
                success: function (model, response) {
					model.set({id:model.toJSON().success.id})
					self.collection.add(model);
					$(".trill-dialog").remove();
                },
                error: function (model, xhr) {
					if (xhr&&xhr.responseJSON)
						alert(xhr.responseJSON.error);
                }
            })

		},
		createClick1: function(){
			var self = this;
            var $uploadImages = $('#uploadImages');
			// var files = event.currentTarget.files;
            var files1 = $("#uploadImage")[0].files;

            $uploadImages.submit(function (e) {
                var $progress = $('#progress');
                var $status = $('.status');
                var formURL = "http://localhost:8099/fake_images";
                e.preventDefault();
                $uploadImages.ajaxSubmit({
                    url: formURL,
                    type: "POST",
                    processData: false,
                    contentType: false,
                    data: {
						file: files1,
						email: self.$el.find('#name').val(),
						user_name: self.$el.find('#name').val()
					},
                    beforeSend: function (xhr) {
//                        $progress.show();
                    },

                    uploadProgress: function (event, position, total, statusComplete) {
//                        var statusVal = statusComplete + '%';
  //                      $status.html(statusVal);
                    },

                    success: function (data) {
//                        $progress.hide();
						self.fetchCollection();
						self.getTotalLength(null, self.defaultItemsNumber);
                    },
                    error: function () {
//                        $progress.hide();
                        console.log("upload file error");
                    }
                });
            });
            $uploadImages.submit();
            $uploadImages.off('submit');
        },

        render: function(options) {
			var self = this;
			var formString = this.template();
			this.$el = $(formString).dialog({
                closeOnEscape: false,
                dialogClass: "trill-dialog",
                width: "380",
                title: "Create User",
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
