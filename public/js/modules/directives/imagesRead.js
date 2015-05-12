app.directive('imagesRead', ['$q', '$rootScope', function ($q, $rootScope) {
    'use strict';
    return {
        restrict: "A",
        scope: {
            image: "=",
            maxfiles: "="
        },
        link: function (scope, element, attrs, rootScope) {

            element.bind('change', function (evt) {
                //when multiple always return an array of images
                var counter = evt.target.files.length;
                if (counter <= scope.maxfiles) {
                    scope.maxfiles -= evt.target.files.length;

                    var fileToDataURL = function (file) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            scope.image.push({'image_url': e.target.result});
                            counter--;
                            if (counter === 0) {
                                scope.$apply();
                            }
                        };
                        reader.readAsDataURL(file);
                    };

                    var files = evt.target.files;
                    for (var i = 0; i < files.length; i++) {
                        fileToDataURL(files[i]);
                    }
                } else {
                    alert('To many files');
                }
            });


        }
    }
}]);