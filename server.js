const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');
const { port } = require('./config');

// Routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const bookstoreRoutes = require('./routes/bookstores');
const salesRoutes = require('./routes/sales');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/bookstores', bookstoreRoutes);
app.use('/api/v1/sales', salesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});