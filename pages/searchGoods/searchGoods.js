// pages/searchGoods/searchGoods.js
import API from '../../api/index.js'
import * as types from '../../store/types.js'
import dispatch from '../../store/actions.js'
import { goTabBar } from '../../tool/index.js'

import {
  getTime,
  deepCopy,
  getRemainTime,
  showLoading,
  hideLoading,
  goPage,
  alert,
  pxToRpx,
  toast
} from '../../tool/index.js'
import {
  ShoppingCartGoods
} from '../../tool/shoppingCart.js'
let shoppingCart = new ShoppingCartGoods(); //实例化类
const headHeight = pxToRpx(getApp().globalData.statusBarHeight)
Page({

  /**
   * 页面的初始数据
   */
  data: {
    someData: {
      statusBarHeight: getApp().globalData.statusBarHeight,
      titleBarHeight: getApp().globalData.titleBarHeight
    },
    headHeight: headHeight,
    cartGoods: [], //购物所有商品
    goodsList: [], //所有商品
    orderByField: '',
    orderBy: '',
    itemName: '',
    indexNum: 1,
    itemClsno: '',
    itemClsName: '',
    cartNum: 0,
    searchLoading: false,
    imgV: '?v=' + new Date().getTime(),
    allPromotionGoods: {},
    isLoadingAllGoods: false,
    pageLoading: false,
    pageType:'0', // 0 搜索 1 列表
    hostKey:[],
    historyKey:[],
    recommendGoods:[]
  },
  clearkey() {
    this.setData({ historyKey: [] })
  },
  backPage() {
    this.setData({ pageType: '0', itemName: '', goodsList: [], pageLoading:false})
  },
  selectedKey(e) {
    this.searchText = e.currentTarget.dataset.key
    this.searchResult()
  },
  onLoad: function(options) {
    this.itemClsno = options.itemClsno || ''
    this.itemClsName = options.itemClsName || ''
    const {
      openId,
      imgBaseUrl,
      sysCode,
      colonelId,
      dcId,
      userId
    } = getApp().data
    this.openId = openId
    this.sysCode = sysCode
    this.dcId = dcId
    this.colonelId = colonelId
    this.userId = userId
    const historyKey = wx.getStorageSync('historyKey') || []
    this.setData({
      imgBaseUrl,
      historyKey,
      itemClsName: this.itemClsName,
      itemClsno: this.itemClsno
    })
    this.getProductSearch()
    this.getRecommendGoods()
  },
  getRecommendGoods () {
    API.Public.getOrderProductStatistics({
      data: { userId: this.userId, sysCode: this.sysCode },
      success: ret => {
        if (ret.status == 200) {
          let recommendGoods = ret.data || []
          this.setData({ recommendGoods })
        }
      }
    })
  },
  getProductSearch () {
    API.Public.getProductSearch({
      data:{
        userId: this.userId,
        dcId: this.dcId
      },
      success: ret => {
        if (ret.status==200) {
          const hostKey = ret.data||[]
          this.setData({ hostKey})
        }
      }
    })
  },
  onShow: function() {
    this.setData({
      cartNum: shoppingCart.getGoodsCount()
    })
    this.refreshData();
    // if (!this.data.goodsList||this.data.goodsList.length==0) {
    //   this.getItemListPager()
    // }
    dispatch[types.GET_ALL_SECKILL_GOODS]({
      success: allPromotionGoods => {
        this.setData({ allPromotionGoods })
      }
    })
    //this.getItemListPager();
  },
  onReachBottom: function() {
    const { searchLoading, isLoadingAllGoods } = this.data
    if (!searchLoading && !isLoadingAllGoods) {
      this.setData({ searchLoading: true })
      this.getItemListPager(true)
    } 
  },
  refreshData() {
    var cartGoods = shoppingCart.getGoodsList();
    this.setData({
      cartGoods: cartGoods
    });
  },
  getItemListPager(types) {
    showLoading('努力加载...')
    let { indexNum, itemName, orderBy, orderByField, historyKey } = this.data
    indexNum = (types ?indexNum : 0) + 1
    if (historyKey.indexOf(itemName) == -1) {
      historyKey.push(itemName)
      this.setData({ historyKey })
      wx.setStorage({ key: 'historyKey', data: historyKey })
    }
    API.Goods.itemListPager({
      data: {
        sysCode: this.sysCode,
        openid: this.openId,
        dcId: this.dcId,
        itemClsno: this.itemClsno,
        orderByField: this.data.orderByField,
        orderBy: this.data.orderBy,
        itemName: this.data.itemName,
        indexNum: indexNum,
        queryChild: '1'
      },
      success: (obj) => {
        let goodsList = obj.data || []
        if (obj.status === 200) {
          let list = types ? this.data.goodsList : []
          goodsList.forEach(item => {
            item.itemNowPrice = Number(item.itemNowPrice)
            item.itemDisPrice = Number(item.itemDisPrice)
            item.startQty = Number(item.startQty) || 1
            item.maxSupplyQty = Number(item.maxSupplyQty) || 0
            item.stockNull = !item.maxSupplyQty || item.maxSupplyQty < item.startQty
            list.push(item)
          })
          this.setData({
            goodsList: list,
            indexNum,
            isLoadingAllGoods: goodsList.length == 10 ? false : true
          })
          if (!types && wx.pageScrollTo) wx.pageScrollTo({ scrollTop: 0, duration: 0 })
        } else {
          toast('加载商品失败')
        }
      },
      error: () => {
        toast('加载商品失败!')
      },
      complete: () => {
        hideLoading()
        this.setData({ searchLoading: false, pageLoading: true })
      }
    })
  }, // 点击加入购物

  goBack(e) {
    wx.navigateBack();
  },
  goCart(e) {
    wx.switchTab({
      url: "/pages/carts/carts"
    })
  },

  goGoodsInfo(e) {
    const itemId = e.currentTarget.dataset.itemid
    console.log("商品ID",itemId)
    goPage('goods', {
      itemId: itemId,
      t: 'home'
    })
  },
  onClickOrderBy(e) {

    let key = e.currentTarget.dataset.field;

    if (this.data.orderByField == key && this.data.orderBy == "desc") {
      this.setData({
        orderBy: "asc"
      })
    } else {
      this.setData({
        orderByField: key,
        orderBy: "desc"
      })
    }
    this.getItemListPager();
  },
  confirmSearch(e) {
    const value = e.detail.value.trim()
    this.searchText = value
    this.searchResult()
  },
  searchInputBlur(e) {
    const value = e.detail.value.trim()
    if (value == this.searchText) return
    this.searchText = value
    this.searchResult()
  },
  searchResult () {
    if (!this.searchText)return
    this.data.indexNum = 1
    this.setData({ goodsList: [], itemName: this.searchText, pageType:'1' });

    this.getItemListPager();
  },
  // 点击加入购物车
  addCarts(e) {
    const itemId = e.currentTarget.dataset.itemid;
    let goods = shoppingCart.convertGoodsList(this.data.goodsList)[itemId];
    var cartGoods = shoppingCart.addGoods(goods);
    this.setData({ cartGoods: cartGoods });
    this.setData({
      cartNum: shoppingCart.getGoodsCount()
    })
  },
  goIndexPage(e) {
    goTabBar('index')
  }

})