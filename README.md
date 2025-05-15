
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
    Connect to your newly created database (e.g., `psql -d freightwise_db -U your_db_user`) and run the following SQL DDL statements to create the necessary tables. The application will generate UUIDs in Node.js using `crypto.randomUUID()`.

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
    **Important**: The `password_hash` column is intended for securely hashed passwords. The example below uses a placeholder. **You MUST implement password hashing in the application logic before storing real user data.**
    ```sql
    -- Example: (Replace 'admin_password_plain' with a HASHED password in a real setup)
    -- The application currently doesn't hash, so for testing, this needs to match what the app expects.
    INSERT INTO users (id, email, name, password_hash, role, permissions) VALUES
    (gen_random_uuid()::text, 'admin@freightwise.com', 'Admin User', 'admin_password_plain', 'admin', '{"prices": ["view", "create", "edit", "delete"], "users": ["view", "create", "edit", "delete"], "announcements": ["view", "create", "edit", "delete"], "rfqs": ["view", "create", "edit", "delete"]}');
    ```

## Getting Started (Development)

Follow these steps to set up the project for local development.

### Cloning the Repository
1.  Clone the repository to your local machine:
    ```bash
    git clone https://your-repository-url.git freightwise-app
    ```
    (Replace `https://your-repository-url.git` with your actual repository URL)
2.  Navigate into the project directory:
    ```bash
    cd freightwise-app
    ```

### Installation
Install the project dependencies using npm or yarn:
```bash
npm install
# or
# yarn install
```

### Environment Variables

The project uses a `.env` file for environment variables. Create a `.env` file in the project root. You can copy `.env.example` if one exists, or create it manually with the following content:

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

# Google AI API Key (for Genkit features)
GOOGLE_API_KEY=your_google_ai_api_key_here
```
- Update `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE` to match your PostgreSQL setup.
- If you use `DATABASE_URL`, ensure it's correctly formatted.
- Obtain a `GOOGLE_API_KEY` from Google AI Studio (e.g., for Gemini) if you plan to use AI features.

### Running the Development Server
To start the development server (usually on `http://localhost:9002` as per your `package.json`):
```bash
npm run dev
# or
# yarn dev
```
This will start the Next.js application. If Genkit features are used, ensure your Genkit development server is running (if managed separately) or that your setup includes it (e.g., via `genkit:watch` in a separate terminal).

## Building for Production
To build the application for production:
```bash
npm run build
# or
# yarn build
```
This command compiles your Next.js application and outputs the production-ready files into the `.next` directory.

## Deployment

This section outlines steps for deploying to a self-hosted Node.js server environment.

### Self-Hosted Node.js Server

1.  **Set up PostgreSQL Database**:
    Ensure your production server has PostgreSQL installed and configured. The database (`freightwise_db`) and all necessary tables must be created as per the "Database Setup (PostgreSQL)" section. Make sure the database user has the correct permissions.

2.  **Build the Application**:
    It's often best practice to build the application in a clean environment (locally or on a CI/CD server):
    ```bash
    npm run build
    ```

3.  **Transfer Files to Server**:
    Copy the following to your production server:
    *   `.next` (the build output)
    *   `public` (static assets)
    *   `package.json`
    *   `package-lock.json` (if using npm) or `yarn.lock` (if using yarn)
    *   `next.config.ts` (or `.js`)
    *   The `locales` directory (for internationalization)
    *   Your production `.env` file (or ensure environment variables are set directly on the server). **Do not commit `.env` files with actual secrets.**
    You can create an archive (e.g., a `.tar.gz` file) of these items for easier transfer.

4.  **Install Production Dependencies on Server**:
    Navigate to the project directory on the server and run:
    ```bash
    npm install --production
    # or
    # yarn install --production
    ```
    This installs only the dependencies listed in `dependencies` in `package.json`, not `devDependencies`.

5.  **Set Environment Variables in Production**:
    Ensure all necessary environment variables are set on the production server. This is crucial. These include:
    *   `NODE_ENV=production`
    *   `GOOGLE_API_KEY` (for AI features)
    *   `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE` (or `DATABASE_URL` if you use the connection string).
    How you set these depends on your server/platform (e.g., systemd service files, `.env` file loaded by PM2, platform-specific configuration panels).

6.  **Start the Application**:
    ```bash
    npm run start
    # or
    # yarn start
    ```
    This command typically runs `next start`, which starts the Next.js production server. By default, it listens on port 3000, but this can be changed (e.g., via the `PORT` environment variable or by configuring `next start -p <your_port>`).

### Environment Variables in Production
It is critical to manage environment variables securely in production.
- **Never commit `.env` files containing actual production secrets (like database passwords or API keys) to version control.**
- Use your deployment platform's recommended method for setting environment variables (e.g., PaaS configuration, systemd service files, Docker environment variables, or a `.env` file loaded by your process manager like PM2 that is securely managed and not in git).
- Ensure `NODE_ENV` is set to `production`.

### Process Management
For production, it's highly recommended to use a process manager like PM2 or systemd to:
- Keep your application running (e.g., restart on crash).
- Manage logs.
- Enable clustering to utilize multiple CPU cores (PM2 can do this).
- Handle deployments with zero downtime (graceful reloads with PM2).

Example with PM2:
```bash
# Install PM2 globally if you haven't already
npm install pm2 -g

# Start your app with PM2 (assuming your start script is `next start`)
pm2 start npm --name "freightwise-app" -- run start

# To save the process list for automatic restarts on server reboot
pm2 save

# To view logs
pm2 logs freightwise-app

# To monitor processes
pm2 monit
```

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
The application supports English (`en`) and Chinese (`zh`) languages.
- Locale files are located in the `locales` directory (`en.json`, `zh.json`).
- A custom middleware (`middleware.ts`) handles locale detection and routing.
- The default locale is Chinese (`zh`).

## AI Features (Genkit)
The application utilizes Genkit for AI-powered features, such as processing RFQ submissions.
- Genkit flows are defined in the `src/ai/flows` directory.
- The Genkit configuration (e.g., for Google AI with Gemini) is in `src/ai/genkit.ts`.
- Ensure the `GOOGLE_API_KEY` environment variable is set for these features to work.

## Security Notes

- **Password Hashing**: The current `authService.ts` implementation **DOES NOT HASH PASSWORDS** before storing them in the database or during login comparison. This is a major security vulnerability. In a production system, you **MUST** implement strong password hashing (e.g., using `bcrypt` or `Argon2`). The `password_hash` column in the `users` table is intended for storing these hashes.
- **SQL Injection**: The application uses parameterized queries via the `pg` library and the custom `query` function in `src/lib/db.ts`, which is the standard way to prevent SQL injection vulnerabilities. Ensure all database interactions continue to use this approach.
- **Input Validation**: Zod is used for schema validation on inputs (e.g., RFQ form, API flows, entity creation forms). Maintain comprehensive validation for all user inputs.
- **Environment Variables**: Keep all sensitive information (database credentials, API keys) in environment variables and never commit them to version control. Use secure methods to manage these variables in production.
- **Permissions & Authorization**: The application has a role-based permission system (`agent`, `admin`) and more granular permissions defined in `users.permissions`. Ensure this logic is robust and correctly enforced for all sensitive operations.

    