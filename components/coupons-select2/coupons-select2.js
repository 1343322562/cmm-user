
Component({
  properties: {
    show: {
      type: Boolean,
      observer(newVal, oldVal) {
        this.setData({ bottom: newVal ? '0rpx' : '-950rpx' })
      }
    },
    list: Array,
    noUselist: Array,
    nowSelected: Object
  },
  data: {
    bottom: '-950rpx',
    queryType:'canUse',
    selected:{},
    titleList:[
      { name: '可用优惠卷', type:'canUse'},
      { name: '不可用优惠卷', type: 'noUse' }
    ]
  },
  methods: {
    open(e) {
      const id = e.currentTarget.dataset.id;
      let selected = this.data.selected
      selected[id] = !selected[id]
      this.setData({ selected })
    },
    selected(e) {
      const { nowSelected, list } = this.data
      if (type&&nowSelected.id == list[type].id )return
      const type = e.currentTarget.dataset.type
      this.triggerEvent('change', {
        coupons: type == 'null' ? '' : list[type]
      })
      this.hideCouponsAlert()
    },
    hideCouponsAlert() {
      this.setData({ bottom: '-950rpx' })
      setTimeout(() => {
        this.triggerEvent('hideCoupons')
      }, 300)
    },
    queryCoupons(e){
      const type = e.currentTarget.dataset.type
      this.setData({ queryType: type})
    }
  }
})
