/* jshint unused:false */
'use strict';

angular.module('IPMessenger',[])
.controller('MessageViewerCtrl', function($scope, $window){
  $scope.from = {
    userName: $window.command.userName,
    hostName: $window.command.hostName,
    ipAddress: $window.packetInfo.remoteAddress
  };
  $scope.receivedAt = $window.command.receivedAt;
  $scope.message = $window.command.appendix;
});
