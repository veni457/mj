var GameNet=function(){var e=null,n=0,i=[],o=Date.now(),c=null,t=0,s=!1,l=0;function r(){i.push(Date.now()-o),5<i.length&&i.splice(0,1);for(var e=n=0;e<i.length;e++)n+=i[e];n/=i.length}return{getInstance:function(){return null==e&&(e={connect:function(e,n,t,o){s&&this.disconnect();var c=this;s=!0,i=[],this.setCallBack("disconnect",function(){WriteLog("get disconnect:"+l),2<++l?(c.disconnect(),o(),closeView("Loading")):1==l&&openView("Loading")}),pomelo.init({host:e,port:n,log:!1,reconnect:!0,maxReconnectAttempts:2},function(){t(),l=0})},disconnect:function(){pomelo.removeAllListeners("disconnect"),pomelo.disconnect(),s=!1},request:function(n,e,t){try{console.log("request "+n+": "+JSON.stringify(e)),o=Date.now(),2==arguments.length?(pomelo.notify(n,e),c=e.cmd):pomelo.request(n,e,function(e){r(),console.log("response "+n+" "+(Date.now()-o)+"ms: "+JSON.stringify(e)),t(e)})}catch(e){sendEvent("disconnect")}},setCallBack:function(n,t){pomelo.removeAllListeners(n),t&&pomelo.addEventListener(n,function(e){c==n&&(c=null,r()),console.log("notify "+n+": "+JSON.stringify(e)),t(e)})},removeAllListeners:function(e){pomelo.removeAllListeners(e)},setNetStatus:function(e){0!=t&&t!=e&&pomelo.disconnect(),t=e},getPingPong:function(){return n},heartbeat:function(){s&&GameNet.getInstance().request("connector.entryHandler.heartbeat",{},function(){}),setTimeout(GameNet.getInstance().heartbeat,2e4)}}).heartbeat(),e}}}();