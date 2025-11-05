// 全局配置文件，集中管理 Redis、用户、抢票参数等
// 支持多用户、多任务队列，便于扩展和维护

const redis = require('redis');
const localConfig = require('./localConfig');

// 创建 Redis 客户端（发布、订阅、数据）
const redisDb = redis.createClient(localConfig.redisPort, localConfig.redisHost);
const redisPub = redis.createClient(localConfig.redisPort, localConfig.redisHost);
const redisSub = redis.createClient(localConfig.redisPort, localConfig.redisHost);

// 用户 Cookie，初始值可被 Redis 持久化覆盖
let userCookie = '_uab_collina=157745159966575018197823; JSESSIONID=7B0D33004DC1C0A0704294C59B1E4DAE; tk=eys8gd8FcgrwPqa4mx2JmM9QLJSbetcFd2mjEzHv1l892y1y0; _jc_save_wfdc_flag=dc; RAIL_EXPIRATION=1581315940103; RAIL_DEVICEID=nWxI6bdTX3uD9q_rVvegqxogtVBfUHYDKwSAtpZuSRdm4avENLF4FmsB3MAe7nM-xgePLg2uVyzlIER1qe3Ohbd5SZGjvZZSsDTYtWR4RPSW3_VqHxQicWK45gZt5jQQmmpmSUW40E8-SxuYgVu58N1jQG9QE4Nv; BIGipServerotn=1944584458.50210.0000; BIGipServerpassport=904397066.50215.0000; route=6f50b51faa11b987e576cdb301e545c4; _jc_save_fromStation=%u90F4%u5DDE%2CCZQ; _jc_save_toStation=%u6DF1%u5733%2CSZQ; _jc_save_toDate=2020-02-08; _jc_save_fromDate=2020-02-10';

redisDb.get('userCookie', function (err, v) {
    v && (userCookie = v);
});

module.exports = {
    // Redis 客户端
    redisPub,
    redisSub,
    redisDb,
    // 查询请求时附带的 Cookie（部分接口需要）
    queryCookie: 'JSESSIONID=3E1C3A2D210B604DB43112717910250E; BIGipServerotn=4023845130.64545.0000; RAIL_EXPIRATION=1579525477039; RAIL_DEVICEID=XTh46ZjPAHC68X3ae9-lB271gkMtsNzpznJBUxiu79as-3EfFzhf9xk_qG5IU1Bso8kZJMAcvJpxGjJiXraa-4glwSJcd9lQEO48f-czcgRkb2D1yRhoyUykslSeF6qUktvZzbKX_69ms9Pg3HMQCPk2FG9faLNZ; BIGipServerpassport=837288202.50215.0000; route=495c805987d0f5c8c84b14f60212447d; _jc_save_fromStation=%u6DF1%u5733%2CSZQ; _jc_save_toStation=%u6F5C%u6C5F%2CQJN; _jc_save_fromDate=2020-01-20; _jc_save_toDate=2020-01-17; _jc_save_wfdc_flag=dc',
    // 动态设置和获取 userCookie，自动同步到 Redis
    set userCookie (value) {
        redisDb.set('userCookie', value);
        userCookie = value;
    },
    get userCookie () {
        return userCookie;
    },
    // 当前默认用户索引（可切换）
    userIndex: 3,
    // 乘客信息列表（支持多用户抢票）
    userList: [
        {
            passengerTicketStr: ',0,1,王鑫宇,1,4305***********07X,,N,e271857d7ae6ac3eb9bf28977ba10d922046fe2ff813868c510734672c2af342',
            oldPassengerStr: '王鑫宇,1,4305***********07X,1_'
        },
        {
            passengerTicketStr: ',0,1,王小康,1,4305***********061,18620340280,N,f8902b6d4122c7c6d692858ec080717a29b7c37717eacca08b54cbc20bbeb1c3bbb71e668c295e2e3fb430bb3ee0b00b',
            oldPassengerStr: '王小康,1,4305***********061,1_'
        },
        {
            passengerTicketStr: ',0,1,张志,1,4211***********618,,N,0f7e1f7e9b2f96c2d388be88577331cad64339173279d33b6a2aeaeef8dd30c0',
            oldPassengerStr: '张志,1,4211***********618,1_'
        },
        {
            passengerTicketStr: ',0,1,曾洪,1,3603***********067,,N,480a7ac44c891a57deaa0e81620cc8d0616ea8119f7444367185d55994d695b6',
            oldPassengerStr: '曾洪,1,3603***********067,1_'
        },
        {
            passengerTicketStr: ',0,1,梅俊涛,1,5303***********216,,N,741370a86e54a6822104c78c9510d588e9282b975fa46c0fafab52d31fa6ef84',
            oldPassengerStr: '梅俊涛,1,5303***********216,1_'
        },
        {
            passengerTicketStr: ',0,1,李俊,1,4310***********415,,N,ded9fe206d7fce7a8fdb4a4a1410c524f237ed8bd15f2d8708e8fecc11e6c297',
            oldPassengerStr: '李俊,1,4310***********415,1_'
        },
        {
            passengerTicketStr: ',0,1,何桂平,1,4311***********118,,N,a46903a2d3130dcc219d3390d6c0b3d792819454319703823ae8add0e76cc767',
            oldPassengerStr: '何桂平,1,4311***********118,1_'
        },
        {
            passengerTicketStr: ',0,1,刘欢,1,3607***********125,,N,e3f3b17499fdd97e3ecfd7d244c52c5892a6122e95c6154941ce0b356795ff4d',
            oldPassengerStr: '刘欢,1,3607***********125,1_'
        },
        {
            passengerTicketStr: ',0,1,汪艳,1,4290***********307,,N,91ff4ac35718e294fb2207ff93693dce66274e99985e88474c6d8753ca9a01e3',
            oldPassengerStr: '汪艳,1,4290***********307,1_'
        },
        {
            passengerTicketStr: ',0,1,罗丽思,1,4310***********048,173****9117,N,dc74cb2067a549d10c6fe5b985e6d479cda4d6ba393a2e3b5e3b31c1e9769564f7897b1ebedf3fc3974351bef36d072e0927d2f3e2c13e33d6bc356ab25c632e',
            oldPassengerStr: '罗丽思,1,4310***********048,1_'
        }
    ],
    // 验证码图片缓存
    codeImages: {},
    // 抢票参数配置（支持多任务/多用户）
    queryOptions: {
        intervalTime: 500, // 查询间隔（毫秒）
        queryListParams: [
            {
                userIndex: 0,
                isEnd: true,
                queryDates: [
                    '2020-02-10',
                ],
                citeCodes: [
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'GZQ',
                        toCiteText: '广州',
                        scheduleToSiteCode: 'IZQ',
                        scheduleTime: {
                            startTime: '18:00',
                            endTime: ''
                        }
                    }
                ]
            },
            {
                userIndex: 9,
                isEnd: false,
                queryDates: [
                    '2020-02-10',
                ],
                citeCodes: [
                    {
                        fromCode: 'ICQ',
                        fromCiteText: '郴州西',
                        toCode: 'SZQ',
                        toCiteText: '深圳'
                    },
                    {
                        fromCode: 'ICQ',
                        fromCiteText: '郴州西',
                        toCode: 'GZQ',
                        toCiteText: '广州',
                        scheduleTime: {
                            startTime: '09:00',
                            endTime: '20:00'
                        }
                    }
                ]
            },
            {
                userIndex: 8,
                isEnd: true,
                queryDates: [
                    '2020-01-19',
                ],
                citeCodes: [
                    {
                        fromCode: 'GZQ',
                        fromCiteText: '广州',
                        toCode: 'WHN',
                        toCiteText: '武汉'
                    },
                    {
                        fromCode: 'GZQ',
                        fromCiteText: '广州',
                        toCode: 'QJN',
                        toCiteText: '潜江'
                    },
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'WHN',
                        toCiteText: '武汉'
                    },
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'QJN',
                        toCiteText: '潜江'
                    },
                ]
            },
            {
                userIndex: 8,
                isEnd: true,
                queryDates: [
                    '2020-01-20',
                ],
                citeCodes: [
                    {
                        fromCode: 'GZQ',
                        fromCiteText: '广州',
                        toCode: 'WHN',
                        toCiteText: '武汉'
                    },
                    {
                        fromCode: 'GZQ',
                        fromCiteText: '广州',
                        toCode: 'QJN',
                        toCiteText: '潜江'
                    },
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'WHN',
                        toCiteText: '武汉'
                    },
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'QJN',
                        toCiteText: '潜江'
                    },
                ]
            },
            {
                userIndex: 8,
                isEnd: true,
                queryDates: [
                    '2020-01-21',
                ],
                citeCodes: [
                    {
                        fromCode: 'GZQ',
                        fromCiteText: '广州',
                        toCode: 'WHN',
                        toCiteText: '武汉'
                    },
                    {
                        fromCode: 'GZQ',
                        fromCiteText: '广州',
                        toCode: 'QJN',
                        toCiteText: '潜江'
                    },
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'WHN',
                        toCiteText: '武汉'
                    },
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'QJN',
                        toCiteText: '潜江'
                    },
                ]
            },
            {
                userIndex: 8,
                isEnd: true,
                queryDates: [
                    '2020-01-22',
                ],
                citeCodes: [
                    {
                        fromCode: 'GZQ',
                        fromCiteText: '广州',
                        toCode: 'WHN',
                        toCiteText: '武汉'
                    },
                    {
                        fromCode: 'GZQ',
                        fromCiteText: '广州',
                        toCode: 'QJN',
                        toCiteText: '潜江'
                    },
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'WHN',
                        toCiteText: '武汉'
                    },
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'QJN',
                        toCiteText: '潜江'
                    },
                ]
            },
            /*{
                userIndex: 7,
                isEnd: false,
                queryDates: [
                    '2020-01-21',
                    '2020-01-22',
                ],
                citeCodes: [
                    /!*{
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'XMS',
                        toCiteText: '厦门'
                    },*!/
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'RJG',
                        toCiteText: '瑞金'
                    },
                    {
                        fromCode: 'XMS',
                        fromCiteText: '厦门',
                        toCode: 'RJG',
                        toCiteText: '瑞金'
                    }
                ]
            },
            {
                userIndex: 6,
                isEnd: false,
                queryDates: [
                    '2020-02-01',
                ],
                citeCodes: [
                    {
                        fromCode: 'ICQ',
                        fromCiteText: '郴州西',
                        toCode: 'SZQ',
                        toCiteText: '深圳'
                    },
                    {
                        fromCode: 'ICQ',
                        fromCiteText: '郴州西',
                        toCode: 'GZQ',
                        toCiteText: '广州',
                        scheduleTime: {
                            startTime: '09:00',
                            endTime: '20:00'
                        }
                    }
                ]
            },
            {
                userIndex: 0,
                isEnd: false,
                queryDates: [
                    '2020-02-01',
                ],
                citeCodes: [
                    {
                        fromCode: 'KAQ',
                        fromCiteText: '怀化南',
                        toCode: 'IOQ',
                        toCiteText: '深圳北',
                        checi: [
                            'G6173'
                        ]
                    }
                ]
            },*/
            {
                userIndex: 4,
                isEnd: true,
                queryDates: [
                    '2020-02-02',
                    '2020-02-03',
                ],
                citeCodes: [
                    {
                        fromCode: 'KMM',
                        fromCiteText: '昆明',
                        toCode: 'SZQ',
                        toCiteText: '深圳',
                        seatType: ['O']
                    }
                ]
            },
            {
                userIndex: 3,
                isEnd: true,
                queryDates: [
                    '2020-01-20',
                    '2020-01-21'
                ],
                citeCodes: [
                    {
                        fromCode: 'GZQ',
                        fromCiteText: '广州',
                        toCode: 'PXG',
                        toCiteText: '萍乡北'
                    },
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'PXG',
                        toCiteText: '萍乡北'
                    },
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'CSQ',
                        toCiteText: '长沙',
                        // refuseCheci: ['G6024'],
                        /*scheduleTime: {
                            startTime: '07:30',
                            endTime: '21:00'
                        }*/
                    }
                ]
            },
            {
                userIndex: 3,
                isEnd: true,
                queryDates: [
                    '2020-02-07',
                    '2020-02-08',
                    '2020-02-09',
                    '2020-02-10',
                ],
                citeCodes: [
                    {
                        toCode: 'SZQ',
                        toCiteText: '深圳',
                        fromCode: 'PXG',
                        fromCiteText: '萍乡北'
                    },
                    {
                        toCode: 'SZQ',
                        toCiteText: '深圳',
                        fromCode: 'CSQ',
                        fromCiteText: '长沙',
                        scheduleTime: {
                            startTime: '10:00',
                        }
                    }
                ]
            },
            {
                userIndex: 5,
                isEnd: true,
                queryDates: [
                    '2020-01-20',
                    '2020-01-21',
                ],
                citeCodes: [
                    {
                        fromCode: 'BJP',
                        fromCiteText: '北京西',
                        toCode: 'CSQ',
                        toCiteText: '长沙南',
                        /*checi: [
                            'G403',
                            'G79'
                        ]*/
                    },
                    {
                        fromCode: 'BJP',
                        fromCiteText: '北京西',
                        toCode: 'WHN',
                        toCiteText: '武汉',
                        scheduleTime: {
                            startTime: '09:00',
                            endTime: '16:00'
                        }
                    }
                ]
            },
            {
                userIndex: 4,
                isEnd: true,
                queryDates: [
                    '2020-01-17',
                    '2020-01-18'
                ],
                citeCodes: [
                    {
                        fromCode: 'IOQ',
                        fromCiteText: '深圳北',
                        toCode: 'KAQ',
                        toCiteText: '怀化南',
                        checi: [
                            'G6174',
                            'G6142'
                        ]
                    }/*,
                    {
                        fromCode: 'IOQ',
                        fromCiteText: '深圳北',
                        toCode: 'LHA',
                        toCiteText: '隆回'
                    },
                    {
                        fromCode: 'IOQ',
                        fromCiteText: '深圳北',
                        toCode: 'SYQ',
                        toCiteText: '邵阳',
                        checi: [
                            'G6174',
                            'G6142'
                        ]
                    },
                    {
                        fromCode: 'IZQ',
                        fromCiteText: '广州南',
                        toCode: 'LHA',
                        toCiteText: '隆回'
                    }*/
                ]
            },
            {
                userIndex: 0,
                isEnd: true,
                queryDates: [
                    '2020-01-17',
                    '2020-01-18',
                ],
                citeCodes: [
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'SYQ',
                        toCiteText: '邵阳'
                    },
                    {
                        fromCode: 'GZQ',
                        fromCiteText: '广州',
                        toCode: 'SYQ',
                        toCiteText: '邵阳'
                    },
                    {
                        fromCode: 'SZQ',
                        fromCiteText: '深圳',
                        toCode: 'KAQ',
                        toCiteText: '怀化南',
                        checi: [
                            'G6174',
                            'G6142',
                        ]
                    },
                    {
                        fromCode: 'GZQ',
                        fromCiteText: '广州',
                        toCode: 'KAQ',
                        toCiteText: '怀化南',
                        checi: [
                            "G9630", "G6170", "G6142", "G6174", "G6172", "G9624", "G2956", "G9632", "G6152", "G9622"
                        ]
                    },
                ]
            }
        ]
    }
}
