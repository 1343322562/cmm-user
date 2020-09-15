import API from '../../api/index.js'
import { showLoading, hideLoading, alert, getTime, goPage } from '../../tool/index.js'
Page({
  data: {
    list: [],
    pageLoading: false
  },
  getPageData() {
    showLoading()
    const { branchNo, token, platform, username, dbBranchNo: dbranchNo } = wx.getStorageSync('userObj')
    API.Public.getOrderMeetingCoupons({
      data: { branchNo, token, platform, username, dbranchNo },
      success: res => {
        console.log(res)
        if (res.code == 0&& res.data) {
          let list = []
          const data = res.data.coupons || []
          const nowTime = +new Date()
          data.forEach(item => {
            if (item.couponsQnty > 0 && (nowTime < getTime(item.validEndDate) && nowTime > getTime(item.validStartDate))) {
              item.validStartDate = item.validStartDate.split(' ')[0].replace(new RegExp(/(-)/g), '.')
              item.validEndDate = item.validEndDate.split(' ')[0].replace(new RegExp(/(-)/g), '.')
              list.push(item)
            }
          })
          this.setData({ list })
        } else {
          alert(res.msg)
        }
      },
      complete: () => {
        hideLoading()
        this.setData({ pageLoading: true })
      }
    })
  },
  toDHGoodDetail(e) {
    const itemNo = e.currentTarget.dataset.itemno
    goPage('goodsDetails', { itemNo })
  },
  onLoad(opt) {
    this.getPageData()
  }
})