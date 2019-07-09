// pages/evaluate/evaluate.js
const db = wx.cloud.database(); //初始化数据库
Page({
  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
    movieid: -1, //电影id
    content: "", //评价内容
    grade: 5, //评分
    images: [], //上传的图片
    fileIDs: []
  },
  onContentChange: function(event) {
    this.setData({
      content: event.detail
    })
  },
  onGradeChange: function(event) {
    this.setData({
      grade: event.detail
    });
  },
  submitEvaluate: function() {
    wx.showLoading({
      title: '正在提交',
    });
    //将图片上传到云存储
    let imgArr = [];
    for (let i = 0; i < this.data.images.length; i++) {
      //此处使用promise，确定图片上传结束后再存数据库
      imgArr.push(new Promise((reslove, reject) => {
        let item = this.data.images[i];
        let png = item.split(".");
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + "." + png[png.length - 1],
          filePath: item, // 文件路径
        }).then(res => {
          //云存储返回id
          this.setData({
            fileIDs: this.data.fileIDs.concat(res.fileID)
          })
          reslove();
        }).catch(error => {
          // handle error
        })
      }))
    }
    //全部上传结束后存数据库
    Promise.all(imgArr).then(res => {
      //插入数据
      db.collection('comment').add({
        data: {
          content: this.data.content,//评价详情
          grade: this.data.grade,//星级
          movieid: this.data.movieid,//电影id
          fileIDs: this.data.fileIDs//图片id
        }
      }).then(res => {
        wx.hideLoading();
        wx.showToast({
          title: '评价成功',
        })
      }).catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '评价失败',
        })
      })
    }).catch(err => {
      console.log(err)
    })
  },
  uploadImg: function() {
    wx.chooseImage({
      count: 3,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        this.setData({
          images: this.data.images.concat(tempFilePaths)
        })
        console.log(this.data.images)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.cloud.callFunction({
      name: 'movieDetail',
      data: {
        movieid: options.movieid
      }
    }).then(res => {
      this.setData({
        detail: JSON.parse(res.result)
      })
      wx.setNavigationBarTitle({
        title: this.data.detail.title
      })
    }).catch(err => {
      console.log(err)
    })
    this.setData({
      movieid: options.movieid
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})