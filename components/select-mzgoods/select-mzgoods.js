Component({
  properties: {
    show: Boolean,
    list: Array,
    now: Object
  },
  data: {
    numStr: ['一','二','三','四','五','六','七','八','九','十']
  },
  methods: {
    selected(e) {
      let now = this.data.now || {}
      const { index,no } = e.currentTarget.dataset
      if (now[no] === index){
        delete now[no]
      } else {
        now[no] = index
      }
      this.setData({ now })
    },
    cancel () {
      this.triggerEvent('selectGift', {})
    },
    confirm () {
      const now = this.data.now || {}
      if (Object.keys(now).length) {
        this.triggerEvent('selectGift', now)
      } else {
        wx.showToast({ title: '请选择赠品', icon:'none'})
      }
    }
  }
})
