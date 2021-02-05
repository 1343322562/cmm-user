import { getFilterDataSize, emojiReg, toast, showLoading, hideLoading, alert, deepCopy, goPage, setNumSize, showModal, backPage } from '../../tool/index.js'
import API from '../../api/index.js'
import { ShoppingCartGoods } from '../../tool/shoppingCart.js'
let shoppingCart = new ShoppingCartGoods();//实例化类
import * as types from '../../store/types.js'
import dispatch from '../../store/actions.js'
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    confirm:false,
    type:"1",
    userInfo:{},
    memo:"", //收货备注
    goods:"", //商品列表
    receivingAddr:{},
    cartsMoney:0,
    selectNum:0,
    totalPayAmt:0.00,
    startDeliveMoney:'',  //起送金额
    postageSection:[],    //运费区间
    postageMoney:'',      //当前运费
    tempHeight:0,
    couponsList: [],      //可以用得优惠卷
    couponsNoUseList:[],  //不可以用优惠卷
    showCouponsSelect: false,
    storeMode: app.data.storeMode,     // 是否以自提点模式下单
    storeInfo: '',
    switchTransWay: 0   // 切换取货方式 0：送到家 1：自提
  },
  // 切换取货方式
  changeTransWay () {
    let switchTransWay = this.data.switchTransWay // 0：送到家 1：自提
    const content = switchTransWay ? '送货到家模式' : '自提点模式'
    const _this = this

    switchTransWay = switchTransWay ? 0 : 1
    alert(`切换  [ ${content} ] ，起送金额 及 运费计算将发生变化。是否需要切换`, {
      showCancel: true,
      title: '温馨提示',
      success(e) {
        if(e.confirm) {
          console.log('switchTransWay', switchTransWay)
          switch(switchTransWay) {
            case 0:
              app.data.storeMode = false
              _this.setData({ switchTransWay, storeMode: false , storeInfo: ''})
              app.data.storeMode = false
              app.data.storeInfo = {}
              app.globalData.switchTransWay = 0
              wx.setStorage({ data: 0, key: 'currentStoreMode' })
              wx.setStorage({ data: 0, key: 'switchTransWay' })
              // wx.setStorage({ data: {}, key: 'currentStoreAddr' })
              // wx.removeStorage({ key: 'currentStoreAddr' })
              _this.getStoreInfoForOrder()
              break;
            case 1:
              app.data.storeMode = true
              app.globalData.switchTransWay = 1
              const addr = wx.getStorageSync('currentStoreAddr')
              console.log(addr, Object.keys(addr).length);
              (!addr || Object.keys(addr).length == 0) && _this.getUserStoreList() // 获取最新的自提点地址 , 并缓存自提点
              // _this.getMemberAddrToleration()
              _this.setData({ switchTransWay: 1, storeMode: 1 , storeInfo: addr})
              wx.setStorage({ data: 1, key: 'switchTransWay' })
              wx.setStorage({ key: 'currentStoreMode', data: 1 })
              app.data.storeMode = true
              _this.getStoreInfo()
              break;
          }
        }
      }
    })

  },
  getStoreInfo(colonelId) {
    console.log('app', app.data)
    console.log('colonelId', colonelId)
    const storegeAddr = wx.getStorageSync('currentStoreAddr')
    const pageAddr = this.data.currentStoreAddr
    const storeId = (pageAddr&&pageAddr.storeId) || (pageAddr&&pageAddr.id) || (storegeAddr&&storegeAddr.storeId) || (storegeAddr&&storegeAddr.ud_id) || (storegeAddr&&storegeAddr.id) 
    API.Orders.storeinfo({
      data:{
        colonelId,
        storeId
      },
      success: ret => {
        console.log('storeInfo.id', ret)
        console.log(storeId)
        // 自提点
        if (ret.status == 200 && this.data.switchTransWay == 1) { 
          let storeInfo = ret.data.store
          console.log('ret', ret)
          console.log('storeInfo',storeInfo)
          if (!storeInfo) { storeInfo = {} }
          this.countDelivery(ret.data.postage || [], Number(storeInfo.threshold || 0))
          this.setData({ storeInfo })
        } else {   // 送到家
          this.setData({ storeMode: false})
          getApp().data.storeMode = false
          this.getStoreInfoForOrder()
        }
      }
    })
  },
  // 获取默认自提点
  getUserStoreList() {
    showLoading()
    const { userId } = app.data
    const { sysCode } = app.data.userInfo
    const _this = this
    API.Orders.getUserStoreList({
      data: { sysCode, userId },
      success(res) {
        if (res.status != 200) return alert(res.msg)
        console.log(res)
        let list = res.data
        if (!list.length) return _this.setData({ storeInfo: [] }) // 无信息
        let storeInfo
        list.forEach((item, index) => {
          if (storeInfo) return
          storeInfo = ('toleration' in item && item.toleration == 1 ) ? item : ''
        })
        console.log(storeInfo)
        _this.setData({ storeInfo })
        wx.setStorage({ data: storeInfo, key: 'currentStoreAddr' }) // 当前自提点信息 OBJ
        app.data.storeInfo = storeInfo
      },
      complete() { hideLoading() }
    })
  },
  onLoad (opt) {
    // console.log('opt', opt)
    // const selectAddr = JSON.parse(opt.selectAddr) // 当前所选择的自提点（并非默认自提点）
    // this.setData({ storeInfo: selectAddr })

    console.log(getApp().data)
    opt.select && (this.cartsSelected = JSON.parse(opt.select))
  },
  onHide() {
    console.log('onHide', app.globalData.switchTransWay)
  },
  onUnload() {
    
    console.log('onUnload', app.globalData.switchTransWay)
  },
  // 获取开团信息
  getStorePromotionInfo(storeId) {
    API.Public.storePromotion({
      data: {
        storeId: storePromotion.storeId,
        date,
        time: storePromotion.promotionEndTime
      },
      success: ret => {
        console.log('获取自提点开团信息', ret)
        if (ret.status == 200) {
          storePromotion.totalNum = ret.data.number
          storePromotion.totalAmt = ret.data.amt
          storePromotion.status = Number(ret.data.amt) >= storePromotion.promotionAmt

          this.setData({
            storePromotion
          })
        }
      }
    })
  },
  onShow: function (opt) {
    console.log(opt)
    let { openId, imgBaseUrl, sysCode, dcId, colonelId, userInfo, storeMode, storeColonelId } = getApp().data
    const currentStoreMode = wx.getStorageSync('currentStoreMode')
    const currentStoreAddr =  app.data.storeInfo || wx.getStorageSync('currentStoreAddr') || ''
    let switchTransWay =  typeof app.globalData.switchTransWay == 'number' ? app.globalData.switchTransWay : wx.getStorageSync('switchTransWay')
    console.log('switchTransWay', switchTransWay, app.globalData.switchTransWay)
    if (typeof switchTransWay != 'number' && (storeMode || currentStoreAddr)) { // 若没缓存配送方式，则按缓存的地址判断
      this.data.switchTransWay = 1
      this.setData({ switchTransWay: 1 })
    } else if (typeof switchTransWay == 'number') {
      this.data.switchTransWay = switchTransWay
      this.setData({ switchTransWay })
    }
    if (!currentStoreAddr && this.data.switchTransWay) {
      this.getUserStoreList() // 获取用户默认自提点
    } else {
      this.setData({ storeInfo: currentStoreAddr })
    }
    if (!userInfo || (!userInfo.userPhone && !userInfo.userPhone)) {
      goPage('impower', { openType: 'inside' })
      //wx.redirectTo({ url: "/pages/impower/impower" })
      return
    }
    this.openId = openId
    this.sysCode = sysCode
    this.dcId = dcId
    this.colonelId = colonelId
    this.setData({ imgBaseUrl, userInfo })
    
    const select = this.cartsSelected
    let goodsObj = shoppingCart.getGoodsList()
    let itemIdList = shoppingCart.getGoodsListId()
    let goods = {}
    let itemsIds = []
    showLoading()
    dispatch[types.GET_ALL_SECKILL_GOODS]({
      one: true,
      success: allPromotionGoods => {
        let cartsMoney = 0;
        let selectNum = 0;
        itemIdList.forEach(itemId => {
          const no = 'ms_' + itemId
          if (!select || select[itemId] || select[no]) {
            const t = allPromotionGoods[itemId]
            let item = goodsObj[itemId]
            item.originalPrice = item.itemNowPrice
            if (t) {
              const maxNum = t.maxNum
              const num = item.num
              if (!select || select[itemId]) {
                itemsIds.push(itemId)
                goods[itemId] = deepCopy(item)
                goods[itemId].num = num > maxNum ? maxNum : num
                goods[itemId].msMaxNum = maxNum
                goods[itemId].isMS = true
                goods[itemId].itemNowPrice = t.price
                goods[itemId].promotionType = 1
                goods[itemId].promotionNo = t.promotionNo
              }
              if (num > maxNum && (!select || select[no])) {
                itemsIds.push(no)
                goods[no] = deepCopy(item)
                goods[no].num = num - maxNum
                goods[no].derivationGoods = true
                delete goods[no].isMS
              }
              
              
            } else {
              goods[itemId] = item
              itemsIds.push(itemId)
            }
          }
          
        })
        itemsIds.forEach(itemId=>{
          let item = goods[itemId]
          selectNum += item.num
          cartsMoney = Number((cartsMoney + item.num * item.itemNowPrice).toFixed(2))
        })
        //运费区间
        // this.getPostage();

        //获取起送金额
        // this.getStartDelive()

        this.getMemberAddrToleration();
        this.setData({ goods, itemsIds, cartsMoney, selectNum, payAmt: cartsMoney });
        console.log('storeMode', storeMode)
        if ((storeMode || this.data.switchTransWay) && currentStoreAddr) {
          this.setData({ storeMode })
          console.log(storeColonelId)
          this.getStoreInfo(storeColonelId)
        }

        this.getCouponsList()


      }
    })

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  pageScrollToBottom: function () {

    wx.createSelectorQuery().select('#pageBox').boundingClientRect(function (rect) {

      // 使页面滚动到底部

      wx.pageScrollTo({

        scrollTop: rect.bottom

      })

    }).exec()

  },
  inputFocus:function(e){
      this.setData({ tempHeight:200})
      this.pageScrollToBottom()
  },
  inputBlur:function(e){
    this.setData({ tempHeight: 0 })
  },
  
  getMemberAddrToleration() {
    const receivingAddr = getApp().data.receivingAddr
    
    if (receivingAddr){
      this.setData({ receivingAddr });
      this.getStoreInfoForOrder()
      return;
    }
    API.Addreess.memberAddress({
      data: {
        openid: this.openId,
        sysCode: this.sysCode,
        dcId: this.dcId
      },
      success: obj => {
        console.log('收货信息', obj)
        let list = (obj.data || []).filter(item => item.orderFlag == '1')
        let addr
        if (list.length==1) {
          addr = list[0]
        } else {
          list.forEach((item) => {
            item.toleration == '1' && (addr = item)
          })
        }
        if (!addr && list.length) addr = list[0];
        this.setData({ receivingAddr: addr||{}});
      },
      error: () => {},
      complete: () =>{
        this.getStoreInfoForOrder()
      }
    });
  },
  countDelivery(postageSection = [], startDeliveMoney=0) {
    const cartsMoney = Number(this.data.cartsMoney)
    const payAmt = Number(this.data.payAmt)
    let postageMoney = 'null'
    postageSection.forEach(item => {
      if (cartsMoney > item.minAmt && cartsMoney <= item.maxAmt && postageMoney == 'null') postageMoney = item.postage
    })
    postageMoney == 'null' && (postageMoney = 0)
    const totalPayAmt = this.convertMoney(payAmt + postageMoney)
    this.setData({ postageSection, startDeliveMoney, postageMoney, totalPayAmt })
  },
  getStoreInfoForOrder() { // 获取配送中心配送费，起送价
    const { storeMode, storeColonelId } = getApp().data
    if (storeMode || this.data.switchTransWay == 1)return
    const receivingAddr = this.data.receivingAddr;
    var errorFun = ()=>{
      this.setData({ postageSection: [], startDeliveMoney: '', postageMoney: '', totalPayAmt: this.data.payAmt })
    }
    if(receivingAddr && receivingAddr.phone) {
      API.Liquidation.getStoreInfoForOrder({
        data: {
          openid: this.openId,
          sysCode: this.sysCode,
          dcId: this.dcId,
          locationX: receivingAddr.locationX,
          locationY: receivingAddr.locationY,
          adressId: receivingAddr.uuid
        },
        success: ret => {
          console.log(ret)
          const data = ret.data
          if (ret.status == 200 && data) {
            this.countDelivery(data.postage, data.store.threshold)
            this.storeId = data.store.id
            this.sysCode = data.store.sysCode
            this.dcId = data.store.dcId
          } else {
            errorFun()
          }
        }
      });
    } else {
      errorFun()
    }
  },
  getStartDelive(){

    API.Public.startDeliver({
      data: {
        openid: this.openId,
        sysCode: this.sysCode,
        dcId: this.dcId
      },
      success: obj => {
        this.setData({ startDeliveMoney:obj.data})
      },
      error: () => {

      }
    });
  },
  convertMoney(moeny){
    return Number(moeny).toFixed(2)
  },
  getPostage() {

    API.Public.postage({
      data: {
        openid: this.openId,
        sysCode: this.sysCode,
        dcId: this.dcId
      },
      success: obj => {
    
        this.setData({ postageSection: obj.data })
        
        for (let index in obj.data) {
          var item = obj.data[index]
          if (this.data.payAmt >= item.minAmt) {
            this.setData({ postageMoney: Number(item.postage) });
            break;
          }
        }
        this.setData({ totalPayAmt: this.convertMoney(Number(this.data.payAmt) + Number(this.data.postageMoney))});
      },
      error: () => {

      }
    });
  },

  switchStore() {
    const storeInfo = this.data.storeInfo
    const switchTransWay = this.data.switchTransWay
    console.log(switchTransWay, 32)
    if (switchTransWay) return goPage('address', { openType: 1 })
    // if (storeInfo.id) return
    goPage('address', { openType: 'liquidation' })
  },

  getMemo(e) {
    const memo = e.detail.value.trim()
    this.setData({ memo })
  },
  hideConfirm() {
    this.setData({ confirm: false })
  },
  showConfirm(){


    if (this.data.cartsMoney < this.data.startDeliveMoney) {
      hideLoading()
      toast('未达到起送金额:' + this.data.startDeliveMoney + '元')
      return
    }

    

    const receivingAddr = this.data.receivingAddr
    const switchTransWay = this.data.switchTransWay
    const storeInfo = this.data.storeInfo
    if (switchTransWay == 1 && !storeInfo.length && !storeInfo.storeId && !storeInfo.storeAddr) {
      alert('您还没有选择自提点', {
        title: '温馨提示',
        showCancel: true,
        confirmText: '去选择',
        confirmColor: '#f49b1e',
        success: res => {
          if (res.confirm) {
            goPage('address', { openType: 1 })
          }
        }
      })
      return
    }
    console.log('地址',switchTransWay, storeInfo)

    if ((this.data.type != 'home' && (!receivingAddr || !receivingAddr.phone))&&!this.data.storeInfo.id&&switchTransWay == 0) {
      alert('您还没有填写收货地址', {
        title: '温馨提示',
        showCancel: true,
        confirmText: '去填写',
        confirmColor: '#f49b1e',
        success: res => {
          if (res.confirm) {
            goPage('address', { openType: 'liquidation' })
          }
        }
      })
      return
    }

    this.setData({ confirm: true })
  },
  getSubmitOrdersInfo(){


    const { switchTransWay, memo, goods, userWxInfo, userInfo, receivingAddr, selectNum, cartsMoney, payAmt, totalPayAmt, selectedCoupons, storeInfo } = this.data
    let { businessType, openStore, storeName, title, storeAddr, address, phone } = this.data.storeInfo
    if (switchTransWay == 0) {openStore = 0; businessType = 1}
    wx.setStorage({ data: switchTransWay, key: 'switchTransWay' })
    let request = {
      storeName: storeName || title,
      storeAddr: storeAddr || address,
      openStore: openStore,
      storeType: businessType, // 1: 送到家 2：自提点
      openid: this.openId,
      sysCode: this.sysCode, 
      dcId: this.dcId, 
      colonelId: this.colonelId||'', 
      payWay: 'wx',
      totalNum: selectNum,
      totalAmt: cartsMoney,  // 2
      payAmt: totalPayAmt, //  3 
      postage: this.data.postageMoney,//1
      memo: emojiReg(memo),
      itemList: JSON.stringify(shoppingCart.convertGoodsList2(goods))
    }

    if (selectedCoupons) {
      request.couponId = selectedCoupons.id
      request.couponAmt = selectedCoupons.discountAmt
    }
    request.addrId = receivingAddr.uuid ||'00000000'
    request.receiveMan = storeInfo.storeName ? userInfo.nickName :emojiReg(receivingAddr.consignee)
    request.receivePhone = storeInfo.storeName ? userInfo.userPhone : receivingAddr.phone
    request.receiveAddr = storeInfo.storeAddr ||  receivingAddr.province + "" + receivingAddr.city + " " + receivingAddr.area +" "+ receivingAddr.address
    request.province = receivingAddr.province||''
    request.city = receivingAddr.city||''
    request.area = receivingAddr.area||''
    request.address = storeInfo.storeAddr || receivingAddr.address
    request.storeId = storeInfo.id ||  (this.storeId ||receivingAddr.storeId)||''
    request.locationX = storeInfo.locationX || receivingAddr.locationX
    request.locationY = storeInfo.locationY || receivingAddr.locationY
    request.adressId = receivingAddr.uuid ||'00000000'
    request.colonelId = this.colonelId || ''
    request.memberAddrId = receivingAddr.id||'00000000'
    request.userId = userInfo.userId
    if (!request.storeType) {
      request.storeType = storeInfo.storeName ?'1':'0'
    }
    return request;
  },
  validationData(param){

    if (!param.payAmt || param.payAmt == '0') {
      hideLoading()
      toast('支付金额不能为零')
      this.isClick = false
      return false
    }

    return true;
  },
  // 下单时， 价格和商品数量的校验
  reqDataCheck(reqData) {
    const itemList = JSON.parse(reqData.itemList)
    const { totalAmt, totalNum } = reqData // 总金额 和 总数量
    let tempTotalAmt = 0
    let tempTotalNum = 0
    itemList.forEach(item => {
      tempTotalNum += item.num
      tempTotalAmt += item.itemNowPrice * item.num
    })
    // console.log(1000000, tempTotalAmt)
    tempTotalAmt = Number(tempTotalAmt.toFixed(2))
    // console.log(tempTotalAmt,totalAmt, tempTotalNum,totalNum, totalAmt == tempTotalAmt && totalNum == tempTotalNum)
    if (totalAmt == tempTotalAmt && totalNum == tempTotalNum) return true
    return false
  },

  goOrdersDetails(msg, orderNo) {
    hideLoading()
    alert(msg, {
      success: (o) => {
        setTimeout(() => {
          wx.reLaunch({ url: '/pages/ordersDetails/ordersDetails?openType=pay&orderNo=' + orderNo + '&orderType=' + this.data.type  })
        }, 300)
      }
    })
  },

  wxLogin(orderNo,orderType,data,request){
    wx.login({
      success: ret => {
          this.getSubOpenid(orderNo,orderType,ret, request)
      },
      fail: () => {
        this.goOrdersDetails('调用微信支付失败', orderNo)
      }
    });
  },

  getSubOpenid(orderNo, orderType,data, request, call){
    API.Public.getSubOpenid({
      data: {
        code: data.code,
        openid: request.openid,
        sysCode: request.sysCode,
        dcId: request.dcId,
        colonelId: request.colonelId
      },
      success: obj => {
        this.orderPay(orderNo, orderType,obj, request)
      },
      error: () => {
        this.goOrdersDetails('支付失败1', orderNo)
      }
    });
  },
  orderPay(orderNo,orderType,data, request, call){
    const subOpenId = data.data
    if (data.status === 200 && subOpenId) {
      API.Public.orderPay({
        data: {
          openid: request.openId,
          sysCode: request.sysCode,
          dcId: request.dcId,
          colonelId: request.colonelId,
          orderNo: orderNo,
          subOpenid: subOpenId,
          orderAmount: request.payAmt,
          totalFee: request.payAmt,
          userId: request.userId
        }, success: data => {
          this.wxRequestPayment(orderNo,orderType,data, request)
        }, error: () => {
          this.goOrdersDetails('支付失败2', orderNo)
        }
      });
    }else{
      this.goOrdersDetails('支付失败3', orderNo)
    }
},
  wxRequestPayment(orderNo,orderType,data, request){
   
    if (data.status === 200 && data.data.code === 'success') {
      wx.requestPayment({
        'timeStamp': data.data.finalpackage.timeStamp,
        'nonceStr': data.data.finalpackage.nonceStr,
        'package': data.data.finalpackage.package,
        'signType': data.data.finalpackage.signType,
        'paySign': data.data.finalpackage.paySign,
        success: () => {
          setTimeout(() => {
            hideLoading()
            wx.reLaunch({
              url: '/pages/paySuccess/paySuccess?orderNo=' + orderNo + '&orderType=' + orderType 
            })
          }, 400)
        },
        fail: () => {
          this.goOrdersDetails('支付已取消!', orderNo)
        }
      })
    } else {
      this.goOrdersDetails('支付失败!', orderNo)
    }
  },
  // 获取当前用户自提点列表, 如果是自提点下单，则请求判端是否改自提点未被停用
  // getUserStoreList() {
  //   showLoading()
  //   const { userId } = app.data
  //   const { sysCode } = app.data.userInfo
  //   const _this = this
  //   API.Orders.getUserStoreList({
  //     data: { sysCode, userId },
  //     success(res) {
  //       console.log('获取自提点列表', res)
  //       if (res.status != 200) return alert(res.msg)
  //       console.log(res, {sysCode, userId})
  //       let list = res.data
  //       _this.setData({ list , switchTransWay: 1})
  //       if(list.length == 0) {
  //         wx.setStorageSync('currentStoreAddr', {})
  //         wx.setStorageSync('currentStoreMode', 0)
  //       }
  //       setTimeout(() => console.log(_this.data.switchTransWay))
  //     },
  //     complete() { hideLoading() }
  //   })
  // },
  
  submitOrders() {
    if (this.isClick) return
    console.log('isClick', this.isClick)
    this.isClick = true
    showLoading('提交订单...')
    let request=this.getSubmitOrdersInfo()
    console.log('保存订单的参数: ', request)
    if (request['payAmt'] == '0') return toast('不能0元支付，请去购买更多商品')
    console.log('item', JSON.parse(request.itemList))
    if (!this.validationData(request)){return;}
    if (!this.reqDataCheck(request)) {
      hideLoading()
      alert(`支付错误，请重新核对订单数据并下单`, {
        showCancel: false,
        title: '温馨提示',
        success(e) {
          backPage()
        }
      })
      return;
    }
    API.Liquidation.saveOrder({
      data: request,
      success: res => {
        const orderNo = res.data
        const orderType="0"
        if (res.status === 200 && orderNo) {
          //清空购物车
          shoppingCart.clearGoods();
          // wx.removeStorage({ key: 'currentStoreMode' })
          // wx.removeStorage({ key: 'currentStoreAddr' })
          
          this.wxLogin(orderNo, orderType, res, request)
        } else {
          hideLoading()
          this.isClick = false
          alert(res.msg)
        }
      },
      error: () => {
        hideLoading()
        this.isClick = false
        toast('下单失败!')
      }
    });
  }

  ,showCoupons(e)
  {
    if (this.data.couponsList.length) {
      this.setData({ showCouponsSelect: true })
    } else {
      toast('无可用优惠券')
    }

  },
  couponsSelect(e) {
    const selectedCoupons = e.detail.coupons
    const cartsMoney = this.data.cartsMoney
    const payAmt = Number((cartsMoney - (selectedCoupons ? selectedCoupons.discountAmt : 0)).toFixed(2))
    this.setData({ selectedCoupons, payAmt: payAmt < 0 ? 0 : payAmt })
    this.setData({ totalPayAmt: this.convertMoney(this.data.payAmt + this.data.postageMoney) });
  },
  queryCoupons(e){
    const queryType = e.detail.queryType
    this.setData({ couponsList:[]})
  },
  setDateSize(t) {
    t = t.replace(/-/g, '/').replace('.000', '')
    const time = new Date(t)
    const n = time.getFullYear()
    const y = (time.getMonth() + 1)
    const r = time.getDate()
    return n + '.' + setNumSize(y) + '.' + setNumSize(r)
  },
  getCouponsList() {
    showLoading()
    const { cartsMoney, userInfo } = this.data
    API.Coupons.userCoupon({
      data: {
        userId: userInfo.userId
      },
      success: ret => {
        if (ret.status == 200) {
          const list = ret.data || []
          let couponsList = []
          let couponsNoUseList=[]
          let selectedCoupons = null
          const dcId = getApp().data.dcId
          list.forEach((item,index) => {
            if (item.state == '0' && item.dcId == dcId) {
              const type = item.applicableCommodity
              let explain = []
              const details = item.details
              item.explainStr = type == '0' ? '全场' : (type == '1' ? '商品' : (type == '3' ? '类别' : '商品'))
              item.explainTitle = type == '0' ? '全场商品可用' : (type == '1' ? '仅限以下商品可用' : (type == '3' ? '仅限以下类别商品可用' : '除以下商品都可用'))
              if (type != '0' && details) {
                details.forEach(goods => {
                  explain.push(goods.name)
                })
                item.explain = explain.join('、')
              }
              let ok = this.calcCoupons(item)
              if (ok){
                selectedCoupons || (selectedCoupons = item)
                if (selectedCoupons.discountAmt < item.discountAmt) {
                  selectedCoupons = item
                }
                couponsList.push(item)
              }else{
                couponsNoUseList.push(item)
              }

            }


            // //无门槛满减 applicableCommodity:0 全部商品 1 指定商品  2指定商品不可用 3指定类别可用
            // if ((!item.useCondition || item.useCondition <= cartsMoney) && item.state == 0 && item.dcId == getApp().data.dcId) {

            //   item.startDateStr = this.setDateSize(item.discountTimeStart)
            //   item.endDateStr = this.setDateSize(item.discountTimeEnd)
            //   selectedCoupons || (selectedCoupons = item)
            //   if (selectedCoupons.discountAmt < item.discountAmt) {
            //     selectedCoupons = item
            //   }
            //   couponsList.push(item)
            // }else{
            //   couponsNoUseList.push(item)
            // }

            //指定商品优惠卷

          })
          this.setData({ couponsList })
          this.setData({ couponsNoUseList })
          selectedCoupons && this.couponsSelect({ detail: { coupons: selectedCoupons } })

        }
      },
      complete: () => {
        hideLoading()
        this.setData({ pageLoading: true })
      }
    })
  },
  //验证全部商品
  verificationCouponsType0(model) {
    const { cartsMoney, userInfo } = this.data
    if ((!model.useCondition || model.useCondition <= cartsMoney)) {
        return true;
    }else{
       return false;
    }
  },
  //验证指定条件商品
  verificationCouponsType(model,type) {
    let TotalMoney = 0

    for (let index in this.data.goods) {

      model.details.find((value)=> {
        if (value[type == 'itemId' ?'otherId':'otherCode'] == this.data.goods[index][type]) {
          TotalMoney = TotalMoney + (Number(this.data.goods[index].num) * Number(this.data.goods[index].itemNowPrice))
        }
      })
      // if (model.details.indexOf(this.data.goods[index][type])>=0) {
      //   TotalMoney = TotalMoney + (Number(model.num) * Number(model.itemNowPrice))
      // }
    }
    if (TotalMoney == 0) { return false }
     
    if(model.applicableCommodity == 1){
    }

    if (model.useCondition) {
      //验证类别优惠卷
      //debugger;
      return TotalMoney >= model.useCondition
    }

    return true;
  },
  calcCoupons(model){

    model.startDateStr = this.setDateSize(model.discountTimeStart)
    model.endDateStr = this.setDateSize(model.discountTimeEnd)
  //无门槛满减 applicableCommodity:0 全部商品 1 指定商品  2指定商品不可用 3指定类别可用

    //==0才是启用的
    if (model.state != 0) { return false }

    if (model.dcId != getApp().data.dcId) { return false }
    
    //排除过期优惠卷
    var timestamp = new Date().getTime()
    var discountTimeEnd = new Date(model.discountTimeEnd.replace(/-/g, '/').replace('.000', '')).getTime()
    var discountTimeStart = new Date(model.discountTimeStart.replace(/-/g, '/').replace('.000', '')).getTime()
    if (timestamp > discountTimeEnd || discountTimeStart > timestamp) {
      return false;
    }
    //全部商品
    if (model.applicableCommodity == 0) {
      return this.verificationCouponsType0(model)
    }   

    //排除时间过期，和没到时间的   details
    if (model.applicableCommodity == 3) {

      return this.verificationCouponsType(model,'itemClsno')
    }

    if (model.applicableCommodity == 1) {

      return this.verificationCouponsType(model, 'itemId')
    }
    
    return true;
  },

  hideCoupons(e) {
    this.setData({ showCouponsSelect: false })
  }

})