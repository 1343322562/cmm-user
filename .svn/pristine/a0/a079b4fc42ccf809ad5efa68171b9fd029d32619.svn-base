
Page({
  data: {
    pageType: "",/* 1 成功 2 失败*/
  },
  openPage: function () {
    let type = this.data.pageType
    if (type == '1') {
      console.log(this.openType)
      wx.navigateBack({data: 1});
    } else {
      wx.redirectTo({
        url: '/pages/groupBuying/GB_ordersDetails/GB_ordersDetails?openType=pay&sheetNo=' + this.sheetNo
      })
    }
  },
  onLoad (opt) {
    this.setData({ pageType: opt.pageType})
    this.sheetNo = opt.sheetNo
    this.openType = opt.openType
  }
})