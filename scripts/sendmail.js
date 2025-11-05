const nodemailer = require("nodemailer");
const localConfig = require('./localConfig');

module.exports = (key, opt = {}) => {
// async..await is not allowed in global scope, must use a wrapper
    async function main () {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.qq.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: localConfig.emailUser, // generated ethereal user
                pass: localConfig.emailPass// generated ethereal password
            }
        });

        // 发送邮件
        let info = await transporter.sendMail({
            from: `"12306抢票系统" <${localConfig.emailUser}>`, // 发件人
            to: localConfig.emailUser, // 收件人（发给自己）
            subject: "【12306】验证码识别通知", // 邮件主题
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #1890ff;">🚄 12306 抢票系统通知</h2>
                    <p style="font-size: 16px;">${opt.flag ? opt.flag : '登录状态已失效，需要重新验证'}</p>
                    <p style="margin: 20px 0;">
                        <a href="${localConfig.host}/autoCode.html?key=${key}" 
                           style="display: inline-block; padding: 12px 24px; background-color: #1890ff; 
                                  color: white; text-decoration: none; border-radius: 4px; font-size: 16px;">
                            立即验证 →
                        </a>
                    </p>
                    <p style="color: #666; font-size: 14px;">
                        提示：请在 10 分钟内完成验证码识别
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">
                        这是一封自动发送的邮件，请勿直接回复<br>
                        如有疑问，请联系系统管理员
                    </p>
                </div>
            ` // HTML 邮件内容
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    main().catch(console.error);
}
