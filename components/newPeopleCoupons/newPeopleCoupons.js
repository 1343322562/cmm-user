import API from '../../api/index.js'
import { showLoading, hideLoading, goPage, alert, toast } from '../../tool/index.js'
Component({
  properties: {
  },
  data: {
    show:false,
    data:{}
  },
  attached () {
    this.nowDateDay = new Date().getDate()
  },
  methods: {
    getPageData () {
      const { dcId, userId, userInfo} = getApp().data
      const dateDay = wx.getStorageSync('newPeopleCouponsDate')
      if (!userInfo.userPhone && (!dateDay || dateDay != this.nowDateDay)) {
        API.Coupons.getPersonCouponInfo({
          data:{
            userId, dcId
          },
          success: ret=> {
            let data = ret.data
            if (ret.status == 200 && data) {
              const type = data.applicableCommodity
              data.explainStr = type == '0' ? '全场' : (type == '1' ? '商品' : (type == '3' ? '类别' : '商品'))
              console.log(data)
              data.discountTimeStartStr = data.discountTimeStart.split(' ')[0].replace(new RegExp(/(-)/g), '.')
              data.discountTimeEndStr = data.discountTimeEnd.split(' ')[0].substring(5).replace(new RegExp(/(-)/g), '.')
              this.setData({ data, show: true})
              wx.setStorageSync('newPeopleCouponsDate', this.nowDateDay)
            }
          }
        })
      }
    },
    clear () {
      this.setData({ show: false})
    },
    getCoupons () {
      const { userId, userInfo } = getApp().data
      const data = this.data.data
      if (userInfo.userPhone) {
        showLoading('请稍后...')
        API.Coupons.sendCouponByRelationIdAndUserId({
          data: {
            relationId: data.id,
            userId: userId || '-1'
          },
          success: obj => {
            hideLoading()
            if (obj.status == 200) {
              toast('领取成功')
              this.clear()
            } else {
              alert(obj.msg)
            }
          },
          error: () => {
            hideLoading()
            alert('领取优惠券失败，请检查网络是否正常')
          }
        })
      } else { // 跳转注册
        goPage('impower', { openType: 'inside' })
      }
    },
  }
})
