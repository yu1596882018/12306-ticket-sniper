/**
 * ========================================
 * 验证码获取模块
 * ========================================
 * 
 * 功能：
 * 1. 从 12306 获取验证码图片
 * 2. 将图片存储到 Redis
 * 3. 生成唯一 key
 * 4. 发送邮件通知（可选）
 * ========================================
 */

const uuidv1 = require('uuid/v1');
const config = require('./config');
const superagent = require('superagent');
const setHeaders = require('./setHeaders');
const utils = require('./utils');
const sendmail = require('./sendmail');
const redis = require('redis');

/**
 * 获取验证码主函数
 * @param {Object} opt - 选项（sendmail: 是否发送邮件, flag: 邮件提示文本）
 * @returns {String} 验证码的唯一 key
 */
module.exports = async (opt) => {
    // 从 12306 获取验证码图片
    let captchaResult = await setHeaders(superagent.get('https://kyfw.12306.cn/passport/captcha/captcha-image64'))
        .query({
            login_site: 'E',
            module: 'login',
            rand: 'sjrand'
        });

    // 更新 Cookie
    utils.setCookies(captchaResult.res.headers['set-cookie']);
    
    // 检查响应
    if (captchaResult.body.result_code !== '0') {
        console.log('❌ 获取验证码失败:', captchaResult.body.result_message);
        return console.log(captchaResult.body.result_message);
    }
    
    // 生成唯一 key
    let key = uuidv1();
    
    // 将验证码图片存储到 Redis
    config.redisDb.hset('codeImages', key, captchaResult.body.image, redis.print);
    console.log('✓ 验证码已生成，Key:', key);
    
    // 如果需要，发送邮件通知
    if (opt && opt.sendmail) {
        sendmail(key, opt);
        console.log('✓ 验证码邮件已发送');
    }
    
    return key;
}
