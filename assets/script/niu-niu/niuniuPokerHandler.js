var niuniuPokerHandler = {
    //牛牛
    GAMESTATUS: {
        WAIT: 0,
        ZHUANG: 1,  //抢庄阶段
        CHIPS: 2,   //下注阶段
        COMPARE: 3, //比牌阶段
        SETTLE: 4,  //结算阶段
    },


    //百人牛牛
    HUNDREDNIUSTATUS: {
        CHIPS: 1,
        SETTLE: 2,
        END: 3,
    },
    XIAZHU: [
        [50,100,1000,10000,20000],
        [50,100,1000,10000,20000],
        [50,100,1000,10000,20000],
    ],
    ERRORTYPE:{
        SUCCESSE: 0,
        Niu100_Zhuang_Coin: 601,                //上庄金币不足
        Niu100_Chips_State: 602,                //非下注阶段不允许下注
        Niu100_Chips_Zhuang: 603,               //庄家不允许下注
        Niu100_Chips_ZhuangMax: 604,            //四个闲位的下注总额不能超过庄家所携带分数的十分之一
        Niu100_Chips_PlayerMax: 605,            //每个闲家下注的总数不能超过自身金币的1/5
        Niu100_Chips_Continue: 606,             //上局没下注无法续压
        Niu100_Zhuang_Already: 607,             //已在上庄队列
        Niu100_Zhuang_UpAlready: 608,           //已上庄
    },

    //public
    POKER_TYPE: {
        NIU_NONE: 0,    //没牛
        NIU_ONE: 1,     //牛一
        NIU_Two: 2,     //牛二
        NIU_Three: 3,   //牛三
        NIU_Four: 4,    //牛四
        NIU_Five: 5,    //牛五
        NIU_Six: 6,     //牛六
        NIU_Seven: 7,   //牛七
        NIU_Eight: 8,   //牛八
        NIU_Nine: 9,    //牛九
        NIU_NIU: 10,    //牛牛
        NIU_HuaFour: 11,//四花
        NIU_HuaFive: 12,//五花
        NIU_Bomb: 13,   //炸弹
        NIU_Little: 14, //小牛牛
    },
    POKER_STR: {
        NIU_NONE: '没牛',    
        NIU_ONE: '牛一',     
        NIU_Two: '牛二',   
        NIU_Three: '牛三',
        NIU_Four: '牛四',
        NIU_Five: '牛五',
        NIU_Six: '牛六',
        NIU_Seven: '牛七',
        NIU_Eight: '牛八',
        NIU_Nine: '牛九',
        NIU_NIU: '牛牛',
        NIU_HuaFour: '四花',
        NIU_HuaFive: '五花',
        NIU_Bomb: '炸弹',
        NIU_Little: '小牛牛',
    },
    AllCards: {
        joker:    [501,502],   //小王，大王
        club:     [201,202,203,204,205,206,207,208,209,210,211,212,213],  //梅花A,2~K
        heart:    [301,302,303,304,305,306,307,308,309,310,311,312,313],  //红桃A,2~K
        spade:    [401,402,403,404,405,406,407,408,409,410,411,412,413],  //黑桃A,2~K
        dianmond: [101,102,103,104,105,106,107,108,109,110,111,112,113],  //方块A,2~K
    }
};

module.exports = niuniuPokerHandler;
niuniuPokerHandler.getGameStatus = function () {
    return niuniuPokerHandler.GAMESTATUS;
};
niuniuPokerHandler.getPokerType = function () {
    return niuniuPokerHandler.POKER_TYPE;
};
niuniuPokerHandler.getPokerStar = function () {
    return niuniuPokerHandler.POKER_STR;
};


//数组去重
niuniuPokerHandler.unequally = function (array) {
    var res = [];
    var obj = {};
    for(var i=0; i<array.length; i++){
        if( !obj[array[i]] ){
            obj[array[i]] = 1;
            res.push(array[i]);
        }
    } 
    return res;
};

niuniuPokerHandler.clearArray = function(array) {
    if (array.length > 0) 
    {
        array.splice(0, array.length);
    }
};
niuniuPokerHandler.itemtoArraytop = function(Arr,index){
    var temp = Arr[index];
    if(index == 0){
      return Arr;
    }
    for (var i = 0; i < Arr.length; i++) {
      if (Arr[i] === Arr[index]) {
        //从第i个元素开始移除，1是长度，只移除一个元素。
        Arr.splice(i, 1);
        break;
      }
    }
    //unshift() 方法可向数组的开头添加一个或更多元素，并返回新的长度。
    Arr.unshift(temp);
    return Arr;
}