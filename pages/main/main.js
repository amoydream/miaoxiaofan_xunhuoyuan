// pages/main/main.js
var ip = getApp().data.ip;
Page({
    data: {
        record: '',
        page: 1,
        refresh: true,
        load: true,
        flag1: true,
        flag2: true,
        imgShow: true,
        all: '',//所有设备
        bad: '',//故障设备
        needAdd: '',//待补货设备
        offline: '',//离线设备
    },

    onShow: function () {
        // 判断是否登录
        if (wx.getStorageSync("loginCode") === '') {
            wx.redirectTo({
                url: '../logs/logs',
            })
        }
        // 拿到信息
        wx.request({
            url: ip + '/device/deviceCount?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            method: 'GET',
            success: (res) => {
                if (res.data.code === 0) {
                    this.setData({
                        all: res.data.data.all,//所有设备
                        bad: res.data.data.bad,//故障设备
                        needAdd: res.data.data.needAdd,//待补货设备
                        offline: res.data.data.offline,//离线设备
                    })
                } else {
                    if (res.data.code === 1001) {
                        wx.removeStorageSync("loginCode");
                        wx.redirectTo({
                            url: '../logs/logs',
                        })
                    }

                }

            },

        })
    },
    // 获取二维码信息
    getQR: function () {
        wx.scanCode({
            success: (res) => {
                let result = "结果:" + res.result;
                let re = /\?(.*)/g;

                if (result.indexOf("?") > 0) {
                    this.setData({
                        unionCode: this.getUrlParam('unionCode', result.match(re).toString())
                    });
                } else {
                    let arr = result.split("/");
                    this.setData({
                        unionCode: arr[arr.length - 1]
                    })
                }

                // 发送请求
                wx.request({
                    url: ip + '/device/infoByCode/' + this.data.unionCode,
                    header: {"Content-Type": "application/x-www-form-urlencoded"},
                    data: {
                        loginCode: wx.getStorageSync("loginCode")
                    },
                    method: 'get',
                    success: (res) => {
                        if (res.data.code === 0) {
                            wx.navigateTo({
                                url: '../continue/continue?id=' + res.data.data.id,
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
            fail: (res) => {
                wx.showToast({
                    title: '失败',
                    icon: 'success',
                    duration: 2000
                })
            },
        })
    },
    getUrlParam: function (name, parameter) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = decodeURI(parameter).substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; //返回参数值
    },

    onShareAppMessage: function () {
        return {
            title: '巡货员端',
        }
    },

});