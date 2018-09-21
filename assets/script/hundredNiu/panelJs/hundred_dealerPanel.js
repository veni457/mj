var gameDefine = require('gameDefine');
var roomHandler = require('roomHandler');
var HundredNiuHandler = require('hundredNiuHandler');
var NiuNiuPokerHandler = require('niuniuPokerHandler');
cc.Class({
    extends: cc.Component,

    properties: {
        dealerNode: cc.Node,
        contentNode: cc.Node,
        playerInfo: cc.Node,
        lineUpNum: cc.Label,
        scrollView: cc.ScrollView,
        upZhuangCdtion: cc.Label,
        //costMassageBox
        costPanel: cc.Node,
    },

    onLoad: function () {
        
    },
    showUI: function (data) {
        this.initUI();
        if ( !data) return;
        this.setLineUpNum(data);
        this.setUpCondition();
        this.showHeadInfo(data);
    },
    initUI: function () {
        this.lineUpNum.string = '';
        this.dealerNode.active = true;
        this.costPanel.active = false;
        this.upZhuangCdtion.string = '';
        this.contentNode.removeAllChildren();
    },
    showHeadInfo: function (data) {
        
        for (var i = 0; i < data.length; i++) {
            var player = this.contentNode.getChildByName('player'+i);
            if(player == undefined){
                player = cc.instantiate(this.playerInfo);
                player.y = -51 - i*this.playerInfo.height;
                this.contentNode.height = (i+1)*this.playerInfo.height;
                player.parent = this.contentNode;
                player.name = 'player'+i;
            }
            var numNode = cc.find('num', player);
            var numLb = cc.find('numLb', player);
            var coinNode = cc.find('coin', player);
            var nameNode = cc.find('name', player);
            var headNode = cc.find('headMask/headIcon', player);
            
            if (data[i].name != undefined) {
                this.setName(nameNode, data[i].name);    
            }
            if (data[i].headimgurl != undefined) {
                this.setHeadIcon(headNode, data[i].headimgurl);    
            }
            if (data[i].coin != undefined) {
                coinNode.getComponent('cc.Label').string = ConversionCoinValue(data[i].coin, 0);    
            }
            this.showSign(numNode, numLb, i);
        }
    },
    setName: function (nameNode, nameLb) {
        nameNode.getComponent('cc.Label').string = getShortStr(nameLb,4);
    },
    setHeadIcon: function(headNode,headimgurl) {
        if (headimgurl == undefined || headimgurl == '' || headimgurl.length <= 0) {
            headNode.getComponent('cc.Sprite').spriteFrame = null;
            return;
        }
        var self = this;
        cc.loader.load({url: headimgurl, type: 'png'}, function (error, texture) {
            if (!error && texture) {
                headNode.getComponent('cc.Sprite').spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },
    showSign: function (node, lbNode, num) {
        if (num <= 2) {
            var url = cc.textureCache.addImage(cc.url.raw('resources/hundredNiuNiu/uiResources/panelUI/shangzhuang/jp_'+num+'.png'));
            node.getComponent('cc.Sprite').spriteFrame = new cc.SpriteFrame(url);
            node.active = true; 
            lbNode.active = false;   
        } else {
            lbNode.getComponent('cc.Label').string = (num+1);
            lbNode.active = true; 
            node.active = false;    
        }
    },
    //当前上庄排队人数
    setLineUpNum: function (data) {
        this.lineUpNum.string = '当前排队'+data.length+'人';
    },
    //上庄条件
    setUpCondition: function () {
        var scorelev = roomHandler.room.opts.scorelv;
        var shangzhuangNum = getMatchShangZhuangFinal(gameDefine.GameType.Game_Niu_Hundred, scorelev);
        this.upZhuangCdtion.string = '上庄条件：'+ ConversionCoinValue(shangzhuangNum, 0);
    },
    clickUpZhuang: function () {
        var self = this;
        GameNet.getInstance().request('room.niuHundredHandler.upZhuang', {}, function(rtn) {
            switch (rtn.result){
                case NiuNiuPokerHandler.ERRORTYPE.SUCCESSE:
                    self.showUI(rtn.zhuanglist);
                    var index = self.getSelfPosition(rtn.zhuanglist);
                    var playNode = self.contentNode.getChildByName('player'+index);
                    self.scrollView.scrollToOffset(cc.p(0, -playNode.y), 0.1);
                    cc.log('is upZhuangCdtion');
                break;
                case NiuNiuPokerHandler.ERRORTYPE.Niu100_Zhuang_Coin:
                    self.costPanel.active = true;
                    self.dealerNode.active = false;
                break;
                case NiuNiuPokerHandler.ERRORTYPE.Niu100_Zhuang_Already:
                    niuniuCreateMoveMessage('您已在队列中');
                break;
                case NiuNiuPokerHandler.ERRORTYPE.Niu100_Zhuang_UpAlready:
                    niuniuCreateMoveMessage('您已上庄');
                break;
                default:
                    cc.log('error');
                break;
            }
        });
    },
    getSelfPosition: function (zhuangData) {
        var i = zhuangData.length;
        while (i--) {
            if (zhuangData[i] && zhuangData[i].uid == GameData.player.uid) {
                return i;
            }
        }
        return 0;
    },

    //costMassageBox  fun
    clickGoingShop: function () {
        var self = this;
        openView('shoppingPanel',undefined, function (target) {
            self.close();
            target.getComponent('shoppingPanel').showPanel(2);
        });
    },
    close: function () {
        closeView(this.node.name);
    },
});
