// pages/posCarts/posCarts.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    pageType: 1, // 1: 购物车  2：结算结果
    switchPayWayTransition: { // 切换支付方式框过度效果
      height: 0,
    },
    payWayList: [
      { type: 1, img: '../../images/balance_pay.png', name: '余额支付', checkout: { value: 'balance', checked: false } },
      { type: 2, img: '../../images/w_pay.png', name: '微信支付', checkout: { value: 'wx', checked: true } }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('这是参数1', options.q)
  },
  confirmClick() {
    this.setData({ pageType: 2 })
  },
  checkChangeClick(e) {
    const { index } = e.currentTarget.dataset
    const { payWayList } = this.data
    if(payWayList[index].checkout.checked) return
    payWayList.forEach(item => {
      item.checkout.checked = false
    })
    payWayList[index].checkout.checked = true
    this.setData({ payWayList })
  },

  // 显示 switch pay way 框
  switchPayWayDialogClick() {
    const { switchPayWayTransition } = this.data
    if (switchPayWayTransition.height == 'auto') return 
    switchPayWayTransition.height = '300rpx'
    this.setData({ switchPayWayTransition })
  },
  
  // 隐藏 switch pay way 框
  hideSwitchPayWayDialogClick() {
    const { switchPayWayTransition } = this.data
    if (switchPayWayTransition.height == 0) return 
    switchPayWayTransition.height = '0'
    this.setData({ switchPayWayTransition })
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