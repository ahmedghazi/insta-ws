var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'insta-ws'
    },
    port: process.env.PORT || 3004,
    db: 'mongodb://localhost/insta-ws-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'insta-ws'
    },
    port: process.env.PORT || 3004,
    db: 'mongodb://localhost/insta-ws-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'insta-ws'
    },
    port: process.env.PORT || 3004,
    db: 'mongodb://localhost/insta-ws-production'
  }
};

module.exports = config[env];
