# Ritucharya - BMI Calculator Application

A full-stack MERN (MongoDB, Express, React, Node.js) application for user authentication and BMI calculation.

## Features

- **User Signup**: Create account with name, email, and phone number
- **User Login**: Secure login with JWT authentication
- **BMI Calculator**: Calculate BMI based on weight, height, age, and gender
- **User Dashboard**: View personal information and BMI history
- **Secure Authentication**: Password hashing with bcryptjs and JWT tokens

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- bcryptjs

### Frontend
- React
- React Router
- Axios
- CSS3

## Prerequisites

Before running this project, ensure you have installed:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Git

## Installation & Setup

### 1. Clone the repository

```bash
cd Ritucharya
```

### 2. Setup Backend

#### Install dependencies

```bash
cd backend
npm install
```

#### Create .env file

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**Edit `backend/.env`:**

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ritucharya

# OR if using MongoDB Atlas (cloud):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ritucharya

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_12345

# Server Port
PORT=5000
```

#### Required Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ritucharya` |
| `JWT_SECRET` | Secret key for JWT tokens | `my_super_secret_key_12345` |
| `PORT` | Server port | `5000` |

#### Start Backend Server

```bash
npm run dev
```

The backend server will run at `http://localhost:5000`

### 3. Setup Frontend

In a new terminal, navigate to the frontend folder:

```bash
cd frontend
npm install
```

#### Create .env file (optional)

```bash
cp .env.example .env
```

#### Start Frontend Server

```bash
npm start
```

The frontend will open at `http://localhost:3000`

## Project Structure

```
Ritucharya/
├── backend/
│   ├── models/
│   │   └── User.js           # User schema
│   ├── routes/
│   │   ├── authRoutes.js     # Signup & Login routes
│   │   └── bmiRoutes.js      # BMI calculation routes
│   ├── server.js             # Express server setup
│   ├── .env.example          # Environment template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Signup.js     # Signup page
    │   │   ├── Login.js      # Login page
    │   │   └── BMICalculator.js # BMI calculator & dashboard
    │   ├── App.js            # Main app component
    │   ├── App.css           # Styling
    │   └── index.js          # React entry point
    ├── public/
    │   └── index.html
    ├── .env.example          # Environment template
    └── package.json
```

## API Endpoints

### Authentication

#### Signup
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### BMI Calculator

#### Calculate BMI
```
POST /api/bmi/calculate
Content-Type: application/json
Authorization: Bearer {token}

{
  "weight": 70,
  "height": 175,
  "age": 25,
  "gender": "Male"
}
```

#### Get User Data
```
GET /api/bmi/user
Authorization: Bearer {token}
```

## BMI Categories

- **Underweight**: BMI < 18.5
- **Normal weight**: BMI 18.5 - 24.9
- **Overweight**: BMI 25.0 - 29.9
- **Obese**: BMI ≥ 30.0

## How to Use

1. **Signup**: Click "Sign Up" and fill in your details (name, email, phone, password)
2. **Login**: Enter your email and password to login
3. **Calculate BMI**: Fill in weight (kg), height (cm), age, and gender
4. **View Results**: Your BMI and category will be displayed
5. **Logout**: Click the logout button to exit

## MongoDB Setup

### Local MongoDB

If running MongoDB locally:

```bash
# Windows
mongod

# macOS/Linux
brew services start mongodb-community
```

### MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string
4. Add to `.env` file as `MONGODB_URI`

## Troubleshooting

### Cannot connect to MongoDB
- Ensure MongoDB is running
- Check the `MONGODB_URI` in `.env`
- For MongoDB Atlas, ensure IP is whitelisted

### CORS errors
- Backend is set to accept requests from frontend
- Ensure both are running on correct ports

### "Invalid token" errors
- Clear browser localStorage and login again
- Check JWT_SECRET is the same in backend .env

### Backend not connecting to frontend
- Ensure `proxy` in frontend `package.json` is set to backend URL
- Restart both frontend and backend

## Running Both Servers

**Terminal 1** - Backend:
```bash
cd backend
npm run dev
```

**Terminal 2** - Frontend:
```bash
cd frontend
npm start
```

## Future Enhancements

- User profile editing
- BMI history graph
- Dietary recommendations
- Activity tracking
- Mobile app version
- Email verification
- Password reset functionality

## License

ISC

## Support

For issues or questions, please create an issue in the repository.

---

**Happy using Ritucharya!** 🏃‍♂️💪
