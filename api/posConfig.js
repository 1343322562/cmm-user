export default {
  storeURL: 'http://192.168.2.17:8081/pc-api/',
  userURL: 'http://192.168.2.17:8081/pc-api/',
  post (url, param) {
    this.ajax('post', url, param)
  },
  get (url, param) {
    this.ajax('get', url, param)
  },
  ajax(type, url, param) {
    new Promise()
    let request = {
      url: this.storeURL + url,
      method: type,
      header: {
        'content-type':  'application/x-www-form-urlencoded'
      },
      dataType: 'json',
      data: param.data,
      success: (response) => {
        param.success(response)
      },
      error: err => param.error(err),
      complete: res => param.complete(res)
    }
    wx.request(request)
  }
}
