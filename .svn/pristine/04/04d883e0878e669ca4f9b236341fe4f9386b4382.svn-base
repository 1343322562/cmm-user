import * as types from '../../store/types.js'
import API from '../../api/index.js'
import dispatch from '../../store/actions.js'
import { getGoodsImgSize,toast } from '../../tool/index.js'
Component({
  properties: {
  },
  data: {
    list:[]
  },
  attached () {
    this.userObj = wx.getStorageSync('userObj')
    this.getPageData()
  },
  methods: {
    getPageData () {
      const { branchNo, token, username, platform } = this.userObj
      const goodsUrl = getApp().data.goodsUrl
      API.Public.getCartRecommend({
        data: { branchNo, token, username, platform, pageIndex: 1, pageSize:1000},
        success:ret => {
          if(ret.code ==0&&ret.data) {
            let list = ret.data.itemData||[]
            list.forEach(goods=>{
              goods.goodsImgUrl = goodsUrl + goods.itemNo + '/' + getGoodsImgSize(goods.picUrl)
            })
            this.setData({list})
          }
        }
      })
    },
    addCarts (e) {
      const goods = this.data.list[e.currentTarget.dataset.index]
      const { dbBranchNo, branchNo } = this.userObj
      const config = {
        sourceType: '0',
        sourceNo: dbBranchNo,
        branchNo: branchNo
      }
      if (dispatch[types.CHANGE_CARTS]({ goods, type: 'add', config })) {
        this.triggerEvent('getCartsData')
        toast('加入购物车成功')
      }
    }
  }
})
