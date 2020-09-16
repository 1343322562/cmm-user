import commit from '../../store/mutations.js'
import * as types from '../../store/types.js'
import API from '../../api/index.js'
import dispatch from '../../store/actions.js'
import { showLoading, hideLoading, alert, deepCopy, getRemainTime, goPage, getOrderStatusName, goTabBar } from '../../tool/index.js'
Page({
  data: {
    tabIndex: 0,
    tabTitle: [
      ['全部订单', '未付款', '未提货', '已完成'], //, '售后退款'
      ['全部订单', '未付款', '待收货', '已完成'] //, '售后退款'
    ],
    orderType: ['自提', '快递'],
    data: [],
    allObj: {},
    codeShow: false,
    isLoading: false,
    nowPageIndex: "",
    totalPageNum: 0,
    showExpress: false,
    orderType: 0,
    countDownObj: {},
    pageTotalNum: [],
    imgBaseUrl: ''
  },
  goIndex() {
    goTabBar('index')
  },
  changeType(e) {
    const index = e.currentTarget.dataset.index
    if (this.data.orderType == index) return
    this.setData({ orderType: index })
    this.getTop()
    this.loadPageData()
  },
  changeTab(e) {
    const index = e.currentTarget.dataset.index, isLoading = false, data = new Array();
    let { tabIndex } = this.data
    if (index == 4) {
      goPage(['afterSale', 'ordersList'])
      return
    }
    if (index !== tabIndex) {
      this.setData({ data, isLoading, tabIndex: index })
      this.getTop()
      this.loadPageData()
    }
  },
  goDetails(e) {
    const orderNo = e.currentTarget.dataset.no
    goPage('ordersDetails', { orderNo: orderNo, orderType: this.data.orderType == 0 ? 'home' : 'express' })
  },
  pay(e) {
    const orderNo = e.currentTarget.dataset.no
    const order = this.data.allObj[orderNo]
    showLoading()
    wx.login({
      success: ret => {
        API.Public.getSubOpenid({
          data: {
            code: ret.code,
            storeId: order.storeId || '',
            dcId: order.dcId || '',
            sysCode: String(order.sysCode)
          },
          success: obj => {
            const subOpenId = obj.data
            if (obj.status === 200 && subOpenId) {
              API.Public[this.data.orderType == 0 ? 'orderPay' : 'orderPay']({
                data: {
                  body: this.sourceName,
                  orderNo: orderNo,
                  storeId: order.storeId || '',
                  subOpenid: subOpenId,
                  orderAmount: order.payAmt,
                  totalFee: order.payAmt,
                  userId: this.userInfo.userId
                },
                success: data => {
                  if (data.status === 200 && data.data.code === 'success') {
                    wx.requestPayment({
                      'timeStamp': data.data.finalpackage.timeStamp,
                      'nonceStr': data.data.finalpackage.nonceStr,
                      'package': data.data.finalpackage.package,
                      'signType': data.data.finalpackage.signType,
                      'paySign': data.data.finalpackage.paySign,
                      success: () => {
                        setTimeout(() => {
                          hideLoading()
                          wx.reLaunch({
                            url: '/pages/paySuccess/paySuccess?orderNo=' + orderNo + '&orderType=' + (this.data.orderType === 0 ? 'home' : 'express')
                          })
                        }, 400)
                      },
                      fail: () => {
                        this.payError('支付已取消!', orderNo)
                      }
                    })
                  } else {
                    this.payError(data.msg, orderNo)
                  }
                },
                error: () => {
                  this.payError('支付失败', orderNo)
                }
              })
            } else {
              this.payError('支付失败!', orderNo)
            }
          },
          error: () => {
            this.payError('支付失败', orderNo)
          }
        })
      },
      fail: () => {
        this.payError('调用微信支付失败', orderNo)
      }
    })
  },
  payError(msg) {
    hideLoading()
    alert(msg)
  },
  getPageData(type) {
    showLoading()
    let { tabIndex, orderType, data } = this.data
    API.Orders[orderType == 0 ? 'orderListByPageNo' : 'orderListByPageNo']({
      data: {
        openid: this.openId,
        pageIndex: this.pageIndex || 1,
        dcId:this.dcId,
        sysCode:this.sysCode,
        userId:this.userId,
        pageSize: "20",
        type: (tabIndex + 1)
      },
      success: ret => {
        const obj = ret.data || {}
        const list = obj.data || []
        let newData = type ? data : new Array();
        this.totalPageNum = obj.pageNum || 0;
        let allObj = type ? this.data.allObj : {}
        const nowTime = (+new Date())
        let countDownObj = {}
        let countDown
        list.forEach(item => {
          const time = new Date(item.created)
          const beforeTime = item.created + (1000 * 60 * 15)
          const no = item.orderNo
          const index = (item.orderState === '1' ? (item.payState === '1' ? 2 : 1) : (item.orderState === '2' ? 3 : 0))
          if (index === 1 && nowTime < beforeTime) {
            countDownObj[no] = { time: beforeTime }
            countDown = true
          }
          item.images = item.itemThumbPics ? item.itemThumbPics.split(',') : []
          item.createDate = time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate() + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()
          // let orderStateName = item.orderState == '1'
          //   ? (item.payState == "0" ? "等待付款" : "待收货")
          //   : (item.orderState == '2' ? '已完成' : '未完成')
          // if (item.orderState == '3') {
          //   orderStateName = '已取消'
          // }
          // if (item.orderState == '4') {
          //   orderStateName = '配送中'
          // }
          // if (item.orderState == '9') {
          //   orderStateName = '分拣中'
          // }
          item.orderStateName = getOrderStatusName(item.orderState, item.payState) // orderStateName
          allObj[no] = item
          newData.push(no)
        })
        this.isLoadMore = null;
        this.setData({ data: newData, isLoading: true, nowPageIndex: this.pageIndex, totalPageNum: this.totalPageNum, countDownObj: countDownObj, allObj: allObj })
        type || this.getTop()
        countDown && this.getServerTime()
      },
      error: () => {
        alert('获取订单失败，请检查网络是否正常')
      },
      complete: () => {
        hideLoading()
        this.setData({ isLoading: true })
      }
    })
  },
  getServerTime() {
    API.Public.currentTimeMillis({
      success: (obj) => {
        this.startcountDown(obj)
      },
      error: () => {
        this.startcountDown(+new Date())
      }
    })
  },
  startcountDown(serverTime) {
    this.time && clearInterval(this.time)
    const nowTime = +new Date()
    this.setCount(serverTime, nowTime)
    this.time = setInterval(() => {
      this.setCount(serverTime, nowTime)
    }, 1000)
  },
  setCount(serverTime, nowTime) {
    let countDownObj = deepCopy(this.data.countDownObj)
    for (let i in countDownObj) {
      const item = countDownObj[i].time
      const countDown = getRemainTime(item, nowTime, serverTime)
      if (!countDown) {
        clearInterval(this.time)
        this.loadPageData()
        return
      }
      countDownObj[i].countDown = countDown[1] + ':' + countDown[2]
    }
    this.setData({ countDownObj })
  },
  getTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
  },
  loadPageData() {
    this.isLoadMore = null;
    this.pageIndex = 1;
    this.getPageData()
  },
  onLoad(opt) {
    const { tabBarList, openId, storeId, userInfo, shopInfo, imgBaseUrl, sourceName, source,dcId,sysCode } = getApp().data
    this.openId = openId
    this.storeId = storeId
    this.userInfo = userInfo
    this.shopInfo = shopInfo
    this.sourceName = sourceName
    this.dcId=dcId
    this.sysCode = sysCode
    this.userId = userInfo.userId


    //const showExpress = tabBarList[1].show || source == '0'
    const showExpress=true
    let orderType = 1
    const type = Number(opt.orderType)
    let tabIndex
    if (showExpress && type === 3) {
      orderType = 1
      tabIndex = 2
    } else if (type === 4) {
      tabIndex = 3
    } else {
      tabIndex = type
    }
    this.setData({ tabIndex, showExpress, orderType, imgBaseUrl })
    this.loadPageData()
  },
  clearTime() {
    this.time && clearInterval(this.time)
  },
  onReady() {
  },
  onShow() {
    if (wx.getStorageSync('upDateOrderList')) {
      this.loadPageData()
      wx.removeStorageSync('upDateOrderList')
    }
    this.getServerTime()
  },
  onHide() {
    this.clearTime()
  },
  onUnload() {
    this.clearTime()
  },
  onReachBottom() {
    if (!this.isLoadMore && this.totalPageNum > this.pageIndex) {
      this.pageIndex++;
      this.isLoadMore = true;
      this.getPageData(true);
    }
  }
})