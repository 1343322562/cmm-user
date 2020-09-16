import API from '../../../api/index.js'
import { ShoppingCartGoods } from '../../../tool/shoppingCart.js'
import { deepCopy, showLoading, hideLoading, goPage, alert, toast,setUrlObj } from '../../../tool/index.js'
let shoppingCart = new ShoppingCartGoods();//实例化类
import UserBusiness from '../../../tool/userBusiness.js'
import * as types from '../../../store/types.js'
import dispatch from '../../../store/actions.js'
Page({
  data: {
    list: [],
    banner: [],
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
    API.Index.getActivityGoodsList({
      data:{
        activityId:this.activityId,
        dcId: this.dcId
      },
      success: ret => {
        const obj = ret.data
        if (ret.status == 200 && obj) {
          
          wx.setNavigationBarTitle({
            title: obj.activityName
          })
          let list = obj.productShelfList
          let banner = obj.pictureRataList
          list.forEach(item=>{
            item.startQty = Number(item.startQty) || 1
            item.maxSupplyQty = Number(item.maxSupplyQty) || 0
            item.stockNull = !item.maxSupplyQty || item.maxSupplyQty < item.startQty
            item.itemNowPrice = Number(item.itemNowPrice)
            item.itemId = item.id
          })
          this.setData({list,banner})
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
    console.log('banner参数', opt)
    let load = ()=> {
      this.activityId = opt.id
      this.dcId = getApp().data.dcId;
      console.log(opt)
      this.getPageData(opt)
    }
    if (opt.scene) {
      opt = setUrlObj(decodeURIComponent(opt.scene))
      UserBusiness.wxLogin(this, getApp().data.colonelId,  ()=>{
        load()
        this.getPromotionGoods()
      });
    } else {
      load()
    }
  },
  getPromotionGoods () {
    dispatch[types.GET_ALL_SECKILL_GOODS]({
      success: allPromotionGoods => {
        this.setData({ allPromotionGoods })
      }
    })
  },
  onShow (opt) {
    const {openId} = getApp().data
    openId && this.getPromotionGoods()
  }
})