define([
    "modelsPhotoModel"
],
       function (PhotoModel) {
           var PhotoCollection = Backbone.Collection.extend({
               model: PhotoModel,
			   page: null,
               count: null,
			   sort:null,
               url: function () {
                   return "/fake_images";
               },
               initialize: function (options) {
				   if (options && options.count) {
                       this.count = options.count;
                       this.page = options.page || 1;
                       this.sort = options.sort;
                   }
                   var that = this;
                   this.fetch({
                       data: options,
                       reset: true,
                       wait: true,
					   success: function () {
                           that.page++;
                       },
                       error: function (models, xhr) {
                           if (xhr.status == 401) Backbone.history.navigate('#login', { trigger: true });
                       }
					   
                   });
               }
           });
           return PhotoCollection;
       });
