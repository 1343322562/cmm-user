import ajax from './config'
export default {
  Public: {
    storeURL: ajax.storeURL,
    getOpenId: (param) => ajax.post(`user/getOpenId`, param), // 获取open
    currentTimeMillis: (param) => ajax.get(`portal/currentTimeMillis`, param), // 获取当前系统时间
    getSubOpenid: (param) => ajax.post(`pay/getSubOpenid`, param), // 获取支付所需要subOpenId
    orderPay: (param) => ajax.post(`pay/orderPay?application`, param), // 获取微信支付配置
    hqOrderPay: (param) => ajax.post(`pay/hqOrderPay?application`, param), // 获取微信支付配置
    hqVerify: (param) => ajax.post(`user/hqVerify`, param), // 获取页面配置
    decodeData: (param) => ajax.post(`user/decodeData`, param), // 解密获取手机号
    mobileCode: (param) => ajax.post(`user/mobileCode`, param), // 获取验证码
    authlogin: (param) => ajax.post(`user/authlogin2`, param), // 授权登录
    login: (param) => ajax.post(`user/login2`, param), // 手机号登录
    colonelApply: (param) => ajax.post(`store/colonelApply?storeUrl`, param), // 团长申请
    sysCodeList: (param) => ajax.post(`user/getDccodeList`, param), //获取合伙人城市
    setCity: (param) => ajax.post(`user/setDccode`, param), //设置城市
    startDeliver: (param) => ajax.post(`portal/startDeliver`, param), //获取起送金额
    postage: (param) => ajax.post(`order/postage`, param), //获取运费范围
    getDcByarea: (param) => ajax.post(`user/getDcByarea`, param), //根据经纬度获取配置中心信息
    getComData: (param) => ajax.post(`user/getComData`, param), //获取配送中心名称
    getProductSearch: (param) => ajax.post(`item/getProductSearch`, param), //搜索热门关键词
    checkOrderdata: (param) => ajax.post(`order/checkOrderdata`, param), //获取商品库存
    getOrderProductStatistics: (param) => ajax.post(`item/getOrderProductStatistics`, param), //获取猜你喜欢
    getColonelFutureInfo: (param) => ajax.get(`user/getColonelFutureInfo`, param), //获取粉丝
    insertColonelInfo: (param) => ajax.post(`user/insertColonelInfo`, param), //提交申请成为团长
    storeinfo: (param) => ajax.post(`portal/storeInfo`, param), //获取自提点是否开团
    storePromotion: (param) => ajax.post(`portal/storePromotion`, param), //获取自提点开团数据
    getDcInfo: (param) => ajax.post(`user/getDcInfo`, param), // 获取是否开启成为团长配置
    getChSupplierList: (param) => ajax.post(`chOrder/supplierListPage`, param), // 获取吃喝玩乐列表
    
  },
  Shop: {
    storeinfo: (param) => ajax.post(`portal/storeinfo2`, param) // 获取门店信息
  },
  Index: {
    itemList: (param) => ajax.post(`portal/itemList`, param), // 获取全部商品
    clsItemList: (param) => ajax.post(`portal/clsItemList`, param), // 通过分类获取商品
    clsList: (param) => ajax.post(`portal/clsList`, param), // 获取分类
    firstGift: (param) => ajax.post(`portal/firstGift`, param), // 获取首赠信息
    getBroadcastList: (param) => ajax.post(`portal/getBroadcastList`, param), // 获取商品购买记录
    getActivity: (param) => ajax.get(`portal/getActivity`, param), // 获取首页banner图
    getActivityDetail: (param) => ajax.post(`portal/getActivityDetail`, param), // 获取首页banner图商品详情
    getLabelNameItemList: (param) => ajax.post(`portal/labelName`, param), //首页获取指定主题商品 CMM
    getMainPush: (param) => ajax.post(`portal/getMainPush`, param), // 获取首页类别品牌活动
    getMainPushDetail: (param) => ajax.post(`portal/getMainPushDetail`, param), // 获取类别品牌详情
    getActivityGoodsList: (param) => ajax.get(`portal/getActivityGoodsList`, param), // 获取活动商品列表
  },
  Express: {
    hqItemList: (param) => ajax.post(`portal/hqItemList`, param) // 获取一件代发商品列表
  },
  Liquidation: {
    validateFirstGiftNum: (param) => ajax.post(`portal/validateFirstGiftNum`, param), // 获取用户是否可以享受首赠
    saveOrder: (param) => ajax.post(`order/saveOrder2`, param), // 下单
    saveHqOrder: (param) => ajax.post(`order/saveHqOrder`, param), // 一件待发商品下单
    saveLiveHqOrder: (param) => ajax.post(`order/saveLiveHqOrder`, param), // 直播一件待发商品下单
    getStoreInfoForOrder: (param) => ajax.post(`order/getStoreInfoForOrder`, param) // 获取配送中心起送价/配送费
  },
  LBS: {
    nearbyStore: (param) => ajax.post(`portal/nearbyStore`, param), // 获取附近自提点
    updateMemberStore: (param) => ajax.post(`portal/updateMemberStore`, param), // 修改用户当前默认自提点
    getPartnerCity: (param) => ajax.post(`portal/getPartnerCity`, param), // 获取城市合伙人城市
    allStoreHistory: (param) => ajax.post(`portal/allStoreHistory`, param) // 获取历史提货点
  },
  Addreess: {
    addMemberAddress: (param) => ajax.post(`user/addMemberAddress`, param), // 添加用户收货地址
    deleteMemberAddress: (param) => ajax.post(`user/deleteMemberAddress`, param), // 删除用户收货地址
    updateMemberAddress: (param) => ajax.post(`user/updateMemberAddress`, param), // 修改用户收货地址
    memberAddress: (param) => ajax.post(`user/memberAddressList`, param), // 获取用户收货地址
    memberAddrToleration: (param) => ajax.post(`user/memberAddrToleration`, param), // 获取用户默认收货地址
    updateByToleration: (param) => ajax.post(`user/updateByToleration`, param), // 修改用户默认收货地址
    getNearStoreBySyscode: (param) => ajax.post(`user/getNearStoreBySyscode`, param), // 获取合伙人所有配送点范围
    checkUserAddress: (param) => ajax.post(`user/checkUserAddress`, param) // 判断当前位置是否在配送范围内
  },
  Goods: {
    itemDetail: (param) => ajax.post(`item/itemDetail`, param), // 获取商品详情
    hqItemDetail: (param) => ajax.post(`item/hqItemDetail`, param), // 获取一件代发商品详情
    buyList: (param) => ajax.post(`item/buyList`, param), // 获取商品购买记录
    buyHqList: (param) => ajax.post(`item/buyHqList`, param), // 获取一件代发商品购买记录
    recommendItemList: (param) => ajax.post(`portal/recommendItemList`, param), // 获取推荐商品列表
    getShoppingFlow: (param) => ajax.post(`portal/getShoppingFlow`, param), // 获取购买流程
    itemListPager: (param) => ajax.post(`item/itemListPager`, param), // 获取商品列表 CMM
  },
  Orders: {
    orderList: (param) => ajax.post(`order/orderList`, param), // 获取订单列表
    orderListByPageNo: (param) => ajax.post(`order/orderListByPageNo`, param), // 获取订单列表
    orderDetailShare: (param) => ajax.post(`order/orderDetailShare`, param), // 获取分享订单详情
    orderDetail: (param) => ajax.post(`order/orderDetail`, param), // 获取订单详情
    hqOrderListByPageNo: (param) => ajax.post(`order/hqOrderListByPageNo`, param), // 获取一件代发订单列表
    hqOrderDetail: (param) => ajax.post(`order/hqOrderDetail`, param), // 一件代发订单详情
    confirmReceiptAll: (param) => ajax.post(`order/confirmReceiptAll`, param), // 一件代发订单全部收货
    confirmReceipt: (param) => ajax.post(`order/confirmReceipt`, param), // 一件代发订单商品收货
    getOrderNum: (param) => ajax.get(`order/getOrderNum`, param), // 获取待提货数量
    shareHqOrder: (param) => ajax.post(`order/shareOrder`, param), // 一件代发订单分享详情
    submitHqOrderAfter: (param) => ajax.post(`order/submitOrderAfter`, param), // 申请售后
    getHqOrderAfter: (param) => ajax.post(`order/getOrderAfter`, param), // 售后订单列表
    getHqOrderAfterDetail: (param) => ajax.post(`order/getOrderAfterDetail`, param), // 售后订单详情
    getHqOrderCourier: (param) => ajax.post(`order/geOrderCourier`, param), // 获取物流详情
    getCanReturnOrderInfo: (param) => ajax.post(`/order/getCanReturnOrderInfo`, param), //查看可退货的订单
    saveReturnOrder: (param) => ajax.post(`/order/saveReturnOrder`, param), //申请退货单
    getReturnOrderList: (param) => ajax.post(`/order/getReturnOrderList`, param), //退货单列表
    storeinfo: (param) => ajax.post(`order/storeinfo`, param), // 获取自提点信息
    getLogistics: (param) => ajax.get(`order/getLogistics`, param), // 获取物流全部状态
    /* 自提点: */
    setUserStoreById: (param) => ajax.get(`order/setUserStoreById`, param),       // 设置当前订单用户自提点关联
    getUserStoreList: (param) => ajax.get(`order/getUserStoreList`, param),       // 获取当前订单用户已有自提点列表
    getStoreList: (param) => ajax.get(`order/getStoreList`, param),               // 获取当前订单(5公里内)自提点列表
    deleteUserStoreById: (param) => ajax.get(`order/deleteUserStoreById`, param)  // 删除用户与自提点关联
  },
  WishList: {
    addWish: (param) => ajax.post(`order/addWish`, param), // 商品加入心愿单
    remove: (param) => ajax.post(`order/remove`, param), // 商品从心愿单移除
    getWish: (param) => ajax.get(`order/getWish`, param), // 获取心愿单列表
  },
  Coupons: {
    findGrantCouponByRelationIdAndUserId: (param) => ajax.post(`order/findGrantCouponByRelationIdAndUserId`, param), // 获取领取页优惠券信息
    findGrantCouponByUserId: (param) => ajax.post(`order/findGrantCouponByUserId`, param), // 获取领取页优惠券信息
    sendCouponByRelationIdAndUserId: (param) => ajax.post(`order/sendCouponByRelationIdAndUserId`, param), // 领取优惠券
    userCoupon: (param) => ajax.post(`order/getCouponInfo`, param), // 用户优惠券列表
    getEffectiveCouponInfo: (param) => ajax.post(`order/getEffectiveCouponInfo`, param), // 用户优惠券列表new
    getCouponInfo: (param) => ajax.get(`order/getCouponInfo`, param), // 获取优惠卷信息
    updateCounponInfoRecord: (param) => ajax.get(`order/updateCounponInfoRecord`, param), // 修改优惠
    getPersonCouponInfo: (param) => ajax.post(`order/getPersonCouponInfo`, param), // 获取新人优惠券信息
    getColonePersonCouponInfo: (param) => ajax.post(`order/getColonePersonCouponInfo`, param), // 获取新团长优惠券信息
    getColonePersonCouponInfoFlag: (param) => ajax.post(`order/getColonePersonCouponInfoFlag`, param), // 判断新团是否领取新团优惠券
  },
  Member: {
    getVipSetMeal: (param) => ajax.get(`portal/getVipSetMeal`, param), // 获取套餐列表
    getUserVipSetMeal: (param) => ajax.get(`user/getUserVipSetMeal`, param), // 获取用户会员信息
    saveOrder: (param) => ajax.post(`order/saveVipSetMeal`, param), // 套餐下单
    vipItemList: (param) => ajax.post(`portal/vipItemList`, param), // 获取会员商品
  },
  TV: {
    getScreening: (param) => ajax.post(`portal/getScreening`, param), // 获取当前直播场次信息
    getScreeningDetail: (param) => ajax.post(`portal/getScreeningDetail`, param), // 获取当前直播场次信息详情
    getScreeningItem: (param) => ajax.post(`portal/getScreeningItem`, param), // 获取当前直播推荐商品列表信息
    getScreeningMainItem: (param) => ajax.post(`portal/getScreeningMainItem`, param), // 获取直播当前主推商品
    intoScreening: (param) => ajax.post(`portal/intoScreening`, param), // 新增观看直播人数
    accHeartTimes: (param) => ajax.post(`portal/accHeartTimes`, param), // 新增/获取点赞数量
    getScreeningHqItem: (param) => ajax.post(`portal/getScreeningHqItem`, param), // 获取一件代发商品列表
    getScreeningMainHqItem: (param) => ajax.post(`portal/getScreeningMainHqItem`, param), // 获取一件代发商品列表
  },
  Seckill: {
    getPromotionData: (param) => ajax.post(`order/getPromotionData`, param), // 获取秒杀接口
  },
  Play: {
    itemListPage: (param) => ajax.post(`chOrder/itemListPage`, param), //获取商品列表
    itemDetail: (param) => ajax.post(`chOrder/itemDetail`, param), //获取商品详情
    getChSupplier: (param) => ajax.post(`chOrder/getChSupplier`, param), //获取店铺信息
    saveOrder2: (param) => ajax.post(`chOrder/saveOrder2`, param), //下单
    checkOrderdata: (param) => ajax.post(`chOrder/checkOrderdata`, param), //验证库存
    orderListByPageNo: (param) => ajax.post(`chOrder/orderListByPageNo`, param), //查询订单列表
    orderDetail: (param) => ajax.post(`chOrder/orderDetail`, param), //查询订单详情
    chOrderPay: (param) => ajax.post(`pay/chOrderPay`, param), //吃喝玩乐支付
    saveReturnOrder: (param) => ajax.post(`chOrder/saveReturnOrder`, param), //退款
  }
}
