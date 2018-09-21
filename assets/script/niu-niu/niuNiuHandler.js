var roomHandler = require('roomHandler');
var niuNiuHandler = {
	isStartAnimationPlayed: false,
	isSelfClickAdviseBtn: false,
	status: 0,
	zhuangUid: 0,
	gameTimes: 0,		  //倒计时时间
	gameStart: false,
	readyBtnActive: false,
	playerCards: {},      //玩家手牌
	playerCard3: {},      //牌型组合
	playerScore: {},      //当局分数
	playerChips: {},	  //下注
	playerZhuang: {},     //是否选庄
	playerSendCard: {},	  //是否出牌
	recordType: {},		  //提示牌型
};

module.exports = niuNiuHandler;
niuNiuHandler.initAllData = function () {
	this.isStartAnimationPlayed = false;
	this.isSelfClickAdviseBtn = false;
	this.status = 0;
	this.zhuangUid = 0;
	this.gameTimes = 0;
	this.gameStart = false;
	this.readyBtnActive = false;
	this.playerCards = {};
	this.playerCard3 = {};
	this.playerScore = {};
	this.playerChips = {};
	this.playerZhuang = {};
	this.playerSendCard = {};
	this.recordType = {};
};
niuNiuHandler.initRoundData = function () {
	this.zhuangUid = 0;
	this.playerCards = {};      //玩家手牌
	this.playerCard3 = {};      //牌型组合
	this.playerScore = {};      //当局分数
	this.playerChips = {};	  //下注
	this.playerZhuang = {};     //是否选庄
	this.playerSendCard = {};	  //是否出牌
	this.recordType = {};		  //提示牌型
	this.readyBtnActive = false,
	this.isSelfClickAdviseBtn = false;
};
//判断是否是旁观者
niuNiuHandler.spectator = function (uid) {
	var index = true;
	for (var userId in this.playerScore) {
		if (userId == uid) {
			index = false;
			break;
		}
	}

	return index;
};
niuNiuHandler.setTexture = function(url, node) {
    var texture2D;
    if (url == null || url.length == 0 || url == undefined)
    {
        var spriteComponent;
        if (node.getComponent(cc.Sprite))
        {
            spriteComponent = node.getComponent(cc.Sprite);
            spriteComponent.spriteFrame = null;
        }
    }
    else
    {
        var textureUrl = cc.url.raw(url);
        if (textureUrl)
        {
            texture2D = cc.textureCache.addImage(textureUrl);
        }
        var spriteComponent;
        if (node.getComponent(cc.Sprite))
        {
            spriteComponent = node.getComponent(cc.Sprite);
            spriteComponent.spriteFrame = new cc.SpriteFrame(texture2D);
        }
    }
},
niuNiuHandler.randomNum = function (min, max) {
    var distance = max - min;
    var num = Math.random() * distance + min;
    return num;
},

//获取最大抢庄倍数
niuNiuHandler.getZhuangMax = function () {
	var maxScore = [];
    for (var key in this.playerZhuang) {
        maxScore.push(parseInt(this.playerZhuang[key], 10));
    }
    var index = 0;
    for (var i = 1; i < maxScore.length; i++) {
        if (maxScore[i] && maxScore[i] > maxScore[index]) {
            index = i;
        }
    }
    return maxScore[index];
};
//获取最大抢庄人数
niuNiuHandler.getZhuangMaxArray = function(){
	var maxZhuang = this.getZhuangMax();
	var zhuangArray = [];
	for (var key in this.playerZhuang) {
        if (parseInt(this.playerZhuang[key], 10) === maxZhuang) {
        	zhuangArray.push(key);
        }
    }
    return zhuangArray;
};
niuNiuHandler.requestZhuang = function(zhuangNum) {
    var self = this;
    var data = {num: zhuangNum};
    GameNet.getInstance().request('room.niuNiuHandler.setZhuang', data, function(rtn) {});
};

niuNiuHandler.requestStart = function () {
	var self = this;
    GameNet.getInstance().request('room.niuNiuHandler.setStart', {}, function(rtn) {
    	if (rtn.result == 0) {
    		return 0;
    	}
    });
};
niuNiuHandler.requestChips = function (chipNum) {
	var self = this;
	var chips = {num: chipNum};
    GameNet.getInstance().request('room.niuNiuHandler.setChips', chips, function(rtn) {

    });
};
niuNiuHandler.requestSend = function () {
	var self = this;
    GameNet.getInstance().request('room.niuNiuHandler.setShow', {}, function(rtn) {
    	
    });
}

niuNiuHandler.registMessage = function() {
	var self = this;

	GameNet.getInstance().setCallBack('douniu-onGameStart', function (data) {
		self.gameStart = true;
		// self.status = data.status;
		self.isStartAnimationPlayed = true;
		sendEvent('douniu-onGameStart', data);
	});

	GameNet.getInstance().setCallBack('douniu-onGameEnd', function (data) {
		self.status = 0;
		self.gameStart = false;
		sendEvent('douniu-onGameEnd', data);
	});

	GameNet.getInstance().setCallBack('douniu-onGameInfo', function (data) {
		self.status = data.status;
		self.zhuangUid = data.zhuangUid;
		self.playerZhuang = data.zhuangs;
		self.playerChips = data.chips;
		self.playerScore = data.score;
		self.playerSendCard = data.show;
		self.gameTimes = data.timer;
		sendEvent('douniu-onGameInfo', data);
	});

	GameNet.getInstance().setCallBack('douniu-onGameCards', function (data) {
		self.playerCards[data.uid] = data.cards;
		if (data.type == undefined) {}
		else{
			self.recordType[data.uid] = data.type;
		}
		if (data.card3) {
			self.playerCard3[data.uid] = data.card3;
		}
		cc.log('self.playerCards = '+JSON.stringify(self.playerCards));
		sendEvent('douniu-onGameCards', data);
	});

	GameNet.getInstance().setCallBack('douniu-onShowCards', function (data) {
		cc.log('douniu-onShowCards = '+JSON.stringify(data));
		sendEvent('douniu-onShowCards', data);
	});
};