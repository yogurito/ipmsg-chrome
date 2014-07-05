/* jshint unused:false */
/* jshint bitwise:false */
var IPMessengerCommand = function(message) {
  'use strict';
  this.version = 1;
  this.packetNumber = new Date().getTime();
  this.userName = '';
  this.hostName = '';
  this.commandCode = 0;
  this.appendix = '';

  if (message) {
    var arr = message.split(':');
    if (arr.length > 0) {
      this.version = Number(arr[0]);
    }
    if (arr.length > 1) {
      this.packetNumber = Number(arr[1]);
    }
    if (arr.length > 2) {
      this.userName = arr[2];
    }
    if (arr.length > 3) {
      this.hostName = arr[3];
    }
    if (arr.length > 4) {
      this.commandCode = Number(arr[4]);
      this.commandCode = this.commandCode >>> 0;
    }
    if (arr.length > 5) {
      this.appendix = arr.slice(5).join(':');
    }
  }

  IPMessengerCommand.prototype.commandCodes = {
    IPMSG_NOOPERATION: 0x00000000,

    IPMSG_BR_ENTRY: 0x00000001,
    IPMSG_BR_EXIT: 0x00000002,
    IPMSG_ANSENTRY: 0x00000003,
    IPMSG_BR_ABSENCE: 0x00000004,

    IPMSG_BR_ISGETLIST: 0x00000010,
    IPMSG_OKGETLIST: 0x00000011,
    IPMSG_GETLIST: 0x00000012,
    IPMSG_ANSLIST: 0x00000013,
    IPMSG_BR_ISGETLIST2: 0x00000018,

    IPMSG_SENDMSG: 0x00000020,
    IPMSG_RECVMSG: 0x00000021,
    IPMSG_READMSG: 0x00000030,
    IPMSG_DELMSG: 0x00000031,
    IPMSG_ANSREADMSG: 0x00000032,

    IPMSG_GETINFO: 0x00000040,
    IPMSG_SENDINFO: 0x00000041,

    IPMSG_GETABSENCEINFO: 0x00000050,
    IPMSG_SENDABSENCEINFO: 0x00000051,

    IPMSG_GETFILEDATA: 0x00000060,
    IPMSG_RELEASEFILES: 0x00000061,
    IPMSG_GETDIRFILES: 0x00000062,

    IPMSG_GETPUBKEY: 0x00000072,
    IPMSG_ANSPUBKEY: 0x00000073
  };

  IPMessengerCommand.prototype.optionCodes = {
    IPMSG_ABSENCEOPT: 0x00000100,
    IPMSG_SERVEROPT: 0x00000200,
    IPMSG_DIALUPOPT: 0x00010000,
    IPMSG_FILEATTACHOPT: 0x00200000,
    IPMSG_ENCRYPTOPT: 0x00400000,
    IPMSG_UTF8OPT: 0x00800000,
    IPMSG_CAPUTF8OPT: 0x01000000,
    IPMSG_ENCEXTMSGOPT: 0x04000000,
    IPMSG_CLIPBOARDOPT: 0x08000000
  };

  IPMessengerCommand.prototype.sendOptionCodes = {
    IPMSG_SENDCHECKOPT: 0x00000100,
    IPMSG_SECRETOPT: 0x00000200,
    IPMSG_BROADCASTOPT: 0x00000400,
    IPMSG_MULTICASTOPT: 0x00000800,
    IPMSG_AUTORETOPT: 0x00002000,
    IPMSG_RETRYOPT: 0x00004000,
    IPMSG_PASSWORDOPT: 0x00008000,
    IPMSG_NOLOGOPT: 0x00020000,
    IPMSG_NOADDLISTOPT: 0x00080000,
    IPMSG_READCHECKOPT: 0x00100000,
    IPMSG_SECRETEXOPT: 0x00100200,

    IPMSG_NOPOPUPOPTOBSOLT: 0x00001000,
    IPMSG_NEWMULTIOPTOBSOLT: 0x00040000,
    IPMSG_CHROME_VIDEOSDP_OFFER: 0x08000100,
    IPMSG_CHROME_VIDEOSDP_ANSWER: 0x08000200


    // IPMSG_RSA_512: 0x00000001,
    // IPMSG_RSA_1024: 0x00000002,
    // IPMSG_RSA_2048: 0x00000004,
    // IPMSG_RC2_40: 0x00001000,
    // IPMSG_BLOWFISH_128: 0x00020000,
    // IPMSG_AES_256: 0x00100000,
    // IPMSG_PACKETNO_IV: 0x00800000,
    // IPMSG_ENCODE_BASE64: 0x01000000,
    // IPMSG_SIGN_SHA1: 0x20000000,


    // IPMSG_RC2_40OLD: 0x00000010,
    // IPMSG_RC2_128OLD: 0x00000040,
    // IPMSG_BLOWFISH_128OLD: 0x00000400,
    // IPMSG_RC2_128OBSOLETE: 0x00004000,
    // IPMSG_RC2_256OBSOLETE: 0x00008000,
    // IPMSG_BLOWFISH_256OBSOL: 0x00040000,
    // IPMSG_AES_128OBSOLETE: 0x00080000,
    // IPMSG_SIGN_MD5OBSOLETE: 0x10000000,
    // IPMSG_UNAMEEXTOPTOBSOLT: 0x02000000,


    // IPMSG_FILE_REGULAR: 0x00000001,
    // IPMSG_FILE_DIR: 0x00000002,
    // IPMSG_FILE_RETPARENT: 0x00000003,
    // IPMSG_FILE_SYMLINK: 0x00000004,
    // IPMSG_FILE_CDEV: 0x00000005,
    // IPMSG_FILE_BDEV: 0x00000006,
    // IPMSG_FILE_FIFO: 0x00000007,
    // IPMSG_FILE_RESFORK: 0x00000010,
    // IPMSG_FILE_CLIPBOARD: 0x00000020,


    // IPMSG_FILE_RONLYOPT: 0x00000100,
    // IPMSG_FILE_HIDDENOPT: 0x00001000,
    // IPMSG_FILE_EXHIDDENOPT: 0x00002000,
    // IPMSG_FILE_ARCHIVEOPT: 0x00004000,
    // IPMSG_FILE_SYSTEMOPT: 0x00008000,


    // IPMSG_FILE_UID: 0x00000001,
    // IPMSG_FILE_USERNAME: 0x00000002,
    // IPMSG_FILE_GID: 0x00000003,
    // IPMSG_FILE_GROUPNAME: 0x00000004,
    // IPMSG_FILE_CLIPBOARDPOS: 0x00000008,
    // IPMSG_FILE_PERM: 0x00000010,
    // IPMSG_FILE_MAJORNO: 0x00000011,
    // IPMSG_FILE_MINORNO: 0x00000012,
    // IPMSG_FILE_CTIME: 0x00000013,
    // IPMSG_FILE_MTIME: 0x00000014,
    // IPMSG_FILE_ATIME: 0x00000015,
    // IPMSG_FILE_CREATETIME: 0x00000016,
    // IPMSG_FILE_CREATOR: 0x00000020,
    // IPMSG_FILE_FILETYPE: 0x00000021,
    // IPMSG_FILE_FINDERINFO: 0x00000022,
    // IPMSG_FILE_ACL: 0x00000030,
    // IPMSG_FILE_ALIASFNAME: 0x00000040,
  };

  this.getCommandName = function() {
    for (var commandName in this.commandCodes) {
      if (this.commandCodes[commandName] & this.commandCode) {
        return commandName;
      }
    }
    return null;
  };

  this.getOptions = function() {
    var options = [];
    for (var optionName in this.optionCodes) {
      if (this.optionCodes[optionName] & (this.commandCode << 8)) {
        options.push(optionName);
      }
    }
    for (var sendOptionName in this.sendOptionCodes) {
      if (this.sendOptionCodes[sendOptionName] & (this.commandCode << 8)) {
        options.push(sendOptionName);
      }
    }
    return options;
  };

  this.toCommandStr = function() {
    return [this.version, this.packetNumber, this.userName, this.hostName, this.commandCode, this.appendix].join(':');
  };
};

var strToSjisBuffer = function(str) {
  'use strict';
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
