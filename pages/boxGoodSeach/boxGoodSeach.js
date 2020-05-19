import { toast,alert } from '../../tool/index.js'
import API from '../../api/index.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchText: '', // 搜索的文本
    goodInfoCard: false, // 商品信息卡片开关
    focus: false, // 控制 input 的 focus
    // 店铺及位置信息
    sheetMap: {
      goodsAllocationNo: "",
      routeSendName: "女司机",
      dbranchInfoStr: "唐娟  17352632536  长沙 长沙麓谷",
      cmmPrintWord1: "",
      routeName: "麓谷1线",
      cmmPrint2: "",
      dBranchAddress: "长沙",
      appointBranchMan: "",
      dBranchNo: "00400002",
      sendMobile: "17352632536",
      appointBranchTel: "",
      dBranchName: "唐美女的店",
      cmmPrint1: "/upload/images/sysLogo/20200302/20200302164639.png",
      dcBranchNo: "004",
      dcBranchName: "长沙便利店",
      sheetNo: "DO1804031149766964",
      printNum: 0,
      dcBranchMan: "",
      dcBranchAddress: "",
      dcBranchTel: "2",
      sheetSource: "erp",
      boxNum: 98,
      boxNo: "10010,1008611,1024",
      dBranchTel: "17352632536",
      sourceOrderNo: "",
      dBranchMan: "唐娟",
      appointBranchAddress: "",
      routeNo: "006"
    },
    // 商品属性列表
    boxList: {
      itemName: "好益多230乳酸菌饮品",
      sheetNo: "YH1804031148047617",
      unitNo: "7",
      checkQty: 50.000000,
      unitName: "瓶",
      boxNo: "1008611",
      itemRem: "hyd230rsjyp",
      validDay: 210.00,
      itemSubno: "6925982180769",
      itemNo: "110056",
      itemSize: "230ml*18"
    }
  },
  // 点击图标，input 聚焦。
  focusInput() {
    this.setData({
      focus: true
    })
  },
  // 根据箱码获取数据,并显示卡片
  getBoxData(boxCode) {
    const { branchNo, token, platform, username } = this.userObj
    console.log(boxCode, typeof boxCode)
    // 目前还没有可以搜到商品信息的箱码
    API.Public.findByBoxNo({
      data: { branchNo, token, platform, username, boxNo: boxCode },
      success: res => {
        console.log(res)
        if (res.code != 0) return alert(res.message)  
        const { res: data } = res
        JSON.parse(data)
        this.setData({
          boxList: data.boxList,
          sheetMap: data.sheetMap,
          goodInfoCard: true
        })
      },
      error: () => {
        toast('查询失败')
      }
    })
  },
  // 搜索箱码
  seachBoxCode (e) {
    let boxCode = e.detail.value
    if (!boxCode) return toast('请输入箱码')
    this.setData({
      searchText: boxCode
    })
    this.getBoxData(boxCode)
  },
  // 用户阅读商品信息完毕，关闭弹窗
  readEnd () {
    this.setData({
      searchText : '',
      goodInfoCard: false
    })
  },
  // 调用微信扫码,获取箱码
  openScanCode () {
    wx.scanCode({
      success (res) {
        // 1. 从 res 获取 箱码 boxCode
        // 2. 将 boxCode 设置为 seachText 
        // 3. 调用 getBoxData 方法传参并获取数据
      },
      fail () {
        toast('调用失败，请手动输入箱码')
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.userObj = wx.getStorageSync('userObj')
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