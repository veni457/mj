var soundMngr = require('SoundMngr');
var RoomHandler = require('roomHandler');
var ZJH_roomData = require('ZJH-RoomData');
var gameDefine = require('gameDefine');
var pokerAnimBase = require('pokerAnimationBase');
var roomTable = cc.Class({
    extends: cc.Component,
    properties: {
        operationBtns:     cc.Node, //操作按钮
        secondOperBtns:    cc.Node,//二级操作界面（筹码）
        pokersNode:        cc.Node, //poker节点
        escapeNode:        cc.Node,
        selectCompareNode: cc.Node,//选择与谁比牌节点
        compareLayer:      cc.Node,//比牌动画界面
        chipsNode:         cc.Node, //存放筹码的节点
        playerStateNode:  [cc.Node],//玩家状态节点
        playerChips:       cc.Node,
        isMask:            cc.Node,
        allScoreNode:      cc.Node, //桌面上的总筹码分数
        playerNodes: {
            default:            [],
            type:          cc.Node
        },
        dragNode:          cc.Node,
        continueBtn:       cc.Node,
        animNodes:         cc.Node,
        seePokerBtn:       cc.Button,//看牌按钮
        menXPokerBtn:      cc.Node,//显示剩余闷几轮按钮
        allFollowBtn:      cc.Button,//跟到底按钮
        mingPaiBtn:        cc.Button,//亮牌按钮
        mingPaiNode:       cc.Node, // 名牌动画界面
        animationEffect:   cc.Node,//玩家头像部位动画特效

//---------------------prefab--------------------------------------------//
        chipPrefab:        cc.Prefab,
        playerStatePrefab: cc.Prefab,
        scorePrefab:       cc.Prefab,//飘分分数
        pokerMask:         cc.Prefab,//poker遮罩
        chipMask:          cc.Prefab//筹码遮罩
    },

    onLoad: function () {
        this.playerSex = GameData.player.sex;
        this.pokerAnimBase = new pokerAnimBase();
        this.registListenr();
        this.initData();
        this.saveAllPokerPosition();
        this.initUI();
        this.onShow();
        this.onReConnectShow();
    },

    registListenr: function () {
        var self = this;
        this.isMask.on(cc.Node.EventType.TOUCH_END, function () {
            self.showSecondOperBtn(false);
        });
        require('util').registEvent('initTableUI', this, this.initUI);
        require('util').registEvent('onRoomInfo',this,this.onRoomInfo);
        require('util').registEvent('onPlayerCheck',this,this.showMyPokerCards);
        require('util').registEvent('zhaJinHua-onGameInfo', this, this.onShow);
        require('util').registEvent('refreshPoker',this,this.refreshPoker);
        require('util').registEvent('onZhaJinHuaRunEnd',this,this.onShowResult);
        require('util').registEvent('onPlayerGiveUp', this, this.onPlayerGiveUp);
        require('util').registEvent('onPlayerMingPai',this,this.onPlayerMingPai);
        require('util').registEvent('onPlayerAddChips',this,this.onPlayerAddChips);
        require('util').registEvent('onJoinerConnect', this, this.showJoinerConnect);
        require('util').registEvent('zhaJinHua-onGameStart', this, this.onGameStart);
        require('util').registEvent('onPlayerCompare',this,this.showCompareAnimation);
        require('util').registEvent('onPlayerFollowChips',this,this.onPlayerFollowChips);
    },

    onDestroy: function () {
        this.isMask.off(cc.Node.EventType.TOUCH_END, function () {
            self.showSecondOperBtn(false);
        });
        unrequire('util').registEvent('initTableUI', this, this.initUI);
        unrequire('util').registEvent('onRoomInfo',this,this.onRoomInfo);
        unrequire('util').registEvent('onPlayerCheck',this,this.showMyPokerCards);
        unrequire('util').registEvent('zhaJinHua-onGameInfo', this, this.onShow);
        unrequire('util').registEvent('refreshPoker',this,this.refreshPoker);
        unrequire('util').registEvent('onZhaJinHuaRunEnd',this,this.onShowResult);
        unrequire('util').registEvent('onPlayerGiveUp', this, this.onPlayerGiveUp);
        unrequire('util').registEvent('onPlayerMingPai',this,this.onPlayerMingPai);
        unrequire('util').registEvent('onPlayerAddChips',this,this.onPlayerAddChips);
        unrequire('util').registEvent('onJoinerConnect', this, this.showJoinerConnect);
        unrequire('util').registEvent('zhaJinHua-onGameStart', this, this.onGameStart);
        unrequire('util').registEvent('onPlayerCompare',this,this.showCompareAnimation);       
        unrequire('util').registEvent('onPlayerFollowChips',this,this.onPlayerFollowChips);
    },

    initUI: function () {
        this.initBtn();
        this.initPokerNode();
        this.initPlayerState();
        this.showSecondOperBtn(false);
        this.showSelectPlayerPK(false);
        this.operationBtns.active = false;
        this.hideNodeChild(this.animNodes);
        this.hideNodeChild(this.animationEffect);
        this.mingPaiNode.active = false;
    },

    initData: function () {
        this.pokerArr =       []; //all card arr
        this.pokerPosArr =    [];// cardPosArr
        this.allpokerPosArr =    [];//all cardPosArr
        this.winner = 0;
        ZJH_roomData.startAnimFinish = false;
    },

    initBtn:function(){
        this.showSeePokerBtn(false);
        this.operationBtns.active = false;
        this.continueBtn.active = false;
        this.mingPaiBtn.node.active = false;
        this.allFollowBtn.node.active = false;
    },

    initPlayerState: function(){
        for (var i = 0; i<this.playerStateNode.length; i++) {
            this.playerStateNode[i].active = true;
            this.playerStateNode[i].removeAllChildren(true);
        }
    },

    initPokerNode: function () {
        this.hideNodeChild(this.pokersNode);
        this.hideNodeChild(this.escapeNode);

        for (var i = 0; i<this.pokersNode.childrenCount; i++) {
            var pokerStyle2 = this.pokersNode.children[i].getChildByName('style2');
            if (pokerStyle2) {
                pokerStyle2.active = false;
                for (var k = 0; k<pokerStyle2.childrenCount; k++) {
                    this.showPokerContent(pokerStyle2.children[k],0);
                    pokerStyle2.children[k].removeAllChildren(true);
                }
            }
            for (var j = 0; j<this.pokersNode.children[i].getChildByName('style1').childrenCount; j++) {
                this.showPokerContent(this.pokersNode.children[i].getChildByName('style1').children[j],0);
                this.pokersNode.children[i].getChildByName('style1').children[j].removeAllChildren(true);
                this.pokersNode.children[i].getChildByName('style1').children[j].position = this.allPokerPosArr[i][j];
            }
        }
    },

    onShow: function () {
        if (ZJH_roomData.startAnimFinish) {
            this.showSeePokerBtn(true);
            this.showOperBtn();
        }
        if (ZJH_roomData.gameInfo.status == ZJH_roomData.gameState.Settle){
            this.showSeePokerBtn(false);
            this.operationBtns.active = false;
        }
        //显示玩家状态
        this.showPlayerState();
        //刷新玩家压筹码的数量
        this.showPlayerChips();
    },

    onReConnectShow: function () {
        if (Object.keys(ZJH_roomData.gameInfo).length != 0) {
            if (ZJH_roomData.gameInfo.status != ZJH_roomData.gameState.Settle) {
                if (ZJH_roomData.gameInfo.status != ZJH_roomData.gameState.End) {
                    //重连恢复牌桌的筹码
                   var gameAllChipsArr = ZJH_roomData.getGameAllChips();
                    for (var i = 0; i<gameAllChipsArr.length; i++) {
                        var x = this.randomNum(0, 400) - 200;
                        var y = this.randomNum(0, 100) - 100;
                        var score = gameAllChipsArr[i];
                        var clipNode = cc.instantiate(this.chipPrefab);
                        clipNode.getComponent('poker_chipPrefab').setChipImg(score);
                        clipNode.x = x;
                        clipNode.y = y;
                        clipNode.parent = this.chipsNode;
                    } 
                } 
            }
            this.showJoinerConnect();
        }
    },

    onRoomInfo: function () {
        var bool = false;
        if (RoomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
            for (var i = 0; i<GameData.room.opts.joinermax; i++) {
                var player = GameData.joiners[i];
               if (player == null){
                   var index = GameData.getPlayerPosByUid('null');
                    if (index != null) {
                        this.escapeNode.children[index].active = bool;
                        this.animNodes.children[index].active = bool;
                        this.pokersNode.children[index].active = bool;
                        this.playerChips.children[index].active = bool;
                        this.playerStateNode[index].active = bool;
                    }
                }
            }
         }   
    },

    onGameStart: function () {
        ZJH_roomData.startAnimFinish = false;
        ZJH_roomData.isRunAnimation = true;
        this.initUI();
        this.savePokerData();
        this.playGameStartAnim();
        this.showPlayerChips();
    },

    //加注
    onPlayerAddChips: function (data) {
        var uid = data.detail.uid;
        var chipsNum = data.detail.chips;
        var sex = GameData.getPlayerSexByUid(uid);
        var num = Math.random() > 0.5?1:2;
        var isFirstAddChip = chipsNum == ZJH_roomData.getGameAllChips()[0];
        //金币场
        if (isFirstAddChip) {
            soundMngr.instance.playAudioZJH('follow1',sex||1);
        }else {
            soundMngr.instance.playAudioZJH('addChip'+num,sex||1);
        }
        this.addChip(chipsNum,uid);
    },

    //跟注
    onPlayerFollowChips: function (data) {
        var uid = data.detail.uid;
        var chipsNum = data.detail.chips;
        var sex = GameData.getPlayerSexByUid(uid);

        var isFirstTurn = ZJH_roomData.isFirstTurn(uid);
        if (isFirstTurn) {
            soundMngr.instance.playAudioZJH('follow1',sex||1);
        }else{
            var num = Math.random()>0.5?2:3;
            soundMngr.instance.playAudioZJH('follow'+num,sex||1);
        }
        this.addChip(chipsNum,uid);
    },

    //弃牌
    onPlayerGiveUp: function (data) {
        var uid = data.detail.uid;
        var index = GameData.getPlayerPosByUid(uid);
        var giveUpNode = this.escapeNode.children[index];
        var scale = index == 0 ? 1:0.7;
        if (giveUpNode) {
            this.pokerAnimBase.playScaleAnim(giveUpNode,scale);
        }
        var sex = GameData.getPlayerSexByUid(uid);
        var num = Math.random()>0.5?1:2;
        soundMngr.instance.playAudioZJH('giveUp'+num,sex||1);
        if (uid == GameData.player.uid) {
            this.showSecondOperBtn(false);
            this.showSelectPlayerPK(false);
            this.operationBtns.active = false;
        }
    },

    //亮牌
    onPlayerMingPai: function (data) {
        this.showMingPai(data);
    },

    //小结算
    onShowResult: function (data) {
        this.showSecondOperBtn(false);
        this.showSelectPlayerPK(false);
        this.operationBtns.active = false;
        this.initBtn();
        //this.initData();
        ZJH_roomData.startAnimFinish = false;
        this.hideNodeChild(this.animNodes);

        var resultData = data.detail;
        var winner = resultData.winnerUid;
        this.winner = winner;
        var self = this;
        var index = GameData.getPlayerPosByUid(winner);
        var winnerPos = this.playerNodes[index].position;
        var scores = data.detail.scores;
        var delyTime = ZJH_roomData.isCompare ? 4.5:2;
        ZJH_roomData.isRunAnimation = true;
        // 飞筹码
        this.scheduleOnce(function(){
            for (var i = 0; i < self.chipsNode.children.length; i++) {
                var childNode = self.chipsNode.children[i];
                self.resultChipsAnimation(childNode, winnerPos);
                self.allScoreNode.active = false;
                soundMngr.instance.playAudioZJH('get_chip',null);
            }
        },delyTime);



        //飘分、show ready
        this.scheduleOnce (function() {
            for (var key in scores) {
                self.moveAboutScore(key,scores[key]);
            }
            if (RoomHandler.room.opts.currencyType != gameDefine.currencyType.Currency_Coin) {
                self.continueBtn.active = true;
            }
            //取消看牌状态
            var posNode = self.playerStateNode[index];
            var seePokeNode = posNode.getChildByName(posNode.name + '_' + 'yikanpai');
            var seePokeMaskNode = posNode.getChildByName(posNode.name + '_' + 'pokerTypeMask');
            if (seePokeNode){
                seePokeNode.active = false;
                seePokeMaskNode.active = false;
            }

            //胜利头像特效
            var winIndex = GameData.getPlayerPosByUid(winner);
            var winNode = this.animationEffect.children[winIndex];
            winNode.active = true;
            this.pokerAnimBase.playDragAnimation(winNode,'zjh/animation/headEffect','newAnimation');

            var animNode = self.animNodes.children[index];
            animNode.active = true;
            self.pokerAnimBase.playDragAnimation(animNode,'zjh/animation/shengli','newAnimation');
            //show total score
            self.refreshPlayerAllScore();
            self.mingPaiBtn.node.active = winner == GameData.player.uid;
            ZJH_roomData.isRunAnimation = false;
        },delyTime+0.5);

        if(RoomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
            this.scheduleOnce(function () {
                self.mingPaiBtn.node.active = false;
            },delyTime+3.5);
        }
    },

    //-----------------------------------------show some node start---------------------------------------------------//
    showJoinerConnect: function(data) {
        //处理断线重连
        if (data) {
            var uid = data.detail.uid;
            if (uid != GameData.player.uid){
                return;
            }
        }

        ZJH_roomData.startAnimFinish = GameData.game.gameStart;
        if (ZJH_roomData.gameInfo.status == ZJH_roomData.gameState.Settle
            || ZJH_roomData.gameInfo.status == ZJH_roomData.gameState.End) {

            if (RoomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Card) {
                this.continueBtn.active = true;
            }

            this.chipsNode.removeAllChildren(true);
            this.allScoreNode.active = false;
        }

        if (GameData.room.status == gameDefine.RoomState.GAMEING
            && ZJH_roomData.gameInfo.status != ZJH_roomData.gameState.Settle) {
            this.showSeePokerBtn(true);
            this.showOperBtn();
            this.continueBtn.active = false
        }else{
            this.showSeePokerBtn(false);
            this.operationBtns.active = false;
        }

        ZJH_roomData.isRunAnimation = false;
        for (var i = 0; i<ZJH_roomData.playersArr.length; i++) {
            var isWin = ZJH_roomData.getWinPlayer(ZJH_roomData.playersArr[i]);
            var index = GameData.getPlayerPosByUid(ZJH_roomData.playersArr[i]);
            var animNode = this.animNodes.children[index];
            var isMingPai = ZJH_roomData.isMingPai(ZJH_roomData.playersArr[i]);
            if (animNode) {
                if (isWin){
                    if (isMingPai) {
                        animNode.active = true;
                        //this.showMingPai(ZJH_roomData.playersArr[i]);
                    }else {
                        animNode.active = true;
                        this.mingPaiBtn.node.active = ZJH_roomData.playersArr[i] == GameData.player.uid;
                    }
                }else{
                    animNode.active = false;
                }
            }
        }
        this.showPokerCards();
        this.showPlayerState();
        this.refreshPlayerAllScore();
        var isObPlayer = ZJH_roomData.isObPlayer(GameData.player.uid);
        if (isObPlayer) {
            var index = GameData.getPlayerPosByUid(GameData.player.uid);
            this.escapeNode.children[index].active = false;
            this.animNodes.children[index].active = false;
        }

        var readyData = RoomHandler.getRoomReadyData();
        if (readyData[GameData.player.uid] == true
            && (ZJH_roomData.gameInfo.status == ZJH_roomData.gameState.Settle
            || ZJH_roomData.gameInfo.status == ZJH_roomData.gameState.End)) {
            this.initUI();
        }
    },

    showSeePokerBtn: function (bool) {
        //判断看牌按钮显隐
        var isObPlayer = ZJH_roomData.isObPlayer(GameData.player.uid);
        var isSee = ZJH_roomData.getPlayerIsSeePokerByUid(GameData.player.uid);
        var isDie = ZJH_roomData.losersArr.indexOf(GameData.player.uid) != -1;
        var isGameEnd = ZJH_roomData.isGameEnd();
        if(ZJH_roomData.startAnimFinish) {
            if (isDie || isObPlayer || isGameEnd) {
                this.allFollowBtn.node.active = false;
            }else{
                this.allFollowBtn.node.active = true;
            }
            var checkBtn = cc.find('checkBtn',this.allFollowBtn.node);
            var animationNode = cc.find('animation',this.allFollowBtn.node);

            var isAutoFollow = ZJH_roomData.isAutoFollow(GameData.player.uid);
            if (isAutoFollow) {
                checkBtn.active = true;
                animationNode.active = true;
                //animationNode.getComponent(cc.Animation).play();
            }else {
                checkBtn.active = false;
                animationNode.active = false;
            }

            if (isObPlayer || isSee || isDie){
                this.seePokerBtn.node.active = false;
                this.menXPokerBtn.active = false;
                return
            }
            this.seePokerBtn.node.active = bool;
        }else{
            this.seePokerBtn.node.active = false;
        }

        var isMaxMenTurn = ZJH_roomData.gameInfo.curTurnNum <= GameData.room.opts.canNotLookTurnNum;
        if (isMaxMenTurn) {
            this.seePokerBtn.interactable = false;
            this.menXPokerBtn.active = true;
            var menXLb = cc.find('menX',this.menXPokerBtn);
            menXLb.getComponent(cc.Label).string = GameData.room.opts.canNotLookTurnNum - (ZJH_roomData.gameInfo.curTurnNum-1);
        }else{
            this.seePokerBtn.interactable = true;
            this.menXPokerBtn.active = false;
        }

    },
    //操作一级界面
    showOperBtn: function () {
        var isObPlayer = ZJH_roomData.isObPlayer(GameData.player.uid);
        var isGameEnd = ZJH_roomData.isGameEnd();
        var isAutoFollow = ZJH_roomData.isAutoFollow(GameData.player.uid);
        var isLoser = ZJH_roomData.isLoser(GameData.player.uid);
        if (ZJH_roomData.gameInfo.currentPlayer == GameData.player.uid
            && !ZJH_roomData.isRunAnimation
            && !isAutoFollow
            && !isObPlayer
            && !isGameEnd
            && !isLoser) {
            this.operationBtns.active = true;
            //control btn disable
            this.controlBtnDisable();
        }else{
            this.operationBtns.active = false;
            this.showSecondOperBtn(false);
        }
    },
    //操作二级界面
    showSecondOperBtn: function (bool) {
        this.secondOperBtns.active = bool;
        if (bool) {
            //筹码按钮显隐
            this.isMask.active = true;
            this.showChipBtnImg();
        }else{
            this.isMask.active = false;
        }
    },

    showPlayerChips: function () {
        this.hideNodeChild(this.playerChips);
        if (!GameData.game.gameStart) {
           return
        }
        for (var i = 0; i<ZJH_roomData.playersArr.length; i++) {
            var uid = ZJH_roomData.playersArr[i];
            var index = GameData.getPlayerPosByUid(uid);
            if (this.playerChips.children[index]) {
               this.playerChips.children[index].active = true; 
            }
        }
        this.refreshPlayerChipNum();
    },

    showChipBtnImg: function () {
        if (GameData.room.opts) {
            var chipType = GameData.room.opts.chipsType;
            var currMaxChipValue = parseInt(ZJH_roomData.gameInfo.maxChipsValue);
            var isSee = ZJH_roomData.getPlayerIsSeePokerByUid(GameData.player.uid);
            var chipArr = [];
            if (chipType) {
                chipArr = [5,10,20,50,100];
            }else{
                chipArr = [1,2,5,10,20];
            }
            //金币场
            if(RoomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
                var scoreLv = RoomHandler.room.opts.scorelv;
                chipArr =  ZJH_roomData.getRoomCoinChipConfig(scoreLv);
            }

            for (var j = 0; j<this.secondOperBtns.childrenCount; j++) {
                this.secondOperBtns.children[j].removeAllChildren(true);
            }

            for (var i = 0; i<this.secondOperBtns.childrenCount; i++){
                //show chipTextrue
                this.secondOperBtns.children[i].getComponent(cc.Button).normalSprite = null;
                var iconUrl = 'resources/zjh/UI/img/chip/chip_' + chipArr[i] + '.png';
                var texture = cc.textureCache.addImage(cc.url.raw(iconUrl));
                this.secondOperBtns.children[i].getComponent(cc.Button).normalSprite = new cc.SpriteFrame(texture);

                //show chipVisible
                if (i<4) {
                    if (isSee) {

                        if (chipArr[i] <= currMaxChipValue * 2) {
                            this.secondOperBtns.children[i].getComponent(cc.Button).interactable = false;
                            this.addNodeMask(this.secondOperBtns.children[i],this.chipMask);
                        }else{
                            this.secondOperBtns.children[i].getComponent(cc.Button).interactable = true;
                        }

                        if (currMaxChipValue == 2 || currMaxChipValue == 20 || currMaxChipValue == 100
                            || currMaxChipValue == 600 || currMaxChipValue == 2000) {
                            if (chipArr[i] <= currMaxChipValue * 2.5) {
                                this.secondOperBtns.children[i].getComponent(cc.Button).interactable = false;
                                this.addNodeMask(this.secondOperBtns.children[i],this.chipMask);
                            }else{
                                this.secondOperBtns.children[i].getComponent(cc.Button).interactable = true;
                            }
                        }

                    }else{

                        if (chipArr[i] <= currMaxChipValue){
                            this.secondOperBtns.children[i].getComponent(cc.Button).interactable = false;
                            this.addNodeMask(this.secondOperBtns.children[i],this.chipMask);
                        }else{
                            this.secondOperBtns.children[i].getComponent(cc.Button).interactable = true;
                        }

                    }

                    if (i == 0) {
                        if (isSee) {
                            this.secondOperBtns.children[i].getComponent(cc.Button).interactable = false;
                            this.addNodeMask(this.secondOperBtns.children[i],this.chipMask);
                        }
                    }
                }
            }

            var lastChipNode = this.secondOperBtns.children[4];
            if (isSee) {
                if (chipArr[4] <= currMaxChipValue * 2) {
                    lastChipNode.getComponent(cc.Button).interactable = false;
                    this.addNodeMask(lastChipNode,this.chipMask);
                }else{
                    lastChipNode.getComponent(cc.Button).interactable = true;
                }

            }else{
                lastChipNode.getComponent(cc.Button).interactable = false;
                this.addNodeMask(lastChipNode,this.chipMask);
            }
        }
    },

    showSelectPlayerPK: function (bool) {
        this.selectCompareNode.active =  bool;
        var CompareNode = cc.find('nodes',this.selectCompareNode);
        this.hideNodeChild(CompareNode);
        if (!bool) {
            return
        }
        var livePlayers = ZJH_roomData.getLivePlayers();
        for (var i = 0; i<livePlayers.length; i++) {
            var uid = livePlayers[i];
            var index = GameData.getPlayerPosByUid(uid);
            if (uid != GameData.player.uid) {
                CompareNode.children[index].active = true;
            }else{
                CompareNode.children[index].active = false;
            }
        }
    },

    showPokerCards: function (data) {
        if (this.secondOperBtns.active) {
            this.showChipBtnImg();
        }
        if (data){
            var sex = GameData.getPlayerSexByUid(data.detail.uid);
            var num = Math.random()>0.5?1:2;
            soundMngr.instance.playAudioZJH('kanpai'+num,sex);
        }

        this.hideNodeChild(this.pokersNode);
        for (var i = 0; i<ZJH_roomData.playersArr.length; i++) {
            var uid = ZJH_roomData.playersArr[i];
            var index = GameData.getPlayerPosByUid(uid);
            var pokersNode = this.pokersNode.children[index];
            var pokers = ZJH_roomData.getPlayerPokerByUid(uid);
            var isSee = ZJH_roomData.getPlayerIsSeePokerByUid(uid);
            var isMingPai = ZJH_roomData.isMingPai(uid);
            if (pokersNode){
                pokersNode.active = true;
            }

            if (pokers && pokersNode) {
                var pokerStyle = pokersNode.getChildByName('style1');
                if ((isSee && uid == GameData.player.uid) || isMingPai) {
                    for (var j = 0; j < pokersNode.childrenCount; j++) {
                        this.showPokerContent(pokerStyle.children[j], pokers[j]);

                    }
                } else {
                    for (var j = 0; j < pokersNode.childrenCount; j++) {
                        this.showPokerContent(pokerStyle.children[j], 0);
                    }
                }

            }
        }
    },
    showMyPokerCards: function (data) {
        var uid = data.detail.uid;
        var index = GameData.getPlayerPosByUid(uid);
        var sex = GameData.getPlayerSexByUid(uid);
        var num = Math.random()>0.5?1:2;
        soundMngr.instance.playAudioZJH('kanpai'+num,sex);
        this.playFlopAnimtaion(uid);
        var pokeType = ZJH_roomData.getPlayerPokerTypeByUid(uid);
        cc.log('牌型：'+pokeType);
        var posNode = this.playerStateNode[index];
        this.scheduleOnce(function () {
            this.addPlayerStateImg('pokerTypeMask',posNode,0.8,-45);
            this.addPlayerStateImg(pokeType,posNode,0.8,-40);
        },0.5);
    },

    //播放翻牌动画
    playFlopAnimtaion: function (uid) {
        var index = GameData.getPlayerPosByUid(uid);
        var pokersNode = this.pokersNode.children[index].getChildByName('style1');
        var pokers = ZJH_roomData.getPlayerPokerByUid(uid);
        if (pokers) {

            for (var jj = 0; jj < pokersNode.childrenCount; jj++) {
                this.pokerAnimBase.playFlopAnimation(pokersNode.children[jj]);
            }
            this.scheduleOnce(function () {
                for (var jjj = 0; jjj < pokersNode.childrenCount; jjj++) {
                    this.showPokerContent(pokersNode.children[jjj], pokers[jjj]);
                }
            },0.25);
        }
    },

    showPokerContent: function (cardNode, pokerId) {
        //cc.log('pokerId:'+pokerId);
        var pokerNum = 0;
        if (pokerId>0) {
            pokerNum = this.getSpriteNameByCardId(pokerId);
        }else{
            pokerNum = pokerId;
        }
        
        var iconUrl = 'resources/niuNiuTable/poker/' + pokerNum + '.png';
        this.setNodeImg(cardNode,iconUrl);
    },

    showMingPai: function (data) {
        // var readyData = RoomHandler.getRoomReadyData();
        // var isReady = readyData[GameData.player.uid] == true;
        // if (isReady) {
        //     return;
        // }
        this.mingPaiNode.active = true;
        var animation = cc.find('mingpaiAnim',this.mingPaiNode);
        var downNode = cc.find('downNode',this.mingPaiNode);
        //设置明牌数据
        this.setMingPaiData(downNode,data);
        //animation
        this.pokerAnimBase.flyToMidAction(downNode,0.5,500);
        this.pokerAnimBase.playDragAnimation(animation,'zjh/animation/liangpai','newAnimation');
        this.scheduleOnce(function () {
            this.mingPaiNode.active = false;
        },1.3)
    },

    showPlayerState: function () {
        for (var i = 0; i<ZJH_roomData.playersArr.length; i++) {
            var uid = ZJH_roomData.playersArr[i];
            var index = GameData.getPlayerPosByUid(uid);
            var posNode = this.playerStateNode[index];
            var isSeePoker = ZJH_roomData.getPlayerIsSeePokerByUid(uid);//是否看牌
            var isLoser = ZJH_roomData.isLoser(uid);
            var isGiveUp = ZJH_roomData.GiveUpArr.indexOf(uid) != -1;
            var isWin = ZJH_roomData.getWinPlayer(uid);

            if (posNode && this.pokersNode.children[index]) {
                var pokerStyle1 = this.pokersNode.children[index].getChildByName('style1');
                var pokerStyle2 = this.pokersNode.children[index].getChildByName('style2');
                //show loseImg
                if (isLoser) {
                    this.addPlayerStateImg('shule',posNode,0);
                }else{
                    var loseImg = posNode.getChildByName('shule');
                    if(loseImg){
                        loseImg.active = false;
                    }
                }
                //show giveUpImg
                var giveUpNode = this.escapeNode.children[index];
                if (isGiveUp){
                    posNode.removeAllChildren(true);
                    giveUpNode.active = true;
                }else{
                    giveUpNode.active = false;
                }
                //show seePokerImg
                if (isSeePoker && uid != GameData.player.uid) {
                    this.addPlayerStateImg('pokerTypeMask',posNode,0.6);
                    this.addPlayerStateImg('yikanpai',posNode);
                    pokerStyle2.active = true;
                    pokerStyle1.active = false;
                }

                var seePokeNode = posNode.getChildByName(posNode.name + '_' + 'yikanpai');
                var seePokeMaskNode = posNode.getChildByName(posNode.name + '_' + 'pokerTypeMask');
                if (isWin) {
                    posNode.removeAllChildren(true);
                }
                if (isLoser || isGiveUp) {
                    for (var j = 0; j<pokerStyle1.childrenCount; j++) {
                        this.addNodeMask(pokerStyle1.children[j],this.pokerMask);
                        if (pokerStyle2) {
                            this.addNodeMask(pokerStyle2.children[j],this.pokerMask);
                        }
                    }
                    this.seePokerBtn.active = false;
                    if (seePokeNode){
                        seePokeNode.active = false;
                        seePokeMaskNode.active = false;
                    }
                }

            }
        }
    },

    showCompareAnimation: function(data) {
        var self = this;
        var winUid = 0;
        var loserUid = 0;
        var chips = data.detail.chips;
        var data = data.detail;
        var sex = GameData.getPlayerSexByUid(data.uid);
        if (data.isWin) {
            winUid = data.uid;
            loserUid = data.otherId;
        }else{
            winUid = data.otherId;
            loserUid = data.uid;
        }
        //show loseImg and pokerMask

        var loseIndex = GameData.getPlayerPosByUid(loserUid);
        var loseNode = this.playerStateNode[loseIndex];
        var pokerNode = this.pokersNode.children[loseIndex].getChildByName('style1');
        var pokerStyle2 = this.pokersNode.children[loseIndex].getChildByName('style2');
        if (pokerStyle2 && pokerStyle2.active) {
            pokerNode = pokerStyle2;
        }
        loseNode.removeAllChildren(true);
        this.addPlayerStateImg('shule',loseNode);
        var loseImg = cc.find(loseNode.name + '_shule',loseNode);
        if (loseImg){
            loseImg.active = false;
        }
        for (var j = 0; j<pokerNode.childrenCount; j++) {
            this.addNodeMask(pokerNode.children[j],this.pokerMask);
            var pokerMaskNode = cc.find(pokerNode.children[j].name + 'mask',pokerNode.children[j]);
            if (pokerMaskNode) {
                pokerMaskNode.active = false;
            }
        }
        ZJH_roomData.isRunAnimation = true;
        this.addChip(chips,data.uid);
        var num = Math.random()>0.5?1:2;
        soundMngr.instance.playAudioZJH('cmp'+num,sex||1);
        this.scheduleOnce(function() {
           self.playPkAction(winUid,loserUid,data);
        }.bind(this),1);
    },

    refreshPlayerChipNum: function () {
        for (var i = 0; i<ZJH_roomData.playersArr.length; i++) {
            var uid = ZJH_roomData.playersArr[i];
            var index = GameData.getPlayerPosByUid(uid);
            var chipsNum = ZJH_roomData.getPlayerChipsByUid(uid);
            var chipNumLb = cc.find('score',this.playerChips.children[index]);
            var scores = RoomHandler.getPlayersCoin();
            if (chipNumLb){
                chipNumLb.getComponent(cc.Label).string = chipsNum + '';
            }
            //金币场
            if (RoomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
                if(this.playerNodes[index]) {
                    var playerNode = this.playerNodes[index].getChildByName('headNode');
                    playerNode.getComponent('pokerRoomPlayer').setCoin(scores[uid] - chipsNum);
                }   
            }  
        }
        //refreshAllChips
        var allScore = 0;
        var allScoreArr = ZJH_roomData.getGameAllChips();
        this.allScoreNode.active = true;
        if (allScoreArr) {
            for (var i = 0; i<allScoreArr.length; i++) {
                allScore +=allScoreArr[i];
            }
            var allScoreLb = cc.find('score',this.allScoreNode);
            allScore = ConversionCoinValue(allScore, 2);
            allScoreLb.getComponent(cc.Label).string = allScore;
        }
        //刷新当前轮数显示文本
        var gameTurnLb = cc.find('gameTurnLb',this.allScoreNode);
        var gameTurn = ZJH_roomData.gameInfo.curTurnNum;
        gameTurnLb.getComponent(cc.Label).string = '第' + gameTurn + '轮';

    },

    //-----------------------------------------show some node end---------------------------------------------------//

    //---------------------------------------------------animation about start-------------------------------------------//

    playGameStartAnim: function () {
        var self = this;
        this.dragNode.active = true;

        this.pokerAnimBase.playDragAnimation(this.dragNode,'zjh/animation/kaishi','newAnimation',function(){
                cc.log('gamestart finish');
                self.dragNode.active = false;
        });
        soundMngr.instance.playAudioZJH('start',null);
        //押注
        this.stake();
        soundMngr.instance.playAudioZJH('chip_add',null);
        this.scheduleOnce(this.dealAction,2);
    },

    stake: function () {
        var scoreBase = 0;
        //根据游戏底注类型设置底分
        if (GameData.room.opts.chipsType) {
            scoreBase = 5;
        }else{
            scoreBase = 1;
        }
        //金币场
        if(RoomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
            var scoreLv = RoomHandler.room.opts.scorelv;
            scoreBase =  ZJH_roomData.getRoomCoinChipConfig(scoreLv)[0];
        }

        for (var i = 0; i<ZJH_roomData.playersArr.length; i++) {
            this.addChip(scoreBase,ZJH_roomData.playersArr[i]);
        }
    },

    dealAction: function() {
        var self = this;
        this.pokerAnimBase.dealAction(this.pokerArr,this.pokersNode.position,this.pokerPosArr,0.4,function(delytime){
                self.scheduleOnce(function(){
                ZJH_roomData.startAnimFinish = true;
                ZJH_roomData.isRunAnimation = false;
                self.showOperBtn();
                self.showSeePokerBtn(true);
                },
                delytime);
            }
        );
        //发牌音效
        for (var i = 0; i<this.pokerArr.length; i++) {
            this.scheduleOnce(function() {
                soundMngr.instance.playAudioZJH('card',null);
            },0.1*(i+1));
        }
    },

    //筹码移动动画
    clipFlyToTableAnimation: function (node) {
        var x = this.randomNum(0, 400) - 200;
        var y = this.randomNum(0, 100)-100;
        var action1 = cc.moveTo(0.3, cc.p(x, y));
        var action3 = cc.callFunc(function () {
            node.removeFromParent(true);
        }, node);
        var action4 = cc.fadeOut(0.1);
        if (this.chipsNode.childrenCount > 80) {
            node.runAction(cc.sequence(action1, action4, action3)).easing(cc.easeCubicActionOut());
        } else {
            node.runAction(action1).easing(cc.easeCubicActionOut());
        }
    },

    playPkAction: function(winUid,loserUid,data) {
        var self = this;
        var leftNode = cc.find('left',this.compareLayer);
        var rightNode = cc.find('right',this.compareLayer);
        var leftResultImg = cc.find('resultIcon',leftNode);
        var rightResultImg = cc.find('resultIcon',rightNode);
        var midNode = cc.find('mid',this.compareLayer);
        var vsNode = cc.find('vs',this.compareLayer);
        var isWin = data.isWin;
        var actionTime = 0.3;
        this.setPkData(data);
        this.compareLayer.active = true;
        this.compareLayer.on(cc.Node.EventType.TOUCH_START, function (evt) {
            evt.stopPropagation();
        });
        midNode.active = false;
        leftResultImg.active = false;
        rightResultImg.active = false;

        // action1 move
        this.pokerAnimBase.flyToMidAction(leftNode,actionTime,-500);
        this.pokerAnimBase.flyToMidAction(rightNode,actionTime,500);
        soundMngr.instance.playAudioZJH('compare',null);
        //action2 flash
        this.scheduleOnce(function(){
            midNode.active = true;
        },actionTime - 0.2);

        //action3 vs
        this.scheduleOnce(function(){
            this.pokerAnimBase.playDragAnimation(vsNode,'zjh/animation/vs','vs');
        },actionTime);

        //action4 result
        var imgUrl1 = '';
        var imgUrl2 = '';
        if (isWin) {
            imgUrl1 = 'resources/zjh/UI/img/' + 'img_win' + '.png';
            imgUrl2 = 'resources/zjh/UI/img/' + 'img_lose' + '.png';
            this.setNodeImg(leftResultImg,imgUrl1);
            this.setNodeImg(rightResultImg,imgUrl2);
        }else{
            imgUrl1 = 'resources/zjh/UI/img/' + 'img_lose' + '.png';
            imgUrl2 = 'resources/zjh/UI/img/' + 'img_win' + '.png';
            this.setNodeImg(leftResultImg,imgUrl1);
            this.setNodeImg(rightResultImg,imgUrl2);
        }
        this.scheduleOnce(function(){
            this.pokerAnimBase.playScaleAnim(leftResultImg,1);
            this.pokerAnimBase.playScaleAnim(rightResultImg,1);
        },actionTime+0.5);

        //action5 nodeVisiable false
        this.scheduleOnce(function(){
            this.compareLayer.active = false;
        },actionTime+2);

        //action6 showWinAndLose
        var loseIndex = GameData.getPlayerPosByUid(loserUid);
        var loseNode = this.playerStateNode[loseIndex];
        var pokerNode = this.pokersNode.children[loseIndex].getChildByName('style1');
        var pokerStyle2 = this.pokersNode.children[loseIndex].getChildByName('style2');
        if (pokerStyle2 && pokerStyle2.active) {
            pokerNode = pokerStyle2;
        }
        var loseImg = cc.find(loseNode.name + '_shule',loseNode);
        this.scheduleOnce(function() {
            if (loseImg) {
                loseImg.active = true;
                self.pokerAnimBase.playScaleAnim(loseImg,1);
            }
            if (loserUid == GameData.player.uid) {
                soundMngr.instance.playAudioZJH('shibai',null);
            }
            for (var j = 0; j<pokerNode.childrenCount; j++) {
                var pokerMaskNode = cc.find(pokerNode.children[j].name + 'mask',pokerNode.children[j]);
                if (pokerMaskNode) {
                    pokerMaskNode.active = true;
                }
            }
            var isEnd = ZJH_roomData.isGameEnd();
            if (!isEnd) {
                ZJH_roomData.isRunAnimation = false;
            }
        },actionTime+2.2);

    },

    //---------------------------------------------------animation about end-------------------------------------------//

    //---------------------------------------------------btn click about start-------------------------------------------//

    operBtnClick: function (eve,data) {
        var type = data;
        cc.log('operAction Btn index:' + type);
        soundMngr.instance.playAudioOther('button');
        var isAutoFollow = ZJH_roomData.isAutoFollow(GameData.player.uid);
        var isMaxTurn = ZJH_roomData.gameInfo.curTurnNum  >= GameData.room.opts.maxTunNum;
        var isCheckTwoPlayer = ZJH_roomData.playersArr.length - ZJH_roomData.losersArr.length == 2;
        var isTwo = isCheckTwoPlayer && ZJH_roomData.gameInfo.curTurnNum >= 3;
        if (isAutoFollow && !isMaxTurn && !isTwo) {
            createMoveMessage('正处在自动跟注状态,请取消自动跟注！');
            return
        }
        switch (parseInt(type)) {
            case 1 :
                //弃牌
                this.operationBtns.active = false;
                this.requestPlayerGiveUp();
                break;
            case 2:
                //比牌
                this.comparePoker();
                break;
            case 3:
                //跟注
                this.operationBtns.active = false;
                this.requestPlayerFollowChips();
                break;
            case 4:
                //加注
                this.showSecondOperBtn(true);
                break;
            default :
                break;
        }
    },

    secondOperBtnClick: function (eve,data) {
        var type = data;
        var clipsArrNum = [];
        var clipNum = 0;
        soundMngr.instance.playAudioOther('button');
        if (GameData.room.opts.chipsType) {
            clipsArrNum = [5,10,20,50,100];
        }else{
            clipsArrNum = [1,2,5,10,20];
        }
        //金币场
        if(RoomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
            var scoreLv = RoomHandler.room.opts.scorelv;
            clipsArrNum =  ZJH_roomData.getRoomCoinChipConfig(scoreLv);
        }
        switch (parseInt(type)) {
            case 1:
                clipNum = clipsArrNum[0];
                break;
            case 2:
                clipNum = clipsArrNum[1];
                break;
            case 3:
                clipNum = clipsArrNum[2];
                break;
            case 4:
                clipNum = clipsArrNum[3];
                break;
            case 5:
                clipNum = clipsArrNum[4];
                break;
            default :break;
        }
        this.showSecondOperBtn(false);
        this.operationBtns.active = false;
        this.requestPlayerAddChips(clipNum)
    },

    comparePoker:function () {
        //剩余2人自动比牌无需点击头像
        var isLastTwoPlayer = ZJH_roomData.playersArr.length - ZJH_roomData.losersArr.length == 2;
        var toPkUid = 0;
        var livePlayerArr = ZJH_roomData.getLivePlayers();
        for (var i = 0; i<livePlayerArr.length; i++){
            if (GameData.player.uid != livePlayerArr[i]){
                toPkUid = livePlayerArr[i];
                break;
            }
        }
        if (isLastTwoPlayer) {
            this.requestPlayerCompare(toPkUid);
        }else{
            this.showSelectPlayerPK(true);
        }
    },

    selectPlayerClick: function (eve,data) {
        var index = data;
        var uid = GameData.getPlayerByPos(index).uid;
        this.showSelectPlayerPK(false);
        this.requestPlayerCompare(uid);
    },

    controlBtnDisable: function() {
        if (ZJH_roomData.gameInfo) {
            cc.log('当前轮数：'+ZJH_roomData.gameInfo.curTurnNum);//- 1
            var isMaxTurn = ZJH_roomData.gameInfo.curTurnNum   == GameData.room.opts.maxTunNum;
            var maxChipValue = GameData.room.opts.chipsType ? 50:10;
            if(RoomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
                var scoreLv = RoomHandler.room.opts.scorelv;
                var len = ZJH_roomData.CoinChipConfig[scoreLv].length - 2;
                maxChipValue = ZJH_roomData.getRoomCoinChipConfig(scoreLv)[len];
            }
            var isCheckTwoPlayer = ZJH_roomData.playersArr.length - ZJH_roomData.losersArr.length == 2;
            var isCurrMaxChipValue = parseInt(ZJH_roomData.gameInfo.maxChipsValue) == maxChipValue;
            //跟注按钮visiable
            var operBtn3 = cc.find('operationBtn3',this.operationBtns);

            if (isMaxTurn) {
                operBtn3.getComponent(cc.Button).interactable = false;
            }else{
                operBtn3.getComponent(cc.Button).interactable = true;
            }
            //加注按钮visiable
            var operBtn4 = cc.find('operationBtn4',this.operationBtns);
            if (isMaxTurn || isCurrMaxChipValue) {
                operBtn4.getComponent(cc.Button).interactable = false;
            }else{
                operBtn4.getComponent(cc.Button).interactable = true;
            }
            //比牌按钮visiable
            var operBtn2 = cc.find('operationBtn2',this.operationBtns);
            if (isMaxTurn || (isCheckTwoPlayer && ZJH_roomData.gameInfo.curTurnNum >= 3)
                || ZJH_roomData.gameInfo.curTurnNum >= 5) {
                operBtn2.getComponent(cc.Button).interactable = true;
            }else{
                operBtn2.getComponent(cc.Button).interactable = false;
            }
        }
    },

    //继续
    continueClick: function(){
        this.continueBtn.active = false;
        this.mingPaiBtn.active = false;
        soundMngr.instance.playAudioOther('button');
        if (!GameData.game.close) {
            GameNet.getInstance().request('room.roomHandler.ready', {}, function (rtn) {
            });
        }else{
            var summaryLayer = cc.find('layer_summary',this.node);
            summaryLayer.active = true;
        }
    },

    mingPaiClick: function () {
        soundMngr.instance.playAudioOther('button');
        this.mingPaiBtn.node.active = false;
        ZJHHandler.getInstance().requestPlayerMingPai();
    },

    allFollowClick: function () {
        soundMngr.instance.playAudioOther('button');
        this.requestAutoFollow();
    },


    //---------------------------------------------------btn click about end -------------------------------------------//

    //---------------------------------------------------------游戏操作请求start-------------------------------------//

    //看牌
    requestPlayerCheck: function () {
        if (inCD(2000)) return;
        soundMngr.instance.playAudioOther('button');
        ZJHHandler.getInstance().requestPlayerCheck();
    },

    //加注
    requestPlayerAddChips: function (chipNum) {
        if (this.isCheckPlayerCoin()) {
            return;
        }
        ZJHHandler.getInstance().requestPlayerAddChips(chipNum);
    },

    //弃牌
    requestPlayerGiveUp: function () {
        this.showSecondOperBtn(false);
        ZJHHandler.getInstance().requestPlayerGiveUp();
    },

    //跟注
    requestPlayerFollowChips: function () {
        if (this.isCheckPlayerCoin()) {
            return;
        }
        this.showSecondOperBtn(false);
        ZJHHandler.getInstance().requestPlayerFollowChips();
    },

    //自动跟注
    requestAutoFollow: function () {
        var checkBtn = cc.find('checkBtn',this.allFollowBtn.node);
        var animationNode = cc.find('animation',this.allFollowBtn.node);
        checkBtn.active = !checkBtn.active;
        animationNode.active = !animationNode.active;
        if (this.isCheckPlayerCoin()) {
            return;
        }
        ZJHHandler.getInstance().requestAutoFollow(checkBtn.active);
    },

    //比牌
    requestPlayerCompare: function (uid) {
        if (this.isCheckPlayerCoin()) {
            return;
        }
        this.showSecondOperBtn(false);
        this.operationBtns.active = false;
        ZJHHandler.getInstance().requestPlayerCompare(uid);
    },


    //---------------------------------------------------------游戏操作请求end-------------------------------------//


    getSpriteNameByCardId : function (pokerId) {
        var suitType = parseInt(pokerId/100);
        var baseNum = (suitType-1) * 16;
        var cardNum = pokerId-suitType*100;
        return (cardNum + baseNum);
    },


    //压筹码
    addChip: function (data, turnerUid) {
        var score = data;
        var localIdx = GameData.getPlayerPosByUid(turnerUid);
        var clipNode = cc.instantiate(this.chipPrefab);
        var handenode = this.playerNodes[localIdx];
        if (clipNode) {
            clipNode.getComponent('poker_chipPrefab').setChipImg(score);
            clipNode.parent = this.chipsNode;
            clipNode.x = handenode.x;
            clipNode.y = handenode.y;
            clipNode.active = true;
            this.clipFlyToTableAnimation(clipNode);
        }
    },

    randomNum: function (min, max) {
        var distance = max - min;
        var num = Math.random() * distance + min;
        return parseInt(num, 10);
    },

    saveAllPokerPosition: function () {
        this.allPokerPosArr = [];
        for (var j = 0; j<this.pokersNode.childrenCount; j++) {
            var tempArr = [];
            var poker = this.pokersNode.children[j].getChildByName('style1');
            for (var k = 0; k<poker.childrenCount; k++) {
                tempArr.push(poker.children[k].position);
            }
            this.allPokerPosArr.push(tempArr);
        }
    },

    savePokerData: function () {
        this.pokerArr = [];
        this.pokerPosArr = [];
        var playersArr = ZJH_roomData.playersArr;
        for (var i = 0; i<3; i++) {
            for (var j = 0; j<playersArr.length; j++) {
                var index = GameData.getPlayerPosByUid(playersArr[j]);
                var poker = this.pokersNode.children[index].getChildByName('style1');
                this.pokerArr.push(poker.children[i]);
                this.pokerPosArr.push(poker.children[i].position);
            }
        }
        cc.log('save Pokerdata finish!');
    },

    hideNodeChild: function (parent) {
        for (var key in parent.children) {
            parent.children[key].active = false;
        }
    },

    addPlayerStateImg: function (img,parent,scale,posY) {
        var stateNode = parent.getChildByName(parent.name + '_' + img);
        if (stateNode == null) {
            stateNode = cc.instantiate(this.playerStatePrefab);
            stateNode.parent = parent;
            stateNode.getComponent('poker_playerStateImgPrefab').setImg(img,scale,posY);
            stateNode.name = parent.name + '_' + img;
        }
    },

    addNodeMask: function (node,prefab) {
        var maskNode = node.getChildByName(node.name + 'mask');
        if (maskNode == null) {
            maskNode = cc.instantiate(prefab);
            node.addChild(maskNode);
            maskNode.name = node.name + 'mask';
        }
    },

    setMingPaiData: function (node,data) {
        var uid = data.detail.uid;
        var pokerArr = ZJH_roomData.getPlayerPokerByUid(uid);
        var pokeType = ZJH_roomData.getPlayerPokerTypeByUid(uid);
        var headIconNode = cc.find('playerNode/headMask/headIcon',node);
        var name = cc.find('playerNode/name',node);
        var pokersNode = cc.find('pokerNode/pokers',node);
        var pokerTypeNode = cc.find('pokerNode/pokerTypeBg/pokerType',node);
        //playerData
        var IconImg = GameData.getPlayerByUid(uid).headimgurl;
        var nameStr = GameData.getPlayerByUid(uid).name;
        this.setHeadIcon(headIconNode,IconImg);
        name.getComponent(cc.Label).string = getShortStr(nameStr,4);
        //pokerData
        if (pokerArr &&  pokersNode) {
            for (var i = 0; i<pokersNode.childrenCount; i++) {
                this.showPokerContent(pokersNode.children[i],pokerArr[i]);
            }
        }
        var pokeTypeUrl = 'resources/zjh/UI/artword/artword_' + pokeType + '.png';
        this.setNodeImg(pokerTypeNode,pokeTypeUrl);
    },

    setPkData: function(data) {
        var firstUid = data.uid;
        var secondUid = data.otherId;
        var leftIcon = cc.find('left/playerIcon',this.compareLayer);
        var rightIcon = cc.find('right/playerIcon',this.compareLayer);
        var leftPoker = cc.find('left/pokers',this.compareLayer);
        var rightPoker = cc.find('right/pokers',this.compareLayer);
        if (firstUid && secondUid) {
            //playerInfo
            var leftIconImg = GameData.getPlayerByUid(firstUid).headimgurl;
            var rightIconImg = GameData.getPlayerByUid(secondUid).headimgurl;
            this.setHeadIcon(leftIcon,leftIconImg);
            this.setHeadIcon(rightIcon,rightIconImg);
            //playerPoker
            for (var i = 0; i<3; i++) {
                this.setPkPokerImg(leftPoker.children[i],firstUid,i);
                this.setPkPokerImg(rightPoker.children[i],secondUid,i);
            }
        }

    },

    setHeadIcon: function(node,headimgurl) {
        var sp = node.getComponent(cc.Sprite);
        if (headimgurl == undefined || headimgurl == '' || headimgurl.length <= 0) {
            sp.spriteFrame = null;
            return;
        }
        cc.loader.load({url: headimgurl, type: 'png'}, function (error, texture) {
            if (!error && texture) {
                sp.spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },
    /**
     *
     * @param node：节点
     * @param uid:playerUid
     * @param index :poker index
     */
    setPkPokerImg: function(node,uid,index) {
        var isSeePoker = ZJH_roomData.getPlayerIsSeePokerByUid(uid);
        var pokerImgName = 0;

        if (isSeePoker) {
            var pokerArr = ZJH_roomData.getPlayerPokerByUid(uid);
            if (pokerArr) {
                pokerImgName = pokerArr[index];
            }
        }else{
            pokerImgName = 0; //牌背
        }
        this.showPokerContent(node,pokerImgName);
    },

    setNodeImg: function(node,imgUrl){
        if (node) {
            node.getComponent(cc.Sprite).spriteFrame = null;
            var texture = cc.textureCache.addImage(cc.url.raw(imgUrl));
            node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        }
    },

    moveAboutScore: function(uid,score){
        //小结算金币移动和飘分
        var self = this;
        // self.scoreMask.active = true;
        if (score == 0) {return}
        var index = GameData.getPlayerPosByUid(uid);
        var headNode = this.playerNodes[index];
        if (headNode) {
            var playerGetScore = headNode.getChildByName("resultScore");
        }
        var move1 = cc.moveBy(0.5,cc.p(0,40));
        if (playerGetScore == null && headNode) {
            playerGetScore = cc.instantiate(this.scorePrefab);
            playerGetScore.getComponent('tdk-resultFlyScore').getScoreColor(score);
            cc.find('score',playerGetScore).x += 20;
            playerGetScore.name = 'resultScore';
            playerGetScore.setTag(1000);
            playerGetScore.active = true;
            headNode.addChild(playerGetScore);
        }
        if (playerGetScore) {
            playerGetScore.runAction(move1);
        }
        this.scheduleOnce(function () {
            for (var i = 0; i < self.playerNodes.length; i++) {
                var flag = self.playerNodes[i].getChildByTag(1000);
                if(flag) {
                    self.playerNodes[i].removeChildByTag(1000);
                }
            }
        },1.5);
    },

    resultChipsAnimation: function (node, position) {
        var action1 = cc.moveTo(0.4,position);
        var action2 = cc.callFunc(function () {
            node.active = false;
            node.destroy();
        }, node);
        node.runAction(cc.sequence(action1, action2));
    },

    closePkLayer: function () {
        this.selectCompareNode.active = false;
    },

    refreshPlayerAllScore: function () {
        var scores = RoomHandler.getScoreData();
        //金币场
        if (RoomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
            scores = RoomHandler.getPlayersCoin();
        }
        var playerArr = GameData.joiners;
        for (var i = 0; i<playerArr.length; i++) {
            if (playerArr[i]) {
                var index = GameData.getPlayerPosByUid(playerArr[i].uid);
                if(this.playerNodes[index]) {
                    var playerNode = this.playerNodes[index].getChildByName('headNode');
                    playerNode.getComponent('pokerRoomPlayer').setCoin(scores[playerArr[i].uid]);
                }   
            }
        }
    },

    refreshPoker: function() {
        var myPokerNode = this.pokersNode.children[0].getChildByName('style1');
        var isSee = ZJH_roomData.getPlayerIsSeePokerByUid(GameData.player.uid);
        if (isSee) {
            var myPokerArr = ZJH_roomData.getPlayerPokerByUid(GameData.player.uid);
            for (var i = 0; i <myPokerNode.childrenCount; i++) {
                this.showPokerContent(myPokerNode.children[i],myPokerArr[i]);
            }
        }
    },

    isCheckPlayerCoin: function () {
        var myCoinNum = GameData.player.coin;
        var currMaxChipValue = parseInt(ZJH_roomData.gameInfo.maxChipsValue);
        var isSee = ZJH_roomData.getPlayerIsSeePokerByUid(GameData.player.uid);
        var bool = true;
        if (isSee){
            if (myCoinNum < currMaxChipValue*2) {
                createMoveMessage('金币不足');
                bool = true;
            }else{
                bool = false;
            }
        }else{
            if (myCoinNum < currMaxChipValue) {
                 createMoveMessage('金币不足');
                bool = true;
            }else{
                bool = false;
            }
        }
        return bool;
    }
});