# 🚀 Quick Start Guide

## ✅ What You Need

- [ ] Node.js installed (v16+)
- [ ] MongoDB Atlas account created
- [ ] Git installed
- [ ] GitHub account
- [ ] Vercel account (sign up with GitHub)

---

## 📝 Local Development Setup (5 minutes)

### 1. MongoDB Atlas Setup
```
1. Go to mongodb.com/atlas and sign in
2. Create a new project
3. Create a free cluster
4. Database Access → Add user → Save credentials
5. Network Access → Add IP → Use 0.0.0.0/0 for now
6. Connect → Connect your application → Copy connection string
```

### 2. Clone & Install
```powershell
cd backend
npm install
cd ../frontend
npm install
```

### 3. Configure Backend
```powershell
cd backend
# Edit .env file with your MongoDB connection string
```

Update `MONGODB_URI` in `.env`:
```
MONGODB_URI=mongodb+srv://youruser:yourpass@cluster.mongodb.net/Stock_Management
```

### 4. Seed Database
```powershell
npm run seed:mongo
```

### 5. Run Application
```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Login
Open `http://localhost:3000`
- Username: `admin`
- Password: `admin123`

---

## 🌐 Deploy to Production (10 minutes)

### Step 1: Push to GitHub
```powershell
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/stock-management.git
git push -u origin main
```

### Step 2: Deploy Backend
```
1. Go to vercel.com/new
2. Import your GitHub repository
3. Root Directory: backend
4. Framework: Other
5. Add Environment Variables:
   - MONGODB_URI=<your-mongodb-atlas-uri>
   - NODE_ENV=production
   - JWT_SECRET=<generate-random-string>
   - JWT_EXPIRE=24h
   - FRONTEND_URL=https://your-frontend.vercel.app (will update later)
   - BCRYPT_ROUNDS=12
6. Click Deploy
7. Copy your backend URL (e.g., https://your-backend-abc.vercel.app)
```

### Step 3: Deploy Frontend
```
1. Go to vercel.com/new again
2. Import same GitHub repository
3. Root Directory: frontend
4. Framework: Vite
5. Add Environment Variable:
   - VITE_API_URL=<your-backend-url-from-step-2>
6. Click Deploy
7. Copy your frontend URL
```

### Step 4: Update Backend CORS
```
1. Go to your backend project in Vercel
2. Settings → Environment Variables
3. Edit FRONTEND_URL → Use your frontend URL from Step 3
4. Deployments → Redeploy latest
```

### Step 5: Test!
```
1. Open your frontend URL
2. Login with admin/admin123
3. Start using your app!
```

---

## 📚 Important Files

- **DEPLOYMENT.md** - Complete deployment guide
- **ENV_VARIABLES.md** - All environment variables explained
- **README.md** - Full documentation

---

## 🐛 Common Issues

### Can't connect to MongoDB
- Check MongoDB Atlas → Network Access → IP Whitelist
- Verify connection string is correct
- Ensure password is URL-encoded (@→%40, #→%23)

### Frontend can't reach backend
- Check VITE_API_URL in Vercel frontend environment variables
- Verify backend FRONTEND_URL matches your frontend domain
- Check browser console for CORS errors

### "Module not found" errors
- Run `npm install` in both backend and frontend directories
- Delete node_modules and reinstall if needed

---

## 🎉 You're Done!

Your Stock Management System is now:
- ✅ Running locally for development
- ✅ Deployed to Vercel for production
- ✅ Connected to MongoDB Atlas cloud database
- ✅ Auto-deploying on every Git push

**Need help?** Check the detailed guides:
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ENV_VARIABLES.md](./ENV_VARIABLES.md)
