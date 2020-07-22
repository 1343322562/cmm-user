import API from '../../api/index.js'
import { goPage,toast,alert } from '../../tool/index.js'
Page({
  data: {
    partnerCode: '',
    userObj: {},
    salesmanObj:null,
    orderNum: {},
    isInvoice:'',
    couponsNum: 0
  },
  goLogin () {
    goPage('login',{
      isLogin: true
    })
  },
  goPage (e) {
    console.log(e)
    if (this.data.userObj.isLogin) {
      this.goLogin()
      return
    }
    const {page,type} = e.currentTarget.dataset
    if (page =='null') {
      toast('功能暂未开放')
      return
    }
    console.log(page)
    goPage(page, { openType: type||''})
  },
  goCollectList  () {
    const type = '101'
    const collectObj = wx.getStorageSync('collectObj')
    const value = Object.keys(collectObj).join(',')
    goPage('activity', { type, value })
  },
  quit () {
    alert('确定是否退出?',{
      showCancel: true,
      title:'温馨提示',
      success: ret => {
        if (ret.confirm) {
          getApp().backLogin()
        }
      }
    })
  },
  callPhone (e) {
    // const partnerCode = getApp().data.partnerCode
    // if (partnerCode == '1027') {
    // var current = 'http://erp.yizhangou.vip/1.gif'
    //   wx.previewImage({
    //     current: current,
    //     urls: [current]
    //   })
    // } else {
      const phone = e.currentTarget.dataset.phone
      if (!phone) return
      wx.makePhoneCall({phoneNumber: phone})
    // }
  },
  onLoad (opt) {
    const userObj = wx.getStorageSync('userObj')
    this.setData({ userObj, isInvoice: wx.getStorageSync('configObj').isInvoice })
    this.requestObj = {
      branchNo: userObj.branchNo,
      token: userObj.token,
      username: userObj.username,
      platform: userObj.platform,
      dbranchNo: userObj.dbBranchNo
    }
    this.getOrderNum()
    this.getSalesman()
    this.setData({
      partnerCode: getApp().data.partnerCode
    })
  },
  getOrderNum () {
    
    API.My.searchOrderCount({ // 获取订单数量
      data: this.requestObj,
      success: res => {
        if (res.code == 0 && res.data) {
          this.setData({
            orderNum: res.data
          })
        }
      }
    })
    API.My.getUnusedCouponsSum({ // 获取优惠券数量
      data: this.requestObj,
      success: res => {
        if (res.code == 0 && res.data) {
          this.setData({
            couponsNum: res.data.couponsCount||0
          })
        }
      }
    })
  },
  getSalesman () {
    API.My.findSalesManInfo({
      data: this.requestObj,
      success: res => {
        if (res.code == 0) {
          const salesmanObj = {
            phone: res.data.phone,
            name: res.data.name
          }
          this.setData({ salesmanObj})
        }
      }
    })
  },
  // 跳转箱货查询页
  toSeach () {
    wx.navigateTo({
      url: '../boxGoodSeach/boxGoodSeach',
    })
  },
  onReady () {
  },
  onShow () {
    const userObj = wx.getStorageSync('userObj')
    if (userObj) {
      this.setData({ userObj })
      this.requestObj.token = userObj.token
    } 
    const pageLoadingTime = this.pageLoadingTime
    if (pageLoadingTime) {
      const now = +new Date()
      const time = now - pageLoadingTime
      if (time > (1000 * 15)) {
        this.pageLoadingTime = now
        this.getOrderNum()
      }
    } else {
      this.pageLoadingTime = +new Date()
    }
  },
  onHide () {
  }
})