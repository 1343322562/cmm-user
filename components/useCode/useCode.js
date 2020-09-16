
import QRCode from '../../tool/weapp-qrcode.js'
import { rpxToPx } from '../../tool/index.js'
Component({
  properties: {
    show:Boolean,
    code: {
      type: String,
      observer(newVal, oldVal) {
        // if (newVal && this.qrcode) {
        //   this.qrcode.makeCode(newVal)
        // }
      }
    }
  },
  data: {
    wh:0,
    codeList:[],
    checkedVlue:'',
    name:''
  },
  methods: {
    hideAlert () {
      this.triggerEvent('hideCode')
    },
    getCode (order) {
      let codeList = []
      order.chOrderDetails.forEach(item => {
        if (item.returnFlag != '1' && item.signForStatus!='1') {
        codeList.push(item.receiveCodeNo)
        }
      })
      const checkedVlue = codeList[0]
      this.setData({ codeList, checkedVlue, name: order.chOrderDetails[0].itemName })
      this.qrcode.makeCode(checkedVlue)
    },
    radioChange (e) {
      const checkedVlue = e.detail.value
      this.setData({ checkedVlue})
      this.qrcode.makeCode(checkedVlue)
    }
  },
  attached () {
    const wh = rpxToPx(400)
    this.setData({ wh: wh })
    this.qrcode = new QRCode('canvas', {
      text: '',
      width: wh,
      usingIn:this,
      height: wh,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    })
    
  }
})
