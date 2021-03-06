import commit from '../../store/mutations.js'
import { goPage, pxToRpx } from '../../tool/index.js'
import API from '../../api/index.js'
import UserBusiness from '../../tool/userBusiness.js'
const app = getApp()
const headHeight = pxToRpx(app.globalData.statusBarHeight) || 50
Component({
  properties: {
  },
  data: {
    scancodeNum: 0,
    someData: {
      statusBarHeight: app.globalData.statusBarHeight,
      titleBarHeight: app.globalData.titleBarHeight
    },
    headHeight: headHeight,
    userInfo: {},
    dcName: "", //配送中心名称
    clickSwitchCityCount: 0, //点击次数
    fansList: [], // 用户粉丝
    isColonel: false
  },
  methods: {
    // 点击六次跳出扫码界面
    scancodes() {
      const _this = this
      const scancodeNum = this.data.scancodeNum + 1
      if (scancodeNum === 6) {
        wx.scanCode({
          success (res) {
            console.log(1888, res)
            const opt = res.result
            _this.data.scancodeNum = 0
            wx.navigateTo({url: '/pages/posCarts/posCarts?q=' + encodeURIComponent(opt)})
          }
        })
        return
      }
      this.data.scancodeNum = scancodeNum
    },
    getOrderNum() {
      API.Orders.getOrderNum({
        data: {
          openid: getApp().data.openid
        },
        success: obj => {
          if (obj.status === 200 && obj.data) {
            const orderNum = obj.data.number || 0
            this.setData({ orderNum })
          }
        }
      })
    },
    switchCity(e) {
      if (this.data.clickSwitchCityCount >= 6) {
        goPage('selectSysCode', { openId: getApp().data.openid, t: 'home' })
      } else {
        this.data.clickSwitchCityCount += 1
      }
    },
    goOrder(e) {
      const type = e.currentTarget.dataset.type
      goPage('ordersList', { orderType: type })
    },
    goPage(e) {
      const page = e.currentTarget.dataset.page
      goPage(page, { openType: 'my' })
    },
    onShow() {
      this.data.clickSwitchCityCount = 0
      const { openId, imgBaseUrl, sysCode, dcId, colonelId, userInfo, dcName } = getApp().data
      this.openId = openId
      this.sysCode = sysCode
      this.dcId = dcId
      this.colonelId = colonelId

      this.setData({ imgBaseUrl, userInfo, dcName, isColonel: userInfo.ownColonelId })

      console.log("设置用户信息", userInfo)

      if (!userInfo || (!userInfo.userPhone && !userInfo.userPhone)) {
        goPage('impower', { openType: 'inside' })
        return
      }
      this.getComData()

    },
    getComData() {
      API.Public.getComData({
        data: {
          sysCode: getApp().data.sysCode,
          dcId: getApp().data.dcId,
          openid: getApp().data.openid
        },
        success: obj => {
          let data = obj.data
          if (obj.status === 200 && obj.data) {
            if (data.custServiceId && data.custServiceId.length) {
              data.customerService = JSON.stringify(data.custServiceId.split(','))
            }
            this.setData({ ComData: data })
          }
        }
      })
    }
  }
})
