# Stock Management System - Deployment Guide

## 🚀 Deploying to Vercel

This guide will help you deploy both the **frontend** (React) and **backend** (Node.js/Express) to Vercel using GitHub.

---

## 📋 Prerequisites

1. **GitHub Account** - Create one at [github.com](https://github.com)
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (use GitHub to sign in)
3. **MongoDB Atlas Account** - Already set up with your database

---

## 🔧 Step 1: Prepare Your Project

### 1.1 Initialize Git Repository (if not already done)

```powershell
# In the project root directory
git init
git add .
git commit -m "Initial commit - Stock Management System"
```

### 1.2 Create GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository
2. Name it: `stock-management-system`
3. **Do not** initialize with README (we already have code)
4. Copy the repository URL

### 1.3 Push to GitHub

```powershell
# Replace <your-username> with your GitHub username
git remote add origin https://github.com/<your-username>/stock-management-system.git
git branch -M main
git push -u origin main
```

---

## 🖥️ Step 2: Deploy Backend to Vercel

### 2.1 Import Backend Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select your GitHub repository: `stock-management-system`
4. Vercel will detect it's a monorepo

### 2.2 Configure Backend Deployment

**Root Directory:** Set to `backend`

**Framework Preset:** Other

**Build Command:** Leave empty (not needed for serverless)

**Output Directory:** Leave empty

**Install Command:** `npm install`

### 2.3 Add Environment Variables

Click **"Environment Variables"** and add:

```
MONGODB_URI=<your-mongodb-atlas-connection-string>

NODE_ENV=production

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-complex

JWT_EXPIRE=24h

FRONTEND_URL=https://your-frontend-url.vercel.app

BCRYPT_ROUNDS=12

RATE_LIMIT_WINDOW_MS=900000

RATE_LIMIT_MAX_REQUESTS=100
```

**⚠️ Important:** You'll update `FRONTEND_URL` after deploying the frontend.

### 2.4 Deploy Backend

1. Click **"Deploy"**
2. Wait for deployment to complete (usually 1-2 minutes)
3. Copy your backend URL (e.g., `https://stock-management-backend-abc123.vercel.app`)

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Import Frontend Project

1. Go back to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select the same GitHub repository
4. This time configure it for frontend

### 3.2 Configure Frontend Deployment

**Root Directory:** Set to `frontend`

**Framework Preset:** Vite

**Build Command:** `npm run build`

**Output Directory:** `dist`

**Install Command:** `npm install`

### 3.3 Add Environment Variables

Click **"Environment Variables"** and add:

```
VITE_API_URL=<your-backend-url>
```

Replace `<your-backend-url>` with the backend URL from Step 2.4

Example: `https://stock-management-backend-abc123.vercel.app`

### 3.4 Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Copy your frontend URL (e.g., `https://stock-management-system-xyz789.vercel.app`)

---

## 🔄 Step 4: Update Backend CORS Settings

### 4.1 Update Backend Environment Variables

1. Go to your backend project in Vercel dashboard
2. Go to **Settings** → **Environment Variables**
3. Find `FRONTEND_URL` and update it with your actual frontend URL
4. Click **"Save"**

### 4.2 Redeploy Backend

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait for redeployment to complete

---

## ✅ Step 5: Test Your Deployment

1. Visit your frontend URL
2. Try logging in with:
   - **Username:** `admin`
   - **Password:** `admin123`
3. Test creating products, bills, customers, etc.

---

## 🔐 Step 6: Security Checklist

- [ ] MongoDB Atlas IP whitelist updated (add `0.0.0.0/0` for Vercel or use Vercel IPs)
- [ ] JWT_SECRET changed to a strong random string
- [ ] All environment variables set correctly
- [ ] Backend CORS configured with correct frontend URL
- [ ] `.env` files added to `.gitignore` (never commit secrets!)

---

## 🔄 Continuous Deployment

Your project is now set up for **automatic deployments**:

- Every time you push to GitHub `main` branch, Vercel will automatically redeploy
- You can also deploy specific branches by configuring them in Vercel

---

## 📝 Useful Commands

### Update Frontend

```powershell
cd frontend
# Make your changes
git add .
git commit -m "Update frontend"
git push
# Vercel auto-deploys!
```

### Update Backend

```powershell
cd backend
# Make your changes
git add .
git commit -m "Update backend"
git push
# Vercel auto-deploys!
```

---

## 🐛 Troubleshooting

### Backend Returns 500 Error
- Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
- Verify MongoDB connection string is correct
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### Frontend Can't Connect to Backend
- Check browser console for CORS errors
- Verify `VITE_API_URL` environment variable is set correctly
- Ensure backend `FRONTEND_URL` matches your frontend domain

### Changes Not Reflecting
- Vercel caches deployments. Try:
  1. Clear browser cache
  2. Hard refresh (Ctrl + F5)
  3. Check if deployment completed successfully in Vercel dashboard

---

## 📱 Custom Domain (Optional)

### Add Custom Domain

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as instructed by Vercel
5. Update environment variables with new URLs

---

## 🎉 Congratulations!

Your Stock Management System is now live on Vercel!

**Your URLs:**
- Frontend: `https://your-frontend.vercel.app`
- Backend API: `https://your-backend.vercel.app/api`

Share your application with users and start managing your inventory! 🚀
