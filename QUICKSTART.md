# 🚀 Quick Start Guide

## Windows Users
1. **Double-click `start.bat`** - That's it! The server will start automatically.

## Mac/Linux Users
1. Open terminal in the project folder
2. Run: `chmod +x start.sh && ./start.sh`

## Manual Start (All Platforms)
```bash
npm install
npm start
```

## Access Your Website
Once the server starts, open your browser and go to:
- **Home**: http://localhost:3000
- **Login**: http://localhost:3000/login  
- **Signup**: http://localhost:3000/signup

## Test It Out!
1. Go to **Signup** page
2. Create an account (name, email, password)
3. You'll be redirected to the home page
4. Go to **Login** page
5. Sign in with your credentials
6. You'll be redirected to the home page

## Troubleshooting

### "Cannot find module" error
Run: `npm install`

### Port 3000 already in use
Change the port in `server.js` or use:
```bash
PORT=3001 npm start
```

### Database errors
Delete `database/nebula.db` and restart the server

---

**That's it! Your website is ready to use! 🎉**


