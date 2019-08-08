var ip = getApp().data.ip;
Page({
    data: {
        id: "",
        ip: ip,
        channel: [],
        deviceId: "",
        goods: [],//商品
        hidden: true,
        nocancel: false,
        goods_show: true,
        channelId: "",//货道Id
        goodsId: "",//商品Id
        tierNumber: [],
        chooseIndex: 0,
        toView: '',//控制锚点
        top: [],//每个货道及商品距顶点高度
        flag: false, //控制点击与滚动的节流阀
        control: true,
        index: '',
        fatherIndex: '',
        goodsRemark: '',
        topShow: true,
        chooseShow: true,
        chooseAll: 0,
        height: 100,
        multipleText: '多选',
        multipleStatus: 0,
        titleArr: ['货道', '商品'],
        titleIndex: 0,
        goodsList: [],
        changeGoodsInfo: '',
        page: 1,
        goodsName: ''
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
                            data[i].channelList[j].fatherIndex = i;
                            data[i].channelList[j].goodsNum = 0;
                            data[i].channelList[j].choose = 0;
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
    // 减法
    minusCount: function (e) {
        let index = e.target.dataset.index;
        let fatherIndex = e.target.dataset.father;
        if (this.data.channel[fatherIndex].channelList[index].num !== 0) {
            this.data.channel[fatherIndex].channelList[index].goodsNum--;
            this.data.channel[fatherIndex].channelList[index].num--;
            this.setData({
                channel: this.data.channel
            });
        }
    },
    //加法
    addCount: function (e) {
        let index = e.target.dataset.index;
        let fatherIndex = e.target.dataset.father;
        let num = e.target.dataset.num;
        let maxNum = e.target.dataset.maxnum;
        let goodId = e.target.dataset.goodsid;
        if (num >= maxNum) {
            this.data.channel[fatherIndex].channelList[index].goodsNum = this.data.channel[fatherIndex].channelList[index].goodsNum + 0;
            wx.showToast({
                title: '已达到最大商品数量',
                icon: 'none',
                duration: 500
            })
        } else {
            if (goodId !== null) {
                this.data.channel[fatherIndex].channelList[index].goodsNum++;
                this.data.channel[fatherIndex].channelList[index].num++;
                this.setData({
                    channel: this.data.channel
                });
            }
        }
    },
    // 点击切换效果
    sellGoodsIndex: function (e) {
        this.setData({
            chooseIndex: e.target.dataset.index,
            toView: e.target.dataset.id,
            flag: true
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
    // 商品列表页出现
    goodShow: function (e) {
        let channelId = [];
        channelId.push(e.target.dataset.no);
        this.setData({
            goods_show: false,
            channelId: channelId,
            index: e.target.dataset.index,
            fatherIndex: e.target.dataset.father,
            page: 1,
            goods: []
        });
        this.getGoodsList()
    },

    goodsShow1: function () {
        let channel = [];
        for (let i = 0; i < this.data.channel.length; i++) {
            for (let j = 0; j < this.data.channel[i].channelList.length; j++) {
                if (this.data.channel[i].channelList[j].choose === 1) {
                    channel.push(this.data.channel[i].channelList[j].id)
                }
            }
        }
        if (channel.length <= 0) {
            wx.showToast({
                title: '请选择货道',
                icon: 'none',
                duration: 1000,
                mask: true
            })
        } else {
            this.setData({
                goods_show: false,
                channelId: channel,
                page: 1,
                goods: []
            });
            this.getGoodsList()
        }
    },

    //弹出确认更换
    change: function (event) {
        this.setData({
            goodsId: event.target.dataset.goodsid,
            hidden: false
        });
        for (let i = 0; i < this.data.goods.length; i++) {
            if (this.data.goodsId === this.data.goods[i].id) {
                this.setData({
                    changeGoodsInfo: this.data.goods[i]
                })
            }
        }
    },
    // 取消
    cancel: function () {
        this.setData({
            hidden: true
        });
    },
    // 确认更换商品
    confirm: function () {
        for (let i = 0; i < this.data.channel.length; i++) {
            for (let j = 0; j < this.data.channel[i].channelList.length; j++) {
                if (this.data.channelId.indexOf(this.data.channel[i].channelList[j].id) !== -1) {
                    console.log(this.data.channel[i].channelList[j].id);
                    this.data.channel[i].channelList[j].goodsNum = 0;
                    this.data.channel[i].channelList[j].num = 0;
                    this.data.channel[i].channelList[j].foo.goods = this.data.changeGoodsInfo;
                    this.data.channel[i].channelList[j].goodsId = this.data.goodsId
                }
            }
        }
        this.setData({
            hidden: true,
            nocancel: true,
            goods_show: true,
            channel: this.data.channel
        });
    },
    // 退出
    exit: function () {
        this.setData({
            goods_show: true,
        })
    },
    // 多选
    multipleChoose: function () {
        if (this.data.multipleStatus === 0) {
            this.setData({
                topShow: false,
                chooseShow: false,
                height: 188,
                multipleText: '取消多选',
                multipleStatus: 1
            })
        } else {
            this.setData({
                topShow: true,
                chooseShow: true,
                height: 100,
                multipleText: '多选',
                multipleStatus: 0
            })
        }
    },
    // 点击选择
    chooseMultipleChannel: function (e) {
        let floor = e.currentTarget.dataset.floor;
        let id = e.currentTarget.dataset.id;
        let choose = e.currentTarget.dataset.choose;
        if (choose === 0) {
            for (let i = 0; i < this.data.channel.length; i++) {
                if (floor === this.data.channel[i].floor) {
                    for (let j = 0; j < this.data.channel[i].channelList.length; j++) {
                        if (id === this.data.channel[i].channelList[j].id) {
                            this.data.channel[i].channelList[j].choose = 1
                        }
                    }
                }
            }
        } else {
            for (let i = 0; i < this.data.channel.length; i++) {
                if (floor === this.data.channel[i].floor) {
                    for (let j = 0; j < this.data.channel[i].channelList.length; j++) {
                        if (id === this.data.channel[i].channelList[j].id) {
                            this.data.channel[i].channelList[j].choose = 0
                        }
                    }
                }
            }
        }
        this.setData({
            channel: this.data.channel
        })
    },
    // 全选
    allChoose: function (e) {
        if (this.data.chooseAll === 0) {
            for (let i = 0; i < this.data.channel.length; i++) {
                for (let j = 0; j < this.data.channel[i].channelList.length; j++) {
                    this.data.channel[i].channelList[j].choose = 1;
                    this.setData({
                        chooseAll: 1
                    })
                }
            }
        } else {
            for (let i = 0; i < this.data.channel.length; i++) {
                for (let j = 0; j < this.data.channel[i].channelList.length; j++) {
                    this.data.channel[i].channelList[j].choose = 0;
                    this.setData({
                        chooseAll: 0
                    })
                }
            }
        }

        this.setData({
            channel: this.data.channel
        })
    },
    getGoodsName(e){
        let goodsName = e.detail.value;
        this.setData({
            goodsName: goodsName
        });
    },
    //搜索商品
    search: function () {
        wx.showLoading({
            title: '请求中...',
        });
        wx.request({
            url: ip + '/goods/list?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                goodsName: this.data.goodsName
            },
            method: 'GET',
            success: (res) => {
                if (res.data.code === 0) {
                    this.setData({
                        goods: res.data.rows
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
    },
    //切换货道或者商品模式
    chooseTitle: function (e) {
        this.setData({
            titleIndex: +e.currentTarget.dataset.index
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
                            url: '../main/main',
                        })

                    } else if (status === 3) {
                        setTimeout(() => {
                            this.checkStatus();
                        }, 2000)
                    }
                }
            },
        });
    },
    loadMore: function () {
        this.setData({
            page: this.data.page + 1
        });
        this.getGoodsList();
    },
    getGoodsList: function () {
        // 商品信息
        wx.request({
            url: ip + '/goods/list?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                goodsName: '',
                page: this.data.page,
                limit: 10
            },
            method: 'GET',
            success: (res) => {
                if (res.data.code === 0) {
                    let data = res.data.rows;
                    this.setData({
                        goods: this.data.goods.concat(data)
                    });
                    if (data.length < 10) {

                    }
                } else {
                    wx.showModal({
                        title: "提示",
                        content: res.data.data
                    })
                }
            },

        });
    }

});