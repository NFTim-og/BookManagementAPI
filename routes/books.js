const express = require('express');
const { body, query } = require('express-validator');
const auth = require('../middleware/auth');
const booksController = require('../controllers/booksController');

const router = express.Router();

// Get all books with optional filters
router.get('/', 
  auth,
  [
    query('author').optional().trim(),
    query('genre').optional().trim(),
    query('year').optional().isInt(),
    query('sort').optional().isIn(['title', 'author', 'year'])
  ],
  booksController.getBooks
);

// Get a specific book
router.get('/:id', auth, booksController.getBook);

// Create a new book
router.post('/',
  auth,
  [
    body('details.title').trim().notEmpty(),
    body('details.author').trim().notEmpty(),
    body('details.publishedYear').isInt({ min: 1000, max: new Date().getFullYear() }),
    body('details.genres').isArray(),
    body('details.summary').trim().notEmpty()
  ],
  booksController.createBook
);

// Update a book
router.put('/:id',
  auth,
  [
    body('details.title').optional().trim().notEmpty(),
    body('details.author').optional().trim().notEmpty(),
    body('details.publishedYear').optional().isInt({ min: 1000, max: new Date().getFullYear() }),
    body('details.genres').optional().isArray(),
    body('details.summary').optional().trim().notEmpty()
  ],
  booksController.updateBook
);

// Delete a book
router.delete('/:id', auth, booksController.deleteBook);

// Get book sales statistics
router.get('/:id/sales', auth, booksController.getBookSales);

module.exports = router;