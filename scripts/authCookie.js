/**
 * ========================================
 * Cookie 验证模块
 * ========================================
 *
 * 功能：验证用户提交的验证码答案并获取新的 Cookie
 * 流程：
 * 1. 验证码校验 (captcha-check)
 * 2. 用户登录 (web/login)
 * 3. 获取令牌 (uamtk)
 * 4. 授权认证 (uamauthclient)
 * 5. 更新 Cookie 到 Redis
 * ========================================
 */

const superagent = require('superagent');
const setHeaders = require('./setHeaders');
const utils = require('./utils');
const localConfig = require('./localConfig');
const config = require('./config');

/**
 * 验证码认证主函数
 * @param {String} answer - 用户选择的验证码坐标
 * @returns {Object} 认证结果
 */
module.exports = async answer => {
    // 从 Redis 加载最新 Cookie
    await new Promise((resolve, reject) => {
        config.redisDb.get('userCookie', function (err, v) {
            if (err) {
                reject(err);
            } else {
                v && (config.userCookie = v);
                resolve(v);
            }
        });
    });

    /*let captchaResult = await setHeaders(superagent.get('https://kyfw.12306.cn/passport/captcha/captcha-image64'))
        .query({
            login_site: 'E',
            module: 'login',
            rand: 'sjrand'
        });

    utils.setCookies(captchaResult.res.headers['set-cookie']);
    if (captchaResult.body.result_code !== '0') {
        return console.log(captchaResult.body.result_message);
    }

    return console.log(captchaResult.body);*/

    // 步骤1：验证码校验
    let checkResult = await setHeaders(
        superagent.get('https://kyfw.12306.cn/passport/captcha/captcha-check')
    ).query({
        answer: answer,
        rand: 'sjrand',
        login_site: 'E'
    });

    utils.setCookies(checkResult.res.headers['set-cookie']);
    if (checkResult.body.result_code !== '4') {
        console.log('❌ 验证码校验失败:', checkResult.body.result_message);
        return checkResult.body;
    }
    console.log('✓ 验证码校验通过');

    // 步骤2：用户登录
    let loginResult = await setHeaders(
        superagent.post('https://kyfw.12306.cn/passport/web/login')
    ).send({
        answer: answer,
        username: localConfig.username,
        password: localConfig.password,
        appid: 'otn',
        _json_att: ''
    });

    utils.setCookies(loginResult.res.headers['set-cookie']);
    if (loginResult.body.result_code !== 0) {
        console.log('❌ 用户登录失败:', loginResult.body.result_message);
        return loginResult.body;
    }
    console.log('✓ 用户登录成功');

    // 步骤3：获取令牌
    let uamtkResult = await setHeaders(
        superagent.post('https://kyfw.12306.cn/passport/web/auth/uamtk')
    ).send({
        appid: 'otn',
        _json_att: ''
    });

    utils.setCookies(uamtkResult.res.headers['set-cookie']);
    if (uamtkResult.body.result_code !== 0) {
        console.log('❌ 获取令牌失败:', uamtkResult.body.result_message);
        return uamtkResult.body;
    }
    console.log('✓ 令牌获取成功');

    // 步骤4：授权认证
    let uamauthclientResult = await setHeaders(
        superagent.post('https://kyfw.12306.cn/otn/uamauthclient')
    ).send({
        tk: uamtkResult.body.newapptk,
        _json_att: ''
    });

    utils.setCookies(uamauthclientResult.res.headers['set-cookie']);
    if (uamauthclientResult.body.result_code !== 0) {
        console.log('❌ 授权认证失败:', uamauthclientResult.body.result_message);
        return uamauthclientResult.body;
    }
    console.log('✅ Cookie 认证完成！');
    return uamauthclientResult.body;
};
