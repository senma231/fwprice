
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
    连接到您新创建的数据库 (例如, `psql -d freightwise_db -U your_db_user`) 并运行以下 SQL DDL 语句来创建必要的表。如果 `uuid-ossp` 扩展尚不可用，您可能需要安装它 (`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)，或者确保您的 PostgreSQL 版本支持 `gen_random_uuid()`。本应用将在 Node.js 中使用 `crypto.randomUUID()` 生成 UUID。

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
    ```sql
    -- 重要提示：请将 'your_hashed_password_here' 替换为安全哈希后的密码。
    -- 当前应用程序在存储前不哈希密码。这是一个严重的安全步骤。
    INSERT INTO users (id, email, name, password_hash, role, permissions) VALUES
    (gen_random_uuid()::text, 'admin@freightwise.com', 'Admin User', 'admin_password_plain', 'admin', '{"prices": ["view", "create", "edit", "delete"], "users": ["view", "create", "edit", "delete"], "announcements": ["view", "create", "edit", "delete"], "rfqs": ["view", "create", "edit", "delete"]}');
    ```

## 开始 (开发)

按照以下步骤设置项目以进行本地开发。

### 克隆仓库
(说明保持不变)

### 安装
(说明保持不变)

### 环境变量

项目使用 `.env` 文件来管理环境变量。通过复制 `.env.example` (如果存在) 或手动创建，在项目根目录中创建一个 `.env` 文件。

**数据库连接:**
在 `.env` 文件中配置您的 PostgreSQL 连接详细信息：
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
```
确保这些值与您的 PostgreSQL 设置相匹配。

**AI 功能重要提示:**
(关于 `GOOGLE_API_KEY` 的说明保持不变)

### 运行开发服务器
(说明保持不变)

## 构建生产版本
(说明保持不变)

## 部署
(说明保持不变，但强调服务器上的数据库设置)

### 自托管 Node.js 服务器
1.  **设置 PostgreSQL 数据库**: 确保您的生产服务器已安装并配置 PostgreSQL，并已按照“数据库设置”部分的说明创建了数据库和表。
2.  **构建应用程序**: (同上)
3.  **将文件传输到服务器**: (同上)
4.  **在服务器上安装生产依赖项**: (同上)
5.  **设置生产环境变量**: (同上，但现在包括 PostgreSQL 变量)
    确保设置了所有必要的环境变量，包括 PostgreSQL 连接变量 (`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`, 或 `DATABASE_URL`) 和 `GOOGLE_API_KEY`。
    **关键：设置 `NODE_ENV=production`**。
6.  **启动应用程序**: (同上)

### 生产环境变量
(说明保持不变，强调数据库凭据和 API 密钥的安全性)

### 进程管理
(说明保持不变)

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
(说明保持不变)

## AI 功能 (Genkit)
(说明保持不变)

## 安全注意事项

- **密码哈希**: 当前实现**在存储到数据库或登录比较期间不会对密码进行哈希处理**。这是一个主要的安全漏洞。在生产系统中，您**必须**实现强密码哈希 (例如，使用 `bcrypt` 或 `Argon2`)。`users` 表中的 `password_hash` 列用于存储这些哈希值。
- **SQL 注入**: 应用程序通过 `pg` 库使用参数化查询，这是防止 SQL 注入漏洞的标准方法。确保所有数据库交互继续使用此方法。
- **输入验证**: Zod 用于对输入进行模式验证 (例如，RFQ 表单、API 流程)。对所有用户输入保持全面的验证。
- **环境变量**: 将所有敏感信息 (数据库凭据、API 密钥) 保存在环境变量中，切勿将其提交到版本控制系统。
```markdown
当运行 `npm run build` 或 `yarn build` 时，Next.js 会将您的应用程序编译为优化的、生产就绪的状态。此过程包括：
- 将 TypeScript 和 JSX 转译为 JavaScript。
- 打包 JavaScript 代码。
- 优化静态资源 (图片、CSS)。
- 在可能的情况下生成静态 HTML 页面 (SSG) 或准备服务器端渲染页面 (SSR)。
- 为 API 路由和服务器组件创建无服务器函数。

输出将主要位于 `.next` 目录中。此目录包含在 Node.js 环境中运行应用程序所需的一切。

对于部署到运行 Node.js 进程的服务器 (例如，EC2 实例、VPS 或专用服务器) 的典型情况：

1.  **在本地或构建服务器上构建**:
    通常最佳实践是在干净的环境中构建应用程序，这可以是您的本地计算机 (如果与服务器一致) 或专用的 CI/CD 流水线。
    ```bash
    npm run build
    # 或
    # yarn build
    ```

2.  **准备传输文件**:
    您需要将以下内容传输到您的生产服务器：
    *   `.next` (构建输出)
    *   `public` (静态资源)
    *   `package.json`
    *   `package-lock.json` (如果使用 npm) 或 `yarn.lock` (如果使用 yarn)
    *   `next.config.ts` (或 `.js`)
    *   `locales` 目录 (用于国际化)
    *   您的 `.env.production` 文件 (或确保环境变量直接在服务器上设置)。**不要提交包含实际密钥的 `.env` 文件。**

    您可以创建这些项目的存档 (例如，`.tar.gz` 文件)。

3.  **在生产服务器上**:
    *   **设置 Node.js**: 确保已安装 Node.js (版本 20.x 或指定版本)。
    *   **设置 PostgreSQL**: 确保您的 PostgreSQL 数据库已设置、可访问，并包含模式和任何必要的初始数据。
    *   **传输文件**: 将您的存档复制到服务器并解压缩。
    *   **安装生产依赖项**: 导航到项目目录并运行：
        ```bash
        npm install --production
        # 或
        # yarn install --production
        ```
        这仅安装 `package.json` 中 `dependencies` 列出的依赖项，不包括 `devDependencies`。
    *   **设置环境变量**:
        确保设置了所有必需的环境变量。这至关重要。这些包括：
        *   `NODE_ENV=production`
        *   `GOOGLE_API_KEY` (用于 AI 功能)
        *   `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE` (或 `DATABASE_URL`)
        设置这些变量的方式取决于您的服务器/平台 (例如，systemd 服务文件、PM2 加载的 `.env` 文件、特定于平台的配置面板)。
    *   **启动应用程序**:
        ```bash
        npm run start
        # 或
        # yarn start
        ```
        此命令通常运行 `next start`，它会启动 Next.js 生产服务器。默认情况下，它侦听端口 3000，但这可以更改 (例如，通过 `PORT` 环境变量)。

4.  **进程管理 (推荐)**:
    对于生产环境，请使用像 PM2 这样的进程管理器来：
    *   保持应用程序运行 (崩溃时重新启动)。
    *   管理日志。
    *   启用集群以利用多个 CPU 内核。
    *   处理零停机部署 (平滑重启)。

    使用 PM2 的示例：
    ```bash
    # 如果尚未全局安装 PM2
    # npm install pm2 -g

    # 使用 PM2 启动您的应用
    pm2 start npm --name "freightwise-app" -- run start

    # 查看日志
    # pm2 logs freightwise-app

    # 监控
    # pm2 monit
    ```

5.  **Web 服务器/反向代理 (可选但推荐)**:
    通常，您会在像 Nginx 或 Apache 这样的 Web 服务器后面运行您的 Next.js 应用，作为反向代理。这可以处理：
    *   SSL/TLS 终止 (HTTPS)。
    *   更有效地提供静态资源。
    *   负载均衡 (如果您扩展到多个实例)。
    *   缓存。
    *   速率限制和其他安全措施。

    一个 Nginx 配置可能如下所示 (简化版)：
    ```nginx
    server {
        listen 80;
        server_name yourdomain.com;

        # 对于 SSL (推荐)
        # listen 443 ssl;
        # ssl_certificate /path/to/your/certificate.pem;
        # ssl_certificate_key /path/to/your/private.key;

        location / {
            proxy_pass http://localhost:3000; # 假设 Next.js 在端口 3000 上运行
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

通过执行这些步骤，您应该能够成功地将 FreightWise 应用程序构建并部署到生产服务器。请记住根据您的特定服务器环境调整路径和配置。
```