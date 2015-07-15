define([
    'text!/templates/login/LoginTemplate.html',
    'custom',
    'constants/constants'
], function (LoginTemplate, Custom, Constants) {

    var LoginView = Backbone.View.extend({
        el: '#wrapper',
        initialize: function (options) {
            this.render();
        },
        events: {
           'click .login-button': 'login',
            'keypress form': 'keypress'
        },
        keypress: function(e){
            if(e.which == 13){
                this.login(e);
            }
        },
        login: function(e){
            e.preventDefault();
            var data = {
                email: this.$("#ulogin").val(),
                password: this.$("#upass").val()
            };
            $.ajax({
                url: "/users/signIn",
                type: "POST",
                data: data,
                success: function (resp) {
                    if(resp.role == Constants.ADMIN_ROLE){
                        Custom.runApplication(true);
                    }else{
                        $("#loginForm").addClass("notRegister");
                        $("#loginForm .error").text("This user doesn't has permission").show();
                    }
                },
                error: function () {
                    $("#loginForm").addClass("notRegister");
                    $("#loginForm .error").text("Such user doesn't registered").show();
                }
            });
        },
        render: function(options){
            this.$el.html(_.template(LoginTemplate));
            return this;
        }

    });

    return LoginView;

});
