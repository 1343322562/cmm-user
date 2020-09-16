import commit from '../../store/mutations.js'
import * as types from '../../store/types.js'
import API from '../../api/index.js'
import UserBusiness from '../../tool/userBusiness.js'
import { showLoading, hideLoading, emojiReg, alert, goTabBar } from '../../tool/index.js'

Page({
  data: {
    userWxInfo: null,
    userInfo: null,
    sourceName:'',
    onlyGetPhoneNumber:false
  },
  getUserInfoSuccess(res) {

    const target = res.detail
    if (target && target.errMsg.indexOf('ok') !== -1) {
      const userWxInfo = target.userInfo
      this.setData({ userWxInfo})
      console.log(userWxInfo);
      //getApp().data.userWxInfo = userWxInfo
      commit[types.SAVE_USER_WX_INFO](userWxInfo)
    }
  },
  backPage () {
    goTabBar('index')
    //wx.navigateBack({ delta: 1 })
  },
  login(phone) {
    const { nickName, avatarUrl } = this.data.userWxInfo
    API.Public.authlogin({
      data: {
        mobile: phone,
        openid: this.openId,
        storeId: this.storeId || '',
        colonelId: this.colonelId || '',
        dcId: this.dcId,
        sysCode: this.sysCode,
        nickname: emojiReg(nickName) || ('游客' + parseInt(Math.random() * 10000)),
        userpic: avatarUrl || ('defined_pic.png')
      },
      success: obj => {
        hideLoading()
        if (obj.status === 200) {
          obj.data.user.userId = obj.data.user.id
          getApp().data.userInfo = obj.data.user
          getApp().data.openid = obj.data.user.openid
          getApp().data.sysCode = obj.data.user.sysCode
          getApp().data.dcId = obj.data.user.dcId
          getApp().data.colonelId = obj.data.user.colonelId
          getApp().data.dcName = obj.data.dcName

          //commit[types.SAVE_USER_INFO]({ phone: phone, userId: obj.data.userId, pickupCode: obj.data.user.userCode })
          if (this.openType === 'inside') {
            wx.setStorageSync('authorization', true)
            wx.navigateBack({ delta: 1 })
          } else if (this.openType === 'my') {
            let num = getCurrentPages().length - 1
            let fun = 'redirectTo'
            if (num === 3) {
              fun = 'reLaunch'
            }
            wx[fun]({
              url: '/pages/my/my'
            })
          } else {
            
            console.log(this.openType.indexOf('/'))
            let openType = this.openType.split('/')[0]
            let openType2 = this.openType.split('/')[0]
            
            if(this.openType.indexOf('/')>1){
              openType2 = this.openType.split("/")[1] + '/' + this.openType.split("/")[1]
            }
            wx.redirectTo({
              url: '/pages/' + openType + '/' + openType2
            })
          }
        } else {
          this.showError(obj.msg)
        }
      },
      error: () => {
        hideLoading()
        this.showError('登录失败')
      }
    })
  },
  decodePhone(iv, encryptedData) {
    showLoading()
    console.log("调用手机解密", encryptedData,getApp().data.sessionKey)
    API.Public.decodeData({
      data: {
        session_key: getApp().data.sessionKey,
        iv: iv,
        encryptedData: encryptedData
      },
      success: obj => {
        console.log("解密手机",obj)
        if (obj.status === 200 && obj.data) {
          const data = JSON.parse(obj.data)
          this.login(data.phoneNumber)
        } else {
          hideLoading()
          this.showError('获取手机号失败!')
        }
      },
      error: ()=> {
        hideLoading()
        this.showError('获取手机号失败')
      }
    })
  },
  showError(msg){
    alert(msg,{
      success:()=>{
        goTabBar('index')
        // wx.switchTab({ url: "/pages/home/home" })
        // wx.redirectTo({
        //   url: "/pages/login/login?openType=" + this.openType
        // })
        //wx.switchTab({index})
      }
    })
  },
  getPhoneNumberSuccess(res) {
    const target = res.detail
    if (target && target.errMsg.indexOf('ok') !== -1) {
      this.decodePhone(target.iv, target.encryptedData)
    } else {
      this.showError('授权失败')
    }
  },
  onLoad(opt) {
    console.log("xxxxxxxx")
    const { userWxInfo, userInfo, sessionKey, openId, colonelId, imgBaseUrl, storeId, sysCode, dcId} = getApp().data
    this.sessionKey = sessionKey
    this.openId = openId,
    this.colonelId = colonelId
    this.imgBaseUrl = imgBaseUrl
    this.storeId = storeId
    this.openType = opt.openType
    this.sysCode=sysCode
    this.dcId=dcId

    // if (this.openType =="coupons/get"){
    //   console.log(userWxInfo);
    //   console.log(userInfo)
    //   //直接授权获取手机号码
    //   this.setData({ onlyGetPhoneNumber: true})
    // }else{
    //   UserBusiness.wxLogin(this, colonelId);
    // }

    
  },
  onReady() {
  },
  onShow() {
  },
  onHide() {
  },
  onUnload() {
  }
})