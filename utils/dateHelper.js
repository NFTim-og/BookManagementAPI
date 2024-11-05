const dateHelper = {
  getCurrentTimestamp: () => {
    return new Date().toISOString();
  },

  isValidDate: (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  },

  formatDate: (dateString) => {
    return new Date(dateString).toISOString();
  }
};

module.exports = dateHelper;