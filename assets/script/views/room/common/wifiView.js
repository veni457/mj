cc.Class({
    extends: cc.Component,

    properties: {
        wifiNode: cc.Node
    },

    onEnable: function () {
        this.showWifi();
        this.schedule(this.showWifi, 5);
    },

    showWifi: function() {
        var index = 0;
        var ms = GameNet.getInstance().getPingPong();
        if (ms < 300) {
            index = 3;
        } else if (ms < 600) {
            index = 2;
        } else if (ms < 1000) {
            index = 1;
        }

        for (var i = 0; i < 4; i++) {
            var node = cc.find('WiFi-' + (i + 1), this.wifiNode);
            node.active = i == index ? true : false;
        }
    }
});