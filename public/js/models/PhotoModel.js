define([],function () {
    var PhotoModel = Backbone.Model.extend({
        initialize: function(){
        },
        defaults: {
            //  imageSrc: "",
            user_name:"",
            email: ""
        },
        urlRoot: function () {
            return "/fake_images";
        }
    });
    return PhotoModel;
});
