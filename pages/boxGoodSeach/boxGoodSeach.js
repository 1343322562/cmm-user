import API from '../../api/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchText: '', // 搜索的文本
    focus: false, // 控制 input 的 focus
    shopName: '店家名称',
    // 商品属性列表
    goodPropsList: {
      dcBranchName: "长沙便利店",
      itemName: "好益多230乳酸菌饮品好益多230乳酸菌饮品好益多230乳酸菌饮品好益多230乳酸菌饮品",
      sheetNo: "YH1804031148047617",
      unitNo: "7",
      checkQty: 50.000000,
      unitName: "瓶",
      boxNo: "1008611",
      itemRem: "hyd230rsjyp",
      validDay: 210.00,
      itemSubno: "6925982180769",
      itemNo: "110056",
      itemSize: "230ml*18"
    }
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