import API from '../../api/index.js'
import { toast, alert,showLoading,hideLoading} from '../../tool/index.js'
Page({
  data: {
    starList:[0,0,0,0,0],
    typeList: [],
    obj: {},
    selectIndex: 0,
    typeSelected: {},
    remark:''
  },
  typeSelect (e) {
    const index = e.currentTarget.dataset.index
    const typeSelected = this.data.typeSelected
    typeSelected[index] ? (delete typeSelected[index]) : (typeSelected[index] = true)
    this.setData({ typeSelected })
  },
  selected (e) {
    const selectIndex = e.currentTarget.dataset.index + 1
    this.setData({ selectIndex })
  },
  getToEvaluateInformation () {
    const { branchNo, dbBranchNo: dbranchNo, platform, token, username } = this.userObj
    showLoading('获取司机信息..')
    API.Orders.getToEvaluateInformation({
      data: { branchNo, dbranchNo, platform, token, username, routeSendMan: this.routeSendMan, sheetNo: this.sheetNo},
      success: res => {
        hideLoading()
        const data = res.data
        if (res.code == 0 && data) {
          const typeList = data.evaluationTemplate || []
          const obj = data.distribution
          this.setData({ typeList, obj})
        } else {
          this.errorMsg(res.msg)
        }
      },
      error: () => {
        hideLoading()
        this.errorMsg('获取司机信息失败!')
      }
    })
  },
  submitGrade () {
    const { branchNo, dbBranchNo: dbranchNo, platform, token, username } = this.userObj
    const { selectIndex, typeSelected, remark, typeList} = this.data
    if (!selectIndex) {
      toast('请给配送员评价几星服务')
      return
    }
    showLoading('提交评价..')
    let evaluationLanguage = []
    Object.keys(typeSelected).forEach(index => {
      evaluationLanguage.push(typeList[index].template_describe)
    })
    remark && evaluationLanguage.push(remark)
    evaluationLanguage = evaluationLanguage.join(',')
    const starNum = selectIndex
    API.Orders.saveEvaluation({
      data: { branchNo, dbranchNo, platform, token, username, routeSendMan: this.routeSendMan, sheetNo: this.sheetNo, evaluationLanguage, starNum},
      success: res => {
        hideLoading()
        if (res.code == 0) {
          alert('提交成功',{
            success: ()=> {
              wx.setStorageSync('updateOrderDetails', true)
              wx.navigateBack()
            }
          })
        } else {
          alert(res.msg)
        }
      },
      error: () => {
        hideLoading()
        alert('提交评价失败，请查看网络是否正常!')
      }
    })
  },
  getContent (e) {
    const remark = e.detail.value.trim()
    this.setData({ remark })
  },
  errorMsg (msg) {
    alert(msg,{
      success: res=> {
        wx.navigateBack()
      }
    })
  },
  onLoad (opt) {
    this.userObj = wx.getStorageSync('userObj')
    this.routeSendMan = opt.routeSendMan
    this.sheetNo = opt.sheetNo
    this.getToEvaluateInformation()
  },
  onReady () {
  },
  onShow () {
  }
})