import API from '../../api/index.js'
import { showLoading, hideLoading, alert, getTime, getGoodsImgSize, deepCopy,goPage } from '../../tool/index.js'
Page({
  data: {
    nowSelectedCls: 'all',
    clsList: [],
    supplierObj: {},
    supplierKey: {},
    pageLoading: false
  },
  changeCls (e) {
    this.setData({ nowSelectedCls: e.currentTarget.dataset.no})
  },
  goSearch () {
    goPage('searchGoods', { openType: 'zhipei' })
  },
  goGoodsList (e) {
    const no = e.currentTarget.dataset.no
    const supplierObj = this.data.supplierObj
    const { goodsImgUrl, supplierName, itemClsName, supplierTel, minDeliveryMomey, supplierNo} = supplierObj[no]
    goPage('supplierGoods',{
      config: { goodsImgUrl, supplierName, itemClsName, supplierTel, minDeliveryMomey, supplierNo}
    })
  },
  getList () {
    const { branchNo, token, platform, username} = wx.getStorageSync('userObj')
    const imgUrl = getApp().data.imgUrl
    API.Supplier.searchSupcust({
      data: { branchNo, token, platform, username, condition:''},
      success: res => {
        const list = res.data
        if (res.code == 0 && list) {
          let supplierObj = {}
          let supplierKey = this.data.supplierKey
          list.forEach(item => {
            const cls = item.managementType
            const no = item.supplierNo
            item.goodsImgUrl = imgUrl + '/upload/images/supplier/' + item.picUrl
            supplierObj[no] = item
            supplierKey['all'].push(no)
            if (cls && supplierKey[cls]) {
              supplierKey[cls].push(no)
            }
          })
          this.setData({ supplierObj})
          setTimeout(()=>{
            this.setData({ supplierKey })
          },150)
        }
      },
      complete: () => {
        wx.hideLoading()
        this.setData({ pageLoading: true})
      }
    })
  },
  onLoad (opt) {
    // 此处缓存在 login 页面中设置
    const clsList = wx.getStorageSync('supcustAllCls')||[]
    console.log(clsList)
    let supplierKey = {all:[]}
    clsList.forEach(item => {
      supplierKey[item.supcustCls] = []
    })
    this.setData({ clsList, supplierKey})
    this.getList()
  },
  onShow () {
  }
})