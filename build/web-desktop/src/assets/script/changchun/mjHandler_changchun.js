var MjHandler_CC=function(){var e=null;return{getInstance:function(){return null==e&&(e={requestReady:function(e){GameNet.getInstance().request("room.roomHandler.ready",{},function(e){})},requestOperation_CC:function(e,n,a,t){GameNet.getInstance().request("room.changChuMahjongHandler.operationReq",{operation:e,cards:n,isZiMoHuOnly:a},function(e){t(e)})},requestDisCard_CC:function(e,n){GameNet.getInstance().request("room.changChuMahjongHandler.playCardsReq",{cards:e},function(e){cc.log("room.huaDianMahjongHandle.playCardsReq response:%d",e.result),n(e)})},requestPass_CC:function(e,n,a){GameNet.getInstance().request("room.changChuMahjongHandler.operationReq",{operation:e,cards:n},function(e){})},requestPiao:function(e,n){GameNet.getInstance().request("room.huaDianMahjongHandler.playerPiaoReq",{piao:e},function(e){})}}),e}}}();