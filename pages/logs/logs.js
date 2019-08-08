//logs.js
//获取应用实例

const utilMd5 = require('../../utils/md5.js');


var password = utilMd5.hexMD5(123456);
var app = getApp();
var ip = getApp().data.ip;

Page({
    data: {
        name: "",
        password: "",
        num: '',
        code: '',
        color: '',
    },

    onLoad: function () {
        if (wx.getStorageSync('loginCode') !== '') {
            wx.switchTab({
                url: '../main/main',   //注意switchTab只能跳转到带有tab的页面，不能跳转到不带tab的页面
            })
        }
    },
    userNameInput: function (e) {
        this.setData({
            name: e.detail.value
        });
    },
    userPasswordInput: function (e) {
        this.setData({
            password: e.detail.value
        });
    },
    // 点击登录
    loginBtnClick: function () {
        wx.showLoading({
            title: '请求中...',
        });
        wx.request({
            url: ip + '/index/login',
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                "loginName": this.data.name,
                "password": utilMd5.hexMD5(utilMd5.hexMD5(this.data.password) + utilMd5.hexMD5(this.data.name)),
            },
            method: 'POST',
            success: (res) => {
                if (res.data.code === 0) {
                    wx.setStorageSync('loginCode', res.data.data);
                    wx.switchTab({
                        url: '../main/main',
                    })
                } else {
                    wx.hideLoading();
                    wx.showModal({
                        title: "提示",
                        content: res.data.data,
                    })
                }

            },
        })
    },
    onShareAppMessage: function () {
        return {
            title: '巡货员端',
        }
    },

});
