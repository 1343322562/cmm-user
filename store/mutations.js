import * as types from './types'
const mutations = {
  [types.SAVE_PAGE](data) {
    getApp().data.tabBarList[1].show = data === '1'
  },
  [types.PUSH_PAGE_ROUTE](data) {
    getApp().data.pageRoute.push(data)
  },
  [types.SAVE_ORDER_SHARE_IMG](data) {
    getApp().data.shareOrderImg = data
  },
  [types.SAVE_HOME_SHARE_IMG](data) {
    getApp().data.shareImg = data
  },
  [types.CLEAR_PAGE_ROUTE](data) {
    getApp().data.pageRoute = data ? getApp().data.pageRoute.filter(i => i !== data) : []
  },
  [types.BACK_PAGE_ROUTE](data) {
    const index = getApp().data.pageRoute.indexOf(data)
    let arr = []
    for (let i = 0; i < (index + 1); i++) {
      arr.push(getApp().data.pageRoute[i])
    }
    getApp().data.pageRoute = arr
  },
  [types.SAVE_OPEN_ID](data) {
    getApp().data.openid = data
  },
  [types.SAVE_SESION_KEY](data) {
    getApp().data.sessionKey = data
  },
  [types.SAVE_STORE_ID](data) {
    getApp().data.storeId = data
  },
  [types.SAVE_COLONEL_ID](data) {
    getApp().data.colonelId = data
  },
  [types.SAVE_HQ_COLONEL_ID](data) {
    getApp().data.hqColonelId = data
  },
  [types.SAVE_USER_WX_INFO](data) {
    getApp().data.userWxInfo = data
  },
  [types.SAVE_USER_INFO](data) {
    getApp().data.userInfo = data
  },
  [types.SAVE_SHOP_INFO](data) {
    getApp().data.shopInfo = data
  },
  [types.SAVE_FIRST_GIFT_INFO](data) {
    getApp().data.firstGiftInfo = data
    wx.setStorage({ key: 'firstGiftInfo', data: data })
  },
  [types.SAVE_CARTS](data) {
    const dcId = getApp().data.shopInfo.dcId
    getApp().data.homeCartsNum = data.num
    wx.setStorageSync('cartsObj' + dcId, data)
    // wx.setStorage({ key: 'cartsObj' + dcId, data: data })
  },
  [types.SAVE_EXPRESS_CARTS](data) {
    getApp().data.expressCartsNum = data.num
    wx.setStorage({ key: 'expressCartsObj', data: data })
  },
  [types.GET_EXPRESS_CARTS](data) {
    const obj = wx.getStorageSync('expressCartsObj') || { num: 0, keyArr: [], type: 'express' }
    getApp().data.expressCartsNum = getApp().data.tabBarList[1].show? obj.num:0
    return obj
  },
  [types.GET_CARTS](data) {
    const dcId = getApp().data.shopInfo.dcId
    const obj = wx.getStorageSync('cartsObj' + dcId) || { num: 0, keyArr: [], type: 'home' }
    getApp().data.homeCartsNum = obj.num
    return obj
  },
  [types.CLEAR_CARTS](data) {
    wx.getStorageInfo({
      success: (res) => {
        res.keys.forEach(item => {
          if (item.indexOf('cartsObj' + (data || '')) !== -1) {
            wx.removeStorage({ key: item })
          }
        })
      }
    })
    getApp().data.homeCartsNum = 0
  },
  [types.CLEAR_EXPRESS_CARTS](data) {
    wx.removeStorage({ key: 'expressCartsObj' })
    getApp().data.expressCartsNum = 0
  },
  [types.SAVE_RECEIVING_ADDRESS](data) {
    getApp().data.receivingAddr = data||{}
  },
  [types.SAVE_USER_NOW_LOCATION](data) {
    getApp().data.nowLocation = data
  }
}

export default mutations
