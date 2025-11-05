// 查询有票车次（老版入口，支持单用户单任务）
// 自动循环查询余票并调用下单模块

const placeOrder = require('./placeOrder');
const { queryCookie } = require('./config');

/**
 * 启动抢票任务（老版）
 * @param {Object} options - 配置项
 * @param {Array} options.QLP - 查询参数列表（必传）
 * @param {number} options.intervalTime - 查询间隔
 * @returns {Object} 控制对象
 */
module.exports = function ({ QLP: queryListParams, intervalTime }) {
    if (!Array.isArray(queryListParams)) {
        throw new Error('QLP（查询参数列表）必须为数组');
    }
    let stopFlag = false;
    const superagent = require('superagent');
    const setHeaders = require('./setHeaders');
    startFunc();
    async function startFunc() {
        let pros = [];
        // 遍历所有日期和车站组合
        for (const param of queryListParams) {
            const { queryDates, toCiteCodes, userIndex } = param;
            for (const queryDate of queryDates) {
                for (const code of toCiteCodes) {
                    pros.push((async () => {
                        try {
                            if (!stopFlag) {
                                const queryParams = {
                                    fromCiteCode: code.fromCode,
                                    toCiteCode: code.code,
                                    queryDate: queryDate
                                };
                                // 查询余票
                                let queryZResult = await setHeaders(superagent.get('https://kyfw.12306.cn/otn/leftTicket/queryZ'), queryCookie)
                                    .query({
                                        'leftTicketDTO.train_date': queryParams.queryDate,
                                        'leftTicketDTO.from_station': queryParams.fromCiteCode,
                                        'leftTicketDTO.to_station': queryParams.toCiteCode,
                                        purpose_codes: 'ADULT'
                                    });
                                let queryZData = JSON.parse(queryZResult.text);
                                let queryItem = queryZData.data.result.find(item => {
                                    let arr = item.split('|');
                                    return (code.checi ? code.checi.includes(arr[3]) : true) && arr[11] === 'Y' && ((arr[30] && arr[30] !== '无') || (arr[31] && arr[31] !== '无'));
                                });
                                if (!queryItem) {
                                    console.log('无票', queryParams.queryDate + '-' + code.fromCode + '-' + code.code);
                                } else {
                                    setTimeout(() => {
                                        console.log(queryParams.queryDate + '-' + code.fromCode + '-' + code.code + '有票', queryItem);
                                    }, 2000)
                                    if (!stopFlag) {
                                        // 下单占位
                                        placeOrder({
                                            queryDate: queryParams.queryDate,
                                            fromCiteCode: queryParams.fromCiteCode,
                                            toCiteCode: queryParams.toCiteCode,
                                            fromCiteText: queryZData.data.map[queryParams.fromCiteCode] || code.fromCiteText,
                                            toCiteText: queryZData.data.map[queryParams.toCiteCode] || code.toCiteText,
                                            secretStr: queryItem.split('|')[0],
                                            userIndex: userIndex
                                        });
                                    }
                                    stopFlag = true;
                                }
                            }
                        } catch (e) {
                            // 只做日志，不抛异常，保证主循环健壮
                            console.error('查询异常', e);
                        }
                    })());
                }
            }
        }
        // 所有查询完成后，决定是否继续下一轮
        await Promise.allSettled(pros);
        if (!stopFlag) {
            setTimeout(() => {
                startFunc();
            }, intervalTime || 3000);
        }
    }
    return {
        stop() {
            stopFlag = true;
        }
    }
}
