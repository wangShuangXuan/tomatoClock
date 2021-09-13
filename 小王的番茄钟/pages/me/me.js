var app = getApp()
const k='4dae59a3b9d74a4aa144d438ed486bf9'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    img:999,
    userInfo:null,
    isShowUserName:false,
    openid: "",
    name: "",
    menuitems: [
      { text: '操作指引', url: '../guide/guide', icon: '/images/user2.png', arrows: '/images/arrows.png' },
      { text: '清空记录', url: '#', icon: '/images/user3.png', arrows: '/images/arrows.png' },
      { text: '作者有话', url: '../author/author', icon: '/images/user4.png', arrows: '/images/arrows.png' }
    ]
  },

  // 天气卡片的设置
  getWeather:function(){
    var that= this
    var location = that.data.loc  
    wx.request({      
      url:'https://devapi.qweather.com/v7/weather/now?location=' + location+'&key='+k,
      success:function(res){
        // console.log(res.data.now);
        that.setData({
          img:res.data.now.icon,
          txt:res.data.now.text,
          tmp:res.data.now.temp,
          fl:res.data.now.feelsLike,
          hum:res.data.now.humidity
        })
      }
    })
    
  },
  getQlty:function(){
    var that= this
    var location = that.data.loc 
    wx.request({
      url: 'https://devapi.qweather.com/v7/air/now?location='+location+'&key='+k,
      success:function(res){
        // console.log(res);
        that.setData({
          qlty:res.data.now.category
        })
      }
    })
  },
  getCity:function(){
    var that= this
    var location = that.data.loc
    wx.request({
      url: 'https://geoapi.qweather.com/v2/city/lookup?location=' + location +'&key='+k,
      success:function(res){
        // console.log(res.data.location[0]);
        that.setData({
          Province:res.data.location[0].adm1,
          city:res.data.location[0].adm2,
          district:res.data.location[0].name
          
        })
        
      }
    })
  },
  onLoad:function(options) {
    var that=this
    wx.getLocation({
      success:function(res){
        // console.log(res.latitude,res.longitude)
        var locat = res.longitude.toString()+","+res.latitude.toString()
        // console.log(locat)
        that.data.loc=locat
        that.getCity()
        that.getWeather()
        that.getQlty()
      }
    })
    
  },

getUserProfile(){
        wx.getUserProfile({
          desc: '用于完善用户资料',
          success:(res)=>{
            console.log("获取用户信息成功！",res);
            let user = res.userInfo
            wx.setStorageSync('user', user) //保存信息到本地
            this.setData({
              isShowUserName:true,
              userInfo:user
            })
          },
          fail:res=>{
            console.log("获取用户信息失败！",res);
          }
        });
 },

onShow(options){
  wx.setNavigationBarTitle({
    title: '我的'
  })
  this.getUserProfile()
  var user = wx.getStorageSync('user')  //本地缓存取用户信息
  if(user&&user.nickName){  //如果本地缓存有信息，显示本地缓存
    this.setData({
      isShowUserName:true,
      userInfo:user
    })
  }
},
  
  empty: function (e) {
    var index = e.currentTarget.dataset.index;
    if (index == 1) {
      // const ui = wx.getStorageSync('userinfo')
      var user = wx.getStorageSync('user')
      if (!user.nickName) {
        wx.showModal({
          title: '温馨提示',
          content: '此功能需要登录后使用',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
              wx.switchTab({
                url: '/pages/me/me'
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }else{
        wx.showModal({
          title: '温馨提示',
          content: '记录删除后无法找回，确定删除吗？',
          success: function (res) {
            if (res.confirm) {
              var openid = app.globalData.openid;
              //云函数删除
              wx.cloud.callFunction({
                name: "deletelog",
                data: {
                  openid: openid,
                },
                success: res => {
                  wx.showToast({
                    title: '删除成功！',
                  })
                  console.log('删除成功！', res)
                },
                fail: err => {
                  wx.showToast({
                    title: '调用失败' + err,
                  })
                  console.error('调用失败', err)
                }
              })
            } else if (res.cancel) {
              return false;
            }
          }
        })
      }
      
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
  }

})