import API from '../../api/index.js'
import { showLoading, hideLoading, goPage,alert } from '../../tool/index.js'
Page({
  data: {
    alertShow:false,
    startDate:'',
    endDate:'',
    dateSelect: ['1个月内', '3个月内', '半年内'],
    statusSelect:['未收款','已收款','部分收款'],
    payStatusSelect:['未支付','已支付','部分支付'],
    dateIndex:'',
    statusIndex:'',
    payStatusIndex:'',
    list:[],
    screenStr:'半年内·全部',
    totalMoney:0,
    totalNum:0,
    pageLoading: false
  },
  selected (e) {
    const {index,type} =  e.currentTarget.dataset
    const types = type + 'Index'
    let obj = {}
    obj[type + 'Index'] = this.data[types] === index?'':index
    if (type =='date') {
      obj.startDate = this.getTimeSlot(index)
      obj.endDate = this.setDateSize(+new Date())
      console.log(obj, index)
    }
    this.setData(obj)
  },
  bindDateChange (e) {
    const val = e.detail.value
    const types = e.currentTarget.dataset.type
    let obj = { dateIndex:''}
    obj[types+'Date'] = val
    this.setData(obj)
  },
  showAlert (e) {
    this.setData({ alertShow:e?true:false})
  },
  setDateSize (t) {
    const time = new Date(t)
    const n = time.getFullYear()
    const y = time.getMonth() + 1
    const r = time.getDate()
    var setNum = num=> num>9?num:('0'+num)
    return n + '-' + setNum(y) + '-' + setNum(r)
  },
  getTimeSlot (index) {
    const now = +new Date()
    const y = 1000 * 60 * 60 * 24 * 30
    const date = this.setDateSize(index == 0 ? now : now - y * (index==1?3:6)).split('-')
    console.log(date)
    date[2] = '01'
    return date.join('-')
  },
  resetDate () {
    const dateIndex = 2
    const startDate = this.getTimeSlot(dateIndex)
    let endDate = this.setDateSize(+new Date())
    this.setData({ startDate, endDate, dateIndex,statusIndex:'',payStatusIndex:''})
    this.getPageData()
    this.showAlert(false)
  },
  confirm  () {
    const { dateSelect, statusSelect, payStatusSelect, dateIndex, statusIndex, payStatusIndex, startDate,endDate } = this.data
    let screenStr = []
    screenStr.push(dateIndex === '' ? '自定义时间段' : dateSelect[dateIndex])
    if (+new Date(startDate) > +new Date(endDate)) {
      alert('时间段区间不正确')
      return
    }

    if (statusIndex === '' && payStatusIndex === ''){
      screenStr.push('全部')
    } else {
      statusIndex !== '' && screenStr.push(statusSelect[statusIndex])
      payStatusIndex !== '' && screenStr.push(payStatusSelect[payStatusIndex])
    }
    this.setData({ screenStr: screenStr.join('·')})
    this.getPageData()
    this.showAlert(false)
  },
  getPageData () {
    const { branchNo, token, username, platform } = this.userObj
    let { startDate,endDate,dateIndex, statusIndex, payStatusIndex } = this.data
    const receiptStatus = String(statusIndex) //  查看全部收款状态时，这个字段不要传  0:未收款 1：已收款 2：部分收款
    const payStauts = String(payStatusIndex) // 0:未支付 1：已支付 2：部分支付
    let request = { branchNo, token, username, platform, startDate, endDate }
    receiptStatus && (request.receiptStatus = receiptStatus)
    payStauts && (request.payStauts = payStauts)
    API.BankBalance.getStoresReconciliation({
      data: request,
      success: res => {
        if(res.code == 0) {
          let data = res.data||[]
          let totalMoney = 0
          let list = []
          data.forEach(item => {
            
            if (payStauts === '' || item.payStatus == payStauts) {
              item.workDate = item.workDate.split('.')[0]
              totalMoney += item.sheetAmt
              item.payStatusStr = item.payStatus == '0' ? '未支付' : (item.payStatus == '1' ? '已支付' : item.payStatus == '2' ? '部分支付' : '')
              item.receiptStatusStr = item.receiptStatus == '0' ? '未收款' : (item.receiptStatus == '1' ? '已收款' : item.receiptStatus == '2' ? '部分收款' : '')
              list.push(item)
            }
            
          })
          this.setData({ list, totalMoney: Number(totalMoney.toFixed(2)), totalNum: list.length, pageLoading: true})
        }
      }
    })
  },
  onLoad (opt) {
    this.userObj = wx.getStorageSync('userObj')
    this.resetDate()
  }
})