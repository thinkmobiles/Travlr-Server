define([
    'moment'
],function (moment) {
    var ComplaintModel = Backbone.Model.extend({
        initialize: function(){

        },
        defaults: {
            author_id:"",
            post_id:""
        },
        urlRoot: function () {
            return "/complaints";
        },
        parse: true,
        parse: function (response) {
            if (response.created_at)
                response.created_at = moment(response.created_at).format("DD/MM/YYYY");

            return response;
        }
    });
    return ComplaintModel;
});
