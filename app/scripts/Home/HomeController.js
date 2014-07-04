'use strict';
/*jshint esnext: true */

class HomeController {
    constructor($scope) {
        $scope.alert = () => {
            alert('hello world');
        }
    }
}

export default HomeController;