const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const { validationResult } = require('express-validator');
const { jwtSecret } = require('../config');
const logger = require('../utils/logger');

const USERS_FILE = './data/users.json';

const authController = {
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;
      
      // Read existing users
      let users = [];
      try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        users = JSON.parse(data).users;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }

      // Check if user exists
      if (users.some(user => user.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: uuidv4(),
        username,
        password: hashedPassword
      };

      users.push(newUser);

      // Save updated users
      await fs.writeFile(USERS_FILE, JSON.stringify({ users }, null, 2));

      // Generate token
      const token = jwt.sign({ id: newUser.id, username }, jwtSecret, { expiresIn: '24h' });

      res.status(201).json({ token });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      // Read users
      const data = await fs.readFile(USERS_FILE, 'utf8');
      const users = JSON.parse(data).users;

      // Find user
      const user = users.find(u => u.username === username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign({ id: user.id, username }, jwtSecret, { expiresIn: '24h' });

      res.json({ token });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
};

module.exports = authController;