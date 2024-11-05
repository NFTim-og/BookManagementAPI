const { validationResult } = require('express-validator');
const fileHandler = require('../utils/fileHandler');
const generateUUID = require('../utils/uuidGenerator');
const logger = require('../utils/logger');

const BOOKSTORES_FILE = './data/bookstores.json';
const SALES_FILE = './data/sales.json';

const bookstoresController = {
  getBookstores: async (req, res) => {
    try {
      const { minInventory, bookId, sort } = req.query;
      const data = await fileHandler.readFile(BOOKSTORES_FILE);
      
      let filteredBookstores = data.bookstores;

      // Apply filters
      if (minInventory) {
        filteredBookstores = filteredBookstores.filter(store =>
          store.inventory.some(item => item.quantity >= parseInt(minInventory))
        );
      }

      if (bookId) {
        filteredBookstores = filteredBookstores.filter(store =>
          store.inventory.some(item => item.bookId === bookId)
        );
      }

      // Apply sorting
      if (sort) {
        filteredBookstores.sort((a, b) => {
          switch (sort) {
            case 'name':
              return a.name.localeCompare(b.name);
            case 'location':
              return a.location.localeCompare(b.location);
            default:
              return 0;
          }
        });
      }

      res.json(filteredBookstores);
    } catch (error) {
      logger.error('Error getting bookstores:', error);
      res.status(500).json({ error: 'Failed to retrieve bookstores' });
    }
  },

  getBookstore: async (req, res) => {
    try {
      const data = await fileHandler.readFile(BOOKSTORES_FILE);
      const bookstore = data.bookstores.find(b => b.id === req.params.id);
      
      if (!bookstore) {
        return res.status(404).json({ error: 'Bookstore not found' });
      }

      res.json(bookstore);
    } catch (error) {
      logger.error('Error getting bookstore:', error);
      res.status(500).json({ error: 'Failed to retrieve bookstore' });
    }
  },

  createBookstore: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data = await fileHandler.readFile(BOOKSTORES_FILE);
      
      const newBookstore = {
        id: generateUUID(),
        name: req.body.name,
        location: req.body.location,
        contact: req.body.contact,
        inventory: req.body.inventory || []
      };

      data.bookstores.push(newBookstore);
      data.updatedAt = new Date().toISOString();

      await fileHandler.writeFile(BOOKSTORES_FILE, data);
      res.status(201).json(newBookstore);
    } catch (error) {
      logger.error('Error creating bookstore:', error);
      res.status(500).json({ error: 'Failed to create bookstore' });
    }
  },

  updateBookstore: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data = await fileHandler.readFile(BOOKSTORES_FILE);
      const bookstoreIndex = data.bookstores.findIndex(b => b.id === req.params.id);

      if (bookstoreIndex === -1) {
        return res.status(404).json({ error: 'Bookstore not found' });
      }

      data.bookstores[bookstoreIndex] = {
        ...data.bookstores[bookstoreIndex],
        ...req.body
      };

      data.updatedAt = new Date().toISOString();
      await fileHandler.writeFile(BOOKSTORES_FILE, data);
      res.json(data.bookstores[bookstoreIndex]);
    } catch (error) {
      logger.error('Error updating bookstore:', error);
      res.status(500).json({ error: 'Failed to update bookstore' });
    }
  },

  deleteBookstore: async (req, res) => {
    try {
      const data = await fileHandler.readFile(BOOKSTORES_FILE);
      const bookstoreIndex = data.bookstores.findIndex(b => b.id === req.params.id);

      if (bookstoreIndex === -1) {
        return res.status(404).json({ error: 'Bookstore not found' });
      }

      data.bookstores.splice(bookstoreIndex, 1);
      data.updatedAt = new Date().toISOString();

      await fileHandler.writeFile(BOOKSTORES_FILE, data);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting bookstore:', error);
      res.status(500).json({ error: 'Failed to delete bookstore' });
    }
  },

  getBookstoreRevenue: async (req, res) => {
    try {
      const salesData = await fileHandler.readFile(SALES_FILE);
      const bookstoreId = req.params.id;

      const revenue = salesData.sales
        .filter(sale => sale.bookstoreId === bookstoreId)
        .reduce((total, sale) => total + sale.totalPrice, 0);

      res.json({ revenue });
    } catch (error) {
      logger.error('Error getting bookstore revenue:', error);
      res.status(500).json({ error: 'Failed to calculate revenue' });
    }
  },

  updateInventory: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data = await fileHandler.readFile(BOOKSTORES_FILE);
      const bookstoreIndex = data.bookstores.findIndex(b => b.id === req.params.id);

      if (bookstoreIndex === -1) {
        return res.status(404).json({ error: 'Bookstore not found' });
      }

      const { bookId, quantity, price } = req.body;
      const inventoryIndex = data.bookstores[bookstoreIndex].inventory
        .findIndex(item => item.bookId === bookId);

      if (inventoryIndex === -1) {
        data.bookstores[bookstoreIndex].inventory.push({ bookId, quantity, price });
      } else {
        data.bookstores[bookstoreIndex].inventory[inventoryIndex] = { bookId, quantity, price };
      }

      data.updatedAt = new Date().toISOString();
      await fileHandler.writeFile(BOOKSTORES_FILE, data);
      res.json(data.bookstores[bookstoreIndex]);
    } catch (error) {
      logger.error('Error updating inventory:', error);
      res.status(500).json({ error: 'Failed to update inventory' });
    }
  }
};

module.exports = bookstoresController;