new Vue({
    el:"#hot_channel",
    data:{
    	my:[],
        hot:[],
        hotpre:"data/shop_list.json",
        page:1
    },
    filters:{

    },
    mounted: function () {
    	this.$nextTick(function () {
    		this.myView();
            this.hotView();
    	})
    },
    methods:{
    	myView: function () {
    		this.$http.get("data/main.json").then(res=>{
        		this.my = res.data;
    		})
    	},
        hotView: function () {
            this.$http.get("data/hot_channel.json").then(res=>{
                this.hot = res.data;
            })
        },
        loadList:function() {
            this.$http.get(this.hotpre)
            .then(function (e) {
                this.hot.list = this.hot.list.concat(e.body.list);
                if (e.body.flag_end) {
                    this.$refs.infinitescrollDemo.$emit('ydui.infinitescroll.loadedDone');
                    return;
                }
                this.$refs.infinitescrollDemo.$emit('ydui.infinitescroll.finishLoad');
                this.page++;
            });
        }
    },
});

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
                this.his.list = this.his.list.concat(e.body.list);

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
