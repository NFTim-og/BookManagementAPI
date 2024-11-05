const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register',
  [
    body('username').trim().isLength({ min: 3 }),
    body('password').isLength({ min: 6 })
  ],
  authController.register
);

router.post('/login',
  [
    body('username').trim(),
    body('password').exists()
  ],
  authController.login
);

module.exports = router;