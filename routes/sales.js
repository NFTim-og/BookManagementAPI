const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const salesController = require('../controllers/salesController');

const router = express.Router();

// Get all sales
router.get('/', auth, salesController.getSales);

// Get a specific sale
router.get('/:id', auth, salesController.getSale);

// Create a new sale
router.post('/',
  auth,
  [
    body('bookstoreId').isUUID(),
    body('books').isArray(),
    body('books.*.bookId').isUUID(),
    body('books.*.quantity').isInt({ min: 1 }),
    body('discountPercentage').optional().isFloat({ min: 0, max: 100 })
  ],
  salesController.createSale
);

module.exports = router;