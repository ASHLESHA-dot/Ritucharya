# Quick Start Guide

## 🚀 Get Ritucharya Running in 5 Minutes

### Prerequisites
- Node.js installed
- MongoDB running (local or MongoDB Atlas)

### Step 1: Setup MongoDB Connection

**Option A: Local MongoDB**
```bash
# On Windows (run in Command Prompt)
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string

### Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env with your MongoDB URI and JWT Secret
# Open .env in your editor and update:
# MONGODB_URI=mongodb://localhost:27017/ritucharya
# JWT_SECRET=your_secret_key_here
# PORT=5000

# Start backend server
npm run dev
```

You should see: `Server running on port 5000`

### Step 3: Setup Frontend (in a NEW terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start frontend server
npm start
```

The app will open at `http://localhost:3000`

## 📝 Workflow

1. **Sign Up**: Create a new account with name, email, phone
2. **Login**: Login with your credentials
3. **Calculate BMI**: Enter weight (kg), height (cm), age, gender
4. **View Results**: See your BMI and category

## 📋 Required Environment Variables

### Backend (.env)

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/ritucharya

# JWT Secret (any random string, keep it secret)
JWT_SECRET=my_super_secret_jwt_key_12345

# Port
PORT=5000
```

### Frontend (.env) - Optional

```env
REACT_APP_API_URL=http://localhost:5000
```

## 🔐 Security Notes

- Never commit `.env` file to git
- Use strong `JWT_SECRET` in production
- Change default passwords in production
- Use HTTPS in production

## 🛠️ Common Commands

**Backend:**
```bash
npm run dev      # Run with auto-reload
npm start        # Run normally
```

**Frontend:**
```bash
npm start        # Start dev server
npm build        # Build for production
npm test         # Run tests
```

## ✅ Verify Installation

1. Backend running: Visit `http://localhost:5000` in browser
2. Frontend running: Visit `http://localhost:3000` in browser
3. Try signup/login flow
4. Calculate BMI

## 📞 Need Help?

Check README.md for detailed documentation and troubleshooting section.

---

**You're all set!** Start using Ritucharya now! 💪
