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
  attached() {
    let list = this.data.list
    list.forEach(item => {
      item.num = 0
    })
    this.data.list = list
    console.log('list', list)
  },

  methods: {
    changeNum (e) {
      console.log(JSON.parse(JSON.stringify(this.data.list)))
      console.log(e)
      const { info, type } = e.currentTarget.dataset
      const [index,itemNo] = info.split(',')
      let { selectObj, list} = this.data
      console.log(selectObj, index, itemNo)
      const num = selectObj[itemNo] ? selectObj[itemNo].num : 0
      if (type == 'add' && list[index].couponsQnty <= list[index].num) {
        wx.showToast({
          title: '已达到最大兑换数量',
          icon:'none'
        })
        return
      }
      if (num==1 && type =='minus') {
        delete selectObj[itemNo]
        selectObj.keyArr = selectObj.keyArr.filter(i => i !== itemNo)
        list[index].num -= 1 
        selectObj.num --
      } else {
        num || selectObj.keyArr.push(itemNo)
        selectObj[itemNo] = { num: num + (type == 'add' ? 1 : -1), index: index}
        list[index].num += 1
        selectObj.num = selectObj.num - num + selectObj[itemNo].num
      }
      this.setData({ selectObj, list })
    },
    cancel() {
      this.triggerEvent('selectDhCoupons', { keyArr:[],num:0})
    },
    confirm() {
      const { selectObj, list } = this.data
      selectObj.list = list
      
      this.triggerEvent('selectDhCoupons', selectObj)
    }
  }
})
