'use strict';
/*jshint esnext: true */
/*global angular: false */

import Router from 'Router';
import HomeController from 'HomeController';

var app = angular.module('Todo', [
    'ui.router',
    'ngAnimate'
]);

app.config(['$stateProvider', '$urlRouterProvider', Router]);
app.controller('HomeController', HomeController);