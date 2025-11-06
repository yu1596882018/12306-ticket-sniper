/**
 * ========================================
 * 余票查询模块（版本 2）
 * ========================================
 *
 * 功能：
 * 1. 定时轮询查询余票信息
 * 2. 支持多日期、多线路并发查询
 * 3. 智能筛选车次（时间段、指定车次、座位类型）
 * 4. 发现余票立即触发抢票
 * 5. 支持代理请求
 * 6. 时间段控制（6:00-23:00）
 *
 * 特点：
 * - Promise 并发处理
 * - 可配置查询间隔
 * - 支持任务停止控制
 * ========================================
 */

const superagent = require('superagent');
require('superagent-proxy')(superagent);
const setHeaders = require('./setHeaders');
const placeOrder = require('./placeOrder');
const { queryCookie } = require('./config');
const { openProxy, proxyUrl } = require('./localConfig');

/**
 * 查询任务主函数
 * @param {Array} queryListParams - 查询任务列表配置
 * @param {Number} intervalTime - 查询间隔时间（毫秒）
 * @returns {Object} 返回控制对象，包含 stop 方法
 */
module.exports = function ({ queryListParams: QLP, intervalTime }) {
    let isStopFlog = false;
    QLP.forEach(item => {
        if (!item.isEnd) {
            queryFunc();

            function queryFunc() {
                if (new Date().getHours() < 6 || new Date().getHours() >= 23) {
                    return setTimeout(queryFunc, 60 * 60 * 1000);
                }
                let pros = [];
                let flog = false;

                item.queryDates.forEach(queryDate => {
                    item.citeCodes.forEach(queryOpt => {
                        pros.push(
                            new Promise(async (resolve, reject) => {
                                try {
                                    // 查询
                                    let queryZResult = await setHeaders(
                                        openProxy
                                            ? superagent
                                                  .get(
                                                      'https://kyfw.12306.cn/otn/leftTicket/queryO'
                                                  )
                                                  .proxy(proxyUrl)
                                            : superagent.get(
                                                  'https://kyfw.12306.cn/otn/leftTicket/queryO'
                                              ),
                                        queryCookie
                                    ).query({
                                        'leftTicketDTO.train_date': queryDate,
                                        'leftTicketDTO.from_station': queryOpt.fromCode,
                                        'leftTicketDTO.to_station': queryOpt.toCode,
                                        purpose_codes: 'ADULT'
                                    });
                                    // console.log(queryZResult.body);
                                    // 筛选最优车次
                                    let resultItem = filterItem(
                                        queryZResult.body.data.result,
                                        queryOpt
                                    );
                                    if (resultItem) {
                                        console.log(
                                            '有票',
                                            `${queryDate}-${queryOpt.fromCiteText}-${queryOpt.toCiteText}`
                                        );
                                        if (!item.isEnd && !flog) {
                                            let citeMap = queryZResult.body.data.map;
                                            placeOrder(
                                                {
                                                    queryDate: queryDate,
                                                    fromCiteCode: queryOpt.fromCode,
                                                    toCiteCode: queryOpt.toCode,
                                                    fromCiteText:
                                                        citeMap[queryOpt.fromCode] ||
                                                        queryOpt.fromCiteText,
                                                    toCiteText:
                                                        citeMap[queryOpt.toCode] ||
                                                        queryOpt.toCiteText,
                                                    secretStr: resultItem.data[0],
                                                    userIndex: item.userIndex
                                                },
                                                item
                                            );
                                            flog = true;
                                        }
                                        reject(new Error('有'));
                                    } else {
                                        console.log(
                                            '无票',
                                            `${queryDate}-${queryOpt.fromCiteText}-${queryOpt.toCiteText}`
                                        );
                                        resolve('无');
                                    }
                                } catch (e) {
                                    reject(e);
                                    throw e;
                                }
                            })
                        );
                    });
                });

                Promise.all(pros).then(
                    res => {
                        if (!isStopFlog) {
                            setTimeout(queryFunc, intervalTime || 5000);
                        }
                    },
                    err => {
                        if (err.message !== '有') {
                            setTimeout(queryFunc, 0.2 * 60 * 1000);
                        }
                        throw err;
                    }
                );
            }
        }
    });

    return {
        stop() {
            isStopFlog = true;
        }
    };
};

// 筛选最优车次
function filterItem(data, queryOpt = {}) {
    let items = data;
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

    items = items
        .filter(item => {
            let arr = item.split('|');
            if (queryOpt.refuseCheci && queryOpt.refuseCheci.includes(arr[3])) {
                return false;
            }

            return (
                (queryOpt.checi ? queryOpt.checi.includes(arr[3]) : true) &&
                arr[11] === 'Y' &&
                ((arr[30] && arr[30] !== '无') || (arr[31] && arr[31] !== '无'))
            );
        })
        .map(item => {
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
            };
        });

    // 按所选车次排序
    if (queryOpt.checi) {
        items = queryOpt.checi
            .map(item => {
                return items.find(item2 => {
                    return item === item2.data[3];
                });
            })
            .filter(item => item);
    }

    let item = items.find(item => {
        return item.O;
    });

    if (!item && (queryOpt.seatType ? queryOpt.seatType.includes('M') : true)) {
        item = items.find(item => {
            return item.M;
        });
    }

    return item;
}
