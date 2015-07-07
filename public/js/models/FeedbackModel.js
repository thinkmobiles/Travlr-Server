define([
    'Validation'
],function (Validation) {
    var FeedbackModel = Backbone.Model.extend({
        initialize: function(){
            this.on('invalid', function (model, errors) {
                if (errors.length > 0) {
                    var msg = errors.join('\n');
                    alert(msg);
                }
            });
        },
        defaults: {
            author_id:"",
            body:""
        },
        urlRoot: function () {
            return "/feedbacks";
        },
        validate: function (attrs) {
            var errors = [];
            Validation.checkNotesField(errors, true, attrs.body, "Body");
            if (errors.length > 0){
                return errors;
            }
        }
    });
    return FeedbackModel;
});
