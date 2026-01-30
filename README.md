# Nebula Core - Web3 Hosting Platform

A modern, responsive landing page with authentication system for decentralized Web3 hosting services.

## Features

- 🎨 Modern, dark-themed UI with red-purple gradient design
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🔐 User authentication (Login/Signup)
- 🗄️ SQLite database for user management
- 🚀 Express.js backend API
- ✨ 3D interactive elements and animations
- 🎯 Smooth scroll animations and transitions

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Custom scrollbar styling
- Responsive grid layouts
- 3D CSS transforms and animations

### Backend
- Node.js
- Express.js
- SQLite (better-sqlite3)
- JWT authentication
- bcryptjs for password hashing

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your `JWT_SECRET` for production.

4. **Start the server**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
web/
├── index.html          # Main landing page
├── login.html          # Login page
├── signup.html         # Signup page
├── styles.css          # Main stylesheet
├── auth.css            # Authentication pages styles
├── main.js             # Main page JavaScript
├── auth.js             # Authentication JavaScript
├── server.js           # Express server
├── package.json        # Node.js dependencies
├── routes/
│   └── auth.js         # Authentication API routes
└── database/
    └── db.js           # Database setup and operations
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```

- `GET /api/auth/verify?token=<token>` - Verify JWT token

- `POST /api/auth/logout` - Logout user
  ```json
  {
    "token": "<jwt-token>"
  }
  ```

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Sessions Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `token` - JWT token
- `created_at` - Session creation timestamp
- `expires_at` - Token expiration timestamp

## Responsive Breakpoints

- **Desktop**: > 900px
- **Tablet**: 640px - 900px
- **Mobile**: < 640px
- **Small Mobile**: < 480px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Running in Development Mode
```bash
npm run dev
```
Uses `nodemon` for automatic server restart on file changes.

### Database Location
The SQLite database is created at `database/nebula.db` on first run.

## Security Notes

- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens expire after 7 days
- SQL injection protection via parameterized queries
- CORS enabled for API access
- Environment variables for sensitive data

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ for the Web3 community


