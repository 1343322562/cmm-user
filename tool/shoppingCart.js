class ShoppingCartGoods {

  getGoodsListBuy(){
    let data = wx.getStorageSync('ShoppingCartGoodsList')
    if(!data){data={};}
    for (let index in data) {
      if(data[index].cancelSelected){
        delete data[index]
      }
    }
    //删除空的
    for (let index in data) {
      if (!data[index].itemId) {
        delete data[index]
      }
    }
    return data;
  }

  getGoodsList() {
    let data = wx.getStorageSync('ShoppingCartGoodsList')
    if (!data) { data = {}; }
    //删除空的
    for (let index in data) {
      if (!data[index].itemId) {
        delete data[index]
      }
    }
    return data;
  }

  clearGoods() {
    let data = {};
    wx.removeStorageSync('ShoppingCartGoodsList', data);
    this.setCartCount();
  }

  addGoods(goods, success){
    wx.vibrateShort()
    // 首次加购时 选中商品
    if (typeof goods['cancelSelected'] != 'boolean') {
      goods['cancelSelected'] = false
    }
    const startQty = parseInt(goods.startQty) || 1
    const startSpec = parseInt(goods.startSpec) || 1
    const itemId = goods.itemId
    const seckillGoods = (wx.getStorageSync('allSeckillGoods') || {})[itemId]
    const maxSupplyQty = parseInt(goods.maxSupplyQty)||0
    const maxPersonQty = parseInt(goods.maxPersonQty) || 999
    const maxOrderQty = parseInt(goods.maxOrderQty) || 999
    const maxQty = maxPersonQty > maxOrderQty ? maxOrderQty : maxPersonQty

    let data = this.getGoodsList();
    
    if (maxSupplyQty) {
      const num = (data[itemId] ? (data[itemId].num + startSpec) : startQty)
      if (num > maxSupplyQty) {
        wx.showToast({
          title: ('购买数量不能大于库存数量【' + maxSupplyQty + "个】"),
          icon: 'none',
          duration: 2000
        })
        success = null
      } else if (num>maxQty){
        wx.showToast({
          title: ('限购数量【' + maxQty + "个】"),
          icon: 'none',
          duration: 2000
        })
        success = null
      } else {
        goods.num = num;
        data[itemId] = goods;
        if (seckillGoods && success !== 0 && data[itemId].num > seckillGoods.maxNum && (data[itemId].num - seckillGoods.maxNum <= startSpec)) { // 秒杀商品
          wx.showToast({
            title: "限购数量[" + seckillGoods.maxNum + "]" + goods.itemUnit+",超出限购数量的部分将恢复原价",
            icon: 'none',
            duration: 3500
          })
        }
      }
    } else {
      wx.showToast({
        title: ("库存不足"),
        icon: 'none',
        duration: 2000
      })
      success=null
    }
    console.log(86, data)
    
    // 加购购物车时定义 cancelSelected
    wx.setStorageSync('ShoppingCartGoodsList', data);
    success && success()
    this.setCartCount()
    return this.getGoodsList();
  }

  minusGoods(goods,minusNum) {
    const startQty = parseInt(goods.startQty) || 1
    const startSpec = parseInt(goods.startSpec) || 1
    let data = this.getGoodsList();
    if (data[goods.itemId]) {
      const num = data[goods.itemId].num
      data[goods.itemId].num = num - (minusNum || (num == startQty ? startQty : startSpec));
      if (data[goods.itemId].num<=0){
        delete data[goods.itemId];
      }
    }
    wx.setStorageSync('ShoppingCartGoodsList', data);
    this.setCartCount()
    return this.getGoodsList();
  }

  delGoods(itemId) {
    let data = this.getGoodsList();
    if (data[itemId]) {
        delete data[itemId];
    }

    wx.setStorageSync('ShoppingCartGoodsList', data);
    this.setCartCount()
    return this.getGoodsList();
  }

  cancelSelected(itemId) 
  {
    let data = this.getGoodsList();
    if (data[itemId]) {
      const is = !data[itemId].cancelSelected
      data[itemId].cancelSelected = is
    }
    wx.setStorageSync('ShoppingCartGoodsList', data);
    return this.getGoodsList();
  }

  cancelSelectedAll(isSelect) {
    let data = this.getGoodsList();
    for (let index in data) {
      data[index].cancelSelected = !isSelect;
    }
    wx.setStorageSync('ShoppingCartGoodsList', data);
    return this.getGoodsList();
  }

  getGoodsCount(){
    let count=0;
    let list = this.getGoodsList();
    for (let index in list) {
      if (!list[index].num){
        list[index].num=0
      }
      count += list[index].num
      list[index].saleNum = list[index].num
    }
    return count
  }

  getGoodsCountBuy() {
    let count = 0;
    let list = this.getGoodsListBuy();
    for (let index in list) {
      count += list[index].num;
      list[index].saleNum = list[index].num;
    }
    return count;
  }

  setCartCount() {
    let count=this.getGoodsCount()
    if(count&&count>0){
      wx.setTabBarBadge({
        index: 2,
        text: this.getGoodsCount() + '',
      });
    }else{
      wx.removeTabBarBadge({ index: 2})
    }
  }

  getCartsMoney() {
    let total = 0;
    let list = this.getGoodsList();
    for (let index in list) {
      total += list[index].num * list[index].itemNowPrice;
      
    }
    return this.convertMoney(total);
  }
  getCartsMoneyBuy() {
    let total = 0;
    let list = this.getGoodsListBuy();
    for (let index in list) {
      total += list[index].num * list[index].itemNowPrice;

    }
    return this.convertMoney(total);
  }

  getPayAmt() {
    let total = 0;
    let list = this.getGoodsList();
    for (let index in list) {
      total += list[index].num * list[index].itemNowPrice;
    }
   
    return this.convertMoney(total);
  }
  getPayAmtBuy() {
    let total = 0;
    let list = this.getGoodsListBuy();
    for (let index in list) {
      total += list[index].num * list[index].itemNowPrice;
    }

    return this.convertMoney(total);
  }
  getGoodsListId() {
    let Ids = [];
    let list = this.getGoodsList();
    for (let index in list) {
      Ids.push(list[index].itemId+"");
    }
    return Ids;
  }

  getGoodsListIdBuy() {
    let Ids = [];
    let data = this.getGoodsList();
    for (let index in data) {
      if (!data[index].cancelSelected) {
        Ids.push(data[index].itemId + "");
      }
      
    }
    return Ids;
  }

  convertGoodsList(list){
    let data={};
    for (let index in list) {
      let itemId = list[index].itemId;
      list[index].itemHomePic = list[index].itemIndexPic
      //console.log(list[index])
      data[itemId] = list[index];
    }
    return data;
  }

  convertMoney(moeny) {
    // return Math.floor(moeny * 100) / 100
    return Number(moeny.toFixed(2))
  }

  convertGoodsList2(list) {
    let data = [];
    for (var itemId in list) {
      //list[itemId].id = "";
      delete list[itemId].id;
      list[itemId].saleNum = list[itemId].num;
      list[itemId].subtotalAmt = list[itemId].num * list[itemId].itemNowPrice; 
      list[itemId].receiveDate = "";  
      list[itemId].totalNum = list[itemId].saleNum ; 
      list[itemId].totalAmt = list[itemId].subtotalAmt; 
      //list[itemId].itemPrePrice = list[itemId].itemDisPrice; 
      data.push(list[itemId]);
      
    }
    return data;
  }
  

}

export {
  ShoppingCartGoods
}