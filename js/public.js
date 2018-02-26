
var NAV = [
  {"tit":"首页","url":"main.html","ico":"icon-home"},
  {"tit":"类目","url":"sort.html","ico":"icon-apps"},
  {"tit":"","url":"#","ico":"icon-shop"},
  {"tit":"订单","url":"order.html","ico":"icon-calendar"},
  {"tit":"会员","url":"member.html","ico":"icon-people"}
],

NAVHOT = [
  {
    "tit": "超市便利",
    "url": "hot_channel.html?id=0",
    "ico": "icon-chaoshi"
  },
  {
    "tit": "新鲜果蔬",
    "url": "hot_channel.html?id=1",
    "ico": "icon-shuiguo"
  },
  {
    "tit": "零食小吃",
    "url": "hot_channel.html?id=2",
    "ico": "icon-lingshi"
  },
  {
    "tit": "鲜花烘焙",
    "url": "hot_channel.html?id=3",
    "ico": "icon-xianhua"
  }
],

mixin_common = {
  data:{
  },
  filters: {
    formatMoney: function(value) {
      return "￥" + value.toFixed(2);  //格式化价格
    },
    formatTitle: function(value) {
      return value.substring(0,10);  //格式化商品名称
    }
  },
  methods:{
    skuGet:function () {
      this.sku = store.get('sku');  //加载商品信息
    },
    CSGet:function (shop_id) {
      var _this = this;
      var count = 0;
      _.find(this.cart,function(shop){
        if(shop.shop_id == shop_id){
          _.forEach(shop.list,function(sku){
            count += sku.count;
          });
        };
      });
      return count;  //加载商店购物数量
    },
    cartGet: function () {
      var _this = this;
      this.cart = store.get('ct');
      if(this.cart == undefined){
        data.get('ct').then(function (res) {
          _this.cart = res.data;
          store.set('ct',res.data);
        });
      };
    },
    shopcartGet: function (shop_id,shop) {
      this.shop_cart.shop_id = shop_id;  //初始化商店购物车
      this.shop_cart.shop = shop;
      var temp = _.find(this.cart,function (shop) {return shop.shop_id == shop_id;});
      if(temp){
        this.shop_cart = temp;
      };
      console.log(this.shop_cart);
    },
    countGet:function (sku_list) {
      var _this = this;
      /*_.forEach(sku_list, function(sku, key) {
        var bingo = _.find(_this.shop_cart.list, function(item) { return item.sku_id == sku.sku_id && item.shop_id == sku.shop_id; });
        if(bingo){
          Vue.set(sku,"count",bingo.count);
        }else{
          Vue.set(sku,"count",0);
        }
      });*/
      _.forEach(sku_list,function(sku){
        Vue.set(sku,"count",0);
      });
      _.forEach(this.shop_cart.list,function(item){
        _.find(sku_list,function(sku){
          if(sku.sku_id == item.sku_id){
            Vue.set(sku,"count",item.count);
          };
        });
      });
    },
    shopStore:function (shop_id) {
      store.set('shop_id',shop_id);
    },
    cartStore:function () {
      var _this = this;
      var flag_bingo = false;  //购物车中是否已存在该商店及商品
      _.find(this.cart,function (shop) {
        if(shop.shop_id == _this.shop_cart.shop_id){
          shop = _this.shop_cart;
          flag_bingo = true;
        };
      });
      if(flag_bingo == false){
        this.cart = this.cart.concat(this.shop_cart);
      };  //购物车中没有商店及商品则放入商店及商品
      store.set("ct",this.cart);
    },
    skuStore:function (sku) {
      store.set('sku',sku); //将商品信息计入缓存
      this.cartStore();  //跳转到商品详情时需缓存购物车
    },
    skuCount:function (flag,index,sku_list) {
      var _this = this;
      var flag_bingo = false;  //购物车中是否已存在该商品
      if(flag == 1){
        _this.ballFly(flag);
        sku_list[index].count ++;  //增加商品数量
      }else if(sku_list[index].count > 0){
        _this.ballFly(flag);
        sku_list[index].count --;  //减少商品数量
      };
      for(i=0;i<_this.shop_cart.list.length;i++){
        if(_this.shop_cart.list[i].sku_id == sku_list[index].sku_id){
          _this.shop_cart.list[i].count = sku_list[index].count;
          flag_bingo = true;  //购物车有该商品
        };
        if(_this.shop_cart.list[i].count == 0){
          _this.shop_cart.list.splice(i,1);  //从购物车清除商品
        };
      };
      if(flag_bingo == false){
        _this.shop_cart.list = _this.shop_cart.list.concat(sku_list[index]);
      };  //购物车中没有商品则放入商品
      this.cartStore();
    },
    cartCount:function (flag,index,sku_list) {
      var _this = this;
      if(flag == 1){
        _this.shop_cart.list[index].count ++;  //增加商品数量
      }else if(_this.shop_cart.list[index].count > 0){
        _this.shop_cart.list[index].count --;  //减少商品数量
      };
      for(i=0;i<sku_list.length;i++){
        if(sku_list[i].sku_id == _this.shop_cart.list[index].sku_id){
          sku_list[i].count = _this.shop_cart.list[index].count;
        };
      };
      if(_this.shop_cart.list[index].count == 0){
        _this.shop_cart.list.splice(index,1);  //从购物车清除商品
      };
      this.cartStore();
    },
    cartClear:function (sku_list) {
      var _this = this;
      if(this.shop_cart.list.length != 0){
        _this.shop_cart.list = [];  //清空购物车
        _.forEach(sku_list, function(sku, key) {
            sku.count = 0;
        });  //商店单品数量置0
      };
      this.cartStore();
    }
  },
},

mixin_ballFly = {
  data:{
    cart_ico:{x:0,y:0},
  },

  mounted:function () {
    // 获取购物车右上角小点的坐标
    this.cart_ico.y = document.querySelector(".icon-cartfill").offsetParent.offsetTop + document.querySelector(".icon-cartfill").offsetTop-2;
    this.cart_ico.x = document.querySelector(".icon-cartfill").offsetParent.offsetLeft + document.querySelector(".icon-cartfill").offsetLeft+4;
  },

  methods:{
    ballFly:function (flag) {
      var _this = this;
      var cartX = _this.cart_ico.x;
      var cartY = _this.cart_ico.y;
      var currentX = event.target.getBoundingClientRect().left;
      var currentY = event.target.getBoundingClientRect().top + 7;
      var middleX = currentX - (currentX - cartX)*0.3;
      var middleY = currentY + (cartY - currentY)*0.1;
      document.getElementsByTagName("body")[0].insertAdjacentHTML('beforeEnd', "<div class='fly_ball'></div>");
      if(flag == 1){
        TweenMax.fromTo(".fly_ball", 0.4,
        {scale:1, left:currentX, top:currentY, alpha:1},
        {scale:0.7, bezier:[{left:middleX, top:middleY}, {left:cartX, top:cartY}], ease:Circ.easeInOut,
          onComplete:function () {TweenMax.to(".fly_ball", 0, {alpha:0});}
        });
      }else{
        TweenMax.fromTo(".fly_ball", 0.4,
        {scale:1, left:cartX, top:cartY, alpha:1},
        {scale:0.5, left:cartX, top:cartY*0.95, ease:Circ.easeInOut, alpha:0});
      };
    },
  },
};

function getQS(name){
  var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if(r!=null)return  unescape(r[2]); return null;
};

Vue.component('nav_foot', function (resolve) {
  template.get("nav_foot.html")
  .then(function(res){
    resolve({
      template: res.data,
      props:{
        active: {type: [Number], default: 0 }
      },
      data:function (){
        return  {
          nav : NAV,
        }
      },
    })
  })
});

Vue.component('shop_foot', function (resolve) {
  template.get("shop_foot.html")
  .then(function(res){
    resolve({
      template: res.data,
      props:{
        active: {type: [Number], default: 0 }
      },
      data:function (){
        return  {
          nav : NAV,
        }
      },
    })
  })
});

Vue.component('search_bar', function (resolve,reject) {
  template.get("search_bar.html")
  .then(
    function(res){
      resolve({
        template: res.data,
        props:{
            holder: {type: [String], default: "附近商家" }
        },
        data:function (){
            return  {
                val : "",
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

Vue.component('is_list', function (resolve) {
  template.get("is_list.html")
  .then(function(res){
    resolve({
      template: res.data,
      props:{
        url: String
      },
      data:function (){
        return  {
          page : 1,
          list: []
        }
      },
      watch:{
        url: function (val, oldVal) {
          this.initlist();
        }
      },
      methods:{
        loadList: function () {
          var _this = this;
          data.get(this.url + '?page=' + this.page).then(function (res) {
            if(res.data.total){
              var num_page = Math.ceil(res.data.total/res.data.pageSize);
              if(_this.page < num_page){
                _this.$refs.iscr.$emit('ydui.infinitescroll.finishLoad');
                _this.page ++;
              }else{
                _this.$refs.iscr.$emit('ydui.infinitescroll.loadedDone');
              };
              _this.list = _this.list.concat(res.data.list);
            }else{
              _this.$refs.iscr.$emit('ydui.infinitescroll.loadedDone');
              _this.list = _this.list.concat(res.data.list);
            };
          });
        },
        initlist: function () {
          this.page = 1;
          this.list = [];
          this.$refs.iscr.$emit('ydui.infinitescroll.reInit');
          this.loadList();
        }
      },
      mounted: function () {
        this.initlist();
      }
    })
  })
});