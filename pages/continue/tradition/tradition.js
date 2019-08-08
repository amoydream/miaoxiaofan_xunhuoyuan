//index.js
//获取应用实例
const app = getApp();
let ip = getApp().data.ip;
Page({
    data: {
        titleArr: ['货道', '商品'],
        titleIndex: 0,
        tierNumber: '',//层数
        tierIndex: 0,
        tierInfo: '',//货道详情
        tierList: '',
        deviceId: '',
        goodsList: '',
        countData: '',
        ip: ip,
    },
    onLoad: function (options) {
        this.setData({
            deviceId: options.id
        });
        this.getDevice();
    },
    // 选择展示
    chooseIndex: function (e) {
        this.setData({
            titleIndex: e.currentTarget.dataset.index
        });
        if (this.data.titleIndex === 0) {

        } else if (this.data.titleIndex === 1) {
            wx.request({
                url: ip + '/device/traditionalByGoods/' + this.data.deviceId,
                header: {"Content-Type": "application/x-www-form-urlencoded"},
                method: 'GET',
                data: {
                    loginCode: wx.getStorageSync("loginCode")
                },
                success: (res) => {
                    if (res.data.code === 0) {
                        let data = res.data.data;
                        this.setData({
                            goodsList: data
                        });

                    } else {
                        wx.showModal({
                            title: "提示",
                            content: res.data.data
                        })
                    }

                },

            })
        }

    },
    //选择层数内容
    chooseTier: function (e) {
        this.setData({
            tierIndex: e.currentTarget.dataset.index
        });
        this.getTier(this.data.countData, e.currentTarget.dataset.content)
    },
    // 货道层数
    getDevice: function () {
        wx.request({
            url: ip + '/device/traditionalByFloor/' + this.data.deviceId,
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            method: 'GET',
            data: {
                loginCode: wx.getStorageSync("loginCode")
            },
            success: (res) => {
                if (res.data.code === 0) {
                    let data = res.data.data, tierNumber = [];
                    for (let i = 0; i < data.length; i++) {
                        for (let j = 0; j < data[i].channelList.length; j++) {
                            if (data[i].channelList[j].status !== 1) {
                                data[i].status = 0
                            }
                        }
                    }

                    data.forEach(item => {
                        tierNumber.push({
                            name:item.floor,
                            status:item.status
                        });
                    });

                    this.setData({
                        tierNumber: tierNumber,
                        countData: data,
                    });

                    this.getTier(data, tierNumber[0].name)
                } else {
                    wx.showModal({
                        title: "提示",
                        content: res.data.data
                    })
                }

            },

        });
    },

    getTier: function (data, tierNumber) {
        let tierList;
        for (let i = 0; i < data.length; i++) {
            if (tierNumber === data[i].floor) {
                tierList = data[i];
                break;
            }
        }
        let tierList1 = [];
        tierList.channelList.reduce((item, next) => {
            next.foo.hasOwnProperty("goods") && tierList1.push(next);
            return next;
        }, {foo: {}});
        tierList.channelList = tierList1;
        this.setData({
            tierList: tierList
        });
    },

    test: function (e) {
        wx.request({
            url: ip + '/channelGoods/sendTest/' + e.currentTarget.dataset.id + '?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            method: 'post',
            success: (res) => {
                wx.showModal({
                    title: "提示",
                    content: res.data.data
                })
            },

        });
    },
    enableChannel: function (e) {
        let $this = this, id = e.target.dataset.id;
        wx.request({
            url: ip + '/channelGoods/enable/' + id + '?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            method: 'POST',
            data: {
                id: e.currentTarget.dataset.id
            },
            success: (res) => {
                //操作成功
                if (res.data.code === 0) {
                    let obj = this.data.tierList;
                    for (let i = 0; i < obj.channelList.length; i++) {
                        if (obj.channelList[i].id === id)
                            obj.channelList[i].status = 1;
                    }
                    $this.setData({
                        tierList: obj
                    });
                }
                wx.showModal({
                    title: "提示",
                    content: res.data.data
                })
            },

        });
    },
    akeyfill: function () {
        wx.navigateTo({
            url: "../akeyfill/akeyfill?id=" + this.data.deviceId
        })
    },
    affirm: function () {
        wx.navigateTo({
            url: "../../addOrder/addOrder?id=" + this.data.deviceId
        })
    },
});