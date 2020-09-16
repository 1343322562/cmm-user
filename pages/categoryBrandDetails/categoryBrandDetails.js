import API from '../../api/index.js'
import { ShoppingCartGoods } from '../../tool/shoppingCart.js'
import { deepCopy, showLoading, hideLoading, goPage, alert, toast } from '../../tool/index.js'
let shoppingCart = new ShoppingCartGoods();//实例化类
import * as types from '../../store/types.js'
import dispatch from '../../store/actions.js'
Page({
  data: {
    list: [],
    pageLoading: false,
    imgV: '?v=' + new Date().getTime(),
    allPromotionGoods:{}
  },
  goGoodsDetails(e) {
    const itemId = e.currentTarget.dataset.no
    goPage('goods', { itemId: itemId, t: 'home' })
  },
  // 点击加入购物车
  addCarts(e) {
    const index = e.currentTarget.dataset.index;
    let goods = this.data.list[index];
    var cartGoods = shoppingCart.addGoods(goods, () => {
      wx.hideToast()
      toast('加入购物车成功')
    });
  
  },
  getPageData ({id}) {
    API.Index.getMainPushDetail({
      data:{
        id,
        dcId: this.dcId
      },
      success: ret => {
        const data= ret.data || []
        if (ret.status == 200 && data.length) {
          const obj = data[0]
          wx.setNavigationBarTitle({
            title: obj.mainName
          })
          let list = obj.itemList
          list.forEach(item=>{
            item.startQty = Number(item.startQty) || 1
            item.maxSupplyQty = Number(item.maxSupplyQty) || 0
            item.stockNull = !item.maxSupplyQty || item.maxSupplyQty < item.startQty
            item.itemNowPrice = Number(item.itemNowPrice)
          })
          this.setData({list})
        } else {
          alert(ret.msg||'获取活动信息失败')
        }
      },
      complete: () => {
        this.setData({ pageLoading: true})
      }
    })
  },
  onLoad (opt) {
    this.dcId = getApp().data.dcId;
    this.getPageData(opt)
  },
  onShow () {
    dispatch[types.GET_ALL_SECKILL_GOODS]({
      success: allPromotionGoods => {
        this.setData({ allPromotionGoods })
      }
    })
  }
})