/**
 * ========================================
 * 12306 智能抢票系统 - 主服务入口
 * ========================================
 *
 * 功能：
 * 1. 启动 Web 服务，提供验证码识别界面
 * 2. 管理 Cookie 和登录状态
 * 3. 启动余票查询和自动抢票任务
 * 4. 通过 Redis 实现多进程通信
 *
 * 作者: 烟竹
 * 日期: 2019-12
 * ========================================
 */

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

// 初始化查询任务
let querySample = queryList(config.queryOptions);

// 创建 Koa 应用实例
const App = new Koa();

// ========================================
// 中间件配置
// ========================================
App.use(logger()) // 请求日志
    .use(serve(path.join(__dirname, './static')), {
        // 静态文件服务
        maxage: 10 * 60 * 1000 // 缓存10分钟
    });

// ========================================
// 路由配置
// ========================================
const router = new Router();

// ========================================
// Redis 消息订阅（用于多进程通信）
// ========================================

// 订阅成功回调
redisSub.on('subscribe', function (channel, count) {
    console.log(`✓ Redis频道 [${channel}] 订阅成功`);
});

// 接收消息回调
redisSub.on('message', function (channel, message) {
    if (channel == 'app') {
        // Cookie 更新消息
        if (message == 'updateCookie') {
            console.log('→ 收到 Cookie 更新通知，正在更新...');
            redisDb.get('userCookie', function (err, v) {
                if (!err && v) {
                    config.userCookie = v;
                    // 停止旧任务并启动新任务
                    querySample.stop();
                    querySample = queryList(config.queryOptions);
                    console.log('✓ Cookie 更新完成，查询任务已重启');
                }
            });
        }
    }
});

// 订阅 app 频道
redisSub.subscribe('app');

// ========================================
// API 路由定义
// ========================================

/**
 * 获取验证码图片
 * GET /getCode?key={key}
 */
router.get('/getCode', async ctx => {
    // 从 Redis 获取验证码图片
    let image = await new Promise((resolve, reject) => {
        redisDb.hget('codeImages', ctx.query.key, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
    ctx.body = image;
});

/**
 * 提交验证码答案
 * GET /submitCode?answer={answer}
 */
router.get('/submitCode', async ctx => {
    // 验证并获取新 Cookie
    ctx.body = await authCookie(ctx.query.answer);

    // 验证成功，广播 Cookie 更新消息
    if (ctx.body.result_code === 0) {
        console.log('✓ 验证码验证成功，广播 Cookie 更新');
        redisPub.publish('app', 'updateCookie');
    }
});

/**
 * 刷新验证码
 * GET /refreshCode
 */
router.get('/refreshCode', async ctx => {
    ctx.body = await getCodeImage();
});

// ========================================
// 应用启动
// ========================================

// 注册路由
App.use(router.routes()).use(router.allowedMethods());

// 启动 HTTP 服务
const PORT = process.env.PORT || 8899;
App.listen(PORT, function () {
    console.log('========================================');
    console.log('🚄 12306 智能抢票系统');
    console.log('========================================');
    console.log(`✓ 服务已启动: http://localhost:${PORT}`);
    console.log(`✓ 验证码页面: http://localhost:${PORT}/autoCode.html`);
    console.log(`✓ 查询间隔: ${config.queryOptions.intervalTime}ms`);
    console.log(`✓ 任务数量: ${config.queryOptions.queryListParams.length} 个`);
    console.log('========================================');
    console.log('提示：请确保 Redis 服务已启动');
    console.log('开始监控余票信息...');
    console.log('========================================\n');
});
