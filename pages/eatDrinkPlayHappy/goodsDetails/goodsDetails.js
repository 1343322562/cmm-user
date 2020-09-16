import API from '../../../api/index.js'
import { showLoading, hideLoading, toast, goPage, alert } from '../../../tool/index.js'
import UserBusiness from '../../../tool/userBusiness.js'
Page({
  data: {
    goods:{},
    shop:{},
    custServiceId:'',
    userInfo:{},
    showMessageCard: true
  },
  onShareAppMessage() {
    const { itemName,id } = this.data.goods
    return {
      title: itemName,
      path: '/pages/eatDrinkPlayHappy/goodsDetails/goodsDetails?openType=share&itemNo=' + id,
      imageUrl: ''
    }

  },
  backPage () {
    
    wx.switchTab({
      url: '/pages/home/home'
    })
  },
  onReady() {
  },
  submit () {
    const { userInfo } = getApp().data
    if (userInfo.userPhone) {
      const goods = this.data.goods
      goPage(['eatDrinkPlayHappy', 'purchase'], {
        itemId: goods.id
      })
    } else { // 跳转注册
      goPage('impower', { openType: 'inside' })
    }
    
  },
  openLoaction () {},
  callPhone () {
    const {shop} = this.data
    const tel = shop.contactPhone  || ''
    if (tel) {
      wx.makePhoneCall({ phoneNumber: tel })
    } else {
      toast('没有商家电话')
    }
  },
  getShopInfo(supplierNo) {
    API.Play.getChSupplier({
      data:{
        chSupplierNo: supplierNo
      },
      success: ret => {
        console.log(ret)
        let shop = ret.data
        if (ret.status == 200 && shop) {
          this.setData({ shop})
        }
      },
      error: ()=> {
        toast('获取商家信息失败')
      }
    })
  },
  getPageData () {
    showLoading()
    const {openId}= getApp().data
    API.Play.itemDetail({
      data:{
        itemId: this.itemId,
        openid: openId
      },
      success: ret => {
        hideLoading()
        let goods = ret.data
        if (ret.status == 200 && goods) {
          goods.itemDetailPic && (goods.itemDetailPic = goods.itemDetailPic.split(','))
          goods.itemThumbPic && (goods.itemThumbPic = goods.itemThumbPic.split(','))
          goods.productDetail && (goods.productDetail = JSON.parse(goods.productDetail))
          
          console.log(goods)
          this.setData({ goods })
          this.getShopInfo(goods.supplierNo)
        } else {
          alert('活动已结束', {
            success: () => {
              this.backPage()
            }
          })
        }
      },
      error: () => {
        hideLoading()
        toast('网络异常')
      }
    })
  },
  getComData() {
    API.Public.getComData({
      data: {
        sysCode: getApp().data.sysCode,
        dcId: getApp().data.dcId,
        openid: getApp().data.openid
      },
      success: obj => {
        let data = obj.data
        if (obj.status === 200 && obj.data) {
          if (data.custServiceId && data.custServiceId.length) {
            this.setData({ custServiceId: JSON.stringify(data.custServiceId.split(',')) })
          }
          
        }
      }
    })
  },
  onLoad (opt) {
    this.itemId = opt.itemNo
    const { imgBaseUrl} = getApp().data
    this.setData({ imgBaseUrl })
    if (opt.openType == 'share') {
      UserBusiness.wxLogin(this, getApp().data.colonelId, () => {
        const userInfo = getApp().data.userInfo
        this.setData({ userInfo})
        this.getComData()
      });
    } else {
      this.getComData()
    }
    this.getPageData()
  }
})