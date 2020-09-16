import API from '../../../api/index.js'
import QQMapWX from '../../../tool/qqmap-wx-jssdk.js'
import { showLoading, hideLoading, toast, goPage } from '../../../tool/index.js'
Page({
  data: {
    locationList: [],
    city: '',
    searchText: '',
    address: ''
  },
  confirmSearch(e) {
    const value = e.detail.value.trim()
    this.setData({ searchText: value })
    this.searchResult()
  },
  searchInputChange (e) {
    const value = e.detail.value.trim()
    this.setData({ searchText: value })
    this.searchResult()
  },
  searchInputBlur(e) {
    const value = e.detail.value.trim()
    if (value === this.data.searchText) return
    this.setData({ searchText: value })
    this.searchResult()
  },
  searchResult() {
    const { searchText } = this.data
    if (!searchText) return
    // showLoading('搜索...')
    this.qqmapsdk.getSuggestion({
      keyword: searchText,
      region: "", //city
      region_fix: 0,
      policy: 0,
      success: (ret) => {
        hideLoading()
        const locationList = ret.data || []
        if (locationList.length) {
          this.setData({ locationList })
        } else {
          // toast('搜索结果为空')
        }
      },
      fail: () => {
        hideLoading()
        // toast('搜索失败')
      }
    })
  },
  selectCity() {
    goPage(['LBS', 'selectCity'])
  },
  selected(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.locationList[index]
  
    wx.setStorageSync('selectLocation', {
      longitude: item.location.lng,
      latitude: item.location.lat,
      address: item.address,
      city: item.city,
      province: item.province,
      area: item.district
    })

    /*  改版隐藏
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    //直接调用上一个页面对象的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      selectedCity: [item.province, item.city, item.district],
      address: item.address.replace(item.province, "").replace(item.city, "").replace(item.district, "") +""+item.title
    });

    */


    this.quit()
  },
  remove() {
    wx.removeStorageSync('selectedCity')
  },
  quit(data) {
    wx.navigateBack({ data: 1 })
  },
  onLoad(opt) {
    this.remove()
    this.qqmapsdk = new QQMapWX({ key: getApp().data.mapKey })
    // const { address, city } = wx.getStorageSync('nowLocation')
    // this.setData({ city, address })
  },
  onReady() {
  },
  onShow() {
    // const city = wx.getStorageSync('selectedCity')
    // if (city) {
    //   const searchText = ''
    //   const locationList = []
    //   this.setData({ city, searchText, locationList })
    //   this.remove()
    // }
  },
  onHide() {
  },
  onUnload() {
  },
  onPullDownRefresh() {
  },
  onReachBottom() {
  },
  onShareAppMessage() {
  }
})