import { setUrlObj2, showLoading, hideLoading, alert } from '../../tool/index.js'
import API from '../../api/index.js'
// pages/posCarts/posCarts.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // reqBaseUrl: 'https://yunpos.zksr.cn/',
    // reqBaseUrl: 'http://192.168.2.17:8103/',
    reqBaseUrl: 'http://bczm4p.natappfree.cc/',
    isPaymenting: false, // 是否在支付中（在支付中不能取消订单）
    url: '',
    carNo: '', // 购物车编号
    eid: '',
    sid: '',
    uid: '',
    goodsData: [], // 购物车商品
    totalNum: 0,   // 商品总数
    totalAmt: 0,   // 商品总价 
    pageType: 1, // 1: 购物车  2：结算结果 3: 购物车取消支付页 4: 购物车无商品
    switchPayWayTransition: { // 切换支付方式框过度效果
      height: 0,
    },
    payWayList: [
      { type: 1, img: '../../images/balance_pay.png', name: '余额支付', checkout: { value: 'balance', checked: false } },
      { type: 2, img: '../../images/w_pay.png', name: '微信支付', checkout: { value: 'wx', checked: true } }
    ]
  },

  onUnload(){ if (this.data.pageType == '1') this.cancelOrder(); console.log(99999999, '结算取消') },
  onHide(res) { if (this.data.pageType == '1' && this.data.isPaymenting === false) this.cancelOrder(); console.log(88888, '结算取消', res) },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('这是参数1', options)
    const url = decodeURIComponent(options.q)
    this.setData({ url: url.slice(15) })
    const obj = setUrlObj2(url)
    this.getGoodsData(obj['carNo'])
    this.data.carNo = obj['carNo']
    console.log(obj)
  },
  orderComfire() {
    wx.reLaunch({ url: '/pages/tabBar/tabBar' })
  },
  // 加载默认图
  defaultImg(e) {
    const { index } = e.currentTarget.dataset
    const { goodsData } = this.data
    const item = goodsData[index]
    item.defImg = true
    item.image = '../../images/moren.png'
    this.setData({ [`goodsData[${index}]`]: item })
  },
  posRequest(obj) {
    wx.request({
      url: this.data.reqBaseUrl + obj.url,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      dataType: 'json',
      data: obj.data,
      success(res) {
        obj.success(res)
      },
      fail(err) {
        console.log(err)
        obj.fail(err)
      }
    })
  },
  // 获取购物车商品
  getGoodsData(cartNo = this.data.carNo) {
    const _this = this
    showLoading('加载中')
    return new Promise((resolve, reject) => {
      this.posRequest({
        url: 'selfsale/order/getSelfCartList',
        data: { uid: 2, cartNo },
        success(res) {
          console.log(res)
          if (res.data.status === 200) {
            const goodsData = res.data.data
            if (goodsData.length === 0) {
              _this.setData({ pageType: 4 }) 
              hideLoading()
              return 
            }
            let resObj = {
              goodsData,   // 商品信息
              deviceId: goodsData[0].deviceId,
              eid: goodsData[0].eid,
              sid: goodsData[0].sid,
              uid: goodsData[0].uid,
              totalNum: 0, // 商品总数
              totalAmt: 0, // 商品总价
            }
            
            goodsData.forEach(item => {
              resObj.totalNum += item.num
              resObj.totalAmt += item.price * item.num; item.totalAmt = item.price * item.num
            })
            resObj.totalNum = resObj.totalNum.toFixed(0)
            resObj.totalAmt = resObj.totalAmt.toFixed(2)
            resObj.pageType = 1
            _this.setData(resObj)
            resolve(resObj)
            hideLoading()
          } else {
            reject(res)
            _this.errorDialog('获取数据失败，请检查网络后重试')
          }
        },
        fail(err) {
          _this.errorDialog('获取数据失败，请检查网络后重试')
        }
      })
    })
    
  },
  // 结算信息处理
  settlementHandle() {
    const { uid, sid, eid, totalNum, totalAmt, goodsData, carNo: cartNo, deviceId } = this.data
    // 请求对象
    const reqObj = {
      uid, sid, eid, totalNum, totalAmt,
      payAmt: totalAmt,
      payWay: 'wx',
      orderState: 1,
      payState: 0,
      cartNo,
      memberId: 0,      // 用户id.   暂时不传
      memberName: 0,    // 用户名称  暂时不传
      memberPhone: 0,   // 用户手机  暂时不传
      deviceId,
      itemList: [],
    }
    // itemList 处理
    goodsData.forEach((item, index) => {
      const itemObj = {
        uid, 
        sid, 
        eid, 
        cartNo, 
        // deviceId,
        productId: 0, 
        salePrice: 0,
        saleNum: 0, 
        saleAmt: 0
      }
      itemObj['productId'] = item['productId']
      itemObj['saleNum'] = item['num']
      itemObj['salePrice'] = item['price']
      itemObj['saleAmt'] = Number(item['totalAmt'].toFixed(2))
      reqObj.itemList.push(itemObj)
    })
    reqObj.itemList = JSON.stringify(reqObj.itemList)
    console.log(reqObj)
    showLoading('请稍后...')
    this.saveOrder(reqObj)
  },
  // 保存订单数据处理, 刷新购物车，比较金额，查看是否有变动
  async confirmClick() {
    console.log(321)
    const { totalAmt: oldTotalAmt } = this.data
    const newTotalAmt = await this.getGoodsData().then(obj => obj.totalAmt)
    console.log(newTotalAmt, oldTotalAmt)
    if (newTotalAmt != oldTotalAmt) {
      alert(`价格已更新，共需支付【${newTotalAmt}】 元`, {
        success() {
          this.settlementHandle()
        }
      })
    } else {
      this.settlementHandle()
    }
  },
  // 保存订单
  saveOrder(reqObj) {
    const _this = this
    this.posRequest({
      url: 'selfsale/order/saveOrder',
      data: reqObj,
      success(res) {
        console.log(res)
        if (res.data.status == 200) {
          const orderNo = res.data.data
          _this.orderPay(orderNo) // 支付
        } else {
          _this.errorDialog('保存订单失败，请检查网络后重试')
        }
      },
      fali(err) {
        _this.errorDialog('保存订单失败，请检查网络后重试')
      },
      complete() {}
    })
  },
  // 保存订单或支付错误提示
  errorDialog(text) {
    hideLoading()
    // alert(text, {
    //   success() {
    //     wx.reLaunch({ url: '/pages/tabBar/tabBar' })
    //   }
    // })
  },
  getWXCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (codeData) => {
          console.log(codeData)
          resolve(codeData.code)
        },
        fail(err) {
          reject(err)
        }
      })
    })
  },
  async orderPay(orderNo) {
    const _this = this
    const { uid, sid, totalAmt, deviceId } = this.data
    const reqObj = {
      code: await this.getWXCode().then(code => code),
      uid,
      sid,
      orderAmount: totalAmt,
      deviceId,
      totalFee: totalAmt,
      orderNo
    }
    this.posRequest({
      url: 'selfsale/order/orderPay',
      data: reqObj,
      success(res) {
        console.log(res)
        if(res.data.status == 200 && 'finalpackage' in res.data.data) {
          _this.wxPay(res.data.data['finalpackage'])
          hideLoading()
        } else {
          _this.errorDialog('订单支付失败，请检查网络后重试')
        }
      },
      fail() {
        _this.errorDialog('订单支付失败，请检查网络后重试')
      }
    })
  },
  wxPay(data) {
    this.data.isPaymenting = true
    setTimeout(() => { this.cancelOrder() }, 30000) // 30s 未支付自动取消订单
    const _this = this
    wx.requestPayment({
      'timeStamp': data.timeStamp,
      'nonceStr': data.nonceStr,
      'package': data.package,
      'signType': data.signType,
      'paySign': data.paySign,
      success: ret => {
        console.log(ret)
        _this.setData({ pageType: 2 }) // success
      },
      fail: (err) => {
        console.log(53, err)
        _this.data.isPaymenting = false
        _this.errorDialog('订单支付失败，请检查网络后重试')
      }
    })
    
    console.log(10, '挑起支付完成')
  },
  checkChangeClick(e) {
    const { index } = e.currentTarget.dataset
    const { payWayList } = this.data
    if(payWayList[index].checkout.checked) return
    payWayList.forEach(item => {
      item.checkout.checked = false
    })
    payWayList[index].checkout.checked = true
    this.setData({ payWayList })
  },

  // 显示 switch pay way 框
  switchPayWayDialogClick() {
    const { switchPayWayTransition } = this.data
    if (switchPayWayTransition.height == 'auto') return 
    switchPayWayTransition.height = '300rpx'
    this.setData({ switchPayWayTransition })
  },
  
  // 隐藏 switch pay way 框
  hideSwitchPayWayDialogClick() {
    const { switchPayWayTransition } = this.data
    if (switchPayWayTransition.height == 0) return 
    switchPayWayTransition.height = '0'
    this.setData({ switchPayWayTransition })
  },
  // 页面隐藏或销毁时取消订单
  cancelOrder() {
    const { carNo: cartNo, uid, goodsData } = this.data
    const _this = this
    this.posRequest({
      url: 'selfsale/order/cancelOrder',
      data: { cartNo, uid, deviceId: goodsData[0].deviceId },
      success(res) {
        console.log(res)
        _this.setData({ pageType: 3, cartNo: '' })
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (opt) {
    console.log('onshow', opt)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})