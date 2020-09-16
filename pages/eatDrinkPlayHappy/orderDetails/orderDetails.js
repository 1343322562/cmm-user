import API from '../../../api/index.js'
import { showLoading, hideLoading, toast, goPage, alert, formatTime, goTabBar } from '../../../tool/index.js'
Page({
  data: {
    order:{},
    shop:{},
    showCode:false,
    openType:'',
    imgBaseUrl: getApp().data.imgBaseUrl
  },
  goHome () {
    goTabBar('index')
  },
  getShopInfo(supplierNo) {
    API.Play.getChSupplier({
      data: {
        chSupplierNo: supplierNo
      },
      success: ret => {
        let shop = ret.data
        if (ret.status == 200 && shop) {
          this.setData({ shop })
        }
      },
      error: () => {
        toast('获取商家信息失败')
      }
    })
  },
  getPageData() {
    API.Play.orderDetail({
      data:{
        orderNo: this.orderNo
      },
      success: ret => {
        if (ret.status == 200) { // signForStatus 1 已核销  0 未核销    returnFlag  1 已申请退款  0 未申请
          let order = ret.data;
          order.createdStr = formatTime(order.created)
          order.chOrderDetails.forEach(goods => {
            goods.imgUrl = goods.itemThumbPic.split(',')[0]
            goods.productDetail && (order.productDetail = JSON.parse(goods.productDetail))
            order.useRuler = goods.useRuler
          })
          
          this.setData({ order })
          this.getShopInfo(order.chOrderDetails[0].supplierNo)
        } else {
          alert(ret.msg)
        }
      },
      error: () => {
        toast('网络异常')
      }
    })
  },
  onLoad (opt) {
    this.orderNo = opt.orderNo
    this.getPageData()
    this.setData({ openType: opt.openType})
    console.log(opt)
  },
  callPhone () {
    const { shop } = this.data
    const tel = shop.contactPhone || ''
    if (tel) {
      wx.makePhoneCall({ phoneNumber: tel })
    } else {
      toast('没有商家电话')
    }
  },
  lookCode(e) {
    const order = this.data.order
    this.setData({ showCode: true })
    this.selectComponent("#userCode").getCode(order);
  },
  hideCode() {
    this.setData({ showCode: false })
  },
  goOrdersDetails (msg) {
    hideLoading()
    alert(msg)
  },
  pay () {
    const { openId, sysCode, colonelId, dcId, userId, storeId } = getApp().data
    let { order } = this.data
    const orderNo = order.orderNo
    const totalAmt = order.payAmt
    showLoading()
    API.Play.chOrderPay({
      data: {
        orderNo,
        storeId,
        orderAmount: totalAmt,
        totalFee: totalAmt,
        userId,
        sysCode
      },
      success: ret => {
        if (ret.status == 200 && ret.data.code == 'success') {
          wx.requestPayment({
            'timeStamp': ret.data.finalpackage.timeStamp,
            'nonceStr': ret.data.finalpackage.nonceStr,
            'package': ret.data.finalpackage.package,
            'signType': ret.data.finalpackage.signType,
            'paySign': ret.data.finalpackage.paySign,
            success: () => {
              setTimeout(() => {
                hideLoading()
                wx.reLaunch({
                  url: '/pages/paySuccess/paySuccess?orderNo=' + orderNo + '&openType=play'
                })
              }, 400)
            },
            fail: () => {
              this.goOrdersDetails('支付已取消!')
            }
          })
        } else {
          this.goOrdersDetails(ret.msg||'支付失败!')
        }

      },
      error: () => {
        this.goOrdersDetails('支付失败')
      }
    })
  },
  goRefund () {
    const order = this.data.order
    goPage(['eatDrinkPlayHappy','refund'],{
      orderNo: this.orderNo
    })
  }
})