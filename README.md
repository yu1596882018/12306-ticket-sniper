# 🚄 12306 智能抢票系统

<p align="center">
  <img src="https://img.shields.io/badge/Node.js->=12.0-green.svg" alt="Node.js">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/Redis-Required-red.svg" alt="Redis">
  <img src="https://img.shields.io/badge/PM2-Supported-orange.svg" alt="PM2">
</p>

<p align="center">
  <strong>一个高效、智能的 12306 火车票自动抢票系统</strong>
</p>

<p align="center">
  基于 Node.js + Redis + Nodemailer 构建的分布式抢票解决方案<br>
  帮助您在春运等购票高峰期快速抢到心仪的车票
</p>

---

## 📖 项目简介

在春运等购票高峰期，12306 官网经常出现"一票难求"的情况，而市面上的抢票软件大多收费且难以保证优先级。本项目是一个**开源免费**的抢票解决方案，采用高性能架构设计，能够：

- ✅ 自动监控余票信息，毫秒级响应
- ✅ 支持多人、多线路、多日期并发抢票
- ✅ 智能验证码识别与自动提交
- ✅ 邮件实时通知抢票结果
- ✅ 分布式任务队列，高并发支持
- ✅ PM2 进程管理，稳定可靠

**实战效果**：成功帮助本人及多位同事/朋友在 2020 年春运期间抢到车票！

---

## 🏗️ 技术架构

### 核心技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| **Node.js** | >= 12.0 | 服务端运行环境 |
| **Koa** | 2.x | Web 框架，提供 API 服务 |
| **Superagent** | 5.x | HTTP 客户端，模拟抢票请求 |
| **Redis** | 2.8+ | 消息队列与缓存管理 |
| **Nodemailer** | 6.x | 邮件通知服务 |
| **PM2** | Latest | 进程守护与集群管理 |
| **Moment.js** | 2.x | 时间处理工具 |

### 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     12306 抢票系统                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Web 服务层 (Koa)                          │
│  - 验证码管理   - Cookie 管理   - 订单查询                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   业务逻辑层 (Scripts)                       │
│  - 余票查询   - 订单提交   - 登录验证   - 邮件通知          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    数据层 (Redis)                            │
│  - Cookie 缓存   - 验证码存储   - 消息订阅/发布             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  12306 官方 API                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ 核心功能

### 1. 智能余票监控
- 🔄 实时轮询查询余票信息（可配置间隔时间）
- 🎯 支持多线路、多日期同时监控
- ⚡ 毫秒级响应，发现余票立即抢票
- 🕐 支持时间段筛选（如只抢早上 9:00-20:00 的票）

### 2. 自动化抢票流程
```
余票查询 → 登录校验 → 订单提交 → 座位确认 → 订单查询 → 邮件通知
```

- 全流程自动化，无需人工干预
- 智能座位选择（优先二等座，其次一等座）
- 支持指定车次抢票

### 3. 验证码处理
- 📧 验证码自动推送至邮箱
- 🖼️ Web 页面可视化验证码识别
- 🔄 支持验证码刷新与重试
- ⚡ 验证通过后自动更新 Cookie

### 4. 分布式任务管理
- 📮 基于 Redis 的消息发布/订阅机制
- 🔀 支持多进程并发抢票
- 🛡️ Cookie 失效自动检测与更新
- 📊 实时任务状态同步

### 5. 邮件通知系统
- ✉️ 抢票成功实时邮件通知
- 🔔 Cookie 失效提醒
- 📝 包含车次、日期、席别等详细信息

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 12.0
- **Redis**: >= 2.8
- **操作系统**: Linux / macOS / Windows

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/yu1596882018/12306Script.git
cd 12306Script
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 配置环境变量

复制 `.env.example` 到 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Redis 配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# 邮箱配置（用于接收通知）
EMAIL_USER=your_email@qq.com
EMAIL_PASS=your_email_password
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=465

# 12306 账号（可选）
12306_USERNAME=your_12306_username
12306_PASSWORD=your_12306_password

# 服务配置
HOST=http://localhost:8899
```

#### 4. 配置抢票任务

编辑 `scripts/config.js`，配置您的抢票需求：

```javascript
queryOptions: {
    intervalTime: 500,  // 查询间隔（毫秒）
    queryListParams: [
        {
            userIndex: 0,  // 乘客索引
            isEnd: true,   // 抢到票后是否停止
            queryDates: ['2024-02-10'],  // 查询日期
            citeCodes: [
                {
                    fromCode: 'SZQ',      // 始发站代码
                    fromCiteText: '深圳',
                    toCode: 'GZQ',         // 终点站代码
                    toCiteText: '广州',
                    scheduleTime: {        // 时间段筛选（可选）
                        startTime: '18:00',
                        endTime: '23:00'
                    }
                }
            ]
        }
    ]
}
```

#### 5. 启动服务

##### 开发模式
```bash
npm start
```

##### 生产模式（推荐）
```bash
# 启动主服务
npm run pm2

# 启动登录状态监控（可选）
npm run loopCheckUser
```

#### 6. 访问验证码页面

服务启动后，访问 `http://localhost:8899/autoCode.html` 进行验证码识别。

---

## 📋 配置说明

### 乘客信息配置

在 `scripts/config.js` 中配置乘客信息：

```javascript
userList: [
    {
        passengerTicketStr: ',0,1,张三,1,4305***********07X,,N,加密字符串',
        oldPassengerStr: '张三,1,4305***********07X,1_'
    }
]
```

> **注意**：需要先在 12306 官网添加常用联系人，然后抓包获取加密后的乘客信息。

### 查询参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `userIndex` | Number | 乘客在 userList 中的索引 |
| `isEnd` | Boolean | 抢到票后是否停止任务 |
| `queryDates` | Array | 查询日期列表 |
| `fromCode` | String | 始发站电报码 |
| `toCode` | String | 终点站电报码 |
| `scheduleTime` | Object | 时间段筛选（可选） |
| `checi` | Array | 指定车次（可选） |
| `seatType` | Array | 座位类型（可选，O=二等座，M=一等座） |

### 常见站点代码

| 城市 | 代码 | 城市 | 代码 |
|------|------|------|------|
| 北京 | BJP | 上海 | SHH |
| 广州 | GZQ | 深圳 | SZQ |
| 武汉 | WHN | 长沙 | CSQ |
| 成都 | CDW | 重庆 | CQW |

[完整站点代码查询](https://kyfw.12306.cn/otn/resources/js/framework/station_name.js)

---

## 🔧 API 接口

系统提供以下 HTTP API：

### 获取验证码
```
GET /getCode?key={key}
```

### 提交验证码
```
GET /submitCode?answer={answer}
```

### 刷新验证码
```
GET /refreshCode
```

---

## 📊 项目亮点

### 1. 高性能架构
- ⚡ **毫秒级响应**：采用异步 I/O 和事件驱动架构
- 🔄 **并发处理**：Redis 任务队列支持多任务并发
- 🎯 **智能轮询**：可配置查询间隔，避免被封 IP

### 2. 分布式设计
- 📮 **消息队列**：Redis Pub/Sub 实现进程间通信
- 🔄 **状态同步**：Cookie 更新实时广播到所有进程
- 🛡️ **容错机制**：自动检测登录状态，失效后邮件提醒

### 3. 工程化实践
- 📦 **模块化设计**：职责清晰，易于维护
- 🔧 **环境变量管理**：敏感信息安全隔离
- 📝 **日志输出**：完整的操作日志，便于调试
- 🚀 **PM2 部署**：进程守护，自动重启

### 4. 用户体验
- 📧 **邮件通知**：抢票成功/失败实时推送
- 🖼️ **可视化验证码**：Web 界面友好操作
- ⚙️ **灵活配置**：支持多人、多线路、多日期

---

## 📁 项目结构

```
12306Script/
├── app.js                  # 主服务入口
├── package.json            # 项目配置
├── .env                    # 环境变量配置
├── .env.example            # 环境变量示例
├── README.md               # 项目文档
├── ARCHITECTURE.md         # 架构设计文档
├── CHANGELOG.md            # 更新日志
├── LICENSE                 # 开源许可证
│
├── scripts/                # 核心业务逻辑
│   ├── config.js           # 全局配置
│   ├── localConfig.js      # 本地配置（环境变量）
│   ├── queryList.js        # 余票查询（方法一）
│   ├── queryList2.js       # 余票查询（方法二）
│   ├── placeOrder.js       # 订单提交流程
│   ├── authCookie.js       # Cookie 验证
│   ├── getCodeImage.js     # 验证码获取
│   ├── setCookie.js        # Cookie 设置
│   ├── setHeaders.js       # 请求头设置
│   ├── loopCheckUser.js    # 登录状态监控
│   ├── sendmail.js         # 邮件发送
│   └── utils.js            # 工具函数
│
├── static/                 # 静态资源
│   └── autoCode.html       # 验证码识别页面
│
└── temp2/                  # 临时文件/备用方案
    ├── main.js
    ├── proxy.js
    └── ...
```

---

## 🎯 使用场景

### 场景一：个人抢票
- 配置自己的乘客信息
- 设置出发地、目的地和日期
- 启动服务，自动抢票

### 场景二：团队抢票
- 配置多个乘客信息（家人、朋友）
- 设置不同的线路和日期
- 一个服务同时监控多个任务

### 场景三：备选方案
- 配置多个日期（如连续 3 天）
- 配置多条线路（如不同中转站）
- 抢到任意一张票即可

---

## ⚠️ 注意事项

1. **合法使用**：本项目仅供学习交流使用，请勿用于商业目的或非法用途
2. **频率控制**：建议 `intervalTime` 不低于 500ms，避免请求过于频繁被封 IP
3. **Cookie 时效**：12306 Cookie 有效期较短，建议每天更新一次
4. **验证码识别**：目前需要手动识别验证码，建议配置邮件提醒
5. **数据安全**：请勿将含有真实身份信息的配置文件上传到公开仓库
6. **服务稳定性**：建议使用 PM2 部署，确保服务稳定运行
7. **12306 限制**：12306 官方会不定期调整接口，可能需要更新代码

---

## 🔨 开发指南

### 本地调试

```bash
# 启动 Redis
redis-server

# 启动开发服务
npm start

# 查看日志
pm2 logs
```

### 获取乘客加密信息

1. 登录 12306 官网
2. 打开浏览器开发者工具（F12）
3. 进入"订票"页面，选择乘客
4. 在 Network 面板找到 `checkOrderInfo` 请求
5. 查看 `passengerTicketStr` 和 `oldPassengerStr` 参数

### 获取站点代码

访问 [12306 站点代码](https://kyfw.12306.cn/otn/resources/js/framework/station_name.js) 查找城市对应的电报码。

格式：`@城市名|全拼|简拼|代码|数字`

例如：`@深圳|shenzhen|sz|SZQ|3`

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 贡献流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 开发规范
- 遵循 ESLint 规范
- 添加必要的注释
- 更新相关文档

---

## 📜 开源许可

本项目基于 [MIT License](LICENSE) 开源。

---

## 🙏 致谢

- 感谢 12306 提供的公共 API
- 感谢所有为本项目做出贡献的开发者
- 特别感谢在 2020 年春运期间信任并使用本项目的朋友们

---

## 📞 联系方式

- **作者**：烟竹
- **GitHub**：[https://github.com/yu1596882018/12306Script](https://github.com/yu1596882018/12306Script)
- **Email**：1596882018@qq.com

---

## ⭐ Star History

如果这个项目对您有帮助，欢迎 Star ⭐️ 支持！

---

<p align="center">
  Made with ❤️ by 烟竹
</p>

<p align="center">
  <sub>本项目仅供学习交流使用，请勿用于非法用途</sub>
</p>
