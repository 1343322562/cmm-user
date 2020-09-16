import API from '../../../api/index.js'
import QQMapWX from '../../../tool/qqmap-wx-jssdk.js'
import { showLoading, hideLoading, toast, goPage, alert } from '../../../tool/index.js'
Page({
  data: {
    polygons:[],
    showLocation: true,
    centerLng:'116.397827',
    centerLat:'39.903740',
    list:[],
    select:'',
    nowLoaction:'',
    sizeNum:14,
    scrollTop:0,
    searchText:''
  },
  changeSize (e) {
    const {type} = e.currentTarget.dataset
    let sizeNum = this.data.sizeNum + (type=='1'?1:-1)
    if (sizeNum >= 3 && sizeNum<=18) {
      this.setData({ sizeNum})
    }
  },
  confirmSelect () {
    const { select, list } = this.data
    const item = list[select]
    const { province, city, district } = item.ad_info
    showLoading()
    API.Addreess.checkUserAddress({
      data:{
        sysCode: this.sysCode,
        locationX: item.location.lng,
        locationY: item.location.lat
      },
      success: ret => {
        hideLoading()
        if (ret.status == 200&& ret.data) {
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2];  //上一个页面
          prevPage.setData({
            selectedCity: [province, city,district],
            // addressInfo: item.address.replace(province, "").replace(city, "").replace(district, "") + "" + item.title,
            address: item.address.replace(province, "").replace(city, "").replace(district, "") + "" + item.title,
            locationY: item.location.lat,
            locationX: item.location.lng,
          });
          wx.navigateBack()
        } else {
          alert('所选地址不在配送范围内，请重新选择')
        }
      },
      error: ()=> {
        hideLoading()
        alert('选择失败，请检查网络是否异常')
      }
    })
  },
  goSearch () {
    goPage(['LBS','searchLocation'])
  },
  radioChange (e) {
    let select = e.detail.value
    this.setData({ select})
  },
  getPageData () {
    API.Addreess.getNearStoreBySyscode({
      data: { sysCode: this.sysCode},
      success: ret => {
        let data = ret.data
        let polygons = []
        if (ret.status == 200) {
          let setPint = (arr) => {
            let points = []
            arr.split(';').forEach((pints, index) => {
              const pint = pints.split(',')
              points.push({ latitude: pint[0], longitude: pint[1] })
            })
            return points
          }
          data.deptList.forEach(item => {
            polygons.push({
              fillColor: "#054EF410",
              strokeWidth: 1,
              strokeColor: '#054EF4',
              points: setPint(item.polygons)
            })
          })
          data.storeList.forEach(item => {
            polygons.push({
              fillColor: "#FF000010",
              strokeWidth: 1,
              strokeColor: '#FF0000',
              points: setPint(item.polygons)
            })
          })
          this.setData({ polygons})
        }
      }
    })
  },
  openNowLoaction () {
    this.mapCtx.moveToLocation({
      success: ret=> {
        this.getUserLoaction()
      }
    })
  },
  getCenter (lat,lng) {
    this.setData({
      centerLng: lng,
      centerLat: lat,
    })
    this.qqmapsdk.reverseGeocoder({
      location: lat + ',' + lng,
      get_poi:'1',
      poi_options:"policy=2;page_size=20;page_index=1",
      success: ret => {
        if (ret.status == 0) {
          let list = ret.result.pois || []
          let obj = { list, scrollTop: 0, select: 0}
          this.setData(obj)
        }
      },
      fail: err => {
        toast('网络异常')
      }
    })
  },
  mapChange (e) {
    if (e.type == 'end' && (e.causedBy == 'scale' || e.causedBy == 'drag')) {
      this.mapCtx.getCenterLocation({
        type: 'gcj02',
        success: (res)=>{
          this.getCenter(res.latitude, res.longitude)
        }
      })
    }
  },
  getUserLoaction(type) {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const longitude = res.longitude
        const latitude = res.latitude
        this.setData({
          centerLng: longitude,
          centerLat: latitude,
        })
        this.getCenter(latitude, longitude)
      },
      fail: (e) => {
        if (e.errMsg.indexOf('auth') !== -1) {
          this.openLocation()
        }
      },
      complete: () => {
        type && hideLoading()
      }
    })
  },
  openLocation() {
    alert('请开启定位功能', {
      confirmColor: '#1bb879',
      confirmText: '去设置',
      success: () => {
        wx.openSetting({
          success: (ret) => {
            if (ret.authSetting['scope.userLocation']) {
              showLoading()
              setTimeout(() => {
                this.getUserLoaction(true)
              }, 1000)
            }
          }
        })
      }
    })
  },
  onLoad (options) {
    const { mapKey, sysCode} = getApp().data
    this.sysCode = sysCode
    this.mapKey = mapKey
    this.qqmapsdk = new QQMapWX({ key: mapKey })
    this.mapCtx = wx.createMapContext("myMap");
    const { locationY, locationX } = options
    console.log(locationY, locationX)
    if (locationY != 'null' && locationY&& locationX) {
      this.getCenter(locationY, locationX)
    } else {
      wx.getSetting({
        success: (data) => {
          if (!data.authSetting['scope.userLocation']) {
            wx.authorize({
              scope: 'scope.userLocation',
              success: () => {
                this.getUserLoaction()
              },
              fail: (e) => {
                this.openLocation()
              }
            })
          } else {
            this.getUserLoaction()
          }
        }
      })

    }
    
    this.getPageData()
  },
  onShow () {
    const selectLocation = wx.getStorageSync('selectLocation')
    if (selectLocation) {
      wx.removeStorageSync('selectLocation')
      const { longitude, latitude } = selectLocation
      this.mapCtx.moveToLocation({
        longitude,
        latitude,
        success: ret => {
          this.getCenter(latitude, longitude)
        }
      })
    }
  }
})