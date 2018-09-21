var game = require('gameConfig');
var soundMngr = require('SoundMngr');

cc.Class({
    extends: cc.Component,

    properties: {
        cardId: 0,
        index: 0,

        _isPlay: false,
        _isMove: false,
        _initPos: undefined,
        _firstMovePos: undefined
    },

    onLoad: function () {
        require('util').registEvent('AllHandCardRestoration', this, this.cardRestoration);

        //初始坐标
        if(this.node.parent){
            this._initPos = this.node.parent.position;
        }
        this.setTouchOn();
    },
    onDestroy: function(){
        unrequire('util').registEvent('AllHandCardRestoration', this, this.cardRestoration);
    },
    onEnable: function(){
        //是否选中
        this._isPlay = false;
        //是否开始移动牌
        this._isMove = false;
        //第一次移动的坐标
        this._firstMovePos = undefined;
    },

    setTouchOn : function(){
        this.node.interactable = true;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onBtnStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onBtnMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onBtnEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onBtnCancel, this);
    },
    setTouchOff : function(){
        this.node.interactable = false;
        this.node.off("touchstart", this.onBtnStart, this);
        this.node.off("touchmove", this.onBtnMove, this);
        this.node.off("touchend", this.onBtnEnd, this);
        this.node.off("touchcancel", this.onBtnCancel, this);
    },

    getCardId: function () {
        return this.cardId;
    },
    setCardId: function (id) {
        this.cardId = id;
    },
    getIndex: function () {
        return this.index;
    },
    setIndex: function (index) {
        this.index = index;
    },
    cardRestoration: function(){
        if(this._initPos == undefined){
            return;
        }
        this._isPlay = false;
        this.node.parent.setPosition(this._initPos);
    },
    cardUpspring: function(){
        if(this._initPos == undefined){
            return;
        }
        this._isPlay = true;
        this.node.parent.setPositionY(this._initPos.y +30);
    },

    onBtnStart : function(event){
        soundMngr.instance.playAudioOther('card_click');
        if (game.getGameData().getGameInfoData().turn != GameData.player.uid){
            return;
        }
        this._firstMovePos = event.touch.getLocation();
    },
    onBtnMove:function(event){
        if (game.getGameData().getGameInfoData().turn != GameData.player.uid){
            return;
        }
        var position = event.touch.getLocation();
        var node = this.node.parent;

        if (Math.abs(position.x - this._firstMovePos.x) >= 20
            || Math.abs(position.y - this._firstMovePos.y) >= 20) {
            this._isMove = true;
        }
        if( this._isMove == true ) {
            node.setPosition(node.parent.convertToNodeSpaceAR(position));
        }
    },
    onBtnEnd:function(event) {
        if (game.getGameData().getGameInfoData().turn != GameData.player.uid){
            return;
        }
        var node = this.node.parent;

        //是否滑牌
        if (this._isMove == true) {
            //判断是否滑过指定范围，没超过指定范围，算弹起
            if (node.getPositionY() < 100) {
                this._isPlay = false;
                this.playCard();
            }else {
                //超过指定范围，相当于直接出牌
                this._isPlay = true;
                this.playCard();
            }
        } else {
            //没有移动，算点击一次
            this.playCard();
        }
        this._isMove = false;
    },
    onBtnCancel :function(event){
        if (game.getGameData().getGameInfoData().turn != GameData.player.uid){
            return;
        }
        //如果移出屏幕，就让牌复位
        this.cardRestoration();
        sendEvent('onSelectCard', 0);
    },

    playCard: function () {
        var card = this.getCardId();
        var node = this.node.parent;

        if (this._isPlay == true) {
            //发送出牌请求
            if (game.getGameData().getGameInfoData().turn == GameData.player.uid) {
                var fun = function(){
                    //node.active = false;
                    //再加上全部手牌回位
                    //sendEvent('AllHandCardRestoration');
                    sendEvent('onSelectCard', 0);
                };
                game.getGameProtocol().requestDisCard(card, fun);
            }
        } else {
            //全部手牌回位
            sendEvent('AllHandCardRestoration');
            sendEvent('onSelectCard', card);
            this.cardUpspring();
        }
    }
});