const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Security middleware
const { firewall } = require('./middleware/firewall');

const app = express();
const PORT = process.env.PORT || 3000;

// Security layer (first - before all other middleware)
app.use(firewall);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Web3 Multi-Chain Dashboard
app.get('/web3-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'web3-dashboard.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Initialize database and start server
async function startServer() {
  try {
    const db = require('./database/db');
    await db.init();

    const authRoutes = require('./routes/auth');
    const web3Routes = require('./routes/web3');
    app.use('/api/auth', authRoutes);
    app.use('/api/web3', web3Routes);
    console.log('✅ Routes initialized');

    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log(`🚀 Nebula Core server running on http://localhost:${PORT}`);
      console.log(`📊 Database initialized`);
      console.log(`📝 Login: http://localhost:${PORT}/login`);
      console.log(`📝 Signup: http://localhost:${PORT}/signup`);
      console.log(`🌐 Web3 Dashboard: http://localhost:${PORT}/web3-dashboard`);
      console.log('='.repeat(50) + '\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
