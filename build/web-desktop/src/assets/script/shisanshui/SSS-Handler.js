var SSSHandler=function(){var e=null;return{getInstance:function(){return null==e&&(e={requestReady:function(e){GameNet.getInstance().request("room.poker13Handler.ready",{},e)},requestDiscard:function(e,n,r){GameNet.getInstance().request("room.poker13Handler.discard",{cards:e,special:n},r)}}),e}}}();