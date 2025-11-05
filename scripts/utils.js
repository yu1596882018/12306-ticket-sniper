/**
 * ========================================
 * 工具函数模块
 * ========================================
 * 
 * 功能：
 * 1. Cookie 管理和合并
 * 2. 邮件发送（抢票成功通知）
 * ========================================
 */

const config = require('./config');
const localConfig = require('./localConfig');
const nodemailer = require("nodemailer");

module.exports = {
    /**
     * 设置/更新 Cookie
     * 将新的 Cookie 值合并到现有 Cookie 中
     * @param {Array} params - Cookie 数组
     */
    setCookies (params) {
        if (!Array.isArray(params)) return false;
        
        // 解析现有 Cookie
        let cookieObj = {};
        config.userCookie.split(';').forEach(item => {
            let itemArr = item.split('=');
            cookieObj[itemArr[0].trim()] = itemArr[1];
        });
        
        // 合并新 Cookie
        params.forEach(item => {
            let arr = item.split(';');
            let arr2 = arr[0].split('=');
            cookieObj[arr2[0]] = arr2[1];
        });

        // 重新组装 Cookie 字符串
        config.userCookie = Object.keys(cookieObj).map(key => {
            return `${key}=${cookieObj[key]}`;
        }).join('; ');
    },
    
    /**
     * 发送邮件通知
     * @param {Object} opts - 邮件选项（subject, html, text等）
     */
    sendMail (opts) {
        async function main () {
            // 创建邮件传输对象
            let transporter = nodemailer.createTransport({
                host: localConfig.emailHost || "smtp.qq.com",
                port: localConfig.emailPort || 465,
                secure: true, // 使用 SSL
                auth: {
                    user: localConfig.emailUser,
                    pass: localConfig.emailPass
                }
            });

            // 发送邮件
            let info = await transporter.sendMail(Object.assign({
                from: `"12306抢票系统" <${localConfig.emailUser}>`,
                to: localConfig.emailUser,
                subject: '【12306】抢票通知'
            }, opts));

            console.log("✓ 邮件发送成功: %s", info.messageId);
            console.log("  主题:", opts.subject || '抢票通知');
        }

        main().catch(err => {
            console.error("✗ 邮件发送失败:", err.message);
        });
    }
}
