import { goPage, goTabBar } from '../../tool/index.js'
Page({
  data: {
    orderNo:"",
    openType:''
  },
  goShare () {
    goPage('orderShare',{
      orderNo:this.data.orderNo
    })
  },
  onLoad (opt) {
    this.setData({ orderNo: opt.orderNo, openType: opt.openType})
  },
  onShow () {
    const { openId, imgBaseUrl, sysCode, dcId, colonelId, userInfo } = getApp().data
    this.openId = openId
    this.sysCode = sysCode
    this.dcId = dcId
    this.colonelId = colonelId
    this.setData({ imgBaseUrl, userInfo })
  },
  onHide () {
  },
  goIndex(e){
    goTabBar('index')
  }
})