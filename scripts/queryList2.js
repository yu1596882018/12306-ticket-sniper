// 查询余票并自动下单主逻辑
// 支持多用户、多任务并发，自动筛选最优车次并调用下单模块

const superagent = require('superagent');
require('superagent-proxy')(superagent);
const setHeaders = require('./setHeaders');
const placeOrder = require('./placeOrder');
const { queryCookie } = require('./config');
const { openProxy, proxyUrl } = require('./localConfig');

/**
 * 启动抢票任务
 * @param {Object} options - 配置项
 * @param {Array} options.queryListParams - 任务参数列表
 * @param {number} options.intervalTime - 查询间隔
 * @returns {Object} 控制对象
 */
module.exports = function ({ queryListParams: QLP, intervalTime }) {
    let stopFlag = false;
    (async function mainLoop() {
        let pros = [];
        for (const item of QLP) {
            if (!item.isEnd) {
                for (const queryDate of item.queryDates) {
                    for (const queryOpt of item.citeCodes) {
                        pros.push((async () => {
                            try {
                                // 查询余票
                                let queryZResult = await setHeaders((openProxy ?
                                    superagent.get('https://kyfw.12306.cn/otn/leftTicket/queryO').proxy(proxyUrl) :
                                    superagent.get('https://kyfw.12306.cn/otn/leftTicket/queryO')), queryCookie)
                                    .query({
                                        'leftTicketDTO.train_date': queryDate,
                                        'leftTicketDTO.from_station': queryOpt.fromCode,
                                        'leftTicketDTO.to_station': queryOpt.toCode,
                                        purpose_codes: 'ADULT'
                                    });
                                // 筛选最优车次
                                let resultItem = filterItem(queryZResult.body.data.result, queryOpt);
                                if (resultItem) {
                                    console.log('有票', `${queryDate}-${queryOpt.fromCiteText}-${queryOpt.toCiteText}`);
                                    if (!item.isEnd) {
                                        let citeMap = queryZResult.body.data.map;
                                        // 自动下单
                                        placeOrder({
                                            queryDate: queryDate,
                                            fromCiteCode: queryOpt.fromCode,
                                            toCiteCode: queryOpt.toCode,
                                            fromCiteText: citeMap[queryOpt.fromCode] || queryOpt.fromCiteText,
                                            toCiteText: citeMap[queryOpt.toCode] || queryOpt.toCiteText,
                                            secretStr: resultItem.data[0],
                                            userIndex: item.userIndex
                                        }, item);
                                    }
                                    // 有票后本轮终止
                                    stopFlag = true;
                                } else {
                                    console.log('无票', `${queryDate}-${queryOpt.fromCiteText}-${queryOpt.toCiteText}`);
                                }
                            } catch (e) {
                                // 只做日志，不抛异常，保证主循环健壮
                                console.error('查询异常', e);
                            }
                        })());
                    }
                }
            }
        }
        await Promise.allSettled(pros);
        if (!stopFlag) {
            setTimeout(mainLoop, intervalTime || 5000);
        }
    })();
    return {
        stop() {
            stopFlag = true;
        }
    }
}

/**
 * 筛选最优车次
 * @param {Array} data - 车次原始数据
 * @param {Object} queryOpt - 查询参数
 * @returns {Object|null} 最优车次对象
 */
function filterItem(data, queryOpt = {}) {
    let items = data;
    // 按时间段、到站筛选
    if (queryOpt.scheduleTime) {
        items = items.filter(item => {
            let arr = item.split('|');
            let currentTime = +arr[8].replace(':', '');
            if (queryOpt.scheduleTime.startTime) {
                if (currentTime < +queryOpt.scheduleTime.startTime.replace(':', '')) {
                    return false;
                }
            }
            if (queryOpt.scheduleTime.endTime) {
                if (currentTime > +queryOpt.scheduleTime.endTime.replace(':', '')) {
                    return false;
                }
            }
            if (queryOpt.scheduleToSiteCode && arr[7] !== queryOpt.scheduleToSiteCode) {
                return false;
            }
            return true;
        });
    }
    // 按车次、余票筛选
    items = items.filter(item => {
        let arr = item.split('|');
        if (queryOpt.refuseCheci && queryOpt.refuseCheci.includes(arr[3])) {
            return false;
        }
        return (queryOpt.checi ? queryOpt.checi.includes(arr[3]) : true) && arr[11] === 'Y' && ((arr[30] && arr[30] !== '无') || (arr[31] && arr[31] !== '无'));
    }).map(item => {
        let arr = item.split('|');
        let O, M;
        if (!arr[30] || arr[30] === '无') {
            O = 0;
        } else {
            O = arr[30];
        }
        if (!arr[31] || arr[31] === '无') {
            M = 0;
        } else {
            M = arr[31];
        }
        return {
            data: arr,
            O,
            M
        }
    });
    // 按所选车次排序
    if (queryOpt.checi) {
        items = queryOpt.checi.map(item => {
            return items.find(item2 => {
                return item === item2.data[3];
            });
        }).filter(item => item);
    }
    // 优先二等座
    let item = items.find(item => {
        return item.O;
    });
    // 其次一等座
    if (!item && (queryOpt.seatType ? queryOpt.seatType.includes('M') : true)) {
        item = items.find(item => {
            return item.M;
        });
    }
    return item;
}

