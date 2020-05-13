import API from '../../api/index.js'
import { showLoading, hideLoading, alert, toast } from '../../tool/index.js'
import CryptoJS from '../../tool/aes.js'
import MD5 from '../../tool/md5.js'
Page({
  data: {
    phone: '',
    code: '',
    count: 0,
  },
  getValue(e) {
    const k = e.currentTarget.dataset.type
    let obj = {}
    obj[k] = e.detail.value.trim()
    this.setData(obj)
  },
  getCode () {
    let phone = this.data.phone
    if (!/^[0-9]{11}$/.test(phone)) {
      toast('请输入正确的手机号')
      return;
    }
    showLoading('发送中...')
    const key = "3FECD1C97D6249E2"
    const basePhone = phone
    phone = CryptoJS.toEncrypt(String(phone), key)
    const sign = MD5.hexMD5("code=" + key + "&phone=" + phone + "&version=1.0")
    API.Login.sendVerifyCode({
      data: { phone, type: this.openType == 'password' ? '1' : '3', platform: '3', sign },
      success: res => {
        hideLoading()
        const code = res.data
        if (res.code == 0 && code) {
          alert('发送成功')
          this.code = code
          this.getCodePhone = basePhone
          let count = 120
          this.time = setInterval(() => {
            this.setData({ count })
            if (!count--) {
              clearInterval(this.time)
              this.code = null
              this.getCodePhone = null
            }
          }, 1000)
        } else {
          alert(res.msg)
        }
      },
      error: () => {
        hideLoading()
        alert('发送验证码失败，请检查网络是否正常')
      }
    })
  },
  nextStep () {
    
    const { phone, code} = this.data
    if (!phone || !code || code != this.code || phone != this.getCodePhone) {
      toast(!phone ? '手机号不能为空' : (!code ? '验证码不能为空' : (code != this.code ? '验证码不正确' : (phone != this.getCodePhone ?'当前手机号与验证码不匹配':'验证码错误'))))
      return
    }
    if (this.openType == 'password') { // 忘记密码
      wx.redirectTo({
        url: '/pages/editPwd/editPwd?openType=login&phone=' + phone
      })
    } else { // 新用户注册
      wx.redirectTo({
        url: '/pages/register/register?openType=login&phone=' + phone,
      })
    }
  },
  onLoad (opt) {
    console.log(opt)
    this.openType = opt.openType
  },
  onUnload () {
    this.time && clearInterval(this.time)
  }
})