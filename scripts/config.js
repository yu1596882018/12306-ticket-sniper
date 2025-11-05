const redis = require('redis');
const localConfig = require('./localConfig');
const redisDb = redis.createClient(6379, localConfig.redisHost);
const redisPub = redis.createClient(6379, localConfig.redisHost);
const redisSub = redis.createClient(6379, localConfig.redisHost);

// 用户 Cookie（从 Redis 加载，或在首次运行时需要手动设置）
let userCookie = '';

redisDb.get('userCookie', function (err, v) {
    v && (userCookie = v);
});

module.exports = {
    redisPub,
    redisSub,
    redisDb,
    
    // 查询专用 Cookie（可选，如不提供则使用 userCookie）
    queryCookie: '',
    
    set userCookie (value) {
        redisDb.set('userCookie', value);
        userCookie = value;
    },
    
    get userCookie () {
        return userCookie;
    },
    
    // 默认使用的乘客索引
    userIndex: 0,
    
    /**
     * 乘客信息列表
     * 注意：需要在 12306 官网添加常用联系人后，通过抓包获取加密信息
     * 格式说明：
     * - passengerTicketStr: 乘客票务信息（包含加密字符串）
     * - oldPassengerStr: 旧版乘客信息格式
     * 
     * 示例配置：
     */
    userList: [
        {
            // 示例乘客 1
            passengerTicketStr: ',0,1,张三,1,430521199001011234,,N,加密字符串示例',
            oldPassengerStr: '张三,1,430521199001011234,1_'
        },
        {
            // 示例乘客 2
            passengerTicketStr: ',0,1,李四,1,430521199002021234,,N,加密字符串示例',
            oldPassengerStr: '李四,1,430521199002021234,1_'
        }
        // 可添加更多乘客...
    ],
    
    // 验证码图片缓存（内部使用，无需配置）
    codeImages: {},
    
    /**
     * 抢票查询配置
     */
    queryOptions: {
        // 查询间隔时间（毫秒），建议不低于 500ms，避免请求过于频繁
        intervalTime: 500,
        
        /**
         * 查询任务列表
         * 每个任务包含以下配置：
         * - userIndex: 乘客索引（对应 userList 数组下标）
         * - isEnd: 抢到票后是否停止该任务
         * - queryDates: 查询日期列表（格式：YYYY-MM-DD）
         * - citeCodes: 线路列表（可配置多条线路）
         *   - fromCode: 始发站代码
         *   - fromCiteText: 始发站名称
         *   - toCode: 终点站代码
         *   - toCiteText: 终点站名称
         *   - scheduleTime: 时间段筛选（可选）
         *     - startTime: 开始时间（如 '08:00'）
         *     - endTime: 结束时间（如 '20:00'）
         *   - checi: 指定车次（可选，数组）
         *   - seatType: 座位类型（可选，['O']=二等座, ['M']=一等座）
         */
        queryListParams: [
            // 示例任务 1：深圳 -> 广州（指定时间段）
            {
                userIndex: 0,
                isEnd: true,
                queryDates: [
                    '2024-02-10',
                ],
                citeCodes: [
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'GZQ',
                        toCiteText: '广州',
                        scheduleTime: {
                            startTime: '08:00',
                            endTime: '20:00'
                        }
                    }
                ]
            },
            // 示例任务 2：北京 -> 上海（指定车次）
            {
                userIndex: 1,
                isEnd: true,
                queryDates: [
                    '2024-02-10',
                    '2024-02-11'
                ],
                citeCodes: [
                    {
                        fromCode: 'BJP',
                        fromCiteText: '北京',
                        toCode: 'SHH',
                        toCiteText: '上海',
                        checi: [
                            'G1',
                            'G3',
                            'G5'
                        ]
                    }
                ]
            },
            // 示例任务 3：多线路备选方案
            {
                userIndex: 0,
                isEnd: false,
                queryDates: [
                    '2024-02-10',
                ],
                citeCodes: [
                    {
                        fromCode: 'GZQ',
                        fromCiteText: '广州',
                        toCode: 'CSQ',
                        toCiteText: '长沙'
                    },
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'CSQ',
                        toCiteText: '长沙'
                    }
                ]
            }
            
            /**
             * 更多任务配置...
             * 可以根据实际需求添加更多查询任务
             * 
             * 配置技巧：
             * 1. 多日期：提高抢票成功率
             * 2. 多线路：配置备选方案（如广州中转、深圳中转）
             * 3. 指定车次：针对热门车次精准抢票
             * 4. 时间段筛选：避开不合适的车次
             * 5. isEnd 控制：抢到一张票后是否继续其他任务
             */
        ]
    }
}

/*
 * ==================== 历史配置参考 ====================
 * 2020 年春运期间的实际配置案例
 * 成功帮助本人及多位同事/朋友抢到车票 ✅
 * 
 * 配置要点：
 * - 多线路备选：广州南/深圳北 同时监控
 * - 多日期查询：连续 3-5 天 提高成功率
 * - 指定热门车次：精准抢票
 * - 时间段筛选：只抢白天车次
 * - 多乘客配置：同时帮多人抢票
 * 
 * 实际成果：
 * ✓ 深圳 -> 广州
 * ✓ 广州/深圳 -> 武汉/潜江
 * ✓ 北京 -> 长沙/武汉
 * ✓ 深圳北 -> 怀化南
 * ✓ 昆明 -> 深圳
 * ✓ 等多条线路，共帮助 10+ 人成功抢到车票
 */
