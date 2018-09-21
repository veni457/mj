var RoomHandler = require('roomHandler');
var soundMngr = require('SoundMngr');
var gameDefine = require('gameDefine');
var ZJH_roomData = require('ZJH-RoomData');
cc.Class({
    extends: cc.Component,

    properties: {
        uid: 0,
        headBtn: cc.Button,
        headIcon: cc.Sprite,
        zhuangIcon: cc.Sprite,
        nameLabel: cc.Label,
        score: cc.Node,
        _player : null,
        countDownNode: cc.Node,
        chatsNode: [cc.Node],
        fonts :{
            default:[],
            type:cc.Font
        },
        countDownTotalLen: 15
    },

    // use this for initialization
    onLoad: function () {

    },

    setPlayer : function(data)
    {
        this._player = data;
        this.uid = this._player.uid;
    },

    setName: function(name) {
        this.nameLabel.string = getShortStr(name,4);
        var coinNode = cc.find('coin',this.node);
        if(GameData.room.opts.gameType == gameDefine.GameType.Game_Poker_ZJH) {
            if (GameData.player.uid == this.uid) {
                this.nameLabel.node.y = -8;
                coinNode.y = -30;
            }
        }
    },

    setHeadIcon: function(headimgurl) {
        if (headimgurl == undefined || headimgurl == '' || headimgurl.length <= 0) {
            this.headIcon.spriteFrame = null;
            return;
        }
        var self = this;
        cc.loader.load({url: headimgurl, type: 'png'}, function (error, texture) {
            if (!error && texture) {
                self.headIcon.spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },

    showPlayerIdentity: function(show,type) {
        this.setIsPlayerIcon(show);

        if(type == 1){
            var texture = cc.textureCache.addImage(cc.url.raw('resources/ddz/UI/common/icon/dizhu_icon.png'));
            this.zhuangIcon.spriteFrame = new cc.SpriteFrame(texture);
        }else if(type == 2){
            var texture = cc.textureCache.addImage(cc.url.raw('resources/ddz/UI/common/icon/nongmin_icon.png'));
            this.zhuangIcon.spriteFrame = new cc.SpriteFrame(texture);
        }
    },
    setNamePositionByDir:function (direction) {
        if(direction == 'right'){
            this.nameLabel.node.x = -57 ;
            this.score.x = -53;
            this.zhuangIcon.node.x = 33;
            this.nameLabel.horizontalAlign = 3 ;
            this.nameLabel.node.anchorX = 1;
            this.score.horizontalAlign = 3;
            this.score.anchorX = 1;
        }
    },
    showZhuang: function(show) {
        this.zhuangIcon.node.active = show;
    },

    enableHeadBtn: function(flag) {
        this.headBtn.node.active = flag;
    },
    showCountDownEffect: function(bool,time) {
        if (bool){
            this.playCountAnimtion(time);
        }else {
            this.countDownNode.active = bool;
            this.unschedule(this.countDownBgChange);
        }
    },
    playCountAnimtion: function(time) {
        var animationNode = cc.find('animation',this.countDownNode);
        var bg = cc.find('bg',this.countDownNode);
        //animationNode.getComponent(cc.Animation).play('countDown',time);
        bg.getComponent(cc.Sprite).fillStart = 0.44;
        this.startPos = 1 - time/this.countDownTotalLen;//(0-1)
        bg.getComponent(cc.ProgressBar).progress = this.startPos;
        this.schedule(this.countDownBgChange,0.5);
    },
    countDownBgChange: function(){
        if (!ZJH_roomData.isRunAnimation) {
            this.countDownNode.active = true;
        }else {
            this.countDownNode.active = false;
        }
        this.startPos -= 1/(this.countDownTotalLen * 2);
        var bg = cc.find('bg',this.countDownNode);
        bg.getComponent(cc.ProgressBar).progress = this.startPos;
        if(this.startPos <= 0){
            this.unschedule(this.countDownBgChange);
        }
    },

    onHeadBtnClicked: function(evt) {
        soundMngr.instance.playAudioOther('button');
        var sceneName = cc.director.getScene().name;
        cc.log("..sceneName:", sceneName);
        if (sceneName == 'home'){
            createPlayerInfoPanel(this._player);
        } else {
            var self = this;
            var fun = function(panel){
                if(panel){
                    var template = panel.getComponent('uiRoomPlayerInfo');
                    if(template){
                        template.onShow(self._player);
                    }
                }
            };
            var roomData = RoomHandler.getRoomData();
            if(roomData && roomData.opts && roomData.opts.gameType){
                cc.log('..gameType:'+roomData.opts.gameType);
                openPlayerInfoView(roomData.opts.gameType, fun);
            }
        }
    },

    setCoin : function(value)
    {
        var coinNode = cc.find('coin',this.node);
        var showStr = '';
        //��ҳ�
        if (RoomHandler.room.opts.currencyType == gameDefine.currencyType.Currency_Coin) {
            value = ConversionCoinValue(value, 2);
            showStr = value;
        }
        cc.log('coin:'+value);
        if(value > 0)
        {
            showStr = '+' + value;
            //coinNode.getComponent('cc.Label').font = this.fonts[0];
        }
        else if(value < 0)
        {
            showStr = value;
            //coinNode.getComponent('cc.Label').font = this.fonts[1];
        }
        else if(value == 0)
        {
            showStr = value;
            //coinNode.getComponent('cc.Label').font = this.fonts[2];
        }

        coinNode.getComponent(cc.Label).string = showStr;
    },
    getLiuGuang : function(isPlay){
        var liuguang = cc.find('liuguang',this.node);
        liuguang.active = isPlay;
    },
    setIsOnline : function (userId) {
        var disConncetNode = cc.find('Disconnect', this.node);
        var isOnlin = RoomHandler.isPlayerOnline(userId);
        disConncetNode.active = !isOnlin;
    }
});
