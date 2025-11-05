// 登录状态定时校验模块
// 定时检测 12306 登录状态，失效时自动触发验证码邮件提醒

const superagent = require('superagent');
const setHeaders = require('./setHeaders');
const getCodeImage = require('./getCodeImage');
const config = require('./config');
const { queryCookie } = require('./config');
const moment = require('moment');

/**
 * 定时校验登录状态主流程
 */
const start = async () => {
    try {
        // 非抢票时间段不校验
        if (new Date().getHours() < 6 || new Date().getHours() >= 23) {
            return console.log('不在抢票时间！');
        }
        // 获取最新 Cookie
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
        // 构造查询参数
        const queryParams = {
            secretStr: '',
            queryDate: moment().set('date', moment().get('date') + 7).format("YYYY-MM-DD"),
            fromCiteCode: 'SZQ',
            fromCiteText: '深圳',
            toCiteCode: 'LHA',
            toCiteText: '隆回'
        }
        // 查询余票
        let queryZResult = await setHeaders(superagent.get('https://kyfw.12306.cn/otn/leftTicket/queryO'), queryCookie)
            .query({
                'leftTicketDTO.train_date': queryParams.queryDate,
                'leftTicketDTO.from_station': queryParams.fromCiteCode,
                'leftTicketDTO.to_station': queryParams.toCiteCode,
                purpose_codes: 'ADULT'
            });
        let queryItem = queryZResult.body.data.result.find(item => {
            let arr = item.split('|');
            return arr[11] === 'Y' && ((arr[30] && arr[30] !== '无') || (arr[31] && arr[31] !== '无'));
        });
        if (!queryItem) {
            throw new Error('无票');
            return false;
        }
        queryParams.secretStr = queryItem.split('|')[0]
        // 校验登录
        let checkUserResult = await setHeaders(superagent.post('https://kyfw.12306.cn/otn/login/checkUser'))
            .send({ _json_att: '' });
        console.log('checkUserResult', checkUserResult.text);
        let checkUserData = JSON.parse(checkUserResult.text);
        if (!checkUserData.data.flag) {
            throw new Error('cookie失效');
            return false;
        }
        // 预订
        let submitOrderRequestResult = await setHeaders(superagent.post('https://kyfw.12306.cn/otn/leftTicket/submitOrderRequest'))
            .send({
                secretStr: decodeURIComponent(queryParams.secretStr),
                train_date: queryParams.queryDate,
                back_train_date: moment().format("YYYY-MM-DD"),
                tour_flag: 'dc',
                purpose_codes: 'ADULT',
                query_from_station_name: queryParams.fromCiteText,
                query_to_station_name: queryParams.toCiteText,
                undefined: ''
            });
        console.log('submitOrderRequestResult', submitOrderRequestResult.text);
        let checkUserrData = JSON.parse(submitOrderRequestResult.text);
    } catch (e) {
        console.log('异常', e);
        getCodeImage({ sendmail: true });
    }
}
// 启动定时任务
setTimeout(start, 3000);
setInterval(start, 1 * 60 * 1000);
