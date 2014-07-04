/*jshint esnext: true */

class Router {
    constructor($stateProvider, $urlRouterProvider) {
        $stateProvider.state('home', {
            url: '/home',
            templateUrl: 'app/scripts/Home/home.tpl.html',
            controller: 'HomeController'
        });

        $urlRouterProvider.otherwise('/home');
    }
}

// Having a "default" export is useful when
// there is one main thing a module exports.
export default Router;