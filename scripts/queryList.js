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
    let flag = false;
    const superagent = require('superagent');
    const setHeaders = require('./setHeaders');
    startFunc();
    function startFunc() {
        let pros = [];
        // 遍历所有日期和车站组合
        queryListParams.forEach(param => {
            const { queryDates, toCiteCodes, userIndex } = param;
            queryDates.forEach(queryDate => {
                toCiteCodes.forEach(async code => {
                    pros.push(new Promise(async (resolve, reject) => {
                        try {
                            if (!flag) {
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
                                    if (!flag) {
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
                                    flag = true;
                                }
                                resolve();
                            } else {
                                console.log('结束');
                                reject();
                            }
                        } catch (e) {
                            reject(e);
                        }
                    }));
                });
            });
        });
        // 所有查询完成后，决定是否继续下一轮
        Promise.all(pros).then(res => {
            setTimeout(() => {
                startFunc();
            }, intervalTime || 3000);
        }, err => {
            console.log('查询异常', err);
        });
    }
    return {
        stop() {
            flag = true;
        }
    }
}
