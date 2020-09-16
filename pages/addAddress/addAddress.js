import commit from '../../store/mutations.js'
import * as types from '../../store/types.js'
import API from '../../api/index.js'
import { alert, toast, showLoading, hideLoading, getFilterDataSize,goPage } from '../../tool/index.js'
Page({
  data: {
    selectedCity: [],
    isDefault: false,
    phone: '',
    consignee: '',
    address: '',
    house:'',
    locationY:null,
    locationX:null,
    showOpenSetting:false,
    orderFlag:'1'
  },
  sava() {
    
    showLoading('保存...')
    const { selectedCity, phone, consignee, address, isDefault, locationY, locationX, house} = this.data
    let request = {
      openid: this.openId,
      dcId: getApp().data.dcId,
      sysCode: getApp().data.sysCode,
      userId: getApp().data.userInfo.userId,
      phone: phone,
      consignee: consignee,
      province : selectedCity[0],
      city : selectedCity[1],
      area: selectedCity[2],
      address: address + (house ? (' ' + house):''),
      toleration: (isDefault || !this.baseLength) ? '1' : '0' ,
      locationY,
      locationX,
    }
    if (this.id) request.id = this.id
    for (let i in request) {
      if (!request[i]) {
        toast('信息填写不完整')
        return
      }
    }

    if (!/^[0-9]{11}$/.test(phone)) {
      toast('请输入正确的手机号')
      return;
    }
    API.Addreess[this.openType === 'add' ? 'addMemberAddress' : 'updateMemberAddress']({
      data: request,
      success: obj => {
        hideLoading()
        console.log("保存收货地址:",obj)
        if (obj.status === 200) {
          if (request.toleration === '1') {
            this.openType == 'add' && (request.id = obj.data.id)
            commit[types.SAVE_RECEIVING_ADDRESS](obj.data)
          } else if (this.baseIsDefault == '1' && this.baseIsDefault != request.toleration) {
            commit[types.SAVE_RECEIVING_ADDRESS](null)
          }
          wx.setStorageSync('refreshAddress', true)
          wx.navigateBack({ delta: (!this.baseLength && this.operateType == 'liquidation') ? 2 : 1 })
        } else {
          alert(obj.msg)
        }
      },
      error: () => {
        hideLoading()
        toast('保存失败')
      }
    })
  },
  getConent(e) {
    const type = e.currentTarget.dataset.type
    let obj = {}
    obj[type] = e.detail.value.trim()
    this.setData(obj)
  },
  setDefault(e) {
    const isDefault = e.detail.value
    this.setData({ isDefault })
  },
  selectCity(e) {
    const selectedCity = e.detail.value
    this.setData({ selectedCity })
  },
  selectCity3(e){
    const { locationY, locationX} = this.data
    goPage(['LBS', 'map'],{
      locationY,
      locationX,
    })
  },
  selectCity2(e) {
    let that=this
    wx.chooseLocation({
      latitude: this.data.locationY,
      longitude: this.data.locationX,
      success: function (res) {
        console.log(res.longitude, res.latitude)
        that.setData({ selectedCity: [" ", " ", res.address + " " + res.name]});
        that.setData({locationX: res.longitude, locationY: res.latitude})
        console.log(res)
      }, fail: function (res) 
      {
        console.log("打开地图",res)
        if(res.errMsg =="chooseLocation:fail auth deny")
        {
          toast('请授权使用我的地理位置')
          that.setData({ showOpenSetting:true})
        }else
        {
          toast('请开启手机定位服务')
        }
      },
    })
   
  },
  Setting: function () {
    let that = this
    wx.openSetting({
      success: function (res) {
        console.log(res.authSetting)
        if (res.authSetting["scope.userLocation"])
        {
          that.setData({ showOpenSetting: false })
        }
       
      }
    });
  },
  onLoad(opt) {

    

    this.openId = getApp().data.openid
    this.dcId = getApp().data.dcId
    this.sysCode = getApp().data.sysCode
    let title
    const openType = opt.openType
    this.operateType = opt.operateType
    this.baseLength = Number(opt.length)
    !opt.length && (this.isDefault = true)
    if (openType === 'add') {
      title = '新增收货地址'
    } else if (openType === 'edit') {
      title = '修改收货地址'
      const data = JSON.parse(getFilterDataSize(opt.data))
      this.baseIsDefault = data.toleration
      this.id = data.id
      const address = data.address
      const index = address.indexOf(' ')
      this.setData({
        selectedCity: [data.province, data.city, data.area],
        isDefault: data.toleration == '1',
        phone: data.phone,
        consignee: data.consignee,
        address: index == -1 ? address : address.substring(0, index),
        locationY: data.locationY,
        locationX: data.locationX,
        orderFlag: data.orderFlag,
        house: index == -1 ? '' : address.substring(index + 1)
      })
    }
    this.openType = openType
    title && wx.setNavigationBarTitle({ title: title })
  },
  onReady() {
  },
  onShow(opt) {
    console.log("进入修改地址", opt)
    console.log("进入页面")
  }
})