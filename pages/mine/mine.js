// pages/mine/mine.js
//获取应用实例
const app = getApp();
const ip = getApp().data.ip;
Page({
    data: {
        name: '',
        unionCode: '',
        headImg: ''
    },

    onShow: function () {
        wx.request({
            url: ip + '/inspector/selectById?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            method: 'GET',
            success: (res) => {
                console.log(res);
                if (res.data.code === 0) {
                    let data = res.data.data;
                    if (data.headImg) {
                        this.setData({
                            headImg: ip + data.headImg,
                        })
                    } else {
                        this.setData({
                            headImg: '../images/headimg.png'
                        })
                    }
                    this.setData({
                        realName: data.realName,
                        name: data.loginName,
                    });
                } else {
                    wx.showModal({
                        title: "提示",
                        content: res.data.data
                    })
                }

            },
        })
    },
    // 获取二维码
    getQR: function () {
        var that = this;
        var show;
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
                    url: ip + '/device/info?loginCode=' + wx.getStorageSync("loginCode"),
                    header: {"Content-Type": "application/x-www-form-urlencoded"},
                    data: {
                        unionCode: this.data.unionCode
                    },
                    method: 'get',
                    success: (res) => {
                        if (res.data.code === 0) {
                            if (res.data.data.structureId === 1) {
                                wx.navigateTo({
                                    url: '../inventory/inventory?id=' + res.data.data.id,
                                })
                            } else if (res.data.data.structureId === 2) {
                                wx.showModal({
                                    title: '提示',
                                    content: 'FRID货柜不支持报损管理'
                                })
                            }


                        } else {
                            if (res.data.code === 1001) {
                                wx.removeStorageSync("loginCode");
                                wx.redirectTo({
                                    url: '../logs/logs',
                                })
                            }

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

    // 退出登录
    quit: function () {
        wx.removeStorageSync("loginCode");
        wx.redirectTo({
            url: '../logs/logs',
        })
    },
    // 修改密码
    revamp: function () {
        wx.navigateTo({
            url: '../password/password',
        })
    },


    //查看补货记录
    getReplenishment: function () {
        wx.navigateTo({
            url: '../replenishment/replenishment',
        })
    },
    getAdjustment: function () {
        wx.navigateTo({
            url: '../adjustment/adjustment'
        })
    },

    adjust: function () {
        wx.navigateTo({
            url: "../adjust/adjust"
        })
    },


    getUrlParam: function (name, parameter) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = decodeURI(parameter).substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; //返回参数值
    }
})
;
