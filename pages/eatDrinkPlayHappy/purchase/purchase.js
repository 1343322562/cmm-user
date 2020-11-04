import API from '../../../api/index.js'
import { showLoading, hideLoading, toast, goPage, alert } from '../../../tool/index.js'
Page({
  data: {
    userName:'',
    userArea:'',
    userAddr:'',
    userPhone:'',
    memo:'',
    goods:{},
    totalNum:1,
    totalAmt: 0,
    shop:{},
    imgBaseUrl: getApp().data.imgBaseUrl
  },
  getShopInfo(supplierNo) {
    API.Play.getChSupplier({
      data: {
        chSupplierNo: supplierNo
      },
      success: ret => {
        console.log(ret)
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
  getPageData(itemId) {
    showLoading()
    const { openId, sysCode, colonelId, dcId, userId } = getApp().data
    API.Play.itemDetail({
      data: {
        itemId: itemId,
        openid: openId
      },
      success: ret => {
        hideLoading()
        let goods = ret.data
        if (ret.status == 200 && goods) {
          goods.imgUrl = goods.itemThumbPic.split(',')[0]
          this.setData({ goods, totalAmt: goods.itemNowPrice })
          this.getShopInfo(goods.supplierNo)
        } else {
          alert('活动已结束', {
            success: () => {
              wx.navigateBack()
            }
          })
        }
      },
      error: () => {
        hideLoading()
        toast('网络异常')
      }
    })
  },
  changeNum (e) {
    const {type} = e.currentTarget.dataset
    let { totalNum,goods } = this.data
    let n = totalNum + (type=='0'?-1:1)
    if (n<=0) return
    if (n > goods.buynum) {
      toast('购买数量不能大于库存')
      return
    }
    this.setData({ totalNum: n, totalAmt: Number((n * goods.itemNowPrice).toFixed(2)) })
  },
  getInput (e) {
    let obj ={}
    const {type} = e.currentTarget.dataset
    obj[type] = e.detail.value
    this.setData(obj)
  },
  bindRegionChange (e) {
    let value = e.detail.value||[]
    let userArea = []
    value.forEach(item => {
      userArea.indexOf(item) == -1 && userArea.push(item)
    })
    this.setData({ userArea: userArea.join('') })
  },
  checkOrderdata(Callback) {
    const { openId, sysCode, colonelId, dcId, userId } = getApp().data
    let { goods, totalNum, totalAmt } = this.data
    goods.saleNum = totalNum
    goods.pay_amt = totalAmt
    goods.itemId = goods.id
    API.Play.checkOrderdata({
      data: {
        sysCode,
        userId,
        itemList:JSON.stringify([goods])
      },
      success: ret => {
        if (ret.status == 200) {
          let data = ret.data[0]
          if (!data.maxQty || data.maxQty<=0) {
            hideLoading()
            toast('今日已无法购买')
          } else if (totalNum > data.maxQty) {
            hideLoading()
            toast('最大可购买数量' + data.maxQty)
          } else {
            Callback(ret.data)
          }
        } else {
          hideLoading()
          alert(ret.msg)
        }
      },
      error: () => {
        hideLoading()
        toast('网络异常')
      }
    })
  },
  goOrdersDetails(msg, orderNo) {
    hideLoading()
    alert(msg, {
      success: (o) => {
        setTimeout(() => {
          wx.reLaunch({ url: '/pages/eatDrinkPlayHappy/orderDetails/orderDetails?openType=play&orderNo=' + orderNo })
        }, 300)
      }
    })
  },
  wxPay(orderNo) {
    const { openId, sysCode, colonelId, dcId, userId, storeId } = getApp().data
    let { totalAmt } = this.data
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
              this.goOrdersDetails('支付已取消!', orderNo)
            }
          })
        } else {
          this.goOrdersDetails(ret.msg || '支付失败!', orderNo)
        }

      },
      error: () => {
        this.goOrdersDetails('支付失败', orderNo)
      }
    })
  },
  submit () {
    const {
      // userName,
      // userArea,
      // userAddr,
      // userPhone,
      goods,
      totalNum,
      totalAmt,
      shop,
      memo,
    } = this.data
    const { openId, sysCode, colonelId, dcId, userId, userInfo } = getApp().data
    // if (!userName || !userArea || !userPhone || !userAddr) {
    //   toast(!userName?'请输入姓名':(
    //     !userPhone?'请输入手机号':(
    //       !userArea?'请选择所在区域':(
    //         !userAddr?'请输入详细地址':'信息填写不完整'
    //       )
    //     )
    //   ))
    //   return
    // }
    showLoading()
    this.checkOrderdata((itemList)=> {
      let request = {
        dcId,
        sysCode,
        payWay: 'wx',
        userId,
        colonelId: colonelId || '',
        totalNum,
        totalAmt,
        payAmt: totalAmt,
        memo,
        itemList: JSON.stringify(itemList),
        version: 1.0,
        source: 1,
        locationX: shop.locationX||'0',
        locationY: shop.locationY||'0',
        userName: userInfo.nickName,
        userArea:'',
        userAddr:'',
        userPhone:userInfo.userPhone,
        supplierPhone: shop.contactPhone,
        supplierName: shop.supplierName
      }
      console.log(request)
      hideLoading()
      API.Play.saveOrder2({
        data: request,
        success: ret => {
          let orderNo = ret.data
          if (ret.status == 200 && orderNo) {
            this.wxPay(orderNo)
          } else {
            hideLoading()
            alert(ret.msg)
          }
        },
        error: () => {
          hideLoading()
          alert('下单失败，请检查网络是否正常')
        }
      })
    })
  },
  onLoad (opt) {
    const { openId, sysCode, colonelId, dcId, userId } = getApp().data
    this.getPageData(opt.itemId)
    console.log(opt.itemId)
  }
})