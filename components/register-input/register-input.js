Component({
  options: {
    multipleSlots: true // 启用多插槽
  },
  properties: {
    formTitle: {
      type: String,
      value: "默认标题"
      // observer: function(newValue, oldValue){
      //   console.log(newValue, oldValue)
      // }
    },
    inputTitle1: {
      type: String,
      value: "默认标题"
    },
    inputTitle2: {
      type: String,
      value: "默认标题"
    },
    inputTitle3: {
      type: String,
      value: "默认标题"
    },
    isShowInput1: {
      type: Boolean,
      value: true
    },
    isShowInput3: { // 默认没有这个 input 框
      type: Boolean,
      value: false
    }
  }
})
