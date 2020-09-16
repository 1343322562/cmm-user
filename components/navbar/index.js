// const app = getApp()
// Component({
//   properties: {
//     navbarData: {   //navbarData   由父页面传递的数据，变量名字自命名
//       type: Object,
//       value: {},
//       observer: function (newVal, oldVal) { }
//     }
//   },
//   data: {
//     height: '',
//     //默认值  默认显示左上角
//     navbarData: {
//       showCapsule: 1
//     }
//   },
//   attached: function () {
//     // 获取是否是通过分享进入的小程序
//     this.setData({
//       share: app.globalData.share
//     })
//     // 定义导航栏的高度   方便对齐
//     this.setData({
//       statusBarHeight: app.globalData.statusBarHeight,
//       titleBarHeight: app.globalData.titleBarHeight
//     })
//   },
//   methods: {
//     // 返回上一页面
//     _navback() {
//       wx.navigateBack()
//     },
//     //返回到首页
//     _backhome() {
//       wx.switchTab({
//         url: '/pages/index/index',
//       })
//     }
//   }

// }) 

const app = getApp()
Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    innerTitle: {
      type: String,
      value: '标题'
    },
    isShowBack: {
      type: String,
      value: "true"
    }
  },
  data: {
    // 这里是一些组件内部数据
    someData: {
      statusBarHeight: app.globalData.statusBarHeight,
      titleBarHeight: app.globalData.titleBarHeight
    }
  },
  methods: {
    // 这里是一个自定义方法
    goback: function () {
      wx.navigateBack({
        delta: 1,
      })
    }
  }
})