import API from '../../../api/index.js'
import { setNumSize, goTabBar } from '../../../tool/index.js'
Page({
  data: {
    pageLoading: false,
    list: [[],[],[]],
    tabTitle:[
      '未使用',
      '已使用',
      '已过期'
    ],
    selectedIndex:0,
    selected: {}
  },
  changeTab(e) {
    const selectedIndex = e.currentTarget.dataset.index;
    if (selectedIndex !== this.data.selectedIndex) {
      this.setData({ selectedIndex })
      wx.pageScrollTo && wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      })
    }
  },
  setDateSize(t) {
    //IOS 下  日期字符串  “-”
    t = t.replace(/-/g, '/').replace('.000', '')

    const time = new Date(t)
    const n = time.getFullYear()
    const y = (time.getMonth() + 1)
    const r = time.getDate()
    return n + '.' + setNumSize(y) + '.' + setNumSize(r)
  },
  goIndex(e) {
    goTabBar('index')
  },
  open (e) {
    const id = e.currentTarget.dataset.id;
    let selected = this.data.selected
    selected[id] = !selected[id]
    this.setData({ selected})
  },
  getPageData() {
    API.Coupons.userCoupon({
      data: {
        userId: this.userId
      },
      success: ret => {
        if (ret.status == 200) {
          const data = ret.data || []
          let list = [[],[],[]]
          // applicableCommodity:0 全部商品 1 指定商品  2指定商品不可用 3指定类别可用
          // state   0、未使用 1、已过期 2、已使用
          data.forEach((item,i) => {
            if (item.dcId == this.dcId) {
              const index = item.state == '0' ? 0 : (item.state == '2'?1:2)
              const type = item.applicableCommodity
              let explain = []
              const details = item.details
              item.explainStr = type == '0'?'全场':(type =='1'?'商品':(type=='3'?'类别':'商品'))
              item.explainTitle = type == '0' ? '全场商品可用' : (type == '1' ? '仅限以下商品可用' : (type == '3' ? '仅限以下类别商品可用' : '除以下商品都可用'))
              if (type != '0' && details) {
                details.forEach(goods => {
                  explain.push(goods.name)
                })
                item.explain = explain.join('、')
              }
              item.startDateStr = this.setDateSize(item.discountTimeStart)
              item.endDateStr = this.setDateSize(item.discountTimeEnd)
              list[index].push(item)
            }
          })

          this.setData({ list })
        }
      },
      complete: () => {
        this.setData({ pageLoading: true })
      }
    })
  },
  onLoad(opt) {
    this.userId = getApp().data.userInfo.userId
    this.dcId = getApp().data.dcId
    this.getPageData()
  }

})