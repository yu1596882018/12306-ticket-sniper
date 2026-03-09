# 代码风格指南

本项目使用 Prettier 进行代码格式化，确保代码风格统一。

---

## 📋 配置说明

### Prettier 配置（.prettierrc）

```json
{
    "semi": true, // 语句末尾使用分号
    "trailingComma": "none", // 不使用尾随逗号
    "singleQuote": true, // 使用单引号
    "printWidth": 100, // 每行最大长度 100 字符
    "tabWidth": 4, // 缩进宽度 4 空格
    "useTabs": false, // 使用空格缩进
    "arrowParens": "avoid", // 箭头函数参数尽可能省略括号
    "endOfLine": "lf" // 使用 LF 换行符
}
```

---

## 🚀 使用方法

### 安装依赖

```bash
npm install
```

### 格式化代码

```bash
# 格式化所有代码文件
npm run format

# 检查代码格式（不修改文件）
npm run format:check
```

### IDE 集成

#### VS Code

1. 安装 Prettier 插件
2. 在设置中启用：

```json
{
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
}
```

#### WebStorm / IDEA

1. Settings → Languages & Frameworks → JavaScript → Prettier
2. 勾选 "On save"
3. 勾选 "On code reformat"

---

## 📝 代码规范

### JavaScript

**变量命名**：

```javascript
// 驼峰命名
const userName = 'test';
const getUserInfo = () => {};

// 常量大写
const MAX_RETRY_COUNT = 3;
```

**函数声明**：

```javascript
// 推荐：函数声明
function fetchData() {
    // ...
}

// 推荐：箭头函数（简洁场景）
const getData = () => {};
```

**字符串**：

```javascript
// 使用单引号
const message = 'Hello World';

// 模板字符串
const greeting = `Hello, ${name}!`;
```

**对象和数组**：

```javascript
// 对象
const config = {
    host: 'localhost',
    port: 8899
};

// 数组
const list = [1, 2, 3];
```

### 注释规范

**模块注释**：

```javascript
/**
 * ========================================
 * 模块名称
 * ========================================
 *
 * 功能：
 * 1. 功能描述1
 * 2. 功能描述2
 * ========================================
 */
```

**函数注释**：

```javascript
/**
 * 函数功能描述
 * @param {Type} paramName - 参数描述
 * @returns {Type} 返回值描述
 */
function functionName(paramName) {
    // ...
}
```

**行内注释**：

```javascript
// 单行注释
const value = getValue(); // 解释性注释
```

---

## ✅ 提交前检查

### 代码格式化

```bash
# 1. 格式化所有代码
npm run format

# 2. 检查格式
npm run format:check

# 3. 如果有格式问题，重新格式化
npm run format
```

### 提交规范

```bash
# 遵循 Conventional Commits
git commit -m "feat: 添加新功能"
git commit -m "fix: 修复Bug"
git commit -m "docs: 更新文档"
git commit -m "style: 代码格式化"
```

---

## 📚 参考资料

-   [Prettier 官方文档](https://prettier.io/)
-   [Prettier 配置选项](https://prettier.io/docs/en/options.html)
-   [EditorConfig](https://editorconfig.org/)

---

<p align="center">
  <sub>保持代码整洁，从格式化开始</sub>
</p>
