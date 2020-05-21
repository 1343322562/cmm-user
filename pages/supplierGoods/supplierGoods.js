import * as types from '../../store/types.js'
import API from '../../api/index.js'
import dispatch from '../../store/actions.js'
import { showLoading, hideLoading, alert, getGoodsImgSize, goPage, toast } from '../../tool/index.js'
const maxNum = 20
let baseGoodsList
Page({
  data: {
    config: null,
    pageLoading: false,
    clsList: [],
    goodsList: [], // 商品编号
    goodsObj: {},  // 商品信息。 渲染商品逻辑：根据 goodsList 来查找 goodsObj 中的数据，并渲染至页面
    totalLength: '',
    partnerCode: getApp().data.partnerCode,
    nowSelectCls: '',
    cartsObj: {}
  },
  changeCarts(e) {
    console.log("changeCarts:", e)
    const { type, no } = e.currentTarget.dataset
    const sourceNo = this.supplierNo
    const goods = this.data.goodsObj[no]
    const {  branchNo } = this.userObj
    const config = {
      sourceType: '1',
      branchNo,
      sourceNo
    }

    // 本来想在赋值 cartsObj 之前就 判断 是否达到限制值。需要加判断 第一次进来时 触发，之后再达到限制范围时再触发
    console.log(this.data.cartsObj, goods, this.data.cartsObj[goods.itemNo])
    console.log(this.data.cartsObj, goods, this.data.cartsObj[goods.itemNo])
    console.log(this.data.cartsObj, goods, this.data.cartsObj[goods.itemNo])
    const cartsObj = dispatch[types.CHANGE_CARTS]({ goods, type, config })
    console.log(cartsObj, goods, cartsObj[goods.itemNo])
    console.log(cartsObj, goods, cartsObj[goods.itemNo])
    console.log(cartsObj, goods, cartsObj[goods.itemNo])
    if (!!goods.todayPromotion && cartsObj[goods.itemNo].realQty > goods.todayPromotion.limitedQty) {
      console.log("rjinglai")
      cartsObj[goods.itemNo].realQty = this.data.cartsObj[goods.itemNo].realQty
      toast('已达到最大限购数量')
      return
    }
    
    cartsObj && this.setData({ cartsObj: cartsObj })
  },
  getCartsData() {
    dispatch[types.GET_CHANGE_CARTS]({
      format: true,
      nowUpdate: true,
      success: (cartsObj) => {
        this.setData({ cartsObj })
      }
    })
  },
  getCls () {
    const supcustNo = this.supplierNo
    const { branchNo, token, platform, username } = this.userObj
    showLoading('请稍后...')
    API.Goods.searchItemCls({
      data: { branchNo, supcustNo, token, platform, username },
      success: res => {
        const data = res.data
        if (res.code == 0 && data) {
          const clsList = data.maintainCls || []
          // let nowSelectCls = ''
          if (clsList.length) {
            // nowSelectCls = clsList[0].itemClsno
          } else {
            hideLoading()
            this.setData({ pageLoading: true })
          }
          console.log("获取goodlist")
          this.setData({ clsList })
          this.getGoodsList()
        } else {
          hideLoading()
          alert(res.msg)
        }
      },
      error: () => {
        hideLoading()
        alert('获取类别失败，请检查网络是否正常')
      }
    })
  },
  goCartsPage() {
    wx.switchTab({
      url: '/pages/carts/carts'
    })
  },
  goGoodsDetails(e) {
    const itemNo = e.currentTarget.dataset.no
    const supcustNo = this.supplierNo;
    goPage('goodsDetails', { itemNo, supcustNo })
  },
  changeTab (e) {
    const no = e.currentTarget.dataset.no
    if (no != this.data.nowSelectCls) {
      this.setData({ nowSelectCls:no})
      this.getGoodsList()
    }
  },
  getGoodsList () {
    showLoading('请稍后...')
    const { nowSelectCls: itemClsNo } = this.data
    const supcustNo = this.supplierNo
    const { branchNo, token, platform, username } = this.userObj
    API.Goods.supplierItemSearch({
      data: { condition:'', modifyDate:'', supcustNo, pageIndex: 1, pageSize: 1000, itemClsNo, token, platform, username},
      success: res => {
        console.log(res)
        if(res.code == 0 && res.data) {
          const list = res.data.itemData || []
          let goodsList = []
          let fineGoodsList = []
          let goodsObj = {}
          const promotionObj = this.promotionObj
          list.forEach(goods => {
            goods.stockQty = 9999
            const itemNo = goods.itemNo
            goods.goodsImgUrl = this.zcGoodsUrl + goods.itemNo + '/' + getGoodsImgSize(goods.picUrl)
            goods.stockQty > 0 ? goodsList.push(itemNo) : fineGoodsList.push(itemNo)
            goods.isStock = goods.stockQty > 0 ? true : false
            goodsObj[itemNo] = goods
            
          })
          let newArr = goodsList.concat(fineGoodsList)
          const totalLength = newArr.length
          // 获取促销信息
          console.log(this.data.goodsObj)
          API.Public.getSupplierAllPromotion({
            data: { branchNo, token, platform, username, supplierNo: this.supplierNo },
            success: res => {
              let a = res.data
              let promKey // 获取 以 RSD 开头的下标 (促销信息)
              for (let key in a) {   
                if (key.includes('RSD')) { promKey = key }
              }
              console.log(res, promKey)
              if (res.code == 0 && res.data && Object.keys(a[promKey]).length != 0){  // 最后判断是否为空对象
                // 将促销字段，推入对应的商品对象，页面通过 促销子段是否存在来渲染促销信息
                new Promise((resolve, reject) => {
                  let todayPromotion = a[promKey]
                  resolve(todayPromotion)
                }).then(todayPromotion => {        // 将当日促销信息推入 goodsObj
                  let todayPromotionKeyArr = Object.keys(todayPromotion)
                  todayPromotionKeyArr.map(item => {
                    for (let key in goodsObj) {
                      if (goodsObj[key].itemNo == item) {
                        todayPromotion[key].endDate = todayPromotion[key].endDate.slice(0, 10)      // 截取年月日
                        todayPromotion[key].startDate = todayPromotion[key].startDate.slice(0, 10)  // 截取年月日
                        goodsObj[key].todayPromotion = todayPromotion[key]
                      }
                    }
                  })
                  console.log("changed", goodsObj, goodsObj['00010000'].todayPromotion, goodsObj['00010008'].todayPromotion, totalLength)
                  this.setData({
                    goodsObj: goodsObj,
                    totalLength: totalLength
                  })
                })
              } else {
                this.setData({
                  goodsObj: goodsObj,
                  totalLength: totalLength
                })
              }
            }
          })
          console.log("changed", goodsObj)
          // this.setData({    这是 140 行代码 原来的位置，因增加了异步操作，位置改变。这一行具体还不知道有其它作用，以此注释。
          //   goodsObj: goodsObj,
          //   totalLength: totalLength
          // })
          setTimeout(()=>{
            this.setData({
              goodsList: newArr.splice(0, maxNum),
            })
            baseGoodsList = newArr
          },150)
          wx.pageScrollTo({ scrollTop: 0, duration: 0 })
        } else {
          this.setData({
            goodsList: [],
            goodsObj: {},
            totalLength: ''
          })
        }
      },
      error: () => {
        alert('获取商品失败，请检查网络是否正常')
      },
      complete: ()=> {
        hideLoading()
        this.setData({ pageLoading: true })
      }
    })
  },
  getSupplier () {
    const { branchNo, token, platform, username } = this.userObj
    const imgUrl = getApp().data.imgUrl
    API.Supplier.searchSupcust({
      data: { branchNo, token, platform, username, condition: '', supplierNo: this.supplierNo},
      success: res => {
        const list = res.data
        console.log(list)
        if (res.code == 0 && list && list.length) {
          list.forEach(item => {
            const cls = item.managementType
            const no = item.supplierNo
            item.goodsImgUrl = imgUrl + '/upload/images/supplier/' + item.picUrl
          })
          this.setData({ config: list[0]})
        } else {
          alert(res.msg)
        }
      },
      error: () => {
        alert('获取入驻商信息失败，请检查网络是否正常')
      }
    })
  },
  onLoad (opt) {
    this.userObj = wx.getStorageSync('userObj')
    this.zcGoodsUrl = getApp().data.zcGoodsUrl
    // 判断是否有传来的参数
    if (opt.config) {
      const config = JSON.parse(opt.config)
      console.log("SUP:", config)
      this.supplierNo = config.supplierNo
      this.setData({ config })
    } else {
      this.supplierNo = opt.supplierNo
      this.getSupplier() // 无参数接收时，自动获取供应商
    }
    this.getCls()  // 获取类别数据
    const { branchNo, token, platform, username } = this.userObj
    
  },
  onReady () {
    console.log(this.data.goodsObj)
  },
  onShow () {
    this.getCartsData()
  },
  onReachBottom: function () {
    console.log(this.data.goodsObj)
    if (!this.isLoading && baseGoodsList.length) {
      this.isLoading = true
      let newArr = this.data.goodsList
      baseGoodsList = baseGoodsList.filter((item, index) => {
        if (maxNum > index) {
          newArr.push(item)
          return false
        } else {
          return true
        }
      })
      this.setData({ goodsList: newArr })
      setTimeout(() => {
        this.isLoading = false
      }, 200)
    }
  }
})