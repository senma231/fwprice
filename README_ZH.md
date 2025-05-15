
# FreightWise 应用

FreightWise 是一个专为货运价格查询、报价请求 (RFQ) 管理以及货运代理和管理员内部操作任务而设计的 Web 应用程序。它具有面向公众的价格搜索、代理仪表盘以及用于管理价格、用户和公告的管理面板，并结合了 AI 驱动的 RFQ 处理功能。

## 目录

- [先决条件](#先决条件)
- [数据库设置 (PostgreSQL)](#数据库设置-postgresql)
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
- [安全注意事项](#安全注意事项)

## 先决条件

在开始之前，请确保您已安装以下软件：

- **Node.js**: 版本 20.x (推荐 LTS) 或更高。您可以从 [nodejs.org](https://nodejs.org/) 下载。
- **npm** (随 Node.js 安装) 或 **Yarn**:
  - npm: 版本 9.x 或更高。
  - Yarn: 版本 1.22.x 或更高。
- **PostgreSQL**: 版本 14 或更高。从 [postgresql.org](https://www.postgresql.org/download/) 下载。

## 数据库设置 (PostgreSQL)

此应用程序使用 PostgreSQL 作为其数据库。

1.  **安装 PostgreSQL**: 如果您尚未安装，请安装 PostgreSQL (版本 14+)。
2.  **创建数据库**:
    连接到您的 PostgreSQL 服务器 (例如，使用 `psql`) 并为此应用程序创建一个新数据库。例如：
    ```sql
    CREATE DATABASE freightwise_db;
    ```
    您可能还需要创建一个专用用户并授予权限：
    ```sql
    CREATE USER your_db_user WITH PASSWORD 'your_db_password';
    GRANT ALL PRIVILEGES ON DATABASE freightwise_db TO your_db_user;
    ```
3.  **创建表**:
    连接到您新创建的数据库 (例如, `psql -d freightwise_db -U your_db_user`) 并运行以下 SQL DDL 语句来创建必要的表。本应用将在 Node.js 中使用 `crypto.randomUUID()` 生成 UUID。

    ```sql
    -- 用户表
    CREATE TABLE users (
        id TEXT PRIMARY KEY, -- UUID 以 TEXT 形式存储
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL, -- 在此存储哈希后的密码！
        role VARCHAR(50) NOT NULL CHECK (role IN ('agent', 'admin')),
        permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 价格表
    CREATE TABLE prices (
        id TEXT PRIMARY KEY, -- UUID 以 TEXT 形式存储
        origin VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        valid_from TIMESTAMP WITH TIME ZONE,
        valid_to TIMESTAMP WITH TIME ZONE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('public', 'internal')),
        carrier VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 公告表
    CREATE TABLE announcements (
        id TEXT PRIMARY KEY, -- UUID 以 TEXT 形式存储
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        author_name VARCHAR(255), -- 为方便起见进行的非规范化
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- RFQs (询价请求) 表
    CREATE TABLE rfqs (
        id TEXT PRIMARY KEY, -- 内部 UUID 以 TEXT 形式存储
        submission_id VARCHAR(255) UNIQUE NOT NULL, -- 面向用户的 ID
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        origin VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        weight DECIMAL(10, 2),
        freight_type VARCHAR(50),
        message TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Quoted', 'Closed')),
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 可选：为常用查询列创建索引
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_prices_origin_destination_type ON prices(origin, destination, type);
    CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
    CREATE INDEX idx_rfqs_submitted_at ON rfqs(submitted_at DESC);
    CREATE INDEX idx_rfqs_status ON rfqs(status);
    ```
    **关于 `updated_at`**: 要在行更新时自动更新 `updated_at` 时间戳，您可以创建一个触发器函数：
    ```sql
    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER set_timestamp_users
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

    CREATE TRIGGER set_timestamp_prices
    BEFORE UPDATE ON prices
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

    CREATE TRIGGER set_timestamp_announcements
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

    CREATE TRIGGER set_timestamp_rfqs
    BEFORE UPDATE ON rfqs
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();
    ```

4.  **初始数据 (可选)**: 您可能需要插入一些初始数据，例如一个管理员用户。
    **重要提示**: `password_hash` 列用于存储安全哈希后的密码。以下示例使用明文密码占位符。**在存储真实用户数据前，您必须在应用程序逻辑中实现密码哈希。**
    ```sql
    -- 示例: (在实际设置中，请将 'admin_password_plain' 替换为哈希后的密码)
    -- 当前应用不进行哈希，因此测试时，此处密码需与应用期望的明文匹配。
    INSERT INTO users (id, email, name, password_hash, role, permissions) VALUES
    (gen_random_uuid()::text, 'admin@freightwise.com', 'Admin User', 'admin_password_plain', 'admin', '{"prices": ["view", "create", "edit", "delete"], "users": ["view", "create", "edit", "delete"], "announcements": ["view", "create", "edit", "delete"], "rfqs": ["view", "create", "edit", "delete"]}');
    ```

## 开始 (开发)

按照以下步骤设置项目以进行本地开发。

### 克隆仓库
1.  将仓库克隆到您的本地计算机：
    ```bash
    git clone https://your-repository-url.git freightwise-app
    ```
    (请将 `https://your-repository-url.git` 替换为您的实际仓库 URL)
2.  进入项目目录：
    ```bash
    cd freightwise-app
    ```

### 安装
使用 npm 或 yarn 安装项目依赖：
```bash
npm install
# 或
# yarn install
```

### 环境变量

项目使用 `.env` 文件来管理环境变量。在项目根目录中创建一个 `.env` 文件。您可以复制 `.env.example` (如果存在)，或手动创建并包含以下内容：

```env
# PostgreSQL 数据库连接
# 选项 1: 单独参数
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DATABASE=freightwise_db

# 选项 2: 连接字符串 (如果您倾向于此方式，请取消注释并注释掉上面的参数)
# DATABASE_URL="postgresql://your_db_user:your_db_password@localhost:5432/freightwise_db"

# Google AI API 密钥 (用于 Genkit 功能)
GOOGLE_API_KEY=your_google_ai_api_key_here
```
- 更新 `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE` 以匹配您的 PostgreSQL 设置。
- 如果您使用 `DATABASE_URL`，请确保其格式正确。
- 如果计划使用 AI 功能，请从 Google AI Studio (例如，为 Gemini) 获取 `GOOGLE_API_KEY`。

### 运行开发服务器
要启动开发服务器 (根据您的 `package.json`，通常在 `http://localhost:9002`上运行)：
```bash
npm run dev
# 或
# yarn dev
```
这将启动 Next.js 应用程序。如果使用 Genkit 功能，请确保您的 Genkit 开发服务器正在运行 (如果单独管理) 或您的设置包含它 (例如，在单独的终端中运行 `genkit:watch`)。

## 构建生产版本
要构建生产版本的应用程序：
```bash
npm run build
# 或
# yarn build
```
此命令会编译您的 Next.js 应用程序，并将生产就绪的文件输出到 `.next` 目录中。

## 部署

本节概述了在自托管 Node.js 服务器环境中部署的步骤。

### 自托管 Node.js 服务器

1.  **设置 PostgreSQL 数据库**:
    确保您的生产服务器已安装并配置 PostgreSQL。必须按照“数据库设置 (PostgreSQL)”部分的说明创建数据库 (`freightwise_db`) 和所有必要的表。确保数据库用户具有正确的权限。

2.  **构建应用程序**:
    通常最佳实践是在干净的环境中构建应用程序 (本地或 CI/CD 服务器)：
    ```bash
    npm run build
    ```

3.  **将文件传输到服务器**:
    将以下内容复制到您的生产服务器：
    *   `.next` (构建输出)
    *   `public` (静态资源)
    *   `package.json`
    *   `package-lock.json` (如果使用 npm) 或 `yarn.lock` (如果使用 yarn)
    *   `next.config.ts` (或 `.js`)
    *   `locales` 目录 (用于国际化)
    *   您的生产环境 `.env` 文件 (或确保环境变量直接在服务器上设置)。**不要将包含实际密钥的 `.env` 文件提交到版本控制系统。**
    您可以创建这些项目的存档 (例如，`.tar.gz` 文件) 以方便传输。

4.  **在服务器上安装生产依赖项**:
    在服务器上导航到项目目录并运行：
    ```bash
    npm install --production
    # 或
    # yarn install --production
    ```
    这仅安装 `package.json` 中 `dependencies` 列出的依赖项，不包括 `devDependencies`。

5.  **设置生产环境变量**:
    确保在生产服务器上设置了所有必要的环境变量。这至关重要。这些包括：
    *   `NODE_ENV=production`
    *   `GOOGLE_API_KEY` (用于 AI 功能)
    *   `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE` (或 `DATABASE_URL`，如果您使用连接字符串)。
    设置这些变量的方式取决于您的服务器/平台 (例如，systemd 服务文件、PM2 加载的 `.env` 文件、特定于平台的配置面板)。

6.  **启动应用程序**:
    ```bash
    npm run start
    # 或
    # yarn start
    ```
    此命令通常运行 `next start`，它会启动 Next.js 生产服务器。默认情况下，它侦听端口 3000，但这可以更改 (例如，通过 `PORT` 环境变量或配置 `next start -p <your_port>`)。

### 生产环境变量
在生产环境中安全地管理环境变量至关重要。
- **切勿将包含实际生产密钥 (如数据库密码或 API 密钥) 的 `.env` 文件提交到版本控制系统。**
- 使用您的部署平台推荐的方法来设置环境变量 (例如，PaaS 配置、systemd 服务文件、Docker 环境变量，或由 PM2 等进程管理器加载的、安全管理且未在 git 中的 `.env` 文件)。
- 确保将 `NODE_ENV` 设置为 `production`。

### 进程管理
对于生产环境，强烈建议使用像 PM2 或 systemd 这样的进程管理器来：
- 保持应用程序运行 (例如，在崩溃时重新启动)。
- 管理日志。
- 启用集群以利用多个 CPU 内核 (PM2 可以做到这一点)。
- 处理零停机部署 (PM2 的平滑重启)。

使用 PM2 的示例：
```bash
# 如果尚未全局安装 PM2
npm install pm2 -g

# 使用 PM2 启动您的应用 (假设您的启动脚本是 `next start`)
pm2 start npm --name "freightwise-app" -- run start

# 保存进程列表以便在服务器重启时自动启动
pm2 save

# 查看日志
pm2 logs freightwise-app

# 监控进程
pm2 monit
```

## 关键技术

- **Next.js**: `15.2.3` (用于生产的 React 框架)
- **React**: `18.3.1` (用于构建用户界面的 JavaScript 库)
- **TypeScript**: 用于静态类型检查和提高代码质量。
- **PostgreSQL**: 版本 14+ (关系型数据库系统)
- **pg (node-postgres)**: Node.js 的 PostgreSQL 客户端。
- **Tailwind CSS**: 工具优先的 CSS 框架，用于样式设计。
- **ShadCN UI**: 使用 Radix UI 和 Tailwind CSS 构建的可重用 UI 组件。
- **Genkit**: `1.8.0` (用于构建 AI 驱动功能的工具包，已配置 Google AI)。
- **Lucide React**: 图标库。
- **Zod**: Schema 验证库。
- **React Hook Form**: 用于表单管理。

## 本地化
应用程序支持英语 (`en`) 和中文 (`zh`)。
- 语言环境文件位于 `locales` 目录中 (`en.json`, `zh.json`)。
- 自定义中间件 (`middleware.ts`) 处理语言环境检测和路由。
- 默认语言环境是中文 (`zh`)。

## AI 功能 (Genkit)
该应用程序利用 Genkit 实现 AI 驱动的功能，例如处理 RFQ 提交。
- Genkit 流程定义在 `src/ai/flows` 目录中。
- Genkit 配置 (例如，针对 Google AI 与 Gemini) 位于 `src/ai/genkit.ts` 中。
- 确保设置了 `GOOGLE_API_KEY` 环境变量，以便这些功能正常工作。

## 安全注意事项

- **密码哈希**: 当前的 `authService.ts` 实现**在存储到数据库或登录比较期间不会对密码进行哈希处理**。这是一个主要的安全漏洞。在生产系统中，您**必须**实现强密码哈希 (例如，使用 `bcrypt` 或 `Argon2`)。`users` 表中的 `password_hash` 列用于存储这些哈希值。
- **SQL 注入**: 应用程序通过 `pg` 库和 `src/lib/db.ts` 中的自定义 `query` 函数使用参数化查询，这是防止 SQL 注入漏洞的标准方法。确保所有数据库交互继续使用此方法。
- **输入验证**: Zod 用于对输入进行模式验证 (例如，RFQ 表单、API 流程、实体创建表单)。对所有用户输入保持全面的验证。
- **环境变量**: 将所有敏感信息 (数据库凭据、API 密钥) 保存在环境变量中，切勿将其提交到版本控制系统。在生产中采用安全的方法管理这些变量。
- **权限与授权**: 应用程序具有基于角色的权限系统 (`agent`, `admin`) 以及在 `users.permissions` 中定义的更细粒度的权限。确保对所有敏感操作都正确且稳健地执行此逻辑。

    