// pages/sellgoods/sellgoods.js
var ip = getApp().data.ip;
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        changeRed: 0,
        list: [
            {
                'text': '所有',
                id: 0,
                number: ''
            },
            {
                'text': '待补货',
                id: 1,
                number: ""
            },
            {
                'text': '故障',
                id: 2,
                number: ""
            },
            {
                'text': '离线',
                id: 3,
                number: ""
            }],
        status: 0,  //设备状态
        hidden: true,
        device: '',
        left: 'item0',
        deviceClass: ['设备状态', '设备结构'],
        deviceClassIndex: 0,
        titleArr: ['所有货柜', '电机/格子柜', 'RFID货柜'],
        titleIndex: 0,
        isShow: true,
        page1: 1,
        deviceList: '',
        structureId: 0,
        refresh1: true,
        load1: true,
        flag11: true,
        flag21: true,
        two1: '下拉加载更多',
    },
    onShow: function () {
        this.setData({
            changeRed: 0,
            status: 0,
            deviceClassIndex: 0,
            left: 'item0'
        });

        wx.request({
            url: ip + '/device/deviceCount?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            method: 'GET',
            success: (res) => {
                if (res.data.code === 0) {
                    this.data.list[0].number = res.data.data.all;
                    this.data.list[1].number = res.data.data.needAdd;
                    this.data.list[2].number = res.data.data.bad;
                    this.data.list[3].number = res.data.data.offline;
                    this.setData({
                        list: this.data.list
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

        });
        this.getRequest()
    },
    // 点击出现
    sellGoodsIndex: function (e) {
        this.setData({
            changeRed: e.target.dataset.index,
            status: e.target.dataset.id,
        });
        this.getRequest();
    },
    // 发送请求
    getRequest: function () {
        wx.request({
            url: ip + '/device/listByStatus/' + this.data.status,
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                loginCode: wx.getStorageSync("loginCode"),
                page: this.data.page1,
                limit: 10
            },
            method: 'GET',
            success: (res) => {
                if (res.data.code === 0) {
                    this.setData({
                        deviceList: res.data.rows
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

    details: function (e) {
        wx.navigateTo({
            url: "../facility/facility?id=" + e.currentTarget.dataset.id
        })
    },

    chooseDeviceClass: function (e) {
        this.setData({
            deviceClassIndex: e.currentTarget.dataset.index,
        });
        if (this.data.deviceClassIndex == 0) {
            this.setData({
                changeRed: 0,
                page1: 1
            });
            this.getRequest(0)
        } else {
            this.setData({
                structureId: 0,
                titleIndex: 0,
                page1: 1
            });
            this.getData1();
        }

    },
    chooseIndex: function (e) {
        this.setData({
            titleIndex: e.currentTarget.dataset.index,
            load1: true
        });
        if (this.data.titleIndex === 0) {
            this.setData({
                structureId: 0
            })
        } else if (this.data.titleIndex === 1) {
            this.setData({
                structureId: 1
            })
        } else if (this.data.titleIndex === 2) {
            this.setData({
                structureId: 2
            })
        }
        this.getData1();
    },
    getData1: function () {
        wx.request({
            url: ip + '/device/listByStructure/' + this.data.structureId,
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            method: 'GET',
            data: {
                page: this.data.page1,
                limit: 10,
                loginCode: wx.getStorageSync("loginCode")
            },
            success: (res) => {
                if (res.data.code === 0) {
                    this.setData({
                        deviceList: res.data.rows
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

    // 下拉加载
    loadMore: function () {
        if (this.data.flag11) {
            this.setData({
                load1: false,
                page1: this.data.page1 + 1,
                flag11: false
            });
            setTimeout(() => {
                let url = '';
                if (this.data.deviceClassIndex == 0) {
                    url = ip + '/device/listByStructure/' + this.data.structureId
                } else {
                    url = ip + '/device/listByStatus/' + this.data.status
                }
                wx.request({
                    url: ip + url,
                    header: {"Content-Type": "application/x-www-form-urlencoded"},
                    data: {
                        page: this.data.page1,
                        limit: 10,
                        loginCode: wx.getStorageSync("loginCode")
                    },
                    method: 'GET',
                    success: (res) => {
                        if (res.data.rows.length < 10) {
                            this.setData({
                                flag11: false,
                                two1: '已经到底了',
                                deviceList: this.data.deviceList.concat(res.data.rows),
                            })
                        } else {
                            this.setData({
                                deviceList: this.data.deviceList.concat(res.data.rows),
                                flag11: true,
                            });
                        }
                    },

                });
            }, 1000);
        }

    },

    // 上拉刷新
    refesh: function () {
        if (this.data.flag21) {
            this.setData({
                refresh1: false,
                page1: 1,
                flag21: false
            });
            let url = '';
            if (this.data.deviceClassIndex == 0) {
                url = ip + '/device/listByStructure/' + this.data.structureId
            } else {
                url = ip + '/device/listByStatus/' + this.data.status
            }
            setTimeout(() => {
                wx.request({
                    url: ip + url,
                    header: {"Content-Type": "application/x-www-form-urlencoded"},
                    data: {
                        page: this.data.page1,
                        limit: 10,
                        loginCode: wx.getStorageSync("loginCode")
                    },
                    method: 'GET',
                    success: (res) => {
                        this.setData({
                            deviceList: res.data.rows,
                            refresh1: true,
                            flag11: true,
                            two1: '下拉加载更多',
                            flag21: true
                        })
                    },
                });
            }, 1000);
        }
    },


    skip: function (e) {
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: "../continue/continue?id=" + id
        })
    },
});