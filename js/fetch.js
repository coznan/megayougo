var data = axios.create({
  /*baseURL: 'data'*/  //请求本地数据
  baseURL: 'https://www.easy-mock.com/mock/5a2b4d38158e7b700327f20b/megayougo/'  //请求easy-mock数据
}),

template = axios.create({
  baseURL: 'template'  //获取组件
});

data.interceptors.request.use(function (config) {
  /*console.log(config);*/
  if (config.baseURL == 'data') {
    config.url = config.url + '.json';
  }
  return config;
});