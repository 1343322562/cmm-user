import API from '../../api/index.js'
import { showLoading, hideLoading, toast,alert} from '../../tool/index.js'
Page({
  data: {
    typeList: ['不开发票','个人','增值税普通发票'],
    selectIndex:0,
    openType:'',
    taxpayer:'', // 纳税人姓名
    taxNumber: '', // 税务登记人号码
    id:'' // 发票id
  },
  selected (e) {
    const selectIndex = e.currentTarget.dataset.index
    this.setData({ selectIndex})
  },
  getValue (e) {
    const type = e.currentTarget.dataset.type
    let obj = {}
    obj[type] = e.detail.value.trim()
    this.setData(obj)
  },
  save () {
    const { taxpayer='', taxNumber='', selectIndex, openType,id} = this.data
    const { branchNo, username, token, platform} = this.userObj
    if (!taxpayer || (selectIndex == 2 && !taxNumber)) {
      toast(!taxpayer?'请填写纳税人姓名':'请填写税务登人号码')
      return
    }
    let url = ''
    let request = { taxpayer, taxNumber, branchNo, username, token, platform}
    if (id) {
      url = 'updateInvoiceHead'
      request.id = id
    } else  {
      url = 'addInvoiceHead'
    }
    showLoading('请稍后...')
    API.Public[url]({
      data: request,
      success: res => {
        if (res.code == 0) {
          alert('保存成功',{
            success: ()=> {
              wx.setStorageSync('invoiceSelectedIndex', selectIndex)
              wx.navigateBack()

            }
          })
        } else  {
          alert(res.msg)
        }
      },
      error: () => {
        alert('保存发票信息失败，请检查网络是否正常')
      },
      complete: () => {
        hideLoading()
      }
    })
  },
  getPageData () {
    const { branchNo, username, token, platform} = this.userObj
    showLoading('请稍后...')
    API.Public.selectInvoiceHead({
      data: { branchNo, username, token,platform},
      success: res => {
        const data = res.data
        if (res.code == 0 && data && data.length) {
          const { taxpayer, taxNumber, id} = data[0]
          this.setData({ taxpayer, taxNumber, id })
        }
      },
      complete: () => {
        hideLoading()
      }
    })
  },
  onLoad (opt) {
    this.setData({ openType: opt.openType || '', selectIndex: opt.ticketType||0})
    this.userObj = wx.getStorageSync('userObj')
    this.getPageData()
  },
})