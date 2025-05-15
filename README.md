
# FreightWise Application

FreightWise is a web application designed for freight price lookup, Request for Quotation (RFQ) management, and internal operational tasks for freight agents and administrators. It features a public-facing price search, an agent dashboard, and administrative panels for managing prices, users, and announcements, along with AI-powered RFQ processing.

## Table of Contents

- [Prerequisites](#prerequisites)
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

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.x (LTS recommended) or higher. You can download it from [nodejs.org](https://nodejs.org/).
- **npm** (comes with Node.js) or **Yarn**:
  - npm: Version 9.x or higher.
  - Yarn: Version 1.22.x or higher.

## Getting Started (Development)

Follow these steps to set up the project for local development.

### Cloning the Repository

If you haven't already, clone the repository to your local machine:
```bash
git clone <your-repository-url>
cd <project-directory-name>
```
(If you received the project files directly, you can skip this step and navigate to the project's root directory.)

### Installation

Install the project dependencies using either npm or yarn:

Using npm:
```bash
npm install
```

Or using Yarn:
```bash
yarn install
```

### Environment Variables

The project uses a `.env` file for environment variables. Create a `.env` file in the project root by copying the `.env.example` if one exists, or create it manually.

**Important for AI Features:**
For AI functionalities (like RFQ processing) to work, you need to configure Genkit with necessary API keys. For example, if using Google AI (Gemini), you'll need a Google AI API key.

Create or update your `.env` file in the project root with your Google AI API Key:
```env
GOOGLE_API_KEY=your_google_ai_api_key_here
```
The Genkit configuration in `src/ai/genkit.ts` is set up to use Google AI. Ensure the `GOOGLE_API_KEY` environment variable is set for the Genkit plugins to authenticate.

### Running the Development Server

To run the Next.js application in development mode:

```bash
npm run dev
```
Or with Yarn:
```bash
yarn dev
```
The application will typically be available at `http://localhost:9002`.

**Running Genkit Flows Locally (for AI feature development/testing):**
If you are developing or testing Genkit AI flows, you might want to run the Genkit development server alongside the Next.js app. This allows you to inspect flows, prompts, and traces in the Genkit developer UI.
```bash
npm run genkit:dev
```
Or for watching changes:
```bash
npm run genkit:watch
```
The Genkit developer UI will usually be available at `http://localhost:4000`.

## Building for Production

To build the application for production, run:

```bash
npm run build
```
Or with Yarn:
```bash
yarn build
```
This command compiles the Next.js application and outputs the production-ready files into the `.next` directory.

## Deployment

This section outlines how to deploy the FreightWise application, focusing on a self-hosted Node.js server environment.

### Self-Hosted Node.js Server

1.  **Build the Application**:
    Ensure you have built the application using `npm run build` as described above. This creates the `.next` directory with the optimized production build.

2.  **Transfer Files to Server**:
    Copy the following files and directories to your deployment server:
    - `.next` (the build output)
    - `public` (static assets)
    - `package.json`
    - `package-lock.json` (if using npm) or `yarn.lock` (if using yarn)
    - `next.config.ts` (or `next.config.js`)
    - The `locales` directory (for internationalization)

    It's generally recommended *not* to copy the `node_modules` directory. Instead, reinstall dependencies on the server.

3.  **Install Production Dependencies on Server**:
    Navigate to the project directory on your server and install only production dependencies:
    ```bash
    npm install --production
    ```
    Or with Yarn:
    ```bash
    yarn install --production
    ```

4.  **Set Environment Variables in Production**:
    Ensure all necessary environment variables (as defined in your `.env` file for development, especially `GOOGLE_API_KEY` for AI features) are set in your production environment. How you set these depends on your server setup (e.g., system environment variables, a `.env` file loaded by your process manager, or platform-specific configuration).
    **Crucially, set `NODE_ENV=production`**.

5.  **Start the Application**:
    Run the production server using:
    ```bash
    npm run start
    ```
    Or with Yarn:
    ```bash
    yarn start
    ```
    This will start the Next.js production server, typically on port 3000 by default unless configured otherwise (e.g., via the `PORT` environment variable or in `package.json` scripts).

### Environment Variables in Production

For production, ensure that all required environment variables, especially API keys like `GOOGLE_API_KEY`, are securely configured on your deployment server. Do not commit sensitive keys directly into your `.env` file in version control. Use your deployment platform's method for managing secrets.

### Process Management

For a production environment, it's highly recommended to use a process manager like PM2 to keep your Next.js application running reliably. PM2 can handle:
- Keeping the app alive (restarting if it crashes).
- Running the app in a cluster to utilize multiple CPU cores.
- Log management.
- Zero-downtime reloads.

Example using PM2:
```bash
pm2 start npm --name "freightwise-app" -- run start
```

## Key Technologies

- **Next.js**: `15.2.3` (React Framework for Production)
- **React**: `18.3.1` (JavaScript library for building user interfaces)
- **TypeScript**: For static typing and improved code quality.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **ShadCN UI**: Re-usable UI components built with Radix UI and Tailwind CSS.
- **Genkit**: `1.8.0` (Toolkit for building AI-powered features, configured with Google AI).
- **Lucide React**: Icon library.
- **Zod**: Schema validation library.
- **React Hook Form**: For form management.

## Localization

- The application supports multiple languages:
  - English (`en`)
  - Chinese (`zh`)
- The default locale is **Chinese (`zh`)**.
- Translation strings are managed in JSON files within the `locales` directory (e.g., `locales/en.json`, `locales/zh.json`).
- A custom middleware (`middleware.ts`) handles locale detection and routing.

## AI Features (Genkit)

- The application utilizes Genkit for AI-powered functionalities, such as the RFQ (Request for Quotation) submission processing flow located in `src/ai/flows/submit-rfq-flow.ts`.
- These flows are configured to use the Google AI plugin (e.g., Gemini models).
- **Crucial**: For AI features to function, the `GOOGLE_API_KEY` environment variable must be set correctly in your environment (both locally in `.env` and in production).
- Genkit flows are server-side and will run as part of the Next.js server process when deployed.
```