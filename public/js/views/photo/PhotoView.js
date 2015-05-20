define([
    'js/collections/Photos/fakePhotosCollection.js',
    'js/views/photo/EditPhotoView',
    'text!templates/photo/ListTemplate.html',
    'text!templates/photo/PhotosTemplate.html',
	'custom'
], function (photosCollection, EditPhotoView, ListTemplate, PhotosTemplate, custom) {

    var PhotoView = Backbone.View.extend({
        el: '#content-holder',
		template: _.template(PhotosTemplate),
        initialize: function (options) {
            this.collection = options.photoCollection;
			this.checkItemCount = 0;
			this.contentType = "photos";
			this.sort = this.collection.sort;
			this.page = this.collection.page;
			this.defaultItemsNumber = this.collection.count || 50;
			this.getTotalLength(null, this.defaultItemsNumber);
            this.render();
        },
        events: {
            "click .upload" : "emitUploadPhotos",
			"click .checkAll" : "checkAll",
			"click table.fakePhotoList tr" : "check",
			"click .oe-sortable" : "goSort",
			"click .itemsNumber": "switchPageCounter",
			"click #itemsButton": "itemsNumber",
			"click .currentPageList": "itemsNumber",
			"click .showPage": "showPage",
			"click #firstShowPage": "firstPage",
            "click #lastShowPage": "lastPage",
			"click #previousPage": "previousPage",
            "click #nextPage": "nextPage",
            "click #removePhotoBtn": "removePhotos",
            "click #editPhotoBtn": "editPhoto"
        },
		check: function(e){
			var currentCheckbox = $(e.target);
			if(!$(e.target).hasClass("checkbox")){
				currentCheckbox = $(e.target).parents("tr").find(".checkbox");
				currentCheckbox.prop("checked", !currentCheckbox.prop("checked"));
			}
			if(currentCheckbox.prop( "checked" )){
				this.checkItemCount++;
			}else{
				this.checkItemCount--;
			}
			if (this.checkItemCount){
				this.$el.find(".remove").show();
				if (this.checkItemCount==1){
					this.$el.find(".edit").show();
				}else{
					this.$el.find(".edit").hide();
				}
			} else {
				this.$el.find(".remove").hide();
				this.$el.find(".edit").hide();
			}
		},
		checkAll:function(e){
			if($(e.target).prop( "checked" )){
				this.checkItemCount = this.$el.find("table tr td input").length;
				this.$el.find("table tr td input").each(function(){
					$(this).prop("checked", true);
				});
				this.$el.find(".remove").show();
				if (this.checkItemCount==1){
					this.$el.find(".edit").show();
				}else{
					this.$el.find(".edit").hide();
				}
			}else{
				this.checkItemCount = 0;
				this.$el.find("table tr td input").each(function(){
					$(this).prop("checked", false);
				});
				this.$el.find(".remove").hide();
			}
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
            custom.changeLocationHash.call(this, this.page, this.defaultItemsNumber, "photos");
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
            custom.showP.call(this,event, { sort: this.sort }, custom);
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
		addElement:function(model){
			this.fetchCollection();
			this.getTotalLength(null, this.defaultItemsNumber);
		},
        emitUploadPhotos: function(e){
            this.$el.find('#upload_hidden').click();
        },
		fetchCollection: function () {
			this.checkItemCount=0;
			this.$el.find(".remove").hide();
			this.$el.find(".edit").hide();
            this.collection = new photosCollection({
                sort: this.sort,
                page: this.page,
                count: this.defaultItemsNumber
            });
            this.collection.bind('reset', this.renderContent, this);
        },
		getTotalLength: function (currentNumber, itemsNumber) {
			var self = this;
            custom.getData('/getFakeImagesCount', {
            }, function (response) {
                var page = self.page || 1;
                var length = self.listLength = response.count || 0;
                if (itemsNumber * (page - 1) > length) {
                    self.page = page = Math.ceil(length / self.defaultItemsNumber);
                    self.fetchCollection();
                    custom.changeLocationHash.call(self, page, self.defaultItemsNumber, "photos");
                }
                custom.pageElementRender(response.count, itemsNumber, page);//prototype in main.js
            }, this);


        },

        uploadPhotos: function(event){
			var self = this;
            event.preventDefault();
            var $uploadImages = $('#uploadImages');
			// var files = event.currentTarget.files;
        	var data = new FormData();
			var errorMessages = "";
			var count = 0;

            $uploadImages.submit(function (e) {
           
                e.preventDefault();
				var k = 0;
				var c = 0;
				var count = self.$el.find("#upload_hidden")[0].files.length;
				$(".overflow").show();
				$.each(self.$el.find("#upload_hidden")[0].files, function(key, value){
					var data = new FormData();
					var fileName = value.name;
					if(!/(\.gif|\.jpg|\.jpeg|\.tiff|\.png)$/i.test(fileName)){
						errorMessages += "" + fileName + " have invalid image file type.\n";
					}else{
						data.append("image", value);
						this.$el = self.$el.find(".fileprogress").dialog({
							closeOnEscape: false,
							dialogClass: "trill-dialog-not-hide fileprogress-dialog",
							title: "Upload files",
							appendTo: "#content-holder" ,
		
						});
						k++;
						(function(data, fileName, k, count){
							var $progress = $('#progress');
							var $status = $('.status');
							var formURL = "/fake_images";
							$.ajax({
								url: formURL,
								type: "POST",
								processData: false,
								contentType: false,
								data: data,
								beforeSend: function (xhr) {
									$(".fileprogress-dialog .fileprogress").append('<li class="file'+k+'">'+fileName+'<span class="icon ok" style="display:none">c</span></div><span class="icon err" style="display:none">x</span><img src="i/ajax-loader.gif" width="20" height="20"></li>');
									
								},
					
						
								success: function (data) {
									c++;
									var el = $(".fileprogress").find(".file"+k);
									el.find("span.ok").show();
									el.find("img").hide();
									if (c==count){
										setTimeout(function(){
											$(".fileprogress-dialog").remove();
											self.$el.find(".fileprogress").empty();
											$(".overflow").hide();
											self.fetchCollection();
											self.getTotalLength(null, self.defaultItemsNumber);
										},500);
									}

									//								$progress.hide();
									
									$('#uploadImages').each(function(){
										this.reset();
									});
								},
								error: function () {
									c++;
									var el = $(".fileprogress").find(".file"+k);
									el.find("span.err").show();
									el.find("img").hide();
									if (c==count){
										setTimeout(function(){
											$(".fileprogress-dialog").remove();
											self.$el.find(".fileprogress").empty();
											$(".overflow").hide();
											self.fetchCollection();
											self.getTotalLength(null, self.defaultItemsNumber);
										},500);
									}
									console.log("upload file error");
								}
							});
						})(data,fileName,k,count);
					}
				});
				if (errorMessages != "") {
					alert(errorMessages);
				}
				
            });
			$uploadImages.submit();
            $uploadImages.off('submit');
        },

        updateElement:function(model){
            this.fetchCollection();
            this.getTotalLength(null, this.defaultItemsNumber);
        },

        editPhoto:function(e){
            var id = this.$el.find("table tr td input:checked").eq(0).closest("tr").data("id");
            var model = this.collection.get(id);
            model.bind('change', this.updateElement, this);
            new EditPhotoView({model:model});
            return false;
        },

        removePhotos: function(e){
            var self = this;
            this.$el.find("table tr th input").prop("checked", false);
            var checked = this.$el.find("table tr td input:checked");

            var deleteIds = [];

            for(var i=0; i<checked.length; i++) {
                deleteIds.push($(checked[i]).closest("tr").data("id"));
            }

            this.$el.find(".remove").hide();

            var data = {
                imageIds: deleteIds
            };

            $.ajax({
                contentType: "application/json",
                url: "/images",
                type: "DELETE",
                data: JSON.stringify(data),
                success: function () {
                    self.fetchCollection();
                    self.getTotalLength(null, self.defaultItemsNumber);
                },
                error: function () {
                }
            });
        },

        render: function(options){
			var self = this;
            this.$el.html(this.template());
			if (this.sort){
				this.$el.find(".table-header th").removeClass('sortDn').removeClass('sortUp');
				this.$el.find(".table-header .oe-sortable[data-sort='"+Object.keys(this.sort)[0]+"']").addClass(this.sort[Object.keys(this.sort)[0]]==1?"sortUp":"sortDn");
			}
            this.$el.find("#photosList tbody:last").html(_.template(ListTemplate, {photoCollection: this.collection.toJSON(), startNumber: this.defaultItemsNumber*(this.page-1)}));
			this.$el.off('change','#upload_hidden');
			this.$el.on('change','#upload_hidden', function(e){ self.uploadPhotos(e); });
            return this;
        },
        renderContent: function(options){
            this.$el.find("#photosList tbody:last").html(_.template(ListTemplate, {photoCollection: this.collection.toJSON(), startNumber: this.defaultItemsNumber*(this.page-1)}));
            return this;
			
		}

    });

    return PhotoView;

});
