/* jshint unused:false */
'use strict';
angular.module('IPMessenger', [])
  .controller('ComposerCtrl', function($scope) {
    var strToSjisBuffer = function(str) {
      var strArray = [];
      for (var i = 0; i < str.length; i++) {
        strArray.push(str.charCodeAt(i));
      }
      var sjisArray = window.Encoding.convert(strArray, 'SJIS', 'UNICODE');
      var buf = new ArrayBuffer(sjisArray.length); // 2 bytes for each char
      var bufView = new Uint8Array(buf);
      for (i = 0; i < sjisArray.length; i++) {
        bufView[i] = sjisArray[i];
      }
      return buf;
    };

    $scope.socketReady = false;

    $scope.clearForm = function() {
      $scope.toIPAddress = '';
      $scope.message = '';
    };

    $scope.sendMessage = function() {
      var socketId;
      var destinations = [];
      angular.forEach($scope.hostList, function(host){
        if(host.selected) {
          destinations.push(host);
        }
      });
      chrome.sockets.udp.create({}, function(socketInfo) {
        socketId = socketInfo.socketId;
        chrome.sockets.udp.bind(socketId, '0.0.0.0', 0, function() {
          var sendCallback = function(sendInfo){};
          angular.forEach(destinations, function(host){
            chrome.sockets.udp.send(socketId, strToSjisBuffer('1:1000:chrome:chrome:32:' + $scope.message), host.ipAddress, 2425, sendCallback);
          });
          $scope.clearForm();
          $scope.$apply();
        });
      });
    };

    $scope.selectHost = function(host) {
      $scope.toIPAddress = host.ipAddress;
      host.selected = !host.selected;
    };

    $scope.hostList = [];
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.message === 'hostListUpdate') {
        $scope.hostList = request.hostList;
        $scope.$apply();
      }
    });

    $scope.openConfig = function() {
      chrome.app.window.create('config.html', {
        id: 'config',
        bounds: {
          width: 300,
          height: 300
        }
      });
    };
    $scope.startVideo = function(host) {
      chrome.app.window.create('video.html', {
        bounds: {
          width: 600,
          height: 800
        }
      }, function(createdWindow){
        createdWindow.contentWindow.peer = host;
        createdWindow.contentWindow.caller = true;
        createdWindow.contentWindow.callee = false;
      });
    };
  });
