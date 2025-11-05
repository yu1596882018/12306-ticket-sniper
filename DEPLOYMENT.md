# 部署文档

本文档详细介绍如何在不同环境下部署 12306 抢票系统。

---

## 📋 前置要求

### 软件环境

| 软件 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | >= 12.0 | JavaScript 运行环境 |
| npm/yarn | >= 6.0 | 包管理工具 |
| Redis | >= 2.8 | 缓存和消息队列 |
| PM2 | Latest | 进程管理工具（可选，生产环境推荐） |

### 硬件要求

| 环境 | CPU | 内存 | 磁盘 |
|------|-----|------|------|
| 开发 | 1 核 | 512MB | 1GB |
| 生产 | 2 核+ | 1GB+ | 5GB+ |

### 网络要求

- 能够访问 12306 官网（https://www.12306.cn）
- 能够访问邮件服务器（如 smtp.qq.com）
- 服务器开放 8899 端口（或自定义端口）

---

## 🚀 快速部署

### 方式一：本地开发环境

适用于本地测试和开发。

#### 1. 安装 Node.js

**Windows**:
```bash
# 下载安装包
https://nodejs.org/

# 验证安装
node -v
npm -v
```

**Linux/macOS**:
```bash
# 使用 nvm 安装（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 14
nvm use 14

# 或使用包管理器
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nodejs npm

# CentOS/RHEL
sudo yum install nodejs npm

# macOS
brew install node
```

#### 2. 安装 Redis

**Windows**:
```bash
# 下载 Redis for Windows
https://github.com/microsoftarchive/redis/releases

# 或使用 WSL2 安装 Linux 版本
```

**Linux**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install redis-server

# 启动 Redis
sudo systemctl start redis
sudo systemctl enable redis

# CentOS/RHEL
sudo yum install redis
sudo systemctl start redis
```

**macOS**:
```bash
brew install redis
brew services start redis
```

#### 3. 克隆项目

```bash
git clone https://github.com/yu1596882018/12306Script.git
cd 12306Script
```

#### 4. 安装依赖

```bash
npm install
```

#### 5. 配置环境变量

```bash
# 复制配置示例
cp .env.example .env

# 编辑配置文件
# Windows: notepad .env
# Linux/macOS: vim .env 或 nano .env
```

填写必要配置：
```env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
EMAIL_USER=your_email@qq.com
EMAIL_PASS=your_email_authorization_code
```

#### 6. 配置抢票任务

编辑 `scripts/config.js`，配置乘客信息和抢票任务。

#### 7. 启动服务

```bash
npm start
```

#### 8. 访问验证码页面

打开浏览器访问：`http://localhost:8899/autoCode.html`

---

### 方式二：生产环境（PM2）

适用于服务器长期运行，推荐用于正式抢票。

#### 1. 安装 PM2

```bash
npm install -g pm2
```

#### 2. 完成基础配置

参考"方式一"的步骤 1-6。

#### 3. 启动服务（PM2 集群模式）

```bash
# 启动主服务（2 个进程）
npm run pm2

# 或手动指定进程数
pm2 start app.js -i 4 --name 12306-ticket-service

# 启动登录状态检测（可选）
npm run loopCheckUser
```

#### 4. 查看运行状态

```bash
# 查看进程列表
pm2 list

# 查看日志
pm2 logs

# 实时监控
pm2 monit
```

#### 5. 常用管理命令

```bash
# 停止服务
pm2 stop all
# 或
npm run stop

# 重启服务
pm2 restart all
# 或
npm run restart

# 删除进程
pm2 delete all

# 保存进程列表（用于开机自启）
pm2 save

# 设置开机自启
pm2 startup
```

---

## 🐳 Docker 部署

### 方式三：Docker 容器化部署

适用于容器化环境，便于迁移和扩展。

#### 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 使用 Node.js 14 作为基础镜像
FROM node:14-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 8899

# 启动命令
CMD ["node", "app.js"]
```

#### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  redis:
    image: redis:6-alpine
    container_name: 12306-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

  app:
    build: .
    container_name: 12306-ticket-service
    ports:
      - "8899:8899"
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - EMAIL_USER=${EMAIL_USER}
      - EMAIL_PASS=${EMAIL_PASS}
      - HOST=http://localhost:8899
    depends_on:
      - redis
    restart: unless-stopped
    volumes:
      - ./scripts:/app/scripts

volumes:
  redis-data:
```

#### 3. 构建和启动

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## ☁️ 云服务器部署

### 阿里云 ECS

#### 1. 购买服务器

- 配置：2核 2GB 内存，推荐 CentOS 7 或 Ubuntu 20.04
- 安全组：开放 8899 端口

#### 2. 连接服务器

```bash
ssh root@your_server_ip
```

#### 3. 安装环境

```bash
# 安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_14.x | bash -
yum install -y nodejs

# 安装 Redis
yum install -y redis
systemctl start redis
systemctl enable redis

# 安装 Git
yum install -y git

# 安装 PM2
npm install -g pm2
```

#### 4. 部署项目

```bash
# 克隆项目
cd /opt
git clone https://github.com/yu1596882018/12306Script.git
cd 12306Script

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
vim .env
# 填写配置...

# 启动服务
pm2 start app.js -i 2 --name 12306-ticket-service
pm2 save
pm2 startup

# 配置防火墙
firewall-cmd --permanent --add-port=8899/tcp
firewall-cmd --reload
```

#### 5. 配置域名（可选）

使用 Nginx 反向代理：

```bash
# 安装 Nginx
yum install -y nginx

# 配置 Nginx
vim /etc/nginx/conf.d/12306.conf
```

Nginx 配置：
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://127.0.0.1:8899;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启动 Nginx：
```bash
systemctl start nginx
systemctl enable nginx
```

---

### 腾讯云服务器

部署步骤与阿里云类似，主要区别：

1. 安全组配置在"云服务器控制台 -> 安全组"
2. 防火墙命令可能略有不同（根据系统而定）

---

### AWS EC2

#### 1. 创建实例

- AMI：Ubuntu Server 20.04 LTS
- 实例类型：t2.micro（免费套餐）或 t2.small
- 安全组：开放 22（SSH）和 8899 端口

#### 2. 连接实例

```bash
ssh -i your-key.pem ubuntu@your_instance_ip
```

#### 3. 安装环境

```bash
# 更新软件源
sudo apt-get update

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Redis
sudo apt-get install -y redis-server

# 安装 PM2
sudo npm install -g pm2
```

#### 4. 部署项目

参考阿里云部署步骤。

---

## 🔧 配置优化

### 1. Redis 优化

编辑 Redis 配置文件：
```bash
# CentOS
vim /etc/redis.conf

# Ubuntu
vim /etc/redis/redis.conf
```

推荐配置：
```conf
# 最大内存（根据服务器配置调整）
maxmemory 256mb

# 内存淘汰策略
maxmemory-policy allkeys-lru

# 持久化配置（可选）
save 900 1
save 300 10
save 60 10000
```

重启 Redis：
```bash
systemctl restart redis
```

### 2. PM2 优化

创建 `ecosystem.config.js`：
```javascript
module.exports = {
  apps: [{
    name: '12306-ticket-service',
    script: './app.js',
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
```

使用配置启动：
```bash
pm2 start ecosystem.config.js
```

### 3. 系统优化

**增加文件描述符限制**：
```bash
# 临时生效
ulimit -n 65535

# 永久生效
vim /etc/security/limits.conf
# 添加：
* soft nofile 65535
* hard nofile 65535
```

**优化 TCP 参数**：
```bash
vim /etc/sysctl.conf
# 添加：
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_tw_recycle = 1
net.ipv4.tcp_fin_timeout = 30

# 生效
sysctl -p
```

---

## 📊 监控与日志

### 1. 日志管理

**查看 PM2 日志**：
```bash
# 实时日志
pm2 logs

# 最近 100 行
pm2 logs --lines 100

# 清空日志
pm2 flush
```

**日志轮转**：

安装 `pm2-logrotate`：
```bash
pm2 install pm2-logrotate

# 配置
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 2. 性能监控

**使用 PM2 Plus**（可选）：
```bash
# 注册 PM2 Plus
pm2 plus

# 链接应用
pm2 link <secret_key> <public_key>
```

**使用 htop 监控系统**：
```bash
# 安装 htop
yum install -y htop  # CentOS
apt-get install -y htop  # Ubuntu

# 运行
htop
```

---

## 🔐 安全加固

### 1. 防火墙配置

**CentOS (firewalld)**:
```bash
# 只开放必要端口
firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --permanent --add-port=8899/tcp
firewall-cmd --reload

# 限制 Redis 访问（只允许本地）
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="127.0.0.1" port port="6379" protocol="tcp" accept'
```

**Ubuntu (ufw)**:
```bash
ufw allow 22/tcp
ufw allow 8899/tcp
ufw enable
```

### 2. Redis 安全

```bash
# 编辑 Redis 配置
vim /etc/redis.conf

# 绑定本地地址
bind 127.0.0.1

# 设置密码
requirepass your_strong_password

# 禁用危险命令
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
```

### 3. HTTPS 配置（推荐）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
yum install -y certbot python3-certbot-nginx  # CentOS
apt-get install -y certbot python3-certbot-nginx  # Ubuntu

# 获取证书
certbot --nginx -d your_domain.com

# 自动续期
echo "0 0,12 * * * root certbot renew --quiet" >> /etc/crontab
```

---

## 🐛 故障排查

### 常见问题

#### 1. 服务无法启动

**检查端口占用**：
```bash
netstat -tunlp | grep 8899
lsof -i:8899
```

**解决**：
```bash
# 杀死占用进程
kill -9 <pid>

# 或修改端口
vim .env
PORT=8900
```

#### 2. Redis 连接失败

**检查 Redis 状态**：
```bash
systemctl status redis

# 测试连接
redis-cli ping
```

**解决**：
```bash
# 启动 Redis
systemctl start redis

# 检查配置
vim /etc/redis.conf
```

#### 3. Cookie 失效频繁

**原因**：
- 12306 限制
- IP 被限流

**解决**：
- 增加查询间隔（`intervalTime`）
- 使用代理 IP
- 减少并发任务数

#### 4. 邮件发送失败

**检查邮箱配置**：
- 确认邮箱授权码正确（不是密码）
- 确认开启了 SMTP 服务
- 检查邮件服务器地址和端口

**测试发送**：
```bash
node -e "require('./scripts/utils').sendMail({subject: '测试邮件'})"
```

---

## 📈 性能测试

### 压力测试

使用 `autocannon` 进行性能测试：

```bash
# 安装
npm install -g autocannon

# 测试
autocannon -c 100 -d 30 http://localhost:8899/getCode?key=test
```

### 基准测试结果

| 指标 | 值 |
|------|-----|
| 请求成功率 | > 99.9% |
| 平均响应时间 | < 100ms |
| 并发处理能力 | 500+ req/s |

---

## 🔄 更新升级

### 更新代码

```bash
# 进入项目目录
cd /opt/12306Script

# 备份当前版本
cp -r . ../12306Script.backup

# 拉取最新代码
git pull origin master

# 安装新依赖
npm install

# 重启服务
pm2 restart all
```

### 数据迁移

如需迁移服务器：

```bash
# 导出 Redis 数据
redis-cli --rdb dump.rdb

# 在新服务器导入
redis-cli --pipe < dump.rdb
```

---

## ✅ 部署检查清单

部署完成后，请检查以下项目：

- [ ] Node.js 版本 >= 12.0
- [ ] Redis 服务正常运行
- [ ] 环境变量配置正确
- [ ] 乘客信息配置完成
- [ ] 抢票任务配置正确
- [ ] PM2 服务正常启动
- [ ] 防火墙端口已开放
- [ ] 邮件通知功能正常
- [ ] 验证码页面可访问
- [ ] 日志输出正常
- [ ] 设置开机自启（生产环境）

---

## 📞 技术支持

如遇到部署问题，请：

1. 查看日志：`pm2 logs`
2. 查看系统资源：`htop` 或 `top`
3. 提交 Issue：https://github.com/yu1596882018/12306Script/issues

---

<p align="center">
  <sub>文档版本：2.0.0 | 最后更新：2024-11-05</sub>
</p>

