
# FreightWise Application

FreightWise is a web application designed for freight price lookup, Request for Quotation (RFQ) management, and internal operational tasks for freight agents and administrators. It features a public-facing price search, an agent dashboard, and administrative panels for managing prices, users, and announcements, along with AI-powered RFQ processing.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Database Setup (PostgreSQL)](#database-setup-postgresql)
- [Getting Started (Development)](#getting-started-development)
  - [Cloning the Repository](#cloning-the-repository)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Development Server](#running-the-development-server)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
  - [Self-Hosted Node.js Server](#self-hosted-nodejs-server)
  - [Environment Variables in Production](#environment-variables-in-production)
  - [Process Management](#process-management)
- [Key Technologies](#key-technologies)
- [Localization](#localization)
- [AI Features (Genkit)](#ai-features-genkit)
- [Security Notes](#security-notes)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.x (LTS recommended) or higher. You can download it from [nodejs.org](https://nodejs.org/).
- **npm** (comes with Node.js) or **Yarn**:
  - npm: Version 9.x or higher.
  - Yarn: Version 1.22.x or higher.
- **PostgreSQL**: Version 14 or higher. Download from [postgresql.org](https://www.postgresql.org/download/).

## Database Setup (PostgreSQL)

This application uses PostgreSQL as its database.

1.  **Install PostgreSQL**: If you haven't already, install PostgreSQL (version 14+).
2.  **Create a Database**:
    Connect to your PostgreSQL server (e.g., using `psql`) and create a new database for this application. For example:
    ```sql
    CREATE DATABASE freightwise_db;
    ```
    You may also want to create a dedicated user and grant permissions:
    ```sql
    CREATE USER your_db_user WITH PASSWORD 'your_db_password';
    GRANT ALL PRIVILEGES ON DATABASE freightwise_db TO your_db_user;
    ```
3.  **Create Tables**:
    Connect to your newly created database (e.g., `psql -d freightwise_db -U your_db_user`) and run the following SQL DDL statements to create the necessary tables. You might need to install the `uuid-ossp` extension if it's not already available (`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`) or ensure your PostgreSQL version supports `gen_random_uuid()`. The application will generate UUIDs in Node.js using `crypto.randomUUID()`.

    ```sql
    -- Users Table
    CREATE TABLE users (
        id TEXT PRIMARY KEY, -- UUID stored as TEXT
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords here!
        role VARCHAR(50) NOT NULL CHECK (role IN ('agent', 'admin')),
        permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Prices Table
    CREATE TABLE prices (
        id TEXT PRIMARY KEY, -- UUID stored as TEXT
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

    -- Announcements Table
    CREATE TABLE announcements (
        id TEXT PRIMARY KEY, -- UUID stored as TEXT
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        author_name VARCHAR(255), -- Denormalized for convenience
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- RFQs (Requests for Quotation) Table
    CREATE TABLE rfqs (
        id TEXT PRIMARY KEY, -- Internal UUID stored as TEXT
        submission_id VARCHAR(255) UNIQUE NOT NULL, -- User-facing ID
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

    -- Optional: Create indexes for frequently queried columns
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_prices_origin_destination_type ON prices(origin, destination, type);
    CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);
    CREATE INDEX idx_rfqs_submitted_at ON rfqs(submitted_at DESC);
    CREATE INDEX idx_rfqs_status ON rfqs(status);
    ```
    **Note on `updated_at`**: To automatically update the `updated_at` timestamp on row updates, you can create a trigger function:
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

4.  **Initial Data (Optional)**: You may want to insert some initial data, for example, an admin user.
    ```sql
    -- IMPORTANT: Replace 'your_hashed_password_here' with a securely hashed password.
    -- The application currently does not hash passwords before storing. This is a critical security step.
    INSERT INTO users (id, email, name, password_hash, role, permissions) VALUES
    (gen_random_uuid()::text, 'admin@freightwise.com', 'Admin User', 'admin_password_plain', 'admin', '{"prices": ["view", "create", "edit", "delete"], "users": ["view", "create", "edit", "delete"], "announcements": ["view", "create", "edit", "delete"], "rfqs": ["view", "create", "edit", "delete"]}');
    ```

## Getting Started (Development)

Follow these steps to set up the project for local development.

### Cloning the Repository
(Instructions remain the same)

### Installation
(Instructions remain the same)

### Environment Variables

The project uses a `.env` file for environment variables. Create a `.env` file in the project root by copying the `.env.example` if one exists, or create it manually.

**Database Connection:**
Configure your PostgreSQL connection details in the `.env` file:
```env
# PostgreSQL Database Connection
# Option 1: Individual Parameters
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DATABASE=freightwise_db

# Option 2: Connection String (if you prefer this, uncomment and comment out the above)
# DATABASE_URL="postgresql://your_db_user:your_db_password@localhost:5432/freightwise_db"
```
Ensure these values match your PostgreSQL setup.

**Important for AI Features:**
(Instructions remain the same for `GOOGLE_API_KEY`)

### Running the Development Server
(Instructions remain the same)

## Building for Production
(Instructions remain the same)

## Deployment
(Instructions remain the same, but emphasize database setup on the server)

### Self-Hosted Node.js Server
1.  **Set up PostgreSQL Database**: Ensure your production server has PostgreSQL installed and configured, with the database and tables created as per the "Database Setup" section.
2.  **Build the Application**: (Same)
3.  **Transfer Files to Server**: (Same)
4.  **Install Production Dependencies on Server**: (Same)
5.  **Set Environment Variables in Production**: (Same, but now includes PostgreSQL variables)
    Ensure all necessary environment variables are set, including those for PostgreSQL connection (`POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`, or `DATABASE_URL`) and `GOOGLE_API_KEY`.
    **Crucially, set `NODE_ENV=production`**.
6.  **Start the Application**: (Same)

### Environment Variables in Production
(Instructions remain the same, emphasizing security for DB credentials and API keys)

### Process Management
(Instructions remain the same)

## Key Technologies

- **Next.js**: `15.2.3` (React Framework for Production)
- **React**: `18.3.1` (JavaScript library for building user interfaces)
- **TypeScript**: For static typing and improved code quality.
- **PostgreSQL**: Version 14+ (Relational Database System)
- **pg (node-postgres)**: PostgreSQL client for Node.js.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **ShadCN UI**: Re-usable UI components built with Radix UI and Tailwind CSS.
- **Genkit**: `1.8.0` (Toolkit for building AI-powered features, configured with Google AI).
- **Lucide React**: Icon library.
- **Zod**: Schema validation library.
- **React Hook Form**: For form management.

## Localization
(Instructions remain the same)

## AI Features (Genkit)
(Instructions remain the same)

## Security Notes

- **Password Hashing**: The current implementation **DOES NOT HASH PASSWORDS** before storing them in the database or during login comparison. This is a major security vulnerability. In a production system, you **MUST** implement strong password hashing (e.g., using `bcrypt` or `Argon2`). The `password_hash` column in the `users` table is intended for storing these hashes.
- **SQL Injection**: The application uses parameterized queries via the `pg` library, which is the standard way to prevent SQL injection vulnerabilities. Ensure all database interactions continue to use this approach.
- **Input Validation**: Zod is used for schema validation on inputs (e.g., RFQ form, API flows). Maintain comprehensive validation for all user inputs.
- **Environment Variables**: Keep all sensitive information (database credentials, API keys) in environment variables and never commit them to version control.
```markdown
When running `npm run build` or `yarn build`, Next.js will compile your application into an optimized production-ready state. This process includes:
- Transpiling TypeScript and JSX into JavaScript.
- Bundling JavaScript code.
- Optimizing static assets (images, CSS).
- Generating static HTML pages where possible (SSG) or preparing server-rendered pages (SSR).
- Creating serverless functions for API routes and server components.

The output will be primarily located in the `.next` directory. This directory contains everything needed to run your application in a Node.js environment.

For a typical deployment to a server where you run a Node.js process (e.g., an EC2 instance, a VPS, or a dedicated server):

1.  **Build Locally or on a Build Server**:
    It's often best practice to build the application in a clean environment, which could be your local machine (if consistent with the server) or a dedicated CI/CD pipeline.
    ```bash
    npm run build
    # or
    # yarn build
    ```

2.  **Prepare Files for Transfer**:
    You'll need to transfer the following to your production server:
    *   `.next` (the build output)
    *   `public` (static assets)
    *   `package.json`
    *   `package-lock.json` (if using npm) or `yarn.lock` (if using yarn)
    *   `next.config.ts` (or `.js`)
    *   The `locales` directory (for internationalization)
    *   Your `.env.production` file (or ensure environment variables are set directly on the server). **Do not commit `.env` files with actual secrets.**

    You can create an archive (e.g., a `.tar.gz` file) of these items.

3.  **On the Production Server**:
    *   **Set up Node.js**: Ensure Node.js (version 20.x or as specified) is installed.
    *   **Set up PostgreSQL**: Ensure your PostgreSQL database is set up, accessible, and contains the schema and any necessary initial data.
    *   **Transfer Files**: Copy your archive to the server and extract it.
    *   **Install Production Dependencies**: Navigate to the project directory and run:
        ```bash
        npm install --production
        # or
        # yarn install --production
        ```
        This installs only the dependencies listed in `dependencies` in `package.json`, not `devDependencies`.
    *   **Set Environment Variables**:
        Ensure all required environment variables are set. This is crucial. These include:
        *   `NODE_ENV=production`
        *   `GOOGLE_API_KEY` (for AI features)
        *   `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE` (or `DATABASE_URL`)
        How you set these depends on your server/platform (e.g., systemd service files, `.env` file loaded by PM2, platform-specific configuration panels).
    *   **Start the Application**:
        ```bash
        npm run start
        # or
        # yarn start
        ```
        This command typically runs `next start`, which starts the Next.js production server. By default, it listens on port 3000, but this can be changed (e.g., via the `PORT` environment variable).

4.  **Process Management (Recommended)**:
    For a production environment, use a process manager like PM2 to:
    *   Keep the application running (restarts on crash).
    *   Manage logs.
    *   Enable clustering to utilize multiple CPU cores.
    *   Handle deployments with zero downtime (graceful reloads).

    Example with PM2:
    ```bash
    # Install PM2 globally if you haven't already
    # npm install pm2 -g

    # Start your app with PM2
    pm2 start npm --name "freightwise-app" -- run start

    # To view logs
    # pm2 logs freightwise-app

    # To monitor
    # pm2 monit
    ```

5.  **Web Server/Reverse Proxy (Optional but Recommended)**:
    Often, you'll run your Next.js app behind a web server like Nginx or Apache acting as a reverse proxy. This can handle:
    *   SSL/TLS termination (HTTPS).
    *   Serving static assets more efficiently.
    *   Load balancing (if you scale to multiple instances).
    *   Caching.
    *   Rate limiting and other security measures.

    An Nginx configuration might look something like this (simplified):
    ```nginx
    server {
        listen 80;
        server_name yourdomain.com;

        # For SSL (recommended)
        # listen 443 ssl;
        # ssl_certificate /path/to/your/certificate.pem;
        # ssl_certificate_key /path/to/your/private.key;

        location / {
            proxy_pass http://localhost:3000; # Assuming Next.js runs on port 3000
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

By following these steps, you should be able to successfully build and deploy your FreightWise application to a production server. Remember to adapt paths and configurations to your specific server environment.
```