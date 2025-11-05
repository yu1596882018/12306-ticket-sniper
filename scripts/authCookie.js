// 登录与验证码校验模块
// 用于提交验证码答案，自动完成 12306 登录流程，并同步 Cookie

const superagent = require('superagent');
const setHeaders = require('./setHeaders');
const utils = require('./utils');
const localConfig = require('./localConfig');
const config = require('./config');

/**
 * 提交验证码答案并自动登录
 * @param {string} answer - 验证码答案
 * @returns {Promise<object>} 登录结果对象 { success, message, data }
 */
module.exports = async (answer) => {
    // 1. 先从 Redis 获取最新 Cookie
    await new Promise((resolve, reject) => {
        config.redisDb.get('userCookie', function (err, v) {
            if (err) return reject(err);
            v && (config.userCookie = v);
            resolve(v);
        });
    });
    // 2. 校验验证码答案
    let checkResult;
    try {
        checkResult = await setHeaders(superagent.get('https://kyfw.12306.cn/passport/captcha/captcha-check'))
            .query({ answer, rand: 'sjrand', login_site: 'E' });
    } catch (e) {
        return { success: false, message: '验证码校验请求失败', error: e };
    }
    utils.setCookies(checkResult.res.headers['set-cookie']);
    if (checkResult.body.result_code !== '4') {
        return { success: false, message: checkResult.body.result_message };
    }
    // 3. 提交登录请求
    let loginResult;
    try {
        loginResult = await setHeaders(superagent.post('https://kyfw.12306.cn/passport/web/login'))
            .send({
                answer,
                username: localConfig.username,
                password: localConfig.password,
                appid: 'otn',
                _json_att: '',
            });
    } catch (e) {
        return { success: false, message: '登录请求失败', error: e };
    }
    utils.setCookies(loginResult.res.headers['set-cookie']);
    if (loginResult.body.result_code !== 0) {
        return { success: false, message: loginResult.body.result_message };
    }
    // 4. 获取 UAMTK（Token）
    let uamtkResult;
    try {
        uamtkResult = await setHeaders(superagent.post('https://kyfw.12306.cn/passport/web/auth/uamtk'))
            .send({ appid: 'otn', _json_att: '' });
    } catch (e) {
        return { success: false, message: 'UAMTK 获取失败', error: e };
    }
    utils.setCookies(uamtkResult.res.headers['set-cookie']);
    if (uamtkResult.body.result_code !== 0) {
        return { success: false, message: uamtkResult.body.result_message };
    }
    // 5. 客户端认证，获取最终 Cookie
    let uamauthclientResult;
    try {
        uamauthclientResult = await setHeaders(superagent.post('https://kyfw.12306.cn/otn/uamauthclient'))
            .send({ tk: uamtkResult.body.newapptk, _json_att: '' });
    } catch (e) {
        return { success: false, message: 'uamauthclient 认证失败', error: e };
    }
    utils.setCookies(uamauthclientResult.res.headers['set-cookie']);
    if (uamauthclientResult.body.result_code !== 0) {
        return { success: false, message: uamauthclientResult.body.result_message };
    }
    // 登录成功，返回结果
    return { success: true, message: '登录成功', data: uamauthclientResult.body };
}
