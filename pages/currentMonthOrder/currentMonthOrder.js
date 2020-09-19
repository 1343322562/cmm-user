import API from '../../api/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startDate: '',
    endDate: '',
    searchValue: '',
    type: '' // 1：在途订单  2：到货订单  3：退货订单
  },

  bindValue(e) {
    var { value } = e.detail
    this.setData({ searchValue: value })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { startDate, endDate, type , name } = options
    wx.setNavigationBarTitle({
      title: name,
    })

    this.setData({ startDate, endDate, type })
    this.getOrderData(startDate, endDate, type)
    console.log({ startDate, endDate, type , name })
  },

  getOrderData(startDate, endDate, type) {
    const { branchNo, token, username, platform } = wx.getStorageSync('userObj')
    API.Orders.sheetSearch({
      data: { branchNo, token, username, platform, startDate, endDate, type },
      success(res) {
        console.log(res)
      }
    })
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