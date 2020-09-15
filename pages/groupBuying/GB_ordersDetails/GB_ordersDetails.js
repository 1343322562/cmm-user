import API from '../../../api/index.js'
import { showLoading, hideLoading,alert } from '../../../tool/index.js'
Page({
  data: {
    orderObj: {}
  },
  getPageData () {
    const { branchNo, token, platform, username } = this.userObj
    showLoading('请稍后...')
    const sheetNo = this.sheetNo
    API.Group.searchTeamOrderList({
      data: { branchNo, token, platform, username, sheetNo },
      success: res => {
        const data = res.data
        console.log(sheetNo)
        if (res.code == 0 && data) {
          const orderObj = data[0]
          orderObj.createDate = orderObj.createDate.split('.')[0].split(' ')
          orderObj.detailOutVos[0].startDate = orderObj.detailOutVos[0].startDate.split('.')[0]
          orderObj.detailOutVos[0].endDate = orderObj.detailOutVos[0].endDate.split('.')[0]
          this.setData({ orderObj})
        } else {
          alert(res.msg,{
            success: ()=> {
              wx.navigateBack({data:1})
            }
          })
        }
      },
      complete: () => {
        hideLoading()
      }
    })
  },
  cancelOrder () {
    alert('确认是否取消此订单?',{
      title:'温馨提示!',
      showCancel: true,
      success: e => {
        if (e.confirm) {
          const { branchNo, token, platform, username } = this.userObj
          const sheetNo = this.sheetNo
          showLoading('取消订单...')
          API.Group.cancelTeamOrder({
            data: { branchNo, token, sheetNo, platform, username},
            success: res => {
              alert(res.msg,{
                success:()=> {
                  if (res.code == 0) {
                    wx.setStorageSync('updateGroupOrderList', true)
                    this.getPageData()
                  }
                }
              })
            },
            complete: () => {
              hideLoading()
            }
          })
        }
      }
    })
  },
  errorMsg(msg) {
    hideLoading()
    alert(msg || '系统异常，请稍后再试')
  },
  goSuccessPage(type) {
    alert('支付成功',{
      success: ()=> {
        wx.setStorageSync('updateGroupOrderList', true)
        this.getPageData()
      }
    })
  },
  goPay () {
    const sheetNo = this.sheetNo
    const { token, platform, username } = this.userObj
    const openId = wx.getStorageSync('openId')
    showLoading('支付中...')
    wx.login({
      success: (codeData)=> {
        API.Group.getMiniTeamPayParameters({
          data: { code: codeData.code, sheetNo, body: '具体信息请查看团购订单', openId, platform, username, token },
          success: ret => {
            const config = ret.data
            if (ret.code == 0 && config) {
              wx.requestPayment({
                'timeStamp': config.timeStamp,
                'nonceStr': config.nonceStr,
                'package': config.package,
                'signType': 'MD5',
                'paySign': config.sign,
                'success': () => {
                  this.goSuccessPage(true)
                },
                'fail': () => {
                  this.errorMsg('支付已取消')
                }
              })
    
            } else {
              this.errorMsg(ret.msg)
            }
          },
          error: () => {
            this.errorMsg('获取支付配置失败,请检查网络是否正常。')
          }
        })
      },
      fail: () => {
        this.payError('获取code失败')
      }
    })
    
  },
  onLoad (opt) {
    this.userObj = wx.getStorageSync('userObj')
    this.openType = opt.openType
    this.sheetNo = opt.sheetNo
    this.getPageData()
  }
})