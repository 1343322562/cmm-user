import API from '../../../api/index.js'
import { showLoading, hideLoading, toast, alert, formatTime} from '../../../tool/index.js'
Page({
  data: {
    list: []
  },
  getPageData () {
    showLoading()
    API.Orders.getLogistics({
      data:{
        orderNo: this.orderNo
      },
      success: ret => {
        if (ret.status ==  200) {
          let list = ret.data||[]
          list.forEach(item => {
            let time = formatTime(item.busiDate).split(' ')
            item.dateArr = [time[0].substr(5), time[1].substr(0,5)]
            item.statusStr = item.orderState.split(',')
          })
          console.log(list)
          this.setData({ list})
        }
      },
      complete: () => {
        hideLoading()
      }
    })
  },
  onLoad (opt) {
    this.orderNo = opt.orderNo
    this.getPageData()
  },
  onShow () {

  }
})