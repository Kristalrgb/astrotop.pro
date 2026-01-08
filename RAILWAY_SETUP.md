# 🚂 Railway Setup - Fix Deployment Crash

## ❌ Problem:
Railway deployment is crashing because it can't find the correct directory and start command.

## ✅ Solution:

### Option 1: Update Railway Settings (RECOMMENDED)

1. **Open Railway Dashboard:**
   - Go to: https://railway.app
   - Select your project
   - Click on your **backend service**

2. **Set Root Directory:**
   - Go to **Settings** → **Service Settings**
   - Find **"Root Directory"** field
   - Enter: `server`
   - Click **"Save"**

3. **Set Start Command:**
   - In **Settings** → **Deploy**, find **"Start Command"**
   - Enter: `npm start`
   - Click **"Save"**

4. **Redeploy:**
   - Go to **Deployments**
   - Click **"Redeploy"** or **"Deploy Latest"**
   - Wait 2-5 minutes

### Option 2: Use railway.json (Already Updated)

The `railway.json` file has been updated with correct commands:
- ✅ Build: `cd server && npm install`
- ✅ Start: `cd server && npm start`

**If this doesn't work, use Option 1 above.**

---

## 📋 Required Environment Variables in Railway:

1. **Open:** Settings → Variables
2. **Add/Check:**
   - **Key:** `FRONTEND_URL`
   - **Value:** `https://astrotop.pro` (or your Vercel domain)
   - **Environment:** Production, Preview, Development

3. **Check:**
   - **Key:** `PORT` (Railway sets this automatically - don't change it)
   - **Key:** `NODE_ENV` = `production` (optional)

---

## 🔍 Common Issues:

### Issue 1: "Cannot find module"
**Solution:**
- Make sure Root Directory is set to `server`
- Make sure `server/package.json` exists
- Redeploy

### Issue 2: "Port already in use"
**Solution:**
- Railway sets PORT automatically
- Don't hardcode port in code (already fixed - uses `process.env.PORT || 5000`)

### Issue 3: "Start command failed"
**Solution:**
- Check that `server/package.json` has `"start": "node index.js"`
- Check that `server/index.js` exists
- Set Root Directory to `server` in Railway settings

---

## ✅ Verification:

After deployment:

1. **Check Health Endpoint:**
   ```
   https://your-project.up.railway.app/api/health
   ```
   Should return: `{"status": "ok", "message": "API работает"}`

2. **Check Logs:**
   - Go to Railway → Deployments
   - Click on latest deployment
   - Click **"View Logs"**
   - Should see: `Сервер запущен на порту 5000` (or Railway's assigned port)

3. **Check Browser Console:**
   - Open your site: https://astrotop.pro
   - Open console (F12)
   - Should see no CORS errors

---

## ⏱️ Time:
- Configuration: 2-3 minutes
- Deployment: 2-5 minutes
- **Total: 4-8 minutes**

