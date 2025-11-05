// 12306 高铁抢票爬虫主入口
// 启动 Koa 服务，注册核心路由，处理验证码、Cookie、订阅等逻辑

const Koa = require('koa');
const path = require('path');
const serve = require('koa-static');
const logger = require('koa-logger');
const Router = require('koa-router');
const getCodeImage = require('./scripts/getCodeImage');
const config = require('./scripts/config');
const { redisPub, redisSub, redisDb } = config;
const authCookie = require('./scripts/authCookie');
const queryList = require('./scripts/queryList2');
// const loopCheckUser = require('./scripts/loopCheckUser'); // 可选：定时校验登录状态
let queryTask = queryList(config.queryOptions); // 启动抢票主任务

const app = new Koa();

// 绑定中间件：日志、静态资源
app.use(logger())
   .use(serve(path.join(__dirname, './static'), {
       maxage: 10 * 60 * 1000 // 静态资源缓存 10 分钟
   }));

// 路由注册
const router = new Router();

// Redis 订阅：监听 Cookie 更新等消息
redisSub.on('subscribe', (channel, count) => {
    console.log(`${channel} 订阅成功`);
});

redisSub.on('message', (channel, message) => {
    if (channel === 'app' && message === 'updateCookie') {
        // Cookie 更新，重启抢票任务
        redisDb.get('userCookie', (err, v) => {
            if (v) config.userCookie = v;
            queryTask.stop();
            queryTask = queryList(config.queryOptions);
        });
    }
});
redisSub.subscribe('app');

// 获取验证码图片
router.get('/getCode', async (ctx) => {
    // 从 Redis 获取验证码图片
    const image = await new Promise((resolve, reject) => {
        redisDb.hget('codeImages', ctx.query.key, (err, res) => {
            if (err) reject(err);
            else resolve(res);
        });
    });
    ctx.body = image;
});

// 提交验证码答案，自动登录
router.get('/submitCode', async (ctx) => {
    ctx.body = await authCookie(ctx.query.answer);
    if (ctx.body.result_code === 0) {
        // 登录成功，通知主进程刷新 Cookie
        redisPub.publish('app', 'updateCookie');
    }
});

// 刷新验证码
router.get('/refreshCode', async (ctx) => {
    ctx.body = await getCodeImage();
});

// 注册路由
app.use(router.routes()).use(router.allowedMethods());

// 启动服务
app.listen(8899, () => {
    console.log('服务已启动，端口 8899');
});
