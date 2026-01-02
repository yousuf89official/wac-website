# Deployment Guide: We Are Collaborative

This guide outlines how to deploy the project to **Staging** and **Production** environments using **GitHub** and **Hostinger**.

## 1. GitHub Repository Setup
1. Create a new private repository on GitHub.
2. Link your local project:
   ```bash
   git remote add origin https://github.com/your-username/wac-website.git
   git push -u origin main
   ```
3. Create a `staging` branch:
   ```bash
   git checkout -b staging
   git push origin staging
   ```

## 2. Hostinger Configuration
Hostinger supports Next.js via their **Node.js Hosting** or a **VPS**.

### Node.js Hosting Setup:
1. Go to the **hPanel** -> **Advanced** -> **Node.js**.
2. Select the Node.js version (20.x recommended).
3. Set the **Application Root** to `/public_html` or your project folder.
4. Set the **Startup File** to `node_modules/next/dist/bin/next` (or use a custom `server.js`).
5. Set the **Run Script** to `start`.

### Database Strategy (Production):
> [!IMPORTANT]
> Change the database from SQLite to MySQL in production for better performance.
1. Create a MySQL database in Hostinger hPanel.
2. Update `.env.production` with the new `DATABASE_URL`:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/db_name"
   ```
3. Run migrations on the server:
   ```bash
   npx prisma migrate deploy
   ```

## 3. Environment Variables
Set these in the **Hostinger Node.js Dashboard** or via a `.env` file on the server:
- `DATABASE_URL`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXTAUTH_SECRET` (Generate using `openssl rand -base64 32`)

## 4. GitHub Actions (CI/CD)
The project is configured with a verification workflow in `.github/workflows/verify.yml`.
- Every push to `main` (Production) or `staging` will automatically trigger a build check.
- If the build fails, the deploy should not proceed.
