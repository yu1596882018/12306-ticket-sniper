const config = require('./config');

/**
 * 设置请求头
 * @param xhr
 * @returns {*}
 */
module.exports = (xhr, queryCookie) => {
    xhr.set('Accept', '*/*');
    xhr.set('Accept-Encoding', 'gzip, deflate, br');
    xhr.set('Accept-Language', 'zh-CN,zh;q=0.9,en;q=0.8');
    xhr.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.set('Cookie', queryCookie || config.userCookie);
    xhr.set('Host', 'kyfw.12306.cn');
    xhr.set('Origin', 'https://kyfw.12306.cn');
    xhr.set('Referer', 'https://kyfw.12306.cn/otn/confirmPassenger/initDc');
    xhr.set('Sec-Fetch-Mode', 'cors');
    xhr.set('Sec-Fetch-Site', 'same-origin');
    xhr.set(
        'User-Agent',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18363'
    );
    xhr.set('X-Requested-With', 'XMLHttpRequest');
    return xhr;
};
