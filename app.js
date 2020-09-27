//app.js
import { setUrlObj} from 'tool/index.js'
const imgPath = '' // cdn
//const imgPath = 'http://i1.fuimg.com/701439' // cdn
const source = '0' // 来源
import config from 'tool/config.js'
App({
  data:{
    imgBaseUrl: 'https://zksrimg.oss-cn-beijing.aliyuncs.com/kaptcha/',
    version: '1.0', // 版本号
    userWxInfo: null, // 用户微信信息
    source:"0",
    userInfo:null,// { userId: "133997" }, // 用户账户信息{ userId: "133997" }
    openId: null,//'o9yv15Smf9MkXTpwgocFC2ruNZ2w',//null,// 'o9yv15Smf9MkXTpwgocFC2ruNZ2w', // 用户openId
    storeId:"1",  //没有用处，只是为了调用keke做测试
    sysCode: "",//'6', //null,// '6', // 合伙人
    colonelId: "",//'3312',//null,//'3312' , //团长
    colonelInfo: {},
    dcId: "",//"35",//'35', //null,//
    sessionKey: '', // session_key
    themeColor: '#FF5800', // 主题颜色 
    receivingAddr: null, //收货地址
    shoppingCart:[], //购物车里面的商品
    dcName:"", //配送中心名称
    ww:0,
    mapKey: config[source].mapKey,
    postageSection:[], //当前配送中心运费区间
    startDeliveMoney: 0, //当前配送中心起送金额
    storeMode: false, // 自提点模式
    storeColonelId: '', // 自提点团长ID
    userIsColonel: false, //  用户是不是团长
    storeInfo:{}, // 自提点数据
    shareType: '' // 分享类型  goodShare 为商品分享
  },
  onShow(options) {
    console.log('onShowonLaunch', options)
    console.log(this)
    // 判断是否由分享进入小程序
    if ((options.scene == 1007 || options.scene == 1008) && options.query.openType == 'share') {

      if (options.query.storeId && options.query.storeId != "undefined") {
        console.log('asdasfasf')
        this.data.storeMode = true
        // wx.setStorage({ data: 1, key: 'switchTransWay' })
        this.globalData.switchTransWay = 1
      } else if (options.query.storeId == "undefined" && 'i' in options.query) { // 商品非自提点分享
        this.data.shareType = 'goodShare'
        this.data.storeMode = 'false'
        this.data.storeAddr = {}
        setTimeout(() => this.globalData.switchTransWay = 0, 1000)       
      } else {
        console.log('进啊速度噶四百')
        // wx.setStorage({ data: 0, key: 'switchTransWay' })
        this.globalData.switchTransWay = 0
        this.data.storeMode = true
        console.log(this.globalData.switchTransWay)
      }
      // wx.setStorageSync('currentStoreMode', 1)
      // wx.removeStorageSync('currentStoreAddr')
      this.globalData.share = true
      this.data.storeInfo.storeId = options.query.storeId
      console.log(this)
    } else {
      console.log('mode = false')
      this.globalData.share = false
      this.data.storeMode = false
    };
    console.log('onShow', options)
    console.log('app.js全局：', this)
    if (options.referrerInfo.extraData) {
      this.data.colonelId = options.referrerInfo.extraData.colonelId
      this.data.shareItemId = options.referrerInfo.extraData.itemId
    }
    const shareColonelId = options.colonelId || options.query.colonelId||''
    if (shareColonelId){
      this.data.colonelId = shareColonelId
      if (options.query.isStore) {
        console.log(111)
        this.data.storeMode = true
        this.data.storeColonelId = shareColonelId
      }
    }

    if (options.query.scene) {
      let sceneObj = setUrlObj(decodeURIComponent(options.query.scene))
      console.log(866666,sceneObj)
      if (sceneObj.isStore || sceneObj.st=='1') {
        this.data.storeMode = true
        this.data.storeColonelId = sceneObj.colonelId
      }
      if (!this.data.colonelId) {
        this.data.colonelId = sceneObj.colonelId || ''
      }
      
    }
    
    
    if (wx.getUpdateManager) {
      const updateManager = wx.getUpdateManager()
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          showCancel: false,
          success: res => {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      })
    }
    console.log('113版本号' ,'2.0.5')
    console.log('114wx.getUpdateManager', wx.getUpdateManager())
  //   const updateManager = wx.getUpdateManager()
  //   updateManager.onUpdateReady(() => {
  //     wx.showModal({
  //       title: '更新提示',
  //       content: '新版本已经准备好，是否重启应用？',
  //       showCancel: false,
  //       success: res => {
  //         if (res.confirm) {
  //           updateManager.applyUpdate()
  //         }
  //       }
  //     })
  //   })
  },
  onLaunch: function (options) {

    //获取设备顶部窗口的高度（不同设备窗口高度不一样，根据这个来设置自定义导航栏的高度）
    //这个最初我是在组件中获取，但是出现了一个问题，当第一次进入小程序时导航栏会把
    //页面内容盖住一部分,当打开调试重新进入时就没有问题，这个问题弄得我是莫名其妙
    //虽然最后解决了，但是花费了不少时间
    var that = this
    if (wx.getSystemInfoSync) {
      const res = wx.getSystemInfoSync()
      that.globalData.platform = res.platform
      let totalTopHeight = 68
      if (res.model.indexOf('iPhone X') !== -1) {
        totalTopHeight = 88
      } else if (res.model.indexOf('iPhone') !== -1) {
        totalTopHeight = 64
      }
      that.globalData.statusBarHeight = res.statusBarHeight
      console.log(res.statusBarHeight)
      that.globalData.titleBarHeight = totalTopHeight - res.statusBarHeight
      that.globalData.windowWidth = res.windowWidth;
      that.globalData.windowHeight = res.windowHeight
      // if(res.brand=="Xiaomi"&&res.model=="MI 5"){
      //    that.globalData.LXY="1"
      //  }
      this.data.ww = res.windowWidth
      this.data.hh = res.windowHeight
    } else {
      that.globalData.statusBarHeight = 30
    }
    
  },
  globalData: {
    share: false,      // 分享默认为false
    height: 0,
    switchTransWay: '' // 当前的配送方式 0：送到家 1：自提 （分享模式）
  }
})