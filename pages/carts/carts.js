// pages/carts/carts.js
import { goPage, toast, alert } from '../../tool/index.js'
import { ShoppingCartGoods } from '../../tool/shoppingCart.js'
let shoppingCart = new ShoppingCartGoods();//实例化类
Page({
  data: {
    cartsNum:0
  },
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
  refreshPage () {
    let count = shoppingCart.getGoodsCount();
    this.setData({ cartsNum: count })
    this.selectComponent("#homeCarts").loadData();
  },
  onShow () {

    const { openId, imgBaseUrl, storeId, userInfo } = getApp().data
    this.openId = openId
    this.storeId = storeId
    this.setData({ imgBaseUrl })
    
    // if (!userInfo || (!userInfo.userPhone && !userInfo.userPhone)) {
    //   //goPage('impower', { openType: 'inside' })
    //   wx.redirectTo({ url:"/pages/impower/impower"})
    //   return
    // }

    let count = shoppingCart.getGoodsCount();
    this.setData({ cartsNum: count})
    //console.log(this.selectComponent("#homeCarts"));
    if (count && count > 0) this.refreshPage()
    // this.selectComponent("#recommendGoods").getPageData();
    
  },

  onHide: function () {

  },

  onUnload: function () {

  },
  onPullDownRefresh: function () {
  },
  onReachBottom: function () {
  },
  goLiquidation(e) {
    goPage('liquidation', {
      select: e.detail
    })
  },
  goIndexPage(e){
    wx.switchTab({ url: "/pages/home/home" })
  }, 
  getCartsNum(){
    this.setData({ cartsNum: shoppingCart.getGoodsCount() })
  }
})