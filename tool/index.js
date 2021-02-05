export const showLoading = (text = '') => {
  wx.showLoading&&wx.showLoading({
    title: String(text),
    mask: true
  })
}
export const hideLoading = () => {
  wx.hideLoading()
}
export const backPage = (n = 1) => {
  wx.navigateBack({ delta: n })
}
export const toast = (text = '') => {
  wx.showToast({
    title: String(text),
    icon: 'none',
    duration:2000
  })
}
export const alert = (c, o) => {
  let obj = {
    content: String(c),
    showCancel: false
  }
  if (o) {
    o.confirmColor && (o.confirmColor = getApp().data.themeColor)
    for (let i in o) obj[i] = o[i]
  } 
  wx.showModal(obj)
}

export const showModal = obj => {
  wx.showModal({
    title: obj.title || '温馨提示',
    content: obj.text,
    showCancel: obj.isShowTitle || true,
  })
} 
export const deepCopy = (p, c) => { // 对象拷贝
  c = (c || {})
  for (var i in p) {
    if (p[i] && typeof p[i] === 'object') {
      c[i] = (p[i].constructor === Array) ? [] : {}
      deepCopy(p[i], c[i])
    } else {
      c[i] = p[i]
    }
  }
  return c
}
export const getTime = (str) => { // 获取时间戳
  if (!str) return 0
  let t1 = str.split(' ')
  let t2 = t1[0].split('-')
  let t3 = t1[1].split(':')
  return new Date(t2[0], t2[1] - 1, t2[2], t3[0], t3[1], t3[2]).getTime()
}
export const goPage = (l, o, s, f, c) => { // 跳转页面
  let obj = {},
    isArr = (typeof l == 'object' && l.length > 1),
    str = isArr ? l[1] : l,
    url = ('/pages/' + (isArr ? (l[0] + '/') : '') + str + '/' + str);
  if (o) {
    let i, key = new Array();
    for (i in o) {
      let item = o[i];
      key.push(i + '=' + (typeof item == 'object' ? JSON.stringify(item) : item));
    }
    url += ('?' + key.join("&"));
  }
  obj.url = url;
  s && (obj.success = s);
  f && (obj.fail = f);
  c && (obj.complete = c);
  wx.navigateTo(obj)
}
export const emojiReg = (str) => { // 格式化字符
  const emojiReg = new RegExp(/[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|\u3030|\uA9|\uAE|\u3030/gi)
  return (str.replace(emojiReg, '?').replace(new RegExp(/(󾓭)/g), '?').trim())
}
export const setFilterDataSize = (obj) => { // 格式替换
  return (JSON.stringify(obj)).replace(new RegExp(/(&)/g), 'mark-1').replace(new RegExp(/(\?)/g), 'mark-2').replace(new RegExp(/(%)/g), 'mark-3').replace(new RegExp(/(=)/g), 'mark-4')
}
export const getFilterDataSize = (obj) => { // 替换格式
  return obj.replace(new RegExp(/(mark-1)/g), '&').replace(new RegExp(/(mark-2)/g), '?').replace(new RegExp(/(mark-3)/g), '%').replace(new RegExp(/(mark-4)/g), '=')
}
export const bd09togcj02 = (bdLon, bdLat) => { // 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
  const xPI = 3.14159265358979324 * 3000.0 / 180.0
  var bdLon2 = +bdLon
  var bdLat2 = +bdLat
  var x = bdLon2 - 0.0065
  var y = bdLat2 - 0.006
  var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * xPI)
  var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * xPI)
  var ggLng = z * Math.cos(theta)
  var ggLat = z * Math.sin(theta)
  return [ggLng, ggLat]
}
export const gcj02tobd09 = (lng, lat) => { // 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
  const xPI = 3.14159265358979324 * 3000.0 / 180.0
  var lat2 = +lat
  var lng2 = +lng
  var z = Math.sqrt(lng2 * lng2 + lat2 * lat2) + 0.00002 * Math.sin(lat2 * xPI)
  var theta = Math.atan2(lat2, lng2) + 0.000003 * Math.cos(lng2 * xPI)
  var bdLon = z * Math.cos(theta) + 0.0065
  var bdLat = z * Math.sin(theta) + 0.006
  return [bdLon, bdLat]
}
export const setDistanceSize = (num) => { // 米转千米
  const distance = Number(num)
  const p = distance >= 1000
  const str = (p ? Number((distance / 1000).toFixed(2)) : distance) + (p ? 'km' : 'm')
  return str
}
export const setUrlObj = (str) => { // url转obj (包含 url)
  const arr = str.split('&')
  let obj = {}
  arr.map(item => {
    let data = item.split('=')
    obj[data[0]] = data[1]
  })
  return obj
}

export const setUrlObj2 = (str) => { // url转obj (不包含 url)
  const arr = str.split('&')
  let obj = {}
  arr.map(item => {
    let data = item.split('=')
    if (data[0].includes('?')) {
      data[0] = data[0].slice(data[0].indexOf('?')+1)
    }
    obj[data[0]] = data[1]
  })
  return obj
}


export const notEmpty = (arrList) => { // 去除数组空位
  var arr = [];
  arrList.map(function(val, index) {
    //过滤规则为，不为空串、不为null、不为undefined，也可自行修改
    if (val !== "" && val != undefined) {
        arr.push(val);
    }
  });
    return arr;
}


export const getRemainTime = (endTime, deviceTime, serverTime) => { // 获取倒计时
  let t = endTime - Date.parse(new Date()) - serverTime + deviceTime
  let seconds = Math.floor((t / 1000) % 60)
  let minutes = Math.floor((t / 1000 / 60) % 60)
  let hours = Math.floor((t / (1000 * 60 * 60)) % 24)
  let days = Math.floor(t / (1000 * 60 * 60 * 24))
  if ((hours + minutes + seconds) <= 0) {
    return false
  }
  hours += (days * 24)
  return [setNumSize(hours), setNumSize(minutes), setNumSize(seconds)]
}
export const setUrl = (obj) => { // obj转url
  let str = []
  for (let i in obj) {
    str.push(i + '=' + obj[i])
  }
  return str.join('&')
}

export const setNumSize = (num) => { // 0 =》 00
  return (num > 9 ? '' : '0') + num
}

export const getPlayOrderStatusName = (orderState, payState) => {
  let name = '状态错误';
  if (orderState == '0') {
    if (payState == '0') {
      name = '待支付'
    } else {
      name = '待消费'
    }
  } else if (orderState == '1') {
    name = '已核销'
  } else if (orderState == '2') {
    name = '退款'
  } else if (orderState == '3') {
    name = '已取消'
  } else if (orderState == '4') {
    name = '部分退款'
  }
  return name;
}

export const getOrderStatusName = (orderState, payState) => {
  let name='待处理';
  if (orderState=='10'){
    name ='已揽件'
  } else if (orderState == '9') {
    name = '分拣中'
  } else if (orderState == '5') {
    name = '待装车'
  }
  else if (orderState == '6') {
    name = '运输中'
  }
  else if (orderState == '7') {
    name = '派送中'
  }
  else if (orderState == '2') {
    name = '已完成'
  }
  if (payState != '' && payState == "0"){
    name = '等待付款';
  }
  
  return name;
}

export const rpxToPx = (rex) => {
  const { ww } = getApp().data
  return (rex / 750) * ww
}
export const pxToRpx = (rex) => {
  const {ww} = getApp().data
  return rex * 750 / ww
}
export const downRefreshVerify = (fun,_this) => {
  const now = +new Date()
  const time = now - _this.downRefreshTime
  if (!_this.downRefreshTime || time > (1000 * 3)) {
    wx.showLoading()
    fun()
    _this.downRefreshTime = now
  }
  setTimeout(() => wx.stopPullDownRefresh(),800)
}

export const setCheckText = (ctx, shopText, shopTextWidth, types) => {
  let shopTitle = ''
  let newArr = []
  if (shopText) {
    let shopTextArr = shopText.split('')
    for (let index = 0; index < shopTextArr.length; index++) {
      shopTitle += shopTextArr[index]
      if (ctx.measureText(shopTitle).width >= shopTextWidth) {
        newArr.push(shopTitle)
        shopTitle = ''
      }
    }
    if (newArr.length > types || (shopTitle.length && newArr.length == types)) {
      const str = newArr[types - 1]
      newArr[types - 1] = str.substr(0, str.length - 1) + '...'
      newArr.length = types
      return newArr
    }
    shopTitle.length && newArr.push(shopTitle)
  }
  return newArr
}

export const formatTime = (time,types) => {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join(types||'-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

export const setShareAppMessage = (obj, poster) => {
  const {
    storeMode,// 自提点模式
    storeColonelId,// 自提点团长ID
    userIsColonel,//  用户是不是团长
    storeInfo,// 自提点数据
  } = getApp().data
  const addr = wx.getStorageSync('currentStoreAddr')
  const switchTransWay = wx.getStorageSync('switchTransWay')
  console.log('index', storeInfo,switchTransWay, addr, obj, 253)
  if (storeMode && userIsColonel && (storeInfo.storeName || switchTransWay == 1)) {
    if (obj.path) { // 转发
      obj.title =  (addr.storeName || addr.title || storeInfo.storeName)
      obj.path += '&isStore=true&storeId=' + (wx.getStorageSync('currentStoreAddr').storeId || storeInfo.storeId || wx.getStorageSync('currentStoreAddr').id || storeInfo.id) 
      console.log(obj)
    } else if (poster) {  // 海报
      obj.st = 1
    }
    

  }
  return obj
}

export const formatNumber = (n) => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

export const goTabBar = (page) => { // 跳转页面
  wx.reLaunch({
    url: '/pages/tabBar/tabBar?page=' + page
  })
}

//去除字符串头尾空格或指定字符  
String.prototype.Trim = function (c) {
  if (c == null || c == "") {
    var str = this.replace(/^s*/, '');
    var rg = /s/;
    var i = str.length;
    while (rg.test(str.charAt(--i)));
    return str.slice(0, i + 1);
  }
  else {
    var rg = new RegExp("^" + c + "*");
    var str = this.replace(rg, '');
    rg = new RegExp(c);
    var i = str.length;
    while (rg.test(str.charAt(--i)));
    return str.slice(0, i + 1);
  }
}
//去除字符串头部空格或指定字符  
String.prototype.TrimStart = function (c) {
  if (c == null || c == "") {
    var str = this.replace(/^s*/, '');
    return str;
  }
  else {
    var rg = new RegExp("^" + c + "*");
    var str = this.replace(rg, '');
    return str;
  }
}

// 将日期往前退 currentDay 天
export function tim(currentDay) {
  var time = (new Date).getTime() - currentDay * 24 * 60 * 60 * 1000;
  var tragetTime = new Date(time);
  var month = tragetTime.getMonth();
  var day = tragetTime.getDate();
  tragetTime = tragetTime.getFullYear() + "-" + (tragetTime.getMonth() > 9 ? (tragetTime.getMonth() + 1) : "0" + (tragetTime.getMonth() + 1)) + "-" + (tragetTime.getDate() > 9 ? (tragetTime.getDate()) : "0" + (tragetTime.getDate()));
  console.log(tragetTime, '这是一周前日期，格式为2010-01-01')
  return tragetTime;
}

// 盆友圈分享进入的默认数据(从朋友圈分享进入时请求不到数据)
export const defaultData = {
  // 首页导航
  categoryList: [
    {clsName: "生鲜食品", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/87683ef982814ed6aadb9c02563ad0dd.png"},
    {clsName: "粮油调料", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/a2eef1863ae84cb8a3be2981565e7113.png"},
    {clsName: "速冻餐食", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/8cc64bfed7c349cebde4bba611cf0ea3.png"},
    {clsName: "速食冲调", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/3b4e31cc424b4bdebfe87d5e08601d8f.png"},
    {clsName: "牛奶乳品", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/731ef3b8cb4b45be8a89df35fc704619.png"},
    {clsName: "酒水饮料", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/7d723f34ee4d4a039e794b2ba38d137a.png"},
    {clsName: "休闲食品", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/1ef2011768bd46e39eb4eced274f8771.png"},
    {clsName: "家庭清洁", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/1a6320610d384c74acec4e1a12d97d7e.png"},
    {clsName: "个护健康", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/e9fcb45b93304c33b3b4f21f75c41503.png"},
    {clsName: "家居百货", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/27cb36a3a62247e5a14523637fb8c467.png"},
    {clsName: "纸品针棉", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/fa1f9c290a4c4ae0a94e0bdc0ed51549.png"},
    {clsName: "文体娱乐", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/87e112df2d5b44139ec3f04a876105ce.png"},
  ],
  // 首页主推商品
  ZZZTGoodsList: [
    {itemDisPrice: 9,itemId: 195478,itemName: "怡宝桶装饮用纯净水6L",itemNowPrice: 4.98,      itemPrePrice: 9,itemSizeDes: "1*50",itemThumbPic: "http://erp.yygyt.cn//upload/images/bdItemInfo/02010122/1-0.jpg",itemUnit: "副",maxSupplyQty: 10},
    {itemDisPrice: 9,itemId: 195478,itemName: "太傅园茶油腐乳260g香辣型",itemNowPrice: 4.98,      itemPrePrice: 9,itemSizeDes: "1*50",itemThumbPic: "http://erp.yygyt.cn//upload/images/bdItemInfo/13060041/1-0.jpg",itemUnit: "副",maxSupplyQty: 10},
    {itemDisPrice: 9,itemId: 195478,itemName: "奥狮龙领牌-916中考达标跳绳",itemNowPrice: 4.98,      itemPrePrice: 9,itemSizeDes: "1*50",itemThumbPic: "http://erp.yygyt.cn//upload/images/bdItemInfo/21030023/2-0.jpg",itemUnit: "副",maxSupplyQty: 10}
  ],
  // 商品页面cls数据
  categoryList2: [
    {clsName: "生鲜食品", sysCode: 78, clsNo: "11", fatherClsNo: "0", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/87683ef982814ed6aadb9c02563ad0dd.png"},
    {clsName: "速冻餐食", sysCode: 78, clsNo: "12", fatherClsNo: "0", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/8cc64bfed7c349cebde4bba611cf0ea3.png"},
    {clsName: "粮油调料", sysCode: 78, clsNo: "33", fatherClsNo: "0", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/a2eef1863ae84cb8a3be2981565e7113.png"},
    {clsName: "速食冲调", sysCode: 78, clsNo: "32", fatherClsNo: "0", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/3b4e31cc424b4bdebfe87d5e08601d8f.png"},
    {clsName: "牛奶乳品", sysCode: 78, clsNo: "21", fatherClsNo: "0", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/731ef3b8cb4b45be8a89df35fc704619.png"},
    {clsName: "酒水饮料", sysCode: 78, clsNo: "22", fatherClsNo: "0", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/7d723f34ee4d4a039e794b2ba38d137a.png"},
    {clsName: "休闲食品", sysCode: 78, clsNo: "31", fatherClsNo: "0", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/1ef2011768bd46e39eb4eced274f8771.png"},
    {clsName: "家庭清洁", sysCode: 78, clsNo: "42", fatherClsNo: "0", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/1a6320610d384c74acec4e1a12d97d7e.png"},
    {clsName: "个护健康", sysCode: 78, clsNo: "41", fatherClsNo: "0", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/e9fcb45b93304c33b3b4f21f75c41503.png"},
    {clsName: "家居百货", sysCode: 78, clsNo: "52", fatherClsNo: "0", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/27cb36a3a62247e5a14523637fb8c467.png"},
    {clsName: "纸品针棉", sysCode: 78, clsNo: "51", fatherClsNo: "0", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/fa1f9c290a4c4ae0a94e0bdc0ed51549.png"},
    {clsName: "文体娱乐", sysCode: 78, clsNo: "53", fatherClsNo: "0", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/87e112df2d5b44139ec3f04a876105ce.png"}
  ],
  // 商品页商品
  goodsList: [
    {id: "193676", itemId: "193676", itemNo: "80090297", itemName: "【WL】切块冬瓜*2斤±0.1斤/份", itemIndexPic: "http://erp.yygyt.cn//upload/images/bdItemInfo/80090297/2-2.png",itemNowPrice: 8.8, itemPrePrice: 7.54,itemDisPrice: 12.98 },
    {id: "193605", itemId: "193605", itemNo: "80090226", itemName: "【WL】本地辣椒 *1斤±0.1斤/份", itemIndexPic: "http://erp.yygyt.cn//upload/images/bdItemInfo/80090226/1-2.png", itemNowPrice: 8.8, itemPrePrice: 7.54,itemDisPrice: 12.98},
    {id: "193606", itemId: "193606", itemNo: "80090227", itemName: "【WL】上海青*1斤±0.1斤/份", itemIndexPic: "http://erp.yygyt.cn//upload/images/bdItemInfo/80090227/1-2.png", itemNowPrice: 8.8, itemPrePrice: 7.54,itemDisPrice: 12.98},
    {id: "193601", itemId: "193601", itemNo: "80090222", itemName: "【WL】 袋装大蒜籽*2.8斤±0.2斤/份", itemIndexPic: "http://erp.yygyt.cn//upload/images/bdItemInfo/80090222/4-2.jpg", itemNowPrice: 8.8, itemPrePrice: 7.54,itemDisPrice: 12.98},
    {id: "193596", itemId: "193596", itemNo: "80090217", itemName: "【WL】铁棍淮山 1.5斤±0.2/份", itemIndexPic: "http://erp.yygyt.cn//upload/images/bdItemInfo/80090217/1-2.jpg", itemNowPrice: 8.8, itemPrePrice: 7.54,itemDisPrice: 12.98},
    {id: "195083", itemId: "195083", itemNo: "80090415", itemName: "【WL】整张百叶*300g±10g/份", itemIndexPic: "http://erp.yygyt.cn//upload/images/bdItemInfo/80090415/1-2.jpg", itemNowPrice: 8.8, itemPrePrice: 7.54,itemDisPrice: 12.98},
    {id: "193703", itemId: "193703", itemNo: "80090324", itemName: "【WL】洋葱3斤±0.3斤/份", itemIndexPic: "http://erp.yygyt.cn//upload/images/bdItemInfo/80090324/3-2.png", itemNowPrice: 8.8, itemPrePrice: 7.54,itemDisPrice: 12.98},
    {id: "194875", itemId: "194875", itemNo: "80090356", itemName: "【WL】外婆家的多味雪菜*1斤±10g", itemIndexPic: "http://erp.yygyt.cn//upload/images/bdItemInfo/80090356/1-2.jpg", itemNowPrice: 8.8, itemPrePrice: 7.54,itemDisPrice: 12.98},
    {id: "194876", itemId: "194876", itemNo: "80090411", itemName: "【WL】自制酸豆角*1斤±0.1斤/盒", itemIndexPic: "http://erp.yygyt.cn//upload/images/bdItemInfo/80090411/1-2.jpg", itemNowPrice: 8.8, itemPrePrice: 7.54,itemDisPrice: 12.98},
    {id: "193691", itemId: "193691", itemNo: "80090312", itemName: "【WL】香菜*200g±10g/份", itemIndexPic: "http://erp.yygyt.cn//upload/images/bdItemInfo/80090312/1-2.jpg",itemNowPrice: 8.8, itemPrePrice: 7.54,itemDisPrice: 12.98}
  ],
  // 商品类别
  cls: [
    {clsName: "新鲜水果", sysCode: 78, clsNo: "1101", fatherClsNo: "11", imgName: "http://cmm.admin.kekejingxuan.com/kaptcha/273d3b3f26384d3b92010f9f279334ab.png"}
  ]
}

//去除字符串尾部空格或指定字符  
String.prototype.TrimEnd = function (c) {
  if (c == null || c == "") {
    var str = this;
    var rg = /s/;
    var i = str.length;
    while (rg.test(str.charAt(--i)));
    return str.slice(0, i + 1);
  } else {
    var str = this;
    var rg = new RegExp(c);
    var i = str.length;
    while (rg.test(str.charAt(--i)));
    return str.slice(0, i + 1);
  }
}