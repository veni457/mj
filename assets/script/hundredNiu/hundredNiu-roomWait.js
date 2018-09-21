var gameDefine = require('gameDefine');
var roomHandler = require('roomHandler'); 
var HundredNiuHandler = require('hundredNiuHandler');
var niuniuPokerHandler = require('niuniuPokerHandler');
cc.Class({
    extends: cc.Component,

    properties: {
        playerHeads: [cc.Node],
        twoPlayerPrefab: cc.Prefab,
        dragonBonesNode: cc.Prefab,
        lastTimeLabel: cc.Label,
        readyNode: cc.Node,
    },

    onLoad: function () {
        this.headers = new Array();
        this.handlerMsg();
        this.initTabelUI();
        this.showPlayers();
        //添加互动动画
        this.addDynAnimation();
    },
    handlerMsg: function () {
        require('util').registEvent('onPrepareInfo', this, this.beginUI);
        require('util').registEvent('dynChat', this, this.dynChatHandler);
        require('util').registEvent('onJoinerLost', this, this.showPlayers);
        require('util').registEvent('niuhun-onGameInfo', this, this.beginUI);
        require('util').registEvent('onJoinerConnect', this, this.showPlayers);
        require('util').registEvent('onPlayerUpdate', this, this.refreshPlayers);
        require('util').registEvent('niuhun-onGameStart', this, this.showPlayers);
    },
    onDestroy: function () {
        unrequire('util').registEvent('onPrepareInfo', this, this.beginUI);
        unrequire('util').registEvent('dynChat', this, this.dynChatHandler);
        unrequire('util').registEvent('onJoinerLost', this, this.showPlayers);
        unrequire('util').registEvent('niuhun-onGameInfo', this, this.beginUI);
        unrequire('util').registEvent('onJoinerConnect', this, this.showPlayers);
        unrequire('util').registEvent('onPlayerUpdate', this, this.refreshPlayers);
        unrequire('util').registEvent('niuhun-onGameStart', this, this.showPlayers);
    },

    initTabelUI: function () {
        this.lastTimeLabel.node.active = false;
        this.beginUI();
        this.showPlayers();
    },
    refreshPlayers: function () {
        if (!HundredNiuHandler.isFlyChipsAndCoin) {
            this.showPlayers();
        }
    },
    showPlayers: function () {
        this.headers = [];
        this.initPlayerHeads();
        this.showPlayer();
    },
    initPlayerHeads: function () {
        for (var i = 0; i < this.playerHeads.length; i++) {
            var headNode = this.playerHeads[i].getChildByName("rightOrLeftPlayerInfo");
            var playerHeadScp = headNode.getComponent("niuNiuPlayerInfo");
            playerHeadScp.setName('');
            playerHeadScp.setPlayer({});
            playerHeadScp.initHeadIcon();
            playerHeadScp.setIsOnline(true); //在线信息
            playerHeadScp.showHeadBg(true); //头像背景
            playerHeadScp.setCoinShow(false);
            playerHeadScp.HeadBtnIsClick(false); //头像按钮是否可点击
            playerHeadScp.showZhuangNumNode(false); //连庄次数显示
            playerHeadScp.setGold('', gameDefine.GameType.Game_Niu_Hundred);

            if (i == 1 || i == 2 || i == 7) {
                playerHeadScp.showZhuang(true);
            }else {
                playerHeadScp.showZhuang(false);
            }
        }
    },
    showPlayer: function () {
        this.showSelfInfo();
        this.showOtherPlayer();
    },
    showSelfInfo: function () {
        if (GameData.player == null || GameData.player == undefined) return;
        var selfHeadInfo = GameData.player;
        this.showHeadInfo(selfHeadInfo, this.playerHeads[0], 0);
    },
    showOtherPlayer: function () {
        if (HundredNiuHandler.playerInfo == undefined || HundredNiuHandler.playerInfo == null) return;
        var players = HundredNiuHandler.playerInfo;
        for (var j = 0; j < players.length; j++) {
            var player = players[j];
            if (player != null){
                this.showHeadInfo(player, this.playerHeads[j+1], j+1);
            }
        }
    },
    showHeadInfo: function (playerInfo, Pos, sign) {
        var headNode = Pos.getChildByName("rightOrLeftPlayerInfo");
        var playerHeadScp = headNode.getComponent("niuNiuPlayerInfo");

        var zhuangUid = HundredNiuHandler.zhuangUid;
        var zhuangAc = (playerInfo.uid == zhuangUid);
        var xitongZhuang = (playerInfo.uid == HundredNiuHandler.zhuangPlayers.uid);
        if (zhuangAc && sign != 0 && playerInfo.uid != HundredNiuHandler.zhuangPlayers.uid) {
            playerHeadScp.lianZhuangNum(5 - HundredNiuHandler.lianzhuangNum);
            playerHeadScp.showZhuangNumNode(zhuangAc);
        }
        // playerHeadScp.showHeadBg(true);
        playerHeadScp.HeadBtnIsClick(true);
        playerHeadScp.setPlayer(playerInfo);
        playerHeadScp.setName(playerInfo.name);
        playerHeadScp.setHeadIcon(playerInfo.headimgurl);
        playerHeadScp.setLabelNodePos(zhuangAc, xitongZhuang);
        playerHeadScp.setGold(playerInfo.coin, gameDefine.GameType.Game_Niu_Hundred);

        if (sign >= 3 && sign <= 6 || playerInfo.uid == HundredNiuHandler.zhuangPlayers.uid) {
            playerHeadScp.setCoinShow(false);
        }else {
            playerHeadScp.setCoinShow(true);
        }
        
        this.headers.push(headNode);
    },
    beginUI: function () {
        cc.log('===========roomHandler.room.status = '+roomHandler.room.status);
        cc.log('-----------roomHandler.readyCountDown = '+roomHandler.readyCountDown);
        if (HundredNiuHandler.status == niuniuPokerHandler.HUNDREDNIUSTATUS.CHIPS) {
            this.readyNode.active = false;
            this.lastTimeLabel.string = '';
            this.lastTimeLabel.node.active = false;
            this.unschedule(this.updateLastTime);
            return;
        }
        if (roomHandler.readyCountDown > 0) {
            if (roomHandler.room.status == gameDefine.RoomState.WAIT) {
                this.readyAnimation();
            } else {
                this.beginCountDown();
            }
        }
    },
    beginCountDown: function () {
        cc.log('beginCountDownbeginCountDownbeginCountDownbeginCountDown');
        this.lastTimeLabel.string = '';
        this.lastTimeLabel.node.active = true;
        this.handleCloseTimer();
    },
    //开始倒计时
    handleCloseTimer: function () {
        cc.log('ready start count: roomHandler.readyCountDown = '+roomHandler.readyCountDown);
        this.updateLastTime();
        this.schedule(this.updateLastTime, 1);
    },
    updateLastTime: function () {
        roomHandler.readyCountDown --;
        if (roomHandler.readyCountDown <= 0 || HundredNiuHandler.readyLabelActive) {
            this.lastTimeLabel.string = '';    
        }else {
            this.lastTimeLabel.string = '休息一下：'+roomHandler.readyCountDown;    
        }
        if (roomHandler.readyCountDown <= 0) {
            this.lastTimeLabel.string = '';
            this.lastTimeLabel.node.active = false;
            this.unschedule(this.updateLastTime);
        }
    },
    //等待动画
    readyAnimation: function () {
        this.readyNode.active = true;
        var readyAnim = cc.find('readyAnim',this.readyNode);
        var anim2 = readyAnim.getComponent(dragonBones.ArmatureDisplay);
        anim2.playAnimation('newAnimation',0);
    },

    getHeadPositionOnUid: function(uid){
        cc.log('playerPosition = ' + HundredNiuHandler.getPlayerPosByUid(uid));
        var localIdx = HundredNiuHandler.getPlayerPosByUid(uid);
        var player;
        if (localIdx == -1) {
            player = cc.find('tableInfo/otherPlayer', this.node);
        } else {
            var playerPos = HundredNiuHandler.getPlayerPosByUid(uid);
            player = this.headers[playerPos].parent;
        }

        return player.position;
    },
    dynChatHandler: function(data){
        if(data == undefined || data.detail == undefined){
            return;
        }

        var index = data.detail.chatId,
            fromUid = data.detail.fromUid,
            toUid = data.detail.toUid;

        var animationNode = this.node.getChildByName('uiAnimationNode');
        if(animationNode){
            var template = animationNode.getComponent('tableDynAnimation');
            if(template){
                var fromPos = this.getHeadPositionOnUid(fromUid);
                var toPos = this.getHeadPositionOnUid(toUid);

                template.playAnimation(index, 0.65, fromPos, toPos);
            }
        }
    },
    addDynAnimation: function(){
        var animationNode = this.node.getChildByName('uiAnimationNode');
        if(animationNode == undefined){
            animationNode = cc.instantiate(this.dragonBonesNode);
            animationNode.parent = this.node;
            animationNode.name = 'uiAnimationNode';
        }
    }
});
