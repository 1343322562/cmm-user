import API from '../api/index.js'
import {
  getTime,
  deepCopy,
  getRemainTime,
  showLoading,
  hideLoading,
  goPage,
  alert,
  toast
} from '../tool/index.js'
const app = getApp()
const UserBusiness = {

  getUserInfo(context, set_data_key) {

    if (!getApp().data.userInfo || !getApp().data.userInfo.userId) {
      return null;
    } else {
      if (set_data_key) {
        context.setData({
          set_data_key: getApp().data.userInfo
        });
      }
      return getApp().data.userInfo;
    }
  },

  wxLogin(context, colonelId, call,error) {
    console.log(error)
    wx.login({
      success: (res) => {
        //return;
        const inviter = getApp().data.inviter||''
        if (inviter) getApp().data.inviter = null
        this.getOpenId({
          data: {
            code: res.code,
            platform: '3',
            storeId: '',
            colonelId: colonelId || '',
            openType: '0',
            identify: '0',
            dcId: getApp().data.dcId,
            sysCode: getApp().data.sysCode,
            inviter
          }, error: error
        }, call)
      },
      fail: (obj) => {
        if (error){
          error(obj)
        }
      }
    })
  },
  setUserInfo(data) {

  },

  getDcByarea(res) {
    API.Public.getDcByarea({
      data: {locationX: res.longitude,locationY: res.latitude,openid: getApp().data.openid},
      success: (res) => {
        if (res.data == null) {
          goPage('selectSysCode', {openId: getApp().data.openid,t: 'home',type:0})
        } else {
          //getApp().data.dcId = res.data.dcId
          //getApp().data.sysCode = res.data.sysCode
          const pages = getCurrentPages()
          const perpage = pages[pages.length - 1]
          perpage.onShow()
        }
      }
    })
  },

  //自动根据经纬度定位配送中心
  autoLocationMatchDC(){
    let that=this
    //调用获取位置信息
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        that.getDcByarea(res, getApp().data.openid)
      },
      fail(res) {
        goPage('selectSysCode', { openId: getApp().data.openid, t:'home', type: 0 }) // 0： 不需要输入密码
      }
    })
  },
  getStoreInfo(colonelId) {
    console.log(colonelId)
    const _this = this
    API.Orders.storeinfo({
      data: {
        colonelId,
        storeId:  (app.data.storeInfo && 'storeId' in app.data.storeInfo) ? app.data.storeInfo.storeId : ''
      },
      success: ret => {
        console.log('order.storeinfo', ret, app.data.storeInfo.storeId)
        const storeInfo = ret.data.store
        if (ret.status == 200 && storeInfo) {
          getApp().data.storeInfo = storeInfo
          getApp().data.storeMode = true
          getApp().data.storeColonelId = colonelId
          app.data.storeMode = storeInfo.openStore
          app.data.storeInfo = storeInfo
          wx.setStorageSync('currentStoreAddr', storeInfo)
          wx.setStorageSync('currentStoreMode', storeInfo.openStore)
          // app.globalData.switchTransWay = storeInfo.openStore
          const pages = getCurrentPages()
          console.log(pages)
          const pageObj = pages[pages.length-1]
          const componentObj = pageObj.selectComponent('#index')
          componentObj.currentStoreAddr = storeInfo
          componentObj.setData({ currentStoreMode: storeInfo.openStore, currentStoreAddr: storeInfo, switchTransWay: storeInfo.openStore })
          wx.setStorageSync('switchTransWay', storeInfo.openStore)
          componentObj.getUserStoreList()
          console.log('getCurrentPages()', componentObj)
          // wx.setStorageSync('currentStoreMode', storeInfo.openStore)
        }
      }
    })
  },
  getOpenId(param, call) {
    console.log('getopenidParam', param)
    let that = this
    API.Public.getOpenId({
      data: param.data,
      success: (res) => {
        console.log('getopenid', res, app)
        if (res.status === 200 && res.data) {
          getApp().data.sessionKey = res.data.session_key
          getApp().data.openid =  res.data.openid || res.data.user.openid
          getApp().data.openId = res.data.openid || res.data.user.openid
          const ownColonelId = res.data.ownColonelId || res.data.nowColonelId
          console.log('ownColonelId', ownColonelId)
          if (ownColonelId || getApp().data.storeMode) {
            ownColonelId && (getApp().data.userIsColonel = true)
            const storeInfo = wx.getStorageSync('currentStoreAddr') || ''
            console.log('get时代大厦大所大所大所大所', storeInfo, app.data.shareType);
            (!storeInfo || app.data.storeInfo.storeId && app.data.shareType != 'goodShare') && that.getStoreInfo(ownColonelId || getApp().data.storeColonelId)
          }
          //res.data.dcId=null
          if (!res.data.dcId) {
            that.autoLocationMatchDC()
            return
          }
          if (res.data.user) {
            res.data.user.userId = res.data.user.id
            getApp().data.userInfo = res.data.user
            getApp().data.openid = res.data.user.openid
            getApp().data.sysCode = res.data.sysCode
            getApp().data.dcId = res.data.dcId
            getApp().data.colonelId = res.data.user.nowColonelId
            getApp().data.dcName = res.data.dcName
            getApp().data.colonelInfo = res.data.colonel
            getApp().data.userId = res.data.user.userId
            if (res.data.colonel) {
              getApp().data.colonelInfo.colonelId = res.data.colonel.id
            }
          } else {
            getApp().data.dcId = res.data.dcId
            getApp().data.colonelId = res.data.nowColonelId
            getApp().data.openid = res.data.openid
            getApp().data.sysCode = res.data.sysCode
            getApp().data.sessionKey = res.data.session_key
            getApp().data.dcName = res.data.dcName
            getApp().data.colonelInfo = res.data.colonel
            getApp().data.userId = res.data.userId
            if (res.data.colonel) {
              getApp().data.colonelInfo.colonelId = res.data.colonel.id
            }
          }
          call && call(res.data)
        } else {

        }
      },
      error: param.error
    })

  },
  //通过金额计算运费
  calcPostageMoney(amount) {
    let postageSection = getApp().data.postageSection
    let postageMoney = 0
    for (let index in postageSection) {
      var item = postageSection[index]
      if (amount >= item.minAmt) {
        postageMoney = item.postage
      }
    }
    return postageMoney
  },
  //获取配送中心运费
  getPostageSection(callback) {
    API.Public.postage({
      data: {
        openid: getApp().data.openid,
        sysCode: getApp().data.sysCode,
        dcId: getApp().data.dcId
      },
      success: obj => {
        getApp().data.postageSection = obj.data
      },
      error: () => {

      }
    });
  },
  //获取起送金额
  getStartDeliveMoney() {
    API.Public.startDeliver({
      data: { openid: getApp().data.openid,sysCode: getApp().data.sysCode,dcId: getApp().data.dcId},
      success: obj => {
        getApp().data.startDeliveMoney=Number(obj.data)
      },
      error: () => {

      }
    });
  }
}
export default UserBusiness