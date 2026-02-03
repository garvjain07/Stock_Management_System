# Environment Variables Quick Reference

## Backend (.env)

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=production

# Security
JWT_SECRET=<generate-a-long-random-string>
JWT_EXPIRE=24h
BCRYPT_ROUNDS=12

# CORS
FRONTEND_URL=https://your-frontend.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Frontend (.env)

```env
# API Endpoint
VITE_API_URL=https://your-backend.vercel.app
```

## Vercel Environment Variables

### Backend Project
- `MONGODB_URI` → Your MongoDB Atlas connection string
- `NODE_ENV` → `production`
- `JWT_SECRET` → Strong random string
- `JWT_EXPIRE` → `24h`
- `FRONTEND_URL` → Your frontend Vercel URL
- `BCRYPT_ROUNDS` → `12`
- `RATE_LIMIT_WINDOW_MS` → `900000`
- `RATE_LIMIT_MAX_REQUESTS` → `100`

### Frontend Project
- `VITE_API_URL` → Your backend Vercel URL

---

## 🔐 Security Notes

1. **Never commit `.env` files** to GitHub
2. Keep `.env.example` files for reference (without actual secrets)
3. Use strong, random strings for JWT_SECRET
4. MongoDB password should be URL-encoded if it contains special characters
5. Update FRONTEND_URL and VITE_API_URL after each deployment

---

## 📋 MongoDB Atlas Connection String Format

```
mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/Stock_Management?retryWrites=true&w=majority
```

**URL Encoding Special Characters:**
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `&` → `%26`
- `=` → `%3D`

---

## 🔄 Update Order After Deployment

1. Deploy backend → Get backend URL
2. Deploy frontend with backend URL → Get frontend URL
3. Update backend `FRONTEND_URL` with frontend URL
4. Redeploy backend with updated CORS settings
