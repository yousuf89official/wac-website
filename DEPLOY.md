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

## 2. Hostinger Configuration (Cloud Professional)
Your plan includes **Managed Node.js Hosting**, which is the ideal way to host this Next.js app.

### Steps in Hostinger hPanel:
1.  **Add Website/Subdomain**: Create a new subdomain (e.g., `staging.wearecollaborative.net`) or use your main domain.
2.  **Node.js Dashboard**: Navigate to **Advanced** -> **Node.js** in your hPanel.
3.  **Setup Node.js**:
    *   **Node.js version**: 20.x or 22.x.
    *   **Application Root**: `/staging` (or your chosen path).
    *   **Application URL**: Your domain/subdomain.
    *   **Application Mode**: `development` (for staging) or `production`.
4.  **Connect GitHub**:
    *   In the Node.js dashboard, click **Git**.
    *   Connect your repository: `https://github.com/yousuf89official/wac-website.git`.
    *   Select the **staging** branch.
5.  **Environment Variables**:
    *   Click **Environment Variables** in the Node.js menu.
    *   Add:
        *   `DATABASE_URL`: Your Hostinger MySQL connection string.
        *   `AIzaSyCa2--y8kqxxFRRuKR5NvmupFiD8fEMDOY`: Your Gemini key.
        *   `NEXT_PUBLIC_STAGING`: `true`.
        *   `NEXTAUTH_SECRET`: A secure random string.

### Deployment Commands:
In the Hostinger Node.js terminal or via **Deployment Manager**:
1.  `npm install`
2.  `npx prisma generate`
3.  `npm run build`
4.  **Startup File**: Set this to `node_modules/next/dist/bin/next` with the argument `start`.

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

## 5. Troubleshooting

### "Application Error: A client-side exception has occurred"
This generic error happens when the React application crashes on the client.
1.  **Check the Screen**: We have implemented a Global Error Boundary. Refresh the page to see the specific error message (e.g., "Cannot read property 'map' of undefined").
2.  **Hard Refresh**: Clear your browser cache (`Cmd+Shift+R` or `Ctrl+F5`) to ensure you are not serving stale files.
3.  **Check Environment Variables**: Ensure `NEXT_PUBLIC_SITE_URL` and `DATABASE_URL` are set correctly in Hostinger.

### "503 Service Unavailable"
This usually means the Next.js server is starting up or failed to start.
1.  Wait 1-2 minutes after deployment.
2.  Check **Deployment Logs** in Hostinger for startup errors.

### "404 Not Found"
1.  If on an API route: Ensure your `.htaccess` (if using one) or Hostinger routing configuration is correct.
2.  If on a page: Ensure you are building into the correct directory (`.next` usually, not `dist`).
