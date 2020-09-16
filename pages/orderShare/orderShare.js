import API from '../../api/index.js'
import { showLoading, hideLoading, alert, toast, setUrl, rpxToPx, downRefreshVerify, setCheckText, goTabBar } from '../../tool/index.js'
import * as types from '../../store/types.js'
import dispatch from '../../store/actions.js'
Page({
  data: {
    openType:'',
    userInfo:{},
    goodsList:[]
  },
  saveImg () {
    dispatch[types.CANVAS_SAVE_IMAGES]({
      canvasId: 'mycanvas',
      success: ()=>{
        wx.hideToast()
        alert('保存图片成功',{
          success: this.goIndex
        })
      }
    }, this)
  },
  goIndex () {
    goTabBar('index')
  },
  getPageData () {
    showLoading()
    API.Orders.orderDetailShare({
      data: {
        userId: this.userId,
        orderNo: this.orderNo,
      },
      success: obj => {
        console.log('orderDetailShare', obj)
        const data = obj.data;
        if (obj.status == 200 && data) {
          const userInfo = { img: data.userPic, name: data.nickName}
          let goodsList = []
          data.itemList.forEach(goods=> {
          
            goodsList.push({
              name: goods.itemName,
              img: goods.itemThumbPic,
              itemNowPrice: goods.itemNowPrice,
              itemDisPrice: goods.itemDisPrice,
              num: goods.saleNum,
              unit: goods.itemUnit
            })
          })
          getApp().data.colonelId || (getApp().data.colonelId = data.itemList[0].colonelId)
          this.setData({ userInfo, goodsList })
          if (this.data.openType == 'share') {
            hideLoading()
          } else {
            showLoading('生成海报')
            this.goodsList = goodsList
            goodsList.forEach((item, index) => {
              this.downLoadImg(index)
            })
            const { storeMode, storeColonelId } = getApp().data
            wx.downloadFile({

              url: API.Public.storeURL + 'colonel/storeQrCode?identify=0&source=0&page=pages/orderShare/orderShare&scene=' + (this.orderNo + '_' + this.userId + (storeMode ? ('_' + storeColonelId):'')),
              success: (res) => {
                const code = res.tempFilePath
                wx.downloadFile({
                  url: this.data.userInfo.img,
                  success: (ret) => {
                    this.userImg = ret.tempFilePath
                  },
                  complete:()=>{
                    this.createCanvas(code)
                  }
                })
              },
              fail: () => {
                hideLoading()
                toast('获取二维码失败')
              }
            })
          }
        } else {
          hideLoading()
          alert(obj.msg,{
            success: this.goIndex
          })
        }
      },
      error: () => {
        hideLoading()
        alert('网络异常，请稍后再试', {
          success: this.goIndex
        })
      }
    })
  },
  onLoad (opt) {
    console.log('opt', opt)
    if (opt.scene) {
      const obj = opt.scene.split('_')
      opt.orderNo = obj[0]
      this.userId = obj[1]
      if (obj[2]) {
        getApp().data.storeMode = true
        getApp().data.storeColonelId = obj[2]
        getApp().data.colonelId = obj[2]
      }
      opt.openType = 'share'
    } else {
      this.userId = getApp().data.userId
    }
    this.orderNo = opt.orderNo
    this.setData({openType: opt.openType||''})
    this.getPageData()
    
    
  },
  downLoadImg(index) {
    let url = this.goodsList[index].img.replace(new RegExp(/http:/g), 'https:')
    wx.downloadFile({
      url: url,
      success: (ret) => {
        this.goodsList[index].tempFilePath = ret.tempFilePath
      }
    })
  },
  createCanvas (code) {
    const ctx = wx.createCanvasContext('mycanvas')
    const {userInfo} = this.data
    console.log('userInfo', userInfo)
    ctx.rect(0, 0, rpxToPx(750), rpxToPx(1100))
    ctx.drawImage('../../images/order_share_bg1.png', 0, 0, rpxToPx(750), rpxToPx(295))
    ctx.drawImage('../../images/order_share_img_bg.png', rpxToPx(95), rpxToPx(175), rpxToPx(110), rpxToPx(110))
    // 绘制微信头像
    ctx.save()
    ctx.beginPath()
    ctx.arc(rpxToPx(150), rpxToPx(230), rpxToPx(50), 0, Math.PI * 2, false)
    ctx.clip()
    ctx.drawImage(this.userImg||'', rpxToPx(100), rpxToPx(180), rpxToPx(100), rpxToPx(100))
    ctx.restore()
    // 介绍
    ctx.setFillStyle('#ffffff')
    ctx.setFontSize(rpxToPx(23))
    const introduce = setCheckText(ctx, "我是“" + userInfo.name+"”,我在仓买买购买了" + this.goodsList.length+"件商品,你们快来帮我比比价,看我是否买的值", rpxToPx(390), 3)
    introduce.forEach((n, z) => {
      ctx.fillText(n, rpxToPx(230), rpxToPx(215 + (z * 30)))
    })
    // 商品信息
    const bg2H = this.goodsList.length * 173
    ctx.drawImage('../../images/order_share_bg2.png', rpxToPx(0), rpxToPx(294), rpxToPx(750), rpxToPx(bg2H))
    this.goodsList.forEach((goods, index) => {
      const goodsBgH = 295 + (index * 165)
      ctx.drawImage('../../images/order_share_goods_bg.png', rpxToPx(30), rpxToPx(goodsBgH), rpxToPx(680), rpxToPx(173))
      //顺序
      ctx.drawImage('../../images/order_goods_sx.png', rpxToPx(200), rpxToPx(goodsBgH + 40), rpxToPx(40), rpxToPx(40))
      ctx.setFillStyle('#ffffff')
      ctx.setFontSize(rpxToPx(23))
      ctx.setTextAlign('center')
      ctx.fillText(String(index + 1), rpxToPx(220), rpxToPx(goodsBgH + 68))
      // 商品名称
      ctx.setTextAlign('left')
      ctx.setFillStyle('#8b4021')
      ctx.setFontSize(rpxToPx(32))
      const goodsName = setCheckText(ctx, goods.name, rpxToPx(400), 1)
      goodsName.forEach(item=>{
        ctx.fillText(item, rpxToPx(250), rpxToPx(goodsBgH + 72))
      })
      // 商品价格
      ctx.setFillStyle('#fb5301')
      ctx.setFontSize(rpxToPx(36))
      ctx.setTextAlign('right')
      ctx.fillText('￥' + goods.itemNowPrice+'/'+goods.unit, rpxToPx(420), rpxToPx(goodsBgH + 130))
      ctx.setFillStyle('#c5a78f')
      ctx.setFontSize(rpxToPx(30))
      ctx.setTextAlign('left')
      const befored = '￥' + goods.itemDisPrice
      ctx.fillText(befored, rpxToPx(430), rpxToPx(goodsBgH + 130))
      ctx.beginPath()
      ctx.setStrokeStyle('#c5a78f')
      ctx.moveTo(rpxToPx(430), rpxToPx(goodsBgH + 120))
      ctx.lineTo(rpxToPx(430) + ctx.measureText(befored).width, rpxToPx(goodsBgH + 120))
      ctx.stroke()
      // 商品数量
      ctx.setFillStyle('#9e9e9e')
      ctx.setFontSize(rpxToPx(26))
      ctx.setTextAlign('center')
      ctx.fillText('x' + goods.num + goods.unit, rpxToPx(650), rpxToPx(goodsBgH + 110))
      // 商品图片
      ctx.save()
      ctx.beginPath()
      ctx.arc(rpxToPx(112), rpxToPx(goodsBgH + 82), rpxToPx(60), 0, Math.PI * 2, false)
      ctx.clip()
      ctx.drawImage(goods.tempFilePath ||'../../images/order_share_goods_default.png', rpxToPx(52), rpxToPx(goodsBgH + 22), rpxToPx(120), rpxToPx(120))
      ctx.restore()
    })
    // 二维码
    ctx.drawImage('../../images/order_share_bg3.png', rpxToPx(0), rpxToPx(bg2H + 290), rpxToPx(750), rpxToPx(494))
    ctx.drawImage(code, rpxToPx(280), rpxToPx(bg2H + 290 + 130), rpxToPx(190), rpxToPx(190))

    ctx.restore()
    ctx.draw()
    hideLoading()
  },
  onShareAppMessage: function (res) {
    let goodsList = this.data.goodsList
    let [payAmy, subAmt] = [0, 0] 
    console.log(goodsList)
    goodsList.forEach(item => {
      payAmy += Number(item.itemNowPrice) * Number(item.num)
      subAmt += Number(item.itemDisPrice - item.itemNowPrice) * Number(item.num)
    })
    
    console.log(goodsList, payAmy, subAmt)
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: `我已经下单啦。共${goodsList.length}种商品，合计${payAmy}元，节省${subAmt}元`,
      path: 'pages/tabBar/tabBar?page=list'
    }
  },

  onReady () {
  }
})