// 工具函数模块
// 包含 Cookie 合并、邮件发送等通用工具

const config = require('./config');
const localConfig = require('./localConfig');
const nodemailer = require("nodemailer");

module.exports = {
    /**
     * 合并并设置 Cookie
     * @param {Array} params - 新的 Cookie 数组
     */
    setCookies(params) {
        if (!Array.isArray(params)) return false;
        let cookieObj = {};
        // 解析现有 Cookie
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
        // 重新拼接 Cookie 字符串
        config.userCookie = Object.keys(cookieObj).map(key => {
            return `${key}=${cookieObj[key]}`;
        }).join('; ');
    },
    /**
     * 发送邮件（通用工具）
     * @param {object} opts - 邮件参数
     */
    sendMail(opts) {
        async function main() {
            // let testAccount = await nodemailer.createTestAccount();
            let transporter = nodemailer.createTransport({
                host: localConfig.emailHost || "smtp.qq.com",
                port: localConfig.emailPort || 465,
                secure: true,
                auth: {
                    user: localConfig.emailUser,
                    pass: localConfig.emailPass
                }
            });
            let info = await transporter.sendMail(Object.assign({
                from: `"12306Script" <${localConfig.emailUser}>`,
                to: localConfig.emailUser
            }, opts));
            console.log("邮件已发送: %s", info.messageId);
            // console.log("预览地址: %s", nodemailer.getTestMessageUrl(info));
        }
        main().catch(console.error);
    }
}
