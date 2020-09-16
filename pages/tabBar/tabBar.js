import { goPage, setShareAppMessage } from '../../tool/index.js'
import API from '../../api/index.js'
import { ShoppingCartGoods } from '../../tool/shoppingCart.js'
let shoppingCart = new ShoppingCartGoods();//实例化类
Page({
  data: {
    btuBottom:0,
    tabBar: [
      { name: '首页', icon: '1-001.png', selectedIcon:'1-002.png', class:'item', open:false,id:"index",show:true},
      { name: '全部商品', icon: '2-001.png', selectedIcon: '2-002.png', class: 'item', open: false, id: "list", show: true},
      { name: '成为团长', icon: 'tabBar_colonel_icon.png', class: 'goColonel', open: true, id: "colonelApply", show: false},
      { name: '购物车', icon: '3-001.png', selectedIcon: '3-002.png', class: 'item', open: false, id: "carts", show: true},
      { name: '我的', icon: '4-001.png', selectedIcon: '4-002.png', class: 'item', open: false, id: "my", show: true},
    ],
    selected: '',
    userIsColonel:false,
    cartsNum:0
  },
  getCartsNum () {
    let cartsNum = shoppingCart.getGoodsCount()||0;
    this.setData({ cartsNum })
  },
  select (e) {
    const index = (typeof e == 'number')?e: e.currentTarget.dataset.index
    const { userIsColonel, tabBar } = this.data
    if (!tabBar[index].open) {
      tabBar[index].id!='list' && wx.pageScrollTo({scrollTop: 0,duration:0})
      this.onHide()
      this.setData({ selected: tabBar[index].id })
      this.onShow()
    } else {
      const { userInfo } = getApp().data
      if (tabBar[index].id == 'colonelApply' && !userIsColonel) { //  去团长
        if (userInfo.userPhone) {
          goPage('colonelApply')
        } else {
          goPage('impower', { openType: 'inside' })
        }
      }
    }
  },
  onLoad (opt) {
    let btuBottom = 0
    if (wx.getSystemInfoSync) {
      const res = wx.getSystemInfoSync()
      if (res.model.indexOf('iPhone X')!=-1) btuBottom = "50rpx"
    } else {
      btuBottom="35rpx"
    }
    this.setData({ btuBottom, selected: opt.page||'index'  })
    this.setNavTitle()
  },
  changePage (e) {
    const types = e.detail
    let index=0
    if (types =='list') {
      index = 1
    } else if (types == 'index') {
      index = 0
    }
    this.select(index)
  },
  onReady () {
  },
  getDcInfo(dcId) {
    if (this.loadDcInfo) return
    API.Public.getDcInfo({
      data:{dcId},
      success: ret => {
        const data = ret.data
        if (ret.status == 200 && data) {
          let tabBar = this.data.tabBar
          tabBar[2].show = data.userUpgradeCol== '1'
          this.setData({ tabBar })
          this.loadDcInfo = true
        }
      }
    })
  },
  setNavTitle () {
    let tabBar = this.data.tabBar
    const { userIsColonel,openId,dcId} = getApp().data
    if (openId) {
      tabBar[2].name = userIsColonel ? '去团长端' : '成为团长'
      this.setData({ userIsColonel, tabBar })
    }
    if (dcId) this.getDcInfo(dcId)
  },
  getComponent () {
    const { selected } = this.data
    return this.selectComponent("#" + selected)
  },
  onShow () {
    const component = this.getComponent()
    component.onShow && component.onShow()
    this.getCartsNum()
  },
  onPullDownRefresh () {
    const component = this.getComponent()
    component.onPullDownRefresh && component.onPullDownRefresh()
  },
  onPageScroll (e) {
    const component = this.getComponent()
    component.onPageScroll && component.onPageScroll(e)
  },
  onReachBottom () {
    const component = this.getComponent()
    component.onReachBottom && component.onReachBottom()
  },
  onHide () {
    const component = this.getComponent()
    component.onHide && component.onHide()
  },
  onUnload () {
    this.selectComponent("#index").onUnload()
  },
  onShareAppMessage () {
    return setShareAppMessage({
      title: '生活家 线上批发市场',
      path: '/pages/startupPage/startupPage?openType=share&colonelId=' + getApp().data.colonelId,
      imageUrl: 'https://zksrimg.oss-cn-beijing.aliyuncs.com/images/cmm/hom_share_img.png'

    })
  }
})