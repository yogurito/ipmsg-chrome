'use strict';
angular.module('IPMessenger', [])
    .controller('ComposerCtrl', function($scope) {
        var strToSjisBuffer = function(str) {
            var strArray = [];
            for (var i = 0; i < str.length; i++) {
                strArray.push(str.charCodeAt(i));
            }
            var sjisArray = window.Encoding.convert(strArray, 'SJIS', 'UTF8');
            var buf = new ArrayBuffer(sjisArray.length); // 2 bytes for each char
            var bufView = new Uint8Array(buf);
            for (i = 0; i < sjisArray.length; i++) {
                bufView[i] = sjisArray[i];
            }
            console.log(bufView);
            return buf;
        };

        $scope.socketReady = false;

        var socketId;
        chrome.sockets.udp.create({}, function(socketInfo) {
            socketId = socketInfo.socketId;
            chrome.sockets.udp.bind(socketId, '0.0.0.0', 0, function() {
                $scope.socketReady = true;
                $scope.$apply();
            });
        });

        $scope.clearForm = function() {
            $scope.toIPAddress = '';
            $scope.message = '';
        };

        $scope.sendMessage = function() {
            chrome.sockets.udp.send(socketId, strToSjisBuffer('1:1000:chrome:macbook:32:' + $scope.message), $scope.toIPAddress, 2425, function(sendInfo) {
                console.log(sendInfo);
                if (sendInfo.resultCode === 0) {
                    $scope.clearForm();
                    $scope.$apply();
                }
            });
        };
    });
