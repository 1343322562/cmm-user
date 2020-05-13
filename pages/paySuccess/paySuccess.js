Page({
  data: {
    payType:''
  },
  goIndex () {
    wx.switchTab({
      url: '/pages/t_goods/t_goods'
    })
  },
  goDetails () {
    wx.redirectTo({
      url: '/pages/ordersDetails/ordersDetails?openType=pay&sheetNo=' + this.orderNo,
    })
  },
  onLoad (opt) {
    this.orderNo = opt.orderNo
    this.setData({ payType: opt.payType})
  }
})