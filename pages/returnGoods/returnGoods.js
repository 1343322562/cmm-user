import commit from '../../store/mutations.js'
import * as types from '../../store/types.js'
import API from '../../api/index.js'
import dispatch from '../../store/actions.js'
import {
  showLoading,
  hideLoading,
  alert,
  toast,
  deepCopy,
  getRemainTime,
  goPage,
  getOrderStatusName
} from '../../tool/index.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showOrderList: false,
    selectOrderIndex: 0,
    confirmOrderIndex: -1,
    array: ['损坏', '少货', '质量问题', '其他'],
    index: 0,
    orderList: [],
    returnAmt: 0,
    returnPostage:0,
    returnDetailed:'',
    totalReturnAmt:0
  },

  onLoad: function(options) {
    const {
      tabBarList,
      openid,
      storeId,
      userInfo,
      shopInfo,
      imgBaseUrl,
      sourceName,
      source,
      dcId,
      sysCode
    } = getApp().data
    this.openid = openid
    this.storeId = storeId
    this.userInfo = userInfo
    this.shopInfo = shopInfo
    this.sourceName = sourceName
    this.dcId =  dcId
    this.sysCode = sysCode
    this.userId =  userInfo.userId
  },
  onReady: function() {

  },
  onShow: function() {
    this.getCanReturnOrderInfo()
  },
  handleSelectOrder: function(e) {

    if (this.data.orderList.length ==0) {
      toast('没有可以申请退款的订单')
      return;
    }
    this.setData({
      showOrderList: true
    })
  },
  handleClickOrder: function(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      selectOrderIndex: index
    })
    this.calcReturnAmt();
  },
  handleCloseOrder: function() {
    this.setData({
      showOrderList: false
    })
  },
  handleSelectOk: function(e) {
    
    let returnDetailed='';
    let returnType='整单退款';
    let orderInfo = this.data.orderList[this.data.selectOrderIndex];

    let havecount=0;

    let returnPostage = Number(orderInfo.postage)

    orderInfo.orderDetailVOList.forEach(item => {
      
      if (item.inputReturnCount) {
        havecount += Number(item.inputReturnCount)
        returnDetailed += item.itemName + ' ' + 'x' + item.inputReturnCount + '' + item.itemUnit + '\n';
      }

    })
    if (orderInfo.totalNum != havecount) {
      returnType = '部分退款'
      returnPostage = 0
    }

    if (!havecount) {
      toast('请输入商品的退货数量')
      return;
    }

    this.setData({
      returnPostage: returnPostage,
      returnAmt: Number(this.data.returnAmt),
      totalReturnAmt: Number((returnPostage + this.data.returnAmt).toFixed(2)),
      confirmOrderIndex: this.data.selectOrderIndex, returnDetailed: returnDetailed,
      returnType: returnType
    })
    
    this.handleCloseOrder()
  },
  handleReturnAll: function(e) {
    let orderInfo = this.data.orderList[this.data.selectOrderIndex];
    for (var item of orderInfo.orderDetailVOList) {
      item.inputReturnCount = item.saleNum;
    }
    this.data.orderList[this.data.selectOrderIndex] = orderInfo
    this.setData({
      orderList: this.data.orderList
    })
    this.calcReturnAmt();
  },
  handleChangeCount: function(e) {
    let orderList = this.data.orderList;
    let index = e.currentTarget.dataset.index;
    if (e.detail.value > orderList[this.data.selectOrderIndex].orderDetailVOList[index].saleNum){
      toast('最大可输入数量【' + orderList[this.data.selectOrderIndex].orderDetailVOList[index].saleNum+'】')
    }else{
      orderList[this.data.selectOrderIndex].orderDetailVOList[index].inputReturnCount = e.detail.value;
    }
    this.setData({
      orderList: orderList
    })
    this.calcReturnAmt();
  },
  handleInput:function(e){
    let key = e.currentTarget.dataset.key;
    this.setData({[key]:e.detail.value})
  },
  setReturnInfo: function(index, count, cause) {
    let orderInfo = this.data.orderList[this.data.selectOrderIndex];
    if (index == null) {
      for (var item of orderInfo.orderDetailVOList) {
        if (count != null) {
          item.inputReturnCount = count;
        }
        if (cause != null) {
          item.returnCause = cause;
        }
      }
    } else {
      if (count != null) {
        orderInfo.orderDetailVOList[index].inputReturnCount = count;
      }
      if (cause != null) {
        orderInfo.orderDetailVOList[index].returnCause = cause;
      }
    }

    this.data.orderList[this.data.selectOrderIndex] = orderInfo
    this.setData({
      orderList: this.data.orderList
    })
  },
  calcReturnAmt: function() {
    let returnAmt = 0;
    let orderInfo = this.data.orderList[this.data.selectOrderIndex];
    let returnPostage = orderInfo.postage
    for (var item of orderInfo.orderDetailVOList) {
      let count = item.inputReturnCount || 0;
      returnAmt = returnAmt + (count * item.contributionQuotaPrice);
      if (item.saleNum != item.inputReturnCount) {
        returnPostage = 0
      }
    }
    this.setData({
      returnAmt: Number(returnAmt.toFixed(2)),
      returnPostage: returnPostage,
      totalReturnAmt: Number((returnPostage + returnAmt).toFixed(2)),
    })
    
    console.log('计算合计')
  },
  bindPickerChange: function(e) {
    let orderList = this.data.orderList;
    let index = e.currentTarget.dataset.index;
    orderList[this.data.selectOrderIndex].orderDetailVOList[index].returnCause = this.data.array[e.detail.value]
    this.setData({
      orderList: orderList
    })
  },
  getCanReturnOrderInfo: function(e) {
    API.Orders.getCanReturnOrderInfo({
      data: {
        openid: this.openid,
        dcId: this.dcId,
        sysCode: this.sysCode,
        userId: this.userId
      },
      success: (obj) => {
        let data = obj.data
        
        for (var order of data) {
          let totalNum = 0
          for (var goods of order.orderDetailVOList) {
            goods.saleNum = (goods.saleNum||0) - (goods.differenceNum||0)
            goods.contributionQuotaAmt = Number((goods.contributionQuotaAmt - (goods.differenceAmt || 0)).toFixed(2))
            totalNum += goods.saleNum
          }
          order.totalNum = totalNum
        }
        this.setData({
          orderList: data
        })
      },
      error: () => {
       
      }
    })
  },
  handleSave:function(e){

    if(this.data.confirmOrderIndex==-1){
      toast('请先选择订单')
      return;
    }
    let orderInfo = this.data.orderList[this.data.confirmOrderIndex];
    let itemList=[]
    for (var item of orderInfo.orderDetailVOList) {

      if (!item.inputReturnCount||item.inputReturnCount <= 0) {
        continue;
      }

      itemList.push( {
         orderDetailId: item.id, 
        itemId: item.itemId,
        itemName: item.itemName,
        itemNowPrice: item.itemNowPrice,
        itemDisPrice: item.itemDisPrice, 
        itemUnit: item.itemUnit,
        itemThumbPic: item.itemThumbPic,
        returnedNum: item.inputReturnCount, 
        returnAmt: Number(item.inputReturnCount * item.contributionQuotaPrice).toFixed(2), 
        returnReason: item.returnCause || ''
       })
    }

    if (itemList.length <0) {
      toast('请输入商品的退货数量')
      return;
    }
    let data = {
      sysCode: this.sysCode,
      orderNo: orderInfo.orderNo,
      dcId: this.dcId,
      userId: this.userId,
      userName: orderInfo.receiveMan,
      userPhone: orderInfo.receivePhone,
      openid: this.openid,
      returnAmt: this.data.returnAmt,
      receiveAddr: orderInfo.storeAddr,
      postage: this.data.returnPostage,
      returnReason: this.data.returnReason||'',
      requestType: (this.data.returnType =='整单退款'?0:1),
      doSheetNo: orderInfo.doSheetNo||'',
      returnOrderNo: orderInfo.returnOrderNo||'',
      itemList: JSON.stringify(itemList)
    }

    API.Orders.saveReturnOrder({
      data: data,
      success: (obj) => {
        toast(obj.msg)
        if (obj.status==200){
          setTimeout(function () {
            wx.navigateBack();
          }, 1000);
        }
      },
      error: () => {
        
      }
    })
  }
})