var roomHandler = require('roomHandler');
var niuNiuHandler = require('niuNiuHandler');
var soundMngr = require('SoundMngr');
cc.Class({
    extends: cc.Component,

    properties: {
        resultLayer: cc.Node,
        resultNode: cc.Node,
        scoreNode: cc.Node,
        scoreContent: cc.Node,
        lastTimeLabel: cc.Label,
        fonts: {
            default: [],
            type: cc.Font
        }
    },

    onLoad: function () {

    },
    showUI: function () {
        var resultData = roomHandler.recordData;
        if (resultData.length == 0) return;
        this.scoreNode.removeAllChildren();
        var roomInfo = roomHandler.room;
        var thisRoundScore = resultData[roomInfo.gameNum-1].score;
        var index = 0;
        for (var key in thisRoundScore) {
            if(thisRoundScore[key] != undefined){
                var scorelist = cc.instantiate(this.scoreContent);
                var playerInfo = roomHandler.getPlayerByUid(key);
                //头像
                var headNode = cc.find('headNode/headSp',scorelist);
                this.showPlayerHead(headNode, playerInfo.headimgurl);
                //昵称
                var nameLb = cc.find('name',scorelist);
                nameLb.getComponent('cc.Label').string = playerInfo.name.substring(0, 4);
                if (key == GameData.player.uid) {
                    nameLb.color = new cc.Color(172,234,111);
                }else {
                    nameLb.color = new cc.Color(255,229,178);
                }
                //分数
                var scoreLb = cc.find('score',scorelist);
                if (thisRoundScore[key] > 0) {
                    scoreLb.getComponent('cc.Label').string = '+'+thisRoundScore[key];
                    scoreLb.getComponent('cc.Label').font = this.fonts[0];
                }else if (thisRoundScore[key] == 0) {
                    scoreLb.getComponent('cc.Label').string = thisRoundScore[key];
                    scoreLb.getComponent('cc.Label').font = this.fonts[1];
                }else if (thisRoundScore[key] < 0) {
                    scoreLb.getComponent('cc.Label').string = thisRoundScore[key];
                    scoreLb.getComponent('cc.Label').font = this.fonts[2];
                }

                scorelist.y = -47*index;
                this.scoreNode.addChild(scorelist);
                index ++ ;
            }
        }
        this.getWinOrLose(thisRoundScore);
        this.handleCloseTimer();
        sendEvent('onPrepareInfo', roomHandler.readyData);
    },
    showPlayerHead: function (headNode, headimgurl) {
        if (headimgurl == '' || headimgurl == undefined) return;

        var self = this;

        cc.loader.load({
            url: headimgurl,
            type: 'png'
        }, function (error, texture) {
            if (!error && texture) {
                headNode.getComponent(cc.Sprite).spriteFrame = null;
                headNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },
    getWinOrLose: function (gameData) {
        var win  = cc.find('win',this.resultNode);
        var ping = cc.find('ping',this.resultNode);
        var lose = cc.find('lose',this.resultNode);
        var isActive = true;
        if (gameData[GameData.player.uid] != undefined) {
            var selfScore = gameData[GameData.player.uid];
            if (selfScore > 0) {
                win.active = isActive;
                ping.active = !isActive;
                lose.active = !isActive;
            }else if (selfScore == 0) {
                win.active = !isActive;
                ping.active = isActive;
                lose.active = !isActive;
            }else if (selfScore < 0) {
                win.active = !isActive;
                ping.active = !isActive;
                lose.active = isActive;
            }
        }
    },

    handleCloseTimer: function () {
        this.lastTimeLabel.string = '(3)';
        this.lastTime = 3;
        this.schedule(this.updateLastTime, 1);
    },
    updateLastTime: function () {
        cc.log('this.lastTime = '+this.lastTime);
        this.lastTime--;
        var labelStr = '('+this.lastTime+')';
        this.lastTimeLabel.string = labelStr;
        if (this.lastTime <= 0) {
            if (!GameData.roomClose) {
            } else {
                this.node.getComponent('niuNiuRoomMain').showSummaryLayer();
            }
            this.resultLayer.active = false;
            sendEvent('onPrepareInfo', roomHandler.readyData);
            this.unschedule(this.updateLastTime);
        }
    },
    readyClick: function (evt) {
        soundMngr.instance.playAudioOther('button');
        if (!GameData.roomClose) {
            this.clearCard();
            roomHandler.setReady();
        } else {
            this.node.getComponent('niuNiuRoomMain').showSummaryLayer();
        }
        this.resultLayer.active = false;
        niuNiuHandler.readyBtnActive = true;
        sendEvent('onPrepareInfo', roomHandler.readyData);
        this.unschedule(this.updateLastTime);
    },
    clearCard: function () {
        var parentNode = cc.find("Canvas/layer_ui/layer_ui_table");
        parentNode.getComponent('niuNiuRoomPlay').clearUI();
    },
});
