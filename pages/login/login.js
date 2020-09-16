import API from '../../api/index.js'
import { showLoading, hideLoading, toast, emojiReg,alert } from '../../tool/index.js'
import commit from '../../store/mutations.js'
import * as types from '../../store/types.js'
Page({
  data: {
    tel: "",
    code: "",
    count: 0
  },
  getCode: function () {
    const tel = this.data.tel.trim();
    if (this.testTel(tel) && !this.data.count) {
      showLoading("获取验证码");
      API.Public.mobileCode({
        data: {
          mobile: tel
        },
        success: ret => {
          hideLoading()
          if (ret.status == 200 && ret.data) {
            toast("发送成功")
            this.code = ret.data
            let count = 120
            this.time = setInterval(() => {
              this.setData({ count: count })
              if (!count--) {
                clearInterval(this.time)
              }
            }, 1000)
          } else {
            toast(ret.msg)
            
          }
        },
        error: () => {
          hideLoading()
          toast("系统异常，获取验证码失败")
        }
      })
    }
  },
  login: function () {
    const { tel, code } = this.data,
      { nickName, avatarUrl } = this.userWxInfo
    if (this.testTel(tel) && this.testCode(code)) {
      showLoading("登录...")
      API.Public.login({
        data: {
          mobile: tel,
          code: code,
          openid: this.openId,
          storeId: this.storeId || '',
          colonelId: this.colonelId || '',
          nickname: emojiReg(nickName) || ("游客" + parseInt(Math.random() * 10000)),
          userpic: avatarUrl || (this.imgBaseUrl + "defined_pic.png")
        },
        success: ret => {
          hideLoading()
          if (ret.status == 200) {
            alert('登录成功',{
              success: () => {
                commit[types.SAVE_USER_INFO]({ phone: tel, userId: ret.data.userId, pickupCode: ret.data.user.userCode })
                if (this.openType === 'inside') {
                  wx.setStorageSync('authorization', true)
                  wx.navigateBack({ data: 1 })
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
                  wx.redirectTo({
                    url: '/pages/' + this.openType + '/' + this.openType
                  })
                }
              }
            })
          } else {
            alert(ret.msg)
          }
        },
        error: () => {
          hideLoading()
          toast("登录失败")
        }
      })
    }
  },
  input: function (e) {
    const k = e.currentTarget.dataset.type,
      v = e.detail.value;
    let obj = {}
    obj[k] = v
    this.setData(obj)
  },
  testTel: function (tel) {
    if (!tel || !/^\d{11}$/.test(tel)) {
      toast(tel ? "手机号格式不正确!" : "请输入手机号码!");
      return false;
    }
    return true;
  },
  testCode: function (code) {
    if (!code) {//||this.code!=code
      toast(code ? "验证码不正确!" : "请输入验证码!");
      return false;
    }
    return true;
  },
  onLoad: function (opt) {
    const { userWxInfo, openId, colonelId, imgBaseUrl, storeId } = getApp().data
    this.openId = openId,
    this.colonelId = colonelId
    this.imgBaseUrl = imgBaseUrl
    this.storeId = storeId
    this.openType = opt.openType
    this.userWxInfo = userWxInfo
  },
  onReady: function () {
  },
  onShow: function () {
  },
  onHide: function () {
  },
  onUnload() {
    this.time && clearInterval(this.time)
  }
})