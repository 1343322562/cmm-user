Component({
  properties: {
    show: Boolean,
    list: Array,
    now: Object
  },
  data: {},
  methods: {
    selected (e) {
      const index = e.currentTarget.dataset.index
      const cup = index!='no'?this.data.list[index]:index
      this.triggerEvent('selectCoupons', cup)
    }
  }
})
