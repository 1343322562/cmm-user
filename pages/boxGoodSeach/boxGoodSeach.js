import API from '../../api/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchText: '', // 搜索的文本
    focus: false, // 控制 input 的 focus
    shopName: '店家名称',
    expressNum: 'YH158736215574863600064',
    goodTitle: '康师傅康师傅康师傅康师傅康师康师傅康师傅傅康师傅康师傅康师傅康师傅sdfsdfdfsdfs',
    goodProps: ['230ml * 1a8 瓶', '230mla * 18 asd瓶', '230ml * 180 瓶']
  },
  // 点击图标，触发 input 的 focus。
  focusInput() {
    this.setData({
      focus: true
    })
  },
  // 搜索箱码
  seachBoxCode (e) {
    console.log(e)
    let boxCode = e.detail.value
    console.log("sT:", e.detail.value)
    this.setData({
      searchText: boxCode
    })

// 目前还没有可以搜到商品信息的箱码
    // API.Public.findByBoxNo({
    //   
    //   data: { boxNo: boxCode },
    //   success: res => {
    //     console.log(res)
    //   }
    // })
  },
  // 用户阅读商品信息完毕，关闭弹窗
  readEnd () {
    this.setData({
      searchText : ''
    })
  },
  // 调用微信扫码,获取箱码
  openScanCode () {
    wx.scanCode({
      success (res) {
        // 1. 从 res 获取 箱码 boxCode
        // 2. 将 boxCode 设置为 seachText
        // 3. 调用 seachBoxCode 方法
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})