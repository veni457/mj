function openPrefabView(prefab, layer, tag, cb) {
    var parent = layer || cc.director.getScene().getChildByName('Canvas');
    var node = parent.getChildByTag(tag);
    if (node != null) {
        node.active = true;
        if (typeof cb == 'function') cb(node);
        cc.log('openPrefabView %s add to %s', tag, parent.name);
        return;
    }
    cc.loader.loadRes(prefab, function(err, res) {
        var viewNode = cc.instantiate(res);
        viewNode.setTag(tag);
        parent.addChild(viewNode);
        if (typeof cb == 'function') cb(viewNode);
        cc.log('openPrefabView %s add to %s', tag, parent.name);
    });
}

function openView(panelName, type, cb) {
    var child = cc.director.getScene().getChildByName('Canvas').getChildByName(panelName);
    if (child != null) {
        child.active = true;
        if (cb != null)
            cb(child);
        return;
    }

    var gameDefine = require('gameDefine');
    var loadPath = "prefab/panel/" + panelName;

    switch (type){
        case gameDefine.GameType.Game_Poker_DDZ:{
            loadPath = "ddz/pannel/" + panelName;
        }break;
        case gameDefine.GameType.Game_Niu_Hundred:{
            loadPath = "hundredNiuNiu/panel/" + panelName;
        }break;
        case gameDefine.GameType.Game_niu_niu:{
            loadPath = "prefab/niuNiu/"+panelName;
        }break;
        case gameDefine.GameType.Game_TDK:{
            loadPath = "TDK/panel/"+panelName;
        }break;
        case gameDefine.GameType.Game_Poker_TianjinDDZ:{
            loadPath = "ddz/pannel/" + panelName;
        }break;
        case gameDefine.GameType.Game_MJ_HuaDian:{
            loadPath = "huadian/panel/" + panelName;
        }break;
        case gameDefine.GameType.Game_Mj_HZ:{
            loadPath = "hongzhong/prefab/" + panelName;
        }break;
        case gameDefine.GameType.Game_Mj_CC:{
            loadPath = "changchun/panel/" + panelName;
        }break;
        case gameDefine.GameType.Game_Mj_Heb:{
            loadPath = "heb/pannel/" + panelName;
        }break;
        case gameDefine.GameType.Game_Poker_paodekuai:{
            loadPath = "ddz/pannel/" + panelName;
        }break;
        case gameDefine.GameType.Game_Poker_ZJH:{
            loadPath = "prefab/poker/table/" + panelName;
        }break;
        case gameDefine.GameType.Game_Poker_HHDZ:{
            loadPath = "hhdz/perfab/" + panelName;
        }break;
    }
    cc.log('open panel loadPath : ' + loadPath);

    var onResLoaded = function (err, res) {
        var panelNode = cc.instantiate(res);
        panelNode.name = res.name;
        if (panelName == 'RunlampPanel' || panelName == 'RunlampPanel1') {
            cc.director.getScene().getChildByName('lampNode').addChild(panelNode, 1000);
        } else {
            cc.director.getScene().getChildByName('Canvas').addChild(panelNode);
        }
        if (cb != null)
            cb(panelNode);
    };
    cc.loader.loadRes(loadPath, onResLoaded);
}

function closeView(panelName) {
  if (panelName == 'RunlampPanel' || panelName == 'RunlampPanel1') {
    var child = cc.director.getScene().getChildByName('lampNode').getChildByName(panelName);
    cc.director.getScene().getChildByName('lampNode').removeChild(child);
  } else {
    var child = cc.director.getScene().getChildByName('Canvas').getChildByName(panelName);
  }
  if (child != null) {
    child.active = false;
    return;
  }
}

function openSSSView(panelName,cb)
{
    var child = cc.director.getScene().getChildByName('Canvas').getChildByName(panelName);
    if(child != null)
    {
        child.active = true;
        if(cb != null)
            cb(child);
        return;
    }

    var loadPath = "shisanshui/prefab/" + panelName;

    var onResLoaded = function(err,res)
    {
        var panelNode = cc.instantiate(res);
        panelNode.name = res.name;
        // if(panelName=="poker13PlayIntroPanel"){
        //     panelNode.rotation = 0;
        // }else{
        //     panelNode.rotation = -90;
        // }
        cc.director.getScene().getChildByName('Canvas').addChild(panelNode);
        if(cb != null)
            cb(panelNode);
    };
    cc.loader.loadRes(loadPath, onResLoaded);
}

function closeSSSView(panelName)
{
    var child = cc.director.getScene().getChildByName('Canvas').getChildByName(panelName);
    if(child != null)
    {
        child.active = false;
        return;
    }
}

function openPlayerInfoView(gameType, cb)
{
    var gameDefine = require('gameDefine');
    if(gameDefine == undefined || gameType == undefined){
        return;
    }
    var panelName = 'UIPlayerInfo';
    var loadPath = "prefab/tableUI/UIPlayerInfo";

    switch (gameType){
        case gameDefine.GameType.Game_niu_niu:
        case gameDefine.GameType.Game_Niu_Niu_10:
        case gameDefine.GameType.Game_Niu_Hundred:
        case gameDefine.GameType.Game_TDK:
        case gameDefine.GameType.Game_Poker_ZJH:{
            loadPath = "prefab/tableUI/UIPokerPlayerInfo";
        }break;
        default: break;
    }
    cc.log('open panel loadPath : ' + loadPath);

    var child = cc.director.getScene().getChildByName('Canvas').getChildByName(panelName);
    if (child != null) {
        child.active = true;
        if (cb != null) {
            cb(child);
        }
        return;
    }

    var onResLoaded = function (err, res) {
        var panelNode = cc.instantiate(res);
        panelNode.name = res.name;
        cc.director.getScene().getChildByName('Canvas').addChild(panelNode);

        if (cb != null) {
            cb(panelNode);
        }
    };
    cc.loader.loadRes(loadPath, onResLoaded);
}