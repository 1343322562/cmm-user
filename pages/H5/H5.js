import API from '../../api/index.js'
Page({
  data: {
    imgDetailsList: [],
  },
  getGoodsImgDetail() {
    const imgUrl = getApp().data.imgUrl
    const userObj = wx.getStorageSync('userObj')
    API.Index.searchSupplyPoster({
      data: {
        token: userObj.token,
        username: userObj.username,
        platform: userObj.platform,
        connectionNo: this.connectionNo
      },
      success: res => {
        const data = res.data
        if (res.code == 0 && data) {
          const list = data.substring(data.indexOf("src='") + 5).split("src='")
          let imgDetailsList = []
          list.forEach(str => {
            let url = str.substring(0, str.indexOf("'"))
            if (url.indexOf('http') == -1) url = imgUrl + '/' + url
            imgDetailsList.push(url)
          })
          this.setData({ imgDetailsList })
        }
      }
    })
  },
  onLoad (opt) {
    this.connectionNo = opt.connectionNo
    this.getGoodsImgDetail()
  }
})