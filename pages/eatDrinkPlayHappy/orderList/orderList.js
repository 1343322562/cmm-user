import API from '../../../api/index.js'
import { showLoading, hideLoading, toast, goPage, alert, formatTime, getPlayOrderStatusName } from '../../../tool/index.js'
Page({
  data: {
    tabIndex: 0,
    tabTitle: ['全部订单','待支付', '待消费', '已完成','售后退款'],
    list:[],
    showCode: false,
    imgBaseUrl: getApp().data.imgBaseUrl
  },
  openDetails (e) {
    const {  no } = e.currentTarget.dataset
    goPage(['eatDrinkPlayHappy','orderDetails'],{
      orderNo: no
    })
  },
  lookCode (e) {
    const index = e.currentTarget.dataset.index
    const order = this.data.list[index]
    this.setData({ showCode: true})
    this.selectComponent("#userCode").getCode(order);
  },
  hideCode () {
    this.setData({ showCode: false })
  },
  getPageData () {
    const { tabIndex } = this.data
    const { openId, dcId,userId } = getApp().data
    showLoading()
    API.Play.orderListByPageNo({
      data:{
        userId,
        pageIndex: 1,
        pageSize: 1000,
        type: (tabIndex+1),
        dcId
      },
      success: ret => {
        if (ret.status == 200) {
          let list = ret.data ? ret.data.data:[]
          list.forEach(order => {
            order.createDateStr = formatTime(order.created)
            order.goodsName = order.chOrderDetails[0].itemName
            order.imgUrl = order.chOrderDetails[0].itemThumbPic.split(',')[0]
            order.statusStr = getPlayOrderStatusName(order.orderState, order.payState)
          })
          console.log(list)
          this.setData({ list })
        }
      },
      error: () => {
        toast('网络异常')
      },
      complete: ()=> {
        hideLoading()
      }
    })
  },
  onLoad(opt) {
    this.getPageData()
  },
  onShow () {
    const updatePage = wx.getStorageSync('updatePage')
    if (updatePage) {
      wx.removeStorageSync('updatePage')
      this.getPageData()
    }
  },
  changeTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ tabIndex: index })
    this.getPageData()
  }
})