// Koa2 代理服务示例
// 用于本地转发 12306 查询请求，便于调试和抓包

const Koa2 = require('koa2');
const logger = require('koa-logger');
const bodyparser = require('koa-bodyparser');
const superagent = require('superagent');

const app = new Koa2();

app.use(logger());
app.use(bodyparser({ enableTypes: ['json', 'form', 'text'] }));

// 代理转发查询请求
app.use(async (ctx) => {
    let result = await setHeaders(superagent.get('https://kyfw.12306.cn/otn/leftTicket/queryZ'))
        .query(ctx.request.query);
    ctx.body = result.text;
});

app.listen(9999, () => {
    console.log('启动成功', 'http://' + getIPAdress() + ':9999');
});

// 获取本机 IP 地址
function getIPAdress () {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

/**
 * 设置请求头
 * @param xhr
 * @returns {*}
 */
function setHeaders (xhr) {
    // xhr.set('Accept', '*/*');
    // xhr.set('Accept-Encoding', 'gzip, deflate, br');
    // xhr.set('Accept-Language', 'zh-CN,zh;q=0.9,en;q=0.8');
    xhr.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.set('Cookie', 'JSESSIONID=976F358D2D95CE6C2BFFF9FCDFE4DC55; BIGipServerpassport=1005060362.50215.0000; route=c5c62a339e7744272a54643b3be5bf64; BIGipServerotn=1490616586.24610.0000; RAIL_EXPIRATION=1577786430782; RAIL_DEVICEID=Vz1cns7-qnApMswSTwMqqX1Z9iQteFsJpiIaLcU1H7zD4NYy3C_HCvJ62wJMj13uC_28eC2GdFZT5Z4wehsLTJIpeYvzP9a9NI2juRUlXsgmbOEUYskPyOFf9STgHZtzCyuEBHCvxQIWTCVNnlMTptx2q0sBM16n; _jc_save_fromStation=%u6DF1%u5733%2CSZQ; _jc_save_toStation=%u9686%u56DE%2CLHA; _jc_save_fromDate=2020-01-03; _jc_save_toDate=2019-12-27; _jc_save_wfdc_flag=dc');
    // xhr.set('Host', 'kyfw.12306.cn');
    // xhr.set('Origin', 'https://kyfw.12306.cn');
    // xhr.set('Referer', 'https://kyfw.12306.cn/otn/confirmPassenger/initDc');
    xhr.set('Referer', 'https://kyfw.12306.cn/otn/leftTicket/init?linktypeid=dc&fs=%E6%B7%B1%E5%9C%B3,SZQ&ts=%E9%9A%86%E5%9B%9E,LHA&date=2020-01-03&flag=N,N,Y');
    // xhr.set('Sec-Fetch-Mode', 'cors');
    // xhr.set('Sec-Fetch-Site', 'same-origin');
    xhr.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
    // xhr.set('X-Requested-With', 'XMLHttpRequest');
    return xhr;
}
