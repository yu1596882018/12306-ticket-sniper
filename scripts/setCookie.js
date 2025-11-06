/**
 * ========================================
 * Cookie 设置工具
 * ========================================
 *
 * 功能：手动设置 Cookie 到 Redis
 * 用法：修改下面的 Cookie 值，然后运行 node scripts/setCookie.js
 * ========================================
 */

const redis = require('redis');
const localConfig = require('./localConfig');
const redisDb = redis.createClient(6379, localConfig.redisHost);

// 从 12306 登录后获取的 Cookie
// 替换为你自己的 Cookie
const cookieValue = 'your_cookie_here';

// 设置到 Redis
redisDb.set('userCookie', cookieValue, redis.print);

console.log('Cookie 已设置到 Redis');
console.log('提示：请确保 Cookie 是从 12306 登录后获取的最新值');
