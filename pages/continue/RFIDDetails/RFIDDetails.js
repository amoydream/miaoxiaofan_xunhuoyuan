//index.js
//获取应用实例
const app = getApp();
var ip = getApp().data.ip;
Page({
    data: {
        goodsList:''
    },
    onLoad: function (options) {
        this.setData({
            deviceId:options.id
        });
        wx.request({
            url: ip + '/device/rfidDeviceGoods?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/json"},
            method: 'GET',
            data: {
                deviceId:this.data.deviceId
            },
            success: (res) => {
                console.log(res);
                if (res.data.code === 0) {
                    for(let i=0;i<res.data.data.length;i++){
                        res.data.data[i].img=ip+ res.data.data.img
                    }
                    this.setData({
                        goodsList:res.data.data
                    })
                } else {
                    wx.showModal({
                        title: "提示",
                        content: res.data.data
                    })
                }

            },

        })
    },
});