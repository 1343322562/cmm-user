import API from '../api/index.js'
import * as types from './types.js'
import commit from './mutations.js'
import { getGoodsImgSize, toast } from '../tool/index.js'
const actions = {
  [types.GET_OPEN_ID](param) {
    const openId = wx.getStorageSync('openId')
    if (openId) {
      commit[types.SAVE_OPEN_ID](openId)
      param && param(openId)
    } else {
      wx.login({
        success: function (res) {
          API.Public.getOpenId({
            data: {
              code: res.code,
              platform: '3'
            },
            success: (res) => {
              let id = ''
              if (res.code == 0) {
                id = res.data
                commit[types.SAVE_OPEN_ID](id)
              }
              param && param(id)
            },
            error: ()=>{
              param && param()
            }
          })
        },
        fail: () => {
          wx.showToast({title: '获取openId失败'})
          param && param()
        }
      })
    }
  },
  [types.GET_ALL_PROMOTION](param) {
    const { branchNo, token, username, platform, dbBranchNo: dbranchNo } = wx.getStorageSync('userObj')
    let obj = {
      // 买赠
      BG: { goods: {}, cls: {}, brand: {}, giftGoods: {} },
      // 捆绑商品
      BD: { goods: {}, cls: {} },
      // 首单特价
      FS: {},
      // 满减
      MJ: { goods: {}, cls: {}, brand: {} },
      // 单日限购
      SD: {},
      // 折扣
      ZK: { goods: {}, cls: {}, brand: {} },
      // 秒杀
      MS: {},
      // 买满赠
      BF: { all: [], goods: {}, cls: {}, brand: {} }
    }
    const beforeTime = wx.getStorageSync('promotionTime')
    const beforeObj = wx.getStorageSync('allPromotion')
    if (!beforeObj) wx.setStorageSync('allPromotion', obj)
    const newTime = +new Date()
    if (!beforeObj || !beforeTime || (newTime - beforeTime) >= (1000 * 60 * 1)) { // (1000 * 60 * 5)
      API.Public.getAllPromotion({
        data: { branchNo, token, username, platform, dbranchNo },
        success: (res) => {
          if (res.code == 0) {
            const list = res.data
            for (let i in list) {
              const item = list[i]
              if (i == 'BG') {
                for (let z in item) {
                  let t = z.split('|')
                  const k = t[0]
                  const l = t[1].split(',')
                  const type = (k == '1' ? 'cls' : (k == '2' ? 'brand' : (k == '3' ? 'goods' : '')))
                  l.forEach(no => {
                    item[z].forEach(goods => {
                      const id = goods.id
                      const goodsNo = goods.giftNo
                      obj.BG[type][no] || (obj.BG[type][no] = {})
                      obj.BG[type][no][id] = goodsNo
                      obj.BG.giftGoods[goodsNo] || (obj.BG.giftGoods[goodsNo] = {})
                      obj.BG.giftGoods[goodsNo][goods.id] = goods
                    })
                  })
                }
              } else if (i == 'SD' || i == 'FS'|| i == 'MS') {
                for (let z in item) {
                  const goods = item[z]
                  obj[i][goods.itemNo] = goods
                }
              } else if (i == 'BD') {
                const { baseImgUrl, zhGoodsUrl} = getApp().data
                const imgUrl = zhGoodsUrl || (baseImgUrl + '/upload/images/spBindItemMaster/')
                item.forEach(goods => {
                  obj.BD.cls[goods.itemClsno] || (obj.BD.cls[goods.itemClsno] = [])
                  obj.BD.cls[goods.itemClsno].push(goods.itemNo)
                  goods.goodsImgUrl = imgUrl + goods.itemNo + '/' + getGoodsImgSize(goods.picUrl)
                  goods.unit || (goods.unit = '')
                  obj.BD.goods[goods.itemNo] = goods
                })
              } else if (i == 'ZK') {
                item.forEach(goods => {
                  const t = goods.filterType
                  const type = t == '0' ? 'allDiscount' : (t == '1' ? 'cls' : (t == '2' ? 'brand' : (t == '3' ? 'goods' : 'data')))
                  const data = { sheetNo: goods.sheetNo, discount: goods.discount, zkType: type }
                  if (t == '0') {
                    obj.ZK[type] = data
                  } else {
                    const value = goods.filterValue.split(',')
                    value.forEach(zk => {
                      obj.ZK[type][zk] = data
                    })
                  }
                })
              } else if (i == 'MJ') {
                item.forEach(info => {
                  const t = info.filterType
                  const type = t == 0 ? 'fullReduction' : (t == '1' ? 'cls' : (t == '2' ? 'brand' : (t == '3' ? 'goods' : 'data')))
                  const data = { reachVal: info.reachVal, subMoney: info.subMoney, sheetNo: info.sheetNo}
                  if ( type =='fullReduction' ) {
                    obj.MJ[type] || (obj.MJ[type] = [])
                    obj.MJ[type].push(data)
                  } else {
                    const value = info.filterValue.split(',')
                    value.forEach(v2 => {
                      obj.MJ[type][v2] || (obj.MJ[type][v2] = [])
                      obj.MJ[type][v2].push(data)
                    })
                  }
                })
              } else if (i == 'BF') {
                item.forEach(goods => {
                  const t = goods.filterType
                  const type = t == '0' ? 'all' : (t == '1' ? 'cls' : (t == '2' ? 'brand' : (t == '3' ? 'goods' : 'data')))
                  const itemNos = goods.giftListNo.split('/')
                  const num = goods.giftListQty.split('/')
                  const name = (goods.giftName || goods.explain).split('/')
                  const unit = (goods.giftUnitNo||'个').split('/')
                  const itemType = goods.giftType.split('/')
                  let data = { sheetNo: goods.sheetNo, explain: goods.explain, data: [], reachVal: goods.reachVal}
                  itemNos.forEach((itemNo,i) => {
                    data.data.push({ itemNo, num: num[i], itemName: name[i], unit: unit[i], itemType: itemType[i]})
                  })
                  if (t == '0') {
                    obj.BF[type].push(data)
                  } else {
                    goods.filterValue.split(',').forEach(info => {
                      obj.BF[type][info] || (obj.BF[type][info] = [])
                      obj.BF[type][info].push(data)
                    })
                  }
                })
              }
            }
            wx.setStorage({ key: 'promotionTime', data: +new Date() })
            wx.setStorage({ key: 'allPromotion', data: obj })
            param.success && param.success(obj)
          } else if(res.code == 2) {
            param.error && param.error(true)
          }else{
            param.error && param.error()
          }
        },
        error: param.error
      })
    } else {
      param.success && param.success(beforeObj)
    }
  },
  [types.CHANGE_CARTS](param) { // add delete minus
    let cartsObj = commit[types.GET_CARTS]()
    if (cartsObj.keyArr.length>=300){
      toast('购物车已达到最大商品数量!')
      return
    }
    const { sourceType, branchNo, sourceNo } = param.config
    let {
      itemNo,
      deliveryType,
      minSupplyQty = 1,
      stockQty,
      supplySpec = 1,
      maxSupplyQty = 9999,
      price,
      orgiPrice = 0,
      specType = '0',
      isBind = '0',
      parentItemNo
    } = param.goods
    stockQty || (stockQty=0)
    maxSupplyQty || (maxSupplyQty = 9999)
    minSupplyQty || (minSupplyQty = 1)
    supplySpec || (supplySpec = 1)
    orgiPrice || (orgiPrice = 0)
    specType || (specType = '0')
    isBind || (isBind = '0')
    const nowNum = (cartsObj[itemNo] ? cartsObj[itemNo].realQty : 0)
    if ((param.type !== 'add' && nowNum <= 1 && param.type != 'input') || param.type === 'delete' || (param.type == 'input' && !param.value)) {
      if (!cartsObj[itemNo]) return
      cartsObj[itemNo].realQty = 0
      cartsObj.num -= nowNum
    } else {
      let item = {
        itemNo: itemNo,
        realQty: nowNum,
        origPrice: orgiPrice,
        validPrice: price,
        specType: isBind=='1'?'2':specType,
        branchNo: branchNo,
        sourceType: sourceType,
        sourceNo: sourceNo,
        parentItemNo: parentItemNo
      }
      if (param.type == 'input') {
        let num2 = param.value - minSupplyQty;
        item.realQty = num2 <= 0 ? minSupplyQty : (minSupplyQty + (num2 <= supplySpec ? supplySpec : supplySpec * parseInt(num2 / supplySpec)))
        cartsObj.num = cartsObj.num - nowNum + item.realQty
      } else {
        const count = (param.type == 'add' ? (nowNum ? supplySpec : minSupplyQty) : -(nowNum - supplySpec >= minSupplyQty ? supplySpec : minSupplyQty))
        item.realQty += count
        cartsObj.num += count
       
      }
      if (sourceType == '0' && param.type != 'minus' && (item.realQty > maxSupplyQty || (item.realQty > (deliveryType == '3' ? 9999 : stockQty)))) {
        toast(item.realQty > maxSupplyQty ? '已达到最大购买数量' :'库存不足')
        return
      }
      cartsObj[itemNo] || cartsObj.keyArr.push(itemNo)
      cartsObj[itemNo] = item
    }
    commit[types.SAVE_CARTS](cartsObj)
    wx.setStorageSync('updateCarts', true)
    // wx.setStorage({key: 'updateCarts',data: true})
    return cartsObj
  },
  [types.GET_CHANGE_CARTS](param) {
    const updateCarts = wx.getStorageSync('updateCarts')
    const { branchNo, token, username, platform } = wx.getStorageSync('userObj')
    const cartsObj = commit[types.GET_CARTS]()
    if (param.nowUpdate && updateCarts && cartsObj.num) param.success(cartsObj)
    let items = []
    cartsObj.keyArr.forEach(itemNo => items.push(cartsObj[itemNo]))
    const beforeTime = wx.getStorageSync('updateCartsTime')
    const newTime = +new Date()
    items = JSON.stringify(updateCarts?items:[])
    if (!param.format||updateCarts || !beforeTime || (newTime - beforeTime) >= (1000 * 60 * 5)) {
      API.Carts.getShoppingCartInfo({
        data: { items, platform, token, username, branchNo },
        success: (res) => {
          let newCartsObj = { num: 0, keyArr:[]}
          if (res.code == 0 && res.data) {
            res.data.forEach(config => {
              config.datas.forEach(goods => {
                const itemNo = goods.itemNo
                newCartsObj.keyArr.push(itemNo)
                newCartsObj[itemNo] = {
                  itemNo: itemNo,
                  realQty: goods.realQty,
                  origPrice: goods.orgiPrice,
                  validPrice: goods.price,
                  specType: goods.specType,
                  branchNo: config.branchNo,
                  sourceType: config.sourceType,
                  sourceNo: config.sourceNo,
                  parentItemNo: goods.parentItemNo
                }
                newCartsObj.num += goods.realQty
              })
            })
            commit[types.SAVE_CARTS](newCartsObj)
            wx.setStorage({ key: 'updateCarts', data: false })
            wx.setStorage({ key: 'updateCartsTime', data: +new Date() })
          } else {
            newCartsObj = cartsObj
            if (res.code == 0) wx.setStorage({ key: 'updateCarts', data: true })
          }
          param.success(param.format ? newCartsObj : res )
        },
        error: () => {
          param.success(param.format ? cartsObj : { msg: '获取购物车失败!请检查网络是否正常' })
        }
      })
    } else {
      param.success(cartsObj)
    }
  },
}
export default actions
