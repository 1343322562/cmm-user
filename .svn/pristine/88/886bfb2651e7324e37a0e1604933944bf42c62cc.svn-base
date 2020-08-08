import API from '../../api/index.js'
import { toast, alert, showLoading, hideLoading } from '../../tool/index.js'
Component({
  properties: {
    show: Boolean,
    order: {
      type: Object,
      observer(newVal, oldVal) {
        newVal.czPayAmt = Number(newVal.czPayAmt)
        newVal.sheetAmt = Number((newVal.sheetAmt - newVal.czPayAmt).toFixed(2))
        this.setData({ order: newVal})
        this.init(newVal.payWay=='4')
        this.baseOrderObj = newVal
        this.setOrderAction()
      }
    },
    storedValue: Number
  },
  data: {
    payWayList: [
      { name: '储值支付', type: '2', icon: 'yue', show: true },
      { name: '微信支付', type: '1', icon: 'wx', show: true },
      { name: '货到付款', type: '0', icon: 'hdfk', show: true }
    ],
    payWay: '', // 支付方式 0货到付款 1在线支付 2储值支付 4混合支付
    totalMoney: 0, // 商品总金额
    discountsMoney: 0,// 优惠总金额
    realPayAmt: 0, // 实付金额
  },
  attached () {
    //this.init()
  },
  methods: {
    init (type) {
      const {
        defaultPayWay, // 默认为空   0货到付款   1储值支付    2微信支付  3支付宝支付  4易宝支付
        codPay, // 货到付款
        czPay, // 储值支付
        wxPay, // 微信支付
        codPayMjFlag, // 货到付款是否支持满减 1:支持
        autoCoupons, // 货到付款是否支持优惠券 1:支持
        codPayMzFlag, // 货到付款是否支持满赠 1:支持
      } = wx.getStorageSync('configObj')
      this.userObj = wx.getStorageSync('userObj')
      this.codPayMjFlag = codPayMjFlag
      this.autoCoupons = autoCoupons
      this.codPayMzFlag = codPayMzFlag
      let payWayList = this.data.payWayList
      payWayList[0].show = type ? false : czPay == '1'
      payWayList[1].show = wxPay == '1'
      payWayList[2].show = codPay == '1'
      this.setData({
        payWayList: payWayList,
        payWay: (defaultPayWay ? (
          (defaultPayWay == '1' && payWayList[0].show) ? '2' :
            ((defaultPayWay == '2' && payWayList[1].show) ? '1' :
              ((defaultPayWay == '0' && payWayList[2].show) ? defaultPayWay : ''))) : ''
        )
      })
    },
    setOrderAction() { // discountAmt 满减  couponsAmt 优惠券
      const { sheetAmt, couponsAmt, discountAmt, realSheetAmt } = this.baseOrderObj
      const payWay = this.data.payWay
      let totalMoney = Number(realSheetAmt)||sheetAmt
      let realPayAmt = totalMoney
      let discountsMoney = 0
      if ((payWay != '0' || this.autoCoupons == '1') && couponsAmt) {
        discountsMoney += couponsAmt
      }
      if ((payWay != '0' || this.codPayMjFlag == '1') && discountAmt) {
        discountsMoney += discountAmt
      }
      if (payWay)
      realPayAmt = Number((realPayAmt - discountsMoney).toFixed(2))
      this.setData({ totalMoney, realPayAmt, discountsMoney})
    },
    quit () {
      this.triggerEvent('hidePay')
    },
    changePayWay(e) {
      let payWay = e.currentTarget.dataset.type
      this.setData({ payWay })
      this.setOrderAction()
    },
    payError (msg) {
      hideLoading()
      alert(msg)
    },
    paySuccess () {
      wx.removeStorage({ key: 'promotionTime' })
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/paySuccess/paySuccess?payType=ok&orderNo=' + this.baseOrderObj.sheetNo,
        })
      }, 200)
    },
    confirmPay () {
      const { payWay, realPayAmt, storedValue} = this.data
      
      if (!payWay) { toast('请选择支付方式'); return }
      if (payWay == '2' && storedValue < realPayAmt) { toast('余额不足'); return }
      showLoading('支付中...')
      const { memo, itemNos, sheetNo, transNo, ticketType, couponsAmt, payWay: orderPayWay, czPayAmt} = this.baseOrderObj
      const { username, platform, token, branchNo, dbBranchNo } = this.userObj
      let request = {
        token,
        platform,
        username,
        itemNos,
        sheetNo,
        transNo,
        payWay: orderPayWay == '4' ? '4' : payWay,
        branchNo,
        ticketType,
        couponsAmt: ((payWay != '0' || this.autoCoupons == '1') && couponsAmt)?String(couponsAmt):'0',
        memo: memo,
        poundage:'0',
        inBranchNo: branchNo,
        outBranchNo: dbBranchNo,
        onlinePayway: payWay == '1' ? 'WX' : '',/* 在线支付方式  WX微信支付ZFB支付宝YEE易宝支付TL通联支付UN银联支付 */
        onlinePayAmtString: String(payWay == '1' ? realPayAmt : 0),/*线上支付金额*/
        czPayAmtString: String(payWay == '2' ? realPayAmt : 0), // 储值支付金额
        codPayAmtString: String(payWay == '0' ? realPayAmt : 0), // 货到付款
      }
      if (orderPayWay == '4') {
        request.czPayAmtString = String(czPayAmt)
        request[payWay == '0' ? 'codPayAmtString' : 'onlinePayAmtString'] = String(realPayAmt)
      }
      API.Orders.orderpay({
        data: request,
        success: res => {
          console.log(res)
          if (res.code == 0) {
            if (payWay == '1') { // 微信支付
              this.wxPay()
            } else {
              this.paySuccess()
            }
          } else {
            this.payError(res.msg||'系统异常')
          }
        },
        error: () => {
          this.payError('支付失败，请检查网络是否正常.')
        }
      })
    },
    wxPay() {
      const openId = wx.getStorageSync('openId')
      const {  username, platform } = this.userObj
      const sheetNo = this.baseOrderObj.sheetNo
      wx.login({
        success: (codeData)=> {
          console.log({ code: codeData.code, out_trade_no: sheetNo, body: '具体信息请查看小程序订单中心', openId: openId, platform, username })
          API.Liquidation.getMiniPayParameters({
            data: { code: codeData.code, out_trade_no: sheetNo, body: '具体信息请查看小程序订单中心', openId: openId, platform, username },
            success: res => {
              console.log('成功',res)
              if (res.code == 0 && res.data) {
                wx.requestPayment({
                  'timeStamp': res.data.timeStamp, // 时间戳
                  'nonceStr': res.data.nonceStr,
                  'package': res.data.package,   // prepay_id 参数值
                  'signType': res.data.signType,
                  'paySign': res.data.sign,
                  success: ret => {
                    this.paySuccess()
                  },
                  fail: (res) => {
                    console.log('失败',res)
                    this.payError('支付已取消')
                  }
                })
              } else {
                this.payError(res.msg)
              }
            },
            error: () => {
              this.payError('获取支付配置失败,请检查网络是否正常。')
            }
          })
        },
        fail: () => {
          this.payError('获取code失败')
        }
      })
      
    }
  }
})
