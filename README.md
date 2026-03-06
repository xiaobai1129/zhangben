# 📒 记账本 — 本地个人记账 App

一个纯前端、纯本地的个人记账应用。数据存储在浏览器中，**不联网、不上传、不需要注册**。

支持电脑浏览器和手机（iPhone / Android），可添加到手机主屏幕像原生 App 一样使用。

## ✨ 功能

- ✏️ **快速记账** — 打开直接记，默认填好日期
- 📋 **历史账目** — 按月查看，按日分组，支持删除
- 📊 **统计分析** — 按类别/按天统计，动态饼图，百分比
- 📱 **手机适配** — iPhone 14 完美适配，支持添加到主屏幕
- 🔒 **完全离线** — 数据只存在你的浏览器里，无服务器

## 📸 截图

| 记账页面 | 统计页面 |
|:---:|:---:|
| ![记账](https://via.placeholder.com/200x400?text=记账) | ![统计](https://via.placeholder.com/200x400?text=统计) |

## 🚀 一键部署（推荐）

只需 3 步，部署你自己的记账本：

### 前提条件

- 安装了 [Git](https://git-scm.com/)
- 安装了 [GitHub CLI (gh)](https://cli.github.com/)，并已登录（`gh auth login`）

### 部署步骤

```bash
# 1. 克隆仓库
git clone https://github.com/xiaobai1129/zhangben.git
cd zhangben

# 2. 运行部署脚本
bash deploy.sh
```

脚本会自动：
- ✅ 在你的 GitHub 账号下创建仓库
- ✅ 推送代码
- ✅ 开启 GitHub Pages
- ✅ 输出你的专属访问地址

### 在手机上安装

1. 用 **Safari**（iPhone）或 **Chrome**（Android）打开你的 GitHub Pages 地址
2. **iPhone**: 点分享按钮 → 「添加到主屏幕」
3. **Android**: 点菜单 → 「添加到主屏幕」
4. 图标出现在桌面，全屏运行，和原生 App 一样 🎉

## 🛠 本地开发

如果你想修改代码，可以在本地用任意 HTTP 服务器运行：

```bash
# 方法 1: Python
python3 -m http.server 8080

# 方法 2: Node.js
npx serve .

# 方法 3: VS Code
# 安装 Live Server 插件，右键 index.html → Open with Live Server
```

然后访问 `http://localhost:8080`

## 📁 项目结构

```
zhangben/
├── index.html      # 主页面
├── style.css       # 样式
├── app.js          # 核心逻辑（localStorage CRUD）
├── manifest.json   # PWA 配置
├── sw.js           # Service Worker（离线缓存）
├── icon-180.png    # iOS 主屏图标
├── icon-192.png    # Android 图标
├── icon-512.png    # 高清图标
├── deploy.sh       # 一键部署脚本
└── README.md       # 本文件
```

## 📝 记账类别

早餐 🌅 | 午餐 ☀️ | 晚餐 🌙 | 夜宵 🌃 | 洗衣 👕 | 小饮料 🧃 | 交通 🚌 | 购物 🛒 | 人情 🤝 | 袜子 🧦 | 其他 📦

## ❓ 常见问题

**Q: 数据存在哪里？**
A: 浏览器的 `localStorage` 中，完全本地，不会发送到任何服务器。

**Q: 换手机/换浏览器数据会丢吗？**
A: 不同设备、不同浏览器的数据是独立的，不会同步。

**Q: 清除浏览器数据会怎样？**
A: 会丢失记账数据，请谨慎操作。

## 📄 License

MIT — 随意使用和修改。
