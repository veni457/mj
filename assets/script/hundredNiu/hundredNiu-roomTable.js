var soundMngr = require('SoundMngr');
var gameDefine = require('gameDefine');
var roomHandler = require('roomHandler');
var pokerAnimBase = require('pokerAnimationBase');
var HundredNiuHandler = require('hundredNiuHandler');
var niuniuPokerHandler = require('niuniuPokerHandler');
cc.Class({
    extends: cc.Component,
    properties: {
        playerNodes: [cc.Node],
        //发牌器
        dealerNode: cc.Node,
        //扑克节点
        pokerCradsNode: cc.Node,
        //扑克牌型动画
        pokerTypeNode: cc.Node,
        otherPokerTypePrefab: cc.Prefab,
        //桌面上筹码数量
        selfCostChips: cc.Node,
        allCostChips: cc.Node,
        //筹码飘飞
        chipPrefab: cc.Prefab,
        chipsNode: cc.Node,
        scoreParent: cc.Node,
        scoreNode: cc.Prefab,
        winPlayerNode:cc.Node,
        //区域节点
        areaNode: cc.Node,
        //区域赢家动画
        areaWin: cc.Node,
        //动画节点
        actionNode: cc.Node,
        //倒计时节点
        countNode: cc.Node,
        //下注筹码选择
        toggleNode: cc.Node,
        toggle0: cc.Toggle,
        toggle1: cc.Toggle,
        toggle2: cc.Toggle,
        toggle3: cc.Toggle,
        toggle4: cc.Toggle,
        //下注遮布
        maskNode: cc.Node,
        //神算子标记
        shensuanNode: cc.Node,
        guideNodePrefab: cc.Prefab,
    },
    onLoad: function () {
        this.handlerMsg();
        this.pokerAnimBase = new pokerAnimBase();
        this.NowZhuang = 0;
        this.savePokerData();
        this.initUI();
        this.niuniuStayType = niuniuPokerHandler.getGameStatus();
        this.niuniuPokerType = niuniuPokerHandler.getPokerType();
    },
    handlerMsg: function () {
        require('util').registEvent('niuhun-onGameInfo', this, this.getClipsStatus);
        require('util').registEvent('niuhun-onBaoZhuang', this, this.baoZhuangAnim);
        require('util').registEvent('niuhun-onZhuangCoin', this, this.showTipsForZhuang);
        require('util').registEvent('niuhun-onGameChips', this, this.changeChipsAndScore);
        require('util').registEvent('niuhun-onGameCoin', this, this.showChipsFlyAnimation);
    },
    onDestroy: function () {
        unrequire('util').registEvent('niuhun-onGameInfo', this, this.getClipsStatus);
        unrequire('util').registEvent('niuhun-onBaoZhuang', this, this.baoZhuangAnim);
        unrequire('util').registEvent('niuhun-onZhuangCoin', this, this.showTipsForZhuang);
        unrequire('util').registEvent('niuhun-onGameChips', this, this.changeChipsAndScore);
        unrequire('util').registEvent('niuhun-onGameCoin', this, this.showChipsFlyAnimation);
        this.unscheduleAllCallbacks();
    },
    /*-------------- 初始化 ----------------*/
    initUI: function () {
        this.coinFlyData();
        this.initRoundData();
        this.initPokerCards();
        this.initChipsOnDesk();
    },
    initChipsOnDesk: function () {
        var selfCostLen = this.selfCostChips.childrenCount;
        for (var i = 0; i < selfCostLen; i++) {
            var child = this.selfCostChips.children[i];
            if(child){
                child.getComponent(cc.Label).string = 0;
            }
        }
        var allCostLen = this.allCostChips.childrenCount;
        for (var j = 0; j < allCostLen; j++) {
            var child = this.allCostChips.children[j];
            if(child){
                child.getComponent(cc.Label).string = 0;
            }
        }
        for (var i = 0; i < this.chipsNode.childrenCount; i++) {
            var child = this.chipsNode.children[i];
            child.removeAllChildren();
        }
        for (var i = 0; i < this.shensuanNode.childrenCount; i++) {
            var child = this.shensuanNode.children[i];
            child.removeAllChildren();
        }
    },
    initRoundData: function () {
        this.playSign = -1;
        this.clipsList = [];
        this.clipsChoose = 0;
        this.countNode.active = false;
        this.getRoomInfo();
        this.getClipsStatus();
    },
    initPokerCards: function () {
        for (var index = 0; index<this.pokerCradsNode.childrenCount; index++) {
            var poker = this.pokerCradsNode.children[index];
            for (var i = 0; i < poker.childrenCount; i++) {
                poker.children[i].active = false;
                var pokerScp = poker.children[i].getComponent("niuNiuPoker");
                pokerScp.initCardInfo(null);
            }
        }
        //初始化牌型动画
        for (var j = 0; j < this.pokerTypeNode.childrenCount; j++) {
            var child = this.pokerTypeNode.children[j];
            if (child) {
                child.removeAllChildren();
            }
        }
        //胜利动画初始化
        for (var i = 0; i < this.areaWin.childrenCount; i++) {
            var animationNode = this.areaWin.children[i];
            animationNode.active = false;
        }
    },
    //飘飞筹码相关
    coinFlyData: function () {
        this._coinIndex = 0;
        this.chipsNum = 50;
        this._coinList = [];
        this._winnerIndex = 0;
        this._winnerToLoser = {winPos: [], losePos: [], winnerList: {0:[],1:[],2:[],3:[]}}; //赢区域，输区域，闲家赢家列表
    },
    //发牌动画数据保存
    savePokerData: function () {
        this.pokerArr = [];
        this.pokerPosArr = [];
        for (var j = 0; j<this.pokerCradsNode.childrenCount; j++) {
            var poker = this.pokerCradsNode.children[j];
            for (var i = 0; i<5; i++) {
                this.pokerArr.push(poker.children[i]);
                this.pokerPosArr.push(poker.children[i].position);   
            }
        }
    },
    getRoomInfo: function () {
        this.clipsList = niuniuPokerHandler.XIAZHU[roomHandler.room.opts.scorelv];
        var playerCoin = GameData.player.coin;
        for (var i = this.clipsList.length - 1; i >= 0; i--) {
            if (this.clipsList[i] < playerCoin*0.2) {
                this.clipsChoose = this.clipsList[i];
                break;
            }
        }
    },
    saveClipsChoose: function () {
        this.toggle0.isChecked = this.clipsChoose == this.clipsList[0] ? true : false;
        this.toggle1.isChecked = this.clipsChoose == this.clipsList[1] ? true : false;
        this.toggle2.isChecked = this.clipsChoose == this.clipsList[2] ? true : false;
        this.toggle3.isChecked = this.clipsChoose == this.clipsList[3] ? true : false;
        this.toggle4.isChecked = this.clipsChoose == this.clipsList[4] ? true : false;
    },
    getClipsStatus: function () {
        var HundredStatus = niuniuPokerHandler.HUNDREDNIUSTATUS;
        if (HundredNiuHandler.status != HundredStatus.CHIPS 
            || GameData.player.uid == HundredNiuHandler.zhuangUid) {
            this.initClipsMask();
        } else {
            this.showClipsMask();
            this.saveClipsChoose();
        }
        var zhuangSp = cc.find('zhuangSign', this.countNode.parent);
        var ac = GameData.player.uid == HundredNiuHandler.zhuangUid ? true : false;
        zhuangSp.active = ac;
    },
    //筹码选择蒙版
    showClipsMask: function () {
        var toggleGroup = this.toggleNode.getComponent('cc.ToggleGroup');
        toggleGroup.allowSwitchOff = false;

        var xuyaBtn = cc.find('xuyaBtn',this.toggleNode.parent);
        xuyaBtn.getComponent('cc.Button').interactable = true;

        var selfSumNum = HundredNiuHandler.getselfChipsSum();
        var playerCoin = GameData.player.coin;
        var listLen = this.clipsList.length - 1;
        for (var i = listLen; i >= 0; i--) {
            var selfSum = selfSumNum + this.clipsList[i];
            if (selfSum >= playerCoin*0.2) {
                var maskBtn = cc.find('mask'+i, this.maskNode);
                maskBtn.active = true;
                var toggle = cc.find('toggle'+i,this.toggleNode);
                if (toggle.getComponent('cc.Toggle').isChecked == true && i != 0) {
                    var lastToggle = cc.find('toggle'+(i-1),this.toggleNode);
                    lastToggle.getComponent('cc.Toggle').isChecked = true;
                    this.clipsChoose = this.clipsList[i-1];    
                }
                toggle.getComponent('cc.Toggle').isChecked = false;
                toggle.getComponent('cc.Toggle').interactable = false;
            } else {
                var maskBtn = cc.find('mask'+i, this.maskNode);
                maskBtn.active = false;
                var toggle = cc.find('toggle'+i,this.toggleNode);
                toggle.getComponent('cc.Toggle').interactable = true;
            }
        }
    },
    initClipsMask: function () {
        var toggleGroup = this.toggleNode.getComponent('cc.ToggleGroup');
        toggleGroup.allowSwitchOff = true;
        for (var j = 0; j < this.maskNode.childrenCount; j++) {
            var maskBtn = this.maskNode.children[j];
            maskBtn.active = true;
        }
        for (var i = 0; i < this.toggleNode.childrenCount; i++) {
            var toggle = this.toggleNode.children[i];
            var toggleBtn = toggle.getComponent('cc.Toggle');
            toggleBtn.isChecked = false;
            toggleBtn.interactable = false;
        }
        var xuyaBtn = cc.find('xuyaBtn',this.toggleNode.parent);
        xuyaBtn.getComponent('cc.Button').interactable = false;
    },
    showTipsForZhuang: function() {
       //上庄条件判断
        var scorelev = roomHandler.room.opts.scorelv;
        var shangzhuangNum = getMatchShangZhuangFinal(gameDefine.GameType.Game_Niu_Hundred, scorelev);
        if (GameData.player.coin < shangzhuangNum) {
            niuniuCreateMoveMessage('未满足上庄条件');
        }
    },
    /*-------------- 动 画 ----------------*/
    startAnimation: function (callback) {
        HundredNiuHandler.isStartAnimationPlayed = true;
        if (this.NowZhuang != HundredNiuHandler.zhuangUid) {
            this.shangzhuangAnimation();
            var self = this;
            this.scheduleOnce(function(){
                self.gameStartAnimation(callback);
            },2);
        } else {
            this.gameStartAnimation(callback);
        }
        this.NowZhuang = HundredNiuHandler.zhuangUid;
    },
    //开始动画
    gameStartAnimation: function (callback) {
        soundMngr.instance.playHundredOther('start');
        var starActNode = cc.find('/beginXiaZhu',this.actionNode);
        starActNode.active = true;
        var anim = starActNode.getComponent(dragonBones.ArmatureDisplay);
        anim.playAnimation('kaishixiazhu',1);
        var self = this;
        this.scheduleOnce(function(){
            starActNode.active = false;
            HundredNiuHandler.isStartAnimationPlayed = false;
            callback();
        },1.5);
    },
    //上庄动画
    shangzhuangAnimation: function () {
        soundMngr.instance.playHundredOther('shangzhuang');
        var shangzhuang = cc.find('shangzhuang', this.actionNode);
        var zhuangName = cc.find('name',shangzhuang);
        zhuangName.getComponent('cc.Label').string = HundredNiuHandler.zhuangInfo.name;
        shangzhuang.active = true;
        var anim = shangzhuang.getComponent(dragonBones.ArmatureDisplay);
        anim.playAnimation('xxxyishangzhuang',1);
        this.zhuangHeadAnimation();
        var self = this;
        this.scheduleOnce(function(){
            shangzhuang.active = false;
        },1.5);
    },
    zhuangHeadAnimation: function () {
        var zhuangAc = cc.find('layer_ui_show/zhuangHead', this.node);
        var zhuangSign = cc.find('zhuang', zhuangAc);
        zhuangAc.active = true;
        var anim1 = zhuangAc.getComponent(dragonBones.ArmatureDisplay);
        anim1.playAnimation('newAnimation',0);
        var anim2 = zhuangSign.getComponent(dragonBones.ArmatureDisplay);
        anim2.playAnimation('newAnimation',1);
        var self = this;
        this.scheduleOnce(function(){
            zhuangAc.active = false;
        },1.5);
    },
    //下注结束动画
    chipsStopAnimation: function (callback) {
        soundMngr.instance.playHundredOther('stop');
        var endActNode = cc.find('/stopXiaZhu',this.actionNode);
        endActNode.active = true;
        var anim = endActNode.getComponent(dragonBones.ArmatureDisplay);
        anim.playAnimation('tingzhixiazhu',1);
        var self = this;
        this.scheduleOnce(function(){
            endActNode.active = false;
            self.dealAction();
            callback();
        },1.5);
    },
    //通杀
    showAllWinAnimation: function (type) {
        var tongying = cc.find('/tongying',this.actionNode);
        tongying.active = true;
        var anim = tongying.getComponent(dragonBones.ArmatureDisplay);
        if (type == 'zhuang') {
            anim.playAnimation('zhuangjiatongchi',1);
        }else if (type == 'xian') {
            anim.playAnimation('zhuangjiatongpei',1);
        }
        var self = this;
        this.scheduleOnce(function(){
            tongying.active = false;
        },1.5);
    },
    //赢家动画标记
    winnerAnimation: function (index) {
        var winerNode = cc.find('winAct'+index,this.winPlayerNode);
        winerNode.active = true;
        var anim = winerNode.getComponent(dragonBones.ArmatureDisplay);
        anim.playAnimation('newAnimation',1);
        var self = this;
        this.scheduleOnce(function(){
            winerNode.active = false;
        },1.5);
    },
    //区域赢家
    showWinIcon: function () {
        for (var i = 0; i < this.areaWin.childrenCount; i++) {
            var animationNode = this.areaWin.children[i];
            var winLb = cc.find('winLb',animationNode); 
            if (HundredNiuHandler.pokerResult[i]) {
                animationNode.active = false;
            } else {
                animationNode.active = true;
                var animation = winLb.getComponent(dragonBones.ArmatureDisplay);
                var anim = animationNode.getComponent(dragonBones.ArmatureDisplay);
                anim.playAnimation('faguang',0);
                animation.playAnimation('ying',1);
            }
        }
    },
    //爆庄
    baoZhuangAnim: function () {
        soundMngr.instance.playHundredOther('baozhuang');
        var baozhuang = cc.find('/baozhuang',this.actionNode);
        baozhuang.active = true;
        var anim = baozhuang.getComponent(dragonBones.ArmatureDisplay);
        anim.playAnimation('baozhuang',1);
        var self = this;
        this.scheduleOnce(function(){
            baozhuang.active = false;
        },1.5);
    },
    fapaiAnimation: function () {
        var fapai = cc.find('/fapai',this.actionNode);
        fapai.active = true;
        var anim = fapai.getComponent(dragonBones.ArmatureDisplay);
        anim.playAnimation('newAnimation',0);
    },
    /*-----------点击事件------------*/
    selectClips: function () {
        if (this.toggle0.isChecked) {
            this.clipsChoose = this.clipsList[0];
        } else if (this.toggle1.isChecked) {
            this.clipsChoose = this.clipsList[1];
        } else if (this.toggle2.isChecked) {
            this.clipsChoose = this.clipsList[2];
        } else if (this.toggle3.isChecked) {
            this.clipsChoose = this.clipsList[3];
        } else if (this.toggle4.isChecked) {
            this.clipsChoose = this.clipsList[4];
        }
    },
    clickSetClips: function (evt, area) {
        HundredNiuHandler.requestSetChips(this.clipsChoose, area, this.toggle0.interactable);
        if (HundredNiuHandler.status != niuniuPokerHandler.HUNDREDNIUSTATUS.CHIPS 
            || GameData.player.uid == HundredNiuHandler.zhuangUid) {
            this.initClipsMask();
        } else {
            this.showClipsMask();
        }
    },
    continueChips: function () {
        HundredNiuHandler.requestContinueChips();
    },
    /*------------发 牌--------------*/
    //发牌动画
    dealAction: function() {
        var self = this;
        this.fapaiAnimation();
        this.pokerAnimBase.dealAction(this.pokerArr,this.dealerNode.position,this.pokerPosArr,0.13,function(delayTime){
            self.scheduleOnce(function () {
                var fapai = cc.find('/fapai',self.actionNode);
                fapai.active = false;
                self.showAreaPokerCards();
            },delayTime);
        });
        //发牌音效
        for (var i = 0; i<this.pokerArr.length; i++) {
            this.scheduleOnce(function() {
                soundMngr.instance.playHundredOther('fapai');
            },0.1*(i+1));
        }
    },
    //亮牌
    showAreaPokerCards: function () {
        var pokerLen = this.pokerCradsNode.childrenCount;
        var pokerCards = HundredNiuHandler.pokerCards;
        for (var i = pokerLen - 1; i >= 0; i--) {
            this.delayTimeShowPoker(this.pokerCradsNode.children[i], pokerCards[i], i);
        }
    },
    //添加延时
    delayTimeShowPoker: function (handCardNode, cards, index) {
        var runNum = 5 - index;
        var self = this;
        setTimeout(function(){
            var cardPos = true;
            var playercardInfo = self.showPokerForm(index, cards, cardPos);
            self.rotatePoker(handCardNode, playercardInfo.newHandCards, index);
        },runNum*1200);
    },
    //显示亮牌形式
    showPokerForm: function (index, cards, cardPos) {
        var pokerTypeCards = [];
        if (HundredNiuHandler.pokerCards3[index]) {
            pokerTypeCards = HundredNiuHandler.pokerCards3[index];
        }
        var newArray = pokerTypeCards.concat(cards);
        var newHandCards = niuniuPokerHandler.unequally(newArray);
        var cardsType = HundredNiuHandler.pokerType[index];
        if (cardsType > this.niuniuPokerType.NIU_NONE && cardsType <= this.niuniuPokerType.NIU_NIU) {
            newHandCards.splice(3,0,0);  
            cardPos = false;
        }else {
            newHandCards.splice(5,0,0);
            cardPos = true;
        }
        return {newHandCards:newHandCards,cardPos:cardPos};
    },
    //翻牌动画
    rotatePoker: function (handCardNode, cards, index) {
        var self = this;
        var rotate = function (pokerScp, card, index) {
            var action1 = cc.scaleTo(0.25,0,0.3);
            var action2 = cc.scaleTo(0.25,0.3,0.3);
            pokerScp.runAction(cc.sequence(action1,action2, cc.callFunc(function () {
                var pokerScpInfo = pokerScp.getComponent('niuNiuPoker');
                self.showPokerContent(pokerScpInfo, card);
                // if (index == 0 && self.playSign != index) {
                //     self.showWinIcon();
                // }
                self.playCardType(index);
            }, self)));
        }
        for (var j = 0; j < handCardNode.childrenCount; j++) {
            var pokerScp = handCardNode.children[j];
            pokerScp.active = true;
            rotate(pokerScp, cards[j], index);
        }
    },
    //显示单张牌
    showPokerContent: function (handCardNode, cards) {
        if (cards == null) {
            handCardNode.initCardInfo(null);
        }else if (cards == 0) {
            handCardNode.clearCardsUI();
        }else {
            handCardNode.turnOver();
            handCardNode.initCardInfo(cards);
        }
    },
    //播放牌型
    playCardType: function (localIndex) {
        var record = null;
        if (HundredNiuHandler.pokerType) {
            record = HundredNiuHandler.pokerType[localIndex];
        }
        if (this.playSign == localIndex) return;
        //播放牌型动画
        if (record === undefined || record === null) return;
        
        var actNode = cc.find("act" + localIndex,this.pokerTypeNode);
        actNode.removeAllChildren();
        var pokerTypePrefab = this.otherPokerTypePrefab;
        pokerTypePrefab = cc.instantiate(pokerTypePrefab);
        if (record > this.niuniuPokerType.NIU_NONE && record <= this.niuniuPokerType.NIU_NIU) {
            pokerTypePrefab.position = cc.p(0,0);
        } else {
            pokerTypePrefab.position = cc.p(-7,0);
        }
        actNode.addChild(pokerTypePrefab);
        pokerTypePrefab.getComponent("pokerTypeAnimation").changeMaskBg(record);
        pokerTypePrefab.getComponent("pokerTypeAnimation").initFanInfo(record, 1);
        soundMngr.instance.playNiuNiuAudio(record, 2);
        pokerTypePrefab.getComponent("pokerTypeAnimation").pokerTypeAnim();
        
        if (record >= 10) {
            pokerTypePrefab.getComponent("pokerTypeAnimation").pokerAnimation();
        }
        
        this.playSign = localIndex;
    },
    //压筹码
    changeChipsAndScore: function (data) {
        if (!data) return;
        var ChipsData = data.detail;
        var turnUid = ChipsData.uid;
        var chipsArea = ChipsData.idx;
        var setChips = ChipsData.num;
        var selfChipsNum = ChipsData.all;
        var areaChipsNum = ChipsData.total;
        this.xingxingAnimation(turnUid, chipsArea);
        this.addChip(setChips, turnUid, chipsArea);
        this.addClipsNum(turnUid, chipsArea, selfChipsNum, areaChipsNum);
    },
    addClipsNum: function (turnUid, chipsArea, selfChipsNum, areaChipsNum) {
        var newValue = 0;
        if (selfChipsNum != null) {
            newValue = ConversionCoinValue(selfChipsNum, 2);
        }else {
            newValue = null;
        }
        var sumAreaNode = cc.find('chips'+chipsArea, this.allCostChips);
        var selfSetAreaNode = cc.find('chips'+chipsArea, this.selfCostChips);
        if (turnUid == GameData.player.uid) {
            selfSetAreaNode.getComponent(cc.Label).string = newValue;
        }
        sumAreaNode.getComponent(cc.Label).string = ConversionCoinValue(areaChipsNum, 2);
    },
    //筹码移动动画
    clipFlyToTableAnimation: function (clipNode, toArea) {
        var toAreaNode = cc.find('area'+toArea,this.areaNode);
        var posX = toAreaNode.x;
        var posY = toAreaNode.y;
        var x = posX - this.randomNum(-75, 75);
        var y = posY - this.randomNum(-100, 20);
        var action1 = cc.moveTo(0.4, cc.p(x, y));
        var action2 = cc.scaleTo(0.1, 0.6, 0.6);
        var actionC = cc.scaleTo(0.1, 0.4, 0.4);
        var action = cc.sequence(action1, action2, actionC);
        var action3 = cc.callFunc(function () {
            clipNode.removeFromParent(true);
        }, clipNode);
        var action4 = cc.fadeOut(0.1);
        soundMngr.instance.playHundredOther('chouma');
        var chipsParent = this.chipsNode.getChildByName('chips'+toArea);
        if (chipsParent.childrenCount > 30) {
            clipNode.runAction(cc.sequence(action, action4, action3)).easing(cc.easeCubicActionOut());
        } else {
            clipNode.runAction(action).easing(cc.easeCubicActionOut());
        }
    },
    randomNum: function (min, max) {
        var distance = max - min;
        var num = Math.random() * distance + min;
        return parseInt(num, 10);
    },
    addChip: function (data, turnerUid, toArea) {
        var score = data;
        if (data > 1000000) {
            score = data*0.2;
        }else {
            score = data;
        }
        var clip1Num = 0;
        var clip2Num = 0;
        var clip3Num = 0;
        var clip4Num = 0;
        var clip5Num = 0;
        this.coinArry = [];
        var scoreArry = [clip5Num, clip4Num, clip3Num, clip2Num, clip1Num];
        for (var i = 0; i < scoreArry.length; i++) {
            scoreArry[i] = this.spliceScore(score)[i];
        }

        for (var i = 0; i < scoreArry.length; i++) {
            for (var j = 0; j < scoreArry[i]; j++) {
                var localIdx = HundredNiuHandler.getPlayerPosByUid(turnerUid);
                var clipNode = cc.instantiate(this.chipPrefab);
                clipNode.scaleX = 0.4;
                clipNode.scaleY = 0.4;
                var handenode;
                if (localIdx == -1) {
                    handenode = cc.find('tableInfo/otherPlayer', this.node);
                } else if (localIdx == 0) {
                    switch (this.coinArry[i]) {
                        case 50: handenode = this.toggle0.node; break;
                        case 100: handenode = this.toggle1.node; break;
                        case 1000: handenode = this.toggle2.node; break;
                        case 10000: handenode = this.toggle3.node; break;
                        case 20000: handenode = this.toggle4.node; break;
                    }
                } else {
                    handenode = this.playerNodes[localIdx];
                    var moveLeft = cc.moveBy(0.1,cc.p(-8,0));
                    var moveRight = cc.moveBy(0.1,cc.p(8,0));
                    if (localIdx <= 3 || localIdx == 5) {
                        handenode.runAction(cc.sequence(moveRight, moveLeft));
                    } else if (localIdx == 4 || localIdx >= 6) {
                        handenode.runAction(cc.sequence(moveLeft, moveRight));
                    }
                }

                clipNode.parent = this.chipsNode.getChildByName('chips'+toArea);
                clipNode.getComponent('hundred_pokerPanel').setChipImg(this.coinArry[i]);
                clipNode.x = handenode.x;
                clipNode.y = handenode.y;
                clipNode.active = true;
                this.clipFlyToTableAnimation(clipNode, toArea);
            }
        }
        //this.allScore.string = ;
    },
    spliceScore: function (score) {
        //筹码分值
        var clip1 = 50;
        var clip2 = 100;
        var clip3 = 1000;
        var clip4 = 10000;
        var clip5 = 20000;
        var arry = [];
        this.coinArry = [clip5, clip4, clip3, clip2, clip1];
        for (var i = 0; i < this.coinArry.length; i++) {
            var num = Math.floor(score / this.coinArry[i]);
            arry.push(num);
            score -= Math.floor(score / this.coinArry[i]) * this.coinArry[i];
        }
        return arry;
    },
    xingxingAnimation: function (uid, localIndex) {
        var xingxingNode = cc.find('xing'+localIndex, this.shensuanNode);
        if (uid == HundredNiuHandler.guideId && xingxingNode.childrenCount == 0) {
            var guidePrefab = cc.instantiate(this.guideNodePrefab);
            xingxingNode.addChild(guidePrefab);
            soundMngr.instance.playHundredOther('guide');
            guidePrefab.getComponent('hundred_fortunePanel').playXingAnimation();
        }
    },
    /*--------------倒计时---------------*/
    gambleCountTime: function (callback) {
        var self = this;
        var updateCountDownTime = function () {
            HundredNiuHandler.gameTimes --;
            var countLb1 = cc.find('countTime1',self.countNode);
            self.countNode.active = true;
            if (HundredNiuHandler.isStartAnimationPlayed) {
                self.countNode.active = false;    
            } else {
                self.countNode.active = true;
            }
            countLb1.getComponent(cc.Label).string = HundredNiuHandler.gameTimes;
            if (HundredNiuHandler.gameTimes > 0 && HundredNiuHandler.gameTimes <= 3) {
                soundMngr.instance.playHundredOther('countDown');
                var scaleAc1 = cc.scaleTo(0.25, 1, 1);
                var scaleAc2 = cc.scaleTo(0.25, 0.6, 0.6);
                self.countNode.runAction(cc.sequence(scaleAc1, scaleAc2));
            } else if (HundredNiuHandler.gameTimes <= 0) {
                self.countNode.active = false;
                self.countNode.setScale(0.6);
                self.countNode.active = false;
                countLb1.getComponent(cc.Label).string = '';
                HundredNiuHandler.readyLabelActive = true;
                self.unschedule(updateCountDownTime);
                callback();
            }
        };
        if (HundredNiuHandler.gameTimes <= 0) {
            self.countNode.setScale(0.6);
            this.unschedule(updateCountDownTime);
            return;    
        }
        updateCountDownTime(callback);
        this.schedule(updateCountDownTime, 1);
    },
    /*-------------小结算----------------*/
    //确定输赢
    confirmWinnerOrLoser: function () {
        niuniuPokerHandler.clearArray(this._winnerToLoser.winPos);
        niuniuPokerHandler.clearArray(this._winnerToLoser.losePos);
        this._winnerToLoser.winnerList = {0:[],1:[],2:[],3:[]};

        var result = HundredNiuHandler.pokerResult;
        for (var i = 0; i < result.length; i++) {
            if (result[i]) {
                this._winnerToLoser.losePos.push(i);
            } else {
                this._winnerToLoser.winPos.push(i);
            }
        }
        for (var j = 0; j < HundredNiuHandler.betPosPlayer.length; j++) {
            var winnerInfo = HundredNiuHandler.betPosPlayer[j];
            for (var indx = 0; indx < winnerInfo.length; indx++) {
                var uid = winnerInfo[indx];
                var scores = HundredNiuHandler.getRoundCoinByUid(uid);
                var isOnDesk = HundredNiuHandler.containsArray(HundredNiuHandler.playerInfo, uid);
                if (scores > 0 && uid != HundredNiuHandler.zhuangUid) {
                    if (isOnDesk) {
                        this._winnerToLoser.winnerList[j].push(uid);    
                    } else {
                        if (uid == GameData.player.uid) {
                            this._winnerToLoser.winnerList[j].push(uid);
                        }else {
                            this._winnerToLoser.winnerList[j].push(-1);    
                        }
                    }
                }
            }
        }
        for (var i = 0; i < Object.keys(this._winnerToLoser.winnerList).length; i++) {
            var array = this._winnerToLoser.winnerList[i];
            this._winnerToLoser.winnerList[i] = niuniuPokerHandler.unequally(array);
        }
    },
    showChipsFlyAnimation: function () {
        this.showWinIcon();
        this.confirmWinnerOrLoser();
        if (this._winnerToLoser.winPos.length == 0) {
            //庄家通赢
            soundMngr.instance.playHundredOther('zhuangWin');
            this.showAllWinAnimation('zhuang');
        }else {
            if (this._winnerToLoser.losePos.length == 0) {
                //闲家通赢
                soundMngr.instance.playHundredOther('zhuangLose');
                this.showAllWinAnimation('xian');
            }
        }
        if (this._winnerToLoser.losePos.length > 0) {
            this.zhuangWinner();
        }else {
            if (this._winnerToLoser.winPos.length > 0) {
                this.xianWinAction();
            }
        }
    },
    zhuangWinner: function () {
        //筹码从区域飞向庄家
        var index = HundredNiuHandler.getPlayerPosByUid(HundredNiuHandler.zhuangUid);
        var zhuangPlayer = this.playerNodes[index];
        var self = this;
        for (var i = 0; i < this._winnerToLoser.losePos.length; i++) {
            var onPos = this._winnerToLoser.losePos[i];
            var chipsParent =  this.chipsNode.getChildByName('chips'+onPos);
            for (var j = 0; j < chipsParent.childrenCount; j++) {
                var actionX = zhuangPlayer.x + this.randomNum(-50,50);
                var actionY = zhuangPlayer.y + this.randomNum(-20,50);
                var child = chipsParent.children[j];
                this.resultChipsAnimation(child, cc.p(actionX, actionY));
            }
        }
        soundMngr.instance.playHundredOther('result');
        if (this._winnerToLoser.winPos.length > 0) {
            this.scheduleOnce(function () {
                self.zhuangToAreaAc();
            },1);
        } else {
            this.scheduleOnce(function () {
                self.moveAboutScore();
            },1);
        }
    },
    xianWinAction: function () {
        var self = this;
        var playerLen = this._winnerToLoser.winPos.length;
        for (var i = 0; i < playerLen; i++) {
            var onPos = this._winnerToLoser.winPos[i];
            var lastWinner = this._winnerToLoser.winnerList[onPos].length - 1;
            if (this._winnerToLoser.winnerList[onPos].length == 0) continue;
            var num = 0;
            var chipsParen = this.chipsNode.getChildByName('chips'+onPos);
            for (var j = 0; j < chipsParen.childrenCount; j++) {
                if (num > lastWinner) {
                    num = 0;
                }
                var uid = this._winnerToLoser.winnerList[onPos][num];
                var player;
                if (uid == -1) {
                    player = cc.find('tableInfo/otherPlayer', this.node);
                }else {
                    var playerPos = HundredNiuHandler.getPlayerPosByUid(uid);
                    player = this.playerNodes[playerPos];
                }
                num++;

                var actionX = player.x + this.randomNum(-50,50);
                var actionY = player.y + this.randomNum(-20,50);
                var child = chipsParen.children[j];
                this.resultChipsAnimation(child, cc.p(actionX, actionY));
            }
        }
        soundMngr.instance.playHundredOther('result');
        this.scheduleOnce(function () {
            self.moveAboutScore();
        },1);    
    },
    zhuangToAreaAc: function () {
        var self = this;
        var zhuangIndex = HundredNiuHandler.getPlayerPosByUid(HundredNiuHandler.zhuangUid);
        var zhuangPlayer = this.playerNodes[zhuangIndex];
        for (var i = 0; i < this._winnerToLoser.winPos.length; i++){
            for (var j = 0; j < this.chipsNum; j++) {
                var node = this.createCoinNode(this._winnerToLoser.winPos[i], j);
                node.setPosition(zhuangPlayer.getPosition());
            }
        }
        for (var i = 0; i < this._coinList.length; i++) {
            var clipNode = this._coinList[i];

            var onPos = clipNode.getTag();
            var toAreaNode = cc.find('area'+onPos,this.areaNode);
            var actionX = toAreaNode.getPosition().x - this.randomNum(-75,75);
            var actionY = toAreaNode.getPosition().y - this.randomNum(-100,20);
            this.resultChipsAnimation(clipNode, cc.p(actionX, actionY));
        }
        soundMngr.instance.playHundredOther('result');
        this.scheduleOnce(function () {
            self.xianWinAction();
        },1);
    },
    //创建金币节点
    createCoinNode: function (area, coinNum) {
        var node;
        var coinName = area.toString()+coinNum.toString();
        if (!this.chipsNode.getChildByName('coinNode' + coinName))
        {
            node = cc.instantiate(this.chipPrefab);
            node.name = 'coinNode' + coinName;
            node.setTag(area);
            var index = this.randomNum(0,4);
            var num = this.clipsList[index];
            node.getComponent('hundred_pokerPanel').setChipImg(num);
            node.scaleX = 0.5;
            node.scaleY = 0.5;
            this.chipsNode.addChild(node);
        }else {
            node = this.chipsNode.getChildByName('coinNode' + coinName);
        }
        node.active = true;
        this._coinList.push(node);
        return node;
    },
    resultChipsAnimation: function (node, position) {
        var action1 = cc.moveTo(0.4,position);
        var fade = cc.fadeOut(0.4);
        var action2 = cc.callFunc(function () {
            node.active = false;
            node.destroy();
        }, node);
        node.runAction(cc.sequence(action1, fade, action2)).easing(cc.easeCubicActionOut());
    },
    //飘分
    moveAboutScore: function(){
        //小结算金币移动和飘分
        var self = this;
        var players = this.getPlayerInfoOnDesk();
        for (var j = 0; j < players.length; j++) {
            if (players[j] == null) continue;
            var player = players[j];
            var index = HundredNiuHandler.getPlayerPosByUid(player.uid);
            var runScore = player.score;
            var headNode = this.scoreParent.getChildByName("score"+index);
            var playerGetScore = headNode.getChildByName("resultScore");
            if (playerGetScore == null) {
                playerGetScore = cc.instantiate(this.scoreNode);
                if (index == 4 || index >= 6) {
                    playerGetScore.getComponent('hundred_runscorePanel').setAnchor(1);
                } else {
                    playerGetScore.getComponent('hundred_runscorePanel').setAnchor(0);
                }
                playerGetScore.getComponent('hundred_runscorePanel').getScoreColor(runScore);
                playerGetScore.active = true;
                headNode.addChild(playerGetScore);
            }
            if (runScore > 0) {
                this.winnerAnimation(index);  
                if (player.uid == GameData.player.uid) {
                    soundMngr.instance.playHundredOther('winsign');
                }  
            }
            var move1 = cc.moveBy(1.5,cc.p(0,60));
            playerGetScore.runAction(move1);
        }
        this.scheduleOnce(function () {
            for (var i = 0; i < self.scoreParent.children.length; i++) {
               self.scoreParent.children[i].removeAllChildren();
            }
            HundredNiuHandler.isFlyChipsAndCoin = false;
            self.changeCoinNumOnHead();
            self.initUI();
            HundredNiuHandler.readyLabelActive = false;
        },2);
    },
    getPlayerInfoOnDesk: function () {
        var playerArray = [];
        var playScoreInfo = roomHandler.coinData.coin;
        for (var i = 0; i < playScoreInfo.length; i++) {
            var uid = playScoreInfo[i].uid;
            var isOnDesk = HundredNiuHandler.containsArray(HundredNiuHandler.playerInfo, uid);
            if (isOnDesk) {
                playerArray.push(playScoreInfo[i]);
            } else {
                if (uid == GameData.player.uid) {
                    playerArray.push(playScoreInfo[i]);
                }
            }
        }
        return playerArray;
    },
    changeCoinNumOnHead: function () {
        var playerOnDesk =  this.getPlayerInfoOnDesk();
        for (var i = 0; i < this.playerNodes.length; i++) {
            var headNode = this.playerNodes[i].getChildByName("rightOrLeftPlayerInfo");
            var playerHeadScp = headNode.getComponent("niuNiuPlayerInfo");
            if(playerHeadScp == undefined) continue;
            var playerInfo = HundredNiuHandler.getPlayerInfoByUid(playerHeadScp.uid);
            if (playerInfo == null) continue;
            var newScore = 0;
            var coin = playerInfo.coin;
            var runscore = 0;
            var onDesk = HundredNiuHandler.containsArray(playerOnDesk, playerHeadScp.uid);
            if (onDesk) {
                for (var j = 0; j < playerOnDesk.length; j++) {
                    if (playerOnDesk[j] == null) continue;
                    var player = playerOnDesk[j];
                    if (player.uid == playerHeadScp.uid) {
                        runscore = player.score;
                    } 
                }
            }
            if (playerHeadScp.uid == GameData.player.uid) {
                newScore = coin;
            } else {
                newScore = parseInt(coin, 10) + parseInt(runscore, 10);
            }
            playerHeadScp.setGold(newScore, gameDefine.GameType.Game_Niu_Hundred);
        }
    },
});
