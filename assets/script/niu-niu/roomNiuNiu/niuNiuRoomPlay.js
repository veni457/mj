    var soundMngr = require('SoundMngr');
    var roomHandler = require('roomHandler');
    var niuNiuHandler = require('niuNiuHandler');
    var gameDefine = require('gameDefine');
    var configMgr = require('configMgr');
    var niuniuPokerHandler = require('niuniuPokerHandler');
    cc.Class({
        extends: cc.Component,

        properties: {
            tableNode: {
                default: null,
                type: cc.Node
            },
            coinNode: {
                default: null,
                type: cc.Node
            },
            qiangzhuangNode: cc.Node,   //叫分节点
            multipleNode: cc.Node, // 下注的节点
            otherHandCardNode: cc.Node, // 其它玩家手牌的节点
            selfHandCardNode: cc.Node, // 自己的手牌 (已出和未出牌)
            adviseBtn: cc.Node, //提示按钮
            sendBtn: cc.Node,  //出牌按钮
            actionNode: cc.Node, // 动画节点

            selfPokerTypePrefab : cc.Prefab, //自己牌型
            otherPokerTypePrefab: cc.Prefab,
            betSp: cc.Sprite,//下注提示img
            pinNiuSp :cc.Sprite, //拼牛中img
            qiangzhuangSp: cc.Sprite, //抢庄imag

            playerHeads: [cc.Node],
            scoreNode: cc.Prefab,
            scoreParent: cc.Node,
            lastTimeLabel: cc.Label,
            debugBtn: cc.Node,
            spectatorNode: cc.Node,
            //随机庄节点
            randomNode: cc.Node,
            dingzhuangNode: cc.Node,
            winPlayerNode: cc.Node,
        },

        // use this for initialization
        onLoad: function () {
            this.debugBtn.active = configMgr.getSetCardsOpen();
            this.handlerMsg();
            this.coinFlyData();
            this.initNodeActive();
            this.getCardsPosition();
            
            this._selfHandCards = []; //自己的手牌
            this._selfHandCardInitialPos = []; //记录自己手牌界面里的位置
            var handCardNode = cc.find("/handCard",this.selfHandCardNode);
            for (var i = 0; i < handCardNode.childrenCount; i++) {
                this._selfHandCardInitialPos.push(handCardNode.children[i].getPosition())
            }
            this.initUI();
        },
        initNodeActive : function () {
            this.qiangzhuangSp.node.active = false;
            this.pinNiuSp.node.active = false;
            this.betSp.node.active = false;
            this.qiangzhuangNode.active = false;
            this.otherHandCardNode.active = false;
            this.selfHandCardNode.active = false
            this.multipleNode.active = false;
            this.adviseBtn.active = false;
            this.sendBtn.active = false;
            this.niuniuStayType = niuniuPokerHandler.getGameStatus();
            this.niuniuPokerType = niuniuPokerHandler.getPokerType();
        },
        getCardsPosition: function () {
            this.handCardsInitialPos = [];     //记录每个玩家出牌后手牌的位置
            for (var i = 0; i < this.otherHandCardNode.children.length; i++) {
                this.handCardsInitialPos.splice(i+1,0,this.otherHandCardNode.children[i].getPosition());
            }
            var selfcardNode = this.selfHandCardNode.getChildByName("handCardDis");
            this.handCardsInitialPos.splice(0,0,selfcardNode.getPosition());
        },
        //输赢金币相关
        coinFlyData: function () {
            this._coinIndex = 0;
            this._coinList = [];
            this._coinCount = 8;
            this._winnerIndex = 0;
            this._isLoserClear = true;
            this._isWinnerClear = true;
            this._winnerToLoser = {winner: [], loser: []}; //赢家列表,输家列表
        },
        // 初始化界面
        initUI: function () {
            this.playAudio = false;
            var self = this;
            var runInfo = GameData.room; //回合信息
            if (!runInfo || runInfo.id == "") {
                return;
            }

            var runState = runInfo.status;
            this.qiangzhuangNode.active = false;
            this.otherHandCardNode.active = false;
            this.selfHandCardNode.active = false;
            if (niuNiuHandler.isStartAnimationPlayed == true) {
                //是否播放过开出动画
                if (runState < gameDefine.RoomState.GAMEING && niuNiuHandler.status != this.niuniuStayType.SETTLE) {
                    this.handleGameStart();
                    return;
                }
                niuNiuHandler.isStartAnimationPlayed = false;
            }
            this.showHandCards();
            var niuNiustatus = niuNiuHandler.status;
            if (niuNiustatus < this.niuniuStayType.CHIPS) {
                this.showGetZhuangUI();
            }
            this.getGameInfo();
        },
        initPokerType: function () {
            var players = GameData.joiners;
            for (var j = 0; j < roomHandler.room.opts.joinermax; j++) {
                var pokerActNode = cc.find('/act' + j, this.actionNode);
                for (var i = 0; i < players.length; i++) {
                    if (players[i] == null){
                        var localIndex = roomHandler.getLocalPosition(i);
                        if (localIndex == j && pokerActNode) {
                            pokerActNode.removeAllChildren();
                        }
                    }else {
                        var userId = players[i].uid;
                        var localIndex = roomHandler.getLocalPosition(i);  
                        if (localIndex === j && niuNiuHandler.spectator(userId)) {
                            if (pokerActNode) {
                                pokerActNode.removeAllChildren();
                            }
                        }
                    } 
                }
                if (j >= players.length) {
                    if (pokerActNode) {
                        pokerActNode.removeAllChildren();
                    }
                }
            }
        },
        clearUI: function () {
            //庄标记
            this.zhuangId = 0;
            this.playAudio = false;
            this.isclick = undefined;
            this.showpokers = undefined;
            this.initNodeActive();
            if (this._coinList.length > 0) {
                for (var i = 0; i < this._coinList.length; i++) {
                    this._coinList[i].active = false;
                    this.tableNode.removeChild(this._coinList[i]);
                }    
            }
            this.coinFlyData();
            for (var i = 0; i < roomHandler.room.opts.joinermax; i++) {
                var pokerActNode = cc.find('/act' + i, this.actionNode);
                if (pokerActNode) {
                    pokerActNode.removeAllChildren();
                }
            }

            var players = GameData.joiners;
            for (var i = 0; i < players.length; i++) {
                if (players[i] == null) continue;
                var userId = players[i].uid;
                var localIndex = roomHandler.getLocalPosition(i);
                if (localIndex == 0) {
                    var handCardNode = this.selfHandCardNode.getChildByName("handCardDis");
                    for (var j = 0; j < handCardNode.children.length; j++) {
                        var pokerScp = handCardNode.children[j].getComponent("niuNiuPoker");
                        pokerScp.initUI();
                    }
                    continue;
                }
                var handCardNode = this.otherHandCardNode.getChildByName("handCard"+localIndex);
                for (var j = 0; j < handCardNode.children.length; j++) {
                    var pokerScp = handCardNode.children[j].getComponent("niuNiuPoker");
                    pokerScp.initUI();
                }
            }
            niuNiuHandler.initRoundData();
            this.unschedule(this.loserCoinAnimation);
            this.unschedule(this.winnerAllIsPlayer);
        },
        
        //获取游戏状态
        getGameInfo: function () {
            this.handleGameStart();
            var niuNiustatus = niuNiuHandler.status;
            var randomZhuang = [];
            if (niuNiustatus > this.niuniuStayType.WAIT && niuNiustatus <= this.niuniuStayType.SETTLE) {
                if (niuNiustatus > this.niuniuStayType.ZHUANG) {
                    randomZhuang = niuNiuHandler.getZhuangMaxArray();
                    if (this.zhuangId!= niuNiuHandler.zhuangUid && niuNiustatus == this.niuniuStayType.CHIPS) {
                        if (randomZhuang.length >= 2) {
                            this.randomZhuangUI(randomZhuang);
                        } else {
                            this.dingzhuangAnimation();
                            this.showBetUI();
                            this.zhuangId = niuNiuHandler.zhuangUid;
                        }
                    } else {
                        this.showBetUI();
                    }
                    if (niuNiustatus >= this.niuniuStayType.COMPARE) {
                        this.showDisCardUI();
                    }
                    this.showGetZhuangUI();
                }
                this.showHandCards();
            }
            this.statusSign = niuNiuHandler.status;
            this.showHintImg();
        },
        handleGameStart : function () {
            if (this.statusSign != niuNiuHandler.status && niuNiuHandler.status == this.niuniuStayType.ZHUANG) {
                // 播放开场动画
                soundMngr.instance.playNiuNiuAudio(-1);
                this.actionNode.active = true;
                var starActNode = cc.find('/actGameStart',this.actionNode);
                starActNode.active = true;
                var anim = starActNode.getComponent(dragonBones.ArmatureDisplay);
                anim.playAnimation('newAnimation',1);

                var handCardNode = cc.find("/handCard",this.selfHandCardNode);
                for (var i = 0; i < handCardNode.childrenCount; i++) {
                    handCardNode.children[i].position = this._selfHandCardInitialPos[i];
                }
                var self = this;
                this.scheduleOnce(function(){
                    starActNode.active = false;
                    self.initUI();
                },1.5);
            }
        },
        //随机庄过程
        randomZhuangUI: function (randomZhuang) {
            this.zhuangId = niuNiuHandler.zhuangUid;
            this.zhuangPos = []; 
            for (var i = 0; i < randomZhuang.length; i++) {
                var userid = randomZhuang[i];
                var index = roomHandler.getPlayerPosByUid(userid);
                var localIndex = roomHandler.getLocalPosition(index);
                var player = this.playerHeads[localIndex];
                if (player == null) continue;
                this.zhuangPos.splice(localIndex,0,{
                    uid: userid,
                    pos: player.getPosition()
                });
            }
            for (var j = 0; j < this.zhuangPos.length; j++) {
                if (this.zhuangPos[j] == null || this.zhuangPos[j] == undefined) {
                    this.zhuangPos.splice(j,1);
                    j --;
                }
            }
            this.makeSureZhuangTimer(); 
        },
        makeSureZhuangTimer: function () {
            this.surplus = 1;
            this.zhuangSign = 0;
            this.updateRandomZhuangPos();
            this.schedule(this.updateRandomZhuangPos,0.09);
        },
        updateRandomZhuangPos: function () {
            this.surplus -= 0.09;
            this.randomNode.active = true;
            soundMngr.instance.playNiuNiuAudio(-6);
            var uId = this.zhuangPos[this.zhuangSign].uid;
            var index = roomHandler.getPlayerPosByUid(uId);
            var localIndex = roomHandler.getLocalPosition(index);
            var positions = this.zhuangPos[this.zhuangSign].pos;
            this.randomNode.x = positions.x;
            this.randomNode.y = positions.y;
            if (localIndex == 0) {
                this.randomNode.scaleX = 1;
                this.randomNode.scaleY = 1;
            } else {
                this.randomNode.scaleX = 0.62;
                this.randomNode.scaleY = 0.62;
            }
            this.zhuangSign ++;
            if (this.zhuangSign >= this.zhuangPos.length) {
                this.zhuangSign = 0;
            }
            if (this.surplus <= 0) {
                this.randomNode.x = positions.x;
                this.randomNode.y = positions.y;
                this.randomNode.active = false;
                this.zhuangSign = 0;
                this.dingzhuangAnimation();
                this.showBetUI();
                this.unschedule(this.updateRandomZhuangPos);
            }
        },
        dingzhuangAnimation: function () {
            var index = roomHandler.getPlayerPosByUid(niuNiuHandler.zhuangUid);
            var localIndex = roomHandler.getLocalPosition(index);
            
            soundMngr.instance.playNiuNiuAudio(-7);
            var headNode = this.playerHeads[localIndex];
            this.dingzhuangNode.position = headNode.getPosition();
            if (localIndex == 0) {
                this.dingzhuangNode.scale = 1;
            } else {
                this.dingzhuangNode.scale = 0.62;
            }
            var zhuangSign = cc.find('zhuangAc', this.dingzhuangNode);
            this.dingzhuangNode.active = true;
            var anim1 = this.dingzhuangNode.getComponent(dragonBones.ArmatureDisplay);
            anim1.playAnimation('newAnimation',0);
            var anim2 = zhuangSign.getComponent(dragonBones.ArmatureDisplay);
            anim2.playAnimation('newAnimation',1);
            var self = this;
            this.scheduleOnce(function(){
                self.dingzhuangNode.active = false;
                self.showZhuangUI();
            },1.5);
        },
        //显示庄家
        showZhuangUI: function () {
            this.clearZhuangUI();
            var players = GameData.joiners;
            for (var j = 0; j < players.length; j++) {
                var player = players[j];
                if (player != null){
                    var localIndex = roomHandler.getLocalPosition(j);
                    var headNode = this.playerHeads[localIndex].getChildByName("TableNiuNiuPlayerTemplate");
                    var playerHeadScp = headNode.getComponent("niuNiuPlayerInfo");

                    var zhuang = (player.uid == niuNiuHandler.zhuangUid);
                    playerHeadScp.showZhuang(zhuang);
                    playerHeadScp.getLiuGuang(zhuang);

                    var zhuangNode = this.playerHeads[localIndex].getChildByName("numQiang");
                    if (niuNiuHandler.status > this.niuniuStayType.ZHUANG && niuNiuHandler.zhuangUid != player.uid) {
                        for (var i = 0; i < zhuangNode.childrenCount; i++) {
                            zhuangNode.children[i].active = false;
                        }
                    }
                }
            }
        },
        clearZhuangUI: function () {
            for (var j = 0; j < this.playerHeads.length; j++) {
                var headNode = this.playerHeads[j].getChildByName("TableNiuNiuPlayerTemplate");
                var playerHeadScp = headNode.getComponent("niuNiuPlayerInfo");
                playerHeadScp.showZhuang(false);
                playerHeadScp.getLiuGuang(false);
            }
        },
        //显示抢庄阶段界面
        showGetZhuangUI: function () {
            for (var i = 0; i < this.qiangzhuangNode.childrenCount; i++) {
                var button = this.qiangzhuangNode.children[i].getComponent('cc.Button');
                button.interactable = true;
            }
            //金币场判断是否满足下注条件
            if (roomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
                var coinNumber = roomHandler.getPlayerByUid(GameData.player.uid).coin;
                for (var j = 0; j < this.qiangzhuangNode.childrenCount; j++) {
                    if (j == 0) continue;
                    var button = this.qiangzhuangNode.children[j].getComponent('cc.Button');
                    var scoreleve = roomHandler.room.opts.scorelv;
                    var baseCoin = getMatchCostTableFinal(gameDefine.GameType.Game_niu_niu, scoreleve);
                    var standardCoin = baseCoin*(GameData.joiners.length -1)*2*3*j;
                    if (coinNumber >= standardCoin) {
                        button.interactable = true;
                    }else {
                        button.interactable = false;
                    }
                }
            }
            if (niuNiuHandler.playerZhuang[GameData.player.uid] == -1) {
                this.qiangzhuangNode.active = true;
            }else{
                this.qiangzhuangNode.active = false;    
            }
        },
        // 显示下注阶段的界面
        showBetUI: function () {
            var chipsData = niuNiuHandler.playerChips;
            if (chipsData[GameData.player.uid] === -1 && niuNiuHandler.zhuangUid != GameData.player.uid) {
                // 表示当前自己还没有下注
                var betType = roomHandler.room.opts.multipleType;
                this.multipleNode.getChildByName("multipleType" +betType).active = true;
                this.multipleNode.active = true;
            }else {
                this.multipleNode.active = false;
            }
        },
        //出牌按钮显示
        showDisCardUI: function () {
            if (niuNiuHandler.spectator(GameData.player.uid)) return;
            var isNeedShow = false;
            var sendList = niuNiuHandler.playerSendCard;

            var actNode = cc.find("act0",this.actionNode);
            if (Object.keys(sendList).length > 0) {
                if (niuNiuHandler.status === this.niuniuStayType.COMPARE) {
                    if (!sendList[GameData.player.uid] && !this.showpokers) {
                        isNeedShow = true;
                    }
                }else{
                    isNeedShow = false;
                }
            }
            if (isNeedShow == true && this.isclick == true) {
                this.adviseBtn.active = false;   
            }else{
                this.adviseBtn.active = isNeedShow;
            }
            this.sendBtn.active = isNeedShow;
        },

        // 显示玩家的手牌
        showHandCards: function () {
            if (gameDefine.currencyType.Currency_Coin != roomHandler.room.opts.currencyType) {
                if ((niuNiuHandler.status < this.niuniuStayType.ZHUANG || niuNiuHandler.status > this.niuniuStayType.COMPARE)
                && roomHandler.readyData[GameData.player.uid]) return;
            }
            var players = GameData.joiners;
            if (!players || players.length == 0 || players == null) return;
            //初始化底牌显示
            this.otherHandCardNode.active = true;
            for (var i = 0; i < this.otherHandCardNode.children.length; i++) {
                this.otherHandCardNode.children[i].active = false;
            }
            var zhuangUserId = niuNiuHandler.zhuangUid;

            var playerCards = niuNiuHandler.playerCards;
            for (var i = 0; i < players.length; i++) {
                if (players[i] == null) continue;
                var userId = players[i].uid;
                var localIndex = roomHandler.getLocalPosition(i);
                if (userId == GameData.player.uid) {
                    this.showSelfHandCards(playerCards[GameData.player.uid], 0);
                }else {
                    if (niuNiuHandler.status >this.niuniuStayType.WAIT && niuNiuHandler.status < this.niuniuStayType.COMPARE) {
                        delete playerCards[userId];
                    }
                    var cardPos = true;
                    if (!playerCards[userId] || (playerCards[userId] && playerCards[userId].length == 0)) {
                        this.showOthersHandCards(userId, localIndex, null, cardPos);
                    }else if ( playerCards[userId] && playerCards[userId].length > 0) {
                        var playercardInfo = this.showPokerForm(userId, playerCards[userId], cardPos);
                        if (userId == zhuangUserId) {
                            this.showZhuangCards(localIndex, playercardInfo.newHandCards, playercardInfo.cardPos);
                        }else {
                            this.showOthersHandCards(userId, localIndex, playercardInfo.newHandCards, playercardInfo.cardPos);
                        }

                        var actNode = cc.find("act" + localIndex,this.actionNode);
                        if (playerCards[userId].length == 5 && userId != zhuangUserId) {
                            this.playCardType(userId, localIndex);
                        }
                    }
                }   
            }
            if (!niuNiuHandler.readyBtnActive) {
                this.initScore();    
            }
            this.initPokerType();
        },
        //显示自己的手牌
        showSelfHandCards: function (cards, type) {
            this._selfHandCards = [];
            for (var i = 0; i < this.selfHandCardNode.childrenCount; i++) {
                this.selfHandCardNode.children[i].active = false;
            }
            this.selfHandCardNode.active = false;
            
            var niuNiustatus = niuNiuHandler.status;
            var srtNodeName;
            var isActive = niuNiuHandler.playerSendCard[GameData.player.uid];
            //type 0:未出牌 1:已出牌
            if (type == 0) {
                if (isActive || niuNiustatus == this.niuniuStayType.SETTLE || niuNiustatus == 0) {
                    srtNodeName = "handCardDis";
                }else{
                    srtNodeName = "handCard";
                }
            }else if (type == 1) {
                srtNodeName = "handCardDis";
            }

            if (GameData.player.uid == niuNiuHandler.zhuangUid && this.showpokers) {
                srtNodeName = "handCardDis";
            }
            if (niuNiuHandler.spectator(GameData.player.uid)) {
                this.selfHandCardNode.active = false;
                return;
            }else{
                this.selfHandCardNode.active = true;
            }
            var handCardNode = this.selfHandCardNode.getChildByName(srtNodeName);
            if (handCardNode) {
                handCardNode.active = true;
                if (srtNodeName == "handCardDis") {
                    var cardPos = true;
                    var selfCardInfo = this.showPokerForm(GameData.player.uid, cards, cardPos);
                    if (selfCardInfo.cardPos) {
                        handCardNode.x = this.handCardsInitialPos[0].x + 20;
                    }else {
                        handCardNode.x = this.handCardsInitialPos[0].x;
                    }
                    this.showEveryCards(handCardNode, selfCardInfo.newHandCards);
                } else {
                    this.showEveryCards(handCardNode, cards);                        
                } 
            }
            var actNode = cc.find("act0",this.actionNode);
            if (actNode.childrenCount != 0) return;
            //庄家自动出牌
            if (srtNodeName == "handCardDis") {
                this.playCardType(GameData.player.uid, 0);
                if (GameData.player.uid == niuNiuHandler.zhuangUid && !this.showpokers && niuNiustatus > this.niuniuStayType.WAIT) {
                     this.playCardAudio(GameData.player.uid);
                }
            }
        },
        //显示其他人的手牌
        showOthersHandCards: function (uid, localIndex, cards, cardPos) {
            var handCardNode = this.otherHandCardNode.getChildByName("handCard"+localIndex);
            if (cardPos) {
                handCardNode.x = this.handCardsInitialPos[localIndex].x + 12;
            }else {
                handCardNode.x = this.handCardsInitialPos[localIndex].x;
            }
            if (niuNiuHandler.spectator(uid)) {
                handCardNode.active = false;
            }else{
                handCardNode.active = true;
            }
            this.showEveryCards(handCardNode, cards);
        },
        //显示庄家的手牌
        showZhuangCards: function (localIndex, cards, cardPos) {
            var handCardNode = this.otherHandCardNode.getChildByName("handCard"+localIndex);
            handCardNode.active = true;
            var self = this;
            setTimeout(function(){
                if ((niuNiuHandler.status < self.niuniuStayType.ZHUANG || niuNiuHandler.status > self.niuniuStayType.COMPARE)
                && Object.keys(niuNiuHandler.playerCards) <= 0) return;
                if (cardPos) {
                    handCardNode.x = self.handCardsInitialPos[localIndex].x + 12;
                }else {
                    handCardNode.x = self.handCardsInitialPos[localIndex].x;
                }
                self.showEveryCards(handCardNode, cards);
                self.playCardType(niuNiuHandler.zhuangUid, localIndex);
                if (!self.playAudio) {
                    self.playAudio = true;
                    self.playCardAudio(niuNiuHandler.zhuangUid);    
                }
            },1000); 
        },
        //显示每个人的手牌
        showEveryCards: function (handCardNode, cards) {
            for (var j = 0; j < handCardNode.children.length; j++) {
                var pokerScp = handCardNode.children[j].getComponent("niuNiuPoker");
                if (cards == null || cards[j] == null) {
                    if (j == 5) {
                        pokerScp.clearCardsUI();    
                    }else {
                        pokerScp.initCardInfo(null);    
                    }
                }else if (cards[j] == 0) {
                    pokerScp.clearCardsUI();
                }else {
                    pokerScp.turnOver();
                    pokerScp.initCardInfo(cards[j]); 
                    if (handCardNode.name == 'handCard' && cards.length == 5) {
                        this._selfHandCards.push(pokerScp);
                    }   
                }
            }
        },
        //显示亮牌形式
        showPokerForm: function (userId, cards, cardPos) {
            var pokerTypeCards = [];
            if (niuNiuHandler.playerCard3[userId]) {
                pokerTypeCards = niuNiuHandler.playerCard3[userId];
            }
            var newArray = pokerTypeCards.concat(cards);
            var newHandCards = niuniuPokerHandler.unequally(newArray);
            var cardsType = niuNiuHandler.recordType[userId];
            if (cardsType > this.niuniuPokerType.NIU_NONE && cardsType < this.niuniuPokerType.NIU_NIU) {
                newHandCards.splice(3,0,0);  
                cardPos = false;
            }else {
                newHandCards.splice(5,0,0);
                cardPos = true;
            }
            return {newHandCards:newHandCards,cardPos:cardPos};
        },
        // 准备按钮的回调函数
        onReadyBtnClick: function () {
            soundMngr.instance.playAudioOther('button');
            this.clearUI();
            this.spectatorNode.active = false;
            var readyparentNode = this.qiangzhuangSp.node.parent;
            var readyBtnNode = cc.find('actionAnimations/readyBtn',readyparentNode);
            readyBtnNode.active = false;
            if (GameData.roomClose) {
                var parentNode = cc.find("Canvas/layer_ui");
                parentNode.parent.getComponent('niuNiuRoomMain').showSummaryLayer();
            }else{
                roomHandler.setReady();
            }
        },
        //当用户点击提示按钮
        onAdviseBtnClick: function (event, customEventData) {
            var niuniuPokerStar = niuniuPokerHandler.getPokerStar();
            soundMngr.instance.playAudioOther('button');
            var selfcardType = 0;
            var selfActCard = [];
            niuNiuHandler.isSelfClickAdviseBtn = true;
            if (niuNiuHandler.recordType[GameData.player.uid]) {
                selfcardType = niuNiuHandler.recordType[GameData.player.uid];   
            }
            if (niuNiuHandler.playerCard3[GameData.player.uid]) {
                selfActCard = niuNiuHandler.playerCard3[GameData.player.uid];
            }
            this.actionNode.active = true;
            var animationNode = this.actionNode.getChildByName("act0");
            for (var key in this.niuniuPokerType) {
                if (this.niuniuPokerType[key] == selfcardType) {
                    niuniuCreateMoveMessage(niuniuPokerStar[key]);
                }
            }
            if (selfActCard.length > 0 && selfcardType <= this.niuniuPokerType.NIU_Nine) {
                for (var i = 0; i < this._selfHandCards.length; i ++) {
                    var pokerScp = this._selfHandCards[i];
                    for (var j = 0; j < selfActCard.length; j++) {
                        if (pokerScp.cardInfo && pokerScp.cardInfo == selfActCard[j]) {
                            pokerScp.showTipAction();
                            continue;
                        }
                    }
                }
            }
            this.isclick = true;
            event.target.active = false;
        },
        //下注按钮
        onBetBtnClick: function (event, customEventData) {
            soundMngr.instance.playAudioOther('button');
            var self = this;
            var succes = niuNiuHandler.requestChips(customEventData);
            if (succes == 0) {
                this.showBetUI();
            }
        },
        // 玩家点击出牌按钮
        onSendBtnClick: function () {
            soundMngr.instance.playAudioOther('button');
            var self = this;
            this.showpokers = true;
            if (GameData.player.uid == niuNiuHandler.zhuangUid) {
                var cards = niuNiuHandler.playerCards[GameData.player.uid];
                this.showSelfHandCards(cards, 1);
                this.playCardType(GameData.player.uid, 0);
                this.playCardAudio(GameData.player.uid);
                this.adviseBtn.active = false;
                this.sendBtn.active = false;
            }else{
                GameNet.getInstance().request("room.niuNiuHandler.setShow",{},function(res) {
                    if (res.result == 0) {
                        self.adviseBtn.active = false;
                        self.sendBtn.active = false;
                    }
                });
            }
        },
        //抢庄按钮
        clickGetZhuang: function(eve, data){
            soundMngr.instance.playAudioOther('button');
            var zhuangNum = data;
            this.qiangzhuangNode.active = false;
            niuNiuHandler.requestZhuang(zhuangNum);
        },

        getShowActiveAudio: function (data) {
            if (!data) return;
            var showUid = data.detail.uid;
            var index = roomHandler.getPlayerPosByUid(showUid);
            var localIndex = roomHandler.getLocalPosition(index);
            var cards = niuNiuHandler.playerCards[showUid];
            var zhuangUserId = niuNiuHandler.zhuangUid;
            if (showUid != zhuangUserId) {
                this.playCardType(showUid, localIndex);
                this.playCardAudio(showUid);
            }    
        },
        //播放牌型
        playCardType: function (uid, localIndex) {
            var playerInfo = roomHandler.getPlayerByUid(uid);
            var record = null;
            if (niuNiuHandler.recordType) {
                record = niuNiuHandler.recordType[uid];
            }
            //播放牌型动画
            if (record === undefined || record === null) return;
            var actNode = cc.find("act" + localIndex,this.actionNode);
            actNode.removeAllChildren();
            var pokerTypePrefab = localIndex == 0 ? this.selfPokerTypePrefab : this.otherPokerTypePrefab;
            pokerTypePrefab = cc.instantiate(pokerTypePrefab);
            actNode.addChild(pokerTypePrefab);
            pokerTypePrefab.getComponent("pokerTypeAnimation").initFanInfo(record, 0);
        },
        //播放音效
        playCardAudio: function(uid) {
            var playerInfo = roomHandler.getPlayerByUid(uid);
            var record = null;
            if (niuNiuHandler.recordType) {
                record = niuNiuHandler.recordType[uid];
            }
            //播放牌型动画
            if (niuNiuHandler.status > this.niuniuStayType.WAIT && niuNiuHandler.status < this.niuniuStayType.COMPARE) return;
            if (record === undefined || record === null) return;
            cc.log('record = '+record);
            soundMngr.instance.playNiuNiuAudio(record,playerInfo.sex);
        },

        //倒计时
        handleCloseTimer: function () {
            if (niuNiuHandler.gameTimes == 0) return;  
            this.unschedule(this.updateCountDown);
            cc.log('niuNiuHandler.status = '+niuNiuHandler.status);
            cc.log('niuNiuHandler.gameTimes = '+niuNiuHandler.gameTimes);
            if (niuNiuHandler.status < this.niuniuStayType.ZHUANG || niuNiuHandler.status > this.niuniuStayType.COMPARE) {
                niuNiuHandler.gameTimes = 0;
                return;
            }
            cc.log('start game count: countTime = '+niuNiuHandler.gameTimes);
            this.updateCountDown();
            this.schedule(this.updateCountDown, 1);
        },
        updateCountDown: function () {
            niuNiuHandler.gameTimes --;
            cc.log('run game count: countTime = '+niuNiuHandler.gameTimes);
            if (niuNiuHandler.status < this.niuniuStayType.ZHUANG || niuNiuHandler.status > this.niuniuStayType.COMPARE) {
                niuNiuHandler.gameTimes = 0;
                this.unschedule(this.updateCountDown);
                return;
            }
            if(niuNiuHandler.status == this.niuniuStayType.ZHUANG && niuNiuHandler.isStartAnimationPlayed){
                this.lastTimeLabel.node.active = false;
            }else{
                this.lastTimeLabel.node.active = true;
            }

            this.lastTimeLabel.string = niuNiuHandler.gameTimes;
            if (niuNiuHandler.gameTimes <= 0) {
                niuNiuHandler.gameTimes = 0;
                this.lastTimeLabel.node.active = false;
                this.unschedule(this.updateCountDown);
                return;
            }
        },

        //显示操作提示img
        showHintImg:function () {
            var zhuangData = niuNiuHandler.playerZhuang;
            var chipsData = niuNiuHandler.playerChips;
            var timeAct = true;
            if (niuNiuHandler.status == this.niuniuStayType.ZHUANG && niuNiuHandler.isStartAnimationPlayed == false) {
                var Url = 'resources/niuNiuTable/artword/qingqiangzhuang.png';
                var texture = cc.textureCache.addImage(cc.url.raw(Url));  
                this.qiangzhuangSp.spriteFrame = new cc.SpriteFrame(texture);
                this.qiangzhuangSp.node.active = timeAct;
                this.betSp.node.active = !timeAct;
                this.pinNiuSp.node.active = !timeAct;
            }else if (niuNiuHandler.status == this.niuniuStayType.CHIPS) {
                var zhuangUid = niuNiuHandler.zhuangUid;
                var Url = '';
                if(zhuangUid == GameData.player.uid){
                    Url = 'resources/niuNiuTable/artword/dengdaixiazhuzi.png';
                }else{
                    Url = 'resources/niuNiuTable/artword/xianjiaxiazhu.png';
                }
                var texture = cc.textureCache.addImage(cc.url.raw(Url));  
                this.betSp.spriteFrame = new cc.SpriteFrame(texture);
                this.betSp.node.active = timeAct;
                this.qiangzhuangSp.node.active = !timeAct;
                this.pinNiuSp.node.active = !timeAct;
            }else if (niuNiuHandler.status == this.niuniuStayType.COMPARE) {
                this.pinNiuSp.node.active = timeAct;
                this.betSp.node.active = !timeAct;
                this.qiangzhuangSp.node.active = !timeAct;
            }else if (niuNiuHandler.status == this.niuniuStayType.SETTLE) {
                this.pinNiuSp.node.active = !timeAct;
                this.betSp.node.active = !timeAct;
                this.qiangzhuangSp.node.active = !timeAct;
            }
            this.showReadyImg();
            this.handleCloseTimer();
        },
        //准备阶段提示
        showReadyImg: function () {
            var parentNode = this.pinNiuSp.node.parent;
            var waitStart = cc.find('waitstart',parentNode);
            var pleaseReady = cc.find('pleaseReady',parentNode);
            var ready = roomHandler.readyData;
            if (roomHandler.room.status == gameDefine.RoomState.WAIT || roomHandler.room.status == gameDefine.RoomState.READY) {
                if (roomHandler.readyCountDown > 0) {
                    if (niuNiuHandler.readyBtnActive) {
                        waitStart.active = false;    
                    } else {
                        waitStart.active = true;
                    }
                    
                    this.clearZhuangUI();
                    pleaseReady.active = false;
                }else {
                    if (roomHandler.room.status == gameDefine.RoomState.READY && !ready[GameData.player.uid]) {
                        pleaseReady.active = true;    
                    }
                }
            }else {
                pleaseReady.active = false;
                waitStart.active = false;
            }
            if (niuNiuHandler.status >= this.niuniuStayType.ZHUANG && niuNiuHandler.status < this.niuniuStayType.SETTLE) {
                waitStart.active = false;
                pleaseReady.active = false;
            }
            if (niuNiuHandler.status > this.niuniuStayType.WAIT && niuNiuHandler.status <= this.niuniuStayType.SETTLE){
                if (niuNiuHandler.spectator(GameData.player.uid)) {
                    if (ready[GameData.player.uid]) {
                        this.spectatorNode.active = false;
                    }else {
                        this.spectatorNode.active = true;    
                    }
                }else{
                    this.spectatorNode.active = false;
                }
            }else {
                this.spectatorNode.active = false;
            }
            if (this.surplus <= 0) {
                this.showZhuangUI();
            }
        },

        // 监听小结算
        handleRunEnd: function () {
            niuNiuHandler.readyBtnActive = true;
            var parentNode = this.qiangzhuangSp.node.parent;
            var readyBtnNode = cc.find('actionAnimations/readyBtn',parentNode);
            readyBtnNode.active = false;
            var pleaseReady = cc.find('pleaseReady',parentNode);
            pleaseReady.active = false;
            var self = this;
            this.scheduleOnce(function () {
                self.showClearAnimation();
            },1.5);
        }, 
        moveScoreActive: function () {
            this.moveAboutScore();
            var self = this;
            this.scheduleOnce(function () {
                self.initScore(); //初始化头像里积分
                niuNiuHandler.readyBtnActive = false;
                if (!GameData.roomClose) {
                    sendEvent('onPrepareInfo', roomHandler.readyData);
                    niuNiuHandler.zhuangUid = 0;
                    if(gameDefine.currencyType.Currency_Coin == roomHandler.room.opts.currencyType 
                        && checkOpenUISuccour(roomHandler.room.opts.gameType, roomHandler.room.opts.scorelv)){
                        return;
                    }

                } else {
                    var parentNode = cc.find("Canvas/layer_ui");
                    parentNode.parent.getComponent('niuNiuRoomMain').showSummaryLayer();
                }
            },1)
        },
        moveAboutScore: function(){
            //小结算金币移动和飘分
            var self = this;
            var players = GameData.joiners;
            for (var j = 0; j < players.length; j++) {
                if (players[j] == null) continue;
                var player = players[j];
                var playerPos = roomHandler.getLocalPosition(j);
                var runScore = niuNiuHandler.playerScore[player.uid];
                var headNode = self.scoreParent.getChildByName("score"+playerPos);
                var playerGetScore = headNode.getChildByName("resultScore");
                if (playerGetScore == null) {
                    playerGetScore = cc.instantiate(self.scoreNode);
                    if(gameDefine.currencyType.Currency_Coin == roomHandler.room.opts.currencyType){
                        var scoreleve = roomHandler.room.opts.scorelv;
                        var baseCoin = getMatchCostTableFinal(gameDefine.GameType.Game_niu_niu, scoreleve);
                        playerGetScore.getComponent('resultRunScore').getScoreColor(runScore*baseCoin);    
                    }else {
                        playerGetScore.getComponent('resultRunScore').getScoreColor(runScore);    
                    }
                    playerGetScore.active = true;
                    headNode.addChild(playerGetScore);

                    if (runScore > 0) {
                        this.winnerAnimation(playerPos); 
                    }
                }
                var move1 = cc.moveBy(1,cc.p(0,60));
                playerGetScore.runAction(move1);
            }
            this.scheduleOnce(function () {
                for (var i = 0; i < self.scoreParent.children.length; i++) {
                   self.scoreParent.children[i].removeAllChildren();
                }
            },1);
        },
        initScore: function () {
            var players = GameData.joiners;
            for (var j = 0; j < players.length; j++) {
                var player = players[j];
                if (player == null) continue;

                var localIndex = roomHandler.getLocalPosition(j);
                var headNode = this.playerHeads[localIndex].getChildByName("TableNiuNiuPlayerTemplate");
                var playerHeadScp = headNode.getComponent("niuNiuPlayerInfo");
                var roomScore = roomHandler.scores[player.uid];
                if(gameDefine.currencyType.Currency_Coin == roomHandler.room.opts.currencyType){
                    playerHeadScp.setGold(player.coin, gameDefine.GameType.Game_niu_niu);
                } else {
                    playerHeadScp.setCoin(roomScore);
                }            
            }
            if (this.surplus <= 0) {
                this.showZhuangUI();
            }
        },
        winnerAnimation: function (index) {
            var winerNode = cc.find('action'+index,this.winPlayerNode);
            winerNode.active = true;
            var anim = winerNode.getComponent(dragonBones.ArmatureDisplay);
            anim.playAnimation('newAnimation',1);
            var self = this;
            this.scheduleOnce(function(){
                winerNode.active = false;
            },1.5);
        },

        //飘分动画
        showClearAnimation: function() {
            WriteLog('showClearAnimation');
            //确定赢家输家
            this.confirmWinnerOrLoser();
            if (this._winnerToLoser.loser.length > 0) {
                this.loserJetton();
            }else {
                if (this._winnerToLoser.winner.length > 0) {
                    this.flyToPlayer();
                }
            }
        },
        //确定赢家输家
        confirmWinnerOrLoser: function () {
            niuniuPokerHandler.clearArray(this._winnerToLoser.winner);
            niuniuPokerHandler.clearArray(this._winnerToLoser.loser);

            var scoreList = niuNiuHandler.playerScore;
            for (var key in scoreList) {
                if (key == niuNiuHandler.zhuangUid) {
                    continue;
                }else {
                    if (scoreList[key] > 0) {
                        this._winnerToLoser.winner.push({
                            uid:key,
                            score: scoreList[key]
                        });
                    }else{
                        this._winnerToLoser.loser.push({
                            uid:key,
                            score: scoreList[key]
                        });
                    }
                }
            }
        },
        //赢家飘分数量
        winnerCoinCount: function() {
            var coinAllCount = this._coinCount * this._winnerToLoser.winner.length;
            var _winnerCoinCount = Math.floor(coinAllCount / this._winnerToLoser.winner.length);
            return _winnerCoinCount;
        },
        //创建金币节点
        createCoinNode: function (coinNum) {
            var node;
            var str = "resources/niuNiuTable/result/jinbiniuniu.png";
            if (!this.tableNode.getChildByName('coinNode' + coinNum))
            {
                node = cc.instantiate(this.coinNode);
                node.name = 'coinNode' + coinNum;
                this.tableNode.addChild(node);
            }else {
                node = this.tableNode.getChildByName('coinNode' + coinNum);
            }
            node.active = true;
            this._coinList.push(node);
            var iconUrl = str;
            niuNiuHandler.setTexture(iconUrl, node);
            return node;
        },
        //当所有闲家赢时
        flyToPlayer: function () {
            this._coinIndex = 0;
            this.schedule(this.winnerAllIsPlayer, 0.05);
        },
        //输
        loserJetton: function() {
            this._coinIndex = 0;
            this.schedule(this.loserCoinAnimation, 0.05);
        },
        loserCoinAnimation: function () {
            var self = this;
            var index = roomHandler.getPlayerPosByUid(niuNiuHandler.zhuangUid);
            var zhuangIndex = roomHandler.getLocalPosition(index);
            soundMngr.instance.playNiuNiuAudio(-5);
            for (var i = 0; i < this._winnerToLoser.loser.length; i++)
            {
                var node;
                var coinNum = this._coinIndex + 1;
                node = this.createCoinNode(coinNum);
                var loseIndex = roomHandler.getPlayerPosByUid(this._winnerToLoser.loser[i].uid);
                var seat = roomHandler.getLocalPosition(loseIndex);
                var player = this.playerHeads[seat];
                node.setPosition(player.getPosition());
                var actionX = this.playerHeads[zhuangIndex].x + niuNiuHandler.randomNum(-50,50);
                var actionY = this.playerHeads[zhuangIndex].y + niuNiuHandler.randomNum(-20,50);
                var moveTo = cc.moveTo(0.25, cc.p(actionX, actionY));
                node.runAction(moveTo).easing(cc.easeCubicActionOut());
                this._coinIndex++;
            }
            
            //this._coinCount * this._winnerToLoser.loser.length筹码总数
            if (this._coinIndex >= this._coinCount * this._winnerToLoser.loser.length) 
            {
                this.unschedule(this.loserCoinAnimation);
                this.scheduleOnce(function () {
                    for (var i = 0; i < self._coinList.length; i++) {
                        self._coinList[i].active = false;
                        self.tableNode.removeChild(self._coinList[i]);
                    }
                },0.5);
                if (this._winnerToLoser.winner.length > 0) {
                    this.winnerAction();
                }else {
                    this.scheduleOnce(function () {
                        self.moveScoreActive();
                    },0.5);
                }
            }
        },
        //赢
        winnerAction: function() {
            var delayTime = cc.delayTime(1);
            var self = this;
            var callFunc = cc.callFunc(function(){
                self.winnerCoin();
            }, this);
            var seq = cc.sequence(delayTime, callFunc);
            this.node.runAction(seq);
        },
        winnerCoin: function() {
            this._coinIndex = 0;
            this.schedule(this.winnerAllIsPlayer, 0.05);
        },
        winnerAllIsPlayer: function () {
            var self = this;
            var removeFunc;
            var lastWinner = this._winnerToLoser.winner.length - 1;
            var loseIndex = roomHandler.getPlayerPosByUid(niuNiuHandler.zhuangUid);
            var seat = roomHandler.getLocalPosition(loseIndex);
            var player = this.playerHeads[seat];
            soundMngr.instance.playNiuNiuAudio(-5);
            for (var i = 0; i < this._winnerToLoser.winner.length; i++) 
            {
                var coinNum = this._coinIndex + 1;
                var node = this.createCoinNode(coinNum);
                node.setPosition(player.getPosition());

                var moveTo;
                var coinAction = function(num) {
                    var winIndex = roomHandler.getPlayerPosByUid(self._winnerToLoser.winner[self._winnerIndex].uid);
                    var seat = roomHandler.getLocalPosition(winIndex);
                    var player = self.playerHeads[seat];
                    var actionX = player.getPosition().x + niuNiuHandler.randomNum(-50,50);
                    var actionY = player.getPosition().y + niuNiuHandler.randomNum(-20,50);
                    moveTo = cc.moveTo(0.25, cc.p(actionX, actionY));
                    //移除筹码节点
                    removeFunc = cc.callFunc(function(){
                        self._coinList[num - 1].active = false;
                        self.tableNode.removeChild(self._coinList[num - 1]);
                    }, this);
                }
                //每个赢家应该得到的筹码数
                if (coinNum <= this.winnerCoinCount() * (this._winnerIndex + 1) && this._winnerIndex < lastWinner) 
                {
                    coinAction(coinNum);
                }
                //如果筹码数大于赢家应得筹码数，说明该筹码应给下一位赢家
                else if (coinNum > this.winnerCoinCount() * (this._winnerIndex + 1) && this._winnerIndex < lastWinner) 
                {
                    this._winnerIndex++;
                    coinAction(coinNum);
                }
                //最后一名赢家得到剩余的所有筹码数(注：分数的多寡不会影响所得筹码数，一切都是固定的)
                else if (this._winnerIndex == lastWinner) 
                {
                    coinAction(coinNum);
                }
                var fade = cc.fadeOut(0.4);
                var seq = cc.sequence(moveTo, fade, removeFunc);
                node.runAction(seq).easing(cc.easeCubicActionOut());
                this._coinIndex++;
            }
            //this._coinCount * this._winnerToLoser.winner.length筹码总数
            if (this._coinIndex >= this._coinCount * this._winnerToLoser.winner.length) 
            {
                this.unschedule(this.winnerAllIsPlayer);
                this.scheduleOnce(function () {
                    self.moveScoreActive();
                },0.5);
            }
        },
        
        handlerMsg : function () {
            require('util').registEvent('onRoomInfo', this, this.showHandCards);
            require('util').registEvent('onJoinerConnect', this, this.initScore);
            require('util').registEvent('onPrepareInfo', this, this.showReadyImg);
            require('util').registEvent('douniu-onGameEnd',this, this.handleRunEnd);
            require('util').registEvent('douniu-onGameInfo', this, this.getGameInfo);
            require('util').registEvent('douniu-onGameCards', this, this.showHandCards);
            require('util').registEvent('douniu-onGameStart', this, this.clearUI);
            require('util').registEvent('douniu-onShowCards', this, this.getShowActiveAudio);
        },
        onDestroy: function (){
            unrequire('util').registEvent('onRoomInfo', this, this.showHandCards);
            unrequire('util').registEvent('onJoinerConnect', this, this.initScore);
            unrequire('util').registEvent('onPrepareInfo', this, this.showReadyImg);
            unrequire('util').registEvent('douniu-onGameEnd',this, this.handleRunEnd);
            unrequire('util').registEvent('douniu-onGameInfo', this, this.getGameInfo);
            unrequire('util').registEvent('douniu-onGameCards', this, this.showHandCards);
            unrequire('util').registEvent('douniu-onGameStart', this, this.clearUI);
            unrequire('util').registEvent('douniu-onShowCards', this, this.getShowActiveAudio);
        }
    });
