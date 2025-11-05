// HTTP 代理服务器示例
// 用于将本地请求代理到 12306 官网，便于抓包和调试

var http = require('http'),
    httpProxy = require('http-proxy');

// 创建代理服务器
var proxy = httpProxy.createProxyServer({});

// 创建本地 HTTP 服务并代理所有请求到 12306
var server = http.createServer(function (req, res) {
    // 可在此自定义请求处理逻辑
    proxy.web(req, res, {target: 'https://kyfw.12306.cn'});
    // proxy.web(req, res, {target: 'http://127.0.0.1:5151'});
});

console.log("listening on port 5050");
server.listen(5050);
