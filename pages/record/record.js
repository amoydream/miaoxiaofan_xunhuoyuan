// pages/mine/mine.js
//获取应用实例
var app = getApp();
var ip = getApp().data.ip;
Page({
    data: {
        info: '',
    },
    onLoad: function (options) {
        wx.request({
            url: ip + '/goodsIn/recordDetail/'+options.id+'?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            method: 'GET',
            success: (res) => {
                console.log(res);
                if (res.data.code === 1001) {
                    wx.removeStorageSync("loginCode");
                    wx.redirectTo({
                        url: '../logs/logs',
                    })
                } else {
                    if (res.data.code === 0) {
                        this.setData({
                            info:res.data.data
                        })
                    } else {
                        wx.showModal({
                            title: "提示",
                            content: res.data.data
                        })
                    }
                }
            },

        });
    },
});