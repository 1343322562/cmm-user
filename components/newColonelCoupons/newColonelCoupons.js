import API from '../../api/index.js'
import { showLoading, hideLoading, goPage, alert, toast } from '../../tool/index.js'
Component({
  properties: {
  },
  data: {
    show: false,
    data: {},
    isGet:false,
  },
  attached() {
    this.nowDateDay = new Date().getDate()
  },
  methods: {
    getPageData() {
      const { dcId, userId, userInfo, colonelId } = getApp().data
      const dateDay = wx.getStorageSync('newPeopleCouponsDate')
      if (userInfo.ownColonelId) {
        API.Coupons.getColonePersonCouponInfoFlag({
          data: {
            userId, dcId, colonelId
          },
          success: res => {
            if (res.status == 200) {
              API.Coupons.getColonePersonCouponInfo({
                data: {
                  userId, dcId, colonelId
                },
                success: ret => {
                  let data = ret.data
                  if (ret.status == 200 && data) {
                    this.setData({ data, show: true })
                    // wx.setStorageSync('newPeopleCouponsDate', this.nowDateDay)
                  }
                }
              })
            }
          }
        })
      // if (!userInfo.userPhone && (!dateDay || dateDay != this.nowDateDay)) {
        
      }
      // }
    },
    clear() {
      this.setData({ show: false })
    },
    getCoupons() {
      let { userId, userInfo } = getApp().data
      const { data, isGet} = this.data
      
      if (userInfo.ownColonelId && !isGet) {
      // if (userInfo.userPhone) {
        showLoading('请稍后...')
        API.Coupons.sendCouponByRelationIdAndUserId({
          data: {
            relationId: data.id,
            userId: userId || '-1'
          },
          success: obj => {
            hideLoading()
            if (obj.status == 200) {
              this.setData({ isGet: true})
              toast('领取成功')
            } else {
              alert(obj.msg)
            }
          },
          error: () => {
            hideLoading()
            alert('领取优惠券失败，请检查网络是否正常')
          }
        })
      } else {
        this.clear()
        goPage(['coupons','list'])
      }
      // } else { // 跳转注册
      //   goPage('impower', { openType: 'inside' })
      // }
    },
  }
})
