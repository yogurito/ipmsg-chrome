/* jshint unused:false, latedef: false */
/* global RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, URL, IPMessengerCommand */
'use strict';

angular.module('IPMessenger', [])
  .controller('VideoChatCtrl', function($scope, $window, $document) {
    $scope.peer = $window.peer;
    $scope.offeredSdp = $window.offeredSdp;
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

var pc;

function onIceCandidate(evt) {
  if (evt.candidate) {
    pc.addIceCandidate(new RTCIceCandidate(evt.candidate));
  }
}

function onRemoteStreamAdded(event) {
  var remoteVideo = document.getElementById('remoteVideo');
  remoteVideo.src = URL.createObjectURL(event.stream);
}

function gotOffer(description) {
  pc.setLocalDescription(description);
  console.log(description);
  var socketId;
  chrome.sockets.udp.create({}, function(socketInfo) {
    socketId = socketInfo.socketId;
    chrome.sockets.udp.bind(socketId, '0.0.0.0', 0, function() {
      var cmd = new IPMessengerCommand();
      cmd.commandCode = 0x08000100;
      cmd.appendix = description.sdp;
      cmd.userName = 'test';
      cmd.hostName = 'chrome';
      chrome.sockets.udp.send(socketId, window.strToSjisBuffer(cmd.toCommandStr()), window.peer.ipAddress, 2425, function(sendInfo) {});
    });
  });
  //pc2.setRemoteDescription(description);
  //pc2.createAnswer(gotAnswer);
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.message === 'ANSWER_SDP') {
      console.log('ANS RECV');
      var remoteDescription = new RTCSessionDescription();
      remoteDescription.sdp = request.sdp.replace('127.0.0.1', window.peer.ipAddress);
      remoteDescription.type = 'answer';
      console.log(remoteDescription);
      pc.setRemoteDescription(remoteDescription);
    }
  });
}

function gotAnswer(description) {
  pc.setLocalDescription(description);
  console.log(description);
  var socketId;
  chrome.sockets.udp.create({}, function(socketInfo) {
    socketId = socketInfo.socketId;
    chrome.sockets.udp.bind(socketId, '0.0.0.0', 0, function() {
      var cmd = new IPMessengerCommand();
      cmd.commandCode = 0x08000200;
      cmd.appendix = description.sdp;
      cmd.userName = 'test';
      cmd.hostName = 'chrome';
      chrome.sockets.udp.send(socketId, window.strToSjisBuffer(cmd.toCommandStr()), window.peer.ipAddress, 2425, function(sendInfo) {});
    });
  });
  //pc.setRemoteDescription(description);
}

function createPeerConnection(localMediaStream) {
  pc = new RTCPeerConnection(null);
  pc.onicecandidate = onIceCandidate;
  pc.onaddstream = onRemoteStreamAdded;

  if(window.caller) {

  }

  pc.addStream(localMediaStream);
  if(window.caller) {
    pc.createOffer(gotOffer);
  }
  if(window.callee) {
    console.log('called');
    var remoteDescription = new RTCSessionDescription();
    remoteDescription.sdp = window.offeredSdp.replace('127.0.0.1', window.peer.ipAddress);
    remoteDescription.type = 'offer';
    pc.setRemoteDescription(remoteDescription);
    pc.createAnswer(gotAnswer);
  }
}

navigator.webkitGetUserMedia({
  video: true,
  audio: true
}, function(localMediaStream) {
  var localVideo = document.getElementById('localVideo');
  localVideo.src = window.URL.createObjectURL(localMediaStream);

  localVideo.onloadedmetadata = function(e) {
    // Ready to go. Do some stuff.
  };

  createPeerConnection(localMediaStream);

}, function(e) {
});
