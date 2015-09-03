angular.module('iotGwMonitor').controller('modalContentsController',
  function($scope, $modalInstance, contents, CONTENTS_API_SERVER){

    $scope.contents = contents;
    $scope.selectedContents = [];
    $scope.viewTemplate = "/template/_tpl_contents_list_group";
    $scope.contentsIMG = CONTENTS_API_SERVER + "image/";
    console.log($scope.contentsIMG);

    $scope.ok = function() {
      $modalInstance.close($scope.selectedContents);
    }
    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    }
  });
