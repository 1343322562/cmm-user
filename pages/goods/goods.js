// pages/goods/goods.js
import API from '../../api/index.js'
import { getTime, deepCopy, getRemainTime, showLoading, hideLoading, goPage, setUrlObj, alert, toast, setFilterDataSize, setUrl, rpxToPx, setCheckText, setShareAppMessage, goTabBar } from '../../tool/index.js'
import UserBusiness from '../../tool/userBusiness.js'
import { ShoppingCartGoods } from '../../tool/shoppingCart.js'
let shoppingCart = new ShoppingCartGoods();//实例化类
import * as types from '../../store/types.js'
import dispatch from '../../store/actions.js'
let app = getApp()
Page({
  data: {
    itemId:"",
    loading:false, //是否页面数据加载完毕
    imgList: [], //商品轮播图,
    itemDescList:[], //图文详情
    allPromotionGoods:{},
    seckillDate:[],
    maxNum:0,
    createShare: false,
    imgV: '?v=' + new Date().getTime(),
    showShare: false,
  },
  onLoad: function (opt) {
    console.log(opt)

    if (opt.scene) {
      opt = setUrlObj(decodeURIComponent(opt.scene))
      console.log(opt)
      opt.openType = 'share'
    }
    if (opt.openType=='share') {
      getApp().data.shareItemId = opt.i
      if (opt.storeId) {
        app.data.storeMode = true
        app.globalData.share = true
        app.globalData.switchTransWay = 1
      }
    }
    this.itemId = (opt.itemNo || opt.itemId) || opt.i || getApp().data.shareItemId
    this.openType = opt.openType
  },
  openShare() {
    const { createShare, goods, imgBaseUrl, imgList } = this.data

    if (createShare) {
      this.setData({ showShare: true })
    } else {
      showLoading('生成海报中...')
      const itemHomePic = goods.itemHomePic.replace(new RegExp(/http:/g), 'https:')
      console.log(itemHomePic)
      wx.downloadFile({
        url: itemHomePic,
        success: (ret) => {
          console.log(ret)
          this.createCanvas(ret.tempFilePath)
        },
        fail: (err) => {
          console.log(err)
          this.createCanvas()
        }
      })
    }
  },
  hideShare () {
    this.setData({ showShare: false })
  },
  savePhone() {
    dispatch[types.CANVAS_SAVE_IMAGES]({
      canvasId: 'mycanvas',
      success: this.hideShare
    }, this)
  },
  createCanvas(itemHomePic) {
    let codeObj = setShareAppMessage({ colonelId: this.colonelId || '', i: this.itemId },true)
    wx.downloadFile({
      url: API.Public.storeURL + 'colonel/storeQrCode?identify=0&source=0&page=pages/goods/goods&scene=' + escape(setUrl(codeObj)),
      success: (res) => {
        const code = res.tempFilePath
        const ctx = wx.createCanvasContext('mycanvas')
        const goods = this.data.goods
        const allPromotionGoods = this.data.allPromotionGoods
        ctx.rect(0, 0, rpxToPx(590), rpxToPx(760))
        ctx.drawImage('../../images/share_bg.png', 0, 0, rpxToPx(590), rpxToPx(760))
        // 二维码
        ctx.drawImage(code, rpxToPx(65), rpxToPx(570), rpxToPx(160), rpxToPx(160))
        // 商品图片
        if (itemHomePic) {
          ctx.drawImage(itemHomePic, rpxToPx(157), rpxToPx(75), rpxToPx(275), rpxToPx(275))
        }
        // logo
        ctx.drawImage('../../images/logo2.png', rpxToPx(30), rpxToPx(20), rpxToPx(88), rpxToPx(55))
        // 商品价格
        ctx.setFillStyle('#ff0000')
        ctx.setFontSize(rpxToPx(45))
        const nowPrice = '￥' + (allPromotionGoods[this.itemId] ? allPromotionGoods[this.itemId].price : goods.itemNowPrice)
        const beforePrice = '￥' + goods.itemDisPrice
        const nowPriceWidth = ctx.measureText(nowPrice).width
        const beforePriceWidth = ctx.measureText(beforePrice).width
        ctx.fillText(nowPrice, rpxToPx((590 / 2) - nowPriceWidth * 2), rpxToPx(420))
        ctx.setFillStyle('#999999')
        ctx.setFontSize(rpxToPx(35))
        const beforedX = rpxToPx((590 / 2) + 20)
        const beforedY = rpxToPx(420)
        ctx.fillText(beforePrice, beforedX, beforedY)
        ctx.beginPath()
        ctx.setStrokeStyle('#999')
        ctx.moveTo(beforedX, beforedY - 5)
        ctx.lineTo(beforePriceWidth + beforedX, beforedY - 5)
        ctx.stroke()
        // 分割线
        ctx.beginPath()
        ctx.setStrokeStyle('#e8e8e8')
        ctx.moveTo(rpxToPx(30), rpxToPx(550))
        ctx.lineTo(rpxToPx(550), rpxToPx(550))
        ctx.stroke()
        // 绘制商品名称
        ctx.setFillStyle('#000000')
        ctx.setFontSize(rpxToPx(30))
        const goodsName = setCheckText(ctx, (goods.itemName), rpxToPx(520),2)
        goodsName.forEach((item, index) => {
          ctx.fillText(item, rpxToPx(30), rpxToPx(470) + (index * rpxToPx(40)) + (goodsName.length === 1 ? rpxToPx(20) : 0))
        })
        // 绘制推荐好物
        // ctx.setFillStyle('#000000')
        // ctx.setFontSize(rpxToPx(24))
        // ctx.fillText(userWxInfo.nickName + '分享好货',rpxToPx(75), rpxToPx(48))
        // 长按识别小程序
        ctx.setFillStyle('#000000')
        ctx.setFontSize(rpxToPx(24))
        ctx.fillText('长按识别小程序 立即购买', rpxToPx(260), rpxToPx(650))
        // 好货要和朋友一起分享
        ctx.setFillStyle('#999999')
        ctx.setFontSize(rpxToPx(20))
        ctx.fillText('好货要和朋友一起分享', rpxToPx(260), rpxToPx(680))
        // 绘制微信头像
        // ctx.save()
        // ctx.beginPath()
        // ctx.arc(rpxToPx(40), rpxToPx(40), rpxToPx(20), 0, Math.PI * 2, false)
        // ctx.clip()
        // ctx.drawImage(avatarUrl,rpxToPx(20),rpxToPx(20),rpxToPx(40), rpxToPx(40))
        ctx.restore()
        ctx.draw()
        hideLoading()
        this.setData({ createShare: true, showShare: true })
      },
      fail: () => {
        hideLoading()
        toast('获取二维码失败')
      }
    })
  },
  refreshData() {
    let cartsNum = shoppingCart.getGoodsCount()
    var cartGoods = shoppingCart.getGoodsList();
    this.setData({ cartGoods: cartGoods });
    this.setData({ cartsNum })
  },
  onReady: function () {
  },
  onShow: function (opt) {
    if (getApp().data.shareItemId) {
      var that=this
      UserBusiness.wxLogin(this, getApp().data.colonelId,  function() {

        const { openId, imgBaseUrl, sysCode, dcId, colonelId, userInfo } = getApp().data
        that.openId = openId
        that.sysCode = sysCode
        that.dcId = dcId
        that.colonelId = colonelId

        that.setData({ imgBaseUrl, userInfo, itemId: that.itemId })

        that.getGoods()
        that.getSeckillData()

        getApp().data.shareItemId=null
        that.selectComponent("#newPeopleCoupons").getPageData();

      });

    }else
    {
      const { openId, imgBaseUrl, sysCode, dcId, colonelId, userInfo } = getApp().data
      this.openId = openId
      this.sysCode = sysCode
      this.dcId = dcId
      this.colonelId = colonelId

      this.setData({ imgBaseUrl, userInfo, itemId: this.itemId })

      this.getGoods()
      this.getSeckillData()

    }
    
  },
  getSeckillData () {
    dispatch[types.GET_ALL_SECKILL_GOODS]({
      success: allPromotionGoods => {
        let goods = allPromotionGoods[this.itemId]
        this.setData({ allPromotionGoods, maxNum: goods ? goods.maxNum:0 })
        this.countSeckillDate(!goods)
      }
    })
  },
  countSeckillDate(clear) {
    const seckillGoods = this.data.allPromotionGoods[this.itemId]
    this.seckillTime && clearInterval(this.seckillTime)
    if (clear) return
    const endTime = seckillGoods.endTime
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
  onHide: function () {
    this.countSeckillDate(true)
  },
  onShareAppMessage: function () {
    this.hideShare()
    const {goods} = this.data
    console.log('/pages/goods/goods?i=' + this.itemId + '&openType=share&colonelId=' + getApp().data.colonelId)
    const {
      storeMode,// 自提点模式
      storeColonelId,// 自提点团长ID
      userIsColonel,//  用户是不是团长
      storeInfo,// 自提点数据
    } = getApp().data
    const addr = wx.getStorageSync('currentStoreAddr')
    const switchTransWay = wx.getStorageSync('switchTransWay')
    const shareAddrId = (userIsColonel || switchTransWay == 1) ? (addr.storeId || storeInfo.storeId || addr.id || storeInfo.id) : ''

    return setShareAppMessage({
      title: goods.itemName,
      path: '/pages/goods/goods?i=' + this.itemId + '&openType=share&colonelId=' + getApp().data.colonelId + '&storeId=' + shareAddrId
    })
  },
  getGoods() {
    API.Goods['itemDetail']({
      data: {
        storeId: this.storeId,
        itemId: this.itemId,
        openid: this.openId,
        dcId:this.dcId,
        sysCode:this.sysCode
      },
      success: (obj) => {
        console.log('itemDetail', obj)
        if (obj.status === 200 && obj.data) {
          let data = obj.data
          if (!obj.data||obj.data.length==0){
            alert('活动已结束', {
              success: () => this.goPage()
            })
          }
          wx.setNavigationBarTitle({ title: data.itemName })
          data.itemNowPrice = Number(data.itemNowPrice)
          data.itemDisPrice = Number(data.itemDisPrice)
          data.sellTotalAmt = (parseInt(data.totalSale) || 0) + parseInt(data.saledQty)
          data.startQty = Number(data.startQty)||1
          data.startSpec = Number(data.startSpec)||1
          data.validDay = Number(data.validDay||0)
          data.maxSupplyQty = Number(data.maxSupplyQty)
          data.stockNull = !data.maxSupplyQty || data.maxSupplyQty < data.startQty
          const sellSurplusNum = data.maxSupplyQty - data.saledQty
          data.sellSurplusNum = sellSurplusNum > 0 ? sellSurplusNum : 0
          if (this.goodsType !== 'express') {

            data.itemDesc = data.itemDesc.replace(/&nbsp;/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<\/span>/g, '')
            // .replace(/<span>/g, '').replace(/<\/span>/g, '').replace(/<span style="text-align: right;">/g, '')
            if (data.itemDesc.indexOf('</p>') != -1 || data.itemDesc.indexOf('</b>') != -1 || data.itemDesc.indexOf('<br>') != -1) {
              this.setItemDescSize(data.itemDesc)
              data.itemDesc = ''
            }
          }
          console.log(data)
         
          this.setData({
            goods: data,
            imgList: (data.itemDetailPic ? data.itemDetailPic.TrimEnd(",").split(',') : []),
            imgTextUrls: (data.itemDescPic ? data.itemDescPic.TrimEnd(",").split(',') : []),
            loading: true
          })
          this.refreshData()
        } else {
          alert('活动已结束', {
            success: () => this.goPage()
          })
        }
      },
      error:()=>{
        alert('获取商品失败，请稍后再试', {
          success: () => this.goPage()
        })
      },
      complete: () => {
        hideLoading()
        wx.stopPullDownRefresh()
      }
    })
  },
  setItemDescSize(str) {
    let itemDescList = []
    let strArr = []
    str.split('<span style="').forEach((s, i) => {
      if (i) s = s.substring(s.indexOf('>') + 1)
      s.split('<b style="').forEach((s2, i2) => {
        if (i2) s2 = s2.substring(s2.indexOf('>') + 1)
        strArr.push(s2)
      })
    })
    strArr.join('').split('</p>').forEach(text => {
      text.split('<br>').forEach(item => {
        if (item) {
          let data = { content: [], style: '' }
          item.substring(item.indexOf('>') + 1).split('<b>').forEach(cont => {
            if (cont) {
              if (cont.indexOf('</b>') == -1) {
                data.content.push({ content: cont, style: '' })
              } else {
                var contArr = cont.split('</b>')
                for (let i = 0; i < contArr.length; i++) {
                  var cont2 = contArr[i]
                  if (cont2) {
                    data.content.push({ content: cont2, style: i ? '' : 'font-weight: bold;' })
                  }
                }
              }
            }
          })
          var styleIndexz = item.indexOf('style="')
          if (styleIndexz != -1) {
            styleIndexz += 7
            var str2 = item.substring(styleIndexz)
            data.style = str2.substring(0, str2.indexOf('"'))
          }
          itemDescList.push(data)
        }
      })
    })
    this.setData({ itemDescList })
  },
  changeGoodsNum(e) {
    const type = e.currentTarget.dataset.type
    const goods = this.data.goods
    if (type =="minus"){
      shoppingCart.minusGoods(goods);
    }else{
      if (goods.stockNull) return
       shoppingCart.addGoods(goods);
    }
    this.refreshData();
  },
  goDownOrders() {

    let cartsNum = shoppingCart.getGoodsCount()
    if (cartsNum){
      showLoading()
      let promotionGoods = this.data.allPromotionGoods
      dispatch[types.VERIFY_STOCK]({
        allPromotionGoods: promotionGoods,
        success: (ret, allPromotionGoods) => {
          if (!ret) {
            goPage('liquidation', {
              openType: 'goods'
            })
            
          } else {
            this.setData({ allPromotionGoods });
          }
        }
      })
    }else{
      wx.switchTab({ url: "/pages/carts/carts"})
    }

  },
  goPage(e){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    const page = e ? e.currentTarget.dataset.page : 'index'
    if (this.openType!='share'&&prevPage.data.selected == page) {
      wx.navigateBack()
    } else {
      goTabBar(page)
    }
  }
})
