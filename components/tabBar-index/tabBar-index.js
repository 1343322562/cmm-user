import API from '../../api/index.js'
import { ShoppingCartGoods } from '../../tool/shoppingCart.js'
import { getTime, deepCopy, getRemainTime, showLoading, hideLoading, goPage, alert, toast, setUrl, pxToRpx, rpxToPx, downRefreshVerify, setCheckText, formatTime, setShareAppMessage, defaultData } from '../../tool/index.js'
import UserBusiness from '../../tool/userBusiness.js'
let shoppingCart = new ShoppingCartGoods();//实例化类
import * as types from '../../store/types.js'
import dispatch from '../../store/actions.js'
const app = getApp()
Component({
  properties: {
  },
  data: {
    // 导航
    categoryList: [],
    someData: {
      statusBarHeight: app.globalData.statusBarHeight,
      titleBarHeight: app.globalData.titleBarHeight
    },
    chwlList: [], // 吃喝玩乐商家列表
    height0: 50,
    cartGoods: [], //购物所有商品
    ZZZTGoodsList: [ // 默认商品(分享小程序朋友圈进入时)
    ],
    LBZTGoodsList: [],
    goodsAll: [], //所有商品
    indicatorDots: true,
    vertical: false,
    activityList: [],
    storePromotion: {},
    storePromotionTime: [],
    autoplay: true,
    interval: 6000,
    duration: 1500,
    showShare: false,
    createShare: false,
    headAction: false,
    categoryBrandList: [],
    couponList: [],
    couponListHeight: 1,
    paginationSpotLeft: 0,
    paginationSpotWidth: 0,
    seckillGoods: null,
    seckillDate: [],
    allPromotionGoods: {},
    imgV: '?v=' + new Date().getTime(),
    playGoodsList: [],
    showPlayGoodsMore: false,
    currentStoreMode: 0,   // 当前的送货模式（已缓存）0：送到家  1：自提
    currentStoreAddr: '',  // 当前的自提点(已缓存)
    switchTransWay: 0
  },
  attached (op) {
    console.log('index的att', op, app.data.scene)
    if (app.data.scene == 1154) { // 由朋友圈分享进入小程序(默认数据)
      const categoryList = defaultData.categoryList
      const ZZZTGoodsList =  defaultData.ZZZTGoodsList
      this.setData({ height0: pxToRpx(this.data.someData.statusBarHeight) || 50 , categoryList, ZZZTGoodsList })
    } else {
      this.setData({ height0: pxToRpx(this.data.someData.statusBarHeight) || 50})
    }
    
  },
  ready () {
  },
  methods: {
    getMainPush() { // 获取类别品牌
      API.Index.getMainPush({
        data: {
          dcId: this.dcId
        },
        success: ret => {
          console.log('获取类别品牌', ret)
          let categoryBrandList = ret.data || []
          let categoryGoods = []

          categoryBrandList.forEach((list,ind) => {
            list.itemList.forEach((item,i) => {
              item.itemNowPrice = Number(item.itemNowPrice)
              item.startQty = Number(item.startQty) || 1
              item.maxSupplyQty = Number(item.maxSupplyQty) || 0
              item.stockNull = !item.maxSupplyQty || item.maxSupplyQty < item.startQty
              // 商品不为一行三列时，使用 0-1 图片
              categoryBrandList[ind].pictureStyle != 3 && (categoryBrandList[ind].itemList[i].itemThumbPic = categoryBrandList[ind].itemList[i].itemThumbPic.replace('1-0.', '1-1.'))
              categoryGoods.push(item)
            })
          })
          this.categoryGoods = categoryGoods
          console.log('l', categoryBrandList)
          this.setData({ categoryBrandList })
          this.refreshData();
        }
      })
    },
    getActivity() {
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
    pushShareGoodsArray() {
      console.log(99,'这是整站主推商品，生成海报时', arguments)
      let arr = []
      for (let i = 0; i < arguments.length; i++) {
        const list = arguments[i] || []
        list.forEach(item => {
          if (arr.length < 10) arr.push(item)
        })
      }
      console.log(arr)
      this.shareGoodsList = arr
    },
    refreshData() {
      this.pushShareGoodsArray(this.baseSeckillGoods, this.data.ZZZTGoodsList, this.categoryGoods)
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
          console.log('getCategoryList', obj)
          let categoryList = obj.data || []
          if (obj.status === 200) {
            const iconW = rpxToPx(142)
            const paginationSpotWidth = ((iconW * 5) / (Math.round(categoryList.length / 2) * iconW)) * 100
            this.setData({ categoryList, paginationSpotWidth })
          }
        },
        error: () => { }
      })
    },

    GroupingData(list, size) {
      if (!size) {
        size = 10
      }
      let groudCategoryList = new Array();
      for (let index in list) {
        let key = parseInt(index / size)
        if (!groudCategoryList[key]) { groudCategoryList[key] = new Array() }
        groudCategoryList[key].push(list[index])
      }
      for (let index in groudCategoryList) {
        let insertNull = (groudCategoryList[index].length % 2) == 0 ? 0 : 1;
        for (var i = 0; i < insertNull; i++) {
          groudCategoryList[index].push({})
        }
      }
      return groudCategoryList;
    },
    //获取整站主推商品
    getZZZTGoodsList() {
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
          console.log('获取整站主推商品', res)
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
          indexNum: "1",
          orderByField: "",
          orderBy: "",
          itemClsno: ""
        },
        success: res => {
          console.log('类别主推', res)
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
    goGoodsDetails(e) {
      const itemId = e.currentTarget.dataset.no
      goPage('goods', { itemId: itemId, t: 'home' })
    },
    // 点击加入购物车
    addCarts(e) {
      const itemId = e.currentTarget.dataset.no;
      if (!itemId) return
      let goods = this.data.goodsAll[itemId];
      var cartGoods = shoppingCart.addGoods(goods, () => {
        wx.hideToast()
        toast('加入购物车成功')
      });
      this.setData({ cartGoods: cartGoods });
      this.triggerEvent('getCartsNum')
    },
    onClickClsItem(e) {
      const { clsno, clsName } = e.currentTarget.dataset
      getApp().data.itemClsno = clsno
      console.log(`跳转类别:${clsno}`)
      this.triggerEvent('changePage','list')
    },
    goSelectSysCode(e) {
      goPage('selectSysCode', { openId: this.openId, t: 'home' })
    },
    goActivity(e) {
      const {index} = e.currentTarget.dataset
      const {activityList} = this.data
      const item = activityList[index]
      if (item.skipType == "1") {
        goPage('goods', { itemId: item.itemId, t: 'home' })
      } else if (item.skipType == '2') {
        goPage(['activity','banner'], { id: item.id })
      }
    },
    goSearchGoods(e) {
      goPage('searchGoods')
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
            if (obj.length <= 2) { this.setData({ couponListHeight: 2 }) }
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
        }

      })
    },
    getCoupon(e) {
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
    },
    getPlayGoods() {
      API.Play.itemListPage({
        data: {
          sysCode: this.sysCode,
          dcId: this.dcId,
          // indexNum:1
        },
        success: ret => {
          console.log('goods:', ret)
          let playGoodsList = ret.data || []
          playGoodsList.forEach(goods => {
            if (goods.itemThumbPic) {
              goods.imgUrl = goods.itemThumbPic.split(',')[0]
            }
          })
          const num = 10
          this.setData({ showPlayGoodsMore: playGoodsList.length > num, playGoodsList: playGoodsList.slice(0, num) })
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
    countSeckillDate(clear) {
      const seckillGoods = this.data.seckillGoods
      this.seckillTime && clearInterval(this.seckillTime)
      if (!seckillGoods || clear || seckillGoods.state == 2) return
      const endTime = seckillGoods[seckillGoods.state == 0 ? 'startDate' : 'endDate']
      dispatch[types.GET_SERVER_TIME](serverTime => {
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
    getSeckillData() {
      dispatch[types.GET_ALL_SECKILL_GOODS]({
        itemIds: '',
        getType: 'array',
        success: ret => {
          console.log('s', ret)
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
        error: () => {
          this.setData({ seckillGoods: null })
          let baseSeckillGoods = []
          this.countSeckillDate(true)
        }
      })
    },
    getPageData() {
      this.getZZZTGoodsList();
      this.queryCoupons()
      this.getActivity();
      this.getMainPush()
      this.getSeckillData()
      this.refreshData();
    },
    getStorePromotionAmt() {
      console.log('首页getStorePromotionAmt', '已进入')
      let storePromotion = this.data.storePromotion
      console.log(storePromotion)
      const nowTimes = +new Date()
      const now = formatTime(nowTimes)
      const before = now.split(' ')[0].replace(/-/g, "/") + ' ' + storePromotion.promotionEndTime
      const endTime = parseInt(storePromotion.promotionEndTime.split(':'))
      const date = formatTime(nowTimes + (+new Date(before) > nowTimes ? 0 : (1000 * 60 * 60 * 24))).split(' ')[0]
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
                setTimeout(() => {
                  hideLoading()
                  this.getStorePromotion(true)
                }, 3000)

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
          console.log('获取自提点开团信息', ret)
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
    getStorePromotion(type) {
      const store = this.data.storePromotion
      let storeId = this.data.currentStoreAddr.storeId || wx.getStorageSync('currentStoreAddr').storeId || wx.getStorageSync('currentStoreAddr').id
      storeId = String(storeId)
      console.log('storeId', storeId)
      if (store.storeId && !type) {
        this.getStorePromotionAmt()
      } else {
        console.log('storeId', storeId)
        const { storeColonelId } = getApp().data
        console.log(storeColonelId || this.colonelId)
        API.Public.storeinfo({
          data: {
            colonelId: storeColonelId || this.colonelId,
            storeId: storeId
          },
          success: ret => {
            console.log('开团信息' ,ret)
            let storePromotion = ret.data || {}
            this.setData({ storePromotion })
            storePromotion.storeId && this.getStorePromotionAmt()
          }
        })

      }
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
    onPullDownRefresh() {
      downRefreshVerify(this.getPageData.bind(this), this)
    },
    onReachBottom () {},
    onHide() {
      this.setData({ headAction: false })
      clearInterval(this.storePromotionTimeInterval)
    },
    onUnload() {
      clearInterval(this.storePromotionTimeInterval)
      this.countSeckillDate(true)
    },
    // 获取吃喝玩乐列表
    getChSupplierList() {
      let { sysCode } = app.data
      const _this = this
      console.log(518,sysCode)
      API.Public.getChSupplierList({
        data: { sysCode },
        success(res) {
          console.log(522,res)
          if (res.status == 200) {
            _this.setData({ chwlList: res.data })
          }
        }
      })
    },
    // 跳转吃喝玩乐商家详情
    toCHDetailClick(e) {
      let { item } = e.currentTarget.dataset
      item = JSON.stringify(item)
      goPage('chwlDetail', { item })
    },
    savePhone() {
      if (!this.data.createShare) {
        this.openShare()
        return;
      }
      dispatch[types.CANVAS_SAVE_IMAGES]({
        canvasId: 'mycanvas',
        success: this.hideShare
      }, this)
    },
    openShare() {
      const colonelInfo = this.data.colonelInfo || {}
      showLoading('加载海报...')
      let obj = setShareAppMessage({ colonelId: colonelInfo.colonelId || '' }, true)
      wx.downloadFile({
        url: API.Public.storeURL + 'colonel/storeQrCode?identify=0&source=0&page=pages/startupPage/startupPage&scene=' + escape(setUrl(obj)),
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
      const ctx = wx.createCanvasContext('mycanvas',this)
      ctx.rect(0, 0, rpxToPx(590), rpxToPx(2623))
      ctx.drawImage('/images/home_share_bg10.jpg', 0, 0, rpxToPx(590), rpxToPx(2623))
      // 二维码
      ctx.drawImage(code, rpxToPx(350), rpxToPx(2400), rpxToPx(160), rpxToPx(160))
      const point = [
        [58, 265], [330, 265],
        [58, 690], [330, 690],
        [58, 1115], [330, 1115],
        [58, 1540], [330, 1540],
        [58, 1960], [330, 1960],
      ]
      this.shareGoodsList.forEach((item, i) => {
        const h = 200
        ctx.drawImage(item.tempFilePath || '/images/hasre_goods_default.png', rpxToPx(point[i][0]), rpxToPx(point[i][1]), rpxToPx(h), rpxToPx(h))
        //绘制商品名称
        ctx.setFillStyle('#7f431b')
        ctx.setFontSize(rpxToPx(26))
        const goodsName = setCheckText(ctx, item.itemName, rpxToPx(220), 1)
        goodsName.forEach((n, z) => {
          ctx.fillText(n, rpxToPx(point[i][0] - 15), rpxToPx(point[i][1] + h + 67))
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
        ctx.lineTo(beforePriceWidth + beforedX + 10, beforedY - 5)
        ctx.stroke()
      })
      ctx.drawImage('/images/home_share_warehouse_bg_left.png', rpxToPx(130), rpxToPx(2370), rpxToPx(28), rpxToPx(50))

      ctx.setFillStyle('#fff')
      ctx.setFontSize(rpxToPx(25))
      const dcName = setCheckText(ctx, this.data.dcName, rpxToPx(160), 1)
      const dcNameWidth = ctx.measureText(dcName).width
      ctx.drawImage('/images/home_share_warehouse_bg_right.png', rpxToPx(153) + dcNameWidth, rpxToPx(2370), rpxToPx(28), rpxToPx(50))
      ctx.drawImage('/images/home_share_warehouse_bg_center.png', rpxToPx(155), rpxToPx(2370), dcNameWidth, rpxToPx(49))
      ctx.fillText(dcName, rpxToPx(155), rpxToPx(2404))

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
    categoryListScroll(e) {
      console.log(e)
      const { scrollLeft, scrollWidth } = e.detail
      const paginationSpotLeft = scrollLeft / scrollWidth * 100
      this.setData({ paginationSpotLeft })
    },
    goCategoryBrandDetails(e) {
      const id = e.currentTarget.dataset.id;
      if (id) {
        goPage('categoryBrandDetails', { id })
      }
    },
    onPageScroll(e) {
      const top = pxToRpx(e.scrollTop)
      const befored = this.data.headAction
      const headAction = top > 200 ? true : false
      if (befored != headAction) this.setData({ headAction })
    },
      // 获取默认自提点, 若缓存了自提点则使用缓存自提点判断
    getUserStoreList(currentStoreAddr = wx.getStorageSync('currentStoreAddr')) {
      console.log('默认自提点', currentStoreAddr, app.data)
      const _this = this
      const { userId } = app.data
      const { sysCode } = app.data.userInfo
      const switchTransWay = _this.data.switchTransWay || wx.getStorageSync('switchTransWay') || ''
      console.log(switchTransWay, '648')
      if (currentStoreAddr) {
        _this.getStorePromotion(); 
        console.log('currentStoreAddr', currentStoreAddr)
        _this.setData({ currentStoreAddr })
        // if (typeof switchTransWay != 'number') {
          _this.setData({ switchTransWay: currentStoreAddr.openStore }); _this.data.switchTransWay = currentStoreAddr.openStore
        // }
        return
      } 
      API.Orders.getUserStoreList({
        data: { sysCode, userId },
        success(res) {
          if (res.status != 200) return alert(res.msg)
          console.log(res)
          let list = res.data
          if (!list.length) return _this.setData({ storeInfo: [] }) // 无信息
          let storeInfo
          list.forEach((item, index) => {
            if (storeInfo) return
            storeInfo = ('toleration' in item && item.toleration == 1 ) ? item : ''
          })
          console.log(storeInfo)
          console.log('moren', switchTransWay)
          if (typeof switchTransWay != 'number') _this.setData({ switchTransWay: storeInfo.openStore })
          console.log(_this.data.switchTransWay)
          this.data.currentStoreAddr = storeInfo
          _this.setData({ currentStoreAddr: storeInfo })
          _this.getStorePromotion(); 
          wx.setStorage({ data: storeInfo, key: 'currentStoreAddr' })
          return storeInfo
          wx.setStorage({ data: storeInfo, key: 'currentStoreAddr' })
        },
        complete() { hideLoading() }
      })
    },
    onShow(q) {
      //获取最新配送中心
      let that = this;
      UserBusiness.wxLogin(this, getApp().data.colonelId,  ()=>{
        let { openId, imgBaseUrl, sysCode, colonelId, dcId, dcName, colonelInfo = {}, ww, userId, userIsColonel, storeMode } = app.data
        console.log('storeMode', storeMode)
        const switchTransWay = typeof app.globalData.switchTransWay == 'number' ? app.globalData.switchTransWay : wx.getStorageSync('switchTransWay')
        console.log('switchTransWay', switchTransWay, wx.getStorageSync('switchTransWay'))
        const currentStoreMode = wx.getStorageSync('currentStoreMode') || 0
        let currentStoreAddr = app.data.storeInfo || wx.getStorageSync('currentStoreAddr') || '' // 获取默认自提点
        if (Object.keys(currentStoreAddr).length == 0 && switchTransWay == 1) currentStoreAddr = wx.getStorageSync('currentStoreAddr')
        console.log(currentStoreAddr, currentStoreMode, switchTransWay)
        if(currentStoreAddr && currentStoreMode == 1) {
          storeMode = true; that.setData({ storeMode, switchTransWay }); this.data.switchTransWay = switchTransWay
          app.data.storeMode = true
        } else {
          that.data.currentStoreMode = currentStoreMode
          that.setData({ storeMode, currentStoreMode, switchTransWay }); this.data.switchTransWay = switchTransWay
        }
        console.log(currentStoreMode)
        // const currentStoreAddr = wx.getStorageSync('currentStoreAddr') || ''
        console.log('进入index页面时的storeMode', storeMode)
        console.log('全局', app)
        console.log('index页', that)
        that.ww = ww
        that.openId = openId
        that.sysCode = sysCode
        that.colonelInfo = colonelInfo
        that.dcId = dcId
        that.colonelId = colonelId
        that.setData({ imgBaseUrl, dcName, colonelInfo, currentStoreMode, currentStoreAddr })
        that.getCategoryList();
        that.userId = userId;
        that.getPageData()
        that.getPlayGoods()
        that.getChSupplierList() // 获取吃喝玩乐列表
        if ((userIsColonel || storeMode) && currentStoreMode == 1) {
          showLoading() 
          console.log(100)
           // 获取成团信息
          // setTimeout(() => that.getUserStoreList(currentStoreAddr), 200)
          that.getStorePromotion(); 
        }
        that.selectComponent("#newPeopleCoupons").getPageData();
        that.selectComponent("#newColonelCoupons").getPageData();
        this.triggerEvent('setNavTitle')
      });
      //设置购物车数量
      shoppingCart.setCartCount()
    },
  },
  onReachBottom() {console.log(this,app)}
})
