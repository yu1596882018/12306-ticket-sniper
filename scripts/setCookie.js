// Cookie 初始化工具
// 用于手动设置初始 userCookie 到 Redis

const redis = require('redis');
const localConfig = require('./localConfig');
const redisDb = redis.createClient(6379, localConfig.redisHost);
// 设置初始 userCookie（仅首次部署或调试用）
redisDb.set('userCookie', '_uab_collina=157745159966575018197823; JSESSIONID=7B0D33004DC1C0A0704294C59B1E4DAE; tk=eys8gd8FcgrwPqa4mx2JmM9QLJSbetcFd2mjEzHv1l892y1y0; _jc_save_wfdc_flag=dc; RAIL_EXPIRATION=1581315940103; RAIL_DEVICEID=nWxI6bdTX3uD9q_rVvegqxogtVBfUHYDKwSAtpZuSRdm4avENLF4FmsB3MAe7nM-xgePLg2uVyzlIER1qe3Ohbd5SZGjvZZSsDTYtWR4RPSW3_VqHxQicWK45gZt5jQQmmpmSUW40E8-SxuYgVu58N1jQG9QE4Nv; BIGipServerotn=1944584458.50210.0000; BIGipServerpassport=904397066.50215.0000; route=6f50b51faa11b987e576cdb301e545c4; _jc_save_fromStation=%u90F4%u5DDE%2CCZQ; _jc_save_toStation=%u6DF1%u5733%2CSZQ; _jc_save_toDate=2020-02-08; _jc_save_fromDate=2020-02-10', redis.print);
