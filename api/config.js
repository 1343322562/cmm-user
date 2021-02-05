const { version, source} = getApp().data
export default {
   //storeURL: 'http://127.0.0.1/',
   //userURL: 'http://127.0.0.1/',
  // storeURL: 'http://2916q61j60.zicp.vip:47451/',
  // userURL: 'http://2916q61j60.zicp.vip:47451/',

  // 测试环境
  storeURL: 'http://244j07g355.zicp.vip/',
  userURL: 'http://244j07g355.zicp.vip/',
  // storeURL: 'http://192.168.2.229:9000/',
  // userURL: 'http://192.168.2.229:9000/',


  // storeURL: 'https://cmm.colonel.kekejingxuan.com/',
  // userURL: 'https://cmm.user.kekejingxuan.com/',

  // 堃
  // storeURL: 'http://192.168.2.17:8083/',
  // userURL: 'http://192.168.2.17:8083/',
  // posCart
  // storeURL: 'http://192.168.2.17:8081/pc-api/',
  // userURL: 'http://192.168.2.17:8081/pc-api/',

  // storeURL: 'http://3236n0g263.qicp.vip/',
  // userURL: 'http://3236n0g263.qicp.vip/',

  // 生产版本
  // storeURL: 'https://cmm.colonel.kekejingxuan.com/',
  // userURL: 'https://cmm.user.kekejingxuan.com/',
  // storeURL: 'http://192.168.1.6:9000/',
  // userURL: 'http://192.168.1.6:9000/',

  // storeURL1: 'http://192.168.1.80:8083/',
  // userURL1: 'http://192.168.1.80:8083/',
  
  // storeURL: 'http://192.168.1.41:9000/',
  // userURL: 'http://192.168.1.41:9000/',
  // storeURL: 'http://192.168.1.42:8102/',
  // storeURL: 'http://keke.zksr.cn/',
  // storeURL: 'https://www.fastmock.site/mock/abc992a494651eed439ee841a0ccdaaf/user/',
  // storeURL: 'http://162i921y28.iok.la:17378/',
  // userURL: 'http://192.168.1.42:8102/',
  // userURL: 'http://162i921y28.iok.la:17378/',
  // userURL: 'https://www.fastmock.site/mock/abc992a494651eed439ee841a0ccdaaf/user/',
  post (url, param) {
    this.ajax('post', url, param)
  },
  get (url, param) {
    this.ajax('get', url, param)
  },
  ajax(type, url, param) {

    let requestData = param.data || {}
    
    if (!requestData.openid&&getApp().data.openid)
    {
      requestData.openid = getApp().data.openid
    }

    if (!requestData.dcId && getApp().data.dcId) {
      requestData.dcId = getApp().data.dcId
    }

    if (getApp().globalData.LXY == "1"){
      this['userURL'] = this['userURL1']
      this['storeURL'] = this['storeURL1']
    }

    //requestData.storeId ="1"
    requestData.version = version
    requestData.source = source
    requestData.colonelName=""

    // url = url.replace("portal/labelName","portal/hqItemList")
    // url = url.replace("item/itemDetail", "item/hqItemDetail")
    // url = url.replace("order/saveOrder2", "order/saveHqOrder")
    // url = url.replace("pay/orderPay", "pay/hqOrderPay")
    // url = url.replace("order/orderDetail", "order/hqOrderDetail")
   
    if (url.indexOf("order/saveHqOrder")>=0){
      
      // delete requestData.sysCode;
      // delete requestData.dcId;
      // delete requestData.storeId;
    }
    let request = {
      url: (this[url.indexOf('storeUrl') === -1 ? 'userURL' : 'storeURL']) + url,
      method: type,
      header: {
        'content-type': url.indexOf('application') == -1 ? 'application/x-www-form-urlencoded' : 'application/json'
      },
      dataType: 'json',
      data: requestData,
      success: (response) => {
        param.success(typeof response === 'object' ? response.data : response)
      },
      fail: param.error,
      complete: param.complete
    }
    wx.request(request)
  }
}
