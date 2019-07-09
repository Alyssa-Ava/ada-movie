Page({
  "usingComponents": {
    "van-button": "vant-weapp/button"
  },
  onLoad: function(options) {
    this.getMovieList();
  },
  onReachBottom: function() {
    this.getMovieList();
  },
  data: {
    movieList: []
  },
  evalDetail: function(event) {
    
    wx.navigateTo({
      url: `../../pages/evaluate/evaluate?movieid=${event.target.dataset.movieid}`,
      success: function(res) {
        console.log(res)
      },
      fail: function(err) {
        console.log(err)
      }
    })
  },
  getMovieList: function() {
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'movieList',
      data: {
        start: this.data.movieList.length,
        count: 10
      }
    }).then(res => {
      this.setData({
        movieList: this.data.movieList.concat(JSON.parse(res.result).subjects)
      })
      wx.hideLoading();
    }).catch(err => {
      console.error(err)
      wx.hideLoading();
    })
  }
})