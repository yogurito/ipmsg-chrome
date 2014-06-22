/* jshint unused: false */

'use strict';

var IPMessengerCommand = window.IPMessengerCommand;

var HostList = function(){
    var list = [];
    HostList.prototype.appendHost = function(ipAddress, hostName, userName){
        var host = _.findWhere(list, {ipAddress: ipAddress});
        if(!host) {
            host = {};
            list.push(host);
        }
        host.ipAddress = ipAddress;
        host.hostName = hostName;
        host.userName = userName;
        console.log(list);
    };
    HostList.prototype.getHostList = function(){
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
    var handleCommand = function(packetInfo, command) {
        if(command.getCommandName() === 'IPMSG_BR_ENTRY') {
            _this.hostList.appendHost(packetInfo.remoteAddress, command.hostName, command.userName);
        }
    };
    this.initializeSocket = function() {
        var onReceive = function(info) {
            if (info.socketId !== _this.socketId) {
                return;
            }
            var array = new Uint8Array(info.data);
            var utf8Array = window.Encoding.convert(array, 'UTF-8', 'SJIS');
            var commandStr = String.fromCharCode.apply(null, utf8Array);
            var command = new IPMessengerCommand(commandStr);
            createPacketNotification(info, command);
            console.log(command);
            handleCommand(info, command);
        };
        var _this = this;
        chrome.sockets.udp.create({}, function(socketInfo) {
            _this.socketId = socketInfo.socketId;
            chrome.sockets.udp.onReceive.addListener(onReceive);
            chrome.sockets.udp.bind(_this.socketId, '0.0.0.0', 2425, function() {
                _this.sendBrEntryCommand();
            });
        });
    };

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
        return buf;
    };
    this.sendBrEntryCommand = function() {
        var command = new IPMessengerCommand();
        command.userName = this.myHost.hostName;
        command.hostName = this.myHost.userName;
        command.commandCode = command.commandCodes.IPMSG_BR_ENTRY;
        chrome.sockets.udp.send(this.socketId, strToSjisBuffer(command.toCommandStr()), '192.168.100.105', 2425, function(sendInfo){
            console.log('BR_ENTRY sent');
        });
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
    backend.initializeSocket();
    chrome.system.network.getNetworkInterfaces(function(interfaces){
        console.log(interfaces);
    });
});