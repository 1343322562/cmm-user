import API from '../../api/index.js'
import { toast, alert, getGoodsImgSize, getGoodsTag, deepCopy, setParentGoodsCartsObj, goPage, MsAndDrCount} from '../../tool/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderData: [],
    sheetAmt: '', // 总金额
    startDate: '',
    endDate: '',
    searchValue: '',
    type: '' // 1：在途订单  2：到货订单  3：退货订单
  },
  // 确认搜索
  confirm() {
    let { searchValue, orderData } = this.data
    if (searchValue.length != 18) return toast('请输入正确的订单号')
    orderData.forEach(item => {
      if (item.sheetNo == searchValue) {
        orderData = []
        orderData.push(item)
      }
    })
    if (orderData.length == 0) return toast('暂无此订单数据')
    this.setData({ orderData })
  },
  // 绑定搜索框
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
  goOrderDetailClick(e) {
    const sheetNo = e.currentTarget.dataset.no
    const openType = 'list'
    goPage('ordersDetails', { openType, sheetNo })

  },
  getOrderData(startDate, endDate, type) {
    const { branchNo, token, username, platform, dbBranchNo } = wx.getStorageSync('userObj')
    const _this = this
    API.Orders.sheetSearch({
      data: { branchNo, token, username, platform, startDate, endDate, type },
      success(res) {
        console.log(res)
        let orderData = res.data.sheet
        orderData.length && orderData.forEach(item => {
          item.createDate = item.createDate.slice(0, 19)
        })
        _this.setData({ orderData, sheetAmt: res.data.sheetAmt })
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