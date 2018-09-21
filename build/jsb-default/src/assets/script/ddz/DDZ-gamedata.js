var GameDataDDZ = GameDataDDZ || {};
GameDataDDZ.init = function () {
    GameDataDDZ.initCreateRoomOpts();
    GameDataDDZ.initRoomData();
    pokerDDZRegistMsg();
}
GameDataDDZ.initRoomData = function () {
  GameDataDDZ.log = '';
  GameDataDDZ.room = {};
  GameDataDDZ.allScores = {};
  GameDataDDZ.roomsummaryData = {};
  GameDataDDZ.recordInfo = [];
  GameDataDDZ.currJiaofenPlayerData = {};
  GameDataDDZ.gameStartData = {};
  GameDataDDZ.currObtainPlayerData = {};
  GameDataDDZ.lastDisPokerUid = 0;
  GameDataDDZ.connectDisCard = {};
  GameDataDDZ.tiFlag = false;
  GameDataDDZ.deal = false;
  GameDataDDZ.curWatchData = {};
  GameDataDDZ.kicking = {};
  GameDataDDZ.deputeInfo = {};
  GameDataDDZ.initGameData();

  //房间状态
  GameDataDDZ.roomStatus = {
    JIAOFEN: 4,   //叫分中
    TICHUAI: 5    //踢踹中
  }
}
GameDataDDZ.initGameData = function () {
  GameDataDDZ.handCardSize = 17;
  GameDataDDZ.game = {
    roundType: 0,
    roundNum: 0,
    roundmax: 0,
    turn: 0,
    lastdisUid: 0,
    lastdisCard: 0,
    winnerUid: 0,
    dizhuUid: 0,
    gangOver: 0,
    gameStart: false,
    gameStartDizhu: false,
    initcards: false,
    onRoomDissolve: {},
    onRoomDissolveResult: {},
    onRoomDisbandTimer: {},
    onRoomReadyInfo: {},
    isJiaofenAgain: false,
  };
  GameDataDDZ.cards = {};
  GameDataDDZ.resultData = {};
}
GameDataDDZ.initCreateRoomOpts = function () {
  var data = cc.sys.localStorage.getItem('DDZcreateRoomOpts');
  if (data != null) {
    GameDataDDZ.createRoomOpts = JSON.parse(data);
    return;
  }
  GameDataDDZ.createRoomOpts = {};

  GameDataDDZ.createRoomOpts.playType = 0;  //玩法类型
  GameDataDDZ.createRoomOpts.roundType = 1; //对局类型
  GameDataDDZ.createRoomOpts.roundMax = 6;  //最大局数
  GameDataDDZ.createRoomOpts.fanshu = 2;    //最大番数
  GameDataDDZ.createRoomOpts.costType = 1;  //付費類型
  GameDataDDZ.createRoomOpts.times = 1;     //倍数
  GameDataDDZ.createRoomOpts.score = 1;     //进入条件
  GameDataDDZ.createRoomOpts.jiaofenType = 1;
  GameDataDDZ.createRoomOpts.fullMark = true; //两个王或4个2叫满
  GameDataDDZ.createRoomOpts.suppress = true; //憋三家
  GameDataDDZ.createRoomOpts.detain = 0;
  GameDataDDZ.createRoomOpts.kicking = true; //踢踹
  GameDataDDZ.createRoomOpts.fourFlag = true; //四带2
}
GameDataDDZ.saveCreateRoomOpts = function () {
  if (GameDataDDZ.createRoomOpts == null || GameDataDDZ.createRoomOpts == undefined) {
    return;
  }
  cc.sys.localStorage.setItem('DDZcreateRoomOpts', JSON.stringify(GameDataDDZ.createRoomOpts));
}
// GameDataDDZ.getCardHand = function(uid) {
//   if (uid == GameData.player.uid) {
//     return GameData.player.cards;
//   }
//   return 0;
// }
GameDataDDZ.getJiaofenNum = function (uid) {
  GameDataDDZ.cards[uid] === undefined ? GameDataDDZ.cards[uid] = {} : null;
  return GameDataDDZ.cards[uid]['jiaofenNum'];
}

GameDataDDZ.getDisPoker = function (uid) {
    GameDataDDZ.cards[uid] === undefined ? GameDataDDZ.cards[uid] = {} : null;
  return GameDataDDZ.cards[uid]['discards'];
}

GameDataDDZ.getHandCards = function (uid) {
    GameDataDDZ.cards[uid] === undefined ? GameDataDDZ.cards[uid] = {} : null;
  return GameDataDDZ.cards[uid]['hand'];
}

GameDataDDZ.getMyHandCards = function () {
    GameDataDDZ.cards[GameData.player.uid] === undefined ? GameDataDDZ.cards[GameData.player.uid] = {} : null;
  return GameDataDDZ.cards[GameData.player.uid]['hand'];
}

GameDataDDZ.getHandCardNum = function (uid) {
    GameDataDDZ.cards[uid] === undefined ? GameDataDDZ.cards[uid] = {} : null;
  return GameDataDDZ.cards[uid]['handnum'];
}

GameDataDDZ.setPosition = function () {
  GameData.tablePos = {};
  var order;
  var index = GameData.getPlayerIndex(GameData.player.uid);

  if (GameData.room.opts == undefined)
  {
    return;
  }

  if (GameData.room.opts.joinermax == 4) {
    if (index == 0) order = ['down', 'right', 'up', 'left'];
    else if (index == 1) order = ['left', 'down', 'right', 'up'];
    else if (index == 2) order = ['up', 'left', 'down', 'right'];
    else if (index == 3) order = ['right', 'up', 'left', 'down'];
    for (var i = 0; i < GameData.joiners.length; i++) {
      if (GameData.joiners[i]) {
        GameData.tablePos[GameData.joiners[i].uid] = order[i];
      }
    }
  } else if (GameData.room.opts.joinermax == 3) {
    if (index == 0) order = ['down', 'right', 'left'];
    else if (index == 1) order = ['left', 'down', 'right'];
    else if (index == 2) order = ['right', 'left', 'down'];
    for (var i = 0; i < GameData.joiners.length; i++) {
      if (GameData.joiners[i]) {
        GameData.tablePos[GameData.joiners[i].uid] = order[i];
      }
    }
  } else if (GameData.room.opts.joinermax == 2) {
    if (index == 0) order = ['down', 'up'];
    else if (index == 1) order = ['up', 'down'];
    for (var i = 0; i < GameData.joiners.length; i++) {
      if (GameData.joiners[i]) {
        GameData.tablePos[GameData.joiners[i].uid] = order[i];
      }
    }
  }
  cc.log('table pos:' + JSON.stringify(GameData.tablePos));
}

GameDataDDZ.getPosByUid = function(uid) {
  return GameData.tablePos[uid];
}

GameDataDDZ.isEmptyObject = function(object) {
  for (var key in object) {
    return false;
  }
  return true;
}

GameDataDDZ.clearObject = function(object) {
  for (var key in object) {
    delete object[key];
  }
  if (GameDataDDZ.isEmptyObject(object)) return true;
  return false;
}

GameDataDDZ.objectLen = function(object) {
  var len = 0;
  for (var key in object) {
    len++;
  }
  return len;
}

function pokerDDZRegistMsg() {

  GameNet.getInstance().setCallBack('ddz-onGameInfo', function (data) {
    GameDataDDZ.game.initcards = true;
    GameDataDDZ.deal = false;

    sendEvent('ddz-onGameInfo', data);
  });
  GameNet.getInstance().setCallBack('ddz-initCardHandNum', function (data) {
    GameDataDDZ.cards[data.uid] = (GameDataDDZ.cards[data.uid] === undefined) ? {} : GameDataDDZ.cards[data.uid];
    GameDataDDZ.cards[data.uid]['handnum'] = data.num;

    sendEvent('ddz-initCardHandNum');
  });

  GameNet.getInstance().setCallBack('ddz-initCardHand', function (data) {
    GameDataDDZ.cards[data.uid] = (GameDataDDZ.cards[data.uid] === undefined) ? {} : GameDataDDZ.cards[data.uid];
    GameDataDDZ.cards[data.uid]['hand'] = data.hand;

    sendEvent('ddz-initCardHand');
  });
  GameNet.getInstance().setCallBack('ddz-onReady', function (data) {
    sendEvent('ddz-onReady');
  });
  GameNet.getInstance().setCallBack('ddz-onGameStart', function (data) {
    GameDataDDZ.initGameData();
    GameDataDDZ.game.gameStart = true;
    GameDataDDZ.deal = true;

    sendEvent('ddz-onGameStart');
  });
  GameNet.getInstance().setCallBack('ddz-deputeInfo', function (data) {
    GameDataDDZ.deputeInfo = data.deputeInfo;

    sendEvent('ddz-deputeInfo');
  });
  GameNet.getInstance().setCallBack('ddz-startChuai', function (data) {
    GameDataDDZ.tiFlag = true;

    sendEvent('ddz-startTi', data);
  });
  GameNet.getInstance().setCallBack('ddz-startTi', function (data) {
    GameDataDDZ.tiFlag = true;

    sendEvent('ddz-startTi', data);
  });
  GameNet.getInstance().setCallBack('ddz-showWatch', function (data) {
    GameDataDDZ.curWatchData = data;

    sendEvent('ddz-showWatch', data);
  });
  GameNet.getInstance().setCallBack('ddz-showKicking', function (data) {
    GameDataDDZ.kicking = data;

    sendEvent('ddz-showKicking', data);
  });
  GameNet.getInstance().setCallBack('ddz-onGameScore', function (data) {
    GameDataDDZ.resultData = data;
    GameDataDDZ.game.gameStart = false;
    GameDataDDZ.tiFlag = false;

    sendEvent('ddz-onGameScore', data);
  });
  GameNet.getInstance().setCallBack('ddz-onGameAllScore', function (data) {
    GameDataDDZ.allScores = data.score;
    GameDataDDZ.roomsummaryData = data;

    sendEvent('ddz-onGameAllScore', data);
  });
  GameNet.getInstance().setCallBack('ddz-onFirstJiaoFen', function (data) {
    GameDataDDZ.game.isJiaofenAgain = data.flag;
    GameDataDDZ.currJiaofenPlayerData = data;

    sendEvent('ddz-onJiaoFen', data);
  });
  GameNet.getInstance().setCallBack('ddz-nextJiaoFen', function (data) {
    for (var key in data.allJiaoFen) {
      GameDataDDZ.cards[key]['jiaofenNum'] = data.allJiaoFen[key];
    }
    GameDataDDZ.currJiaofenPlayerData = data;

    sendEvent('ddz-onJiaoFen', data);
  });
  //重连
  GameNet.getInstance().setCallBack('ddz-reconnectionInfo', function (data) {
    if (data.type == 'jiaofen') {
      GameDataDDZ.currJiaofenPlayerData = data;
      for (var key in data.allJiaoFen) {
        GameDataDDZ.cards[key]['jiaofenNum'] = data.allJiaoFen[key];
      }
    }
    sendEvent('ddz-reconnectionInfo');
  });
  GameNet.getInstance().setCallBack('ddz-onDiZhu', function (data) {
    GameDataDDZ.game.dizhuUid = data.dizhuUid;
    GameDataDDZ.game.flag = data.flag;
    GameDataDDZ.gameStartData = data;
    GameDataDDZ.game.gameStartDizhu = true;

    sendEvent('ddz-onDiZhu', data);
  });
  GameNet.getInstance().setCallBack('ddz-disCardUid', function (data) {
    GameDataDDZ.currObtainPlayerData = data;

    sendEvent('ddz-onShowObtainNode', data);
  });
  GameNet.getInstance().setCallBack('ddz-showDisPoker', function (data) {
    GameDataDDZ.cards[data.uid] = (GameDataDDZ.cards[data.uid] === undefined) ? {} : GameDataDDZ.cards[data.uid];
    GameDataDDZ.cards[data.uid]['discards'] = data.cards;
    GameDataDDZ.connectDisCard[data.uid] = data.cards;

    sendEvent('ddz-showDisPoker', data);
  });
  GameNet.getInstance().setCallBack('ddz-initCardHands', function (data) {
    GameDataDDZ.cards[data.uid] = (GameDataDDZ.cards[data.uid] === undefined) ? {} : GameDataDDZ.cards[data.uid];
    GameDataDDZ.cards[data.uid]['hand'] = data.hand;

    sendEvent('ddz-initCardHands', data);
  });
  GameNet.getInstance().setCallBack('ddz-onDiscardType', function (data) {
    GameDataDDZ.lastDisPokerUid = data.uid;

    sendEvent('ddz-onDiscardType', data);
  });
  GameNet.getInstance().setCallBack('ddz-jiaoFencb', function (data) {
    if(data.num == 3){
      GameDataDDZ.cards[data.uid] === undefined ? GameDataDDZ.cards[data.uid] = {} : null;
      GameDataDDZ.cards[data.uid]['jiaofenNum'] = 3;
    }
    sendEvent('ddz-jiaoFencb', data);
  });
  GameNet.getInstance().setCallBack('ddz-passcb', function (data) {
    GameDataDDZ.cards[data.uid]['discards'] = data.cards;
    GameDataDDZ.cards[data.nextUid]['discards'] = data.nextCards;

    sendEvent('ddz-passcb', data);
  });
  GameNet.getInstance().setCallBack('ddz-hintCard', function (data) {
    sendEvent('ddz-hintCard', data);
  });
  GameNet.getInstance().setCallBack('ddz-BackTable', function (data) {
    GameDataDDZ.game.initcards = true;
    //sendEvent('ddz-BackTable');
  });
}