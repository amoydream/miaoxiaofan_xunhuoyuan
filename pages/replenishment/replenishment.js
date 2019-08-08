// pages/mine/mine.js
//获取应用实例
var app = getApp();
var ip = getApp().data.ip;
Page({
    data: {
        record: '',
        page: 1,
        refresh: true,
        load: true,
        flag1: true,
        flag2: true,
        drop: '下拉加载更多',
        details: true,
        hidden:true,
        startTime:'',
        endTime:'',
        deviceName:''
    },
    onShow: function () {
        this.gain();
    },
    // 下拉加载
    loadMore: function () {
        console.log(("下拉"));
        if (this.data.flag1) {
            this.setData({
                load: false,
                page: this.data.page + 1,
                flag1: false
            });
            setTimeout(() => {
                wx.request({
                    url: ip + '/goodsIn/record?loginCode=' + wx.getStorageSync("loginCode"),
                    header: {"Content-Type": "application/x-www-form-urlencoded"},
                    data: {
                        page: this.data.page,
                        limit: 10,
                        deviceName:this.data.deviceName,
                        end:this.data.endTime,
                        start:this.data.startTime
                    },
                    method: 'GET',
                    success: (res) => {
                        console.log(res.data.rows);
                        if (res.data.rows.length < 10) {
                            this.setData({
                                flag1: false,
                                drop: '到底了',
                                record: this.data.record.concat(res.data.rows),
                            })
                        } else {
                            this.setData({
                                record: this.data.record.concat(res.data.rows),
                                load: true,
                                flag1: true,
                            });
                        }
                    },

                });
            }, 1500);
        }

    },

    // 上拉刷新
    refesh: function () {
        console.log(this.data.flag2);
        if (this.data.flag2) {
            this.setData({
                refresh: false,
                page: 1,
                flag2: false
            });
            setTimeout(() => {
                wx.request({
                    url: ip + '/goodsIn/record?loginCode=' + wx.getStorageSync("loginCode"),
                    header: {"Content-Type": "application/x-www-form-urlencoded"},
                    data: {
                        page: this.data.page,
                        limit: 10,
                        deviceName:this.data.deviceName,
                        end:this.data.endTime,
                        start:this.data.startTime
                    },
                    method: 'GET',
                    success: (res) => {
                        console.log('刷新');
                        this.setData({
                            record: res.data.rows,
                            refresh: true,
                            flag1: true,
                            drop: '下拉加载更多',
                        })
                    },

                });
                this.setData({
                    flag2: true
                })
            }, 1000);
        }
    },

    look: function (e) {
        console.log(e);
        wx.navigateTo({
            url:"../record/record?id="+e.currentTarget.dataset.index+"&linkedMethod="+e.currentTarget.dataset.devicetype
        })
    },

    quit: function () {
        this.setData({
            details: true
        });
    },
    gain:function () {
        this.setData({
            page:1
        });
        wx.request({
            url: ip + '/goodsIn/record?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                page: this.data.page,
                limit: 10,
                deviceName:this.data.deviceName,
                end:this.data.endTime,
                start:this.data.startTime
            },
            method: 'GET',
            success: (res) => {
                if (res.data.code === 1001) {
                    wx.removeStorageSync("loginCode");
                    wx.redirectTo({
                        url: '../logs/logs',
                    })
                } else {
                    this.setData({
                        record: res.data.rows
                    })
                }
            },
        });
    },

    chooseTime:function () {
        this.setData({
            hidden:false
        })
    },
    cancel:function () {
        this.setData({
            hidden:true,
            startTime:'',
            endTime:''
        })
    },
    confirm:function () {
        this.setData({
            deviceName:'',
            page:1,
            hidden:true,
        });
        this.gain();
    },
    // 拿到开始时间
    bindStartTimeChange: function (e) {
        this.setData({
            startTime: e.detail.value
        });
    },
    // 拿到结束时间
    bindSendTimeChange: function (e) {
        this.setData({
            endTime: e.detail.value
        });
    },
    search:function (e) {
        this.setData({
            deviceName:e.detail.value,
            page:1,
            load: true,
        });
        this.gain()
    }
});