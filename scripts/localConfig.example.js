require('dotenv').config();

module.exports = {
    redisHost: process.env.REDIS_HOST || '127.0.0.1',
    redisPort: process.env.REDIS_PORT || 6379,
    redisPassword: process.env.REDIS_PASSWORD || '',
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
    emailHost: process.env.EMAIL_HOST || 'smtp.qq.com',
    emailPort: process.env.EMAIL_PORT || 465,
    username: process.env['12306_USERNAME'],
    password: process.env['12306_PASSWORD'],
    host: process.env.HOST || 'http://localhost:8899',
    openProxy: process.env.OPEN_PROXY === 'true',
    proxyUrl: process.env.PROXY_URL || ''
};
