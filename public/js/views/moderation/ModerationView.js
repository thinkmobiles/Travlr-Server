define([
    'text!templates/moderation/ModerationTemplate.html',
    'text!templates/moderation/ListTemplate.html',
    "js/collections/Photos/photosCollection",
    'js/models/PhotoModel',
    'custom'
], function (ModerationTemplate, ListTemplate, photosCollection, PhotoModel, custom) {

    var ModerationView = Backbone.View.extend({
        el: '#content-holder',
        template: _.template(ModerationTemplate),
        initialize: function (options) {
            this.collection = options.photosCollection;
            this.model = new PhotoModel();
            this.checkItemCount = 0;
            this.contentType = "moderation";
            this.sort = this.collection.sort || {"created_at":1};
            this.page = this.collection.page;
            this.defaultItemsNumber = this.collection.count || 50;
            this.getTotalLength(null, this.defaultItemsNumber);
            this.render();
        },
        events: {
            'click .unbannPhoto': 'unbannPhoto',
            'click .bannPhoto': 'bannPhoto',
            'click .block-user-button': 'bannUser',
            "click .checkAll" : "checkAll",
            "click table.bannPhotoList tr" : "check",
            "click .oe-sortable" : "goSort",
            "click .itemsNumber": "switchPageCounter",
            "click #itemsButton": "itemsNumber",
            "click .currentPageList": "itemsNumber",
            "click .showPage": "showPage",
            "click #firstShowPage": "firstPage",
            "click #lastShowPage": "lastPage",
            "click #previousPage": "previousPage",
            "click #nextPage": "nextPage",
            'click .changeBann': 'banUser'

        },
		banUser: function(e){
			var userId = $(e.target).parents("tr").find(".userName").data("id");
			var self = this;
			$.ajax({
				url: "/bann_user/"+userId,
				type: "POST",
				success: function () {
					self.fetchCollection();
					self.getTotalLength(null, self.defaultItemsNumber);
				},
				error: function (data) {
					console.log(data);
				}
			});
		},
		check: function(e){
			var currentCheckbox = $(e.target);
			if(!$(e.target).hasClass("checkbox")){
				currentCheckbox = $(e.target).parents("tr").find(".checkbox");
				currentCheckbox.prop("checked", !currentCheckbox.prop("checked"));
			}
			if($(e.target).prop( "checked" )){
                this.checkItemCount++;
            }else{
                this.checkItemCount--;
            }
            if (this.checkItemCount){
                this.$el.find(".bannPhoto").show();
                this.$el.find(".unbannPhoto").show();
				
            } else {
                this.$el.find(".bannPhoto").hide();
                this.$el.find(".unbannPhoto").hide();
            }
		},
        checkAll:function(e){
            if($(e.target).prop( "checked" )){
                this.checkItemCount = this.$el.find("table tr td input").length;
                this.$el.find("table tr td input").each(function(){
                    $(this).prop("checked", true);
                });
                this.$el.find(".bannPhoto").show();
                this.$el.find(".unbannPhoto").show();
				
            }else{
                this.checkItemCount = 0;
                this.$el.find("table tr td input").each(function(){
                    $(this).prop("checked", false);
                });
                this.$el.find(".bannPhoto").hide();
                this.$el.find(".unbannPhoto").hide();
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

        fetchCollection: function () {
            this.checkItemCount=0;
            this.$el.find(".unbannPhoto").hide();
            this.$el.find(".bannPhoto").hide();
            this.collection = new photosCollection({
                sort: this.sort,
                page: this.page,
                count: this.defaultItemsNumber
            });
            this.collection.bind('reset', this.renderContent, this);
        },
        getTotalLength: function (currentNumber, itemsNumber) {
            var self = this;
            custom.getData('/getBannPhotosCount', {
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

        updateElement:function(model){
            this.fetchCollection();
            this.getTotalLength(null, this.defaultItemsNumber);
        },

        unbannPhoto: function(options){
			var self = this;
			var n = this.$el.find("table tr td input:checked").length; 
			this.$el.find("table tr td input:checked").each(function(){
				var id = $(this).closest("tr").data("id");
				var model = self.collection.get(id);
				model.urlRoot = "/unbann_photo";
				model.save({baned: false},{
					success: function (model, response) {
						n--;
						if (n==0){
							self.fetchCollection();
							self.getTotalLength(null, self.defaultItemsNumber);
						}
					},
					error: function (model, xhr) {
						n--;
						alert('Photo unbanned ERROR ' );
					}
				})
			});
          
        },

        bannPhoto: function(options){
			var self = this;
			var n = this.$el.find("table tr td input:checked").length; 
			this.$el.find("table tr td input:checked").each(function(){
				var id = $(this).closest("tr").data("id");
				var model = self.collection.get(id);
				model.urlRoot = "/confirm_bann";
				model.save({baned: false},{
					success: function (model, response) {
						n--;
						if (n==0){
							self.fetchCollection();
							self.getTotalLength(null, self.defaultItemsNumber);
						}
					},
					error: function (model, xhr) {
						n--;
						alert('Photo banned ERROR ' );
					}
				})
			});
          
        },

        bannUser: function(options){
            var id = $(options.target).closest("tr").data("author_id");
        },

        render: function(options){
            this.$el.html(this.template());
            if (this.sort){
                this.$el.find(".table-header th").removeClass('sortDn').removeClass('sortUp');
                this.$el.find(".table-header .oe-sortable[data-sort='"+Object.keys(this.sort)[0]+"']")
                    .addClass(this.sort[Object.keys(this.sort)[0]]==1?"sortUp":"sortDn");
            }

            this.$el.find("#photosList tbody:last").html(_.template(ListTemplate, {
                photosCollection: this.collection.toJSON(),
                startNumber: 0
            }));
            return this;
        },

        renderContent: function(options){
            this.$el.find("#photosList tbody:last").html(_.template(ListTemplate, {
                photosCollection: this.collection.toJSON(),
				startNumber: this.defaultItemsNumber*(this.page-1)
            }));
            return this;
        }
    });

    return ModerationView;

});
