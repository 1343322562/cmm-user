import { goPage, toast, alert, pxToRpx } from '../../tool/index.js'
import { ShoppingCartGoods } from '../../tool/shoppingCart.js'
let shoppingCart = new ShoppingCartGoods();//实例化类
const headHeight = pxToRpx(getApp().globalData.statusBarHeight)
Component({
  properties: {
  },
  data: {
    cartsNum: 0,
    headHeight: headHeight
  },
  methods: {
    refreshPage() {
      let count = shoppingCart.getGoodsCount();
      this.setData({ cartsNum: count })
      this.selectComponent("#homeCarts").loadData();
      this.triggerEvent('getCartsNum')
    },
    onShow() {
      const { openId, imgBaseUrl, storeId, userInfo } = getApp().data
      this.openId = openId
      this.storeId = storeId
      this.setData({ imgBaseUrl })
      let count = shoppingCart.getGoodsCount();
      this.setData({ cartsNum: count })
      if (count && count > 0) this.refreshPage()
      this.selectComponent("#recommendGoods").getPageData();
      this.triggerEvent('setNavTitle')
    },
    onHide () {
    },
    onUnload () {
    },
    onPullDownRefresh () {
    },
    onReachBottom () {
    },
    goLiquidation(e) {
      goPage('liquidation', {
        select: e.detail
      })
    },
    goIndexPage(e) {
      this.triggerEvent('changePage', 'index')
    },
    getCartsNum() {
      this.setData({ cartsNum: shoppingCart.getGoodsCount() })
      this.triggerEvent('getCartsNum')
    }
  }
})
