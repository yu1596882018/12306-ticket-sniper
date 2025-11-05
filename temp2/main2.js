// 12306 抢票全流程演示脚本
// 包含余票查询、登录校验、下单、队列、订单查询等完整流程

(async () => {
    const superagent = require('superagent');
    const moment = require('moment');
    const setHeaders = require('./setHeaders');
    const queryDate = '2020-01-07';
    const queryParams = {
        fromCiteCode: 'SZQ',
        toCiteCode: 'LHA',
        fromCiteText: '深圳北',
        toCiteText: '隆回',
        seatType: '', // M一等座 O二等座
    };
    // 1. 查询余票
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
        return arr[11] === 'Y';
    });
    if (!queryItem) {
        console.log('无票');
        return false;
    }
    let queryItemArr = queryItem.split('|');
    // 2. 校验登录
    let checkUserResult = await setHeaders(superagent.post('https://kyfw.12306.cn/otn/login/checkUser'))
        .send({ _json_att: '' });
    console.log('checkUserResult', checkUserResult.text);
    let checkUserData = JSON.parse(checkUserResult.text);
    if (!checkUserData.data.flag) {
        console.log('cookie失效');
        return false;
    }
    // 3. 提交预订
    let submitOrderRequestResult = await setHeaders(superagent.post('https://kyfw.12306.cn/otn/leftTicket/submitOrderRequest'))
        .send({
            secretStr: decodeURIComponent(queryItemArr[0]),
            train_date: queryDate,
            back_train_date: moment().format("YYYY-MM-DD"),
            tour_flag: 'dc',
            purpose_codes: 'ADULT',
            query_from_station_name: queryParams.fromCiteText,
            query_to_station_name: queryParams.toCiteText,
            undefined: ''
        });
    console.log('submitOrderRequestResult', submitOrderRequestResult.text);
    // 4. 获取下单所需参数
    let initDcResult = await setHeaders(superagent.post('https://kyfw.12306.cn/otn/confirmPassenger/initDc'))
        .send({ _json_att: '' });
    const globalRepeatSubmitToken = /var globalRepeatSubmitToken = '(.*)';/.exec(initDcResult.text)[1];
    const leftTicketStr = /'leftTicketStr':'([^']*)'/.exec(initDcResult.text)[1];
    const key_check_isChange = /'key_check_isChange':'([^']*)'/.exec(initDcResult.text)[1];
    const train_no = /'train_no':'([^']*)'/.exec(initDcResult.text)[1];
    const station_train_code = /'station_train_code':'([^']*)'/.exec(initDcResult.text)[1];
    const purpose_codes = /'purpose_codes':'([^']*)'/.exec(initDcResult.text)[1];
    const train_location = /'train_location':'([^']*)'/.exec(initDcResult.text)[1];
    const leftDetails = eval(`[${/'leftDetails':\[([^\]]*)\]/.exec(initDcResult.text)[1]}]`);
    console.log(globalRepeatSubmitToken, leftTicketStr, key_check_isChange, train_no, station_train_code, leftDetails);
    // 判断座席类型
    leftDetails.forEach(item => {
        if (/二等座/.test(item)) {
            if (/无票/.test(item)) {
                console.log('O无票');
            } else {
                console.log('O有票');
                queryParams.seatType = 'O';
            }
        } else if (/一等座/.test(item)) {
            if (/无票/.test(item)) {
                console.log('M无票');
            } else {
                console.log('M有票');
                queryParams.seatType !== 'O' && (queryParams.seatType = 'M');
            }
        }
    });
    console.log(queryParams.seatType);
    if (!queryParams.seatType) {
        return console.log('一等座、二等座无票');
    }
    // 5. 提交订单
    let checkOrderInfoResult = await setHeaders(superagent.post('https://kyfw.12306.cn/otn/confirmPassenger/checkOrderInfo'))
        .send({
            cancel_flag: '2',
            bed_level_order_num: '000000000000000000000000000000',
            passengerTicketStr: `${queryParams.seatType},0,1,王鑫宇,1,4305***********07X,,N,e271857d7ae6ac3eb9bf28977ba10d922046fe2ff813868c510734672c2af342`,
            oldPassengerStr: '王鑫宇,1,4305***********07X,1_',
            tour_flag: 'dc',
            randCode: '',
            whatsSelect: '1',
            sessionId: '',
            sig: '',
            scene: 'nc_login',
            _json_att: '',
            REPEAT_SUBMIT_TOKEN: globalRepeatSubmitToken
        });
    console.log('checkOrderInfoResult', checkOrderInfoResult.text);
    let checkOrderInfoData = JSON.parse(checkOrderInfoResult.text);
    if (checkOrderInfoData.data.submitStatus === false) {
        return false;
    }
    // 6. 查询余票队列
    let getQueueCountResult = await setHeaders(superagent.post('https://kyfw.12306.cn/otn/confirmPassenger/getQueueCount'))
        .send({
            train_date: new Date(queryDate).toString(),
            train_no: train_no,
            stationTrainCode: station_train_code,
            seatType: queryParams.seatType,
            fromStationTelecode: queryParams.fromCiteCode,
            toStationTelecode: queryParams.toCiteCode,
            leftTicket: leftTicketStr,
            purpose_codes: purpose_codes,
            train_location: train_location,
            _json_att: '',
            REPEAT_SUBMIT_TOKEN: globalRepeatSubmitToken
        });
    console.log('getQueueCountResult', getQueueCountResult.text);
    let getQueueCountData = JSON.parse(getQueueCountResult.text);
    if (!getQueueCountData.status || +getQueueCountData.data.ticket <= 0) {
        return false;
    }
    // 7. 确认排队购票
    let confirmSingleForQueueResult = await setHeaders(superagent.post('https://kyfw.12306.cn/otn/confirmPassenger/confirmSingleForQueue'))
        .send({
            passengerTicketStr: `${queryParams.seatType},0,1,王鑫宇,1,4305***********07X,,N,e271857d7ae6ac3eb9bf28977ba10d922046fe2ff813868c510734672c2af342`,
            oldPassengerStr: '王鑫宇,1,4305***********07X,1_',
            randCode: '',
            purpose_codes: purpose_codes,
            key_check_isChange: key_check_isChange,
            leftTicketStr: leftTicketStr,
            train_location: train_location,
            choose_seats: '1F',
            seatDetailType: '000',
            whatsSelect: '1',
            roomType: '00',
            dwAll: 'N',
            _json_att: '',
            REPEAT_SUBMIT_TOKEN: globalRepeatSubmitToken
        });
    console.log('confirmSingleForQueueResult', confirmSingleForQueueResult.text);
    // 8. 轮询获取订单号
    let orderId = null;
    await (async function () {
        await new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });
        let queryOrderWaitTimeResult = await setHeaders(superagent.get('https://kyfw.12306.cn/otn/confirmPassenger/queryOrderWaitTime'))
            .query({
                random: Date.now(),
                tourFlag: 'dc',
                _json_att: '',
                REPEAT_SUBMIT_TOKEN: globalRepeatSubmitToken
            });
        console.log('queryOrderWaitTimeResult', queryOrderWaitTimeResult.text);
        let queryOrderWaitTimeData = JSON.parse(queryOrderWaitTimeResult.text);
        if (queryOrderWaitTimeData.data.orderId) {
            console.log('orderId', orderId = queryOrderWaitTimeData.data.orderId);
        } else {
            if (queryOrderWaitTimeData.data.queryOrderWaitTimeStatus) {
                await arguments.callee();
            }
        }
    })();
    // 9. 查询下单结果
    let resultOrderForDcQueueResult = await setHeaders(superagent.post('https://kyfw.12306.cn/otn/confirmPassenger/resultOrderForDcQueue'))
        .send({
            orderSequence_no: orderId,
            _json_att: '',
            REPEAT_SUBMIT_TOKEN: globalRepeatSubmitToken
        });
    console.log('resultOrderForDcQueueResult', resultOrderForDcQueueResult.text);
    let resultOrderForDcQueueData = JSON.parse(resultOrderForDcQueueResult.text);
    if (resultOrderForDcQueueData.data.submitStatus) {
        console.log('抢票成功');
    }
})();
