const express = require('express');
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const bookstoresController = require('../controllers/bookstoresController');

const router = express.Router();

// Get all bookstores
router.get('/', 
  auth,
  [
    query('minInventory').optional().isInt(),
    query('bookId').optional().isUUID(),
    query('sort').optional().isIn(['name', 'location'])
  ],
  bookstoresController.getBookstores
);

// Get a specific bookstore
router.get('/:id', auth, bookstoresController.getBookstore);

// Create a new bookstore
router.post('/',
  auth,
  [
    body('name').trim().notEmpty(),
    body('location').trim().notEmpty(),
    body('contact.phone').trim().notEmpty(),
    body('contact.email').isEmail(),
    body('inventory').optional().isArray()
  ],
  bookstoresController.createBookstore
);

// Update a bookstore
router.put('/:id',
  auth,
  [
    body('name').optional().trim().notEmpty(),
    body('location').optional().trim().notEmpty(),
    body('contact.phone').optional().trim().notEmpty(),
    body('contact.email').optional().isEmail(),
    body('inventory').optional().isArray()
  ],
  bookstoresController.updateBookstore
);

// Delete a bookstore
router.delete('/:id', auth, bookstoresController.deleteBookstore);

// Get bookstore revenue
router.get('/:id/revenue', auth, bookstoresController.getBookstoreRevenue);

// Update inventory
router.patch('/:id/inventory',
  auth,
  [
    body('bookId').isUUID(),
    body('quantity').isInt({ min: 0 }),
    body('price').isFloat({ min: 0 })
  ],
  bookstoresController.updateInventory
);

module.exports = router;