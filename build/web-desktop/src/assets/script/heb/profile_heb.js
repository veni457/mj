var profileHeb=profileHeb||{};profileHeb.init=function(){this.registAllMessage(),this.initRoomData()},profileHeb.initRoomData=function(){this.initCreateRoomOpts(),profileHeb.roomInfo={},profileHeb.gameInfo={},profileHeb.resultData={}},profileHeb.initCreateRoomOpts=function(){var a=cc.sys.localStorage.getItem("createRoomOpts_heb");null==a?(profileHeb.createRoomOpts={},profileHuaDian.createRoomOpts.roundRule=63,profileHuaDian.createRoomOpts.roomType=1,profileHeb.createRoomOpts.roundType=1,profileHeb.createRoomOpts.roundRule=1,profileHeb.createRoomOpts.bossType=1,profileHeb.createRoomOpts.roundMax=4,profileHeb.createRoomOpts.joinermax=2,profileHeb.createRoomOpts.dianpao=0,profileHeb.createRoomOpts.quemen=0,profileHeb.createRoomOpts.duibaofanbei=0,profileHeb.createRoomOpts.baotype=0,profileHeb.createRoomOpts.scoreLv=0):profileHeb.createRoomOpts=JSON.parse(a)},profileHeb.saveCreateRoomOpts=function(){null!=profileHeb.createRoomOpts&&null!=profileHeb.createRoomOpts&&cc.sys.localStorage.setItem("createRoomOpts_heb",JSON.stringify(profileHeb.createRoomOpts))},profileHeb.registAllMessage=function(){console.log("----- 初始化哈尔滨消息"),GameNet.getInstance().setCallBack("onMahjongStartRun",function(a){GameData.game=GameData.game||GameData.initGameData(),GameData.game.gameStart=!0,GameData.game.cardleft=a.remainCardCount;for(var e=0;e<a.playerGameInfo.length;e++){if(GameData.cards[a.playerGameInfo[e].uid]=void 0===GameData.cards[a.playerGameInfo[e].uid]?{}:GameData.cards[a.playerGameInfo[e].uid],GameData.cards[a.playerGameInfo[e].uid].hand=a.playerGameInfo[e].handCards,GameData.cards[a.playerGameInfo[e].uid].handnum=a.playerGameInfo[e].countOfHandCards,GameData.cards[a.playerGameInfo[e].uid].chi=a.playerGameInfo[e].cardsChi,GameData.cards[a.playerGameInfo[e].uid].peng=a.playerGameInfo[e].cardsPeng,GameData.cards[a.playerGameInfo[e].uid].gang=a.playerGameInfo[e].cardsGang,GameData.cards[a.playerGameInfo[e].uid].dis=a.playerGameInfo[e].cardsPast,GameData.game.noActions=!1,GameData.player[a.playerGameInfo[e].uid]=a.playerGameInfo[e],a.playerGameInfo[e].cardLastAssigned?(GameData.cards[a.playerGameInfo[e].uid].hand.push(a.playerGameInfo[e].cardLastAssigned),GameData.game.obtain=a.playerGameInfo[e].cardLastAssigned):a.playerGameInfo[e].uid==GameData.player.uid&&(GameData.game.obtain=-1),1==a.playerGameInfo[e].isAssignedCard&&GameData.cards[a.playerGameInfo[e].uid].handnum++,a.playerGameInfo[e].operationList&&(GameData.operations[a.playerGameInfo[e].uid]=a.playerGameInfo[e].operationList),a.playerGameInfo[e].isBoss){GameData.game.turn=a.playerGameInfo[e].uid;var r=0==e?0:e-1;GameData.game.lastdisUid=a.playerGameInfo[r].uid,GameData.game.zhuangUid=a.playerGameInfo[e].uid,GameData.game.checkPass.onGoingUserId=a.playerGameInfo[e].uid}a.playerGameInfo[e].tingReady?GameData.cards[a.playerGameInfo[e].uid].tingData=a.playerGameInfo[e].tingReady:GameData.cards[a.playerGameInfo[e].uid].tingData=null,1==a.playerGameInfo[e].isTing&&1==a.playerGameInfo[e].isZiMoHuOnly?GameData.cards[a.playerGameInfo[e].uid].tingState=1:1==a.playerGameInfo[e].isTing&&0==a.playerGameInfo[e].isZiMoHuOnly?GameData.cards[a.playerGameInfo[e].uid].tingState=2:0==a.playerGameInfo[e].isTing&&0==a.playerGameInfo[e].isZiMoHuOnly&&(GameData.cards[a.playerGameInfo[e].uid].tingState=0)}GameData.game.initcards=!0,sendEvent("onGameTurn",a.onGoingUserId),sendEvent("initZhuangInfo"),sendEvent("onMahjongStartRun")}),GameNet.getInstance().setCallBack("onRegularCircle",function(a){GameData.game.cardleft=a.remainCardCount,GameData.game.turn=a.onGoingUserId,GameData.game.checkPass=a,GameData.game.lastdisCard=a.showCard[0],GameData.game.lastdisUid=a.currentPlayCardUser,GameData.game.dataInfo=a,profileHeb.gameInfo=a;for(var e=0;e<a.playerGameInfo.length;e++)GameData.cards[a.playerGameInfo[e].uid].handnum=a.playerGameInfo[e].countOfHandCards,GameData.cards[a.playerGameInfo[e].uid].hand=a.playerGameInfo[e].handCards,GameData.cards[a.playerGameInfo[e].uid].chi=a.playerGameInfo[e].cardsChi,GameData.cards[a.playerGameInfo[e].uid].peng=a.playerGameInfo[e].cardsPeng,GameData.cards[a.playerGameInfo[e].uid].gang=a.playerGameInfo[e].cardsGang,GameData.cards[a.playerGameInfo[e].uid].dis=a.playerGameInfo[e].cardsPast,GameData.player[a.playerGameInfo[e].uid]=a.playerGameInfo[e],a.playerGameInfo[e].cardLastAssigned?(GameData.cards[a.playerGameInfo[e].uid].hand.push(a.playerGameInfo[e].cardLastAssigned),GameData.game.obtain=a.playerGameInfo[e].cardLastAssigned):a.playerGameInfo[e].uid==GameData.player.uid&&(GameData.game.obtain=-1),1==a.playerGameInfo[e].isAssignedCard&&GameData.cards[a.playerGameInfo[e].uid].handnum++,a.playerGameInfo[e].operationList&&(GameData.operations[a.playerGameInfo[e].uid]=a.playerGameInfo[e].operationList),a.playerGameInfo[e].tingReady?GameData.cards[a.playerGameInfo[e].uid].tingData=a.playerGameInfo[e].tingReady:GameData.cards[a.playerGameInfo[e].uid].tingData=null,1==a.playerGameInfo[e].isTing&&1==a.playerGameInfo[e].isZiMoHuOnly?GameData.cards[a.playerGameInfo[e].uid].tingState=1:1==a.playerGameInfo[e].isTing&&0==a.playerGameInfo[e].isZiMoHuOnly?GameData.cards[a.playerGameInfo[e].uid].tingState=2:0==a.playerGameInfo[e].isTing&&0==a.playerGameInfo[e].isZiMoHuOnly&&(GameData.cards[a.playerGameInfo[e].uid].tingState=0),2==a.playerGameInfo[e].isWin&&sendEvent("dianPao",a.playerGameInfo[e].uid);var r={userId:a.currentPlayCardUser,card:a.showCard[0]};if(a.operation||sendEvent("onCardDis",r),a.operation){var n=a.operation.operation;if(n==HuaDian.OPERATION.OPERATION_GONGGANG||n==HuaDian.OPERATION.OPERATION_ANGANG||n==HuaDian.OPERATION.OPERATION_MINGGANG||n==HuaDian.OPERATION.OPERATION_MINGGANG||n==HuaDian.OPERATION.OPERATION_GONGGANG_TING||n==HuaDian.OPERATION.OPERATION_ANGANG_TING||n==HuaDian.OPERATION.OPERATION_MINGGANG_TING?sendEvent("onCardGang",a.operation):n==HuaDian.OPERATION.OPERATION_PENG||n==HuaDian.OPERATION.OPERATION_PENG_TING?sendEvent("onCardPeng",a.operation):n==HuaDian.OPERATION.OPERATION_DIANPAO_HU||n==HuaDian.OPERATION.OPERATION_HU||n==HuaDian.OPERATION.OPERATION_QIANGGANG_HU?sendEvent("onCardHu",a.operation):n!=HuaDian.OPERATION.OPERATION_CHI&&n!=HuaDian.OPERATION.OPERATION_CHI_TING||sendEvent("onCardChi",a.operation),n==HuaDian.OPERATION.OPERATION_TING||n==HuaDian.OPERATION.OPERATION_CHI_TING||n==HuaDian.OPERATION.OPERATION_PENG_TING||n==HuaDian.OPERATION.OPERATION_GONGGANG_TING||n==HuaDian.OPERATION.OPERATION_ANGANG_TING||n==HuaDian.OPERATION.OPERATION_MINGGANG_TING){var t={userId:a.currentPlayCardUser,type:n};sendEvent("onCardTing",t),setTimeout(function(){sendEvent("onCardDis",r)},1e3)}}if(a.bao){var o=0;1e3!=a.bao.oldBaoCard&&-1!=a.bao.oldBaoCard&&(o=1,GameData.game.cardHuier1=a.bao.baoCard),0==a.bao.oldBaoCard&&(o=2);var i={uid:a.currentPlayCardUser,type:o};sendEvent("onCardBao",i)}a.baoCardId&&(GameData.game.cardHuier1=a.baoCardId),sendEvent("onGameTurn",a.onGoingUserId),sendEvent("onRegularCircle")}),GameNet.getInstance().setCallBack("onHuaDianMahjongReconnecet",function(a){WriteLog("~~~~~~~~~~~onHuaDianMahjongReconnecetHeb :~~~~~~~~~~~~~~"+JSON.stringify(a)),GameData.game=GameData.game||GameData.initGameData(),GameData.game.gameStart=!0,GameData.game.cardleft=a.remainCardCount,GameData.game.initcards=!0,GameData.game.turn=a.onGoingUserId,GameData.game.checkPass=a,GameData.game.lastdisCard=a.showCard[a.showCard.length-1],GameData.game.lastdisUid=a.currentPlayCardUser,GameData.game.dataInfo=a,profileHeb.gameInfo=a;for(var e=0;e<a.playerGameInfo.length;e++)GameData.cards[a.playerGameInfo[e].uid]=void 0===GameData.cards[a.playerGameInfo[e].uid]?{}:GameData.cards[a.playerGameInfo[e].uid],GameData.cards[a.playerGameInfo[e].uid].hand=a.playerGameInfo[e].handCards,GameData.cards[a.playerGameInfo[e].uid].handnum=a.playerGameInfo[e].countOfHandCards,GameData.cards[a.playerGameInfo[e].uid].chi=a.playerGameInfo[e].cardsChi,GameData.cards[a.playerGameInfo[e].uid].peng=a.playerGameInfo[e].cardsPeng,GameData.cards[a.playerGameInfo[e].uid].gang=a.playerGameInfo[e].cardsGang,GameData.cards[a.playerGameInfo[e].uid].dis=a.playerGameInfo[e].cardsPast,GameData.player[a.playerGameInfo[e].uid]=a.playerGameInfo[e],GameData.game.noActions=!1,a.playerGameInfo[e].cardLastAssigned?(GameData.cards[a.playerGameInfo[e].uid].hand.push(a.playerGameInfo[e].cardLastAssigned),GameData.game.obtain=a.playerGameInfo[e].cardLastAssigned):a.playerGameInfo[e].uid==GameData.player.uid&&(GameData.game.obtain=-1),1==a.playerGameInfo[e].isAssignedCard&&GameData.cards[a.playerGameInfo[e].uid].handnum++,a.playerGameInfo[e].isBoss&&(GameData.game.zhuangUid=a.playerGameInfo[e].uid),a.playerGameInfo[e].operationList&&(GameData.operations[a.playerGameInfo[e].uid]=a.playerGameInfo[e].operationList),a.playerGameInfo[e].tingReady?GameData.cards[a.playerGameInfo[e].uid].tingData=a.playerGameInfo[e].tingReady:GameData.cards[a.playerGameInfo[e].uid].tingData=null,1==a.playerGameInfo[e].isTing&&1==a.playerGameInfo[e].isZiMoHuOnly?GameData.cards[a.playerGameInfo[e].uid].tingState=1:1==a.playerGameInfo[e].isTing&&0==a.playerGameInfo[e].isZiMoHuOnly?GameData.cards[a.playerGameInfo[e].uid].tingState=2:0==a.playerGameInfo[e].isTing&&0==a.playerGameInfo[e].isZiMoHuOnly&&(GameData.cards[a.playerGameInfo[e].uid].tingState=0);a.bao&&(GameData.game.cardHuier1=a.bao.baoCard),sendEvent("onGameTurn",a.onGoingUserId),sendEvent("onHuaDianMahjongReconnecet")}),GameNet.getInstance().setCallBack("onMahjongRunEnd",function(a){profileHeb.resultData=a;for(var e=0;e<a.playerRecord.length;e++){GameData.cards[a.playerRecord[e].uid].Resulthand=[];for(var r=0;r<a.playerRecord[e].handCards.length;r++)GameData.cards[a.playerRecord[e].uid].Resulthand.push({card:a.playerRecord[e].handCards[r],type:0});GameData.cards[a.playerRecord[e].uid].peng=a.playerRecord[e].pengCards,GameData.cards[a.playerRecord[e].uid].gang=a.playerRecord[e].gangCards,GameData.cards[a.playerRecord[e].uid].chi=a.playerRecord[e].chiCards,GameData.cards[a.playerRecord[e].uid].handnum=a.playerRecord[e].handCards.length,GameData.ResultScoreInfo[a.playerRecord[e].uid]=a.playerRecord[e].socreInfo,GameData.scores[a.playerRecord[e].uid]=a.playerRecord[e].socreInfo.totalRunScore,GameData.ResultData[a.playerRecord[e].uid]=a.playerRecord[e],a.playerRecord[e].cardLastAssigned&&(GameData.cards[a.playerRecord[e].uid].Resulthand.push({card:a.playerRecord[e].cardLastAssigned[0],type:1}),GameData.game.winnerObtain=a.playerRecord[e].cardLastAssigned,GameData.cards[a.playerRecord[e].uid].handnum++)}GameData.game.gameStart=!1,sendEvent("onMahjongRunEnd")}),GameNet.getInstance().setCallBack("onMahjongRoomEnd",function(a){for(var e=0;e<a.playerList.length;e++)GameData.SummaryData[a.playerList[e].uid]=a.playerList[e];GameData.roomClose=!0,sendEvent("onShowSummary")}),GameNet.getInstance().setCallBack("onPushErrorMsg",function(a){sendEvent("onPushErrorMsg",a)})},profileHeb.unregistAllMessage=function(){console.log("----- 注销哈尔滨消息"),GameNet.getInstance().removeAllListeners("onMahjongStartRun"),GameNet.getInstance().removeAllListeners("onHuaDianMahjongReconnecet"),GameNet.getInstance().removeAllListeners("onMahjongStartRun"),GameNet.getInstance().removeAllListeners("onRegularCircle"),GameNet.getInstance().removeAllListeners("onHuaDianPiaoInfo"),GameNet.getInstance().removeAllListeners("onMahjongRunEnd"),GameNet.getInstance().removeAllListeners("onMahjongRoomEnd"),GameNet.getInstance().removeAllListeners("onPushErrorMsg")},profileHeb.getPlayerOperationsByUid=function(a){for(var e in GameData.operations)if(a==e)return GameData.operations[e];return null},profileHeb.getTingStateByUid=function(a){for(var e in GameData.cards)if(a==e)return 1==GameData.cards[e].tingState||2==GameData.cards[e].tingState;return null},profileHeb.getResultScoreInfoByUid=function(a){for(var e in GameData.ResultScoreInfo)if(a==e)return GameData.ResultScoreInfo[e];return null},profileHeb.canHu=function(){for(var a in GameData.operations)if(GameData.player.uid==a){for(var e=0,r=0;r<GameData.operations[a].length;r++){if(GameData.operations[a][r]==HuaDian.OPERATION.OPERATION_DIANPAO_HU||GameData.operations[a][r]==HuaDian.OPERATION.OPERATION_HU||GameData.operations[a][r]==HuaDian.OPERATION.OPERATION_QIANGGANG_HU)return!0;e++}if(e==GameData.operations[a].length)return!1}return null},profileHeb.canGang=function(){for(var a in GameData.operations)if(GameData.player.uid==a){for(var e=0,r=0;r<GameData.operations[a].length;r++){if(parseInt(GameData.operations[a][r])==HuaDian.OPERATION.OPERATION_GONGGANG||parseInt(GameData.operations[a][r])==HuaDian.OPERATION.OPERATION_ANGANG||parseInt(GameData.operations[a][r])==HuaDian.OPERATION.OPERATION_MINGGANG)return!0;e++}if(e==GameData.operations[a].length)return!1}return null},profileHeb.canTing=function(){for(var a in GameData.operations)if(GameData.player.uid==a){for(var e=0;e<GameData.operations[a].length;e++){var r=0;if(GameData.operations[a][e]==HuaDian.OPERATION.OPERATION_TING||GameData.operations[a][e]==HuaDian.OPERATION.OPERATION_CHI_TING||GameData.operations[a][e]==HuaDian.OPERATION.OPERATION_GONGGANG_TING||GameData.operations[a][e]==HuaDian.OPERATION.OPERATION_ANGANG_TING||GameData.operations[a][e]==HuaDian.OPERATION.OPERATION_MINGGANG_TING||GameData.operations[a][e]==HuaDian.OPERATION.OPERATION_PENG_TING)return!0;r++}if(r==GameData.operations[a].length)return!1}return null},profileHeb.getGangCardByUid=function(a,e){var r=GameData.getHandCards(a),n=GameData.getPengCards(a),t=[],o=[],i=GameData.room.opts.xiaoJiFeiDan;switch(parseInt(e)){case HuaDian.OPERATION.OPERATION_MINGGANG:for(var s in n)for(var m=0;m<r.length;m++)if(n[s].cards[0]==r[m])return{card:r[m],type:0};break;case HuaDian.OPERATION.OPERATION_ANGANG:r.sort();for(m=0;m<r.length;m++)if(r[m]==r[m+1]&&r[m]==r[m+2]&&r[m]==r[m+3])return{card:r[m],type:1};break;case HuaDian.OPERATION.OPERATION_GONGGANG:r.sort();for(m=0;m<r.length;m++)if(r[m]==r[m+1]&&r[m]==r[m+2]&&r[m]==GameData.game.lastdisCard)return{card:GameData.game.lastdisCard,type:0};break;case HuaDian.OPERATION.OPERATION_XUAN_FENG_GANG:t=this.removerepeat(r);for(m=0;m<t.length;m++)31!=t[m]&&41!=t[m]&&51!=t[m]&&61!=t[m]||o.length<3&&o.push(t[m]);2==o.length&&-1!==t.indexOf(1)&&o.push(1);var G=this.isHasTwoJiToHandcard();if(1==o.length&&G)for(var l=0;l<2;l++)o.push(1);if(3==o.length)return{card:o,type:-1};break;case HuaDian.OPERATION.OPERATION_XI_GANG:t=this.removerepeat(r);for(m=0;m<t.length;m++)71!=t[m]&&81!=t[m]&&91!=t[m]||o.length<3&&o.push(t[m]);2==o.length&&-1!==t.indexOf(1)&&o.push(1);G=this.isHasTwoJiToHandcard();if(1==o.length&&G)for(l=0;l<2;l++)o.push(1);if(3==o.length)return{card:o,type:-1};break;case HuaDian.OPERATION.OPERATION_YAO_GANG:t=this.removerepeat(r);for(m=0;m<t.length;m++)1!=t[m]&&11!=t[m]&&21!=t[m]||o.length<3&&o.push(t[m]);2==o.length&&-1!==t.indexOf(1)&&o.push(1);G=this.isHasTwoJiToHandcard();if(1==o.length&&G)for(l=0;l<2;l++)o.push(1);if(3==o.length)return{card:o,type:-1};break;case HuaDian.OPERATION.OPERATION_JIU_GANG:t=this.removerepeat(r);for(m=0;m<t.length;m++)9!=t[m]&&19!=t[m]&&29!=t[m]||o.length<3&&o.push(t[m]);2==o.length&&-1!==t.indexOf(1)&&o.push(1);G=this.isHasTwoJiToHandcard();if(1==o.length&&G)for(l=0;l<2;l++)o.push(1);if(3==o.length)return{card:o,type:-1};break;case HuaDian.OPERATION.OPERATION_BU_XUAN_FENG_GANG:t=this.removerepeat(r);for(m=0;m<t.length;m++)31!=t[m]&&41!=t[m]&&51!=t[m]&&61!=t[m]||o.push([t[m]]),i&&1==t[m]&&o.push([t[m]]);return{card:o,type:-1};case HuaDian.OPERATION.OPERATION_BU_XI_GANG:t=this.removerepeat(r);for(m=0;m<t.length;m++)71!=t[m]&&81!=t[m]&&91!=t[m]||o.push([t[m]]),i&&1==t[m]&&o.push([t[m]]);return{card:o,type:-1};case HuaDian.OPERATION.OPERATION_BU_YAO_GANG:t=this.removerepeat(r);for(m=0;m<t.length;m++)1!=t[m]&&11!=t[m]&&21!=t[m]||o.push([t[m]]);return{card:o,type:-1};case HuaDian.OPERATION.OPERATION_BU_JIU_GANG:t=this.removerepeat(r);for(m=0;m<t.length;m++)9!=t[m]&&19!=t[m]&&29!=t[m]||o.push([t[m]]),i&&1==t[m]&&o.push([t[m]]);return{card:o,type:-1}}},profileHeb.removerepeat=function(a){a.sort();for(var e=[a[0]],r=1;r<a.length;r++)a[r]!==e[e.length-1]&&e.push(a[r]);return e},profileHeb.guolv=function(a,e){var r=[];e=this.removerepeat(e);for(var n=0;n<e.length;n++)-1==a.indexOf(e[n])&&r.push(e[n]);return r},profileHeb.isAllEqual=function(a){var e=a[0];return allsame=a.every(function(a){return a==e})},profileHeb.isHasTwoJiToHandcard=function(){var a=GameData.getMyHandCards();return a.sort(function(a,e){return a-e}),a[0]==a[1]==1},profileHeb.summaryDataByUid=function(a){for(var e in GameData.SummaryData)if(e==a)return GameData.SummaryData[e];return null},profileHeb.checkIsTingPlayer=function(){var a=0;for(var e in GameData.cards){if(1==GameData.cards[e].tingState||2==GameData.cards[e].tingState)return!0;a++}if(a==Object.keys(GameData.cards).length)return!1},profileHeb.getTurnByUid=function(){return profileHeb.isNextPlayer(GameData.game.lastdisUid,GameData.game.turn)?GameData.game.turn:GameData.game.lastdisUid},profileHeb.isNextPlayer=function(a,e){if(null==a)return!0;var r=GameData.getPlayerIndex(a),n=GameData.getPlayerIndex(e);return r==GameData.joiners.length-1&&0==n||n-r==1},profileHeb.getCardIndexByUid=function(a,e){var r=GameData.getPlayerIndex(a)-GameData.getPlayerIndex(e),n=0;if(2==GameData.room.opts.joinermax)return n=2;switch(r){case 1:n=1;break;case-1:n=3;break;case 2:case-2:n=2;break;case-3:n=1;break;case 3:n=3}return n};var spacialGang=[1,21,71,81,91];profileHeb.getGangSorce=function(a){var e=0;if(null==a||null==a)return null;if(5==a.length&&this.isAllEqual(a)&&-1==spacialGang.indexOf(a[0])||4==a.length&&this.isAllEqual(a)&&-1!=spacialGang.indexOf(a[0]))e+=2;else if(5==a.length&&-1!=spacialGang.indexOf(a[0])&&this.isAllEqual(a))e+=8;else if(3<=a.length&&!this.isAllEqual(a))for(var r=2;r<a.length;r++)e++;else e++;return e},profileHeb.getHuType=function(){if(GameData.ResultData){for(var a in GameData.ResultData)if(1==GameData.ResultData[a].isWin||3==GameData.ResultData[a].isWin)return GameData.ResultData[a].isWin}else cc.log("data is undefine..")};