import commit from '../../store/mutations.js'
import * as types from '../../store/types.js'
import API from '../../api/index.js'
import dispatch from '../../store/actions.js'
import {
  showLoading,
  hideLoading,
  alert,
  toast,
  deepCopy,
  getRemainTime,
  goPage,
  getOrderStatusName
} from '../../tool/index.js'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectGoodsInfo: {},
    selectOrderInfo: {},
    showBox: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(getApp().data)
    const {
      tabBarList,
      openid,
      storeId,
      userInfo,
      shopInfo,
      imgBaseUrl,
      sourceName,
      source,
      dcId,
      sysCode
    } = getApp().data
    this.openid = openid
    this.storeId = storeId
    this.userInfo = userInfo
    this.shopInfo = shopInfo
    this.sourceName = sourceName
    this.dcId = dcId
    this.sysCode = sysCode
    this.userId =  userInfo.userId
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getReturnOrderList();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  getReturnOrderList: function(e) {
    API.Orders.getReturnOrderList({
      data: {
        openid: this.openid,
        dcId: this.dcId,
        sysCode: this.sysCode,
        userId: this.userId
      },
      success: (obj) => {
        for (var item of obj.data) {
          item.returnStateName = this.formatReturnState(item.returnState)
        }
        this.setData({
          orderList: obj.data
        })
      },
      error: () => {

      }
    })
  },
  formatReturnState: function (return_state){
    if (return_state==0){
      return '待处理'
    } else if(return_state == 1){
      return '退货中'
    } else if (return_state == 2) {
      return '已完成'
    } else if (return_state == 3) {
      return '退货失败'
    }
    else if (return_state == 4) {
      return '驳回'
    }
  },
  handleClickDetailed: function(e) {
    let oindex = e.currentTarget.dataset.oindex;
    let gindex = e.currentTarget.dataset.gindex;
    let selectGoodsInfo = this.data.orderList[oindex].bdOrderReturnDetailList[gindex];
    let selectOrderInfo= this.data.orderList[oindex];
    const time = new Date(selectOrderInfo.created)
    selectOrderInfo.createdName = time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate() + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()
    console.log(selectOrderInfo)
    this.setData({
      selectGoodsInfo: selectGoodsInfo,
      selectOrderInfo: selectOrderInfo,
      showBox: true
    })
  },
  handleCloseBox: function(e) {

    this.setData({
      selectGoodsInfo: {},
      selectOrderInfo: {},
      showBox: false
    })
  }
})