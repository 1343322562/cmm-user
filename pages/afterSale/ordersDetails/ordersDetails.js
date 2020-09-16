import { showLoading, hideLoading, alert, toast, goPage } from '../../../tool/index.js'
import API from '../../../api/index.js'
Page({
  data: {
    imgBaseUrl: '',
    data: {}
  },
  alertError(msg) {
    alert(msg, {
      success: () => {
        wx.navigateBack()
      }
    })
  },
  getPageData() {
    showLoading()
    API.Orders.getHqOrderAfterDetail({
      data: {
        openid: this.openId,
        orderNo: this.orderNo,
        afterId: this.afterId
      },
      success: ret => {
        hideLoading()
        if (ret.status == 200) {
          let data = ret.data
          const time = new Date(data.created)
          data.createDate = time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate() + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()
          data.refundStateStr = data.refundState == '0' ? '未退款' : (data.refundState == '1' ? '退款中' : (data.refundState == '2' ? '退款完成' : (data.refundState == '3' ? '退款失败' : '状态错误')))
          const time2 = new Date(data.refundTime)
          data.refundTimeStr = time2.getFullYear() + '-' + (time2.getMonth() + 1) + '-' + time2.getDate() + ' ' + time2.getHours() + ':' + time2.getMinutes() + ':' + time2.getSeconds()
          this.setData({ data })
        } else {
          this.alertError(ret.msg || '获取订单失败')
        }
      },
      error: () => {
        hideLoading()
        this.alertError('获取订单失败!')
      }
    })
  },
  onLoad(opt) {
    this.afterId = opt.afterId
    this.orderNo = opt.orderNo
    const { openId, imgBaseUrl } = getApp().data
    this.openId = openId
    this.setData({ imgBaseUrl })
    this.getPageData()
  }
})