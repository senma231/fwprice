
# FreightWise 应用

FreightWise 是一个专为货运价格查询、报价请求 (RFQ) 管理以及货运代理和管理员内部操作任务而设计的 Web 应用程序。它具有面向公众的价格搜索、代理仪表盘以及用于管理价格、用户和公告的管理面板，并结合了 AI 驱动的 RFQ 处理功能。

## 目录

- [先决条件](#先决条件)
- [开始 (开发)](#开始-开发)
  - [克隆仓库](#克隆仓库)
  - [安装](#安装)
  - [环境变量](#环境变量)
  - [运行开发服务器](#运行开发服务器)
- [构建生产版本](#构建生产版本)
- [部署](#部署)
  - [自托管 Node.js 服务器](#自托管-nodejs-服务器)
  - [生产环境变量](#生产环境变量)
  - [进程管理](#进程管理)
- [关键技术](#关键技术)
- [本地化](#本地化)
- [AI 功能 (Genkit)](#ai-功能-genkit)

## 先决条件

在开始之前，请确保您已安装以下软件：

- **Node.js**: 版本 20.x (推荐 LTS) 或更高。您可以从 [nodejs.org](https://nodejs.org/) 下载。
- **npm** (随 Node.js 安装) 或 **Yarn**:
  - npm: 版本 9.x 或更高。
  - Yarn: 版本 1.22.x 或更高。

## 开始 (开发)

按照以下步骤设置项目以进行本地开发。

### 克隆仓库

如果您还没有，请将仓库克隆到您的本地计算机：
```bash
git clone <您的仓库URL>
cd <项目目录名称>
```
(如果您直接收到了项目文件，可以跳过此步骤并导航到项目的根目录。)

### 安装

使用 npm 或 yarn 安装项目依赖项：

使用 npm:
```bash
npm install
```

或使用 Yarn:
```bash
yarn install
```

### 环境变量

项目使用 `.env` 文件来管理环境变量。通过复制 `.env.example` (如果存在) 或手动创建，在项目根目录中创建一个 `.env` 文件。

**AI 功能重要提示:**
为了使 AI 功能 (如 RFQ 处理) 正常工作，您需要配置 Genkit 并提供必要的 API 密钥。例如，如果使用 Google AI (Gemini)，您将需要一个 Google AI API 密钥。

在项目根目录中创建或更新您的 `.env` 文件，并填入您的 Google AI API 密钥：
```env
GOOGLE_API_KEY=在此处输入您的Google_AI_API密钥
```
`src/ai/genkit.ts` 中的 Genkit 配置已设置为使用 Google AI。请确保已设置 `GOOGLE_API_KEY` 环境变量，以便 Genkit 插件进行身份验证。

### 运行开发服务器

要在开发模式下运行 Next.js 应用程序：

```bash
npm run dev
```
或使用 Yarn:
```bash
yarn dev
```
应用程序通常可在 `http://localhost:9002` 访问。

**本地运行 Genkit Flows (用于 AI 功能开发/测试):**
如果您正在开发或测试 Genkit AI Flows，您可能希望与 Next.js 应用程序一起运行 Genkit 开发服务器。这使您可以在 Genkit 开发者 UI 中检查 Flows、提示和跟踪。
```bash
npm run genkit:dev
```
或用于监视更改：
```bash
npm run genkit:watch
```
Genkit 开发者 UI 通常可在 `http://localhost:4000` 访问。

## 构建生产版本

要为生产环境构建应用程序，请运行：

```bash
npm run build
```
或使用 Yarn:
```bash
yarn build
```
此命令编译 Next.js 应用程序并将生产就绪文件输出到 `.next` 目录。

## 部署

本节概述了如何部署 FreightWise 应用程序，重点关注自托管的 Node.js 服务器环境。

### 自托管 Node.js 服务器

1.  **构建应用程序**:
    确保您已按照上述说明使用 `npm run build` 构建了应用程序。这会创建包含优化生产构建的 `.next` 目录。

2.  **将文件传输到服务器**:
    将以下文件和目录复制到您的部署服务器：
    - `.next` (构建输出)
    - `public` (静态资源)
    - `package.json`
    - `package-lock.json` (如果使用 npm) 或 `yarn.lock` (如果使用 yarn)
    - `next.config.ts` (或 `next.config.js`)
    - `locales` 目录 (用于国际化)

    通常建议*不要*复制 `node_modules` 目录。而是在服务器上重新安装依赖项。

3.  **在服务器上安装生产依赖项**:
    在服务器上导航到项目目录，并仅安装生产依赖项：
    ```bash
    npm install --production
    ```
    或使用 Yarn:
    ```bash
    yarn install --production
    ```

4.  **设置生产环境变量**:
    确保在您的生产环境中设置了所有必要的环境变量 (与您开发环境的 `.env` 文件中定义的相同，特别是用于 AI 功能的 `GOOGLE_API_KEY`)。设置这些变量的方式取决于您的服务器设置 (例如，系统环境变量、由进程管理器加载的 `.env` 文件或特定于平台的配置)。
    **关键：设置 `NODE_ENV=production`**。

5.  **启动应用程序**:
    使用以下命令运行生产服务器：
    ```bash
    npm run start
    ```
    或使用 Yarn:
    ```bash
    yarn start
    ```
    这将启动 Next.js 生产服务器，默认情况下通常在端口 3000 上运行，除非另有配置 (例如，通过 `PORT` 环境变量或在 `package.json` 脚本中)。

### 生产环境变量

对于生产环境，请确保所有必需的环境变量，尤其是像 `GOOGLE_API_KEY` 这样的 API 密钥，已在您的部署服务器上安全配置。不要将敏感密钥直接提交到版本控制中的 `.env` 文件。使用您的部署平台管理密钥的方法。

### 进程管理

对于生产环境，强烈建议使用像 PM2 这样的进程管理器来可靠地运行您的 Next.js 应用程序。PM2 可以处理：
- 保持应用程序存活 (如果崩溃则重新启动)。
- 在集群中运行应用程序以利用多个 CPU 内核。
- 日志管理。
- 零停机重新加载。

使用 PM2 的示例：
```bash
pm2 start npm --name "freightwise-app" -- run start
```

## 关键技术

- **Next.js**: `15.2.3` (用于生产的 React 框架)
- **React**: `18.3.1` (用于构建用户界面的 JavaScript 库)
- **TypeScript**: 用于静态类型检查和提高代码质量。
- **Tailwind CSS**: 工具优先的 CSS 框架，用于样式设计。
- **ShadCN UI**: 使用 Radix UI 和 Tailwind CSS 构建的可重用 UI 组件。
- **Genkit**: `1.8.0` (用于构建 AI 驱动功能的工具包，已配置 Google AI)。
- **Lucide React**: 图标库。
- **Zod**: Schema 验证库。
- **React Hook Form**: 用于表单管理。

## 本地化

- 应用程序支持多种语言：
  - 英语 (`en`)
  - 中文 (`zh`)
- 默认区域设置为 **中文 (`zh`)**。
- 翻译字符串在 `locales` 目录内的 JSON 文件中管理 (例如, `locales/en.json`, `locales/zh.json`)。
- 自定义中间件 (`middleware.ts`) 处理区域设置检测和路由。

## AI 功能 (Genkit)

- 应用程序利用 Genkit 实现 AI 驱动的功能，例如位于 `src/ai/flows/submit-rfq-flow.ts` 的 RFQ (报价请求) 提交处理流程。
- 这些流程配置为使用 Google AI 插件 (例如 Gemini 模型)。
- **关键**：为了使 AI 功能正常工作，必须在您的环境中 (本地的 `.env` 文件和生产环境) 正确设置 `GOOGLE_API_KEY` 环境变量。
- Genkit Flows 是服务器端的，在部署时将作为 Next.js 服务器进程的一部分运行。
