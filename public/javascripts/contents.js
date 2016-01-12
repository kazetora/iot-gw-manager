angular.module('iotGwMonitor').controller('modalContentsController',
  function($scope, $modalInstance, contents, areaName, CONTENTS_API_SERVER){

    $scope.contents = contents;
    $scope.selectedContents = [];
    $scope.viewTemplate = "/template/_tpl_contents_list_group";
    $scope.contentsIMG = CONTENTS_API_SERVER + "image/";
    $scope.areaName = areaName;
    console.log($scope.contentsIMG);

    $scope.ok = function() {

      if($scope.selectedContents.length == 0 || $scope.areaName == '') {
        alert("Please specify area name and select at least one content");
        return;
      }

      var cuids =[];
      for(var i=0; i< $scope.selectedContents.length; i++) {
        cuids.push($scope.selectedContents[i].cuid);
      }

      var data = {
        name: $scope.areaName,
        cuids: cuids
      }

      $modalInstance.close(data);
    }
    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    }
  });

  angular.module('iotGwMonitor').controller('modalContentsControllerShow',
    function($scope, $modalInstance, contents, CONTENTS_API_SERVER, selected_cuids){
      $scope.contents = [];
      for(var i=0; i< contents.length; i++) {
        if(selected_cuids.indexOf(contents[i].cuid) > -1) {
          //contents[i]['selected'] = true;
          $scope.contents.push(contents[i]);
        }
      }
      //$scope.contents = contents;
      //$scope.selectedContents = [];
      $scope.viewTemplate = "/template/_tpl_contents_list_group";
      $scope.contentsIMG = CONTENTS_API_SERVER + "image/";
      $scope.areaName = "";
      console.log($scope.contentsIMG);

      $scope.ok = function() {
        $modalInstance.close();
      }
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      }
    });
