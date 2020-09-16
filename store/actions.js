import API from '../api/index.js'
import * as types from './types.js'
import commit from './mutations.js'
const actions = {
  [types.GET_PAGE](param) {
    // param.complete && param.complete()
    const storeId = getApp().data.storeId
    API.Public.hqVerify({
      data: {
        storeId: storeId
      },
      success: (res) => {
        if (res.status === 200) {
          const data = res.data || { "hqStatus": "0", "vipStatus": "0" }
          const type = data.hqStatus
          commit[types.SAVE_PAGE](type)
          let num = 0
          getApp().data.tabBarList[2].show = data.vipStatus == '1'
          if (type == '1') {
            //num = commit[types.GET_EXPRESS_CARTS]().num
            this[types.GET_RECEIVING_ADDRESS]()
          }
          getApp().data.expressCartsNum = num
        }
      },
      complete: param.complete
    })
  },
  [types.GET_RECEIVING_ADDRESS](param) {
    const { receivingAddr, openId} = getApp().data
    if (receivingAddr) return
    API.Addreess.memberAddrToleration({
      data: {openid: openId},
      success: (res) => { res.status === 200 && commit[types.SAVE_RECEIVING_ADDRESS](res.data)}
    })
  },
  [types.GET_OPEN_ID](param) {
    API.Public.getOpenId({
      data: param.data,
      success: (res) => {
      	let storeId
        if (res.status === 200 && res.data) {
          const obj = res.data
          let openId = null
          let vipInfo = {}
          storeId = obj.storeId
          let colonelId = obj.colonelId
          let hqColonelId = obj.colonelId // obj.hqColonelId
          obj.vipInfo || (obj.vipInfo = [])
          obj.vipInfo.forEach(item=>{
            vipInfo[item.dcId] = true
          })
          getApp().data.vipInfo = vipInfo
          if (obj.status == '1' || obj.user) {
            const { nickName, userPic, userPhone, userCode } = obj.user
            openId = obj.user.openid
            if (!colonelId || colonelId === '0') colonelId = obj.user.nowColonelId
            if (!hqColonelId || hqColonelId === '0') hqColonelId = obj.user.nowColonelId //obj.user.hqColonelId
            commit[types.SAVE_USER_WX_INFO]({ nickName: nickName, avatarUrl: userPic })
            commit[types.SAVE_USER_INFO]({ phone: userPhone, userId: obj.userId, pickupCode: userCode })
          } else {
            openId = obj.openid
            this[types.GET_USER_WX_INFO]
            commit[types.SAVE_SESION_KEY](obj.session_key)
          }
          this[types.GET_FIRST_GIFT_INFO]({openId})
          commit[types.SAVE_OPEN_ID](openId)
          commit[types.SAVE_STORE_ID](storeId)
          commit[types.SAVE_COLONEL_ID](colonelId)
          commit[types.SAVE_HQ_COLONEL_ID](hqColonelId)
          storeId ? this[types.GET_SHOP_INFO]({
            success: () => {
              param.success && param.success(res)
            }
          }) : (param.success && param.success(res))
        } else {
          param.error && param.error()
        }
        
      },
      error: param.error
    })
  },
  [types.GET_USER_WX_INFO](param) {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            lang: 'zh_CN',
            success: res => {
              commit[types.SAVE_USER_WX_INFO](res.userInfo)
            }
          })
        }
      }
    })
  },
  [types.GET_FIRST_GIFT_INFO](param) {
    const firstGiftInfo = wx.getStorageSync('firstGiftInfo')
    if (firstGiftInfo) {
      firstGiftInfo.show = false
      commit[types.SAVE_FIRST_GIFT_INFO](firstGiftInfo)
      return
    }
    API.Index.firstGift({
      data: {
        openid: param.openId
      },
      success: (res) => {
        let obj = res.data
        if (res.status === 200 && obj) {
          obj.show = true
          commit[types.SAVE_FIRST_GIFT_INFO](obj)
        }
      }
    })
  },
  [types.GET_SHOP_INFO](param) {
    const { imgBaseUrl, openId, colonelId, storeId, hqColonelId} = getApp().data
    API.Shop.storeinfo({
      data: { 
        openid: openId,
        colonelId: colonelId || '',
        storeId: storeId,
        hqColonelId: hqColonelId || ''
      },
      success: (res) => {
        if (res.status == 200) {
          const data = res.data
          getApp().data.isVip = getApp().data.vipInfo[data.dcId]
          const orderSharePic = data.orderSharePic
          const userSharePic = data.userSharePic
          wx.setStorageSync('pageDcId', data.dcId)
          commit[types.SAVE_SHOP_INFO](data)
          orderSharePic && commit[types.SAVE_ORDER_SHARE_IMG]( orderSharePic)
          userSharePic && commit[types.SAVE_HOME_SHARE_IMG]( userSharePic)
          if (param && param.success) {
            param.success()
          }
        } else {
          wx.showModal({
            content: res.msg||'网络异常，请检查网络是否正常', showCancel: false, success: () => {
              wx.reLaunch({
                url: '/pages/loadError/loadError'
              })
            }
          })
        }
      },
      error:()=> {
        wx.showModal({ content: '网络异常，请检查网络是否正常', showCancel: false,success:() => {
          wx.reLaunch({
            url: '/pages/loadError/loadError'
          })
        }})
      },
      complete: param?param.complete:()=>{}
    })
  },
  [types.CHANGE_CARTS](param) { // add delete minus
    let cartsObj = commit[types.GET_CARTS]()
    const itemId = param.goods.itemId
    const status = param.goods.saleStatus
    const maxPersonQty = Number(param.goods.maxPersonQty) || 101
    const nowNum = (cartsObj[itemId] ? cartsObj[itemId].num : 0)
    if ((param.type != 'add' && nowNum <= 1) || param.type === 'delete') {
      if (!cartsObj[itemId]) return 
      delete cartsObj[itemId]
      cartsObj.num -= nowNum
      const newArr = cartsObj.keyArr.filter(i => i != itemId)
      cartsObj.keyArr = newArr
    } else {
      if (param.type === 'add' && ((status != '1' && status) || (param.goods.saleType === '0' && (nowNum >= 100 || (nowNum + 1) > maxPersonQty)))) {
        wx.showToast({
          title: status === '0' ? '商品还未售卖哦~' : (status === '2' ? '商品已售完' : (status === '3' ? '商品已截单' : (nowNum >= 100 ? '最多只能买100份哦' : ('每个用户限购数量' + maxPersonQty + '份')))),
          icon: 'none'
        })
        return
      }
      let item = {
        itemId: itemId,
        itemName: param.goods.itemName,
        itemSizeDes: param.goods.itemSizeDes,
        num: nowNum,
        itemNowPrice: param.goods.itemNowPrice,
        itemDisPrice: param.goods.itemDisPrice,
        itemPrePrice: param.goods.itemDisPrice,
        itemThumbPic: param.goods.itemThumbPic,
        takingDate: param.goods.takingDate,
        supplierName: param.goods.supplierName,
        supplierNo: param.goods.supplierNo,
        maxPersonQty: maxPersonQty,
        saleType: param.goods.saleType || '0',
      }
      param.goods.itemType == '2' && (item.itemType = '2')
      const count = (param.type === 'add' ? 1 : -1)
      cartsObj.num += count
      item.num += count
      cartsObj[itemId] || cartsObj.keyArr.push(itemId)
      cartsObj[itemId] = item
    }
    commit[types.SAVE_CARTS](cartsObj)
    return cartsObj
  },
  [types.CHANGE_EXPRESS_CARTS](param) {
    let cartsObj = commit[types.GET_EXPRESS_CARTS]()
    const itemId = param.goods.itemId
    const status = param.goods.saleStatus
    const nowNum = (cartsObj[itemId] ? cartsObj[itemId].num : 0)
    if ((param.type != 'add' && nowNum <= 1) || param.type === 'delete') {
      if (!cartsObj[itemId]) return
      delete cartsObj[itemId]
      cartsObj.num -= nowNum
      const newArr = cartsObj.keyArr.filter(i => i != itemId)
      cartsObj.keyArr = newArr
    } else {
      if ((param.type === 'add' && (status != '0' && status)) || nowNum >= 100) {
        wx.showToast({
          title: status === '1' ? '商品已售完' : '最多只能买100份哦',
          icon: 'none'
        })
        return
      }
      let item = {
        itemId: itemId,
        itemName: param.goods.itemName,
        itemSizeDes: param.goods.itemSizeDes,
        num: nowNum,
        itemNowPrice: param.goods.itemNowPrice,
        itemDisPrice: param.goods.itemDisPrice,
        itemPrePrice: param.goods.itemDisPrice,
        itemThumbPic: param.goods.itemThumbPic,
        supplierName: param.goods.supplierName,
        supplierNo: param.goods.supplierNo,
        itemNo: param.goods.itemNo
      }
      const count = (param.type === 'add' ? 1 : -1)
      cartsObj.num += count
      item.num += count
      cartsObj[itemId] || cartsObj.keyArr.push(itemId)
      cartsObj[itemId] = item
    }
    commit[types.SAVE_EXPRESS_CARTS](cartsObj)
    return cartsObj
  },
  [types.CANVAS_SAVE_IMAGES](param,_obj) {
    if (_obj.imagesAuthorization == 'fail') {
      wx.showModal({
        content: '请授权允许保存图片到相册',
        confirmColor: '#1bb879',
        confirmText: '去设置',
        success: ret => {
          if (ret.confirm) {
            wx.openSetting({
              success: (ret) => {
                if (ret.authSetting['scope.writePhotosAlbum']) {
                  wx.showLoading()
                  setTimeout(() => {
                    wx.hideLoading()
                    _obj.imagesAuthorization = null
                  }, 500)
                }
              }
            })
          }
        }
      })
    } else {
      wx.showLoading({title: '保存图片..'})
      wx.canvasToTempFilePath({
        canvasId: param.canvasId,
        fileType: 'jpg',
        quality: 1.0,
        success: (res) => {
          const canvasImg = res.tempFilePath
          wx.saveImageToPhotosAlbum({
            filePath: canvasImg,
            success: (res) => {
              wx.hideLoading()
              wx.showToast({title: '图片已保存到相册',icon: "success"})
              param.success&&param.success()
            },
            fail: (e) => {
              wx.hideLoading()
              if (e.errMsg.indexOf('auth') !== -1) {
                wx.showToast({ title: '图片保存失败', icon: "none" })
                _obj.imagesAuthorization = 'fail'
              }
              param.error && param.error()
            }
          })
        },
        fail: () => {
          wx.hideLoading()
          wx.showToast({ title: '图片保存失败!', icon: "none" })
          param.error && param.error()
        }
      }, _obj)
    }
  },
  [types.GET_ALL_SECKILL_GOODS](param) {
    const { dcId, userId } = getApp().data
    const allSeckillGoods = wx.getStorageSync('allSeckillGoods')
    if (allSeckillGoods && param.getType!='array'&&!param.load){
      param.success && param.success(allSeckillGoods)
      if (param.one) return
    }
    API.Seckill.getPromotionData({
      data:{
        dcId,
        userId,
        type:1,
        itemIds: param.itemIds||''
      },
      success: (ret) => {
        let obj = {}
        const list = ret.data || []
        if (ret.status == 200) {
          list.forEach(item => {
            item.details.forEach(goods => {
              if (item.state == 1 && goods.buyQty > 0) {
                goods.orderLimitNum || (goods.orderLimitNum=9999)
                obj[goods.otherId] = {
                  maxNum: goods.buyQty > goods.orderLimitNum ? goods.orderLimitNum : goods.buyQty,
                  endTime: goods.endTime,
                  promotionNo: goods.templateId,
                  price: goods.discountAmt,
                  type: 'MS'
                }
              }
            })
          })
          wx.setStorageSync('allSeckillGoods', obj)
        }
        param.success && param.success(param.getType == 'array' ? list : obj)
      },
      error: ()=>{
        param.success && param.success(param.getType == 'array' ? [] : (allSeckillGoods||{}))
      }
    })
  },
  [types.GET_SERVER_TIME](param) {
    // console.log(112233, )
    API.Public.currentTimeMillis({
      success: (obj) => {
        console.log(obj)
        param(typeof obj == 'number' ? obj : (+new Date()))
      },
      error: () => {
        param(+new Date())
      }
    })
  },
  [types.VERIFY_STOCK](param) {
    let goods = param.goods||wx.getStorageSync('ShoppingCartGoodsList')||{}
    let cartsGoods = wx.getStorageSync('ShoppingCartGoodsList') || {}
    let allPromotionGoods = param.allPromotionGoods || (wx.getStorageSync('allSeckillGoods')||{})
    let itemList = []
    for (let i in goods) {
      let itemId = i
      const isPromotion = (allPromotionGoods[itemId] && !allPromotionGoods[itemId].No)
      if (i.indexOf('ms_') != -1) itemId = i.split('_')[1]
      itemList.push({
        itemId,
        promotionType: isPromotion ? '1' : '',
        promotionNo: isPromotion ? allPromotionGoods[itemId].promotionNo : ''
      })
    }
    const { dcId, userId } = getApp().data
    if (!itemList.length) return
    API.Public.checkOrderdata({
      data: {
        dcId,
        userId,
        itemList: JSON.stringify(itemList)
      },
      success: ret => {
        if (ret.status == 200) {
          const data = ret.data || []
          let error = [];
          let deleteGoods = []
          data.forEach(item => {
            const itemId = item.itemId
            const no = 'ms_' + itemId
            if (!item.promotionNo) {
              if (item.maxQty <= 0) {
                if (goods[no]) {
                  cartsGoods[itemId].num = cartsGoods[itemId].num - goods[no].num
                  error.push('[' + goods[itemId].itemName + '(非秒杀商品)]已达到购买上限')
                } else {
                  deleteGoods.push(goods[itemId].itemName)
                  delete cartsGoods[itemId]
                }
              } else if (goods[itemId].num > item.maxQty) {
                error.push('[' + goods[itemId].itemName + ']购买数量不能大于库存数量(' + item.maxQty + ')')
              }
            }
            if (item.promotionNo) {
              allPromotionGoods[itemId].price = item.price
              allPromotionGoods[itemId].maxNum = item.maxQty
            } else if (goods[itemId] && cartsGoods[itemId]) {
              goods[itemId].itemNowPrice = item.price
              goods[itemId].maxSupplyQty = item.maxQty
              cartsGoods[itemId].itemNowPrice = item.price
              goods[itemId].maxSupplyQty = item.maxQty

            }
          })
          deleteGoods.length && error.push('[' + deleteGoods.join('、') + ']库存不足将自动从购物车中删除')
          wx.setStorageSync('ShoppingCartGoodsList', cartsGoods)
          if (error.length) {
            wx.showModal({
              content: error.join(';') + '，请调整后再下单',
              showCancel:false,
              success: ret => {}
            })
          }
          param.success && param.success(error.length,allPromotionGoods)
        } else {
          param.success && param.success()
        }
      },
      error: () => {
        param.success && param.success()
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  }
  
}
export default actions
