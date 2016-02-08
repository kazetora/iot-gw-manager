angular.module('iotGwMonitor').controller('contentEditController',
  function($scope, $modal, contentsDataService, CONTENTS_API_SERVER){

    $scope.base_img_url= CONTENTS_API_SERVER + "/image/";
    $scope.filter = null;
    $scope.viewTemplate = "/template/_tpl_contents_list_group"
    $scope.currentPage = 1;
    $scope.startPage = 1;
    $scope.maxDisplayPage = 10;
    $scope.pageRange = [];
    $scope.paginationInfo= {};
    $scope.pageCount = 0;
    $scope.totalItems = 0;
    $scope.contentFilter = '';

    var init = function() {
      $scope.getContent(1);
      //$scope.createPageRange();
    }
    $scope.pageChange = function(){
      $scope.getContent($scope.currentPage);
    }
    $scope.getContent = function(page, keyword) {
      //blockUI.start();
      var searchparam = {
        cmd:"getEditContents",
        ctype: "news",
        per_page:1000
      };
      if(typeof page != 'undefined')
        searchparam['page'] = page;
      if(typeof keyword != 'undefined')
        searchparam['keyword'] = keyword;

      var initcontents = contentsDataService.get(searchparam,
        function(){
            var contentcnt = contentsDataService.get({
              cmd:"getEditContents",
              ctype:"news",
              count:1
        }, function(){
              $scope.contents = initcontents;
              //$scope.content_count = contentcnt.n;
              //var minpagecnt = contentcnt.n/30;
              //$scope.page_count = (contentcnt%30) ? minpagecnt + 1 : minpagecnt;
              //$scope.currentPage = page;
              $scope.paginationInfo ={
                totalItems: contentcnt[0].n,
                currentPage: page
              };
              //$scope.createPageRange();
              //console.log($scope.pageRange);
              //blockUI.stop();
          });
        });
    }

    $scope.createPageRange = function() {
      if($scope.currentPage - $scope.startPage >= $scope.maxDisplayPage/2) {
        $scope.startPage = $scope.currentPage - $scope.maxDisplayPage/2;
      }
      $scope.pageRange = [];
      var max_range = $scope.startPage + $scope.maxDisplayPage <= $scope.content_count ? $scope.maxDisplayPage : $scope.content_count -  $scope.startPage;
      for(var i =0; i< max_range; i++){
        $scope.pageRange.push($scope.startPage + i);
        //$scope.$apply()
      }
    }

    $scope.openContentDetail = function(content) {
      var modalInstance = $modal.open({
        animation: true,
        templateUrl: "viewContent.html",
        controller: "modalViewContentController",
        resolve: {
          content: function() {
            return content;
          }
        }
      });
      modalInstance.result.then(function(isDelete){
        if(isDelete) {
          $scope.getContent(1);
        }
      });
    }

    $scope.$watch("paginationInfo", function(newVal, oldVal){
      console.log("newval", newVal);
      $scope.totalItems = newVal.totalItems;
      $scope.currentPage = newVal.currentPage;
      $scope.maxDisplayPage = Math.ceil($scope.totalItems/1000);
    });

    $scope.viewContentDetail = function(item) {

    }

    init();
});

angular.module('iotGwMonitor').controller('modalViewContentController',
  function($scope, $modalInstance, content, contentsDataService, CONTENTS_API_SERVER){
    $scope.item = content;
    //$scope.contents = contents;
    //$scope.selectedContents = [];
    //$scope.viewTemplate = "/template/_tpl_contents_list_group";
    $scope.contentsIMG = CONTENTS_API_SERVER + "image/";
    //$scope.areaName = "";
    //console.log($scope.contentsIMG);

    $scope.ok = function() {
      $modalInstance.close(false);
    }
    $scope.delete = function() {
      //$modalInstance.dismiss('cancel');
      //blockUI.start();
      var ret = contentsDataService.delete({cmd: "deleteContent", ctype: "news", cuid: content.cuid}, function(){
        if(ret != "OK")
          console.error(ret);
          //blockUI.stop()
          $modalInstance.close(true);
      });
    }
  });
