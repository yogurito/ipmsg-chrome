/* jshint unused: false */

'use strict';

var IPMessengerCommand = window.IPMessengerCommand;

var HostList = function() {
  var list = [];
  HostList.prototype.appendHost = function(ipAddress, hostName, userName) {
    var host = _.findWhere(list, {
      ipAddress: ipAddress
    });
    if (!host) {
      host = {};
      list.push(host);
    }
    host.ipAddress = ipAddress;
    host.hostName = hostName;
    host.userName = userName;
    console.log(list);
    return host;
  };
  HostList.prototype.getHostList = function() {
    return list;
  };
};

var IPMessengerBackend = function() {
  this.socketId = null;
  this.myHost = {
    hostName: 'IPMsgChrome',
    userName: 'ChromeUser'
  };
  this.hostList = new HostList();
  this.myAddress = [];

  var _this = this;
  var createPacketNotification = function(packetInfo, command) {
    chrome.notifications.create('', {
      type: 'list',
      title: 'IPMessenger for Chrome',
      message: 'Received packet',
      iconUrl: '/images/icon-128.png',
      items: [{
        title: 'from',
        message: packetInfo.remoteAddress || ''
      }, {
        title: 'packet number',
        message: String(command.packetNumber)
      }, {
        title: 'user name',
        message: command.userName || ''
      }, {
        title: 'host name',
        message: command.hostName || ''
      }, {
        title: 'command name',
        message: command.getCommandName() || ''
      }, {
        title: 'options',
        message: String(command.getOptions())
      }]
    }, function(notificationId) {
      setTimeout(function() {
        chrome.notifications.clear(notificationId, function() {});
      }, 10000);
    });
  };
  var openMessageWindow = function(packetInfo, command) {
    chrome.app.window.create('message.html', {
      width: 500,
      height: 200
    }, function(createdWindow) {
      createdWindow.contentWindow.packetInfo = packetInfo;
      createdWindow.contentWindow.command = command;
    });
  };
  var createMessageNotification = function(packetInfo, command, callback) {
    chrome.notifications.create('', {
      type: 'list',
      title: 'IPMessenger for Chrome',
      message: 'Received Message',
      iconUrl: '/images/icon-128.png',
      items: [{
        title: 'From',
        message: command.userName + ' (' + command.hostName + ')'
      }, {
        title: 'Message',
        message: command.appendix
      }],
      buttons: [{
        title: 'Open'
      }],
      isClickable: true
    }, function(notificationId){
      chrome.notifications.onButtonClicked.addListener(function(){
        callback();
      });
    });
  };
  var handleCommand = function(packetInfo, command) {
    var commandName = command.getCommandName();
    var options = command.getOptions();
    if (commandName === 'IPMSG_BR_ENTRY') {
      var host = _this.hostList.appendHost(packetInfo.remoteAddress, command.hostName, command.userName);
      chrome.runtime.sendMessage({
        message: 'hostListUpdate',
        host: host
      });
    } else if (commandName === 'IPMSG_SENDMSG') {
      var replyCommand = new IPMessengerCommand();
      replyCommand.userName = _this.myHost.userName;
      replyCommand.hostName = _this.myHost.hostName;
      replyCommand.commandCode = replyCommand.commandCodes.IPMSG_RECVMSG;
      chrome.sockets.udp.send(_this.socketId, strToSjisBuffer(replyCommand.toCommandStr()), packetInfo.remoteAddress, 2425, function(sendInfo) {});
      command.receivedAt = new Date();
      createMessageNotification(packetInfo, command, function(){
        openMessageWindow(packetInfo, command);
      });
    } else if (commandName === 'IPMSG_NOOPERATION' && _.contains(options, 'IPMSG_CHROME_VIDEOSDP')) {
      console.log('SDP received');
    }
    console.log(command);
  };
  this.initializeSocket = function(callback) {
    var onReceive = function(info) {
      if (info.socketId !== _this.socketId) {
        return;
      }
      var array = new Uint8Array(info.data);
      var utf8Array = window.Encoding.convert(array, 'UNICODE', 'SJIS');
      var commandStr = String.fromCharCode.apply(null, utf8Array);
      var command = new IPMessengerCommand(commandStr);
      //createPacketNotification(info, command);
      //console.log(command);
      handleCommand(info, command);
    };
    var _this = this;
    chrome.sockets.udp.create({}, function(socketInfo) {
      _this.socketId = socketInfo.socketId;
      chrome.sockets.udp.onReceive.addListener(onReceive);
      chrome.sockets.udp.bind(_this.socketId, '0.0.0.0', 2425, function() {
        callback();
      });
    });
  };

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
  this.broadcastBrEntryCommand = function(addrArray) {
    var command = new IPMessengerCommand();
    command.userName = this.myHost.userName;
    command.hostName = this.myHost.hostName;
    command.commandCode = command.commandCodes.IPMSG_BR_ENTRY;
    var sendCallaback = function(sendInfo) {};
    for (var i = 0; i < addrArray.length; i++) {
      chrome.sockets.udp.send(this.socketId, strToSjisBuffer(command.toCommandStr()), addrArray[i], 2425, sendCallaback);
    }
  };
};

// Listens for the app launching then creates the window
chrome.app.runtime.onLaunched.addListener(function() {
  var width = 500;
  var height = 300;

  chrome.app.window.create('index.html', {
    id: 'main',
    bounds: {
      width: width,
      height: height,
      left: Math.round((screen.availWidth - width) / 2),
      top: Math.round((screen.availHeight - height) / 2)
    }
  });

  var socketId;
  var backend = new IPMessengerBackend();
  backend.initializeSocket(function() {
    chrome.system.network.getNetworkInterfaces(function(interfaces) {
      for (var i = 0; i < interfaces.length; i++) {
        var addr = window.ipaddr.parse(interfaces[i].address);
        if (addr.kind() === 'ipv6') {
          continue;
        }
        backend.myAddress.push(addr);
        if (interfaces[i].prefixLength === 24) {
          var broadcastList = [];
          var octets = addr.octets;
          for (var j = 1; j < 255; j++) {
            broadcastList.push(octets[0] + '.' + octets[1] + '.' + octets[2] + '.' + j);
          }
          backend.broadcastBrEntryCommand(broadcastList);
        }
      }
    });
  });
});
