import { toast, alert, setFilterDataSize, goPage, getRemainTime, showLoading, hideLoading, deepCopy } from '../../tool/index.js'
import { ShoppingCartGoods } from '../../tool/shoppingCart.js'
import * as types from '../../store/types.js'
import API from '../../api/index.js'
import dispatch from '../../store/actions.js'
let shoppingCart = new ShoppingCartGoods();//实例化类
Component({
  properties: {
    type: String,
    imgBaseUrl: String
  },
  data: {
    leftAnimation: false,
    isSelectAll: false,
    cartsMoney: 0,
    selectNum: 0,
    selectTypeNum: 0,
    allPromotionGoods: {},
    imgV: '?v=' + new Date().getTime(),
    seckillDate:{}
  },
  methods: {
    deleteAllGoods () {
      alert('确定清除购物车吗?', {
        showCancel: true,
        confirmColor: '#e60012',
        success: (res) => {
          if (res.confirm) {
            wx.setStorageSync('ShoppingCartGoodsList',{})
            this.triggerEvent('getCartsNum')
            this.setData({ itemsIds: [], goods: {} })
            shoppingCart.setCartCount()
          }
        }
      })
    },
    getGoodsStock (selected,fun) {
      showLoading()
      let promotionGoods = this.data.allPromotionGoods
      let goods = {}
      const goodsObj = this.data.goods
      this.data.itemsIds.forEach(itemId=>{
        if (selected[itemId]) {
          goods[itemId] = goodsObj[itemId]
        }
      })
      dispatch[types.VERIFY_STOCK]({
        allPromotionGoods:promotionGoods,
        goods,
        success: (ret, allPromotionGoods) => {
          if (!ret) {
            fun()
          } else {
            this.setData({ allPromotionGoods });
            this.judgeSeckillGoods()
            const itemsIds = shoppingCart.getGoodsListId()
            if (!itemsIds.length) {
              this.triggerEvent('getCartsNum')
              shoppingCart.setCartCount()
            } else {
              this.countMoney()
            }
          }
        }
      })
    },
    loadData() {
      ///console.log("购物车的数据", shoppingCart.getGoodsList())
      const goods = shoppingCart.getGoodsList()
      const itemsIds = shoppingCart.getGoodsListId()
      this.setData({ goods, itemsIds });
      this.countMoney()
      this.getSeckillData()
    },
    judgeSeckillGoods () {
      let { allPromotionGoods}= this.data
      let goods = shoppingCart.getGoodsList()
      let itemsIds = [];
      (shoppingCart.getGoodsListId()).forEach((itemId,index) => {
        const t = allPromotionGoods[itemId]
        const item = goods[itemId]
        itemsIds.push(itemId)
        if (t) {
          const no = 'ms_' + itemId
          const maxNum = t.maxNum
          const num = item.num
          
          if (num > maxNum) {
            // itemsIds.splice(index+1, 0, no)
            itemsIds.push(no)
            goods[no] = deepCopy(item)
            goods[no].num = num - maxNum
            goods[no].derivationGoods = true
            delete goods[no].isMS
            goods[itemId].num = maxNum
            goods[itemId].disabled = true
          }
          goods[itemId].MSprice = t.price
          goods[itemId].msMaxNum = maxNum
          goods[itemId].isMS = true
        }
      })

      this.setData({ goods, itemsIds})
    },
    getSeckillData () {

      dispatch[types.GET_ALL_SECKILL_GOODS]({
        success: allPromotionGoods => {
          this.setData({ allPromotionGoods })
          
          let { itemsIds} = this.data
          let countArr = []
          itemsIds.forEach((item,index)=>{
            if (allPromotionGoods[item]) {
              countArr.push({ no: item, time: allPromotionGoods[item].endTime })
            }
          })
          this.judgeSeckillGoods()
          this.countSeckillDate(!countArr.length, countArr)
          this.countMoney()
        }
      })
    },
    countSeckillDate(clear, countArr) {
      this.seckillTime && clearInterval(this.seckillTime)
      if (clear) return
      dispatch[types.GET_SERVER_TIME](serverTime => {
        const nowTime = +new Date()
        let forCount = () => {
          let isload
          let seckillDate = {}
          countArr.forEach(item => {
            const time = getRemainTime(item.time, nowTime, serverTime)
            if (time) {
              seckillDate[item.no] = time
            } else if (!isload && !time) { // 倒计时结束
              isload = true
              clearInterval(this.seckillTime)
              this.getSeckillData()
            }
          })
          this.setData({ seckillDate })
        }
        forCount()
        this.seckillTime = setInterval(forCount, 1000)
      })
    },
    setSize(rex) {
      return (rex / 750) * this.ww
    },
    touchstart(e) {
      const clientX = e.changedTouches[0] && e.changedTouches[0].clientX
      if (!clientX) return
      this.startPoint = clientX
      this.setData({ leftAnimation: false })
    },
    touchend(e) {
      const no = e.currentTarget.dataset.no
      const leftAnimation = true
      let goods = this.data.goods
      const left = (goods[no].goodsLeft >= this.setSize(180) / 2) ? this.setSize(180) : 0
      goods[no].baseGoodsLeft = left
      goods[no].goodsLeft = left
      this.setData({ goods, leftAnimation })
    },
    touchmove(e) {
      const clientX = e.changedTouches[0] && e.changedTouches[0].clientX
      if (!clientX) return
      const no = e.currentTarget.dataset.no
      let goods = this.data.goods
      if (goods[no].disabled)return
      let move = this.startPoint - clientX
      if (move < goods[no].baseGoodsLeft && move >= 0) return
      if (move <= 0) move += goods[no].baseGoodsLeft
      if (move <= this.setSize(500)) {
        goods[no].goodsLeft = (move >= 0) ? move : 0
      }
      this.setData({ goods })
    },
    goGoodsDetails(e) {
      let itemId = e.currentTarget.dataset.no
      if (itemId.indexOf('ms_')!=-1) itemId = itemId.substring(3)
      goPage('goods', { itemId: itemId, t: this.data.type })
    },
    countMoney() {
      let cartsMoney = 0
      let selectNum = 0
      let selectTypeNum = 0
      let isSelectAll = this.data.isSelectAll
      const goods = this.data.goods
      this.data.itemsIds.map(k => {
        const item = goods[k]
        if (item && !item.cancelSelected) {
          cartsMoney = Number((cartsMoney + ((item.isMS ?item.MSprice: item.itemNowPrice) * item.num)).toFixed(2))
          selectNum += item.num
          selectTypeNum += 1
        }
      })
      goods.num === selectNum && (isSelectAll = true)
      this.setData({ cartsMoney, selectNum, selectTypeNum, isSelectAll })
      shoppingCart.setCartCount()
    },
    goLiquidation() {
      const { goods, selectNum, selectTypeNum, cartsMoney, type } = this.data
      if (!selectNum) {
        toast('请选择购买商品')
        return
      }
      let obj = {}
      this.data.itemsIds.map(item => {
        if (!goods[item].cancelSelected) {
          obj[item] = goods[item].num
        }
      })
      this.getGoodsStock(obj,()=>{
        this.triggerEvent('goLiquidation', obj)
      })
    },
    selectAllGoods() {
      let { goods, itemsIds} = this.data
      let selectObj = {}
      const isSelectAll = !this.data.isSelectAll
      itemsIds.map(item => {
        goods[item].cancelSelected = !isSelectAll
      })
      wx.setStorage({ data: goods, key: 'ShoppingCartGoodsList' })
      this.setData({ isSelectAll, goods })
      this.countMoney()
    },
    //点击商品checkbox
    selectGoods(e) {
      const itemId = e.currentTarget.dataset.no
      let { goods, isSelectAll } = this.data
      const is = !goods[itemId].cancelSelected
      goods[itemId].cancelSelected = is
      wx.setStorage({ data: goods, key: 'ShoppingCartGoodsList' })
      if (is) isSelectAll = false
      console.log(goods[itemId], goods)
      this.setData({ goods, isSelectAll })
      this.countMoney()
    },
    changeGoodsNum(e) {
      console.log(e)
      const itemId = e.currentTarget.dataset.no
      const type = e.currentTarget.dataset.type
      let carts = this.data.goods
      const goodsType = this.data.type
      const goods = carts[itemId]
      if (goods.disabled) return
      if (((type === 'minus' && goods.num === 1 && !goods.derivationGoods) || type === 'delete')) {
        alert('您确定要删除此商品吗？', {
          showCancel: true,
          confirmColor: '#f49b1e',
          success: (res) => {
            if (res.confirm) {
              if (goods.derivationGoods) {
                shoppingCart.minusGoods(goods, goods.num);
              } else {
                shoppingCart.delGoods(itemId)
              }
              this.judgeSeckillGoods()
              this.triggerEvent('getCartsNum')
              this.countMoney()
            }
          }
        })
      } else {
        if (type == "minus") {
          shoppingCart.minusGoods(goods);
          console.log(1)
        } else {
          shoppingCart.addGoods(goods);
          console.log(2, goods)
        }
        this.judgeSeckillGoods()
        this.triggerEvent('getCartsNum')
        this.countMoney()
      }
    }
  },
  attached() {
    const { ww } = getApp().data
    this.ww = ww
  }
})
