import { goPage } from '../../tool/index.js'
Component({
  properties: {
    nowSelectedTab: String,
    num: Number
  },
  data: {
    tabBarList: [
      { title: '首页', img: 'tab_home_select', show: true, type: 'home' },
      { title: '分类', img: 'tab_class_select', show: true, type: 'class' },
      { title: '购物车', img: 'tab_cart_select', show: true, type: 'carts' },
      { title: '我的', img: 'tab_my_select',  show: true, type: 'my' }
    ]
  },
  attached() {
    // const tabBarList = getApp().data.tabBarList
    // this.setData({ tabBarList })
    const arr = getCurrentPages()
    let pageRoute = []
    arr.forEach(item => {
      pageRoute.push(item.route.split('/')[2])
    })
    this.pageRoute = pageRoute
  },
  methods: {
    changePage(e) {
      const { type, index } = e.currentTarget.dataset
      const nowSelectedTab = Number(this.data.nowSelectedTab)
      if (nowSelectedTab == index) return
      if (type === 'my') {
        const { userWxInfo, userInfo } = getApp().data
        if (!userWxInfo || !userInfo) {
          goPage('impower', { openType: 'my' })
          //wx.redirectTo({ url: "/pages/impower/impower" })
          return
        }
      }
      const pageRoute = this.pageRoute
      const pageLength = pageRoute.length
      const pageIndex = pageRoute.indexOf(type)
      if (pageIndex == -1) {
        let fun = pageLength === 3 ? 'reLaunch' : 'navigateTo'
        wx[fun]({
          url: '/pages/' + type + '/' + type
        })
      } else {
        const num = pageLength - pageIndex - 1
        if (num >= 2) {
          wx.reLaunch({
            url: '/pages/' + type + '/' + type
          })
        } else {
          wx.navigateBack({ data: 1 })
        }
      }
    }
  }
})
