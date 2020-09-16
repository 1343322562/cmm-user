import { showLoading, hideLoading, alert, toast } from '../../../tool/index.js'
import ajax from '../../../api/config.js'
import API from '../../../api/index.js'
Page({
  data: {
    select: '',
    imgBaseUrl: '',
    upLoadImgUrl: '',
    goods: {},
    list: [
      "送错订单",
      "配送时间过长",
      "商品与预期不符",
      "商品质量问题",
      "商品少送或错送",
      "其他问题"
    ],
    imgList: [],
    basePhone: '',
    userPhone: '',
    returnMemo: ''
  },
  selectd(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ select: Number(index) })
  },
  input(e) {
    const type = e.currentTarget.dataset.type
    let obj = {}
    obj[type] = e.detail.value.trim()
    this.setData(obj)
  },
  openImg(e) {
    const index = e.currentTarget.dataset.index || this.data.imgList.length;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePaths = res.tempFilePaths[0]
        this.uploadImg(tempFilePaths, index)
      }
    })
  },
  uploadImg(url, index) {
    showLoading()
    wx.uploadFile({
      url: this.requestUrl + 'order/upload2',
      filePath: url,
      name: 'file',
      success: (res) => {
        hideLoading()
        const data = res.data ? JSON.parse(res.data) : {}
        if (data.status === 200) {
          let imgList = this.data.imgList
          imgList[index] = data.data
          this.setData({ imgList })
        } else {
          toast('图片上传失败!')
        }
      },
      fail: () => {
        hideLoading()
        toast('选择图片失败!')
      }
    })
  },
  submist() {
    const { select, list, imgList, userPhone, returnMemo } = this.data
    const { orderNo, userName, goods } = this.obj
    let request = {
      userPhone,
      openid: getApp().data.openid,
      orderNo,
      itemId: goods.itemId,
      orderDetailId: goods.id,
      userName,
      returnNum: this.data.returnNum,
      returnReason: list[select] || '',
      returnPic: imgList.join(',')
    }
    console.log(request)
    for (let i in request) {
      if (!request[i]) {
        toast(i == 'returnReason' ? '请选择退款原因' : (i == 'returnPic' ? '请上传凭证' : (i == 'userPhone' ? '请填写联系电话' : '信息填写不完整')))
        return
      }
    }
    request.returnMemo = returnMemo
    showLoading()
    API.Orders.submitHqOrderAfter({
      data: request,
      success: ret => {
        hideLoading()
        if (ret.status == 200) {
          alert('提交申请成功', {
            success: () => {
              wx.navigateBack()
              wx.setStorageSync('upDateOrderDetails', true)
            }
          })
        } else {
          alert(ret.msg || '提交申请失败，稍后再试')
        }
      },
      error: () => {
        hideLoading()
        alert('提交申请失败，请检查网络是否正常')
      }
    })
  },
  onLoad(opt) {
    const { openId, imgBaseUrl } = getApp().data
    let obj = wx.getStorageSync('returnObj')
    console.log("onLoad",obj)
    this.requestUrl = ajax.userURL

    this.setData({
      upLoadImgUrl: ajax.userURL + 'store/kaptcha?pictureId=',
      imgBaseUrl,
      basePhone: obj.userPhone,
      userPhone: obj.userPhone,
      goods: obj.goods,
      returnNum: obj.goods.saleNum,
      returnAmt: obj.goods.subtotalAmt
    })
    console.log('数量',obj.saleNum)
    this.openId = openId
    this.obj = obj
    wx.removeStorageSync('returnObj')
  },
  changeGoodsNum(e) {
    const type = e.currentTarget.dataset.type
    const goods = this.data.goods

    //console.log(this.data.returnNum + 1, this.data.returnNum - 1)
   
    //console.log('1--->',type,this.data.returnNum + 1, this.data.returnNum - 1)

    if (type == "add"&&this.data.returnNum + 1 > this.data.goods.saleNum){return;}

    //console.log('3--->', this.data.returnNum + 1, this.data.returnNum - 1)

    if (type == "minus"&&this.data.returnNum - 1 <= 0) { return; }

    //console.log('2--->',this.data.returnNum + 1, this.data.returnNum - 1)

    if (type == "minus") {
      this.setData({ returnNum: this.data.returnNum - 1})
    } else {
      this.setData({ returnNum: this.data.returnNum + 1 })
    }

    this.setData({ returnAmt: (goods.subtotalAmt/goods.saleNum)*this.data.returnNum})
    
  }
})