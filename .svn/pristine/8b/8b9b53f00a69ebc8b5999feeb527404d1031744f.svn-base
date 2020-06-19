import API from '../../../api/index.js'
import { showLoading, hideLoading, goPage, setFilterDataSize } from '../../../tool/index.js'
const maxNum = 20
Page({
  data: {
    pageLoading: false,
    list: []
  },
  confirmSearch(e) {
    const value = e.detail.value.trim()
    this.searchText = value
    this.getOrderList()
  },
  searchInputBlur(e) {
    const value = e.detail.value.trim()
    if (value == this.searchText) return
    this.searchText = value
    this.getOrderList()
  },
  getOrderStatusStr(status) {
    return (status == '2' ? '保存' :
      (status == '3' ? '已提交申请' :
        (status == '4' ? '退货申请打回' :
          (status == '5' ? '同意申请' :
            (status == '6' ? '已指配给司机' :
              (status == '7' ? '退货回收中' :
                (status == '8' ? '退货完成' :
                  (status == '9' ? '退货取消' :'状态错误'))))))))
  },
  getOrderList() {
    showLoading('请稍后')
    const { branchNo, token, username, platform, dbBranchNo:dbranchNo} = this.userObj
    const searchText = this.searchText || ''
    console.log(searchText)
    API.Orders.searchReturnOrder({
      data: { branchNo, token, username, platform, dbranchNo },
      success: res => {
        const data = res.data || []
        let list = []
        data.forEach(item => {
          if (!searchText || item.master.sheetNo.indexOf(searchText)!=-1) {
            item.master.statusStr = this.getOrderStatusStr(item.master.operType)
            item.master.createDate = item.master.createDate.split('.')[0]
            list.push(item)
          }
        })
        this.setData({ list})
      },
      complete: () => {
        hideLoading()
        this.setData({ pageLoading: true })
      }
    })
  },
  goDetails(e) {
    const index = e.currentTarget.dataset.index
    const orders = this.data.list[index]
    goPage(['salesReturn', 'ordersDetails'], { orders: setFilterDataSize(orders) })
  },
  onLoad(opt) {
    this.userObj = wx.getStorageSync('userObj')
    this.getOrderList()
  },
  onShow() {
  }
})