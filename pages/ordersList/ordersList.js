import API from '../../api/index.js'
import { showLoading, hideLoading, goPage } from '../../tool/index.js'
const maxNum = 20
Page({
  data: {
    pageLoading: false,
    list: [],
    maxLength:''
  },
  confirmSearch(e) {
    const value = e.detail.value.trim()
    this.searchText = value
    this.searchResult()
  },
  searchInputBlur(e) {
    const value = e.detail.value.trim()
    if (value == this.searchText) return
    this.searchText = value
    this.searchResult()
  },
  searchResult() {
    this.getOrderList()
  },
  getOrderStatusStr (item) {
    const status = item.supplyFlag
    return (status == '1' ?
    (item.approveFlag == '0' ? '未提交' : '已提交'):
    (status =='2'?'已拣货':
    (status=='3'?'配货完成':
    (status=='4'?'已取消':
    (status=='5'?'已完成':
    (status == '6' ?'拣货中':
    (status=='7'?'退货中':
    (status=='8'?'退货完成':
    (status=='9'?'驳回':
    (status=='31'?'已装车':
    (status == '32' ? '配送中' :
    (status=='51'?'已完成':'状态错误'))))))))))))
  },
  getOrderList () {
    showLoading('请稍后')
    const { branchNo, token, username, platform } = this.userObj
    const condition = this.searchText || ''
    const supplyFlag = this.supplyFlag
    API.Orders.getOrderList({
      data: { branchNo, token, username, platform, supplyFlag, condition},
      success: res => {
        const data = res.data || []
        let list = []
        let totalIndex = 0
        const maxLength = data.length > 350 ? 350 : data.length
        let baseList = []
        for (let i = 0; i < maxLength; i++ ) {
          const item = data[i]
          const order = {
            sheetNo: item.sheetNo,
            createDate: item.createDate.split('.')[0],
            sheetQty: item.sheetQty,
            realPayAmt: item.realPayAmt,
            statusStr: this.getOrderStatusStr(item),
            sheetSourceStr: item.sheetSource == "yewuyuan" ? '(平台业务员)' : (item.sheetSource =='huozhu' ?'(货主业务员)':'')
          }
          if (totalIndex < maxNum) {
            list.push(order)
            totalIndex++
          } else {
            baseList.push(order)
          }
        }
        this.setData({ list, maxLength})
        this.baseList = baseList
      },
      complete: ()=> {
        hideLoading()
        this.setData({ pageLoading: true})
      }
    })
  },
  goDetails (e) {
    const sheetNo = e.currentTarget.dataset.no
    const openType = 'list'
    goPage('ordersDetails', { openType, sheetNo})
  },
  onLoad (opt) {
    const  type = opt.openType
    wx.setNavigationBarTitle({ title: (type == '1' ? '待付款' : (type == '2' ? '待收货' : (type == '3' ? '已完成' : (type == '4' ? '已取消' : '全部订单')))) })
    this.supplyFlag = type
    this.userObj = wx.getStorageSync('userObj')
    wx.removeStorageSync('updateOrderList')
    this.getOrderList()
  },
  onShow () {
    if (wx.getStorageSync('updateOrderList')) {
      this.getOrderList()
    }
  },
  onReachBottom () {
    if (!this.isLoading && this.baseList.length) {
      this.isLoading = true
      let newArr = this.data.list
      this.baseList = this.baseList.filter((item, index) => {
        if (maxNum > index) {
          newArr.push(item)
          return false
        } else {
          return true
        }
      })
      this.setData({ list: newArr })
      setTimeout(() => {
        this.isLoading = false
      }, 400)
    }
  }
})