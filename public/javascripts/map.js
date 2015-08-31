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
app.controller('mapController', ['$scope', 'gpsDataService', 'NodeService', 'mySocket',
  function($scope, gpsDataService, NodeService, mySocket){
    var mapopt = { center: {lat: 35.708124, lng:139.762660}, zoom: 8};

    var init = function() {
      $scope.updateList();
      $scope.sfilter = "";
      $scope.searchList = [];
      $scope.selectFromList = [];
      $scope.selectToList = [];
      $scope.nodeList = [];
      $scope.gpsTrackData = {};
      mySocket.forward('gpsTrace', $scope);
      $scope.$on('socket:gpsTrace', function(ev, data){
        console.log(data);
        $scope.showGPSTracking(data);
      })
    }
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

    $scope.startdate = moment();
    $scope.enddate = moment();

    //console.log($scope.startdate, $scope.enddate);

    //$scope.gpsdata = {};
    $scope.clearMap = function() {
      $scope.map.data.forEach(function(feature){
          $scope.map.data.remove(feature);
      });
    };

    $scope.onFromDateChange = function () {

    };
    $scope.getGPSData = function() {
      //window.alert("aaaa");
      var params = {
        node_ids: $scope.searchList,
        startdate: $scope.startdate,
        enddate:   $scope.enddate
      };

      $scope.clearMap();
      var geojson = gpsDataService.get({}, params,
                      function(){
                          //$scope.map.data.clear();
                          $scope.map.setCenter(geojson.center);
                          $scope.map.data.addGeoJson(geojson.data);

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

    $scope.updateList = function() {
        var nodeData = NodeService.get(function(){
            //$scope.nodeList = nodeData;
            for(var i = 0; i < nodeData.length; i++) {
              $scope.nodeList.push(nodeData[i].name);
            }
        });
    };

    $scope.toSearchList = function() {
        var addremlist = [];
        //$scope.searchList = [];
        for(var i =0; i< $scope.selectFromList.length; i++) {
          addremlist.push($scope.selectFromList[i]);
          $scope.searchList.push($scope.selectFromList[i]);
        }

        var tmplist = [];
        for(var i = 0; i < $scope.nodeList.length; i++) {
          if(addremlist.indexOf($scope.nodeList[i]) < 0)
            tmplist.push($scope.nodeList[i]);
        }

        $scope.nodeList = tmplist;
        $scope.selectFromList = [];
    }

    $scope.toSelectList = function() {
        var addremlist = [];
        //$scope.searchList = [];
        for(var i =0; i< $scope.selectToList.length; i++) {
          addremlist.push($scope.selectToList[i]);
          $scope.nodeList.push($scope.selectToList[i]);
        }

        var tmplist = [];
        for(var i = 0; i < $scope.searchList.length; i++) {
          if(addremlist.indexOf($scope.searchList[i]) < 0)
            tmplist.push($scope.searchList[i]);
        }

        $scope.searchList = tmplist;
        $scope.selectToList = [];
    }

    $scope.startGPSTracking = function() {
        console.log("start gps tracking");
        mySocket.emit("start_gps_tracking");
    }

    $scope.stopGPSTracking = function() {
        console.log("stop gps tracking");
        mySocket.emit("stop_gps_tracking");
    }

    $scope.showGPSTracking = function(data) {
        $scope.gpsTrackData[data.id] = data;
        $scope.clearMap();
        for(var nodeid in $scope.gpsTrackData) {
          var gj = GeoJSON.parse([$scope.gpsTrackData[nodeid]], {Point: ['lat', 'lng']});
          console.log(gj);
          $scope.map.data.addGeoJson(gj);
          //var label = new ELabel(new google.maps.LatLng($scope.gpsTrackData[nodeid].lat, $scope.gpsTrackData[nodeid].lng), 
          //                        $scope.gpsTrackData[nodeid].id, "style1");
          //$scope.map.addOverlay(label);
          $scope.map.data.setStyle(function(feature) {
              var title = feature.getProperty('id');
              return {
                  title: title
              };
          });
        }
    }

    init();
  }]);

app.service('gpsDataService', ['$resource', function($resource) {
  return $resource('/events/getGeoJson/:node_id', {}, {
      get: {method: 'POST', isArray: false}
      //save: {method: 'POST'},
      //delete: {method: 'DELETE'}
  });
}]);
