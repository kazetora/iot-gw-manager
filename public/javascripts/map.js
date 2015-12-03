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
app.controller('mapController', ['$scope','$modal', 'gpsDataService', 'NodeService', 'contentsDataService', 'areaService', 'mySocket',
  function($scope, $modal, gpsDataService, NodeService, contentsDataService, areaService, mySocket){
    var mapopt = { center: {lat: 35.708124, lng:139.762660}, zoom: 8};

    $scope.sfilter = "";
    $scope.gpsSearch = {};
    $scope.searchList = [];
    $scope.selectFromList = [];
    $scope.selectToList = [];
    $scope.nodeList = [];
    $scope.gpsSearch.startdate = moment();
    $scope.gpsSearch.enddate = moment();

    $scope.gpsTrackData = {};
    $scope.gpsTrackStart = false;
    $scope.markedAreas = [];
    $scope.incStatus = "";

    var init = function() {
      $scope.updateList();
      mySocket.forward('gpsTrace', $scope);
      $scope.$on('socket:gpsTrace', function(ev, data){
        //console.log(data);
        if($scope.gpsTrackStart)
          $scope.updateGPSTrackingData(data);
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
        var drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: true,
          drawingControlOptions : {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
              google.maps.drawing.OverlayType.POLYGON
            ]
          },
          polygonOptions: {
            clickable: true,
            draggable: false,
            editable: false
          },
        });
        drawingManager.setMap(map);

        google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon){
          //var paths = polygon.getPaths();
          //console.log(paths);


          //mySocket.emit('add_new_polygon', polycoor);


          $scope.openSelectContent(polygon, true);
        });

        var savedAreas = areaService.get({cmd:'getAreas'}, function(){
          var data = savedAreas;
          for(var i =0; i < data.length; i++) {
            var pol = new google.maps.Polygon({paths:data[i].coords});
            pol.setMap($scope.map);
            pol.setVisible(false);
            $scope.markedAreas.push({_id: data[i]._id, name: data[i].name, area: pol, cuids: data[i].cuids});

          }
          //$scope.$apply();
        });
    });



    //console.log($scope.startdate, $scope.enddate);
    $scope.openSelectContent = function(polygon) {
      var _contents = contentsDataService.get({ctype: 'news'}, {},  function(){
        console.log(_contents);
        var modalInstance = $modal.open({
          animation: true,
          templateUrl: 'selectContent.html',
          controller: 'modalContentsController',
          resolve: {
            contents: function() {
              return _contents;
            }
          }
        });

        modalInstance.result.then(function(data) {
          if(data.length <= 0 ) {
            polygon.setMap(null);
            return;
          }

          console.log(data);
          // var cuids = [];
          // for(var i = 0; i < data.length; i++) {
          //   cuids.push(selectedContents[i].cuid);
          // }

          var vertices = polygon.getPath();
          var polycoor = [];
          for(var i =0; i< vertices.length; i++) {
            var xy = vertices.getAt(i);
            polycoor.push({
              lat: xy.lat(),
              lng: xy.lng()
            });
          }
          console.dir(polycoor);

          var areaData = {
            coords: polycoor,
            cuids: data.cuids,
            name: data.name
          }

          var newArea = areaService.save({cmd: 'addArea'}, {params: areaData}, function(){
            console.log("reg area", newArea);
            var newAreaData = newArea.data;
            if(newArea.status == 0)
              $scope.markedAreas.push({
                                        _id: newAreaData._id,
                                        name: newAreaData.name,
                                        area: polygon,
                                        cuids: newAreaData.cuids,
                                        area_id: newAreaData.area_id
                                      });
              console.log("socket emit area/add");
              mySocket.emit("area/add", newAreaData);
            //$scope.$apply();
          });

        }, function() {
          // remove the polygon
          polygon.setMap(null);
        });
      })
    }

    $scope.openSelectContentShow = function(areaObj) {
      var _contents = contentsDataService.get({ctype: 'news'}, {},  function(){
        console.log(_contents);
        var modalInstance = $modal.open({
          animation: true,
          templateUrl: 'selectContentShow.html',
          controller: 'modalContentsControllerShow',
          resolve: {
            contents: function() {
              return _contents;
            },
            selected_cuids: function() {
              return areaObj.cuids;
            }
          }
        });

        modalInstance.result.then(function() {

        }, function() {
          // remove the polygon
          //polygon.setMap(null);
        });
      })
    }

    //$scope.gpsdata = {};
    $scope.clearMap = function() {
      $scope.map.data.forEach(function(feature){
          $scope.map.data.remove(feature);
      });
    };

    $scope.onFromDateChange = function () {

    };
    $scope.getGPSData = function() {
      // first stop gps tracking
      $scope.stopGPSTracking();

      var params = {
        node_ids: $scope.searchList,
        startdate: $scope.gpsSearch.startdate,
        enddate:   $scope.gpsSearch.enddate
      };

      $scope.clearMap();
      var geojson = gpsDataService.get({}, params,
                      function(){
                          //$scope.map.data.clear();
                          $scope.map.setCenter(geojson.center);
                          $scope.map.data.addGeoJson(geojson.data);

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
        for(var i =0; i< $scope.gpsSearch.selectFromList.length; i++) {
          addremlist.push($scope.gpsSearch.selectFromList[i]);
          $scope.searchList.push($scope.gpsSearch.selectFromList[i]);
        }

        var tmplist = [];
        for(var i = 0; i < $scope.nodeList.length; i++) {
          if(addremlist.indexOf($scope.nodeList[i]) < 0)
            tmplist.push($scope.nodeList[i]);
        }

        $scope.nodeList = tmplist;
        $scope.gpsSearch.selectFromList = [];
    }

    $scope.toSelectList = function() {
        var addremlist = [];
        //$scope.searchList = [];
        for(var i =0; i< $scope.gpsSearch.selectToList.length; i++) {
          addremlist.push($scope.gpsSearch.selectToList[i]);
          $scope.nodeList.push($scope.gpsSearch.selectToList[i]);
        }

        var tmplist = [];
        for(var i = 0; i < $scope.searchList.length; i++) {
          if(addremlist.indexOf($scope.searchList[i]) < 0)
            tmplist.push($scope.searchList[i]);
        }

        $scope.searchList = tmplist;
        $scope.gpsSearch.selectToList = [];
    }

    $scope.startGPSTracking = function() {
      if(!$scope.gpsTrackStart) {
        $scope.gpsTrackStart = true;
        console.log("start gps tracking");
        mySocket.emit("start_gps_tracking");
      }
    }

    $scope.stopGPSTracking = function() {
      if($scope.gpsTrackStart) {
        $scope.gpsTrackStart = false;
        console.log("stop gps tracking");
        mySocket.emit("stop_gps_tracking");
        $scope.clearMap();
      }
    }

    $scope.updateGPSTrackingData = function(data){
      $scope.gpsTrackData = data;
      $scope.showGPSTracking();
    }

    $scope.showGPSTracking = function() {
        //$scope.gpsTrackData[data.id] = data;

        var data_arr = Object.keys($scope.gpsTrackData).map(function(key){return $scope.gpsTrackData[key];});
        // for(var nodeid in $scope.gpsTrackData) {
        //   data_arr.push($scope.gpsTrackData[nodeid]);
        // }
        var gj = GeoJSON.parse(data_arr, {Point: ['lat', 'lng']});
        //console.log(gj);
        $scope.clearMap();
        $scope.map.data.addGeoJson(gj);
        //var label = new ELabel(new google.maps.LatLng($scope.gpsTrackData[nodeid].lat, $scope.gpsTrackData[nodeid].lng),
        //                        $scope.gpsTrackData[nodeid].id, "style1");
        //$scope.map.addOverlay(label);
        $scope.map.data.setStyle(function(feature) {
            var title = feature.getProperty('id');
            var geometry = feature.getGeometry().get();
            console.log(geometry);
            if($scope.markedAreas.length > 0) {
              var isInArea = false;
              for(var i = 0; i < $scope.markedAreas.length; i++) {
                //var ma = new google.maps.Polygon({paths: $scope.markedAreas[i]});
                if(google.maps.geometry.poly.containsLocation(geometry, $scope.markedAreas[i].area) ) {
                  isInArea = true;
                }
              }
              var color = isInArea ? 'red' : 'blue';
            }
            else {
              var color = 'blue';
            }
            return {
                title: title,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: color,
                  fillOpacity: 1,
                  strokeColor: 'black',
                  strokeWeight: .5,
                  scale: 7
                }
            };
        });
    }

    $scope.showAreas = function() {
      for(var i=0; i < $scope.markedAreas.length; i++) {
        $scope.markedAreas[i].area.setVisible(true);
      }
    }

    $scope.hideAreas = function() {
      for(var i=0; i < $scope.markedAreas.length; i++) {
        $scope.markedAreas[i].area.setVisible(false);
      }
    }

    $scope.showOneArea = function(area) {
      for(var i=0; i < $scope.markedAreas.length; i++) {
        if($scope.markedAreas[i].name === area) {
          $scope.markedAreas[i].area.setVisible(true);
          break;
        }
      }
    }

    $scope.hideOneArea = function(area) {
      for(var i=0; i < $scope.markedAreas.length; i++) {
        if($scope.markedAreas[i].name === area) {
          $scope.markedAreas[i].area.setVisible(false);
          break;
        }
      }
    }

    $scope.deleteArea = function(area) {

      var id = '',
          area_id ='',
          poly = null,
          idx = -1;

      for(var i = 0; i < $scope.markedAreas.length; i++) {
        if($scope.markedAreas[i].name === area) {
          id = $scope.markedAreas[i]._id;
          poly = $scope.markedAreas[i].area;
          area_id = $scope.markedAreas[i].area_id;
          idx = i;
          break;
        }
      }
      if(idx < 0) return;
      // delete from db
      areaService.delete({cmd: 'deleteArea', id: id},{}, function(){
        // delete from local
        $scope.markedAreas.splice(idx, 1);
        // remove from map
        poly.setMap(null);
        // update area cache on devices
        mySocket.emit("area/delete", area_id)
      });
    }

    //$scope.startDateChange =

    init();
  }]);

app.service('gpsDataService', ['$resource', function($resource) {
  return $resource('/events/getGeoJson/:node_id', {}, {
      get: {method: 'POST', isArray: false}
      //save: {method: 'POST'},
      //delete: {method: 'DELETE'}
  });
}]);

app.service('contentsDataService', ['$resource', function($resource) {
  return $resource('/contents/getContents/:ctype', {}, {
      get: {method: 'GET', isArray: true}
      //save: {method: 'POST'},
      //delete: {method: 'DELETE'}
  });
}]);

app.service('areaService', ['$resource', function($resource) {
    return $resource('/areas/:cmd/:id', {}, {
        get: {method: 'GET', isArray: true},
        save: {method: 'POST'},
        delete: {method: 'DELETE'},
        update: {method: 'POST'}
    });
}]);
