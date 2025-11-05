// 获取验证码图片模块
// 获取 12306 验证码图片并存入 Redis，支持邮件提醒

const uuidv1 = require('uuid/v1');
const config = require('./config');
const superagent = require('superagent');
const setHeaders = require('./setHeaders');
const utils = require('./utils');
const sendmail = require('./sendmail');
const redis = require('redis');

/**
 * 获取验证码图片并存储
 * @param {object} opt - 可选参数（如 sendmail）
 * @returns {Promise<string>} 验证码 key
 */
module.exports = async (opt) => {
    let captchaResult = await setHeaders(superagent.get('https://kyfw.12306.cn/passport/captcha/captcha-image64'))
        .query({
            login_site: 'E',
            module: 'login',
            rand: 'sjrand'
        });

    utils.setCookies(captchaResult.res.headers['set-cookie']);
    if (captchaResult.body.result_code !== '0') {
        return console.log(captchaResult.body.result_message);
    }
    let key = uuidv1();
    // config.codeImages[key] = captchaResult.body.image;
    config.redisDb.hset('codeImages', key, captchaResult.body.image, redis.print);
    if (opt && opt.sendmail) {
        sendmail(key, opt);
    }
    return key;
}
