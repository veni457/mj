var roomUtil = require('roomUtil');
var roomHandler = require('roomHandler');
var gameDefine = require('gameDefine');
var soundMngr = require('SoundMngr');
cc.Class({
    extends: cc.Component,

    properties: {
        //btn
        talkBtn: cc.Button,

        //des
        wifiNode: cc.Node,
        roomNum: cc.Label,
        roomRound: cc.Label,
        powerNode: cc.Node,
        yuyinNode: cc.Node,
        roomRule: cc.Label,
        timeLabel: cc.Label,
        playintrNode: cc.Node,
        yuyinShortNode: cc.Node,
        roomDesNodeCard: cc.Node,
        roomDesNodeCoin: cc.Node,

        //other
        playersNode:[cc.Node],
        //prefab
        playerPrefab: cc.Prefab,

        //需要添加的游戏主节点
        //ZJHRoomMainPrefab: cc.Prefab,//扎金花

        //存储容器
        container: cc.Node
    },

    onLoad: function () {
        require('util').registEvent('onRoomInfo', this, this.showPlayers);
        require('util').registEvent('nativePower', this, this.showPower);
        require('util').registEvent('yunwaUploaded', this, this.handleVoice);
    },

    onDestroy: function () {
        unrequire('util').registEvent('onRoomInfo', this, this.showPlayers);
        unrequire('util').registEvent('nativePower', this, this.showPower);
        unrequire('util').registEvent('yunwaUploaded', this, this.handleVoice);
    },

    onEnable: function () {
        this.setVoiceBtn();
        this.showTime();
        this.showWifi();
        this.showPlayers();
        this.showRoomDes();
        //this.addGameNode();
        //刷新时间，电量，wifi
        this.schedule(this.showTime, 1);
        this.schedule(this.showWifi, 5);
        this.schedule(roomUtil.getPower, 60);
    },
    showRoomDes: function () {
        if (roomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
            this.showRoomDesCoin();
        }else{
            this.showRoomDesCard();
        }
    },
    showRoomDesCoin: function () {
        var bool = true;
        this.roomDesNodeCard.active = !bool;
        this.roomDesNodeCoin.active = bool;
        this.showRoomDesCoinNum();
        this.showRoomDesRule();
    },
    showRoomDesCard: function () {
        var bool = true;
        this.roomDesNodeCard.active = bool;
        this.roomDesNodeCoin.active = !bool;
        this.showRoomDesCardNum();
        this.showRoomDesRule();
    },

    showPlayers: function() {
        //for (var i = 0; i<GameData.room.opts.joinermax; i++) {
        //    this.showPlayer(i,this.playersNode[i]);
        //}
        var roomData = roomHandler.getRoomData();
        var showRoundNum = roomData.roundNum > roomData.opts.roundMax ? roomData.opts.roundMax : roomData.roundNum;
        this.roomRound.string = '局数: ' + showRoundNum + '/' + roomData.opts.roundMax;
        //金币场
        if (roomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
            this.showRoomDesCoinNum()
        }
    },

    showPlayer: function (pos, playerNode) {
        var player = GameData.getPlayerByPos(pos);
        if (player != null) {
            var headNode = playerNode.getChildByName('headNode');
            if (headNode == null) {
                headNode = cc.instantiate(this.playerPrefab);
                headNode.getComponent('pokerRoomPlayer').setPlayer(player);
                headNode.getComponent('pokerRoomPlayer').setName(player.name);
                headNode.getComponent('pokerRoomPlayer').setHeadIcon(player.headimgurl);
                //headNode.getComponent('pokerRoomPlayer').showCountDownEffect(true,10);
                headNode.name = 'headNode';
                playerNode.addChild(headNode);
            }
            var scores = roomHandler.getScoreData();
            headNode.getComponent('pokerRoomPlayer').setIsOnline(player.uid);
            //headNode.getComponent('pokerRoomPlayer').setCoin(scores[player.uid]);
            playerNode.active = true;
        } else {
            playerNode.active = false;
        }
    },

    showWifi: function() {
        var index = 0;
        var ms = GameNet.getInstance().getPingPong();
        if (ms < 300) {
            index = 3;
        } else if (ms < 600) {
            index = 2;
        } else if (ms < 1000) {
            index = 1;
        }

        for (var i = 0; i < 4; i++) {
            var node = cc.find('WiFi-' + (i + 1), this.wifiNode);
            node.active = i == index ? true : false;
        }
    },

    showPower: function (percent) {
        powerNode.scaleX = percent.detail / 100;
    },

    showTime: function () {
        this.timeLabel.string = roomUtil.getTimeString();
    },

    showRoomDesCardNum: function () {
        this.roomNum.string = roomUtil.getRoomString(GameData.room.id);
    },
    showRoomDesCoinNum: function () {
        var des = cc.find('des',this.roomDesNodeCoin);
        var roomInfo = roomHandler.room;
        var roundNums = roomInfo.gameNum+1;
        if (roundNums.toString().length == 1) {
            roundNums = '000'+ roundNums;
        }else if (roundNums.toString().length == 2) {
            roundNums = '00'+ roundNums;
        }else if (roundNums.toString().length == 3) {
            roundNums = '0'+ roundNums;
        }else if (roundNums.toString().length == 4) {
            roundNums = roundNums;
        }
        if(des){
            des.getComponent(cc.Label).string = roundNums + roomUtil.getRoomString(GameData.room.id);
        }
    },

    showRoomDesRule: function() {
        var roomData = roomHandler.getRoomData();
        var gameType = GameData.client.gameType;
        switch (gameType) {
            case gameDefine.GameType.Game_Poker_ZJH:
                if(roomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Coin){
                    var rule = cc.find('roomRule',this.roomDesNodeCoin);
                    if (rule) {
                        rule.getComponent(cc.Label).string = this.getRuleStrZJH(roomData.opts);
                    }
                }else{
                    this.roomRule.string = this.getRuleStrZJH(roomData.opts);
                }

                break;
            default :break;
        }
    },

    setVoiceBtn: function() {
        var self = this;
        this.talkBtn.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            if (inCD(1000)) return;
            yunwaStartTalk();
            self.yuyinNode.active = true;
            GameData.isPlayVioce = true;
            self.yuyinNode.getComponent(cc.Animation).play("yuyin");
            cc.audioEngine.pauseAll();
        });

        this.talkBtn.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            var movePos = event.touch.getLocation();
            var talkBtnWorldPos = this.convertToWorldSpace(this.getPosition());
            var RelativeCoordinatePos = {};
            RelativeCoordinatePos.x = talkBtnWorldPos.x - this.getPosition().x + 170;
            RelativeCoordinatePos.y = talkBtnWorldPos.y - this.getPosition().y + 50;
            var distance = cc.pDistance(movePos, RelativeCoordinatePos);
            if (distance > this.width) {
                self.yuyinNode.getComponent(cc.Animation).play("CancelSend");
                GameData.isPlayVioce = false;
            }
        });

        this.talkBtn.node.on(cc.Node.EventType.TOUCH_END, function () {
            yunwaStopTalk();
            self.yuyinNode.active = false;
            cc.audioEngine.resumeAll();
        });

        this.talkBtn.node.on(cc.Node.EventType.TOUCH_CANCEL, function () {
            yunwaStopTalk();
            GameData.isPlayVioce = false;
            self.yuyinNode.active = false;
            cc.audioEngine.resumeAll();
        });

        if(roomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
            this.talkBtn.node.active = false;
        }else{
            this.talkBtn.node.active = true;
        }
    },

    handleVoice: function (data) {
        var soundurl = data.detail;
        WriteLog('soundurl 语音' + soundurl);
        ChatHandler.getInstance().sendRecord(soundurl);
    },

    onSettingClicked: function(evt) {
        soundMngr.instance.playAudioOther('button');
        openView('poker_settingPrefab',gameDefine.GameType.Game_Poker_ZJH);
    },

    onRuleClicked: function(evt) {
        var intrNode = this.playintrNode;
        if (intrNode.active) return;

        var contentNode = cc.find('small/content', intrNode);
        if (contentNode) {
            contentNode.getComponent(cc.Label).string = this.roomRule.string;

            intrNode.active = true;
            intrNode.runAction(cc.sequence(
                cc.moveTo(0.5, cc.p(30, 334)),
                cc.delayTime(10),
                cc.moveTo(0.5, cc.p(30, 434)),
                cc.callFunc(function() {
                    intrNode.active = false;
                })
            ));
        }
    },

    onChatClicked: function(evt) {
        if (inCD(2000)) return;
        //cc.log('1111111111111111111');
        soundMngr.instance.playAudioOther('button');
        openView('NiuNiuChatPanel',gameDefine.GameType.Game_niu_niu);
    },
    //增减游戏主节点
    addGameNode: function() {
        this.container.removeAllChildren(true);
        var gameType = GameData.room.opts.gameType;
        var currGameNode ;
        switch (gameType) {
            case gameDefine.GameType.Game_Poker_ZJH:
                currGameNode = cc.instantiate(this.ZJHRoomMainPrefab);
                break;
            default : break;
        }
        currGameNode.setPosition(this.container.getPosition());
        this.container.addChild(currGameNode);
    },
    getRuleStrZJH: function (data) {
        if (!data || Object.keys(data).length == 0) return "";
        var playStr = "";
        if (data.chipsType  == 0) {
            playStr += "底分1," + '\n';
        } else if (data.chipsType == 1) {
            playStr += "底分5," + '\n';
        }

        switch (data.canNotLookTurnNum) {
            case 0:
                playStr += "无必闷," + '\n';
                break;
            case 1:
                playStr += "闷一轮," + '\n';
                break;
            case 2:
                playStr += "闷两轮," + '\n';
                break;
            case 3:
                playStr += "闷三轮," + '\n';
                break;
        }
        switch (data.maxTunNum) {
            case 5:
                playStr += "封顶轮数5," + '\n';
                break;
            case 10:
                playStr += "封顶轮数10," + '\n';
                break;
            case 15:
                playStr += "封顶轮数15," + '\n';
                break;
            case 20:
                playStr += "封顶轮数20," + '\n';
                break;
        }
        if (data.compareSuit) {
            playStr += "比花色," + '\n';
        }
        if (data.twoThreeFiveBiger ) {
            playStr += "235吃豹子," + '\n';
        }
        switch (data.a23Type) {
            case 1:
                playStr += "A23地龙" + '\n';
                break;
            case 0:
                playStr += "A23最大" + '\n';
                break;
            case 2:
                playStr += "A23最小" + '\n';
                break;
        }
        //金币场
        if (roomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
            playStr = '闷1轮'+ '\n' + '封顶10轮'  + '\n' + '235吃豹子' + '\n';
        }
        return playStr;
    }

});
