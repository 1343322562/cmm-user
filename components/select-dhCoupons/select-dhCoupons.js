Component({
  properties: {
    show: Boolean,
    list: Array,
    now: {
      type: Object,
      observer(newVal, oldVal) {
        this.setData({ selectObj: newVal})
      }
    }
  },
  data: {
    selectObj: {}
  },
  methods: {
    changeNum (e) {
      const { info, type } = e.currentTarget.dataset
      const [index,itemNo] = info.split(',')
      let { selectObj, list} = this.data
      const num = selectObj[itemNo] ? selectObj[itemNo].num : 0
      if (type == 'add' && list[index].couponsQnty <= num) {
        wx.showToast({
          title: '已达到最大兑换数量',
          icon:'none'
        })
        return
      }
      if (num==1 && type =='minus') {
        delete selectObj[itemNo]
        selectObj.keyArr = selectObj.keyArr.filter(i => i !== itemNo)
        selectObj.num --
      } else {
        num || selectObj.keyArr.push(itemNo)
        selectObj[itemNo] = { num: num + (type == 'add' ? 1 : -1), index: index}
        selectObj.num = selectObj.num - num + selectObj[itemNo].num
      }
      this.setData({ selectObj })
    },
    cancel() {
      this.triggerEvent('selectDhCoupons', { keyArr:[],num:0})
    },
    confirm() {
      const selectObj = this.data.selectObj
      this.triggerEvent('selectDhCoupons', selectObj)
    }
  }
})
