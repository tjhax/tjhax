require('dotenv').config();
const express = require("express");
const http    = require("http");
const path    = require("path");
const app     = express();
const server  = http.createServer(app);
const cors    = require('cors');
const verifier = require('nodemailer');
app.use(cors());

// packages for auth
const session = require('express-session');
const MySQLStoreFactory = require('express-mysql-session');

const userRoutes = require('./api/routes');
const listingRoutes = require('./api/listings');
const photoRoutes = require('./api/photos');
const mylistingRoute = require('./api/my-listings.js');
const messageRoutes = require('./api/messages.js');
const ws            = require('./websocket.js');
const transactionRoutes  = require('./api/transactions.js');

const pool = require('./database/database.js');

app.use(express.json());
const clientDistPath = path.join(
  __dirname,
  "..",
  "client",
  "dist"
);

const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore(
  {
    createDatabaseTable: true,
    schema: {
      tableName: 'sessions'
    }
  },
  pool
);

app.use(session({
  key: 'sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,      
    sameSite: 'lax',
    maxAge: 5 * 60 * 60 * 1000
  }
}));

// Serve static assets (JS/CSS/images) from Vite build
app.use(express.static(clientDistPath));

// Serve uploaded listing photos
app.use('/uploads', express.static(path.join(__dirname, 'views', 'uploads')));
app.use('/uploads/images', express.static(path.join(__dirname, 'views', 'uploads')));

app.use(express.urlencoded({ extended: true }));

app.use('/api', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/my-listings', mylistingRoute);
app.use('/api/messages', messageRoutes);
app.use('/api/transactions', transactionRoutes);

// ── Live marketplace stats ──
app.get('/api/stats', async (req, res) => {
  try {
    const [[listingRow]] = await pool.query(
      "SELECT COUNT(*) AS count FROM listings WHERE status = 'Active'"
    );
    const [[userRow]] = await pool.query(
      "SELECT COUNT(*) AS count FROM users"
    );
    res.json({
      listings: listingRow.count,
      users: userRow.count,
    });
  } catch (err) {
    console.error('[stats]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Catch-all: serve React app for any route (required for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Start WebSocket server
ws.init(server);

const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => console.log(`Server on ${PORT}`));