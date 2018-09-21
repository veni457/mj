var soundMngr = require('SoundMngr');
var errorCode = require('errorCode');
var RoomHandler = require('roomHandler');
var configMgr = require('configMgr');
var gameDefine = require('gameDefine');

var roomTable = cc.Class({
    extends: cc.Component,
    properties: {
        play_layer_down: cc.Node,
        play_layer_left: cc.Node,
        play_layer_right: cc.Node,
        //房间规则
        ruleLb: cc.Label,
        //相关控件
        coinEndLayer: cc.Node,
        handCardLayOut: cc.Node,
        cardsNode: cc.Node,
        actionLayer: cc.Node,
        jiaofenNode: cc.Node,
        HoleCardsNode: cc.Node,
        clockNodes: cc.Node,
        buchuNodes: cc.Node,
        warningNode: cc.Node,
        multipleNode: cc.Node,
        _countdown_index: 0,
        _currClockNodes: cc.Node,
        lastRoundLabel: cc.Label,
        //动画node
        dragonAnimations: cc.Node,
        winAnimation: cc.Node,
        loseAnimation: cc.Node,
        planeNode: cc.Node,
        chuntianNode: cc.Node,
        bobmAinmation: cc.Node,
        huojianAinmation: cc.Node,

        //触摸空白位置复位poker位置的节点
        maskbg: cc.Node,
        //地主poker标识
        dizhuSign: cc.Prefab,

        tiBtnNode:  cc.Node,
        tiIcon_right: cc.Node,
        undouble_right: cc.Node,
        tiIcon_left: cc.Node,
        undouble_left: cc.Node,
        tiIcon_down: cc.Node,
        undouble_down: cc.Node,
        passNode: cc.Node,
        noTrustNode: cc.Node,
        trustBtn: cc.Node,
        handCardMask: cc.Node,

        waitJiaoFen: cc.Node,
        waitDouble: cc.Node,

        //音效flag判断除了单对 随机播放、大你、管上、
        _effcetFlag: false,
        //当前时间
        _currTime: null
    },
    onLoad: function () {
        this.initData();
        this.initUI();
        this.registListenr();

        for (var key in this.handCardLayOut.children) {
            this.defaultPokerY = this.handCardLayOut.children[key].y;
        }

        //叫分断线处理start//
        if (GameDataDDZ.game.initcards) {
            this.cardsNode.active = true;
            this._dealEnd = true;
            this.onShow();
        }
        if (GameDataDDZ.currJiaofenPlayerData != null) {
            this.showJiaoFenNode();
        }
        //叫分断线处理End//

        //加倍断线
        this.showTiChuai();

        //游戏开始断线处理
        if (GameDataDDZ.game.gameStartDizhu) {
            this.showDizhuInfo();
            this.showObtainNode();
            this.showDisPoker();
            this.showBuchuNode();
            this.showCardNum();
            this.showDeputeInfo();
        }
        this.connectRecurrence();
    },
    registListenr: function () {
        require('util').registEvent('ddz-onGameScore', this, this.onGameScoreHandler);
        require('util').registEvent('ddz-onShowObtainNode', this, this.onShowObtainHandler);
        require('util').registEvent('ddz-showDisPoker', this, this.onShowDisPokerHandler);
        require('util').registEvent('ddz-showWatch', this, this.onShowWatchHandler);
        require('util').registEvent('ddz-onDiZhu', this, this.onShowDizhuInfoHandler);
        require('util').registEvent('ddz-jiaoFencb', this, this.onJiaoFenCBHandler);
        require('util').registEvent('ddz-startTi', this, this.showTiChuai);
        require('util').registEvent('ddz-showKicking', this, this.showKicking);

        require('util').registEvent('onPrepareInfo', this, this.onPrepareInfo);
        require('util').registEvent('ddz-onGameInfo', this, this.onShow);
        require('util').registEvent('ddz-initCardHand', this, this.initCardHand);
        require('util').registEvent('ddz-initCardHandNum', this, this.showCardNum);
        require('util').registEvent('ddz-initCardHands', this, this.onShow);
        require('util').registEvent('ddz-onGameStart', this, this.handleGameStart);
        require('util').registEvent('ddz-onJiaoFen', this, this.showJiaoFenNode);
        require('util').registEvent('initTableNode', this, this.initTableNode);
        require('util').registEvent('ddz-onDiscardType', this, this.showDisCardType);
        require('util').registEvent('ddz-disPokerArry', this, this.setDisPokerArry);
        require('util').registEvent('ddz-passcb', this, this.playPassEffect);
        require('util').registEvent('ddz-hintCard', this, this.showHintCard);
        require('util').registEvent('onShowSummary', this, this.stopClockMusic);
        require('util').registEvent('ddz-reconnectionInfo', this, this.reconnectionInfo);
        require('util').registEvent('ddz-deputeInfo', this, this.showDeputeInfo);

        var self = this;
        this.maskbg.on(cc.Node.EventType.TOUCH_END, function () {
            self.DoubleClick();
        });
        this.trustBtn.on(cc.Node.EventType.TOUCH_END, this.onTrustBtnTouchEnd);
    },
    onDestroy: function () {
        unrequire('util').registEvent('ddz-onGameScore', this, this.onGameScoreHandler);
        unrequire('util').registEvent('ddz-onShowObtainNode', this, this.onShowObtainHandler);
        unrequire('util').registEvent('ddz-showDisPoker', this, this.onShowDisPokerHandler);
        unrequire('util').registEvent('ddz-showWatch', this, this.onShowWatchHandler);
        unrequire('util').registEvent('ddz-onDiZhu', this, this.onShowDizhuInfoHandler);
        unrequire('util').registEvent('ddz-jiaoFencb', this, this.onJiaoFenCBHandler);
        unrequire('util').registEvent('ddz-startTi', this, this.showTiChuai);
        unrequire('util').registEvent('ddz-showKicking', this, this.showKicking);

        unrequire('util').registEvent('onPrepareInfo', this, this.onPrepareInfo);
        unrequire('util').registEvent('ddz-onGameInfo', this, this.onShow);
        unrequire('util').registEvent('ddz-initCardHand', this, this.initCardHand);
        unrequire('util').registEvent('ddz-initCardHandNum', this, this.showCardNum);
        unrequire('util').registEvent('ddz-initCardHands', this, this.onShow);
        unrequire('util').registEvent('ddz-onGameStart', this, this.handleGameStart);
        unrequire('util').registEvent('ddz-onJiaoFen', this, this.showJiaoFenNode);
        unrequire('util').registEvent('initTableNode', this, this.initTableNode);
        unrequire('util').registEvent('ddz-onDiscardType', this, this.showDisCardType);
        unrequire('util').registEvent('ddz-disPokerArry', this, this.setDisPokerArry);
        unrequire('util').registEvent('ddz-passcb', this, this.playPassEffect);
        unrequire('util').registEvent('ddz-hintCard', this, this.showHintCard);
        unrequire('util').registEvent('onShowSummary', this, this.stopClockMusic);
        unrequire('util').registEvent('ddz-reconnectionInfo', this, this.reconnectionInfo);
        unrequire('util').registEvent('ddz-deputeInfo', this, this.showDeputeInfo);

        var self = this;
        this.maskbg.off(cc.Node.EventType.TOUCH_END, function () {
            self.DoubleClick();
        });
        this.trustBtn.off(cc.Node.EventType.TOUCH_END, this.onTrustBtnTouchEnd);
    },
    onEnable: function(){
        this._countdown_index = 15;

        this.showKicking();
        this.initCardHand();
    },

    initData: function () {
        this._dealActionIndex = 1;
        this._cardHandPosArr = [];
        this._angularArr = [];
        this._dealEnd = false;
        this.disCardArry = [];
        this.disPokerArry = [];
        this._dragonAnimtaionNum = 1;
        this._buJiao = 0;
        this._trusteeshipFlag = false;

        GameDataDDZ.kicking = {};
    },
    initUI: function () {
        this.cardsNode.active = false;
        this.jiaofenNode.active = false;
        this.trustBtn.active = false;
        this.waitJiaoFen.active = false;
        this.waitDouble.active = false;

        this.showRoomRule();
        this.hideDisCards();
        this.setDisCardBtnStatus();
        this.hideIsDoubleFlag();
    },
    //开局初始化牌局节点
    initTableNode: function () {
        this.initData();
        this.initUI();

        //隐藏牌桌的poker
        var leftLastCardNode = cc.find('lastpokerNum', this.play_layer_left);
        var rightLastCardNode = cc.find('lastpokerNum', this.play_layer_right);
        this.hideNodeChild(leftLastCardNode);
        this.hideNodeChild(rightLastCardNode);

        this.hideDisCards();
        this.hideHandCards();
        //开局隐藏叫分文本
        var jiaofenTextNode = cc.find('jiaofenSps', this.cardsNode);
        this.hideNodeChild(jiaofenTextNode);
        //隐藏按钮
        this.actionLayer.active = false;
        this.hideNodeChild(this.clockNodes);
        this.hideNodeChild(this.multipleNode);

        GameDataDDZ.game.dizhuUid = 0;
        this.chuntianNode.active = false;
        this.winAnimation.active = false;
        this.loseAnimation.active = false;
        this.planeNode.active = false;
        this.bobmAinmation.active = false;
        this.huojianAinmation.active = false;
        this.trustBtn.active = false;
        //隐藏报警icon
        this.hideNodeChild(this.warningNode);
        //隐藏不出文本节点
        this.hideNodeChild(this.buchuNodes);
        //关闭调度器
        this.stopClockMusic();
    },

    onShowWatchHandler: function(){
        this.showWatch();
        this.showKicking();
        this.showTiChuai();
    },

    onJiaoFenCBHandler: function(data){
        this.playJiaofenEffect(data);
        this.showJiaofenText();
    },

    onShowDizhuInfoHandler: function(){
        var self = this;
        self.showDizhuInfo();
    },

    onShowDisPokerHandler: function(data){
        this.hideIsDoubleFlag();
        this.disPoker(data);
    },

    onShowObtainHandler: function(){
        this.waitDouble.active = false;

        this.showObtainNode();
    },

    onGameScoreHandler: function(){
        this.showWinNode();

        var time = this.showGameEndAction();
        time === undefined ? time = 0 : null;

        var self = this;
        this.scheduleOnce(function() {
            sendEvent('coinEnd');
        }, time);
    },

    showRoomRule: function() {
        this.ruleLb.string = this.getRuleStr();
    },
    hideNodeChild: function (parent) {
        for (var key in parent.children) {
            parent.children[key].active = false;
        }
    },
    handleGameStart: function () {
        this.coinEndLayer.active = false;
        this.cardsNode.active = true;
        //开局显示poker底牌背景
        this.hideHoleCards();
    },
    onPrepareInfo: function() {
        if(GameDataDDZ.game.onRoomReadyInfo == undefined){
            return;
        }
        if(GameDataDDZ.game.onRoomReadyInfo[GameData.player.uid] == true) {

        }
    },
    initCardHand: function() {
        if(GameDataDDZ.getMyHandCards() == undefined){
            return;
        }
        if(GameDataDDZ.getMyHandCards().length == GameDataDDZ.handCardSize && GameDataDDZ.deal == true) {
            this._firstInit = true;
        }
        this.onShow();
    },
    onShow: function () {
        var downHandCardNode = cc.find('cardHand/handLayout', this.play_layer_down);
        for (var key in downHandCardNode.children) {
            downHandCardNode.children[key].y = this.defaultPokerY;
        }
        this.showCards();
        this.cardsNode.active = true;
        this.HoleCardsNode.active = true;
        this.lastRoundLabel.string = '局数:' + GameData.room.roundNum + '/' + GameData.room.opts.roundMax;
        if (GameData.room.opts.roomType == gameDefine.roomType.Room_Match) {
            this.lastRoundLabel.node.opacity = 90;
        }
    },
    showCards: function () {
        var player = GameData.getPlayerByPos('down');
        if (player && GameDataDDZ.cards[player.uid]) {
            if (this._firstInit) {
                this.dealActionMngr();
            } else {
                this.showMyHandCards(player, this.play_layer_down);
            }
            this.play_layer_down.active = true;
        } else {
            this.play_layer_down.active = false;
        }
    },

    showCardNum: function() {
        var player = GameData.getPlayerByPos('right');
        if (player && GameDataDDZ.cards[player.uid]) {
            this.showOtherHandCards(player, this.play_layer_right);
            this.play_layer_right.active = true;
        } else {
            this.play_layer_right.active = false;
        }

        player = GameData.getPlayerByPos('left');
        if (player && GameDataDDZ.cards[player.uid]) {
            this.showOtherHandCards(player, this.play_layer_left);
            this.play_layer_left.active = true;
        } else {
            this.play_layer_left.active = false;
        }

        this.showWarningNode();
    },

    dealActionMngr: function() {
        this._firstInit = false;
        this._dealActionIndex = 1;

        //隐藏所有手牌节点
        var cardsHandNode = cc.find('cardHand/handLayout', this.play_layer_down);
        if(cardsHandNode == undefined){
            return;
        }
        this.hideNodeChild(cardsHandNode);

        this.schedule(this.dealAction, 0.2);
    },
    dealAction: function() {
        var cardsHandNode = cc.find('cardHand/handLayout', this.play_layer_down);
        if(cardsHandNode == undefined){
            return;
        }
        var handCards = GameDataDDZ.getMyHandCards();
        if(handCards == undefined){
            return;
        }
        var handCard_len = handCards.length;

        this._dealActionIndex === undefined ? this._dealActionIndex = 1 : null;

        var sumW = 1007;
        var middle = sumW / 2;
        var interval = 53;
        var start = 0;

        if(this._dealActionIndex%2 > 0){
            start = middle + (interval /2 + parseInt(this._dealActionIndex /2) * interval);
        } else {
            start = middle + parseInt(this._dealActionIndex /2) * interval;
        }

        for (var j = 0; j < this._dealActionIndex; j++) {
            var node = cc.find('hand_'+ j, cardsHandNode);
            node.active = true;
            node.x = start - j * interval;

            this.removeDizhuSign(node);
            this.showCardContent(node, handCards[j]);
        }
        this._dealActionIndex++;

        if (this._dealActionIndex > handCard_len) {
            var self = this;
            this.unschedule(this.dealAction);
            this.scheduleOnce(function() {
                self._dealEnd = true;
                self.handCardRestoration();
                var player = GameData.getPlayerByPos('down');
                self.showMyHandCards(player, self.play_layer_down);

                if(GameDataDDZ.curWatchData.gameStatus == GameDataDDZ.roomStatus.JIAOFEN){
                    self.showJiaoFenNode();
                }
            }, 1);
        }
    },

    showTiChuai: function() {
        if (GameDataDDZ.tiFlag
            && GameDataDDZ.kicking.kicking
            && GameDataDDZ.kicking.kicking[GameData.player.uid] == undefined
            && GameDataDDZ.roomStatus.TICHUAI == GameDataDDZ.curWatchData.gameStatus)
        {
            this.tiBtnNode.active = true;
            this.waitDouble.active = false;
        }
    },
    tiChuaiAction: function(node) {
        var callFunc1 = cc.callFunc(function() {
            node.active = true;
        }, this);
        var callFunc2 = cc.callFunc(function() {
            node.active = false;
        }, this);
        var delayTime = cc.delayTime(1);
        //var seq = cc.sequence(callFunc1, delayTime, callFunc2);
        var seq = cc.sequence(callFunc1);
        node.parent.stopAllActions();
        node.parent.runAction(seq);
    },

    showKicking: function() {
        if(GameDataDDZ.curWatchData.gameStatus != GameDataDDZ.roomStatus.TICHUAI){
            return;
        }
        var double = {right: this.tiIcon_right, left: this.tiIcon_left, down: this.tiIcon_down};
        var undouble = {right: this.undouble_right, left: this.undouble_left, down: this.undouble_down};

        GameDataDDZ.kicking.kicking === undefined ? GameDataDDZ.kicking.kicking = {} : null;

        for (var key in GameDataDDZ.kicking.kicking)
        {
            var isDouble = GameDataDDZ.kicking.kicking[key];
            if(isDouble == undefined){
                continue;
            }
            var pos = GameDataDDZ.getPosByUid(key);
            if(pos == undefined){
                continue;
            }
            if(key == GameData.player.uid){
                this.tiBtnNode.active = false;
            }
            var node = undefined;
            if(isDouble == 1){
                node = double[pos];
            } else if(isDouble == 0){
                node = undouble[pos];
            }
            if(node == undefined){
                continue;
            }
            this.tiChuaiAction(node);
        }
        //控制加倍状态显示
        var show = true;
        if(GameDataDDZ.kicking.kicking[GameData.player.uid]){
            if(Object.keys(GameDataDDZ.kicking.kicking).length <= 3){
                show = true;
            }
        } else {
            if(GameDataDDZ.tiFlag){
                show = false;
            }
        }
        this.waitDouble.active = show;
        cc.log('..waitDouble:'+show);
    },
    
    showMyHandCards: function (player, parent) {
        this.resetPokerPos();
        var cardHand = GameDataDDZ.getMyHandCards();
        if (cardHand == undefined) {
            return;
        }
        var cardsHandNode = cc.find('cardHand/handLayout', parent);
        for (var key in cardsHandNode.children) {
            cardsHandNode.children[key].active = false;
        }
        var i = Math.ceil(cardsHandNode.childrenCount / 2) - Math.ceil(cardHand.length / 2);
        for (var j = 0; j < cardHand.length; j++) {
            var node = cc.find('cardHand/handLayout/hand_' + (i + j), parent);
            node.active = true;
            if (player.uid == GameDataDDZ.game.dizhuUid) {
                this.addDizhuSign(node);
            } else {
                this.removeDizhuSign(node);
            }
            this.showCardContent(node, cardHand[j]);
        }
    },
    showOtherHandCards: function (player, parent) {
        if (player) {
            var uid = player.uid;
            var cardHand = GameDataDDZ.getHandCardNum(uid);
            var handNumLb = cc.find('lastpokerNum/pokerNum', parent);
            handNumLb.active = true;
            handNumLb.getComponent(cc.Label).string = cardHand;
            var node = cc.find('cardHand/hand_0', parent);
            node.active = true;
        }
    },
    showCardContent: function (cardNode, cardId) {
        if (cardId == 0) return;
        var card = cardNode.getComponent('Card');
        if (card != null) {
            card.id = cardId;
        }
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/ddz/UI/pokers/poker_' + cardId + '.png';
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },
    showPokerBack: function() {
        var cardsHandNode = cc.find('cardHand/handLayout', this.play_layer_down);
        for (var key in cardsHandNode.children) 
        {
            this.showCardContent(cardsHandNode.children[key], 'back');
            cardsHandNode.children[key].active = false;
        }
    },
    showWatch: function() {
        this.stopClockMusic();

        for (var index = 0; index < GameDataDDZ.curWatchData.uid.length; index++) {
            this.showClock(GameDataDDZ.curWatchData.uid[index]);
        }
    },
    reconnectionInfo:function(){
        this._dealEnd = true;
        this.showJiaoFenNode();
    },
    //显示叫分节点
    showJiaoFenNode: function () {
        var uid = GameDataDDZ.currJiaofenPlayerData.uid;
        var maxNum = GameDataDDZ.currJiaofenPlayerData.maxNum;

        if (GameDataDDZ.game.isJiaofenAgain) {
            this._dealEnd = false;
            GameDataDDZ.game.isJiaofenAgain = !GameDataDDZ.game.isJiaofenAgain;
            if (this._buJiao == 1) {
                // createMessageBox(null, function () {}, null, 'resources/ddz/UI/common/artword/artword_resendPoker.png');
                createMoveMessage('无人叫地主,重新发牌');
            }
            this._buJiao++;
        }
        if (this._dealEnd == false) {
            return;
        }
        this.actionLayer.active = false;

        var jiaofenTextNode = cc.find('jiaofenSps', this.cardsNode);
        this.hideNodeChild(jiaofenTextNode);

        for (var i = 1; i < 5; i++) {
            var BtnNode = cc.find('btn' + i, this.jiaofenNode);
            BtnNode.getComponent(cc.Button).interactable = true;
        }

        if (GameData.player.uid == uid) {
            this.jiaofenNode.active = true;
            this.waitJiaoFen.active = false;
            for (; maxNum > 0; maxNum--) {
                var BtnNode1 = cc.find('btn' + maxNum, this.jiaofenNode);
                BtnNode1.getComponent(cc.Button).interactable = false;
            }
        } else {
            this.jiaofenNode.active = false;
            this.waitJiaoFen.active = true;
        }
        this.disabledJiaoFenBtn();
        this.stopClockMusic();
        //显示闹钟     
        this.showClocks(uid);
        this.showJiaofenText();
    },
    disabledJiaoFenBtn: function() {
        if (GameDataDDZ.currJiaofenPlayerData == null) {
            return;
        }
        if (GameDataDDZ.currJiaofenPlayerData.fullMark != undefined)
        {
            for (var index = 1; index <= 4; index++)
            {
                var BtnNode1 = cc.find('btn' + index, this.jiaofenNode);
                BtnNode1.getComponent(cc.Button).interactable = false;
            }
            var BtnNode2 = cc.find('btn3', this.jiaofenNode);
            BtnNode2.getComponent(cc.Button).interactable = true;
        }
        else if (GameDataDDZ.currJiaofenPlayerData.suppress != undefined)
        {
            for (var index = 1; index <= 3; index++)
            {
                var BtnNode1 = cc.find('btn' + index, this.jiaofenNode);
                BtnNode1.getComponent(cc.Button).interactable = false;
            }
            var BtnNode2 = cc.find('btn3', this.jiaofenNode);
            BtnNode2.getComponent(cc.Button).interactable = true;
        }
    },
    //显示叫分文本
    showJiaofenText: function () {
        var node = cc.find('jiaofenSps', this.cardsNode);
        if(node == undefined){
            return;
        }
        node.active = true;

        var posList = ['right', 'left', 'down'];
        for(var i = 0; i < posList.length; i++){
            var pos = posList[i];
            var jiaofenNode = cc.find('jiaofenSps/'+ pos +'Sp', this.cardsNode);
            if(jiaofenNode == undefined){
                continue;
            }
            jiaofenNode.active = false;

            var playerData = GameData.getPlayerByPos(pos);
            if(playerData == undefined){
                continue;
            }
            var num = GameDataDDZ.getJiaofenNum(playerData.uid);
            if(num == undefined){
                continue;
            }
            jiaofenNode.active = true;
            var texture = cc.textureCache.addImage(cc.url.raw(this.getJiaofenImg(num)));
            jiaofenNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        }
    },
    //叫地主环节（叫分）1,2,3 分 4:不叫
    selectScroe: function (eve, data) {
        switch (parseInt(data)) {
            case 1:
                DDZHandler.getInstance().requestSelectScore(1, function (data) {});
                break;
            case 2:
                DDZHandler.getInstance().requestSelectScore(2, function (data) {});
                break;
            case 3:
                DDZHandler.getInstance().requestSelectScore(3, function (data) {});
                break;
            case 4:
                DDZHandler.getInstance().requestSelectScore(4, function (data) {});
                break;
            default:
                break;
        }
        this.jiaofenNode.active = false;
        this._buJiao = 1;
    },
    //播放叫分音效
    playJiaofenEffect: function (data) {
        var uid = data.detail.uid;
        var num = data.detail.num;
        var playerSex = GameData.getPlayerSexByUid(uid);
        var fenStr = '';
        switch (num) {
            case 1:
                fenStr = 'yifen';
                break;
            case 2:
                fenStr = 'liangfen';
                break;
            case 3:
                fenStr = 'sanfen';
                break;
            case 4:
                fenStr = 'bujiao';
                break;
        }
        soundMngr.instance.playOtherAudioPoker(fenStr, playerSex);
    },
    //叫地主环节结束显示底牌和隐藏叫分文本
    showDizhuInfo: function () {
        var cards = GameDataDDZ.gameStartData.cards;
        var multipleNum = GameDataDDZ.gameStartData.multiple;
        this.showHoleCards(cards);
        var jiaofenTextNode = cc.find('jiaofenSps', this.cardsNode);
        this.hideNodeChild(jiaofenTextNode);
        this.changeMultiple(multipleNum);

        //隐藏叫分状态
        this.waitJiaoFen.active = false;
    },
    //隐藏底牌
    hideHoleCards: function () {
        var HoleCardsNode = cc.find('cards', this.HoleCardsNode);
        for (var key in HoleCardsNode.children) {
            this.showHoleCardContent(HoleCardsNode.children[key], 'back');
        }
    },
    //显示底牌
    showHoleCards: function (cards) {
        if (cards != undefined) {
            var HoleCardsNode = cc.find('cards', this.HoleCardsNode);
            var that = this;
            for (let i = 0; i < HoleCardsNode.childrenCount; i++) {
                let cardNode = cc.find('dipai_card' + i, HoleCardsNode);
                //播放翻牌效果
                var action1 = cc.scaleTo(0.25, 0, 0.5);
                var action2 = cc.scaleTo(0.25, 0.45, 0.5);
                cardNode.runAction(cc.sequence(action1, action2));

                this.scheduleOnce(function () {
                    that.showHoleCardContent(cardNode, cards[i])
                }, 0.3)
            }
            this.jiaofenNode.active = false;
        }
    },
    showHoleCardContent: function (cardNode, cardId) {
        cardNode.getComponent(cc.Sprite).spriteFrame = null;
        var iconUrl = 'resources/ddz/UI/pokers/poker_' + cardId + '.png';
        var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
        cardNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
    },
    //托管
    showDeputeInfo: function() {
        for (var key in GameDataDDZ.deputeInfo)
        {
            var pos = GameDataDDZ.getPosByUid(key);
            var ObtainNode = cc.find('actions', this.cardsNode);
            if (GameDataDDZ.deputeInfo[key] == 0)
            {
                switch(pos) {
                    case 'down': {
                        this.handCardMask.off(cc.Node.EventType.TOUCH_START, function(){});
                        this.trustBtn.on(cc.Node.EventType.TOUCH_END, this.onTrustBtnTouchEnd);
                        this.handCardMask.active = false;
                        this.noTrustNode.active = false;
                        this._trusteeshipFlag = false;
                        sendEvent('ddz-onShowObtainNode');
                    }break;
                    default:break;
                }
            }
            else if (GameDataDDZ.deputeInfo[key] == 1)
            {
                switch(pos) {
                    case 'down': {
                        this.handCardMask.on(cc.Node.EventType.TOUCH_START, function(){});
                        this.trustBtn.off(cc.Node.EventType.TOUCH_END, this.onTrustBtnTouchEnd);
                        ObtainNode.active = false;
                        this.handCardMask.active = true;
                        this.noTrustNode.active = true;
                        this._trusteeshipFlag = true;
                    }break;
                    default:break;
                }
            }
        }
    },
    easeCubicActionTimer: function(node) {
        node.opacity = node.opacity - 51;
    },
    
    easeCubicAction: function(node) {
        var index = 0;
        var that = this;
        var timerCall = function(){
            index++;
            that.easeCubicActionTimer(node);
            if (index >= 5) {
                node.active = false;
                node.opacity = 255;
                that.unschedule(timerCall);
            }
        };
        this.schedule(timerCall, 0.1);
    },
    //显示当前玩家操作按钮控件
    showObtainNode: function () {
        if(gameDefine.roomType.Room_Match == GameData.room.opts.roomType) {
            this.trustBtn.active = true;
        } else {
            this.trustBtn.active = false;
        }
        this.disCardArry = [];

        var uid = GameDataDDZ.currObtainPlayerData.uid;
        var isPass = GameDataDDZ.currObtainPlayerData.flag;
        var hintFlag = GameDataDDZ.currObtainPlayerData.hintFlag;

        //播放特殊音效 不出大你压死
        this._effcetFlag = isPass;

        var ObtainNode = cc.find('actions', this.cardsNode);
        var passBtn = cc.find('actions/btnPass', this.cardsNode);
        var hintBtn = cc.find('actions/btnTishi', this.cardsNode);
        var disBtn = cc.find('actions/btnDisCard', this.cardsNode);

        if (GameData.player.uid == uid) {
            ObtainNode.active = true;
            //设置不出 提示按钮状态
            if (isPass) {
                passBtn.active = true;
                hintBtn.active = true;
                disBtn.active = true;
                if (!hintFlag) {
                    hintBtn.active = false;
                    disBtn.active = false;
                    this.passNode.active = true;
                    var that = this;
                    this.scheduleOnce(function() {
                        that.easeCubicAction(that.passNode);
                    }, 1);
                }
            } else {
                passBtn.active = false;
                hintBtn.active = false;
                if (hintFlag) {
                    disBtn.active = true;
                }
            }
            if (this._trusteeshipFlag == true) {
                ObtainNode.active = false;
            }
        } else {
            ObtainNode.active = false;
        }

        this.stopClockMusic();
        //显示闹钟     
        this.showClocks(uid);
        //一轮后隐藏当前玩家出的poker
        var pos = GameData.tablePos[uid];
        var dispokerNode;
        switch (pos) {
            case 'down':
                dispokerNode = cc.find('layer_down/cardDis', this.cardsNode);
                break;
            case 'right':
                dispokerNode = cc.find('layer_right/cardDis', this.cardsNode);
                break;
            case 'left':
                dispokerNode = cc.find('layer_left/cardDis', this.cardsNode);
                break;
            case 'up':
                dispokerNode = cc.find('layer_up/cardDis', this.cardsNode);
                break;
            default:break;
        }
        //隐藏不出文本
        this.hidePassNode(pos);
        if (dispokerNode != undefined) {
            this.hideNodeChild(dispokerNode);
        }

        //当玩家剩余排数为1时默认谈起
        var myPokerNum = GameDataDDZ.getMyHandCards().length;
        if (!passBtn.active && !hintBtn.active && myPokerNum == 1) {
            for (var key in this.handCardLayOut.children) {
                if (this.handCardLayOut.children[key].active == true && GameData.player.uid == uid) {
                    if (this.handCardLayOut.children[key].y == this.defaultPokerY)
                    {
                        this.handCardLayOut.children[key].y += 30;
                        this.disPokerArry.push(this.handCardLayOut.children[key]);
                    }
                }
            }
        }
        this.setDisCardBtnStatus();
    },
    hidePassNode: function(pos) {
        var show = false;
        switch (pos) {
            case 'down':
                var node = cc.find('buchuLb0', this.buchuNodes);
                node.active = show;
                break;
            case 'right':
                var node = cc.find('buchuLb1', this.buchuNodes);
                node.active = show;
                break;
            case 'left':
                var node = cc.find('buchuLb2', this.buchuNodes);
                node.active = show;
                break;
            default:break;
        }
    },
    // 出牌
    onDisCardClick: function () {
        var cardsNode = cc.find('cardHand/handLayout', this.play_layer_down);
        //获得出牌的数组
        this.disCardArry = [];
        var key;
        for (key in this.disPokerArry) {
            var cardId = this.disPokerArry[key].getComponent('Card').id;
            this.disCardArry.push(cardId);
        }
        //poker复位
        // this.resetPokerPos();

        DDZHandler.getInstance().requestOnDisCard(this.disCardArry, function (rtn) {});

        var i = 0;
        for (key in cardsNode.children) {
            if (cardsNode.children[key].y == this.defaultPokerY) {
                i++;
            }
        }
        if (i > 0 && this.disCardArry.length == 0) {
            createMoveMessage('请选择要出的牌!');
        }
    },
    //不出
    onPassCardClick: function () {
        var ObtainNode = cc.find('actions', this.cardsNode);
        ObtainNode.active = false;
        var errorCode = require('errorCode');
        DDZHandler.getInstance().requestOnPassCard(function (rtn) {
            if (rtn.result != errorCode.Success) {
                ObtainNode.active = true;
            }
        });
        //poker复位
        this.resetPokerPos();
    },
    //提示
    onHintClick: function () {
        DDZHandler.getInstance().requestOnHintCard(GameData.player.uid, function (data) {});
    },
    //不出音效and文字
    playPassEffect: function (data) {
        var uid = data.detail.uid;
        var playerSex = GameData.getPlayerSexByUid(uid);
        soundMngr.instance.playOtherAudioPoker('buyao', playerSex);
        this.showBuchuNode();
    },
    showBuchuNode: function () {
        var player = GameData.getPlayerByPos('down');
        var cards = GameDataDDZ.getDisPoker(player.uid);
        
        var parent = cc.find('buchuLb0', this.buchuNodes);
        this.showbuchuStr(player, parent, cards);

        player = GameData.getPlayerByPos('right');
        cards = GameDataDDZ.getDisPoker(player.uid);
        
        parent = cc.find('buchuLb1', this.buchuNodes);
        this.showbuchuStr(player, parent, cards);

        player = GameData.getPlayerByPos('left');
        cards = GameDataDDZ.getDisPoker(player.uid);
        
        parent = cc.find('buchuLb2', this.buchuNodes);
        this.showbuchuStr(player, parent, cards);
    },
    showbuchuStr: function (player, node, cards) {
        if (cards == undefined) return;
        if (cards[0] == 0) {
            node.active = true;
        } else if (cards.length == 0) {
            node.active = false;
        }
    },

    disPoker: function (data) {
        var uid = data.detail.uid;
        var cardNum = GameDataDDZ.getHandCardNum(uid);
        if (cardNum <= 2) {
            var sex = GameData.getPlayerSexByUid(uid);
            this.scheduleOnce(function () {
                soundMngr.instance.playOtherAudioPoker('baojing' + cardNum, sex);
            }, 1);
        }
        this.showDisPoker();
    },

    //显示桌面出的牌
    showDisPoker: function () {
        var player = GameData.getPlayerByPos('down');
        var cards = GameDataDDZ.getDisPoker(player.uid);
        
        if (player && GameDataDDZ.cards[player.uid]) {
            this.play_layer_down.active = true;
            this.showPokerCards(player, this.play_layer_down, cards);
        } else {
            this.play_layer_down.active = false;
        }

        player = GameData.getPlayerByPos('right');
        cards = GameDataDDZ.getDisPoker(player.uid);
        
        if (player && GameDataDDZ.cards[player.uid]) {
            this.play_layer_right.active = true;
            this.showPokerCards(player, this.play_layer_right, cards);
        } else {
            this.play_layer_right.active = false;
        }

        player = GameData.getPlayerByPos('left');
        cards = GameDataDDZ.getDisPoker(player.uid);
        
        if (player && GameDataDDZ.cards[player.uid]) {
            this.play_layer_left.active = true;
            this.showPokerCards(player, this.play_layer_left, cards);
        } else {
            this.play_layer_left.active = false;
        }

    },
    //显示桌面Poker的信息
    showPokerCards: function (player, parent, cards) {
        var uid = GameDataDDZ.currObtainPlayerData.uid;
        var cardNode = cc.find('cardDis', parent);

        //一轮后隐藏当前玩家出的poker
        if (cards == undefined) return;
        this.hideNodeChild(cardNode)
        //出牌位置显示居中
        if (parent == this.play_layer_down) {
            var i = Math.ceil(cardNode.childrenCount / 2) - Math.ceil(cards.length / 2);
            for (var j = 0; j < cards.length; j++) {
                var node = cc.find('dis_' + (i + j), cardNode);
                //判断不出条件
                if (cards[0] == 0) {
                    node.active = false;
                } else {
                    node.active = true;
                }
                if (player.uid == GameDataDDZ.game.dizhuUid) {
                    this.addDizhuSign(node, 'dis');
                } else {
                    this.removeDizhuSign(node);
                }
                this.showCardContent(node, cards[j]);
            }
        } else {
            for (var k = 0; k < cards.length; k++) {
                var node = cc.find('dis_' + k, cardNode);
                //判断不出条件
                if (cards[0] == 0) {
                    node.active = false;
                } else {
                    node.active = true;
                }
                if (player.uid == GameDataDDZ.game.dizhuUid) {
                    this.addDizhuSign(node, 'dis');
                } else {
                    this.removeDizhuSign(node);
                }
                this.showCardContent(node, cards[k]);
            }
        }

    },
    //显示钟表倒计时
    showClocks: function (uid) {
        if (uid == undefined) return;
        var player = GameData.getPlayerByPos('down');
        var clockNodes = cc.find('cloock0', this.clockNodes);
        this.showClockContent(player, clockNodes, uid);

        player = GameData.getPlayerByPos('right');
        clockNodes = cc.find('cloock1', this.clockNodes);
        this.showClockContent(player, clockNodes, uid);

        player = GameData.getPlayerByPos('left');
        clockNodes = cc.find('cloock2', this.clockNodes);
        this.showClockContent(player, clockNodes, uid);

    },
    showClock: function(uid) {
        if (uid == undefined) return;
        var player = GameData.getPlayerByPos('down');
        var clockNodes = cc.find('cloock0', this.clockNodes);
        this.showClockContent(player, clockNodes, uid);
    },
    showClockContent: function (player, parent, uid) {
        if (GameDataDDZ.curWatchData.time != undefined)
        {
            if (Math.floor(GameDataDDZ.curWatchData.time / 1000) != 0) {
                this._countdown_index = Math.floor(GameDataDDZ.curWatchData.time / 1000);
            }
        } else {
            this._countdown_index = 15;
        }

        if (player.uid == uid) {
            parent.active = true;
            this.PLayerUID = uid;
            this._currClockNodes = parent;
            this.runCountDown();
            this.startCoundDown();
        }
    },
    startCoundDown: function () {
        this.schedule(this.runCountDown, 1);
    },
    runCountDown: function () {
        this.showCountDown(this._countdown_index);
        if (this._countdown_index < 1) {
            if (gameDefine.roomType.Room_Match == GameData.room.opts.roomType) {
                this.stopClockMusic();
                this.unschedule(this.runCountDown);
            } else {
                this._countdown_index = 15;
            }
        } else {
            var action1 = cc.blink(0.5, 3);
            //只有当前玩家能听到倒计时
            if (this._countdown_index == 3 && this.PLayerUID == GameData.player.uid) {
                this._currClockNodes.runAction(action1);
                soundMngr.instance.playAudioOther('countdown');
            }
            this._countdown_index--;
        }
    },
    showCountDown: function (num) {
        var timeStr = num;
        var timeLabel = cc.find('timeLb', this._currClockNodes);
        if (num < 10 && num > 0) {
            timeStr = '0' + num;
        } else if (num == 0) {
            timeStr = 0;
        }
        timeLabel.getComponent(cc.Label).string = timeStr;
    },
    hideDisCards: function () {
        var downDisCardNode = cc.find('cardDis', this.play_layer_down);
        var leftDisCardNode = cc.find('cardDis', this.play_layer_left);
        var rightDisCardNode = cc.find('cardDis', this.play_layer_right);

        this.hideNodeChild(downDisCardNode);
        this.hideNodeChild(leftDisCardNode);
        this.hideNodeChild(rightDisCardNode);
    },
    hideHandCards: function () {
        var downHandCardNode = cc.find('cardHand/handLayout', this.play_layer_down);
        var leftHandCardNode = cc.find('cardHand', this.play_layer_left);
        var rightHandCardNode = cc.find('cardHand', this.play_layer_right);

        this.hideNodeChild(downHandCardNode);
        this.hideNodeChild(leftHandCardNode);
        this.hideNodeChild(rightHandCardNode);
    },

    //金币场剩余手牌显示
    showSurplusPoker: function() {
        for (var index = 0; index < GameData.joiners.length; index++)
        {
            var pos = GameDataDDZ.getPosByUid(GameData.joiners[index].uid);
            switch(pos) 
            {
                case 'left':
                    var leftDisCardNode = cc.find('cardDis', this.play_layer_left);
                    this.showSurplusCards(leftDisCardNode, GameData.joiners[index].uid);
                    break;
                case 'right':
                    var rightDisCardNode = cc.find('cardDis', this.play_layer_right);
                    this.showSurplusCards(rightDisCardNode, GameData.joiners[index].uid);
                    break;
                default:break;
            }
        }
    },

    showSurplusCards: function(pokerNode, uid) {
        var cards = GameDataDDZ.getHandCards(uid);
        if( cards == undefined){
            return;
        }
        for (var i = 0; i < cards.length; i++) {
            var node = cc.find('dis_' + i, pokerNode);
            node.active = true;
            node.getComponent(cc.Sprite).spriteFrame = null;
            var iconUrl = 'resources/ddz/UI/pokers/poker_' + cards[i] + '.png';
            var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
            node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        }
    },

    //显示赢家img节点
    showWinNode: function (data) {
        this._dealEnd = false;
        this.passNode.active = false;
        this.noTrustNode.active = false;
        this.handCardMask.active = false;
        this.actionLayer.active = false;

        //关闭倒计时
        this.stopClockMusic();
        //隐藏报警icon
        this.hideNodeChild(this.warningNode);
        //隐藏不出文本节点
        this.hideNodeChild(this.buchuNodes);
        //判断金币场
        this.showSurplusPoker();

        sendEvent('HideReadyNode');
    },

    //游戏结束音效
    playGameEndSound: function() {
        var myScore = 0;
        //判断是金币场
        if(gameDefine.currencyType.Currency_Coin == GameData.room.opts.currencyType){
            var coinData = RoomHandler.getCoinData();
            if(coinData && coinData.coin){
                myScore = coinData.coin[GameData.player.uid];
            } else {
                return;
            }
        } else {
            myScore = GameDataDDZ.resultData.score[GameData.player.uid];
        }
        //播放勝利失败音效
        if (myScore > 0) {
            soundMngr.instance.playOtherAudioPoker('shengli', null);
        } else {
            soundMngr.instance.playOtherAudioPoker('shibai', null);
        }
    },

    //游戏结束动画
    showGameEndAction: function() {
        var player = GameData.getPlayerByPos('down');
        if (player && GameDataDDZ.cards[player.uid]) {
            this.play_layer_down.active = true;
        } else {
            this.play_layer_down.active = false;
        }

        player = GameData.getPlayerByPos('right');
        if (player && GameDataDDZ.cards[player.uid]) {
            this.play_layer_right.active = true;
        } else {
            this.play_layer_right.active = false;
        }

        player = GameData.getPlayerByPos('left');
        if (player && GameDataDDZ.cards[player.uid]) {
            this.play_layer_left.active = true;
        } else {
            this.play_layer_left.active = false;
        }

        this.playGameEndSound();
        return this.showWinnerAnimation();
    },

    //显示输赢动画和是否春天动画
    showWinnerAnimation: function () {
        if (GameDataDDZ.resultData.chuntian) {
            var self = this;
            this.scheduleOnce(function () {
                self.chuntianNode.active = true;
                var chuntianAnimation = self.chuntianNode.getComponent(dragonBones.ArmatureDisplay);
                chuntianAnimation.playAnimation('newAnimation', 1);
                chuntianAnimation.addEventListener(dragonBones.EventObject.COMPLETE, function() {
                    self.chuntianNode.active = false;
                }, this);
                soundMngr.instance.playOtherAudioPoker('chuntian', null);
            }, this._dragonAnimtaionNum * 1.5 + 1);
            return this._dragonAnimtaionNum * 1.5 + 3;
        } else {
            return 3;
        }
    },
    getJiaofenImg: function (num) {
        var img = '';
        switch (parseInt(num)) {
            case 1:
                img = 'resources/ddz/UI/common/artword/artword_1fen.png';
                break;
            case 2:
                img = 'resources/ddz/UI/common/artword/artword_2fen.png';
                break;
            case 3:
                img = 'resources/ddz/UI/common/artword/artword_3fen.png';
                break;
            case 4:
                img = 'resources/ddz/UI/common/artword/artword_bujiao.png';
                break;
        }
        return img;
    },
    //显示报警节点
    showWarningNode: function (data) {
        var warningNode;
        var player = GameData.getPlayerByPos('down');
        if (player && GameDataDDZ.cards[player.uid]) {
            warningNode = cc.find('warning0', this.warningNode);
            this.showWarningContent(player.uid, warningNode);
        }

        player = GameData.getPlayerByPos('right');
        if (player && GameDataDDZ.cards[player.uid]) {
            warningNode = cc.find('warning1', this.warningNode);
            this.showWarningContent(player.uid, warningNode);
        }

        player = GameData.getPlayerByPos('left');
        if (player && GameDataDDZ.cards[player.uid]) {
            warningNode = cc.find('warning2', this.warningNode);
            this.showWarningContent(player.uid, warningNode);
        }
    },
    //显示报警
    showWarningContent: function (uid, node) {
        var cardNum = GameDataDDZ.getHandCardNum(uid);
        if (cardNum <= 2) {
            node.active = true;
            var anima = node.getComponent(cc.Animation);
            anima.play('warningAnimation');
        } else {
            node.active = false;
        }
    },
    //判断出牌牌型
    showDisCardType: function (data) {
        var DiscardType = data.detail.type;
        var multiple = data.detail.multiple;
        //清空动作队列
        this._dragonAnimtaionNum = 0;
        var playerSex = GameData.getPlayerSexByUid(data.detail.uid);
        //播放出牌类型音效
        soundMngr.instance.playAudioPokerDisType(data, playerSex, this._effcetFlag);
        //播放出牌音效
        soundMngr.instance.playOtherAudioPoker('discard', null);
        //飞机
        if (DiscardType.substring(0, DiscardType.length - 1) == 'aircraft' || DiscardType == 'aircraft' || DiscardType == 'tribletraights') {
            //播放飞机音效
            soundMngr.instance.playOtherAudioPoker('plane', null);
            // this.planeNode.active = true;
            this._dragonAnimtaionNum++;
            this.DDZplayAnimation(this.planeNode);
        }
        //炸弹
        if (DiscardType == 'bomb') {
            this._dragonAnimtaionNum++;
            //播放炸弹音效
            soundMngr.instance.playOtherAudioPoker('bomb', null);
            this.DDZplayAnimation(this.bobmAinmation);
        }
        //王炸
        if (DiscardType == 'jokerBomb') {
            this._dragonAnimtaionNum++;
            //播放炸弹音效
            soundMngr.instance.playOtherAudioPoker('bomb', null);
            this.DDZplayAnimation(this.huojianAinmation);
        }
        this.changeMultiple(multiple);

    },
    //改变顶部倍数显示
    changeMultiple: function (num) {
        if (num == undefined) return;
        var multipleNum = cc.find('multipleNum', this.multipleNode);
        this.showNodeChild(this.multipleNode);
        multipleNum.getComponent(cc.Label).string = "X" + num;
    },
    showNodeChild: function (parent) {
        for (var key in parent.children) {
            parent.children[key].active = true;
        }
    },
    //添加poker到出牌数组
    setDisPokerArry: function (data) {
        var pokerArry = data.detail;
        this.disPokerArry = [];
        for (var i = 0; i < pokerArry.length; i++) {
            var pokerName = pokerArry[i];
            for (var key in this.handCardLayOut.children) {
                if (pokerName == this.handCardLayOut.children[key].name && this.handCardLayOut.children[key].active == true) {
                    this.disPokerArry.push(this.handCardLayOut.children[key]);
                }
            }
        }
        this.setDisCardBtnStatus();
    },
    //相关动画飞机、炸弹、火箭
    DDZplayAnimation: function (animNode) {
        animNode.active = true;
        var anima = animNode.getComponent(dragonBones.ArmatureDisplay);
        anima.playAnimation('newAnimation', 1);
        anima.addEventListener(dragonBones.EventObject.COMPLETE, function() {
            animNode.active = false;
        }, this);
    },

    //poker复位
    resetPokerPos: function () {
        var cardsNode = cc.find('cardHand/handLayout', this.play_layer_down);
        for (var key in cardsNode.children) {
            cardsNode.children[key].y = this.defaultPokerY;
        }
        this.disPokerArry.splice(0, this.disPokerArry.length);

        this.setDisCardBtnStatus();
    },
    //增加连点重置poker的位置方法
    DoubleClick: function () {
        var time = (new Date()).getTime();
        if (time - this._currTime < 500) {
            this.resetPokerPos();
            this.disPokerArry = [];
        }
        this._currTime = time;

        this.setDisCardBtnStatus();
    },
    //显示提示能出的poker
    showHintCard: function (data) {
        var cards = data.detail.cards;
        var uid = data.detail.uid;
        this.disPokerArry = [];

        var downHandCardNode = cc.find('layer_down/cardHand/handLayout', this.cardsNode);
        for (var key in downHandCardNode.children) {
            downHandCardNode.children[key].y = this.defaultPokerY;
        }
        for (var key in downHandCardNode.children) {
            var card = downHandCardNode.children[key].getComponent('Card');
            for (var i = 0; i < cards.length; i++) {
                if (card.id == cards[i] && downHandCardNode.children[key].active == true) {
                    downHandCardNode.children[key].y += 30;
                    this.disPokerArry.push(downHandCardNode.children[key]);
                }
            }
        }
        this.setDisCardBtnStatus();
    },
    stopClockMusic: function () {
        this.unschedule(this.runCountDown);
        //隐藏闹钟节点
        this.hideNodeChild(this.clockNodes);
    },
    getRuleStr: function () {
        if (GameData.room.opts) {
            return getRuleStrDDZ(GameData.room.opts);
        }
    },
    //增加地主标识
    addDizhuSign: function (node, type) {
        var dizhuSign = cc.instantiate(this.dizhuSign);
        if (type == 'dis') {
            dizhuSign.setPosition(cc.p(-40, 45));
        }
        node.addChild(dizhuSign);
    },
    //移除地主标识
    removeDizhuSign: function (node) {
        node.removeAllChildren(true);
    },

    connectRecurrence: function() {
        var flag = false;
        if (GameData.room.opts) {
            flag = true;
        }
        if (!flag) {
            return;
        }
        if (GameData.room.opts.kicking == true) {
            this.connectTiChuai();
        }
    },

    connectTiChuai: function() {
        if (GameDataDDZ.isEmptyObject(GameData.joinContact)) {
            return;
        }
        if (GameDataDDZ.isEmptyObject(GameDataDDZ.kicking)) {
            return;
        }
        if (GameData.joinContact.uid != GameData.player.uid) {
            return;
        }
        for (var key in GameDataDDZ.kicking.kicking) {
            if (key == GameData.player.uid) {
                this.tiBtnNode.active = false;
                return;
            }
        }
        if (GameDataDDZ.game.dizhuUid == GameData.player.uid) {
            if (GameDataDDZ.objectLen(GameDataDDZ.kicking.kicking) == 2) {
                this.showWatch();
                var index = 0;
                for (var key in GameDataDDZ.kicking.kicking) {
                    if (GameDataDDZ.kicking.kicking[key] == 0) {
                        index++;
                    }
                }
            }
        } else {
            this.showWatch();
            this.tiBtnNode.active = true;
        }
    },

    onTiBtnChecked: function(evt, customEventData) {
        this.tiBtnNode.active = false;
        this.stopClockMusic();
        DDZHandler.getInstance().requestTiChuai(customEventData, function(rtn) {});
    },

    onTrustBtnTouchEnd: function() {
        DDZHandler.getInstance().requestDepute();
    },  

    onNoTrustBtnChecked: function(evt, customEventData) {
        if (customEventData == 2) {
            this.noTrustNode.active = false;
        }
        DDZHandler.getInstance().requestDepute();
    },

    //重置出牌按钮
    setDisCardBtnStatus: function(){
        var status = false;
        if(this.disPokerArry.length > 0){
            status = true;
        }
        var disCardNode = cc.find('btnDisCard', this.actionLayer);
        disCardNode.getComponent('cc.Button').interactable = status;
    },

    //手牌节点恢复位置
    handCardRestoration: function(){
        var cardsHandNode = cc.find('cardHand/handLayout', this.play_layer_down);
        if(cardsHandNode == undefined){
            return;
        }
        var index = 0;
        for(var i = 19;i >= 0;i--){
            var node = cc.find('hand_'+ i, cardsHandNode);
            if(node){
                node.x = 53*index;
                index++;
            }
        }
    },

    //隐藏所有的加倍和不加倍标志
    hideIsDoubleFlag: function(){
        this.tiIcon_right.active = false;
        this.tiIcon_left.active = false;
        this.tiIcon_down.active = false;
        this.undouble_left.active = false;
        this.undouble_right.active = false;
        this.undouble_down.active = false;
    }
});