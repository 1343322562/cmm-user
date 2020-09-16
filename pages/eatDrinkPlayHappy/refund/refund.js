import API from '../../../api/index.js'
import { showLoading, hideLoading, toast, goPage, alert } from '../../../tool/index.js'
Page({
  data: {
    list:[],
    order:{},
    money:0,
    selectedList: [],
    refundAll: true,
    returnReason:''
  },
  checkboxChange (e) {
    const arr = e.detail.value
    const list = this.data.list
    let money = 0
    let num = 0
    list.forEach(item => {
      if (arr.indexOf(item.receiveCodeNo)!=-1) {
        money += item.itemNowPrice
        num++
      }
    })
    this.setData({ refundAll: num == list.length, money: Number(money.toFixed(2)), selectedList: arr})
  },
  getInput (e) {
    const returnReason = e.detail.value.trim()
    this.setData({ returnReason })
  },
  submist () {
    const { order, money, refundAll, selectedList, list, returnReason} = this.data
    if (!money) return
    const { openId, sysCode, dcId, userId, storeId } = getApp().data
    const colonelId = order.colonelId
    let itemList = []
    list.forEach(item => {
      if (selectedList.indexOf(item.receiveCodeNo)!=-1) {
        item.orderDetailId = item.orderDetailId||item.id
        item.id = ''
        itemList.push(item)
      }
    })
    showLoading()
    let request = {
      sysCode,
      orderNo: this.orderNo,
      supplierNo: list[0].supplierNo,
      dcId,
      userId,
      colonelId,
      userName: order.userName,
      userPhone: order.userPhone,
      openid: openId,
      returnAmt: money,
      receiveAddr: '',
      postage: '',
      returnReason,
      requestType: (refundAll? 0 : 1),
      doSheetNo: '',
      returnOrderNo: '',
      itemList: JSON.stringify(itemList)
    }
    API.Play.saveReturnOrder({
      data: request,
      success: ret => {
        if(ret.status == 200) {
          alert('退款成功',{
            success: ret => {
              wx.setStorageSync('updatePage', true)
              wx.navigateBack({
                delta:2
              })
            }
          })
        } else {
          alert(ret.msg)
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
  getPageData() {
    API.Play.orderDetail({
      data: {
        orderNo: this.orderNo
      },
      success: ret => {
        if (ret.status == 200) { // signForStatus 1 已核销  0 未核销
          let order = ret.data;
          let data = order.chOrderDetails
          let list = []
          let selectedList = []
          let money = 0
          data.forEach(item => {
            if (item.signForStatus!='1') {
              list.push(item)
              item.isChecked = true
              selectedList.push(item.receiveCodeNo)
              money += item.itemNowPrice
            }
          })
          money = Number(money.toFixed(2))
          this.setData({ order, list, money, selectedList, refundAll: money == order.totalAmt })
        
        } else {
          alert(ret.msg)
        }
      },
      error: () => {
        toast('网络异常')
      }
    })
  },
  onLoad (opt) {
    this.orderNo = opt.orderNo
    this.getPageData()
  }
})