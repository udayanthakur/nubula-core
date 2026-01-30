# Quick Setup Guide

## Prerequisites
- Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)

## Step-by-Step Setup

### Option 1: Quick Start (Windows)
Double-click `start.bat` file - it will automatically install dependencies and start the server!

### Option 2: Quick Start (Mac/Linux)
```bash
chmod +x start.sh
./start.sh
```

### Option 3: Manual Setup

#### 1. Install Dependencies
```bash
npm install
```

This will install:
- express (web server)
- cors (cross-origin resource sharing)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- better-sqlite3 (SQLite database)
- dotenv (environment variables)
- nodemon (development tool, optional)

#### 2. Start the Server
```bash
npm start
```

**OR** for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 3. Access the Application
- **Landing Page**: http://localhost:3000/
- **Login Page**: http://localhost:3000/login
- **Signup Page**: http://localhost:3000/signup

## Database

The SQLite database (`nebula.db`) will be automatically created in the `database/` folder on first run.

## Testing the Authentication

1. **Sign Up**: Go to `/signup` and create an account
2. **Login**: Go to `/login` and sign in with your credentials
3. **Token**: After successful login/signup, a JWT token is stored in localStorage

## API Testing

You can test the API endpoints using curl or Postman:

### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Verify Token
```bash
curl http://localhost:3000/api/auth/verify?token=YOUR_TOKEN_HERE
```

## Development Mode

For auto-reload during development:
```bash
npm run dev
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, change it in `server.js` or set `PORT` environment variable:
```bash
PORT=3001 npm start
```

### Database Errors
If you encounter database errors, delete `database/nebula.db` and restart the server to recreate it.

### Module Not Found
Make sure you've run `npm install` to install all dependencies.

## Production Deployment

1. Set a strong `JWT_SECRET` in your environment variables
2. Use a process manager like PM2: `pm2 start server.js`
3. Set up HTTPS for secure connections
4. Configure proper CORS settings for your domain

