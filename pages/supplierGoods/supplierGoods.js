import * as types from '../../store/types.js'
import API from '../../api/index.js'
import dispatch from '../../store/actions.js'
import { showLoading, hideLoading, alert, getGoodsImgSize,goPage } from '../../tool/index.js'
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
    const { type, no } = e.currentTarget.dataset
    const sourceNo = this.supplierNo
    const goods = this.data.goodsObj[no]
    const {  branchNo } = this.userObj
    const config = {
      sourceType: '1',
      branchNo,
      sourceNo
    }
    const cartsObj = dispatch[types.CHANGE_CARTS]({ goods, type, config })
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
              // 将促销字段，推入对应的商品对象，页面通过 促销子段是否存在来渲染促销信息
              new Promise((resolve, reject) => {
                for (let key in a) {
                  if (key.includes('RSD')) {
                    let todayPromotion = a[key]
                    console.log(todayPromotion)
                    resolve(todayPromotion)
                  }
                }
              }).then(todayPromotion => {
                let todayPromotionKeyArr = Object.keys(todayPromotion)
                console.log(goodsObj)
                todayPromotionKeyArr.map(item => {
                  for (let key in goodsObj) {
                    if (goodsObj[key].itemNo == item) {
                      goodsObj[key].todayPromotion = todayPromotion[key]
                    }
                  }
                })
                console.log("changes", goodsObj)
              })
            }
          })
          this.setData({
            goodsObj: goodsObj,
            totalLength: totalLength
          })
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