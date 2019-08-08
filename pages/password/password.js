var ip = getApp().data.ip;

Page({
    data: {
        headImg: '',
        headImg2: '',
        password: "",
        name: '',
        realName: '',
        sex: ['男', '女'],
        index: 0, //控制男女
        sexName: '',
        phone: '',
    },
    onLoad: function () {
        // 查询个人资料
        wx.request({
            url: ip + '/inspector/selectById?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            method: 'GET',
            success: (res) => {
                if (res.data.code === 0) {
                    this.setData({
                        realName: res.data.data.realName,
                        headImg: ip+res.data.data.headImg,
                        headImg2:res.data.data.headImg,
                        name: res.data.data.loginName,
                        password: res.data.data.password,
                        phone: res.data.data.phone,
                    });
                    if (res.data.data.sex === 2) {
                        this.setData({
                            index: 1
                        })
                    } else {
                        this.setData({
                            index: 0
                        })
                    }
                } else {
                    wx.showModal({
                        title: "提示",
                        content: res.data.data
                    })
                }

            },
        })
    },
    pass: function (e) {
        this.setData({
            password: e.detail.value
        });
    },

    bindChange: function (event) {
        let index = event.detail.value;
        this.setData({
            index: index
        })
    },
    // 修改头像
    choose: function () {
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: res => {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var tempFilePaths = res.tempFilePaths[0];
                this.setData({
                    headImg: tempFilePaths
                });
                wx.uploadFile({
                    url: ip + '/file/uploadFile?loginCode=' + wx.getStorageSync("loginCode"),
                    header: {"Content-Type": "multipart/form-data"},
                    filePath: tempFilePaths,
                    name: 'file',
                    success: (res) => {
                        let headImg = JSON.parse(res.data);
                        this.setData({
                            headImg: ip + headImg.data,
                            headImg2: headImg.data
                        })
                    },
                })
            }
        })
    },
    realNameInput: function (e) {
        this.setData({
            realName: e.detail.value
        });
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
    phoneInput: function (e) {
        this.setData({
            phone: e.detail.value
        });
    },

    // 确认
    affirm: function () {
        if (this.data.index === '0') {
            this.setData({
                sexName: 1
            })
        } else {
            this.setData({
                sexName: 2
            })
        }

        wx.request({
            url: ip + '/inspector/updateData?loginCode=' + wx.getStorageSync("loginCode"),
            header: {"Content-Type": "application/x-www-form-urlencoded"},
            data: {
                realName: this.data.realName,
                loginName: this.data.name,
                password: this.data.password,
                phone: this.data.phone,
                headImg: this.data.headImg2,
                sex: this.data.sexName
            },
            method: 'POST',
            success: function (res) {
                if (res.data.code === 0) {
                    wx.showModal({
                        title: "提示",
                        content: res.data.data,
                        success:function (res) {
                            if (res.cancel) {
                                //点击取消,默认隐藏弹框
                            } else {
                                wx.switchTab({
                                    url: '../mine/mine',
                                })
                            }
                        }
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
    bindWx:function () {
        // // // 获取信息
        wx.login({
            //获取code
            success: (res)=> {
                console.log(res.code);
                wx.request({
                    url: ip + '/index/getOpenid?loginCode=' + wx.getStorageSync("loginCode"),
                    header: {"Content-Type": "application/x-www-form-urlencoded"},
                    method:'POST',
                    data:{
                      code:res.code
                    },
                    success: (res) => {
                        if(res.data.code===0){
                            wx.showModal({
                                title: "提示",
                                content: res.data.msg
                            })
                        }else{
                            wx.showModal({
                                title: "提示",
                                content: res.data.data
                            })
                        }

                    },
                })
            }
        })
    }
});