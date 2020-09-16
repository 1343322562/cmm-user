// pages/ordersDetails/ordersDetails.js
import commit from '../../store/mutations.js'
import * as types from '../../store/types.js'
import { ShoppingCartGoods } from '../../tool/shoppingCart.js'
let shoppingCart = new ShoppingCartGoods(); //实例化类
import API from '../../api/index.js'
import { getRemainTime, showLoading, hideLoading, alert, toast, goPage, getOrderStatusName, goTabBar } from '../../tool/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderStateName:"",
    orderInfo:{},
    receivingInfo:{},
    orderType:1
  },
  lookLogistics () {
    goPage(['logistics','status'],{
      orderNo: this.orderNo
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (opt) {

   

    //debugger;
    const { openId, imgBaseUrl, colonelId, hqColonelId, sourceName, userInfo } = getApp().data
    this.userInfo = userInfo
    
    this.orderNo = opt.orderNo
  },
  onReady: function () {

  },
  onShow: function () {
    const { openId, imgBaseUrl, sysCode, dcId, colonelId, userInfo } = getApp().data
    this.openId = openId
    this.sysCode = sysCode
    this.dcId = dcId
    this.colonelId = colonelId
    this.userInfo = userInfo
    this.setData({ imgBaseUrl, userInfo })
    this.getOrderInfo()
  },
  repeatDownOrder () {
    let list = this.data.orderInfo[0].itemList
    let goods = {}
    let itemList = []
    list.forEach(item=> {
      const itemId = item.itemId
      item.num = item.saleNum
      if (goods[itemId]) {
        goods[itemId].num += item.num
      }else {
        item.promotionType = ''
        item.promotionNo = ''
        goods[itemId] = item
        itemList.push({
          itemId,
          promotionType:  '',
          promotionNo:''
        })
      }
    })
    const { dcId, userId } = getApp().data
    API.Public.checkOrderdata({
      data: {
        dcId,
        userId,
        itemList: JSON.stringify(itemList)
      },
      success: ret => {
        if (ret.status == 200) {
          const data = ret.data || []
          data.forEach(item => {
            const itemId = item.itemId
            if (item.maxQty) {
              goods[itemId].itemNowPrice = item.price
              goods[itemId].maxSupplyQty = item.maxQty
              if (goods[itemId].num > item.maxQty) goods[itemId].num = item.maxQty
            } else {
              delete goods[itemId]
            }
          })
          const arr = Object.keys(goods)
          if (arr.length){
            const cartsObj = shoppingCart.getGoodsList()
            arr.forEach(n=>{
              if (cartsObj[n]) {
                cartsObj[n].num = cartsObj[n].num > goods[n].num ? cartsObj[n].num : goods[n].num
              } else {
                cartsObj[n] = goods[n]
              }
              
            })
            wx.setStorageSync('ShoppingCartGoodsList', cartsObj)
            wx.switchTab({ url: "/pages/carts/carts" })
          } else {
            alert('商品已全部下架')
          }
        } else {
          alert('加入购物车失败')
        }
      },
      error: () => {
        alert('重下失败，请稍后再试')
      }
    })
  },
  getOrderStateName(){
      let orderInfo=this.data.orderInfo[0]
      
    // let orderStateName = orderInfo.orderState == '1' 
    //   ? (orderInfo.payState == "0" ? "等待付款" : "待收货") 
    //   : (orderInfo.orderState == '2' ? '已完成' : '未完成')
    // if (orderInfo.orderState == '3') {
    //   orderStateName = '已取消'
    // }
    // if (orderInfo.orderState=='4'){
    //   orderStateName='配送中'
    // }
    // if (orderInfo.orderState == '9') {
    //   orderStateName = '分拣中'
    // }
    let orderStateName = getOrderStatusName(orderInfo.orderState, orderInfo.payState)
    this.setData({ orderStateName})

  },
  getOrderInfo(){
    
    this.getPageData();

  },

  returnSubmist(e) {
    let { orderInfo } = this.data
    const index = e.currentTarget.dataset.index.split(',')
    console.log(index,orderInfo)
    const goods = orderInfo[index[0]].itemList[index[1]]
   
    wx.setStorageSync('returnObj', {
      orderNo: orderInfo[index[0]].orderNo,
      userPhone: orderInfo[index[0]].receivePhone ,
      userName: orderInfo[index[0]].receiveMan,
      goods
    })
    goPage(['afterSale', 'apply'])
  },
  getPageData() {

    showLoading()
    const { orderType, openType, imgBaseUrl } = this.data
    orderType == 'express'
    const urls = 'orderDetail'
    API.Orders[urls]({
      data: {
        openid: this.openId,
        orderNo: this.orderNo,
        dcId:this.dcId,
        sysCode:this.sysCode
      },
      success: obj => {
        hideLoading()
        if (obj.status === 200) {
          console.log("=============")
          let orderInfo = obj.data
          const time = new Date(orderInfo.created)
          orderInfo.createdStr = time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate() + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()
          this.setData({ orderInfo: [orderInfo], isLoading: true })
          console.log(orderInfo)
          this.getOrderStateName();
          console.log("+++++++++++")
        } else {
          alert(obj.msg)
        }
      },
      error: () => {
        hideLoading()
        alert('订单加载失败')
      }
    })
  },
  getServerTime(endTime) {
    API.Public.currentTimeMillis({
      success: (obj) => {
        this.startcountDown(endTime, obj)
      },
      error: () => {
        this.startcountDown(endTime, +new Date())
      }
    })
  },
  startcountDown(endTime, serverTime) {
    this.time && clearInterval(this.time)
    if (serverTime < endTime) {
      const nowTime = (+new Date())
      this.setCount(endTime, nowTime, serverTime)
      this.time = setInterval(() => {
        this.setCount(endTime, nowTime, serverTime)
      }, 1000)
    }
  },
  goIndex(e){
    goTabBar('index')
  },
  pay() {
    const order = this.data.orderInfo[0]
    const orderType = this.data.orderType
    const orderNo = order.orderNo
    const shopInfo2 = getApp().data.shopInfo
    console.log("单号", orderNo)
    showLoading()
    wx.login({
      success: ret => {
        API.Public.getSubOpenid({
          data: {
            code: ret.code,
            sysCode: this.sysCode,
            dcId: this.dcId
          },
          success: obj => {
            const subOpenId = obj.data
            if (obj.status === 200 && subOpenId) {
              API.Public[orderType !== 'express' ? 'orderPay' : 'hqOrderPay']({
                data: {
                  body: this.sourceName,
                  orderNo: orderNo,
                  storeId: this.storeId,
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
                            url: '/pages/paySuccess/paySuccess?orderNo=' + orderNo + '&orderType=' + orderType 
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
  }


})