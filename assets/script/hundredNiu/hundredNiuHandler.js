var roomHandler = require('roomHandler');
var niuniuPokerHandler = require('niuniuPokerHandler');
var hundredNiuHandler = {
    status: 0,
	gameTimes: 0,		  //倒计时时间
	isStartAnimationPlayed: false,
	readyLabelActive: false,
	
	zhuangUid: 0,
	zhuangInfo: {},
	lianzhuangNum: 0,	
	chipsList: [],
	playerInfo: [],		//玩家信息
	guideId: 0,
	guideInfo: {},		//神算子数据

	pokerCards: [],      //扑克数据
	pokerCards3: [],	//牌型组合
	pokerType: [],		//扑克牌型
	pokerResult: [],	//扑克输赢
	betPosPlayer: [],

	isFlyChipsAndCoin: false,
	//筹码数量
	selfChipsNum: {0:0,1:0,2:0,3:0},

	zhuangPlayers: {
        "uid": 0,
        "name": "系统庄",
        "sex": 2,
        "headimgurl": "http://47.104.25.227/bots_head/24.png",
    },
};

module.exports = hundredNiuHandler;

hundredNiuHandler.initHundredData = function (argument) {
	this.status = 0;
	this.gameTimes = 0;		  //倒计时时间
	this.isStartAnimationPlayed = false;
	this.readyLabelActive = false;
	
	this.zhuangUid = 0;
	this.zhuangInfo = {};
	this.lianzhuangNum = 0;	
	this.chipsList = [];
	this.playerInfo = [];		//玩家信息
	this.guideId = 0;
	this.guideInfo = {};		//神算子数据

	this.pokerCards = [];      //扑克数据
	this.pokerCards3 = [];	//牌型组合
	this.pokerType = [];		//扑克牌型
	this.pokerResult = [];	//扑克输赢
	this.betPosPlayer = [];

	this.isFlyChipsAndCoin = false;
	//筹码数量
	this.selfChipsNum = {0:0,1:0,2:0,3:0};
};
hundredNiuHandler.getPlayerPosByUid = function (userid) {
	if (userid == GameData.player.uid && userid != this.zhuangUid) {
    	return 0;
    }else {
		var isOnDesk = hundredNiuHandler.containsArray(this.playerInfo,userid);
		if (isOnDesk) {
			for (var i = 0; i < this.playerInfo.length; i++) {
				var player = this.playerInfo[i];
				if (player && player.uid == userid) {
					return i+1;
				}
			}
		}else {
			return -1;
		}
    }
};

hundredNiuHandler.getRoundCoinByUid = function (userid) {
	var roundCoin = roomHandler.coinData.coin;
	if (roundCoin.length <= 0) return null;
	var sign = hundredNiuHandler.containsArray(roundCoin, userid);
	if (sign) {
		for (var i = 0; i < roundCoin.length; i++) {
			var player = roundCoin[i];
			if (player && player.uid == userid) {
				return player.score;
			}
		}
	}else {
		return null;
	}
};

hundredNiuHandler.getPlayerInfoByUid = function (userid) {
	if (userid == GameData.player.uid) {
    	return GameData.player;
    }else {
		var isOnDesk = hundredNiuHandler.containsArray(this.playerInfo,userid);
		if (isOnDesk) {
			for (var i = 0; i < this.playerInfo.length; i++) {
				var player = this.playerInfo[i];
				if (player && player.uid == userid) {
					return player;
				}
			}
		}else {
			return null;
		}
    }
};

hundredNiuHandler.containsArray = function(arr, obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] && arr[i].uid == obj) {
            return true;
        }
    }
    return false;
};

hundredNiuHandler.getselfChipsSum = function () {
	var sum = 0;
	for (var key in this.selfChipsNum) {
		sum += this.selfChipsNum[key];
	}
	return sum;
};
/*---------------------------++++++++++++++++++++----------------------------------*/
/*--------------------------- Request And Regist ----------------------------------*/
/*---------------------------++++++++++++++++++++----------------------------------*/

//下注
hundredNiuHandler.requestSetChips = function (chipNum, chipsLocal, interac) {
	var self = this;
	var chips = {num: chipNum, idx: chipsLocal};
    GameNet.getInstance().request('room.niuHundredHandler.setChips',chips , function(rtn) {
    	var niuniuErrorType = niuniuPokerHandler.ERRORTYPE;
		if (!rtn || rtn.result == undefined || rtn.result == 1) {
			return;
		};
		if (rtn.result != niuniuErrorType.SUCCESSE) {
			var errorLb = '';
			switch(rtn.result){
				case niuniuErrorType.Niu100_Chips_Zhuang: errorLb = '庄家无法下注'; break;
				case niuniuErrorType.Niu100_Chips_State:
				case 1:
					errorLb = '等候下一局下注'; 
				break;
				case niuniuErrorType.Niu100_Chips_Continue: errorLb = '上一局无下注记录'; break;
				case niuniuErrorType.Niu100_Chips_PlayerMax: errorLb = '已超过自身下注上限'; break;
				case niuniuErrorType.Niu100_Chips_ZhuangMax: errorLb = '已超过四门下注上限'; break;
			};
			if (errorLb == '已超过自身下注上限' && interac) {
				return;
			} else {
				niuniuCreateMoveMessage(errorLb);	
			}
		}
    });
};
//续压
hundredNiuHandler.requestContinueChips = function () {
	GameNet.getInstance().request('room.niuHundredHandler.continueChips', {}, function(rtn) {
		var niuniuErrorType = niuniuPokerHandler.ERRORTYPE;
		if (!rtn || rtn.result == undefined) {
			return;
		};
		if (rtn.result != niuniuErrorType.SUCCESSE) {
			var errorLb = '';
			switch(rtn.result){
				case niuniuErrorType.Niu100_Chips_Zhuang: errorLb = '庄家无法下注'; break;
				case niuniuErrorType.Niu100_Chips_State:
				case 1:
				 	errorLb = '等候下一局下注'; 
				break;
				case niuniuErrorType.Niu100_Chips_Continue: errorLb = '上一局无下注记录'; break;
				case niuniuErrorType.Niu100_Chips_PlayerMax: errorLb = '已超过自身下注上限'; break;
				case niuniuErrorType.Niu100_Chips_ZhuangMax: errorLb = '已超过四门下注上限'; break;
			};
			niuniuCreateMoveMessage(errorLb);
		}
	});
};
//无限续
hundredNiuHandler.requestAlwaysChips = function (isClick) {
	GameNet.getInstance().request('room.niuHundredHandler.alwaysChips',function(rtn) {});
};
hundredNiuHandler.registMessage = function() {
	var self = this;
    GameNet.getInstance().setCallBack('niuhun-onGameStart', function (data) {
		self.playerInfo = [];
		if (data.zhuang != null) {
			if (data.zhuang.player != null) {
				self.playerInfo.push(data.zhuang.player);
				self.zhuangUid = data.zhuang.player.uid;
				self.zhuangInfo = data.zhuang.player;
				self.lianzhuangNum = data.zhuang.count;
			}else {
				self.playerInfo.push(self.zhuangPlayers);
				self.zhuangInfo = self.zhuangPlayers;
				self.zhuangUid = self.zhuangPlayers.uid;
			}
			
		}
		if (data.players) {
			for (var i = 0; i < data.players.length; i++) {
				self.playerInfo.push(data.players[i]);
			}
		}
		if (data.guide) {
			if (data.guide.player != null) {
				self.guideId = data.guide.player.uid;
			} else {
				self.guideId = 0;
			}
			self.guideInfo = data.guide;
			self.playerInfo.push(data.guide.player);
		}
		sendEvent('niuhun-onGameStart',data);
	});
	GameNet.getInstance().setCallBack('niuhun-onBaoZhuang', function (data) {
		sendEvent('niuhun-onBaoZhuang');
	});
	GameNet.getInstance().setCallBack('niuhun-onGameEnd', function (data) {
		self.isFlyChipsAndCoin = true;
		self.selfChipsNum = {0:0,1:0,2:0,3:0},
		sendEvent('niuhun-onGameEnd',data);
	});
	GameNet.getInstance().setCallBack('niuhun-onGameInfo', function (data) {

		self.status = data.status;
		self.gameTimes = data.timer;
		self.chipsList = data.chips;

		sendEvent('niuhun-onGameInfo', data);
	});
	GameNet.getInstance().setCallBack('niuhun-onCardInfo', function (data) {

		self.pokerType = [];
		self.pokerCards = [];
		self.pokerCards3 = [];
		self.pokerResult = [];
		self.betPosPlayer = [];
		
		self.pokerType.push(data.zhuang.type);
		self.pokerCards.push(data.zhuang.cards);
		self.pokerCards3.push(data.zhuang.card3);

		for (var i = 0; i < data.xian.length; i++) {
			self.pokerType.push(data.xian[i].type);
			self.pokerCards.push(data.xian[i].cards);
			self.pokerCards3.push(data.xian[i].card3);
		}

		self.pokerResult = data.result; 
		self.betPosPlayer = data.xianChips;

		sendEvent('niuhun-onCardInfo', data);
	});
	GameNet.getInstance().setCallBack('niuhun-onGameChips', function (data) {
		var index = data.idx;
		var selfNum = data.all;
		var allNum = data.total;
		var userId = data.uid;
		for (var key in self.selfChipsNum) {
			if (key == index && userId == GameData.player.uid) {
				self.selfChipsNum[key] = selfNum;
			}
		}
		sendEvent('niuhun-onGameChips', data);
	});
	GameNet.getInstance().setCallBack('niuhun-onChipsInfo', function (data) {
		
	});
	GameNet.getInstance().setCallBack('niuhun-onZhuangCoin', function (data) {
		sendEvent('niuhun-onZhuangCoin', data);
	});
};