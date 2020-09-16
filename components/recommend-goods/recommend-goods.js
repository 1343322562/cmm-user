import API from '../../api/index.js'
import { ShoppingCartGoods } from '../../tool/shoppingCart.js'
import { toast, alert, goPage } from '../../tool/index.js'
let shoppingCart = new ShoppingCartGoods();//实例化类
Component({
  properties: {
  },
  data: {
    list:[]
  },
  attached () {
    // this.getPageData()
  },
  methods: {
    goGoodsDetails (e) {
      const itemId = e.currentTarget.dataset.no
      goPage('goods', { itemId: itemId, t: 'home' })
    },
    getPageData () {
      const { userId, sysCode } = getApp().data
      API.Public.getOrderProductStatistics({
        data: { userId, sysCode},
        success:ret => {
          if(ret.status ==200) {
            let list = ret.data||[]
            list.forEach(item=>{
              item.itemNowPrice = Number(item.itemNowPrice)
              item.startQty = Number(item.startQty) || 1
              item.maxSupplyQty = Number(item.maxSupplyQty) || 0
              item.stockNull = !item.maxSupplyQty || item.maxSupplyQty < item.startQty
            })
            this.setData({list})
          }
        }
      })
    },
    
    addCarts (e) {
      let goods = this.data.list[e.currentTarget.dataset.index]
      goods.itemId = goods.id
      goods.itemThumbPic = goods.itemHomePic
      var cartGoods = shoppingCart.addGoods(goods, () => {
        wx.hideToast()
        wx.showToast({
          title: '加入购物车成功'
        })
        this.triggerEvent('refreshPage')
      });
    }
  }
})
