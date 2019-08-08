var ip = getApp().data.ip;
Page({
    data: {
        id: "",
        ip:ip,
        channel: [],
        titleArr: ['货道', '商品'],
        titleIndex: 0,
        deviceId: "",
        goods: "",//商品
        hidden: true,
        nocancel: false,
        channelId: "",//货道Id
        goodsId: "",//商品Id
        tierNumber: [],
        chooseIndex: 0,
        toView: '',//控制锚点
        top: [],//每个货道及商品距顶点高度
        flag: false, //控制点击与滚动的节流阀
        control: true,
        index: '',
        chooseShow: true,
        height: 0,
    },
    onLoad: function (options) {
        this.setData({
            id: options.id,
        });
        // 货道信息
        wx.request({
            url: ip + '/device/traditionalByFloor/' + this.data.id,
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                loginCode: wx.getStorageSync("loginCode")
            },
            method: 'get',
            success: (res) => {
                if (res.data.code === 0) {
                    let data = res.data.data;
                    for (let i = 0; i < data.length; i++) {
                        this.data.tierNumber.push(data[i].floor);
                        for (let j = 0; j < data[i].channelList.length; j++) {
                            data[i].channelList[j].num = data[i].channelList[j].num == null ? '0' : data[i].channelList[j].num;
                            data[i].channelList[j].goodsNum = data[i].channelList[j].maxNum - data[i].channelList[j].num;
                            data[i].channelList[j].num = data[i].channelList[j].maxNum;
                        }
                    }
                    this.setData({
                        tierNumber: this.data.tierNumber,
                        channel: data,
                    });
                    // 获取元素高度
                    let query = wx.createSelectorQuery();
                    let top = [];
                    for (let i = 0; i < this.data.tierNumber.length; i++) {
                        query.select('#goodsId' + i).boundingClientRect();
                        query.exec((res) => {
                            top.push(res[i].top);
                            this.setData({
                                top: top
                            })
                        });
                    }
                }
            },

        });

    },
    // 点击切换效果
    sellGoodsIndex: function (e) {
        this.setData({
            flag: true,
            chooseIndex: e.target.dataset.index,
            toView: e.target.dataset.id
        });
    },
    // 计算高度
    countHeight: function (e) {
        let scrollTop = e.detail.scrollTop;
        for (let i = 0; i < this.data.top.length; i++) {
            if (scrollTop > this.data.top[i - 1] && scrollTop < this.data.top[i]) {
                if (this.data.flag) {
                    this.setData({
                        chooseIndex: i,
                        tierNumber: this.data.tierNumber,
                        flag: false
                    })
                }
                else {
                    this.setData({
                        chooseIndex: i - 1,
                        tierNumber: this.data.tierNumber
                    });
                }

            }
        }
        if (scrollTop > this.data.top[this.data.top.length - 1]) {
            this.setData({
                chooseIndex: this.data.top.length - 1,
                tierNumber: this.data.tierNumber
            });
        }
    },
    // 保存补货信息
    save: function () {
        let goodsDetail = [];
        for (let i = 0; i < this.data.channel.length; i++) {
            goodsDetail = goodsDetail.concat(this.data.channel[i].channelList)
        }
        console.log(goodsDetail);
        wx.showModal({
            title: '确认提交',
            content: '是否确认提交本次补货单？',
            success: (res) => {
                if (res.confirm) {
                    wx.showLoading({
                        title: '设备请求指令中，如果长时间没有响应，请检查设备',
                    });
                    wx.request({
                        url: ip + '/goodsIn/traditionalAdd/' + this.data.id + '?loginCode=' + wx.getStorageSync("loginCode"),
                        header: {"Content-Type": "application/json"},
                        data: JSON.stringify(goodsDetail),
                        method: 'POST',
                        success: (res) => {
                            this.setData({
                                control: true
                            });
                            if (res.data.code === 0) {
                                this.checkStatus();
                            } else {
                                wx.hideLoading();
                                wx.showModal({
                                    title: "提示",
                                    content: res.data.data
                                })
                            }
                        },
                    });
                } else if (res.cancel) {

                }
            }
        });
    },
    chooseIndex: function (e) {
        console.log(e.currentTarget.dataset.index);
        this.setData({
            titleIndex: e.currentTarget.dataset.index
        });
        if (this.data.titleIndex === 1) {
            wx.showLoading({
                title: '请求中...',
            });
            let goodsDetail = [];
            for (let i = 0; i < this.data.channel.length; i++) {
                goodsDetail = goodsDetail.concat(this.data.channel[i].channelList)
            }
            wx.request({
                url: ip + '/goodsIn/traditionalCalculate/' + this.data.id + '?loginCode=' + wx.getStorageSync("loginCode"),
                header: {"Content-Type": "application/json"},
                data: JSON.stringify(goodsDetail),
                method: 'POST',
                success: (res) => {
                    if (res.data.code === 0) {
                        this.setData({
                            goodsList: res.data.data
                        });
                        wx.hideLoading();
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
    },
    checkStatus: function () {
        wx.request({
            url: ip + '/device/infoById/' + this.data.id,
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                loginCode: wx.getStorageSync("loginCode")
            },
            method: 'GET',
            success: (res) => {
                if (res.data.code === 0) {
                    let status = res.data.data.status;
                    if (status === 1) {
                        wx.hideLoading();
                        wx.showModal({
                            title: "提示",
                            content: '操作成功'
                        });
                        wx.switchTab({
                            url: '../../main/main',
                        })

                    } else if (status === 3) {
                        setTimeout(() => {
                            this.checkStatus();
                        }, 2000)
                    }
                }
            },
        });
    }
});