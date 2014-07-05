/* jshint unused:false, latedef: false */
/* global RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, URL, IPMessengerCommand */
'use strict';

angular.module('IPMessenger', [])
  .controller('VideoChatCtrl', function($scope, $window, $document) {
    $scope.peer = $window.peer;
  });

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;
window.RTCPeerConnection = (window.webkitPeerConnection00 ||
  window.webkitRTCPeerConnection ||
  window.mozRTCPeerConnection);

window.RTCSessionDescription = (window.mozRTCSessionDescription ||
  window.RTCSessionDescription);

window.RTCIceCandidate = (window.mozRTCIceCandidate ||
  window.RTCIceCandidate);

var sendConnectionConfig = function() {

};

var pc1, pc2;
if (window.caller) {

}

function onIceCandidate1(evt) {
  if (evt.candidate) {
    pc2.addIceCandidate(new RTCIceCandidate(evt.candidate));
  }
}

function onIceCandidate2(event) {
  if (event.candidate) {
    pc1.addIceCandidate(new RTCIceCandidate(event.candidate));
  }
}

function onRemoteStreamAdded(event) {
  var remoteVideo = document.getElementById('remoteVideo');
  remoteVideo.src = URL.createObjectURL(event.stream);
}

function gotOffer(description) {
  pc1.setLocalDescription(description);
  var socketId;
  chrome.sockets.udp.create({}, function(socketInfo) {
    socketId = socketInfo.socketId;
    chrome.sockets.udp.bind(socketId, '0.0.0.0', 0, function() {
      var cmd = new IPMessengerCommand();
      cmd.commandCode = 0x08000100;
      cmd.appendix = description.sdp;
      cmd.userName = 'test';
      cmd.hostName = 'chrome';
      chrome.sockets.udp.send(socketId, window.strToSjisBuffer(cmd.toCommandStr), window.peer.ipAddress, 2425, function(sendInfo) {});
    });
  });
  pc2.setRemoteDescription(description);
  pc2.createAnswer(gotAnswer);
}

function gotAnswer(description) {
  pc2.setLocalDescription(description);
  pc1.setRemoteDescription(description);
}

function createPeerConnection(localMediaStream) {
  pc1 = new RTCPeerConnection(null);
  pc1.onicecandidate = onIceCandidate1;

  pc2 = new RTCPeerConnection(null);
  pc2.onicecandidate = onIceCandidate2;
  pc2.onaddstream = onRemoteStreamAdded;

  pc1.addStream(localMediaStream);
  pc1.createOffer(gotOffer);
}


navigator.webkitGetUserMedia({
  video: true,
  audio: true
}, function(localMediaStream) {
  var localVideo = document.getElementById('localVideo');
  localVideo.src = window.URL.createObjectURL(localMediaStream);

  localVideo.onloadedmetadata = function(e) {
    // Ready to go. Do some stuff.
    console.log(e);
  };

  createPeerConnection(localMediaStream);

}, function(e) {
  console.log('Rejected', e);
});
