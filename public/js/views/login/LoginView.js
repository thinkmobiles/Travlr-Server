define([
    'text!/templates/login/LoginTemplate.html',
    'custom'
], function (LoginTemplate, Custom) {

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
                success: function () {
                    Custom.runApplication(true);
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
