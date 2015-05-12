app.directive('jDatepicker', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            ngModel: "="
        },
        link: function (scope, element) {
            if (element) {

                $(element).datepicker({
                    altFormat: "mm/dd/yy",
                    dateFormat: 'mm/dd/yy',
                    onSelect: function (date) {
                        scope.ngModel = date;
                        scope.$apply();
                    }
                });
            }
        }
    };
}]);