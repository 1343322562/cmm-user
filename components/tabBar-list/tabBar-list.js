import API from '../../api/index.js'
import { getTime, deepCopy, getRemainTime, showLoading, hideLoading, goPage, alert, toast, downRefreshVerify, pxToRpx } from '../../tool/index.js'
import {
  ShoppingCartGoods
} from '../../tool/shoppingCart.js'
let shoppingCart = new ShoppingCartGoods(); //实例化类
import UserBusiness from '../../tool/userBusiness.js'
import * as types from '../../store/types.js'
import dispatch from '../../store/actions.js'
const headHeight = pxToRpx(getApp().globalData.statusBarHeight) || 50
Component({

  properties: {

  },
  data: {
    headHeight: headHeight,
    windowWidth: getApp().globalData.windowWidth,
    windowHeight: getApp().globalData.windowHeight,
    selectFatherClsNo: "F",
    selectFatherClsNo2: null,
    categoryList: [],
    categoryList2: [],
    orderByField: 'shelf.updated',
    orderBy: 'desc',
    indexNum: 0,
    pageLoading: false,
    goodsList: [],
    isLoadingAllGoods: false,
    isLoading: false,
    allPromotionGoods: {},
    imgV: '?v=' + new Date().getTime(),
    toView: "",
    playGoodsList: [],
    upClsObj:null,
  },
  methods: {
    goSearchGoods(e) {
      goPage('searchGoods')
    },
    getPageData () {
      const { openId, imgBaseUrl, sysCode, colonelId, dcId,itemClsno } = getApp().data
      const {goodsList,selectFatherClsNo} = this.data
      if (dcId != this.dcId) { // 更换了配送中心
        this.setData({ selectFatherClsNo: "F", selectFatherClsNo2: null })
      } else {
      }
      if (itemClsno && selectFatherClsNo != 'F') {
        this.pageLoadingTime = +new Date() - (1000*60*6)
        this.playLoading = null
        this.clsLoading = null
        this.setData({ selectFatherClsNo: 'F', selectFatherClsNo2: null })
      }
      this.baseitemClsno = itemClsno
      this.openId = openId
      this.sysCode = sysCode
      this.colonelId = colonelId
      this.dcId = dcId
      shoppingCart.setCartCount()
      var cartGoods = shoppingCart.getGoodsList();
      this.setData({ imgBaseUrl, cartGoods })
      const pageLoadingTime = this.pageLoadingTime
      if (pageLoadingTime || !goodsList.length) {
        const now = +new Date()
        const time = now - pageLoadingTime
        if ((time > (1000*60*5)) || !pageLoadingTime) {
          this.pageLoadingTime = now
          this.getCategoryList()
          this.getPlayGoods()
        }
      } else {
        this.pageLoadingTime = +new Date()
      }
      dispatch[types.GET_ALL_SECKILL_GOODS]({
        success: allPromotionGoods => {
          this.setData({ allPromotionGoods })
        }
      })
    },
    onShow () {
      const {openId} = getApp().data
      if (openId) {
        this.getPageData()
      } else {
        UserBusiness.wxLogin(this, getApp().data.colonelId,  ()=>{
          this.getPageData()
        });
      }
    },
    onPullDownRefresh() {
      downRefreshVerify(this.getItemListPager.bind(this), this)
    },
    onReachBottom(e) {
      const { isLoading, isLoadingAllGoods } = this.data
      if (!isLoading && !isLoadingAllGoods) {
        this.setData({ isLoading: !isLoading })
        this.getItemListPager(true)
      }
    },
    goIndexPage(e) {
      this.triggerEvent('changePage', 'index')
    },
    onClickRightCls(e) {
      const clsNo = e.currentTarget.dataset.clsno

      const clsname = e.currentTarget.dataset.clsname

      goPage('searchGoods', { itemClsno: clsNo, itemClsName: clsname, t: 'goodsCls' })
    },
    onClickLeftCls(e) {
      this.data.selectFatherClsNo2 = null
      let clsno = e.currentTarget.dataset.clsno;
      this.setData({ selectFatherClsNo: clsno });
      let toindex = -1
      let index = e.currentTarget.dataset.index

      toindex = index - 2
      toindex = toindex < 0 ? 0 : toindex

      if (toindex != -1) {
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
          playGoodsList.forEach(goods => {
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
    loadClsGoods() {
      let { playGoodsList, categoryList } = this.data
      if (this.playLoading && this.clsLoading && playGoodsList.length) {
        if (categoryList[0].clsNo != 'play') {
          categoryList.unshift({
            clsNo: 'play',
            clsName: '吃喝玩乐',
            imgName: 'https://zksrimg.oss-cn-beijing.aliyuncs.com/images/cmm/play-cls-icon.png'
          })
        }
        let obj = {
          categoryList,
        }
        console.log(`baseitemClsno:${this.baseitemClsno}`)
        if (this.baseitemClsno) {
          this.baseitemClsno = null
        } else {
          obj.selectFatherClsNo = 'play'
          obj.toView = 'toView'
        }
        this.setData(obj)
      }
    },
    touchstart (e) {
      const clientY = e.changedTouches[0] && e.changedTouches[0].clientY
      this.upClientY = clientY
    },
    touchend(e) {
      const { upClsObj, isLoadingAllGoods} = this.data
      const clientY = e.changedTouches[0] && e.changedTouches[0].clientY
      if (upClsObj && isLoadingAllGoods && ((this.upClientY - clientY) > 50)) {

        
        wx.createSelectorQuery().select('#tabBarBox').boundingClientRect(ret => {
          this.createSelectorQuery().select('#pullUp').boundingClientRect(res => {
            const IS = ((res.top+res.height-ret.top) <= 0)
            if (!this.pageScrollTop || (this.upload && IS)) {
              e.currentTarget.dataset.clsno
              let data = { currentTarget: { dataset: { clsno: upClsObj.no, index: upClsObj.index } } }
              this.setData({ upClsObj: null })
              this[upClsObj.level == 'A' ? 'onClickLeftCls' : 'onClickLeftCls2'](data)
              this.upload = false
            } else if (IS) {
              setTimeout(()=>{
                this.upload = true
              },800)
            }

          }).exec()

        }).exec()
       
      } else {
        this.upload = false
      }
    },
    setUpCls () {
      const { selectFatherClsNo2, selectFatherClsNo, categoryList, categoryList2 } = this.data
      let i, i2, upClsObj = null;
      categoryList.forEach((item,index) => {
        if (selectFatherClsNo == item.clsNo) i= index+1
      })
      categoryList2.forEach((item, index) => {
        if (selectFatherClsNo2 == item.clsNo) i2 = index+1
      })
      if (categoryList2.length == i2) { // 最后二级类别
        if (categoryList.length != i) { // 最后一级类别
          const item = categoryList[i]
          upClsObj = {
            name: item.clsName,
            no: item.clsNo,
            level: "A",
            index: i-1
          }
          
        } else {
          console.log('最后一个类别了')
        }
      } else {
        const item = categoryList2[i2]
        upClsObj = {
          name: item.clsName,
          no: item.clsNo,
          level:"B",
          index: i2 - 1
        }
      }
      this.setData({ upClsObj })
    },
    getItemListPager(types) {
      showLoading('努力加载...')
      let indexNum = (types ? this.data.indexNum : 0) + 1
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

            let list = types ? this.data.goodsList : []
            goodsList.forEach(item => {
              item.itemNowPrice = Number(item.itemNowPrice)
              item.startQty = Number(item.startQty) || 1
              item.maxSupplyQty = Number(item.maxSupplyQty) || 0
              item.stockNull = !item.maxSupplyQty || item.maxSupplyQty < item.startQty
              item.itemDisPrice = Number(item.itemDisPrice)
              list.push(item)
            })
            !types && this.setUpCls()
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
          this.setData({ pageLoading: true, isLoading: false })
          this.pageLoadingTime = +new Date()
        }
      })
    },
    addCarts2(e) {
      const itemId = e.currentTarget.dataset.itemid
      goPage('goods', {
        itemId: itemId,
        t: 'home'
      })
    },
    onHide(){},
    onPageScroll (e) {
      this.pageScrollTop = e.scrollTop
    },
    // 点击加入购物车
    addCarts(e) {
      const itemId = e.currentTarget.dataset.itemid;
      let goods = shoppingCart.convertGoodsList(this.data.goodsList)[itemId];
      var cartGoods = shoppingCart.addGoods(goods);
      this.setData({ cartGoods: cartGoods });
      this.triggerEvent('getCartsNum')
    },
    onClickLeftCls2(e) {

      let clsno = e.currentTarget.dataset.clsno;
      this.setData({ selectFatherClsNo2: clsno });
      this.getItemListPager();
    },
    getCategoryList() {
      const { selectFatherClsNo } = this.data
      let {itemClsno} = getApp().data
      if (selectFatherClsNo == 'play'&&!itemClsno) {
        return
      }
      showLoading('努力加载...')
      API.Index.clsList({
        data: {
          sysCode: this.sysCode,
          openid: this.openId,
          fatherClsNo: selectFatherClsNo,
          dcId: this.dcId
        },
        success: (obj) => {
          let categoryList = obj.data || []
          if (obj.status === 200) {
            if (selectFatherClsNo == "F") {
              let selectTopCls = categoryList[0].clsNo
              if (itemClsno) {
                selectTopCls = itemClsno
                getApp().data.itemClsno = null
              }
              this.setData({ selectFatherClsNo: selectTopCls, categoryList: categoryList, toView: "index_" + selectTopCls })
              this.getCategoryList();
            } else {


              if (categoryList && categoryList.length > 0) {
                if (!this.data.selectFatherClsNo2) {
                  this.data.selectFatherClsNo2 = categoryList[0].clsNo
                }
              }
              this.setData({ selectFatherClsNo2: this.data.selectFatherClsNo2, categoryList2: categoryList })
              this.getItemListPager();
            }

          }
        },
        error: () => { },
        complete: () => {
          hideLoading()
          if (selectFatherClsNo == 'F') {
            this.clsLoading = true
            this.loadClsGoods()
          }
        }
      })
    }

  }
})
