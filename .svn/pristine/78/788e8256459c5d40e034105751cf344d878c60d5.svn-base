/**
 * Date日期格式化  
 * @param {*}  date 需要格式化的Date对象
 * @param {*}  fmt  格式化规则, eg: yyyy-MM-dd hh:mm:ss.S 
 * @returns {*} string; 格式化后的时间字符串 eg:2020-04-22 10:00:00.0  
 */
export function DateFormat(date,fmt){
  var o = {
    "M+" : date.getMonth()+1,                 //月份
    "d+" : date.getDate(),                    //日
    "h+" : date.getHours(),                   //小时
    "m+" : date.getMinutes(),                 //分
    "s+" : date.getSeconds(),                 //秒
    "q+" : Math.floor((date.getMonth()+3)/3), //季度
    "S"  : date.getMilliseconds()             //毫秒
  };

  if(/(y+)/.test(fmt)){
    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
  }
        
  for(var k in o){
    if(new RegExp("("+ k +")").test(fmt)){
      fmt = fmt.replace(
        RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));  
    }       
  }

  return fmt;
}

/**
 * 字符串转Date 
 * @param {*} DateStr 对应的日期数据，eg: 2020-04-22 10:00:00.000
 * @param {*} format  对应的格式化规则， ge: yyyy-MM-dd hh:mm:ss.S
 * @returns {*} Date
 */
export function StringToDate(dateStr,format)  
{   
   //年
   let range = stringRange(format,'y');
   const year = dateStr.slice(range.fIndex,range.lIndex);
   //月
   range = stringRange(format,'M');
   const month = dateStr.slice(range.fIndex,range.lIndex);
   //日
   range = stringRange(format,'d');
   const day = dateStr.slice(range.fIndex,range.lIndex);
   //时
   range = stringRange(format,'h');
   const hours = dateStr.slice(range.fIndex,range.lIndex);
   //分
   range = stringRange(format,'m');
   const minute = dateStr.slice(range.fIndex,range.lIndex);
   //秒
   range = stringRange(format,'s');
   const second = dateStr.slice(range.fIndex,range.lIndex);
   //毫秒
   range = stringRange(format,'S');
   const millisecond = dateStr.slice(range.fIndex,range.lIndex);

   let dates = [];
   if(year)dates.push(year);
   if(month){
     // 月份需要减1，因为月份是从0开始计算的，即0代表1月
    dates.push(month-1);
   }
   if(day)dates.push(day);
   if(hours)dates.push(hours);
   if(minute)dates.push(minute);
   if(second)dates.push(second);
   if(millisecond)dates.push(millisecond);
 
    let myDate = new Date(...dates);  
    return myDate;  
}  

/**
 * 获取指定Date当月第一天 
 * @param {*} date 对应的日期数据Date对象
 * @returns {*} Date
 */
export function FetchMonthFristDay(date){
  let timestemp = date.getTime();
  let d = new Date(timestemp);// 主要为了深拷贝一下
  d.setDate(1);
  return d;
}

/**
 * 获取指定Date向后多少天的日期
 * @param {*} date 对应的日期数据Date对象
 * @param {*} dayCount 天数
 * @returns {*} Date
 */
export function FetchDateLastDay(date,dayCount){
  let timestemp = date.getTime();
  let d = new Date(timestemp);// 主要为了深拷贝一下
  d.setDate(d.getDate() + dayCount);// 将日期向后推dayCount天
  return d;
}

/**
 * 获取指定Date向后多少个月的日期
 * @param {*} date 对应的日期数据Date对象
 * @param {*} dayCount 天数
 * @returns {*} Date
 */
export function FetchDateLastMonth(date,monthCount){
  let timestemp = date.getTime();
  let d = new Date(timestemp); // 主要为了深拷贝一下
  d.setMonth(d.getMonth() + monthCount);// 将日期向后推monthCount天
  return d;
}

// 获取当前时分秒
export function tim() {
  var myDate = new Date();
  let h = myDate.getHours(); //获取当前小时数(0-23)
  let m = myDate.getMinutes(); //获取当前分钟数(0-59)
  let s = myDate.getSeconds(); //获取当前秒数(0-59)
  if (Number(h) < 10) h = '0' + h
  if (Number(m) < 10) m = '0' + m
  if (Number(s) < 10) s = '0' + s 
  return `${h}:${m}:${s}`
}

// 将日期往前退 currentDay 天
export function timCurrentDay(currentDay) {
  var time = (new Date).getTime() - currentDay * 24 * 60 * 60 * 1000;
  var tragetTime = new Date(time);
  var month = tragetTime.getMonth();
  var day = tragetTime.getDate();
  tragetTime = tragetTime.getFullYear() + "-" + (tragetTime.getMonth() > 9 ? (tragetTime.getMonth() + 1) : "0" + (tragetTime.getMonth() + 1)) + "-" + (tragetTime.getDate() > 9 ? (tragetTime.getDate()) : "0" + (tragetTime.getDate()));
  return tragetTime;
}

// 字符串检索
function stringRange(format,str){
  const fIndex = format.indexOf(str);
  const lIndex = format.lastIndexOf(str) + 1;
  return {fIndex,lIndex};
}