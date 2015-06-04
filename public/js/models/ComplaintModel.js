define([],function () {
    var ComplaintModel = Backbone.Model.extend({
        initialize: function(){

        },
        defaults: {
            author_id:"",
            post_id:""
        },
        urlRoot: function () {
            return "/complaints";
        }
    });
    return ComplaintModel;
});
