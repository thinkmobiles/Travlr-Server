define([],function () {
    var FeedbackModel = Backbone.Model.extend({
        initialize: function(){

        },
        defaults: {
            author_id:"",
            body:""
        },
        urlRoot: function () {
            return "/feedbacks";
        }
    });
    return FeedbackModel;
});
