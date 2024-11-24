const path = require('path');

module.exports = {
  webpack: (config) => {
    // Fix for Webpack 5
    if (config.resolve) {
      // Remove fallback if present
      delete config.resolve.fallback;
    }

    return config;
  },
};
