// 邮件通知模块
// 用于发送验证码校验、登录状态等提醒邮件

const nodemailer = require("nodemailer");
const localConfig = require('./localConfig');

/**
 * 发送邮件提醒
 * @param {string} key - 验证码 key
 * @param {object} opt - 可选参数（如 flag 标记）
 */
module.exports = (key, opt = {}) => {
    // async..await 不能直接用于顶层，需包裹一层
    async function main () {
        // 生成测试 SMTP 账号（如无真实邮箱可用于测试）
        // let testAccount = await nodemailer.createTestAccount();

        // 创建邮件发送对象
        let transporter = nodemailer.createTransport({
            host: localConfig.emailHost || "smtp.qq.com",
            port: localConfig.emailPort || 465,
            secure: true, // 465 端口为 SSL
            auth: {
                user: localConfig.emailUser, // 邮箱账号
                pass: localConfig.emailPass  // 邮箱授权码
            }
        });

        // 发送邮件
        let info = await transporter.sendMail({
            from: `"12306Script" <${localConfig.emailUser}>`, // 发件人
            to: localConfig.emailUser, // 收件人，可扩展为多用户
            subject: "校验验证码", // 邮件主题
            html: `<a href="${localConfig.host}/autoCode.html?key=${key}">${opt.flag ? opt.flag : '登录状态失效，'}前往验证</a>` // 邮件内容
        });

        console.log("邮件已发送: %s", info.messageId);
        // console.log("预览地址: %s", nodemailer.getTestMessageUrl(info));
    }

    main().catch(console.error);
}
