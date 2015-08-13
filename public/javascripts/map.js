// var map;
//
// function initialize() {
//   var mapOptions = {
//     zoom: 2,
//     center: {lat: 35.708124, lng:139.762660},
//     mapTypeId: google.maps.MapTypeId.TERRAIN
//   };
//   map = new google.maps.Map(document.getElementById('map-canvas'),
//                 mapOptions);
//
//   map.data.loadGeoJson('events/getGeoJson/edison0500');
// }
//
// google.maps.event.addDomListener(window, 'load', initialize);
app.controller('mapController', ['$scope', 'gpsDataService',
  function($scope, gpsDataService){
    var mapopt = { center: {lat: 35.708124, lng:139.762660}, zoom: 8};

    // uiGmapGoogleMapApi.then(function(maps) {
    //   //maps.Map.data.loadGeoJson('events/getGeoJson/edison0500?startdate=2015-08-07T18:00:00+09:00&enddate=2015-08-07T19:00:00+09:00');
    // });
    //var formatGpsData = function
    $scope.$on('mapInitialized', function(event, map){
        map.setCenter(mapopt.center);
        map.setZoom(mapopt.zoom);
        map.data.loadGeoJson('/events/getGeoJson/edison0500?startdate=2015-08-07T18:00:00+09:00&enddate=2015-08-07T19:00:00+09:00');
    });
    $scope.gpsdata = [];

  }]);

app.service('gpsDataService', ['$resource', function($resource) {
  return $resource('/events/:node_id', {}, {
      get: {method: 'GET', isArray: true}
      //save: {method: 'POST'},
      //delete: {method: 'DELETE'}
  });
}]);
