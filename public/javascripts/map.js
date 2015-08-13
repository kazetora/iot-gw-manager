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
    //var geojson = gpsDataService
    $scope.$on('mapInitialized', function(event, map){
        map.setCenter(mapopt.center);
        map.setZoom(mapopt.zoom);
        //map.data.loadGeoJson('/events/getGeoJson/edison0500?startdate=2015-08-07T18:00:00%2B09:00&enddate=2015-08-07T19:00:00%2B09:00');
        //$scope.map = map;
    });

    $scope.startdate = moment().format("YYYY-MM-DDTHH:mm:ss+09:00");
    $scope.enddate = moment().format("YYYY-MM-DDTHH:mm:ss+09:00");

    console.log($scope.startdate, $scope.enddate);

    //$scope.gpsdata = {};
    $scope.clearMap = function() {
      $scope.map.data.forEach(function(feature){
          $scope.map.data.remove(feature);
      });
    };

    $scope.onFromDateChange = function () {

    };
    $scope.getGPSData1 = function() {
      //window.alert("aaaa");
      $scope.clearMap();
      var geojson = gpsDataService.get({
                      node_id: "edison0500",
                      startdate: "2015-08-07T18:00:00+09:00",
                      enddate:   "2015-08-07T19:00:00+09:00"},
                      function(){
                          //$scope.map.data.clear();
                          $scope.map.data.addGeoJson(geojson);
                      });
    };
    $scope.getGPSData2 = function() {
      //window.alert("aaaa");
      $scope.clearMap();
      var geojson = gpsDataService.get({
                      node_id: "edison0500",
                      startdate: "2015-08-08T16:00:00+09:00",
                      enddate:   "2015-08-08T19:00:00+09:00"},
                      function(){
                        //$scope.map.data.clear();
                          $scope.map.data.addGeoJson(geojson);
                      });
    };
  }]);

app.service('gpsDataService', ['$resource', function($resource) {
  return $resource('/events/getGeoJson/:node_id', {}, {
      get: {method: 'GET', isArray: false}
      //save: {method: 'POST'},
      //delete: {method: 'DELETE'}
  });
}]);
