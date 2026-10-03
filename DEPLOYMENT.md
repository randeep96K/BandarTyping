# BandarTyping — Render Deployment Guide 🚀

BandarTyping is configured to run as a unified fullstack application. In production, the Node.js/Express server serves the optimized React production bundle (`dist/`), handles all API requests (`/api/*`), and provides built-in SQLite database support.

---

## ⚡ Quick 3-Step Deployment to Render

### Step 1: Push your code to GitHub

1. Create a new repository on [GitHub](https://github.com/new) named **`BandarTyping`** (keep it public or private).
2. In your terminal at `d:\BandarTyping`, run:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/BandarTyping.git
   git push -u origin main
   ```

---

### Step 2: Create a Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and sign in with GitHub.
2. Click the blue **"New +"** button in the top right, and choose **"Web Service"**.
3. Select your **`BandarTyping`** repository.
4. Render will auto-detect the configuration, or you can verify:
   - **Name**: `bandartyping`
   - **Language / Runtime**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **"Deploy Web Service"** at the bottom.

*(Alternatively, you can select **"New +" &gt; "Blueprint"**, and Render will automatically read the included `render.yaml` configuration).*

---

### Step 3: Access your Live App!

Render will:
1. Clone your repo.
2. Install dependencies.
3. Build the React frontend with Vite.
4. Launch the Express server.
5. Provide your permanent live HTTPS link (e.g. `https://bandartyping.onrender.com`).

---

## 🛠️ Included Production Files

- [`render.yaml`](file:///d:/BandarTyping/render.yaml): Render Blueprint file for 1-click deployment.
- [`Dockerfile`](file:///d:/BandarTyping/Dockerfile): Multi-stage container build for Docker, Railway, or VPS.
- [`server/index.ts`](file:///d:/BandarTyping/server/index.ts): Handles SPA routing and API proxying.
- [`package.json`](file:///d:/BandarTyping/package.json): `"start": "tsx server/index.ts"` production entrypoint.
