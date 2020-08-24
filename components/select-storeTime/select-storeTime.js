// components/select-storeTime/select-storeTime.js
const date = new Date()
const years = []
const months = []
const days = []
const hours = []

// 从 2020 年开始
for (let i = 2020; i <= date.getFullYear(); i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  if (i < 10) {
    i = '0' + i
  } 
  months.push(i)
}

for (let i = 1; i <= 31; i++) {
  if (i < 10) {
    i = '0' + i
  } 
  days.push(i)
}

for (let i = 1; i <= 24; i++) {
  if (i < 10) {
    i = '0' + i
  } 
  hours.push(i)
}
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    years,
    year: date.getFullYear(),
    months,
    month: 2,
    days,
    day: 2,
    hours,
    value: [0, 2, 2, 0]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 绑定级联框
    bindChange(e) {
      let value = e.detail.value
      this.setData({ value })
    },
    showStoreTime() {
      this.setData({ selected: true })
    },
    // 关闭时间选择框
    close () {
      this.setData({
        selected: !this.data.selected
      })
    },
  }
})
