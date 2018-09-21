var soundMngr = require('SoundMngr');
var RuleHandler = require('ruleHandler');

cc.Class({
    extends: cc.Component,

    properties: {
        uiWaitLayer: cc.Node,
        //uiTableLayer: cc.Node,
        tableUI: {
            default: [],
            type: cc.Node
        },
        //tableLayer: cc.Node,
        resultLayer: cc.Node,
        dissolveLayer: cc.Node,
        summaryLayer: cc.Node,
        debugLayer: cc.Node,
        talkBtn: cc.Button,
        yuyinNode: cc.Node,
        yuyinShortNode: cc.Node
    },

    // use this for initialization
    onLoad: function () {
        require('util').registEvent('onGameStart', this, this.showTableLayer);
        require('util').registEvent('onGameScore', this, this.showResultLayer);
        require('util').registEvent('onJoinerLost', this, this.showJoinerLost);
        require('util').registEvent('shortRecord', this, this.YVShortRecordCallback);
        require('util').registEvent('onServerNotice', this, handlerServerNotice);

        scheduleLamp(this);

        RuleHandler.instance.setGameType(GameData.client.gameType);

        if (GameData.game.gameStart) {
            this.showTableLayer();
        } else {
            this.showWaitLayer();
        }
        this.lostMessage = false;

        if (GameData.openScore == 1 || GameData.game.winnerUid > 0) {
            this.showResultDirectly();
        }

        var self = this;
        this.talkBtn.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            console.log('TOUCH_START');
            WriteLog('TOUCH_START : ');
            //增加连点CD；
            if (inCD(1000)) {
                return;
            }
            console.log('TOUCH_START and');
            yunwaStartTalk();
            self.yuyinNode.active = true;
            GameData.isPlayVioce = true;
            self.yuyinNode.getComponent(cc.Animation).play("yuyin");
            cc.audioEngine.pauseAll();

        });
        this.talkBtn.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            console.log('TOUCH_MOVE');
            var movePos = event.touch.getLocation();
            var talkBtnWorldPos = this.convertToWorldSpace(this.getPosition());
            var RelativeCoordinatePos = {};
            RelativeCoordinatePos.x = talkBtnWorldPos.x - this.getPosition().x + 170;
            RelativeCoordinatePos.y = talkBtnWorldPos.y - this.getPosition().y + 50;
            var distance = cc.pDistance(movePos, RelativeCoordinatePos);
            if (distance > this.width) {
                self.yuyinNode.getComponent(cc.Animation).play("CancelSend");
                GameData.isPlayVioce = false;
                // console.log("distance: movePos this.width/2 "+distance,movePos,this.width/2);
            }
        });
        this.talkBtn.node.on(cc.Node.EventType.TOUCH_END, function () {
            console.log('TOUCH_END');
            WriteLog('TOUCH_END : ');
            yunwaStopTalk();
            self.yuyinNode.active = false;
            cc.audioEngine.resumeAll();
        });
        this.talkBtn.node.on(cc.Node.EventType.TOUCH_CANCEL, function () {
            console.log('TOUCH_CANCEL');
            yunwaStopTalk();
            GameData.isPlayVioce = false;
            self.yuyinNode.active = false;
            cc.audioEngine.resumeAll();
        });
    },

    onDestroy: function () {
        unrequire('util').registEvent('onGameStart', this, this.showTableLayer);
        unrequire('util').registEvent('onGameScore', this, this.showResultLayer);
        unrequire('util').registEvent('onJoinerLost', this, this.showJoinerLost);
        unrequire('util').registEvent('shortRecord', this, this.YVShortRecordCallback);
        unrequire('util').registEvent('onServerNotice', this, handlerServerNotice);
        GameData.initRoomData();
    },

    showWaitLayer: function () {
        var flag = true;
        this.uiWaitLayer.active = flag;
        this.showTableUI(!flag);
        this.resultLayer.active = !flag;
        soundMngr.instance.playMusic('sound/beijyingyue');
    },

    showTableLayer: function () {
        var flag = true;
        this.showTableUI(flag);
        this.uiWaitLayer.active = !flag;
        this.resultLayer.active = !flag;
        soundMngr.instance.playMusic('sound/beijyingyue');
    },

    showResultLayer: function () {
        var self = this;
        this.scheduleOnce(function () {
            if (GameData.game.gameStart) return;
            self.showResultDirectly();
        }, 2);

    },

    showTableUI: function (show) {
        for (var i = 0; i < this.tableUI.length; i++) {
            var node = this.tableUI[i];
            node.active = show;
        }
    },

    showResultDirectly: function () {
        var flag = true;
        this.resultLayer.active = flag;
        this.uiWaitLayer.active = !flag;
        this.showTableUI(!flag);
        //table初始化的时候不敢保证这个监听和抛事件谁先执行，改为接口形式
        //sendEvent('onShowResult');
        if (GameData.contact == true && GameData.joinContact.uid == GameData.player.uid) {
            GameData.contact = false;
        } else {
            GameData.contact = false;
        }
        this.node.getComponent('roomResult').onShow();
    },

    showSettingLayer: function (evt, data) {
        soundMngr.instance.playAudioOther('button');
        sendEvent("runlamp");

        if (data == 1) {
            openView('SettingsPanel-tianjin');
        } else {
            this.settingLayer.active = false;
        }
    },

    showdissolveLayer: function (evt, data) {
        soundMngr.instance.playAudioOther('button');
        if (data == 1) {
            this.dissolveLayer.active = true;
            this.dissolveLayer.on(cc.Node.EventType.TOUCH_START, function (evt) {
                evt.stopPropagation();
            });
        } else {
            this.dissolveLayer.active = false;
        }
    },

    showSummaryLayer: function () {

        this.summaryLayer.active = true;
        // this.dissolveLayer.active = false;
        this.summaryLayer.on(cc.Node.EventType.TOUCH_START, function (evt) {
            evt.stopPropagation();
        });
        sendEvent('onShowSummary');
        if (GameData.player.uid == GameData.room.creator) {
            cc.sys.localStorage.setItem("creatorIsCheckIp", false);
        } else {
            cc.sys.localStorage.setItem("isCheckIp", false);
        }
    },
    shutDissolveLayer: function () {
        if (GameData.showResult == true) {} else {
            this.showSummaryLayer();
        }

    },
    showDebugLayer: function () {
        this.debugLayer.active = !this.debugLayer.active;
    },

    showJoinerLost: function (data) {},

    showChat: function () {
        if (inCD(3000)) return;
        soundMngr.instance.playAudioOther('button');
        openView('ChatPanel');
    },
    YVShortRecordCallback: function () {
        WriteLog('YVShortRecordCallback : ');
        this.yuyinShortNode.getComponent(cc.Animation).play("ShortRecoed");
        this.yuyinShortNode.getComponent('HideComponent').show(1);
    }
});