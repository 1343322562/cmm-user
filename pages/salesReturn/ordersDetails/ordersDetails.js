import {  getFilterDataSize,toast } from '../../../tool/index.js'
Page({
  data: {
    orders: {}
  },
  onLoad (opt) {
    const orders = JSON.parse(getFilterDataSize(opt.orders))
    orders.details.forEach(goods=> {
      goods.subAmt = Number((goods.avgPrice * goods.realQty).toFixed(2))
    })
    this.setData({
      orders
    })
  },
  callPhone (e) {
    const phone = e.currentTarget.dataset.phone
    if (!phone) { toast('手机号为空');return}
    wx.makePhoneCall({ phoneNumber: phone })
  }
})