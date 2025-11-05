// 手动设置 userCookie 脚本
// 用于将指定 Cookie 写入 Redis，便于调试

const userCookie = 'JSESSIONID=FEF661C02B6C1813843443A98217A318; tk=UfqZxL7hWoeak66T6pdn7jSma86qaGmowrm54X1nxo0dqy1y0; RAIL_DEVICEID=I5ZZi7zCZRKfK9DjCRN9CNKFikOuUnLTXNWvrw6_Dq4GU3vcPw4Lb6ZYj3eaUBOTYsx00UlJn7WpJYSSjol4DV562h5B1sqFGPSRsER8W6xfOOICmr2Uqq-oZtLutCkgLKkqjyMJmEtv6-0JC4k1ueBpiOilOy2C; RAIL_EXPIRATION=1579501773951; _jc_save_toStation=%u6F5C%u6C5F%2CQJN; _jc_save_wfdc_flag=dc; _jc_save_toDate=2020-01-17; _jc_save_fromDate=2020-01-20; _jc_save_fromStation=%u6DF1%u5733%2CSZQ; BIGipServerpassport=937951498.50215.0000; route=9036359bb8a8a461c164a04f8f50b252; BIGipServerotn=1911030026.50210.0000';

const redis = require('redis');
const localConfig = require('./../scripts/localConfig');
const redisDb = redis.createClient(6379, localConfig.redisHost);
redisDb.set('userCookie', userCookie, redis.print);
