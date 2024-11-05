const { validationResult } = require('express-validator');
const fileHandler = require('../utils/fileHandler');
const generateUUID = require('../utils/uuidGenerator');
const logger = require('../utils/logger');

const BOOKS_FILE = './data/books.json';
const SALES_FILE = './data/sales.json';

const booksController = {
  getBooks: async (req, res) => {
    try {
      const { author, genre, year, sort } = req.query;
      const data = await fileHandler.readFile(BOOKS_FILE);
      
      let filteredBooks = data.books;

      // Apply filters
      if (author) {
        filteredBooks = filteredBooks.filter(book => 
          book.details.author.toLowerCase().includes(author.toLowerCase())
        );
      }

      if (genre) {
        filteredBooks = filteredBooks.filter(book =>
          book.details.genres.some(g => g.toLowerCase() === genre.toLowerCase())
        );
      }

      if (year) {
        filteredBooks = filteredBooks.filter(book =>
          book.details.publishedYear === parseInt(year)
        );
      }

      // Apply sorting
      if (sort) {
        filteredBooks.sort((a, b) => {
          switch (sort) {
            case 'title':
              return a.details.title.localeCompare(b.details.title);
            case 'author':
              return a.details.author.localeCompare(b.details.author);
            case 'year':
              return a.details.publishedYear - b.details.publishedYear;
            default:
              return 0;
          }
        });
      }

      res.json(filteredBooks);
    } catch (error) {
      logger.error('Error getting books:', error);
      res.status(500).json({ error: 'Failed to retrieve books' });
    }
  },

  getBook: async (req, res) => {
    try {
      const data = await fileHandler.readFile(BOOKS_FILE);
      const book = data.books.find(b => b.id === req.params.id);
      
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.json(book);
    } catch (error) {
      logger.error('Error getting book:', error);
      res.status(500).json({ error: 'Failed to retrieve book' });
    }
  },

  createBook: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data = await fileHandler.readFile(BOOKS_FILE);
      
      const newBook = {
        id: generateUUID(),
        details: req.body.details
      };

      data.books.push(newBook);
      data.updatedAt = new Date().toISOString();

      await fileHandler.writeFile(BOOKS_FILE, data);
      res.status(201).json(newBook);
    } catch (error) {
      logger.error('Error creating book:', error);
      res.status(500).json({ error: 'Failed to create book' });
    }
  },

  updateBook: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data = await fileHandler.readFile(BOOKS_FILE);
      const bookIndex = data.books.findIndex(b => b.id === req.params.id);

      if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
      }

      data.books[bookIndex] = {
        ...data.books[bookIndex],
        details: {
          ...data.books[bookIndex].details,
          ...req.body.details
        }
      };

      data.updatedAt = new Date().toISOString();
      await fileHandler.writeFile(BOOKS_FILE, data);
      res.json(data.books[bookIndex]);
    } catch (error) {
      logger.error('Error updating book:', error);
      res.status(500).json({ error: 'Failed to update book' });
    }
  },

  deleteBook: async (req, res) => {
    try {
      const data = await fileHandler.readFile(BOOKS_FILE);
      const bookIndex = data.books.findIndex(b => b.id === req.params.id);

      if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
      }

      data.books.splice(bookIndex, 1);
      data.updatedAt = new Date().toISOString();

      await fileHandler.writeFile(BOOKS_FILE, data);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting book:', error);
      res.status(500).json({ error: 'Failed to delete book' });
    }
  },

  getBookSales: async (req, res) => {
    try {
      const salesData = await fileHandler.readFile(SALES_FILE);
      const bookId = req.params.id;

      const bookSales = salesData.sales.reduce((acc, sale) => {
        const bookSale = sale.books.find(b => b.bookId === bookId);
        if (bookSale) {
          acc.totalQuantity += bookSale.quantity;
          acc.sales.push({
            saleId: sale.id,
            bookstoreId: sale.bookstoreId,
            quantity: bookSale.quantity,
            saleDate: sale.saleDate
          });
        }
        return acc;
      }, { totalQuantity: 0, sales: [] });

      res.json(bookSales);
    } catch (error) {
      logger.error('Error getting book sales:', error);
      res.status(500).json({ error: 'Failed to retrieve book sales' });
    }
  }
};

module.exports = booksController;