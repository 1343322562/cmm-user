import API from '../../api/index.js'
import { goPage } from '../../tool/index.js'

const app = getApp()
// pages/chwlDetail/chwlDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgBaseUrl: app.data.imgBaseUrl,
    supplierObj: {}, // 商家信息
    list: [] // 商家商品详情
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    const item = JSON.parse(options.item)
    console.log(item)
    this.data.supplierObj = item
    this.setData({ supplierObj: item })
    this.getPageData()
  },
  // defaultBG(e) {
  //   console.log(29,e)
  //   const { index } = e.currentTarget.dataset
  //   this.setData({ [`list[${index}].itemThumbPic`]: '../../images/moren.png' })
  // },
  goPlayGoodsDetails(e) {
    const { list } = this.data
    const { index } = e.currentTarget.dataset
    goPage(['eatDrinkPlayHappy', 'goodsDetails'], {
      itemNo: list[index].id
    })
  },
  // 获取详情
  getPageData() {
    const { dcId, sysCode } = app.data
    const { supplierObj } = this.data,
          _this = this
    API.Play.itemListPage({
      data: {
        sysCode: sysCode,
        dcId: dcId,
        supplierNo: supplierObj.id
      },
      success(res) {
        console.log(res)
        let imgBaseUrl = app.data.imgBaseUrl
        if (res.data && res.data.length) {
          let list = res.data
          list.forEach(item => {
            item.itemThumbPicArr = 'itemThumbPic' in item && item.itemThumbPic.includes(',') ? item.itemThumbPic.split(',') : [item.itemThumbPic || '']
            item.itemThumbPic = imgBaseUrl + item.itemThumbPicArr[0]
            item.saleEndTime = item.saleEndTime.slice(0, 10)
            item.saleStartTime = item.saleStartTime.slice(0, 10)
          })
          _this.setData({ list })
        }
      }
    })
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