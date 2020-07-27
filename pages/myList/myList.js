// pages/myList/myList.js
import { showLoading, hideLoading, goPage, toast, alert, setUrl} from '../../tool/index.js'
import API from '../../api/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listData: [],
    baseImgUrl: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ baseImgUrl: getApp().data.baseImgUrl + 'upload/images/wximage/appExhibitTemplate/' })
    this.getBranchExhibit() // 获取陈列 list
  },

  // 获取陈列 list
  getBranchExhibit () {
    const _this = this
    const data = wx.getStorageSync('userObj')
    const { branchNo, token, username, platform } = data
    
    API.My.getBranchExhibit({
      data: { branchNo, token, username, platform, approveFlag: 0 }, // 0: 陈列列表 1：历史陈列
      success(res){
        console.log(res)
        let listData = res.data
        listData.forEach((item, i) => {
          listData[i].startDate = listData[i].startDate.slice(0, 10)
          listData[i].endDate = listData[i].endDate.slice(0, 10)
          if (listData[i].picUrls.includes(',')) {
            listData[i].picUrls = item.picUrls.split(',')
          } else {
            listData[i].picUrls = [item.picUrls]
          }
        })
        _this.setData({ listData })
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
  // 跳转详情页面
  toDetailClick (e) {
    console.log(e)
    let index = e.currentTarget.dataset.index
    let listData = this.data.listData
    goPage('myListDetail', { data: listData[index] })
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