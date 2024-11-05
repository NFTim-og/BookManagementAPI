const { validationResult } = require('express-validator');
const fileHandler = require('../utils/fileHandler');
const generateUUID = require('../utils/uuidGenerator');
const logger = require('../utils/logger');

const SALES_FILE = './data/sales.json';
const BOOKSTORES_FILE = './data/bookstores.json';

const salesController = {
  getSales: async (req, res) => {
    try {
      const data = await fileHandler.readFile(SALES_FILE);
      res.json(data.sales);
    } catch (error) {
      logger.error('Error getting sales:', error);
      res.status(500).json({ error: 'Failed to retrieve sales' });
    }
  },

  getSale: async (req, res) => {
    try {
      const data = await fileHandler.readFile(SALES_FILE);
      const sale = data.sales.find(s => s.id === req.params.id);
      
      if (!sale) {
        return res.status(404).json({ error: 'Sale not found' });
      }

      res.json(sale);
    } catch (error) {
      logger.error('Error getting sale:', error);
      res.status(500).json({ error: 'Failed to retrieve sale' });
    }
  },

  createSale: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { bookstoreId, books, discountPercentage = 0 } = req.body;

      // Validate bookstore and calculate total
      const bookstoresData = await fileHandler.readFile(BOOKSTORES_FILE);
      const bookstore = bookstoresData.bookstores.find(b => b.id === bookstoreId);

      if (!bookstore) {
        return res.status(404).json({ error: 'Bookstore not found' });
      }

      // Validate inventory and calculate total
      let totalPrice = 0;
      for (const book of books) {
        const inventoryItem = bookstore.inventory.find(i => i.bookId === book.bookId);
        if (!inventoryItem) {
          return res.status(400).json({ error: `Book ${book.bookId} not in inventory` });
        }
        if (inventoryItem.quantity < book.quantity) {
          return res.status(400).json({ error: `Insufficient quantity for book ${book.bookId}` });
        }
        totalPrice += inventoryItem.price * book.quantity;
      }

      // Apply discount
      if (discountPercentage > 0) {
        totalPrice = totalPrice * (1 - discountPercentage / 100);
      }

      // Create sale record
      const salesData = await fileHandler.readFile(SALES_FILE);
      const newSale = {
        id: generateUUID(),
        bookstoreId,
        saleDate: new Date().toISOString(),
        books,
        totalPrice,
        discountPercentage
      };

      salesData.sales.push(newSale);
      salesData.updatedAt = new Date().toISOString();

      // Update inventory
      for (const book of books) {
        const inventoryItem = bookstore.inventory.find(i => i.bookId === book.bookId);
        inventoryItem.quantity -= book.quantity;
      }

      // Save both files
      await Promise.all([
        fileHandler.writeFile(SALES_FILE, salesData),
        fileHandler.writeFile(BOOKSTORES_FILE, bookstoresData)
      ]);

      res.status(201).json(newSale);
    } catch (error) {
      logger.error('Error creating sale:', error);
      res.status(500).json({ error: 'Failed to create sale' });
    }
  }
};

module.exports = salesController;