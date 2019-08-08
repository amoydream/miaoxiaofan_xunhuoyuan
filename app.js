//app.js

import md5 from 'utils/md5.js';

App({
    data: {
        ip: {
            dev: 'http://192.168.2.199:80',
            prod: 'https://bianli.miaowbuy.com/inspector',
        }['prod']
    },
    onLoad: function () {
    },
    onLaunch: function () {
        // 展示本地存储能力
        let logs = wx.getStorageSync('logs') || [];
        logs.unshift(Date.now());
        wx.setStorageSync('logs', logs)
    },
    globalData: {
        userInfo: null
    }
});