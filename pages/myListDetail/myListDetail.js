import API from '../../api/index.js'
import { toast } from '../../tool/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: {},       // 渲染详情的数据对象
    baseImgUrl: '',
    submitImg: [] // 需要上传的图片 url
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    const data = JSON.parse(options.data)
    this.setData({ data, baseImgUrl: getApp().data.baseImgUrl + 'upload/images/wximage/appExhibitTemplate/' })
  },

  // 提交上传的图片或信息
  submit () {
    this.submitExhibitFlow()
  },
  // 上传陈列信息接口
  submitExhibitFlow () {
    const _this = this
    const data = wx.getStorageSync('userObj')
    const listData = this.data.data 
    const { branchNo, token, username, platform } = data
    const { salesmanNo, exhibitNo, memo } = listData
    const picUrls = _this.data.submitImg.join(',') // 多张图片用逗号隔开
    console.log(picUrls)
    API.My.submitExhibitFlow({
      data: { branchNo, token, username, platform, salesmanNo, exhibitNo, memo, picUrls },
      success(res) {
        toast("已提交")
        console.log(res)
      }  
    })
  },
  // 拍照上传陈列图片
  uploadImgClick () {
    const _this = this
    wx.chooseImage({
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        console.log(res)
        const imageURL = res.tempFilePaths[0];
        // 上传图片
        wx.showLoading('正在上传...');
        API.upload.uploadImage({
          filePath: imageURL,
          type:8,
          success:(res)=>{
            wx.hideLoading();
            toast('图片上传成功!')
            console.log(res)
            let img = res.data
            let submitImg = _this.data.submitImg
            submitImg.unshift(img)
            this.setData({ submitImg })
          },
          fail:(err)=>{
            wx.hideLoading();
            toast('图片上传失败!');
          }
        });
        // const tempFilePaths = res.tempFilePaths
        // wx.uploadFile({
        //   url: 'https://example.weixin.qq.com/upload', //仅为示例，非真实的接口地址
        //   filePath: tempFilePaths[0],
        //   name: 'file',
        //   formData: {
        //     'user': 'test'
        //   },
        //   success (res){
        //     const data = res.data
        //     //do something
        //   }
        // })
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