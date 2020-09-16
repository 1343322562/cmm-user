const dates = new Date()
import { goTabBar,setUrlObj } from '../../tool/index.js'
Page({
  data: {
    time: dates.getDate()
  },
  onLoad (opt) {
    let page = 'index'
    if (opt.scene) {
      opt = setUrlObj(decodeURIComponent(opt.scene))
      if (opt.p== 'l') {
        page = 'list'
        getApp().data.itemClsno = opt.n||''
      }
    }
    if (opt.inviter) {
      getApp().data.inviter = opt.inviter
    }
    setTimeout(() => goTabBar(page),2000)
  }
})