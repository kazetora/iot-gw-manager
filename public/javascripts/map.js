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
app.controller('mapController', ['$scope', 'uiGmapGoogleMapApi',
  function($scope, uiGmapGoogleMapApi){
    $scope.map = { center: {latitude: 35.708124, longitude:139.762660}, zoom: 8};

    uiGmapGoogleMapApi.then(function(map) {
      map.loadGeoJson('events/getGeoJson/edison0500');
    });
  }]);
