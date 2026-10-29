# Step-by-Step Render Deployment Guide for NearBee

This guide walks you through deploying the **NearBee** application to [Render](https://render.com) using the containerized Docker setup or Native Node runtime.

---

## Prerequisites
1. A GitHub account.
2. A free account on [Render.com](https://render.com).

---

## Method 1: Docker Web Service Deployment on Render (Recommended)

Because we have provided a production-grade multi-stage `Dockerfile`, Render will automatically build the container and deploy the app.

### Step 1: Push Project to GitHub
Open your terminal in this project root (`near-bee-main` directory) and run:

```bash
git init
git add .
git commit -m "feat: containerized NearBee application for Render deployment"
git branch -M main
git remote add origin https://github.com/<your-github-username>/near-bee-cloud.git
git push -u origin main
```

*(Note: If you have already linked this repository to GitHub or Lovable, simply commit and push changes to `main`.)*

---

### Step 2: Create Web Service on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** (top right) and select **Web Service**.
3. Choose **Build and deploy from a Git repository**.
4. Select or search for your `near-bee-cloud` GitHub repository.
5. In the configuration page, set:
   - **Name**: `nearbee-cloud-app` (or any name you prefer)
   - **Region**: Oregon (US West) or Singapore / Frankfurt
   - **Branch**: `main`
   - **Runtime**: **Docker**
   - **Instance Type**: **Free**
6. Click **Advanced** and verify:
   - **Health Check Path**: `/`
   - **Port**: `10000` (Render detects port 10000 automatically)
7. Environment Variables:
   Add the following environment variables (Render Dashboard -> Environment):
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `NITRO_PRESET` | `node-server` |
   | `SUPABASE_PROJECT_ID` | `ojfosxqlobynhjlnooro` |
   | `SUPABASE_URL` | `https://ojfosxqlobynhjlnooro.supabase.co` |
   | `SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qZm9zeHFsb2J5bmhqbG5vb3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMjA3OTksImV4cCI6MjA5NzU5Njc5OX0.KbRIrzvZT6DNXFYHrNHFtQ_tiBxy3SB4mMb4NvbjWYg` |
   | `VITE_SUPABASE_PROJECT_ID` | `ojfosxqlobynhjlnooro` |
   | `VITE_SUPABASE_URL` | `https://ojfosxqlobynhjlnooro.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qZm9zeHFsb2J5bmhqbG5vb3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMjA3OTksImV4cCI6MjA5NzU5Njc5OX0.KbRIrzvZT6DNXFYHrNHFtQ_tiBxy3SB4mMb4NvbjWYg` |

8. Click **Create Web Service**.

---

### Step 3: 1-Click Blueprint Alternative (`render.yaml`)

We also included a `render.yaml` Infrastructure-as-Code blueprint in the root of the project.
If you prefer 1-click blueprint deployment:
1. In Render Dashboard, click **New +** -> **Blueprint**.
2. Select your repository. Render will automatically parse `render.yaml` with all environment variables, ports, healthchecks, and the Dockerfile pre-filled!
3. Click **Apply**.

---

## Method 2: Native Node.js Deployment (Alternative)

If you prefer deploying without Docker:
- **Runtime**: `Node`
- **Build Command**: `npm install --legacy-peer-deps && npm run build`
- **Start Command**: `npm start`
- **Port**: `10000`

---

## Verification & Live URL

Once the deploy logs indicate `==> Your service is live at https://nearbee-cloud-app.onrender.com`:
1. Open the homepage: `https://nearbee-cloud-app.onrender.com/`
2. Open the Cloud Analytics Dashboard: `https://nearbee-cloud-app.onrender.com/cloud-dashboard`
   - Test the interactive **Cloud ML Inference Simulator**.
   - Check the **Water, Health, Food, and Energy** domain impact cards.
   - Review the **AWS SageMaker & BigQuery ML** metric comparison charts.

