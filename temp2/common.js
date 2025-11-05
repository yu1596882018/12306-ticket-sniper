// 批量日期循环余票查询示例
// 支持多天自动循环查询，命中后终止

let flag = false, func, index = 0;
module.exports = func = (queryDate) => {
    (async function () {
        if (flag) {
            console.log('结束');
            return false;
        }
        const superagent = require('superagent');
        const setHeaders = require('./setHeaders');
        const queryParams = {
            fromCiteCode: 'SZQ',
            // toCiteCode: 'KAQ',
            toCiteCode: 'LHA',
            fromCiteText: '深圳北',
            toCiteText: '隆回',
            // toCiteText: '怀化南',
            seatType: 'O', // M一等座 O二等座
        };
        // 查询余票
        let queryZResult = await setHeaders(superagent.get('https://kyfw.12306.cn/otn/leftTicket/queryZ'))
            .query({
                'leftTicketDTO.train_date': queryDate,
                'leftTicketDTO.from_station': queryParams.fromCiteCode,
                'leftTicketDTO.to_station': queryParams.toCiteCode,
                purpose_codes: 'ADULT'
            });
        console.log('queryZResult', queryZResult.text);
        let queryZData = JSON.parse(queryZResult.text);
        let queryItem = queryZData.data.result.find(item => {
            let arr = item.split('|');
            return (arr[3] === 'G6142' || arr[3] === 'G6174') && arr[11] === 'Y';
        });
        if (!queryItem) {
            console.log('无票', queryDate);
            setTimeout(() => {
                arguments.callee();
            }, 1000);
            return false;
        }
        let queryItemArr = queryItem.split('|');
        console.log(queryItem, queryDate + '有票');
        flag = true;
    })();
}
// 多天循环调用
const timer = setInterval(function () {
    if (index < 7) {
        let queryDate = '2020-01-' + (18 + index);
        index++;
        console.log(queryDate);
        func(queryDate);
    } else {
        clearInterval(timer);
    }
}, 500);
