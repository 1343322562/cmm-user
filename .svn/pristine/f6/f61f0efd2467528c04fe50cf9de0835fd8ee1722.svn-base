import API from '../../../api/index.js'
import { showLoading, hideLoading, goPage } from '../../../tool/index.js'
Page({
  data: {
    orderList: [],
    status: "",
    pageLoading: false
  },
  getPageData(status) {
    const { branchNo, token, platform, username } = this.userObj
    showLoading('请稍后...')
    API.Group.searchTeamOrderList({
      data: { branchNo, token, platform, username, status },
      success: res => {
        const orderList = res.data
        if (res.code == 0 && orderList) {
          this.setData({ orderList})
        }
      },
      complete: ()=> {
        hideLoading()
        this.setData({ pageLoading:true})
      }
    })
  },
  openDetails: function (e) {
    let sheetNo = e.currentTarget.dataset.no;
    const openType = 'list'
    goPage(['groupBuying', 'GB_ordersDetails'], { sheetNo, openType})
  },
  selectStatus (e) {
    let type = typeof e == 'string' ? e : e.target.dataset.type;
    this.setData({ orderList: [], isError: false, status: type });
    this.getPageData(type);
  },
  onLoad (opt) {
    wx.removeStorageSync('updateGroupOrderList')
    this.userObj = wx.getStorageSync('userObj')
    this.selectStatus("")
  },
  onShow () {
    if (wx.getStorageSync('updateGroupOrderList')) {
      this.getPageData(this.data.status)
    }
  }
})