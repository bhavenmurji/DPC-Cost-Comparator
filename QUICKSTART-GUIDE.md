# 🚀 DPC Cost Comparator - Quick Start Guide (Week 1)

## Welcome! Let's Get Your App Running in 30 Minutes

This guide is written for **non-technical founders**. I'll walk you through everything step-by-step.

---

## ✅ What You'll Have By End of Week 1

- ✨ Website running on your computer
- 🔐 Basic security improvements
- 📦 Everything packaged for deployment
- 🎨 Live demo you can show people

---

## 📋 Before We Start - Check These Off

### Do you have these installed?

1. **Node.js** (the engine that runs the code)
   - Check: Open Terminal and type: `node --version`
   - If you see a number like `v18.x.x` or `v20.x.x` → ✅ You're good!
   - If you see "command not found" → ⬇️ Install from https://nodejs.org (download the LTS version)

2. **PostgreSQL** (the database)
   - Check: Type in Terminal: `psql --version`
   - If you see `psql (PostgreSQL) 14.x` or higher → ✅ You're good!
   - If not installed → ⬇️ Install from https://postgresapp.com (Mac) or https://www.postgresql.org/download/ (Windows)

3. **Git** (already installed since you're in this folder!)
   - You're using it right now ✅

---

## 🎯 Step 1: Install Everything (5 minutes)

### Copy and paste these commands one at a time into Terminal:

```bash
# Navigate to the project folder (you're already here!)
cd /Users/bhavenmurji/Development/DPC-Cost-Comparator

# Install backend dependencies
cd src/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Go back to main folder
cd ../..
```

**What's happening?** This downloads all the tools the app needs to run.

---

## 🎯 Step 2: Set Up the Database (5 minutes)

```bash
# Create a new database
createdb dpc_comparator

# Load the database structure
psql -d dpc_comparator -f src/backend/database/schema.sql
```

**What's happening?** This creates a place to store user data and DPC provider information.

---

## 🎯 Step 3: Configure Your Settings (5 minutes)

```bash
# Copy the example settings file
cp .env.example .env
```

Now open the `.env` file (it's in the main folder) and change these values:

```bash
# Change this line:
JWT_SECRET=YOUR_SECURE_RANDOM_STRING_FOR_SESSIONS

# To something random like:
JWT_SECRET=my-super-secret-key-abc123xyz789

# Leave everything else as-is for now!
```

**What's happening?** You're setting a secret password that the app uses internally.

---

## 🎯 Step 4: Start the Backend (2 minutes)

Open a Terminal window and run:

```bash
cd src/backend
npm run dev
```

**You should see:**
```
🚀 Server running on http://localhost:3001
✅ Database connected
```

**Leave this window open!** This is your backend server running.

---

## 🎯 Step 5: Start the Frontend (2 minutes)

Open a **NEW** Terminal window (keep the first one running!) and run:

```bash
cd src/frontend
npm run dev
```

**You should see:**
```
✓ Ready in 2.3s
➜ Local: http://localhost:3000
```

---

## 🎉 Step 6: See Your App!

1. Open your web browser
2. Go to: **http://localhost:3000**
3. You should see your DPC Cost Comparator website!

---

## 🧪 Test It Out

Try this:
1. Fill out the insurance form (make up some numbers)
2. Fill out your health usage
3. Add your ZIP code
4. Click "Calculate"
5. See the cost comparison results!

---

## 🛑 How to Stop the Servers

When you're done testing:
1. Go to each Terminal window
2. Press `Control + C` (Mac) or `Ctrl + C` (Windows)

---

## ❓ Troubleshooting

### "Port 3000 is already in use"
Something else is using that port. Run:
```bash
lsof -ti:3000 | xargs kill
```

### "Database connection failed"
Make sure PostgreSQL is running:
```bash
# Mac with Postgres.app
# Just open the Postgres.app

# Or check if it's running:
pg_isready
```

### "Cannot find module"
Try reinstalling:
```bash
cd src/backend
rm -rf node_modules
npm install
```

---

## 📸 Take Screenshots!

Before we move to Week 2, take screenshots of:
1. The main page
2. The cost comparison results
3. The provider list

You'll use these for:
- Investor pitches
- User testing
- Marketing materials

---

## ✅ Week 1 Checklist

- [ ] Installed Node.js and PostgreSQL
- [ ] Ran `npm install` for backend and frontend
- [ ] Created database and loaded schema
- [ ] Configured `.env` file
- [ ] Started backend server (port 3001)
- [ ] Started frontend server (port 3000)
- [ ] Saw the website at http://localhost:3000
- [ ] Tested a cost comparison calculation
- [ ] Took screenshots

---

## 🎯 Next Steps

Once you've checked everything off, reply with:
**"Week 1 complete - ready for Week 2!"**

I'll then help you:
1. Sign up for Heroku and Vercel (free accounts)
2. Deploy your app to the internet
3. Give you a real URL you can share

---

## 💡 Pro Tips

**Want to show this to someone else?**
1. Start both servers (backend & frontend)
2. Share your screen in a Zoom call
3. Walk them through it live!

**Want to change the design?**
- All the visual stuff is in `src/frontend/components/`
- I can help you customize colors, text, layout, etc.

**Questions?**
Just ask! I'm here to help you through each step.

---

**You've got this! 🚀**
