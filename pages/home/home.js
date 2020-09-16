
import API from '../../api/index.js'
import { ShoppingCartGoods} from '../../tool/shoppingCart.js'
import { getTime, deepCopy, getRemainTime, showLoading, hideLoading, goPage, alert, toast, setUrl, pxToRpx, rpxToPx, downRefreshVerify, setCheckText, formatTime, setShareAppMessage} from '../../tool/index.js'
import UserBusiness from '../../tool/userBusiness.js'
let shoppingCart = new ShoppingCartGoods();//实例化类
import * as types from '../../store/types.js'
import dispatch from '../../store/actions.js'
const app = getApp()
Page({
  data: {
    someData: {
      statusBarHeight: app.globalData.statusBarHeight,
      titleBarHeight: app.globalData.titleBarHeight
    },
    height0: 50,
    cartGoods:[], //购物所有商品
    ZZZTGoodsList:[],
    LBZTGoodsList:[],
    goodsAll:[], //所有商品
    indicatorDots: true,
    vertical: false,
    activityList:[],
    storePromotion:{},
    storePromotionTime:[],
    autoplay: true,
    interval: 6000,
    duration: 1500,
    showShare: false,
    createShare: false,
    headAction:false,
    categoryBrandList: [],
    couponList:[],
    couponListHeight:1,
    paginationSpotLeft: 0,
    paginationSpotWidth:0,
    seckillGoods:null,
    seckillDate:[],
    allPromotionGoods:{},
    imgV:'?v='+new Date().getTime(),
    playGoodsList:[],
    showPlayGoodsMore: false
  },
  hideShare() {
    this.setData({ showShare: false })
  },
  showShareFun() {
    this.setData({ showShare: true })
    if (wx.pageScrollTo && this.data.createShare) {
      wx.pageScrollTo({
        scrollTop: 1000,
        duration: 0
      })
    } else {
      this.shareGoodsList.forEach((item, index) => {
        this.downLoadImg(index)
      })
    }
  },
  onPullDownRefresh () {
    downRefreshVerify(this.getPageData,this)
  },
  savePhone() {
    if (!this.data.createShare) {
      this.openShare()
      return;
    }
    dispatch[types.CANVAS_SAVE_IMAGES]({
      canvasId: 'mycanvas',
      success: this.hideShare
    },this)
  },
  openShare() {
    const colonelInfo = this.data.colonelInfo || {}
    showLoading('加载海报...')
    let obj = setShareAppMessage({ colonelId: colonelInfo.colonelId || '' },true)
    wx.downloadFile({
      url: API.Public.storeURL + 'colonel/storeQrCode?identify=0&source=0&page=pages/home/home&scene=' + escape(setUrl(obj)),
      success: (res) => {
        const code = res.tempFilePath
        this.createCanvas(code)
      },
      fail: () => {
        hideLoading()
        toast('获取二维码失败')
      }
    })
  },
  createCanvas(code) {
    const ctx = wx.createCanvasContext('mycanvas')
    ctx.rect(0, 0, rpxToPx(590), rpxToPx(1623))
    ctx.drawImage('../../images/home_share_bg.jpg', 0, 0, rpxToPx(590), rpxToPx(1623))
    // 二维码
    ctx.drawImage(code, rpxToPx(350), rpxToPx(1450), rpxToPx(160), rpxToPx(160))
    const point = [
      [58, 225], [330, 225],
      [58, 610], [330, 610],
      [58, 1000], [330, 1000]
    ]
    this.shareGoodsList.forEach((item, i) => {
      const h = 200
      ctx.drawImage(item.tempFilePath ||'../../images/share_goods_default.png', rpxToPx(point[i][0]), rpxToPx(point[i][1]), rpxToPx(h), rpxToPx(h))
      //绘制商品名称
      ctx.setFillStyle('#7f431b')
      ctx.setFontSize(rpxToPx(26))
      const goodsName = setCheckText(ctx, item.itemName, rpxToPx(220),1)
      goodsName.forEach((n, z) => {
        ctx.fillText(n, rpxToPx(point[i][0]-15), rpxToPx(point[i][1] + h+67))
      })
      // 商品售价
      
      const priceTop = point[i][1] + h + 120
      ctx.setFillStyle('#ff0000')
      ctx.setFontSize(rpxToPx(36))
      const nowPrice = '￥' + item.itemNowPrice
      const nowPriceWidth = ctx.measureText(nowPrice).width
      ctx.fillText(nowPrice, rpxToPx(point[i][0] - 18), rpxToPx(priceTop))
      // 商品单位
      ctx.setFillStyle('#ff0000')
      ctx.setFontSize(rpxToPx(20))
      const unit = '/' + item.itemUnit
      const unitWidth = ctx.measureText(unit).width
      ctx.fillText(unit, rpxToPx(point[i][0] - 18) + nowPriceWidth, rpxToPx(priceTop))
      // 商品原价
      const beforePrice = '￥' + item.itemDisPrice
      const beforePriceWidth = ctx.measureText(beforePrice).width
      ctx.setFillStyle('#999999')
      ctx.setFontSize(rpxToPx(25))
      const beforedX = rpxToPx(point[i][0] - 10) + nowPriceWidth + unitWidth
      const beforedY = rpxToPx(priceTop)
      ctx.fillText(beforePrice, beforedX, beforedY)
      ctx.beginPath()
      ctx.setStrokeStyle('#999')
      ctx.moveTo(beforedX, beforedY - 5)
      ctx.lineTo(beforePriceWidth + beforedX+10, beforedY - 5)
      ctx.stroke()
    })
    ctx.drawImage('../../images/home_share_warehouse_bg_left.png', rpxToPx(130), rpxToPx(1480), rpxToPx(28), rpxToPx(50))
    
    ctx.setFillStyle('#fff')
    ctx.setFontSize(rpxToPx(25))
    const dcName = setCheckText(ctx, this.data.dcName, rpxToPx(160), 1)
    const dcNameWidth = ctx.measureText(dcName).width
    ctx.drawImage('../../images/home_share_warehouse_bg_right.png', rpxToPx(153) + dcNameWidth, rpxToPx(1480), rpxToPx(28), rpxToPx(50))
    ctx.drawImage('../../images/home_share_warehouse_bg_center.png', rpxToPx(155), rpxToPx(1481), dcNameWidth, rpxToPx(49))
    ctx.fillText(dcName, rpxToPx(155), rpxToPx(1515))

    ctx.restore()
    ctx.draw()
    hideLoading()
    this.setData({ createShare: true })
    wx.pageScrollTo && wx.pageScrollTo({
      scrollTop: 1000,
      duration: 0
    })
  },
  downLoadImg(index) {
    let url = this.shareGoodsList[index].itemThumbPic.replace(new RegExp(/http:/g), 'https:')
    wx.downloadFile({
      url: url,
      success: (ret) => {
        this.shareGoodsList[index].tempFilePath = ret.tempFilePath
      }
    })
  },
  categoryListScroll (e) {
    const { scrollLeft, scrollWidth} = e.detail
    const paginationSpotLeft = scrollLeft / scrollWidth * 100
    this.setData({paginationSpotLeft})
  },
  goCategoryBrandDetails (e) {
    const id = e.currentTarget.dataset.id;
    goPage('categoryBrandDetails',{id})
  },
  onPageScroll (e) {
    const top = pxToRpx(e.scrollTop)
    const befored = this.data.headAction
    const headAction = top > 200? true: false
    if (befored != headAction) this.setData({ headAction})
  },
  onLoad: function (opt) {
    this.setData({ height0: pxToRpx(this.data.someData.statusBarHeight)||50})
  },
  getPlayGoods () {
    API.Play.itemListPage({
      data:{
        sysCode: this.sysCode,
        dcId:this.dcId,
        // indexNum:1
      },
      success: ret => {
        let playGoodsList = ret.data||[]
        playGoodsList.forEach(goods => {
          if (goods.itemThumbPic) {
            goods.imgUrl = goods.itemThumbPic.split(',')[0]
          }
        })
        const num = 10
        this.setData({ showPlayGoodsMore: playGoodsList.length > num, playGoodsList: playGoodsList.slice(0, num)})
      }
    })
  },
  goPlayGoodsDetails (e) {
    const { playGoodsList } = this.data
    const {index} = e.currentTarget.dataset
    goPage(['eatDrinkPlayHappy','goodsDetails'],{
      itemNo: playGoodsList[index].id
    })
  },
  countSeckillDate (clear) {
    const seckillGoods = this.data.seckillGoods
    this.seckillTime && clearInterval(this.seckillTime)
    if (!seckillGoods || clear || seckillGoods.state==2) return
    const endTime = seckillGoods[seckillGoods.state == 0 ? 'startDate' :'endDate']
    dispatch[types.GET_SERVER_TIME](serverTime=>{
      const nowTime = +new Date()
      const seckillDate = getRemainTime(endTime, nowTime, serverTime)
      if (seckillDate) {
        this.setData({ seckillDate })
        this.seckillTime = setInterval(() => {
          const seckillDate = getRemainTime(endTime, nowTime, serverTime)
          if (seckillDate) {
            this.setData({ seckillDate })
          } else { // 倒计时结束
            clearInterval(this.seckillTime)
            this.getSeckillData()
          }
        }, 1000)
      }
    })
  },
  getSeckillData(){
    dispatch[types.GET_ALL_SECKILL_GOODS]({
      itemIds: '',
      getType: 'array',
      success: ret => {
        let seckillGoods = null
        ret.forEach((item, index) => {
          if (!seckillGoods || item.state == 1 || (seckillGoods.state == 2 && (item.state == 0 || (index == (ret.length - 1) && item.state == 2)))) {
            seckillGoods = item
          }
        })
        const allPromotionGoods = wx.getStorageSync('allSeckillGoods')
        this.setData({ seckillGoods, allPromotionGoods })
        this.countSeckillDate()
        let baseSeckillGoods = []
        if (seckillGoods) {
          seckillGoods.details.forEach(goods => {
            baseSeckillGoods.push({
              itemId: goods.otherId,
              itemName: goods.name,
              itemThumbPic: goods.imageUrl,
              itemSizeDes: goods.itemSizeDes,
              itemNowPrice: goods.discountAmt,
              itemPrePrice: goods.itemDisPrice,
              itemUnit: goods.itemUnit,
              maxSupplyQty: goods.buyQty,
              itemDisPrice: goods.itemDisPrice,
            })
          })
          this.baseSeckillGoods = baseSeckillGoods
          this.refreshData();
        }
      },
      error: ()=>{
        this.setData({ seckillGoods:null })
        let baseSeckillGoods = []
        this.countSeckillDate(true)
      }
    })
  },
  getPageData () {
    this.getZZZTGoodsList();
    this.queryCoupons()
    this.getActivity();
    this.getMainPush()
    this.getSeckillData()
    this.refreshData();
  },
  getStorePromotionAmt () {
    let storePromotion = this.data.storePromotion
    const nowTimes = +new Date()
    const now = formatTime(nowTimes)
    const before = now.split(' ')[0].replace(/-/g, "/") + ' ' + storePromotion.promotionEndTime
    const endTime = parseInt(storePromotion.promotionEndTime.split(':'))
    const date = formatTime(nowTimes + (+new Date(before) > nowTimes?0: (1000*60*60*24))).split(' ')[0]
    if (storePromotion.storeId) {
      clearInterval(this.storePromotionTimeInterval)
      const endDate = new Date(date.replace(/-/g, "/") + ' ' + storePromotion.promotionEndTime)
      dispatch[types.GET_SERVER_TIME](serverTime => {
        const nowTime = +new Date()
        const storePromotionTime = getRemainTime(endDate, nowTime, serverTime)
        if (storePromotionTime) {
          this.setData({ storePromotionTime })
          this.storePromotionTimeInterval = setInterval(() => {
            const storePromotionTime = getRemainTime(endDate, nowTime, serverTime)
            if (storePromotionTime) {
              this.setData({ storePromotionTime })
            } else { // 倒计时结束
              clearInterval(this.storePromotionTimeInterval)
              showLoading()
              setTimeout(()=>{
                hideLoading()
                this.getStorePromotion(true)
              },3000)
              
            }
          }, 1000)
        }
      })
    }

    API.Public.storePromotion({
      data: {
        storeId: storePromotion.storeId,
        date,
        time: storePromotion.promotionEndTime
      },
      success: ret => {
        if (ret.status == 200) {
          storePromotion.totalNum = ret.data.number
          storePromotion.totalAmt = ret.data.amt
          storePromotion.status = Number(ret.data.amt) >= storePromotion.promotionAmt
          
          this.setData({
            storePromotion
          })
        }
      }
    })
  },
  getStorePromotion (type) {
    const store = this.data.storePromotion
    if (store.storeId && !type) {
      this.getStorePromotionAmt()
    } else {
      const {  storeColonelId } = getApp().data
      API.Public.storeinfo({
        data:{
          colonelId: storeColonelId || this.colonelId
        },
        success: ret => {
          let storePromotion = ret.data||{}
          this.setData({ storePromotion })
          storePromotion.storeId && this.getStorePromotionAmt()
        }
      })

    }
  },
  onShow: function () {
    //获取最新配送中心
    let that = this;
    UserBusiness.wxLogin(this, getApp().data.colonelId, function () {
      const { openId, imgBaseUrl, sysCode, colonelId, dcId, dcName, colonelInfo = {}, ww, userId, userIsColonel, storeMode } = getApp().data
      console.log(userIsColonel, storeMode)
      that.ww = ww
      that.openId = openId
      that.sysCode = sysCode
      that.colonelInfo = colonelInfo
      that.dcId = dcId
      that.colonelId = colonelId
      that.setData({ imgBaseUrl, dcName, colonelInfo })     
      that.getCategoryList();
      that.userId=userId;
      that.getPageData()
      that.getPlayGoods()
      if (userIsColonel || storeMode) {
        that.getStorePromotion()
      }
      that.selectComponent("#newPeopleCoupons").getPageData();
      that.selectComponent("#newColonelCoupons").getPageData();
    });
    //设置购物车数量
    shoppingCart.setCartCount()
  },
  onHide(){
    clearInterval(this.storePromotionTimeInterval)
  },
  onUnload () {
    clearInterval(this.storePromotionTimeInterval)
    this.countSeckillDate(true)
  },
  onShareAppMessage: function () {
    return setShareAppMessage({
      title: '生活家 线上批发市场',
      path: '/pages/startupPage/startupPage?openType=share&colonelId=' + getApp().data.colonelId,
      imageUrl: 'https://zksrimg.oss-cn-beijing.aliyuncs.com/images/cmm/hom_share_img.png'

    })
  },
  getMainPush () { // 获取类别品牌
    API.Index.getMainPush({
      data:{
        dcId: this.dcId
      },
      success: ret => {
        let categoryBrandList = ret.data || []
        let categoryGoods = []
        
        categoryBrandList.forEach(list => {
          list.itemList.forEach(item=>{
            item.itemNowPrice = Number(item.itemNowPrice)
            item.startQty = Number(item.startQty) || 1
            item.maxSupplyQty = Number(item.maxSupplyQty) || 0
            item.stockNull = !item.maxSupplyQty || item.maxSupplyQty < item.startQty
            categoryGoods.push(item)
          })
        })
        this.categoryGoods = categoryGoods
        this.setData({ categoryBrandList })
        this.refreshData();
      }
    })
  },
  getActivity(){
    API.Index.getActivity({
      data: {
        sysCode: this.sysCode,
        openid: this.openId,
        dcId: this.dcId
      },
      success: (obj) => {
        let activityList = obj.data || []
        if (obj.status == 200) {
          this.setData({ activityList });
        }
      }
    })
  },
  pushShareGoodsArray () {
    let arr = []
    for (let i = 0; i < arguments.length;i++){
      const list = arguments[i] ||[]
      list.forEach(item => {
        if (arr.length < 6) arr.push(item)
      })
    }
    this.shareGoodsList = arr
  },
  refreshData(){
    this.pushShareGoodsArray(this.baseSeckillGoods,this.data.ZZZTGoodsList, this.categoryGoods)
    let ZZZTGoodsList = shoppingCart.convertGoodsList(this.data.ZZZTGoodsList);
    let LBZTGoodsList = shoppingCart.convertGoodsList(this.categoryGoods);
    let goodsAll = Object.assign(ZZZTGoodsList, LBZTGoodsList);
    this.setData({ goodsAll })
    var cartGoods = shoppingCart.getGoodsList();
    this.setData({ cartGoods: cartGoods });
  },
  getCategoryList() {
    API.Index.clsList({
      data: {
        sysCode: this.sysCode,
        openid: this.openId,
        dcId: this.dcId,
        fatherClsNo: "F"
      },
      success: (obj) => {
        let categoryList = obj.data || []
        if (obj.status === 200) {
          const iconW = rpxToPx(142)
          const paginationSpotWidth = ((iconW * 5) / (Math.round(categoryList.length / 2) * iconW)) * 100
          this.setData({ categoryList, paginationSpotWidth})
        }
      },
      error: () => {}
    })
  },

  GroupingData(list,size){
    if(!size){
      size=10
    }
    let groudCategoryList = new Array();
    for (let index in list) {
      let key = parseInt(index / size)
      if (!groudCategoryList[key]) { groudCategoryList[key]=new Array()}
      groudCategoryList[key].push(list[index])
    }
    for (let index in groudCategoryList) {
      //console.log(index);
      //插入步骤null
      //let insertNull = 10 - groudCategoryList[index].length;
      //console.log("插入空",insertNull)
      let insertNull = (groudCategoryList[index].length % 2) == 0 ? 0 : 1;
      for (var i = 0; i < insertNull; i++) {
        groudCategoryList[index].push({})
      }
    }
    return groudCategoryList;
  },
  //获取整站主推商品
  getZZZTGoodsList(){
    this.setData({ createShare: false })
    API.Index.getLabelNameItemList({
      data: {
        sysCode: this.sysCode,
        openid: this.openId,
        dcId: this.dcId,
        labelType: "1",
        indexNum: "1",
        orderByField: "",
        orderBy: "",
        itemClsno: ""
      },
      success: res => {
        if (res.status == 200) {
          const list = res.data || []
          list.forEach(item => {
            item.startQty = Number(item.startQty) || 1
            item.maxSupplyQty = Number(item.maxSupplyQty) || 0
            item.stockNull = !item.maxSupplyQty || item.maxSupplyQty < item.startQty
            item.itemNowPrice = Number(item.itemNowPrice)
          })
          this.setData({ ZZZTGoodsList: list })
          this.refreshData()
        }
      }
    });
  },
  //类别主推
  getLBZTGoodsList() {
    API.Index.getLabelNameItemList({
      data: {
        sysCode: this.sysCode,
        openid: this.openId,
        dcId: this.dcId,
        labelType: "0",
        indexNum:"1",
        orderByField:"",
        orderBy:"",
        itemClsno:""
      },
      success: res => {
        if (res.status == 200) {
          const list = res.data || []
          list.forEach(item => {
            item.itemNowPrice = Number(item.itemNowPrice)
          })
          this.setData({ LBZTGoodsList: list });
          this.refreshData();
        }
      }
    });
  },
  goGoodsDetails(e){
    const itemId = e.currentTarget.dataset.no
    goPage('goods', { itemId: itemId, t: 'home' })
  },
  // 点击加入购物车
  addCarts(e) {
    const itemId = e.currentTarget.dataset.no;
    if (!itemId)return
    let goods = this.data.goodsAll[itemId];
    var cartGoods=shoppingCart.addGoods(goods,()=>{
      wx.hideToast()
      toast('加入购物车成功')
    });
    this.setData({ cartGoods: cartGoods });
  },
  onClickClsItem(e){
    const { clsno, clsName } = e.currentTarget.dataset
    getApp().globalData.itemClsno = clsno
    wx.switchTab({
      url: '/pages/goodsCls/goodsCls'
    })
  }, 
  goSelectSysCode(e){
    goPage('selectSysCode', { openId: this.openId, t: 'home' })
  },
  goActivity(e) {
    const itemId = e.currentTarget.dataset.itemid
    const skipType = e.currentTarget.dataset.skiptype
    if (skipType=="1"){
      goPage('goods', { itemId: itemId, t: 'home' })
    }
  }, 
  goSearchGoods (e) {
    goPage('searchGoods', { t: 'home' })
  },
  queryCoupons() {
    API.Coupons.findGrantCouponByUserId({
      data: {
        userId: this.userId || '-1'
      },
      success: ret => {
        hideLoading()
        const status = ret.status
        const obj = ret.data
        if ((status == 200 || status == 2) && obj) {
          let listvalue = this.GroupingData(obj, 4)
          if (obj.length <= 2) { this.setData({ couponListHeight:2}) }
          this.setData({ couponList: listvalue })
        } else {
          this.setData({ couponList: [] })
        }
      },
      error: () => {
        hideLoading()
        alert('获取优惠券失败，请检查网络是否正常')
      },
      complete: () => {
        // let listvalue = this.GroupingData(this.testCouponList.data,4)
        // console.log("listvalue", listvalue)
        // this.setData({ couponList: listvalue })
      }

    })
  },
  getCoupon(e){
    const itemId = e.currentTarget.dataset.id;
    const { userInfo } = getApp().data
    if (userInfo.userPhone) {
        showLoading('请稍后...')
        API.Coupons.sendCouponByRelationIdAndUserId({
          data: {
            relationId: itemId,
            userId: this.userId || '-1'
          },
          success: obj => {
            hideLoading()
            if (obj.status == 200) {
              toast('领取成功')
              this.setData({ pageType: '1' })
              //刷新优惠卷
              this.queryCoupons()
            } else {
              alert(obj.msg)
            }
          },
          error: () => {
            hideLoading()
            alert('领取优惠券失败，请检查网络是否正常')
          }
        })
      } else { // 跳转注册
        goPage('impower', { openType: 'inside' })
      }
  }
})