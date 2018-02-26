// 过滤器，限止10个字
Vue.filter('substr', function(str) {
  var tt = (str.length>10)?"..":"";
  var v = str.substring(0,10) + tt;
  return v;
})

// 获取当前坐标位置
function getPosition()
{
    return new Promise(function(resolve) {
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(resolve);
        })
}

// 获取当前文件名前缀
function getJsonName()
{
    var str = window.location.pathname;
    var name = str.split("/").pop().split(".")[0];
    return 'data/' + name+'.json';
}


// 获取路径参数
function GetQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}

Vue.component('item', function (resolve, reject) {
  Vue.http({url: "template/item.html"})
  .then(
      function(res){
          resolve({
            template: res.body,
            props:{
                id: {type: [Number], default: "ddd"}
            },
            data:function (){
                return  {
                    price:null,
                    count:0,
                    tit:""
                }
            },
            methods: {
                clickH:function(){
                    console.log(this.tit);
                    var _this =this;
                    Vue.http({method:'GET', url:"data/cart.json" })
                    .then(
                    function (vv) {
                      var obj = vv.body.list[_this.id-1];
                      _this.tit = obj.tit;
                      _this.price = obj.price;
                      _this.count = obj.count;
                    }
                  );
                }
            },
            mounted: function() {
                // console.log(this.id+1);
            }
          })
    })
});

// 长宽比锁定组件
Vue.component('lockDiv', function (resolve, reject) {
  Vue.http({url: "template/lockDiv.html"})
  .then(
      function(res){
          resolve({
            template: res.body,
            props:{
                per: {type: [Number,String], default: 100 },
                bg: {type: [String], default: ""},
                link: {type: [String], default: ""}
            },
            data:function (){
                return  {
                    hh:100
                }
            },
            methods: {
                clickH:function(){
                    if(this.link){
                        window.location.href=this.link;
                    }
                }
            },
            mounted: function() {
                this.hh = this.$el.offsetWidth* this.per/100;
            }
          })
    })
});

// 搜索条
Vue.component('search_bar', function (resolve, reject) {
  Vue.http({url: "template/search_bar.html"})
  .then(
      function(res){
          resolve({
            template: res.body,
            props:{
                holder: {type: [String], default: "附近商家" }
            },
            data:function (){
                return  {
                    val : ""
                }
            },
            methods: {
                submit:function () {
                  this.$emit("search",this.val);
                }
            },
            mounted: function() {
              console.log(this.$refs.search_input);
              this.$refs.search_input.focus();
            }
          })
    })
});

var NAV = [
    {tit:"首页",url:"main.html",ico:"icon-shouye-shouye"},
    {tit:"类目",url:"sort.html",ico:"icon-leimulianjie"},
    {tit:"",url:"shop.html",ico:"icon-dianpu1"},
    {tit:"订单",url:"order.html",ico:"icon-dingdan"},
    {tit:"会员",url:"member.html",ico:"icon-wode"}
];
Vue.component('nav_foot', function (resolve, reject) {
  Vue.http({url: "template/nav_foot.html"})
  .then(
      function(res){
          resolve({
            template: res.body,
            props:{
                active: {type: [Number], default: 0 }
            },
            data:function (){
                return  {
                    list : NAV
                }
            },
            methods: {
            }
          })
    })
});

Vue.component('sku', function (resolve, reject) {
  Vue.http({url: "template/sku.html"})
  .then(
      function(res){
          resolve({
            template: res.body,
            props:{
                sku_id: {type: [Number], default: 0 },
                price: {type: [Number], default: 0 },
                badge: {type: [String], default: "" },
                src: {type: [String], default: "images/nopic.jpg" }
            },
            data:function (){
                return  {
                    
                }
            },
            methods: {
            }
          })
    })
});


Vue.component('popDetail', function (resolve, reject) {
  Vue.http({url: "template/popDetail.html"})
  .then(
      function(res){
          resolve({
            template: res.body,
            props:{
                show: {type: [Boolean], default: false },
                hh: {type: [Number], default: 80 }
            },
            data:function (){
                return  {
                    arr_nav : NAV
                }
            }
          })
    })
});



var mixin_common = {
    data:{
         is_pop_nav_active:false,    //当前导航弹窗打开状态
         detail_current:{},
         is_pop_detail_active:false
    },
    created: function() {},
    mounted: function() {},
    methods: {}
    
};

var mixin_cart = {
    data:{
         cart:[],
         lc:{}
    },
    mounted: function() {
      if(Storages){
        this.lc = Storages.initNamespaceStorage('jyg_cart').localStorage;
      }
    },
    methods: {
        // 查找特定ID的购物记录
        get_cart_item_count:function(id){
          var tt = _.find(this.cart, function(o) { return o.sku_id == id; });
          if(tt){
            return tt.count
          }else{
            return 0
          }
        },

        // 改写购物记录--如果存在就改写，否则新增
        write_cart:function(item){
          if(item.count<0){return false;}   //防止负值

          var _target = _.find(this.cart, function(o) { return o.sku_id == item.sku_id; });  //找到与当前id匹配的购物车记录
          if(_target){
            if(item.count>0){
              // 改写记录
              _target.count = item.count;
            }else{
              // 如count改为0，则删除记录
              _.pull(this.cart,_target);
            }
          }else{

            // 如找不到匹配记录，则新增
            if(item.count){
              var _data = {
                "tit":item.tit,
                "src":item.src,
                "thum":item.thum,
                "present_price":item.present_price,
                "sku_id":item.sku_id,
                "count":item.count
              }
              this.cart.push(_data);
            }
          }

          // 写到缓存
          this.lc.set("list",this.cart);
        },

        // 购物车计数
        sum_cart:function(item){
          var tt = _.sumBy(this.cart, function(o) { return o.count; });
          return tt;
        },

        // 购物车总消费
        total_cart:function(item){
          var tt = _.sumBy(this.cart, function(o) { return o.present_price*o.count; });
          return _.round(tt, 2);;
        },

        // 清空购物车及缓存
        clear_cart:function(){
          this.cart = [];
          this.lc.set("list",[]);
        },

        // 删除当前项
        del_cart_item:function(id){
          // var _target = _.find(this.cart, function(o) { return o.sku_id == id; });
          _.remove(this.cart, function(o) {
            return o.sku_id == id;
          });
        },

        // 缓存数据==>页面购物车结构
        init_cart:function(_url,fn){
          /*if(!this.lc.isEmpty("list") ){   //判断是否有缓存商品
            this.cart = this.lc.get("list"); //读取已购商品数据
          }*/
          var _this = this;
          Vue.http({method:'GET', url:_url }).then(
            function (res) {
              _this.cart  = res.body.list;
              fn(res.body.list);
            });
        }
    }
    
};

var mixin_infinite = {
    data:{
         page:1
    },
    created: function() {},
    mounted: function() {},
    methods: {
        loadList:function() {

            this.$http.get(this.json_pre+"?page="+this.page)
            .then(function (e) {
                this.my.list = this.my.list.concat(e.body.list);

                if (e.body.flag_end) {
                    console.log("已到末尾!");
                    this.$refs.infinitescrollDemo.$emit('ydui.infinitescroll.loadedDone');
                    return;
                }

                this.isHide = true;
                this.$refs.infinitescrollDemo.$emit('ydui.infinitescroll.finishLoad');
                this.page++;
                console.log(this.isHide);
                console.log("----", this.isHide);
            });
        }
    }
    
};

/*带加减面板操作*/
var mixin_spinner = {
    data:{
      // 购物车右上角小点的坐标-初始化
      cart_ico:{x:0,y:0}
    },

    mounted: function() {
        // 增加一个飞行小球的dom结构
        document.querySelector("body").insertAdjacentHTML('beforeend', "<div class='fly_ball'></div>")
        // 载入时给每件商品添加一个 购买的数字变量
        

        // 获取购物车右上角小点的坐标
        this.cart_ico.y = document.querySelector(".icon-gouwuche2").offsetParent.offsetTop + document.querySelector(".icon-gouwuche2").offsetTop-2;
        this.cart_ico.x = document.querySelector(".icon-gouwuche2").offsetParent.offsetLeft + document.querySelector(".icon-gouwuche2").offsetLeft+4;
    },
    
    methods: {
      //购物车增加按钮
      addH:function (item) {
          var _this = this;

          var cartX = _this.cart_ico.x;
          var cartY = _this.cart_ico.y;

          var currentX = event.target.getBoundingClientRect().left;
          var currentY = event.target.getBoundingClientRect().top;

          var middleX = (currentX - cartX)*0.3 + cartX;
          var middleY = (-currentY + cartY)*0.3 + currentY;

          TweenMax.to(".fly_ball",0, {alpha:1});
          TweenMax.fromTo(".fly_ball", 0.3, 
              {scale:1,left:event.target.getBoundingClientRect().left, top:event.target.getBoundingClientRect().top},
              {scale:0.7,bezier:[{left:middleX, top:middleY}, {left:_this.cart_ico.x, top:_this.cart_ico.y}], ease:Cubic.easeOut,onComplete:function () {
                  item.count++;
                  TweenMax.to(".fly_ball",0, {alpha:0});
                  
          }});
      },

      //购物车减少按钮
      reduceH:function (item) {
          console.log(item.count);
          if(item){
            item.count--;
            
          }
      }
    }
    
};

