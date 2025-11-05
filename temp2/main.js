// 批量余票查询示例脚本
// 支持多日期、多目的地循环查询，命中后终止

(async function () {
    // 目标站点及车次
    const toCiteCodes = [
        { code: 'LHA' },
        { code: 'SYQ', checi: ['G6142', 'G6174'] },
        { code: 'KAQ', checi: ['G6142', 'G6174'] }
    ];
    // 查询日期
    const queryDates = [
        '2020-01-18',
        '2020-01-19',
        '2020-01-20',
        '2020-01-21',
        '2020-01-22',
        '2020-01-23'
    ];
    let flag = false;
    const superagent = require('superagent');
    const setHeaders = require('./setHeaders');
    startFunc();
    // 主循环查询函数
    function startFunc () {
        var pros = [];
        queryDates.forEach(queryDate => {
            toCiteCodes.forEach(async code => {
                pros.push(new Promise(async (resolve, reject) => {
                    try {
                        if (!flag) {
                            const queryParams = {
                                fromCiteCode: 'SZQ',
                                toCiteCode: code.code,
                                queryDate: queryDate
                            };
                            // 查询余票
                            let queryZResult = await setHeaders(superagent.get('https://kyfw.12306.cn/otn/leftTicket/queryZ'))
                                .query({
                                    'leftTicketDTO.train_date': queryParams.queryDate,
                                    'leftTicketDTO.from_station': queryParams.fromCiteCode,
                                    'leftTicketDTO.to_station': queryParams.toCiteCode,
                                    purpose_codes: 'ADULT'
                                });
                            let queryZData = JSON.parse(queryZResult.text);
                            let queryItem = queryZData.data.result.find(item => {
                                let arr = item.split('|');
                                return (code.checi ? code.checi.includes(arr[3]) : true) && arr[11] === 'Y' && arr[30] !== '无' && arr[31] !== '无';
                            });
                            if (!queryItem) {
                                console.log('无票', queryParams.queryDate + code.code);
                            } else {
                                setTimeout(() => {
                                    console.log(queryItem, queryParams.queryDate + code.code + '有票');
                                }, 2000)
                                flag = true;
                            }
                            resolve();
                        } else {
                            console.log('结束');
                            reject();
                        }
                    } catch (e) {
                        reject();
                        throw e;
                    }
                }));
            });
        });
        // 所有查询完成后，决定是否继续下一轮
        Promise.all(pros).then(res => {
            setTimeout(() => {
                startFunc();
            }, 3000);
        });
    }
})();
