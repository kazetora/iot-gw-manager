'use strict'

var app = angular.module('iotGwMonitor', ['ngResource', 'btford.socket-io', 'ngMap', 'ui.bootstrap', 'listGroup', 'ui.bootstrap.datetimepicker']);

// app.config(function(uiGmapGoogleMapApiProvider) {
//   uiGmapGoogleMapApiProvider.configure({
//       key: 'AIzaSyCbQ5yY89z6ZziaXrrnpL_HcJKLRu1T6sQ',
//       v: '3.17',
//       libraries: 'weather,geometry,visualization'
//   });
// });
app.constant('CONTENTS_API_SERVER', 'https://133.11.240.228/mob/');

app.controller('NodeController', ['$scope', 'NodeService', '$timeout', 'mySocket',
    function($scope, NodeService, $timeout, mySocket){
        //(function tick(){
        //    var nodeData = NodeService.get(function(){
        //        $scope.nodeList = nodeData;
        //    });
        //    $timeout(tick, 2000);
        //})();

        function init() {
            $scope.updateView();
            mySocket.forward('ip_update', $scope);
            $scope.$on('socket:ip_update', function(ev, data) {
                console.log("get message");
                $scope.updateView();
            });
            //mySocket.on('ip_update', function() {
            //    console.log("get message");
            //    $scope.updateView();
            //});
        };
        $scope.updateView = function() {
            var nodeData = NodeService.get(function(){
                $scope.nodeList = nodeData;
            });
        };
        $scope.newName="";
        $scope.addNewNode = function() {
            if($scope.newName) {
                var params = {name: $scope.newName};
                NodeService.save({cmd:'addNode'}, {params: params}, function(){
                    $scope.updateView();
                });
            }
        };
        $scope.deleteNode = function(node) {
            NodeService.delete({cmd:'deleteNode', id:node._id}, function(){
                $scope.updateView();
            });
        };

        init();
    }]);


app.service('NodeService', ['$resource', function($resource) {
    return $resource('nodes/:cmd/:id', {}, {
        get: {method: 'GET', isArray: true},
        save: {method: 'POST'},
        delete: {method: 'DELETE'}
    });
}]);

app.factory('mySocket', ['socketFactory', function(socketFactory) {
    var mySocket = socketFactory();
    return mySocket;
}]);
