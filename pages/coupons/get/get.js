import {
  rpxToPx,
  setCheckText,
  goPage,
  setUrlObj,
  setNumSize,
  goTabBar
} from '../../../tool/index.js'
import API from '../../../api/index.js'
import UserBusiness from '../../../tool/userBusiness.js'
Page({
  data: {
    haveReceived: false,
    loadInfoComplete: false,
    conponsInfo: {},
    startDate: '',
    endDate: '',
    couponsInvalid:false
  },
  setDateSize(t) {
    //IOS 下  日期字符串  “-”
    if (typeof(t) == 'string') {
      t = t.replace(/-/g, '/').replace('.000', '')
    }
    const time = new Date(t)
    const n = time.getFullYear()
    const y = (time.getMonth() + 1)
    const r = time.getDate()
    return n + '.' + setNumSize(y) + '.' + setNumSize(r)
  },

  createCanvas(conponsInfo){

    const ctx = wx.createCanvasContext('mycanvas')
    // 优惠金额
    ctx.font = "bold " + rpxToPx(400) + "px sans-serif"
    ctx.setFillStyle('red')
    //conponsInfo.discountAmt=198
    let wvalue=50
    if ((conponsInfo.discountAmt + '').length>=5){
      ctx.setFontSize(rpxToPx(140))
      wvalue=40
    } else if ((conponsInfo.discountAmt + '').length >3){
      ctx.setFontSize(rpxToPx(160))
    } else {
      wvalue = 60
      ctx.setFontSize(rpxToPx(200))
    }
    const moneyX = rpxToPx(272)
    const moneyY = rpxToPx(200)
    const money = conponsInfo.discountAmt + ''
    const moneyW = money.length * rpxToPx(wvalue)
    ctx.fillText(money, moneyX - moneyW, moneyY)
    // 符号
    ctx.setFillStyle('red')
    ctx.setFontSize(rpxToPx(70))
    const symbolY = rpxToPx(100)
    ctx.fillText('￥', moneyX - moneyW - rpxToPx(60), symbolY)

    // 优惠券
    ctx.setFillStyle('red')
    ctx.setFontSize(rpxToPx(30))
    let explainStr = conponsInfo.explainStr.split('');
    for (let i = 0; i < explainStr.length; i++) {
      ctx.fillText(explainStr[i], moneyX + moneyW + rpxToPx(20), rpxToPx(140 + (30 * i)))
    }
    ctx.restore()
    ctx.draw()
  },
  getCouponInfo(){
    let that=this
    const { openId, imgBaseUrl, sysCode, dcId, colonelId, userInfo } = getApp().data;
    that.userInfo = userInfo;
    that.dcId = dcId;
    API.Coupons.getCouponInfo({
      data: { dcId: that.dcId, recordId: that.recordId, userId: that.userInfo.userId },
      success: obj => {
        console.log('getCouponInfo优惠卷返回结果',obj)

        if (obj.status == '203') {
          wx.showToast({ title: obj.msg, icon: 'none', duration: 3000 })
          return;
        }


        if(!obj.data){
          wx.showToast({ title:'getCouponInfo接口出错', icon: 'none', duration: 3000 })
          return;
        }
        if (obj.status == 203 || obj.status == 201) {
          wx.showToast({title: (obj.msg), icon: 'none', duration: 3000})
        }

       
        that.setData({
          haveReceived: (obj.status != '200')
        })

        let conponsInfo = obj.data;
        conponsInfo.startDateStr = that.setDateSize(conponsInfo.discountTimeStart),
          conponsInfo.endDateStr = that.setDateSize(conponsInfo.discountTimeEnd)
        const type = conponsInfo.applicableCommodity
        let explain = []
        const details = conponsInfo.details
        conponsInfo.explainStr = (type == '0' ? '全场' : (type == '1' ? '商品' : (type == '3' ? '类别' : '商品'))) + '劵'
        conponsInfo.explainTitle = type == '0' ? '全场商品可用' : (type == '1' ? '仅限指定商品可用' : (type == '3' ? '仅限指定类别商品可用' : '除以下商品都可用'))
        conponsInfo.explain=""
        if (type != '0' && details) {
          details.forEach(goods => {
            explain.push(goods.name)
          })
          conponsInfo.explain = explain.join('、')
        }

        if (conponsInfo.explain.length>40){

          conponsInfo.explain = conponsInfo.explain.substring(0,40)+'...'
        }

        that.createCanvas(conponsInfo)

        that.setData({
          conponsInfo: conponsInfo
        })

        that.setData({
          loadInfoComplete: (obj.status == '200' || obj.status == '202' || obj.status == '201')
        })
        
        if (obj.status == 201) {
          that.setData({ couponsInvalid: true })
          wx.showToast({
            title: (obj.msg), icon: 'none', duration: 6000, complete: function () {
            }
          })
          return;
        }
       

      },
      error: (obj) => {
        wx.showToast({ title: (obj.msg), icon: 'none', duration: 3000 });
      },
      complete: () => {

      }
    });
  },



  onLoad(opt) {

    // const grd = ctx.createLinearGradient(10,10, 0, 80)
    // grd.addColorStop(0, '#ff9b7b')
    // grd.addColorStop(1, '#fa283b')
    // ctx.setFillStyle(grd)
    // ctx.fillRect(10, 10, 150, 80)
    console.log('扫描优惠卷', opt)
    let arrInfo = opt.scene.split('--')
    let dataInfo = { recordId: arrInfo[0], colonelId: arrInfo[2] }
    console.log('扫描优惠卷', dataInfo)

    console.log(dataInfo)
    let colonelId = dataInfo.colonelId;
    let recordId = dataInfo.recordId;
    var that = this
    this.recordId = recordId
    UserBusiness.wxLogin(this, colonelId,()=> {
      this.getCouponInfo()
    });
  },
  HandleGoIndexPage(e) {
    goTabBar('index')
  },
  HandleGetCoupons(e) {

    console.log(this.userInfo.userPhone)
    //this.userInfo.userPhone = ''
    //如果没有授权
    if (!this.userInfo || (!this.userInfo.userPhone && !this.userInfo.userPhone)) {
      goPage('impower', {
        openType: "coupons/get"
      })
      return
    }


    API.Coupons.updateCounponInfoRecord({
      data: {
        dcId: this.dcId,
        recordId: this.recordId,
        userId: this.userInfo.userId,
      },
      success: obj => {
        console.log(obj)
      },
      error: () => { },
      complete: () => {

        this.setData({
          haveReceived: true
        })
        wx.showToast({
          title: ('领取成功'),
          icon: 'none',
          duration: 2000
        })
      }
    });

  }
})