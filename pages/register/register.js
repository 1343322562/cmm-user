
import API from '../../api/index.js'
import { showLoading, hideLoading, alert, toast, gcj02tobd09 } from '../../tool/index.js'
import QQMapWX from '../../tool/qqmap-wx-jssdk.js'
Page({
  data: {
    bossName:'',
    branchName:'',
    areaName:'',
    selectedCity: [],
    shopAddrass:'',
    areaList: [],
    pageLoading: false,
    read: false,
    partnerCode:'',
    onOffTakePhoto:false,                              // 是否开启了门头照、营业执照拍摄
    saleImageURL:'/images/register_add_sale.png',      // 营业执照照片路径
    headerImageURL:'/images/register_add_header.png',  // 门头照照片路径
    licencePic:'',                                     // 上传营业执照后台返回路径信息
    doorPic:'',                                        // 上传门头照后台返回路径信息
    formatted_addresses: ''                            // 具体地址
  },
  getValue(e) {
    const k = e.currentTarget.dataset.type
    let obj = {}
    obj[k] = e.detail.value.trim()
    this.setData(obj)
  },
  selectArea (e) {
    const index = parseInt(e.detail.value)
    const item = this.data.areaList[index]
    this.setData({ areaName: item.branchClsname })
    this.areaId = item.branchClsno
  },
  selectCity(e) {
    const selectedCity = e.detail.value
    this.setData({ selectedCity })
  },
  getAreaList () {
    showLoading('请稍后...')
    API.Login.searchBranchArea({
      data: { platform:'3' },
      success: res => {
        console.log("res:", res)
        if (res.code == 0) {
          const areaList = res.data || []
          this.setData({ areaList})
        }
      },
      complete: ()=> {
        hideLoading()
        this.setData({ pageLoading: true})
      }
    })
  },
  submit () {
    const { bossName, branchName, selectedCity, shopAddrass, read, partnerCode,licencePic,doorPic} = this.data
    if (!read) return
    if (this.authorization === 'fail') {
      this.openLocation()
      return
    }
    let data ={
      phone: this.phone||'',
      bossName,
      branchClsno: this.areaId||'',
      branchName,
      address: selectedCity.join(''),
      x: String(this.point[1]),
      y: String(this.point[0]),
      property:'9',
      location: shopAddrass,
      platform:'2'
    }

    if(licencePic && licencePic.length >0)data.licencePic = licencePic;
    if(doorPic && doorPic.length >0)data.doorPic = doorPic;
    
    for (let i in data) {
      console.log(data)
      if (!data[i] && (partnerCode != '1035' || (i != 'branchClsno'))) {
        console.log(i)
        toast('信息填写不完整')
        return
      }
    }
    showLoading('提交中...')
    API.Login.supplyRegister({
      data: data,
      success: res => {
        alert(res.msg,{
          success: () => {
            if (res.code == 0) wx.navigateBack({data:1})
          }
        })
      },
      error: ()=> {
        alert('提交失败，请检查网络是否正常')
      },
      complete: () => {
        hideLoading()
      }
    })
  },
  isRead (e) {
    this.setData({ read: e.detail.value.length})
  },
  openLocation() {
    alert('请开启定位功能', {
      confirmColor: '#d40000',
      confirmText: '去设置',
      success: () => {
        wx.openSetting({
          success: (ret) => {
            if (ret.authSetting['scope.userLocation']) {
              showLoading()
              setTimeout(() => {
                this.getUserLoaction(true)
                this.authorization = null
              }, 1000)
            }
          }
        })
      }
    })
  },
  lookAgreement () {
    alert(this.agreement || '获取失败，请稍后再试!',{
      confirmText: '知道了',
      title:'用户协议'
    })
  },
  getAgreement () {
    API.Login.getUserAgreementInfo({
      data: { platform: '3' },
      success: res => {
        if (res.code == 0) {
          this.agreement=res.data.agreementValue
        }
      }
    })
  },
  getAddress(lng, lat) {
    // 百度地图 API，返回定位的位置信息
    this.qqmapsdk.reverseGeocoder({
      location: {
        longitude: lng,
        latitude: lat
      },
      success: (ret) => {
        console.log(ret)
        if (ret.status === 0) {
          const info = ret.result.address_component
          const selectedCity = [info.province, info.city, info.district]
          const formatted_addresses = ret.result.formatted_addresses.recommend
          this.setData({ 
            selectedCity, // 级联选择器 预选择 地址
            formatted_addresses, // 初始化并渲染 详细地址
            shopAddrass: formatted_addresses
          })
        } else {
          alert('GPS定位失败,请检查网络是否正常')
        }
      },
      fail: (e) => {
        console.log(e)
        alert('GPS定位失败,请检查网络是否正常!')
      }
    })
  },
  // 用户选择地址
  chooseLocaltion () {
    const _this = this
    wx.chooseLocation({
      success: function (res) {
        console.info(res);
        _this.setData({
          formatted_addresses: res.address
        })
      },
    })
  },
  // 获取用户坐标
  getUserLoaction(type) {
    console.log(type)
    const partnerCode = this.data.partnerCode
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log(res)
        this.point = gcj02tobd09(res.longitude, res.latitude)
        console.log(this.point)
        // if (partnerCode == '1035') {
          this.getAddress(res.longitude, res.latitude)
        // }
      },
      fail: (e) => {
        if (e.errMsg.indexOf('auth') !== -1) {
          this.authorization = 'fail'
        }
      },
      complete: () => {
        type && hideLoading()
      }
    })
  },

  /*********** action 事件 **********/
  /** 选择营业执照*/
  onTakePhotoSaleImage(){
   
    const _that = this;
    wx.chooseImage({
      count:1,
      sizeType:['original'],
      sourceType:['album','camera'],
      success(res){
        if(res.tempFilePaths.length >0){
          const saleImageURL = res.tempFilePaths[0];
          _that.setData({saleImageURL});
          // 上传图片
          showLoading('正在上传...');
          API.upload.uploadImage({
            filePath:saleImageURL,
            type:8,
            success:(uploadRes)=>{
              hideLoading();
              _that.setData({licencePic:uploadRes.data});
            },
            fail:(err)=>{
              hideLoading();
              alert('图片上传失败!');
            }
          });

        }

      }
    });
  },
  /** 拍摄门头照*/
  onTakePhotoHeaderImage(){
    const _that = this;
    wx.chooseImage({
      count:1,
      sizeType:['original'],
      sourceType:['camera'],
      success(res){
        if(res.tempFilePaths.length >0){
          const headerImageURL = res.tempFilePaths[0];
          _that.setData({headerImageURL});
          // 上传图片
          showLoading('正在上传...');
          API.upload.uploadImage({
            filePath:headerImageURL,
            type:8,
            success:(uploadRes)=>{
              hideLoading();
              _that.setData({doorPic:uploadRes.data});
            },
            fail:(err)=>{
              hideLoading();
              alert('图片上传失败!');
            }
          });
          
        }

      }
    });
  },
  /** 获取是否开启拍摄门头照*/
  fetchTakePhotoOnOff(){
    API.Login.getSetting({
     data:{"settingKey":"supplySetting.isRegisterPhone"},
     success: (res)=>{
      if(res.code == 0){
        let onOffTakePhoto = (res.data == '1');
        this.setData({onOffTakePhoto});
      }
     }
    })
  },

  /** 生命周期*/
  onLoad (opt) {
    console.log(opt)
    this.phone = opt.phone
    this.getAgreement()
    this.getAreaList()
    this.fetchTakePhotoOnOff()
    const partnerCode = getApp().data.partnerCode
    this.setData({ partnerCode })
    // if (partnerCode == '1035') {
      this.qqmapsdk = new QQMapWX({ key: 
        'O5DBZ-ODGCJ-3ECFZ-FKMGH-HCLRJ-V5FIS'
        // partnerCode == '1035' ? 'O5DBZ-ODGCJ-3ECFZ-FKMGH-HCLRJ-V5FIS' : ''
      })
    // }
    wx.getSetting({
      success: (data) => {
        if (!data.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              this.getUserLoaction()
            },
            fail: (e) => {
              this.authorization = 'fail'
            }
          })
        } else {
          this.getUserLoaction()
        }
      }
    })
  },
  onReady () {
  }
})