// pages/selectSysCode/selectSysCode.js

import API from '../../api/index.js'
import UserBusiness from '../../tool/userBusiness.js'
import { getTime, deepCopy, getRemainTime, showLoading, hideLoading, goPage, alert, toast, goTabBar, backPage, tim } from '../../tool/index.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dcCodeList:[],
    isShowPasswordDialog: true,
    rightPassword: '',       // 正确的密码 cmm + 今日日期 （20190101）
    passwordValue: '' // input框 密码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.openId = getApp().data.openid || getApp().data.openid
    if (options.type == '0') return this.setData({ isShowPasswordDialog: false }) // 新用户选仓时不需要展示密码框
    // 核对/设置密码
    if(wx.getStorageSync('rightPassword')) return this.setData({ isShowPasswordDialog: false })
    this.setData({ rightPassword: 'cmm' + tim(0).replace(/-/g, '') }) 
    //console.log(options.openId)
  },
  passwordBind(e) {
    let val = e.detail.value
    this.setData({ passwordValue: val })
  },
  confirm(e) {
    console.log(e)
    let type = e.target.dataset.type // 0: 返回 1：确认
    switch(type) {
      case '0':
        backPage()
        break;
      case '1':
        this.verification()
        break;
    }
  },
  // 验证密码是否正确
  verification() {
    let passwordValue = this.data.passwordValue
    let rightPassword = this.data.rightPassword
    if (rightPassword == passwordValue) {
      wx.setStorage({ data: rightPassword, key: 'rightPassword' })
      this.setData({ isShowPasswordDialog: false })
      return
    } 
    toast('密码错误')
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getSysCodeList();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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

  },

  getSysCodeList(){

    API.Public.sysCodeList({
        data: {
          openid: this.openId
        },
        success: res => {
          console.log(res)
          if (res.status == 200) {
            const list = res.data.dcCodeList || []
            this.setData({ dcCodeList: list})
          }
        }
      });    
  },
  onClickCity(e){

    let sysCode=e.currentTarget.dataset.syscode
    let dcId = e.currentTarget.dataset.dcid
    let openid = this.openId

    if (getApp().data.dcId!=dcId)
    {
      let data = {};
      wx.removeStorageSync('ShoppingCartGoodsList');
    }

    getApp().data.dcId = dcId

    getApp().data.sysCode = sysCode
    console.log(getApp(), sysCode, 4545465465454644546)

    getApp().data.userInfo = null;

    

    // wx.navigateBack({

    // })

    
    API.Public.setCity({
      data: {
        sysCode: sysCode,
        dcId: dcId,
        colonelId: getApp().data.colonelId,
        openid: openid
      },
      success: res => {
        if (res.status == 200) {
          // if (!res.data){
          //   alert(res.msg);
          //   return;
          // }
          // console.log(res.data.dcId)
          // let dcId = res.data.dcId
          // getApp().data.dcId = dcId
          // getApp().data.sysCode = sysCode
          // getApp().data.userInfo=null;
          // wx.navigateBack({

          // })
          goTabBar('index')
          // UserBusiness.wxLogin(this, getApp().data.colonelId, function () {
          //    wx.navigateBack({
               
          //    })
          // });
        }
      }
    });

  }
})