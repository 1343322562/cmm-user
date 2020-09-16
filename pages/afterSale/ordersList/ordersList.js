import { showLoading, hideLoading, alert, toast, goPage } from '../../../tool/index.js'
import API from '../../../api/index.js'
Page({
  data: {
    list: [],
    imgBaseUrl: ''
  },
  goDetails(e) {
    const index = e.currentTarget.dataset.index;
    const { id, orderNo } = this.data.list[index]
    goPage(['afterSale', 'ordersDetails'], {
      afterId:id,
      orderNo
    })
  },
  getPageData() {
    showLoading()
    API.Orders.getHqOrderAfter({
      data: {
        openid: this.openId,
        pageIndex: 0,
        pageSize: 1000
      },
      success: ret => {
        hideLoading()
        if (ret.status == 200 && ret.data) {
          const list = ret.data.data || []
          list.forEach(item => {
            const time = new Date(item.created)
            item.createDate = time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate() + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()
          });
          this.setData({ list })
        } else {
          alert(ret.msg)
        }
      },
      error: () => {
        hideLoading()
        toast('获取订单失败!')
      }
    })
  },
  onLoad(opt) {
    const { openId, imgBaseUrl } = getApp().data
    this.openId = openId
    this.setData({ imgBaseUrl })
    this.getPageData()
  }
})