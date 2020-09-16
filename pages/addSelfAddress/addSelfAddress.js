import API from '../../api/index.js'
import { getFilterDataSize, emojiReg, toast, showLoading, alert, hideLoading, backPage, goPage, setNumSize } from '../../tool/index.js'

// pages/addSelfAddress/addSelfAddress.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPosition: { latitude: '', longitude: '' },  // 当前位置(经纬度)
    searchValue: '', //  输入框内容
    markers: [{ // 标记位置(也就是当前位置)
      iconPath: "../../images/map_center_icon.png",
      id: 0,
      latitude: '',
      longitude: '',
      width: 36,
      height: 35,
      callout: {content: '当前位置', fontSize: 12, color: '#333333', bgColor: '#ffffff', padding: 10, display: 'ALWAYS', borderWidth: 3, borderColor: '#8873FA',anchorY: 4}
    }],
    pullStatu: 1, // 是否拉起自提点 List  1: 拉起
    // 自提点商户数据
    list: [],
    currentSelectIndex: -1, // 当前所选择的自提点 -1: 未选择
    currentStoreId: '',
    addrLength: 0, // 用户自提点列表的长度，用以判断 是否添加的自提点为默认自提点
    ud_id: [] // 自提点列表 id 用以判断 是否添加的自提点为默认自提点
  },
  // 绑定 search bar 数据 
  bindSearchVal(e) {
    console.log(e)
    let searchValue = e.detail.value
    if (searchValue.includes(' ')) searchValue = searchValue.trim() 

    this.setData({ searchValue })
  },
  // 搜索
  searchData(e) {
    const searchVal = this.data.searchValue
    console.log(searchVal)
    
    // API.###.###({
    //   data:{ searchVal },
    //   success: res => {}
    // })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({ title: '加载中...' })
    console.log(app, options)
    this.data.addrLength = options.addrLength
    this.data.ud_id = JSON.parse(options.ud_id)
    this.getCurrentPositon() // 获取当前坐标并缓存至 data
  },

  // 获取当前点击坐标, 并改变当前地图标记位置
  getCurrentMarkersClick(e) {
    this.data.currentSelectIndex = -1 // 初始化当前选择项
    console.log(e)
    let { latitude, longitude } = e.detail
    this.setData({ ['markers[0].latitude']: latitude, ['markers[0].longitude']: longitude  })
    console.log(latitude, longitude)
    this.getShopItem(latitude, longitude) 
  },

  // 获取当前标记下附近的自提点商户, 并标记自提点 
  getShopItem(latitude, longitude) {
    const { sysCode } = app.data
    const _this = this
    wx.showLoading({ title: '加载中...' })
    API.Orders.getStoreList({
      data:{ locationX: latitude, locationY: longitude, sysCode },
      success: res => {
        console.log(res)
        if (res.status == 200) {
          let list = res.data
          let markers = _this.data.markers; markers.length = 1 // 只留下自己的坐标点
          let markerItem = {iconPath:"../../images/map_center_icon.png",id: 0,latitude: '',longitude: '',width: 30,height: 29,callout:{}}
          list.forEach((item, index) => {
            item.isSelected = false
            item._distance = Number(item._distance) >= 1000 ?  (Number(item._distance)/1000).toFixed(2) + 'km' : item._distance.toFixed(0) + 'm'
            
            // 设置气泡
            markerItem.callout.content = item.title
            markerItem.callout.display = 'ALWAYS'
            markerItem.callout.textAlign = 'center'
            markerItem.callout.bgColor = '#ffffff'
            markerItem.callout.borderColor = '#8873FA'
            markerItem.callout.color = '#333'
            markerItem.callout.padding = 6
            markerItem.callout.fontSize = 10
            markerItem.callout.borderWidth = 1
            markerItem.callout.anchorY = 0
            markerItem.callout.borderRadius = 2

            markerItem.latitude = item.location.lat
            markerItem.longitude = item.location.lng
            markerItem.id = index + 1
            const mItem = JSON.parse(JSON.stringify(markerItem))
            markers.push(mItem)
          })
          console.log(markers)
          _this.setData({ list, markers })
        } else {
          alert('自提点列表请求失败, 请检查网络后重试')
        }
      },
      complete() { wx.hideLoading() }
    })
  },
  // 确认添加自提点
  confirmAddClick() {
    let { currentSelectIndex, list } = this.data
    if (currentSelectIndex == -1) return toast('请选择自提点')
    const _this = this
    const { userId } = app.data
    const { sysCode } = app.data
    const storeId = this.data.currentStoreId // 当前门店 ID 
    let { addrLength, ud_id } = this.data
    console.log(storeId,ud_id, typeof ud_id)
    let returnSign = false  // return 标识
    ud_id.forEach(item => {
      if (storeId == item) returnSign = true
    })
    if (returnSign) return toast('该自提点已添加过, 请勿重复添加')
    const toleration = addrLength == 0 ? 1 : 0
    console.log({ sysCode, userId, storeId })
    API.Orders.setUserStoreById({
      data: { sysCode, userId, storeId, toleration },
      success(res) {
        toast(res.data)
        if (res.status)
        if(res.status == 200) {
          wx.setStorageSync('currentStoreAddr', list[currentSelectIndex])
          wx.setStorageSync('currentStoreMode', list[currentSelectIndex].openStore)
          setTimeout(() => { backPage() }, 400)
        }
      }
    })
  },

  // 获取当前坐标并缓存至 data
  getCurrentPositon() {
    const _this = this
    wx.getSetting({
      success(res) {
        console.log(res)
        if (!('scope.userLocation' in res.authSetting) || res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success (r) {
              console.log(r)
              wx.getLocation({
                // isHighAccuracy: true, // 开启高精度定位
                // highAccuracyExpireTime: 3000,
                type: 'gcj02',
                success (res) {
                  console.log(res,'获取成功')
                  const latitude = res.latitude
                  const longitude = res.longitude
                  _this.setData({ 
                    currentPosition: { latitude, longitude },
                    ['markers[0].latitude']: latitude,
                    ['markers[0].longitude']: longitude
                  })
                  _this.getShopItem(latitude, longitude)
                },
                fail(err) {
                  console.log(err)
                  wx.showModal({
                    title: '您手机定位功能没有开启',
                    content: '请在系统设置中打开定位服务',
                    confirmText: '已开启',
                    success() {
                      _this.onLoad()
                    }
                  })
                }
              })
            }
          })
        } else {  // 用户拒绝小程序获取位置(挑起设置,引导用户开启)
          alert('您已拒绝位置获取, 请设置为允许获取', {
            title: '温馨提示',
            showCancel: true,
            confirmText: '去设置',
            success: res => {
              if (res.confirm) {
                wx.openSetting({
                  success (res) {
                    _this.onLoad()
                  }
                })
              }
            }
          })
        }
      }
    })
  },
  // 上拉 list 事件
  pullListClick () {
    let pullStatu = this.data.pullStatu ? 0 : 1
    this.setData({ pullStatu })
  },

  // 选中自提点 radio 事件
  selectClick (e) {
    console.log(e)
    const currentStoreId = e.currentTarget.dataset.currentstoreid // 当前选中门店 ID
    const selectState = !e.currentTarget.dataset.selected         // 选中状态
    const index = e.currentTarget.dataset.index     
    const list = this.data.list
    
    if (selectState) {
      list.forEach(item => {
        item.isSelected = false
      })
      list[index].isSelected = selectState
      this.setData({ list, currentSelectIndex: index, currentStoreId })
    } else {
      this.setData({ [`list[${index}].isSelected`]: selectState, currentSelectIndex: '-1', currentStoreId: '' })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})