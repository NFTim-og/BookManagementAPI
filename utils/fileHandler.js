const fs = require('fs').promises;
const logger = require('./logger');

const fileHandler = {
  readFile: async (filePath) => {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Error reading file ${filePath}:`, error);
      throw error;
    }
  },

  writeFile: async (filePath, data) => {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, jsonData);
    } catch (error) {
      logger.error(`Error writing file ${filePath}:`, error);
      throw error;
    }
  },

  updateTimestamp: (data) => {
    return {
      ...data,
      updatedAt: new Date().toISOString()
    };
  }
};

module.exports = fileHandler;