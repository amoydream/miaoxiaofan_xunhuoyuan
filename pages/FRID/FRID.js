var ip = getApp().data.ip;
Page({
    data: {
        id: "",
        goods: '',//商品
        submitHidden: true,
        remark: '',
        device: {},
        commandCode: '',//指令码
        count: 0,//计时
        btnHide: true,
        inId: '',//备货单id
        start: 2
    },
    onLoad: function (options) {
        console.log(options);
        this.setData({
            id: options.id,
            unionCode: options.unionCode
        });
        //设备信息
        wx.request({
            url: ip + '/device/info?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                unionCode: this.data.unionCode
            },
            method: 'GET',
            success: (res) => {
                console.log(res.data.data);
                if (res.data.code === 0) {
                    for (let key in  res.data.data) {
                        if (key === 'foo' || null == res.data.data[key] || "" === res.data.data[key] || 'null' === res.data.data[key] || 0 === res.data.data[key].length)
                            continue;
                        this.data.device[key] = res.data.data[key];
                    }
                    this.setData({
                        device: this.data.device
                    })
                } else {
                    wx.showModal({
                        title: "提示",
                        content: res.data.data
                    })
                }
            },
        });
        // 商品信息
        wx.request({
            url: ip + '/goodsIn/replenish?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                id: this.data.id
            },
            method: 'post',
            success: (res) => {
                console.log(res);
                if (res.data.code === 0) {
                    for (let i = 0; i < res.data.data.length; i++) {
                        res.data.data[i].img = ip + res.data.data[i].img
                    }
                    this.setData({
                        goods: res.data.data
                    });
                }
            },
        })
    },

    // 保存补货信息
    save: function () {
        wx.request({
            url: ip + '/goodsIn/submit?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                id: this.data.inId,
                deviceId: this.data.id,
                goodsInDetail: '0'
            },
            method: 'POST',
            success: (res) => {
                this.setData({
                    control: true
                });
                if (res.data.code === 0) {
                    wx.switchTab({
                        url: '../stockOrder/stockorder',
                    })
                } else {
                    wx.hideLoading();
                    wx.showModal({
                        title: "提示",
                        content: res.data.data
                    })
                }
            },

        });
    },
    //盘点
    check: function () {
        //请求等待的样式
        wx.showLoading({
            title: '请求中...',
        });
        // 查看是否有过盘点的记录，如果有请提醒
        wx.request({
            url: ip + '/goodsIn/beforeCheck?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                deviceId: this.data.id
            },
            method: 'GET',
            success: (res) => {
                if (res.data.code === 0) {
                    if (res.data.data.length === 0) {
                        //发送盘点指令
                        this.getCheck();
                    } else {
                        let id = res.data.data.id;
                        wx.hideLoading(); //关闭等待的样式
                        wx.showModal({
                            title: '提示',
                            content: '已存在备货单，点击确定删除旧备货单',
                            success: (res) => {
                                if (res.confirm) {
                                    //请求等待的样式
                                    wx.showLoading({
                                        title: '请求中...',
                                    });
                                    wx.request({
                                        url: ip + '/goodsIn/deleteList?loginCode=' + wx.getStorageSync("loginCode"),
                                        data: {
                                            id: id
                                        },
                                        header: {"Content-Type": "application/x-www-form-urlencoded"},
                                        method: 'POST',
                                        success: (res) => {
                                            if (res.data.code === 0) {
                                                this.getCheck();
                                            }
                                        },

                                    });
                                } else {
                                    wx.hideLoading();
                                }

                            }
                        })
                    }
                } else {
                    wx.hideLoading(); //关闭等待的样式
                    wx.showModal({
                        title: '提示',
                        content: res.data.data
                    })
                }
            },
        });

    },
    // 获取备注信息
    getRemark: function (e) {
        this.setData({
            remark: e.detail.value
        })
    },

    //保存&提交显示
    forbidden: function () {
        this.setData({
            submitHidden: false,//确认提交
        })
    },

    //取消保存&提交
    cancel1: function () {
        this.setData({
            submitHidden: true
        })
    },

    //保存&提交按钮
    confirm1: function () {
        wx.showLoading({
            title: '请求中...',
        });
        wx.request({
            url: ip + '/goodsIn/confirmAndSubmit?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                deviceId: this.data.id,
                id: this.data.inId,
                remark: this.data.remark,
                goodsInDetail: '0'
            },
            method: 'POST',
            success: (res) => {
                if (res.data.code === 0) {
                    wx.switchTab({
                        url: '../stockOrder/stockorder',
                    })
                } else {
                    wx.hideLoading();
                    wx.showModal({
                        title: "提示",
                        content: res.data.data
                    })
                }
            },

        });
    },

    // 封装一下盘点的动作
    getCheck: function () {
        wx.request({
            url: ip + '/rfid/sendCheckCommand?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: this.data.device,
            method: 'POST',
            success: (res) => {
                this.setData({
                    commandCode: res.data.data.commandCode
                });
                // 轮询结果
                let timer = setInterval(() => {
                    wx.request({
                        url: ip + '/rfid/cometCheckCommand?loginCode=' + wx.getStorageSync("loginCode"),
                        header: {"Content-Type": "application/x-www-from-urlencoded"},
                        data: {
                            commandCode: this.data.commandCode,
                            deviceId: this.data.id
                        },
                        method: 'get',
                        success: (res) => {
                            if (res.data.code === 0) {
                                this.setData({
                                    count: this.data.count + 1
                                });
                                if (this.data.count === 15) {
                                    clearInterval(timer);
                                    wx.hideLoading(); //关闭等待的样式
                                    wx.showModal({
                                        title: '提示',
                                        content: '设备暂无响应'
                                    })
                                }
                                if (res.data.data.reply) {
                                    wx.hideLoading(); //关闭等待的样式
                                    clearInterval(timer);
                                    this.setData({
                                        goods: res.data.data.data,
                                        inId: res.data.data.data[0].inId,
                                        btnHide: false
                                    });
                                }
                            } else {
                                wx.showModal({
                                    title: "提示",
                                    content: res.data.data
                                });
                                clearInterval(timer);
                                wx.hideLoading(); //关闭等待的样式

                            }
                        }
                    })
                }, 2000);
            },
        })
    },
    // 开门
    startReplenishment: function () {
        // 开门指令
        wx.showLoading({
            title: '请求中...',
        });
        wx.request({
            url: ip + '/rfid/sendOpenCommand?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                id: this.data.deviceId
            },
            method: 'POST',
            success: (res) => {
                if (res.data.code === 0) {
                    this.setData({
                        commandCode: res.data.data.commandCode
                    });
                    if (res.data.data.doorStatus) {
                        wx.navigateTo({
                            url: '../FRID/FRID?id=' + e.currentTarget.dataset.id + "&unionCode=" + this.data.unionCode,
                        })
                    } else {
                        // 轮询结果
                        let timer = setInterval(() => {
                            wx.request({
                                url: ip + '/rfid/cometOpenCommand?loginCode=' + wx.getStorageSync("loginCode"),
                                header: {"Content-Type": "application/x-www-from-urlencoded"},
                                data: {
                                    commandCode: this.data.commandCode,
                                    deviceId: this.data.deviceId
                                },
                                method: 'get',
                                success: (res) => {
                                    if (res.data.code === 0) {
                                        this.setData({
                                            count: this.data.count + 1
                                        });
                                        if (this.data.count === 15) {
                                            wx.hideLoading(); //关闭等待的样式
                                            clearInterval(timer);
                                            wx.showModal({
                                                title: "提示",
                                                content: "执行指令失败"
                                            })
                                        }
                                        if (res.data.data.reply) {
                                            wx.hideLoading(); //关闭等待的样式
                                            clearInterval(timer);
                                            this.setData({
                                                start: 1
                                            })
                                        }
                                    } else {
                                        clearInterval(timer);
                                        wx.hideLoading(); //关闭等待的样式
                                        wx.showModal({
                                            title: "提示",
                                            content: "执行指令失败"
                                        })
                                    }
                                }
                            })
                        }, 2000);
                    }

                } else {
                    wx.hideLoading();
                    wx.showModal({
                        title: "提示",
                        content: res.data.data
                    })
                }
            },
        });
    },
    //退出补货
    quitReplenishment: function () {
        wx.request({
            url: ip + '/device/finish?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                deviceId: this.data.deviceId,
            },
            method: 'POST',
            success: (res) => {
                if (res.data.code === 0) {
                    this.setData({
                        start: 1
                    })
                } else {
                    wx.hideLoading();
                    wx.showModal({
                        title: "提示",
                        content: res.data.data
                    })
                }
            },

        });
    }
});