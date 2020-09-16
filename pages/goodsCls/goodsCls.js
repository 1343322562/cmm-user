// pages/goodsCls/goodsCls.js
import API from '../../api/index.js'
import { getTime, deepCopy, getRemainTime, showLoading, hideLoading, goPage, alert, toast, downRefreshVerify, pxToRpx} from '../../tool/index.js'
import {
  ShoppingCartGoods
} from '../../tool/shoppingCart.js'
let shoppingCart = new ShoppingCartGoods(); //实例化类
import * as types from '../../store/types.js'
import dispatch from '../../store/actions.js'
const headHeight = pxToRpx(getApp().globalData.statusBarHeight)||50
Page({
  /**
   * 页面的初始数据
   */
  data: {
    headHeight: headHeight,
    windowWidth:getApp().globalData.windowWidth,
    windowHeight:getApp().globalData.windowHeight,
    selectFatherClsNo:"F",
    selectFatherClsNo2:null,
    categoryList:[],
    categoryList2:[],
    orderByField: 'shelf.updated',
    orderBy: 'desc',
    indexNum:  0,
    pageLoading: false,
    goodsList:[],
    isLoadingAllGoods: false,
    isLoading:false,
    allPromotionGoods:{},
    imgV: '?v=' + new Date().getTime(),
    toView:"",
    playGoodsList:[]
  },
  goSearchGoods(e) {
    goPage('searchGoods', { t: 'home' })
  },
  onShow: function (options) {
  
    //是否切换了配送中心

    if (getApp().data.dcId != this.data.dcId)
    {
       this.setData({ selectFatherClsNo: "F", selectFatherClsNo2: null })
    }

    if (getApp().globalData.itemClsno && this.data.selectFatherClsNo!="F") 
    {
      this.setData({ selectFatherClsNo: "F", selectFatherClsNo2:null})
        console.log("进入F")
    }

    const { openId, imgBaseUrl, sysCode, colonelId, dcId } = getApp().data
    this.openId = openId
    this.sysCode = sysCode
    this.colonelId = colonelId
    this.dcId = dcId
    this.data.dcId=dcId
    this.setData({ imgBaseUrl })
    this.getPlayGoods()
    this.getCategoryList()
    
    dispatch[types.GET_ALL_SECKILL_GOODS]({
      success: allPromotionGoods => {
        this.setData({ allPromotionGoods })
      }
    })
    shoppingCart.setCartCount()
    var cartGoods = shoppingCart.getGoodsList();
    this.setData({
      cartGoods: cartGoods
    });

  },
  
  onPullDownRefresh () {
    downRefreshVerify(this.getItemListPager, this)
  },
  onReachBottom () {
    const { isLoading, isLoadingAllGoods } = this.data
    if (!isLoading && !isLoadingAllGoods) {
      this.setData({ isLoading: !isLoading})
      this.getItemListPager(true)
    }
  },
  
  goIndexPage(e){
    wx.switchTab({
      url: "/pages/home/home"
    })
  },
  onClickRightCls(e) {
    const clsNo = e.currentTarget.dataset.clsno
    
    const clsname = e.currentTarget.dataset.clsname
    
    goPage('searchGoods', { itemClsno: clsNo, itemClsName: clsname, t: 'goodsCls' })
  },
  onClickLeftCls(e){
    this.data.selectFatherClsNo2=null
    let clsno = e.currentTarget.dataset.clsno;
    this.setData({selectFatherClsNo: clsno});
    let toindex = -1
    let index = e.currentTarget.dataset.index
  
    toindex = index-2
    toindex = toindex < 0 ? 0 : toindex
 
    if(toindex!=-1){
      this.setData({ toView: 'index_' + this.data.categoryList[toindex].clsNo })
    }
    this.getCategoryList();
  },
  getPlayGoods() {
    API.Play.itemListPage({
      data: {
        sysCode: this.sysCode,
        dcId: this.dcId,
        // indexNum:1
      },
      success: ret => {
        let playGoodsList = ret.data || []
        playGoodsList.forEach(goods=> {
          if (goods.itemThumbPic) {
            goods.imgUrl = goods.itemThumbPic.split(',')[0]
          }
        })
        this.setData({ playGoodsList })
      },
      complete: () => {
        this.playLoading = true
        this.loadClsGoods()
      }
    })
  },
  goPlayGoodsDetails(e) {
    const { playGoodsList } = this.data
    const { index } = e.currentTarget.dataset
    goPage(['eatDrinkPlayHappy', 'goodsDetails'], {
      itemNo: playGoodsList[index].id
    })
  },
  loadClsGoods () {
    let { playGoodsList, categoryList } = this.data
    if (this.playLoading && this.clsLoading && playGoodsList.length) {
      if (categoryList[0].clsNo!='play') {
        categoryList.unshift({
          clsNo: 'play',
          clsName: '吃喝玩乐',
          imgName: 'https://zksrimg.oss-cn-beijing.aliyuncs.com/images/cmm/play-cls-icon.png'
        })
      }
      
      this.setData({
        categoryList,
        selectFatherClsNo: 'play',
        toView: 'index_play'
      })
    }
  },
  getItemListPager(types) {
    showLoading('努力加载...')
    let indexNum = (types ? this.data.indexNum : 0)+1
    API.Goods.itemListPager({
      data: {
        sysCode: this.sysCode,
        openid: this.openId,
        dcId: this.dcId,
        itemClsno: this.data.selectFatherClsNo2,
        orderByField: this.data.orderByField,
        orderBy: this.data.orderBy,
        itemName: '',
        indexNum: indexNum,
        queryChild: '0'
      },
      success: (obj) => {
        let goodsList = obj.data || []
        if (obj.status === 200) {
          
          let list = types? this.data.goodsList:[]
          goodsList.forEach(item => {
            item.itemNowPrice = Number(item.itemNowPrice)
            item.startQty = Number(item.startQty)||1
            item.maxSupplyQty = Number(item.maxSupplyQty)||0
            item.stockNull = !item.maxSupplyQty || item.maxSupplyQty < item.startQty
            item.itemDisPrice = Number(item.itemDisPrice)
            list.push(item)
          })
          this.setData({
            goodsList: list,
            indexNum,
            isLoadingAllGoods: goodsList.length==10?false:true
          })
          if (!types && wx.pageScrollTo) wx.pageScrollTo({scrollTop: 0,duration: 0})
          
        } else {
          toast('加载商品失败')
        }
      },
      error: () => {
        toast('加载商品失败!')
      },
      complete: () => {
        hideLoading()
        this.setData({ pageLoading: true, isLoading:false})
      }
    })
  },
  addCarts2(e) {
    const itemId = e.currentTarget.dataset.itemid
    console.log(itemId)
    goPage('goods', {
      itemId: itemId,
      t: 'home'
    })
  },
  // 点击加入购物车
  addCarts(e) {
    const itemId = e.currentTarget.dataset.itemid;
    let goods = shoppingCart.convertGoodsList(this.data.goodsList)[itemId];
    var cartGoods = shoppingCart.addGoods(goods);
    this.setData({ cartGoods: cartGoods });
  },
  onClickLeftCls2(e) {

    let clsno = e.currentTarget.dataset.clsno;
    this.setData({ selectFatherClsNo2: clsno });
    this.getItemListPager();
  },
  getCategoryList() {
    const { selectFatherClsNo } = this.data
    if (selectFatherClsNo=='play') {
      return
    }
    showLoading('努力加载...')
    API.Index.clsList({
      data: {
        sysCode: this.sysCode,
        openid: this.openId,
        fatherClsNo: selectFatherClsNo,
        dcId:this.dcId,
        sysCode:this.sysCode
      },
      success: (obj) => {
        let categoryList = obj.data || []
        if (obj.status === 200) {
          if (selectFatherClsNo=="F"){
            let selectTopCls = categoryList[0].clsNo
            if (getApp().globalData.itemClsno) {
              selectTopCls = getApp().globalData.itemClsno
              getApp().globalData.itemClsno = null
            }
            console.log('类别:'+selectTopCls)
            this.setData({ selectFatherClsNo: selectTopCls, categoryList: categoryList, toView: "index_" + selectTopCls })
            this.getCategoryList();
          }else{
  
          
            if (categoryList && categoryList.length>0){
              if (!this.data.selectFatherClsNo2){
                this.data.selectFatherClsNo2= categoryList[0].clsNo
              }
            }
            this.setData({ selectFatherClsNo2: this.data.selectFatherClsNo2,categoryList2: categoryList })
            this.getItemListPager();
          }
          
        }
      },
      error: () => { },
      complete:()=>{
        hideLoading()
        if (selectFatherClsNo == 'F') {
          this.clsLoading = true
          this.loadClsGoods()
        }
      }
    })
  }
})