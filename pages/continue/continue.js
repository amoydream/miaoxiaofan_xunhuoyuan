var ip = getApp().data.ip;
Page({
    data: {
        counterImg: '',//类型图片
        counterText: '',//类型文字
        counterHide: true,//货道显示或者隐藏,
        btnText: '查看商品',
        deviceInfo: '',//设备信息
        type: 1,//判断设备类型
        typeName: '',
        deviceId: '',
        count: 0,//计时
        status: '',
        deviceExplain: '',
        error:''
    },
    onLoad: function (options) {
        this.setData({
            deviceId: options.id
        });
        wx.request({
            url: ip + '/device/infoById/' + this.data.deviceId,
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                loginCode: wx.getStorageSync("loginCode")
            },
            method: 'GET',
            success: (res) => {
                if (res.data.code === 0) {
                    if (res.data.data.structureId === 1) {
                        this.setData({
                            deviceInfo: res.data.data,
                            counterImg: '../images/diandong.png',
                            type: 1,
                            counterHide: false,
                            typeName: '电机类',
                        });
                    } else if (res.data.data.structureId === 2) {
                        this.setData({
                            deviceInfo: res.data.data,
                            counterImg: '../images/RFID.png',
                            type: 2,
                            counterHide: true,
                            typeName: 'RFID',
                        });
                    }

                    this.setData({
                        status: res.data.data.status,
                        error:res.data.data.error
                    });
                    if (this.data.status === 1) {
                        this.setData({
                            deviceExplain: '开启'
                        })
                    } else if (this.data.status === 3) {
                        this.setData({
                            deviceExplain: '禁用'
                        })
                    }

                } else {
                    wx.showModal({
                        title: "提示",
                        content: res.data.data
                    })
                }
            },
        });
    },
    // 确认补货
    affirm: function (e) {
        if (this.data.type === 1) {
            wx.navigateTo({
                url: '../addOrder/addOrder?id=' + e.currentTarget.dataset.id + "&start=1",
            })
        } else if (this.data.type === 2) {
            wx.navigateTo({
                url: '../FRID/FRID?id=' + e.currentTarget.dataset.id + "&unionCode=" + this.data.unionCode + "&start=1",
            })

        }
    },
    // 查看商品
    skip: function (e) {
        let id = e.currentTarget.dataset.id;
        if (this.data.type === 1) {
            wx.navigateTo({
                url: "tradition/tradition?id=" + id
            })
        } else if (this.data.type === 2) {
            wx.navigateTo({
                url: "RFIDDetails/RFIDDetails?id=" + id
            })
        }
    },
    // 一键补满
    akeyfill: function (e) {
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: "akeyfill/akeyfill?id=" + id
        })
    },

    play: function () {
        if (this.data.status == 1) {
            wx.request({
                url: ip + '/device/disable?loginCode=' + wx.getStorageSync("loginCode"),
                header: {"Content-Type": "application/x-www-form-urlencoded"},
                data: {
                    id: this.data.deviceId
                },
                method: 'POST',
                success: (res) => {
                    console.log();
                    if (res.data.code === 0) {
                        this.setData({
                            status: 3,
                            deviceExplain: '禁用'
                        });
                        wx.showModal({
                            title: "提示",
                            content: '禁用成功'
                        })
                    } else {
                        wx.showModal({
                            title: "提示",
                            content: res.data.data
                        })
                    }

                },
            });
        } else if (this.data.status === 3) {
            wx.request({
                url: ip + '/device/enable?loginCode=' + wx.getStorageSync("loginCode"),
                header: {"Content-Type": "application/x-www-form-urlencoded"},
                data: {
                    id: this.data.deviceId
                },
                method: 'POST',
                success: (res) => {
                    console.log();
                    if (res.data.code === 0) {
                        this.setData({
                            status: 1,
                            deviceExplain: '启用'
                        });
                        wx.showModal({
                            title: "提示",
                            content: '启用成功'
                        })
                    } else {
                        wx.showModal({
                            title: "提示",
                            content: res.data.data
                        })
                    }

                },
            });
        }
    },

});