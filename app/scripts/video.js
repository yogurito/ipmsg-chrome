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
var iceCandidates = [];

function onIceCandidate(evt) {
  if (evt.candidate) {
    var candidate = new RTCIceCandidate(evt.candidate);
    pc.addIceCandidate(candidate);
    iceCandidates.push(candidate);
  }
  if (pc.iceGatheringState === 'complete') {
    if (window.caller) {
      var socketId;
      chrome.sockets.udp.create({}, function(socketInfo) {
        socketId = socketInfo.socketId;
        chrome.sockets.udp.bind(socketId, '0.0.0.0', 0, function() {
          var cmd = new IPMessengerCommand();
          cmd.commandCode = 0x08000100;
          cmd.appendix = JSON.stringify({
            candidates: iceCandidates,
            sdp: pc.localDescription
          });
          cmd.userName = 'test';
          cmd.hostName = 'chrome';
          chrome.sockets.udp.send(socketId, window.strToSjisBuffer(cmd.toCommandStr()), window.peer.ipAddress, 2425, function(sendInfo) {
            console.log('sent invitation');
          });
        });
      });
    }
  }
}

function onRemoteStreamAdded(event) {
  var remoteVideo = document.getElementById('remoteVideo');
  remoteVideo.src = URL.createObjectURL(event.stream);
}

function gotOffer(description) {
  pc.setLocalDescription(description);
  var socketId;
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === 'ANSWER_SDP') {
      console.log('ANS RECV');
      var remoteDescription = new RTCSessionDescription();
      remoteDescription.sdp = request.sdp.sdp;
      remoteDescription.type = request.sdp.type;
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
      cmd.appendix = JSON.stringify(description);
      cmd.userName = 'test';
      cmd.hostName = 'chrome';
      chrome.sockets.udp.send(socketId, window.strToSjisBuffer(cmd.toCommandStr()), window.peer.ipAddress, 2425, function(sendInfo) {});
    });
  });
  //pc.setRemoteDescription(description);
}

function createPeerConnection(localMediaStream) {
  pc = new RTCPeerConnection(null);
  pc.onaddstream = onRemoteStreamAdded;
  pc.addStream(localMediaStream);

  if (window.caller) {
    pc.onicecandidate = onIceCandidate;
    pc.createOffer(gotOffer);
  }
  if (window.callee) {
    console.log('called');
    var remoteDescription = new RTCSessionDescription();
    remoteDescription.sdp = window.offeredSDP.sdp;
    remoteDescription.type = window.offeredSDP.type;
    //console.log(window.offeredSDP);
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

}, function(e) {});
