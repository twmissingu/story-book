# 🏠 小小绘本屋

> 用 AI 为 5-10 岁儿童创造独一无二的绘本故事

只需输入一个角色设定和情节概要，AI 就能将其扩展成一本精美的 8-12 页绘本故事。角色形象跨页保持一致，故事自动扩写，每页配有匹配的精美插画，就像一本真正的书一样阅读。

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-black?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-black?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-black?logo=tailwindcss)
[![MIT License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## ✨ 功能特点

- **AI 创作绘本** — 输入角色（名称+外貌）和情节概要，AI 自动扩写为 8-12 页完整故事
- **AI 批量生图** — 基于角色描述自动为每页生成对应插画，角色外貌锚定保证跨页一致性
- **3D 翻页阅读器** — 沉浸式翻页效果，支持点击、键盘和手势翻页
- **我的书架** — 本地保存所有绘本，网格封面展示
- **重新画画** — 已生成的绘本可重新生成插画（保留故事不变）
- **导出绘本** — 下载 ZIP（含图片和文本）

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/twmissingu/story-book.git
cd story-book
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制示例文件并填入你的 API Key：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```bash
# 火山引擎方舟平台 API Key
# 获取地址：https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey
VOLCENGINE_ARK_API_KEY=ark-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# 图片生成模型（Seedream 4.5）
VOLCENGINE_IMAGE_MODEL=doubao-seedream-4-5-251128

# 故事扩写模型（需替换为你实际有权限的模型 ID）
VOLCENGINE_LLM_MODEL=doubao-pro-32k-241215
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 **http://localhost:3000**

---

## 📖 使用流程

1. 点击 **「✨ 创作新绘本」**
2. **步骤 1** — 录入角色（名称 + 外貌描述），可添加 1-5 个角色
3. **步骤 2** — 写一个简短的情节概要（5 字以上）
4. **步骤 3** — 点击「开始创作」，等待 AI 生成（约 1-3 分钟）
5. 自动跳转到阅读页，翻页阅读绘本
6. 可导出 ZIP 或点击「重新画画」修复图片

---

## 🏗️ 技术架构

| 层级 | 选型 | 说明 |
|------|------|------|
| 框架 | Next.js 16 + App Router | React 服务端/客户端组件 |
| 语言 | TypeScript | 类型安全 |
| 样式 | Tailwind CSS 4 | 原子化 CSS |
| AI 图片 | 火山引擎 Seedream 4.5 | 文生图，4:3 比例 |
| AI 故事 | 火山方舟 LLM | 中文扩写 |
| 本地存储 | IndexedDB | 浏览器本地存储 |
| 导出 | JSZip + FileSaver | ZIP 打包下载 |

---

## 📁 目录结构

```
story-book/
├── app/
│   ├── page.tsx                    # 书架页 /
│   ├── create/page.tsx             # 创作流程
│   ├── read/[id]/page.tsx         # 翻页阅读器
│   ├── api/
│   │   ├── generate-story/route.ts # AI 扩写故事
│   │   └── generate-image/route.ts # AI 生图 (服务端下载→base64)
│   ├── layout.tsx                  # 根布局
│   └── globals.css                 # 全局样式
├── components/
│   ├── bookshelf/                  # 书架组件
│   ├── create/                     # 创作流程组件
│   └── reader/                     # 阅读器组件
├── lib/
���   ├── volcengine-ark.ts           # 火山方舟 SDK
│   ├── db.ts                       # IndexedDB 封装
│   ├── story-generator.ts          # 故事生成逻辑
│   └── image-generator.ts          # 图片生成逻辑
├── public/                         # 静态资源
├── .env.example                    # 环境变量模板
├── next.config.ts
└── package.json
```

---

## ⚠️ 注意事项

1. **API Key 安全** — `.env.local` 包含敏感密钥，**不要提交到 Git**
2. **图片链接 24h 失效** — 应用会自动下载图片到 IndexedDB，无需担心过期
3. **数据存在本地** — 所有绘本存储在浏览器 IndexedDB 中，清除浏览器数据会丢失
4. **网络要求** — AI 生成需要访问火山引擎 API，需要稳定网络
5. **推荐浏览器** — Chrome/Edge 对 IndexedDB 支持最佳

---

## 🔧 常见问题

### 插画显示"图片生成失败"
- 检查 `.env.local` 中的 API Key 是否正确
- 检查火山引擎账户是否有可用额度
- 点击绘本书籍顶部的 **「重新画画」** 按钮重新生成

### 生成过程卡住
- 打开浏览器开发者工具 → Console 查看具体错误
- 检查网络连接是否稳定
- LLM 模型 ID 需确认你有权限访问

### 清除数据重新开始
- 浏览器开发者工具 → Application → IndexedDB → StoryBookDB → 删除所有

---

## 📝 开源许可

MIT License — 详见 [LICENSE](LICENSE)。

---

## 🤝 欢迎贡献

欢迎提交 Issue 或 PR！

---

## 🤖 AI 代理设置

本章节指导 AI 代理自动完成项目配置。

### 设置步骤（AI 代理）

```bash
# 1. 克隆并安装
git clone https://github.com/[your-username]/story-book.git
cd story-book
npm install

# 2. 复制环境变量模板
cp .env.example .env.local
```

### 交互式 API Key 设置

AI 代理应提示用户获取火山引擎方舟 API Key：

1. 请用户访问：https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey 获取 API Key
2. 将 Key 写入 `.env.local`：
   ```
   VOLCENGINE_ARK_API_KEY=<用户提供的Key>
   ```

`.env.local` 中的模型 ID 通常可以直接使用，但可能需要根据用户权限进行调整。

### 验证配置

```bash
npm run dev
# 访问 http://localhost:3000 — 应该能正常加载
```