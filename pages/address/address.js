import commit from '../../store/mutations.js'
import * as types from '../../store/types.js'
import API from '../../api/index.js'
import { alert, toast, showLoading, hideLoading, setFilterDataSize, goPage } from '../../tool/index.js'
import api from '../../api/index.js'
const app = getApp()
Page({
  data: {
    loading: false,
    list: [],
    switchTransWay: 0 // 取货方式 0：送到家 1：自提
  },
  selectedStoreAddrClick(e) { // 选择当前的自提点作为收货地址（并非默认）
    alert('切换当前自提点?', {
      title: '温馨提示',
      showCancel: true,
      confirmText: '切换',
      confirmColor: '#f49b1e',
      success: res => {
        if (res.confirm) {
          const index = e.currentTarget.dataset.index 
          const { list } = this.data
          const selectAddr = list[index]
          console.log(selectAddr)
          wx.setStorage({ data: selectAddr, key: 'currentStoreAddr' })
          wx.setStorage({ data: selectAddr.openStore, key: 'currentStoreMode' })
          wx.navigateBack({ delta: 1 })
        }
      }
    })
  },
  addAddr() {
    goPage('addAddress', { openType: 'add', length: this.data.list.length, operateType: this.openType })
  },
  selected(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.list[index]
    if ( item.orderFlag == '0') return
    if (this.openType == 'carts' || this.openType == 'liquidation') {
      alert('切换当前收货地址?', {
        title: '温馨提示',
        showCancel: true,
        confirmText: '切换',
        confirmColor: '#f49b1e',
        success: res => {
          if (res.confirm) {
            
            commit[types.SAVE_RECEIVING_ADDRESS](item)
            wx.navigateBack({ data: 1 })
          }
        }
      })

    }
  },
  setDefault(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.list[index]
    const is = item.toleration
    const id = item.id
    if (is == '1' || item.orderFlag == '0') return
    showLoading()
    API.Addreess.updateByToleration({
      data: {
        openid: this.openId,
        dcId: this.dcId,
        sysCode: this.sysCode,
        id: id
      },
      success: obj => {
        hideLoading()
        if (obj.status === 200) {
          toast('修改成功')
          let list = this.data.list
          list = list.filter(item => {
            item.toleration = (item.id === id ? '1' : '0')
            return true
          })
          this.setData({ list })
          commit[types.SAVE_RECEIVING_ADDRESS](item)
        } else {
          alert(obj.msg)
        }
      },
      error: () => {
        hideLoading()
        toast('设置默认地址失败')
      }
    })
  },
  editAddr(e) {
    const index = e.currentTarget.dataset.index
    goPage('addAddress', { openType: 'edit', data: setFilterDataSize(this.data.list[index]) })
  },
  deleteAddr(e) {
    const index = e.currentTarget.dataset.index
    let list = this.data.list
    const id = list[index].id
    alert('您确定要删除当前收货地址吗？', {
      showCancel: true,
      confirmColor: '#FF5800',
      success: (res) => {
        if (res.confirm) {
          showLoading()
          API.Addreess.deleteMemberAddress({
            data: {
              id: id,
              dcId: this.dcId,
              sysCode: this.sysCode
            },
            success: obj => {
              hideLoading()
              if (obj.status === 200) {
                toast('删除成功')
                if (list.length == 1 || String(list[index].toleration) == '1') {
                  commit[types.SAVE_RECEIVING_ADDRESS](null)
                }
                this.setData({ list: list.filter(i => i.id !== id) })
              } else {
                alert(obj.msg)
              }
            },
            error: () => {
              hideLoading()
              toast('删除失败')
            }
          })
        }
      }
    })
  },
  getPageData() {
    showLoading()
    API.Addreess.memberAddress({
      data: {
        openid: this.openId,
        dcId:this.dcId,
        sysCode: this.sysCode
      },
      success: obj => {
        console.log(obj)
        if (obj.status === 200) {
          let list = obj.data || []
          this.setData({ list })
        } else {
          alert(obj.msg)
        }

      },
      complete: () => {
        hideLoading()
        this.setData({ loading: true })
      }
    })
  },
  // 跳转自提页面
  addSelfAddr () {
    const list = this.data.list
    let ud_id = []        // 自提点 id store_id
    list.forEach(item => {
      ud_id.push(item.storeId)
    })
    goPage('addSelfAddress', { addrLength: list.length, ud_id })
  },
  // 获取当前用户自提点列表
  getUserStoreList() {
    showLoading()
    const { userId } = app.data
    const { sysCode } = app.data
    const _this = this
    API.Orders.getUserStoreList({
      data: { sysCode, userId },
      success(res) {
        console.log('获取自提点列表', res)
        if (res.status != 200) return alert(res.msg)
        console.log(res, {sysCode, userId})
        let list = res.data
        _this.setData({ list , switchTransWay: 1})
        if(list.length == 0) {
          wx.setStorageSync('currentStoreAddr', {})
          wx.setStorageSync('currentStoreMode', 0)
        }
        setTimeout(() => console.log(_this.data.switchTransWay))
      },
      complete() { hideLoading() }
    })
  },
  // 删除自提点关联
  deleteStoreAddr(e) {
    const _this = this
    alert('确认删除？', {
      showCancel: true,
      success(res) {
        if(res.confirm) {
          const index = e.currentTarget.dataset.index
          const storeId = e.currentTarget.dataset.storeid
          const currentStoreAddr = wx.getStorageSync('currentStoreAddr')
          console.log(currentStoreAddr,currentStoreAddr.storeId, storeId)
          const { userId } = app.data
          const { sysCode } = app.data
          API.Orders.deleteUserStoreById({
            data: { sysCode, userId, storeId },
            success(res) {
              toast(res.data)
              console.log(currentStoreAddr, storeId)
              if(res.status != 200) return 
              if(currentStoreAddr.storeId == storeId || currentStoreAddr.id == storeId) {
                wx.removeStorageSync('currentStoreAddr')
                app.data.storeInfo = {}
              }
              _this.getUserStoreList()
              toast('删除成功')
            }
          })
        }
      }
    })
    
  },
  // 设置默认自提点
  setStoreDefault(e) {
    console.log('e', e)
    const index = e.currentTarget.dataset.index
    const storeId = e.currentTarget.dataset.storeid
    const list = this.data.list
    if (list[index].toleration == 1) return toast('请勿重复设置') 
    const _this = this
    console.log(app)
    const { dcId, userId } = app.data
    const { sysCode } = app.data
    API.Orders.setUserStoreById({
      data: { sysCode, userId, storeId ,toleration: 1},
      success(res) {
        console.log(storeId)
        toast(res.data)
        console.log(res) 
        if (res.status != 200) return toast('设置失败')
        
        list.forEach(item => {
          item.toleration = 0
        })
        list[index].toleration = 1
        wx.setStorage({ data: list[index], key: 'currentStoreAddr' })
        wx.setStorage({ data: list[index].openStore, key: 'currentStoreMode' })
        wx.setStorage({ data: 1, key: 'switchTransWay' })
        app.data.storeInfo = list[index]
        _this.setData({ list })
      }
    })
  },

  onLoad(opt) {
    console.log(app.data)
    const switchTransWay = opt.openType || 0
    console.log(opt)
    // 管理自提点
    if (switchTransWay == 1) {
      this.setData({ switchTransWay }) 
      wx.setNavigationBarTitle({ title: '管理自提点' })
      return
    }


    // 送到家
    this.openId = getApp().data.openid
    this.dcId = getApp().data.dcId
    this.sysCode = getApp().data.sysCode
    wx.removeStorage({ key: 'refreshAddress' })
    this.getPageData()
    this.openType = opt.openType
  },
  onReady() {
  },
  onShow() {
    // 自提点
    if (this.data.switchTransWay == 1) {
      this.getUserStoreList()
      return
    }


    if (this.data.loading && wx.getStorageSync('refreshAddress')) {
      this.setData({ loading: false })
      wx.removeStorage({ key: 'refreshAddress' })
      toast('保存成功')
      this.getPageData()
    }
  },
  onHide() {
  },
  onUnload() {
  }
})