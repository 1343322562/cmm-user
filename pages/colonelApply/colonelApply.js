import { pxToRpx, toast, alert, showLoading, hideLoading, goTabBar } from '../../tool/index.js'
import API from '../../api/index.js'

Page({
  data: {
    headHeight:0,
    placeholder:[0,0,0,0,0,0,0,0,0,0],
    user:[],
    pageLoading: false,
    orderNum:0,
    successNum:0,
    showSuccess: false
  },
  backPage () {
    goTabBar('index')
  },
  pageBack () {
    wx.navigateBack()
  },
  getPageData () {
    API.Public.getColonelFutureInfo({
      data:{
        userId: this.userId
      },
      success: ret => {
        const data = ret.data
        if (ret.status == 200 && data) {
          let user =[]
          let successNum=0
          const list = data.fensList||[]
          list.forEach((item,index) => {
            user.push(item.userPic || 'd')
          })
          if (list.length >= 10) successNum++
          if (data.number >= 1) successNum++
          this.setData({ orderNum: data.number, user, successNum})
        }
      },
      complete: ()=>{
        this.setData({ pageLoading: true})
      }
    })
  },
  submit () {
    const { successNum } = this.data
    if (successNum < 2) return
    const { dcId, userInfo } = getApp().data
    showLoading('提交...')
    API.Public.insertColonelInfo({
      data: {
        userId: this.userId,
        dcId: dcId,
        userPhone: userInfo.userPhone,
        userName: userInfo.nickName,
        storeId: ''
      },
      success: ret => {
        hideLoading()
        if (ret.status == 200) {
          this.setData({ showSuccess: true, userIsColonel: true})
        } else {
          alert(ret.msg)
        }
      },
      error: () => {
        hideLoading()
        alert('提交失败，请检查网络是否正常')
      }
    })
  },
  onShow () {
    this.getPageData()
  },
  onLoad (opt) {
    const { colonelId, userId } = getApp().data
    const headHeight = pxToRpx(getApp().globalData.statusBarHeight)||50
    this.setData({headHeight})
    this.colonelId = colonelId
    this.userId = userId
    
  },
  getInput (e) {
    const types = e.currentTarget.dataset.type;
    let value = e.detail.value;
    let obj ={}
    obj[types] = value
    this.setData(obj)
  },
  onShareAppMessage () {
    return {
      title: '生活家 线上批发市场',
      path: '/pages/startupPage/startupPage?inviter=' + this.userId + '&openType=share&colonelId=' + this.colonelId,
      imageUrl: 'https://zksrimg.oss-cn-beijing.aliyuncs.com/images/cmm/hom_share_img.png'
    }
  }
})